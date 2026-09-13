import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { cleanText, getBearerToken, getClientIp, isBodyTooLarge, isJsonRequest } from "@/lib/apiSecurity";

const ALLOWED_STATUSES = new Set(["approved", "rejected", "changes_requested", "reviewed"]);

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

export async function POST(request) {
  const ip = getClientIp(request);
  const limited = await checkApiRateLimit(`task-review:${ip}`, { limit: 60, windowMs: 60_000 });
  if (!limited.allowed) return NextResponse.json(rateLimitResponse(limited), { status: 429 });

  const admin = getAdminClient();
  if (!admin) return NextResponse.json({ error: "Server admin key is not configured." }, { status: 500 });

  const token = getBearerToken(request);
  if (!token) return NextResponse.json({ error: "Missing authorization token." }, { status: 401 });

  const {
    data: { user: requester },
    error: requesterError,
  } = await admin.auth.getUser(token);
  if (requesterError || !requester) return NextResponse.json({ error: "Invalid authorization token." }, { status: 401 });

  if (!isJsonRequest(request)) return NextResponse.json({ error: "Content-Type must be application/json." }, { status: 415 });
  if (isBodyTooLarge(request, 16_384)) return NextResponse.json({ error: "Request body is too large." }, { status: 413 });

  const body = await request.json().catch(() => ({}));
  const status = ALLOWED_STATUSES.has(body.status) ? body.status : "";
  if (!body.task_id || !status) return NextResponse.json({ error: "Task id and valid status are required." }, { status: 400 });

  const [{ data: reviewer }, { data: task }, { data: submission }] = await Promise.all([
    admin.from("profiles").select("id, role, domain, batch_id").eq("id", requester.id).single(),
    admin.from("tasks").select("*").eq("id", body.task_id).single(),
    body.submission_id
      ? admin.from("task_submissions").select("*, intern:profiles!task_submissions_intern_id_fkey(*)").eq("id", body.submission_id).maybeSingle()
      : admin.from("task_submissions").select("*, intern:profiles!task_submissions_intern_id_fkey(*)").eq("task_id", body.task_id).order("submitted_at", { ascending: false }).limit(1).maybeSingle(),
  ]);

  if (!reviewer || !task) return NextResponse.json({ error: "Task or reviewer not found." }, { status: 404 });

  const submitter = submission?.intern || null;
  const isTlReview = reviewer.role === "team_leader"
    && submitter?.role === "intern"
    && submitter.batch_id === reviewer.batch_id
    && task.batch_id === reviewer.batch_id;
  const isMentorReview = reviewer.role === "mentor"
    && (
      task.assigned_by === requester.id
      || task.batch_id === reviewer.batch_id
      || submitter?.assigned_mentor_id === requester.id
    );
  const isAdminReview = ["super_admin", "hr"].includes(reviewer.role);

  if (!isTlReview && !isMentorReview && !isAdminReview) {
    return NextResponse.json({ error: "You cannot review this submission." }, { status: 403 });
  }

  const review = {
    task_id: task.id,
    submission_id: submission?.id || null,
    reviewer_id: requester.id,
    review_stage: reviewer.role === "mentor" ? "mentor_review" : reviewer.role === "team_leader" ? "tl_review" : "admin_review",
    status,
    rating: Number(body.rating || 5),
    feedback: cleanText(body.feedback, 2000) || null,
  };

  const { data: savedReview, error } = await admin
    .from("task_reviews")
    .insert([review])
    .select("*, task:tasks(*), submission:task_submissions(*), reviewer:profiles(*)")
    .single();

  if (error) return NextResponse.json({ error: error.message || "Unable to save review." }, { status: 400 });

  const taskStatus = status === "changes_requested" ? "changes_requested" : status;
  const { data: updatedTask } = await admin
    .from("tasks")
    .update({ status: taskStatus, updated_at: new Date().toISOString() })
    .eq("id", task.id)
    .select()
    .single();

  await admin.from("audit_logs").insert([{
    actor_id: requester.id,
    actor_role: reviewer.role,
    action: "task.review",
    entity_type: "task",
    entity_id: task.id,
    summary: `Reviewed task as ${status}`,
    metadata: { submission_id: submission?.id || null, review_id: savedReview.id },
  }]);

  return NextResponse.json({ review: savedReview, task: updatedTask || { ...task, status: taskStatus } });
}
