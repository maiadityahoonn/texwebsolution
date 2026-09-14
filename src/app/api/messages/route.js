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

async function getRequester(admin, request) {
  const token = getBearerToken(request);
  if (!token) return { error: NextResponse.json({ error: "Missing authorization token." }, { status: 401 }) };
  const { data: { user }, error } = await admin.auth.getUser(token);
  if (error || !user) return { error: NextResponse.json({ error: "Invalid authorization token." }, { status: 401 }) };
  return { user };
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
