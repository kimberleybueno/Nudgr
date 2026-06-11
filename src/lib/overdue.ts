import type { Task } from "@/types";
import { parseIsoDate } from "@/lib/dates";

/**
 * A task is overdue when:
 *   - createdAt is more than 3 days ago, AND
 *   - done is false, AND
 *   - (no due date set, OR the due date is before today)
 *
 * dueDate is a local-date ISO string (YYYY-MM-DD). "Before today" means the
 * stored date is strictly older than the current local day.
 */
export function isOverdue(t: Task, now: Date = new Date()): boolean {
  if (t.done) return false;

  const created = new Date(t.createdAt).getTime();
  const ageMs = now.getTime() - created;
  if (ageMs < 3 * 86400000) return false;

  if (!t.dueDate) return true;

  const due = parseIsoDate(t.dueDate);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return due.getTime() < startOfToday.getTime();
}

/** Recompute the .overdue flag on every task, returning a new array. */
export function refreshOverdue<T extends Task>(tasks: T[], now: Date = new Date()): T[] {
  return tasks.map((t) => {
    const flag = isOverdue(t, now);
    return t.overdue === flag ? t : { ...t, overdue: flag };
  });
}
