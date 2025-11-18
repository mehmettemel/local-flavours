-- Debug script to check user creation issues
-- Run this in Supabase SQL Editor to diagnose the problem

-- 1. Check if handle_new_user function exists and is correct
SELECT 
  proname as function_name,
  prosrc as function_body
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 2. Check if trigger exists
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgenabled as enabled
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- 3. Check users table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- 4. Check RLS policies on users table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'users';

-- 5. Check if RLS is enabled
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'users';

-- 6. Test the function manually (replace USER_ID with a test UUID)
-- DO $$
-- DECLARE
--   test_user_id UUID := '00000000-0000-0000-0000-000000000001';
--   test_email TEXT := 'test@example.com';
-- BEGIN
--   -- Simulate what the trigger does
--   PERFORM public.handle_new_user() FROM (SELECT test_user_id as id, test_email as email, NULL::timestamptz as email_confirmed_at) AS NEW;
-- END $$;

