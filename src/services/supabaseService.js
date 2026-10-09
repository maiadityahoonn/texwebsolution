import { supabase } from '@/lib/supabase';

// ==========================================
// 1. LEADS & CRM MANAGEMENT
// ==========================================
async function sendMetaCrmEvent(lead, status = lead?.status || 'New') {
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

function mapDealStageToLeadStatus(stage) {
  const value = String(stage || '').toLowerCase();
  if (value === 'closed_lost') return 'Lost';
  if (value === 'closed_won') return 'Closed Won';
  if (value.includes('negotiation')) return 'Negotiation';
  if (value.includes('proposal')) return 'Proposal Sent';
  if (value.includes('qualified') || value.includes('requirement')) return 'Qualified';
  if (value.includes('contacted') || value.includes('meeting')) return 'Meeting';
  return 'Lead';
}

function extractMetaLeadKey(lead) {
  const notes = String(lead?.notes || "");
  const match = notes.match(/(?:Meta Lead ID|Meta ID|Leadgen ID)\s*:\s*(l:)?(\d{10,25})/i);
  if (match) return `l:${match[2]}`;
  const direct = lead?.meta_lead_id || lead?.leadgen_id || lead?.lead_id;
  if (!direct) return "";
  const digits = String(direct).replace(/\D/g, "");
  return digits ? `l:${digits}` : "";
}

function escapeSupabaseLike(value) {
  return String(value || "").replace(/[%_,]/g, (match) => `\\${match}`);
}

function clampPageSize(value, fallback = 50, max = 200) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, max);
}

async function fetchCrmListFromApi(resource, options = {}) {
  if (typeof window === 'undefined') return null;
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (!token) return null;
    const params = new URLSearchParams();
    params.set('resource', resource);
    if (options.page) params.set('page', String(options.page));
    if (options.pageSize) params.set('pageSize', String(options.pageSize));
    if (options.search) params.set('search', options.search);
    if (options.status) params.set('status', options.status);
    if (options.stage) params.set('stage', options.stage);
    if (options.dateFrom) params.set('dateFrom', options.dateFrom);
    if (options.dateTo) params.set('dateTo', options.dateTo);
    const response = await fetch(`/api/crm/list?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) return null;
    return response.json();
  } catch (err) {
    console.warn('CRM API list fetch skipped:', err.message);
    return null;
  }
}

const ARCHIVED_LEAD_STATUSES = ['Converted', 'Lost', 'Archived', 'Closed Won'];

function toPostgrestInList(values = []) {
  return `(${values.map((value) => `"${String(value).replace(/"/g, '\\"')}"`).join(',')})`;
}

async function getPipelineLeadIds() {
  const { data, error } = await supabase
    .from('deals')
    .select('lead_id')
    .not('lead_id', 'is', null);
  if (error) {
    console.warn('Pipeline lead filter skipped:', error.message);
    return [];
  }
  return [...new Set((data || []).map((deal) => deal.lead_id).filter(Boolean))];
}

async function sendDealStageMetaEvent(deal, stage) {
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
      .select('*', withCount ? { count: 'exact' } : undefined)
      .order('created_at', { ascending: false });

    if (options?.status === 'active') {
      const pipelineLeadIds = await getPipelineLeadIds();
      query = query.not('status', 'in', toPostgrestInList(ARCHIVED_LEAD_STATUSES));
      if (pipelineLeadIds.length > 0) {
        query = query.not('id', 'in', toPostgrestInList(pipelineLeadIds));
      }
    } else if (options?.status === 'archived') {
      const pipelineLeadIds = await getPipelineLeadIds();
      const archivedStatusFilter = `status.in.${toPostgrestInList(ARCHIVED_LEAD_STATUSES)}`;
      const pipelineFilter = pipelineLeadIds.length > 0 ? `id.in.${toPostgrestInList(pipelineLeadIds)}` : "";
      query = query.or([archivedStatusFilter, pipelineFilter].filter(Boolean).join(','));
    } else if (options?.status === 'converted') {
      query = query.in('status', ['Converted', 'Closed Won']);
    } else if (options?.status === 'lost') {
      query = query.eq('status', 'Lost');
    } else if (options?.status === 'pipeline') {
      const pipelineLeadIds = await getPipelineLeadIds();
      if (pipelineLeadIds.length > 0) {
        query = query.in('id', pipelineLeadIds);
      } else {
        query = query.in('status', ['Contacted', 'Qualified', 'Proposal Sent', 'In Pipeline', 'Negotiation']);
      }
    } else if (options?.status && options.status !== 'all') {
      query = query.eq('status', options.status);
    }

    if (options?.source) {
      query = query.eq('source', options.source);
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

    let qTotal = supabase.from('leads').select('id', { count: 'exact', head: true });
    let qConverted = supabase.from('leads').select('id', { count: 'exact', head: true }).in('status', ['Converted', 'Closed Won']);
    let qLost = supabase.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'Lost');

    if (options?.dateFrom) {
      qTotal = qTotal.gte('created_at', options.dateFrom);
      qConverted = qConverted.gte('created_at', options.dateFrom);
      qLost = qLost.gte('created_at', options.dateFrom);
    }
    if (options?.dateTo) {
      qTotal = qTotal.lte('created_at', options.dateTo);
      qConverted = qConverted.lte('created_at', options.dateTo);
      qLost = qLost.lte('created_at', options.dateTo);
    }

    const [resTotal, resConverted, resLost] = await Promise.all([qTotal, qConverted, qLost]);

    return {
      total: resTotal.count || 0,
      converted: resConverted.count || 0,
      lost: resLost.count || 0,
    };
  } catch (err) {
    console.warn('Error fetching lead summary:', err.message);
    return { total: 0, converted: 0, lost: 0 };
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
    // Direct Supabase insert first
    const { data, error } = await supabase
      .from('leads')
      .insert([payload])
      .select();

    if (!error && data?.[0]) {
      sendMetaCrmEvent(data[0], data[0].status);
      return data[0];
    }

    // Fallback to API route
    const response = await fetch('/api/leads/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result.error || 'Lead submission failed');
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
    }));

    const { data: existingLeads } = await supabase
      .from('leads')
      .select('email,phone,notes');

    const existingMetaIds = new Set((existingLeads || []).map(extractMetaLeadKey).filter(Boolean));
    const existingContacts = new Set(
      (existingLeads || [])
        .map((lead) => `${String(lead.email || "").toLowerCase()}|${String(lead.phone || "").replace(/\D/g, "")}`)
        .filter((key) => key !== "|")
    );
    const seenMetaIds = new Set();
    const seenContacts = new Set();
    const payloads = incomingPayloads.filter((lead) => {
      const metaId = extractMetaLeadKey(lead);
      const contactKey = `${String(lead.email || "").toLowerCase()}|${String(lead.phone || "").replace(/\D/g, "")}`;
      const hasContact = contactKey !== "|";
      if (metaId && (existingMetaIds.has(metaId) || seenMetaIds.has(metaId))) return false;
      if (!metaId && hasContact && (existingContacts.has(contactKey) || seenContacts.has(contactKey))) return false;
      if (metaId) seenMetaIds.add(metaId);
      if (hasContact) seenContacts.add(contactKey);
      return true;
    });

    if (!payloads.length) return [];

    const { data, error } = await supabase
      .from('leads')
      .insert(payloads)
      .select();

    if (!error && Array.isArray(data)) {
      data.forEach((lead) => sendMetaCrmEvent(lead, lead.status));
      return data;
    }

    const results = [];
    for (const p of payloads) {
      const res = await createCloudLead(p);
      if (res) results.push(res);
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
    const { data, error } = await supabase
      .from('leads')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', leadId)
      .select();

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
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', leadId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error deleting lead:', err.message);
    return false;
  }
}

// ==========================================
// 2. PROFILES & ROLES
// ==========================================
export async function getProfiles() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((p) => {
      let mappedRole = p.role;
      if (p.role === "intern" || !p.role) {
        if (p.designation === "Sales Head" || (p.domain === "sales" && p.designation?.toLowerCase().includes("head"))) {
          mappedRole = "sales_head";
        } else if (p.designation === "Sales Executive") {
          mappedRole = "sales_executive";
        } else if (p.designation === "Telecaller") {
          mappedRole = "telecaller";
        } else if (p.designation === "Tech Lead") {
          mappedRole = "tech_lead";
        } else if (p.designation === "Project Manager" || p.designation === "PM") {
          mappedRole = "pm";
        } else if (p.designation === "SMM Head") {
          mappedRole = "smm_head";
        } else if (p.designation === "Finance Head") {
          mappedRole = "finance_head";
        } else if (p.designation === "Support Head") {
          mappedRole = "support_head";
        }
      }
      return { ...p, role: mappedRole };
    });
  } catch (err) {
    console.warn('Error fetching profiles:', err.message);
    return [];
  }
}

export async function createProfile(profileData) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([profileData])
      .select();

    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error('Error creating profile:', err.message);
    return null;
  }
}

export async function updateUserProfile(userId, updates) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select();

    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error('Error updating profile:', err.message);
    throw err;
  }
}

export async function getBatches(userId, role) {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      const response = await fetch('/api/admin/batches', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (response.ok) {
        const result = await response.json().catch(() => ({}));
        return result.batches || [];
      }
    }

    let query = supabase
      .from('batches')
      .select('*, hr:profiles!batches_hr_id_fkey(*), mentor:profiles!batches_mentor_id_fkey(*), tl:profiles!batches_tl_id_fkey(*)')
      .order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) {
      // Graceful fallback in case foreign key relations are named differently in PostgreSQL
      let fallbackQuery = supabase
        .from('batches')
        .select('*')
        .order('created_at', { ascending: false });
      const { data: fallbackData, error: fallbackError } = await fallbackQuery;
      if (fallbackError) throw fallbackError;
      return fallbackData || [];
    }
    return data || [];
  } catch (err) {
    console.warn('Error fetching batches:', err.message);
    return [];
  }
}

export async function createBatch(batchData) {
  try {
    const { data, error } = await supabase
      .from('batches')
      .insert([batchData])
      .select();

    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    if (/batch_type/i.test(err.message || '')) {
      const legacyBatchData = { ...batchData };
      delete legacyBatchData.batch_type;
      try {
        const { data, error } = await supabase
          .from('batches')
          .insert([legacyBatchData])
          .select();
        if (error) throw error;
        return data?.[0] ? { ...data[0], batch_type: batchData.batch_type || 'internship' } : null;
      } catch (fallbackErr) {
        console.error('Error creating batch fallback:', fallbackErr.message);
      }
    }
    console.error('Error creating batch:', err.message);
    return null;
  }
}

export async function updateBatch(batchId, updates) {
  try {
    const { data, error } = await supabase
      .from('batches')
      .update(updates)
      .eq('id', batchId)
      .select();

    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    if (/batch_type/i.test(err.message || '')) {
      const legacyUpdates = { ...updates };
      delete legacyUpdates.batch_type;
      try {
        const { data, error } = await supabase
          .from('batches')
          .update(legacyUpdates)
          .eq('id', batchId)
          .select();
        if (error) throw error;
        return data?.[0] ? { ...data[0], batch_type: updates.batch_type || 'internship' } : null;
      } catch (fallbackErr) {
        console.error('Error updating batch fallback:', fallbackErr.message);
      }
    }
    console.error('Error updating batch:', err.message);
    return null;
  }
}

export async function createMemberAssignment(assignmentData) {
  try {
    const { data, error } = await supabase
      .from('member_assignments')
      .insert([assignmentData])
      .select();

    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error('Error creating member assignment:', err.message);
    return null;
  }
}

// ==========================================
// 3. TASKS & SUBMISSIONS
// ==========================================
function normalizeBatchIds(batchIdOrIds) {
  if (Array.isArray(batchIdOrIds)) return batchIdOrIds.filter(Boolean);
  return batchIdOrIds ? [batchIdOrIds] : [];
}

export async function getTasks(userRole, userId, domain, batchIdOrIds) {
  try {
    const batchIds = normalizeBatchIds(batchIdOrIds);
    let query = supabase.from('tasks').select('*, assigned_to_profile:profiles!tasks_assigned_to_fkey(*), assigned_by_profile:profiles!tasks_assigned_by_fkey(*)').order('created_at', { ascending: false });

    if (userRole === 'intern' && userId) {
      if (batchIds[0]) {
        query = query.or(`assigned_to.eq.${userId},and(batch_id.eq.${batchIds[0]},visible_to_interns.eq.true)`);
      } else {
        query = query.eq('assigned_to', userId);
      }
    } else if ((userRole === 'team_leader' || userRole === 'mentor') && domain) {
      if (batchIds.length > 1) {
        query = query.in('batch_id', batchIds);
      } else if (batchIds.length === 1) {
        query = query.eq('batch_id', batchIds[0]);
      } else {
        query = query.eq('domain', domain);
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('Error fetching tasks:', err.message);
    try {
      let fallback = supabase.from('tasks').select('*, assigned_to_profile:profiles!tasks_assigned_to_fkey(*), assigned_by_profile:profiles!tasks_assigned_by_fkey(*)').order('created_at', { ascending: false });
      if (userRole === 'intern' && userId) fallback = fallback.eq('assigned_to', userId);
      else if ((userRole === 'team_leader' || userRole === 'mentor') && domain) fallback = fallback.eq('domain', domain);
      const { data, error } = await fallback;
      if (error) throw error;
      return data || [];
    } catch (fallbackErr) {
      console.warn('Fallback task fetch failed:', fallbackErr.message);
      return [];
    }
  }
}

export async function createCloudTask(taskData) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (token) {
      const response = await fetch('/api/tasks/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskData),
      });
      const result = await response.json().catch(() => ({}));
      if (response.ok) return result.task || result.tasks?.[0] || null;
      console.warn('Task create API failed, trying direct insert:', result.error || response.status);
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select();

    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    if (/batch_id|visible_to_interns|reference_url|file_url|file_name|file_type|file_size|assignment_scope|start_date|expected_output/i.test(err.message || '')) {
      const legacyTaskData = { ...taskData };
      delete legacyTaskData.batch_id;
      delete legacyTaskData.visible_to_interns;
      delete legacyTaskData.reference_url;
      delete legacyTaskData.file_url;
      delete legacyTaskData.file_name;
      delete legacyTaskData.file_type;
      delete legacyTaskData.file_size;
      delete legacyTaskData.assignment_scope;
      delete legacyTaskData.start_date;
      delete legacyTaskData.expected_output;
      try {
        const { data, error } = await supabase
          .from('tasks')
          .insert([legacyTaskData])
          .select();
        if (error) throw error;
        return data?.[0] || null;
      } catch (fallbackErr) {
        console.error('Error creating task fallback:', fallbackErr.message);
      }
    } else {
      console.error('Error creating task:', err.message);
    }
    return null;
  }
}

export async function uploadTaskReferenceFile(file, userId) {
  try {
    if (!file || !userId) return null;
    const safeName = `${Date.now()}-${file.name || 'task-reference'}`.replace(/[^a-zA-Z0-9._-]/g, '-');
    const filePath = `${userId}/task-references/${safeName}`;
    const { data, error } = await supabase.storage
      .from('task-submissions')
      .upload(filePath, file, { upsert: true });

    if (error) throw error;
    return {
      file_url: data?.path || filePath,
      file_name: file.name,
      file_type: file.type || null,
      file_size: file.size || 0,
    };
  } catch (err) {
    console.error('Error uploading task reference file:', err.message);
    return null;
  }
}

export async function updateCloudTaskStatus(taskId, status) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (!token) throw new Error('Missing auth session for task update');
    const response = await fetch('/api/tasks/status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ task_id: taskId, status }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Task status update failed');
    return result.task || null;
  } catch (err) {
    console.error('Error updating task status:', err.message);
    return null;
  }
}

export async function submitTaskWork(submissionData) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (token) {
      const response = await fetch('/api/tasks/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submissionData),
      });
      const result = await response.json().catch(() => ({}));
      if (response.ok) return result.submission || null;
      throw new Error(result.error || 'Task submission failed');
    }

    const { data, error } = await supabase
      .from('task_submissions')
      .insert([submissionData])
      .select();

    if (error) throw error;

    // Auto mark task as submitted
    if (submissionData.task_id) {
      await updateCloudTaskStatus(submissionData.task_id, 'submitted');
    }

    return data?.[0] || null;
  } catch (err) {
    console.error('Error submitting work:', err.message);
    return null;
  }
}

export async function uploadSubmissionFile(file, userId, taskId) {
  try {
    if (!file || !userId || !taskId) return null;
    const ext = file.name?.split('.').pop() || 'file';
    const safeName = `${Date.now()}-${file.name || `submission.${ext}`}`.replace(/[^a-zA-Z0-9._-]/g, '-');
    const filePath = `${userId}/${taskId}/${safeName}`;
    const { data, error } = await supabase.storage
      .from('task-submissions')
      .upload(filePath, file, { upsert: true });

    if (error) throw error;
    return {
      file_url: data?.path || filePath,
      file_name: file.name,
      file_type: file.type || null,
      file_size: file.size || 0,
    };
  } catch (err) {
    console.error('Error uploading submission file:', err.message);
    return null;
  }
}

export async function getSubmissionFileUrl(filePath) {
  try {
    if (!filePath) return '';
    if (filePath.startsWith('http')) return filePath;
    const { data, error } = await supabase.storage
      .from('task-submissions')
      .createSignedUrl(filePath, 60 * 60);
    if (error) throw error;
    return data?.signedUrl || '';
  } catch (err) {
    console.warn('Error creating submission signed URL:', err.message);
    return '';
  }
}

export async function uploadBatchFile(file, batchId = 'general') {
  try {
    if (!file) return null;

    // 1. Primary: Server-side upload via admin service-role (bypasses RLS issues)
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (token) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("batch_id", batchId);

        const res = await fetch("/api/batch-workspace/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (res.ok) {
          const result = await res.json();
          if (result?.file_url) {
            return {
              file_url: result.file_url,
              file_name: result.file_name || file.name,
              file_type: result.file_type || file.type,
              file_size: result.file_size || file.size,
            };
          }
        }
      }
    } catch (apiErr) {
      console.warn("Server upload API failed, falling back to client upload:", apiErr?.message);
    }

    // 2. Secondary: Client storage attempt
    const ext = file.name?.split('.').pop()?.toLowerCase() || 'file';
    const safeName = `${Date.now()}-${(file.name || `file.${ext}`).replace(/[^a-zA-Z0-9._-]/g, '-')}`;
    const filePath = `batch-${batchId}/${safeName}`;

    const { data, error } = await supabase.storage
      .from('task-submissions')
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type || 'application/octet-stream',
      });

    if (!error && data?.path) {
      const { data: publicUrlData } = supabase.storage
        .from('task-submissions')
        .getPublicUrl(data.path);

      if (publicUrlData?.publicUrl) {
        return {
          file_url: publicUrlData.publicUrl,
          file_name: file.name,
          file_type: file.type || ext,
          file_size: file.size || 0,
        };
      }
    }

    // 3. Last-resort fallback: Base64 Data URL for small files
    if (file instanceof Blob && file.size <= 4 * 1024 * 1024) {
      const dataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });

      if (dataUrl) {
        return {
          file_url: dataUrl,
          file_name: file.name,
          file_type: file.type || ext,
          file_size: file.size || 0,
        };
      }
    }

    return null;
  } catch (err) {
    console.error('Error uploading batch file:', err?.message);
    return null;
  }
}

export async function uploadAvatarImage(file, userId) {
  try {
    if (!file || !userId) return null;
    if (typeof file === "string" && file.startsWith("data:")) {
      return file;
    }

    const isWebp = file.type === "image/webp" || file.name?.endsWith(".webp");
    const ext = isWebp ? "webp" : (file.name?.split(".").pop() || "jpg");
    const safeName = `avatar-${Date.now()}.${ext}`;
    const filePath = `${userId}/${safeName}`;

    // 1. Try public 'avatars' bucket first
    const { error: avatarErr } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        upsert: true,
        contentType: isWebp ? "image/webp" : (file.type || "image/jpeg"),
        cacheControl: "3600",
      });

    if (!avatarErr) {
      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);
      if (publicUrlData?.publicUrl) {
        return publicUrlData.publicUrl;
      }
    }

    // 2. Fallback: try 'task-submissions' bucket
    const { error: taskSubErr } = await supabase.storage
      .from("task-submissions")
      .upload(filePath, file, {
        upsert: true,
        contentType: isWebp ? "image/webp" : (file.type || "image/jpeg"),
        cacheControl: "3600",
      });

    if (!taskSubErr) {
      const { data: publicUrlData } = supabase.storage
        .from("task-submissions")
        .getPublicUrl(filePath);
      if (publicUrlData?.publicUrl) {
        return publicUrlData.publicUrl;
      }
    }

    // 3. Reliable database-direct fallback: WebP Base64 Data URL (stored in profiles.avatar_url)
    if (file instanceof Blob) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
    }
    return null;
  } catch (err) {
    console.warn("Avatar upload fallback to FileReader:", err.message);
    if (file instanceof Blob) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
    }
    return null;
  }
}

export async function getTaskSubmissions() {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (token) {
      const response = await fetch('/api/tasks/submissions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json().catch(() => ({}));
      if (response.ok) return result.submissions || [];
      console.warn('Task submissions API failed, trying direct fetch:', result.error || response.status);
    }

    const { data, error } = await supabase
      .from('task_submissions')
      .select('*, task:tasks(*), intern:profiles!task_submissions_intern_id_fkey(*)')
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('Error fetching task submissions:', err.message);
    return [];
  }
}

export async function createTaskReview(reviewData) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (token) {
      const response = await fetch('/api/tasks/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reviewData),
      });
      const result = await response.json().catch(() => ({}));
      if (response.ok) return result.review || null;
      console.warn('Task review API failed, trying direct insert:', result.error || response.status);
    }

    const { data, error } = await supabase
      .from('task_reviews')
      .insert([reviewData])
      .select();

    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error('Error creating task review:', err.message);
    return null;
  }
}

export async function getTaskReviews() {
  try {
    const { data, error } = await supabase
      .from('task_reviews')
      .select('*, task:tasks(*), submission:task_submissions(*), reviewer:profiles(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('Error fetching task reviews:', err.message);
    return [];
  }
}

export async function getDailyUpdates(userId, role, domain) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (token) {
      const response = await fetch('/api/daily-updates', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json().catch(() => ({}));
      if (response.ok) return result.updates || [];
      console.warn('Daily updates API failed, trying direct fetch:', result.error || response.status);
    }

    let query = supabase
      .from('daily_updates')
      .select('*, tl:profiles!daily_updates_tl_id_fkey(*), mentor:profiles!daily_updates_mentor_id_fkey(*), batch:batches(*), task:tasks(*)')
      .order('created_at', { ascending: false });

    if (role === 'team_leader' && userId) {
      query = query.eq('tl_id', userId);
    } else if (role === 'mentor' && userId) {
      query = query.eq('mentor_id', userId);
    } else if (domain && role !== 'super_admin' && role !== 'hr') {
      query = query.eq('domain', domain);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('Error fetching daily updates:', err.message);
    return [];
  }
}

export async function createDailyUpdate(updateData) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (token) {
      const response = await fetch('/api/daily-updates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });
      const result = await response.json().catch(() => ({}));
      if (response.ok) return result.update || null;
      throw new Error(result.error || 'Daily update failed');
    }

    const { data, error } = await supabase
      .from('daily_updates')
      .insert([updateData])
      .select();

    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error('Error creating daily update:', err.message);
    return null;
  }
}

export async function commentDailyUpdate(updateId, reviewerComment) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (!token) throw new Error('Missing auth session');
    const response = await fetch('/api/daily-updates', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id: updateId, reviewer_comment: reviewerComment }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Daily update comment failed');
    return result.update || null;
  } catch (err) {
    console.error('Error commenting daily update:', err.message);
    return null;
  }
}

export async function getAttendance(userId, role, domain) {
  try {
    let query = supabase
      .from('attendance')
      .select('*, user:profiles!attendance_user_id_fkey(*), marker:profiles!attendance_marked_by_fkey(*), batch:batches(*), meeting:meetings(*)')
      .order('created_at', { ascending: false });

    // Only super_admin, hr, and mentor can access batch/domain attendance history.
    // Team leaders, interns, regular developers, sales employees, etc. can ONLY see their own attendance!
    if (!['super_admin', 'hr', 'mentor'].includes(role) && userId) {
      query = query.eq('user_id', userId);
    } else if (domain && role !== 'super_admin' && role !== 'hr') {
      query = query.eq('domain', domain);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('Error fetching attendance:', err.message);
    return [];
  }
}

export async function markAttendance(attendanceData) {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .insert([attendanceData])
      .select();

    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error('Error marking attendance:', err.message);
    return null;
  }
}

// ==========================================
// 4. MEETINGS SCHEDULER
// ==========================================
export async function getMeetings(userId, role, domain, batchIdOrIds) {
  try {
    const batchIds = normalizeBatchIds(batchIdOrIds);
    let query = supabase.from('meetings').select('*').order('scheduled_at', { ascending: true });
    if (role === 'intern' && userId) {
      if (batchIds[0]) {
        query = query.or(`attendee_id.eq.${userId},batch_id.eq.${batchIds[0]}`);
      } else {
        query = query.eq('attendee_id', userId);
      }
    } else if ((role === 'team_leader' || role === 'mentor') && batchIds.length) {
      if (batchIds.length > 1) {
        query = query.or(`host_id.eq.${userId},attendee_id.eq.${userId},batch_id.in.(${batchIds.join(',')})`);
      } else {
        query = query.or(`host_id.eq.${userId},attendee_id.eq.${userId},batch_id.eq.${batchIds[0]}`);
      }
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('Error fetching meetings:', err.message);
    try {
      let fallback = supabase.from('meetings').select('*').order('scheduled_at', { ascending: true });
      if (role === 'intern' && userId) fallback = fallback.eq('attendee_id', userId);
      const { data, error } = await fallback;
      if (error) throw error;
      return data || [];
    } catch (fallbackErr) {
      console.warn('Fallback meeting fetch failed:', fallbackErr.message);
      return [];
    }
  }
}

export async function createMeeting(meetingData) {
  try {
    const { data, error } = await supabase
      .from('meetings')
      .insert([meetingData])
      .select();

    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    if (/batch_id|domain|attendance_token/i.test(err.message || '')) {
      const meetingMeta = {
        batch_id: meetingData.batch_id,
        domain: meetingData.domain,
        attendance_token: meetingData.attendance_token,
      };
      const legacyMeetingData = { ...meetingData };
      delete legacyMeetingData.batch_id;
      delete legacyMeetingData.domain;
      delete legacyMeetingData.attendance_token;
      try {
        const { data, error } = await supabase
          .from('meetings')
          .insert([legacyMeetingData])
          .select();
        if (error) throw error;
        return data?.[0] ? { ...data[0], ...meetingMeta } : null;
      } catch (fallbackErr) {
        console.error('Error creating meeting fallback:', fallbackErr.message);
      }
    } else {
      console.error('Error creating meeting:', err.message);
    }
    return null;
  }
}

export async function startMeeting(meetingId) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (token) {
      const res = await fetch('/api/meetings/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'start', meeting_id: meetingId }),
      });
      if (res.ok) {
        const result = await res.json();
        return result.meeting || null;
      }
    }

    // Direct fallback
    const { data: current } = await supabase.from('meetings').select('attendance_token, status').eq('id', meetingId).maybeSingle();
    const cleanToken = (current?.attendance_token || '').split('#')[0] || `${Date.now().toString(36)}`;
    const { data, error } = await supabase
      .from('meetings')
      .update({ attendance_token: `${cleanToken}#live:${new Date().toISOString()}`, status: 'scheduled' })
      .eq('id', meetingId)
      .select();
    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error('Error starting meeting:', err.message);
    return null;
  }
}

export async function endMeeting(meetingId) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (token) {
      const res = await fetch('/api/meetings/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'end', meeting_id: meetingId }),
      });
      if (res.ok) {
        const result = await res.json();
        return result.meeting || null;
      }
    }

    // Direct fallback
    const { data, error } = await supabase
      .from('meetings')
      .update({ status: 'completed' })
      .eq('id', meetingId)
      .select();
    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error('Error ending meeting:', err.message);
    return null;
  }
}

// ==========================================
// 5. CERTIFICATES & VERIFICATION
// ==========================================
export async function getCertificates() {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('Error fetching certificates:', err.message);
    return [];
  }
}

export async function getCertificateByCode(code) {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('certificate_code', code)
      .single();

    if (error) throw error;
    return data || null;
  } catch (err) {
    console.warn('Error fetching certificate:', err.message);
    return null;
  }
}

export async function issueCertificate(certData) {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .insert([certData])
      .select();

    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error('Error issuing certificate:', err.message);
    return null;
  }
}

// ==========================================
// 6. REALTIME CHAT MESSAGES
// ==========================================
let cachedAuthToken = { token: "", timestamp: 0 };

export function clearAuthTokenCache() {
  cachedAuthToken = { token: "", timestamp: 0 };
}

export async function getAuthToken(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedAuthToken.token && now - cachedAuthToken.timestamp < 120000) {
    return cachedAuthToken.token;
  }
  let token = "";
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    let session = sessionData?.session;
    const isExpiring = session?.expires_at && (session.expires_at * 1000 - now < 60000);
    if (forceRefresh || isExpiring) {
      const { data: refreshed } = await supabase.auth.refreshSession().catch(() => ({ data: null }));
      if (refreshed?.session) {
        session = refreshed.session;
      }
    }
    token = session?.access_token || "";
  } catch {}

  if (token) {
    cachedAuthToken = { token, timestamp: now };
  } else {
    cachedAuthToken = { token: "", timestamp: 0 };
  }
  return token;
}

export async function getMessages(userId, otherUserId) {
  try {
    if (!userId || !otherUserId) return [];
    let token = await getAuthToken();
    if (token && typeof fetch === "function") {
      let response = await fetch(`/api/messages?contact_id=${encodeURIComponent(otherUserId)}`, {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      let result = await response.json().catch(() => ({}));

      // If token expired or invalid (401), force refresh token and retry once
      if (response.status === 401) {
        clearAuthTokenCache();
        token = await getAuthToken(true);
        if (token) {
          response = await fetch(`/api/messages?contact_id=${encodeURIComponent(otherUserId)}`, {
            cache: "no-store",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          result = await response.json().catch(() => ({}));
        }
      }

      if (response.ok) return result.messages || [];
    }

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('Error fetching messages:', err.message);
    return [];
  }
}

export async function getDirectMessageSummary(userId) {
  try {
    if (!userId) return [];
    const { data, error } = await supabase
      .from('messages')
      .select('id, sender_id, receiver_id, message, attachment_name, attachment_type, is_read, is_deleted, created_at')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(150);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('Error fetching direct message summary:', err.message);
    return [];
  }
}

export async function getBatchMessageSummary(batchIds = []) {
  try {
    const ids = (batchIds || []).filter(Boolean);
    if (!ids.length) return [];
    const { data, error } = await supabase
      .from('batch_messages')
      .select('id, batch_id, sender_id, message, attachment_name, attachment_type, is_deleted, created_at')
      .in('batch_id', ids)
      .order('created_at', { ascending: false })
      .limit(Math.min(Math.max(ids.length * 15, 50), 250));

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('Error fetching batch message summary:', err.message);
    return [];
  }
}

async function canDirectMessageViaRls(senderId, receiverId) {
  if (!senderId || !receiverId) return false;
  if (senderId === receiverId) return true;
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, role, batch_id, assigned_mentor_id, assigned_tl_id')
    .in('id', [senderId, receiverId]);
  if (error) throw error;
  const senderProfile = (profiles || []).find((profile) => profile.id === senderId);
  const receiverProfile = (profiles || []).find((profile) => profile.id === receiverId);
  if (!senderProfile || !receiverProfile) return false;

  const senderRole = senderProfile.role || "";
  const receiverRole = receiverProfile.role || "";
  const elevatedRoles = new Set(["super_admin", "admin", "hr"]);
  if (elevatedRoles.has(senderRole)) return true;

  if (senderRole === "mentor") {
    if (elevatedRoles.has(receiverRole)) return true;
    if (!["team_leader", "intern"].includes(receiverRole)) return false;
    const { data: batches, error: batchesError } = await supabase
      .from('batches')
      .select('id')
      .eq('mentor_id', senderId);
    if (batchesError) throw batchesError;
    const batchIds = new Set((batches || []).map((batch) => batch.id));
    return Boolean(receiverProfile.batch_id && batchIds.has(receiverProfile.batch_id));
  }

  if (senderRole === "team_leader" || senderRole === "intern") {
    if (elevatedRoles.has(receiverRole)) return true;
    if (receiverRole !== "mentor") return false;
    if (senderProfile.assigned_mentor_id && senderProfile.assigned_mentor_id === receiverId) return true;
    if (!senderProfile.batch_id) return false;
    const { data: batch, error: batchError } = await supabase
      .from('batches')
      .select('mentor_id')
      .eq('id', senderProfile.batch_id)
      .maybeSingle();
    if (batchError) throw batchError;
    return batch?.mentor_id === receiverId;
  }

  return false;
}

async function sendRealtimeMessageViaRls(messageData, fallbackReason = "") {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData?.session?.user?.id;
  if (!userId) throw new Error("Missing auth session");
  const receiverId = messageData.receiver_id;
  const allowed = await canDirectMessageViaRls(userId, receiverId);
  if (!allowed) throw new Error("Direct chat is not permitted for this contact.");

  const rawMessage = typeof messageData.message === "string" ? messageData.message : "";
  const hasAttachment = Boolean(messageData.attachment_url || messageData.attachment_name || messageData.attachment_type);
  if (!rawMessage.trim() && !hasAttachment) throw new Error("Message is required.");

  const { data, error } = await supabase
    .from('messages')
    .insert([{
      sender_id: userId,
      receiver_id: receiverId,
      message: rawMessage,
      attachment_url: messageData.attachment_url || null,
      attachment_name: messageData.attachment_name || null,
      attachment_type: messageData.attachment_type || null,
      reply_to_id: messageData.reply_to_id || null,
      delivered_at: messageData.is_receiver_online ? new Date().toISOString() : (messageData.delivered_at || null),
    }])
    .select('*')
    .single();
  if (error) throw error;
  return { ...data, fallback: true, fallbackReason };
}

export async function sendRealtimeMessage(messageData) {
  try {
    const token = await getAuthToken();
    if (!token) return null;
    const response = await fetch("/api/messages", {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        type: "send_message",
        ...messageData,
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok && /admin key is not configured/i.test(result.error || "")) {
      return await sendRealtimeMessageViaRls(messageData, result.error);
    }
    if (!response.ok) throw new Error(result.error || "Message send failed");
    return result.message || null;
  } catch (err) {
    console.error('Error sending message:', err.message);
    return null;
  }
}

export async function updateRealtimeMessage(messageId, updates = {}) {
  try {
    const token = await getAuthToken();
    if (!token) return null;
    const response = await fetch("/api/messages", {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        type: "update_message",
        message_id: messageId,
        updates,
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok && /admin key is not configured/i.test(result.error || "")) {
      if (Object.prototype.hasOwnProperty.call(updates, "message")) {
        const { data, error } = await supabase.rpc("texweb_edit_direct_message", {
          p_message_id: messageId,
          p_message: updates.message || "",
        });
        if (error) throw error;
        return Array.isArray(data) ? data[0] || null : data || null;
      }
      if (Object.prototype.hasOwnProperty.call(updates, "is_pinned")) {
        const { data, error } = await supabase.rpc("texweb_pin_direct_message", {
          p_message_id: messageId,
          p_is_pinned: Boolean(updates.is_pinned),
        });
        if (error) throw error;
        return Array.isArray(data) ? data[0] || null : data || null;
      }
      if (updates.is_deleted) {
        const { data, error } = await supabase.rpc("texweb_delete_direct_messages_for_everyone", {
          p_message_ids: [messageId],
        });
        if (error) throw error;
        return Array.isArray(data) ? data[0] || null : data || null;
      }
    }
    if (!response.ok) throw new Error(result.error || "Message update failed");
    return result.message || null;
  } catch (err) {
    console.error('Error updating message:', err.message);
    return null;
  }
}

export async function markDirectMessagesRead(senderId, receiverId) {
  try {
    if (!senderId || !receiverId) return false;
    const token = await getAuthToken();
    if (!token) return false;
    const response = await fetch("/api/messages", {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        type: "read_messages",
        sender_id: senderId,
        receiver_id: receiverId,
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "Read receipt update failed");
    return result || true;
  } catch (err) {
    console.warn('Error marking direct messages read:', err.message);
    return false;
  }
}

export async function markDirectMessagesDelivered(senderId) {
  try {
    if (!senderId) return false;
    const token = await getAuthToken();
    if (!token) return false;
    const response = await fetch("/api/messages", {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        type: "mark_delivered",
        sender_id: senderId,
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "Delivery receipt update failed");
    return result || true;
  } catch (err) {
    console.warn('Error marking direct messages delivered:', err.message);
    return false;
  }
}

// ==========================================
// 6B. BATCH OPERATING WORKSPACE
// ==========================================
function emptyBatchWorkspaceData(extra = {}) {
  return { messages: [], announcements: [], resources: [], escalations: [], history: [], ...extra };
}

async function getBatchWorkspaceViaRls(batchId, fallbackReason = "") {
  try {
    const { data: messages, error: messagesError } = await supabase
      .from("batch_messages")
      .select("*, sender:profiles!batch_messages_sender_id_fkey(id, full_name, role, email)")
      .eq("batch_id", batchId)
      .order("created_at", { ascending: true })
      .limit(200);

    if (messagesError) {
      const { data: plainMessages, error: plainError } = await supabase
        .from("batch_messages")
        .select("*")
        .eq("batch_id", batchId)
        .order("created_at", { ascending: true })
        .limit(200);
      if (plainError) throw plainError;
      return emptyBatchWorkspaceData({ messages: plainMessages || [], fallback: true, fallbackReason });
    }

    return emptyBatchWorkspaceData({ messages: messages || [], fallback: true, fallbackReason });
  } catch (err) {
    return emptyBatchWorkspaceData({ error: err.message || fallbackReason || "Batch workspace load failed" });
  }
}

export async function getBatchWorkspace(batchId, options = {}) {
  try {
    let token = await getAuthToken();
    if (!token || !batchId) return emptyBatchWorkspaceData({ error: !token ? "Missing auth session." : "Batch id is required." });
    const scopeParam = options.scope ? `&scope=${encodeURIComponent(options.scope)}` : "";
    let response = await fetch(`/api/batch-workspace?batch_id=${encodeURIComponent(batchId)}${scopeParam}`, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (response.status === 401) {
      clearAuthTokenCache();
      token = await getAuthToken(true);
      if (token) {
        response = await fetch(`/api/batch-workspace?batch_id=${encodeURIComponent(batchId)}${scopeParam}`, {
          cache: "no-store",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    }

    const result = await response.json().catch(() => ({}));
    if (!response.ok && /admin key is not configured/i.test(result.error || "")) {
      return getBatchWorkspaceViaRls(batchId, result.error);
    }
    if (response.status === 401) {
      return emptyBatchWorkspaceData({ error: "Session expired or unauthorized" });
    }
    if (!response.ok) throw new Error(result.error || "Batch workspace load failed");
    return {
      messages: result.messages || [],
      announcements: result.announcements || [],
      resources: result.resources || [],
      escalations: result.escalations || [],
      history: result.history || [],
    };
  } catch (err) {
    console.warn("Error loading batch workspace:", err.message);
    return emptyBatchWorkspaceData({ error: err.message || "Batch workspace load failed" });
  }
}

export async function getVisibleBatchEscalations() {
  try {
    let token = await getAuthToken();
    if (!token) return [];
    let response = await fetch("/api/batch-workspace?scope=escalations", {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}` },
    });
    
    // Auto-refresh token on 401
    if (response.status === 401) {
      clearAuthTokenCache();
      token = await getAuthToken(true);
      if (token) {
        response = await fetch("/api/batch-workspace?scope=escalations", {
          cache: "no-store",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    }
    
    if (response.status === 401) {
      return [];
    }

    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "Escalations load failed");
    return result.escalations || [];
  } catch (err) {
    if (!/authorization|unauthorized|aborted|token/i.test(err?.message || "")) {
      console.warn("Error loading visible escalations:", err.message);
    }
    return [];
  }
}

export async function createBatchWorkspaceItem(itemData) {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error("Missing auth session");
    const response = await fetch("/api/batch-workspace", {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(itemData),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok && /admin key is not configured/i.test(result.error || "")) {
      if (itemData?.type === "edit_message") {
        const { data, error } = await supabase.rpc("texweb_edit_batch_message", {
          p_batch_id: itemData.batch_id,
          p_message_id: itemData.message_id,
          p_message: itemData.message || "",
        });
        if (error) throw error;
        return { message: Array.isArray(data) ? data[0] || null : data || null, fallback: true };
      }
      if (itemData?.type === "pin_message") {
        const { data, error } = await supabase.rpc("texweb_pin_batch_message", {
          p_batch_id: itemData.batch_id,
          p_message_id: itemData.message_id,
          p_is_pinned: Boolean(itemData.is_pinned),
        });
        if (error) throw error;
        return { message: Array.isArray(data) ? data[0] || null : data || null, fallback: true };
      }
      if (itemData?.type === "delete_message" && itemData.delete_type === "for_everyone") {
        const messageIds = Array.isArray(itemData.message_ids) ? itemData.message_ids : [itemData.message_id].filter(Boolean);
        const { data, error } = await supabase.rpc("texweb_delete_batch_messages_for_everyone", {
          p_batch_id: itemData.batch_id,
          p_message_ids: messageIds,
        });
        if (error) throw error;
        return { messages: data || [], fallback: true };
      }
    }
    if (!response.ok && itemData?.type === "message" && /admin key is not configured/i.test(result.error || "")) {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      if (!userId) throw new Error("Missing auth session");
      const rawMessage = typeof itemData.message === "string" ? itemData.message : "";
      const hasAttachment = Boolean(itemData.attachment_url || itemData.attachment_name || itemData.attachment_type || (itemData.reference_id && itemData.reference_type !== "none"));
      if (!rawMessage.trim() && !hasAttachment) throw new Error("Message is required.");
      const { data, error } = await supabase
        .from("batch_messages")
        .insert([{
          batch_id: itemData.batch_id,
          sender_id: userId,
          message: rawMessage,
          reply_to_id: itemData.reply_to_id || null,
          attachment_url: itemData.attachment_url || null,
          attachment_name: itemData.attachment_name || null,
          attachment_type: itemData.attachment_type || null,
          reference_type: itemData.reference_type || "none",
          reference_id: itemData.reference_id || null,
        }])
        .select("*, sender:profiles!batch_messages_sender_id_fkey(id, full_name, role, email)")
        .single();
      if (error) throw error;
      return { message: data, fallback: true };
    }
    if (!response.ok) throw new Error(result.error || "Batch workspace action failed");
    return result;
  } catch (err) {
    console.error("Error saving batch workspace item:", err.message);
    return null;
  }
}

export async function updateBatchEscalation(escalationData) {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error("Missing auth session");
    const response = await fetch("/api/batch-workspace", {
      method: "PATCH",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(escalationData),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "Escalation update failed");
    return result.escalation || null;
  } catch (err) {
    console.error("Error updating batch escalation:", err.message);
    return null;
  }
}

// ==========================================
// 7. NOTIFICATIONS & ALERTS
// ==========================================
export async function getNotifications(userId) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('Error fetching notifications:', err.message);
    return [];
  }
}

export async function createNotification(notificationData) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (!token) throw new Error('Missing auth session for notification');
    const channels = (notificationData.channels || ['email', 'whatsapp']).filter((channel) => ['email', 'whatsapp'].includes(channel));
    const response = await fetch('/api/notifications/dispatch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        user_id: notificationData.user_id,
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type || 'general',
        link_url: notificationData.link_url || null,
        channels,
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Notification failed');
    return result.notification || null;
  } catch (err) {
    console.error('Error creating notification:', err.message);
    return null;
  }
}

export async function getNotificationQueue() {
  try {
    const { data, error } = await supabase
      .from('notification_queue')
      .select('*, notification:notifications(*), user:profiles(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('Error fetching notification queue:', err.message);
    return [];
  }
}

export async function retryNotificationQueueItem(queueId) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (!token) return null;
    const response = await fetch('/api/notifications/dispatch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ retry_queue_id: queueId }),
    });
    return response.ok ? await response.json() : null;
  } catch (err) {
    console.error('Error retrying notification:', err.message);
    return null;
  }
}

export async function markNotificationRead(notificationId) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select();

    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error('Error updating notification:', err.message);
    return null;
  }
}

export async function markAllNotificationsRead(userId) {
  try {
    const resolvedUserId = typeof userId === 'string' ? userId : userId?.id || userId?.user_id || userId?.target?.dataset?.userId || '';
    if (!resolvedUserId || typeof resolvedUserId !== 'string') return [];
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', resolvedUserId)
      .eq('is_read', false)
      .select();

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error marking all notifications read:', err.message);
    return null;
  }
}

export async function deleteNotification(notificationId) {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error deleting notification:', err.message);
    return false;
  }
}

// ==========================================
// 8. CMS CONTENT
// ==========================================
export async function getCmsContent() {
  try {
    const { data, error } = await supabase
      .from('cms_content')
      .select('*')
      .order('key', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('Error fetching CMS content:', err.message);
    return [];
  }
}

export async function upsertCmsContent(contentData) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (!token) {
      throw new Error('Missing auth session for CMS update');
    }
    const response = await fetch('/api/cms/upsert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(contentData),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'CMS save failed');
    return result.content || null;
  } catch (err) {
    console.error('Error saving CMS content:', err.message);
    return null;
  }
}

export async function getCmsVersions() {
  try {
    const { data, error } = await supabase
      .from('cms_versions')
      .select('*, editor:profiles!cms_versions_created_by_fkey(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('Error fetching CMS versions:', err.message);
    return [];
  }
}

export async function createAuditLog(logData) {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert([{
        actor_id: logData.actor_id,
        actor_role: logData.actor_role,
        action: logData.action,
        entity_type: logData.entity_type,
        entity_id: logData.entity_id || null,
        summary: logData.summary || '',
        metadata: logData.metadata || {},
      }])
      .select();

    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.warn('Error writing audit log:', err.message);
    return null;
  }
}

export async function getAuditLogs() {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*, actor:profiles!audit_logs_actor_id_fkey(*)')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('Error fetching audit logs:', err.message);
    return [];
  }
}

// ==========================================
// 12. CLIENTS & CRM PIPELINE
// ==========================================
const LOCAL_CLIENTS_KEY = 'texweb_cache_clients';
const LOCAL_DEALS_KEY = 'texweb_cache_deals';
const LOCAL_PROPOSALS_KEY = 'texweb_cache_proposals';
const LOCAL_QUOTATIONS_KEY = 'texweb_cache_quotations';
const LOCAL_AGREEMENTS_KEY = 'texweb_cache_agreements';
const LOCAL_SALES_FOLLOWUPS_KEY = 'texweb_cache_sales_followups';
const LOCAL_SALES_MEETINGS_KEY = 'texweb_cache_sales_meetings';
const LOCAL_PROJECTS_KEY = 'texweb_cache_projects';
const LOCAL_SMM_KEY = 'texweb_cache_smm';
const LOCAL_CONTENT_KEY = 'texweb_cache_content';
const LOCAL_INVOICES_KEY = 'texweb_cache_invoices';
const LOCAL_PAYMENTS_KEY = 'texweb_cache_payments';
const LOCAL_TICKETS_KEY = 'texweb_cache_tickets';
const LOCAL_PREFS_KEY = 'texweb_cache_notification_prefs';

function readLocalCache(key, fallback = []) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocalCache(key, data) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

function mergeCloudAndLocal(cloudRows = [], localRows = []) {
  const seen = new Set();
  const merged = [];
  [...(cloudRows || []), ...(localRows || [])].forEach((row) => {
    if (!row) return;
    const key = row.id || `${row.created_at || ''}-${row.title || row.name || row.invoice_number || ''}`;
    if (seen.has(key)) return;
    seen.add(key);
    merged.push(row);
  });
  return merged;
}

function pickPayload(source = {}, allowed = []) {
  return allowed.reduce((payload, key) => {
    if (source[key] !== undefined) payload[key] = source[key];
    return payload;
  }, {});
}

const PROPOSAL_COLUMNS = ['deal_id', 'title', 'amount', 'status', 'scope_of_work', 'deliverables', 'document_url', 'sent_at', 'accepted_at', 'created_by'];
const QUOTATION_COLUMNS = ['quotation_number', 'deal_id', 'subtotal', 'discount', 'tax', 'total', 'status', 'items', 'valid_until', 'notes', 'created_by'];
const AGREEMENT_COLUMNS = ['agreement_number', 'deal_id', 'proposal_id', 'quotation_id', 'title', 'scope_of_work', 'deliverables', 'commercial_terms', 'payment_milestones', 'start_date', 'end_date', 'status', 'document_url', 'signed_at', 'notes', 'created_by'];
const SALES_FOLLOWUP_COLUMNS = ['lead_id', 'deal_id', 'assigned_to', 'title', 'channel', 'due_at', 'status', 'priority', 'notes', 'completed_at', 'created_by'];
const SALES_MEETING_COLUMNS = ['lead_id', 'deal_id', 'host_id', 'title', 'meeting_type', 'scheduled_at', 'duration_minutes', 'meeting_link', 'location', 'status', 'agenda', 'outcome', 'next_action', 'created_by'];
const INVOICE_COLUMNS = ['invoice_number', 'deal_id', 'project_id', 'title', 'amount', 'tax_amount', 'total_amount', 'due_date', 'status', 'milestone_type', 'payment_terms', 'notes', 'pdf_url', 'created_by'];

export function createClientPortalToken() {
  const bytes = new Uint8Array(24);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function getClients() {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    writeLocalCache(LOCAL_CLIENTS_KEY, data || []);
    return data || [];
  } catch (err) {
    console.warn('Fallback: getClients from cache:', err.message);
    return readLocalCache(LOCAL_CLIENTS_KEY, [
      {
        id: 'client-001',
        name: 'Apex Digital Labs',
        company_name: 'Apex Global Enterprises',
        email: 'contact@apexdigital.io',
        phone: '+91 98765 43210',
        website: 'https://apexdigital.io',
        industry: 'Technology & SaaS',
        status: 'active',
        created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      },
      {
        id: 'client-002',
        name: 'Zenith Healthtech',
        company_name: 'Zenith Care Solutions',
        email: 'info@zenithhealth.com',
        phone: '+91 91234 56789',
        website: 'https://zenithhealth.com',
        industry: 'Healthcare',
        status: 'active',
        created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
    ]);
  }
}

export async function createClient(clientData) {
  try {
    const { data, error } = await supabase
      .from('clients')
      .insert([clientData])
      .select();

    if (error) throw error;
    const created = data?.[0] || clientData;
    const current = readLocalCache(LOCAL_CLIENTS_KEY, []);
    writeLocalCache(LOCAL_CLIENTS_KEY, [created, ...current]);
    return created;
  } catch (err) {
    console.warn('Fallback: createClient in cache:', err.message);
    const fallback = {
      ...clientData,
      id: `client-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const current = readLocalCache(LOCAL_CLIENTS_KEY, []);
    writeLocalCache(LOCAL_CLIENTS_KEY, [fallback, ...current]);
    return fallback;
  }
}

export async function updateClient(clientId, updates) {
  try {
    const { data, error } = await supabase
      .from('clients')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', clientId)
      .select();

    if (error) throw error;
    const updated = data?.[0] || null;
    const current = readLocalCache(LOCAL_CLIENTS_KEY, []);
    writeLocalCache(
      LOCAL_CLIENTS_KEY,
      current.map((c) => (c.id === clientId ? { ...c, ...updates } : c))
    );
    return updated;
  } catch (err) {
    console.warn('Fallback: updateClient in cache:', err.message);
    const current = readLocalCache(LOCAL_CLIENTS_KEY, []);
    const updated = current.map((c) => (c.id === clientId ? { ...c, ...updates } : c));
    writeLocalCache(LOCAL_CLIENTS_KEY, updated);
    return updated.find((c) => c.id === clientId) || null;
  }
}

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
    if (options?.dateFrom) query = query.gte('created_at', options.dateFrom);
    if (options?.dateTo) query = query.lte('created_at', options.dateTo);
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

export async function getProposals() {
  try {
    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    const merged = mergeCloudAndLocal(data || [], readLocalCache(LOCAL_PROPOSALS_KEY, []));
    writeLocalCache(LOCAL_PROPOSALS_KEY, merged);
    return merged;
  } catch (err) {
    console.warn('Fallback: getProposals from cache:', err.message);
    return readLocalCache(LOCAL_PROPOSALS_KEY, []);
  }
}

export async function createProposal(proposalData) {
  try {
    const insertPayload = pickPayload(proposalData, PROPOSAL_COLUMNS);
    const { data, error } = await supabase
      .from('proposals')
      .insert([insertPayload])
      .select();

    if (error) throw error;
    const created = { ...proposalData, ...(data?.[0] || insertPayload) };
    const current = readLocalCache(LOCAL_PROPOSALS_KEY, []);
    writeLocalCache(LOCAL_PROPOSALS_KEY, [created, ...current]);
    return created;
  } catch (err) {
    console.warn('Fallback: createProposal in cache:', err.message);
    const fallback = {
      ...proposalData,
      id: `proposal-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const current = readLocalCache(LOCAL_PROPOSALS_KEY, []);
    writeLocalCache(LOCAL_PROPOSALS_KEY, [fallback, ...current]);
    return fallback;
  }
}

export async function updateProposal(proposalId, updates) {
  try {
    const updatePayload = pickPayload(updates, PROPOSAL_COLUMNS);
    const { data, error } = await supabase
      .from('proposals')
      .update({ ...updatePayload, updated_at: new Date().toISOString() })
      .eq('id', proposalId)
      .select();

    if (error) throw error;
    const current = readLocalCache(LOCAL_PROPOSALS_KEY, []);
    const merged = current.map((item) => (item.id === proposalId ? { ...item, ...updates } : item));
    writeLocalCache(LOCAL_PROPOSALS_KEY, merged);
    return data?.[0] || merged.find((item) => item.id === proposalId) || null;
  } catch (err) {
    console.warn('Fallback: updateProposal in cache:', err.message);
    const current = readLocalCache(LOCAL_PROPOSALS_KEY, []);
    const updated = current.map((item) => (item.id === proposalId ? { ...item, ...updates } : item));
    writeLocalCache(LOCAL_PROPOSALS_KEY, updated);
    return updated.find((item) => item.id === proposalId) || null;
  }
}

export async function getQuotations() {
  try {
    const { data, error } = await supabase
      .from('quotations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    const merged = mergeCloudAndLocal(data || [], readLocalCache(LOCAL_QUOTATIONS_KEY, []));
    writeLocalCache(LOCAL_QUOTATIONS_KEY, merged);
    return merged;
  } catch (err) {
    console.warn('Fallback: getQuotations from cache:', err.message);
    return readLocalCache(LOCAL_QUOTATIONS_KEY, []);
  }
}

export async function createQuotation(quotationData) {
  try {
    const subtotal = Number(quotationData.subtotal ?? quotationData.amount ?? quotationData.total) || 0;
    const tax = Number(quotationData.tax ?? quotationData.tax_amount) || 0;
    const total = Number(quotationData.total ?? quotationData.total_amount ?? subtotal + tax) || subtotal;
    const insertPayload = pickPayload({
      ...quotationData,
      subtotal,
      tax,
      total,
      notes: quotationData.notes || quotationData.title || '',
    }, QUOTATION_COLUMNS);
    const { data, error } = await supabase
      .from('quotations')
      .insert([insertPayload])
      .select();

    if (error) throw error;
    const created = { ...quotationData, ...(data?.[0] || insertPayload) };
    const current = readLocalCache(LOCAL_QUOTATIONS_KEY, []);
    writeLocalCache(LOCAL_QUOTATIONS_KEY, [created, ...current]);
    return created;
  } catch (err) {
    console.warn('Fallback: createQuotation in cache:', err.message);
    const fallback = {
      ...quotationData,
      id: `quotation-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const current = readLocalCache(LOCAL_QUOTATIONS_KEY, []);
    writeLocalCache(LOCAL_QUOTATIONS_KEY, [fallback, ...current]);
    return fallback;
  }
}

export async function updateQuotation(quotationId, updates) {
  try {
    const updatePayload = pickPayload({
      ...updates,
      notes: updates.notes || updates.title,
      subtotal: updates.subtotal ?? updates.amount,
      tax: updates.tax ?? updates.tax_amount,
      total: updates.total ?? updates.total_amount ?? updates.amount,
    }, QUOTATION_COLUMNS);
    const { data, error } = await supabase
      .from('quotations')
      .update({ ...updatePayload, updated_at: new Date().toISOString() })
      .eq('id', quotationId)
      .select();

    if (error) throw error;
    const current = readLocalCache(LOCAL_QUOTATIONS_KEY, []);
    const merged = current.map((item) => (item.id === quotationId ? { ...item, ...updates } : item));
    writeLocalCache(LOCAL_QUOTATIONS_KEY, merged);
    return data?.[0] || merged.find((item) => item.id === quotationId) || null;
  } catch (err) {
    console.warn('Fallback: updateQuotation in cache:', err.message);
    const current = readLocalCache(LOCAL_QUOTATIONS_KEY, []);
    const updated = current.map((item) => (item.id === quotationId ? { ...item, ...updates } : item));
    writeLocalCache(LOCAL_QUOTATIONS_KEY, updated);
    return updated.find((item) => item.id === quotationId) || null;
  }
}

export async function getAgreements() {
  try {
    const { data, error } = await supabase
      .from('agreements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    const merged = mergeCloudAndLocal(data || [], readLocalCache(LOCAL_AGREEMENTS_KEY, []));
    writeLocalCache(LOCAL_AGREEMENTS_KEY, merged);
    return merged;
  } catch (err) {
    console.warn('Fallback: getAgreements from cache:', err.message);
    return readLocalCache(LOCAL_AGREEMENTS_KEY, []);
  }
}

export async function createAgreement(agreementData) {
  try {
    const insertPayload = pickPayload(agreementData, AGREEMENT_COLUMNS);
    const { data, error } = await supabase
      .from('agreements')
      .insert([insertPayload])
      .select();

    if (error) throw error;
    const created = { ...agreementData, ...(data?.[0] || insertPayload) };
    const current = readLocalCache(LOCAL_AGREEMENTS_KEY, []);
    writeLocalCache(LOCAL_AGREEMENTS_KEY, [created, ...current]);
    return created;
  } catch (err) {
    console.warn('Fallback: createAgreement in cache:', err.message);
    const fallback = {
      ...agreementData,
      id: `agreement-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const current = readLocalCache(LOCAL_AGREEMENTS_KEY, []);
    writeLocalCache(LOCAL_AGREEMENTS_KEY, [fallback, ...current]);
    return fallback;
  }
}

export async function updateAgreement(agreementId, updates) {
  try {
    const updatePayload = pickPayload(updates, AGREEMENT_COLUMNS);
    const { data, error } = await supabase
      .from('agreements')
      .update({ ...updatePayload, updated_at: new Date().toISOString() })
      .eq('id', agreementId)
      .select();

    if (error) throw error;
    const current = readLocalCache(LOCAL_AGREEMENTS_KEY, []);
    const merged = current.map((item) => (item.id === agreementId ? { ...item, ...updates } : item));
    writeLocalCache(LOCAL_AGREEMENTS_KEY, merged);
    return data?.[0] || merged.find((item) => item.id === agreementId) || null;
  } catch (err) {
    console.warn('Fallback: updateAgreement in cache:', err.message);
    const current = readLocalCache(LOCAL_AGREEMENTS_KEY, []);
    const updated = current.map((item) => (item.id === agreementId ? { ...item, ...updates } : item));
    writeLocalCache(LOCAL_AGREEMENTS_KEY, updated);
    return updated.find((item) => item.id === agreementId) || null;
  }
}

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

    if (options?.status && options.status !== 'all') query = query.eq('status', options.status);
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

// ==========================================
// 13. PROJECTS & ENGINEERING
// ==========================================
export async function getProjects() {
  try {
    let { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        tech_lead:profiles!projects_tech_lead_id_fkey(id, full_name, role, designation),
        members:project_members(id, user_id, role_in_project, profile:profiles(id, full_name, role, designation))
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      const fallback = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (fallback.error) throw fallback.error;
      data = fallback.data;
    }
    writeLocalCache(LOCAL_PROJECTS_KEY, data || []);
    return data || [];
  } catch (err) {
    console.warn('Fallback: getProjects from cache:', err.message);
    return readLocalCache(LOCAL_PROJECTS_KEY, [
      {
        id: 'proj-001',
        name: 'Apex Digital SaaS Platform',
        client_id: 'client-001',
        deal_id: 'deal-001',
        description: 'Next.js 16 + Supabase scalable multi-tenant SaaS application.',
        status: 'in_progress',
        priority: 'high',
        budget: 185000,
        start_date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
        target_date: new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0],
        github_repo: 'https://github.com/texwebsolution/apex-platform',
        staging_url: 'https://apex-staging.texwebsolution.in',
        created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      },
    ]);
  }
}

export async function assignProjectMember(projectId, userId, roleInProject = 'developer') {
  try {
    const { data, error } = await supabase
      .from('project_members')
      .insert([{ project_id: projectId, user_id: userId, role_in_project: roleInProject }])
      .select('*, profile:profiles(id, full_name, role, designation)');
    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error('assignProjectMember error:', err.message);
    return null;
  }
}

export async function removeProjectMember(memberId) {
  try {
    const { error } = await supabase
      .from('project_members')
      .delete()
      .eq('id', memberId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('removeProjectMember error:', err.message);
    return false;
  }
}

export async function createProject(projectData) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select();

    if (error) throw error;
    const created = data?.[0] || projectData;
    const current = readLocalCache(LOCAL_PROJECTS_KEY, []);
    writeLocalCache(LOCAL_PROJECTS_KEY, [created, ...current]);
    return created;
  } catch (err) {
    console.warn('Fallback: createProject in cache:', err.message);
    const fallback = {
      ...projectData,
      id: `proj-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const current = readLocalCache(LOCAL_PROJECTS_KEY, []);
    writeLocalCache(LOCAL_PROJECTS_KEY, [fallback, ...current]);
    return fallback;
  }
}

export async function updateProject(projectId, updates) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', projectId)
      .select();

    if (error) throw error;
    const current = readLocalCache(LOCAL_PROJECTS_KEY, []);
    writeLocalCache(
      LOCAL_PROJECTS_KEY,
      current.map((p) => (p.id === projectId ? { ...p, ...updates } : p))
    );
    return data?.[0] || null;
  } catch (err) {
    console.warn('Fallback: updateProject in cache:', err.message);
    const current = readLocalCache(LOCAL_PROJECTS_KEY, []);
    const updated = current.map((p) => (p.id === projectId ? { ...p, ...updates } : p));
    writeLocalCache(LOCAL_PROJECTS_KEY, updated);
    return updated.find((p) => p.id === projectId) || null;
  }
}

// ==========================================
// 14. SOCIAL MEDIA MARKETING (SMM)
// ==========================================
export async function getSmmClients() {
  try {
    const { data, error } = await supabase
      .from('smm_clients')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    writeLocalCache(LOCAL_SMM_KEY, data || []);
    return data || [];
  } catch (err) {
    console.warn('Fallback: getSmmClients from cache:', err.message);
    return readLocalCache(LOCAL_SMM_KEY, [
      {
        id: 'smm-001',
        client_id: 'client-001',
        package_tier: 'Growth Tier (12 Posts + 4 Reels/mo)',
        monthly_fee: 35000,
        target_audience: 'B2B SaaS Founders, Tech Professionals in India & USA',
        status: 'active',
        created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
    ]);
  }
}

export async function createSmmClient(data) {
  try {
    const { data: res, error } = await supabase
      .from('smm_clients')
      .insert([data])
      .select();

    if (error) throw error;
    const created = res?.[0] || data;
    const current = readLocalCache(LOCAL_SMM_KEY, []);
    writeLocalCache(LOCAL_SMM_KEY, [created, ...current]);
    return created;
  } catch (err) {
    console.warn('Fallback: createSmmClient in cache:', err.message);
    const fallback = {
      ...data,
      id: `smm-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const current = readLocalCache(LOCAL_SMM_KEY, []);
    writeLocalCache(LOCAL_SMM_KEY, [fallback, ...current]);
    return fallback;
  }
}

export async function getContentCalendar() {
  try {
    const { data, error } = await supabase
      .from('content_calendar')
      .select('*')
      .order('scheduled_at', { ascending: true })
      .limit(150);

    if (error) throw error;
    writeLocalCache(LOCAL_CONTENT_KEY, data || []);
    return data || [];
  } catch (err) {
    console.warn('Fallback: getContentCalendar from cache:', err.message);
    return readLocalCache(LOCAL_CONTENT_KEY, [
      {
        id: 'post-001',
        smm_client_id: 'smm-001',
        title: '5 Reasons Why Custom Software Outperforms No-Code in 2026',
        platform: 'linkedin',
        content_type: 'carousel',
        copy_text: 'Are you scaling past $10k MRR? Here is why templates and generic no-code tools hit hard architectural walls.',
        scheduled_at: new Date(Date.now() + 2 * 86400000).toISOString(),
        status: 'client_review',
        created_at: new Date().toISOString(),
      },
      {
        id: 'post-002',
        smm_client_id: 'smm-001',
        title: 'Behind the Scenes: Fast Next.js 16 Migration',
        platform: 'instagram',
        content_type: 'reel',
        copy_text: 'Watch how we optimized load speeds by 68% in 3 simple steps.',
        scheduled_at: new Date(Date.now() + 4 * 86400000).toISOString(),
        status: 'approved',
        created_at: new Date().toISOString(),
      },
    ]);
  }
}

export async function createContentItem(data) {
  try {
    const { data: res, error } = await supabase
      .from('content_calendar')
      .insert([data])
      .select();

    if (error) throw error;
    const created = res?.[0] || data;
    const current = readLocalCache(LOCAL_CONTENT_KEY, []);
    writeLocalCache(LOCAL_CONTENT_KEY, [created, ...current]);
    return created;
  } catch (err) {
    console.warn('Fallback: createContentItem in cache:', err.message);
    const fallback = {
      ...data,
      id: `post-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const current = readLocalCache(LOCAL_CONTENT_KEY, []);
    writeLocalCache(LOCAL_CONTENT_KEY, [fallback, ...current]);
    return fallback;
  }
}

export async function updateContentItem(id, updates) {
  try {
    const { data, error } = await supabase
      .from('content_calendar')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();

    if (error) throw error;
    const current = readLocalCache(LOCAL_CONTENT_KEY, []);
    writeLocalCache(
      LOCAL_CONTENT_KEY,
      current.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
    return data?.[0] || null;
  } catch (err) {
    console.warn('Fallback: updateContentItem in cache:', err.message);
    const current = readLocalCache(LOCAL_CONTENT_KEY, []);
    const updated = current.map((item) => (item.id === id ? { ...item, ...updates } : item));
    writeLocalCache(LOCAL_CONTENT_KEY, updated);
    return updated.find((item) => item.id === id) || null;
  }
}

// ==========================================
// 15. FINANCE & INVOICES
// ==========================================
export async function getInvoices() {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(150);

    if (error) throw error;
    const merged = mergeCloudAndLocal(data || [], readLocalCache(LOCAL_INVOICES_KEY, []));
    writeLocalCache(LOCAL_INVOICES_KEY, merged);
    return merged;
  } catch (err) {
    console.warn('Fallback: getInvoices from cache:', err.message);
    return readLocalCache(LOCAL_INVOICES_KEY, [
      {
        id: 'inv-001',
        invoice_number: 'TEX-2026-0081',
        client_id: 'client-001',
        project_id: 'proj-001',
        title: 'Advance Payment (40%) - Apex Digital Platform',
        amount: 74000,
        tax_amount: 13320,
        total_amount: 87320,
        due_date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
        status: 'paid',
        milestone_type: 'advance',
        created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
      {
        id: 'inv-002',
        invoice_number: 'TEX-2026-0082',
        client_id: 'client-001',
        project_id: 'proj-001',
        title: 'Milestone 1 Payment (30%) - Alpha Sprint Delivery',
        amount: 55500,
        tax_amount: 9990,
        total_amount: 65490,
        due_date: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
        status: 'sent',
        milestone_type: 'milestone',
        created_at: new Date().toISOString(),
      },
    ]);
  }
}

export async function createInvoice(invoiceData) {
  try {
    const insertPayload = pickPayload(invoiceData, INVOICE_COLUMNS);
    const { data, error } = await supabase
      .from('invoices')
      .insert([insertPayload])
      .select();

    if (error) throw error;
    const created = { ...invoiceData, ...(data?.[0] || insertPayload) };
    const current = readLocalCache(LOCAL_INVOICES_KEY, []);
    writeLocalCache(LOCAL_INVOICES_KEY, [created, ...current]);
    return created;
  } catch (err) {
    console.warn('Fallback: createInvoice in cache:', err.message);
    const fallback = {
      ...invoiceData,
      id: `inv-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const current = readLocalCache(LOCAL_INVOICES_KEY, []);
    writeLocalCache(LOCAL_INVOICES_KEY, [fallback, ...current]);
    return fallback;
  }
}

export async function updateInvoice(invoiceId, updates) {
  try {
    const paymentNote = updates.paid_amount !== undefined && !updates.notes
      ? `Payment recorded: Rs. ${Number(updates.paid_amount) || 0}`
      : updates.notes;
    const updatePayload = pickPayload({ ...updates, notes: paymentNote }, INVOICE_COLUMNS);
    const { data, error } = await supabase
      .from('invoices')
      .update({ ...updatePayload, updated_at: new Date().toISOString() })
      .eq('id', invoiceId)
      .select();

    if (error) throw error;
    const current = readLocalCache(LOCAL_INVOICES_KEY, []);
    writeLocalCache(
      LOCAL_INVOICES_KEY,
      current.map((inv) => (inv.id === invoiceId ? { ...inv, ...updates } : inv))
    );
    return data?.[0] || null;
  } catch (err) {
    console.warn('Fallback: updateInvoice in cache:', err.message);
    const current = readLocalCache(LOCAL_INVOICES_KEY, []);
    const updated = current.map((inv) => (inv.id === invoiceId ? { ...inv, ...updates } : inv));
    writeLocalCache(LOCAL_INVOICES_KEY, updated);
    return updated.find((inv) => inv.id === invoiceId) || null;
  }
}

// ==========================================
// 16. SUPPORT TICKETS
// ==========================================
export async function getSupportTickets() {
  try {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(150);

    if (error) throw error;
    writeLocalCache(LOCAL_TICKETS_KEY, data || []);
    return data || [];
  } catch (err) {
    console.warn('Fallback: getSupportTickets from cache:', err.message);
    return readLocalCache(LOCAL_TICKETS_KEY, [
      {
        id: 'tkt-001',
        ticket_number: 'TCK-2026-104',
        client_id: 'client-001',
        project_id: 'proj-001',
        subject: 'Custom webhook endpoint timeout issue on staging',
        description: 'Payment gateway callback hook occasionally encounters a 5-second timeout on cold starts.',
        priority: 'high',
        status: 'in_progress',
        created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
      },
    ]);
  }
}

export async function createSupportTicket(ticketData) {
  try {
    const { data, error } = await supabase
      .from('support_tickets')
      .insert([ticketData])
      .select();

    if (error) throw error;
    const created = data?.[0] || ticketData;
    const current = readLocalCache(LOCAL_TICKETS_KEY, []);
    writeLocalCache(LOCAL_TICKETS_KEY, [created, ...current]);
    return created;
  } catch (err) {
    console.warn('Fallback: createSupportTicket in cache:', err.message);
    const fallback = {
      ...ticketData,
      id: `tkt-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const current = readLocalCache(LOCAL_TICKETS_KEY, []);
    writeLocalCache(LOCAL_TICKETS_KEY, [fallback, ...current]);
    return fallback;
  }
}

export async function updateSupportTicket(ticketId, updates) {
  try {
    const { data, error } = await supabase
      .from('support_tickets')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', ticketId)
      .select();

    if (error) throw error;
    const current = readLocalCache(LOCAL_TICKETS_KEY, []);
    writeLocalCache(
      LOCAL_TICKETS_KEY,
      current.map((t) => (t.id === ticketId ? { ...t, ...updates } : t))
    );
    return data?.[0] || null;
  } catch (err) {
    console.warn('Fallback: updateSupportTicket in cache:', err.message);
    const current = readLocalCache(LOCAL_TICKETS_KEY, []);
    const updated = current.map((t) => (t.id === ticketId ? { ...t, ...updates } : t));
    writeLocalCache(LOCAL_TICKETS_KEY, updated);
    return updated.find((t) => t.id === ticketId) || null;
  }
}

// ==========================================
// 17. NOTIFICATION PREFERENCES
// ==========================================
export async function getNotificationPreferences(userId) {
  try {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return (
      data || {
        sound_enabled: true,
        push_enabled: true,
        email_enabled: true,
        lead_alerts: true,
        task_alerts: true,
        chat_alerts: true,
        project_alerts: true,
        smm_alerts: true,
        finance_alerts: true,
        support_alerts: true,
      }
    );
  } catch {
    return readLocalCache(`${LOCAL_PREFS_KEY}_${userId}`, {
      sound_enabled: true,
      push_enabled: true,
      email_enabled: true,
      lead_alerts: true,
      task_alerts: true,
      chat_alerts: true,
      project_alerts: true,
      smm_alerts: true,
      finance_alerts: true,
      support_alerts: true,
    });
  }
}

export async function saveNotificationPreferences(userId, prefs) {
  try {
    const { data, error } = await supabase
      .from('notification_preferences')
      .upsert({ user_id: userId, ...prefs, updated_at: new Date().toISOString() })
      .select();

    if (error) throw error;
    writeLocalCache(`${LOCAL_PREFS_KEY}_${userId}`, prefs);
    return data?.[0] || prefs;
  } catch {
    writeLocalCache(`${LOCAL_PREFS_KEY}_${userId}`, prefs);
    return prefs;
  }
}
