import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { safeExternalUrl, safeInternalPath } from "@/lib/safeUrl";
import { getBearerToken, getClientIp, isBodyTooLarge, isJsonRequest } from "@/lib/apiSecurity";

const ALLOWED_CHANNELS = new Set(["email", "whatsapp"]);
const ALLOWED_TYPES = new Set(["task", "meeting", "message", "certificate", "lead", "general"]);

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendEmail({ to, title, message, linkUrl }) {
  if (!to) return { channel: "email", status: "skipped", reason: "missing_recipient" };

  if (process.env.RESEND_API_KEY) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.NOTIFICATION_FROM_EMAIL || "TexWeb Solution <notifications@texwebsolution.in>",
        to,
        subject: title,
        html: `<p>${escapeHtml(message)}</p>${linkUrl ? `<p><a href="${escapeHtml(linkUrl)}">Open workspace</a></p>` : ""}`,
      }),
    });
    return { channel: "email", status: response.ok ? "sent" : "failed", provider: "resend" };
  }

  if (process.env.NOTIFICATION_EMAIL_WEBHOOK_URL) {
    const response = await fetch(process.env.NOTIFICATION_EMAIL_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, title, message, link_url: linkUrl }),
    });
    return { channel: "email", status: response.ok ? "sent" : "failed", provider: "webhook" };
  }

  return { channel: "email", status: "skipped", reason: "not_configured" };
}

async function sendWhatsapp({ phone, title, message, linkUrl }) {
  const cleanPhone = (phone || "").replace(/[^0-9]/g, "");
  if (!cleanPhone) return { channel: "whatsapp", status: "skipped", reason: "missing_recipient" };
  const text = `${title}\n\n${message}${linkUrl ? `\n\nOpen: ${linkUrl}` : ""}`;

  if (process.env.WHATSAPP_CLOUD_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
    const response = await fetch(`https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_CLOUD_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: cleanPhone,
        type: "text",
        text: { preview_url: Boolean(linkUrl), body: text },
      }),
    });
    return { channel: "whatsapp", status: response.ok ? "sent" : "failed", provider: "cloud_api" };
  }

  if (process.env.NOTIFICATION_WHATSAPP_WEBHOOK_URL) {
    const response = await fetch(process.env.NOTIFICATION_WHATSAPP_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: cleanPhone, title, message, link_url: linkUrl }),
    });
    return { channel: "whatsapp", status: response.ok ? "sent" : "failed", provider: "webhook" };
  }

  return { channel: "whatsapp", status: "skipped", reason: "not_configured" };
}

async function usersAreRelated(admin, requesterId, requesterRole, targetUserId) {
  if (!targetUserId) return false;
  if (requesterId === targetUserId) return true;
  if (["super_admin", "hr"].includes(requesterRole)) return true;

  const [{ data: targetProfile }, { data: assignment }] = await Promise.all([
    admin
      .from("profiles")
      .select("id, assigned_tl_id, assigned_mentor_id")
      .eq("id", targetUserId)
      .maybeSingle(),
    admin
      .from("member_assignments")
      .select("id")
      .or(`and(member_id.eq.${targetUserId},tl_id.eq.${requesterId}),and(member_id.eq.${targetUserId},mentor_id.eq.${requesterId}),and(member_id.eq.${requesterId},tl_id.eq.${targetUserId}),and(member_id.eq.${requesterId},mentor_id.eq.${targetUserId})`)
      .limit(1)
      .maybeSingle(),
  ]);

  return Boolean(
    assignment
    || targetProfile?.assigned_tl_id === requesterId
    || targetProfile?.assigned_mentor_id === requesterId
  );
}

export async function POST(request) {
  const ip = getClientIp(request);
  const limited = await checkApiRateLimit(`notifications:${ip}`, { limit: 40, windowMs: 60_000 });
  if (!limited.allowed) {
    return NextResponse.json(rateLimitResponse(limited), { status: 429 });
  }

  const admin = getAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Server admin key is not configured." }, { status: 500 });
  }

  const token = getBearerToken(request);
  if (!token) {
    return NextResponse.json({ error: "Missing authorization token." }, { status: 401 });
  }

  const {
    data: { user: requester },
    error: requesterError,
  } = await admin.auth.getUser(token);

  if (requesterError || !requester) {
    return NextResponse.json({ error: "Invalid authorization token." }, { status: 401 });
  }

  if (!isJsonRequest(request)) {
    return NextResponse.json({ error: "Content-Type must be application/json." }, { status: 415 });
  }
  if (isBodyTooLarge(request, 16_384)) {
    return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
  }

  const body = await request.json().catch(() => ({}));
  const requesterRole = await admin
    .from("profiles")
    .select("role")
    .eq("id", requester.id)
    .single();
  const role = requesterRole.data?.role || "";

  if (body.retry_queue_id) {
    if (!["super_admin", "hr"].includes(role)) {
      return NextResponse.json({ error: "Only Admin or HR can retry failed notification deliveries." }, { status: 403 });
    }

    const { data: queueItem } = await admin
      .from("notification_queue")
      .select("*")
      .eq("id", body.retry_queue_id)
      .single();

    if (!queueItem) {
      return NextResponse.json({ error: "Retry queue item not found." }, { status: 404 });
    }

    await admin.from("notification_queue").update({
      status: "processing",
      updated_at: new Date().toISOString(),
    }).eq("id", queueItem.id);

    const result = queueItem.channel === "email"
      ? await sendEmail(queueItem.payload || {})
      : await sendWhatsapp(queueItem.payload || {});
    const success = result.status === "sent";
    await admin.from("notification_queue").update({
      status: success ? "sent" : "failed",
      attempt_count: Number(queueItem.attempt_count || 0) + 1,
      last_error: success ? null : result.reason || result.provider || "provider_failed",
      next_attempt_at: success ? null : new Date(Date.now() + 5 * 60_000).toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("id", queueItem.id);

    await admin.from("audit_logs").insert([{
      actor_id: requester.id,
      actor_role: role,
      action: "notification.retry",
      entity_type: "notification_queue",
      entity_id: queueItem.id,
      summary: `Retried ${queueItem.channel} notification delivery`,
      metadata: { result },
    }]);

    return NextResponse.json({ queue_id: queueItem.id, result });
  }

  const requestedChannels = Array.isArray(body.channels) && body.channels.length ? body.channels : ["email", "whatsapp"];
  const channels = requestedChannels.filter((channel) => ALLOWED_CHANNELS.has(channel));
  if (!channels.length) {
    return NextResponse.json({ error: "At least one valid notification channel is required." }, { status: 400 });
  }
  const { data: notification } = body.notification_id
    ? await admin
        .from("notifications")
        .select("id, user_id, title, message, type, link_url, created_by")
        .eq("id", body.notification_id)
        .single()
    : { data: null };

  if (body.notification_id && !notification) {
    return NextResponse.json({ error: "Notification not found." }, { status: 404 });
  }

  const targetUserId = notification?.user_id || body.user_id;
  const ownsNotification = notification?.user_id === requester.id || notification?.created_by === requester.id;
  const isAdminish = ["super_admin", "hr"].includes(role);
  const relatedTarget = await usersAreRelated(admin, requester.id, role, targetUserId);
  const canDispatch = ownsNotification || relatedTarget;
  if (!canDispatch) {
    return NextResponse.json({ error: "You cannot dispatch this notification." }, { status: 403 });
  }

  let savedNotification = notification;
  if (!savedNotification?.id) {
    const title = String(body.title || "TexWeb Workspace Notification").trim().slice(0, 160);
    const message = String(body.message || "").trim().slice(0, 1000);
    const notificationType = ALLOWED_TYPES.has(body.type) ? body.type : "general";
    const rawBodyLink = body.link_url || null;
    const notificationLink = rawBodyLink?.startsWith("http")
      ? safeExternalUrl(rawBodyLink, "")
      : rawBodyLink
        ? safeInternalPath(rawBodyLink, "/login")
        : null;
    if (!targetUserId || !title || !message) {
      return NextResponse.json({ error: "Target user, title and message are required." }, { status: 400 });
    }
    const { data: createdNotification, error: createError } = await admin
      .from("notifications")
      .insert([{
        user_id: targetUserId,
        created_by: requester.id,
        title,
        message,
        type: notificationType,
        link_url: notificationLink,
        delivery_channels: ["in_app", ...channels],
      }])
      .select("id, user_id, title, message, type, link_url, created_by")
      .single();

    if (createError) {
      return NextResponse.json({ error: "Unable to create notification." }, { status: 400 });
    }
    savedNotification = createdNotification;
  }

  const { data: recipient } = await admin
    .from("profiles")
    .select("email, phone, full_name")
    .eq("id", targetUserId)
    .single();

  const appUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://texwebsolution.in";
  const rawLink = savedNotification?.link_url || body.link_url;
  const linkUrl = rawLink?.startsWith("http")
    ? safeExternalUrl(rawLink, "")
    : rawLink
      ? `${appUrl}${safeInternalPath(rawLink, "/login")}`
      : "";
  const payload = {
    to: recipient?.email,
    phone: recipient?.phone,
    title: savedNotification?.title || body.title || "TexWeb Workspace Notification",
    message: savedNotification?.message || body.message || "",
    linkUrl,
  };

  const results = [];
  if (channels.includes("email")) results.push(await sendEmail(payload));
  if (channels.includes("whatsapp")) results.push(await sendWhatsapp(payload));

  const failedResults = results.filter((result) => result.status !== "sent" && result.status !== "skipped");
  if (failedResults.length) {
    await admin.from("notification_queue").insert(failedResults.map((result) => ({
      notification_id: savedNotification?.id || null,
      user_id: targetUserId,
      channel: result.channel,
      payload,
      status: "failed",
      attempt_count: 1,
      last_error: result.reason || result.provider || "provider_failed",
      next_attempt_at: new Date(Date.now() + 5 * 60_000).toISOString(),
    })));
  }

  if (savedNotification?.id) {
    await admin
      .from("notifications")
      .update({
        delivery_channels: ["in_app", ...channels],
        delivery_status: { dispatched_at: new Date().toISOString(), results },
      })
      .eq("id", savedNotification.id);
  }

  await admin.from("audit_logs").insert([{
    actor_id: requester.id,
    actor_role: role,
    action: "notification.dispatch",
    entity_type: "notification",
    entity_id: savedNotification?.id || null,
    summary: `Notification dispatched through ${channels.join(", ")}`,
    metadata: { target_user_id: targetUserId, results },
  }]);

  return NextResponse.json({ notification: savedNotification, recipient: recipient?.full_name || body.user_id, results });
}
