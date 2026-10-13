-- CRM entity chat: reusable internal discussion threads for leads, deals, and future departments.

CREATE TABLE IF NOT EXISTS public.crm_chat_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL CHECK (entity_type IN ('lead', 'deal', 'client', 'project', 'invoice', 'agreement', 'quotation')),
  entity_id uuid NOT NULL,
  department text NOT NULL DEFAULT 'sales',
  title text NOT NULL DEFAULT 'CRM internal chat',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entity_type, entity_id, department)
);

CREATE TABLE IF NOT EXISTS public.crm_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.crm_chat_threads(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  body text NOT NULL DEFAULT '',
  message_type text NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'note', 'file', 'system')),
  attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  edited_at timestamptz,
  deleted_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_crm_chat_threads_entity
  ON public.crm_chat_threads(entity_type, entity_id, department);

CREATE INDEX IF NOT EXISTS idx_crm_chat_messages_thread_created
  ON public.crm_chat_messages(thread_id, created_at ASC);

ALTER TABLE public.crm_chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "CRM users can read chat threads" ON public.crm_chat_threads;
DROP POLICY IF EXISTS "CRM users can write chat threads" ON public.crm_chat_threads;
CREATE POLICY "CRM users can read chat threads" ON public.crm_chat_threads
  FOR SELECT TO authenticated
  USING (public.can_access_crm());
CREATE POLICY "CRM users can write chat threads" ON public.crm_chat_threads
  FOR ALL TO authenticated
  USING (public.can_access_crm())
  WITH CHECK (public.can_access_crm());

DROP POLICY IF EXISTS "CRM users can read chat messages" ON public.crm_chat_messages;
DROP POLICY IF EXISTS "CRM users can write chat messages" ON public.crm_chat_messages;
CREATE POLICY "CRM users can read chat messages" ON public.crm_chat_messages
  FOR SELECT TO authenticated
  USING (public.can_access_crm());
CREATE POLICY "CRM users can write chat messages" ON public.crm_chat_messages
  FOR ALL TO authenticated
  USING (public.can_access_crm())
  WITH CHECK (public.can_access_crm());

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_chat_messages;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;
