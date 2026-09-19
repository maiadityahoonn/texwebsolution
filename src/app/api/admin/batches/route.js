import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { getBearerToken, getClientIp } from "@/lib/apiSecurity";

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

function publicProfile(profile) {
  if (!profile) return null;
  return {
    id: profile.id,
    full_name: profile.full_name,
    email: profile.email,
    role: profile.role,
    domain: profile.domain,
    batch_id: profile.batch_id,
    avatar_url: profile.avatar_url || "",
  };
}

export async function GET(request) {
  const ip = getClientIp(request);
  const limited = await checkApiRateLimit(`admin-batches:${ip}`, { limit: 60, windowMs: 60_000 });
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
    .select("id, role, domain, batch_id")
    .eq("id", requester.id)
    .single();

  const role = requesterProfile?.role || "";
  if (!["super_admin", "hr", "mentor", "team_leader", "intern"].includes(role)) {
    return NextResponse.json({ error: "You cannot view batches." }, { status: 403 });
  }

  let batchQuery = admin
    .from("batches")
    .select("*")
    .order("created_at", { ascending: false });

  if (role === "hr") {
    batchQuery = batchQuery.eq("hr_id", requester.id);
  }

  if (role === "mentor") {
    const filters = [`mentor_id.eq.${requester.id}`];
    if (requesterProfile.batch_id) filters.push(`id.eq.${requesterProfile.batch_id}`);
    batchQuery = batchQuery.or(filters.join(","));
  }

  if (role === "team_leader" || role === "intern") {
    if (!requesterProfile.batch_id) return NextResponse.json({ batches: [] });
    batchQuery = batchQuery.eq("id", requesterProfile.batch_id);
  }

  const { data: batches, error: batchError } = await batchQuery;
  if (batchError) {
    return NextResponse.json({ error: "Unable to load batches." }, { status: 400 });
  }

  const batchIds = (batches || []).map((batch) => batch.id).filter(Boolean);
  const linkedProfileIds = (batches || [])
    .flatMap((batch) => [batch.hr_id, batch.mentor_id, batch.tl_id])
    .filter(Boolean);

  const profileFilters = [];
  if (linkedProfileIds.length) profileFilters.push(`id.in.(${linkedProfileIds.join(",")})`);
  if (batchIds.length) profileFilters.push(`batch_id.in.(${batchIds.join(",")})`);
  profileFilters.push("role.in.(super_admin,admin)");

  let profiles = [];
  if (profileFilters.length) {
    const { data: profileData, error: profileError } = await admin
      .from("profiles")
      .select("id, full_name, email, role, domain, batch_id, avatar_url")
      .or(profileFilters.join(","));
    if (profileError) {
      return NextResponse.json({ error: "Unable to load batch owners." }, { status: 400 });
    }
    profiles = profileData || [];
  }

  const byId = new Map(profiles.map((profile) => [profile.id, profile]));
  const adminProfiles = profiles.filter((profile) => ["super_admin", "admin"].includes(profile.role));
  const enriched = (batches || []).map((batch) => {
    const batchProfiles = profiles.filter((profile) => profile.batch_id === batch.id);
    const mentor = byId.get(batch.mentor_id) || batchProfiles.find((profile) => profile.role === "mentor") || null;
    const tl = byId.get(batch.tl_id) || batchProfiles.find((profile) => profile.role === "team_leader") || null;
    return {
      ...batch,
      hr: publicProfile(byId.get(batch.hr_id)),
      mentor: publicProfile(mentor),
      tl: publicProfile(tl),
      admins: adminProfiles.map(publicProfile),
      members: batchProfiles.map(publicProfile),
    };
  });

  return NextResponse.json({ batches: enriched });
}

export async function PATCH(request) {
  const ip = getClientIp(request);
  const limited = await checkApiRateLimit(`admin-batches-update:${ip}`, { limit: 40, windowMs: 60_000 });
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
    .select("id, role")
    .eq("id", requester.id)
    .single();

  const body = await request.json().catch(() => ({}));
  const batchId = body.batch_id;
  if (!batchId) {
    return NextResponse.json({ error: "Missing batch id." }, { status: 400 });
  }

  const { data: batch, error: batchError } = await admin
    .from("batches")
    .select("*")
    .eq("id", batchId)
    .single();

  if (batchError || !batch) {
    return NextResponse.json({ error: "Batch not found." }, { status: 404 });
  }

  if (requesterProfile?.role === "hr") {
    if (batch.hr_id !== requester.id) {
      return NextResponse.json({ error: "You can assign mentors only for your assigned batches." }, { status: 403 });
    }

    const mentorId = body.mentor_id || null;
    let mentor = null;
    if (mentorId) {
      const { data: mentorProfile, error: mentorError } = await admin
        .from("profiles")
        .select("id, full_name, email, role, domain, batch_id, avatar_url")
        .eq("id", mentorId)
        .single();
      if (mentorError || mentorProfile?.role !== "mentor") {
        return NextResponse.json({ error: "Select a valid mentor." }, { status: 400 });
      }
      mentor = mentorProfile;
    }

    const { data: updated, error: updateError } = await admin
      .from("batches")
      .update({ mentor_id: mentorId, updated_at: new Date().toISOString() })
      .eq("id", batchId)
      .select("*")
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message || "Unable to assign mentor." }, { status: 400 });
    }

    return NextResponse.json({
      batch: {
        ...updated,
        hr: publicProfile(requesterProfile),
        mentor: publicProfile(mentor),
      },
    });
  }

  return NextResponse.json({ error: "Only assigned HR can assign batch mentors here." }, { status: 403 });
}
