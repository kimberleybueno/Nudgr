# Build Nouri — Instructions for Claude Code

You are building a PWA called **Nouri**. It is functionally identical to Nudgr (an existing working app at `/Users/kimberleybueno/Nudgr`) — same stack, same features, same component structure, same data model. Only the brand name, storage keys, and domain differ.

Do not re-derive the architecture. Crib from the Nudgr code.

---

## Read these first (in order)

1. **`/Users/kimberleybueno/Nudgr/PWA_PLAYBOOK.md`** — stack pins, gotchas, deploy sequence. Follow it exactly.
2. **`/Users/kimberleybueno/Nudgr/src/`** — the working reference implementation. Components, hooks, types, lib are all in there. Copy the patterns.
3. **`/Users/kimberleybueno/Nudgr/package.json`** and **`next.config.ts`** — these are the proven config. Reproduce them.

---

## Ask the user before starting

1. **Domain** — Nudgr is at `mynudgr.com`. What's Nouri's domain? (e.g. `mynouri.com`?) The app will live at `app.<domain>.com`.
2. **Tagline & description** — Nudgr's was *"Nudge your goals. Nudge your people. Keep going."* What's Nouri's?
3. **Color palette** — Nudgr uses a sage green palette. Keep it for Nouri, or pick a different one?
4. **Logo glyph** — Nudgr uses `✦`. Keep it or use a different character/SVG?
5. **GitHub repo name** — default `kimberleybueno/Nouri`?

Don't proceed without answers. Defaults are fine if she says "use the same as Nudgr."

---

## Stack (locked — same as Nudgr)

- Next.js 16+ with App Router, src directory
- TypeScript
- Tailwind CSS v4
- `@ducanh2912/next-pwa` for service worker
- `sharp` (dev dep) for icon generation
- `localStorage` only — no backend
- Hosting: Vercel team `bueno-consulting`, deployed at `app.<domain>.com`
- Apex `<domain>.com` stays on SiteGround for marketing — only the `app` subdomain CNAMEs to Vercel

---

## Execution sequence

1. Scaffold: `npx --yes create-next-app@latest nouri --typescript --tailwind --app --src-dir --use-npm --no-eslint --turbopack --import-alias "@/*" --yes`
2. `cd nouri && npm install @ducanh2912/next-pwa && npm install --save-dev sharp`
3. Write `next.config.ts` exactly like Nudgr's (with `turbopack: { root: __dirname }`)
4. **Change `package.json` build script to `next build --webpack`** — Next 16 defaults to Turbopack which breaks next-pwa silently
5. Add the next-pwa generated-files block to `.gitignore` (see Nudgr's `.gitignore`)
6. Create `public/manifest.json` with `name: "Nouri"`, the chosen `theme_color`, all icon entries
7. Create `src/app/layout.tsx` mirroring Nudgr's — `applicationName: "Nouri"`, `appleWebApp.title: "Nouri"`, openGraph URL `https://app.<domain>.com`
8. Create `src/app/globals.css` with the chosen palette (default = copy Nudgr's)
9. Create `src/types/index.ts`, `src/lib/colors.ts`, `src/lib/storage.ts`, `src/lib/seed.ts`, `src/hooks/useLocalStorage.ts`, `src/hooks/useBreakpoint.ts` — same shapes as Nudgr but rename all storage keys: `nudgr_todos` → `nouri_todos`, etc.
10. Create the components: `Shell`, `BottomNav`, `SideNav`, `Overlay`, `HomeTab`, `PactsTab`, `CircleTab`, `ProfileTab`, `CreateGoal`, `GoalDetail`, `Celebration`, `WeeklySummary`, `InviteFriends`. Copy from Nudgr, swap any "Nudgr" string for "Nouri".
11. Create `scripts/generate-icons.mjs` mirroring Nudgr's, with the chosen glyph + palette. Run `npm run icons`.
12. `npm run build` — must compile with no errors and emit `public/sw.js`
13. `npm start` — verify `localhost:3000` shows Nouri (not Nudgr) end-to-end

---

## Deploy

1. Initialize git (create-next-app may have done this already), commit, push to `kimberleybueno/Nouri` on GitHub
2. Tell the user to open <https://vercel.com/new>, select the **bueno-consulting** team, import `kimberleybueno/Nouri`, deploy
3. After deploy succeeds, tell the user to add `app.<domain>.com` in Vercel project Settings → Domains, then add the matching CNAME in their domain registrar (SiteGround DNS Zone Editor) — Name `app`, Points to `cname.vercel-dns.com`
4. Wait ~10 min, verify <https://app.<domain>.com> serves Nouri with HTTPS
5. Verify PWA install works on Android Chrome (three-dot menu → Install app)

---

## Features to ship (identical to Nudgr's MVP)

Five-tab bottom nav (mobile) / left sidebar (desktop): **Home**, **Pacts**, center `+` create button, **Circle**, **Profile**.

- **Home** — gradient hero with greeting + stats (today %, streak, tasks); quick-add todo strip; interactive monthly calendar; today's tasks with celebration overlay when all done; collapsible This Week / This Month / Long Term sections.
- **Create Goal** — emoji picker, title, type pills (daily/weekly/monthly/longterm), deadline, optional partner, optional link-to-longterm.
- **Goal Detail** — task list with checkboxes, partner assign flow with simulate-accept confirmation.
- **Pacts** — list with long-press-to-pin; pact chat with date separators, gradient bubbles for self, ✓✓ read receipts, ⚡ action bar for schedule-meeting/create-goal/check-in (check-in = 4 response buttons).
- **Circle** — partners aggregated from goals & pacts, shared goal progress, nudge button.
- **Profile** — editable name, stats card, settings rows, weekly summary overlay, invite friends overlay, reset-all-data.
- **Overlays** — Celebration (confetti + share to pact), WeeklySummary (user vs partner percentages), InviteFriends (personal invite link + contacts).

Responsive: under 640px use bottom tabs + bottom-sheet overlays; ≥1024px use 72px-wide sidebar + right-side-panel overlays.

---

## What NOT to build (same exclusions as Nudgr v1)

- No backend, no auth — localStorage only
- No push notifications
- No real-time chat (messages are local state)
- No Capacitor / native wrapper
- No dark mode

---

## Done criteria

- [ ] `npm run build` exits zero, `public/sw.js` exists
- [ ] `localhost:3000` shows "Nouri" everywhere (no leftover "Nudgr" strings — grep the codebase)
- [ ] Manifest has `name: "Nouri"`, theme color matches the chosen palette
- [ ] All localStorage keys start with `nouri_`
- [ ] Deployed to Vercel under bueno-consulting team, accessible at the `.vercel.app` URL
- [ ] User has installed it on their Android phone from Chrome
- [ ] (Optional, can come later) `app.<domain>.com` resolves to the Vercel deploy with HTTPS
