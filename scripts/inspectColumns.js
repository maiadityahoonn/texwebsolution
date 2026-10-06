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
const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function inspectColumns() {
  const tables = ['batches', 'clients', 'leads', 'deals', 'projects', 'tasks', 'invoices', 'smm_clients', 'content_calendar', 'support_tickets'];
  for (const t of tables) {
    // Try an empty insert to see column errors or select
    const { data, error } = await supabase.from(t).select('*').limit(1);
    if (error) {
      console.log(`Table ${t}: Error -> ${error.message}`);
    } else {
      console.log(`Table ${t}: Columns ->`, data.length > 0 ? Object.keys(data[0]) : '(Table exists, 0 rows)');
    }
  }

  // Check information_schema columns using rpc or direct select
  try {
    const { data: cols, error: cErr } = await supabase
      .from('leads')
      .insert({ test_field_invalid_x: 1 });
    console.log('Leads insert test error (reveals columns/constraints):', cErr?.message);
  } catch(e) {}
}

inspectColumns();
