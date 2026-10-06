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

async function verify() {
  const tables = [
    'batches',
    'clients',
    'leads',
    'deals',
    'projects',
    'tasks',
    'smm_clients',
    'content_calendar',
    'invoices',
    'payments',
    'support_tickets',
    'meetings',
    'attendance',
    'batch_messages',
    'notifications',
    'audit_logs'
  ];

  console.log('--- DATABASE SEED VERIFICATION ---');
  for (const t of tables) {
    const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
    if (error) console.log(`${t}: ERROR (${error.message})`);
    else console.log(`${t}: ${count} rows`);
  }
}
verify();
