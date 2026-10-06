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

async function testInsert() {
  // Test batch
  const { data: bData, error: bErr } = await supabase.from('batches').insert({
    name: 'Full Stack Web Dev (Batch #12)',
    domain: 'web_dev',
    batch_type: 'internship',
    starts_at: '2026-10-01'
  }).select();
  console.log('Batch insert:', bData?.[0]?.id, bErr?.message || 'OK');

  // Test client
  const { data: cData, error: cErr } = await supabase.from('clients').insert({
    name: 'Nexora Cloud Solutions',
    company_name: 'Nexora Technologies Inc.',
    email: 'founder@nexoratech.io',
    phone: '+91 98234 11223',
    industry: 'SaaS & Enterprise Cloud',
    status: 'active',
    notes: 'Enterprise web contract'
  }).select();
  console.log('Client insert:', cData?.[0]?.id, cErr?.message || 'OK');

  // Test lead
  const { data: lData, error: lErr } = await supabase.from('leads').insert({
    name: 'Dr. Siddharth Sen',
    email: 'dr.sen@medicaresuite.in',
    phone: '+91 98210 55443',
    service: 'HealthTech Portal & Mobile App',
    source: 'Website Form',
    status: 'New',
    notes: 'Teleconsultation platform'
  }).select();
  console.log('Lead insert:', lData?.[0]?.id, lErr?.message || 'OK');
}

testInsert();
