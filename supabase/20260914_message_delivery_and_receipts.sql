-- Migration: Message delivery tracking and per-user group message receipts

-- 1. Direct messages: Add delivered_at column
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

-- 2. Batch messages: Add delivered_at column
ALTER TABLE public.batch_messages
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

-- 3. Batch message receipts: Individual per-user delivery and read tracking in group chats
CREATE TABLE IF NOT EXISTS public.batch_message_receipts (
  message_id UUID NOT NULL REFERENCES public.batch_messages(id) ON DELETE CASCADE,
  batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  delivered_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  PRIMARY KEY (message_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_batch_receipts_msg
  ON public.batch_message_receipts(message_id);

CREATE INDEX IF NOT EXISTS idx_batch_receipts_user
  ON public.batch_message_receipts(user_id);

CREATE INDEX IF NOT EXISTS idx_batch_receipts_batch
  ON public.batch_message_receipts(batch_id);

-- Enable RLS
ALTER TABLE public.batch_message_receipts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Batch participants can view receipts" ON public.batch_message_receipts;
CREATE POLICY "Batch participants can view receipts"
  ON public.batch_message_receipts FOR SELECT TO authenticated
  USING (public.is_batch_participant(batch_id));

DROP POLICY IF EXISTS "Batch participants can manage receipts" ON public.batch_message_receipts;
CREATE POLICY "Batch participants can manage receipts"
  ON public.batch_message_receipts FOR ALL TO authenticated
  USING (public.is_batch_participant(batch_id))
  WITH CHECK (user_id = auth.uid() AND public.is_batch_participant(batch_id));
