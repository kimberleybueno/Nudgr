/* =========================================================================
   v2 model — the active model the Home tab uses today.
   ========================================================================= */

export type Recurring = "daily" | "weekly" | null;

export interface Task {
  id: string;
  text: string;
  done: boolean;
  star: boolean;
  overdue: boolean;
  goalId: string | null;
  partnerId: string | null;
  /**
   * Local-date ISO string (YYYY-MM-DD) the task is due on.
   * null = no specific date. Replaces the previous `due: number` day-of-month
   * field. Local-date avoids timezone shifts that would happen with
   * toISOString().slice(0, 10).
   */
  dueDate: string | null;
  recurring: Recurring;
  createdAt: string;          // ISO date string
  completedAt?: string;       // ISO date string set when marked done
}

export interface Goal {
  id: string;
  emoji: string;
  name: string;
  color: string;              // hex for the gradient tile
  deadline: string;           // human label e.g. "Oct 2026"
  deadlineDate: string;       // ISO date for filtering
  tasks: Task[];
  /**
   * Optional "why" statement that powers the WHY card in Goal detail
   * (handoff sec 7). One short sentence, surfaced as Fraunces italic on
   * a tan-tint background. Absent goals simply omit the card.
   */
  why?: string;
}

export interface Partner {
  id: string;
  name: string;
  initial: string;
  color: string;
}

export interface UserData {
  name: string;
  tasks: Task[];              // standalone tasks (no goal)
  goals: Goal[];
  partners: Partner[];
  streak: number;
  lastActiveDate: string;     // ISO date of last completion
  completionDates: string[];  // ISO dates with at least one completion
  /** Set on Onboarding completion. Falsy => the OnboardingGate intercepts. */
  onboardedAt: string | null;
  /** From the Onboarding step 2. */
  primaryGoalTitle: string | null;
  /** Map of personId -> ISO timestamp of last Nudge sent. Used for rate limiting. */
  lastNudgedAt: Record<string, string>;
}

export type TabId = "home" | "people" | "settings";
export type GoalFilter = "all" | "short" | "long";

/* =========================================================================
   PRESERVED — Pact + Message data structures from the v1 model.
   Not used by Home today, but kept (and persisted to localStorage) so the
   future Pacts / Circle tab implementations can pick this back up without
   losing seeded or user-generated data.
   ========================================================================= */

export interface PactMember {
  ini: string;
  col: string;
  name: string;
}

export interface PactGoal {
  title: string;
  emoji: string;
  progress: number;
}

export type PactCadence = "daily" | "weekly" | "none";

export interface Pact {
  id: string;
  name: string;
  emoji: string;
  owner: string;
  members: PactMember[];
  unread: number;
  last: string;
  time: string;
  pinned: boolean;
  sharedGoals: PactGoal[];
  /** Optional goal text — what this Pact is working toward. */
  goal?: string;
  cadence?: PactCadence;
  createdAt?: string;
  /** True if user has dismissed the 'check-ins coming soon' banner for this Pact. */
  checkInBannerDismissed?: boolean;
}

export type MessageType =
  | "msg"
  | "system"
  | "checkin"
  | "goal_created"
  | "meeting"
  | "date";

export interface Message {
  id: number;
  pactId: string;
  user: string;        // "me" or member name
  text: string;
  time: string;
  type: MessageType;
  read?: boolean;
  ini?: string;
  col?: string;
  name?: string;
}
