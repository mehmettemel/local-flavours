-- Remove unused columns from database and handle view dependencies

-- 1. Handle collection_details view dependency
-- Drop the view first
DROP VIEW IF EXISTS public.collection_details;

-- 2. Handle user_profiles view dependency
-- Drop the view first
DROP VIEW IF EXISTS public.user_profiles;

-- 3. Drop the columns
-- Remove curator_note from collection_places
ALTER TABLE public.collection_places
DROP COLUMN IF EXISTS curator_note;

-- Remove tags from collections
ALTER TABLE public.collections
DROP COLUMN IF EXISTS tags;

-- Remove trust_score from users
ALTER TABLE public.users
DROP COLUMN IF EXISTS trust_score;

-- 4. Recreate collection_details view without tags
CREATE OR REPLACE VIEW public.collection_details WITH (security_invoker = on) AS
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
  -- tags removed
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
LEFT JOIN locations l ON c.location_id = l.id
JOIN categories cat ON c.category_id = cat.id
LEFT JOIN categories subcat ON c.subcategory_id = subcat.id
LEFT JOIN collection_places cp ON c.id = cp.collection_id
GROUP BY c.id, u.username, l.names, cat.names, subcat.names;

GRANT SELECT ON public.collection_details TO anon, authenticated;

-- 5. Recreate user_profiles view without trust_score
CREATE OR REPLACE VIEW public.user_profiles WITH (security_invoker = on) AS
SELECT
  u.id,
  u.username,
  -- trust_score removed
  u.role,
  u.email_verified,
  u.followers_count,
  u.following_count,
  u.collections_count,
  u.reputation_score,
  u.created_at,
  u.updated_at,
  au.email,
  au.email_confirmed_at,
  au.last_sign_in_at,
  au.created_at as auth_created_at
FROM public.users u
LEFT JOIN auth.users au ON u.id = au.id;

GRANT SELECT ON public.user_profiles TO authenticated;
