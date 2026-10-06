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

async function check() {
  // Let's test leads with default or no status
  const { data: lData, error: lErr } = await supabase.from('leads').insert({
    name: 'Test Lead',
    phone: '1234567890'
  }).select();
  console.log('Lead default insert:', lData?.[0], lErr?.message);
  if (lData?.[0]) {
    console.log('Lead columns:', Object.keys(lData[0]));
    console.log('Default status:', lData[0].status);
    await supabase.from('leads').delete().eq('id', lData[0].id);
  }

  // Check meetings with topic
  const { data: mData, error: mErr } = await supabase.from('meetings').insert({
    topic: 'Daily Sprint Standup',
    scheduled_at: new Date().toISOString()
  }).select();
  console.log('Meetings with topic insert:', mData?.[0], mErr?.message);
  if (mData?.[0]) {
    console.log('Meetings columns:', Object.keys(mData[0]));
    await supabase.from('meetings').delete().eq('id', mData[0].id);
  }

  // Check profiles to get a sender_id
  const { data: p } = await supabase.from('profiles').select('id').limit(1);
  if (p?.[0]?.id) {
    const { data: msgData, error: msgErr } = await supabase.from('messages').insert({
      sender_id: p[0].id,
      message: 'Hello'
    }).select();
    console.log('Messages with sender_id:', msgData?.[0], msgErr?.message);
    if (msgData?.[0]) {
      console.log('Messages columns:', Object.keys(msgData[0]));
      await supabase.from('messages').delete().eq('id', msgData[0].id);
    }

    // Check notifications without type or default
    const { data: notifData, error: notifErr } = await supabase.from('notifications').insert({
      user_id: p[0].id,
      title: 'Welcome',
      message: 'Welcome to TexWeb'
    }).select();
    console.log('Notifications default insert:', notifData?.[0], notifErr?.message);
    if (notifData?.[0]) {
      console.log('Notifications columns:', Object.keys(notifData[0]));
      console.log('Default type:', notifData[0].type);
      await supabase.from('notifications').delete().eq('id', notifData[0].id);
    }

    // Check audit_logs with entity_type
    const { data: aData, error: aErr } = await supabase.from('audit_logs').insert({
      action: 'INIT',
      entity_type: 'SYSTEM'
    }).select();
    console.log('Audit_logs insert:', aData?.[0], aErr?.message);
    if (aData?.[0]) {
      console.log('Audit_logs columns:', Object.keys(aData[0]));
      await supabase.from('audit_logs').delete().eq('id', aData[0].id);
    }
  }
}

check();
