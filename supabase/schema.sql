-- Care Tower authoritative game snapshot.
-- Run this once in Supabase SQL Editor.
create table if not exists public.care_state (
  id text primary key,
  version bigint not null default 1,
  snapshot jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.care_state enable row level security;
revoke all on table public.care_state from anon, authenticated;

insert into public.care_state (id, version, snapshot)
values ('current-session', 1, '{}'::jsonb)
on conflict (id) do nothing;
