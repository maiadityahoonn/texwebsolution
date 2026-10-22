-- Automatically close pending sales activity when its lead/deal is marked lost.

CREATE OR REPLACE FUNCTION public.complete_lost_crm_engagements()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_TABLE_NAME = 'deals' THEN
    IF NEW.pipeline_stage IN ('closed_lost', 'lost', 'abandoned', 'dropped')
       AND OLD.pipeline_stage IS DISTINCT FROM NEW.pipeline_stage THEN
      UPDATE public.sales_followups
      SET status = 'done', completed_at = NOW(), updated_at = NOW()
      WHERE deal_id = NEW.id AND status = 'pending';

      UPDATE public.sales_meetings
      SET status = 'completed', updated_at = NOW()
      WHERE deal_id = NEW.id AND status IN ('scheduled', 'confirmed');
    END IF;
  ELSIF TG_TABLE_NAME = 'leads' THEN
    IF LOWER(COALESCE(NEW.status, '')) = 'lost'
       AND OLD.status IS DISTINCT FROM NEW.status THEN
      UPDATE public.deals
      SET pipeline_stage = 'closed_lost',
          loss_reason = COALESCE(loss_reason, 'Linked lead marked Lost'),
          updated_at = NOW()
      WHERE lead_id = NEW.id
        AND pipeline_stage NOT IN ('closed_won', 'closed_lost', 'lost', 'abandoned', 'dropped');

      UPDATE public.sales_followups
      SET status = 'done', completed_at = NOW(), updated_at = NOW()
      WHERE status = 'pending'
        AND (
          lead_id = NEW.id
          OR deal_id IN (SELECT id FROM public.deals WHERE lead_id = NEW.id)
        );

      UPDATE public.sales_meetings
      SET status = 'completed', updated_at = NOW()
      WHERE status IN ('scheduled', 'confirmed')
        AND (
          lead_id = NEW.id
          OR deal_id IN (SELECT id FROM public.deals WHERE lead_id = NEW.id)
        );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_complete_lost_deal_engagements ON public.deals;
CREATE TRIGGER trg_complete_lost_deal_engagements
AFTER UPDATE OF pipeline_stage ON public.deals
FOR EACH ROW EXECUTE FUNCTION public.complete_lost_crm_engagements();

DROP TRIGGER IF EXISTS trg_complete_lost_lead_engagements ON public.leads;
CREATE TRIGGER trg_complete_lost_lead_engagements
AFTER UPDATE OF status ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.complete_lost_crm_engagements();

-- Repair already-open activities attached to records that were previously lost.
UPDATE public.deals AS deal
SET pipeline_stage = 'closed_lost',
    loss_reason = COALESCE(deal.loss_reason, 'Linked lead marked Lost'),
    updated_at = NOW()
WHERE deal.pipeline_stage NOT IN ('closed_won', 'closed_lost', 'lost', 'abandoned', 'dropped')
  AND EXISTS (
    SELECT 1 FROM public.leads AS lead
    WHERE lead.id = deal.lead_id AND LOWER(COALESCE(lead.status, '')) = 'lost'
  );

UPDATE public.sales_followups AS followup
SET status = 'done', completed_at = NOW(), updated_at = NOW()
WHERE followup.status = 'pending'
  AND (
    EXISTS (
      SELECT 1 FROM public.leads AS lead
      WHERE lead.id = followup.lead_id AND LOWER(COALESCE(lead.status, '')) = 'lost'
    )
    OR EXISTS (
      SELECT 1 FROM public.deals AS deal
      WHERE deal.id = followup.deal_id
        AND deal.pipeline_stage IN ('closed_lost', 'lost', 'abandoned', 'dropped')
    )
  );

UPDATE public.sales_meetings AS meeting
SET status = 'completed', updated_at = NOW()
WHERE meeting.status IN ('scheduled', 'confirmed')
  AND (
    EXISTS (
      SELECT 1 FROM public.leads AS lead
      WHERE lead.id = meeting.lead_id AND LOWER(COALESCE(lead.status, '')) = 'lost'
    )
    OR EXISTS (
      SELECT 1 FROM public.deals AS deal
      WHERE deal.id = meeting.deal_id
        AND deal.pipeline_stage IN ('closed_lost', 'lost', 'abandoned', 'dropped')
    )
  );
