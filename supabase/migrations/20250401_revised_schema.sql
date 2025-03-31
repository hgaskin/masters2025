-- Revised Schema Migration for Masters 2025 Application
-- This implements the comprehensive database schema with all necessary tables and relationships

-- ======== STEP 1: CHECK IF EXTENSION IS ENABLED ========
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ======== STEP 2: MODIFY EXISTING TABLES ========

-- Check if golfers table exists before modifying
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'golfers') THEN
    -- Modify golfers table - remove fields that will move to tournament_golfers
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'golfers' AND column_name = 'rank') THEN
      ALTER TABLE golfers DROP COLUMN rank;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'golfers' AND column_name = 'odds') THEN
      ALTER TABLE golfers DROP COLUMN odds;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'golfers' AND column_name = 'status') THEN
      ALTER TABLE golfers DROP COLUMN status;
    END IF;
  END IF;
END $$;

-- Check if tournaments table exists before modifying
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tournaments') THEN
    -- Update tournaments table schema if needed
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tournaments' AND column_name = 'year') THEN
      ALTER TABLE tournaments ADD COLUMN year INTEGER NOT NULL DEFAULT DATE_PART('year', CURRENT_DATE);
    END IF;
    
    -- Alter column constraints if they exist and are NOT NULL
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tournaments' AND column_name = 'course' AND is_nullable = 'NO') THEN
      ALTER TABLE tournaments ALTER COLUMN course DROP NOT NULL;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tournaments' AND column_name = 'location' AND is_nullable = 'NO') THEN
      ALTER TABLE tournaments ALTER COLUMN location DROP NOT NULL;
    END IF;
  END IF;
END $$;

-- Check if pools table exists before modifying
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pools') THEN
    -- Modify pools table to link to tournaments if column doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'pools' AND column_name = 'tournament_id') THEN
      ALTER TABLE pools ADD COLUMN tournament_id UUID REFERENCES tournaments(id);
    END IF;
  END IF;
END $$;

-- ======== STEP 3: CREATE NEW TABLES IF THEY DON'T EXIST ========

-- Create tournament_golfers table for tournament-specific golfer data
CREATE TABLE IF NOT EXISTS tournament_golfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL,
    golfer_id UUID NOT NULL,
    odds NUMERIC,
    tournament_rank INTEGER,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Add foreign key constraints if the referenced tables exist
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tournaments') AND 
     EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'golfers') THEN
    
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints 
                  WHERE constraint_name = 'fk_tournament_golfers_tournament' AND table_name = 'tournament_golfers') THEN
      ALTER TABLE tournament_golfers 
          ADD CONSTRAINT fk_tournament_golfers_tournament 
          FOREIGN KEY (tournament_id) REFERENCES tournaments(id);
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints 
                  WHERE constraint_name = 'fk_tournament_golfers_golfer' AND table_name = 'tournament_golfers') THEN
      ALTER TABLE tournament_golfers 
          ADD CONSTRAINT fk_tournament_golfers_golfer 
          FOREIGN KEY (golfer_id) REFERENCES golfers(id);
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints 
                  WHERE constraint_name = 'tournament_golfers_tournament_golfer_key' AND table_name = 'tournament_golfers') THEN
      ALTER TABLE tournament_golfers 
          ADD CONSTRAINT tournament_golfers_tournament_golfer_key 
          UNIQUE (tournament_id, golfer_id);
    END IF;
  END IF;
END $$;

-- Create or replace tournament_scores table
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tournament_scores') THEN
    -- Drop the existing table but only if we have golfers and tournaments tables
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'golfers') AND
       EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tournaments') THEN
      DROP TABLE tournament_scores CASCADE;
    END IF;
  END IF;
END $$;

-- Create new tournament_scores table
CREATE TABLE IF NOT EXISTS tournament_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    golfer_id UUID NOT NULL,
    tournament_id UUID NOT NULL,
    round INTEGER NOT NULL,
    score INTEGER NOT NULL,
    thru INTEGER,
    r1_score INTEGER,
    r2_score INTEGER,
    r3_score INTEGER,
    r4_score INTEGER,
    today_score INTEGER,
    position TEXT,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Add foreign key constraints if referenced tables exist
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tournaments') AND 
     EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'golfers') THEN
    
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints 
                  WHERE constraint_name = 'fk_tournament_scores_tournament' AND table_name = 'tournament_scores') THEN
      ALTER TABLE tournament_scores 
          ADD CONSTRAINT fk_tournament_scores_tournament 
          FOREIGN KEY (tournament_id) REFERENCES tournaments(id);
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints 
                  WHERE constraint_name = 'fk_tournament_scores_golfer' AND table_name = 'tournament_scores') THEN
      ALTER TABLE tournament_scores 
          ADD CONSTRAINT fk_tournament_scores_golfer 
          FOREIGN KEY (golfer_id) REFERENCES golfers(id);
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints 
                  WHERE constraint_name = 'tournament_scores_golfer_tournament_round_key' AND table_name = 'tournament_scores') THEN
      ALTER TABLE tournament_scores 
          ADD CONSTRAINT tournament_scores_golfer_tournament_round_key
          UNIQUE (golfer_id, tournament_id, round);
    END IF;
  END IF;
END $$;

-- Create pool rules table
CREATE TABLE IF NOT EXISTS pool_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pool_id UUID NOT NULL,
    golfers_required INTEGER NOT NULL,
    max_picks_per_group INTEGER,
    groups_required INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Add foreign key if pools table exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pools') THEN
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints 
                  WHERE constraint_name = 'fk_pool_rules_pool' AND table_name = 'pool_rules') THEN
      ALTER TABLE pool_rules 
          ADD CONSTRAINT fk_pool_rules_pool 
          FOREIGN KEY (pool_id) REFERENCES pools(id);
    END IF;
  END IF;
END $$;

-- Create golfer groups table for tiered selection
CREATE TABLE IF NOT EXISTS golfer_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Add foreign key if tournaments table exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tournaments') THEN
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints 
                  WHERE constraint_name = 'fk_golfer_groups_tournament' AND table_name = 'golfer_groups') THEN
      ALTER TABLE golfer_groups 
          ADD CONSTRAINT fk_golfer_groups_tournament 
          FOREIGN KEY (tournament_id) REFERENCES tournaments(id);
    END IF;
  END IF;
END $$;

-- Create golfer group assignments table
CREATE TABLE IF NOT EXISTS golfer_group_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL,
    golfer_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add foreign keys if referenced tables exist
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'golfer_groups') AND 
     EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'golfers') THEN
    
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints 
                  WHERE constraint_name = 'fk_golfer_assignments_group' AND table_name = 'golfer_group_assignments') THEN
      ALTER TABLE golfer_group_assignments 
          ADD CONSTRAINT fk_golfer_assignments_group 
          FOREIGN KEY (group_id) REFERENCES golfer_groups(id);
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints 
                  WHERE constraint_name = 'fk_golfer_assignments_golfer' AND table_name = 'golfer_group_assignments') THEN
      ALTER TABLE golfer_group_assignments 
          ADD CONSTRAINT fk_golfer_assignments_golfer 
          FOREIGN KEY (golfer_id) REFERENCES golfers(id);
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints 
                  WHERE constraint_name = 'golfer_group_assignments_group_golfer_key' AND table_name = 'golfer_group_assignments') THEN
      ALTER TABLE golfer_group_assignments 
          ADD CONSTRAINT golfer_group_assignments_group_golfer_key
          UNIQUE (group_id, golfer_id);
    END IF;
  END IF;
END $$;

-- Update picks table with additional fields if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'picks') THEN
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'picks' AND column_name = 'selection_order') THEN
      ALTER TABLE picks ADD COLUMN selection_order INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'picks' AND column_name = 'group_id') AND
       EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'golfer_groups') THEN
      ALTER TABLE picks ADD COLUMN group_id UUID REFERENCES golfer_groups(id);
    END IF;
  END IF;
END $$;

-- ======== STEP 4: CREATE INDEXES ========

-- Create indexes for performance optimization
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tournament_golfers') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tournament_golfers_tournament') THEN
      CREATE INDEX idx_tournament_golfers_tournament ON tournament_golfers(tournament_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tournament_golfers_golfer') THEN
      CREATE INDEX idx_tournament_golfers_golfer ON tournament_golfers(golfer_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tournament_golfers_combined') THEN
      CREATE INDEX idx_tournament_golfers_combined ON tournament_golfers(tournament_id, golfer_id);
    END IF;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tournament_scores') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tournament_scores_tournament') THEN
      CREATE INDEX idx_tournament_scores_tournament ON tournament_scores(tournament_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tournament_scores_golfer') THEN
      CREATE INDEX idx_tournament_scores_golfer ON tournament_scores(golfer_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tournament_scores_combined') THEN
      CREATE INDEX idx_tournament_scores_combined ON tournament_scores(tournament_id, golfer_id, round);
    END IF;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pools') AND 
     EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'pools' AND column_name = 'tournament_id') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_pools_tournament') THEN
      CREATE INDEX idx_pools_tournament ON pools(tournament_id);
    END IF;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'picks') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_picks_entry') THEN
      CREATE INDEX idx_picks_entry ON picks(entry_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_picks_golfer') THEN
      CREATE INDEX idx_picks_golfer ON picks(golfer_id);
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'picks' AND column_name = 'group_id') THEN
      IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_picks_group') THEN
        CREATE INDEX idx_picks_group ON picks(group_id);
      END IF;
    END IF;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'golfer_groups') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_golfer_groups_tournament') THEN
      CREATE INDEX idx_golfer_groups_tournament ON golfer_groups(tournament_id);
    END IF;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'golfer_group_assignments') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_golfer_assignments_group') THEN
      CREATE INDEX idx_golfer_assignments_group ON golfer_group_assignments(group_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_golfer_assignments_golfer') THEN
      CREATE INDEX idx_golfer_assignments_golfer ON golfer_group_assignments(golfer_id);
    END IF;
  END IF;
END $$;

-- ======== STEP 5: RLS POLICIES ========

-- Set up Row Level Security policies (can be customized further as needed)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tournament_golfers') THEN
    ALTER TABLE tournament_golfers ENABLE ROW LEVEL SECURITY;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'tournament_golfers' AND policyname = 'Public read access for tournament_golfers') THEN
      CREATE POLICY "Public read access for tournament_golfers" ON tournament_golfers FOR SELECT USING (true);
    END IF;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tournament_scores') THEN
    ALTER TABLE tournament_scores ENABLE ROW LEVEL SECURITY;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'tournament_scores' AND policyname = 'Public read access for tournament_scores') THEN
      CREATE POLICY "Public read access for tournament_scores" ON tournament_scores FOR SELECT USING (true);
    END IF;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'golfer_groups') THEN
    ALTER TABLE golfer_groups ENABLE ROW LEVEL SECURITY;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'golfer_groups' AND policyname = 'Public read access for golfer_groups') THEN
      CREATE POLICY "Public read access for golfer_groups" ON golfer_groups FOR SELECT USING (true);
    END IF;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'golfer_group_assignments') THEN
    ALTER TABLE golfer_group_assignments ENABLE ROW LEVEL SECURITY;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'golfer_group_assignments' AND policyname = 'Public read access for golfer_group_assignments') THEN
      CREATE POLICY "Public read access for golfer_group_assignments" ON golfer_group_assignments FOR SELECT USING (true);
    END IF;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pool_rules') THEN
    ALTER TABLE pool_rules ENABLE ROW LEVEL SECURITY;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'pool_rules' AND policyname = 'Public read access for pool_rules') THEN
      CREATE POLICY "Public read access for pool_rules" ON pool_rules FOR SELECT USING (true);
    END IF;
  END IF;
END $$;

-- ======== MIGRATION COMPLETE ======== 