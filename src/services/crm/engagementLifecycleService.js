import { supabase } from "../supabase/client";

function buildLinkFilter({ leadId = "", dealId = "", dealIds = [] } = {}) {
  const linkedDealIds = [...new Set([dealId, ...dealIds].filter(Boolean))];
  const clauses = [];
  if (leadId) clauses.push(`lead_id.eq.${leadId}`);
  if (linkedDealIds.length === 1) clauses.push(`deal_id.eq.${linkedDealIds[0]}`);
  if (linkedDealIds.length > 1) clauses.push(`deal_id.in.(${linkedDealIds.join(",")})`);
  return clauses.join(",");
}

export async function completeActiveEngagementsForLost(target = {}) {
  const linkFilter = buildLinkFilter(target);
  if (!linkFilter) return { followUpIds: [], meetingIds: [] };

  const completedAt = new Date().toISOString();
  const [followUpsResult, meetingsResult] = await Promise.all([
    supabase
      .from("sales_followups")
      .update({ status: "done", completed_at: completedAt, updated_at: completedAt })
      .or(linkFilter)
      .eq("status", "pending")
      .select("id"),
    supabase
      .from("sales_meetings")
      .update({ status: "completed", updated_at: completedAt })
      .or(linkFilter)
      .in("status", ["scheduled", "confirmed"])
      .select("id"),
  ]);

  if (followUpsResult.error) throw followUpsResult.error;
  if (meetingsResult.error) throw meetingsResult.error;

  return {
    followUpIds: (followUpsResult.data || []).map((item) => item.id),
    meetingIds: (meetingsResult.data || []).map((item) => item.id),
  };
}
