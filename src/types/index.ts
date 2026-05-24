export interface Todo {
  id: string;
  text: string;
  done: boolean;
  added: string;        // ISO date string
  priority: boolean;
  overdue: boolean;
}

export type GoalType = "daily" | "weekly" | "monthly" | "longterm";

export interface GoalTask {
  t: string;
  done: boolean;
  due?: string;
}

export interface Partner {
  name: string;
  ini: string;
  col: string;
}

export interface Goal {
  id: string;
  title: string;
  emoji: string;
  type: GoalType;
  deadline: string;
  streak: number;
  muted: boolean;
  linkedTo: string | null;
  partner: Partner | null;
  today: GoalTask[];
  allTasks: GoalTask[];
}

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

export type TabId = "home" | "pacts" | "circle" | "profile";
