import { getCloudLeadsSummary } from './leadsService';
import { getDeals } from './dealsService';
import { getInvoices } from './documentsService';

export { getCloudLeadsSummary };

// ==========================================
// SALES REPORTS & CONVERSION METRICS
// ==========================================

export function calculateConversionMetrics({ deals = [], leads = [] } = {}) {
  const totalLeads = leads.length;
  const qualifiedLeads = leads.filter((l) => ['Qualified', 'Contacted', 'In Pipeline'].includes(l.status)).length;
  const convertedLeads = leads.filter((l) => ['Converted', 'Closed Won'].includes(l.status)).length;
  const wonDeals = deals.filter((d) => d.pipeline_stage === 'closed_won').length;
  const lostDeals = deals.filter((d) => d.pipeline_stage === 'closed_lost').length;
  const activeDeals = deals.filter((d) => !['closed_won', 'closed_lost'].includes(d.pipeline_stage)).length;

  const leadToDealRate = totalLeads > 0 ? ((deals.length / totalLeads) * 100).toFixed(1) : '0.0';
  const winRate = (wonDeals + lostDeals) > 0 ? ((wonDeals / (wonDeals + lostDeals)) * 100).toFixed(1) : '0.0';

  return {
    totalLeads,
    qualifiedLeads,
    convertedLeads,
    totalDeals: deals.length,
    wonDeals,
    lostDeals,
    activeDeals,
    leadToDealRate: Number(leadToDealRate),
    winRate: Number(winRate),
  };
}

export function calculateRoiMetrics({ deals = [], invoices = [], marketingCost = 0 } = {}) {
  const wonDeals = deals.filter((d) => d.pipeline_stage === 'closed_won');
  const pipelineValue = deals.reduce((sum, d) => sum + (Number(d.deal_value) || 0), 0);
  const closedWonValue = wonDeals.reduce((sum, d) => sum + (Number(d.deal_value) || 0), 0);
  const paidInvoices = invoices.filter((inv) => inv.status === 'paid');
  const totalRevenueCollected = paidInvoices.reduce((sum, inv) => sum + (Number(inv.total_amount || inv.amount) || 0), 0);

  const cost = Number(marketingCost) || 0;
  const netProfit = totalRevenueCollected - cost;
  const roiPercentage = cost > 0 ? (((totalRevenueCollected - cost) / cost) * 100).toFixed(1) : '0.0';

  return {
    pipelineValue,
    closedWonValue,
    totalRevenueCollected,
    marketingCost: cost,
    netProfit,
    roiPercentage: Number(roiPercentage),
  };
}

export function calculateSalesReports({ deals = [], leads = [], invoices = [] } = {}) {
  const conversion = calculateConversionMetrics({ deals, leads });
  const financial = calculateRoiMetrics({ deals, invoices });

  return {
    conversion,
    financial,
    generatedAt: new Date().toISOString(),
  };
}

export async function getSalesMetricsSummary(options = {}) {
  try {
    const [leadsSummary, dealsRes, invoicesRes] = await Promise.all([
      getCloudLeadsSummary(options),
      getDeals({ ...options, pageSize: 200 }),
      getInvoices(),
    ]);

    const deals = Array.isArray(dealsRes) ? dealsRes : dealsRes?.data || [];
    const invoices = Array.isArray(invoicesRes) ? invoicesRes : [];

    return {
      leadsSummary,
      reports: calculateSalesReports({ deals, invoices }),
    };
  } catch (err) {
    console.warn('Error computing sales metrics summary:', err.message);
    return {
      leadsSummary: { total: 0, converted: 0, lost: 0 },
      reports: calculateSalesReports(),
    };
  }
}
