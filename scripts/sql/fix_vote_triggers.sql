-- Fix Vote Triggers Script
-- This script updates trigger functions to use SECURITY DEFINER so they can bypass RLS policies.

-- 1. Fix update_collection_votes
CREATE OR REPLACE FUNCTION update_collection_votes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE collections SET
      vote_count = vote_count - 1,
      vote_score = vote_score - (OLD.value * OLD.weight),
      updated_at = NOW()
    WHERE id = OLD.collection_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE collections SET
      vote_score = vote_score - (OLD.value * OLD.weight) + (NEW.value * NEW.weight),
      updated_at = NOW()
    WHERE id = NEW.collection_id;
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    UPDATE collections SET
      vote_count = vote_count + 1,
      vote_score = vote_score + (NEW.value * NEW.weight),
      updated_at = NOW()
    WHERE id = NEW.collection_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Fix propagate_collection_votes_to_places
CREATE OR REPLACE FUNCTION propagate_collection_votes_to_places()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Add vote score to all places in the collection
    UPDATE places p
    SET
      vote_score = vote_score + (NEW.value * NEW.weight),
      vote_count = vote_count + 1,
      updated_at = NOW()
    FROM collection_places cp
    WHERE cp.collection_id = NEW.collection_id
      AND cp.place_id = p.id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Update vote score for all places in the collection
    UPDATE places p
    SET
      vote_score = vote_score - (OLD.value * OLD.weight) + (NEW.value * NEW.weight),
      updated_at = NOW()
    FROM collection_places cp
    WHERE cp.collection_id = NEW.collection_id
      AND cp.place_id = p.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Remove vote score from all places in the collection
    UPDATE places p
    SET
      vote_score = vote_score - (OLD.value * OLD.weight),
      vote_count = GREATEST(vote_count - 1, 0),
      updated_at = NOW()
    FROM collection_places cp
    WHERE cp.collection_id = OLD.collection_id
      AND cp.place_id = p.id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Fix update_place_votes (from 001_initial_schema.sql)
CREATE OR REPLACE FUNCTION update_place_votes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE places SET
      vote_count = vote_count - 1,
      vote_score = vote_score - (OLD.value * OLD.weight),
      updated_at = NOW()
    WHERE id = OLD.place_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE places SET
      vote_score = vote_score - (OLD.value * OLD.weight) + (NEW.value * NEW.weight),
      updated_at = NOW()
    WHERE id = NEW.place_id;
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    UPDATE places SET
      vote_count = vote_count + 1,
      vote_score = vote_score + (NEW.value * NEW.weight),
      updated_at = NOW()
    WHERE id = NEW.place_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  RAISE NOTICE 'Vote triggers updated to SECURITY DEFINER.';
END $$;
