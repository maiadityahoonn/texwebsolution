import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { cacheGetJson, cacheSetJson } from "@/lib/upstashCache";
import { isPrimaryCrmUser } from "@/lib/crmAccess";
import { applyLeadCategoryFilter, buildLeadDealScopes } from "@/services/crm/leadCategoryFilters";

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

async function getLeadDealScopes(admin) {
  const { data } = await admin
    .from("deals")
    .select("lead_id, pipeline_stage")
    .not("lead_id", "is", null);
  return buildLeadDealScopes(data || []);
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
    proposals: ["title", "status", "scope_of_work", "deliverables"],
    quotations: ["quotation_number", "notes", "status"],
    agreements: ["agreement_number", "title", "status", "notes"],
    invoices: ["invoice_number", "title", "status", "notes"],
    clients: ["name", "email", "phone", "company_name"],
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

    const applyLeadDates = (q) => {
      if (dateFrom) q = q.gte("created_at", dateFrom);
      if (dateTo) q = q.lte("created_at", dateTo);
      return q;
    };

    const scopes = await getLeadDealScopes(admin);
    const countCategory = (category) => applyLeadDates(
      applyLeadCategoryFilter(
        admin.from("leads").select("*", { count: "exact", head: true }),
        category,
        scopes
      )
    );
    const [
      { count: totalCount },
      { count: activeCount },
      { count: pipelineCount },
      { count: convertedCount },
      { count: lostCount },
    ] = await Promise.all([
      applyLeadDates(admin.from("leads").select("*", { count: "exact", head: true })),
      countCategory("active"),
      countCategory("pipeline"),
      countCategory("converted"),
      countCategory("lost"),
    ]);

    const total = totalCount || 0;
    const active = activeCount || 0;
    const pipeline = pipelineCount || 0;
    const converted = convertedCount || 0;
    const lost = lostCount || 0;

    const summary = {
      total,
      active,
      pipeline,
      converted,
      lost,
    };
    await cacheSetJson(cacheKey, summary, 60);
    return NextResponse.json(summary);
  }

  if (resource === "deals_summary") {
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";
    const isFresh = searchParams.get("fresh") === "true" || searchParams.get("force") === "true";
    const cacheKey = dateFrom || dateTo
      ? `crm:deals-summary:${dateFrom || "start"}:${dateTo || "end"}`
      : "crm:deals-summary:all";
    if (!isFresh) {
      const cached = await cacheGetJson(cacheKey);
      if (cached) return NextResponse.json(cached);
    }

    const applyDealDates = (q) => {
      if (dateFrom && dateTo) {
        return q.or(`and(created_at.gte.${dateFrom},created_at.lte.${dateTo}),and(updated_at.gte.${dateFrom},updated_at.lte.${dateTo})`);
      } else if (dateFrom) {
        return q.or(`created_at.gte.${dateFrom},updated_at.gte.${dateFrom}`);
      } else if (dateTo) {
        return q.or(`created_at.lte.${dateTo},updated_at.lte.${dateTo}`);
      }
      return q;
    };

    const [
      { count: totalDeals },
      { count: wonDeals },
      { count: lostDeals },
      { count: openDeals },
      { data: valueRows },
    ] = await Promise.all([
      applyDealDates(admin.from("deals").select("*", { count: "exact", head: true })),
      applyDealDates(admin.from("deals").select("*", { count: "exact", head: true }).eq("pipeline_stage", "closed_won")),
      applyDealDates(admin.from("deals").select("*", { count: "exact", head: true }).eq("pipeline_stage", "closed_lost")),
      applyDealDates(admin.from("deals").select("*", { count: "exact", head: true }).not("pipeline_stage", "in", toPostgrestInList(CLOSED_PIPELINE_STAGES))),
      applyDealDates(admin.from("deals").select("deal_value, pipeline_stage")),
    ]);

    let totalValue = 0;
    let wonValue = 0;
    let lostValue = 0;
    let activeValue = 0;
    (valueRows || []).forEach((row) => {
      const val = Number(row.deal_value) || 0;
      totalValue += val;
      const stage = row.pipeline_stage || "";
      if (stage === "closed_won") wonValue += val;
      else if (stage === "closed_lost") lostValue += val;
      else if (!CLOSED_PIPELINE_STAGES.includes(stage)) activeValue += val;
    });

    const total = totalDeals || 0;
    const won = wonDeals || 0;
    const lost = lostDeals || 0;
    const active = openDeals || 0;
    const decided = won + lost;
    const winRateNumber = decided > 0 ? (won / decided) * 100 : 0;

    const summary = {
      total,
      active,
      won,
      lost,
      totalValue,
      wonValue,
      lostValue,
      activeValue,
      winRate: winRateNumber % 1 === 0 ? `${winRateNumber}%` : `${winRateNumber.toFixed(1)}%`,
    };
    await cacheSetJson(cacheKey, summary, 60);
    return NextResponse.json(summary);
  }

  if (resource === "followups_summary") {
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";
    const scope = searchParams.get("scope") || "all";
    const isFresh = searchParams.get("fresh") === "true" || searchParams.get("force") === "true";
    const cacheKey = dateFrom || dateTo
      ? `crm:followups-summary:${scope}:${dateFrom || "start"}:${dateTo || "end"}`
      : `crm:followups-summary:${scope}:all`;
    if (!isFresh) {
      const cached = await cacheGetJson(cacheKey);
      if (cached) return NextResponse.json(cached);
    }

    const nowIso = new Date().toISOString();
    const applyFollowupDates = (q) => {
      if (dateFrom && dateTo) {
        return q.or(`and(due_at.gte.${dateFrom},due_at.lte.${dateTo}),and(created_at.gte.${dateFrom},created_at.lte.${dateTo})`);
      } else if (dateFrom) {
        return q.or(`due_at.gte.${dateFrom},created_at.gte.${dateFrom}`);
      } else if (dateTo) {
        return q.or(`due_at.lte.${dateTo},created_at.lte.${dateTo}`);
      }
      return q;
    };
    const applyFollowupScope = (q) => {
      if (scope === "pipeline") return q.not("deal_id", "is", null);
      if (scope === "leads") return q.not("lead_id", "is", null).is("deal_id", null);
      return q;
    };
    const applyFollowupFilters = (q) => applyFollowupScope(applyFollowupDates(q));

    const [
      { count: totalCount },
      { count: activeCount },
      { count: overdueCount },
      { count: pendingCount },
      { count: completedCount },
      { count: missedCount },
    ] = await Promise.all([
      applyFollowupFilters(admin.from("sales_followups").select("*", { count: "exact", head: true })),
      applyFollowupFilters(admin.from("sales_followups").select("*", { count: "exact", head: true }).eq("status", "pending")),
      applyFollowupFilters(admin.from("sales_followups").select("*", { count: "exact", head: true }).eq("status", "pending").lt("due_at", nowIso)),
      applyFollowupFilters(admin.from("sales_followups").select("*", { count: "exact", head: true }).eq("status", "pending").gte("due_at", nowIso)),
      applyFollowupFilters(admin.from("sales_followups").select("*", { count: "exact", head: true }).eq("status", "done")),
      applyFollowupFilters(admin.from("sales_followups").select("*", { count: "exact", head: true }).eq("status", "missed")),
    ]);

    const summary = {
      total: totalCount || 0,
      active: activeCount || 0,
      overdue: overdueCount || 0,
      pending: pendingCount || 0,
      completed: completedCount || 0,
      missed: missedCount || 0,
    };
    await cacheSetJson(cacheKey, summary, 60);
    return NextResponse.json(summary);
  }

  if (resource === "meetings_summary") {
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";
    const isFresh = searchParams.get("fresh") === "true" || searchParams.get("force") === "true";
    const cacheKey = dateFrom || dateTo
      ? `crm:meetings-summary:${dateFrom || "start"}:${dateTo || "end"}`
      : "crm:meetings-summary:all";
    if (!isFresh) {
      const cached = await cacheGetJson(cacheKey);
      if (cached) return NextResponse.json(cached);
    }

    const nowIso = new Date().toISOString();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const applyMeetingDates = (q) => {
      if (dateFrom) q = q.gte("scheduled_at", dateFrom);
      if (dateTo) q = q.lte("scheduled_at", dateTo);
      return q;
    };

    const [
      { count: totalCount },
      { count: activeCount },
      { count: todayCount },
      { count: overdueCount },
      { count: completedCount },
      { count: noShowCount },
    ] = await Promise.all([
      applyMeetingDates(admin.from("sales_meetings").select("*", { count: "exact", head: true })),
      applyMeetingDates(admin.from("sales_meetings").select("*", { count: "exact", head: true }).in("status", ["scheduled", "confirmed"])),
      applyMeetingDates(admin.from("sales_meetings").select("*", { count: "exact", head: true }).in("status", ["scheduled", "confirmed"]).gte("scheduled_at", todayStart.toISOString()).lte("scheduled_at", todayEnd.toISOString())),
      applyMeetingDates(admin.from("sales_meetings").select("*", { count: "exact", head: true }).in("status", ["scheduled", "confirmed"]).lt("scheduled_at", nowIso)),
      applyMeetingDates(admin.from("sales_meetings").select("*", { count: "exact", head: true }).eq("status", "completed")),
      applyMeetingDates(admin.from("sales_meetings").select("*", { count: "exact", head: true }).in("status", ["no_show", "cancelled"])),
    ]);

    const summary = {
      total: totalCount || 0,
      active: activeCount || 0,
      today: todayCount || 0,
      overdue: overdueCount || 0,
      completed: completedCount || 0,
      no_show: noShowCount || 0,
    };
    await cacheSetJson(cacheKey, summary, 60);
    return NextResponse.json(summary);
  }

  if (resource === "commercials_summary") {
    const isFresh = searchParams.get("fresh") === "true" || searchParams.get("force") === "true";
    const cacheKey = "crm:commercials-summary";
    if (!isFresh) {
      const cached = await cacheGetJson(cacheKey);
      if (cached) return NextResponse.json(cached);
    }

    const [
      { count: quotationCount },
      { count: proposalCount },
      { count: agreementCount },
      { count: invoiceCount },
      { count: paidInvoiceCount },
      { count: pendingInvoiceCount },
      { data: invoiceAmounts },
    ] = await Promise.all([
      admin.from("quotations").select("*", { count: "exact", head: true }),
      admin.from("proposals").select("*", { count: "exact", head: true }),
      admin.from("agreements").select("*", { count: "exact", head: true }),
      admin.from("invoices").select("*", { count: "exact", head: true }),
      admin.from("invoices").select("*", { count: "exact", head: true }).eq("status", "paid"),
      admin.from("invoices").select("*", { count: "exact", head: true }).in("status", ["sent", "pending", "overdue"]),
      admin.from("invoices").select("total_amount, status"),
    ]);

    let totalRevenue = 0;
    let paidRevenue = 0;
    let pendingRevenue = 0;
    (invoiceAmounts || []).forEach((inv) => {
      const amt = Number(inv.total_amount) || 0;
      totalRevenue += amt;
      if (inv.status === "paid") paidRevenue += amt;
      else pendingRevenue += amt;
    });

    const summary = {
      quotations: quotationCount || 0,
      proposals: proposalCount || 0,
      agreements: agreementCount || 0,
      invoices: invoiceCount || 0,
      paidInvoices: paidInvoiceCount || 0,
      pendingInvoices: pendingInvoiceCount || 0,
      totalRevenue,
      paidRevenue,
      pendingRevenue,
    };
    await cacheSetJson(cacheKey, summary, 60);
    return NextResponse.json(summary);
  }

  const configs = {
    leads: { table: "leads", order: "created_at", ascending: false, dateField: "created_at" },
    deals: { table: "deals", order: "created_at", ascending: false, dateField: "created_at" },
    sales_followups: { table: "sales_followups", order: "due_at", ascending: true, dateField: "due_at" },
    sales_meetings: { table: "sales_meetings", order: "scheduled_at", ascending: true, dateField: "scheduled_at" },
    proposals: { table: "proposals", order: "created_at", ascending: false, dateField: "created_at" },
    quotations: { table: "quotations", order: "created_at", ascending: false, dateField: "created_at" },
    agreements: { table: "agreements", order: "created_at", ascending: false, dateField: "created_at" },
    invoices: { table: "invoices", order: "created_at", ascending: false, dateField: "created_at" },
    clients: { table: "clients", order: "created_at", ascending: false, dateField: "created_at" },
  };
  const config = configs[resource];
  if (!config) {
    return NextResponse.json({ error: "Unsupported CRM resource." }, { status: 400 });
  }

  let query = admin
    .from(config.table)
    .select("*", { count: "exact" });

  const sort = searchParams.get("sort") || "";
  if (resource === "leads" && (sort === "a-z" || sort === "z-a")) {
    query = query
      .order("name", { ascending: sort === "a-z", nullsFirst: false })
      .order("created_at", { ascending: false });
  } else if (resource === "leads" && sort === "oldest") {
    query = query.order("created_at", { ascending: true });
  } else if (resource === "sales_followups") {
    query = query
      .order("status", { ascending: false })
      .order("due_at", { ascending: true });
  } else {
    query = query.order(config.order, { ascending: config.ascending });
  }

  const status = searchParams.get("status") || "";
  if (resource === "leads" && status === "active") {
    query = applyLeadCategoryFilter(query, "active", await getLeadDealScopes(admin));
  } else if (resource === "leads" && status === "archived") {
    const pipelineLeadIds = (await getLeadDealScopes(admin)).all;
    const filters = [`status.in.${toPostgrestInList(ARCHIVED_LEAD_STATUSES)}`];
    if (pipelineLeadIds.length > 0) filters.push(`id.in.${toPostgrestInList(pipelineLeadIds)}`);
    query = query.or(filters.join(","));
  } else if (resource === "leads" && status === "converted") {
    query = applyLeadCategoryFilter(query, "converted", await getLeadDealScopes(admin));
  } else if (resource === "leads" && status === "lost") {
    query = applyLeadCategoryFilter(query, "lost", await getLeadDealScopes(admin));
  } else if (resource === "leads" && status === "pipeline") {
    query = applyLeadCategoryFilter(query, "pipeline", await getLeadDealScopes(admin));
  } else if (resource === "leads" && (status === "all" || !status)) {
    // no status filter
  } else if (resource === "deals") {
    const stage = searchParams.get("stage") || "";
    if (stage && stage !== "all") query = query.eq("pipeline_stage", stage);
  } else if (resource === "sales_followups" && status && status !== "all") {
    const nowIso = new Date().toISOString();
    if (status === "done" || status === "completed") {
      query = query.eq("status", "done");
    } else if (status === "actionable") {
      query = query.eq("status", "pending");
    } else if (status === "overdue") {
      query = query.eq("status", "pending").lt("due_at", nowIso);
    } else if (status === "pending" || status === "active") {
      query = query.eq("status", "pending").gte("due_at", nowIso);
    } else if (status === "missed") {
      query = query.eq("status", "missed");
    } else {
      query = query.eq("status", status);
    }
  } else if (resource === "sales_meetings" && status && status !== "all") {
    if (status === "today") {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      query = query.gte("scheduled_at", todayStart.toISOString()).lte("scheduled_at", todayEnd.toISOString());
    } else if (status === "no_show") {
      query = query.in("status", ["no_show", "cancelled"]);
    } else if (status === "overdue") {
      query = query.in("status", ["scheduled", "confirmed"]).lt("scheduled_at", new Date().toISOString());
    } else if (status === "completed") {
      query = query.eq("status", "completed");
    } else if (status === "scheduled" || status === "active") {
      query = query.in("status", ["scheduled", "confirmed"]);
    } else {
      query = query.eq("status", status);
    }
  } else if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const alphabet = (searchParams.get("alphabet") || "").trim();
  if (resource === "leads" && /^[a-z]$/i.test(alphabet)) {
    query = query.ilike("name", `${alphabet}%`);
  } else if (resource === "leads" && alphabet === "#") {
    for (const letter of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
      query = query.not("name", "ilike", `${letter}%`);
    }
  }

  const scope = searchParams.get("scope") || "";
  if (resource === "sales_followups" && scope === "pipeline") {
    query = query.not("deal_id", "is", null);
  } else if (resource === "sales_followups" && scope === "leads") {
    query = query.not("lead_id", "is", null).is("deal_id", null);
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
  } else if (resource === "sales_followups" && (dateFrom || dateTo)) {
    if (dateFrom && dateTo) {
      query = query.or(`and(due_at.gte.${dateFrom},due_at.lte.${dateTo}),and(created_at.gte.${dateFrom},created_at.lte.${dateTo})`);
    } else if (dateFrom) {
      query = query.or(`due_at.gte.${dateFrom},created_at.gte.${dateFrom}`);
    } else if (dateTo) {
      query = query.or(`due_at.lte.${dateTo},created_at.lte.${dateTo}`);
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
