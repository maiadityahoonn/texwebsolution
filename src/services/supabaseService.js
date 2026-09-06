import { supabase } from '@/lib/supabase';

// ==========================================
// 1. LEADS & CRM MANAGEMENT
// ==========================================
export async function getCloudLeads() {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('Fallback: Error fetching cloud leads:', err.message);
    return null;
  }
}

export async function createCloudLead(leadData) {
  try {
    const { data, error } = await supabase
      .from('leads')
      .insert([{
        name: leadData.name,
        phone: leadData.phone,
        email: leadData.email || '',
        service: leadData.service || 'General Inquiry',
        source: leadData.source || 'Website Form',
        status: leadData.status || 'New',
        notes: leadData.notes || '',
      }])
      .select();

    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error('Error creating cloud lead:', err.message);
    return null;
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
    return data?.[0] || null;
  } catch (err) {
    console.error('Error updating lead status:', err.message);
    return null;
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
    return data || [];
  } catch (err) {
    console.warn('Error fetching profiles:', err.message);
    return [];
  }
}

// ==========================================
// 3. TASKS & SUBMISSIONS
// ==========================================
export async function getTasks(userRole, userId, domain) {
  try {
    let query = supabase.from('tasks').select('*, assigned_to_profile:profiles!tasks_assigned_to_fkey(*), assigned_by_profile:profiles!tasks_assigned_by_fkey(*)').order('created_at', { ascending: false });

    if (userRole === 'intern' && userId) {
      query = query.eq('assigned_to', userId);
    } else if (userRole === 'team_leader' && domain) {
      query = query.eq('domain', domain);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('Error fetching tasks:', err.message);
    return [];
  }
}

export async function createCloudTask(taskData) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select();

    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error('Error creating task:', err.message);
    return null;
  }
}

export async function updateCloudTaskStatus(taskId, status) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', taskId)
      .select();

    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error('Error updating task status:', err.message);
    return null;
  }
}

export async function submitTaskWork(submissionData) {
  try {
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

// ==========================================
// 4. MEETINGS SCHEDULER
// ==========================================
export async function getMeetings(userId, role) {
  try {
    let query = supabase.from('meetings').select('*').order('scheduled_at', { ascending: true });
    if (role === 'intern' && userId) {
      query = query.eq('attendee_id', userId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('Error fetching meetings:', err.message);
    return [];
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
    console.error('Error creating meeting:', err.message);
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
export async function getMessages(userId, otherUserId) {
  try {
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

export async function sendRealtimeMessage(messageData) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([messageData])
      .select();

    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error('Error sending message:', err.message);
    return null;
  }
}
