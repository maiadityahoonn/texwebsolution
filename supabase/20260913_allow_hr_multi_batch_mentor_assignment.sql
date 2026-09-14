-- Allow an HR to assign the same mentor to multiple HR-owned batches.
-- Previously the trigger required mentor.profile.batch_id = batch.id, which made
-- one mentor unusable across multiple batches.

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
