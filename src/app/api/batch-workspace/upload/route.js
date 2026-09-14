import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { getBearerToken, getClientIp } from "@/lib/apiSecurity";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function POST(request) {
  const ip = getClientIp(request);
  const limited = await checkApiRateLimit(`batch-upload:${ip}`, { limit: 60, windowMs: 60_000 });
  if (!limited.allowed) return NextResponse.json(rateLimitResponse(limited), { status: 429 });

  const admin = getAdminClient();
  if (!admin) return NextResponse.json({ error: "Server admin key is not configured." }, { status: 500 });

  const token = getBearerToken(request);
  if (!token) return NextResponse.json({ error: "Missing authorization token." }, { status: 401 });

  const { data: { user }, error: authErr } = await admin.auth.getUser(token);
  if (authErr || !user) return NextResponse.json({ error: "Invalid authorization token." }, { status: 401 });

  const { data: profile } = await admin
    .from("profiles")
    .select("id, full_name, role, domain, batch_id")
    .eq("id", user.id)
    .single();

  if (!profile) return NextResponse.json({ error: "Profile not found." }, { status: 404 });

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart form data." }, { status: 400 });
  }

  const file = formData.get("file");
  const batchId = formData.get("batch_id") || "general";

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  // Allow any active member of the workspace (Admin, HR, Mentor, Team Leader, Intern) to upload chat attachments
  const validRoles = ["super_admin", "admin", "hr", "mentor", "team_leader", "intern"];
  if (!validRoles.includes(profile.role)) {
    return NextResponse.json({ error: "Unauthorized to upload files." }, { status: 403 });
  }

  const ext = file.name?.split(".").pop()?.toLowerCase() || "bin";
  const cleanBaseName = (file.name || `file.${ext}`).replace(/[^a-zA-Z0-9._-]/g, "_");
  const safePath = `${batchId}/${Date.now()}-${cleanBaseName}`;
  const contentType = file.type || "application/octet-stream";

  const arrayBuffer = await file.arrayBuffer();
  const fileBuffer = Buffer.from(arrayBuffer);

  // 1. Try 'batch-files' bucket (auto-create if missing)
  let uploadSuccess = false;
  let publicUrl = "";

  try {
    // Attempt to ensure bucket exists
    await admin.storage.createBucket("batch-files", { public: true }).catch(() => {});

    const { data: uploadData, error: uploadErr } = await admin.storage
      .from("batch-files")
      .upload(safePath, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (!uploadErr && uploadData?.path) {
      const { data: pubData } = admin.storage.from("batch-files").getPublicUrl(uploadData.path);
      if (pubData?.publicUrl) {
        publicUrl = pubData.publicUrl;
        uploadSuccess = true;
      }
    }
  } catch (err) {
    console.warn("Upload to batch-files bucket failed, attempting fallback:", err?.message);
  }

  // 2. Fallback to 'task-submissions' bucket if batch-files bucket had issues
  if (!uploadSuccess) {
    try {
      const { data: uploadData, error: uploadErr } = await admin.storage
        .from("task-submissions")
        .upload(safePath, fileBuffer, {
          contentType,
          upsert: true,
        });

      if (!uploadErr && uploadData?.path) {
        const { data: pubData } = admin.storage.from("task-submissions").getPublicUrl(uploadData.path);
        if (pubData?.publicUrl) {
          publicUrl = pubData.publicUrl;
          uploadSuccess = true;
        }
      }
    } catch (fallbackErr) {
      console.warn("Fallback upload to task-submissions failed:", fallbackErr?.message);
    }
  }

  // 3. Fallback: Base64 data URL for images / small files if storage buckets fail completely
  if (!uploadSuccess || !publicUrl) {
    if (file.size <= 4 * 1024 * 1024) {
      const base64Data = fileBuffer.toString("base64");
      publicUrl = `data:${contentType};base64,${base64Data}`;
      uploadSuccess = true;
    } else {
      return NextResponse.json({ error: "Storage service is currently unavailable for large files." }, { status: 500 });
    }
  }

  return NextResponse.json({
    file_url: publicUrl,
    file_name: file.name,
    file_type: contentType,
    file_size: file.size || fileBuffer.length,
  });
}
