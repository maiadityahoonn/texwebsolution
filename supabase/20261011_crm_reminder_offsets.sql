-- Editable reminder offsets for CRM follow-ups, meetings, and pipeline-created meetings

ALTER TABLE public.sales_followups
  ADD COLUMN IF NOT EXISTS reminder_before_minutes INTEGER NOT NULL DEFAULT 10;

ALTER TABLE public.sales_meetings
  ADD COLUMN IF NOT EXISTS reminder_before_minutes INTEGER NOT NULL DEFAULT 10;

ALTER TABLE public.deals
  ADD COLUMN IF NOT EXISTS reminder_before_minutes INTEGER NOT NULL DEFAULT 10;

CREATE INDEX IF NOT EXISTS idx_sales_followups_reminder_window
  ON public.sales_followups(status, due_at, reminder_before_minutes);

CREATE INDEX IF NOT EXISTS idx_sales_meetings_reminder_window
  ON public.sales_meetings(status, scheduled_at, reminder_before_minutes);
