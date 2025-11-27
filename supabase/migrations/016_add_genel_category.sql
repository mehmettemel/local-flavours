-- Migration: Add "Genel" (General) category for multi-category collections
-- This allows collections to contain places from multiple categories
-- Date: 2024-11-27

-- Add "Genel" category with special display order (-1) to show at top
INSERT INTO categories (slug, names, icon, display_order, created_at)
VALUES (
  'genel',
  '{"en": "General", "tr": "Genel", "description_en": "Collections with places from multiple categories", "description_tr": "Birden fazla kategoriden mekanlar içeren koleksiyonlar"}',
  'Globe',
  -1,
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- Add comment to explain the purpose
COMMENT ON TABLE categories IS 'Categories for places and collections. Special "genel" category (display_order=-1) is for multi-category collections.';

-- Note: collections.location_id is already nullable (from migration 011)
-- This allows collections to be "Genel" (all cities)
-- No additional changes needed for city/location "Genel" functionality
