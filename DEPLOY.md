# Deploying GlowIQ to Vercel

GlowIQ is a Vite + React app with two serverless functions (`/api/analyze` and
`/api/weekly`) that call Claude. Vercel runs both the static site and the
functions automatically — you just need to point it at this folder and set one
environment variable.

---

## What you need first

- A free [Vercel account](https://vercel.com/signup)
- Your Anthropic API key (the one in your local `.env`)
- The `glowiq` folder pushed to a Git repo (GitHub/GitLab/Bitbucket), **or** the
  Vercel CLI installed (`npm i -g vercel`)

> ⚠️ Never commit your real key. `.env` is already in `.gitignore`. On Vercel the
> key lives as an environment variable, not in the code.

---

## Option A — Deploy from a Git repo (recommended)

1. **Push the project** to a new GitHub repo (only the `glowiq` folder).
2. Go to **vercel.com → Add New → Project** and import that repo.
3. Vercel auto-detects the framework as **Vite**. Leave the defaults:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`
4. Open **Environment Variables** and add:

   | Name                     | Value                          | Environments            |
   | ------------------------ | ------------------------------ | ----------------------- |
   | `ANTHROPIC_API_KEY`      | `sk-ant-...` (your real key)    | Production, Preview, Dev |
   | `VITE_SUPABASE_URL`      | `https://xxxx.supabase.co`      | Production, Preview, Dev |
   | `VITE_SUPABASE_ANON_KEY` | `eyJ...` (anon public key)      | Production, Preview, Dev |

   > The two `VITE_SUPABASE_*` values come from [`SUPABASE.md`](SUPABASE.md). Set
   > them up there first so everyone's data syncs across devices. If you skip
   > them, the app still works but data stays per-device (localStorage).

5. Click **Deploy**. After ~1 minute you'll get a live URL like
   `https://glowiq.vercel.app`.

---

## Option B — Deploy with the Vercel CLI

```bash
cd glowiq
vercel            # first run links/creates the project, follow the prompts
vercel env add ANTHROPIC_API_KEY    # paste your key, choose all environments
vercel --prod     # deploy to production
```

---

## After deploying

- **Set the key, then redeploy.** If you add `ANTHROPIC_API_KEY` after the first
  deploy, trigger a fresh deploy so the functions pick it up.
- **Test it:** open the URL on your phone, pick a profile, log a photo, and tap
  **Analyse My Skin Today ✨**. If you see a report card, the function + key work.
- **If analysis fails with a key error:** the env var isn't set or the project
  wasn't redeployed after adding it. Check **Settings → Environment Variables**.

---

## How the pieces map to Vercel

| File              | Role on Vercel                                                |
| ----------------- | ------------------------------------------------------------ |
| `api/analyze.js`  | Serverless function → `POST /api/analyze` (daily skin read)   |
| `api/weekly.js`   | Serverless function → `POST /api/weekly` (weekly report)      |
| `vercel.json`     | SPA rewrite for client routing — **excludes `/api/`** so the functions still run |
| `dist/` (build)   | The static React app Vercel serves                           |

The API key is read **only** server-side via `process.env.ANTHROPIC_API_KEY`. It
is never bundled into the browser, so anyone with your link cannot see or use it.

---

## Important notes for the family

- **Data syncs across devices (with Supabase).** Once you've set the
  `VITE_SUPABASE_*` keys (see [`SUPABASE.md`](SUPABASE.md)), each person's
  photos, products, and scores live in a free cloud database and appear on any
  device they open the link on. Without those keys, GlowIQ falls back to
  per-device `localStorage` (namespaced `glowiq_<name>_`) and history only
  appears on the same phone + browser it was logged on.
- **Cost.** Each analysis is ~$0.03 on Opus (a few dollars a month for all
  three). To halve it, change `MODEL` in `api/analyze.js` and `api/weekly.js`
  from `claude-opus-4-7` to `claude-sonnet-4-20250514` and redeploy.
- **Rotating the key.** If you ever need to change the key: update it in Vercel's
  Environment Variables, update your local `.env`, and redeploy.

---

## Local development reminder

```bash
npm install
npm run dev      # http://localhost:5177
```

Locally, the dev server emulates the two `/api` functions (see `vite.config.js`)
and reads your key from `.env`. Restart the dev server after changing `.env`.
