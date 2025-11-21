-- Fix vote trigger to properly calculate vote_score and vote_count
-- This migration fixes the issue where vote_score was not updating correctly

-- First, recalculate all existing vote counts and scores
UPDATE places p SET
  vote_count = COALESCE((SELECT COUNT(*) FROM votes v WHERE v.place_id = p.id), 0),
  vote_score = COALESCE((SELECT SUM(v.value) FROM votes v WHERE v.place_id = p.id), 0);

-- Create or replace the trigger function with correct calculation
CREATE OR REPLACE FUNCTION update_place_votes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE places SET
      vote_count = COALESCE((SELECT COUNT(*) FROM votes WHERE place_id = OLD.place_id), 0),
      vote_score = COALESCE((SELECT SUM(value) FROM votes WHERE place_id = OLD.place_id), 0),
      updated_at = NOW()
    WHERE id = OLD.place_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE places SET
      vote_count = COALESCE((SELECT COUNT(*) FROM votes WHERE place_id = NEW.place_id), 0),
      vote_score = COALESCE((SELECT SUM(value) FROM votes WHERE place_id = NEW.place_id), 0),
      updated_at = NOW()
    WHERE id = NEW.place_id;
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    UPDATE places SET
      vote_count = COALESCE((SELECT COUNT(*) FROM votes WHERE place_id = NEW.place_id), 0),
      vote_score = COALESCE((SELECT SUM(value) FROM votes WHERE place_id = NEW.place_id), 0),
      updated_at = NOW()
    WHERE id = NEW.place_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS update_place_vote_stats ON votes;
CREATE TRIGGER update_place_vote_stats
AFTER INSERT OR UPDATE OR DELETE ON votes
FOR EACH ROW
EXECUTE FUNCTION update_place_votes();
