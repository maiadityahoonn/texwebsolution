import { supabase } from '@/lib/supabase';

export { supabase };

// ==========================================
// AUTH TOKEN HELPERS
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

// ==========================================
// SHARED QUERY & PAGINATION HELPERS
// ==========================================
export function escapeSupabaseLike(value) {
  return String(value || "").replace(/[%_,]/g, (match) => `\\${match}`);
}

export function clampPageSize(value, fallback = 50, max = 500) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, max);
}

export function toPostgrestInList(values = []) {
  return `(${values.map((value) => `"${String(value).replace(/"/g, '\\"')}"`).join(',')})`;
}

export async function fetchCrmListFromApi(resource, options = {}) {
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
    if (options.fresh) params.set('fresh', 'true');
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

// ==========================================
// LOCAL CACHE KEYS & STORAGE HELPERS
// ==========================================
export const LOCAL_CLIENTS_KEY = 'texweb_cache_clients';
export const LOCAL_DEALS_KEY = 'texweb_cache_deals';
export const LOCAL_PROPOSALS_KEY = 'texweb_cache_proposals';
export const LOCAL_QUOTATIONS_KEY = 'texweb_cache_quotations';
export const LOCAL_AGREEMENTS_KEY = 'texweb_cache_agreements';
export const LOCAL_AI_THREADS_KEY = 'texweb_cache_ai_threads';
export const LOCAL_AI_MESSAGES_KEY = 'texweb_cache_ai_messages';
export const LOCAL_AI_DRAFTS_KEY = 'texweb_cache_ai_drafts';
export const LOCAL_CRM_CHAT_THREADS_KEY = 'texweb_cache_crm_chat_threads';
export const LOCAL_CRM_CHAT_MESSAGES_KEY = 'texweb_cache_crm_chat_messages';
export const LOCAL_SALES_FOLLOWUPS_KEY = 'texweb_cache_sales_followups';
export const LOCAL_SALES_MEETINGS_KEY = 'texweb_cache_sales_meetings';
export const LOCAL_PROJECTS_KEY = 'texweb_cache_projects';
export const LOCAL_SMM_KEY = 'texweb_cache_smm';
export const LOCAL_CONTENT_KEY = 'texweb_cache_content';
export const LOCAL_INVOICES_KEY = 'texweb_cache_invoices';
export const LOCAL_PAYMENTS_KEY = 'texweb_cache_payments';
export const LOCAL_TICKETS_KEY = 'texweb_cache_tickets';
export const LOCAL_PREFS_KEY = 'texweb_cache_notification_prefs';

export function readLocalCache(key, fallback = []) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeLocalCache(key, data) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

export function mergeCloudAndLocal(cloudRows = [], localRows = []) {
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

export function pickPayload(source = {}, allowed = []) {
  return allowed.reduce((payload, key) => {
    if (source[key] !== undefined) payload[key] = source[key];
    return payload;
  }, {});
}
