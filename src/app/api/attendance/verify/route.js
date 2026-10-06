import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { cleanText, getBearerToken, getClientIp, isBodyTooLarge, isJsonRequest } from "@/lib/apiSecurity";

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

async function getMeeting(admin, meetingId) {
  if (!meetingId) return null;
  const { data, error } = await admin
    .from("meetings")
    .select("id, title, batch_id, domain, attendance_token, status, scheduled_at")
    .eq("id", meetingId)
    .maybeSingle();

  if (!error && data) return data;

  const fallback = await admin
    .from("meetings")
    .select("id, title, status, attendance_token")
    .eq("id", meetingId)
    .maybeSingle();
  return fallback.data || null;
}

export async function POST(request) {
  const ip = getClientIp(request);
  const limited = await checkApiRateLimit(`attendance-verify:${ip}`, { limit: 30, windowMs: 60_000 });
  if (!limited.allowed) {
    return NextResponse.json(rateLimitResponse(limited), { status: 429 });
  }

  const admin = getAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Server admin key is not configured." }, { status: 500 });
  }

  const token = getBearerToken(request);
  if (!token) {
    return NextResponse.json({ error: "Login required before attendance verification." }, { status: 401 });
  }

  const {
    data: { user },
    error: userError,
  } = await admin.auth.getUser(token);

  if (userError || !user) {
    return NextResponse.json({ error: "Invalid login session." }, { status: 401 });
  }

  if (!isJsonRequest(request)) {
    return NextResponse.json({ error: "Content-Type must be application/json." }, { status: 415 });
  }
  if (isBodyTooLarge(request, 4096)) {
    return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
  }

  const body = await request.json().catch(() => ({}));
  const meetingId = cleanText(body.meeting_id, 80) || null;
  const requestedBatchId = cleanText(body.batch_id, 80) || null;
  const submittedToken = cleanText(body.token, 120);

  const { data: profile } = await admin
    .from("profiles")
    .select("id, role, status, domain, batch_id, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.status === "suspended" || profile.status === "paused") {
    return NextResponse.json({ error: "Your profile is not active for attendance." }, { status: 403 });
  }

  const meeting = await getMeeting(admin, meetingId);
  if (meetingId && !meeting) {
    return NextResponse.json({ error: "Meeting not found." }, { status: 404 });
  }

  if (meeting) {
    // 1. Check if meeting has ended
    if (meeting.status === "completed" || meeting.status === "cancelled") {
      return NextResponse.json({ error: "Meeting has ended. Attendance is closed." }, { status: 403 });
    }

    // 2. Check if meeting has been started by host
    const isMeetingLive = Boolean(meeting.attendance_token?.includes("#live:")) || meeting.status === "in_progress" || meeting.status === "live";
    if (!isMeetingLive) {
      return NextResponse.json({ error: "Meeting has not started yet. Attendance will open once the host starts the meeting." }, { status: 403 });
    }
  }

  if (meeting?.attendance_token) {
    const cleanStoredToken = meeting.attendance_token.split("#")[0];
    const cleanSubmittedToken = (submittedToken || "").split("#")[0];
    if (cleanSubmittedToken && cleanStoredToken && cleanStoredToken !== cleanSubmittedToken) {
      return NextResponse.json({ error: "Invalid attendance link." }, { status: 403 });
    }
  }

  const batchId = meeting?.batch_id || requestedBatchId || profile.batch_id || null;
  if (!batchId) {
    return NextResponse.json({ error: "Batch is required for attendance verification." }, { status: 400 });
  }

  const { data: assignment } = await admin
    .from("member_assignments")
    .select("member_id")
    .eq("member_id", user.id)
    .eq("batch_id", batchId)
    .maybeSingle();

  if (profile.batch_id !== batchId && !assignment) {
    return NextResponse.json({ error: "This attendance link is not for your assigned batch." }, { status: 403 });
  }

  let existingQuery = admin
    .from("attendance")
    .select("*")
    .eq("user_id", user.id)
    .eq("batch_id", batchId);

  if (meetingId) existingQuery = existingQuery.eq("meeting_id", meetingId);
  else existingQuery = existingQuery.eq("attendance_date", new Date().toISOString().slice(0, 10));

  const { data: existing } = await existingQuery.maybeSingle();
  if (existing) {
    return NextResponse.json({ attendance: existing, alreadyMarked: true });
  }

  const payload = {
    user_id: user.id,
    batch_id: batchId,
    meeting_id: meetingId,
    domain: meeting?.domain || profile.domain || "web_dev",
    status: "present",
    marked_by: user.id,
    notes: `Self verified from live class link${meeting?.title ? `: ${meeting.title}` : ""}`,
  };

  const { data: attendance, error } = await admin
    .from("attendance")
    .insert([payload])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message || "Attendance could not be saved." }, { status: 400 });
  }

  await admin.from("audit_logs").insert([{
    actor_id: user.id,
    actor_role: profile.role,
    action: "attendance.self_verify",
    entity_type: "attendance",
    entity_id: attendance.id,
    summary: `${profile.full_name || "Member"} self-verified attendance`,
    metadata: { meeting_id: meetingId, batch_id: batchId },
  }]);

  return NextResponse.json({ attendance, alreadyMarked: false });
}
