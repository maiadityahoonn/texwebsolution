import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { getBearerToken, getClientIp, isBodyTooLarge, isJsonRequest } from "@/lib/apiSecurity";

const ALLOWED_STATUSES = new Set(["pending", "in_progress", "submitted", "reviewed", "approved", "changes_requested", "rejected"]);
const INTERN_STATUSES = new Set(["in_progress", "submitted"]);

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
  const limited = await checkApiRateLimit(`task-status:${ip}`, { limit: 60, windowMs: 60_000 });
  if (!limited.allowed) {
    return NextResponse.json(rateLimitResponse(limited), { status: 429 });
  }

  const admin = getAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Server admin key is not configured." }, { status: 500 });
  }

  const token = getBearerToken(request);
  if (!token) {
    return NextResponse.json({ error: "Missing authorization token." }, { status: 401 });
  }

  const {
    data: { user: requester },
    error: requesterError,
  } = await admin.auth.getUser(token);

  if (requesterError || !requester) {
    return NextResponse.json({ error: "Invalid authorization token." }, { status: 401 });
  }

  if (!isJsonRequest(request)) {
    return NextResponse.json({ error: "Content-Type must be application/json." }, { status: 415 });
  }
  if (isBodyTooLarge(request, 4096)) {
    return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
  }

  const body = await request.json().catch(() => ({}));
  const taskId = body.task_id;
  const status = body.status;
  if (!taskId || !ALLOWED_STATUSES.has(status)) {
    return NextResponse.json({ error: "Valid task id and status are required." }, { status: 400 });
  }

  const [{ data: requesterProfile }, { data: task }] = await Promise.all([
    admin.from("profiles").select("role").eq("id", requester.id).single(),
    admin.from("tasks").select("id, assigned_by, assigned_to, status").eq("id", taskId).single(),
  ]);

  if (!task) {
    return NextResponse.json({ error: "Task not found." }, { status: 404 });
  }

  const role = requesterProfile?.role || "";
  const isAdminish = ["super_admin", "hr"].includes(role);
  const isCreator = task.assigned_by === requester.id;
  const isAssignedIntern = role === "intern" && task.assigned_to === requester.id && INTERN_STATUSES.has(status);
  if (!isAdminish && !isCreator && !isAssignedIntern) {
    return NextResponse.json({ error: "You cannot update this task status." }, { status: 403 });
  }

  const { data: saved, error } = await admin
    .from("tasks")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", taskId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Unable to update task status." }, { status: 400 });
  }

  await admin.from("audit_logs").insert([{
    actor_id: requester.id,
    actor_role: role,
    action: "task.status",
    entity_type: "task",
    entity_id: taskId,
    summary: `Changed task status to ${status}`,
    metadata: { old_status: task.status, new_status: status },
  }]);

  return NextResponse.json({ task: saved });
}
