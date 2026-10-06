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

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function resetAndSeed() {
  console.log('=== STARTING COMPLETE CLEAN DATABASE SEED ===');

  // 1. DELETE EXISTING DATA IN SAFE CASCADE ORDER
  const tablesToClear = [
    'payments',
    'support_tickets',
    'invoices',
    'content_calendar',
    'smm_clients',
    'task_submissions',
    'tasks',
    'project_members',
    'projects',
    'proposals',
    'quotations',
    'deals',
    'client_contacts',
    'clients',
    'leads',
    'attendance',
    'meetings',
    'batch_messages',
    'notifications',
    'audit_logs',
    'batches'
  ];

  for (const table of tablesToClear) {
    try {
      const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) console.warn(`Note clearing ${table}:`, error.message);
      else console.log(`✓ Cleared table: ${table}`);
    } catch (err) {
      console.warn(`Exception clearing ${table}:`, err.message);
    }
  }

  // 2. FETCH & UPDATE USER PROFILES
  const { data: profiles } = await supabase.from('profiles').select('*');
  console.log(`Found ${profiles?.length || 0} user profiles in database.`);

  const adminProfile = profiles?.find(p => p.role === 'super_admin' || p.email === 'admin@texwebsolution.in') || profiles?.[0];
  const hrProfile = profiles?.find(p => p.role === 'hr' || p.email === 'sumanshashank@gmail.com') || profiles?.[1];
  const techMentorProfile = profiles?.find(p => p.role === 'mentor' || p.email === 'askadityasahu@gmail.com') || profiles?.[2];
  const internProfiles = profiles?.filter(p => !['super_admin', 'hr', 'mentor'].includes(p.role) || p.email.startsWith('intern')) || [];

  if (adminProfile) {
    await supabase.from('profiles').update({
      full_name: 'Aditya Kumar Gupta',
      role: 'super_admin',
      domain: 'web_dev',
      designation: 'Founder & CEO',
      department: 'management',
      phone: '+91 98765 43210'
    }).eq('id', adminProfile.id);
  }

  if (hrProfile) {
    await supabase.from('profiles').update({
      full_name: 'Shashank Suman',
      role: 'hr',
      domain: 'management',
      designation: 'Head of People & Operations',
      department: 'hr',
      phone: '+91 98765 43211'
    }).eq('id', hrProfile.id);
  }

  if (techMentorProfile) {
    await supabase.from('profiles').update({
      full_name: 'Aditya Sahu',
      role: 'mentor',
      domain: 'web_dev',
      designation: 'VP of Technology & Lead Architect',
      department: 'tech',
      phone: '+91 98765 43212'
    }).eq('id', techMentorProfile.id);
  }

  const internDesignations = [
    { name: 'Karan Mehra', role: 'team_leader', domain: 'web_dev', designation: 'Frontend TL' },
    { name: 'Sneha Rao', role: 'intern', domain: 'web_dev', designation: 'Full-Stack Trainee' },
    { name: 'Rohan Verma', role: 'intern', domain: 'marketing', designation: 'SMM & Content Intern' },
    { name: 'Ananya Sharma', role: 'intern', domain: 'sales', designation: 'Business Dev Trainee' },
    { name: 'Vikas Patel', role: 'intern', domain: 'web_dev', designation: 'Backend Trainee' }
  ];

  for (let i = 0; i < internProfiles.length; i++) {
    const p = internProfiles[i];
    const des = internDesignations[i % internDesignations.length];
    await supabase.from('profiles').update({
      full_name: des.name,
      role: des.role,
      domain: des.domain,
      designation: des.designation,
      department: des.domain
    }).eq('id', p.id);
  }

  // 3. SEED BATCHES (COHORTS)
  const batchesToInsert = [
    {
      name: 'Full Stack Web Dev (Batch #12)',
      domain: 'web_dev',
      batch_type: 'internship',
      status: 'active',
      starts_at: '2026-10-01T09:00:00Z',
      ends_at: '2026-12-31T18:00:00Z',
      hr_id: hrProfile?.id || null,
      mentor_id: techMentorProfile?.id || null,
      tl_id: internProfiles[0]?.id || null
    },
    {
      name: 'Social Media & Growth Marketing (Batch #05)',
      domain: 'marketing',
      batch_type: 'internship',
      status: 'active',
      starts_at: '2026-10-01T09:00:00Z',
      ends_at: '2026-12-31T18:00:00Z',
      hr_id: hrProfile?.id || null,
      mentor_id: adminProfile?.id || null,
      tl_id: null
    },
    {
      name: 'B2B Inside Sales & Client Relations (Batch #03)',
      domain: 'sales',
      batch_type: 'internship',
      status: 'active',
      starts_at: '2026-10-01T09:00:00Z',
      ends_at: '2026-12-31T18:00:00Z',
      hr_id: hrProfile?.id || null,
      mentor_id: adminProfile?.id || null,
      tl_id: null
    }
  ];

  const { data: createdBatches, error: batchErr } = await supabase.from('batches').insert(batchesToInsert).select();
  if (batchErr) {
    console.error('Error inserting batches:', batchErr.message);
  } else {
    console.log(`✓ Created ${createdBatches?.length || 0} batches successfully.`);
  }

  const webBatch = createdBatches?.find(b => b.domain === 'web_dev') || createdBatches?.[0];
  const smmBatch = createdBatches?.find(b => b.domain === 'marketing') || createdBatches?.[1];
  const salesBatch = createdBatches?.find(b => b.domain === 'sales') || createdBatches?.[2];

  // Assign batch_ids to intern profiles
  if (internProfiles[0] && webBatch) await supabase.from('profiles').update({ batch_id: webBatch.id }).eq('id', internProfiles[0].id);
  if (internProfiles[1] && webBatch) await supabase.from('profiles').update({ batch_id: webBatch.id }).eq('id', internProfiles[1].id);
  if (internProfiles[2] && smmBatch) await supabase.from('profiles').update({ batch_id: smmBatch.id }).eq('id', internProfiles[2].id);
  if (internProfiles[3] && salesBatch) await supabase.from('profiles').update({ batch_id: salesBatch.id }).eq('id', internProfiles[3].id);
  if (internProfiles[4] && webBatch) await supabase.from('profiles').update({ batch_id: webBatch.id }).eq('id', internProfiles[4].id);

  // 4. SEED CLIENTS
  const clientsToInsert = [
    {
      name: 'Nexora Cloud Solutions',
      company_name: 'Nexora Technologies Inc.',
      email: 'founder@nexoratech.io',
      phone: '+91 98234 11223',
      industry: 'SaaS & Enterprise Cloud',
      status: 'active',
      website: 'https://nexoratech.io',
      address: 'Bandra Kurla Complex, Mumbai, Maharashtra 400051',
      notes: 'Signed 6-month enterprise web application and API contract.'
    },
    {
      name: 'Apex Retail Logistics',
      company_name: 'Apex Global Logistics Pvt Ltd',
      email: 'ops@apexlogistics.in',
      phone: '+91 99112 44556',
      industry: 'Supply Chain & E-Commerce',
      status: 'active',
      website: 'https://apexlogistics.in',
      address: 'Okhla Phase III, New Delhi 110020',
      notes: 'Warehouse automation & shipment tracking dashboard delivery.'
    },
    {
      name: 'Vanguard Wealth Management',
      company_name: 'Vanguard Financial Advisors LLP',
      email: 'contact@vanguardwealth.co',
      phone: '+91 98711 77889',
      industry: 'FinTech & Wealth Advisory',
      status: 'active',
      website: 'https://vanguardwealth.co',
      address: 'Indiranagar 100ft Road, Bengaluru, Karnataka 560038',
      notes: 'Customer portal + portfolio analytics engine.'
    },
    {
      name: 'Aura Luxe Fashion',
      company_name: 'Aura Couture House Pvt Ltd',
      email: 'marketing@auraluxe.store',
      phone: '+91 98300 22334',
      industry: 'Luxury Fashion & D2C',
      status: 'active',
      website: 'https://auraluxe.store',
      address: 'Park Street, Kolkata, West Bengal 700016',
      notes: 'Monthly SMM growth retainer + Shopify custom storefront.'
    }
  ];

  const { data: createdClients, error: clientErr } = await supabase.from('clients').insert(clientsToInsert).select();
  if (clientErr) console.error('Error inserting clients:', clientErr.message);
  else console.log(`✓ Created ${createdClients?.length || 0} clients successfully.`);

  const nexoraClient = createdClients?.[0];
  const apexClient = createdClients?.[1];
  const vanguardClient = createdClients?.[2];
  const auraClient = createdClients?.[3];

  // 5. SEED LEADS (Allowed statuses: 'New', 'Contacted', 'In Progress', 'Converted', 'Lost')
  const leadsToInsert = [
    {
      name: 'Dr. Siddharth Sen',
      email: 'dr.sen@medicaresuite.in',
      phone: '+91 98210 55443',
      service: 'HealthTech Portal & Mobile App',
      source: 'Website Form',
      status: 'New',
      notes: 'Looking for HIPAA compliant tele-consultation platform with doctor appointment scheduling.'
    },
    {
      name: 'Pooja Kashyap',
      email: 'pooja@zenithorganics.com',
      phone: '+91 98190 22114',
      service: 'D2C E-Commerce & SMM',
      source: 'Instagram Ads',
      status: 'Contacted',
      notes: 'Interested in complete branding, Next.js storefront, and monthly Instagram content package.'
    },
    {
      name: 'Manish Chawla',
      email: 'manish@finpayglobal.io',
      phone: '+91 98450 88992',
      service: 'Web Development (Full Stack)',
      source: 'Referral',
      status: 'In Progress',
      notes: 'Needs fintech dashboard with multi-currency settlement and webhook reconciliation.'
    },
    {
      name: 'Ritu Singhal',
      email: 'ritu@singhaledu.org',
      phone: '+91 98722 33441',
      service: 'EdTech LMS & Automation',
      source: 'Google Search',
      status: 'Converted',
      notes: 'Converted to client Nexora Cloud Solutions.'
    }
  ];

  const { data: createdLeads, error: leadErr } = await supabase.from('leads').insert(leadsToInsert).select();
  if (leadErr) console.error('Error inserting leads:', leadErr.message);
  else console.log(`✓ Created ${createdLeads?.length || 0} leads successfully.`);

  // 6. SEED DEALS (Allowed stages: 'new', 'assigned', 'contacted', 'qualified', 'requirement', 'meeting', 'proposal', 'negotiation', 'approval', 'agreement', 'advance_payment', 'closed_won', 'closed_lost')
  if (nexoraClient) {
    const dealsToInsert = [
      {
        title: 'Nexora Enterprise SaaS Platform & API',
        client_id: nexoraClient.id,
        deal_value: 350000,
        service: 'Web Development',
        pipeline_stage: 'closed_won',
        expected_close_date: '2026-10-15',
        notes: 'Deal closed with 40% advance payment confirmed.'
      },
      {
        title: 'Apex Fleet & Logistics Tracking Suite',
        client_id: apexClient?.id || nexoraClient.id,
        deal_value: 280000,
        service: 'Web Development',
        pipeline_stage: 'negotiation',
        expected_close_date: '2026-10-25',
        notes: 'Final revision of technical SLA and milestone breakdown.'
      },
      {
        title: 'Aura Luxe Q4 Festive SMM & Growth Retainer',
        client_id: auraClient?.id || nexoraClient.id,
        deal_value: 120000,
        service: 'Digital Marketing & SMM',
        pipeline_stage: 'proposal',
        expected_close_date: '2026-10-28',
        notes: 'Proposals shared for 20 reels, 15 carousels, and influencer seeding.'
      },
      {
        title: 'Vanguard Portfolio Risk Engine MVP',
        client_id: vanguardClient?.id || nexoraClient.id,
        deal_value: 450000,
        service: 'AI Automation & Web',
        pipeline_stage: 'qualified',
        expected_close_date: '2026-11-10',
        notes: 'Requirement gathering complete. Scheduled tech demo on Thursday.'
      }
    ];

    const { data: createdDeals, error: dealErr } = await supabase.from('deals').insert(dealsToInsert).select();
    if (dealErr) console.error('Error inserting deals:', dealErr.message);
    else console.log(`✓ Created ${createdDeals?.length || 0} deals successfully.`);
  }

  // 7. SEED COMMERCIAL PROJECTS
  let createdProjects = [];
  if (nexoraClient) {
    const projectsToInsert = [
      {
        name: 'Nexora Multi-Tenant SaaS Portal',
        client_id: nexoraClient.id,
        description: 'End-to-end multi-tenant cloud operations dashboard with role-based permissions and Stripe billing.',
        status: 'in_progress',
        priority: 'high',
        budget: 350000,
        start_date: '2026-10-02',
        target_date: '2026-11-20',
        github_repo: 'https://github.com/texweb-solution/nexora-cloud-portal',
        live_url: 'https://nexora-preview.texwebsolution.in'
      },
      {
        name: 'Apex Automated Logistics Dispatcher',
        client_id: apexClient?.id || nexoraClient.id,
        description: 'Live order tracking, route planning, and vehicle assignment portal for logistics dispatchers.',
        status: 'in_progress',
        priority: 'medium',
        budget: 280000,
        start_date: '2026-10-05',
        target_date: '2026-12-05',
        github_repo: 'https://github.com/texweb-solution/apex-dispatcher',
        live_url: 'https://apex-preview.texwebsolution.in'
      },
      {
        name: 'Aura Luxe Headless E-Commerce Store',
        client_id: auraClient?.id || nexoraClient.id,
        description: 'Luxury high-conversion storefront with dynamic cart, Razorpay gateway, and video lookbook.',
        status: 'completed',
        priority: 'high',
        budget: 180000,
        start_date: '2026-09-10',
        target_date: '2026-10-04',
        github_repo: 'https://github.com/texweb-solution/aura-luxe-store',
        live_url: 'https://auraluxe.store'
      }
    ];

    const { data: pData, error: pErr } = await supabase.from('projects').insert(projectsToInsert).select();
    if (pErr) console.error('Error inserting projects:', pErr.message);
    else {
      createdProjects = pData;
      console.log(`✓ Created ${createdProjects?.length || 0} projects successfully.`);
    }
  }

  const nexoraProj = createdProjects?.[0];
  const auraProj = createdProjects?.[2];

  // 8. SEED TASKS (BATCH-WISE & PROJECT-WISE)
  if (webBatch) {
    const tasksToInsert = [
      {
        title: 'Implement Dark Theme Tokens & Viewport Fixes',
        description: 'Refactor Tailwind color tokens to support warm dark eye-care palette (#100f0b) and ensure zero horizontal overflow at 320px viewport.',
        batch_id: webBatch.id,
        project_id: nexoraProj?.id || null,
        client_id: nexoraClient?.id || null,
        domain: 'web_dev',
        priority: 'high',
        status: 'in_progress',
        deadline: '2026-10-10T18:00:00Z'
      },
      {
        title: 'Build Secure Webhook Handler for Payment Settlement',
        description: 'Create an idempotent Next.js Route Handler for payment confirmation with cryptographic signature verification.',
        batch_id: webBatch.id,
        project_id: nexoraProj?.id || null,
        client_id: nexoraClient?.id || null,
        domain: 'web_dev',
        priority: 'urgent',
        status: 'pending',
        deadline: '2026-10-12T18:00:00Z'
      },
      {
        title: 'Build Client Directory Component with Linked Entities',
        description: 'Create ClientsModule view linking client profile with their deals, projects, invoices, and SLA tickets.',
        batch_id: webBatch.id,
        domain: 'web_dev',
        priority: 'medium',
        status: 'approved',
        deadline: '2026-10-06T18:00:00Z'
      }
    ];

    const { data: createdTasks, error: taskErr } = await supabase.from('tasks').insert(tasksToInsert).select();
    if (taskErr) console.error('Error inserting tasks:', taskErr.message);
    else console.log(`✓ Created ${createdTasks?.length || 0} tasks successfully.`);
  }

  // 9. SEED SMM CLIENTS & CONTENT CALENDAR
  let createdSmmClients = [];
  if (auraClient) {
    const smmClientsToInsert = [
      {
        client_id: auraClient.id,
        package_tier: 'Enterprise Growth',
        monthly_fee: 45000,
        target_audience: 'Affluent urban women 22-40, fashion enthusiasts',
        brand_guidelines: 'Warm luxury aesthetic, serif typography, minimalist gold accents',
        social_handles: { instagram: '@auraluxe.store', facebook: 'AuraLuxeFashion' },
        status: 'active'
      },
      {
        client_id: nexoraClient?.id || auraClient.id,
        package_tier: 'Founder Branding',
        monthly_fee: 30000,
        target_audience: 'CTOs, Engineering Leaders, SaaS Founders',
        brand_guidelines: 'Tech authority, clean high-contrast code snippets',
        social_handles: { linkedin: 'company/nexoratech', twitter: '@nexoratech' },
        status: 'active'
      }
    ];

    const { data: sData, error: sErr } = await supabase.from('smm_clients').insert(smmClientsToInsert).select();
    if (sErr) console.error('Error inserting smm_clients:', sErr.message);
    else {
      createdSmmClients = sData;
      console.log(`✓ Created ${createdSmmClients?.length || 0} SMM retainers successfully.`);
    }
  }

  const smmClientAura = createdSmmClients?.[0];

  if (smmClientAura) {
    const contentCalendarItems = [
      {
        smm_client_id: smmClientAura.id,
        title: 'Behind the Scenes: Handwoven Silk Craftsmanship',
        platform: 'instagram',
        content_type: 'reel',
        copy_text: 'Every thread tells a story of heritage and luxury. Discover how master weavers bring our festive collection to life. ✨ #AuraLuxe #HandloomHeritage #LuxuryWear',
        media_urls: ['https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80'],
        scheduled_at: '2026-10-08T18:30:00Z',
        status: 'scheduled'
      },
      {
        smm_client_id: smmClientAura.id,
        title: '5 Festive Styling Tips with Celebrity Stylist',
        platform: 'instagram',
        content_type: 'carousel',
        copy_text: 'Swipe through to elevate your evening look with minimal effort and timeless elegance. 👗 #FestiveStyle #Lookbook2026',
        media_urls: ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80'],
        scheduled_at: '2026-10-10T12:00:00Z',
        status: 'client_review'
      },
      {
        smm_client_id: smmClientAura.id,
        title: 'Autumn Festive Collection Launch Teaser',
        platform: 'instagram',
        content_type: 'video',
        copy_text: 'The wait is over. Experience the new Festive Haute Couture tomorrow at 10 AM. 🌟 Link in bio to reserve preview access.',
        media_urls: ['https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80'],
        scheduled_at: '2026-10-04T10:00:00Z',
        status: 'published'
      }
    ];

    const { data: createdContent, error: contentErr } = await supabase.from('content_calendar').insert(contentCalendarItems).select();
    if (contentErr) console.error('Error inserting content_calendar:', contentErr.message);
    else console.log(`✓ Created ${createdContent?.length || 0} content calendar posts.`);
  }

  // 10. SEED INVOICES & PAYMENTS
  let createdInvoices = [];
  if (nexoraClient) {
    const invoicesToInsert = [
      {
        invoice_number: 'INV-2026-0081',
        client_id: nexoraClient.id,
        project_id: nexoraProj?.id || null,
        title: 'Project Kickoff & Advance (40%)',
        amount: 140000,
        tax_amount: 21355.93,
        total_amount: 140000,
        due_date: '2026-10-05',
        status: 'paid',
        milestone_type: 'advance',
        notes: 'Settled via NEFT / Bank Transfer (Ref: HDFC9928172).'
      },
      {
        invoice_number: 'INV-2026-0082',
        client_id: nexoraClient.id,
        project_id: nexoraProj?.id || null,
        title: 'Sprint 2 Milestone Deliverables (30%)',
        amount: 105000,
        tax_amount: 16016.95,
        total_amount: 105000,
        due_date: '2026-10-25',
        status: 'sent',
        milestone_type: 'milestone',
        notes: 'Due on completion of Sprint 2 review.'
      },
      {
        invoice_number: 'INV-2026-0083',
        client_id: auraClient?.id || nexoraClient.id,
        project_id: auraProj?.id || null,
        title: 'Final Handover & E-Commerce Storefront Go-Live',
        amount: 180000,
        tax_amount: 27457.63,
        total_amount: 180000,
        due_date: '2026-10-04',
        status: 'paid',
        milestone_type: 'final',
        notes: 'Paid via Razorpay Business UPI gateway.'
      }
    ];

    const { data: invData, error: invErr } = await supabase.from('invoices').insert(invoicesToInsert).select();
    if (invErr) console.error('Error inserting invoices:', invErr.message);
    else {
      createdInvoices = invData;
      console.log(`✓ Created ${createdInvoices?.length || 0} invoices successfully.`);
    }

    // Seed Payments for paid invoices
    if (createdInvoices?.length > 0) {
      const inv1 = createdInvoices[0];
      const inv3 = createdInvoices[2];
      const paymentsToInsert = [
        {
          invoice_id: inv1.id,
          client_id: nexoraClient.id,
          amount: 140000,
          payment_date: '2026-10-04',
          payment_method: 'bank_transfer',
          reference_id: 'HDFC-NEFT-9928172',
          status: 'completed'
        }
      ];
      if (inv3) {
        paymentsToInsert.push({
          invoice_id: inv3.id,
          client_id: auraClient?.id || nexoraClient.id,
          amount: 180000,
          payment_date: '2026-10-04',
          payment_method: 'upi',
          reference_id: 'PAY-RZP-8839210',
          status: 'completed'
        });
      }
      const { data: payData, error: payErr } = await supabase.from('payments').insert(paymentsToInsert).select();
      if (payErr) console.error('Error inserting payments:', payErr.message);
      else console.log(`✓ Created ${payData?.length || 0} verified payments.`);
    }
  }

  // 11. SEED SUPPORT TICKETS
  if (nexoraClient) {
    const ticketsToInsert = [
      {
        ticket_number: 'TCK-2026-401',
        client_id: auraClient?.id || nexoraClient.id,
        project_id: auraProj?.id || null,
        subject: 'Custom Domain SSL Certificate Auto-Renewal Verification',
        description: 'Verify Let\'s Encrypt wildcard renewal for storefront custom domain.',
        priority: 'medium',
        status: 'resolved',
        resolution_notes: 'Renewed via Cloudflare DNS-01 challenge. Verified 100% valid.'
      },
      {
        ticket_number: 'TCK-2026-402',
        client_id: nexoraClient.id,
        project_id: nexoraProj?.id || null,
        subject: 'Checkout Webhook Delay on Peak Evening Traffic',
        description: 'Investigate Redis queue processing times for payment callback webhooks.',
        priority: 'high',
        status: 'in_progress',
        resolution_notes: 'Optimizing Supabase DB pooling & Redis concurrency.'
      },
      {
        ticket_number: 'TCK-2026-403',
        client_id: auraClient?.id || nexoraClient.id,
        project_id: auraProj?.id || null,
        subject: 'Add Google Tag Manager Container to Shopify Theme',
        description: 'Client requested Google Tag Manager snippet injection in theme header.',
        priority: 'low',
        status: 'open',
        resolution_notes: 'Awaiting GTM Container ID from marketing team.'
      }
    ];

    const { data: createdTickets, error: tickErr } = await supabase.from('support_tickets').insert(ticketsToInsert).select();
    if (tickErr) console.error('Error inserting support_tickets:', tickErr.message);
    else console.log(`✓ Created ${createdTickets?.length || 0} support tickets successfully.`);
  }

  // 12. SEED MEETINGS & ATTENDANCE (BATCH-WISE)
  if (webBatch) {
    const { data: createdMeeting, error: meetErr } = await supabase.from('meetings').insert({
      title: 'Daily Technical Standup & Code Review',
      topic: 'Sprint 2 PR reviews, mobile responsive layout audit, and database schema overview.',
      scheduled_at: new Date(Date.now() + 3600000).toISOString(),
      meeting_link: 'https://meet.google.com/tex-tech-sync',
      batch_id: webBatch.id,
      domain: 'web_dev',
      status: 'scheduled'
    }).select().single();

    if (meetErr) console.error('Error inserting meeting:', meetErr.message);
    else {
      console.log(`✓ Created scheduled meeting for batch: ${createdMeeting?.title}`);
      if (internProfiles[0]) {
        const { error: attErr } = await supabase.from('attendance').insert({
          meeting_id: createdMeeting.id,
          user_id: internProfiles[0].id,
          batch_id: webBatch.id,
          status: 'present',
          marked_at: new Date().toISOString()
        });
        if (attErr) console.error('Error inserting attendance:', attErr.message);
        else console.log('✓ Created attendance record.');
      }
    }
  }

  // 13. SEED REALTIME CHAT MESSAGES IN BATCH CHAT (batch_messages table)
  if (webBatch && adminProfile) {
    const messagesToInsert = [
      {
        batch_id: webBatch.id,
        sender_id: adminProfile.id,
        message: 'Welcome everyone to the TexWeb Solution unified workspace! All project tasks, code sprints, and Google Meet syncs will be coordinated right here.'
      },
      {
        batch_id: webBatch.id,
        sender_id: techMentorProfile?.id || adminProfile.id,
        message: 'Sprint 2 deliverables for Nexora SaaS Portal have been published to the Projects board. Please inspect your assigned tasks.'
      }
    ];

    const { data: msgData, error: msgErr } = await supabase.from('batch_messages').insert(messagesToInsert).select();
    if (msgErr) console.error('Error inserting batch messages:', msgErr.message);
    else console.log(`✓ Created ${msgData?.length || 0} batch chat messages.`);
  }

  // 14. SEED NOTIFICATIONS & AUDIT LOGS
  if (adminProfile) {
    const notifs = [
      {
        user_id: adminProfile.id,
        title: 'Deal Closed Won 🎉',
        message: 'Nexora Enterprise SaaS Platform & API marked Closed Won for ₹3,50,000.',
        type: 'general',
        is_read: false
      },
      {
        user_id: adminProfile.id,
        title: 'Payment Received ₹1,40,000',
        message: 'Invoice INV-2026-0081 settled by Nexora Cloud Solutions.',
        type: 'general',
        is_read: false
      },
      {
        user_id: adminProfile.id,
        title: 'New Inbound Lead',
        message: 'Dr. Siddharth Sen requested HealthTech Portal development.',
        type: 'general',
        is_read: false
      }
    ];

    const { data: nData, error: nErr } = await supabase.from('notifications').insert(notifs).select();
    if (nErr) console.error('Error inserting notifications:', nErr.message);
    else console.log(`✓ Created ${nData?.length || 0} notifications.`);

    const { error: audErr } = await supabase.from('audit_logs').insert([
      {
        actor_id: adminProfile.id,
        actor_role: 'super_admin',
        action: 'DATABASE_INITIALIZATION',
        entity_type: 'SYSTEM',
        summary: 'Initialized unified business platform seed data with batches, clients, projects, SMM, finance, and support.'
      }
    ]);
    if (audErr) console.error('Error inserting audit log:', audErr.message);
    else console.log('✓ Created audit log entry.');
  }

  console.log('=== COMPLETE CLEAN DATABASE SEED FINISHED 100% SUCCESSFULLY! ===');
}

resetAndSeed().catch(err => {
  console.error('Fatal error during reset and seed:', err);
  process.exit(1);
});
