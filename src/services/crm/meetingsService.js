import {
  supabase,
  clampPageSize,
  escapeSupabaseLike,
  fetchCrmListFromApi,
  readLocalCache,
  writeLocalCache,
  mergeCloudAndLocal,
  pickPayload,
  LOCAL_SALES_MEETINGS_KEY,
} from '../supabase/client';

export const SALES_MEETING_COLUMNS = [
  'lead_id',
  'deal_id',
  'host_id',
  'title',
  'meeting_type',
  'scheduled_at',
  'reminder_before_minutes',
  'duration_minutes',
  'meeting_link',
  'location',
  'status',
  'agenda',
  'outcome',
  'next_action',
  'created_by',
];

export async function getSalesMeetings(options = null) {
  try {
    const useOptions = options && typeof options === 'object';
    const pageSize = clampPageSize(options?.pageSize, useOptions ? 50 : 200);
    const page = Math.max(Number.parseInt(options?.page || 1, 10) || 1, 1);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const withCount = Boolean(options?.withCount);

    if (useOptions) {
      const apiResult = await fetchCrmListFromApi('sales_meetings', { ...options, page, pageSize });
      if (apiResult?.data) return withCount ? apiResult : apiResult.data;
    }

    let query = supabase
      .from('sales_meetings')
      .select('*', withCount ? { count: 'exact' } : undefined)
      .order('scheduled_at', { ascending: true });

    if (options?.status && options.status !== 'all') {
      if (options.status === 'today') {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        query = query.gte('scheduled_at', todayStart.toISOString()).lte('scheduled_at', todayEnd.toISOString());
      } else if (options.status === 'no_show') {
        query = query.in('status', ['no_show', 'cancelled']);
      } else if (options.status === 'overdue') {
        query = query.in('status', ['scheduled', 'confirmed']).lt('scheduled_at', new Date().toISOString());
      } else if (options.status === 'completed') {
        query = query.eq('status', 'completed');
      } else if (options.status === 'scheduled' || options.status === 'active') {
        query = query.in('status', ['scheduled', 'confirmed']);
      } else {
        query = query.eq('status', options.status);
      }
    }
    if (options?.dateFrom) query = query.gte('scheduled_at', options.dateFrom);
    if (options?.dateTo) query = query.lte('scheduled_at', options.dateTo);
    const search = String(options?.search || '').trim();
    if (search) {
      const like = `%${escapeSupabaseLike(search)}%`;
      query = query.or([
        `title.ilike.${like}`,
        `meeting_type.ilike.${like}`,
        `status.ilike.${like}`,
        `agenda.ilike.${like}`,
        `outcome.ilike.${like}`,
        `next_action.ilike.${like}`,
      ].join(','));
    }

    query = useOptions ? query.range(from, to) : query.limit(pageSize);

    const { data, error, count } = await query;

    if (error) throw error;
    if (withCount) {
      writeLocalCache(LOCAL_SALES_MEETINGS_KEY, mergeCloudAndLocal(data || [], readLocalCache(LOCAL_SALES_MEETINGS_KEY, [])));
      return { data: data || [], count: count || 0, page, pageSize };
    }
    const merged = mergeCloudAndLocal(data || [], readLocalCache(LOCAL_SALES_MEETINGS_KEY, []))
      .sort((a, b) => new Date(a.scheduled_at || a.created_at || 0).getTime() - new Date(b.scheduled_at || b.created_at || 0).getTime());
    writeLocalCache(LOCAL_SALES_MEETINGS_KEY, merged);
    return merged;
  } catch (err) {
    console.warn('Fallback: getSalesMeetings from cache:', err.message);
    if (options?.withCount) {
      const cached = readLocalCache(LOCAL_SALES_MEETINGS_KEY, []);
      return { data: cached.slice(0, clampPageSize(options?.pageSize)), count: cached.length, page: 1, pageSize: clampPageSize(options?.pageSize) };
    }
    return readLocalCache(LOCAL_SALES_MEETINGS_KEY, []);
  }
}

export async function createSalesMeeting(meetingData) {
  try {
    if (meetingData.lead_id || meetingData.deal_id) {
      let checkQuery = supabase
        .from('sales_meetings')
        .select('id, title, scheduled_at, status')
        .not('status', 'in', '("completed","done","no_show","noshow","cancelled","missed")')
        .limit(1);

      if (meetingData.lead_id) {
        checkQuery = checkQuery.eq('lead_id', meetingData.lead_id);
      } else if (meetingData.deal_id) {
        checkQuery = checkQuery.eq('deal_id', meetingData.deal_id);
      }

      const { data: existingActive } = await checkQuery;
      if (existingActive && existingActive.length > 0) {
        console.warn(`Prevented duplicate active meeting for lead ${meetingData.lead_id || meetingData.deal_id}`);
        return existingActive[0];
      }
    }

    const insertPayload = pickPayload(meetingData, SALES_MEETING_COLUMNS);
    const { data, error } = await supabase
      .from('sales_meetings')
      .insert([insertPayload])
      .select();

    if (error) throw error;
    const created = { ...meetingData, ...(data?.[0] || insertPayload) };
    const current = readLocalCache(LOCAL_SALES_MEETINGS_KEY, []);
    writeLocalCache(LOCAL_SALES_MEETINGS_KEY, [created, ...current]);
    return created;
  } catch (err) {
    console.warn('Fallback: createSalesMeeting in cache:', err.message);
    const fallback = { ...meetingData, id: `sales-meeting-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    const current = readLocalCache(LOCAL_SALES_MEETINGS_KEY, []);
    writeLocalCache(LOCAL_SALES_MEETINGS_KEY, [fallback, ...current]);
    return fallback;
  }
}

export async function updateSalesMeeting(meetingId, updates) {
  try {
    const updatePayload = pickPayload(updates, SALES_MEETING_COLUMNS);
    const { data, error } = await supabase
      .from('sales_meetings')
      .update({ ...updatePayload, updated_at: new Date().toISOString() })
      .eq('id', meetingId)
      .select();

    if (error) throw error;
    const current = readLocalCache(LOCAL_SALES_MEETINGS_KEY, []);
    const merged = current.map((item) => (item.id === meetingId ? { ...item, ...updates } : item));
    writeLocalCache(LOCAL_SALES_MEETINGS_KEY, merged);
    return data?.[0] || merged.find((item) => item.id === meetingId) || null;
  } catch (err) {
    console.warn('Fallback: updateSalesMeeting in cache:', err.message);
    const current = readLocalCache(LOCAL_SALES_MEETINGS_KEY, []);
    const updated = current.map((item) => (item.id === meetingId ? { ...item, ...updates } : item));
    writeLocalCache(LOCAL_SALES_MEETINGS_KEY, updated);
    return updated.find((item) => item.id === meetingId) || null;
  }
}

export async function deleteSalesMeeting(meetingId) {
  try {
    const { error } = await supabase
      .from('sales_meetings')
      .delete()
      .eq('id', meetingId);

    if (error) throw error;
  } catch (err) {
    console.warn('Fallback: deleteSalesMeeting in cache:', err.message);
  }
  const current = readLocalCache(LOCAL_SALES_MEETINGS_KEY, []);
  const updated = current.filter((item) => item.id !== meetingId);
  writeLocalCache(LOCAL_SALES_MEETINGS_KEY, updated);
  return true;
}

export async function rescheduleSalesMeeting(meetingId, newScheduledAt, notes = '') {
  const updates = { scheduled_at: newScheduledAt, status: 'scheduled' };
  if (notes) updates.agenda = notes;
  return updateSalesMeeting(meetingId, updates);
}

export async function updateSalesMeetingStatus(meetingId, status, outcome = '') {
  const updates = { status };
  if (outcome) updates.outcome = outcome;
  return updateSalesMeeting(meetingId, updates);
}

export async function getCloudMeetingsSummary(options = {}) {
  try {
    const apiResult = await fetchCrmListFromApi('meetings_summary', options);
    if (apiResult && typeof apiResult.total === 'number') return apiResult;
  } catch (err) {
    console.warn('Meetings summary API error:', err.message);
  }
  return null;
}
