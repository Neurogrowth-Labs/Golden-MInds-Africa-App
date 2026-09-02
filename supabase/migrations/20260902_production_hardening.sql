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

create unique index if not exists subscribers_email_unique on public.subscribers (lower(email));

create or replace function public.normalize_subscriber_email()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.email := lower(trim(new.email));
  return new;
end;
$$;
drop trigger if exists normalize_subscriber_email on public.subscribers;
create trigger normalize_subscriber_email
  before insert or update of email on public.subscribers
  for each row execute procedure public.normalize_subscriber_email();

-- Rebuild RLS policies so deployment does not retain insecure policies from an
-- older schema revision.
alter table public.profiles enable row level security;
alter table public.debates enable row level security;
alter table public.attendance enable row level security;
alter table public.posts enable row level security;
alter table public.likes enable row level security;
alter table public.ai_notes enable row level security;
alter table public.subscribers enable row level security;

do $$
declare
  table_name text;
  policy_name text;
begin
  foreach table_name in array array['profiles', 'debates', 'attendance', 'posts', 'likes', 'ai_notes', 'subscribers']
  loop
    for policy_name in
      select policyname from pg_policies where schemaname = 'public' and tablename = table_name
    loop
      execute format('drop policy if exists %I on public.%I', policy_name, table_name);
    end loop;
  end loop;
end $$;

create policy profiles_read on public.profiles for select to authenticated using (true);
create policy profiles_insert_self on public.profiles for insert to authenticated
  with check (id = auth.uid() and role = 'student');
create policy profiles_update_self on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select p.role from public.profiles p where p.id = auth.uid()));
create policy profiles_admin_manage on public.profiles for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy debates_read on public.debates for select to authenticated using (true);
create policy debates_admin_manage on public.debates for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy attendance_read_own_or_admin on public.attendance for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy attendance_insert_own on public.attendance for insert to authenticated
  with check (user_id = auth.uid());
create policy attendance_admin_manage on public.attendance for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy posts_read on public.posts for select to authenticated using (true);
create policy posts_insert_own on public.posts for insert to authenticated with check (author_id = auth.uid());
create policy posts_update_own on public.posts for update to authenticated
  using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy posts_delete_own on public.posts for delete to authenticated using (author_id = auth.uid());
create policy posts_admin_manage on public.posts for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy likes_read on public.likes for select to authenticated using (true);
create policy likes_insert_own on public.likes for insert to authenticated with check (user_id = auth.uid());
create policy likes_delete_own on public.likes for delete to authenticated using (user_id = auth.uid());

create policy ai_notes_own on public.ai_notes for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy subscribers_insert on public.subscribers for insert to anon, authenticated with check (true);

-- Public avatars are readable, but uploads/deletes are restricted to the owner
-- and must use an image MIME type in a key prefixed by the user UUID.
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
on conflict (id) do update set public = excluded.public;
do $$
declare policy_name text;
begin
  for policy_name in select policyname from pg_policies where schemaname = 'storage' and tablename = 'objects' loop
    if policy_name in ('avatars_insert_own', 'avatars_update_own', 'avatars_delete_own') then
      execute format('drop policy if exists %I on storage.objects', policy_name);
    end if;
  end loop;
end $$;
create policy avatars_insert_own on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and name like auth.uid()::text || '-%'
    and coalesce(metadata ->> 'mimetype', '') like 'image/%'
  );
create policy avatars_update_own on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and owner_id = auth.uid())
  with check (bucket_id = 'avatars' and owner_id = auth.uid());
create policy avatars_delete_own on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and owner_id = auth.uid());

commit;
