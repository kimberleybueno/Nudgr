# Deploying Nudgr to app.mynudgr.com

You only do this once. After that, every `git push` redeploys automatically.

## What you have right now

- A working Next.js app in this folder
- A live local preview at <http://localhost:3000>
- A built-in PWA setup (manifest + service worker + icons)

## Where things will live

| Domain | Host | What's there |
|--------|------|--------------|
| `mynudgr.com` | SiteGround (unchanged) | Marketing site / landing page |
| `app.mynudgr.com` | Vercel | The Nudgr app you just built |

You don't touch SiteGround hosting at all — only the DNS to add one new record.

---

## Step 1 — Push the code to GitHub

1. Create a new empty repository at <https://github.com/new>
   - Name: `nudgr`
   - Private or public, your choice
   - **Don't** initialize with README, .gitignore, or license (we already have those)
2. Copy the repo URL it gives you (looks like `git@github.com:yourname/nudgr.git`)
3. In this folder, run:

```bash
git add -A
git commit -m "Initial Nudgr PWA"
git branch -M main
git remote add origin git@github.com:yourname/nudgr.git
git push -u origin main
```

If you don't have an SSH key set up, use the HTTPS URL instead (`https://github.com/yourname/nudgr.git`) and you'll be prompted for your GitHub username + a personal access token.

---

## Step 2 — Deploy to Vercel

1. Go to <https://vercel.com/signup> and sign in with your GitHub account
2. Click **Add New → Project**
3. Find your `nudgr` repository in the list and click **Import**
4. Framework Preset should auto-detect as **Next.js** — leave everything else default
5. Click **Deploy**

It takes about 60-90 seconds. When it's done you'll get a free URL like `nudgr-xxxx.vercel.app`. Open it on your phone — you should see Nudgr.

---

## Step 3 — Connect app.mynudgr.com

### In Vercel
1. Open your project → **Settings → Domains**
2. Type `app.mynudgr.com` and click **Add**
3. Vercel will show you a CNAME record to add — usually it's just `cname.vercel-dns.com`. Note this value.

### In SiteGround
1. Log in to SiteGround → **Websites** → your `mynudgr.com` site → **Site Tools**
2. Go to **Domain → DNS Zone Editor**
3. Click the **CNAME** tab → **Create New Record**
   - **Name:** `app`
   - **Hostname / Points to:** `cname.vercel-dns.com` (or whatever Vercel told you)
   - **TTL:** leave default
4. Save

### Wait
DNS propagation usually takes 5–30 minutes. Vercel will auto-issue an SSL certificate once it sees the CNAME. When the domain page in Vercel shows a green checkmark, you're done.

Open <https://app.mynudgr.com> — Nudgr should load with HTTPS.

---

## Step 4 — Verify the PWA works

On your **Android phone** in Chrome:
1. Open <https://app.mynudgr.com>
2. Three-dot menu → "Install app" (or "Add to Home Screen")
3. The Nudgr icon should appear on your home screen
4. Tap it — it opens full-screen, no browser chrome

On your **iPhone** in Safari:
1. Open <https://app.mynudgr.com>
2. Share button → "Add to Home Screen"
3. Tap the Nudgr icon — opens full-screen

### Lighthouse audit (optional sanity check)
Open Chrome on desktop → DevTools → Lighthouse tab → "Progressive Web App" → Analyze page load.
You should see green checks for: manifest, service worker, installable, themed, viewport.

---

## After this — making changes

Every time you (or me) change code:

```bash
git add -A
git commit -m "what you changed"
git push
```

Vercel sees the push and redeploys in ~60 seconds. No manual upload anywhere.

---

## If something goes wrong

- **Vercel build fails:** check the build log in Vercel dashboard — usually a missing dependency or a typo
- **app.mynudgr.com shows a SiteGround default page:** DNS hasn't propagated yet, wait 30 min and try again
- **PWA install option missing on phone:** open it via HTTPS (not HTTP), and make sure you're on Chrome (Android) or Safari (iOS)
- **Service worker not updating after a deploy:** uninstall the installed PWA and reinstall, or in DevTools → Application → Service Workers → Unregister

---

## What's not built yet (per the brief)

- Backend / auth (localStorage only for MVP)
- Push notifications
- Real-time chat (messages are local)
- Capacitor native wrapper for the Play Store

These come after the PWA is stable and you have real users using it.
