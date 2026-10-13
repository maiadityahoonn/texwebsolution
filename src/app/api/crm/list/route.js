import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { cacheGetJson, cacheSetJson } from "@/lib/upstashCache";
import { isPrimaryCrmUser } from "@/lib/crmAccess";

const CRM_READ_ROLES = new Set([
  "sales_head",
]);

const ARCHIVED_LEAD_STATUSES = ["Converted", "Lost", "Archived", "Closed Won"];

const CLOSED_PIPELINE_STAGES = ["closed_won", "closed_lost", "lost", "abandoned", "dropped"];

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

function clampPageSize(value, fallback = 50, max = 500) {
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
  if (!isPrimaryCrmUser(profile || {}, user)) return null;
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
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";
    const isFresh = searchParams.get("fresh") === "true" || searchParams.get("force") === "true";
    const cacheKey = dateFrom || dateTo
      ? `crm:leads-summary:${dateFrom || "start"}:${dateTo || "end"}`
      : "crm:leads-summary:all";
    if (!isFresh) {
      const cached = await cacheGetJson(cacheKey);
      if (cached) return NextResponse.json(cached);
    }

    let leadsQuery = admin.from("leads").select("id, status, created_at");
    let dealsQuery = admin.from("deals").select("id, lead_id, pipeline_stage");
    if (dateFrom) {
      leadsQuery = leadsQuery.gte("created_at", dateFrom);
    }
    if (dateTo) {
      leadsQuery = leadsQuery.lte("created_at", dateTo);
    }
    const [{ data: leadsData }, { data: dealsData }] = await Promise.all([leadsQuery, dealsQuery]);
    const leads = leadsData || [];
    const deals = dealsData || [];

    const wonDealLeadIds = new Set(
      deals
        .filter((d) => (d.pipeline_stage || d.stage) === "closed_won")
        .map((d) => d.lead_id)
        .filter(Boolean)
    );
    const activePipelineLeadIds = new Set(
      deals
        .filter((d) => !CLOSED_PIPELINE_STAGES.includes(d.pipeline_stage || d.stage))
        .map((d) => d.lead_id)
        .filter(Boolean)
    );
    const lostDealLeadIds = new Set(
      deals
        .filter((d) => (d.pipeline_stage || d.stage) === "closed_lost")
        .map((d) => d.lead_id)
        .filter(Boolean)
    );

    const convertedCount = leads.filter((l) => {
      if (wonDealLeadIds.has(l.id)) return true;
      if (activePipelineLeadIds.has(l.id) || lostDealLeadIds.has(l.id)) return false;
      return l.status === "Converted" || l.status === "Closed Won";
    }).length;

    const lostCount = leads.filter((l) => {
      if (lostDealLeadIds.has(l.id)) return true;
      if (activePipelineLeadIds.has(l.id) || wonDealLeadIds.has(l.id)) return false;
      return l.status === "Lost";
    }).length;

    const pipelineCount = leads.filter((l) => {
      if (activePipelineLeadIds.has(l.id)) return true;
      if (wonDealLeadIds.has(l.id) || lostDealLeadIds.has(l.id)) return false;
      return ["Contacted", "Qualified", "Proposal Sent", "In Pipeline", "Negotiation", "In Progress"].includes(
        l.status
      );
    }).length;

    const totalLeads = leads.length;
    const activeCount = Math.max(0, totalLeads - pipelineCount - convertedCount - lostCount);

    const summary = {
      total: totalLeads,
      active: activeCount,
      pipeline: pipelineCount,
      converted: convertedCount,
      lost: lostCount,
    };
    await cacheSetJson(cacheKey, summary, 60);
    return NextResponse.json(summary);
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
  } else if (resource === "sales_meetings" && status && status !== "all") {
    if (status === "today") {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      query = query.gte("scheduled_at", todayStart.toISOString()).lte("scheduled_at", todayEnd.toISOString());
    } else if (status === "no_show") {
      query = query.in("status", ["no_show", "cancelled"]);
    } else {
      query = query.eq("status", status);
    }
  } else if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";
  if (resource === "deals" && (dateFrom || dateTo)) {
    if (dateFrom && dateTo) {
      query = query.or(`and(created_at.gte.${dateFrom},created_at.lte.${dateTo}),and(updated_at.gte.${dateFrom},updated_at.lte.${dateTo})`);
    } else if (dateFrom) {
      query = query.or(`created_at.gte.${dateFrom},updated_at.gte.${dateFrom}`);
    } else if (dateTo) {
      query = query.or(`created_at.lte.${dateTo},updated_at.lte.${dateTo}`);
    }
  } else {
    if (dateFrom) query = query.gte(config.dateField, dateFrom);
    if (dateTo) query = query.lte(config.dateField, dateTo);
  }

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
