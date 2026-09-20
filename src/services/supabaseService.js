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
    const payload = {
      name: leadData.name,
      phone: leadData.phone,
      email: leadData.email || '',
      service: leadData.service || 'General Inquiry',
      source: leadData.source || 'Website Form',
      status: leadData.status || 'New',
      notes: leadData.notes || '',
    };
    const response = await fetch('/api/leads/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result.error || 'Lead submission failed');
    }
    return { ...payload, id: `local-${Date.now()}`, created_at: new Date().toISOString() };
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

    if (role === 'intern' && userId) {
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
    if (!userId || !otherUserId) return [];
    const token = await getAuthToken();
    if (token && typeof fetch === "function") {
      const response = await fetch(`/api/messages?contact_id=${encodeURIComponent(otherUserId)}`, {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json().catch(() => ({}));
      if (response.ok) return result.messages || [];
      console.warn('Messages API failed, trying direct fetch:', result.error || response.status);
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
      .limit(500);

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
      .limit(Math.min(Math.max(ids.length * 40, 100), 1000));

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('Error fetching batch message summary:', err.message);
    return [];
  }
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
async function getAuthToken() {
  const { data: sessionData } = await supabase.auth.getSession();
  return sessionData?.session?.access_token || "";
}

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

export async function getBatchWorkspace(batchId) {
  try {
    const token = await getAuthToken();
    if (!token || !batchId) return emptyBatchWorkspaceData({ error: !token ? "Missing auth session." : "Batch id is required." });
    const response = await fetch(`/api/batch-workspace?batch_id=${encodeURIComponent(batchId)}`, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok && /admin key is not configured/i.test(result.error || "")) {
      return getBatchWorkspaceViaRls(batchId, result.error);
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
    const token = await getAuthToken();
    if (!token) return [];
    const response = await fetch("/api/batch-workspace?scope=escalations", {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "Escalations load failed");
    return result.escalations || [];
  } catch (err) {
    console.warn("Error loading visible escalations:", err.message);
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
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
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
