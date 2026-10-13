import {
  supabase,
  getAuthToken,
  clearAuthTokenCache,
} from '../supabase/client';

// ==========================================
// 1. BATCHES & MEMBER ASSIGNMENTS
// ==========================================
export async function getBatches(userId, role) {
  try {
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
// 2. BATCH OPERATING WORKSPACE
// ==========================================
export function emptyBatchWorkspaceData(extra = {}) {
  return { messages: [], announcements: [], resources: [], escalations: [], history: [], ...extra };
}

export async function getBatchWorkspaceViaRls(batchId, fallbackReason = "") {
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
