-- Native Android/iOS FCM device registration for background CRM notifications.

CREATE TABLE IF NOT EXISTS public.push_device_tokens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  token TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL DEFAULT 'android' CHECK (platform IN ('android', 'ios')),
  app_id TEXT NOT NULL DEFAULT 'in.texwebsolution.crm',
  device_name TEXT,
  user_agent TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_device_tokens_user_active
  ON public.push_device_tokens(user_id, is_active);

ALTER TABLE public.push_device_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own native push devices" ON public.push_device_tokens;
CREATE POLICY "Users can manage own native push devices" ON public.push_device_tokens
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_device_tokens TO authenticated;

-- A rescheduled item must be allowed to create a fresh reminder event.
ALTER TABLE public.notification_reminder_events
  DROP CONSTRAINT IF EXISTS notification_reminder_events_source_type_source_id_reminder_type_user_id_key;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'notification_reminder_events_schedule_key'
      AND conrelid = 'public.notification_reminder_events'::regclass
  ) THEN
    ALTER TABLE public.notification_reminder_events
      ADD CONSTRAINT notification_reminder_events_schedule_key
      UNIQUE (source_type, source_id, reminder_type, scheduled_for, user_id);
  END IF;
END $$;
