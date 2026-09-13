-- TexWeb Solution production security hardening patch
-- Run this after the main schema to tighten public writes and role boundaries.

ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS hr_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS mentor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS tl_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

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

ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL DEFAULT auth.uid();

DROP POLICY IF EXISTS "Managers can create hierarchy notifications" ON public.notifications;
CREATE POLICY "Managers can create hierarchy notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (
  COALESCE(created_by, auth.uid()) = auth.uid()
  AND (
    user_id = auth.uid()
    OR public.current_workspace_role() IN ('super_admin', 'hr')
    OR public.current_user_related_to(user_id)
  )
);

DROP POLICY IF EXISTS "Allow insert to profiles" ON public.profiles;
CREATE POLICY "Allow insert to profiles" ON public.profiles FOR INSERT TO authenticated WITH CHECK (
  (id = auth.uid() AND role = 'intern')
  OR (public.current_workspace_role() = 'super_admin' AND role = 'hr')
  OR (public.current_workspace_role() = 'hr' AND role IN ('mentor', 'intern'))
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

DROP POLICY IF EXISTS "Admin HR Mentor can manage batches" ON public.batches;
DROP POLICY IF EXISTS "Authenticated can view batches" ON public.batches;
CREATE POLICY "Authenticated can view batches" ON public.batches FOR SELECT TO authenticated USING (
  public.current_workspace_role() = 'super_admin'
  OR (public.current_workspace_role() = 'hr' AND hr_id = auth.uid())
  OR mentor_id = auth.uid()
  OR tl_id = auth.uid()
  OR id IN (SELECT p.batch_id FROM public.profiles p WHERE p.id = auth.uid())
);

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

DROP POLICY IF EXISTS "TL can create daily updates" ON public.daily_updates;
CREATE POLICY "TL can create daily updates" ON public.daily_updates FOR INSERT TO authenticated WITH CHECK (
  (tl_id = auth.uid() AND public.current_workspace_role() = 'team_leader')
  OR public.current_workspace_role() IN ('super_admin', 'hr')
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

DROP POLICY IF EXISTS "TL and Admin can create tasks" ON public.tasks;
CREATE POLICY "TL and Admin can create tasks" ON public.tasks FOR INSERT TO authenticated WITH CHECK (
  assigned_by = auth.uid()
  AND public.current_workspace_role() IN ('super_admin', 'hr', 'team_leader', 'mentor')
  AND (
    public.current_workspace_role() IN ('super_admin', 'hr')
    OR public.current_user_related_to(assigned_to)
  )
);

DROP POLICY IF EXISTS "Interns can submit assigned work" ON public.task_submissions;
CREATE POLICY "Interns can submit assigned work" ON public.task_submissions FOR INSERT TO authenticated WITH CHECK (
  public.current_workspace_role() IN ('super_admin', 'hr')
  OR (
    intern_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.id = public.task_submissions.task_id
      AND t.assigned_to = auth.uid()
    )
  )
);

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (
  sender_id = auth.uid()
  AND public.current_user_related_to(receiver_id)
);

DROP POLICY IF EXISTS "Users can view and manage meetings" ON public.meetings;
DROP POLICY IF EXISTS "Users can view meetings by hierarchy" ON public.meetings;
CREATE POLICY "Users can view meetings by hierarchy" ON public.meetings FOR SELECT TO authenticated USING (
  host_id = auth.uid()
  OR attendee_id = auth.uid()
  OR public.current_workspace_role() IN ('super_admin', 'hr')
  OR public.current_user_related_to(host_id)
  OR public.current_user_related_to(attendee_id)
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
