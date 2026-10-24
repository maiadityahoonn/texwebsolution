"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { patchRealtimeList } from "@/components/crm/shared/realtimeListUtils";
import { getCloudLeads, getCloudLeadsSummary, getLeadsByIds } from "@/services/crm/leadsService";
import { CLOSED_PIPELINE_STAGES } from "@/components/crm/shared/leadUtils";
import { getDeals, getCloudDealsSummary } from "@/services/crm/dealsService";
import { getClients } from "@/services/crm/clientsService";
import {
  getAgreements,
  getInvoices,
  getProposals,
  getQuotations,
  getCloudCommercialsSummary,
} from "@/services/crm/documentsService";
import { getSalesFollowUps, getCloudFollowUpsSummary } from "@/services/crm/followupsService";
import { getSalesMeetings, getCloudMeetingsSummary } from "@/services/crm/meetingsService";

export function useCrmData({ sessionUserId = "", pushLiveSalesNotification } = {}) {
  const [leads, setLeads] = useState([]);
  const [leadPagination, setLeadPagination] = useState({ count: 0, page: 1, pageSize: 50, loading: false });
  const [leadSummary, setLeadSummary] = useState({ total: 0, converted: 0, lost: 0 });
  const [clients, setClients] = useState([]);
  const [deals, setDeals] = useState([]);
  const [dealPagination, setDealPagination] = useState({ count: 0, page: 1, pageSize: 100, loading: false });
  const [dealSummary, setDealSummary] = useState({ total: 0, active: 0, won: 0, lost: 0, totalValue: 0, wonValue: 0, activeValue: 0 });
  const [proposals, setProposals] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [agreements, setAgreements] = useState([]);
  const [commercialSummary, setCommercialSummary] = useState({ quotations: 0, proposals: 0, agreements: 0, invoices: 0 });
  const [salesFollowUps, setSalesFollowUps] = useState([]);
  const [engagementFollowUps, setEngagementFollowUps] = useState([]);
  const [followUpPagination, setFollowUpPagination] = useState({ count: 0, page: 1, pageSize: 50, loading: false });
  const [followUpSummary, setFollowUpSummary] = useState({ total: 0, active: 0, pending: 0, overdue: 0, completed: 0, missed: 0 });
  const [salesMeetings, setSalesMeetings] = useState([]);
  const [meetingPagination, setMeetingPagination] = useState({ count: 0, page: 1, pageSize: 50, loading: false });
  const [meetingSummary, setMeetingSummary] = useState({ total: 0, active: 0, today: 0, overdue: 0, completed: 0, no_show: 0 });
  const [invoicesList, setInvoicesList] = useState([]);
  const [crmLoading, setCrmLoading] = useState(false);
  const leadsRef = useRef([]);
  const loadedScopesRef = useRef(new Set());
  const leadRequestRef = useRef(0);
  const followUpRequestRef = useRef(0);
  const meetingRequestRef = useRef(0);

  useEffect(() => {
    leadsRef.current = leads;
  }, [leads]);


  const refreshLeadSummary = useCallback(async function refreshLeadSummary(params = {}) {
    const summary = await getCloudLeadsSummary(params);
    if (summary && typeof summary.total === "number") {
      setLeadSummary(summary);
    }
    return summary;
  }, []);

  const refreshDealSummary = useCallback(async function refreshDealSummary(params = {}) {
    const summary = await getCloudDealsSummary(params);
    if (summary && typeof summary.total === "number") {
      setDealSummary(summary);
    }
    return summary;
  }, []);

  const refreshFollowUpSummary = useCallback(async function refreshFollowUpSummary(params = {}) {
    const summary = await getCloudFollowUpsSummary(params);
    if (summary && typeof summary.total === "number") {
      setFollowUpSummary(summary);
    }
    return summary;
  }, []);

  const refreshMeetingSummary = useCallback(async function refreshMeetingSummary(params = {}) {
    const summary = await getCloudMeetingsSummary(params);
    if (summary && typeof summary.total === "number") {
      setMeetingSummary(summary);
    }
    return summary;
  }, []);

  const refreshCommercialSummary = useCallback(async function refreshCommercialSummary(params = {}) {
    const summary = await getCloudCommercialsSummary(params);
    if (summary && typeof summary.quotations === "number") {
      setCommercialSummary(summary);
    }
    return summary;
  }, []);

  const loadCrmData = useCallback(async function loadCrmData(scope = "crm", options = {}) {
    const requestedScope = scope || "crm";
    const force = Boolean(options?.force);
    if (!force && loadedScopesRef.current.has(requestedScope)) return;

    setCrmLoading(true);
    try {
      const shouldLoad = (keys) => keys.includes(requestedScope) || requestedScope === "all";
      const jobs = [];

      const addJob = (key, task) => {
        if (force || !loadedScopesRef.current.has(key)) jobs.push(task());
      };

      let fetchedLeadsBatch = [];
      let fetchedDealsBatch = [];

      if (shouldLoad(["crm", "leads", "overview", "sales_reports", "pipeline", "sales_followups", "sales_meetings"])) {
        addJob("leads", async () => {
          const [leadsRes, summaryRes] = await Promise.all([
            getCloudLeads({ page: 1, pageSize: 500, withCount: true }),
            getCloudLeadsSummary(),
          ]);
          fetchedLeadsBatch = leadsRes?.data || leadsRes || [];
          setLeads(fetchedLeadsBatch);
          if (leadsRes?.data) {
            setLeadPagination({ count: leadsRes.count || 0, page: leadsRes.page || 1, pageSize: leadsRes.pageSize || 500, loading: false });
          }
          if (summaryRes && typeof summaryRes.total === "number") {
            setLeadSummary(summaryRes);
          }
          loadedScopesRef.current.add("leads");

          // Safe background sync for next page buffer (capped at 2 pages / 1,000 records to prevent memory exhaustion at 50,000 scale)
          if (leadsRes?.count && leadsRes.count > (leadsRes.pageSize || 500)) {
            const pageSize = leadsRes.pageSize || 500;
            const totalPages = Math.ceil(leadsRes.count / pageSize);
            const maxBufferPages = Math.min(totalPages, 2);
            const remainingJobs = [];
            for (let p = 2; p <= maxBufferPages; p++) {
              remainingJobs.push(getCloudLeads({ page: p, pageSize, withCount: false }));
            }
            Promise.all(remainingJobs)
              .then((results) => {
                const extraLeads = results.flatMap((r) => r?.data || r || []);
                if (extraLeads.length > 0) {
                  setLeads((prev) => {
                    const seen = new Set(prev.map((l) => l.id));
                    const toAdd = extraLeads.filter((l) => !seen.has(l.id));
                    return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
                  });
                }
              })
              .catch((err) => console.warn("Background leads sync skipped:", err?.message));
          }
        });
      }

      if (shouldLoad(["crm", "leads", "overview", "sales_reports", "pipeline", "sales_commercials", "agreements", "invoices", "payments", "sales_followups", "sales_meetings", "clients"])) {
        addJob("deals", async () => {
          const [dealsRes, summaryRes] = await Promise.all([
            getDeals({ page: 1, pageSize: 500, withCount: true }),
            getCloudDealsSummary(),
          ]);
          fetchedDealsBatch = dealsRes?.data || dealsRes || [];
          setDeals(fetchedDealsBatch);
          if (dealsRes?.data) {
            setDealPagination({ count: dealsRes.count || 0, page: dealsRes.page || 1, pageSize: dealsRes.pageSize || 500, loading: false });
          }
          if (summaryRes && typeof summaryRes.total === "number") {
            setDealSummary(summaryRes);
          }
          loadedScopesRef.current.add("deals");
        });
      }

      if (shouldLoad(["clients"])) {
        addJob("clients", async () => {
          setClients(await getClients() || []);
          loadedScopesRef.current.add("clients");
        });
      }

      if (shouldLoad(["pipeline", "sales_commercials", "agreements", "invoices", "payments", "sales_reports"])) {
        addJob("commercials", async () => {
          const [proposalsRes, quotationsRes, agreementsRes, invoicesRes, summaryRes] = await Promise.all([
            getProposals(),
            getQuotations(),
            getAgreements(),
            getInvoices(),
            getCloudCommercialsSummary(),
          ]);
          setProposals(proposalsRes || []);
          setQuotations(quotationsRes || []);
          setAgreements(agreementsRes || []);
          setInvoicesList(invoicesRes || []);
          if (summaryRes && typeof summaryRes.quotations === "number") {
            setCommercialSummary(summaryRes);
          }
          loadedScopesRef.current.add("commercials");
        });
      }

      if (shouldLoad(["crm", "leads", "overview", "sales_reports", "pipeline", "sales_followups"])) {
        addJob("followups", async () => {
          const [followUpsRes, summaryRes] = await Promise.all([
            getSalesFollowUps({ page: 1, pageSize: 500, withCount: true }),
            getCloudFollowUpsSummary(),
          ]);
          setSalesFollowUps(followUpsRes?.data || followUpsRes || []);
          setEngagementFollowUps(followUpsRes?.data || followUpsRes || []);
          if (followUpsRes?.data) {
            setFollowUpPagination({ count: followUpsRes.count || 0, page: followUpsRes.page || 1, pageSize: followUpsRes.pageSize || 500, loading: false });
          }
          if (summaryRes && typeof summaryRes.total === "number") {
            setFollowUpSummary(summaryRes);
          }
          loadedScopesRef.current.add("followups");
        });
      }

      if (shouldLoad(["crm", "leads", "overview", "sales_reports", "pipeline", "sales_meetings"])) {
        addJob("meetings", async () => {
          const [meetingsRes, summaryRes] = await Promise.all([
            getSalesMeetings({ page: 1, pageSize: 100, withCount: true }),
            getCloudMeetingsSummary(),
          ]);
          setSalesMeetings(meetingsRes?.data || meetingsRes || []);
          if (meetingsRes?.data) {
            setMeetingPagination({ count: meetingsRes.count || 0, page: meetingsRes.page || 1, pageSize: meetingsRes.pageSize || 100, loading: false });
          }
          if (summaryRes && typeof summaryRes.total === "number") {
            setMeetingSummary(summaryRes);
          }
          loadedScopesRef.current.add("meetings");
        });
      }

      await Promise.all(jobs);

      // Guaranteed Pipeline Lead Hydration: Ensure every lead linked to an active deal is in memory
      const dealsToInspect = fetchedDealsBatch.length > 0 ? fetchedDealsBatch : deals;
      const activeDealLeadIds = dealsToInspect
        .filter((d) => !CLOSED_PIPELINE_STAGES.includes(d.pipeline_stage || d.stage))
        .map((d) => d.lead_id)
        .filter(Boolean);

      if (activeDealLeadIds.length > 0) {
        const loadedLeadIds = new Set((fetchedLeadsBatch.length > 0 ? fetchedLeadsBatch : leads).map((l) => l.id));
        const missingDealLeadIds = activeDealLeadIds.filter((id) => !loadedLeadIds.has(id));

        if (missingDealLeadIds.length > 0) {
          try {
            const hydratedLeads = await getLeadsByIds(missingDealLeadIds);
            if (hydratedLeads.length > 0) {
              setLeads((prev) => {
                const seen = new Set(prev.map((l) => l.id));
                const toAdd = hydratedLeads.filter((l) => !seen.has(l.id));
                return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
              });
            }
          } catch (hydErr) {
            console.warn("Active pipeline deal lead hydration skipped:", hydErr?.message);
          }
        }
      }

      loadedScopesRef.current.add(requestedScope);
    } finally {
      setCrmLoading(false);
      if (typeof window !== "undefined") {
        window.__CRM_DATA_LOADED__ = true;
        window.dispatchEvent(new CustomEvent("crm:data-loaded"));
        try {
          if (window.Capacitor && typeof window.Capacitor.isNativePlatform === "function" && window.Capacitor.isNativePlatform()) {
            import("@capacitor/splash-screen")
              .then(({ SplashScreen }) => SplashScreen.hide({ fadeOutDuration: 400 }))
              .catch(() => {});
          }
        } catch {}
      }
    }
  }, []);

  useEffect(() => {
    if (sessionUserId) {
      loadedScopesRef.current.clear();
      loadCrmData("all", { force: true });
    }
  }, [sessionUserId, loadCrmData]);

  const handleFetchLeadsPage = useCallback(async function handleFetchLeadsPage(params = {}) {
    const requestId = ++leadRequestRef.current;
    setLeadPagination((prev) => ({ ...prev, loading: true }));
    const result = await getCloudLeads({
      page: params.page || 1,
      pageSize: params.pageSize || 500,
      search: params.search || "",
      status: params.status || "",
      sourceFilter: params.sourceFilter || "",
      alphabet: params.alphabet || "",
      sort: params.sort || "",
      dateFrom: params.dateFrom || "",
      dateTo: params.dateTo || "",
      withCount: true,
    });
    if (requestId !== leadRequestRef.current) return;
    setLeads(result?.data || []);
    setLeadPagination({
      count: result?.count || 0,
      page: result?.page || params.page || 1,
      pageSize: result?.pageSize || params.pageSize || 500,
      loading: false,
    });
  }, []);

  const handleFetchDealsPage = useCallback(async function handleFetchDealsPage(params = {}) {
    setDealPagination((prev) => ({ ...prev, loading: true }));
    const result = await getDeals({
      page: params.page || 1,
      pageSize: params.pageSize || 100,
      search: params.search || "",
      stage: params.stage || "",
      dateFrom: params.dateFrom || "",
      dateTo: params.dateTo || "",
      withCount: true,
    });
    setDeals(result?.data || []);
    setDealPagination({
      count: result?.count || 0,
      page: result?.page || params.page || 1,
      pageSize: result?.pageSize || params.pageSize || 100,
      loading: false,
    });
  }, []);

  const handleFetchFollowUpsPage = useCallback(async function handleFetchFollowUpsPage(params = {}) {
    const requestId = ++followUpRequestRef.current;
    setFollowUpPagination((prev) => ({ ...prev, loading: true }));
    const result = await getSalesFollowUps({
      page: params.page || 1,
      pageSize: params.pageSize || 200,
      search: params.search || "",
      status: params.status || "",
      scope: params.scope || "",
      dateFrom: params.dateFrom || "",
      dateTo: params.dateTo || "",
      withCount: true,
    });
    if (requestId !== followUpRequestRef.current) return;
    setSalesFollowUps(result?.data || []);
    setFollowUpPagination({
      count: result?.count || 0,
      page: result?.page || params.page || 1,
      pageSize: result?.pageSize || params.pageSize || 200,
      loading: false,
    });
  }, []);

  const handleFetchMeetingsPage = useCallback(async function handleFetchMeetingsPage(params = {}) {
    const requestId = ++meetingRequestRef.current;
    setMeetingPagination((prev) => ({ ...prev, loading: true }));
    const result = await getSalesMeetings({
      page: params.page || 1,
      pageSize: params.pageSize || 50,
      search: params.search || "",
      status: params.status || "",
      dateFrom: params.dateFrom || "",
      dateTo: params.dateTo || "",
      withCount: true,
    });
    if (requestId !== meetingRequestRef.current) return;
    setSalesMeetings(result?.data || []);
    setMeetingPagination({
      count: result?.count || 0,
      page: result?.page || params.page || 1,
      pageSize: result?.pageSize || params.pageSize || 50,
      loading: false,
    });
  }, []);

  const handleRealtimeLead = useCallback(function handleRealtimeLead(payload) {
    const eventType = payload?.eventType;
    const row = eventType === "DELETE" ? payload?.old : payload?.new;
    if (!row?.id) return;
    const exists = leadsRef.current.some((item) => item.id === row.id);

    setLeads((prev) => {
      if (eventType === "DELETE") {
        return prev.some((item) => item.id === row.id) ? prev.filter((item) => item.id !== row.id) : prev;
      }
      if (eventType === "UPDATE") {
        const itemExists = prev.some((item) => item.id === row.id);
        const next = itemExists
          ? prev.map((item) => (item.id === row.id ? { ...item, ...row } : item))
          : [row, ...prev];
        return next.slice(0, leadPagination.pageSize || 50);
      }
      return [row, ...prev.filter((item) => item.id !== row.id)].slice(0, leadPagination.pageSize || 50);
    });

    if (eventType === "INSERT" && !exists) {
      setLeadPagination((prev) => ({ ...prev, count: Math.max((prev.count || 0) + 1, 1) }));
      setLeadSummary((prev) => ({ ...prev, total: (prev.total || 0) + 1 }));
    }
    if (eventType === "DELETE" && exists) {
      setLeadPagination((prev) => ({ ...prev, count: Math.max((prev.count || 0) - 1, 0) }));
      setLeadSummary((prev) => ({ ...prev, total: Math.max((prev.total || 0) - 1, 0) }));
    }
  }, [leadPagination.pageSize]);

  const handleRealtimeDeal = useCallback(function handleRealtimeDeal(payload) {
    const insertedId = payload?.eventType === "INSERT" ? payload?.new?.id : null;
    const alreadyExists = insertedId ? deals.some((item) => item.id === insertedId) : false;
    patchRealtimeList(setDeals, payload, { limit: dealPagination.pageSize || 100 });
    if (payload?.eventType === "INSERT" && !alreadyExists) {
      setDealPagination((prev) => ({ ...prev, count: Math.max((prev.count || 0) + 1, deals.length + 1) }));
    }
  }, [dealPagination.pageSize, deals]);

  const handleRealtimeFollowUp = useCallback(function handleRealtimeFollowUp(payload, { notify = false } = {}) {
    const insertedId = payload?.eventType === "INSERT" ? payload?.new?.id : null;
    const alreadyExists = insertedId ? salesFollowUps.some((item) => item.id === insertedId) : false;
    patchRealtimeList(setSalesFollowUps, payload, {
      limit: followUpPagination.pageSize || 50,
      onInsert: (item) => {
        if (!alreadyExists) {
          setFollowUpPagination((prev) => ({ ...prev, count: Math.max((prev.count || 0) + 1, salesFollowUps.length + 1) }));
        }
        if (notify && item.created_by !== sessionUserId) {
          pushLiveSalesNotification?.("New sales follow-up", item.title || "Follow-up scheduled", "lead", "/crm/followups");
        }
      },
    });
    patchRealtimeList(setEngagementFollowUps, payload, { limit: 500 });
  }, [followUpPagination.pageSize, pushLiveSalesNotification, salesFollowUps, sessionUserId]);

  const handleRealtimeSalesMeeting = useCallback(function handleRealtimeSalesMeeting(payload, { notify = false } = {}) {
    const insertedId = payload?.eventType === "INSERT" ? payload?.new?.id : null;
    const alreadyExists = insertedId ? salesMeetings.some((item) => item.id === insertedId) : false;
    patchRealtimeList(setSalesMeetings, payload, {
      limit: meetingPagination.pageSize || 50,
      onInsert: (item) => {
        if (!alreadyExists) {
          setMeetingPagination((prev) => ({ ...prev, count: Math.max((prev.count || 0) + 1, salesMeetings.length + 1) }));
        }
        if (notify && item.created_by !== sessionUserId) {
          pushLiveSalesNotification?.("New sales meeting", item.title || "Meeting scheduled", "meeting", "/crm/meetings");
        }
      },
    });
  }, [meetingPagination.pageSize, pushLiveSalesNotification, salesMeetings, sessionUserId]);

  const handleRealtimeProposal = useCallback(function handleRealtimeProposal(payload) {
    patchRealtimeList(setProposals, payload, { limit: 100 });
  }, []);

  const handleRealtimeAgreement = useCallback(function handleRealtimeAgreement(payload) {
    patchRealtimeList(setAgreements, payload, { limit: 100 });
  }, []);

  const handleRealtimeInvoice = useCallback(function handleRealtimeInvoice(payload) {
    patchRealtimeList(setInvoicesList, payload, { limit: 150 });
  }, []);

  return {
    leads,
    setLeads,
    leadPagination,
    leadSummary,
    setLeadSummary,
    refreshLeadSummary,
    clients,
    setClients,
    deals,
    setDeals,
    dealPagination,
    dealSummary,
    setDealSummary,
    refreshDealSummary,
    proposals,
    setProposals,
    quotations,
    setQuotations,
    agreements,
    setAgreements,
    commercialSummary,
    setCommercialSummary,
    refreshCommercialSummary,
    salesFollowUps,
    setSalesFollowUps,
    engagementFollowUps,
    setEngagementFollowUps,
    followUpPagination,
    followUpSummary,
    setFollowUpSummary,
    refreshFollowUpSummary,
    salesMeetings,
    setSalesMeetings,
    meetingPagination,
    meetingSummary,
    setMeetingSummary,
    refreshMeetingSummary,
    invoicesList,
    setInvoicesList,
    crmLoading,
    loadCrmData,
    handleFetchLeadsPage,
    handleFetchDealsPage,
    handleFetchFollowUpsPage,
    handleFetchMeetingsPage,
    handleRealtimeLead,
    handleRealtimeDeal,
    handleRealtimeFollowUp,
    handleRealtimeSalesMeeting,
    handleRealtimeProposal,
    handleRealtimeAgreement,
    handleRealtimeInvoice,
  };
}
