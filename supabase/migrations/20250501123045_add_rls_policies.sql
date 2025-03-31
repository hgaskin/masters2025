-- Migration: Add Row Level Security Policies for Masters2025 App
-- Description: Enables Row Level Security for user-related tables and creates policies 
-- based on Clerk user authentication. This ensures data is properly secured with the
-- new Clerk-Supabase integration.
-- Tables affected: users, entries, picks, pools, pool_rules, and all public reference tables
-- Author: Masters2025 Team
-- Date: 2025-05-01

-- ======== STEP 1: HELPER FUNCTIONS ========

-- Function to extract the Clerk user ID from the JWT token
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

-- Function to get the user's UUID from the users table based on Clerk ID
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

-- Enable RLS on entries table
alter table public.entries enable row level security;

-- Enable RLS on picks table
alter table public.picks enable row level security;

-- Enable RLS on pools table
alter table public.pools enable row level security;

-- Enable RLS on pool_rules table
alter table public.pool_rules enable row level security;

-- Enable RLS on reference tables
alter table public.tournament_golfers enable row level security;
alter table public.tournament_scores enable row level security;
alter table public.golfer_groups enable row level security;
alter table public.golfer_group_assignments enable row level security;
alter table public.tournaments enable row level security;
alter table public.golfers enable row level security;

-- ======== STEP 4: ENTRIES TABLE RLS POLICIES ========

-- Authenticated users can read their own entries
create policy "authenticated users can view own entries"
  on public.entries
  for select
  to authenticated
  using (user_id = public.current_user_id());

-- Authenticated users can create their own entries
create policy "authenticated users can create own entries"
  on public.entries
  for insert
  to authenticated
  with check (user_id = public.current_user_id());

-- Authenticated users can update their own entries (if not locked)
create policy "authenticated users can update own entries"
  on public.entries
  for update
  to authenticated
  using (
    user_id = public.current_user_id() and
    (locked = false or locked is null)
  );

-- Authenticated users can delete their own entries (if not locked)
create policy "authenticated users can delete own entries"
  on public.entries
  for delete
  to authenticated
  using (
    user_id = public.current_user_id() and
    (locked = false or locked is null)
  );

-- ======== STEP 5: PICKS TABLE RLS POLICIES ========

-- Authenticated users can view their own picks
create policy "authenticated users can view own picks"
  on public.picks
  for select
  to authenticated
  using (exists (
    select 1 from public.entries
    where entries.id = picks.entry_id
    and entries.user_id = public.current_user_id()
  ));

-- Authenticated users can create picks for their own entries (if not locked)
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

-- Authenticated users can update their own picks (if entries not locked)
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

-- Authenticated users can delete their own picks (if entries not locked)
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

-- Anonymous users can read pools (public listings)
create policy "anonymous users can view pools"
  on public.pools
  for select
  to anon
  using (true);

-- Authenticated users can read pools (public listings)
create policy "authenticated users can view pools"
  on public.pools
  for select
  to authenticated
  using (true);

-- Authenticated pool owners can update their own pools
create policy "authenticated pool owners can update pools"
  on public.pools
  for update
  to authenticated
  using (owner_id = public.current_user_id());

-- Authenticated pool owners can delete their own pools
create policy "authenticated pool owners can delete pools"
  on public.pools
  for delete
  to authenticated
  using (owner_id = public.current_user_id());

-- ======== STEP 7: POOL RULES TABLE RLS POLICIES ========

-- Anonymous users can read pool rules (public)
create policy "anonymous users can view pool rules"
  on public.pool_rules
  for select
  to anon
  using (true);

-- Authenticated users can read pool rules (public)
create policy "authenticated users can view pool rules"
  on public.pool_rules
  for select
  to authenticated
  using (true);

-- Authenticated pool owners can update their pool rules
create policy "authenticated pool owners can update pool rules"
  on public.pool_rules
  for update
  to authenticated
  using (exists (
    select 1 from public.pools
    where pools.id = pool_rules.pool_id
    and pools.owner_id = public.current_user_id()
  ));

-- ======== STEP 8: PUBLIC REFERENCE DATA RLS POLICIES ========
-- These tables are publicly readable but only updatable by service role

-- Drop existing policies before recreating for clean management
-- This isn't destructive to data, just replacing access policies
drop policy if exists "Public read access for tournament_golfers" on public.tournament_golfers;
drop policy if exists "Public read access for tournament_scores" on public.tournament_scores;
drop policy if exists "Public read access for golfer_groups" on public.golfer_groups;
drop policy if exists "Public read access for golfer_group_assignments" on public.golfer_group_assignments;

-- Tournament golfers public read policies
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

-- Tournament scores public read policies
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

-- Golfer groups public read policies
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

-- Golfer group assignments public read policies
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

-- Tournaments public read policies
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

-- Golfers public read policies
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