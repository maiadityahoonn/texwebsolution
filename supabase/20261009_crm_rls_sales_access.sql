-- CRM/Sales RLS policies for authenticated internal workspace users.
-- Run this in Supabase SQL editor after deployment if local/browser CRM reads still show partial data.

CREATE OR REPLACE FUNCTION public.current_crm_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    CASE
      WHEN role IS NOT NULL AND role <> 'intern' THEN role
      WHEN lower(coalesce(designation, '')) = 'sales head' THEN 'sales_head'
      WHEN lower(coalesce(designation, '')) = 'sales executive' THEN 'sales_executive'
      WHEN lower(coalesce(designation, '')) = 'telecaller' THEN 'telecaller'
      WHEN lower(coalesce(designation, '')) = 'finance head' THEN 'finance_head'
      WHEN lower(coalesce(designation, '')) = 'support head' THEN 'support_head'
      WHEN lower(coalesce(domain, '')) = 'sales' AND lower(coalesce(designation, '')) LIKE '%head%' THEN 'sales_head'
      ELSE role
    END
  FROM public.profiles
  WHERE id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.can_access_crm()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    public.current_crm_role() IN (
      'super_admin',
      'admin',
      'hr',
      'sales_head',
      'sales_executive',
      'telecaller',
      'finance_head',
      'support_head'
    )
    OR lower(coalesce(public.current_workspace_domain(), '')) = 'sales',
    false
  );
$$;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "CRM users can read leads" ON public.leads;
DROP POLICY IF EXISTS "CRM users can write leads" ON public.leads;
CREATE POLICY "CRM users can read leads" ON public.leads
  FOR SELECT TO authenticated
  USING (public.can_access_crm());
CREATE POLICY "CRM users can write leads" ON public.leads
  FOR ALL TO authenticated
  USING (public.can_access_crm())
  WITH CHECK (public.can_access_crm());

DROP POLICY IF EXISTS "CRM users can read deals" ON public.deals;
DROP POLICY IF EXISTS "CRM users can write deals" ON public.deals;
CREATE POLICY "CRM users can read deals" ON public.deals
  FOR SELECT TO authenticated
  USING (public.can_access_crm());
CREATE POLICY "CRM users can write deals" ON public.deals
  FOR ALL TO authenticated
  USING (public.can_access_crm())
  WITH CHECK (public.can_access_crm());

DROP POLICY IF EXISTS "CRM users can read followups" ON public.sales_followups;
DROP POLICY IF EXISTS "CRM users can write followups" ON public.sales_followups;
CREATE POLICY "CRM users can read followups" ON public.sales_followups
  FOR SELECT TO authenticated
  USING (public.can_access_crm());
CREATE POLICY "CRM users can write followups" ON public.sales_followups
  FOR ALL TO authenticated
  USING (public.can_access_crm())
  WITH CHECK (public.can_access_crm());

DROP POLICY IF EXISTS "CRM users can read sales meetings" ON public.sales_meetings;
DROP POLICY IF EXISTS "CRM users can write sales meetings" ON public.sales_meetings;
CREATE POLICY "CRM users can read sales meetings" ON public.sales_meetings
  FOR SELECT TO authenticated
  USING (public.can_access_crm());
CREATE POLICY "CRM users can write sales meetings" ON public.sales_meetings
  FOR ALL TO authenticated
  USING (public.can_access_crm())
  WITH CHECK (public.can_access_crm());

DROP POLICY IF EXISTS "CRM users can read proposals" ON public.proposals;
DROP POLICY IF EXISTS "CRM users can write proposals" ON public.proposals;
CREATE POLICY "CRM users can read proposals" ON public.proposals
  FOR SELECT TO authenticated
  USING (public.can_access_crm());
CREATE POLICY "CRM users can write proposals" ON public.proposals
  FOR ALL TO authenticated
  USING (public.can_access_crm())
  WITH CHECK (public.can_access_crm());

DROP POLICY IF EXISTS "CRM users can read quotations" ON public.quotations;
DROP POLICY IF EXISTS "CRM users can write quotations" ON public.quotations;
CREATE POLICY "CRM users can read quotations" ON public.quotations
  FOR SELECT TO authenticated
  USING (public.can_access_crm());
CREATE POLICY "CRM users can write quotations" ON public.quotations
  FOR ALL TO authenticated
  USING (public.can_access_crm())
  WITH CHECK (public.can_access_crm());

DROP POLICY IF EXISTS "CRM users can read agreements" ON public.agreements;
DROP POLICY IF EXISTS "CRM users can write agreements" ON public.agreements;
CREATE POLICY "CRM users can read agreements" ON public.agreements
  FOR SELECT TO authenticated
  USING (public.can_access_crm());
CREATE POLICY "CRM users can write agreements" ON public.agreements
  FOR ALL TO authenticated
  USING (public.can_access_crm())
  WITH CHECK (public.can_access_crm());

DROP POLICY IF EXISTS "CRM users can read invoices" ON public.invoices;
DROP POLICY IF EXISTS "CRM users can write invoices" ON public.invoices;
CREATE POLICY "CRM users can read invoices" ON public.invoices
  FOR SELECT TO authenticated
  USING (public.can_access_crm());
CREATE POLICY "CRM users can write invoices" ON public.invoices
  FOR ALL TO authenticated
  USING (public.can_access_crm())
  WITH CHECK (public.can_access_crm());

DROP POLICY IF EXISTS "CRM users can read payments" ON public.payments;
DROP POLICY IF EXISTS "CRM users can write payments" ON public.payments;
CREATE POLICY "CRM users can read payments" ON public.payments
  FOR SELECT TO authenticated
  USING (public.can_access_crm());
CREATE POLICY "CRM users can write payments" ON public.payments
  FOR ALL TO authenticated
  USING (public.can_access_crm())
  WITH CHECK (public.can_access_crm());
