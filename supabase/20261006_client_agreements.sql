-- TexWeb Solution - Client agreements for Sales commercial workflow
-- Apply after 20261006_unified_business_platform.sql.

CREATE TABLE IF NOT EXISTS public.agreements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agreement_number TEXT UNIQUE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  proposal_id UUID REFERENCES public.proposals(id) ON DELETE SET NULL,
  quotation_id UUID REFERENCES public.quotations(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  scope_of_work TEXT,
  deliverables TEXT,
  commercial_terms TEXT,
  payment_milestones JSONB DEFAULT '[]'::jsonb,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'signed', 'cancelled')),
  document_url TEXT,
  signed_at TIMESTAMPTZ,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agreements_client_id ON public.agreements(client_id);
CREATE INDEX IF NOT EXISTS idx_agreements_deal_id ON public.agreements(deal_id);
CREATE INDEX IF NOT EXISTS idx_agreements_status ON public.agreements(status);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'agreements'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.agreements;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;
