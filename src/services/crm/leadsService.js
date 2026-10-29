import {
  supabase,
  escapeSupabaseLike,
  clampPageSize,
  toPostgrestInList,
  fetchCrmListFromApi,
  readLocalCache,
  writeLocalCache,
  LOCAL_DEALS_KEY,
  LOCAL_SALES_MEETINGS_KEY,
  LOCAL_SALES_FOLLOWUPS_KEY,
  LOCAL_PROPOSALS_KEY,
  LOCAL_QUOTATIONS_KEY,
  LOCAL_AGREEMENTS_KEY,
  LOCAL_INVOICES_KEY,
} from '../supabase/client';
import { applyLeadCategoryFilter, buildLeadDealScopes } from './leadCategoryFilters';

// ==========================================
// 1. LEADS & CRM MANAGEMENT
// ==========================================
export async function sendMetaCrmEvent(lead, status = lead?.status || 'New') {
  if (!lead || typeof fetch === 'undefined') return;
  try {
    await fetch('/api/meta/crm-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead, status }),
    });
  } catch (err) {
    console.warn('Meta CRM event skipped:', err.message);
  }
}

export function mapDealStageToLeadStatus(stage) {
  const value = String(stage || '').toLowerCase();
  if (value.includes('lost') || value.includes('abandon') || value.includes('drop')) return 'Lost';
  if (value.includes('won') || value.includes('convert')) return 'Closed Won';
  if (value.includes('negotiat')) return 'Negotiation';
  if (value.includes('proposal') || value.includes('quotation') || value.includes('quote') || value.includes('estimate')) return 'Proposal Sent';
  if (value === 'qualified' || value.includes('meet') || value.includes('schedul')) return 'Meeting';
  if (value.includes('contact') || value.includes('qualif') || value.includes('require')) return 'Qualified';
  return 'Lead';
}

export function extractMetaLeadKey(lead) {
  const notes = String(lead?.notes || "");
  const match = notes.match(/(?:Meta Lead ID|Meta ID|Leadgen ID)\s*:\s*(l:)?(\d{10,25})/i);
  if (match) return `l:${match[2]}`;
  const direct = lead?.meta_lead_id || lead?.leadgen_id || lead?.lead_id;
  if (!direct) return "";
  const digits = String(direct).replace(/\D/g, "");
  return digits ? `l:${digits}` : "";
}

export const ARCHIVED_LEAD_STATUSES = ['Converted', 'Lost', 'Archived', 'Closed Won'];

async function getLeadDealScopes() {
  const { data, error } = await supabase
    .from('deals')
    .select('lead_id, pipeline_stage')
    .not('lead_id', 'is', null);
  if (error) {
    console.warn('Pipeline lead filter skipped:', error.message);
    return buildLeadDealScopes([]);
  }
  return buildLeadDealScopes(data || []);
}

export async function getPipelineLeadIds(scope = 'all') {
  const scopes = await getLeadDealScopes();
  if (scope === 'active') return scopes.active;
  if (scope === 'lost') return scopes.lost;
  if (scope === 'won') return scopes.won;
  return scopes.all;
}

export async function getLeadsByIds(leadIds = []) {
  const validIds = [...new Set((leadIds || []).filter(Boolean))];
  if (validIds.length === 0) return [];
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .in('id', validIds);
    if (error) {
      console.warn('Error fetching leads by IDs:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('Error fetching leads by IDs:', err.message);
    return [];
  }
}

export async function sendDealStageMetaEvent(deal, stage) {
  if (!deal?.lead_id) return;
  try {
    const { data: lead, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', deal.lead_id)
      .maybeSingle();
    if (error || !lead) return;
    sendMetaCrmEvent(
      {
        ...lead,
        service: deal.service || lead.service,
        notes: [lead.notes, deal.notes].filter(Boolean).join('\n'),
        deal_value: Number(deal.deal_value || deal.value) || 0,
        status: mapDealStageToLeadStatus(stage),
      },
      mapDealStageToLeadStatus(stage)
    );
  } catch (err) {
    console.warn('Meta deal stage event skipped:', err.message);
  }
}

export async function getCloudLeads(options = null) {
  try {
    const useOptions = options && typeof options === 'object';
    const pageSize = clampPageSize(options?.pageSize, useOptions ? 50 : 200);
    const page = Math.max(Number.parseInt(options?.page || 1, 10) || 1, 1);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const withCount = Boolean(options?.withCount);

    if (useOptions) {
      const apiResult = await fetchCrmListFromApi('leads', { ...options, page, pageSize });
      if (apiResult?.data) return withCount ? apiResult : apiResult.data;
    }

    let query = supabase
      .from('leads')
      .select('*', withCount ? { count: 'exact' } : undefined);

    if (options?.sort === 'a-z' || options?.sort === 'z-a') {
      query = query
        .order('name', { ascending: options.sort === 'a-z', nullsFirst: false })
        .order('created_at', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: options?.sort === 'oldest' });
    }

    if (options?.status === 'active') {
      query = applyLeadCategoryFilter(query, 'active', await getLeadDealScopes());
    } else if (options?.status === 'archived') {
      const pipelineLeadIds = await getPipelineLeadIds();
      const archivedStatusFilter = `status.in.${toPostgrestInList(ARCHIVED_LEAD_STATUSES)}`;
      const pipelineFilter = pipelineLeadIds.length > 0 ? `id.in.${toPostgrestInList(pipelineLeadIds)}` : "";
      query = query.or([archivedStatusFilter, pipelineFilter].filter(Boolean).join(','));
    } else if (options?.status === 'converted') {
      query = applyLeadCategoryFilter(query, 'converted', await getLeadDealScopes());
    } else if (options?.status === 'lost') {
      query = applyLeadCategoryFilter(query, 'lost', await getLeadDealScopes());
    } else if (options?.status === 'pipeline') {
      query = applyLeadCategoryFilter(query, 'pipeline', await getLeadDealScopes());
    } else if (options?.status && options.status !== 'all') {
      query = query.eq('status', options.status);
    }

    if (options?.alphabet && /^[a-z]$/i.test(options.alphabet)) {
      query = query.ilike('name', `${options.alphabet}%`);
    } else if (options?.alphabet === '#') {
      for (const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
        query = query.not('name', 'ilike', `${letter}%`);
      }
    }

    if (options?.source) {
      query = query.eq('source', options.source);
    }

    if (options?.sourceFilter === 'meta') {
      query = query.ilike('source', 'Meta Ads%');
    }

    if (options?.service) {
      query = query.eq('service', options.service);
    }

    if (options?.dateFrom) {
      query = query.gte('created_at', options.dateFrom);
    }

    if (options?.dateTo) {
      query = query.lte('created_at', options.dateTo);
    }

    const search = String(options?.search || '').trim();
    if (search) {
      const like = `%${escapeSupabaseLike(search)}%`;
      query = query.or([
        `name.ilike.${like}`,
        `phone.ilike.${like}`,
        `email.ilike.${like}`,
        `service.ilike.${like}`,
        `source.ilike.${like}`,
        `city.ilike.${like}`,
        `state.ilike.${like}`,
      ].join(','));
    }

    query = useOptions ? query.range(from, to) : query.limit(pageSize);

    const { data, error, count } = await query;

    if (error) throw error;
    if (withCount) {
      return {
        data: data || [],
        count: count || 0,
        page,
        pageSize,
      };
    }
    return data || [];
  } catch (err) {
    console.warn('Fallback: Error fetching cloud leads:', err.message);
    return options?.withCount ? { data: [], count: 0, page: 1, pageSize: clampPageSize(options?.pageSize) } : null;
  }
}

export async function getCloudLeadsSummary(options = {}) {
  try {
    const apiResult = await fetchCrmListFromApi('leads_summary', options);
    if (apiResult && typeof apiResult.total === 'number') {
      return apiResult;
    }

    let qLeads = supabase.from('leads').select('id, status, created_at, source, meta_lead_id, ad_id');
    let qDeals = supabase.from('deals').select('id, lead_id, pipeline_stage, created_at, updated_at');

    if (options?.dateFrom) {
      qLeads = qLeads.gte('created_at', options.dateFrom);
      qDeals = qDeals.gte('created_at', options.dateFrom);
    }
    if (options?.dateTo) {
      qLeads = qLeads.lte('created_at', options.dateTo);
      qDeals = qDeals.lte('created_at', options.dateTo);
    }
    if (options?.sourceFilter === 'meta') {
      qLeads = qLeads.ilike('source', 'Meta Ads%');
    }

    const [{ data: leadsData }, { data: dealsData }] = await Promise.all([qLeads, qDeals]);
    const leads = leadsData || [];
    const deals = dealsData || [];

    const CLOSED_STAGES = ['closed_won', 'closed_lost', 'lost', 'abandoned', 'dropped'];
    const wonDealLeadIds = new Set(
      deals.filter((d) => (d.pipeline_stage || d.stage) === 'closed_won').map((d) => d.lead_id).filter(Boolean)
    );
    const activePipelineLeadIds = new Set(
      deals.filter((d) => !CLOSED_STAGES.includes(d.pipeline_stage || d.stage)).map((d) => d.lead_id).filter(Boolean)
    );
    const lostDealLeadIds = new Set(
      deals.filter((d) => (d.pipeline_stage || d.stage) === 'closed_lost').map((d) => d.lead_id).filter(Boolean)
    );

    const converted = leads.filter((l) => {
      if (wonDealLeadIds.has(l.id)) return true;
      if (activePipelineLeadIds.has(l.id) || lostDealLeadIds.has(l.id)) return false;
      return l.status === 'Converted' || l.status === 'Closed Won';
    }).length;

    const lost = leads.filter((l) => {
      if (lostDealLeadIds.has(l.id)) return true;
      if (activePipelineLeadIds.has(l.id) || wonDealLeadIds.has(l.id)) return false;
      return l.status === 'Lost';
    }).length;

    const pipeline = leads.filter((l) => {
      if (activePipelineLeadIds.has(l.id)) return true;
      if (wonDealLeadIds.has(l.id) || lostDealLeadIds.has(l.id)) return false;
      return ['Contacted', 'Qualified', 'Proposal Sent', 'In Pipeline', 'Negotiation', 'In Progress'].includes(l.status);
    }).length;

    const total = leads.length;
    const active = Math.max(0, total - pipeline - converted - lost);

    return {
      total,
      active,
      pipeline,
      converted,
      lost,
    };
  } catch (err) {
    console.warn('Error fetching lead summary:', err.message);
    return { total: 0, active: 0, pipeline: 0, converted: 0, lost: 0 };
  }
}

export async function createCloudLead(leadData) {
  try {
    const payload = {
      name: leadData.name,
      phone: leadData.phone,
      email: leadData.email || '',
      service: leadData.service || 'General Inquiry',
      source: leadData.source || 'Website Form',
      status: leadData.status || 'New',
      notes: leadData.notes || '',
    };

    // Primary: API route creates lead, triggers Meta CAPI, DB notification, and dispatches FCM/Web push
    if (typeof fetch !== 'undefined') {
      try {
        const response = await fetch('/api/leads/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (response.ok) {
          const result = await response.json().catch(() => ({}));
          if (result.lead) {
            sendMetaCrmEvent(result.lead, result.lead.status);
            return result.lead;
          }
        }
      } catch (apiErr) {
        console.warn('API lead create error, falling back to direct DB:', apiErr?.message);
      }
    }

    // Direct Supabase insert fallback
    const { data, error } = await supabase
      .from('leads')
      .insert([payload])
      .select();

    if (!error && data?.[0]) {
      sendMetaCrmEvent(data[0], data[0].status);
      return data[0];
    }

    const fallbackLead = { ...payload, id: `local-${Date.now()}`, created_at: new Date().toISOString() };
    sendMetaCrmEvent(fallbackLead, fallbackLead.status);
    return fallbackLead;
  } catch (err) {
    console.error('Error creating cloud lead:', err.message);
    return null;
  }
}

export async function createCloudLeadsBatch(leadsArray) {
  try {
    if (!Array.isArray(leadsArray) || leadsArray.length === 0) return [];
    const incomingPayloads = leadsArray.map((l) => ({
      name: l.name || "Meta Lead",
      phone: l.phone || "",
      email: l.email || "",
      service: l.service || "Website Development",
      source: l.source || "Meta Ads",
      status: l.status || "New",
      notes: l.notes || "",
      meta_lead_id: l.meta_lead_id || null,
      ad_id: l.ad_id || null,
      adset_id: l.adset_id || null,
      campaign_id: l.campaign_id || null,
      form_id: l.form_id || null,
      form_name: l.form_name || null,
      platform: l.platform || null,
      budget_range: l.budget_range || l.budget || null,
      city: l.city || null,
      state: l.state || null,
      raw_metadata: l.raw_metadata || null,
    }));

    const { data: existingLeads } = await supabase
      .from('leads')
      .select('id,email,phone,notes,meta_lead_id');

    const contactKeyForLead = (lead) =>
      `${String(lead.email || "").toLowerCase()}|${String(lead.phone || "").replace(/\D/g, "")}`;
    const existingByMetaId = new Map();
    const existingByContact = new Map();
    (existingLeads || []).forEach((lead) => {
      const metaId = extractMetaLeadKey(lead);
      const contactKey = contactKeyForLead(lead);
      if (metaId && !existingByMetaId.has(metaId)) existingByMetaId.set(metaId, lead);
      if (contactKey !== "|" && !existingByContact.has(contactKey)) existingByContact.set(contactKey, lead);
    });

    const uniqueIncoming = [];
    const seenIncomingKeys = new Set();
    incomingPayloads.forEach((lead) => {
      const metaId = extractMetaLeadKey(lead);
      const contactKey = contactKeyForLead(lead);
      const key = metaId || (contactKey !== "|" ? contactKey : `row:${uniqueIncoming.length}`);
      if (seenIncomingKeys.has(key)) return;
      seenIncomingKeys.add(key);
      uniqueIncoming.push(lead);
    });

    const results = [];
    const inserts = [];

    for (const payload of uniqueIncoming) {
      const metaId = extractMetaLeadKey(payload);
      const contactKey = contactKeyForLead(payload);
      const existing = (metaId && existingByMetaId.get(metaId)) || (contactKey !== "|" ? existingByContact.get(contactKey) : null);
      if (!existing?.id) {
        inserts.push(payload);
        continue;
      }

      const { data: updated, error: updateError } = await supabase
        .from('leads')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();

      if (!updateError && updated) {
        results.push(updated);
        sendMetaCrmEvent(updated, updated.status);
      } else {
        console.warn('Lead import update skipped:', updateError?.message);
      }
    }

    if (inserts.length) {
      const { data, error } = await supabase
        .from('leads')
        .insert(inserts)
        .select();

      if (!error && Array.isArray(data)) {
        data.forEach((lead) => sendMetaCrmEvent(lead, lead.status));
        results.push(...data);
      } else {
        for (const p of inserts) {
          const res = await createCloudLead(p);
          if (res) results.push(res);
        }
      }
    }

    return results;
  } catch (err) {
    console.error('Error in createCloudLeadsBatch:', err.message);
    return [];
  }
}

export async function updateCloudLeadStatus(leadId, newStatus) {
  try {
    const { data, error } = await supabase
      .from('leads')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', leadId)
      .select();

    if (error) throw error;
    const updatedLead = data?.[0] || null;
    if (updatedLead) sendMetaCrmEvent(updatedLead, newStatus);
    return updatedLead;
  } catch (err) {
    console.error('Error updating lead status:', err.message);
    return null;
  }
}

export async function updateCloudLead(leadId, updates) {
  try {
    const leadUpdates = { ...(updates || {}) };
    const metadataPatch = {};
    ['loss_reason', 'lost_at_stage'].forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(leadUpdates, key)) {
        metadataPatch[key] = leadUpdates[key];
        delete leadUpdates[key];
      }
    });

    if (Object.keys(metadataPatch).length) {
      const { data: existingLead } = await supabase
        .from('leads')
        .select('raw_metadata')
        .eq('id', leadId)
        .maybeSingle();
      leadUpdates.raw_metadata = {
        ...(existingLead?.raw_metadata && typeof existingLead.raw_metadata === 'object' ? existingLead.raw_metadata : {}),
        ...metadataPatch,
      };
    }

    let payload = { ...leadUpdates, updated_at: new Date().toISOString() };
    let { data, error } = await supabase
      .from('leads')
      .update(payload)
      .eq('id', leadId)
      .select();

    if (error && /Could not find the '([^']+)' column/i.test(error.message || '')) {
      const missingColumn = error.message.match(/Could not find the '([^']+)' column/i)?.[1];
      if (missingColumn && Object.prototype.hasOwnProperty.call(payload, missingColumn)) {
        delete payload[missingColumn];
        const retry = await supabase
          .from('leads')
          .update(payload)
          .eq('id', leadId)
          .select();
        data = retry.data;
        error = retry.error;
      }
    }

    if (error) throw error;
    const updatedLead = data?.[0] || null;
    if (updatedLead && updates?.status) sendMetaCrmEvent(updatedLead, updates.status);
    return updatedLead;
  } catch (err) {
    console.error('Error updating lead:', err.message);
    return null;
  }
}

export async function deleteCloudLead(leadId) {
  try {
    // 1. Fetch linked deals to cascade delete linked documents
    const { data: linkedDeals } = await supabase
      .from('deals')
      .select('id')
      .eq('lead_id', leadId);

    const dealIds = (linkedDeals || []).map((d) => d.id).filter(Boolean);

    // 2. Cascade delete documents linked to deals
    if (dealIds.length > 0) {
      await Promise.allSettled([
        supabase.from('proposals').delete().in('deal_id', dealIds),
        supabase.from('quotations').delete().in('deal_id', dealIds),
        supabase.from('agreements').delete().in('deal_id', dealIds),
        supabase.from('invoices').delete().in('deal_id', dealIds),
        supabase.from('sales_meetings').delete().in('deal_id', dealIds),
        supabase.from('sales_followups').delete().in('deal_id', dealIds),
      ]);
    }

    // 3. Cascade delete meetings and followups linked directly to lead
    await Promise.allSettled([
      supabase.from('sales_meetings').delete().eq('lead_id', leadId),
      supabase.from('sales_followups').delete().eq('lead_id', leadId),
    ]);

    // 4. Cascade delete linked pipeline deals
    await supabase.from('deals').delete().eq('lead_id', leadId);

    // 5. Delete the lead
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', leadId);

    if (error) throw error;

    // 6. Clean local browser cache if present
    if (typeof window !== 'undefined') {
      const dealIdSet = new Set(dealIds);
      const cleanCache = (key, filterFn) => {
        const items = readLocalCache(key, []);
        if (items && items.length > 0) {
          writeLocalCache(key, items.filter(filterFn));
        }
      };
      cleanCache(LOCAL_SALES_MEETINGS_KEY, (m) => m.lead_id !== leadId && !dealIdSet.has(m.deal_id));
      cleanCache(LOCAL_SALES_FOLLOWUPS_KEY, (f) => f.lead_id !== leadId && !dealIdSet.has(f.deal_id));
      cleanCache(LOCAL_DEALS_KEY, (d) => d.lead_id !== leadId);
      cleanCache(LOCAL_PROPOSALS_KEY, (p) => !dealIdSet.has(p.deal_id));
      cleanCache(LOCAL_QUOTATIONS_KEY, (q) => !dealIdSet.has(q.deal_id));
      cleanCache(LOCAL_AGREEMENTS_KEY, (a) => !dealIdSet.has(a.deal_id));
      cleanCache(LOCAL_INVOICES_KEY, (i) => !dealIdSet.has(i.deal_id));
    }

    return true;
  } catch (err) {
    console.error('Error deleting lead and related records:', err.message);
    return false;
  }
}
