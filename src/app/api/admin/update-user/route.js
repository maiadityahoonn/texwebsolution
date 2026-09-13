import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { cleanPhone, cleanText, getBearerToken, getClientIp, isBodyTooLarge, isJsonRequest, isValidEmail, normalizeEmail } from "@/lib/apiSecurity";

const ALLOWED_ROLES = new Set(["intern", "team_leader", "mentor", "hr", "super_admin"]);
const ALLOWED_DOMAINS = new Set([
  "web_dev",
  "frontend_dev",
  "backend_dev",
  "telecaller",
  "sales_executive",
  "sales",
  "script_writing",
  "video_editing",
  "marketing",
  "digital_marketing",
  "ai_automation",
  "design",
  "management",
]);
const ALLOWED_STATUSES = new Set(["active", "pending", "paused", "completed", "suspended"]);
const MANAGEMENT_SCOPE = {
  super_admin: new Set(["hr"]),
  hr: new Set(["mentor", "intern"]),
  mentor: new Set(["intern"]),
};

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
  const limited = await checkApiRateLimit(`admin-update-user:${ip}`, { limit: 30, windowMs: 60_000 });
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

  const { data: requesterProfile } = await admin
    .from("profiles")
    .select("role, domain, batch_id")
    .eq("id", requester.id)
    .single();

  const requesterRole = requesterProfile?.role || "";
  if (!["super_admin", "hr", "mentor"].includes(requesterRole)) {
    return NextResponse.json({ error: "Only Admin, HR or Mentor can update workspace users." }, { status: 403 });
  }

  if (!isJsonRequest(request)) {
    return NextResponse.json({ error: "Content-Type must be application/json." }, { status: 415 });
  }
  if (isBodyTooLarge(request, 16_384)) {
    return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
  }

  const body = await request.json().catch(() => ({}));
  const userId = body.id;
  if (!userId) {
    return NextResponse.json({ error: "User id is required." }, { status: 400 });
  }

  const { data: targetProfile } = await admin
    .from("profiles")
    .select("role, domain, batch_id, batch_name, assigned_mentor_id")
    .eq("id", userId)
    .single();

  if (!targetProfile || !MANAGEMENT_SCOPE[requesterRole]?.has(targetProfile.role)) {
    return NextResponse.json({ error: "This account is outside your management scope." }, { status: 403 });
  }

  if (body.role && !MANAGEMENT_SCOPE[requesterRole]?.has(body.role)) {
    if (!(requesterRole === "mentor" && targetProfile.role === "intern" && body.role === "team_leader")) {
      return NextResponse.json({ error: "This role cannot be assigned by your account." }, { status: 403 });
    }
  }

  let selectedBatch = null;
  if (requesterRole === "hr" && body.batch_id) {
    const { data: batch, error: batchError } = await admin
      .from("batches")
      .select("id, name, domain, hr_id")
      .eq("id", body.batch_id)
      .single();
    if (batchError || !batch || batch.hr_id !== requester.id) {
      return NextResponse.json({ error: "This batch is not assigned to your HR account." }, { status: 403 });
    }
    selectedBatch = batch;
    body.domain = batch.domain;
    body.batch_name = batch.name;
  }

  let mentorPromoteBatch = null;
  if (requesterRole === "mentor") {
    const mentorForbiddenFields = ["full_name", "email", "phone", "status", "password", "assigned_tl_id"];
    if (mentorForbiddenFields.some((field) => Object.prototype.hasOwnProperty.call(body, field))) {
      return NextResponse.json({ error: "Mentor can only assign TL from batch interns." }, { status: 403 });
    }
    if (targetProfile.role !== "intern" || body.role !== "team_leader" || !body.promote_to_tl_for_batch_id) {
      return NextResponse.json({ error: "Mentor can only promote a batch intern to Team Leader." }, { status: 403 });
    }
    const { data: batch, error: batchError } = await admin
      .from("batches")
      .select("id, name, domain, mentor_id")
      .eq("id", body.promote_to_tl_for_batch_id)
      .single();
    const requesterOwnsBatch = batch.mentor_id === requester.id
      || (requesterProfile?.batch_id === batch.id && requesterProfile?.domain === batch.domain);
    if (
      batchError ||
      !batch ||
      !requesterOwnsBatch ||
      targetProfile.batch_id !== batch.id ||
      targetProfile.domain !== batch.domain
    ) {
      return NextResponse.json({ error: "This intern is not inside your assigned mentor batch." }, { status: 403 });
    }
    mentorPromoteBatch = batch;
    body.domain = batch.domain;
    body.batch_id = batch.id;
    body.batch_name = batch.name;
    body.assigned_mentor_id = requester.id;
  }

  if (
    requesterRole === "super_admin"
    && (body.batch_id || body.batch_name || body.assigned_tl_id || body.assigned_mentor_id)
  ) {
    return NextResponse.json({ error: "Admin can manage HR/Mentor accounts only. Batch and TL assignments belong to HR." }, { status: 403 });
  }

  const hasField = (field) => Object.prototype.hasOwnProperty.call(body, field);
  if (
    (hasField("role") && !ALLOWED_ROLES.has(body.role))
    || (hasField("domain") && !ALLOWED_DOMAINS.has(body.domain))
    || (hasField("status") && !ALLOWED_STATUSES.has(body.status))
  ) {
    return NextResponse.json({ error: "Invalid role, domain or status." }, { status: 400 });
  }

  if (hasField("email") && !isValidEmail(normalizeEmail(body.email))) {
    return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
  }

  if (hasField("full_name") && !cleanText(body.full_name, 120)) {
    return NextResponse.json({ error: "Name cannot be empty." }, { status: 400 });
  }

  if (body.password?.trim() && body.password.trim().length < 12) {
    return NextResponse.json({ error: "Password must be at least 12 characters." }, { status: 400 });
  }

  const allowedProfileFields = [
    "full_name",
    "email",
    "phone",
    "role",
    "domain",
    "status",
    "batch_id",
    "batch_name",
    "assigned_tl_id",
    "assigned_mentor_id",
  ];

  const profilePayload = allowedProfileFields.reduce((payload, field) => {
    if (hasField(field)) {
      if (field === "email") payload[field] = normalizeEmail(body[field]) || null;
      else if (field === "phone") payload[field] = cleanPhone(body[field]) || null;
      else if (field === "full_name") payload[field] = cleanText(body[field], 120) || null;
      else payload[field] = body[field] || null;
    }
    return payload;
  }, {});

  if (requesterRole === "mentor") {
    Object.keys(profilePayload).forEach((field) => {
      if (!["role", "domain", "batch_id", "batch_name", "assigned_mentor_id"].includes(field)) {
        delete profilePayload[field];
      }
    });
  }

  if (Object.keys(profilePayload).length === 0 && !body.password?.trim()) {
    return NextResponse.json({ error: "No valid fields provided for update." }, { status: 400 });
  }

  if (body.email?.trim()) {
    const { error: emailError } = await admin.auth.admin.updateUserById(userId, {
      email: normalizeEmail(body.email),
      email_confirm: true,
    });
    if (emailError) {
      return NextResponse.json({ error: emailError.message }, { status: 400 });
    }
  }

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .update(profilePayload)
    .eq("id", userId)
    .select()
    .single();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  if (body.password?.trim()) {
    const { error: passwordError } = await admin.auth.admin.updateUserById(userId, {
      password: body.password.trim(),
    });
    if (passwordError) {
      return NextResponse.json({ error: passwordError.message }, { status: 400 });
    }
  }

  if (body.batch_id || body.assigned_tl_id || body.assigned_mentor_id) {
    await admin.from("member_assignments").upsert({
      member_id: userId,
      batch_id: body.batch_id || null,
      tl_id: body.assigned_tl_id || null,
      mentor_id: body.assigned_mentor_id || null,
      domain: body.domain || profile.domain,
      assigned_by: requester.id,
    }, { onConflict: "member_id" });
  }

  if (mentorPromoteBatch) {
    const oldTlId = mentorPromoteBatch.tl_id;
    if (oldTlId && oldTlId !== userId) {
      // Revert previous TL back to intern
      await admin
        .from("profiles")
        .update({ role: "intern", updated_at: new Date().toISOString() })
        .eq("id", oldTlId);

      // Close previous TL history record if any
      await admin
        .from("batch_assignment_history")
        .update({ ended_at: new Date().toISOString() })
        .eq("batch_id", mentorPromoteBatch.id)
        .eq("assignment_type", "team_leader")
        .eq("member_id", oldTlId)
        .is("ended_at", null);
    }

    await admin
      .from("batches")
      .update({ mentor_id: requester.id, tl_id: userId, updated_at: new Date().toISOString() })
      .eq("id", mentorPromoteBatch.id);

    // Record new TL assignment in batch_assignment_history
    await admin.from("batch_assignment_history").insert([{
      batch_id: mentorPromoteBatch.id,
      assignment_type: "team_leader",
      old_user_id: oldTlId || null,
      new_user_id: userId,
      member_id: userId,
      started_at: new Date().toISOString(),
      changed_by: requester.id,
      note: oldTlId && oldTlId !== userId ? "Mentor replaced Team Leader" : "Mentor assigned Team Leader",
    }]);
  }

  await admin.from("audit_logs").insert([{
    actor_id: requester.id,
    actor_role: requesterRole,
    action: "user.update",
    entity_type: "profile",
    entity_id: userId,
    summary: `Updated workspace member ${profile.full_name || userId}`,
    metadata: { changed_fields: Object.keys(profilePayload), password_changed: Boolean(body.password?.trim()) },
  }]);

  return NextResponse.json({ profile });
}
