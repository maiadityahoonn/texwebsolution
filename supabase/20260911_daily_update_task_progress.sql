ALTER TABLE public.daily_updates ADD COLUMN IF NOT EXISTS task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL;
ALTER TABLE public.daily_updates ADD COLUMN IF NOT EXISTS assigned_tasks TEXT;
ALTER TABLE public.daily_updates ADD COLUMN IF NOT EXISTS reviewer_comment TEXT;
ALTER TABLE public.daily_updates ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.daily_updates ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_daily_updates_task_id ON public.daily_updates(task_id);
CREATE INDEX IF NOT EXISTS idx_daily_updates_batch_id ON public.daily_updates(batch_id);

DROP POLICY IF EXISTS "TL Mentor Admin can view daily updates" ON public.daily_updates;
CREATE POLICY "TL Mentor Admin can view daily updates" ON public.daily_updates FOR SELECT TO authenticated USING (
  tl_id = auth.uid()
  OR mentor_id = auth.uid()
  OR public.current_workspace_role() IN ('super_admin', 'hr')
  OR batch_id IN (SELECT p.batch_id FROM public.profiles p WHERE p.id = auth.uid())
);

DROP POLICY IF EXISTS "TL can create daily updates" ON public.daily_updates;
CREATE POLICY "Members can create daily updates" ON public.daily_updates FOR INSERT TO authenticated WITH CHECK (
  tl_id = auth.uid()
  AND (
    public.current_workspace_role() IN ('super_admin', 'hr')
    OR batch_id IN (SELECT p.batch_id FROM public.profiles p WHERE p.id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Managers can comment on daily updates" ON public.daily_updates;
CREATE POLICY "Managers can comment on daily updates" ON public.daily_updates FOR UPDATE TO authenticated USING (
  public.current_workspace_role() IN ('super_admin', 'hr', 'team_leader', 'mentor')
  AND (
    tl_id = auth.uid()
    OR mentor_id = auth.uid()
    OR batch_id IN (SELECT p.batch_id FROM public.profiles p WHERE p.id = auth.uid())
  )
)
WITH CHECK (
  public.current_workspace_role() IN ('super_admin', 'hr', 'team_leader', 'mentor')
);
