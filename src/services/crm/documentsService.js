import {
  supabase,
  clampPageSize,
  fetchCrmListFromApi,
  readLocalCache,
  writeLocalCache,
  mergeCloudAndLocal,
  pickPayload,
  LOCAL_PROPOSALS_KEY,
  LOCAL_QUOTATIONS_KEY,
  LOCAL_AGREEMENTS_KEY,
  LOCAL_INVOICES_KEY,
} from '../supabase/client';

export const PROPOSAL_COLUMNS = ['deal_id', 'title', 'amount', 'status', 'scope_of_work', 'deliverables', 'document_url', 'sent_at', 'accepted_at', 'created_by'];
export const QUOTATION_COLUMNS = ['quotation_number', 'deal_id', 'subtotal', 'discount', 'tax', 'total', 'status', 'items', 'valid_until', 'notes', 'created_by'];
export const AGREEMENT_COLUMNS = ['agreement_number', 'deal_id', 'proposal_id', 'quotation_id', 'title', 'scope_of_work', 'deliverables', 'commercial_terms', 'payment_milestones', 'start_date', 'end_date', 'status', 'document_url', 'signed_at', 'notes', 'created_by'];
export const INVOICE_COLUMNS = ['invoice_number', 'deal_id', 'project_id', 'title', 'amount', 'tax_amount', 'total_amount', 'due_date', 'status', 'milestone_type', 'payment_terms', 'notes', 'pdf_url', 'created_by'];

// ==========================================
// PROPOSALS
// ==========================================
export async function getProposals(options = null) {
  try {
    const useOptions = options && typeof options === 'object';
    const pageSize = clampPageSize(options?.pageSize, useOptions ? 50 : 200);
    const page = Math.max(Number.parseInt(options?.page || 1, 10) || 1, 1);
    const withCount = Boolean(options?.withCount);

    if (useOptions) {
      const apiResult = await fetchCrmListFromApi('proposals', { ...options, page, pageSize });
      if (apiResult?.data) return withCount ? apiResult : apiResult.data;
    }

    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(pageSize);

    if (error) throw error;
    const list = data || [];
    writeLocalCache(LOCAL_PROPOSALS_KEY, list);
    return list;
  } catch (err) {
    console.warn('Fallback: getProposals from cache:', err.message);
    return readLocalCache(LOCAL_PROPOSALS_KEY, []);
  }
}

export async function createProposal(proposalData) {
  if (!proposalData?.deal_id) {
    console.warn('Blocked unlinked proposal creation: deal_id is required.');
    return null;
  }
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

// ==========================================
// QUOTATIONS
// ==========================================
export async function getQuotations(options = null) {
  try {
    const useOptions = options && typeof options === 'object';
    const pageSize = clampPageSize(options?.pageSize, useOptions ? 50 : 200);
    const page = Math.max(Number.parseInt(options?.page || 1, 10) || 1, 1);
    const withCount = Boolean(options?.withCount);

    if (useOptions) {
      const apiResult = await fetchCrmListFromApi('quotations', { ...options, page, pageSize });
      if (apiResult?.data) return withCount ? apiResult : apiResult.data;
    }

    const { data, error } = await supabase
      .from('quotations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(pageSize);

    if (error) throw error;
    const list = data || [];
    writeLocalCache(LOCAL_QUOTATIONS_KEY, list);
    return list;
  } catch (err) {
    console.warn('Fallback: getQuotations from cache:', err.message);
    return readLocalCache(LOCAL_QUOTATIONS_KEY, []);
  }
}

export async function createQuotation(quotationData) {
  if (!quotationData?.deal_id) {
    console.warn('Blocked unlinked quotation creation: deal_id is required.');
    return null;
  }
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

// ==========================================
// AGREEMENTS
// ==========================================
export async function getAgreements(options = null) {
  try {
    const useOptions = options && typeof options === 'object';
    const pageSize = clampPageSize(options?.pageSize, useOptions ? 50 : 200);
    const page = Math.max(Number.parseInt(options?.page || 1, 10) || 1, 1);
    const withCount = Boolean(options?.withCount);

    if (useOptions) {
      const apiResult = await fetchCrmListFromApi('agreements', { ...options, page, pageSize });
      if (apiResult?.data) return withCount ? apiResult : apiResult.data;
    }

    const { data, error } = await supabase
      .from('agreements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(pageSize);

    if (error) throw error;
    const list = data || [];
    writeLocalCache(LOCAL_AGREEMENTS_KEY, list);
    return list;
  } catch (err) {
    console.warn('Fallback: getAgreements from cache:', err.message);
    return readLocalCache(LOCAL_AGREEMENTS_KEY, []);
  }
}

export async function createAgreement(agreementData) {
  if (!agreementData?.deal_id) {
    console.warn('Blocked unlinked agreement creation: deal_id is required.');
    return null;
  }
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

// ==========================================
// INVOICES & PAYMENTS
// ==========================================
export async function getInvoices(options = null) {
  try {
    const useOptions = options && typeof options === 'object';
    const pageSize = clampPageSize(options?.pageSize, useOptions ? 50 : 200);
    const page = Math.max(Number.parseInt(options?.page || 1, 10) || 1, 1);
    const withCount = Boolean(options?.withCount);

    if (useOptions) {
      const apiResult = await fetchCrmListFromApi('invoices', { ...options, page, pageSize });
      if (apiResult?.data) return withCount ? apiResult : apiResult.data;
    }

    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(pageSize);

    if (error) throw error;
    const list = data || [];
    writeLocalCache(LOCAL_INVOICES_KEY, list);
    return list;
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
  if (!invoiceData?.deal_id) {
    console.warn('Blocked unlinked invoice creation: deal_id is required.');
    return null;
  }
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

// Helpers for document lifecycle
export async function sendQuotation(quotationId) {
  return updateQuotation(quotationId, { status: 'sent', sent_at: new Date().toISOString() });
}

export async function sendAgreement(agreementId) {
  return updateAgreement(agreementId, { status: 'sent', sent_at: new Date().toISOString() });
}

export async function signAgreement(agreementId, signatureData = {}) {
  return updateAgreement(agreementId, {
    status: 'signed',
    signed_at: new Date().toISOString(),
    ...signatureData,
  });
}

export async function recordInvoicePayment(invoiceId, paidAmount, notes = '') {
  return updateInvoice(invoiceId, {
    status: 'paid',
    paid_amount: paidAmount,
    notes: notes || `Payment recorded: Rs. ${paidAmount}`,
  });
}

export async function getCloudCommercialsSummary(options = {}) {
  try {
    const apiResult = await fetchCrmListFromApi('commercials_summary', options);
    if (apiResult && typeof apiResult.quotations === 'number') return apiResult;
  } catch (err) {
    console.warn('Commercials summary API error:', err.message);
  }
  return null;
}
