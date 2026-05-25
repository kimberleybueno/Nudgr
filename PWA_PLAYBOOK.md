# PWA Deployment Playbook

> Hand this to Claude Code at the start of a new PWA project (e.g. Waffling Abroad).
> It captures the exact stack + sequence + gotchas that got Nudgr from zero to a
> phone-installable app on a custom subdomain in under 2 hours.

## Tech stack (locked-in)

- **Next.js 16+** (App Router, src directory)
- **TypeScript**
- **Tailwind CSS v4**
- **@ducanh2912/next-pwa** for service worker + manifest
- **sharp** (dev dep) to generate PWA icons from a single SVG
- **localStorage** for MVP persistence (no backend)
- Hosting: **Vercel** for the app, **SiteGround** (or wherever) for the apex marketing domain
- App lives at a subdomain: `app.<domain>.com` via CNAME → `cname.vercel-dns.com`

## Project init

```bash
npx --yes create-next-app@latest <name> \
  --typescript --tailwind --app --src-dir --use-npm \
  --no-eslint --turbopack --import-alias "@/*" --yes
cd <name>
npm install @ducanh2912/next-pwa
npm install --save-dev sharp
```

**Gotcha — capital letters in folder name:** npm rejects package names with capitals. If the parent folder is `MyApp/`, scaffold into `myapp-tmp/` then move files up, OR scaffold elsewhere and rename. Don't fight create-next-app.

## next.config.ts

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
  turbopack: { root: __dirname },  // silence multi-lockfile warning
};

export default withPWA(nextConfig);
```

**Critical:** `package.json` build script MUST use `--webpack`:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build --webpack",
  "start": "next start",
  "icons": "node scripts/generate-icons.mjs"
}
```

next-pwa hooks into webpack to generate the service worker. Next 16 defaults to Turbopack for builds, which silently strips the service worker and breaks installability.

## Manifest (`public/manifest.json`)

Required keys: `name`, `short_name`, `start_url: "/"`, `display: "standalone"`, `theme_color`, `background_color`, plus an `icons` array with at minimum 192×192 and 512×512.

Include both `purpose: "any"` and `purpose: "maskable"` 192/512 icons — Android needs maskable for the adaptive home-screen icon.

## Layout metadata (`src/app/layout.tsx`)

In Next 14+, `themeColor` and `viewport` settings live in a separate `viewport` export, NOT in `metadata`:

```typescript
export const viewport: Viewport = {
  themeColor: "#<your color>",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "<App>",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "<App>" },
  icons: { /* favicon + apple-touch-icon */ },
};
```

## Icon generator

Write `scripts/generate-icons.mjs` that uses `sharp` to rasterize an inline SVG into PNGs at: 72, 96, 128, 144, 152, 192, 384, 512, plus 180 (apple-touch-icon), plus 192/512 maskable variants. Maskable variants need a ~10% solid-color safe-zone padding around the logo. Run via `npm run icons` and commit the PNGs.

## .gitignore additions

next-pwa generates these into `/public/` on every build — they must NOT be committed:

```
/public/sw.js
/public/sw.js.map
/public/workbox-*.js
/public/workbox-*.js.map
/public/swe-worker-*.js
/public/swe-worker-*.js.map
/public/fallback-*.js
/public/fallback-*.js.map
```

## Responsive shell

Build a `useBreakpoint()` hook returning `{ isMobile, isTablet, isDesktop }` from `window.innerWidth` (640/1024 thresholds). The shell uses bottom nav under 1024px, sidebar nav at/above. Overlays render as bottom sheets on mobile, right-side panels on desktop. SSR-safe `useLocalStorage<T>` hook for state persistence — hydrate after mount so server HTML matches.

## Deploy sequence

1. **GitHub:** create the repo on github.com (empty, no README), then:
   ```bash
   git remote add origin https://github.com/<user>/<Repo>.git
   git add -A
   GIT_AUTHOR_NAME="<Name>" GIT_AUTHOR_EMAIL="<email>" \
   GIT_COMMITTER_NAME="<Name>" GIT_COMMITTER_EMAIL="<email>" \
   git commit -m "Initial <App> PWA"
   git branch -M main
   git push -u origin main
   ```
   Using env vars avoids touching global git config.

2. **Vercel:** <https://vercel.com/new> → select the correct **team** (not personal account if you have one) → import the repo → Framework auto-detects Next.js → Deploy. ~90 seconds. You get `<repo>-<hash>.vercel.app`.

3. **Custom subdomain:**
   - Vercel project → Settings → Domains → add `app.<domain>.com` — copy the CNAME value it shows
   - Domain registrar (SiteGround, Cloudflare, etc.): DNS Zone Editor → CNAME record → Name `app`, Points to `cname.vercel-dns.com` (or whatever Vercel showed)
   - Wait 5–30 min. Vercel auto-issues SSL.

## Gotchas log (in order I hit them)

| What went wrong | Fix |
|---|---|
| `npm name can no longer contain capital letters` | Scaffold into a tmp subfolder, move files up |
| `next build` errored: "Turbopack with webpack config" | Add `--webpack` to the build script |
| Multi-lockfile warning ("workspace root may be wrong") | `turbopack: { root: __dirname }` in next.config |
| Vercel suggested `npx plugins add vercel/vercel-plugin` | Optional. Ignore unless you actively want the Vercel-aware coding-agent integration |
| Two Vercel projects auto-created from one repo | Delete the dupe in Vercel → project Settings → bottom → Delete Project |
| Service worker not registering in dev | Expected — next-pwa is `disable`d when `NODE_ENV === "development"`. Test PWA features with `npm run build && npm start` |

## What NOT to build for v1

- Backend / auth (start with localStorage)
- Push notifications
- Real-time anything (use local state)
- Capacitor wrapper (comes after PWA is stable + has real users)
- Dark mode (later)

## Verification checklist after deploy

- [ ] `<url>` returns 200 in browser
- [ ] `<url>/manifest.json` returns the manifest
- [ ] `<url>/sw.js` returns the service worker
- [ ] `<url>/icons/icon-192.png` returns the icon
- [ ] On Android Chrome: three-dot menu shows "Install app"
- [ ] After install: launches full-screen (no browser chrome) with your icon
- [ ] DevTools → Lighthouse → PWA audit: all green
