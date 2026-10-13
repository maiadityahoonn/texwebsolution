-- Keep notification center focused on CRM reminder notifications only.
-- Sync reminder copy from source records, then remove unrelated notifications.

UPDATE public.notifications n
SET
  title = 'Follow-up reminder',
  message = COALESCE(f.title, 'Sales follow-up') || ' is due at ' ||
    to_char(f.due_at AT TIME ZONE 'Asia/Kolkata', 'DD Mon YYYY, HH12:MI AM') ||
    '. Call or WhatsApp the client.',
  type = 'lead',
  link_url = '/workspace?section=sales_followups',
  metadata = COALESCE(n.metadata, '{}'::jsonb) ||
    jsonb_build_object(
      'reminder', true,
      'requires_ack', true,
      'source_type', 'sales_followup',
      'source_id', f.id,
      'scheduled_for', f.due_at,
      'reminder_before_minutes', COALESCE(f.reminder_before_minutes, 10)
    )
FROM public.sales_followups f
WHERE n.metadata->>'source_type' = 'sales_followup'
  AND n.metadata->>'source_id' = f.id::text;

UPDATE public.notifications n
SET
  title = 'Client meeting reminder',
  message = COALESCE(m.title, 'Sales meeting') || ' starts at ' ||
    to_char(m.scheduled_at AT TIME ZONE 'Asia/Kolkata', 'DD Mon YYYY, HH12:MI AM') ||
    '. Send WhatsApp or call the client now.',
  type = 'meeting',
  link_url = '/workspace?section=sales_meetings',
  metadata = COALESCE(n.metadata, '{}'::jsonb) ||
    jsonb_build_object(
      'reminder', true,
      'requires_ack', true,
      'source_type', 'sales_meeting',
      'source_id', m.id,
      'scheduled_for', m.scheduled_at,
      'reminder_before_minutes', COALESCE(m.reminder_before_minutes, 10)
    )
FROM public.sales_meetings m
WHERE n.metadata->>'source_type' = 'sales_meeting'
  AND n.metadata->>'source_id' = m.id::text;

DELETE FROM public.notification_queue q
USING public.notifications n
WHERE q.notification_id = n.id
  AND NOT (
    COALESCE((n.metadata->>'reminder')::boolean, false) = true
    OR COALESCE((n.metadata->>'requires_ack')::boolean, false) = true
    OR n.metadata->>'source_type' IN ('sales_followup', 'sales_meeting')
    OR COALESCE(n.link_url, '') LIKE '%sales_followups%'
    OR COALESCE(n.link_url, '') LIKE '%sales_meetings%'
    OR COALESCE(n.link_url, '') LIKE '%/crm/followups%'
    OR COALESCE(n.link_url, '') LIKE '%/crm/meetings%'
  );

DELETE FROM public.notifications n
WHERE NOT (
  COALESCE((n.metadata->>'reminder')::boolean, false) = true
  OR COALESCE((n.metadata->>'requires_ack')::boolean, false) = true
  OR n.metadata->>'source_type' IN ('sales_followup', 'sales_meeting')
  OR COALESCE(n.link_url, '') LIKE '%sales_followups%'
  OR COALESCE(n.link_url, '') LIKE '%sales_meetings%'
  OR COALESCE(n.link_url, '') LIKE '%/crm/followups%'
  OR COALESCE(n.link_url, '') LIKE '%/crm/meetings%'
);
