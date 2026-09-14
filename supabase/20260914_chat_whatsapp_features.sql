-- WhatsApp-style chat enhancements: edit window, media attachments, and read receipts.

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS attachment_name TEXT,
  ADD COLUMN IF NOT EXISTS attachment_type TEXT,
  ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

ALTER TABLE public.batch_messages
  ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_messages_receiver_unread
  ON public.messages(receiver_id, is_read, created_at);

CREATE INDEX IF NOT EXISTS idx_batch_messages_read_at
  ON public.batch_messages(batch_id, read_at);

DROP POLICY IF EXISTS "Users can update own direct message metadata" ON public.messages;
