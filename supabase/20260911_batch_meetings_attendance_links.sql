ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS visible_to_interns BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.meetings ADD COLUMN IF NOT EXISTS batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL;
ALTER TABLE public.meetings ADD COLUMN IF NOT EXISTS domain TEXT NOT NULL DEFAULT 'web_dev';
ALTER TABLE public.meetings ADD COLUMN IF NOT EXISTS attendance_token TEXT;

CREATE INDEX IF NOT EXISTS idx_tasks_batch_id ON public.tasks(batch_id);
CREATE INDEX IF NOT EXISTS idx_tasks_visible_to_interns ON public.tasks(visible_to_interns);
CREATE INDEX IF NOT EXISTS idx_meetings_batch_id ON public.meetings(batch_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_once_per_meeting_user
ON public.attendance(user_id, meeting_id)
WHERE meeting_id IS NOT NULL;

DROP POLICY IF EXISTS "Users can view tasks by batch hierarchy" ON public.tasks;
CREATE POLICY "Users can view tasks by batch hierarchy" ON public.tasks FOR SELECT TO authenticated USING (
  assigned_by = auth.uid()
  OR assigned_to = auth.uid()
  OR public.current_workspace_role() IN ('super_admin', 'hr')
  OR public.current_user_related_to(assigned_by)
  OR public.current_user_related_to(assigned_to)
  OR (
    visible_to_interns = TRUE
    AND batch_id IN (SELECT p.batch_id FROM public.profiles p WHERE p.id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Users can view meetings by hierarchy" ON public.meetings;
CREATE POLICY "Users can view meetings by hierarchy" ON public.meetings FOR SELECT TO authenticated USING (
  host_id = auth.uid()
  OR attendee_id = auth.uid()
  OR public.current_workspace_role() IN ('super_admin', 'hr')
  OR public.current_user_related_to(host_id)
  OR public.current_user_related_to(attendee_id)
  OR batch_id IN (SELECT p.batch_id FROM public.profiles p WHERE p.id = auth.uid())
);
