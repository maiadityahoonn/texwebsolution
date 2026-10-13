-- Loss tracking fields for leads marked lost before pipeline conversion.

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS loss_reason TEXT;

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS lost_at_stage TEXT;

CREATE INDEX IF NOT EXISTS idx_leads_lost_at_stage
  ON public.leads(lost_at_stage, updated_at DESC)
  WHERE status = 'Lost';
