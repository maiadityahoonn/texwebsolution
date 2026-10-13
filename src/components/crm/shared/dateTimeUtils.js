export const DEFAULT_REMINDER_MINUTES = 10;

export const REMINDER_OPTIONS = [
  [5, "5 min before"],
  [10, "10 min before"],
  [15, "15 min before"],
  [30, "30 min before"],
  [60, "1 hour before"],
  [120, "2 hours before"],
  [1440, "1 day before"],
];

export const DURATION_OPTIONS = [
  [15, "15 min"],
  [30, "30 min"],
  [45, "45 min"],
  [60, "1 hour"],
  [90, "1.5 hours"],
  [120, "2 hours"],
];

export const TIME_HOUR_OPTIONS = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0"));
export const TIME_MINUTE_OPTIONS = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, "0"));

export function toLocalDateTimeInput(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export function datePart(value) {
  return String(value || "").slice(0, 10);
}

export function timePart(value) {
  return String(value || "").slice(11, 16);
}

export function timeParts12(value) {
  const [hourRaw = "10", minuteRaw = "00"] = timePart(value).split(":");
  const hour24 = Math.min(23, Math.max(0, Number.parseInt(hourRaw, 10) || 10));
  const minute = Math.min(59, Math.max(0, Number.parseInt(minuteRaw, 10) || 0));
  return {
    hour: String(hour24 % 12 || 12).padStart(2, "0"),
    minute: String(minute).padStart(2, "0"),
    meridiem: hour24 >= 12 ? "PM" : "AM",
  };
}

export function buildTimeFrom12Hour(hour, minute, meridiem) {
  let nextHour = Math.min(12, Math.max(1, Number.parseInt(hour, 10) || 10));
  const nextMinute = Math.min(59, Math.max(0, Number.parseInt(minute, 10) || 0));
  if (meridiem === "PM" && nextHour !== 12) nextHour += 12;
  if (meridiem === "AM" && nextHour === 12) nextHour = 0;
  return `${String(nextHour).padStart(2, "0")}:${String(nextMinute).padStart(2, "0")}`;
}

export function combineDateTimeParts(currentValue, part, nextValue) {
  const today = toLocalDateTimeInput(new Date()).slice(0, 10);
  const currentDate = datePart(currentValue) || today;
  const currentTime = timePart(currentValue) || "10:00";
  const nextDate = part === "date" ? nextValue : currentDate;
  const nextTime = part === "time" ? nextValue : currentTime;
  return `${nextDate || today}T${nextTime || "10:00"}`;
}

export function combineTime12Parts(currentValue, patch) {
  const current = timeParts12(currentValue);
  const next = { ...current, ...patch };
  return combineDateTimeParts(currentValue, "time", buildTimeFrom12Hour(next.hour, next.minute, next.meridiem));
}
