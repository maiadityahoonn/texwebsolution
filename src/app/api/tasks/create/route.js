import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { cleanText, getBearerToken, getClientIp, isBodyTooLarge, isJsonRequest } from "@/lib/apiSecurity";
import { safeExternalUrl } from "@/lib/safeUrl";

const ALLOWED_PRIORITIES = new Set(["low", "medium", "high", "urgent"]);
const ALLOWED_SCOPES = new Set(["tl", "intern", "both"]);

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
  const limited = await checkApiRateLimit(`task-create:${ip}`, { limit: 40, windowMs: 60_000 });
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
  if (isBodyTooLarge(request, 16_384)) {
    return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
  }

  const body = await request.json().catch(() => ({}));
  const title = cleanText(body.title, 180);
  const description = cleanText(body.description, 4000);
  const priority = ALLOWED_PRIORITIES.has(body.priority) ? body.priority : "medium";
  const assignmentScope = ALLOWED_SCOPES.has(body.assignment_scope) ? body.assignment_scope : "intern";

  if (!title || !description || !body.deadline) {
    return NextResponse.json({ error: "Title, description and deadline are required." }, { status: 400 });
  }

  const { data: requesterProfile } = await admin
    .from("profiles")
    .select("id, role, domain, batch_id")
    .eq("id", requester.id)
    .single();

  const role = requesterProfile?.role || "";
  if (!["mentor", "team_leader", "hr", "super_admin"].includes(role)) {
    return NextResponse.json({ error: "You cannot create tasks." }, { status: 403 });
  }

  const { data: batch } = body.batch_id
    ? await admin.from("batches").select("id, name, domain, mentor_id, tl_id, hr_id").eq("id", body.batch_id).maybeSingle()
    : { data: null };

  if (role === "mentor") {
    const ownsBatch = batch && (batch.mentor_id === requester.id || requesterProfile.batch_id === batch.id);
    if (!ownsBatch) {
      return NextResponse.json({ error: "Mentor can assign tasks only inside assigned batch." }, { status: 403 });
    }
    if (assignmentScope !== "intern") {
      const { data: targetProfile } = await admin
        .from("profiles")
        .select("id, role, batch_id")
        .eq("id", body.assigned_to)
        .maybeSingle();
      if (!targetProfile || targetProfile.role !== "team_leader" || targetProfile.batch_id !== batch.id) {
        return NextResponse.json({ error: "Select the assigned TL for this batch." }, { status: 403 });
      }
    }
  }

  if (role === "team_leader") {
    const { data: targetProfile } = await admin
      .from("profiles")
      .select("id, role, batch_id")
      .eq("id", body.assigned_to)
      .maybeSingle();
    if (!targetProfile || targetProfile.role !== "intern" || targetProfile.batch_id !== requesterProfile.batch_id) {
      return NextResponse.json({ error: "TL can assign tasks only to interns from their batch." }, { status: 403 });
    }
  }

  const basePayload = {
    title,
    description,
    domain: batch?.domain || body.domain || requesterProfile?.domain || "web_dev",
    assigned_by: requester.id,
    batch_id: batch?.id || body.batch_id || requesterProfile?.batch_id || null,
    reference_url: body.reference_url ? safeExternalUrl(body.reference_url, "") || null : null,
    start_date: body.start_date ? new Date(body.start_date).toISOString().slice(0, 10) : null,
    expected_output: cleanText(body.expected_output, 2000) || null,
    file_url: body.file_url || null,
    file_name: body.file_name || null,
    file_type: body.file_type || null,
    file_size: body.file_size || null,
    priority,
    deadline: new Date(body.deadline).toISOString(),
    status: "pending",
  };

  let payloads = [];

  const isSpecificIntern = body.assigned_to && body.assigned_to !== "all" && body.assigned_to !== "all_interns";

  if (role === "mentor" && batch && assignmentScope === "intern" && isSpecificIntern) {
    const { data: targetProfile } = await admin
      .from("profiles")
      .select("id, role, batch_id")
      .eq("id", body.assigned_to)
      .maybeSingle();
    if (!targetProfile || targetProfile.role !== "intern" || targetProfile.batch_id !== batch.id) {
      return NextResponse.json({ error: "Selected intern is not in this batch." }, { status: 400 });
    }
    payloads = [{
      ...basePayload,
      assigned_to: targetProfile.id,
      visible_to_interns: true,
      assignment_scope: "intern",
    }];
  } else if (role === "mentor" && batch && ["intern", "both"].includes(assignmentScope)) {
    const { data: interns, error: internsError } = await admin
      .from("profiles")
      .select("id")
      .eq("batch_id", batch.id)
      .eq("role", "intern")
      .eq("status", "active");

    if (internsError) {
      return NextResponse.json({ error: "Unable to load batch interns." }, { status: 400 });
    }
    if (!interns?.length) {
      return NextResponse.json({ error: "No active interns found in this batch." }, { status: 400 });
    }

    payloads = interns.map((intern) => ({
      ...basePayload,
      assigned_to: intern.id,
      visible_to_interns: false,
      assignment_scope: "intern",
    }));

    if (assignmentScope === "both") {
      payloads.unshift({
        ...basePayload,
        assigned_to: body.assigned_to,
        visible_to_interns: false,
        assignment_scope: "tl",
      });
    }
  } else {
    payloads = [{
      ...basePayload,
      assigned_to: body.assigned_to || null,
      visible_to_interns: Boolean(body.visible_to_interns),
      assignment_scope: assignmentScope,
    }];
  }

  const { data: tasks, error } = await admin
    .from("tasks")
    .insert(payloads)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message || "Unable to create task." }, { status: 400 });
  }

  await admin.from("audit_logs").insert([{
    actor_id: requester.id,
    actor_role: role,
    action: "task.create",
    entity_type: "task",
    entity_id: tasks?.[0]?.id || null,
    summary: `Assigned task ${title}`,
    metadata: { assignment_scope: assignmentScope, batch_id: basePayload.batch_id, created_count: tasks?.length || 0 },
  }]);

  return NextResponse.json({ task: tasks?.[0] || null, tasks: tasks || [] });
}
