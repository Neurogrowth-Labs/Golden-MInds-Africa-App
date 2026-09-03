-- Golden Minds Africa production hardening migration
-- Apply with the Supabase CLI or SQL editor as the database owner.
-- This migration is idempotent and does not drop application data.

begin;

create extension if not exists pgcrypto;

-- Use a JWT app_metadata role as the server-authoritative privileged role. Do not
-- derive authorization from a mutable browser session or a profile supplied by a user.
create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

-- Keep profiles in sync with auth.users. The function deliberately assigns only
-- the least-privileged role; role elevation must be performed by a trusted server
-- using Supabase Auth admin APIs (which update app_metadata).
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), 'Student'),
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'avatar_url'), ''), ''),
    'student'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.handle_new_auth_user() from public;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();

alter table public.profiles
  alter column full_name set not null,
  alter column full_name set default 'Student';
alter table public.profiles
  drop constraint if exists profiles_full_name_length,
alter table public.attendance
  drop constraint if exists attendance_coordinates_valid,
  add constraint attendance_coordinates_valid check (
    (latitude is null and longitude is null) or
    (latitude between -90 and 90 and longitude between -180 and 180)

-- Prevent duplicate check-ins for the same session. This index is intentionally
-- created only after validating the production data has no duplicates.
create unique index if not exists attendance_one_checkin_per_session
  on public.attendance (session_id, user_id);

create index if not exists idx_posts_type_created_at
  on public.posts (type, created_at desc);
create index if not exists idx_ai_notes_user_created_at
  on public.ai_notes (user_id, created_at desc);

-- Subscriber writes are public, reads remain denied. Normalize email before the
-- unique constraint is evaluated so case variants cannot create duplicate records.
create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  subscribed_at timestamptz not null default now()
);
alter table public.subscribers
  drop constraint if exists subscribers_email_format,
  add constraint subscribers_email_format check (
    char_length(email) <= 320 and
    email ~ '^[A-Za-z0-9.!#$%&''*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$'