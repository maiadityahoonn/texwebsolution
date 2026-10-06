import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { cleanText, getBearerToken, getClientIp, isBodyTooLarge, isJsonRequest } from "@/lib/apiSecurity";

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
    .select("id, role, domain, batch_id, full_name")
    .eq("id", user.id)
    .single();
  if (!profile) return { error: NextResponse.json({ error: "Profile not found." }, { status: 404 }) };
  return { user, profile };
}

export async function POST(request) {
  const ip = getClientIp(request);
  const limited = await checkApiRateLimit(`meeting-action:${ip}`, { limit: 40, windowMs: 60_000 });
  if (!limited.allowed) return NextResponse.json(rateLimitResponse(limited), { status: 429 });

  const admin = getAdminClient();
  if (!admin) return NextResponse.json({ error: "Server admin key is not configured." }, { status: 500 });

  const requester = await getRequester(admin, request);
  if (requester.error) return requester.error;

  if (!isJsonRequest(request)) return NextResponse.json({ error: "Content-Type must be application/json." }, { status: 415 });
  if (isBodyTooLarge(request, 4096)) return NextResponse.json({ error: "Request body is too large." }, { status: 413 });

  const body = await request.json().catch(() => ({}));
  const action = cleanText(body.action, 20); // 'start' | 'end'
  const meetingId = cleanText(body.meeting_id, 80);

  if (!meetingId || !["start", "end"].includes(action)) {
    return NextResponse.json({ error: "Invalid action or meeting ID." }, { status: 400 });
  }

  // Fetch meeting
  const { data: meeting, error: meetingErr } = await admin
    .from("meetings")
    .select("*")
    .eq("id", meetingId)
    .maybeSingle();

  if (meetingErr || !meeting) {
    return NextResponse.json({ error: "Meeting not found." }, { status: 404 });
  }

  // Authorization check: Is user host, mentor, TL of batch, HR or Super Admin?
  const { user, profile } = requester;
  const isSuperAdmin = profile.role === "super_admin";
  const isHr = profile.role === "hr";
  const isHost = meeting.host_id === user.id;
  const isMentor = profile.role === "mentor";
  const isTl = profile.role === "team_leader" && meeting.batch_id === profile.batch_id;

  if (!isSuperAdmin && !isHr && !isHost && !isMentor && !isTl) {
    return NextResponse.json({ error: "You are not authorized to control this meeting." }, { status: 403 });
  }

  const nowIso = new Date().toISOString();

  if (action === "start") {
    if (meeting.status === "completed" || meeting.status === "cancelled") {
      return NextResponse.json({ error: "This meeting has already ended." }, { status: 400 });
    }

    const currentToken = meeting.attendance_token || "";
    const cleanToken = currentToken.split("#")[0] || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    const liveToken = `${cleanToken}#live:${nowIso}`;

    const { data: updated, error: updateErr } = await admin
      .from("meetings")
      .update({
        attendance_token: liveToken,
        status: "scheduled", // valid Postgres check constraint
      })
      .eq("id", meetingId)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message || "Failed to start meeting." }, { status: 500 });
    }

    await admin.from("audit_logs").insert([{
      actor_id: user.id,
      actor_role: profile.role,
      action: "meeting.start",
      entity_type: "meeting",
      entity_id: meetingId,
      summary: `${profile.full_name || "Host"} started meeting "${meeting.title}"`,
      metadata: { meeting_id: meetingId, batch_id: meeting.batch_id, started_at: nowIso },
    }]);

    return NextResponse.json({ success: true, action: "start", meeting: updated });
  }

  if (action === "end") {
    const { data: updated, error: updateErr } = await admin
      .from("meetings")
      .update({
        status: "completed", // native check constraint allows 'completed'
      })
      .eq("id", meetingId)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message || "Failed to end meeting." }, { status: 500 });
    }

    await admin.from("audit_logs").insert([{
      actor_id: user.id,
      actor_role: profile.role,
      action: "meeting.end",
      entity_type: "meeting",
      entity_id: meetingId,
      summary: `${profile.full_name || "Host"} ended meeting "${meeting.title}"`,
      metadata: { meeting_id: meetingId, batch_id: meeting.batch_id, ended_at: nowIso },
    }]);

    return NextResponse.json({ success: true, action: "end", meeting: updated });
  }

  return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
}
