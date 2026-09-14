-- ==============================================================================
-- 20260913_batch_files_and_announcements.sql
-- Migration: Batch announcements attachments, notifications metadata, realtime
-- ==============================================================================

-- 1. Add optional attachment fields to batch_announcements
ALTER TABLE public.batch_announcements
  ADD COLUMN IF NOT EXISTS attachment_url TEXT,
  ADD COLUMN IF NOT EXISTS attachment_name TEXT,
  ADD COLUMN IF NOT EXISTS attachment_type TEXT;

-- 2. Add metadata JSONB column to notifications for author and batch chips
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 3. Ensure notifications type check allows 'announcement' and 'file'
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('task', 'meeting', 'message', 'certificate', 'lead', 'general', 'announcement', 'file'));

-- 4. Ensure batch_announcements and batch_resources are in supabase_realtime publication
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'batch_announcements'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.batch_announcements;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'batch_resources'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.batch_resources;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notifications'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    END IF;
  END IF;
END $$;
