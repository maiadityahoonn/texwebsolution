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
    .select("id, role, domain, batch_id, assigned_mentor_id, assigned_tl_id")
    .eq("id", user.id)
    .single();
  if (!profile) return { error: NextResponse.json({ error: "Profile not found." }, { status: 404 }) };
  return { user, profile };
}

function canSeeUpdate(profile, update) {
  if (["super_admin", "hr"].includes(profile.role)) return true;
  if (update.tl_id === profile.id || update.mentor_id === profile.id) return true;
  if (update.batch_id && update.batch_id === profile.batch_id) return true;
  if (profile.role === "mentor" && (update.batch?.mentor_id === profile.id || update.mentor_id === profile.id)) return true;
  return false;
}

export async function GET(request) {
  const limited = await checkApiRateLimit(`daily-updates:${getClientIp(request)}`, { limit: 80, windowMs: 60_000 });
  if (!limited.allowed) return NextResponse.json(rateLimitResponse(limited), { status: 429 });
  const admin = getAdminClient();
  if (!admin) return NextResponse.json({ error: "Server admin key is not configured." }, { status: 500 });
  const requester = await getRequester(admin, request);
  if (requester.error) return requester.error;

  const { data, error } = await admin
    .from("daily_updates")
    .select("*, tl:profiles!daily_updates_tl_id_fkey(*), mentor:profiles!daily_updates_mentor_id_fkey(*), batch:batches(*), task:tasks(*)")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message || "Unable to load daily updates." }, { status: 400 });
  return NextResponse.json({ updates: (data || []).filter((update) => canSeeUpdate(requester.profile, update)) });
}

export async function POST(request) {
  const limited = await checkApiRateLimit(`daily-update-create:${getClientIp(request)}`, { limit: 60, windowMs: 60_000 });
  if (!limited.allowed) return NextResponse.json(rateLimitResponse(limited), { status: 429 });
  const admin = getAdminClient();
  if (!admin) return NextResponse.json({ error: "Server admin key is not configured." }, { status: 500 });
  const requester = await getRequester(admin, request);
  if (requester.error) return requester.error;
  if (!isJsonRequest(request)) return NextResponse.json({ error: "Content-Type must be application/json." }, { status: 415 });
  if (isBodyTooLarge(request, 16_384)) return NextResponse.json({ error: "Request body is too large." }, { status: 413 });

  const body = await request.json().catch(() => ({}));
  const { data: task } = body.task_id
    ? await admin.from("tasks").select("id, batch_id, assigned_by, assigned_to, domain").eq("id", body.task_id).maybeSingle()
    : { data: null };
  const batchId = body.batch_id || task?.batch_id || requester.profile.batch_id || null;

  if (!batchId) return NextResponse.json({ error: "Batch is required for daily update." }, { status: 400 });
  if (requester.profile.role !== "team_leader") {
    return NextResponse.json({ error: "Only Team Leader can submit TL daily reports." }, { status: 403 });
  }
  if (requester.profile.batch_id !== batchId) {
    return NextResponse.json({ error: "You can update only your assigned batch." }, { status: 403 });
  }

  const { data: batch } = await admin
    .from("batches")
    .select("id, domain, mentor_id, tl_id")
    .eq("id", batchId)
    .maybeSingle();

  let memberProgressText = "";
  if (Array.isArray(body.member_progress) && body.member_progress.length > 0) {
    memberProgressText = body.member_progress
      .map((item) => `• ${item.name || "Member"}: ${item.progress || "No progress stated"} ${item.blocker ? `[Blocker: ${item.blocker}]` : ""} ${item.remark ? `(Remark: ${item.remark})` : ""}`)
      .join("\n");
  }

  const payload = {
    tl_id: requester.user.id,
    mentor_id: batch?.mentor_id || requester.profile.assigned_mentor_id || null,
    batch_id: batchId,
    task_id: task?.id || null,
    domain: batch?.domain || task?.domain || requester.profile.domain || "web_dev",
    summary: cleanText(body.summary, 4000),
    blockers: cleanText(body.blockers, 2000) || null,
    present_interns: cleanText(body.present_interns, 1000) || null,
    absent_interns: cleanText(body.absent_interns, 1000) || null,
    completed_tasks: cleanText(body.completed_tasks || memberProgressText, 4000) || null,
    pending_tasks: cleanText(body.pending_tasks, 2000) || null,
    tomorrow_plan: cleanText(body.tomorrow_plan || (Array.isArray(body.member_progress) ? JSON.stringify(body.member_progress) : ""), 4000) || null,
    assigned_tasks: cleanText(body.assigned_tasks, 2000) || null,
    completed_count: Number(body.completed_count || 0),
    pending_count: Number(body.pending_count || 0),
  };

  if (!payload.summary) return NextResponse.json({ error: "Daily summary is required." }, { status: 400 });

  const { data: update, error } = await admin
    .from("daily_updates")
    .insert([payload])
    .select("*, tl:profiles!daily_updates_tl_id_fkey(*), mentor:profiles!daily_updates_mentor_id_fkey(*), batch:batches(*), task:tasks(*)")
    .single();
  if (error) return NextResponse.json({ error: error.message || "Unable to save daily update." }, { status: 400 });
  return NextResponse.json({ update });
}

export async function PATCH(request) {
  const limited = await checkApiRateLimit(`daily-update-comment:${getClientIp(request)}`, { limit: 60, windowMs: 60_000 });
  if (!limited.allowed) return NextResponse.json(rateLimitResponse(limited), { status: 429 });
  const admin = getAdminClient();
  if (!admin) return NextResponse.json({ error: "Server admin key is not configured." }, { status: 500 });
  const requester = await getRequester(admin, request);
  if (requester.error) return requester.error;
  if (!isJsonRequest(request)) return NextResponse.json({ error: "Content-Type must be application/json." }, { status: 415 });

  const body = await request.json().catch(() => ({}));
  const { data: existing } = await admin
    .from("daily_updates")
    .select("*")
    .eq("id", body.id)
    .maybeSingle();
  if (!existing) return NextResponse.json({ error: "Daily update not found." }, { status: 404 });
  if (!canSeeUpdate(requester.profile, existing) || !["team_leader", "mentor", "super_admin", "hr"].includes(requester.profile.role)) {
    return NextResponse.json({ error: "You cannot comment on this update." }, { status: 403 });
  }

  const { data: update, error } = await admin
    .from("daily_updates")
    .update({
      reviewer_comment: cleanText(body.reviewer_comment, 2000) || null,
      reviewed_by: requester.user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", existing.id)
    .select("*, tl:profiles!daily_updates_tl_id_fkey(*), mentor:profiles!daily_updates_mentor_id_fkey(*), batch:batches(*), task:tasks(*)")
    .single();
  if (error) return NextResponse.json({ error: error.message || "Unable to save comment." }, { status: 400 });
  return NextResponse.json({ update });
}
