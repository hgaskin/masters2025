-- Schema Improvements Migration for Masters 2025 Application
-- This migration adds additional fields and improvements to the existing schema

-- ======== STEP 1: Add new fields to tournaments table ========
ALTER TABLE tournaments
ADD COLUMN IF NOT EXISTS purse NUMERIC,
ADD COLUMN IF NOT EXISTS par INTEGER,
ADD COLUMN IF NOT EXISTS rounds INTEGER DEFAULT 4;

-- ======== STEP 2: Update tournament_scores table with additional fields ========
ALTER TABLE tournament_scores
ADD COLUMN IF NOT EXISTS total_score INTEGER,
ADD COLUMN IF NOT EXISTS official_position TEXT;

-- ======== STEP 3: Enhance pools table with flexible configuration ========
ALTER TABLE pools
ADD COLUMN IF NOT EXISTS count_top_n_scores INTEGER DEFAULT 6,
ADD COLUMN IF NOT EXISTS entry_deadline TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS prize_distribution JSONB,
ADD COLUMN IF NOT EXISTS scoring_rules JSONB,
ADD COLUMN IF NOT EXISTS format TEXT DEFAULT 'standard';

-- ======== STEP 4: Add additional indexes for performance ========
-- Indexes for tournament_scores table for efficient score lookups
CREATE INDEX IF NOT EXISTS idx_tournament_scores_golfer ON tournament_scores(golfer_id);
CREATE INDEX IF NOT EXISTS idx_tournament_scores_tournament ON tournament_scores(tournament_id);

-- Indexes for pool and related queries
CREATE INDEX IF NOT EXISTS idx_pools_tournament ON pools(tournament_id);

-- Indexes for picks table for efficient team lookups
CREATE INDEX IF NOT EXISTS idx_picks_golfer ON picks(golfer_id);

-- Indexes for golfer groups
CREATE INDEX IF NOT EXISTS idx_golfer_groups_tournament ON golfer_groups(tournament_id);
CREATE INDEX IF NOT EXISTS idx_golfer_assignments_golfer ON golfer_group_assignments(golfer_id);

-- ======== STEP 5: Ensure proper constraints and data types for tournament_golfers ========
-- Update status field to ensure it has proper data types and constraints
DO $$ 
BEGIN
  -- Check if we need to modify the status field for validation
  IF EXISTS (SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'tournament_golfers' 
            AND column_name = 'status') THEN
    
    -- Add check constraint if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.constraint_column_usage 
                  WHERE table_schema = 'public' 
                  AND table_name = 'tournament_golfers' 
                  AND column_name = 'status' 
                  AND constraint_name = 'tournament_golfers_status_check') THEN
      
      ALTER TABLE tournament_golfers
      ADD CONSTRAINT tournament_golfers_status_check 
      CHECK (status IN ('active', 'cut', 'withdrawn', 'disqualified', 'injured'));
    END IF;
  END IF;
END $$; 