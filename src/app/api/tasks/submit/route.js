import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { cleanText, getBearerToken, getClientIp, isBodyTooLarge, isJsonRequest } from "@/lib/apiSecurity";
import { safeExternalUrl } from "@/lib/safeUrl";

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
  const limited = await checkApiRateLimit(`task-submit:${ip}`, { limit: 40, windowMs: 60_000 });
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
  if (!body.task_id) return NextResponse.json({ error: "Task id is required." }, { status: 400 });

  const [{ data: profile }, { data: task }] = await Promise.all([
    admin.from("profiles").select("id, role, domain, batch_id").eq("id", requester.id).single(),
    admin.from("tasks").select("id, assigned_to, assigned_by, batch_id, visible_to_interns, status, deadline").eq("id", body.task_id).single(),
  ]);

  if (!profile || !task) return NextResponse.json({ error: "Task or profile not found." }, { status: 404 });

  const canSubmitDirect = task.assigned_to === requester.id;
  const canSubmitBatchIntern = profile.role === "intern" && task.visible_to_interns && task.batch_id === profile.batch_id;
  if (!canSubmitDirect && !canSubmitBatchIntern) {
    return NextResponse.json({ error: "You cannot submit this task." }, { status: 403 });
  }

  if (["submitted", "reviewed", "approved"].includes(task.status)) {
    return NextResponse.json({ error: "This task is already submitted and locked for review." }, { status: 409 });
  }

  if (task.deadline && new Date(task.deadline).getTime() < Date.now()) {
    return NextResponse.json({ error: "Task deadline is over. Submission is locked." }, { status: 403 });
  }

  const payload = {
    task_id: task.id,
    intern_id: requester.id,
    submission_url: body.submission_url ? safeExternalUrl(body.submission_url, "") || null : null,
    notes: cleanText(body.notes, 2000) || null,
    file_url: body.file_url || null,
    file_name: body.file_name || null,
    file_type: body.file_type || null,
    file_size: body.file_size || null,
  };

  if (!payload.submission_url && !payload.file_url && !payload.notes) {
    return NextResponse.json({ error: "Add a URL, file or notes before submitting." }, { status: 400 });
  }

  const { data: submission, error } = await admin
    .from("task_submissions")
    .insert([payload])
    .select("*, task:tasks(*), intern:profiles!task_submissions_intern_id_fkey(*)")
    .single();

  if (error) return NextResponse.json({ error: error.message || "Unable to submit task." }, { status: 400 });

  const { data: updatedTask } = await admin
    .from("tasks")
    .update({ status: "submitted", updated_at: new Date().toISOString() })
    .eq("id", task.id)
    .select()
    .single();

  await admin.from("audit_logs").insert([{
    actor_id: requester.id,
    actor_role: profile.role,
    action: "task.submit",
    entity_type: "task_submission",
    entity_id: submission.id,
    summary: `Submitted task work`,
    metadata: { task_id: task.id },
  }]);

  return NextResponse.json({ submission, task: updatedTask || { ...task, status: "submitted" } });
}
