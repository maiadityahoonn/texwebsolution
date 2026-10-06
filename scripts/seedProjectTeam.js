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

async function seedProjectTeam() {
  console.log('--- Setting Up Project Heads & Team Members ---');
  
  // 1. Get Projects
  const { data: projects } = await supabase.from('projects').select('*');
  const { data: profiles } = await supabase.from('profiles').select('*');
  
  if (!projects || projects.length === 0) {
    console.log('No projects found');
    return;
  }
  
  const techHead = profiles.find(p => p.role === 'mentor' || p.department === 'tech') || profiles[0];
  const dev1 = profiles.find(p => p.role === 'team_leader' || p.full_name === 'Karan Mehra');
  const dev2 = profiles.find(p => p.full_name === 'Sneha Rao');
  const dev3 = profiles.find(p => p.full_name === 'Vikas Patel');

  console.log('Tech Head:', techHead?.full_name, techHead?.id);

  // 2. Clear old project_members
  await supabase.from('project_members').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // 3. Assign tech_lead_id to all projects
  for (const p of projects) {
    await supabase.from('projects').update({
      tech_lead_id: techHead?.id || null
    }).eq('id', p.id);
  }
  console.log('Assigned Department Head as Tech Lead to all projects.');

  // 4. Assign members to projects
  const p1 = projects[0]; // Nexora
  const p2 = projects[1]; // Apex
  const p3 = projects[2]; // Aura

  const membersToInsert = [];
  if (p1 && techHead) membersToInsert.push({ project_id: p1.id, user_id: techHead.id, role_in_project: 'lead' });
  if (p1 && dev1) membersToInsert.push({ project_id: p1.id, user_id: dev1.id, role_in_project: 'developer' });
  if (p1 && dev2) membersToInsert.push({ project_id: p1.id, user_id: dev2.id, role_in_project: 'intern' });

  if (p2 && techHead) membersToInsert.push({ project_id: p2.id, user_id: techHead.id, role_in_project: 'lead' });
  if (p2 && dev3) membersToInsert.push({ project_id: p2.id, user_id: dev3.id, role_in_project: 'intern' });

  if (p3 && techHead) membersToInsert.push({ project_id: p3.id, user_id: techHead.id, role_in_project: 'lead' });
  if (p3 && dev1) membersToInsert.push({ project_id: p3.id, user_id: dev1.id, role_in_project: 'developer' });

  if (membersToInsert.length > 0) {
    const { data: insertedMembers, error } = await supabase.from('project_members').insert(membersToInsert).select();
    if (error) console.error('Error inserting project members:', error.message);
    else console.log(`✓ Inserted ${insertedMembers.length} project team member assignments.`);
  }

  // 5. Update tasks to assign them directly to developers/interns on the project
  const { data: tasks } = await supabase.from('tasks').select('*');
  if (tasks && tasks.length > 0) {
    if (tasks[0] && dev1) await supabase.from('tasks').update({ assigned_to: dev1.id, project_id: p1?.id }).eq('id', tasks[0].id);
    if (tasks[1] && dev2) await supabase.from('tasks').update({ assigned_to: dev2.id, project_id: p1?.id }).eq('id', tasks[1].id);
    if (tasks[2] && dev3) await supabase.from('tasks').update({ assigned_to: dev3.id, project_id: p2?.id }).eq('id', tasks[2].id);
    console.log('✓ Linked tasks directly to projects and assigned developers/interns.');
  }

  console.log('--- Project Head & Team Member Setup Complete ---');
}

seedProjectTeam();
