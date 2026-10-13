"use client";

export function matchesDateFilter(
  item,
  field = "created_at",
  { dateFilter = "all", selectedDate = "", customDateRange = { from: "", to: "" } } = {}
) {
  if (dateFilter === "all") return true;
  const rawDate = item?.[field] || item?.created_at || item?.updated_at;
  if (!rawDate) return false;
  const time = new Date(rawDate).getTime();
  const now = Date.now();
  if (Number.isNaN(time)) return false;
  const itemDate = new Date(time);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  if (dateFilter === "today") return itemDate >= todayStart && itemDate < tomorrowStart;
  if (dateFilter === "yesterday") return itemDate >= yesterdayStart && itemDate < todayStart;
  if (dateFilter === "date") {
    if (!selectedDate) return true;
    const selectedStart = new Date(`${selectedDate}T00:00:00`);
    const selectedEnd = new Date(selectedStart);
    selectedEnd.setDate(selectedEnd.getDate() + 1);
    return itemDate >= selectedStart && itemDate < selectedEnd;
  }
  if (dateFilter === "day") return time >= now - 86400000;
  if (dateFilter === "week") return time >= now - 7 * 86400000;
  if (dateFilter === "month") return time >= now - 30 * 86400000;
  if (dateFilter === "year") return time >= now - 365 * 86400000;
  if (dateFilter === "custom") {
    const from = customDateRange?.from ? new Date(`${customDateRange.from}T00:00:00`).getTime() : null;
    const to = customDateRange?.to ? new Date(`${customDateRange.to}T23:59:59`).getTime() : null;
    return (!from || time >= from) && (!to || time <= to);
  }
  return true;
}

export function getLeadServerDateRange({
  dateFilter = "all",
  selectedDate = "",
  customDateRange = { from: "", to: "" },
} = {}) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  const toIso = (date) => date.toISOString();

  if (dateFilter === "today") return { dateFrom: toIso(todayStart), dateTo: toIso(tomorrowStart) };
  if (dateFilter === "yesterday") {
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    return { dateFrom: toIso(yesterdayStart), dateTo: toIso(todayStart) };
  }
  if (dateFilter === "date" && selectedDate) {
    const selectedStart = new Date(`${selectedDate}T00:00:00`);
    const selectedEnd = new Date(selectedStart);
    selectedEnd.setDate(selectedEnd.getDate() + 1);
    return { dateFrom: toIso(selectedStart), dateTo: toIso(selectedEnd) };
  }
  if (dateFilter === "day") return { dateFrom: toIso(new Date(Date.now() - 86400000)), dateTo: "" };
  if (dateFilter === "week") return { dateFrom: toIso(new Date(Date.now() - 7 * 86400000)), dateTo: "" };
  if (dateFilter === "month") return { dateFrom: toIso(new Date(Date.now() - 30 * 86400000)), dateTo: "" };
  if (dateFilter === "year") return { dateFrom: toIso(new Date(Date.now() - 365 * 86400000)), dateTo: "" };
  if (dateFilter === "custom") {
    return {
      dateFrom: customDateRange?.from ? new Date(`${customDateRange.from}T00:00:00`).toISOString() : "",
      dateTo: customDateRange?.to ? new Date(`${customDateRange.to}T23:59:59`).toISOString() : "",
    };
  }
  return { dateFrom: "", dateTo: "" };
}
