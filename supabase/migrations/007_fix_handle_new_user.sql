-- Fix handle_new_user function to include all required columns
-- This migration fixes the "database error saving new user" issue in production

-- First, ensure all required columns exist in users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS collections_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reputation_score INTEGER DEFAULT 0;

-- Add INSERT policy for users table (for SECURITY DEFINER functions)
DROP POLICY IF EXISTS "System can insert users" ON users;
CREATE POLICY "System can insert users"
  ON users FOR INSERT
  WITH CHECK (true);

-- Drop and recreate the function with all required columns and better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  username_value TEXT;
BEGIN
  -- Check if user already exists (shouldn't happen, but safety check)
  IF EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
    RETURN NEW;
  END IF;

  -- Extract username from email (before @)
  username_value := SPLIT_PART(NEW.email, '@', 1);

  -- Ensure username is unique by appending random suffix if needed
  WHILE EXISTS (SELECT 1 FROM public.users WHERE username = username_value) LOOP
    username_value := SPLIT_PART(NEW.email, '@', 1) || '_' || FLOOR(RANDOM() * 10000)::TEXT;
  END LOOP;

  -- Insert into public.users table with all required columns
  INSERT INTO public.users (
    id,
    username,
    trust_score,
    role,
    email_verified,
    followers_count,
    following_count,
    collections_count,
    reputation_score,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    username_value,
    100, -- Default trust score
    'user', -- Default role
    NEW.email_confirmed_at IS NOT NULL,
    0, -- Default followers_count
    0, -- Default following_count
    0, -- Default collections_count
    0, -- Default reputation_score
    NOW(),
    NOW()
  );

  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- User already exists, just return
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error but don't fail the auth signup
    RAISE WARNING 'Error creating user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

