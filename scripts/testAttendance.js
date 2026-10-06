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

async function checkAttendance() {
  const { data: m } = await supabase.from('meetings').select('id, batch_id').limit(1);
  const { data: p } = await supabase.from('profiles').select('id').limit(1);
  if (m?.[0] && p?.[0]) {
    const { data, error } = await supabase.from('attendance').insert({
      meeting_id: m[0].id,
      user_id: p[0].id,
      status: 'present'
    }).select();
    console.log('Attendance insert:', data?.[0], error?.message);
    if (data?.[0]) {
      console.log('Attendance columns:', Object.keys(data[0]));
    }
  }
}
checkAttendance();
