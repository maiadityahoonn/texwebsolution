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

async function inspect() {
  const tables = ['batches', 'clients', 'leads', 'deals', 'projects', 'tasks', 'smm_clients', 'content_calendar', 'invoices', 'support_tickets', 'meetings', 'attendance', 'messages', 'notifications', 'audit_logs'];
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('*').limit(1);
    if (error) {
      console.log(`Table [${t}] error:`, error.message);
    } else {
      console.log(`Table [${t}] OK, sample keys:`, data?.[0] ? Object.keys(data[0]) : '(empty table)');
    }
  }
}
inspect();
