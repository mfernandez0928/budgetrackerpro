export function getTodayISO() {
  return new Date().toISOString().split("T")[0];
}

export function getMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
}

export function getMonthKeyFromISO(dateISO: string) {
  const date = new Date(dateISO);
  return getMonthKey(date);
}

export function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export function addMonths(dateISO: string, count: number) {
  const date = new Date(dateISO);
  date.setMonth(date.getMonth() + count);
  return date.toISOString().split("T")[0];
}

export function addWeeks(dateISO: string, count: number) {
  const date = new Date(dateISO);
  date.setDate(date.getDate() + count * 7);
  return date.toISOString().split("T")[0];
}

export function daysUntil(dateISO: string) {
  const today = new Date(getTodayISO());
  const target = new Date(dateISO);
  const difference = target.getTime() - today.getTime();
  return Math.ceil(difference / (1000 * 60 * 60 * 24));
}
