# Nouri - Claude Code Implementation Brief

> Parallel build of the Nudgr structure under the Nouri brand. If Nouri is a
> meaningfully different app (e.g. nutrition / wellness focus instead of
> productivity / accountability), tell Claude Code which features to swap before
> starting. Otherwise this brief produces a Nouri-branded Nudgr clone.

## What You're Building

Nouri is a Progressive Web App (PWA) deployed to **app.<DOMAIN>.com** so it works in any browser (desktop + mobile) and can be installed to a phone's home screen.

## Tech Stack

* Next.js 16+ (App Router)
* React 19+
* Tailwind CSS v4
* TypeScript
* localStorage for data persistence (no backend for MVP)
* PWA via `@ducanh2912/next-pwa`

Reference: see `/Users/kimberleybueno/Nudgr/PWA_PLAYBOOK.md` for stack pinning, gotchas, and the deploy sequence that proved out on Nudgr. Follow it.

## Brand Constants

```
Brand Name: Nouri
Domain: <DOMAIN>.com   ← TODO: fill in actual domain
App URL:  app.<DOMAIN>.com
Handle: @<HANDLE>      ← TODO: pick a social handle
Tagline: <ONE LINE>    ← TODO: pick a tagline (Nudgr's was "Nudge your goals. Nudge your people. Keep going.")

Colors (keeping Nudgr palette by default — adjust if Nouri has its own identity):
  sage: #7A9E7E (primary)
  dark: #4A6B4E (dark primary)
  light: #E8F0E9
  bg: #F4F8F4 (page background)
  white: #FFFFFF
  charcoal: #2D2D2D (text)
  muted: #97B099
  faint: #D4E2D5 (borders)
  warm: #C4A98A (accent)
  gold: #C5A33E (streaks/highlights)
  urgent: #D4845A (warnings/overdue)

Typography: System fonts (-apple-system, SF Pro Display, sans-serif)
Logo mark: "✦" character in sage gradient rounded square
         (swap glyph if Nouri has a different mark)
```

## Project Setup

```bash
npx --yes create-next-app@latest nouri \
  --typescript --tailwind --app --src-dir --use-npm \
  --no-eslint --turbopack --import-alias "@/*" --yes
cd nouri
npm install @ducanh2912/next-pwa
npm install --save-dev sharp
```

### next.config.ts

```typescript
import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: { skipWaiting: true },
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  turbopack: { root: __dirname },
};

export default withPWA(nextConfig);
```

### package.json scripts — MUST include `--webpack`

```json
"scripts": {
  "dev": "next dev",
  "build": "next build --webpack",
  "start": "next start",
  "icons": "node scripts/generate-icons.mjs"
}
```

### public/manifest.json

```json
{
  "name": "Nouri",
  "short_name": "Nouri",
  "description": "<ONE LINE DESCRIPTION>",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#F4F8F4",
  "theme_color": "#4A6B4E",
  "orientation": "portrait-primary",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-192-maskable.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### Layout metadata (src/app/layout.tsx)

In Next 14+, `themeColor` lives in a separate `viewport` export:

```typescript
export const viewport: Viewport = {
  themeColor: "#4A6B4E",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Nouri",
  description: "<ONE LINE DESCRIPTION>",
  manifest: "/manifest.json",
  applicationName: "Nouri",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Nouri",
  },
  openGraph: {
    title: "Nouri",
    description: "<TAGLINE>",
    url: "https://app.<DOMAIN>.com",
    siteName: "Nouri",
    type: "website",
  },
};
```

### Generate PWA icons

Create `scripts/generate-icons.mjs` that uses `sharp` to rasterize an SVG into PNGs at sizes 72, 96, 128, 144, 152, 192, 384, 512, plus apple-touch-icon (180×180), plus 192/512 maskable variants. All icons: the brand glyph on a `linear-gradient(165deg, #4A6B4E, #7A9E7E)` rounded square. Maskable variants need ~10% safe-zone padding. Run via `npm run icons`.

## App Architecture

### Data Model (localStorage)

```typescript
interface Todo {
  id: string;
  text: string;
  done: boolean;
  added: string;       // ISO date string
  priority: boolean;
  overdue: boolean;
}

interface Goal {
  id: string;
  title: string;
  emoji: string;
  type: "daily" | "weekly" | "monthly" | "longterm";
  deadline: string;
  streak: number;
  muted: boolean;
  linkedTo: string | null;
  partner: { name: string; ini: string; col: string } | null;
  today: { t: string; done: boolean }[];
  allTasks: { t: string; done: boolean; due?: string }[];
}

interface Pact {
  id: string;
  name: string;
  emoji: string;
  owner: string;
  members: { ini: string; col: string; name: string }[];
  unread: number;
  last: string;
  time: string;
  pinned: boolean;
  sharedGoals: { title: string; emoji: string; progress: number }[];
}

interface Message {
  id: number;
  pactId: string;
  user: string;
  text: string;
  time: string;
  type: "msg" | "system" | "checkin" | "goal_created" | "meeting" | "date";
  read?: boolean;
  ini?: string;
  col?: string;
  name?: string;
}

const STORAGE_KEYS = {
  todos: "nouri_todos",
  goals: "nouri_goals",
  pacts: "nouri_pacts",
  messages: "nouri_messages",
  userName: "nouri_user_name",
  onboarded: "nouri_onboarded",
};
```

### Page Structure

```
app/
  layout.tsx          - Root layout with metadata, PWA manifest link
  page.tsx            - Main app shell with tab navigation
  globals.css         - Tailwind imports + custom animations

components/
  Shell.tsx           - Main app container (responsive layout switcher)
  BottomNav.tsx       - Mobile bottom tab bar (Home, Pacts, +, Circle, Profile)
  SideNav.tsx         - Desktop sidebar navigation
  HomeTab.tsx         - Hero stats, quick-add todo, calendar, goals
  PactsTab.tsx        - Pact list + Pact chat
  CircleTab.tsx       - Accountability partners + nudge
  ProfileTab.tsx      - User settings, weekly summary, invite
  GoalDetail.tsx      - Expanded goal view
  Overlay.tsx         - Reusable bottom sheet / modal
  CreateGoal.tsx      - Goal creation form
  Celebration.tsx     - All-tasks-done overlay
  WeeklySummary.tsx   - Stats + partner comparison
  InviteFriends.tsx   - Invite link + contacts list

hooks/
  useBreakpoint.ts    - Returns { isMobile, isTablet, isDesktop }
  useLocalStorage.ts  - Typed localStorage hook with SSR safety
```

### Responsive Layout

```
Mobile (< 640px):    Bottom 5-tab navigation. Single column. Primary experience.
Tablet (640-1024px): Same bottom tabs. Two-column goals grid.
Desktop (> 1024px):  Left sidebar (72px wide) replaces bottom tabs.
                     Overlays become right-side panels (max 440px).
                     Goal grid 2-3 columns.
```

## Features (verbatim from Nudgr — replace anything Nouri does differently)

### Home Tab

1. **Hero card** — gradient (linear-gradient 165deg, dark → sage → muted). Greeting, date, 3 stat pills (today %, streak, tasks). Buttons: 📊 weekly summary, 💌 invite.
2. **Quick-add todo strip** — input + sage `+` button. Up to 4 pending todos with circular checkboxes. Overdue = ⚠️ + orange border. Priority = ⭐.
3. **Interactive monthly calendar** — month/year arrows, horizontal-scroll date row, selected day in sage.
4. **Today's tasks** — cards with circular checkboxes. When ALL done → celebration overlay (confetti, streak, share-to-pact).
5. **This Week** (collapsible) — goal cards with progress %.
6. **This Month** (collapsible) — goals with inline progress bars.
7. **Long Term** (collapsible) — lavender/purple gradient cards with milestone bars + linked goals count.

### Pacts Tab

1. **Pact list** — emoji, name, last message, member avatars (overlapping circles), unread badge, group goals with mini progress bars. Long-press to pin (pinned = green gradient + 📌).
2. **Pact chat** — date separators, gradient-green bubbles for "me" + white for others, ✓✓ read receipts, system messages for streaks/milestones. Top ⚡ action bar with: schedule meeting, create goal from chat, trigger check-in. Check-in = 4 buttons: "Doing amazing! 🔥", "On track ✅", "Missed today 😔", "Might miss my goal 😬".

### Key Overlays

1. **Create Goal** — emoji picker, title, type pills (daily/weekly/monthly/longterm, color-coded), deadline, optional partner, optional long-term link.
2. **Partner Request** — "Request sent!" confirmation, pending state, simulate-accept button (for demo).
3. **Celebration** — confetti, streak, weekly %, share-to-pact button.
4. **Check-In Prompt** — emoji/title + 4 response options. Posts system message to chat.
5. **Weekly Summary** — gradient card with stats + partner comparison percentages.
6. **Invite Friends** — personal invite link (`app.<DOMAIN>.com/invite/[username]`) with copy/share + contacts list with invite buttons.
7. **Assign Partner** — friends/contacts list, tap to select, flows into Partner Request.

### Animations

```css
@keyframes up        { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
@keyframes confetti  { 0% { opacity: 1; transform: translateY(0) scale(1); } 100% { opacity: 0; transform: translateY(-20px) scale(1.5); } }
```

Use `animation: up 0.25s ease` on tab transitions. Stagger list items: `animation: up 0.2s ease ${i * 0.06}s both`.

## Deployment (parallels Nudgr exactly)

1. Push to GitHub repo `kimberleybueno/Nouri`
2. Import into Vercel under team **bueno-consulting**
3. Vercel auto-detects Next.js, deploys in ~90s, gives a `<name>.vercel.app` URL
4. Add custom domain `app.<DOMAIN>.com` in Vercel project settings
5. In SiteGround DNS Zone Editor (where `<DOMAIN>.com` is hosted): add CNAME record, Name `app`, Points to `cname.vercel-dns.com`
6. Wait 5–30 min. Vercel auto-issues SSL.
7. Verify PWA on Android Chrome: three-dot menu → "Install app"

## What NOT to build for v1

* No backend / auth (localStorage only)
* No push notifications
* No real-time chat (messages are local state)
* No Capacitor / native wrapper
* No dark mode

## Priority order

1. PWA manifest + service worker + icons
2. Home tab with todos + calendar + goals
3. Create Goal flow
4. Goal Detail + partner assignment
5. Pact list + chat
6. Circle tab with nudge
7. Profile tab
8. Responsive desktop layout
9. Celebration / check-in / weekly summary overlays
10. Deploy to app.<DOMAIN>.com via Vercel

## TODO before handing this to Claude Code

- [ ] Replace `<DOMAIN>` with the actual Nouri domain (e.g. `mynouri.com`)
- [ ] Replace `<HANDLE>` with the social handle
- [ ] Replace `<TAGLINE>` and `<ONE LINE DESCRIPTION>`
- [ ] Decide: keep sage palette, or pick a Nouri-specific one? (If nourishment-themed, maybe warmer — peach/cream/sage. Tell Claude Code what to use.)
- [ ] Decide: same productivity/accountability features as Nudgr, or different? If different, list what Nouri's tabs/features should be instead.
