# Setting up Supabase (permanent, synced storage)

By default GlowIQ stores each person's data in their own phone's browser. That
works, but the data only lives on that one device. Connecting Supabase gives you
a free cloud database so **every person's photos, products, scores and reports
are saved forever and show up on any device** they open the link on.

It takes about 5 minutes and is free for a family-sized app.

---

## Step 1 — Create a project

1. Go to [supabase.com](https://supabase.com) and sign up (free).
2. Click **New project**. Give it a name like `glowiq`, set a database password
   (save it somewhere — you won't need it for the app), pick the region closest
   to you, and create it.
3. Wait ~1 minute for it to finish provisioning.

## Step 2 — Create the tables

1. In the project, open **SQL Editor** (left sidebar) → **New query**.
2. Open the file [`supabase/schema.sql`](supabase/schema.sql) from this repo,
   copy its entire contents, paste into the editor, and click **Run**.
3. You should see "Success". This creates the `logs`, `products`, and `reports`
   tables and turns on Row Level Security.

## Step 3 — Get your two keys

1. Open **Project Settings** (gear icon) → **API**.
2. Copy these two values:
   - **Project URL** → looks like `https://abcd1234.supabase.co`
   - **anon public** key (under "Project API keys") → a long `eyJ...` string

## Step 4 — Add them to the app

**Local development** — put them in your `.env` file:

```
VITE_SUPABASE_URL=https://abcd1234.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your-anon-key...
```

Then restart the dev server (`npm run dev`).

**On Vercel** — add the same two as Environment Variables (Settings →
Environment Variables), for Production, Preview, and Development, then redeploy.
See [`DEPLOY.md`](DEPLOY.md).

## Step 5 — Confirm it works

Open the app, log a photo, then open it on a *different* device (or an incognito
window) with the same link and same profile. The log should appear there too.
If it does, the cloud database is live.

---

## Is it safe?

Yes, for a private family app. The `anon` key is *meant* to be public — it ships
in the browser. What actually protects your data is **Row Level Security (RLS)**,
which `schema.sql` enables. The policies allow anyone with the link to read and
write, which is appropriate here because **the link itself is the secret** and
only your family has it. There is no login to forget and no password to manage.

If you ever wanted stronger isolation (e.g. each person can only see their own
data), you'd add Supabase Auth and scope the policies to `auth.uid()` — but
that's overkill for three people who trust each other.

## What about cost?

Free. Supabase's free tier includes 500 MB of database storage. Photos are
compressed to ~800px before saving, so even with daily photos for three people
for a year you'll use a small fraction of that.

## No Supabase? It still works

If `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are left blank, GlowIQ quietly
falls back to per-device `localStorage` — the app runs fine, the data just
doesn't sync across devices. Add the keys whenever you're ready.
