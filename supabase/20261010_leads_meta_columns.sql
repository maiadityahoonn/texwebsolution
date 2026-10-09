-- Adds Meta Lead Ads / CRM CAPI fields to existing leads table.
-- Safe to run multiple times.

ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS meta_lead_id TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS ad_id TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS ad_name TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS adset_id TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS adset_name TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS campaign_id TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS campaign_name TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS form_id TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS form_name TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'website';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS budget_range TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS raw_metadata JSONB DEFAULT '{}'::jsonb;

CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_meta_lead_id
  ON public.leads (meta_lead_id)
  WHERE meta_lead_id IS NOT NULL;
