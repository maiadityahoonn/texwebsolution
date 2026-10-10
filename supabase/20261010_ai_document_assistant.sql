-- AI document assistant: isolated per-deal quotation/agreement chat history.

CREATE TABLE IF NOT EXISTS public.ai_document_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES public.deals(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  document_type text NOT NULL DEFAULT 'quotation' CHECK (document_type IN ('quotation', 'agreement')),
  title text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_document_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.ai_document_threads(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL DEFAULT '',
  attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_document_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid REFERENCES public.ai_document_threads(id) ON DELETE SET NULL,
  deal_id uuid REFERENCES public.deals(id) ON DELETE CASCADE,
  document_type text NOT NULL DEFAULT 'quotation' CHECK (document_type IN ('quotation', 'agreement')),
  title text,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft',
  sent_at timestamptz,
  approved_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_document_threads_deal_type
  ON public.ai_document_threads(deal_id, document_type)
  WHERE deal_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ai_document_messages_thread_created
  ON public.ai_document_messages(thread_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_ai_document_drafts_deal_created
  ON public.ai_document_drafts(deal_id, created_at DESC);

ALTER TABLE public.ai_document_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_document_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_document_drafts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_document_threads' AND policyname = 'ai_document_threads_authenticated_all'
  ) THEN
    CREATE POLICY ai_document_threads_authenticated_all ON public.ai_document_threads
      FOR ALL TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_document_messages' AND policyname = 'ai_document_messages_authenticated_all'
  ) THEN
    CREATE POLICY ai_document_messages_authenticated_all ON public.ai_document_messages
      FOR ALL TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_document_drafts' AND policyname = 'ai_document_drafts_authenticated_all'
  ) THEN
    CREATE POLICY ai_document_drafts_authenticated_all ON public.ai_document_drafts
      FOR ALL TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;
