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

export async function GET(request) {
  const ip = getClientIp(request);
  const limited = await checkApiRateLimit(`task-submissions:${ip}`, { limit: 60, windowMs: 60_000 });
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

  const { data: profile } = await admin
    .from("profiles")
    .select("id, role, batch_id")
    .eq("id", requester.id)
    .single();

  const role = profile?.role || "";
  if (!role) return NextResponse.json({ error: "Profile not found." }, { status: 404 });

  const { data: submissions, error } = await admin
    .from("task_submissions")
    .select("*, task:tasks(*), intern:profiles!task_submissions_intern_id_fkey(*)")
    .order("submitted_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message || "Unable to load submissions." }, { status: 400 });

  const visible = (submissions || []).filter((submission) => {
    const task = submission.task || {};
    const intern = submission.intern || {};
    if (submission.intern_id === requester.id) return true;
    if (["super_admin", "hr"].includes(role)) return true;
    if (role === "team_leader") {
      return intern.role === "intern" && intern.batch_id === profile.batch_id && task.batch_id === profile.batch_id;
    }
    if (role === "mentor") {
      return task.assigned_by === requester.id || task.batch_id === profile.batch_id || intern.assigned_mentor_id === requester.id;
    }
    return false;
  });

  return NextResponse.json({ submissions: visible });
}
