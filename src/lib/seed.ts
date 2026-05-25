import type { UserData, Task, Goal, Partner, Pact, Message } from "@/types";

const today = new Date();
const todayDay = today.getDate();
const todayIso = today.toISOString().slice(0, 10);
const daysAgo = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
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

export const SEED_PARTNERS: Partner[] = [
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
  due: todayDay,
  recurring: null,
  createdAt: todayIso,
  ...overrides,
});

const marathonId = "g_marathon";
const launchId   = "g_launch";
const readId     = "g_read";

export const SEED_GOALS: Goal[] = [
  {
    id: marathonId,
    emoji: "🏃‍♀️",
    name: "Marathon Training",
    color: "#7A9E7E",
    deadline: monthLabel(2),
    deadlineDate: isoForOffset(2),
    tasks: [
      t({ text: "Morning 5k", goalId: marathonId, recurring: "daily" }),
      t({ text: "Long run Saturday", goalId: marathonId, due: todayDay + 3, recurring: "weekly" }),
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
      t({ text: "Set up analytics", goalId: launchId, due: todayDay + 4 }),
      t({ text: "Invite 20 beta users", goalId: launchId, due: todayDay + 7 }),
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
      t({ text: "Finish current book", goalId: readId, due: todayDay + 5 }),
    ],
  },
];

export const SEED_STANDALONE: Task[] = [
  t({ text: "Reply to Sara's email", star: true }),
  t({ text: "Buy oat milk", due: null }),
  t({ text: "Schedule dentist", due: null, createdAt: daysAgo(5), overdue: true }),
];

export const SEED_USER: UserData = {
  name: "friend",
  tasks: SEED_STANDALONE,
  goals: SEED_GOALS,
  partners: SEED_PARTNERS,
  streak: 4,
  lastActiveDate: todayIso,
  completionDates: [daysAgo(3), daysAgo(2), daysAgo(1), todayIso],
};

/* -------------------------------------------------------------------------
   PRESERVED v1 seed data — Pacts + Messages.
   Not surfaced in the UI today (Pacts/Circle tabs are placeholders) but
   persisted to localStorage so the future tabs pick up real data.
   ------------------------------------------------------------------------- */

export const SEED_PACTS: Pact[] = [
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
  },
];

export const SEED_MESSAGES: Message[] = [
  { id: 1, pactId: "p1", user: "system", text: "Today", time: "", type: "date" },
  { id: 2, pactId: "p1", user: "Maya", ini: "M", col: "#C4A98A", name: "Maya", text: "Morning! Ready for the 5k?", time: "8:12", type: "msg", read: true },
  { id: 3, pactId: "p1", user: "me", text: "About to head out 🏃‍♀️", time: "8:14", type: "msg", read: true },
  { id: 4, pactId: "p1", user: "system", text: "Maya completed today's run — 4 day streak 🔥", time: "8:55", type: "system" },
  { id: 5, pactId: "p1", user: "Maya", ini: "M", col: "#C4A98A", name: "Maya", text: "Crushing it today 💪", time: "9:42", type: "msg", read: false },
  { id: 6, pactId: "p2", user: "system", text: "Yesterday", time: "", type: "date" },
  { id: 7, pactId: "p2", user: "me", text: "Just shipped the home tab", time: "17:20", type: "msg", read: true },
];
