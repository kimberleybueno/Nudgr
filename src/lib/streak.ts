/**
 * Calculate consecutive day streak from a list of completion dates.
 *
 * Rules:
 *   - A day "counts" if at least 1 task was marked done on that date.
 *   - Counts backwards from today.
 *   - If today has 0 completions, the streak still counts from yesterday
 *     (the user hasn't broken it yet).
 *   - If yesterday had 0 completions, the streak resets to 0 (or 1 if today
 *     has completions).
 */
export function calculateStreak(completionDates: string[]): number {
  if (completionDates.length === 0) return 0;
  const set = new Set(completionDates.map((d) => d.slice(0, 10)));

  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const todayHas = set.has(todayKey);

  let streak = 0;
  const cursor = new Date(today);

  // If today has nothing yet, skip it (don't penalize) — start at yesterday
  if (!todayHas) cursor.setDate(cursor.getDate() - 1);

  while (set.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

/** Push today into the array if not already present. Returns a new array. */
export function recordCompletion(completionDates: string[]): string[] {
  const today = new Date().toISOString().slice(0, 10);
  if (completionDates.includes(today)) return completionDates;
  return [...completionDates, today];
}
