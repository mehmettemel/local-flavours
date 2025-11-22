-- Add Google Place ID to places table
-- This enables perfect duplicate detection using Google's unique place identifiers

-- Add google_place_id column to places table
ALTER TABLE places ADD COLUMN IF NOT EXISTS google_place_id TEXT UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_places_google_place_id ON places(google_place_id) WHERE google_place_id IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN places.google_place_id IS 'Unique identifier from Google Places API. Used for duplicate detection and data enrichment.';

-- Optional: Add columns for rich Google data
ALTER TABLE places ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE places ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE places ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE places ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
ALTER TABLE places ADD COLUMN IF NOT EXISTS rating DECIMAL(2, 1);
ALTER TABLE places ADD COLUMN IF NOT EXISTS user_ratings_total INTEGER;
ALTER TABLE places ADD COLUMN IF NOT EXISTS price_level INTEGER;
ALTER TABLE places ADD COLUMN IF NOT EXISTS opening_hours JSONB;

-- Add indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_places_latitude_longitude ON places(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_places_rating ON places(rating DESC) WHERE rating IS NOT NULL;

-- Add comments
COMMENT ON COLUMN places.phone_number IS 'Phone number from Google Places API';
COMMENT ON COLUMN places.website IS 'Website URL from Google Places API';
COMMENT ON COLUMN places.latitude IS 'Latitude coordinate from Google Places API';
COMMENT ON COLUMN places.longitude IS 'Longitude coordinate from Google Places API';
COMMENT ON COLUMN places.rating IS 'Average rating from Google (0-5 scale)';
COMMENT ON COLUMN places.user_ratings_total IS 'Total number of ratings from Google';
COMMENT ON COLUMN places.price_level IS 'Price level from Google (0-4 scale)';
COMMENT ON COLUMN places.opening_hours IS 'Opening hours data from Google Places API in JSON format';
