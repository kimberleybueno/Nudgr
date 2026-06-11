/**
 * Local-date helpers. Always use these instead of `new Date().toISOString().slice(0, 10)`,
 * which silently shifts dates across timezones.
 */

export function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayIso(): string {
  return ymd(new Date());
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(d.getDate() + n);
  return x;
}

/** ISO date `n` days from today (negative ok). */
export function isoOffset(n: number): string {
  return ymd(addDays(new Date(), n));
}

/** Parse an ISO `YYYY-MM-DD` as a local-midnight Date. */
export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map((s) => parseInt(s, 10));
  return new Date(y, (m || 1) - 1, d || 1);
}

/** Human label for a due date e.g. 'June 14' or 'Tomorrow' or 'Today'. */
export function humanDueLabel(iso: string, now: Date = new Date()): string {
  const today = ymd(now);
  if (iso === today) return "Today";
  if (iso === ymd(addDays(now, 1))) return "Tomorrow";
  const d = parseIsoDate(iso);
  return d.toLocaleDateString(undefined, { month: "long", day: "numeric" });
}

/** Day-of-week + month + day, e.g. 'Wed, Jun 14'. Used in headers. */
export function shortDateLabel(iso: string): string {
  const d = parseIsoDate(iso);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}
