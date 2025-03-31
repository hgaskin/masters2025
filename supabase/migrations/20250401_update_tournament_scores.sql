-- Update tournament_scores table to include all fields needed for leaderboard
ALTER TABLE tournament_scores
ADD COLUMN IF NOT EXISTS tournament_id UUID REFERENCES tournaments(id),
ADD COLUMN IF NOT EXISTS thru INTEGER,
ADD COLUMN IF NOT EXISTS r1_score INTEGER,
ADD COLUMN IF NOT EXISTS r2_score INTEGER,
ADD COLUMN IF NOT EXISTS r3_score INTEGER,
ADD COLUMN IF NOT EXISTS r4_score INTEGER,
ADD COLUMN IF NOT EXISTS today_score INTEGER,
ADD COLUMN IF NOT EXISTS position TEXT,
ADD COLUMN IF NOT EXISTS status TEXT;

-- Update golfers table to include status field for tracking cut/withdrawn status
ALTER TABLE golfers
ADD COLUMN IF NOT EXISTS status TEXT;

-- Add indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_tournament_scores_tournament_id ON tournament_scores(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_scores_golfer_tournament ON tournament_scores(golfer_id, tournament_id); 