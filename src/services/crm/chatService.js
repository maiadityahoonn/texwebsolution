import {
  supabase,
  readLocalCache,
  writeLocalCache,
  mergeCloudAndLocal,
  LOCAL_AI_THREADS_KEY,
  LOCAL_AI_MESSAGES_KEY,
  LOCAL_AI_DRAFTS_KEY,
  LOCAL_CRM_CHAT_THREADS_KEY,
  LOCAL_CRM_CHAT_MESSAGES_KEY,
} from '../supabase/client';

// ==========================================
// AI DOCUMENT THREADS & MESSAGES
// ==========================================

export async function getAiThread({ deal_id, document_type = 'quotation' } = {}) {
  const localThreads = readLocalCache(LOCAL_AI_THREADS_KEY, []);
  try {
    if (!deal_id) return null;
    const { data, error } = await supabase
      .from('ai_document_threads')
      .select('*')
      .eq('deal_id', deal_id)
      .eq('document_type', document_type)
      .maybeSingle();
    if (error) throw error;
    if (data) {
      writeLocalCache(LOCAL_AI_THREADS_KEY, mergeCloudAndLocal([data], localThreads));
      return data;
    }
    return null;
  } catch (err) {
    console.warn('Fallback: getAiThread from cache:', err.message);
    return localThreads.find((item) => item.deal_id === deal_id && item.document_type === document_type) || null;
  }
}

export async function createAiThread(threadData = {}) {
  try {
    const payload = {
      deal_id: threadData.deal_id || null,
      lead_id: threadData.lead_id || null,
      client_id: threadData.client_id || null,
      document_type: threadData.document_type || 'quotation',
      title: threadData.title || 'AI document thread',
      created_by: threadData.created_by || null,
    };
    const { data, error } = await supabase
      .from('ai_document_threads')
      .insert([payload])
      .select();
    if (error) throw error;
    const created = data?.[0] || payload;
    writeLocalCache(LOCAL_AI_THREADS_KEY, [created, ...readLocalCache(LOCAL_AI_THREADS_KEY, [])]);
    return created;
  } catch (err) {
    console.warn('Fallback: createAiThread in cache:', err.message);
    const fallback = {
      ...threadData,
      id: `ai-thread-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    writeLocalCache(LOCAL_AI_THREADS_KEY, [fallback, ...readLocalCache(LOCAL_AI_THREADS_KEY, [])]);
    return fallback;
  }
}

export async function getAiMessages(threadId) {
  if (!threadId) return [];
  try {
    const { data, error } = await supabase
      .from('ai_document_messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })
      .limit(200);
    if (error) throw error;
    const local = readLocalCache(LOCAL_AI_MESSAGES_KEY, []);
    writeLocalCache(LOCAL_AI_MESSAGES_KEY, mergeCloudAndLocal(data || [], local));
    return data || [];
  } catch (err) {
    console.warn('Fallback: getAiMessages from cache:', err.message);
    return readLocalCache(LOCAL_AI_MESSAGES_KEY, []).filter((item) => item.thread_id === threadId);
  }
}

export async function createAiMessage(messageData = {}) {
  try {
    const payload = {
      thread_id: messageData.thread_id,
      role: messageData.role || 'user',
      content: messageData.content || '',
      attachments: messageData.attachments || [],
      created_by: messageData.created_by || null,
    };
    const { data, error } = await supabase
      .from('ai_document_messages')
      .insert([payload])
      .select();
    if (error) throw error;
    const created = data?.[0] || payload;
    writeLocalCache(LOCAL_AI_MESSAGES_KEY, [...readLocalCache(LOCAL_AI_MESSAGES_KEY, []), created]);
    return created;
  } catch (err) {
    console.warn('Fallback: createAiMessage in cache:', err.message);
    const fallback = {
      ...messageData,
      id: `ai-message-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      created_at: new Date().toISOString(),
    };
    writeLocalCache(LOCAL_AI_MESSAGES_KEY, [...readLocalCache(LOCAL_AI_MESSAGES_KEY, []), fallback]);
    return fallback;
  }
}

export async function createAiDraft(draftData = {}) {
  try {
    const payload = {
      thread_id: draftData.thread_id || null,
      deal_id: draftData.deal_id || null,
      document_type: draftData.document_type || 'quotation',
      title: draftData.title || '',
      content: draftData.content || {},
      status: draftData.status || 'draft',
      sent_at: draftData.sent_at || null,
      approved_at: draftData.approved_at || null,
      created_by: draftData.created_by || null,
    };
    const { data, error } = await supabase
      .from('ai_document_drafts')
      .insert([payload])
      .select();
    if (error) throw error;
    const created = data?.[0] || payload;
    writeLocalCache(LOCAL_AI_DRAFTS_KEY, [created, ...readLocalCache(LOCAL_AI_DRAFTS_KEY, [])]);
    return created;
  } catch (err) {
    console.warn('Fallback: createAiDraft in cache:', err.message);
    const fallback = {
      ...draftData,
      id: `ai-draft-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    writeLocalCache(LOCAL_AI_DRAFTS_KEY, [fallback, ...readLocalCache(LOCAL_AI_DRAFTS_KEY, [])]);
    return fallback;
  }
}

export async function generateAiDocumentDraft(payload = {}) {
  const fallback = {
    title: `${payload?.deal?.title || 'Client Project'} ${payload.documentType === 'agreement' ? 'Agreement' : 'Quotation'}`,
    scope_of_work: payload.notes || payload?.deal?.notes || 'Requirement summary pending.',
    deliverables: 'Project planning, implementation, QA, deployment support, and handover.',
    commercial_terms: '40% advance, 30% milestone, 30% final before handover.',
    notes: 'Template fallback draft.',
  };
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    const response = await fetch('/api/ai/document-draft', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'AI draft request failed');
    return result;
  } catch (err) {
    console.warn('AI document draft fallback:', err.message);
    return {
      draft: fallback,
      assistantMessage: 'AI service unavailable; local template draft generated.',
      mode: 'template',
    };
  }
}

export async function generateAiSpeech({ text, voice = 'alloy', openAiApiKey } = {}) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    const response = await fetch('/api/ai/document-draft', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        action: 'tts',
        text,
        voice,
        openAiApiKey,
      }),
    });
    return await response.json();
  } catch (err) {
    console.warn('AI TTS error:', err.message);
    return { error: err.message };
  }
}

export async function generateAiEmbeddings({ input, openAiApiKey } = {}) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    const response = await fetch('/api/ai/document-draft', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        action: 'embed',
        input,
        openAiApiKey,
      }),
    });
    return await response.json();
  } catch (err) {
    console.warn('AI embeddings error:', err.message);
    return { error: err.message };
  }
}

// ==========================================
// CRM ENTITY CHAT (THREADS & MESSAGES)
// ==========================================

export function getCrmEntityThreadKey(thread = {}) {
  return [
    thread.entity_type || '',
    thread.entity_id || '',
    thread.department || 'sales',
  ].join(':');
}

export async function getCrmEntityThread({ entity_type, entity_id, department = 'sales' } = {}) {
  if (!entity_type || !entity_id) return null;
  const localThreads = readLocalCache(LOCAL_CRM_CHAT_THREADS_KEY, []);
  try {
    const { data, error } = await supabase
      .from('crm_chat_threads')
      .select('*')
      .eq('entity_type', entity_type)
      .eq('entity_id', entity_id)
      .eq('department', department)
      .maybeSingle();
    if (error) throw error;
    if (data) {
      writeLocalCache(LOCAL_CRM_CHAT_THREADS_KEY, mergeCloudAndLocal([data], localThreads));
      return data;
    }
    return null;
  } catch (err) {
    console.warn('Fallback: getCrmEntityThread from cache:', err.message);
    return localThreads.find(
      (item) =>
        item.entity_type === entity_type &&
        item.entity_id === entity_id &&
        (item.department || 'sales') === department
    ) || null;
  }
}

export async function getOrCreateCrmEntityThread(threadData = {}) {
  const existing = await getCrmEntityThread(threadData);
  if (existing) return existing;

  const payload = {
    entity_type: threadData.entity_type,
    entity_id: threadData.entity_id,
    department: threadData.department || 'sales',
    title: threadData.title || 'CRM internal chat',
    created_by: threadData.created_by || null,
  };

  try {
    const { data, error } = await supabase
      .from('crm_chat_threads')
      .insert([payload])
      .select()
      .maybeSingle();
    if (error) throw error;
    const created = data || payload;
    writeLocalCache(LOCAL_CRM_CHAT_THREADS_KEY, [created, ...readLocalCache(LOCAL_CRM_CHAT_THREADS_KEY, [])]);
    return created;
  } catch (err) {
    console.warn('Fallback: createCrmEntityThread in cache:', err.message);
    const fallback = {
      ...payload,
      id: `crm-chat-thread-${getCrmEntityThreadKey(payload)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      local_only: true,
    };
    const localThreads = readLocalCache(LOCAL_CRM_CHAT_THREADS_KEY, []);
    const withoutDuplicate = localThreads.filter((item) => getCrmEntityThreadKey(item) !== getCrmEntityThreadKey(fallback));
    writeLocalCache(LOCAL_CRM_CHAT_THREADS_KEY, [fallback, ...withoutDuplicate]);
    return fallback;
  }
}

export async function getCrmEntityMessages(threadId) {
  if (!threadId) return [];
  try {
    const { data, error } = await supabase
      .from('crm_chat_messages')
      .select('*, sender:profiles!crm_chat_messages_sender_id_fkey(id, full_name, role, email, avatar_url)')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })
      .limit(200);
    if (error) throw error;
    const local = readLocalCache(LOCAL_CRM_CHAT_MESSAGES_KEY, []);
    writeLocalCache(LOCAL_CRM_CHAT_MESSAGES_KEY, mergeCloudAndLocal(data || [], local));
    return data || [];
  } catch (err) {
    console.warn('Fallback: getCrmEntityMessages from cache:', err.message);
    return readLocalCache(LOCAL_CRM_CHAT_MESSAGES_KEY, []).filter((item) => item.thread_id === threadId);
  }
}

export async function createCrmEntityMessage(messageData = {}) {
  const payload = {
    thread_id: messageData.thread_id,
    sender_id: messageData.sender_id || null,
    body: messageData.body || '',
    message_type: messageData.message_type || 'text',
    attachments: messageData.attachments || [],
    metadata: messageData.metadata || {},
  };

  try {
    const { data, error } = await supabase
      .from('crm_chat_messages')
      .insert([payload])
      .select('*, sender:profiles!crm_chat_messages_sender_id_fkey(id, full_name, role, email, avatar_url)')
      .maybeSingle();
    if (error) throw error;
    const created = data || payload;
    writeLocalCache(LOCAL_CRM_CHAT_MESSAGES_KEY, [...readLocalCache(LOCAL_CRM_CHAT_MESSAGES_KEY, []), created]);
    return created;
  } catch (err) {
    console.warn('Fallback: createCrmEntityMessage in cache:', err.message);
    const fallback = {
      ...payload,
      id: `crm-chat-message-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      created_at: new Date().toISOString(),
      local_only: true,
    };
    writeLocalCache(LOCAL_CRM_CHAT_MESSAGES_KEY, [...readLocalCache(LOCAL_CRM_CHAT_MESSAGES_KEY, []), fallback]);
    return fallback;
  }
}
