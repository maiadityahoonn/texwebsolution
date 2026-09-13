ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_status_check CHECK (status IN (
  'pending',
  'in_progress',
  'submitted',
  'reviewed',
  'approved',
  'rejected',
  'changes_requested'
));

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

DROP POLICY IF EXISTS "TL Mentor Admin can create task reviews" ON public.task_reviews;
CREATE POLICY "TL Mentor Admin can create task reviews" ON public.task_reviews FOR INSERT TO authenticated WITH CHECK (
  reviewer_id = auth.uid()
  AND public.current_workspace_role() IN ('super_admin', 'hr', 'team_leader', 'mentor')
  AND (
    public.current_workspace_role() IN ('super_admin', 'hr')
    OR EXISTS (
      SELECT 1 FROM public.tasks t
      LEFT JOIN public.task_submissions ts ON ts.id = public.task_reviews.submission_id
      LEFT JOIN public.profiles submitter ON submitter.id = ts.intern_id
      LEFT JOIN public.profiles reviewer ON reviewer.id = auth.uid()
      WHERE t.id = public.task_reviews.task_id
      AND (
        t.assigned_by = auth.uid()
        OR (
          reviewer.role = 'team_leader'
          AND submitter.role = 'intern'
          AND submitter.batch_id = reviewer.batch_id
          AND t.batch_id = reviewer.batch_id
        )
        OR (
          reviewer.role = 'mentor'
          AND t.batch_id = reviewer.batch_id
        )
      )
    )
  )
);
