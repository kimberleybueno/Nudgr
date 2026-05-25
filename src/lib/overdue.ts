import type { Task } from "@/types";

/**
 * A task is overdue when:
 *   - createdAt is more than 3 days ago, AND
 *   - done is false, AND
 *   - (no due date set, OR the due date has passed)
 *
 * `due` is a day-of-month number (1-31). It's considered "passed" if the
 * current month's calendar day is past it.
 */
export function isOverdue(t: Task, now: Date = new Date()): boolean {
  if (t.done) return false;

  const created = new Date(t.createdAt).getTime();
  const ageMs = now.getTime() - created;
  if (ageMs < 3 * 86400000) return false;

  if (t.due == null) return true;
  // due is a day-of-month; if today is past that day in this month, it's passed
  return now.getDate() > t.due;
}

/** Recompute the .overdue flag on every task, returning a new array. */
export function refreshOverdue<T extends Task>(tasks: T[], now: Date = new Date()): T[] {
  return tasks.map((t) => {
    const flag = isOverdue(t, now);
    return t.overdue === flag ? t : { ...t, overdue: flag };
  });
}
