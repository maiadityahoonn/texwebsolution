import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { cleanText, getBearerToken, getClientIp, isBodyTooLarge, isJsonRequest } from "@/lib/apiSecurity";
import { safeExternalUrl } from "@/lib/safeUrl";

const WRITE_TYPES = new Set([
  "message",
  "edit_message",
  "pin_message",
  "delete_message",
  "read_messages",
  "mark_delivered",
  "vote_poll",
  "update_batch_info",
  "announcement",
  "update_announcement",
  "delete_announcement",
  "resource",
  "update_resource",
  "delete_resource",
  "escalation",
  "transfer_member",
  "assignment_history",
]);
const ESCALATION_STATUSES = new Set(["open", "in_review", "action_required", "resolved", "closed"]);
const ESCALATION_SELECT = "*, creator:profiles!batch_escalations_created_by_fkey(id, full_name, role), assignee:profiles!batch_escalations_assigned_to_fkey(id, full_name, role), member:profiles!batch_escalations_related_member_id_fkey(id, full_name, role), task:tasks(id, title, status)";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function getRequester(admin, request) {
  const token = getBearerToken(request);
  if (!token) return { error: NextResponse.json({ error: "Missing authorization token." }, { status: 401 }) };
  const { data: { user }, error } = await admin.auth.getUser(token);
  if (error || !user) return { error: NextResponse.json({ error: "Invalid authorization token." }, { status: 401 }) };
  const { data: profile } = await admin
    .from("profiles")
    .select("id, full_name, role, domain, batch_id, assigned_mentor_id, assigned_tl_id")
    .eq("id", user.id)
    .single();
  if (!profile) return { error: NextResponse.json({ error: "Profile not found." }, { status: 404 }) };
  return { user, profile };
}

async function getBatch(admin, batchId) {
  const { data } = await admin
    .from("batches")
    .select("*")
    .eq("id", batchId)
    .maybeSingle();
  return data || null;
}

async function isParticipant(admin, profile, batch) {
  if (!profile || !batch) return false;
  if (["super_admin", "admin", "hr", "hr_head"].includes(profile.role)) return true;
  if ([batch.hr_id, batch.mentor_id, batch.tl_id, batch.trainer_id].includes(profile.id)) return true;
  if (profile.batch_id === batch.id) return true;
  const { data } = await admin
    .from("member_assignments")
    .select("id")
    .eq("member_id", profile.id)
    .eq("batch_id", batch.id)
    .eq("status", "active")
    .maybeSingle();
  return Boolean(data);
}

function canManage(profile, batch) {
  if (!profile || !batch) return false;
  if (["super_admin", "admin", "hr", "hr_head"].includes(profile.role)) return true;
  return [batch.hr_id, batch.mentor_id, batch.tl_id, batch.trainer_id].includes(profile.id);
}

async function canPublishBatchContent(admin, profile, batch) {
  if (!profile || !batch) return false;
  if (["super_admin", "admin", "hr", "hr_head"].includes(profile.role)) return true;
  if (profile.role === "mentor") {
    if (batch.mentor_id === profile.id) return true;
    const { data } = await admin
      .from("member_assignments")
      .select("id")
      .eq("mentor_id", profile.id)
      .eq("batch_id", batch.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();
    return Boolean(data);
  }
  return false;
}

async function writeActivity(admin, requester, action, entityType, entityId, summary, metadata = {}) {
  try {
    await admin.from("audit_logs").insert([{
      actor_id: requester.user?.id || requester.profile?.id,
      actor_role: requester.profile?.role || "user",
      action,
      entity_type: entityType,
      entity_id: entityId,
      summary,
      metadata,
    }]);
  } catch (e) {
    console.warn("writeActivity audit_log error (non-fatal):", e);
  }
}

export async function GET(request) {
  const limited = await checkApiRateLimit(`batch-workspace-get:${getClientIp(request)}`, { limit: 80, windowMs: 60_000 });
  if (!limited.allowed) return NextResponse.json(rateLimitResponse(limited), { status: 429 });

  const admin = getAdminClient();
  if (!admin) return NextResponse.json({ error: "Server admin key is not configured." }, { status: 500 });
  const requester = await getRequester(admin, request);
  if (requester.error) return requester.error;

  const searchParams = new URL(request.url).searchParams;
  const scope = searchParams.get("scope");
  if (scope === "escalations") {
    const { data, error } = await admin
      .from("batch_escalations")
      .select(ESCALATION_SELECT)
      .or(`created_by.eq.${requester.user.id},assigned_to.eq.${requester.user.id}`)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) return NextResponse.json({ error: error.message || "Unable to load escalations." }, { status: 400 });
    return NextResponse.json({ escalations: data || [] });
  }

  const batchId = searchParams.get("batch_id");
  if (!batchId) return NextResponse.json({ error: "Batch id is required." }, { status: 400 });

  const batch = await getBatch(admin, batchId);
  if (!batch) return NextResponse.json({ error: "Batch not found." }, { status: 404 });
  if (!(await isParticipant(admin, requester.profile, batch))) {
    return NextResponse.json({ error: "You cannot access this batch workspace." }, { status: 403 });
  }

  if (scope === "chat") {
    let messages = await admin
      .from("batch_messages")
      .select("*, sender:profiles!batch_messages_sender_id_fkey(id, full_name, role, email)")
      .eq("batch_id", batch.id)
      .order("created_at", { ascending: true })
      .limit(200);

    let messageRows = messages.data || [];
    if (messages.error) {
      const fallbackMessages = await admin
        .from("batch_messages")
        .select("*")
        .eq("batch_id", batch.id)
        .order("created_at", { ascending: true })
        .limit(200);
      messageRows = fallbackMessages.data || [];
    }

    const rawMessages = messageRows;
    const msgIds = rawMessages.map((m) => m.id);
    const receiptsByMsgId = {};

    if (msgIds.length > 0) {
      try {
        const { data: receiptsData, error: rErr } = await admin
          .from("batch_message_receipts")
          .select("message_id, user_id, delivered_at, read_at")
          .in("message_id", msgIds);
        if (!rErr && receiptsData) {
          receiptsData.forEach((r) => {
            if (!receiptsByMsgId[r.message_id]) receiptsByMsgId[r.message_id] = {};
            receiptsByMsgId[r.message_id][r.user_id] = {
              delivered_at: r.delivered_at,
              read_at: r.read_at,
            };
          });
        }
      } catch (err) {
        console.warn("batch_message_receipts query error (gracefully handled):", err?.message);
      }
    }

    const enrichedMessages = rawMessages.map((m) => ({
      ...m,
      receipts: receiptsByMsgId[m.id] || {},
    }));

    return NextResponse.json({
      messages: enrichedMessages,
      announcements: [],
      resources: [],
      escalations: [],
      history: [],
    });
  }

  const [messages, announcements, resources, escalations, history] = await Promise.all([
    admin.from("batch_messages").select("*, sender:profiles!batch_messages_sender_id_fkey(id, full_name, role, email)").eq("batch_id", batch.id).order("created_at", { ascending: true }).limit(200),
    admin.from("batch_announcements").select("*, creator:profiles!batch_announcements_created_by_fkey(id, full_name, role)").eq("batch_id", batch.id).order("pinned", { ascending: false }).order("created_at", { ascending: false }).limit(100),
    admin.from("batch_resources").select("*, creator:profiles!batch_resources_created_by_fkey(id, full_name, role)").eq("batch_id", batch.id).order("created_at", { ascending: false }).limit(100),
    admin.from("batch_escalations").select(ESCALATION_SELECT).eq("batch_id", batch.id).order("created_at", { ascending: false }).limit(100),
    admin.from("batch_assignment_history").select("*, old_user:profiles!batch_assignment_history_old_user_id_fkey(id, full_name, role), new_user:profiles!batch_assignment_history_new_user_id_fkey(id, full_name, role), member:profiles!batch_assignment_history_member_id_fkey(id, full_name, role), changer:profiles!batch_assignment_history_changed_by_fkey(id, full_name, role)").eq("batch_id", batch.id).order("created_at", { ascending: false }).limit(100),
  ]);

  let messageRows = messages.data || [];
  if (messages.error) {
    const fallbackMessages = await admin
      .from("batch_messages")
      .select("*")
      .eq("batch_id", batch.id)
      .order("created_at", { ascending: true })
      .limit(200);
    if (fallbackMessages.error) {
      return NextResponse.json({ error: fallbackMessages.error.message || messages.error.message || "Unable to load batch messages." }, { status: 400 });
    }
    messageRows = fallbackMessages.data || [];
  }

  const loadError = announcements.error || resources.error || escalations.error || history.error;
  if (loadError) {
    return NextResponse.json({ error: loadError.message || "Unable to load batch workspace data." }, { status: 400 });
  }
  const visibleEscalations = (escalations.data || []).filter(
    (item) => item.created_by === requester.user.id || item.assigned_to === requester.user.id
  );

  // Fetch individual per-user delivery & read receipts for messages
  const rawMessages = messageRows;
  const msgIds = rawMessages.map((m) => m.id);
  const receiptsByMsgId = {};

  if (msgIds.length > 0) {
    try {
      const { data: receiptsData, error: rErr } = await admin
        .from("batch_message_receipts")
        .select("message_id, user_id, delivered_at, read_at")
        .in("message_id", msgIds);
      if (!rErr && receiptsData) {
        receiptsData.forEach((r) => {
          if (!receiptsByMsgId[r.message_id]) receiptsByMsgId[r.message_id] = {};
          receiptsByMsgId[r.message_id][r.user_id] = {
            delivered_at: r.delivered_at,
            read_at: r.read_at,
          };
        });
      }
    } catch (err) {
      console.warn("batch_message_receipts query error (gracefully handled):", err?.message);
    }
  }

  const enrichedMessages = rawMessages.map((m) => ({
    ...m,
    receipts: receiptsByMsgId[m.id] || {},
  }));

  return NextResponse.json({
    messages: enrichedMessages,
    announcements: announcements.data || [],
    resources: resources.data || [],
    escalations: visibleEscalations,
    history: history.data || [],
  });
}

export async function POST(request) {
  const limited = await checkApiRateLimit(`batch-workspace-post:${getClientIp(request)}`, { limit: 60, windowMs: 60_000 });
  if (!limited.allowed) return NextResponse.json(rateLimitResponse(limited), { status: 429 });

  const admin = getAdminClient();
  if (!admin) return NextResponse.json({ error: "Server admin key is not configured." }, { status: 500 });
  const requester = await getRequester(admin, request);
  if (requester.error) return requester.error;
  if (!isJsonRequest(request)) return NextResponse.json({ error: "Content-Type must be application/json." }, { status: 415 });
  if (isBodyTooLarge(request, 10_485_760)) return NextResponse.json({ error: "Request body is too large." }, { status: 413 });

  const body = await request.json().catch(() => ({}));
  const type = cleanText(body.type, 40);
  if (!WRITE_TYPES.has(type)) return NextResponse.json({ error: "Invalid batch workspace action." }, { status: 400 });

  const batch = await getBatch(admin, body.batch_id);
  if (!batch) return NextResponse.json({ error: "Batch not found." }, { status: 404 });
  const participant = await isParticipant(admin, requester.profile, batch);
  if (!participant) return NextResponse.json({ error: "You cannot access this batch workspace." }, { status: 403 });

  if (type === "message") {
    const rawMessage = cleanText(body.message, 4000);
    const hasAttachment = Boolean(body.attachment_url || body.attachment_name || body.attachment_type || (body.reference_id && body.reference_type !== "none"));
    if (!rawMessage && !hasAttachment) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }
    const message = rawMessage || "";
    const { data, error } = await admin
      .from("batch_messages")
      .insert([{
        batch_id: batch.id,
        sender_id: requester.user.id,
        message,
        reply_to_id: body.reply_to_id || null,
        attachment_url: body.attachment_url ? safeExternalUrl(body.attachment_url, "") || null : null,
        attachment_name: cleanText(body.attachment_name, 200) || null,
        attachment_type: cleanText(body.attachment_type, 80) || null,
        reference_type: body.reference_type || "none",
        reference_id: body.reference_id || null,
        is_pinned: Boolean(body.is_pinned) && canManage(requester.profile, batch),
      }])
      .select("*, sender:profiles!batch_messages_sender_id_fkey(id, full_name, role, email)")
      .single();
    if (error) return NextResponse.json({ error: error.message || "Unable to send message." }, { status: 400 });
    await writeActivity(admin, requester, "batch.message", "batch_message", data.id, `${requester.profile.full_name || "Member"} sent a batch message`, { batch_id: batch.id });
    return NextResponse.json({ message: data });
  }

  if (type === "vote_poll") {
    const messageId = body.message_id;
    const pollData = body.poll_data;
    if (!messageId || !pollData) {
      return NextResponse.json({ error: "Message ID and poll data are required." }, { status: 400 });
    }
    const { data, error } = await admin
      .from("batch_messages")
      .update({ message: JSON.stringify(pollData) })
      .eq("id", messageId)
      .eq("batch_id", batch.id)
      .select("*, sender:profiles!batch_messages_sender_id_fkey(id, full_name, role, email)")
      .single();
    if (error) return NextResponse.json({ error: error.message || "Failed to submit poll vote." }, { status: 400 });
    return NextResponse.json({ message: data });
  }

  if (type === "pin_message") {
    if (!canManage(requester.profile, batch)) {
      return NextResponse.json({ error: "Only HR, Mentor, TL or Admin can pin/unpin messages." }, { status: 403 });
    }
    const messageId = body.message_id;
    const isPinned = Boolean(body.is_pinned);
    const { data, error } = await admin
      .from("batch_messages")
      .update({ is_pinned: isPinned })
      .eq("id", messageId)
      .eq("batch_id", batch.id)
      .select("*, sender:profiles!batch_messages_sender_id_fkey(id, full_name, role, email)")
      .single();
    if (error) return NextResponse.json({ error: error.message || "Failed to update pin status." }, { status: 400 });
    await writeActivity(admin, requester, "batch.pin_message", "batch_message", data.id, `${requester.profile.full_name || "Manager"} ${isPinned ? "pinned" : "unpinned"} a message`, { batch_id: batch.id });
    return NextResponse.json({ message: data });
  }

  if (type === "edit_message") {
    const messageId = body.message_id;
    const message = cleanText(body.message, 4000);
    if (!messageId || !message) {
      return NextResponse.json({ error: "Message id and updated text are required." }, { status: 400 });
    }

    const { data: existing, error: existingError } = await admin
      .from("batch_messages")
      .select("id, sender_id, message, attachment_url, created_at, is_deleted")
      .eq("id", messageId)
      .eq("batch_id", batch.id)
      .maybeSingle();
    if (existingError || !existing) return NextResponse.json({ error: "Message not found." }, { status: 404 });
    if (existing.sender_id !== requester.user.id) {
      return NextResponse.json({ error: "You can edit only your own message." }, { status: 403 });
    }
    if (existing.attachment_url || existing.is_deleted) {
      return NextResponse.json({ error: "Only active text messages can be edited." }, { status: 400 });
    }
    const ageMs = Date.now() - new Date(existing.created_at).getTime();
    if (ageMs > 60 * 1000) {
      return NextResponse.json({ error: "Edit time window has expired." }, { status: 403 });
    }

    const { data, error } = await admin
      .from("batch_messages")
      .update({ message, edited_at: new Date().toISOString(), original_message: existing.message })
      .eq("id", messageId)
      .eq("batch_id", batch.id)
      .select("*, sender:profiles!batch_messages_sender_id_fkey(id, full_name, role, email)")
      .single();
    if (error) return NextResponse.json({ error: error.message || "Failed to edit message." }, { status: 400 });
    await writeActivity(admin, requester, "batch.edit_message", "batch_message", data.id, `${requester.profile.full_name || "Member"} edited a message`, { batch_id: batch.id });
    return NextResponse.json({ message: data });
  }

  if (type === "mark_delivered") {
    const now = new Date().toISOString();
    const rawIds = Array.isArray(body.message_ids) ? body.message_ids : (body.message_id ? [body.message_id] : []);
    const messageIds = rawIds.filter(Boolean);

    if (messageIds.length > 0) {
      await admin
        .from("batch_messages")
        .update({ delivered_at: now })
        .in("id", messageIds)
        .neq("sender_id", requester.user.id)
        .is("delivered_at", null);

      try {
        const rows = messageIds.map((mId) => ({
          message_id: mId,
          batch_id: batch.id,
          user_id: requester.user.id,
          delivered_at: now,
        }));
        await admin
          .from("batch_message_receipts")
          .upsert(rows, { onConflict: "message_id,user_id", ignoreDuplicates: true });
      } catch (err) {
        console.warn("batch_message_receipts mark_delivered upsert error:", err?.message);
      }
    }
    return NextResponse.json({ success: true, delivered_at: now });
  }

  if (type === "read_messages") {
    const now = new Date().toISOString();
    await admin
      .from("batch_messages")
      .update({ read_at: now, delivered_at: now })
      .eq("batch_id", batch.id)
      .neq("sender_id", requester.user.id)
      .is("read_at", null);

    try {
      const { data: unreadBatchMsgs } = await admin
        .from("batch_messages")
        .select("id")
        .eq("batch_id", batch.id)
        .neq("sender_id", requester.user.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (unreadBatchMsgs?.length) {
        const receiptRows = unreadBatchMsgs.map((m) => ({
          message_id: m.id,
          batch_id: batch.id,
          user_id: requester.user.id,
          delivered_at: now,
          read_at: now,
        }));
        await admin
          .from("batch_message_receipts")
          .upsert(receiptRows, { onConflict: "message_id,user_id" });
      }
    } catch (err) {
      console.warn("batch_message_receipts read_messages upsert error:", err?.message);
    }

    return NextResponse.json({ success: true, read_at: now });
  }

  if (type === "delete_message") {
    const rawIds = Array.isArray(body.message_ids) ? body.message_ids : [body.message_id];
    const messageIds = rawIds.filter(Boolean);
    if (!messageIds.length) {
      return NextResponse.json({ error: "Missing message IDs to delete." }, { status: 400 });
    }

    // 1. Fetch original message details so real typed text is permanently preserved for audit/admin records
    let selectQuery = admin
      .from("batch_messages")
      .select("id, sender_id, message, attachment_url, attachment_name, attachment_type, reference_type, reference_id, is_pinned, created_at")
      .in("id", messageIds)
      .eq("batch_id", batch.id);

    if (!canManage(requester.profile, batch)) {
      selectQuery = selectQuery.eq("sender_id", requester.user.id);
    }

    const { data: originalMessages } = await selectQuery;

    // 2. Perform soft delete update for chat UI
    let query = admin
      .from("batch_messages")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: requester.user.id,
        is_pinned: false,
      })
      .in("id", messageIds)
      .eq("batch_id", batch.id);

    if (!canManage(requester.profile, batch)) {
      query = query.eq("sender_id", requester.user.id);
    }
    const { error } = await query;
    if (error) return NextResponse.json({ error: error.message || "Failed to delete messages." }, { status: 400 });

    // 3. Write each deleted message's real original typed content into audit_logs
    if (originalMessages && originalMessages.length) {
      for (const orig of originalMessages) {
        await writeActivity(
          admin,
          requester,
          "batch.delete_message",
          "batch_message",
          orig.id,
          `${requester.profile.full_name || "Member"} deleted message: "${orig.message}"`,
          {
            batch_id: batch.id,
            original_sender_id: orig.sender_id,
            original_message: orig.message,
            attachment_url: orig.attachment_url,
            attachment_name: orig.attachment_name,
            attachment_type: orig.attachment_type,
            reference_type: orig.reference_type,
            reference_id: orig.reference_id,
            sent_at: orig.created_at,
            deleted_at: new Date().toISOString(),
          }
        );
      }
    }

    return NextResponse.json({ success: true, deleted_ids: messageIds });
  }

  if (type === "update_batch_info") {
    const isAdminOrHr = ["super_admin", "admin", "hr", "hr_head"].includes(requester.profile.role) || batch.hr_id === requester.profile.id;
    if (!isAdminOrHr) {
      return NextResponse.json({ error: "Only Admin or HR can update group name and profile photo." }, { status: 403 });
    }
    const name = body.name ? cleanText(body.name, 120) : null;
    const avatarUrl = typeof body.avatar_url === "string" ? body.avatar_url.trim() : (body.avatar_url === null ? null : undefined);

    const updates = { updated_at: new Date().toISOString() };
    if (name) updates.name = name;
    if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;

    let updateRes = await admin
      .from("batches")
      .update(updates)
      .eq("id", batch.id)
      .select()
      .single();

    // Graceful fallback if avatar_url column is not yet in PostgreSQL
    if (updateRes.error && updates.avatar_url !== undefined) {
      const fallbackUpdates = { ...updates };
      delete fallbackUpdates.avatar_url;
      updateRes = await admin
        .from("batches")
        .update(fallbackUpdates)
        .eq("id", batch.id)
        .select()
        .single();
    }

    if (updateRes.error) {
      return NextResponse.json({ error: updateRes.error.message || "Failed to update batch info." }, { status: 400 });
    }

    await writeActivity(admin, requester, "batch.update_info", "batch", batch.id, `${requester.profile.full_name || "Admin/HR"} updated group chat profile`, { batch_id: batch.id });
    
    const finalBatch = {
      ...(updateRes.data || {}),
      avatar_url: avatarUrl !== undefined ? avatarUrl : (updateRes.data?.avatar_url || null),
    };
    return NextResponse.json({ ok: true, batch: finalBatch });
  }

  if (["announcement", "resource"].includes(type)) {
    const isPublisher = await canPublishBatchContent(admin, requester.profile, batch);
    if (!isPublisher) {
      return NextResponse.json({ error: "Only Admin, HR, or Mentor can publish announcements or files for this batch." }, { status: 403 });
    }
  }

  if (type === "announcement") {
    const payload = {
      batch_id: batch.id,
      title: cleanText(body.title, 180),
      body: cleanText(body.body, 4000),
      category: body.category || "announcement",
      link_url: body.link_url ? safeExternalUrl(body.link_url, "") || null : null,
      attachment_url: body.attachment_url ? safeExternalUrl(body.attachment_url, "") || null : null,
      attachment_name: cleanText(body.attachment_name, 255) || null,
      attachment_type: cleanText(body.attachment_type, 60) || null,
      pinned: Boolean(body.pinned),
      created_by: requester.user.id,
    };
    if (!payload.title || !payload.body) return NextResponse.json({ error: "Title and body are required." }, { status: 400 });
    const { data, error } = await admin
      .from("batch_announcements")
      .insert([payload])
      .select("*, creator:profiles!batch_announcements_created_by_fkey(id, full_name, role)")
      .single();
    if (error) return NextResponse.json({ error: error.message || "Unable to publish announcement." }, { status: 400 });
    await writeActivity(admin, requester, "batch.announcement", "batch_announcement", data.id, `Posted announcement ${payload.title}`, { batch_id: batch.id });

    // Automatically dispatch notifications to all participants in this batch
    try {
      const [membersRes, profilesRes] = await Promise.all([
        admin.from("member_assignments").select("member_id").eq("batch_id", batch.id).eq("status", "active"),
        admin.from("profiles").select("id").eq("batch_id", batch.id),
      ]);
      const participantIds = new Set([
        batch.hr_id,
        batch.mentor_id,
        batch.tl_id,
        ...(membersRes.data || []).map((m) => m.member_id),
        ...(profilesRes.data || []).map((p) => p.id),
      ]);
      participantIds.delete(requester.user.id);
      const recipientIds = Array.from(participantIds).filter(Boolean);

      if (recipientIds.length > 0) {
        const notificationsToInsert = recipientIds.map((userId) => ({
          user_id: userId,
          created_by: requester.user.id,
          title: `📢 Announcement: ${payload.title}`,
          message: payload.body.length > 220 ? `${payload.body.slice(0, 217)}...` : payload.body,
          type: "announcement",
          link_url: `/login?section=batch_workspace&batch_id=${batch.id}&tab=announcements`,
          delivery_channels: ["in_app"],
          metadata: {
            creator_name: requester.profile.full_name || "Workspace Manager",
            creator_role: requester.profile.role || "mentor",
            batch_id: batch.id,
            batch_name: batch.name || "Batch",
            attachment_url: payload.attachment_url || null,
            attachment_name: payload.attachment_name || null,
            attachment_type: payload.attachment_type || null,
          },
        }));
        await admin.from("notifications").insert(notificationsToInsert);
      }
    } catch (notifErr) {
      console.warn("Failed to dispatch batch announcement notifications:", notifErr?.message);
    }

    return NextResponse.json({ announcement: data });
  }

  if (type === "resource") {
    const payload = {
      batch_id: batch.id,
      title: cleanText(body.title, 180),
      category: body.category || "technical_guides",
      description: cleanText(body.description, 2000) || null,
      link_url: body.link_url ? safeExternalUrl(body.link_url, "") || null : null,
      file_url: body.file_url ? safeExternalUrl(body.file_url, "") || null : null,
      file_name: cleanText(body.file_name, 180) || null,
      created_by: requester.user.id,
    };
    if (!payload.title || (!payload.link_url && !payload.file_url && !payload.description)) {
      return NextResponse.json({ error: "Resource needs a title and link, file, or description." }, { status: 400 });
    }
    const { data, error } = await admin
      .from("batch_resources")
      .insert([payload])
      .select("*, creator:profiles!batch_resources_created_by_fkey(id, full_name, role)")
      .single();
    if (error) return NextResponse.json({ error: error.message || "Unable to add resource." }, { status: 400 });
    await writeActivity(admin, requester, "batch.resource", "batch_resource", data.id, `Added resource ${payload.title}`, { batch_id: batch.id });
    return NextResponse.json({ resource: data });
  }

  if (type === "update_announcement") {
    const announcementId = cleanText(body.id, 64);
    if (!announcementId) return NextResponse.json({ error: "Announcement ID is required." }, { status: 400 });

    const { data: existing, error: existErr } = await admin
      .from("batch_announcements")
      .select("id, created_by, batch_id, title")
      .eq("id", announcementId)
      .maybeSingle();

    if (existErr || !existing) return NextResponse.json({ error: "Announcement not found." }, { status: 404 });

    const canManage = ["super_admin", "hr", "admin"].includes(requester.profile.role) || existing.created_by === requester.user.id;
    if (!canManage) return NextResponse.json({ error: "You are not authorized to edit this announcement." }, { status: 403 });

    const updatePayload = {
      title: cleanText(body.title, 180),
      body: cleanText(body.body, 4000),
      category: body.category || "announcement",
      link_url: body.link_url ? safeExternalUrl(body.link_url, "") || null : null,
      pinned: Boolean(body.pinned),
      updated_at: new Date().toISOString(),
    };

    if (body.attachment_url !== undefined) {
      updatePayload.attachment_url = body.attachment_url ? safeExternalUrl(body.attachment_url, "") || null : null;
      updatePayload.attachment_name = cleanText(body.attachment_name, 255) || null;
      updatePayload.attachment_type = cleanText(body.attachment_type, 60) || null;
    }

    if (!updatePayload.title || !updatePayload.body) {
      return NextResponse.json({ error: "Title and body are required." }, { status: 400 });
    }

    const { data, error } = await admin
      .from("batch_announcements")
      .update(updatePayload)
      .eq("id", announcementId)
      .select("*, creator:profiles!batch_announcements_created_by_fkey(id, full_name, role)")
      .single();

    if (error) return NextResponse.json({ error: error.message || "Failed to update announcement." }, { status: 400 });

    await writeActivity(admin, requester, "batch.update_announcement", "batch_announcement", announcementId, `Updated announcement: ${updatePayload.title}`, { batch_id: batch.id });

    return NextResponse.json({ success: true, announcement: data });
  }

  if (type === "delete_announcement") {
    const announcementId = cleanText(body.id, 64);
    if (!announcementId) return NextResponse.json({ error: "Announcement ID is required." }, { status: 400 });

    const { data: existing, error: existErr } = await admin
      .from("batch_announcements")
      .select("id, created_by, batch_id, title")
      .eq("id", announcementId)
      .maybeSingle();

    if (existErr || !existing) return NextResponse.json({ error: "Announcement not found." }, { status: 404 });

    const canManage = ["super_admin", "hr", "admin"].includes(requester.profile.role) || existing.created_by === requester.user.id;
    if (!canManage) return NextResponse.json({ error: "You are not authorized to delete this announcement." }, { status: 403 });

    const { error } = await admin
      .from("batch_announcements")
      .delete()
      .eq("id", announcementId);

    if (error) return NextResponse.json({ error: error.message || "Failed to delete announcement." }, { status: 400 });

    await writeActivity(admin, requester, "batch.delete_announcement", "batch_announcement", announcementId, `Deleted announcement: ${existing.title}`, { batch_id: batch.id });

    return NextResponse.json({ success: true, deleted_id: announcementId });
  }

  if (type === "update_resource") {
    const resourceId = cleanText(body.id, 64);
    if (!resourceId) return NextResponse.json({ error: "Resource ID is required." }, { status: 400 });

    const { data: existing, error: existErr } = await admin
      .from("batch_resources")
      .select("id, created_by, batch_id, title")
      .eq("id", resourceId)
      .maybeSingle();

    if (existErr || !existing) return NextResponse.json({ error: "Resource not found." }, { status: 404 });

    const canManage = ["super_admin", "hr", "admin"].includes(requester.profile.role) || existing.created_by === requester.user.id;
    if (!canManage) return NextResponse.json({ error: "You are not authorized to edit this file." }, { status: 403 });

    const updatePayload = {
      title: cleanText(body.title, 180),
      category: body.category || "technical_guides",
      description: cleanText(body.description, 2000) || null,
      link_url: body.link_url ? safeExternalUrl(body.link_url, "") || null : null,
    };

    if (body.file_url !== undefined) {
      updatePayload.file_url = body.file_url ? safeExternalUrl(body.file_url, "") || null : null;
      updatePayload.file_name = cleanText(body.file_name, 180) || null;
    }

    if (!updatePayload.title) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    const { data, error } = await admin
      .from("batch_resources")
      .update(updatePayload)
      .eq("id", resourceId)
      .select("*, creator:profiles!batch_resources_created_by_fkey(id, full_name, role)")
      .single();

    if (error) return NextResponse.json({ error: error.message || "Failed to update resource." }, { status: 400 });

    await writeActivity(admin, requester, "batch.update_resource", "batch_resource", resourceId, `Updated file/resource: ${updatePayload.title}`, { batch_id: batch.id });

    return NextResponse.json({ success: true, resource: data });
  }

  if (type === "delete_resource") {
    const resourceId = cleanText(body.id, 64);
    if (!resourceId) return NextResponse.json({ error: "Resource ID is required." }, { status: 400 });

    const { data: existing, error: existErr } = await admin
      .from("batch_resources")
      .select("id, created_by, batch_id, title")
      .eq("id", resourceId)
      .maybeSingle();

    if (existErr || !existing) return NextResponse.json({ error: "Resource not found." }, { status: 404 });

    const canManage = ["super_admin", "hr", "admin"].includes(requester.profile.role) || existing.created_by === requester.user.id;
    if (!canManage) return NextResponse.json({ error: "You are not authorized to delete this file." }, { status: 403 });

    const { error } = await admin
      .from("batch_resources")
      .delete()
      .eq("id", resourceId);

    if (error) return NextResponse.json({ error: error.message || "Failed to delete resource." }, { status: 400 });

    await writeActivity(admin, requester, "batch.delete_resource", "batch_resource", resourceId, `Deleted file/resource: ${existing.title}`, { batch_id: batch.id });

    return NextResponse.json({ success: true, deleted_id: resourceId });
  }

  if (type === "escalation") {
    let assignedTo = body.assigned_to || null;
    if (assignedTo) {
      const { data: assignee } = await admin
        .from("profiles")
        .select("id, role")
        .eq("id", assignedTo)
        .maybeSingle();
      if (!assignee || !["super_admin", "hr", "mentor", "team_leader"].includes(assignee.role)) {
        return NextResponse.json({ error: "Escalation can only be assigned to Admin, HR, Mentor, or TL." }, { status: 400 });
      }
    }
    const payload = {
      batch_id: batch.id,
      issue: cleanText(body.issue, 180),
      category: cleanText(body.category, 80) || "general",
      priority: body.priority || "medium",
      description: cleanText(body.description, 4000) || null,
      related_member_id: body.related_member_id || null,
      related_task_id: body.related_task_id || null,
      attachment_url: body.attachment_url ? safeExternalUrl(body.attachment_url, "") || null : null,
      created_by: requester.user.id,
      assigned_to: assignedTo || batch.mentor_id || batch.hr_id || null,
      status: "open",
    };
    if (!payload.issue) return NextResponse.json({ error: "Issue is required." }, { status: 400 });
    const { data, error } = await admin.from("batch_escalations").insert([payload]).select(ESCALATION_SELECT).single();
    if (error) return NextResponse.json({ error: error.message || "Unable to create escalation." }, { status: 400 });
    await writeActivity(admin, requester, "batch.escalation", "batch_escalation", data.id, `Escalation opened: ${payload.issue}`, { batch_id: batch.id });
    return NextResponse.json({ escalation: data });
  }

  if (type === "assignment_history") {
    if (!canManage(requester.profile, batch)) {
      return NextResponse.json({ error: "Only batch managers can record assignment history." }, { status: 403 });
    }
    const assignmentType = cleanText(body.assignment_type, 40);
    if (!["hr", "mentor", "team_leader", "member_transfer"].includes(assignmentType)) {
      return NextResponse.json({ error: "Invalid assignment history type." }, { status: 400 });
    }
    const { data, error } = await admin.from("batch_assignment_history").insert([{
      batch_id: batch.id,
      assignment_type: assignmentType,
      old_user_id: body.old_user_id || null,
      new_user_id: body.new_user_id || null,
      member_id: body.member_id || null,
      changed_by: requester.user.id,
      note: cleanText(body.note, 500) || null,
    }]).select().single();
    if (error) return NextResponse.json({ error: error.message || "Unable to record assignment history." }, { status: 400 });
    await writeActivity(admin, requester, `batch.${assignmentType}.history`, "batch_assignment_history", data.id, `Recorded ${assignmentType.replaceAll("_", " ")} history`, { batch_id: batch.id });
    return NextResponse.json({ history: data });
  }

  if (type === "transfer_member") {
    if (!["hr", "super_admin"].includes(requester.profile.role)) {
      return NextResponse.json({ error: "Only HR or Admin can transfer batch members." }, { status: 403 });
    }
    const memberId = body.member_id;
    const toBatchId = body.to_batch_id;
    if (!memberId || !toBatchId) return NextResponse.json({ error: "Member and target batch are required." }, { status: 400 });
    const toBatch = await getBatch(admin, toBatchId);
    if (!toBatch) return NextResponse.json({ error: "Target batch not found." }, { status: 404 });
    if (requester.profile.role === "hr" && (batch.hr_id !== requester.user.id || toBatch.hr_id !== requester.user.id)) {
      return NextResponse.json({ error: "HR can transfer only between assigned batches." }, { status: 403 });
    }
    const { data: member } = await admin.from("profiles").select("id, full_name, role, batch_id").eq("id", memberId).maybeSingle();
    if (!member || !["intern", "team_leader"].includes(member.role) || member.batch_id !== batch.id) {
      return NextResponse.json({ error: "Member is not active in this source batch." }, { status: 403 });
    }
    await admin.from("member_assignments").update({ status: "transferred" }).eq("member_id", member.id).eq("batch_id", batch.id);
    const updates = {
      batch_id: toBatch.id,
      batch_name: toBatch.name,
      domain: toBatch.domain,
      assigned_mentor_id: toBatch.mentor_id || null,
      assigned_tl_id: toBatch.tl_id || null,
      role: member.role === "team_leader" ? "intern" : member.role,
      updated_at: new Date().toISOString(),
    };
    const { data: profile, error } = await admin.from("profiles").update(updates).eq("id", member.id).select().single();
    if (error) return NextResponse.json({ error: error.message || "Unable to transfer member." }, { status: 400 });
    await admin.from("member_assignments").insert([{
      member_id: member.id,
      batch_id: toBatch.id,
      tl_id: toBatch.tl_id || null,
      mentor_id: toBatch.mentor_id || null,
      domain: toBatch.domain,
      status: "active",
      assigned_by: requester.user.id,
    }]);
    const { data: history } = await admin.from("batch_assignment_history").insert([{
      batch_id: batch.id,
      assignment_type: "member_transfer",
      member_id: member.id,
      from_batch_id: batch.id,
      to_batch_id: toBatch.id,
      changed_by: requester.user.id,
      note: cleanText(body.note, 500) || null,
    }]).select().single();
    await writeActivity(admin, requester, "batch.transfer", "profile", member.id, `Transferred ${member.full_name || "member"} to ${toBatch.name}`, { batch_id: batch.id, to_batch_id: toBatch.id });
    return NextResponse.json({ profile, history });
  }

  return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
}

export async function PATCH(request) {
  const limited = await checkApiRateLimit(`batch-workspace-patch:${getClientIp(request)}`, { limit: 60, windowMs: 60_000 });
  if (!limited.allowed) return NextResponse.json(rateLimitResponse(limited), { status: 429 });

  const admin = getAdminClient();
  if (!admin) return NextResponse.json({ error: "Server admin key is not configured." }, { status: 500 });
  const requester = await getRequester(admin, request);
  if (requester.error) return requester.error;
  if (!isJsonRequest(request)) return NextResponse.json({ error: "Content-Type must be application/json." }, { status: 415 });

  const body = await request.json().catch(() => ({}));
  const { data: existing } = await admin.from("batch_escalations").select("*").eq("id", body.id).maybeSingle();
  if (!existing) return NextResponse.json({ error: "Escalation not found." }, { status: 404 });
  if (existing.assigned_to !== requester.user.id) {
    return NextResponse.json({ error: "Only assigned escalation owner can update this escalation." }, { status: 403 });
  }
  const status = ESCALATION_STATUSES.has(body.status) ? body.status : existing.status;
  const resolution = cleanText(body.resolution, 2000);
  if (status === "resolved" && existing.created_by === requester.user.id) {
    return NextResponse.json({ error: "Escalation raiser cannot resolve their own escalation." }, { status: 403 });
  }
  if (status === "resolved" && !resolution && !existing.resolution) {
    return NextResponse.json({ error: "Resolution comment is required." }, { status: 400 });
  }
  const { data, error } = await admin
    .from("batch_escalations")
    .update({
      status,
      resolution: resolution || existing.resolution,
      assigned_to: body.assigned_to || existing.assigned_to,
      updated_at: new Date().toISOString(),
    })
    .eq("id", existing.id)
    .select(ESCALATION_SELECT)
    .single();
  if (error) return NextResponse.json({ error: error.message || "Unable to update escalation." }, { status: 400 });
  await writeActivity(admin, requester, "batch.escalation.update", "batch_escalation", existing.id, `Escalation marked ${status}`, { batch_id: existing.batch_id });
  return NextResponse.json({ escalation: data });
}
