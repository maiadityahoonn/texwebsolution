import {
  supabase,
  clampPageSize,
  escapeSupabaseLike,
  fetchCrmListFromApi,
  readLocalCache,
  writeLocalCache,
  pickPayload,
  LOCAL_SALES_FOLLOWUPS_KEY,
} from '../supabase/client';

export const SALES_FOLLOWUP_COLUMNS = [
  'lead_id',
  'deal_id',
  'assigned_to',
  'title',
  'channel',
  'due_at',
  'reminder_before_minutes',
  'status',
  'priority',
  'notes',
  'completed_at',
  'created_by',
];

export async function getSalesFollowUps(options = null) {
  try {
    const useOptions = options && typeof options === 'object';
    const pageSize = clampPageSize(options?.pageSize, useOptions ? 50 : 200);
    const page = Math.max(Number.parseInt(options?.page || 1, 10) || 1, 1);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const withCount = Boolean(options?.withCount);

    if (useOptions) {
      const apiResult = await fetchCrmListFromApi('sales_followups', { ...options, page, pageSize });
      if (apiResult?.data) return withCount ? apiResult : apiResult.data;
    }

    let query = supabase
      .from('sales_followups')
      .select('*', withCount ? { count: 'exact' } : undefined)
      .order('due_at', { ascending: true });

    if (options?.status && options.status !== 'all') query = query.eq('status', options.status);
    if (options?.dateFrom) query = query.gte('due_at', options.dateFrom);
    if (options?.dateTo) query = query.lte('due_at', options.dateTo);
    const search = String(options?.search || '').trim();
    if (search) {
      const like = `%${escapeSupabaseLike(search)}%`;
      query = query.or([
        `title.ilike.${like}`,
        `channel.ilike.${like}`,
        `status.ilike.${like}`,
        `notes.ilike.${like}`,
      ].join(','));
    }

    query = useOptions ? query.range(from, to) : query.limit(pageSize);

    const { data, error, count } = await query;

    if (error) throw error;
    if (withCount) {
      writeLocalCache(LOCAL_SALES_FOLLOWUPS_KEY, data || []);
      return { data: data || [], count: count || 0, page, pageSize };
    }
    const sorted = (data || []).sort((a, b) => new Date(a.due_at || a.created_at || 0).getTime() - new Date(b.due_at || b.created_at || 0).getTime());
    writeLocalCache(LOCAL_SALES_FOLLOWUPS_KEY, sorted);
    return sorted;
  } catch (err) {
    console.warn('Fallback: getSalesFollowUps from cache:', err.message);
    if (options?.withCount) {
      const cached = readLocalCache(LOCAL_SALES_FOLLOWUPS_KEY, []);
      return { data: cached.slice(0, clampPageSize(options?.pageSize)), count: cached.length, page: 1, pageSize: clampPageSize(options?.pageSize) };
    }
    return readLocalCache(LOCAL_SALES_FOLLOWUPS_KEY, []);
  }
}

export async function createSalesFollowUp(followUpData) {
  try {
    const insertPayload = pickPayload(followUpData, SALES_FOLLOWUP_COLUMNS);
    const { data, error } = await supabase
      .from('sales_followups')
      .insert([insertPayload])
      .select();

    if (error) throw error;
    const created = { ...followUpData, ...(data?.[0] || insertPayload) };
    const current = readLocalCache(LOCAL_SALES_FOLLOWUPS_KEY, []);
    writeLocalCache(LOCAL_SALES_FOLLOWUPS_KEY, [created, ...current]);
    return created;
  } catch (err) {
    console.warn('Fallback: createSalesFollowUp in cache:', err.message);
    const fallback = { ...followUpData, id: `followup-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    const current = readLocalCache(LOCAL_SALES_FOLLOWUPS_KEY, []);
    writeLocalCache(LOCAL_SALES_FOLLOWUPS_KEY, [fallback, ...current]);
    return fallback;
  }
}

export async function updateSalesFollowUp(followUpId, updates) {
  try {
    const updatePayload = pickPayload(updates, SALES_FOLLOWUP_COLUMNS);
    const { data, error } = await supabase
      .from('sales_followups')
      .update({ ...updatePayload, updated_at: new Date().toISOString() })
      .eq('id', followUpId)
      .select();

    if (error) throw error;
    const current = readLocalCache(LOCAL_SALES_FOLLOWUPS_KEY, []);
    const merged = current.map((item) => (item.id === followUpId ? { ...item, ...updates } : item));
    writeLocalCache(LOCAL_SALES_FOLLOWUPS_KEY, merged);
    return data?.[0] || merged.find((item) => item.id === followUpId) || null;
  } catch (err) {
    console.warn('Fallback: updateSalesFollowUp in cache:', err.message);
    const current = readLocalCache(LOCAL_SALES_FOLLOWUPS_KEY, []);
    const updated = current.map((item) => (item.id === followUpId ? { ...item, ...updates } : item));
    writeLocalCache(LOCAL_SALES_FOLLOWUPS_KEY, updated);
    return updated.find((item) => item.id === followUpId) || null;
  }
}

export async function deleteSalesFollowUp(followUpId) {
  try {
    const { error } = await supabase
      .from('sales_followups')
      .delete()
      .eq('id', followUpId);

    if (error) throw error;
  } catch (err) {
    console.warn('Fallback: deleteSalesFollowUp in cache:', err.message);
  }
  const current = readLocalCache(LOCAL_SALES_FOLLOWUPS_KEY, []);
  const updated = current.filter((item) => item.id !== followUpId);
  writeLocalCache(LOCAL_SALES_FOLLOWUPS_KEY, updated);
  return true;
}

export function isFollowUpOverdue(followUp) {
  if (!followUp?.due_at || followUp.status === 'done' || followUp.status === 'completed') return false;
  return new Date(followUp.due_at).getTime() < Date.now();
}

export async function rescheduleFollowUp(followUpId, newDueAt, notes = '') {
  const updates = { due_at: newDueAt, status: 'scheduled' };
  if (notes) updates.notes = notes;
  return updateSalesFollowUp(followUpId, updates);
}

export async function markFollowUpDone(followUpId, notes = '') {
  const updates = { status: 'done', completed_at: new Date().toISOString() };
  if (notes) updates.notes = notes;
  return updateSalesFollowUp(followUpId, updates);
}

export async function markFollowUpMissed(followUpId, notes = '') {
  const updates = { status: 'missed' };
  if (notes) updates.notes = notes;
  return updateSalesFollowUp(followUpId, updates);
}
