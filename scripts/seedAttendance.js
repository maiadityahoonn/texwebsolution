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

async function populateAttendance() {
  const { data: b } = await supabase.from('batches').select('id').eq('domain', 'web_dev').limit(1);
  const { data: m } = await supabase.from('meetings').select('id').limit(1);
  const { data: interns } = await supabase.from('profiles').select('id').eq('batch_id', b?.[0]?.id);

  if (b?.[0] && m?.[0] && interns?.length > 0) {
    for (const intern of interns) {
      await supabase.from('attendance').insert({
        user_id: intern.id,
        batch_id: b[0].id,
        meeting_id: m[0].id,
        domain: 'web_dev',
        attendance_date: '2026-10-06',
        status: 'present',
        notes: 'Joined on time via Google Meet'
      });
    }
    console.log(`Seeded attendance for ${interns.length} batch interns.`);
  }
}
populateAttendance();
