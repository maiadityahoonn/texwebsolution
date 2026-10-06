import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { cleanText, getClientIp } from "@/lib/apiSecurity";

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
  const limited = await checkApiRateLimit(`client-portal:${ip}`, { limit: 60, windowMs: 60_000 });
  if (!limited.allowed) {
    return NextResponse.json(rateLimitResponse(limited), { status: 429 });
  }

  const admin = getAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Client portal is not configured." }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const token = cleanText(searchParams.get("token"), 160);
  if (!token || token.length < 24) {
    return NextResponse.json({ error: "Invalid client portal link." }, { status: 400 });
  }

  const { data: client, error: clientError } = await admin
    .from("clients")
    .select("*")
    .eq("portal_token", token)
    .eq("portal_enabled", true)
    .single();

  if (clientError || !client) {
    return NextResponse.json({ error: "Client portal link is invalid or disabled." }, { status: 404 });
  }

  await admin
    .from("clients")
    .update({ portal_last_opened_at: new Date().toISOString() })
    .eq("id", client.id);

  const [projectsRes, invoicesRes, ticketsRes, smmRes] = await Promise.all([
    admin
      .from("projects")
      .select("id, name, description, status, priority, budget, start_date, target_date, completed_at, live_url, staging_url, created_at, tech_lead:profiles!projects_tech_lead_id_fkey(id, full_name, designation)")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false }),
    admin
      .from("invoices")
      .select("id, invoice_number, title, amount, tax_amount, total_amount, due_date, status, milestone_type, notes, pdf_url, created_at")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false }),
    admin
      .from("support_tickets")
      .select("id, ticket_number, project_id, subject, description, priority, status, resolution_notes, sla_deadline, resolved_at, created_at")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false }),
    admin
      .from("smm_clients")
      .select("id, package_tier, monthly_fee, target_audience, social_handles, status, created_at, content_calendar(id, title, platform, content_type, scheduled_at, status, client_feedback, published_at)")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false }),
  ]);

  return NextResponse.json({
    client,
    projects: projectsRes.data || [],
    invoices: invoicesRes.data || [],
    supportTickets: ticketsRes.data || [],
    smmClients: smmRes.data || [],
  });
}

