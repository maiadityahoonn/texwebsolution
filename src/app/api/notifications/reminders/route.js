import { createClient } from "@supabase/supabase-js";
import { createPrivateKey, sign as cryptoSign } from "crypto";
import { NextResponse } from "next/server";
import { getBearerToken } from "@/lib/apiSecurity";
import { safeInternalPath } from "@/lib/safeUrl";

export const dynamic = "force-dynamic";

const REMINDER_WINDOW_MS = 10 * 60 * 1000;
const REMINDER_GRACE_MS = 2 * 60 * 1000;
const MAX_ITEMS_PER_SCAN = 100;

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function base64Url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlToBuffer(value) {
  const padded = `${value}`.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return Buffer.from(padded, "base64");
}

function createVapidJwt(audience) {
  const publicKey = process.env.WEB_PUSH_VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY || "";
  const privateKey = process.env.WEB_PUSH_VAPID_PRIVATE_KEY || "";
  if (!publicKey || !privateKey) return null;

  const publicBytes = base64UrlToBuffer(publicKey);
  const privateBytes = base64UrlToBuffer(privateKey);
  if (publicBytes.length !== 65 || publicBytes[0] !== 4 || privateBytes.length !== 32) return null;

  const jwk = {
    kty: "EC",
    crv: "P-256",
    x: base64Url(publicBytes.subarray(1, 33)),
    y: base64Url(publicBytes.subarray(33, 65)),
    d: base64Url(privateBytes),
  };
  const keyObject = createPrivateKey({ key: jwk, format: "jwk" });
  const header = base64Url(JSON.stringify({ typ: "JWT", alg: "ES256" }));
  const subject = process.env.WEB_PUSH_SUBJECT || process.env.NEXT_PUBLIC_SITE_URL || "mailto:info@texwebsolution.in";
  const payload = base64Url(JSON.stringify({
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
    sub: subject,
  }));
  const unsigned = `${header}.${payload}`;
  const signature = cryptoSign("sha256", Buffer.from(unsigned), {
    key: keyObject,
    dsaEncoding: "ieee-p1363",
  });
  return {
    authorization: `vapid t=${unsigned}.${base64Url(signature)}, k=${publicKey}`,
    publicKey,
  };
}

async function verifyCaller(admin, request) {
  const cronSecret = process.env.CRON_SECRET || process.env.NOTIFICATION_CRON_SECRET || "";
  const auth = request.headers.get("authorization") || "";
  const secretHeader = request.headers.get("x-cron-secret") || "";
  const querySecret = new URL(request.url).searchParams.get("secret") || "";
  if (cronSecret && (auth === `Bearer ${cronSecret}` || secretHeader === cronSecret || querySecret === cronSecret)) {
    return { ok: true, actor: null, cron: true };
  }

  const token = getBearerToken(request);
  if (!token) return { ok: false, status: 401, error: "Missing authorization token or cron secret." };
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) return { ok: false, status: 401, error: "Invalid authorization token." };
  const { data: profile } = await admin
    .from("profiles")
    .select("id, role, domain")
    .eq("id", data.user.id)
    .maybeSingle();
  const role = profile?.role || "";
  const allowed = ["super_admin", "hr", "sales_head"].includes(role) || profile?.domain === "sales";
  if (!allowed) return { ok: false, status: 403, error: "Only CRM/admin users can trigger reminder scans." };
  return { ok: true, actor: data.user.id, cron: false };
}

function recordTime(record, field) {
  const time = new Date(record?.[field] || "").getTime();
  return Number.isFinite(time) ? time : null;
}

function reminderTitle(sourceType, count = 1) {
  if (sourceType === "sales_meeting") return count === 1 ? "Client meeting in 10 minutes" : `${count} client meetings soon`;
  return count === 1 ? "Follow-up reminder in 10 minutes" : `${count} follow-ups due soon`;
}

function reminderMessage(sourceType, record) {
  const field = sourceType === "sales_meeting" ? "scheduled_at" : "due_at";
  const time = recordTime(record, field);
  const formatted = time ? new Date(time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" }) : "soon";
  if (sourceType === "sales_meeting") {
    return `${record.title || "Sales meeting"} starts at ${formatted}. Send WhatsApp or call the client now.`;
  }
  return `${record.title || "Sales follow-up"} is due at ${formatted}. Call or WhatsApp the client.`;
}

function reminderLink(sourceType) {
  return sourceType === "sales_meeting" ? "/workspace?section=sales_meetings" : "/workspace?section=sales_followups";
}

function getPrimaryTarget(record, sourceType) {
  if (sourceType === "sales_meeting") return record.host_id || record.created_by || null;
  return record.assigned_to || record.created_by || null;
}

async function getFallbackSalesUsers(admin) {
  const { data } = await admin
    .from("profiles")
    .select("id")
    .eq("status", "active")
    .or("role.in.(super_admin,sales_head),domain.eq.sales")
    .limit(20);
  return (data || []).map((item) => item.id).filter(Boolean);
}

async function sendNoPayloadPush(admin, userId, notification) {
  const { data: subscriptions } = await admin
    .from("push_subscriptions")
    .select("id, endpoint")
    .eq("user_id", userId)
    .eq("is_active", true)
    .limit(20);

  if (!subscriptions?.length) return [];

  const results = [];
  for (const subscription of subscriptions) {
    try {
      const audience = new URL(subscription.endpoint).origin;
      const vapid = createVapidJwt(audience);
      if (!vapid) {
        results.push({ endpoint: subscription.endpoint, status: "skipped", reason: "vapid_not_configured" });
        continue;
      }
      const response = await fetch(subscription.endpoint, {
        method: "POST",
        headers: {
          TTL: "600",
          Urgency: "high",
          Authorization: vapid.authorization,
          "Content-Length": "0",
        },
      });
      const status = response.ok ? "sent" : "failed";
      results.push({ endpoint: subscription.endpoint, status, code: response.status });
      const updatePayload = {
        is_active: response.status === 404 || response.status === 410 ? false : true,
        updated_at: new Date().toISOString(),
      };
      if (response.ok) updatePayload.last_used_at = new Date().toISOString();
      await admin.from("push_subscriptions").update(updatePayload).eq("id", subscription.id);
    } catch (error) {
      results.push({ endpoint: subscription.endpoint, status: "failed", reason: error?.message || "push_failed" });
    }
  }

  if (notification?.id) {
    await admin
      .from("notifications")
      .update({
        delivery_status: {
          ...(notification.delivery_status || {}),
          push_attempted_at: new Date().toISOString(),
          push_results: results,
        },
      })
      .eq("id", notification.id);
  }
  return results;
}

async function createReminder(admin, sourceType, record, userId, actorId) {
  const scheduledField = sourceType === "sales_meeting" ? "scheduled_at" : "due_at";
  const scheduledFor = record?.[scheduledField];
  if (!record?.id || !scheduledFor || !userId) return { skipped: "missing_required_data" };

  const { data: eventRow, error: eventError } = await admin
    .from("notification_reminder_events")
    .insert([{
      source_type: sourceType,
      source_id: record.id,
      reminder_type: "10min",
      scheduled_for: scheduledFor,
      user_id: userId,
    }])
    .select("id")
    .single();

  if (eventError) {
    if (String(eventError.code) === "23505" || /duplicate/i.test(eventError.message || "")) {
      return { skipped: "already_sent" };
    }
    return { error: eventError.message };
  }

  const linkUrl = reminderLink(sourceType);
  const { data: notification, error: notificationError } = await admin
    .from("notifications")
    .insert([{
      user_id: userId,
      created_by: actorId || userId,
      title: reminderTitle(sourceType),
      message: reminderMessage(sourceType, record),
      type: sourceType === "sales_meeting" ? "meeting" : "lead",
      link_url: safeInternalPath(linkUrl, "/workspace"),
      delivery_channels: ["in_app", "push"],
      metadata: {
        requires_ack: true,
        reminder: true,
        reminder_type: "10min",
        source_type: sourceType,
        source_id: record.id,
        scheduled_for: scheduledFor,
      },
    }])
    .select("id, title, message, type, link_url, delivery_status")
    .single();

  if (notificationError) {
    await admin.from("notification_reminder_events").delete().eq("id", eventRow.id);
    return { error: notificationError.message };
  }

  await admin
    .from("notification_reminder_events")
    .update({ notification_id: notification.id })
    .eq("id", eventRow.id);

  const pushResults = await sendNoPayloadPush(admin, userId, notification);
  return { notification_id: notification.id, push: pushResults };
}

async function scanReminders(admin, actorId = null) {
  const now = Date.now();
  const fromIso = new Date(now - REMINDER_GRACE_MS).toISOString();
  const toIso = new Date(now + REMINDER_WINDOW_MS).toISOString();
  const fallbackSalesUsers = await getFallbackSalesUsers(admin);

  const [{ data: followUps }, { data: meetings }] = await Promise.all([
    admin
      .from("sales_followups")
      .select("id, assigned_to, created_by, title, due_at, status")
      .eq("status", "pending")
      .gte("due_at", fromIso)
      .lte("due_at", toIso)
      .order("due_at", { ascending: true })
      .limit(MAX_ITEMS_PER_SCAN),
    admin
      .from("sales_meetings")
      .select("id, host_id, created_by, title, scheduled_at, status")
      .in("status", ["scheduled", "pending", "upcoming"])
      .gte("scheduled_at", fromIso)
      .lte("scheduled_at", toIso)
      .order("scheduled_at", { ascending: true })
      .limit(MAX_ITEMS_PER_SCAN),
  ]);

  const records = [
    ...(followUps || []).map((record) => ({ sourceType: "sales_followup", record })),
    ...(meetings || []).map((record) => ({ sourceType: "sales_meeting", record })),
  ];

  const results = [];
  for (const item of records) {
    const targetUsers = Array.from(new Set([getPrimaryTarget(item.record, item.sourceType), ...(!getPrimaryTarget(item.record, item.sourceType) ? fallbackSalesUsers : [])].filter(Boolean)));
    for (const userId of targetUsers) {
      results.push({
        source_type: item.sourceType,
        source_id: item.record.id,
        user_id: userId,
        ...(await createReminder(admin, item.sourceType, item.record, userId, actorId)),
      });
    }
  }

  return {
    checked: records.length,
    created: results.filter((item) => item.notification_id).length,
    skipped: results.filter((item) => item.skipped).length,
    failed: results.filter((item) => item.error).length,
    results,
  };
}

export async function GET(request) {
  const admin = getAdminClient();
  if (!admin) return NextResponse.json({ error: "Server admin key is not configured." }, { status: 500 });
  const verified = await verifyCaller(admin, request);
  if (!verified.ok) return NextResponse.json({ error: verified.error }, { status: verified.status });
  const result = await scanReminders(admin, verified.actor);
  return NextResponse.json({ ok: true, ...result });
}

export async function POST(request) {
  return GET(request);
}
