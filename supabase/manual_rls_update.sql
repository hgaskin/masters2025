-- Manual RLS Setup for Masters2025
-- This script enables Row Level Security for tables and creates policies
-- for the Clerk-Supabase integration

-- ======== STEP 1: ENSURE HELPER FUNCTIONS EXIST ========

-- Make sure requesting_user_id function exists and is correct
create or replace function public.requesting_user_id()
returns text
language sql
security definer
set search_path = ''
as $$
  select nullif(
    current_setting('request.jwt.claims', true)::json->>'sub',
    ''
  )::text;
$$;

comment on function public.requesting_user_id() is 
  'Extracts the Clerk user ID (sub claim) from the JWT token in the request';

-- Create current_user_id function to get UUID from users table
create or replace function public.current_user_id()
returns uuid
language sql
security definer
set search_path = ''
as $$
  select id from public.users where clerk_id = public.requesting_user_id();
$$;

comment on function public.current_user_id() is
  'Returns the UUID from the users table that corresponds to the requesting Clerk user';

-- ======== STEP 2: ENTRIES TABLE UPDATES ========

-- Add locked column to entries table if it doesn't exist
do $$ 
begin
  if not exists (select from information_schema.columns 
                where table_schema = 'public' 
                and table_name = 'entries' 
                and column_name = 'locked') then
    alter table public.entries add column locked boolean default false;
    
    comment on column public.entries.locked is 
      'Indicates whether the entry is locked for editing (e.g., after tournament start)';
  end if;
end $$;

-- ======== STEP 3: ENABLE RLS ON TABLES ========

-- Enable RLS on key tables (will do nothing if already enabled)
alter table public.entries enable row level security;
alter table public.picks enable row level security;
alter table public.pools enable row level security;
alter table public.pool_rules enable row level security;
alter table public.tournament_golfers enable row level security;
alter table public.tournament_scores enable row level security;
alter table public.golfer_groups enable row level security;
alter table public.golfer_group_assignments enable row level security;
alter table public.tournaments enable row level security;
alter table public.golfers enable row level security;

-- ======== STEP 4: ENTRIES TABLE RLS POLICIES ========

-- Drop existing policies to avoid conflicts
drop policy if exists "authenticated users can view own entries" on public.entries;
drop policy if exists "authenticated users can create own entries" on public.entries;
drop policy if exists "authenticated users can update own entries" on public.entries;
drop policy if exists "authenticated users can delete own entries" on public.entries;

-- Recreate entries policies
create policy "authenticated users can view own entries"
  on public.entries
  for select
  to authenticated
  using (user_id = public.current_user_id());

create policy "authenticated users can create own entries"
  on public.entries
  for insert
  to authenticated
  with check (user_id = public.current_user_id());

create policy "authenticated users can update own entries"
  on public.entries
  for update
  to authenticated
  using (
    user_id = public.current_user_id() and
    (locked = false or locked is null)
  );

create policy "authenticated users can delete own entries"
  on public.entries
  for delete
  to authenticated
  using (
    user_id = public.current_user_id() and
    (locked = false or locked is null)
  );

-- ======== STEP 5: PICKS TABLE RLS POLICIES ========

-- Drop existing policies to avoid conflicts
drop policy if exists "authenticated users can view own picks" on public.picks;
drop policy if exists "authenticated users can create own picks" on public.picks;
drop policy if exists "authenticated users can update own picks" on public.picks;
drop policy if exists "authenticated users can delete own picks" on public.picks;

-- Recreate picks policies
create policy "authenticated users can view own picks"
  on public.picks
  for select
  to authenticated
  using (exists (
    select 1 from public.entries
    where entries.id = picks.entry_id
    and entries.user_id = public.current_user_id()
  ));

create policy "authenticated users can create own picks"
  on public.picks
  for insert
  to authenticated
  with check (exists (
    select 1 from public.entries
    where entries.id = picks.entry_id
    and entries.user_id = public.current_user_id()
    and (entries.locked = false or entries.locked is null)
  ));

create policy "authenticated users can update own picks"
  on public.picks
  for update
  to authenticated
  using (exists (
    select 1 from public.entries
    where entries.id = picks.entry_id
    and entries.user_id = public.current_user_id()
    and (entries.locked = false or entries.locked is null)
  ));

create policy "authenticated users can delete own picks"
  on public.picks
  for delete
  to authenticated
  using (exists (
    select 1 from public.entries
    where entries.id = picks.entry_id
    and entries.user_id = public.current_user_id()
    and (entries.locked = false or entries.locked is null)
  ));

-- ======== STEP 6: POOLS TABLE RLS POLICIES ========

-- Drop existing policies to avoid conflicts
drop policy if exists "anonymous users can view pools" on public.pools;
drop policy if exists "authenticated users can view pools" on public.pools;
drop policy if exists "authenticated pool owners can update pools" on public.pools;
drop policy if exists "authenticated pool owners can delete pools" on public.pools;

-- Recreate pools policies
create policy "anonymous users can view pools"
  on public.pools
  for select
  to anon
  using (true);

create policy "authenticated users can view pools"
  on public.pools
  for select
  to authenticated
  using (true);

-- Updated to use admin_id instead of owner_id
create policy "authenticated pool admins can update pools"
  on public.pools
  for update
  to authenticated
  using (admin_id = public.current_user_id());

-- Updated to use admin_id instead of owner_id
create policy "authenticated pool admins can delete pools"
  on public.pools
  for delete
  to authenticated
  using (admin_id = public.current_user_id());

-- ======== STEP 7: POOL RULES TABLE RLS POLICIES ========

-- Drop existing policies to avoid conflicts
drop policy if exists "anonymous users can view pool rules" on public.pool_rules;
drop policy if exists "authenticated users can view pool rules" on public.pool_rules;
drop policy if exists "authenticated pool owners can update pool rules" on public.pool_rules;

-- Recreate pool rules policies
create policy "anonymous users can view pool rules"
  on public.pool_rules
  for select
  to anon
  using (true);

create policy "authenticated users can view pool rules"
  on public.pool_rules
  for select
  to authenticated
  using (true);

-- Updated to use admin_id instead of owner_id
create policy "authenticated pool admins can update pool rules"
  on public.pool_rules
  for update
  to authenticated
  using (exists (
    select 1 from public.pools
    where pools.id = pool_rules.pool_id
    and pools.admin_id = public.current_user_id()
  ));

-- ======== STEP 8: PUBLIC REFERENCE DATA RLS POLICIES ========

-- Drop existing policies before recreating
drop policy if exists "anonymous users can view tournament_golfers" on public.tournament_golfers;
drop policy if exists "authenticated users can view tournament_golfers" on public.tournament_golfers;
drop policy if exists "anonymous users can view tournament_scores" on public.tournament_scores;
drop policy if exists "authenticated users can view tournament_scores" on public.tournament_scores;
drop policy if exists "anonymous users can view golfer_groups" on public.golfer_groups;
drop policy if exists "authenticated users can view golfer_groups" on public.golfer_groups;
drop policy if exists "anonymous users can view golfer_group_assignments" on public.golfer_group_assignments;
drop policy if exists "authenticated users can view golfer_group_assignments" on public.golfer_group_assignments;
drop policy if exists "anonymous users can view tournaments" on public.tournaments;
drop policy if exists "authenticated users can view tournaments" on public.tournaments;
drop policy if exists "anonymous users can view golfers" on public.golfers;
drop policy if exists "authenticated users can view golfers" on public.golfers;

-- Create public data policies
create policy "anonymous users can view tournament_golfers"
  on public.tournament_golfers
  for select
  to anon
  using (true);

create policy "authenticated users can view tournament_golfers"
  on public.tournament_golfers
  for select
  to authenticated
  using (true);

create policy "anonymous users can view tournament_scores"
  on public.tournament_scores
  for select
  to anon
  using (true);

create policy "authenticated users can view tournament_scores"
  on public.tournament_scores
  for select
  to authenticated
  using (true);

create policy "anonymous users can view golfer_groups"
  on public.golfer_groups
  for select
  to anon
  using (true);

create policy "authenticated users can view golfer_groups"
  on public.golfer_groups
  for select
  to authenticated
  using (true);

create policy "anonymous users can view golfer_group_assignments"
  on public.golfer_group_assignments
  for select
  to anon
  using (true);

create policy "authenticated users can view golfer_group_assignments"
  on public.golfer_group_assignments
  for select
  to authenticated
  using (true);

create policy "anonymous users can view tournaments"
  on public.tournaments
  for select
  to anon
  using (true);

create policy "authenticated users can view tournaments"
  on public.tournaments
  for select
  to authenticated
  using (true);

create policy "anonymous users can view golfers"
  on public.golfers
  for select
  to anon
  using (true);

create policy "authenticated users can view golfers"
  on public.golfers
  for select
  to authenticated
  using (true); 