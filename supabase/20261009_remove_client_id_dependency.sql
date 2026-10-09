-- ==============================================================================
-- TEXWEB CRM - REMOVE CLIENT ID DEPENDENCY FROM SALES FLOW
-- Date: 2026-10-09
-- Purpose:
--   Leads, meetings, follow-ups, quotations, agreements, invoices and payments
--   should work from lead/deal first. Client account is created only after won.
-- ==============================================================================

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL;

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL;

ALTER TABLE public.proposals
  DROP COLUMN IF EXISTS client_id;

ALTER TABLE public.quotations
  DROP COLUMN IF EXISTS client_id;

ALTER TABLE public.agreements
  DROP COLUMN IF EXISTS client_id;

ALTER TABLE public.sales_followups
  DROP COLUMN IF EXISTS client_id;

ALTER TABLE public.sales_meetings
  DROP COLUMN IF EXISTS client_id;

ALTER TABLE public.invoices
  DROP COLUMN IF EXISTS client_id;

ALTER TABLE public.payments
  DROP COLUMN IF EXISTS client_id;

CREATE INDEX IF NOT EXISTS idx_invoices_deal_id ON public.invoices(deal_id);
CREATE INDEX IF NOT EXISTS idx_payments_deal_id ON public.payments(deal_id);
