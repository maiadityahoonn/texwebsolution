-- TexWeb Solution - CRM performance indexes
-- Speeds up first load, date filters, stage boards, follow-ups and commercial pages.

CREATE INDEX IF NOT EXISTS idx_leads_created_at_desc ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status_created_at ON public.leads(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_source_created_at ON public.leads(source, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_service_created_at ON public.leads(service, created_at DESC);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'leads'
      AND column_name = 'form_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_leads_form_id_created_at ON public.leads(form_id, created_at DESC);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_deals_stage_created_at ON public.deals(pipeline_stage, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deals_lead_id ON public.deals(lead_id);
CREATE INDEX IF NOT EXISTS idx_deals_assigned_to_stage ON public.deals(assigned_to, pipeline_stage);

CREATE INDEX IF NOT EXISTS idx_sales_followups_deal_due ON public.sales_followups(deal_id, due_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_followups_lead_due ON public.sales_followups(lead_id, due_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_followups_status_due ON public.sales_followups(status, due_at DESC);

CREATE INDEX IF NOT EXISTS idx_sales_meetings_deal_scheduled ON public.sales_meetings(deal_id, scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_meetings_lead_scheduled ON public.sales_meetings(lead_id, scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_meetings_status_scheduled ON public.sales_meetings(status, scheduled_at DESC);

CREATE INDEX IF NOT EXISTS idx_proposals_deal_created ON public.proposals(deal_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_proposals_status_created ON public.proposals(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotations_deal_created ON public.quotations(deal_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotations_status_created ON public.quotations(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agreements_deal_created ON public.agreements(deal_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agreements_status_created ON public.agreements(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_invoices_status_due ON public.invoices(status, due_date DESC);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'invoices'
      AND column_name = 'deal_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_invoices_deal_created ON public.invoices(deal_id, created_at DESC);
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'payments'
      AND column_name = 'deal_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_payments_deal_created ON public.payments(deal_id, created_at DESC);
  END IF;
END $$;
