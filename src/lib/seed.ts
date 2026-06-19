import type { UserData, Task, Goal, Partner, Pact, Message } from "@/types";
import { ymd } from "@/lib/dates";

const today = new Date();
const todayIso = ymd(today);
const daysAgo = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return ymd(d);
};
const daysAhead = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return ymd(d);
};
const monthLabel = (offset: number) => {
  const d = new Date(today);
  d.setMonth(d.getMonth() + offset);
  return d.toLocaleString(undefined, { month: "short", year: "numeric" });
};
const isoForOffset = (offset: number) => {
  const d = new Date(today);
  d.setMonth(d.getMonth() + offset);
  return d.toISOString().slice(0, 10);
};

const id = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 8)}`;

/* =========================================================================
   EMPTY default — what every fresh install gets. No demo data leaks here.
   Onboarding gate (Screen 1) writes name + primaryGoalTitle.
   ========================================================================= */

export const EMPTY_USER: UserData = {
  name: "",
  tasks: [],
  goals: [],
  partners: [],
  streak: 0,
  lastActiveDate: "",
  completionDates: [],
  onboardedAt: null,
  primaryGoalTitle: null,
  lastNudgedAt: {},
};

export const EMPTY_PACTS: Pact[] = [];
export const EMPTY_MESSAGES: Message[] = [];

/* =========================================================================
   SAMPLE — populated via Settings → 'Load sample data'. Same shape as
   the previous default, just gated behind an explicit user action.
   ========================================================================= */

export const SAMPLE_PARTNERS: Partner[] = [
  { id: "p_maya",   name: "Maya",   initial: "M", color: "#C4A98A" },
  { id: "p_jordan", name: "Jordan", initial: "J", color: "#7A9E7E" },
];

const t = (overrides: Partial<Task>): Task => ({
  id: id("t"),
  text: "",
  done: false,
  star: false,
  overdue: false,
  goalId: null,
  partnerId: null,
  dueDate: todayIso,
  recurring: null,
  createdAt: todayIso,
  ...overrides,
});

const marathonId = "g_marathon";
const launchId   = "g_launch";
const readId     = "g_read";

export const SAMPLE_GOALS: Goal[] = [
  {
    id: marathonId,
    emoji: "🏃‍♀️",
    name: "Marathon Training",
    color: "#7A9E7E",
    deadline: monthLabel(2),
    deadlineDate: isoForOffset(2),
    tasks: [
      t({ text: "Morning 5k", goalId: marathonId, recurring: "daily" }),
      t({ text: "Long run Saturday", goalId: marathonId, dueDate: daysAhead(3), recurring: "weekly" }),
      t({ text: "Stretch 10 min", goalId: marathonId, recurring: "daily", done: true, completedAt: todayIso }),
    ],
  },
  {
    id: launchId,
    emoji: "🚀",
    name: "Nudgr Launch",
    color: "#C4A98A",
    deadline: monthLabel(1),
    deadlineDate: isoForOffset(1),
    tasks: [
      t({ text: "Finalize onboarding copy", goalId: launchId, done: true, completedAt: daysAgo(1), createdAt: daysAgo(5) }),
      t({ text: "Set up analytics", goalId: launchId, dueDate: daysAhead(4) }),
      t({ text: "Invite 20 beta users", goalId: launchId, dueDate: daysAhead(7) }),
    ],
  },
  {
    id: readId,
    emoji: "📚",
    name: "2026 Reading",
    color: "#7D6B8A",
    deadline: monthLabel(6),
    deadlineDate: isoForOffset(6),
    tasks: [
      t({ text: "Read 20 min", goalId: readId, recurring: "daily" }),
      t({ text: "Finish current book", goalId: readId, dueDate: daysAhead(5) }),
    ],
  },
];

export const SAMPLE_STANDALONE: Task[] = [
  t({ text: "Reply to Sara's email", star: true }),
  t({ text: "Buy oat milk", dueDate: null }),
  t({ text: "Schedule dentist", dueDate: null, createdAt: daysAgo(5), overdue: true }),
];

export const SAMPLE_USER: UserData = {
  name: "friend",
  tasks: SAMPLE_STANDALONE,
  goals: SAMPLE_GOALS,
  partners: SAMPLE_PARTNERS,
  streak: 4,
  lastActiveDate: todayIso,
  completionDates: [daysAgo(3), daysAgo(2), daysAgo(1), todayIso],
  onboardedAt: today.toISOString(),
  primaryGoalTitle: "Marathon Training",
  lastNudgedAt: {},
};

export const SAMPLE_PACTS: Pact[] = [
  {
    id: "p1",
    name: "Run Club",
    emoji: "🏃‍♀️",
    owner: "me",
    members: [
      { ini: "M", col: "#C4A98A", name: "Maya" },
      { ini: "L", col: "#7A9E7E", name: "Lena" },
      { ini: "J", col: "#C5A33E", name: "Jordan" },
    ],
    unread: 2,
    last: "Maya: Crushing it today 💪",
    time: "9:42",
    pinned: true,
    sharedGoals: [
      { title: "Run 5k weekly", emoji: "🏃‍♀️", progress: 75 },
      { title: "Sunday long run", emoji: "🌄", progress: 50 },
    ],
    goal: "Stay consistent with weekly runs",
    cadence: "weekly",
    createdAt: daysAgo(20),
  },
  {
    id: "p2",
    name: "Build Nudgr",
    emoji: "🚀",
    owner: "me",
    members: [{ ini: "J", col: "#7A9E7E", name: "Jordan" }],
    unread: 0,
    last: "You: Just shipped the home tab",
    time: "Yesterday",
    pinned: false,
    sharedGoals: [{ title: "Launch beta", emoji: "🚀", progress: 35 }],
    goal: "Ship Nudgr to beta",
    cadence: "daily",
    createdAt: daysAgo(7),
  },
  {
    id: "p3",
    name: "Reading Pact",
    emoji: "📖",
    owner: "Sara",
    members: [
      { ini: "S", col: "#97B099", name: "Sara" },
      { ini: "T", col: "#D4845A", name: "Tom" },
    ],
    unread: 0,
    last: "Sara: Finished my book!",
    time: "2d",
    pinned: false,
    sharedGoals: [{ title: "Read 20 min daily", emoji: "📖", progress: 88 }],
    goal: "Read 20 minutes a day",
    cadence: "daily",
    createdAt: daysAgo(40),
  },
];

export const SAMPLE_MESSAGES: Message[] = [
  { id: 1, pactId: "p1", user: "system", text: "Today", time: "", type: "date" },
  { id: 2, pactId: "p1", user: "Maya", ini: "M", col: "#C4A98A", name: "Maya",
    text: "Morning. Ready for the 5k?", time: "8:12", type: "msg", read: true },
  { id: 3, pactId: "p1", user: "me", text: "About to head out", time: "8:14", type: "msg", read: true },
  { id: 4, pactId: "p1", user: "system",
    text: "Maya completed today's run. 4 day streak.", time: "8:55", type: "system" },
  { id: 5, pactId: "p1", user: "Maya", ini: "M", col: "#C4A98A", name: "Maya",
    text: "Crushing it today.", time: "9:42", type: "msg", read: false },
  // Incoming nudge from Maya — lights up the ReceivedNudgeBanner on Pact detail.
  // The user has not acknowledged it yet (banner dismisses on tap and only for this session).
  { id: 6, pactId: "p1", user: "Maya", ini: "M", col: "#C4A98A", name: "Maya",
    text: "Maya nudged you", detail: "Don't forget the long run on Saturday. You've got this.",
    time: "9:48", type: "nudge" },
  // Progress system message (mid-thread, mostly to show the progress card path in chat).
  { id: 7, pactId: "p1", user: "system", text: "Crew hit 68% this week",
    pct: 68, time: "10:02", type: "progress" },

  { id: 8, pactId: "p2", user: "system", text: "Yesterday", time: "", type: "date" },
  { id: 9, pactId: "p2", user: "me", text: "Just shipped the home tab", time: "17:20",
    type: "msg", read: true },
];
