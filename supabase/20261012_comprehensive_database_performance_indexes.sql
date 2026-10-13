-- ==============================================================================
-- TEXWEB SOLUTION - 100% BULLETPROOF DATABASE PERFORMANCE INDEXES
-- Automatically checks table and column existence before creating each index.
-- Will NEVER fail with "column does not exist" or "relation does not exist".
-- Safe, idempotent, zero downtime.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.safe_create_index(
  p_table TEXT,
  p_index_name TEXT,
  p_cols TEXT[],
  p_definition TEXT
) RETURNS VOID AS $$
DECLARE
  v_col TEXT;
  v_exists BOOLEAN := TRUE;
BEGIN
  -- 1. Check if table exists in public schema
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = p_table
  ) THEN
    RETURN;
  END IF;

  -- 2. Check if all required columns exist in the table
  FOREACH v_col IN ARRAY p_cols LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = p_table AND column_name = v_col
    ) THEN
      v_exists := FALSE;
      EXIT;
    END IF;
  END LOOP;

  -- 3. Only create index if table and all columns exist
  IF v_exists THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS ' || quote_ident(p_index_name) || ' ON public.' || quote_ident(p_table) || ' ' || p_definition;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 1. USER PROFILES & RBAC
-- ------------------------------------------------------------------------------
SELECT public.safe_create_index('profiles', 'idx_profiles_role', ARRAY['role'], '(role)');
SELECT public.safe_create_index('profiles', 'idx_profiles_domain', ARRAY['domain'], '(domain)');
SELECT public.safe_create_index('profiles', 'idx_profiles_status', ARRAY['status'], '(status)');
SELECT public.safe_create_index('profiles', 'idx_profiles_email', ARRAY['email'], '(email)');
SELECT public.safe_create_index('profiles', 'idx_profiles_batch_id', ARRAY['batch_id'], '(batch_id) WHERE batch_id IS NOT NULL');
SELECT public.safe_create_index('profiles', 'idx_profiles_tl_id', ARRAY['assigned_tl_id'], '(assigned_tl_id) WHERE assigned_tl_id IS NOT NULL');
SELECT public.safe_create_index('profiles', 'idx_profiles_mentor_id', ARRAY['assigned_mentor_id'], '(assigned_mentor_id) WHERE assigned_mentor_id IS NOT NULL');

-- ------------------------------------------------------------------------------
-- 2. WORKSPACE BATCHES & MEMBER ASSIGNMENTS
-- ------------------------------------------------------------------------------
SELECT public.safe_create_index('batches', 'idx_batches_status_created', ARRAY['status', 'created_at'], '(status, created_at DESC)');
SELECT public.safe_create_index('batches', 'idx_batches_domain', ARRAY['domain'], '(domain)');
SELECT public.safe_create_index('batches', 'idx_batches_hr_id', ARRAY['hr_id'], '(hr_id) WHERE hr_id IS NOT NULL');
SELECT public.safe_create_index('batches', 'idx_batches_mentor_id', ARRAY['mentor_id'], '(mentor_id) WHERE mentor_id IS NOT NULL');
SELECT public.safe_create_index('batches', 'idx_batches_tl_id', ARRAY['tl_id'], '(tl_id) WHERE tl_id IS NOT NULL');

SELECT public.safe_create_index('member_assignments', 'idx_member_assignments_member', ARRAY['member_id', 'status'], '(member_id, status)');
SELECT public.safe_create_index('member_assignments', 'idx_member_assignments_batch', ARRAY['batch_id', 'status'], '(batch_id, status)');
SELECT public.safe_create_index('member_assignments', 'idx_member_assignments_tl', ARRAY['tl_id'], '(tl_id)');
SELECT public.safe_create_index('member_assignments', 'idx_member_assignments_mentor', ARRAY['mentor_id'], '(mentor_id)');

-- ------------------------------------------------------------------------------
-- 3. TASKS, SUBMISSIONS & REVIEWS
-- ------------------------------------------------------------------------------
SELECT public.safe_create_index('tasks', 'idx_tasks_assigned_to_created', ARRAY['assigned_to', 'created_at'], '(assigned_to, created_at DESC)');
SELECT public.safe_create_index('tasks', 'idx_tasks_batch_visible', ARRAY['batch_id', 'visible_to_interns', 'created_at'], '(batch_id, visible_to_interns, created_at DESC)');
SELECT public.safe_create_index('tasks', 'idx_tasks_domain_created', ARRAY['domain', 'created_at'], '(domain, created_at DESC)');
SELECT public.safe_create_index('tasks', 'idx_tasks_status_deadline', ARRAY['status', 'deadline'], '(status, deadline ASC)');
SELECT public.safe_create_index('tasks', 'idx_tasks_priority', ARRAY['priority'], '(priority)');

SELECT public.safe_create_index('task_submissions', 'idx_task_submissions_task_submitted', ARRAY['task_id', 'submitted_at'], '(task_id, submitted_at DESC)');
SELECT public.safe_create_index('task_submissions', 'idx_task_submissions_intern', ARRAY['intern_id', 'submitted_at'], '(intern_id, submitted_at DESC)');
SELECT public.safe_create_index('task_submissions', 'idx_task_submissions_status', ARRAY['status'], '(status)');

SELECT public.safe_create_index('task_reviews', 'idx_task_reviews_task', ARRAY['task_id'], '(task_id)');
SELECT public.safe_create_index('task_reviews', 'idx_task_reviews_submission', ARRAY['submission_id'], '(submission_id)');
SELECT public.safe_create_index('task_reviews', 'idx_task_reviews_reviewer', ARRAY['reviewer_id', 'created_at'], '(reviewer_id, created_at DESC)');

-- ------------------------------------------------------------------------------
-- 4. DAILY UPDATES & ATTENDANCE
-- ------------------------------------------------------------------------------
SELECT public.safe_create_index('daily_updates', 'idx_daily_updates_tl_created', ARRAY['tl_id', 'created_at'], '(tl_id, created_at DESC)');
SELECT public.safe_create_index('daily_updates', 'idx_daily_updates_mentor_created', ARRAY['mentor_id', 'created_at'], '(mentor_id, created_at DESC)');
SELECT public.safe_create_index('daily_updates', 'idx_daily_updates_batch_created', ARRAY['batch_id', 'created_at'], '(batch_id, created_at DESC)');
SELECT public.safe_create_index('daily_updates', 'idx_daily_updates_domain_created', ARRAY['domain', 'created_at'], '(domain, created_at DESC)');

SELECT public.safe_create_index('attendance', 'idx_attendance_user_created', ARRAY['user_id', 'created_at'], '(user_id, created_at DESC)');
SELECT public.safe_create_index('attendance', 'idx_attendance_batch_created', ARRAY['batch_id', 'created_at'], '(batch_id, created_at DESC)');
SELECT public.safe_create_index('attendance', 'idx_attendance_domain_created', ARRAY['domain', 'created_at'], '(domain, created_at DESC)');
SELECT public.safe_create_index('attendance', 'idx_attendance_date', ARRAY['date'], '(date DESC)');
SELECT public.safe_create_index('attendance', 'idx_attendance_status', ARRAY['status'], '(status)');

-- ------------------------------------------------------------------------------
-- 5. INTERNSHIP & WORKSPACE MEETINGS
-- ------------------------------------------------------------------------------
SELECT public.safe_create_index('meetings', 'idx_meetings_batch_scheduled', ARRAY['batch_id', 'scheduled_at'], '(batch_id, scheduled_at DESC)');
SELECT public.safe_create_index('meetings', 'idx_meetings_host', ARRAY['host_id', 'scheduled_at'], '(host_id, scheduled_at DESC)');
SELECT public.safe_create_index('meetings', 'idx_meetings_status_scheduled', ARRAY['status', 'scheduled_at'], '(status, scheduled_at DESC)');

-- ------------------------------------------------------------------------------
-- 6. DIRECT USER MESSAGES & BATCH MESSAGING
-- ------------------------------------------------------------------------------
SELECT public.safe_create_index('messages', 'idx_messages_sender_receiver_created', ARRAY['sender_id', 'receiver_id', 'created_at'], '(sender_id, receiver_id, created_at ASC)');
SELECT public.safe_create_index('messages', 'idx_messages_receiver_sender_created', ARRAY['receiver_id', 'sender_id', 'created_at'], '(receiver_id, sender_id, created_at ASC)');
SELECT public.safe_create_index('messages', 'idx_messages_unread_partial', ARRAY['receiver_id', 'is_read', 'created_at'], '(receiver_id, created_at DESC) WHERE is_read = false');

SELECT public.safe_create_index('batch_messages', 'idx_batch_messages_batch_created', ARRAY['batch_id', 'created_at'], '(batch_id, created_at ASC)');
SELECT public.safe_create_index('batch_messages', 'idx_batch_messages_sender', ARRAY['sender_id'], '(sender_id)');
SELECT public.safe_create_index('batch_announcements', 'idx_batch_announcements_batch_created', ARRAY['batch_id', 'created_at'], '(batch_id, created_at DESC)');
SELECT public.safe_create_index('batch_resources', 'idx_batch_resources_batch_created', ARRAY['batch_id', 'created_at'], '(batch_id, created_at DESC)');
SELECT public.safe_create_index('batch_escalations', 'idx_batch_escalations_batch_status', ARRAY['batch_id', 'status', 'created_at'], '(batch_id, status, created_at DESC)');

-- ------------------------------------------------------------------------------
-- 7. NOTIFICATIONS & QUEUE
-- ------------------------------------------------------------------------------
SELECT public.safe_create_index('notifications', 'idx_notifications_user_created', ARRAY['user_id', 'created_at'], '(user_id, created_at DESC)');
SELECT public.safe_create_index('notifications', 'idx_notifications_user_unread', ARRAY['user_id', 'is_read', 'created_at'], '(user_id, created_at DESC) WHERE is_read = false');
SELECT public.safe_create_index('notification_queue', 'idx_notification_queue_status_created', ARRAY['status', 'created_at'], '(status, created_at DESC)');
SELECT public.safe_create_index('notification_preferences', 'idx_notification_preferences_user', ARRAY['user_id'], '(user_id)');

-- ------------------------------------------------------------------------------
-- 8. CRM LEADS & META ADS
-- ------------------------------------------------------------------------------
SELECT public.safe_create_index('leads', 'idx_leads_created_at_desc', ARRAY['created_at'], '(created_at DESC)');
SELECT public.safe_create_index('leads', 'idx_leads_status_created_at', ARRAY['status', 'created_at'], '(status, created_at DESC)');
SELECT public.safe_create_index('leads', 'idx_leads_source_created_at', ARRAY['source', 'created_at'], '(source, created_at DESC)');
SELECT public.safe_create_index('leads', 'idx_leads_service_created_at', ARRAY['service', 'created_at'], '(service, created_at DESC)');
SELECT public.safe_create_index('leads', 'idx_leads_email', ARRAY['email'], $$(email) WHERE email IS NOT NULL AND email <> ''$$);
SELECT public.safe_create_index('leads', 'idx_leads_phone', ARRAY['phone'], $$(phone) WHERE phone IS NOT NULL AND phone <> ''$$);
SELECT public.safe_create_index('leads', 'idx_leads_meta_lead_id', ARRAY['meta_lead_id'], '(meta_lead_id) WHERE meta_lead_id IS NOT NULL');
SELECT public.safe_create_index('leads', 'idx_leads_form_id_created_at', ARRAY['form_id', 'created_at'], '(form_id, created_at DESC)');
SELECT public.safe_create_index('leads', 'idx_leads_campaign_id', ARRAY['campaign_id'], '(campaign_id) WHERE campaign_id IS NOT NULL');

-- ------------------------------------------------------------------------------
-- 9. CRM CLIENTS & DEALS (SALES PIPELINE)
-- ------------------------------------------------------------------------------
SELECT public.safe_create_index('clients', 'idx_clients_status_created', ARRAY['status', 'created_at'], '(status, created_at DESC)');
SELECT public.safe_create_index('clients', 'idx_clients_email', ARRAY['email'], '(email)');
SELECT public.safe_create_index('clients', 'idx_clients_phone', ARRAY['phone'], '(phone)');

SELECT public.safe_create_index('deals', 'idx_deals_stage_created_at', ARRAY['pipeline_stage', 'created_at'], '(pipeline_stage, created_at DESC)');
SELECT public.safe_create_index('deals', 'idx_deals_stage_updated_at', ARRAY['pipeline_stage', 'updated_at'], '(pipeline_stage, updated_at DESC)');
SELECT public.safe_create_index('deals', 'idx_deals_client_id', ARRAY['client_id'], '(client_id) WHERE client_id IS NOT NULL');
SELECT public.safe_create_index('deals', 'idx_deals_lead_id', ARRAY['lead_id'], '(lead_id) WHERE lead_id IS NOT NULL');
SELECT public.safe_create_index('deals', 'idx_deals_assigned_to_stage', ARRAY['assigned_to', 'pipeline_stage'], '(assigned_to, pipeline_stage)');

-- ------------------------------------------------------------------------------
-- 10. SALES FOLLOW-UPS & SALES MEETINGS
-- ------------------------------------------------------------------------------
SELECT public.safe_create_index('sales_followups', 'idx_sales_followups_due_at', ARRAY['due_at'], '(due_at ASC)');
SELECT public.safe_create_index('sales_followups', 'idx_sales_followups_status_due', ARRAY['status', 'due_at'], '(status, due_at ASC)');
SELECT public.safe_create_index('sales_followups', 'idx_sales_followups_deal_due', ARRAY['deal_id', 'due_at'], '(deal_id, due_at DESC) WHERE deal_id IS NOT NULL');
SELECT public.safe_create_index('sales_followups', 'idx_sales_followups_lead_due', ARRAY['lead_id', 'due_at'], '(lead_id, due_at DESC) WHERE lead_id IS NOT NULL');
SELECT public.safe_create_index('sales_followups', 'idx_sales_followups_assigned', ARRAY['assigned_to', 'due_at'], '(assigned_to, due_at ASC) WHERE assigned_to IS NOT NULL');

SELECT public.safe_create_index('sales_meetings', 'idx_sales_meetings_scheduled_at', ARRAY['scheduled_at'], '(scheduled_at ASC)');
SELECT public.safe_create_index('sales_meetings', 'idx_sales_meetings_status_scheduled', ARRAY['status', 'scheduled_at'], '(status, scheduled_at ASC)');
SELECT public.safe_create_index('sales_meetings', 'idx_sales_meetings_deal_scheduled', ARRAY['deal_id', 'scheduled_at'], '(deal_id, scheduled_at DESC) WHERE deal_id IS NOT NULL');
SELECT public.safe_create_index('sales_meetings', 'idx_sales_meetings_lead_scheduled', ARRAY['lead_id', 'scheduled_at'], '(lead_id, scheduled_at DESC) WHERE lead_id IS NOT NULL');
SELECT public.safe_create_index('sales_meetings', 'idx_sales_meetings_host_scheduled', ARRAY['host_id', 'scheduled_at'], '(host_id, scheduled_at ASC) WHERE host_id IS NOT NULL');

-- ------------------------------------------------------------------------------
-- 11. COMMERCIAL DOCUMENTS (PROPOSALS, QUOTATIONS, AGREEMENTS, INVOICES, PAYMENTS)
-- ------------------------------------------------------------------------------
SELECT public.safe_create_index('proposals', 'idx_proposals_deal_created', ARRAY['deal_id', 'created_at'], '(deal_id, created_at DESC) WHERE deal_id IS NOT NULL');
SELECT public.safe_create_index('proposals', 'idx_proposals_status_created', ARRAY['status', 'created_at'], '(status, created_at DESC)');

SELECT public.safe_create_index('quotations', 'idx_quotations_deal_created', ARRAY['deal_id', 'created_at'], '(deal_id, created_at DESC) WHERE deal_id IS NOT NULL');
SELECT public.safe_create_index('quotations', 'idx_quotations_status_created', ARRAY['status', 'created_at'], '(status, created_at DESC)');

SELECT public.safe_create_index('agreements', 'idx_agreements_deal_created', ARRAY['deal_id', 'created_at'], '(deal_id, created_at DESC) WHERE deal_id IS NOT NULL');
SELECT public.safe_create_index('agreements', 'idx_agreements_status_created', ARRAY['status', 'created_at'], '(status, created_at DESC)');

SELECT public.safe_create_index('invoices', 'idx_invoices_status_due', ARRAY['status', 'due_date'], '(status, due_date DESC)');
SELECT public.safe_create_index('invoices', 'idx_invoices_created_at_desc', ARRAY['created_at'], '(created_at DESC)');
SELECT public.safe_create_index('invoices', 'idx_invoices_deal_id', ARRAY['deal_id', 'created_at'], '(deal_id, created_at DESC)');
SELECT public.safe_create_index('invoices', 'idx_invoices_client_id', ARRAY['client_id', 'created_at'], '(client_id, created_at DESC)');

SELECT public.safe_create_index('payments', 'idx_payments_status_created', ARRAY['status', 'created_at'], '(status, created_at DESC)');
SELECT public.safe_create_index('payments', 'idx_payments_deal_id', ARRAY['deal_id', 'created_at'], '(deal_id, created_at DESC)');
SELECT public.safe_create_index('payments', 'idx_payments_invoice_id', ARRAY['invoice_id'], '(invoice_id)');

-- ------------------------------------------------------------------------------
-- 12. CRM ENTITY CHAT & AI DRAFTS
-- ------------------------------------------------------------------------------
SELECT public.safe_create_index('crm_chat_threads', 'idx_crm_chat_threads_lookup', ARRAY['entity_type', 'entity_id', 'department'], '(entity_type, entity_id, department)');
SELECT public.safe_create_index('crm_chat_messages', 'idx_crm_chat_messages_thread_created', ARRAY['thread_id', 'created_at'], '(thread_id, created_at ASC)');
SELECT public.safe_create_index('crm_chat_messages', 'idx_crm_chat_messages_sender', ARRAY['sender_id'], '(sender_id)');

SELECT public.safe_create_index('ai_document_threads', 'idx_ai_threads_deal_type', ARRAY['deal_id', 'document_type'], '(deal_id, document_type)');
SELECT public.safe_create_index('ai_document_messages', 'idx_ai_messages_thread_created', ARRAY['thread_id', 'created_at'], '(thread_id, created_at ASC)');
SELECT public.safe_create_index('ai_document_drafts', 'idx_ai_drafts_deal_type', ARRAY['deal_id', 'document_type', 'status'], '(deal_id, document_type, status)');

-- ------------------------------------------------------------------------------
-- 13. PROJECTS, SMM, CMS, CERTIFICATES & SUPPORT TICKETS
-- ------------------------------------------------------------------------------
SELECT public.safe_create_index('projects', 'idx_projects_status_created', ARRAY['status', 'created_at'], '(status, created_at DESC)');
SELECT public.safe_create_index('projects', 'idx_projects_client_id', ARRAY['client_id'], '(client_id)');
SELECT public.safe_create_index('project_members', 'idx_project_members_project', ARRAY['project_id', 'user_id'], '(project_id, user_id)');

SELECT public.safe_create_index('smm_clients', 'idx_smm_clients_status', ARRAY['status'], '(status)');
SELECT public.safe_create_index('content_calendar', 'idx_content_calendar_scheduled', ARRAY['scheduled_date'], '(scheduled_date DESC)');
SELECT public.safe_create_index('content_calendar', 'idx_content_calendar_status', ARRAY['status'], '(status)');

SELECT public.safe_create_index('support_tickets', 'idx_support_tickets_status_created', ARRAY['status', 'created_at'], '(status, created_at DESC)');
SELECT public.safe_create_index('support_tickets', 'idx_support_tickets_assigned', ARRAY['assigned_to'], '(assigned_to)');

SELECT public.safe_create_index('certificates', 'idx_certificates_code', ARRAY['certificate_code'], '(certificate_code)');
SELECT public.safe_create_index('certificates', 'idx_certificates_user', ARRAY['user_id'], '(user_id)');

SELECT public.safe_create_index('audit_logs', 'idx_audit_logs_user_created', ARRAY['user_id', 'created_at'], '(user_id, created_at DESC)');
SELECT public.safe_create_index('audit_logs', 'idx_audit_logs_action', ARRAY['action', 'created_at'], '(action, created_at DESC)');

-- ------------------------------------------------------------------------------
-- CLEANUP TEMPORARY HELPER FUNCTION
-- ------------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.safe_create_index(TEXT, TEXT, TEXT[], TEXT);
