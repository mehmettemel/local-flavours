-- Simplify Collections Schema
-- Remove location_id and descriptions to make collection creation simpler
-- Collections will now only have: name (required) and category_id (required)

-- Drop the foreign key constraint on location_id first
ALTER TABLE collections DROP CONSTRAINT IF EXISTS collections_location_id_fkey;

-- Make location_id nullable (we'll keep the column for existing data, but it's optional now)
ALTER TABLE collections ALTER COLUMN location_id DROP NOT NULL;

-- Make descriptions optional (already is, but being explicit)
-- Descriptions are already nullable in the schema

-- Update the collection_details view
DROP VIEW IF EXISTS collection_details;

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
LEFT JOIN locations l ON c.location_id = l.id  -- Changed to LEFT JOIN since location is now optional
JOIN categories cat ON c.category_id = cat.id
LEFT JOIN categories subcat ON c.subcategory_id = subcat.id
LEFT JOIN collection_places cp ON c.id = cp.collection_id
GROUP BY c.id, u.username, l.names, cat.names, subcat.names;

-- Update RLS policies to reflect optional location
-- No changes needed for policies, they still work with nullable location_id

COMMENT ON COLUMN collections.location_id IS 'Optional - City/location reference. Can be null for collections without specific location';
COMMENT ON COLUMN collections.descriptions IS 'Optional - Collection description in multiple languages';
