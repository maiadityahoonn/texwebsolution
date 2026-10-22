"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getLeadsByIds } from "@/services/crm/leadsService";

function mergeById(...collections) {
  const rows = new Map();
  collections.flat().forEach((item) => {
    if (!item?.id) return;
    rows.set(String(item.id), { ...(rows.get(String(item.id)) || {}), ...item });
  });
  return [...rows.values()];
}

export function useCrmRelationshipLeads({
  sessionUserId = "",
  leads = [],
  clients = [],
  deals = [],
  followUps = [],
  meetings = [],
} = {}) {
  const [hydratedLeads, setHydratedLeads] = useState([]);
  const requestRef = useRef(0);

  useEffect(() => {
    setHydratedLeads([]);
  }, [sessionUserId]);

  useEffect(() => {
    if (!sessionUserId) return;
    setHydratedLeads((previous) => mergeById(previous, leads));
  }, [leads, sessionUserId]);

  const requiredLeadIds = useMemo(() => {
    const ids = new Set();
    clients.forEach((item) => item?.lead_id && ids.add(String(item.lead_id)));
    deals.forEach((item) => item?.lead_id && ids.add(String(item.lead_id)));
    followUps.forEach((item) => item?.lead_id && ids.add(String(item.lead_id)));
    meetings.forEach((item) => item?.lead_id && ids.add(String(item.lead_id)));
    return [...ids];
  }, [clients, deals, followUps, meetings]);

  useEffect(() => {
    if (!sessionUserId || requiredLeadIds.length === 0) return;
    const knownIds = new Set(mergeById(hydratedLeads, leads).map((item) => String(item.id)));
    const missingIds = requiredLeadIds.filter((id) => !knownIds.has(id));
    if (missingIds.length === 0) return;

    const requestId = ++requestRef.current;
    getLeadsByIds(missingIds)
      .then((rows) => {
        if (requestId !== requestRef.current || !rows?.length) return;
        setHydratedLeads((previous) => mergeById(previous, rows));
      })
      .catch((error) => console.warn("CRM relationship lead hydration skipped:", error?.message));
  }, [hydratedLeads, leads, requiredLeadIds, sessionUserId]);

  return useMemo(() => mergeById(hydratedLeads, leads), [hydratedLeads, leads]);
}
