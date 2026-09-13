-- ==============================================================================
-- TEXWEB SOLUTION - BATCH OPERATING WORKSPACE EXTENSIONS
-- Adds missing P0/P1 batch workspace tables without replacing existing auth/users.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS batch_type TEXT NOT NULL DEFAULT 'internship';
ALTER TABLE public.batches DROP CONSTRAINT IF EXISTS batches_batch_type_check;
ALTER TABLE public.batches ADD CONSTRAINT batches_batch_type_check CHECK (
  batch_type IN ('internship', 'development', 'sales', 'sql', 'marketing', 'training', 'other')
);

ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS expected_output TEXT;
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_status_check CHECK (
  status IN ('pending', 'not_started', 'in_progress', 'submitted', 'under_review', 'reviewed', 'approved', 'completed', 'rejected', 'changes_requested', 'overdue')
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

CREATE INDEX IF NOT EXISTS idx_batch_messages_batch_id ON public.batch_messages(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_announcements_batch_id ON public.batch_announcements(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_resources_batch_id ON public.batch_resources(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_escalations_batch_id ON public.batch_escalations(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_assignment_history_batch_id ON public.batch_assignment_history(batch_id);

DROP POLICY IF EXISTS "TL can create daily updates" ON public.daily_updates;
DROP POLICY IF EXISTS "Members can create daily updates" ON public.daily_updates;
CREATE POLICY "TL can create daily updates" ON public.daily_updates FOR INSERT TO authenticated WITH CHECK (
  tl_id = auth.uid() AND public.current_workspace_role() = 'team_leader'
);

ALTER TABLE public.batch_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_assignment_history ENABLE ROW LEVEL SECURITY;

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

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'batch_messages') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.batch_messages;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'batch_announcements') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.batch_announcements;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'batch_resources') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.batch_resources;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'batch_escalations') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.batch_escalations;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'batch_assignment_history') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.batch_assignment_history;
    END IF;
  END IF;
END $$;
