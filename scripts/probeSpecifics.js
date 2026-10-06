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

async function checkSpecifics() {
  // Test lead statuses one by one
  for (const s of ['New', 'Contacted', 'Qualified', 'Converted', 'Pending', 'In Progress', 'Completed', 'Lost']) {
    const { data, error } = await supabase.from('leads').insert({
      name: 'Test ' + s,
      phone: '9876543210',
      service: 'Web Development',
      status: s
    }).select();
    if (error) console.log(`Lead status [${s}] FAILED:`, error.message);
    else {
      console.log(`Lead status [${s}] OK`);
      await supabase.from('leads').delete().eq('id', data[0].id);
    }
  }

  // Meetings test
  const { data: b } = await supabase.from('batches').select('id').limit(1);
  const { data: p } = await supabase.from('profiles').select('id').limit(1);

  const { data: mData, error: mErr } = await supabase.from('meetings').insert({
    title: 'Daily Standup',
    topic: 'Engineering sync',
    meeting_link: 'https://meet.google.com/tex-tech-sync',
    scheduled_at: new Date().toISOString(),
    batch_id: b?.[0]?.id || null
  }).select();
  console.log('Meeting insert with link:', mData?.[0], mErr?.message);
  if (mData?.[0]) {
    console.log('Meeting columns:', Object.keys(mData[0]));
  }

  // Batch message test with message or content
  for (const col of ['message', 'content', 'text']) {
    const payload = {
      batch_id: b?.[0]?.id,
      sender_id: p?.[0]?.id
    };
    payload[col] = 'Test ' + col;
    const { data, error } = await supabase.from('batch_messages').insert(payload).select();
    if (error) console.log(`Batch message with [${col}] FAILED:`, error.message);
    else {
      console.log(`Batch message with [${col}] OK:`, Object.keys(data[0]));
      break;
    }
  }
}

checkSpecifics();
