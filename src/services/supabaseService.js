

import {
  supabase,
  getAuthToken,
  clearAuthTokenCache,
  readLocalCache,
  writeLocalCache,
  mergeCloudAndLocal,
  LOCAL_PROJECTS_KEY,
  LOCAL_SMM_KEY,
  LOCAL_CONTENT_KEY,
  LOCAL_TICKETS_KEY,
} from './supabase/client';

// ==========================================
// RE-EXPORTS FROM DOMAIN MODULES
// ==========================================

export {
  supabase,
  clearAuthTokenCache,
  getAuthToken,
  escapeSupabaseLike,
  clampPageSize,
  toPostgrestInList,
  fetchCrmListFromApi,
  readLocalCache,
  writeLocalCache,
  mergeCloudAndLocal,
  pickPayload,
  LOCAL_CLIENTS_KEY,
  LOCAL_DEALS_KEY,
  LOCAL_PROPOSALS_KEY,
  LOCAL_QUOTATIONS_KEY,
  LOCAL_AGREEMENTS_KEY,
  LOCAL_AI_THREADS_KEY,
  LOCAL_AI_MESSAGES_KEY,
  LOCAL_AI_DRAFTS_KEY,
  LOCAL_CRM_CHAT_THREADS_KEY,
  LOCAL_CRM_CHAT_MESSAGES_KEY,
  LOCAL_SALES_FOLLOWUPS_KEY,
  LOCAL_SALES_MEETINGS_KEY,
  LOCAL_PROJECTS_KEY,
  LOCAL_SMM_KEY,
  LOCAL_CONTENT_KEY,
  LOCAL_INVOICES_KEY,
  LOCAL_PAYMENTS_KEY,
  LOCAL_TICKETS_KEY,
  LOCAL_PREFS_KEY,
} from './supabase/client';

export {
  sendMetaCrmEvent,
  mapDealStageToLeadStatus,
  extractMetaLeadKey,
  ARCHIVED_LEAD_STATUSES,
  getPipelineLeadIds,
  sendDealStageMetaEvent,
  getCloudLeads,
  getCloudLeadsSummary,
  createCloudLead,
  createCloudLeadsBatch,
  updateCloudLeadStatus,
  updateCloudLead,
  deleteCloudLead,
} from './crm/leadsService';

export {
  getDeals,
  createDeal,
  updateDealStage,
  updateDeal,
} from './crm/dealsService';

export {
  SALES_FOLLOWUP_COLUMNS,
  getSalesFollowUps,
  createSalesFollowUp,
  updateSalesFollowUp,
  deleteSalesFollowUp,
  isFollowUpOverdue,
  rescheduleFollowUp,
  markFollowUpDone,
  markFollowUpMissed,
} from './crm/followupsService';

export {
  SALES_MEETING_COLUMNS,
  getSalesMeetings,
  createSalesMeeting,
  updateSalesMeeting,
  deleteSalesMeeting,
  rescheduleSalesMeeting,
  updateSalesMeetingStatus,
} from './crm/meetingsService';

export {
  PROPOSAL_COLUMNS,
  QUOTATION_COLUMNS,
  AGREEMENT_COLUMNS,
  INVOICE_COLUMNS,
  getProposals,
  createProposal,
  updateProposal,
  getQuotations,
  createQuotation,
  updateQuotation,
  getAgreements,
  createAgreement,
  updateAgreement,
  getInvoices,
  createInvoice,
  updateInvoice,
  sendQuotation,
  sendAgreement,
  signAgreement,
  recordInvoicePayment,
} from './crm/documentsService';

export {
  createClientPortalToken,
  getClients,
  createClient,
  updateClient,
  createClientFromWonDeal,
} from './crm/clientsService';

export {
  calculateConversionMetrics,
  calculateRoiMetrics,
  calculateSalesReports,
  getSalesMetricsSummary,
} from './crm/reportsService';

export {
  getNotifications,
  createNotification,
  getNotificationQueue,
  retryNotificationQueueItem,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  getNotificationPreferences,
  saveNotificationPreferences,
} from './crm/notificationsService';

export {
  getAiThread,
  createAiThread,
  getAiMessages,
  createAiMessage,
  createAiDraft,
  generateAiDocumentDraft,
  getCrmEntityThreadKey,
  getCrmEntityThread,
  getOrCreateCrmEntityThread,
  getCrmEntityMessages,
  createCrmEntityMessage,
} from './crm/chatService';

export {
  getBatches,
  createBatch,
  updateBatch,
  createMemberAssignment,
  emptyBatchWorkspaceData,
  getBatchWorkspaceViaRls,
  getBatchWorkspace,
  getVisibleBatchEscalations,
  createBatchWorkspaceItem,
  updateBatchEscalation,
} from './internal/batchService';

export {
  normalizeBatchIds,
  getTasks,
  createCloudTask,
  uploadTaskReferenceFile,
  updateCloudTaskStatus,
  submitTaskWork,
  uploadSubmissionFile,
  getSubmissionFileUrl,
  uploadBatchFile,
  uploadAvatarImage,
  getTaskSubmissions,
  createTaskReview,
  getTaskReviews,
  getDailyUpdates,
  createDailyUpdate,
  commentDailyUpdate,
  getAttendance,
  markAttendance,
} from './internal/tasksService';

// ==========================================
// PLATFORM & WORKSPACE SERVICES
// (Kept in supabaseService for platform domains)
// ==========================================

// --- Profiles & Roles ---
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

// --- Meetings Scheduler (Workspace / Internships) ---
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

// --- Certificates & Verification ---
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

// --- Realtime Chat Messages (Direct & Batch User Chat) ---
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

// --- CMS Content & Audit Logs ---
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
    const { data, error } = await supabase
      .from('cms_content')
      .upsert([contentData], { onConflict: 'key' })
      .select();
    if (error) throw error;
    return data?.[0] || null;
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

// --- Projects & Engineering ---
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

// --- Social Media Marketing (SMM) ---
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

// --- Support Tickets ---
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
