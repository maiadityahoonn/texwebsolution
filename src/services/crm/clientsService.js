import {
  supabase,
  readLocalCache,
  writeLocalCache,
  LOCAL_CLIENTS_KEY,
} from '../supabase/client';

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
    return readLocalCache(LOCAL_CLIENTS_KEY, []);
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

export async function createClientFromWonDeal(deal) {
  if (!deal) return null;
  const clientPayload = {
    name: deal.title || 'Client Project',
    company_name: deal.company_name || deal.title || 'Company',
    email: deal.email || '',
    phone: deal.phone || '',
    industry: deal.service || 'Technology',
    status: 'active',
  };
  return createClient(clientPayload);
}
