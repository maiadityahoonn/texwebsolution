const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const lines = env.split('\n');
const envVars = {};
lines.forEach(l => {
  const parts = l.split('=');
  const k = parts[0]?.trim();
  const v = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
  if (k) envVars[k] = v;
});

const { createClient } = require('@supabase/supabase-js');
globalThis.WebSocket = class {};

// Check if we have service key or anon key
const key = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
console.log('Connecting with URL:', envVars.NEXT_PUBLIC_SUPABASE_URL, 'Has service key:', Boolean(envVars.SUPABASE_SERVICE_ROLE_KEY));
const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, key);

async function inspect() {
  const tables = [
    'profiles', 'batches', 'leads', 'direct_messages', 'messages',
    'tasks', 'task_submissions', 'meetings', 'attendance', 'notifications',
    'audit_logs', 'cms_content', 'clients', 'deals', 'projects', 'smm_clients',
    'content_calendar', 'invoices', 'support_tickets'
  ];

  for (const t of tables) {
    try {
      const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
      if (error) {
        console.log(`Table '${t}': Error (${error.code || error.message})`);
      } else {
        console.log(`Table '${t}': ${count} rows`);
      }
    } catch (e) {
      console.log(`Table '${t}': Exception (${e.message})`);
    }
  }

  const { data: profs } = await supabase.from('profiles').select('id, full_name, email, role');
  console.log('Profiles list:', profs);

  const { data: batchList } = await supabase.from('batches').select('id, name');
  console.log('Batches list:', batchList);
}

inspect();
