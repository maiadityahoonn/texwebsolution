-- Universal reminder and browser push support for CRM follow-ups and meetings

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  subscription JSONB NOT NULL DEFAULT '{}'::jsonb,
  user_agent TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notification_reminder_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  source_type TEXT NOT NULL CHECK (source_type IN ('sales_followup', 'sales_meeting')),
  source_id UUID NOT NULL,
  reminder_type TEXT NOT NULL DEFAULT '10min',
  scheduled_for TIMESTAMPTZ NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  notification_id UUID REFERENCES public.notifications(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (source_type, source_id, reminder_type, user_id)
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_active ON public.push_subscriptions(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_reminder_events_user_created ON public.notification_reminder_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reminder_events_source ON public.notification_reminder_events(source_type, source_id);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_reminder_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can manage own push subscriptions" ON public.push_subscriptions
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view own reminder events" ON public.notification_reminder_events;
CREATE POLICY "Users can view own reminder events" ON public.notification_reminder_events
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'push_subscriptions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.push_subscriptions;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;
