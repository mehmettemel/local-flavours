-- Fix security issues identified by Supabase Security Advisor

-- 1. Fix user_profiles view (Auth Users Exposed & Security Definer)
-- We drop and recreate it with SECURITY INVOKER to respect RLS policies
DROP VIEW IF EXISTS public.user_profiles;

CREATE OR REPLACE VIEW public.user_profiles WITH (security_invoker = on) AS
SELECT
  u.id,
  u.username,
  u.trust_score,
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

-- Grant access to authenticated users only (since it exposes email)
GRANT SELECT ON public.user_profiles TO authenticated;

-- 2. Fix collection_details view (Security Definer)
DROP VIEW IF EXISTS public.collection_details;

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
LEFT JOIN locations l ON c.location_id = l.id
JOIN categories cat ON c.category_id = cat.id
LEFT JOIN categories subcat ON c.subcategory_id = subcat.id
LEFT JOIN collection_places cp ON c.id = cp.collection_id
GROUP BY c.id, u.username, l.names, cat.names, subcat.names;

-- Grant access to everyone (public view)
GRANT SELECT ON public.collection_details TO anon, authenticated;
