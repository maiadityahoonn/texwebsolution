-- =========================================================================
-- Soft Delete & Original Message Preservation for Chat Messages
-- Description:
--   Ensures that when a message is deleted for everyone, regular users see
--   "This message was deleted" / "You deleted this message", but the original
--   typed message and attachments remain permanently archived in `audit_logs`
--   as well as optional soft delete columns.
-- =========================================================================

-- 1. Batch Messages Soft Delete Columns
ALTER TABLE public.batch_messages
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS original_message TEXT,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 2. Direct Messages Soft Delete Columns
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS original_message TEXT,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 3. Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_batch_messages_is_deleted ON public.batch_messages(is_deleted);
CREATE INDEX IF NOT EXISTS idx_messages_is_deleted ON public.messages(is_deleted);
