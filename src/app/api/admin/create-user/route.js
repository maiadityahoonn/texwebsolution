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
const CREATION_SCOPE = {
  super_admin: new Set(["hr"]),
  hr: new Set(["mentor", "intern"]),
};

function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "https://texwebsolution.in";
  try {
    const url = new URL(raw);
    return url.origin;
  } catch {
    return "https://texwebsolution.in";
  }
}

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
  const limited = await checkApiRateLimit(`admin-create-user:${ip}`, { limit: 15, windowMs: 60_000 });
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
    .select("role")
    .eq("id", requester.id)
    .single();

  const requesterRole = requesterProfile?.role || "";
  if (!["super_admin", "hr"].includes(requesterRole)) {
    return NextResponse.json({ error: "Only Admin or HR can create workspace users." }, { status: 403 });
  }

  if (!isJsonRequest(request)) {
    return NextResponse.json({ error: "Content-Type must be application/json." }, { status: 415 });
  }
  if (isBodyTooLarge(request, 16_384)) {
    return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
  }

  const body = await request.json().catch(() => ({}));
  const email = normalizeEmail(body.email);
  const password = body.password?.trim();
  const fullName = cleanText(body.full_name, 120);
  const role = body.role || "intern";
  let domain = body.domain || "web_dev";

  if (!email || !password || !fullName) {
    return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
  }

  if (password.length < 12) {
    return NextResponse.json({ error: "Password must be at least 12 characters." }, { status: 400 });
  }

  if (!ALLOWED_ROLES.has(role) || !ALLOWED_DOMAINS.has(domain)) {
    return NextResponse.json({ error: "Invalid role or domain." }, { status: 400 });
  }

  if (!CREATION_SCOPE[requesterRole]?.has(role)) {
    return NextResponse.json({ error: "This role cannot be created by your account." }, { status: 403 });
  }

  if (requesterRole === "super_admin" && role === "hr") {
    domain = "management";
  }

  let selectedBatch = null;
  if (requesterRole === "hr") {
    if (!body.batch_id) {
      return NextResponse.json({ error: "HR must select an assigned batch before creating mentors or interns." }, { status: 400 });
    }
    const { data: batch, error: batchError } = await admin
      .from("batches")
      .select("id, name, domain, hr_id, mentor_id")
      .eq("id", body.batch_id)
      .single();
    if (batchError || !batch || batch.hr_id !== requester.id) {
      return NextResponse.json({ error: "This batch is not assigned to your HR account." }, { status: 403 });
    }
    selectedBatch = batch;
    domain = batch.domain;
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role,
      domain,
    },
  });

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 400 });
  }

  const userId = created.user.id;
  const assignmentFields = requesterRole === "hr"
    ? {
        batch_id: selectedBatch.id,
        batch_name: selectedBatch.name,
        assigned_tl_id: body.assigned_tl_id || null,
        assigned_mentor_id: role === "intern" ? selectedBatch.mentor_id || body.assigned_mentor_id || null : null,
      }
    : {
        batch_id: null,
        batch_name: null,
        assigned_tl_id: null,
        assigned_mentor_id: null,
      };
  const profilePayload = {
    id: userId,
    full_name: fullName,
    email,
    phone: cleanPhone(body.phone) || null,
    role,
    domain,
    status: "active",
    ...assignmentFields,
  };

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .upsert(profilePayload, { onConflict: "id" })
    .select()
    .single();

  if (profileError) {
    await admin.auth.admin.deleteUser(userId).catch(() => {});
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  if (requesterRole === "hr" && (body.batch_id || body.assigned_tl_id || body.assigned_mentor_id)) {
    await admin.from("member_assignments").insert([
      {
        member_id: userId,
        batch_id: body.batch_id || null,
        tl_id: body.assigned_tl_id || null,
        mentor_id: body.assigned_mentor_id || null,
        domain,
        assigned_by: requester.id,
      },
    ]);
  }

  if (requesterRole === "hr" && role === "mentor" && selectedBatch?.id) {
    await admin
      .from("batches")
      .update({ mentor_id: userId, updated_at: new Date().toISOString() })
      .eq("id", selectedBatch.id);
  }

  await admin.from("audit_logs").insert([{
    actor_id: requester.id,
    actor_role: requesterRole,
    action: "user.create",
    entity_type: "profile",
    entity_id: userId,
    summary: `Created ${role} account for ${fullName}`,
    metadata: { email, domain, role },
  }]);

  const { data: setupLinkData, error: setupLinkError } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: {
      redirectTo: `${getSiteUrl()}/login`,
    },
  });

  return NextResponse.json({
    user: created.user,
    profile,
    setup_link: setupLinkData?.properties?.action_link || "",
    setup_link_error: setupLinkError?.message || "",
  });
}
