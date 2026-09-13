import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { cleanText, getBearerToken, getClientIp, isBodyTooLarge, isJsonRequest } from "@/lib/apiSecurity";
import { safeExternalUrl } from "@/lib/safeUrl";

const WRITE_TYPES = new Set(["message", "pin_message", "delete_message", "announcement", "resource", "escalation", "transfer_member", "assignment_history"]);
const ESCALATION_STATUSES = new Set(["open", "in_review", "action_required", "resolved", "closed"]);

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
    .select("id, name, domain, hr_id, mentor_id, tl_id")
    .eq("id", batchId)
    .maybeSingle();
  return data || null;
}

async function isParticipant(admin, profile, batch) {
  if (!profile || !batch) return false;
  if (profile.role === "super_admin") return true;
  if ([batch.hr_id, batch.mentor_id, batch.tl_id].includes(profile.id)) return true;
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
  if (profile.role === "super_admin") return true;
  return [batch.hr_id, batch.mentor_id, batch.tl_id].includes(profile.id);
}

async function writeActivity(admin, requester, action, entityType, entityId, summary, metadata = {}) {
  await admin.from("audit_logs").insert([{
    actor_id: requester.user.id,
    actor_role: requester.profile.role,
    action,
    entity_type: entityType,
    entity_id: entityId,
    summary,
    metadata,
  }]);
}

export async function GET(request) {
  const limited = await checkApiRateLimit(`batch-workspace-get:${getClientIp(request)}`, { limit: 80, windowMs: 60_000 });
  if (!limited.allowed) return NextResponse.json(rateLimitResponse(limited), { status: 429 });

  const admin = getAdminClient();
  if (!admin) return NextResponse.json({ error: "Server admin key is not configured." }, { status: 500 });
  const requester = await getRequester(admin, request);
  if (requester.error) return requester.error;

  const batchId = new URL(request.url).searchParams.get("batch_id");
  if (!batchId) return NextResponse.json({ error: "Batch id is required." }, { status: 400 });

  const batch = await getBatch(admin, batchId);
  if (!batch) return NextResponse.json({ error: "Batch not found." }, { status: 404 });
  if (!(await isParticipant(admin, requester.profile, batch))) {
    return NextResponse.json({ error: "You cannot access this batch workspace." }, { status: 403 });
  }

  const [messages, announcements, resources, escalations, history] = await Promise.all([
    admin.from("batch_messages").select("*, sender:profiles!batch_messages_sender_id_fkey(id, full_name, role, email)").eq("batch_id", batch.id).order("created_at", { ascending: true }).limit(200),
    admin.from("batch_announcements").select("*, creator:profiles!batch_announcements_created_by_fkey(id, full_name, role)").eq("batch_id", batch.id).order("pinned", { ascending: false }).order("created_at", { ascending: false }).limit(100),
    admin.from("batch_resources").select("*, creator:profiles!batch_resources_created_by_fkey(id, full_name, role)").eq("batch_id", batch.id).order("created_at", { ascending: false }).limit(100),
    admin.from("batch_escalations").select("*, creator:profiles!batch_escalations_created_by_fkey(id, full_name, role), assignee:profiles!batch_escalations_assigned_to_fkey(id, full_name, role), member:profiles!batch_escalations_related_member_id_fkey(id, full_name, role), task:tasks(id, title, status)").eq("batch_id", batch.id).order("created_at", { ascending: false }).limit(100),
    admin.from("batch_assignment_history").select("*, old_user:profiles!batch_assignment_history_old_user_id_fkey(id, full_name, role), new_user:profiles!batch_assignment_history_new_user_id_fkey(id, full_name, role), member:profiles!batch_assignment_history_member_id_fkey(id, full_name, role), changer:profiles!batch_assignment_history_changed_by_fkey(id, full_name, role)").eq("batch_id", batch.id).order("created_at", { ascending: false }).limit(100),
  ]);

  return NextResponse.json({
    messages: messages.data || [],
    announcements: announcements.data || [],
    resources: resources.data || [],
    escalations: escalations.data || [],
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
  if (isBodyTooLarge(request, 24_576)) return NextResponse.json({ error: "Request body is too large." }, { status: 413 });

  const body = await request.json().catch(() => ({}));
  const type = cleanText(body.type, 40);
  if (!WRITE_TYPES.has(type)) return NextResponse.json({ error: "Invalid batch workspace action." }, { status: 400 });

  const batch = await getBatch(admin, body.batch_id);
  if (!batch) return NextResponse.json({ error: "Batch not found." }, { status: 404 });
  const participant = await isParticipant(admin, requester.profile, batch);
  if (!participant) return NextResponse.json({ error: "You cannot access this batch workspace." }, { status: 403 });

  if (type === "message") {
    const message = cleanText(body.message, 4000);
    if (!message) return NextResponse.json({ error: "Message is required." }, { status: 400 });
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
        message: "This message was deleted",
        attachment_url: null,
        attachment_name: null,
        attachment_type: null,
        reference_type: "none",
        reference_id: null,
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

  if (["announcement", "resource"].includes(type) && !canManage(requester.profile, batch)) {
    return NextResponse.json({ error: "Only HR, Mentor, TL or Admin can publish this item." }, { status: 403 });
  }

  if (type === "announcement") {
    const payload = {
      batch_id: batch.id,
      title: cleanText(body.title, 180),
      body: cleanText(body.body, 4000),
      category: body.category || "announcement",
      link_url: body.link_url ? safeExternalUrl(body.link_url, "") || null : null,
      pinned: Boolean(body.pinned),
      created_by: requester.user.id,
    };
    if (!payload.title || !payload.body) return NextResponse.json({ error: "Title and body are required." }, { status: 400 });
    const { data, error } = await admin.from("batch_announcements").insert([payload]).select().single();
    if (error) return NextResponse.json({ error: error.message || "Unable to publish announcement." }, { status: 400 });
    await writeActivity(admin, requester, "batch.announcement", "batch_announcement", data.id, `Posted announcement ${payload.title}`, { batch_id: batch.id });
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
    const { data, error } = await admin.from("batch_resources").insert([payload]).select().single();
    if (error) return NextResponse.json({ error: error.message || "Unable to add resource." }, { status: 400 });
    await writeActivity(admin, requester, "batch.resource", "batch_resource", data.id, `Added resource ${payload.title}`, { batch_id: batch.id });
    return NextResponse.json({ resource: data });
  }

  if (type === "escalation") {
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
      assigned_to: body.assigned_to || batch.mentor_id || batch.hr_id || null,
      status: "open",
    };
    if (!payload.issue) return NextResponse.json({ error: "Issue is required." }, { status: 400 });
    const { data, error } = await admin.from("batch_escalations").insert([payload]).select().single();
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
  const batch = await getBatch(admin, existing.batch_id);
  if (!canManage(requester.profile, batch)) {
    return NextResponse.json({ error: "Only batch managers can update escalations." }, { status: 403 });
  }
  const status = ESCALATION_STATUSES.has(body.status) ? body.status : existing.status;
  const { data, error } = await admin
    .from("batch_escalations")
    .update({
      status,
      resolution: cleanText(body.resolution, 2000) || existing.resolution,
      assigned_to: body.assigned_to || existing.assigned_to,
      updated_at: new Date().toISOString(),
    })
    .eq("id", existing.id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message || "Unable to update escalation." }, { status: 400 });
  await writeActivity(admin, requester, "batch.escalation.update", "batch_escalation", existing.id, `Escalation marked ${status}`, { batch_id: existing.batch_id });
  return NextResponse.json({ escalation: data });
}
