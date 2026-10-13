import { playNotificationSound } from "@/lib/notificationSound";
import {
  createClient,
  createClientPortalToken,
  getClients,
} from "@/services/crm/clientsService";
import {
  createDeal,
  updateDealStage,
} from "@/services/crm/dealsService";
import { updateCloudLeadStatus } from "@/services/crm/leadsService";
import {
  createProject,
  getProjects,
} from "@/services/supabaseService";

export async function convertLeadOrDealToClientAndProject({
  leadOrDeal,
  clients,
  setClients,
  projectsData,
  setProjectsData,
  leads,
  setLeads,
  setDeals,
  clientsLoadedForConversion,
  setClientsLoadedForConversion,
  projectsLoaded,
  setProjectsLoaded,
  setToast = () => {},
}) {
  let clientRows = clients;
  if (!clientsLoadedForConversion && clients.length === 0) {
    clientRows = (await getClients()) || [];
    setClients(clientRows);
    setClientsLoadedForConversion(true);
  }
  let projectRows = projectsData;
  if (!projectsLoaded) {
    projectRows = (await getProjects()) || [];
    setProjectsData(projectRows);
    setProjectsLoaded(true);
  }
  const existingDealId = leadOrDeal?.deal_value || leadOrDeal?.pipeline_stage ? leadOrDeal.id : null;
  const linkedLead = leadOrDeal?.lead_id ? leads.find((lead) => lead.id === leadOrDeal.lead_id) : null;
  const sourceRecord = { ...(linkedLead || {}), ...(leadOrDeal || {}) };
  let clientMatch = clientRows.find(
    (c) => c.name?.toLowerCase() === (sourceRecord.name || sourceRecord.title || "").toLowerCase()
  );
  if (!clientMatch && leadOrDeal?.client_id) {
    clientMatch = clientRows.find((c) => c.id === leadOrDeal.client_id);
  }
  if (!clientMatch) {
    clientMatch = await createClient({
      portal_token: createClientPortalToken(),
      portal_enabled: true,
      name: sourceRecord.name || sourceRecord.title || "Client Account",
      company_name: sourceRecord.company_name || (sourceRecord.name ? `${sourceRecord.name} Ventures` : "Client Company"),
      phone: sourceRecord.phone || "",
      email: sourceRecord.email || "",
      industry: "Technology",
      status: "active",
    });
    if (clientMatch) setClients((prev) => [clientMatch, ...prev]);
  }

  let dealCreated = existingDealId ? { ...leadOrDeal, client_id: clientMatch?.id, pipeline_stage: "closed_won" } : null;
  if (existingDealId && clientMatch?.id && leadOrDeal.client_id !== clientMatch.id) {
    const linkedDeal = await updateDealStage(existingDealId, "closed_won", { client_id: clientMatch.id });
    dealCreated = { ...dealCreated, ...(linkedDeal || {}), client_id: clientMatch.id };
  }
  if (!existingDealId) {
    dealCreated = await createDeal({
      title: `${clientMatch?.name || "Client"} - ${sourceRecord.service || "Tech Development"} Delivery`,
      client_id: clientMatch?.id,
      lead_id: sourceRecord.id || null,
      deal_value: Number(sourceRecord.deal_value) || 120000,
      service: sourceRecord.service || "Web Development",
      pipeline_stage: "closed_won",
    });
  }
  if (dealCreated) {
    setDeals((prev) => {
      const exists = prev.some((deal) => deal.id === dealCreated.id);
      return exists ? prev.map((deal) => (deal.id === dealCreated.id ? { ...deal, ...dealCreated } : deal)) : [dealCreated, ...prev];
    });
  }

  const existingProject = projectRows.find((project) => dealCreated?.id && project.deal_id === dealCreated.id);
  const projectCreated =
    existingProject ||
    (await createProject({
      name: `${clientMatch?.name || "Client"} ${sourceRecord.service || "Portal"} Project`,
      client_id: clientMatch?.id,
      deal_id: dealCreated?.id,
      description: [sourceRecord.notes, `Delivery project for ${clientMatch?.name || "Client"}. Handed over from Closed Won deal.`].filter(Boolean).join("\n"),
      status: "in_progress",
      priority: "high",
      budget: Number(sourceRecord.deal_value) || Number(dealCreated?.deal_value) || 120000,
      start_date: new Date().toISOString().split("T")[0],
    }));
  if (projectCreated) {
    setProjectsData((prev) => {
      const exists = prev.some((project) => project.id === projectCreated.id);
      return exists ? prev.map((project) => (project.id === projectCreated.id ? { ...project, ...projectCreated } : project)) : [projectCreated, ...prev];
    });
  }

  const sourceLeadId = linkedLead?.id || (!existingDealId ? leadOrDeal?.id : null);
  if (sourceLeadId) {
    await updateCloudLeadStatus(sourceLeadId, "Converted");
    setLeads((prev) => prev.map((lead) => (lead.id === sourceLeadId ? { ...lead, status: "Converted" } : lead)));
  }
  playNotificationSound("payment");
  setToast("Deal Closed Won! Client & Project created successfully.");
}
