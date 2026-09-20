import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { cleanText, getBearerToken, getClientIp, isBodyTooLarge, isJsonRequest } from "@/lib/apiSecurity";

const EDIT_WINDOW_MS = 60 * 1000;

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

const requesterCache = new Map();

async function getRequester(admin, request) {
  const token = getBearerToken(request);
  if (!token) return { error: NextResponse.json({ error: "Missing authorization token." }, { status: 401 }) };

  const now = Date.now();
  const cached = requesterCache.get(token);
  if (cached && now - cached.timestamp < 45000) {
    return cached.data;
  }

  const { data: { user }, error } = await admin.auth.getUser(token);
  if (error || !user) return { error: NextResponse.json({ error: "Invalid authorization token." }, { status: 401 }) };
  const { data: profile } = await admin
    .from("profiles")
    .select("id, full_name, role, domain, batch_id, assigned_mentor_id, assigned_tl_id")
    .eq("id", user.id)
    .maybeSingle();

  const data = { user, profile };
  requesterCache.set(token, { data, timestamp: now });
  if (requesterCache.size > 500) {
    const oldestKey = requesterCache.keys().next().value;
    requesterCache.delete(oldestKey);
  }
  return data;
}

async function canDirectMessage(admin, senderProfile, receiverProfile) {
  if (!senderProfile || !receiverProfile) return false;
  if (senderProfile.id === receiverProfile.id) return true;
  const senderRole = senderProfile.role || "";
  const receiverRole = receiverProfile.role || "";
  const elevatedRoles = new Set(["super_admin", "admin", "hr"]);

  if (elevatedRoles.has(senderRole)) return true;
  if (senderRole === "mentor") {
    if (elevatedRoles.has(receiverRole)) return true;
    if (!["team_leader", "intern"].includes(receiverRole)) return false;
    const { data: batches } = await admin
      .from("batches")
      .select("id")
      .eq("mentor_id", senderProfile.id);
    const batchIds = new Set((batches || []).map((batch) => batch.id));
    return Boolean(receiverProfile.batch_id && batchIds.has(receiverProfile.batch_id));
  }
  if (senderRole === "team_leader" || senderRole === "intern") {
    if (elevatedRoles.has(receiverRole)) return true;
    if (receiverRole !== "mentor") return false;
    if (senderProfile.assigned_mentor_id && senderProfile.assigned_mentor_id === receiverProfile.id) return true;
    if (!senderProfile.batch_id) return false;
    const { data: batch } = await admin
      .from("batches")
      .select("mentor_id")
      .eq("id", senderProfile.batch_id)
      .maybeSingle();
    return batch?.mentor_id === receiverProfile.id;
  }
  return false;
}

export async function GET(request) {
  const limited = await checkApiRateLimit(`messages-get:${getClientIp(request)}`, { limit: 120, windowMs: 60_000 });
  if (!limited.allowed) return NextResponse.json(rateLimitResponse(limited), { status: 429 });

  const admin = getAdminClient();
  if (!admin) return NextResponse.json({ error: "Server admin key is not configured." }, { status: 500 });
  const requester = await getRequester(admin, request);
  if (requester.error) return requester.error;

  const searchParams = new URL(request.url).searchParams;
  const contactId = cleanText(searchParams.get("contact_id"), 80);
  if (!contactId) return NextResponse.json({ error: "Contact id is required." }, { status: 400 });

  const conversationFilter = `and(sender_id.eq.${requester.user.id},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${requester.user.id})`;
  const isElevated = ["super_admin", "admin", "hr"].includes(requester.profile?.role);

  const messagesPromise = admin
    .from("messages")
    .select("*, sender:profiles!messages_sender_id_fkey(id, full_name, role, email, avatar_url)")
    .or(conversationFilter)
    .order("created_at", { ascending: true })
    .limit(300);

  if (isElevated) {
    let result = await messagesPromise;
    if (result.error) {
      result = await admin
        .from("messages")
        .select("*")
        .or(conversationFilter)
        .order("created_at", { ascending: true })
        .limit(300);
    }
    if (result.error) return NextResponse.json({ error: result.error.message || "Failed to load messages." }, { status: 400 });
    return NextResponse.json({ messages: result.data || [] });
  }

  // Non-elevated: query contact profile and messages in parallel
  const [profileResult, messagesResult] = await Promise.all([
    admin
      .from("profiles")
      .select("id, full_name, role, domain, batch_id, assigned_mentor_id, assigned_tl_id")
      .eq("id", contactId)
      .maybeSingle(),
    messagesPromise,
  ]);

  const contactProfile = profileResult.data;
  if (!contactProfile) return NextResponse.json({ error: "Contact profile not found." }, { status: 404 });
  const allowed = await canDirectMessage(admin, requester.profile, contactProfile);
  if (!allowed) {
    return NextResponse.json({ error: "You cannot access this direct conversation." }, { status: 403 });
  }

  let finalResult = messagesResult;
  if (finalResult.error) {
    finalResult = await admin
      .from("messages")
      .select("*")
      .or(conversationFilter)
      .order("created_at", { ascending: true })
      .limit(300);
  }

  if (finalResult.error) return NextResponse.json({ error: finalResult.error.message || "Failed to load messages." }, { status: 400 });
  return NextResponse.json({ messages: finalResult.data || [] });
}

export async function POST(request) {
  const limited = await checkApiRateLimit(`messages-post:${getClientIp(request)}`, { limit: 100, windowMs: 60_000 });
  if (!limited.allowed) return NextResponse.json(rateLimitResponse(limited), { status: 429 });

  const admin = getAdminClient();
  if (!admin) return NextResponse.json({ error: "Server admin key is not configured." }, { status: 500 });
  const requester = await getRequester(admin, request);
  if (requester.error) return requester.error;
  if (!isJsonRequest(request)) return NextResponse.json({ error: "Content-Type must be application/json." }, { status: 415 });
  if (isBodyTooLarge(request, 262_144)) return NextResponse.json({ error: "Request body is too large." }, { status: 413 });

  const body = await request.json().catch(() => ({}));
  const type = cleanText(body.type, 40);

  if (type === "send_message") {
    const receiverId = cleanText(body.receiver_id, 80);
    if (!receiverId) return NextResponse.json({ error: "Receiver id is required." }, { status: 400 });
    const { data: receiverProfile } = await admin
      .from("profiles")
      .select("id, full_name, role, domain, batch_id, assigned_mentor_id, assigned_tl_id")
      .eq("id", receiverId)
      .maybeSingle();
    if (!receiverProfile) return NextResponse.json({ error: "Receiver profile not found." }, { status: 404 });
    const allowed = await canDirectMessage(admin, requester.profile, receiverProfile);
    if (!allowed) {
      return NextResponse.json({ error: "Direct chat is limited to permitted HR, Mentor, and Admin contacts for this role." }, { status: 403 });
    }

    const message = cleanText(body.message, 4000);
    const hasAttachment = Boolean(body.attachment_url || body.attachment_name || body.attachment_type);
    if (!message && !hasAttachment) return NextResponse.json({ error: "Message is required." }, { status: 400 });

    const { data, error } = await admin
      .from("messages")
      .insert([{
        sender_id: requester.user.id,
        receiver_id: receiverId,
        message,
        attachment_url: body.attachment_url || null,
        attachment_name: cleanText(body.attachment_name, 200) || null,
        attachment_type: cleanText(body.attachment_type, 80) || null,
        reply_to_id: body.reply_to_id || null,
      }])
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message || "Unable to send message." }, { status: 400 });
    return NextResponse.json({ message: data });
  }

  if (type === "mark_delivered") {
    const senderId = cleanText(body.sender_id, 80);
    const now = new Date().toISOString();
    let query = admin
      .from("messages")
      .update({ delivered_at: now })
      .eq("receiver_id", requester.user.id)
      .is("delivered_at", null);
    if (senderId) {
      query = query.eq("sender_id", senderId);
    }
    await query;
    return NextResponse.json({ success: true, delivered_at: now });
  }

  if (type === "read_messages") {
    const senderId = cleanText(body.sender_id, 80);
    if (!senderId) return NextResponse.json({ error: "Sender id is required." }, { status: 400 });
    const now = new Date().toISOString();
    const { error } = await admin
      .from("messages")
      .update({ is_read: true, read_at: now, delivered_at: now })
      .eq("sender_id", senderId)
      .eq("receiver_id", requester.user.id)
      .eq("is_read", false);

    if (error) return NextResponse.json({ error: error.message || "Failed to mark messages read." }, { status: 400 });
    return NextResponse.json({ success: true, read_at: now });
  }

  if (type === "vote_poll") {
    const messageId = cleanText(body.message_id, 80);
    const pollData = body.poll_data;
    if (!messageId || !pollData) {
      return NextResponse.json({ error: "Message id and poll data are required." }, { status: 400 });
    }
    const { data: existing, error: existingError } = await admin
      .from("messages")
      .select("id, sender_id, receiver_id")
      .eq("id", messageId)
      .maybeSingle();
    if (existingError || !existing) return NextResponse.json({ error: "Message not found." }, { status: 404 });
    const isSender = existing.sender_id === requester.user.id;
    const isReceiver = existing.receiver_id === requester.user.id;
    if (!isSender && !isReceiver) return NextResponse.json({ error: "You are not part of this conversation." }, { status: 403 });

    const { data, error } = await admin
      .from("messages")
      .update({ message: JSON.stringify(pollData) })
      .eq("id", messageId)
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message || "Failed to submit poll vote." }, { status: 400 });
    return NextResponse.json({ message: data });
  }

  if (type !== "update_message") {
    return NextResponse.json({ error: "Unsupported message action." }, { status: 400 });
  }

  const messageId = cleanText(body.message_id, 80);
  if (!messageId) return NextResponse.json({ error: "Message id is required." }, { status: 400 });

  const { data: existing, error: existingError } = await admin
    .from("messages")
    .select("id, sender_id, receiver_id, message, attachment_url, created_at, is_deleted")
    .eq("id", messageId)
    .maybeSingle();

  if (existingError || !existing) return NextResponse.json({ error: "Message not found." }, { status: 404 });
  const isSender = existing.sender_id === requester.user.id;
  const isReceiver = existing.receiver_id === requester.user.id;
  if (!isSender && !isReceiver) return NextResponse.json({ error: "You are not part of this conversation." }, { status: 403 });

  const updates = body.updates || {};
  const payload = {};

  if (Object.prototype.hasOwnProperty.call(updates, "is_pinned")) {
    if (!isSender) return NextResponse.json({ error: "You can pin only your own message." }, { status: 403 });
    payload.is_pinned = Boolean(updates.is_pinned);
  }

  if (Object.prototype.hasOwnProperty.call(updates, "message")) {
    if (!isSender) return NextResponse.json({ error: "You can edit only your own message." }, { status: 403 });
    if (existing.attachment_url || existing.is_deleted) {
      return NextResponse.json({ error: "Only active text messages can be edited." }, { status: 400 });
    }
    const created = new Date(existing.created_at).getTime();
    if (Number.isNaN(created) || Date.now() - created > EDIT_WINDOW_MS) {
      return NextResponse.json({ error: "Edit time window has expired." }, { status: 403 });
    }
    const message = cleanText(updates.message, 4000);
    if (!message) return NextResponse.json({ error: "Updated message is required." }, { status: 400 });
    payload.message = message;
    payload.original_message = updates.original_message || existing.message;
    payload.edited_at = new Date().toISOString();
  }

  if (updates.is_deleted) {
    if (!isSender) return NextResponse.json({ error: "You can delete only your own message for everyone." }, { status: 403 });
    payload.is_deleted = true;
    payload.deleted_at = new Date().toISOString();
    payload.deleted_by = requester.user.id;
    payload.is_pinned = false;
  }

  if (Object.keys(payload).length === 0) {
    return NextResponse.json({ error: "No allowed message update provided." }, { status: 400 });
  }

  const { data, error } = await admin
    .from("messages")
    .update(payload)
    .eq("id", messageId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message || "Failed to update message." }, { status: 400 });
  return NextResponse.json({ message: data });
}
