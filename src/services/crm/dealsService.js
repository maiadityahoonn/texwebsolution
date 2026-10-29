import {
  supabase,
  clampPageSize,
  escapeSupabaseLike,
  fetchCrmListFromApi,
  readLocalCache,
  writeLocalCache,
  mergeCloudAndLocal,
  LOCAL_DEALS_KEY,
} from '../supabase/client';
import { sendDealStageMetaEvent } from './leadsService';

// ==========================================
// DEALS & SALES PIPELINE SERVICE
// ==========================================

export async function getDeals(options = null) {
  try {
    const useOptions = options && typeof options === 'object';
    const pageSize = clampPageSize(options?.pageSize, useOptions ? 50 : 200);
    const page = Math.max(Number.parseInt(options?.page || 1, 10) || 1, 1);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const withCount = Boolean(options?.withCount);

    if (useOptions) {
      const apiResult = await fetchCrmListFromApi('deals', { ...options, page, pageSize });
      if (apiResult?.data) return withCount ? apiResult : apiResult.data;
    }

    let query = supabase
      .from('deals')
      .select('*', withCount ? { count: 'exact' } : undefined)
      .order('created_at', { ascending: false });

    if (options?.stage && options.stage !== 'all') {
      query = query.eq('pipeline_stage', options.stage);
    }
    if (options?.dateFrom || options?.dateTo) {
      if (options?.dateFrom && options?.dateTo) {
        query = query.or(`and(created_at.gte.${options.dateFrom},created_at.lte.${options.dateTo}),and(updated_at.gte.${options.dateFrom},updated_at.lte.${options.dateTo})`);
      } else if (options?.dateFrom) {
        query = query.or(`created_at.gte.${options.dateFrom},updated_at.gte.${options.dateFrom}`);
      } else if (options?.dateTo) {
        query = query.or(`created_at.lte.${options.dateTo},updated_at.lte.${options.dateTo}`);
      }
    }
    const search = String(options?.search || '').trim();
    if (search) {
      const like = `%${escapeSupabaseLike(search)}%`;
      query = query.or([
        `title.ilike.${like}`,
        `service.ilike.${like}`,
        `notes.ilike.${like}`,
        `loss_reason.ilike.${like}`,
      ].join(','));
    }

    query = useOptions ? query.range(from, to) : query.limit(pageSize);

    const { data, error, count } = await query;

    if (error) throw error;
    const localDeals = readLocalCache(LOCAL_DEALS_KEY, []);
    const cloudDeals = data || [];
    if (withCount) {
      writeLocalCache(LOCAL_DEALS_KEY, mergeCloudAndLocal(cloudDeals, localDeals));
      return { data: cloudDeals, count: count || 0, page, pageSize };
    }
    const mergedDeals = [
      ...cloudDeals,
      ...localDeals.filter((localDeal) => !cloudDeals.some((cloudDeal) => cloudDeal.id === localDeal.id)),
    ];
    writeLocalCache(LOCAL_DEALS_KEY, mergedDeals);
    return mergedDeals;
  } catch (err) {
    console.warn('Fallback: getDeals from cache:', err.message);
    if (options?.withCount) {
      const cached = readLocalCache(LOCAL_DEALS_KEY, []);
      return { data: cached.slice(0, clampPageSize(options?.pageSize)), count: cached.length, page: 1, pageSize: clampPageSize(options?.pageSize) };
    }
    return readLocalCache(LOCAL_DEALS_KEY, [
      {
        id: 'deal-001',
        title: 'Full-Stack SaaS Platform MVP',
        client_id: 'client-001',
        pipeline_stage: 'closed_won',
        deal_value: 185000,
        service: 'Web Development',
        expected_close_date: new Date().toISOString().split('T')[0],
        notes: 'Signed contract with advance paid.',
        created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
      {
        id: 'deal-002',
        title: 'Healthcare AI Automation Portal',
        client_id: 'client-002',
        pipeline_stage: 'proposal',
        deal_value: 240000,
        service: 'AI Automation',
        expected_close_date: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
        notes: 'Proposal sent, waiting for board approval.',
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
    ]);
  }
}

export async function createDeal(dealData) {
  if (!dealData?.lead_id) {
    console.warn('Blocked unlinked pipeline deal creation: lead_id is required.');
    return null;
  }
  try {
    const insertPayload = {
      title: dealData.title,
      client_id: dealData.client_id || null,
      lead_id: dealData.lead_id || null,
      pipeline_stage: dealData.pipeline_stage || 'contacted',
      deal_value: Number(dealData.deal_value || dealData.value) || 0,
      service: dealData.service || 'Web Development',
      assigned_to: dealData.assigned_to || null,
      expected_close_date: dealData.expected_close_date || null,
      reminder_before_minutes: Number(dealData.reminder_before_minutes) || 10,
      loss_reason: dealData.loss_reason || null,
      notes: dealData.notes || '',
    };
    const { data, error } = await supabase
      .from('deals')
      .insert([insertPayload])
      .select();

    if (error) throw error;
    const created = { ...dealData, ...(data?.[0] || insertPayload) };
    const current = readLocalCache(LOCAL_DEALS_KEY, []);
    writeLocalCache(LOCAL_DEALS_KEY, [created, ...current]);
    sendDealStageMetaEvent(created, created.pipeline_stage || dealData.pipeline_stage);
    return created;
  } catch (err) {
    console.warn('Fallback: createDeal in cache:', err.message);
    const fallback = {
      ...dealData,
      id: `deal-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const current = readLocalCache(LOCAL_DEALS_KEY, []);
    writeLocalCache(LOCAL_DEALS_KEY, [fallback, ...current]);
    sendDealStageMetaEvent(fallback, fallback.pipeline_stage);
    return fallback;
  }
}

export async function updateDealStage(dealId, newStage, extra = {}) {
  try {
    const { data, error } = await supabase
      .from('deals')
      .update({ pipeline_stage: newStage, ...extra, updated_at: new Date().toISOString() })
      .eq('id', dealId)
      .select();

    if (error) throw error;
    const current = readLocalCache(LOCAL_DEALS_KEY, []);
    writeLocalCache(
      LOCAL_DEALS_KEY,
      current.map((d) => (d.id === dealId ? { ...d, pipeline_stage: newStage, ...extra } : d))
    );
    const updatedDeal = data?.[0] || null;
    if (updatedDeal) sendDealStageMetaEvent(updatedDeal, newStage);
    return updatedDeal;
  } catch (err) {
    console.warn('Fallback: updateDealStage in cache:', err.message);
    const current = readLocalCache(LOCAL_DEALS_KEY, []);
    const updated = current.map((d) => (d.id === dealId ? { ...d, pipeline_stage: newStage, ...extra } : d));
    writeLocalCache(LOCAL_DEALS_KEY, updated);
    const updatedDeal = updated.find((d) => d.id === dealId) || null;
    if (updatedDeal) sendDealStageMetaEvent(updatedDeal, newStage);
    return updatedDeal;
  }
}

export async function updateDeal(dealId, updates = {}) {
  try {
    const payload = {
      ...(updates.title !== undefined && { title: updates.title }),
      ...(updates.deal_value !== undefined && { deal_value: Number(updates.deal_value) || 0 }),
      ...(updates.pipeline_stage !== undefined && { pipeline_stage: updates.pipeline_stage }),
      ...(updates.service !== undefined && { service: updates.service }),
      ...(updates.client_id !== undefined && { client_id: updates.client_id || null }),
      ...(updates.lead_id !== undefined && { lead_id: updates.lead_id || null }),
      ...(updates.assigned_to !== undefined && { assigned_to: updates.assigned_to || null }),
      ...(updates.expected_close_date !== undefined && { expected_close_date: updates.expected_close_date || null }),
      ...(updates.loss_reason !== undefined && { loss_reason: updates.loss_reason || null }),
      ...(updates.notes !== undefined && { notes: updates.notes || '' }),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('deals')
      .update(payload)
      .eq('id', dealId)
      .select();

    if (error) throw error;
    const current = readLocalCache(LOCAL_DEALS_KEY, []);
    const updated = current.map((d) => (d.id === dealId ? { ...d, ...updates } : d));
    writeLocalCache(LOCAL_DEALS_KEY, updated);
    const updatedDeal = data?.[0] || updated.find((d) => d.id === dealId) || null;
    if (updatedDeal && updates.pipeline_stage) sendDealStageMetaEvent(updatedDeal, updates.pipeline_stage);
    return updatedDeal;
  } catch (err) {
    console.warn('Fallback: updateDeal in cache:', err.message);
    const current = readLocalCache(LOCAL_DEALS_KEY, []);
    const updated = current.map((d) => (d.id === dealId ? { ...d, ...updates } : d));
    writeLocalCache(LOCAL_DEALS_KEY, updated);
    const updatedDeal = updated.find((d) => d.id === dealId) || null;
    if (updatedDeal && updates.pipeline_stage) sendDealStageMetaEvent(updatedDeal, updates.pipeline_stage);
    return updatedDeal;
  }
}

export async function deleteDeal(dealId) {
  try {
    const { error } = await supabase
      .from('deals')
      .delete()
      .eq('id', dealId);

    if (error) throw error;
    const current = readLocalCache(LOCAL_DEALS_KEY, []);
    writeLocalCache(
      LOCAL_DEALS_KEY,
      current.filter((d) => d.id !== dealId)
    );
    return true;
  } catch (err) {
    console.warn('Fallback: deleteDeal in cache:', err.message);
    const current = readLocalCache(LOCAL_DEALS_KEY, []);
    writeLocalCache(
      LOCAL_DEALS_KEY,
      current.filter((d) => d.id !== dealId)
    );
    return true;
  }
}

export async function getCloudDealsSummary(options = {}) {
  try {
    const apiResult = await fetchCrmListFromApi('deals_summary', options);
    if (apiResult && typeof apiResult.total === 'number') return apiResult;
  } catch (err) {
    console.warn('Deals summary API error:', err.message);
  }
  return null;
}
