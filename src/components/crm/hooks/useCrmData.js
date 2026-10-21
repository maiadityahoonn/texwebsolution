"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { patchRealtimeList } from "@/components/crm/shared/realtimeListUtils";
import { getCloudLeads, getCloudLeadsSummary } from "@/services/crm/leadsService";
import { getDeals } from "@/services/crm/dealsService";
import { getClients } from "@/services/crm/clientsService";
import {
  getAgreements,
  getInvoices,
  getProposals,
  getQuotations,
} from "@/services/crm/documentsService";
import { getSalesFollowUps } from "@/services/crm/followupsService";
import { getSalesMeetings } from "@/services/crm/meetingsService";

export function useCrmData({ sessionUserId = "", pushLiveSalesNotification } = {}) {
  const [leads, setLeads] = useState([]);
  const [leadPagination, setLeadPagination] = useState({ count: 0, page: 1, pageSize: 50, loading: false });
  const [leadSummary, setLeadSummary] = useState({ total: 0, converted: 0, lost: 0 });
  const [clients, setClients] = useState([]);
  const [deals, setDeals] = useState([]);
  const [dealPagination, setDealPagination] = useState({ count: 0, page: 1, pageSize: 100, loading: false });
  const [proposals, setProposals] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [agreements, setAgreements] = useState([]);
  const [salesFollowUps, setSalesFollowUps] = useState([]);
  const [followUpPagination, setFollowUpPagination] = useState({ count: 0, page: 1, pageSize: 50, loading: false });
  const [salesMeetings, setSalesMeetings] = useState([]);
  const [meetingPagination, setMeetingPagination] = useState({ count: 0, page: 1, pageSize: 50, loading: false });
  const [invoicesList, setInvoicesList] = useState([]);
  const [crmLoading, setCrmLoading] = useState(false);
  const leadsRef = useRef([]);
  const loadedScopesRef = useRef(new Set());

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

      if (shouldLoad(["crm", "leads", "overview", "sales_reports", "pipeline", "sales_followups", "sales_meetings"])) {
        addJob("leads", async () => {
          const [leadsRes, summaryRes] = await Promise.all([
            getCloudLeads({ page: 1, pageSize: 200, withCount: true }),
            getCloudLeadsSummary(),
          ]);
          setLeads(leadsRes?.data || leadsRes || []);
          if (leadsRes?.data) {
            setLeadPagination({ count: leadsRes.count || 0, page: leadsRes.page || 1, pageSize: leadsRes.pageSize || 200, loading: false });
          }
          if (summaryRes && typeof summaryRes.total === "number") {
            setLeadSummary(summaryRes);
          }
          loadedScopesRef.current.add("leads");
        });
      }

      if (shouldLoad(["crm", "leads", "overview", "sales_reports", "pipeline", "sales_commercials", "agreements", "invoices", "payments", "sales_followups", "sales_meetings", "clients"])) {
        addJob("deals", async () => {
          const dealsRes = await getDeals({ page: 1, pageSize: 100, withCount: true });
          setDeals(dealsRes?.data || dealsRes || []);
          if (dealsRes?.data) {
            setDealPagination({ count: dealsRes.count || 0, page: dealsRes.page || 1, pageSize: dealsRes.pageSize || 100, loading: false });
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
          const [proposalsRes, quotationsRes, agreementsRes, invoicesRes] = await Promise.all([
            getProposals(),
            getQuotations(),
            getAgreements(),
            getInvoices(),
          ]);
          setProposals(proposalsRes || []);
          setQuotations(quotationsRes || []);
          setAgreements(agreementsRes || []);
          setInvoicesList(invoicesRes || []);
          loadedScopesRef.current.add("commercials");
        });
      }

      if (shouldLoad(["crm", "leads", "overview", "sales_reports", "pipeline", "sales_followups"])) {
        addJob("followups", async () => {
          const followUpsRes = await getSalesFollowUps({ page: 1, pageSize: 500, withCount: true });
          setSalesFollowUps(followUpsRes?.data || followUpsRes || []);
          if (followUpsRes?.data) {
            setFollowUpPagination({ count: followUpsRes.count || 0, page: followUpsRes.page || 1, pageSize: followUpsRes.pageSize || 500, loading: false });
          }
          loadedScopesRef.current.add("followups");
        });
      }

      if (shouldLoad(["crm", "leads", "overview", "sales_reports", "pipeline", "sales_meetings"])) {
        addJob("meetings", async () => {
          const meetingsRes = await getSalesMeetings({ page: 1, pageSize: 100, withCount: true });
          setSalesMeetings(meetingsRes?.data || meetingsRes || []);
          if (meetingsRes?.data) {
            setMeetingPagination({ count: meetingsRes.count || 0, page: meetingsRes.page || 1, pageSize: meetingsRes.pageSize || 100, loading: false });
          }
          loadedScopesRef.current.add("meetings");
        });
      }

      await Promise.all(jobs);
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
    setLeadPagination((prev) => ({ ...prev, loading: true }));
    const result = await getCloudLeads({
      page: params.page || 1,
      pageSize: params.pageSize || 200,
      search: params.search || "",
      status: params.status || "",
      dateFrom: params.dateFrom || "",
      dateTo: params.dateTo || "",
      withCount: true,
    });
    setLeads(result?.data || []);
    setLeadPagination({
      count: result?.count || 0,
      page: result?.page || params.page || 1,
      pageSize: result?.pageSize || params.pageSize || 200,
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
    setFollowUpPagination((prev) => ({ ...prev, loading: true }));
    const result = await getSalesFollowUps({
      page: params.page || 1,
      pageSize: params.pageSize || 200,
      search: params.search || "",
      status: params.status || "",
      dateFrom: params.dateFrom || "",
      dateTo: params.dateTo || "",
      withCount: true,
    });
    setSalesFollowUps(result?.data || []);
    setFollowUpPagination({
      count: result?.count || 0,
      page: result?.page || params.page || 1,
      pageSize: result?.pageSize || params.pageSize || 200,
      loading: false,
    });
  }, []);

  const handleFetchMeetingsPage = useCallback(async function handleFetchMeetingsPage(params = {}) {
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
    proposals,
    setProposals,
    quotations,
    setQuotations,
    agreements,
    setAgreements,
    salesFollowUps,
    setSalesFollowUps,
    followUpPagination,
    salesMeetings,
    setSalesMeetings,
    meetingPagination,
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
