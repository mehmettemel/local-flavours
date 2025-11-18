-- Collections Migration
-- This migration adds the collections system to enable user-curated lists

-- Create collection status enum
CREATE TYPE collection_status AS ENUM ('active', 'archived', 'flagged');

-- Collections table
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(200) UNIQUE NOT NULL,
  names JSONB NOT NULL, -- {"en": "Mehmet's Adana Kebab Guide", "tr": "Mehmet'in Adana Kebap Rehberi"}
  descriptions JSONB, -- {"en": "My favorite kebab places...", "tr": "En sevdiğim kebapçılar..."}
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  subcategory_id UUID REFERENCES categories(id) ON DELETE SET NULL, -- Optional subcategory
  status collection_status DEFAULT 'active',
  vote_count INTEGER DEFAULT 0,
  vote_score INTEGER DEFAULT 0, -- Sum of weighted votes
  tags TEXT[], -- Array of tags like ['budget-friendly', 'romantic', 'late-night']
  is_featured BOOLEAN DEFAULT FALSE, -- Featured collections by admins
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_collections_creator_id ON collections(creator_id);
CREATE INDEX idx_collections_location_id ON collections(location_id);
CREATE INDEX idx_collections_category_id ON collections(category_id);
CREATE INDEX idx_collections_status ON collections(status);
CREATE INDEX idx_collections_vote_score ON collections(vote_score DESC) WHERE status = 'active';
CREATE INDEX idx_collections_slug ON collections(slug);

-- Collection places (junction table for many-to-many relationship)
CREATE TABLE collection_places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0, -- Order within the collection
  curator_note TEXT, -- Optional note from curator about why this place is in the collection
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(collection_id, place_id)
);

CREATE INDEX idx_collection_places_collection_id ON collection_places(collection_id);
CREATE INDEX idx_collection_places_place_id ON collection_places(place_id);
CREATE INDEX idx_collection_places_display_order ON collection_places(collection_id, display_order);

-- Collection votes table
CREATE TABLE collection_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  value SMALLINT NOT NULL CHECK (value IN (-1, 1)), -- -1 for downvote, 1 for upvote
  weight DECIMAL(3, 2) DEFAULT 1.0 CHECK (weight >= 0.1 AND weight <= 1.0), -- Vote weight based on account age
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, collection_id)
);

CREATE INDEX idx_collection_votes_user_id ON collection_votes(user_id);
CREATE INDEX idx_collection_votes_collection_id ON collection_votes(collection_id);
CREATE INDEX idx_collection_votes_created_at ON collection_votes(created_at);

-- User follows (for following curators)
CREATE TABLE user_follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id) -- Users can't follow themselves
);

CREATE INDEX idx_user_follows_follower_id ON user_follows(follower_id);
CREATE INDEX idx_user_follows_following_id ON user_follows(following_id);

-- Function to update collection vote weight (reuse vote weight calculation)
CREATE OR REPLACE FUNCTION update_collection_vote_weight()
RETURNS TRIGGER AS $$
DECLARE
  user_created_at TIMESTAMPTZ;
BEGIN
  SELECT created_at INTO user_created_at FROM users WHERE id = NEW.user_id;
  NEW.weight := calculate_vote_weight(user_created_at);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set collection vote weight on insert/update
CREATE TRIGGER set_collection_vote_weight
BEFORE INSERT OR UPDATE ON collection_votes
FOR EACH ROW
EXECUTE FUNCTION update_collection_vote_weight();

-- Function to update collection vote statistics
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
$$ LANGUAGE plpgsql;

-- Trigger to update collection votes
CREATE TRIGGER update_collection_vote_stats
AFTER INSERT OR UPDATE OR DELETE ON collection_votes
FOR EACH ROW
EXECUTE FUNCTION update_collection_votes();

-- Function to propagate collection votes to places
-- When a collection is voted on, all places in that collection should receive weighted votes
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
$$ LANGUAGE plpgsql;

-- Trigger to propagate collection votes to places
CREATE TRIGGER propagate_collection_votes
AFTER INSERT OR UPDATE OR DELETE ON collection_votes
FOR EACH ROW
EXECUTE FUNCTION propagate_collection_votes_to_places();

-- Update places when they are added/removed from collections
CREATE OR REPLACE FUNCTION update_place_collection_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- When a place is added to a collection, update its collection count
    UPDATE places
    SET updated_at = NOW()
    WHERE id = NEW.place_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- When a place is removed from a collection, update its collection count
    UPDATE places
    SET updated_at = NOW()
    WHERE id = OLD.place_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger for place collection count
CREATE TRIGGER update_place_on_collection_change
AFTER INSERT OR DELETE ON collection_places
FOR EACH ROW
EXECUTE FUNCTION update_place_collection_count();

-- Trigger for updated_at on collections
CREATE TRIGGER update_collections_updated_at
BEFORE UPDATE ON collections
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Trigger for updated_at on collection_votes
CREATE TRIGGER update_collection_votes_updated_at
BEFORE UPDATE ON collection_votes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Row Level Security (RLS) Policies for Collections

-- Enable RLS
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- Collections policies
CREATE POLICY "Anyone can view active collections" ON collections
  FOR SELECT USING (status = 'active' OR auth.uid() = creator_id);

CREATE POLICY "Authenticated users can create collections" ON collections
  FOR INSERT WITH CHECK (auth.uid() = creator_id AND status = 'active');

CREATE POLICY "Users can update own collections" ON collections
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete own collections" ON collections
  FOR DELETE USING (auth.uid() = creator_id);

CREATE POLICY "Admins can update any collection" ON collections
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
  );

-- Collection places policies
CREATE POLICY "Anyone can view collection places" ON collection_places
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM collections c
      WHERE c.id = collection_id
      AND (c.status = 'active' OR c.creator_id = auth.uid())
    )
  );

CREATE POLICY "Collection creators can manage their collection places" ON collection_places
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM collections c
      WHERE c.id = collection_id
      AND c.creator_id = auth.uid()
    )
  );

-- Collection votes policies
CREATE POLICY "Users can view own collection votes" ON collection_votes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can vote on collections" ON collection_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own collection votes" ON collection_votes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own collection votes" ON collection_votes
  FOR DELETE USING (auth.uid() = user_id);

-- User follows policies
CREATE POLICY "Anyone can view follows" ON user_follows
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own follows" ON user_follows
  FOR ALL USING (auth.uid() = follower_id);

-- Add columns to users table for collection-related stats (if not already added in 001_initial_schema.sql)
-- These columns are now in 001_initial_schema.sql, but kept here for backward compatibility
ALTER TABLE users ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS collections_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reputation_score INTEGER DEFAULT 0;

-- Function to update user follow counts
CREATE OR REPLACE FUNCTION update_user_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment follower count for the user being followed
    UPDATE users SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
    -- Increment following count for the follower
    UPDATE users SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement follower count
    UPDATE users SET followers_count = GREATEST(followers_count - 1, 0) WHERE id = OLD.following_id;
    -- Decrement following count
    UPDATE users SET following_count = GREATEST(following_count - 1, 0) WHERE id = OLD.follower_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger for follow counts
CREATE TRIGGER update_follow_counts
AFTER INSERT OR DELETE ON user_follows
FOR EACH ROW
EXECUTE FUNCTION update_user_follow_counts();

-- Function to update user collection counts
CREATE OR REPLACE FUNCTION update_user_collection_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE users SET collections_count = collections_count + 1 WHERE id = NEW.creator_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE users SET collections_count = GREATEST(collections_count - 1, 0) WHERE id = OLD.creator_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger for collection counts
CREATE TRIGGER update_user_collections_count
AFTER INSERT OR DELETE ON collections
FOR EACH ROW
EXECUTE FUNCTION update_user_collection_count();

-- Create view for collection details with aggregated data
CREATE OR REPLACE VIEW collection_details AS
SELECT
  c.id,
  c.slug,
  c.names,
  c.descriptions,
  c.creator_id,
  c.location_id,
  c.category_id,
  c.subcategory_id,
  c.status,
  c.vote_count,
  c.vote_score,
  c.tags,
  c.is_featured,
  c.created_at,
  c.updated_at,
  u.username AS creator_username,
  l.names AS location_names,
  cat.names AS category_names,
  subcat.names AS subcategory_names,
  COUNT(cp.place_id) AS places_count
FROM collections c
JOIN users u ON c.creator_id = u.id
JOIN locations l ON c.location_id = l.id
JOIN categories cat ON c.category_id = cat.id
LEFT JOIN categories subcat ON c.subcategory_id = subcat.id
LEFT JOIN collection_places cp ON c.id = cp.collection_id
GROUP BY c.id, u.username, l.names, cat.names, subcat.names;
