-- ==============================================================================
-- TEXWEB SOLUTION - SUPABASE COMPLETE DATABASE SCHEMA & REALTIME RBAC SYSTEM
-- ==============================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USER PROFILES & ROLE-BASED ACCESS CONTROL (RBAC)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'intern' CHECK (role IN ('super_admin', 'team_leader', 'mentor', 'hr', 'intern')),
  domain TEXT DEFAULT 'web_dev' CHECK (domain IN ('web_dev', 'marketing', 'ai_automation', 'design', 'management')),
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'completed', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TASKS & ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  domain TEXT NOT NULL DEFAULT 'web_dev',
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  deadline TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'submitted', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TASK SUBMISSIONS & REVIEWS
CREATE TABLE IF NOT EXISTS public.task_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  intern_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  submission_url TEXT NOT NULL,
  notes TEXT,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MEETINGS & VIDEO CONFERENCES
CREATE TABLE IF NOT EXISTS public.meetings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  topic TEXT NOT NULL,
  meeting_link TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT DEFAULT 15,
  host_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  attendee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. REALTIME MESSAGES (1-on-1 CHAT)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  attachment_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. REALTIME NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'general' CHECK (type IN ('task', 'meeting', 'message', 'certificate', 'lead', 'general')),
  link_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. VERIFIED CERTIFICATES & EXPERIENCE LETTERS
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  certificate_code TEXT UNIQUE NOT NULL,
  intern_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  intern_name TEXT NOT NULL,
  domain TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  performance_grade TEXT NOT NULL DEFAULT 'A+',
  issued_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  pdf_url TEXT,
  verification_status TEXT NOT NULL DEFAULT 'verified' CHECK (verification_status IN ('verified', 'revoked')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. LEADS & CRM TABLE
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  service TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'Website',
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'In Progress', 'Converted', 'Lost')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. DYNAMIC CMS CONTENT (Website Data)
CREATE TABLE IF NOT EXISTS public.cms_content (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  content_json JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ENABLE REALTIME SUBSCRIPTIONS SAFELY (IDEMPOTENT)
-- ==============================================================================
DO $$
BEGIN
  -- Add messages if not already in publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;

  -- Add notifications
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;

  -- Add tasks
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'tasks'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
  END IF;

  -- Add meetings
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'meetings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.meetings;
  END IF;

  -- Add leads
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'leads'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
  END IF;
END $$;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES (SAFE DROP & RECREATE)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_content ENABLE ROW LEVEL SECURITY;

-- 1. Certificates Policies
DROP POLICY IF EXISTS "Public can view verified certificates" ON public.certificates;
CREATE POLICY "Public can view verified certificates" ON public.certificates FOR SELECT USING (verification_status = 'verified');

DROP POLICY IF EXISTS "Authenticated can manage certificates" ON public.certificates;
CREATE POLICY "Authenticated can manage certificates" ON public.certificates FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. CMS Content Policies
DROP POLICY IF EXISTS "Public can view CMS content" ON public.cms_content;
CREATE POLICY "Public can view CMS content" ON public.cms_content FOR SELECT USING (true);

-- 3. Leads Policies
DROP POLICY IF EXISTS "Public can insert leads" ON public.leads;
CREATE POLICY "Public can insert leads" ON public.leads FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated can view and update leads" ON public.leads;
CREATE POLICY "Authenticated can view and update leads" ON public.leads FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Profiles Policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow insert to profiles" ON public.profiles;
CREATE POLICY "Allow insert to profiles" ON public.profiles FOR INSERT WITH CHECK (true);

-- 5. Tasks Policies
DROP POLICY IF EXISTS "Users can view assigned or created tasks" ON public.tasks;
CREATE POLICY "Users can view assigned or created tasks" ON public.tasks FOR SELECT TO authenticated USING (
  assigned_to = auth.uid() OR assigned_by = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'team_leader')
  )
);

DROP POLICY IF EXISTS "TL and Admin can create tasks" ON public.tasks;
CREATE POLICY "TL and Admin can create tasks" ON public.tasks FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'team_leader'))
);

DROP POLICY IF EXISTS "TL and Admin can update tasks" ON public.tasks;
CREATE POLICY "TL and Admin can update tasks" ON public.tasks FOR UPDATE TO authenticated USING (
  assigned_to = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'team_leader')
  )
);

-- 6. Meetings Policies
DROP POLICY IF EXISTS "Users can view and manage meetings" ON public.meetings;
CREATE POLICY "Users can view and manage meetings" ON public.meetings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 7. Messages Policies
DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;
CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT TO authenticated USING (
  sender_id = auth.uid() OR receiver_id = auth.uid()
);

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (
  sender_id = auth.uid()
);

-- 8. Notifications Policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (
  user_id = auth.uid()
);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, domain)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'intern'),
    COALESCE(new.raw_user_meta_data->>'domain', 'web_dev')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
