-- GlowIQ database schema.
-- Run this once in your Supabase project: Dashboard → SQL Editor → New query →
-- paste this whole file → Run. It is safe to re-run (uses IF NOT EXISTS).
--
-- Each table stores its full object in a `data` jsonb column so the app's data
-- shapes never change. Photos live as base64 strings inside the log's data.
-- A few columns are pulled out (profile, day, id, timestamps) purely so we can
-- filter and sort efficiently.

-- ---------------------------------------------------------------------------
-- Daily logs — one row per profile per day.
-- ---------------------------------------------------------------------------
create table if not exists public.logs (
  profile    text not null,
  day        text not null,
  data       jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (profile, day)
);

create index if not exists logs_profile_idx on public.logs (profile);

-- ---------------------------------------------------------------------------
-- Products — one row per product.
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id         text primary key,
  profile    text not null,
  added_at   timestamptz,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists products_profile_idx on public.products (profile);

-- ---------------------------------------------------------------------------
-- Weekly reports — one row per generated report.
-- ---------------------------------------------------------------------------
create table if not exists public.reports (
  id           text primary key,
  profile      text not null,
  generated_at timestamptz,
  data         jsonb not null
);

create index if not exists reports_profile_idx on public.reports (profile);

-- ---------------------------------------------------------------------------
-- Row Level Security.
-- This is a private family app with no login. The anon key is public (it ships
-- in the browser), so RLS is what actually guards the data. These permissive
-- policies allow anyone with the anon key to read/write — appropriate here
-- because the link itself is the secret and only family has it. If you ever
-- want stronger isolation, add Supabase Auth and scope policies to auth.uid().
-- ---------------------------------------------------------------------------
alter table public.logs     enable row level security;
alter table public.products enable row level security;
alter table public.reports  enable row level security;

drop policy if exists "anon full access" on public.logs;
create policy "anon full access" on public.logs
  for all to anon using (true) with check (true);

drop policy if exists "anon full access" on public.products;
create policy "anon full access" on public.products
  for all to anon using (true) with check (true);

drop policy if exists "anon full access" on public.reports;
create policy "anon full access" on public.reports
  for all to anon using (true) with check (true);
