-- TexWeb Solution - Sales follow-ups and client meetings
-- Keeps sales activity separate from old batch/class meeting workflows.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.sales_followups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'phone' CHECK (channel IN ('phone', 'whatsapp', 'email', 'meeting', 'other')),
  due_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'done', 'missed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sales_meetings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  host_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  meeting_type TEXT NOT NULL DEFAULT 'discovery' CHECK (meeting_type IN ('discovery', 'requirement', 'proposal', 'negotiation', 'handover', 'other')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  meeting_link TEXT,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  agenda TEXT,
  outcome TEXT,
  next_action TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_followups_due_at ON public.sales_followups(due_at);
CREATE INDEX IF NOT EXISTS idx_sales_followups_status ON public.sales_followups(status);
CREATE INDEX IF NOT EXISTS idx_sales_meetings_scheduled_at ON public.sales_meetings(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_sales_meetings_status ON public.sales_meetings(status);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'sales_followups') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.sales_followups;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'sales_meetings') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.sales_meetings;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;
