import { supabase } from '../supabase/client';

// ==========================================
// 3. TASKS & SUBMISSIONS
// ==========================================
export function normalizeBatchIds(batchIdOrIds) {
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
    const updates = { status, updated_at: new Date().toISOString() };
    if (status === 'submitted') updates.submitted_at = new Date().toISOString();
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
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
    const { data, error } = await supabase
      .from('daily_updates')
      .update({ reviewer_comment: reviewerComment, reviewed_at: new Date().toISOString() })
      .eq('id', updateId)
      .select();
    if (error) throw error;
    return data?.[0] || null;
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
