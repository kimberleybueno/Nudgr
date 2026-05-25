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
  due: number | null;        // day of month (1-31), null = no specific date
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
}

export type TabId = "home" | "pacts" | "circle" | "settings";
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
