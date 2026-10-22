import {
  supabase,
  readLocalCache,
  writeLocalCache,
  LOCAL_PREFS_KEY,
} from '../supabase/client';

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
    const channels = (notificationData.channels || ['push']).filter((channel) => ['email', 'whatsapp', 'push'].includes(channel));
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
