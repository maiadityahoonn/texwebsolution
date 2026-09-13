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
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'paused', 'completed', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS batch_id UUID;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS batch_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS assigned_tl_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS assigned_mentor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_domain_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_domain_check CHECK (domain IN (
  'web_dev', 'frontend_dev', 'backend_dev', 'telecaller', 'sales_executive', 'sales',
  'marketing', 'digital_marketing', 'script_writing', 'video_editing', 'ai_automation', 'design', 'management'
));
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_status_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_status_check CHECK (status IN ('active', 'pending', 'paused', 'completed', 'suspended'));

CREATE TABLE IF NOT EXISTS public.batches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT NOT NULL DEFAULT 'web_dev',
  hr_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  mentor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  tl_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  starts_at DATE,
  ends_at DATE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS hr_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS batch_type TEXT NOT NULL DEFAULT 'internship';
ALTER TABLE public.batches DROP CONSTRAINT IF EXISTS batches_batch_type_check;
ALTER TABLE public.batches ADD CONSTRAINT batches_batch_type_check CHECK (
  batch_type IN ('internship', 'development', 'sales', 'sql', 'marketing', 'training', 'other')
);

CREATE TABLE IF NOT EXISTS public.member_assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  member_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
  tl_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  mentor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  domain TEXT NOT NULL DEFAULT 'web_dev',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'transferred')),
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TASKS & ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  domain TEXT NOT NULL DEFAULT 'web_dev',
  batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
  visible_to_interns BOOLEAN NOT NULL DEFAULT FALSE,
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  deadline TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'submitted', 'reviewed', 'approved', 'rejected', 'changes_requested')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS visible_to_interns BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS assignment_scope TEXT DEFAULT 'intern' CHECK (assignment_scope IN ('tl', 'intern', 'both'));
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS reference_url TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS file_type TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS file_size BIGINT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS expected_output TEXT;
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_status_check CHECK (status IN ('pending', 'not_started', 'in_progress', 'submitted', 'under_review', 'reviewed', 'approved', 'completed', 'rejected', 'changes_requested', 'overdue'));

-- 4. TASK SUBMISSIONS & REVIEWS
CREATE TABLE IF NOT EXISTS public.task_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  intern_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  submission_url TEXT,
  file_url TEXT,
  file_name TEXT,
  file_type TEXT,
  file_size BIGINT,
  notes TEXT,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.task_submissions ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE public.task_submissions ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE public.task_submissions ADD COLUMN IF NOT EXISTS file_type TEXT;
ALTER TABLE public.task_submissions ADD COLUMN IF NOT EXISTS file_size BIGINT;
ALTER TABLE public.task_submissions ALTER COLUMN submission_url DROP NOT NULL;

CREATE TABLE IF NOT EXISTS public.task_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  submission_id UUID REFERENCES public.task_submissions(id) ON DELETE SET NULL,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  review_stage TEXT NOT NULL DEFAULT 'tl_review' CHECK (review_stage IN ('tl_review', 'mentor_review', 'admin_review')),
  status TEXT NOT NULL DEFAULT 'reviewed' CHECK (status IN ('reviewed', 'approved', 'rejected', 'changes_requested')),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.daily_updates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tl_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  mentor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
  domain TEXT NOT NULL DEFAULT 'web_dev',
  summary TEXT NOT NULL,
  blockers TEXT,
  present_interns TEXT,
  absent_interns TEXT,
  completed_tasks TEXT,
  pending_tasks TEXT,
  tomorrow_plan TEXT,
  completed_count INT DEFAULT 0,
  pending_count INT DEFAULT 0,
  update_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.daily_updates ADD COLUMN IF NOT EXISTS task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL;
ALTER TABLE public.daily_updates ADD COLUMN IF NOT EXISTS assigned_tasks TEXT;
ALTER TABLE public.daily_updates ADD COLUMN IF NOT EXISTS reviewer_comment TEXT;
ALTER TABLE public.daily_updates ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.daily_updates ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE SET NULL,
  domain TEXT NOT NULL DEFAULT 'web_dev',
  attendance_date DATE DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'excused')),
  check_in_at TIMESTAMPTZ DEFAULT NOW(),
  check_out_at TIMESTAMPTZ,
  marked_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MEETINGS & VIDEO CONFERENCES
CREATE TABLE IF NOT EXISTS public.meetings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  topic TEXT NOT NULL,
  meeting_link TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT DEFAULT 15,
  batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
  domain TEXT NOT NULL DEFAULT 'web_dev',
  attendance_token TEXT,
  host_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  attendee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.meetings ADD COLUMN IF NOT EXISTS batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL;
ALTER TABLE public.meetings ADD COLUMN IF NOT EXISTS domain TEXT NOT NULL DEFAULT 'web_dev';
ALTER TABLE public.meetings ADD COLUMN IF NOT EXISTS attendance_token TEXT;
CREATE INDEX IF NOT EXISTS idx_tasks_batch_id ON public.tasks(batch_id);
CREATE INDEX IF NOT EXISTS idx_tasks_visible_to_interns ON public.tasks(visible_to_interns);
CREATE INDEX IF NOT EXISTS idx_meetings_batch_id ON public.meetings(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_messages_batch_id ON public.batch_messages(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_announcements_batch_id ON public.batch_announcements(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_resources_batch_id ON public.batch_resources(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_escalations_batch_id ON public.batch_escalations(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_assignment_history_batch_id ON public.batch_assignment_history(batch_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_once_per_meeting_user
ON public.attendance(user_id, meeting_id)
WHERE meeting_id IS NOT NULL;

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

CREATE TABLE IF NOT EXISTS public.batch_assignment_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE NOT NULL,
  assignment_type TEXT NOT NULL CHECK (assignment_type IN ('hr', 'mentor', 'team_leader', 'member_transfer')),
  old_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  new_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  member_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  from_batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
  to_batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.batch_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  reply_to_id UUID REFERENCES public.batch_messages(id) ON DELETE SET NULL,
  attachment_url TEXT,
  attachment_name TEXT,
  attachment_type TEXT,
  reference_type TEXT CHECK (reference_type IN ('task', 'meeting', 'file', 'announcement', 'none')),
  reference_id UUID,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.batch_announcements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'announcement' CHECK (category IN ('announcement', 'important_link', 'rule', 'resource', 'pinned')),
  link_url TEXT,
  pinned BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.batch_resources (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'technical_guides' CHECK (category IN ('technical_guides', 'task_guidelines', 'git_guidelines', 'learning_material', 'important_documents', 'useful_links', 'other')),
  description TEXT,
  link_url TEXT,
  file_url TEXT,
  file_name TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.batch_escalations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE NOT NULL,
  issue TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  description TEXT,
  related_member_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  related_task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  attachment_url TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'action_required', 'resolved', 'closed')),
  resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
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
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL DEFAULT auth.uid(),
  delivery_channels JSONB DEFAULT '["in_app"]'::jsonb,
  delivery_status JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL DEFAULT auth.uid();
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS delivery_channels JSONB DEFAULT '["in_app"]'::jsonb;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS delivery_status JSONB DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS public.notification_queue (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  notification_id UUID REFERENCES public.notifications(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp')),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed')),
  attempt_count INT NOT NULL DEFAULT 0,
  last_error TEXT,
  next_attempt_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
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

CREATE TABLE IF NOT EXISTS public.cms_versions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cms_key TEXT NOT NULL,
  content_json JSONB NOT NULL,
  version_no INT NOT NULL DEFAULT 1,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_role TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  summary TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.current_workspace_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.current_workspace_domain()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT domain FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.current_user_related_to(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    target_user_id = auth.uid()
    OR public.current_workspace_role() IN ('super_admin', 'hr')
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = target_user_id
        AND (p.assigned_tl_id = auth.uid() OR p.assigned_mentor_id = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.member_assignments ma
      WHERE (ma.member_id = target_user_id AND (ma.tl_id = auth.uid() OR ma.mentor_id = auth.uid()))
        OR (ma.member_id = auth.uid() AND (ma.tl_id = target_user_id OR ma.mentor_id = target_user_id))
    );
$$;

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

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'batches'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.batches;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'member_assignments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.member_assignments;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'daily_updates'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_updates;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'task_reviews'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.task_reviews;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'attendance'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'cms_content'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.cms_content;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'audit_logs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notification_queue'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notification_queue;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'cms_versions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.cms_versions;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'batch_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.batch_messages;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'batch_announcements'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.batch_announcements;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'batch_resources'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.batch_resources;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'batch_escalations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.batch_escalations;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'batch_assignment_history'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.batch_assignment_history;
  END IF;
END $$;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES (SAFE DROP & RECREATE)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_assignment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_batch_participant(check_batch_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND (
        p.role = 'super_admin'
        OR p.batch_id = check_batch_id
        OR EXISTS (
          SELECT 1 FROM public.batches b
          WHERE b.id = check_batch_id
            AND (b.hr_id = auth.uid() OR b.mentor_id = auth.uid() OR b.tl_id = auth.uid())
        )
        OR EXISTS (
          SELECT 1 FROM public.member_assignments ma
          WHERE ma.batch_id = check_batch_id
            AND ma.member_id = auth.uid()
            AND ma.status = 'active'
        )
      )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.can_manage_batch_workspace(check_batch_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND (
        p.role = 'super_admin'
        OR EXISTS (
          SELECT 1 FROM public.batches b
          WHERE b.id = check_batch_id
            AND (b.hr_id = auth.uid() OR b.mentor_id = auth.uid() OR b.tl_id = auth.uid())
        )
      )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP POLICY IF EXISTS "Batch participants can view batch messages" ON public.batch_messages;
CREATE POLICY "Batch participants can view batch messages" ON public.batch_messages FOR SELECT TO authenticated USING (public.is_batch_participant(batch_id));
DROP POLICY IF EXISTS "Batch participants can send batch messages" ON public.batch_messages;
CREATE POLICY "Batch participants can send batch messages" ON public.batch_messages FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid() AND public.is_batch_participant(batch_id));

DROP POLICY IF EXISTS "Batch participants can view announcements" ON public.batch_announcements;
CREATE POLICY "Batch participants can view announcements" ON public.batch_announcements FOR SELECT TO authenticated USING (public.is_batch_participant(batch_id));
DROP POLICY IF EXISTS "Batch managers can write announcements" ON public.batch_announcements;
CREATE POLICY "Batch managers can write announcements" ON public.batch_announcements FOR ALL TO authenticated USING (public.can_manage_batch_workspace(batch_id)) WITH CHECK (public.can_manage_batch_workspace(batch_id));

DROP POLICY IF EXISTS "Batch participants can view resources" ON public.batch_resources;
CREATE POLICY "Batch participants can view resources" ON public.batch_resources FOR SELECT TO authenticated USING (public.is_batch_participant(batch_id));
DROP POLICY IF EXISTS "Batch managers can write resources" ON public.batch_resources;
CREATE POLICY "Batch managers can write resources" ON public.batch_resources FOR ALL TO authenticated USING (public.can_manage_batch_workspace(batch_id)) WITH CHECK (public.can_manage_batch_workspace(batch_id));

DROP POLICY IF EXISTS "Batch participants can view escalations" ON public.batch_escalations;
CREATE POLICY "Batch participants can view escalations" ON public.batch_escalations FOR SELECT TO authenticated USING (public.is_batch_participant(batch_id));
DROP POLICY IF EXISTS "Batch participants can create escalations" ON public.batch_escalations;
CREATE POLICY "Batch participants can create escalations" ON public.batch_escalations FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid() AND public.is_batch_participant(batch_id));
DROP POLICY IF EXISTS "Batch managers can update escalations" ON public.batch_escalations;
CREATE POLICY "Batch managers can update escalations" ON public.batch_escalations FOR UPDATE TO authenticated USING (public.can_manage_batch_workspace(batch_id)) WITH CHECK (public.can_manage_batch_workspace(batch_id));

DROP POLICY IF EXISTS "Batch participants can view assignment history" ON public.batch_assignment_history;
CREATE POLICY "Batch participants can view assignment history" ON public.batch_assignment_history FOR SELECT TO authenticated USING (public.is_batch_participant(batch_id));
DROP POLICY IF EXISTS "Batch managers can write assignment history" ON public.batch_assignment_history;
CREATE POLICY "Batch managers can write assignment history" ON public.batch_assignment_history FOR INSERT TO authenticated WITH CHECK (public.can_manage_batch_workspace(batch_id));

-- 1. Certificates Policies
DROP POLICY IF EXISTS "Public can view verified certificates" ON public.certificates;
CREATE POLICY "Public can view verified certificates" ON public.certificates FOR SELECT USING (verification_status = 'verified');

DROP POLICY IF EXISTS "Authenticated can manage certificates" ON public.certificates;
DROP POLICY IF EXISTS "Authenticated can view own certificates" ON public.certificates;
CREATE POLICY "Authenticated can view own certificates" ON public.certificates FOR SELECT TO authenticated USING (
  intern_id = auth.uid()
  OR issued_by = auth.uid()
  OR public.current_workspace_role() = 'hr'
);

DROP POLICY IF EXISTS "Admin HR can manage certificates" ON public.certificates;
CREATE POLICY "Admin HR can manage certificates" ON public.certificates FOR ALL TO authenticated USING (
  public.current_workspace_role() = 'hr'
) WITH CHECK (
  public.current_workspace_role() = 'hr'
);

-- 2. CMS Content Policies
DROP POLICY IF EXISTS "Public can view CMS content" ON public.cms_content;
CREATE POLICY "Public can view CMS content" ON public.cms_content FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin HR can manage CMS content" ON public.cms_content;
CREATE POLICY "Admin HR can manage CMS content" ON public.cms_content FOR ALL TO authenticated USING (
  public.current_workspace_role() IN ('super_admin', 'hr')
) WITH CHECK (
  public.current_workspace_role() IN ('super_admin', 'hr')
);

DROP POLICY IF EXISTS "Authenticated can view CMS versions" ON public.cms_versions;
CREATE POLICY "Authenticated can view CMS versions" ON public.cms_versions FOR SELECT TO authenticated USING (
  public.current_workspace_role() IN ('super_admin', 'hr')
);

DROP POLICY IF EXISTS "Admin HR can create CMS versions" ON public.cms_versions;
CREATE POLICY "Admin HR can create CMS versions" ON public.cms_versions FOR INSERT TO authenticated WITH CHECK (
  public.current_workspace_role() IN ('super_admin', 'hr')
);

DROP POLICY IF EXISTS "Managers can view audit logs" ON public.audit_logs;
CREATE POLICY "Managers can view audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (
  actor_id = auth.uid()
  OR public.current_workspace_role() IN ('super_admin', 'hr')
);

DROP POLICY IF EXISTS "Authenticated can create audit logs" ON public.audit_logs;
CREATE POLICY "Authenticated can create audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (
  actor_id = auth.uid()
);

-- 3. Leads Policies
DROP POLICY IF EXISTS "Public can insert leads" ON public.leads;
CREATE POLICY "Public can insert leads" ON public.leads FOR INSERT WITH CHECK (false);

DROP POLICY IF EXISTS "Authenticated can view and update leads" ON public.leads;
CREATE POLICY "Authenticated can view and update leads" ON public.leads FOR ALL TO authenticated USING (
  public.current_workspace_role() IN ('super_admin', 'hr')
  OR public.current_workspace_domain() = 'sales'
) WITH CHECK (
  public.current_workspace_role() IN ('super_admin', 'hr')
  OR public.current_workspace_domain() = 'sales'
);

-- 4. Profiles Policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (
  public.current_user_related_to(id)
);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (
  id = auth.uid()
) WITH CHECK (
  id = auth.uid()
);

DROP POLICY IF EXISTS "Admin HR can update profiles" ON public.profiles;
CREATE POLICY "Admin HR can update profiles" ON public.profiles FOR UPDATE TO authenticated USING (
  public.current_workspace_role() = 'super_admin'
  OR (public.current_workspace_role() = 'hr' AND role IN ('mentor', 'intern'))
) WITH CHECK (
  public.current_workspace_role() = 'super_admin'
  OR (public.current_workspace_role() = 'hr' AND role IN ('mentor', 'intern'))
);

DROP POLICY IF EXISTS "Allow insert to profiles" ON public.profiles;
CREATE POLICY "Allow insert to profiles" ON public.profiles FOR INSERT TO authenticated WITH CHECK (
  (id = auth.uid() AND role = 'intern')
  OR (public.current_workspace_role() = 'super_admin' AND role = 'hr')
  OR (public.current_workspace_role() = 'hr' AND role IN ('mentor', 'intern'))
);

DROP POLICY IF EXISTS "Authenticated can view batches" ON public.batches;
CREATE POLICY "Authenticated can view batches" ON public.batches FOR SELECT TO authenticated USING (
  public.current_workspace_role() = 'super_admin'
  OR (public.current_workspace_role() = 'hr' AND hr_id = auth.uid())
  OR mentor_id = auth.uid()
  OR tl_id = auth.uid()
  OR id IN (SELECT p.batch_id FROM public.profiles p WHERE p.id = auth.uid())
);

DROP POLICY IF EXISTS "Admin HR Mentor can manage batches" ON public.batches;
DROP POLICY IF EXISTS "Super Admin can create batches" ON public.batches;
CREATE POLICY "Super Admin can create batches" ON public.batches FOR INSERT TO authenticated WITH CHECK (
  public.current_workspace_role() = 'super_admin'
);

DROP POLICY IF EXISTS "Super Admin and assigned HR can update batches" ON public.batches;
CREATE POLICY "Super Admin and assigned HR can update batches" ON public.batches FOR UPDATE TO authenticated USING (
  public.current_workspace_role() = 'super_admin'
  OR (public.current_workspace_role() = 'hr' AND hr_id = auth.uid())
  OR (public.current_workspace_role() = 'mentor' AND mentor_id = auth.uid())
) WITH CHECK (
  public.current_workspace_role() = 'super_admin'
  OR (public.current_workspace_role() = 'hr' AND hr_id = auth.uid())
  OR (public.current_workspace_role() = 'mentor' AND mentor_id = auth.uid())
);

DROP POLICY IF EXISTS "Super Admin can delete batches" ON public.batches;
CREATE POLICY "Super Admin can delete batches" ON public.batches FOR DELETE TO authenticated USING (
  public.current_workspace_role() = 'super_admin'
);

CREATE OR REPLACE FUNCTION public.enforce_batch_update_scope()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF public.current_workspace_role() = 'super_admin' THEN
    RETURN NEW;
  END IF;

  IF public.current_workspace_role() = 'hr'
    AND OLD.hr_id = auth.uid()
    AND NEW.hr_id IS NOT DISTINCT FROM OLD.hr_id
    AND NEW.name IS NOT DISTINCT FROM OLD.name
    AND NEW.domain IS NOT DISTINCT FROM OLD.domain
    AND NEW.status IS NOT DISTINCT FROM OLD.status
    AND NEW.starts_at IS NOT DISTINCT FROM OLD.starts_at
    AND NEW.ends_at IS NOT DISTINCT FROM OLD.ends_at
    AND NEW.created_by IS NOT DISTINCT FROM OLD.created_by
    AND NEW.created_at IS NOT DISTINCT FROM OLD.created_at
    AND (
      NEW.mentor_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = NEW.mentor_id
          AND p.role = 'mentor'
          AND p.batch_id = OLD.id
          AND p.domain = OLD.domain
      )
    )
    AND (
      NEW.tl_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = NEW.tl_id
          AND p.role = 'team_leader'
          AND p.domain = OLD.domain
      )
    )
  THEN
    RETURN NEW;
  END IF;

  IF public.current_workspace_role() = 'mentor'
    AND OLD.mentor_id = auth.uid()
    AND NEW.mentor_id IS NOT DISTINCT FROM OLD.mentor_id
    AND NEW.hr_id IS NOT DISTINCT FROM OLD.hr_id
    AND NEW.name IS NOT DISTINCT FROM OLD.name
    AND NEW.domain IS NOT DISTINCT FROM OLD.domain
    AND NEW.status IS NOT DISTINCT FROM OLD.status
    AND NEW.starts_at IS NOT DISTINCT FROM OLD.starts_at
    AND NEW.ends_at IS NOT DISTINCT FROM OLD.ends_at
    AND NEW.created_by IS NOT DISTINCT FROM OLD.created_by
    AND NEW.created_at IS NOT DISTINCT FROM OLD.created_at
    AND (
      NEW.tl_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = NEW.tl_id
          AND p.role = 'team_leader'
          AND p.batch_id = OLD.id
          AND p.domain = OLD.domain
      )
    )
  THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Only Super Admin can edit batch details. Assigned HR can only assign Mentor and Team Leader.';
END;
$$;

DROP TRIGGER IF EXISTS enforce_batch_update_scope_trigger ON public.batches;
CREATE TRIGGER enforce_batch_update_scope_trigger
BEFORE UPDATE ON public.batches
FOR EACH ROW
EXECUTE FUNCTION public.enforce_batch_update_scope();

DROP POLICY IF EXISTS "Authenticated can view member assignments" ON public.member_assignments;
CREATE POLICY "Authenticated can view member assignments" ON public.member_assignments FOR SELECT TO authenticated USING (
  member_id = auth.uid()
  OR tl_id = auth.uid()
  OR mentor_id = auth.uid()
  OR public.current_workspace_role() IN ('super_admin', 'hr')
);

DROP POLICY IF EXISTS "Admin HR can manage member assignments" ON public.member_assignments;
CREATE POLICY "Admin HR can manage member assignments" ON public.member_assignments FOR ALL TO authenticated USING (
  public.current_workspace_role() IN ('super_admin', 'hr')
) WITH CHECK (
  public.current_workspace_role() IN ('super_admin', 'hr')
);

-- 5. Tasks Policies
DROP POLICY IF EXISTS "Users can view assigned or created tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can view tasks by batch hierarchy" ON public.tasks;
CREATE POLICY "Users can view tasks by batch hierarchy" ON public.tasks FOR SELECT TO authenticated USING (
  assigned_to = auth.uid()
  OR assigned_by = auth.uid()
  OR public.current_workspace_role() IN ('super_admin', 'hr')
  OR public.current_user_related_to(assigned_to)
  OR public.current_user_related_to(assigned_by)
  OR (
    visible_to_interns = TRUE
    AND batch_id IN (SELECT p.batch_id FROM public.profiles p WHERE p.id = auth.uid())
  )
);

DROP POLICY IF EXISTS "TL and Admin can create tasks" ON public.tasks;
CREATE POLICY "TL and Admin can create tasks" ON public.tasks FOR INSERT TO authenticated WITH CHECK (
  assigned_by = auth.uid()
  AND public.current_workspace_role() IN ('super_admin', 'hr', 'team_leader', 'mentor')
  AND (
    public.current_workspace_role() IN ('super_admin', 'hr')
    OR public.current_user_related_to(assigned_to)
  )
);

DROP POLICY IF EXISTS "Authenticated can view task reviews" ON public.task_reviews;
CREATE POLICY "Authenticated can view task reviews" ON public.task_reviews FOR SELECT TO authenticated USING (
  reviewer_id = auth.uid()
  OR public.current_workspace_role() IN ('super_admin', 'hr')
  OR EXISTS (
    SELECT 1 FROM public.tasks t
    WHERE t.id = public.task_reviews.task_id
    AND (
      t.assigned_to = auth.uid()
      OR t.assigned_by = auth.uid()
      OR public.current_user_related_to(t.assigned_to)
      OR public.current_user_related_to(t.assigned_by)
    )
  )
);

DROP POLICY IF EXISTS "TL Mentor Admin can create task reviews" ON public.task_reviews;
CREATE POLICY "TL Mentor Admin can create task reviews" ON public.task_reviews FOR INSERT TO authenticated WITH CHECK (
  reviewer_id = auth.uid()
  AND public.current_workspace_role() IN ('super_admin', 'hr', 'team_leader', 'mentor')
  AND (
    public.current_workspace_role() IN ('super_admin', 'hr')
    OR EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.id = public.task_reviews.task_id
      AND (t.assigned_by = auth.uid() OR public.current_user_related_to(t.assigned_to))
    )
  )
);

DROP POLICY IF EXISTS "TL Mentor Admin can view daily updates" ON public.daily_updates;
CREATE POLICY "TL Mentor Admin can view daily updates" ON public.daily_updates FOR SELECT TO authenticated USING (
  tl_id = auth.uid()
  OR mentor_id = auth.uid()
  OR public.current_workspace_role() IN ('super_admin', 'hr')
);

DROP POLICY IF EXISTS "TL can create daily updates" ON public.daily_updates;
CREATE POLICY "TL can create daily updates" ON public.daily_updates FOR INSERT TO authenticated WITH CHECK (
  tl_id = auth.uid() AND public.current_workspace_role() = 'team_leader'
);

DROP POLICY IF EXISTS "Users can view attendance by hierarchy" ON public.attendance;
CREATE POLICY "Users can view attendance by hierarchy" ON public.attendance FOR SELECT TO authenticated USING (
  user_id = auth.uid()
  OR marked_by = auth.uid()
  OR public.current_workspace_role() IN ('super_admin', 'hr')
  OR public.current_user_related_to(user_id)
  OR public.current_user_related_to(marked_by)
);

DROP POLICY IF EXISTS "Users and managers can mark attendance" ON public.attendance;
CREATE POLICY "Users and managers can mark attendance" ON public.attendance FOR INSERT TO authenticated WITH CHECK (
  (user_id = auth.uid() AND (marked_by IS NULL OR marked_by = auth.uid()))
  OR public.current_workspace_role() IN ('super_admin', 'hr')
  OR EXISTS (
    SELECT 1 FROM public.member_assignments ma
    WHERE ma.member_id = public.attendance.user_id
      AND public.attendance.marked_by = auth.uid()
      AND (ma.tl_id = auth.uid() OR ma.mentor_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "TL and Admin can update tasks" ON public.tasks;
CREATE POLICY "TL and Admin can update tasks" ON public.tasks FOR UPDATE TO authenticated USING (
  assigned_by = auth.uid()
  OR public.current_workspace_role() IN ('super_admin', 'hr')
)
WITH CHECK (
  assigned_by = auth.uid()
  OR public.current_workspace_role() IN ('super_admin', 'hr')
);

DROP POLICY IF EXISTS "Users can view task submissions by hierarchy" ON public.task_submissions;
CREATE POLICY "Users can view task submissions by hierarchy" ON public.task_submissions FOR SELECT TO authenticated USING (
  intern_id = auth.uid()
  OR public.current_workspace_role() IN ('super_admin', 'hr')
  OR public.current_user_related_to(intern_id)
  OR EXISTS (
    SELECT 1 FROM public.tasks t
    WHERE t.id = public.task_submissions.task_id
    AND (t.assigned_by = auth.uid() OR public.current_user_related_to(t.assigned_by))
  )
);

DROP POLICY IF EXISTS "Interns can submit assigned work" ON public.task_submissions;
CREATE POLICY "Interns can submit assigned work" ON public.task_submissions FOR INSERT TO authenticated WITH CHECK (
  public.current_workspace_role() IN ('super_admin', 'hr')
  OR (
    intern_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.tasks t
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE t.id = public.task_submissions.task_id
      AND t.status NOT IN ('submitted', 'reviewed', 'approved')
      AND (t.deadline IS NULL OR t.deadline >= NOW())
      AND (
        t.assigned_to = auth.uid()
        OR (
          p.role = 'intern'
          AND t.visible_to_interns = TRUE
          AND t.batch_id = p.batch_id
        )
      )
    )
  )
);

-- 6. Meetings Policies
DROP POLICY IF EXISTS "Users can view and manage meetings" ON public.meetings;
DROP POLICY IF EXISTS "Users can view meetings by hierarchy" ON public.meetings;
CREATE POLICY "Users can view meetings by hierarchy" ON public.meetings FOR SELECT TO authenticated USING (
  host_id = auth.uid()
  OR attendee_id = auth.uid()
  OR public.current_workspace_role() IN ('super_admin', 'hr')
  OR public.current_user_related_to(host_id)
  OR public.current_user_related_to(attendee_id)
  OR batch_id IN (SELECT p.batch_id FROM public.profiles p WHERE p.id = auth.uid())
);

DROP POLICY IF EXISTS "TL Mentor Admin can create meetings" ON public.meetings;
CREATE POLICY "TL Mentor Admin can create meetings" ON public.meetings FOR INSERT TO authenticated WITH CHECK (
  host_id = auth.uid()
  AND public.current_workspace_role() IN ('super_admin', 'hr', 'team_leader', 'mentor')
);

DROP POLICY IF EXISTS "Meeting hosts and admins can update meetings" ON public.meetings;
CREATE POLICY "Meeting hosts and admins can update meetings" ON public.meetings FOR UPDATE TO authenticated USING (
  host_id = auth.uid()
  OR public.current_workspace_role() IN ('super_admin', 'hr')
) WITH CHECK (
  host_id = auth.uid()
  OR public.current_workspace_role() IN ('super_admin', 'hr')
);

DROP POLICY IF EXISTS "Meeting hosts and admins can delete meetings" ON public.meetings;
CREATE POLICY "Meeting hosts and admins can delete meetings" ON public.meetings FOR DELETE TO authenticated USING (
  host_id = auth.uid()
  OR public.current_workspace_role() IN ('super_admin', 'hr')
);

-- 7. Messages Policies
DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;
CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT TO authenticated USING (
  sender_id = auth.uid() OR receiver_id = auth.uid()
);

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (
  sender_id = auth.uid()
  AND public.current_user_related_to(receiver_id)
);

-- 8. Notifications Policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (
  user_id = auth.uid()
);

DROP POLICY IF EXISTS "Managers can create hierarchy notifications" ON public.notifications;
CREATE POLICY "Managers can create hierarchy notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (
  COALESCE(created_by, auth.uid()) = auth.uid()
  AND (
  user_id = auth.uid()
  OR public.current_workspace_role() IN ('super_admin', 'hr')
  OR public.current_user_related_to(user_id)
  )
);

DROP POLICY IF EXISTS "Users can update own notification read state" ON public.notifications;
CREATE POLICY "Users can update own notification read state" ON public.notifications FOR UPDATE TO authenticated USING (
  user_id = auth.uid()
  OR public.current_workspace_role() IN ('super_admin', 'hr')
) WITH CHECK (
  user_id = auth.uid()
  OR public.current_workspace_role() IN ('super_admin', 'hr')
);

DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE TO authenticated USING (
  user_id = auth.uid()
  OR public.current_workspace_role() IN ('super_admin', 'hr')
);

DROP POLICY IF EXISTS "Users can view notification queue by ownership" ON public.notification_queue;
CREATE POLICY "Users can view notification queue by ownership" ON public.notification_queue FOR SELECT TO authenticated USING (
  user_id = auth.uid()
  OR public.current_workspace_role() IN ('super_admin', 'hr')
);

DROP POLICY IF EXISTS "Admin HR can manage notification queue" ON public.notification_queue;
CREATE POLICY "Admin HR can manage notification queue" ON public.notification_queue FOR ALL TO authenticated USING (
  public.current_workspace_role() IN ('super_admin', 'hr')
) WITH CHECK (
  public.current_workspace_role() IN ('super_admin', 'hr')
);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'task-submissions',
  'task-submissions',
  false,
  10485760,
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'application/zip', 'text/plain']::text[]
)
ON CONFLICT (id) DO UPDATE
SET public = false,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['application/pdf', 'image/png', 'image/jpeg', 'application/zip', 'text/plain']::text[];

DROP POLICY IF EXISTS "Authenticated can upload task submissions" ON storage.objects;
CREATE POLICY "Authenticated can upload task submissions" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'task-submissions'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.current_workspace_role() IN ('super_admin', 'hr')
  )
);

DROP POLICY IF EXISTS "Authenticated can read task submissions" ON storage.objects;
CREATE POLICY "Authenticated can read task submissions" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'task-submissions'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.current_workspace_role() IN ('super_admin', 'hr')
    OR EXISTS (
      SELECT 1 FROM public.task_submissions ts
      WHERE ts.file_url = storage.objects.name
      AND public.current_user_related_to(ts.intern_id)
    )
  )
);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  IF COALESCE(current_setting('request.jwt.claim.role', true), '') IN ('anon', 'authenticated') THEN
    RAISE EXCEPTION 'Public signup is disabled. Ask an admin or HR for an invite.';
  END IF;

  INSERT INTO public.profiles (id, full_name, email, role, domain)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    'intern',
    CASE
      WHEN new.raw_user_meta_data->>'domain' IN (
        'web_dev', 'frontend_dev', 'backend_dev', 'telecaller', 'sales_executive', 'sales',
        'marketing', 'digital_marketing', 'script_writing', 'video_editing', 'ai_automation', 'design', 'management'
      )
      THEN new.raw_user_meta_data->>'domain'
      ELSE 'web_dev'
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
