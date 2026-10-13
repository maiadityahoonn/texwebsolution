"use client";

export function getLatestLinkedDoc(items = [], deal) {
  if (!deal) return null;
  return (
    items
      .filter((item) => item.deal_id === deal.id || (deal.client_id && item.client_id === deal.client_id))
      .sort(
        (a, b) =>
          new Date(b.sent_at || b.signed_at || b.paid_at || b.created_at || 0).getTime() -
          new Date(a.sent_at || a.signed_at || a.paid_at || a.created_at || 0).getTime()
      )[0] || null
  );
}

export function getDocStatusBadge(label, doc) {
  const status = String(doc?.status || "").toLowerCase();
  if (!doc || !status || status === "draft") return null;
  const displayStatus = status.replace(/_/g, " ");
  const tone = ["paid", "signed", "accepted"].includes(status)
    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
    : ["rejected", "declined", "cancelled", "overdue"].includes(status)
    ? "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300"
    : "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300";
  return { label: `${label} ${displayStatus}`, tone };
}
