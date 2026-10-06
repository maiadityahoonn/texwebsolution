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

async function testProjectsWithMembers() {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      tech_lead:profiles!projects_tech_lead_id_fkey(id, full_name, role, designation),
      members:project_members(id, user_id, role_in_project, profile:profiles(id, full_name, role, designation))
    `);
  if (error) {
    console.error('Projects with members query error:', error.message);
  } else {
    console.log('Projects with members returned:', data?.length);
    console.log('Sample project:', JSON.stringify(data?.[0], null, 2));
  }
}
testProjectsWithMembers();
