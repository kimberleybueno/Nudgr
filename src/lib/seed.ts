import type { Todo, Goal, Pact, Message } from "@/types";

const today = () => new Date().toISOString().slice(0, 10);
const inDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

export const SEED_TODOS: Todo[] = [
  { id: "t1", text: "Reply to Sara's email", done: false, added: today(), priority: true, overdue: false },
  { id: "t2", text: "Buy oat milk", done: false, added: today(), priority: false, overdue: false },
  { id: "t3", text: "Schedule dentist", done: false, added: inDays(-3), priority: false, overdue: true },
];

export const SEED_GOALS: Goal[] = [
  {
    id: "g1",
    title: "Run 5k three times a week",
    emoji: "🏃‍♀️",
    type: "weekly",
    deadline: inDays(3),
    streak: 4,
    muted: false,
    linkedTo: "g4",
    partner: { name: "Maya", ini: "M", col: "#C4A98A" },
    today: [
      { t: "Morning run (3k)", done: true },
      { t: "Stretch 10 min", done: false },
    ],
    allTasks: [
      { t: "Morning run (3k)", done: true, due: today() },
      { t: "Stretch 10 min", done: false, due: today() },
      { t: "Long run Saturday", done: false, due: inDays(2) },
    ],
  },
  {
    id: "g2",
    title: "Read 20 mins before bed",
    emoji: "📖",
    type: "daily",
    deadline: today(),
    streak: 12,
    muted: false,
    linkedTo: null,
    partner: null,
    today: [{ t: "Read 20 min", done: false }],
    allTasks: [{ t: "Read 20 min", done: false, due: today() }],
  },
  {
    id: "g3",
    title: "Launch Nudgr beta",
    emoji: "🚀",
    type: "monthly",
    deadline: inDays(18),
    streak: 0,
    muted: false,
    linkedTo: "g4",
    partner: { name: "Jordan", ini: "J", col: "#7A9E7E" },
    today: [],
    allTasks: [
      { t: "Finalize onboarding copy", done: true, due: inDays(-2) },
      { t: "Set up analytics", done: false, due: inDays(5) },
      { t: "Invite 20 beta users", done: false, due: inDays(10) },
    ],
  },
  {
    id: "g4",
    title: "Build a healthier daily rhythm",
    emoji: "🌱",
    type: "longterm",
    deadline: inDays(120),
    streak: 0,
    muted: false,
    linkedTo: null,
    partner: null,
    today: [],
    allTasks: [
      { t: "Establish morning routine", done: true },
      { t: "Move daily", done: false },
      { t: "Sleep 7+ hrs", done: false },
    ],
  },
];

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
