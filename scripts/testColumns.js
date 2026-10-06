const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
env.split('\n').forEach(l => {
  const parts = l.split('=');
  if (parts[0]) envVars[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
});

const { createClient } = require('@supabase/supabase-js');
globalThis.WebSocket = class {};
const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkBatchCols() {
  // Let's test batches with minimal fields
  const { data, error } = await supabase.from('batches').insert({
    name: 'Full Stack Web Dev (Batch #12)',
    domain: 'web_dev'
  }).select();
  console.log('Batch insert test:', data?.[0], error?.message);
  if (data?.[0]) {
    console.log('Batch columns present:', Object.keys(data[0]));
  }
}

async function checkClientCols() {
  const { data, error } = await supabase.from('clients').insert({
    name: 'Nexora Cloud Solutions'
  }).select();
  console.log('Client insert test:', data?.[0], error?.message);
  if (data?.[0]) {
    console.log('Client columns present:', Object.keys(data[0]));
  }
}

async function checkLeadCols() {
  const { data, error } = await supabase.from('leads').insert({
    name: 'Dr. Siddharth Sen'
  }).select();
  console.log('Lead insert test:', data?.[0], error?.message);
  if (data?.[0]) {
    console.log('Lead columns present:', Object.keys(data[0]));
  }
}

async function checkDealCols(clientId) {
  const { data, error } = await supabase.from('deals').insert({
    title: 'Nexora Deal',
    client_id: clientId,
    service: 'Web Development'
  }).select();
  console.log('Deal insert test:', data?.[0], error?.message);
  if (data?.[0]) {
    console.log('Deal columns present:', Object.keys(data[0]));
  }
}

async function checkProjCols(clientId) {
  const { data, error } = await supabase.from('projects').insert({
    name: 'Nexora Portal',
    client_id: clientId
  }).select();
  console.log('Project insert test:', data?.[0], error?.message);
  if (data?.[0]) {
    console.log('Project columns present:', Object.keys(data[0]));
  }
}

async function checkTaskCols(batchId) {
  const { data, error } = await supabase.from('tasks').insert({
    title: 'Task 1',
    batch_id: batchId
  }).select();
  console.log('Task insert test:', data?.[0], error?.message);
  if (data?.[0]) {
    console.log('Task columns present:', Object.keys(data[0]));
  }
}

async function checkSmmCols(clientId) {
  const { data, error } = await supabase.from('smm_clients').insert({
    name: 'Aura Luxe SMM',
    client_id: clientId
  }).select();
  console.log('SMM client insert test:', data?.[0], error?.message);
  if (data?.[0]) {
    console.log('SMM client columns present:', Object.keys(data[0]));
  }
}

async function checkCalendarCols(smmId, clientId) {
  const { data, error } = await supabase.from('content_calendar').insert({
    title: 'Post 1',
    smm_client_id: smmId,
    client_id: clientId
  }).select();
  console.log('Content calendar insert test:', data?.[0], error?.message);
  if (data?.[0]) {
    console.log('Content calendar columns present:', Object.keys(data[0]));
  }
}

async function checkInvoiceCols(clientId) {
  const { data, error } = await supabase.from('invoices').insert({
    invoice_number: 'INV-TEST-01',
    client_id: clientId,
    amount: 1000
  }).select();
  console.log('Invoice insert test:', data?.[0], error?.message);
  if (data?.[0]) {
    console.log('Invoice columns present:', Object.keys(data[0]));
  }
}

async function checkTicketCols(clientId) {
  const { data, error } = await supabase.from('support_tickets').insert({
    ticket_number: 'TCK-TEST-01',
    title: 'Issue 1',
    client_id: clientId
  }).select();
  console.log('Ticket insert test:', data?.[0], error?.message);
  if (data?.[0]) {
    console.log('Ticket columns present:', Object.keys(data[0]));
  }
}

async function run() {
  await checkBatchCols();
  await checkClientCols();
  await checkLeadCols();
  
  const { data: b } = await supabase.from('batches').select('id').limit(1);
  const { data: c } = await supabase.from('clients').select('id').limit(1);
  
  if (c?.[0]?.id) {
    await checkDealCols(c[0].id);
    await checkProjCols(c[0].id);
    await checkSmmCols(c[0].id);
    await checkInvoiceCols(c[0].id);
    await checkTicketCols(c[0].id);
  }
  if (b?.[0]?.id) {
    await checkTaskCols(b[0].id);
  }
  const { data: smm } = await supabase.from('smm_clients').select('id').limit(1);
  if (smm?.[0]?.id && c?.[0]?.id) {
    await checkCalendarCols(smm[0].id, c[0].id);
  }
}
run();
