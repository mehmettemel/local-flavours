-- Production Auth Fix Migration
-- This migration consolidates all auth-related fixes and ensures production parity
-- Run this migration in production to fix the authentication and user profile issues

-- 1. Ensure all required columns exist in users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS collections_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reputation_score INTEGER DEFAULT 0;

-- 2. Update existing users to have default values for new columns
UPDATE users
SET
  followers_count = COALESCE(followers_count, 0),
  following_count = COALESCE(following_count, 0),
  collections_count = COALESCE(collections_count, 0),
  reputation_score = COALESCE(reputation_score, 0)
WHERE
  followers_count IS NULL
  OR following_count IS NULL
  OR collections_count IS NULL
  OR reputation_score IS NULL;

-- 3. Ensure the INSERT policy exists for the trigger to work
DROP POLICY IF EXISTS "System can insert users" ON users;
CREATE POLICY "System can insert users"
  ON users FOR INSERT
  WITH CHECK (true);

-- 4. Recreate the handle_new_user function with all required columns and better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  username_value TEXT;
  retry_count INTEGER := 0;
  max_retries INTEGER := 3;
BEGIN
  -- Check if user already exists (shouldn't happen, but safety check)
  IF EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
    RAISE NOTICE 'User % already exists in public.users table', NEW.id;
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

  RAISE NOTICE 'Successfully created user profile for %', NEW.id;
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- User already exists, just return
    RAISE NOTICE 'User % already exists (unique violation), skipping insert', NEW.id;
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error but don't fail the auth signup
    RAISE WARNING 'Error creating user profile for %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Ensure the trigger exists and is enabled
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 6. Verify RLS policies are correctly set
-- Anyone can view all user profiles (public data)
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
CREATE POLICY "Users can view all profiles"
  ON users FOR SELECT
  USING (true);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 7. Create any missing user profiles for existing auth users
-- This handles the case where users were created but profiles weren't
DO $$
DECLARE
  auth_user RECORD;
  username_value TEXT;
BEGIN
  FOR auth_user IN
    SELECT au.id, au.email, au.email_confirmed_at
    FROM auth.users au
    LEFT JOIN public.users pu ON au.id = pu.id
    WHERE pu.id IS NULL
  LOOP
    -- Extract username from email
    username_value := SPLIT_PART(auth_user.email, '@', 1);

    -- Ensure username is unique
    WHILE EXISTS (SELECT 1 FROM public.users WHERE username = username_value) LOOP
      username_value := SPLIT_PART(auth_user.email, '@', 1) || '_' || FLOOR(RANDOM() * 10000)::TEXT;
    END LOOP;

    -- Insert missing profile
    BEGIN
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
        auth_user.id,
        username_value,
        100,
        'user',
        auth_user.email_confirmed_at IS NOT NULL,
        0,
        0,
        0,
        0,
        NOW(),
        NOW()
      );

      RAISE NOTICE 'Created missing profile for user %', auth_user.id;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Failed to create profile for user %: %', auth_user.id, SQLERRM;
    END;
  END LOOP;
END $$;

-- 8. Verify the fix by checking for users without profiles
DO $$
DECLARE
  missing_profiles INTEGER;
BEGIN
  SELECT COUNT(*) INTO missing_profiles
  FROM auth.users au
  LEFT JOIN public.users pu ON au.id = pu.id
  WHERE pu.id IS NULL;

  IF missing_profiles > 0 THEN
    RAISE WARNING 'Still have % users without profiles!', missing_profiles;
  ELSE
    RAISE NOTICE 'All users have profiles. Auth fix completed successfully!';
  END IF;
END $$;
