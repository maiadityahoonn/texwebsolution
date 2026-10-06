-- ==============================================================================
-- TEXWEB SOLUTION - UNIFIED BUSINESS MANAGEMENT PLATFORM MIGRATION
-- Migration Date: 2026-10-06
-- Purpose: Unify CRM, Clients, Projects, SMM, Finance, HR, Support & Notifications
-- ==============================================================================

-- 1. Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. EXTEND PROFILES WITH ENTERPRISE ORG HIERARCHY
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department TEXT DEFAULT 'web_dev';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS designation TEXT DEFAULT 'Team Member';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS employment_type TEXT DEFAULT 'intern';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS reporting_head_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb;

-- 3. CENTRAL CLIENTS ENTITY
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  company_name TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  industry TEXT,
  address TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'lead', 'onboarding', 'paused', 'churned')),
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  account_manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client secondary contacts
CREATE TABLE IF NOT EXISTS public.client_contacts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  designation TEXT,
  email TEXT,
  phone TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SALES PIPELINE & DEALS
CREATE TABLE IF NOT EXISTS public.deals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  pipeline_stage TEXT NOT NULL DEFAULT 'qualification' CHECK (
    pipeline_stage IN ('new', 'assigned', 'contacted', 'qualified', 'requirement', 'meeting', 'proposal', 'negotiation', 'approval', 'agreement', 'advance_payment', 'closed_won', 'closed_lost')
  ),
  deal_value NUMERIC(12, 2) DEFAULT 0,
  service TEXT NOT NULL DEFAULT 'Web Development',
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  expected_close_date DATE,
  loss_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Proposals & Quotations
CREATE TABLE IF NOT EXISTS public.proposals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired')),
  scope_of_work TEXT,
  deliverables TEXT,
  document_url TEXT,
  sent_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quotations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  quotation_number TEXT UNIQUE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
  discount NUMERIC(12, 2) DEFAULT 0,
  tax NUMERIC(12, 2) DEFAULT 0,
  total NUMERIC(12, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'declined')),
  items JSONB DEFAULT '[]'::jsonb,
  valid_until DATE,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. COMMERCIAL PROJECTS & ENGINEERING
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  tech_lead_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  pm_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'qa_testing', 'client_review', 'deployment', 'completed', 'on_hold', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  budget NUMERIC(12, 2) DEFAULT 0,
  start_date DATE,
  target_date DATE,
  completed_at TIMESTAMPTZ,
  github_repo TEXT,
  live_url TEXT,
  staging_url TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role_in_project TEXT NOT NULL DEFAULT 'developer' CHECK (role_in_project IN ('lead', 'developer', 'intern', 'qa', 'designer', 'viewer')),
  assigned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Extend tasks with project_id and QA fields
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS qa_status TEXT DEFAULT 'pending';

-- 6. SOCIAL MEDIA MARKETING (SMM)
CREATE TABLE IF NOT EXISTS public.smm_clients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  smm_head_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  package_tier TEXT DEFAULT 'Standard',
  monthly_fee NUMERIC(10, 2) DEFAULT 0,
  target_audience TEXT,
  brand_guidelines TEXT,
  social_handles JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.content_calendar (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  smm_client_id UUID REFERENCES public.smm_clients(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'facebook', 'linkedin', 'twitter', 'youtube', 'tiktok', 'other')),
  content_type TEXT NOT NULL DEFAULT 'post' CHECK (content_type IN ('post', 'reel', 'story', 'carousel', 'video', 'article')),
  copy_text TEXT,
  media_urls JSONB DEFAULT '[]'::jsonb,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'assigned', 'in_creation', 'internal_review', 'client_review', 'approved', 'scheduled', 'published', 'rejected')),
  assigned_writer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_designer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_editor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  client_feedback TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. FINANCE & BILLING
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(12, 2) DEFAULT 0,
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'partially_paid', 'paid', 'overdue', 'cancelled')),
  milestone_type TEXT DEFAULT 'advance' CHECK (milestone_type IN ('advance', 'milestone', 'final', 'monthly_retainer', 'one_time')),
  payment_terms TEXT,
  notes TEXT,
  pdf_url TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT NOT NULL DEFAULT 'bank_transfer' CHECK (payment_method IN ('bank_transfer', 'upi', 'card', 'cash', 'other')),
  reference_id TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  receipt_url TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CLIENT HANDOVER & SUPPORT TICKETS
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_number TEXT UNIQUE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_client', 'resolved', 'closed')),
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  sla_deadline TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. USER NOTIFICATION PREFERENCES
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  sound_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  push_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  lead_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  task_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  chat_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  project_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  smm_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  finance_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  support_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. REALTIME PUBLICATION EXTENSION
DO $$
BEGIN
  -- Add new tables to realtime publication safely
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'clients') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.clients;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'deals') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.deals;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'projects') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'smm_clients') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.smm_clients;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'content_calendar') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.content_calendar;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'invoices') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.invoices;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'payments') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'support_tickets') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Ignore if publication already contains tables or permissions limited
  NULL;
END $$;

-- 10. ENHANCE LEADS TABLE FOR META ADS (FACEBOOK & INSTAGRAM)
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS meta_lead_id TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS ad_id TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS ad_name TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS adset_id TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS adset_name TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS campaign_id TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS campaign_name TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS form_id TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS form_name TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'website';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS budget_range TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS raw_metadata JSONB DEFAULT '{}'::jsonb;

-- Safely ensure index for duplicate prevention
CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_meta_lead_id ON public.leads (meta_lead_id) WHERE meta_lead_id IS NOT NULL;

