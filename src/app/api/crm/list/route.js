import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const CRM_READ_ROLES = new Set([
  "super_admin",
  "admin",
  "hr",
  "sales_head",
  "sales_executive",
  "telecaller",
  "finance_head",
  "support_head",
]);

const ARCHIVED_LEAD_STATUSES = ["Converted", "Lost", "Archived", "Closed Won"];

function normalizeRole(profile = {}) {
  if (profile.role && profile.role !== "intern") return profile.role;
  const designation = String(profile.designation || "").toLowerCase();
  const domain = String(profile.domain || "").toLowerCase();
  if (designation === "sales head" || (domain === "sales" && designation.includes("head"))) return "sales_head";
  if (designation === "sales executive") return "sales_executive";
  if (designation === "telecaller") return "telecaller";
  if (designation === "finance head") return "finance_head";
  if (designation === "support head") return "support_head";
  return profile.role || "";
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

function getBearerToken(request) {
  const header = request.headers.get("authorization") || "";
  return header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
}

function clampPageSize(value, fallback = 50, max = 200) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, max);
}

function toPostgrestInList(values = []) {
  return `(${values.map((value) => `"${String(value).replace(/"/g, '\\"')}"`).join(",")})`;
}

async function getRequester(admin, request) {
  const token = getBearerToken(request);
  if (!token) return null;
  const { data: { user }, error } = await admin.auth.getUser(token);
  if (error || !user) return null;
  const { data: profile } = await admin
    .from("profiles")
    .select("id, role, designation, domain")
    .eq("id", user.id)
    .maybeSingle();
  const role = normalizeRole(profile);
  if (!CRM_READ_ROLES.has(role)) return null;
  return { user, profile };
}

async function getPipelineLeadIds(admin) {
  const { data } = await admin
    .from("deals")
    .select("lead_id")
    .not("lead_id", "is", null);
  return [...new Set((data || []).map((deal) => deal.lead_id).filter(Boolean))];
}

function applySearch(query, table, search) {
  const value = String(search || "").trim();
  if (!value) return query;
  const like = `%${value.replace(/[%_,]/g, (match) => `\\${match}`)}%`;
  const fields = {
    leads: ["name", "phone", "email", "service", "source", "city", "state"],
    deals: ["title", "service", "notes", "loss_reason"],
    sales_followups: ["title", "channel", "status", "notes"],
    sales_meetings: ["title", "meeting_type", "status", "agenda", "outcome", "next_action"],
  }[table] || [];
  return fields.length ? query.or(fields.map((field) => `${field}.ilike.${like}`).join(",")) : query;
}

export async function GET(request) {
  const admin = getAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Server admin key is not configured." }, { status: 500 });
  }

  const requester = await getRequester(admin, request);
  if (!requester) {
    return NextResponse.json({ error: "Unauthorized CRM access." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const resource = searchParams.get("resource") || "leads";
  const pageSize = clampPageSize(searchParams.get("pageSize"), 50);
  const page = Math.max(Number.parseInt(searchParams.get("page") || "1", 10) || 1, 1);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  if (resource === "leads_summary") {
    let qTotal = admin.from("leads").select("id", { count: "exact", head: true });
    let qConverted = admin.from("leads").select("id", { count: "exact", head: true }).in("status", ["Converted", "Closed Won"]);
    let qLost = admin.from("leads").select("id", { count: "exact", head: true }).eq("status", "Lost");
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";
    if (dateFrom) {
      qTotal = qTotal.gte("created_at", dateFrom);
      qConverted = qConverted.gte("created_at", dateFrom);
      qLost = qLost.gte("created_at", dateFrom);
    }
    if (dateTo) {
      qTotal = qTotal.lte("created_at", dateTo);
      qConverted = qConverted.lte("created_at", dateTo);
      qLost = qLost.lte("created_at", dateTo);
    }
    const [resTotal, resConverted, resLost] = await Promise.all([qTotal, qConverted, qLost]);
    return NextResponse.json({
      total: resTotal.count || 0,
      converted: resConverted.count || 0,
      lost: resLost.count || 0,
    });
  }

  const configs = {
    leads: { table: "leads", order: "created_at", ascending: false, dateField: "created_at" },
    deals: { table: "deals", order: "created_at", ascending: false, dateField: "created_at" },
    sales_followups: { table: "sales_followups", order: "due_at", ascending: true, dateField: "due_at" },
    sales_meetings: { table: "sales_meetings", order: "scheduled_at", ascending: true, dateField: "scheduled_at" },
  };
  const config = configs[resource];
  if (!config) {
    return NextResponse.json({ error: "Unsupported CRM resource." }, { status: 400 });
  }

  let query = admin
    .from(config.table)
    .select("*", { count: "exact" })
    .order(config.order, { ascending: config.ascending });

  const status = searchParams.get("status") || "";
  if (resource === "leads" && status === "active") {
    const pipelineLeadIds = await getPipelineLeadIds(admin);
    query = query.not("status", "in", toPostgrestInList(ARCHIVED_LEAD_STATUSES));
    if (pipelineLeadIds.length > 0) {
      query = query.not("id", "in", toPostgrestInList(pipelineLeadIds));
    }
  } else if (resource === "leads" && status === "archived") {
    const pipelineLeadIds = await getPipelineLeadIds(admin);
    const filters = [`status.in.${toPostgrestInList(ARCHIVED_LEAD_STATUSES)}`];
    if (pipelineLeadIds.length > 0) filters.push(`id.in.${toPostgrestInList(pipelineLeadIds)}`);
    query = query.or(filters.join(","));
  } else if (resource === "leads" && status === "converted") {
    query = query.in("status", ["Converted", "Closed Won"]);
  } else if (resource === "leads" && status === "lost") {
    query = query.eq("status", "Lost");
  } else if (resource === "leads" && status === "pipeline") {
    const pipelineLeadIds = await getPipelineLeadIds(admin);
    if (pipelineLeadIds.length > 0) {
      query = query.in("id", pipelineLeadIds);
    } else {
      query = query.in("status", ["Contacted", "Qualified", "Proposal Sent", "In Pipeline", "Negotiation"]);
    }
  } else if (resource === "leads" && (status === "all" || !status)) {
    // no status filter
  } else if (resource === "deals") {
    const stage = searchParams.get("stage") || "";
    if (stage && stage !== "all") query = query.eq("pipeline_stage", stage);
  } else if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";
  if (dateFrom) query = query.gte(config.dateField, dateFrom);
  if (dateTo) query = query.lte(config.dateField, dateTo);

  query = applySearch(query, resource, searchParams.get("search") || "");
  const { data, error, count } = await query.range(from, to);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    data: data || [],
    count: count || 0,
    page,
    pageSize,
  });
}
