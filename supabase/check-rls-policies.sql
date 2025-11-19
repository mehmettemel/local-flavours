-- Check if RLS is enabled on users table
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'users';

-- Check existing policies on users table
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
WHERE schemaname = 'public' AND tablename = 'users';

-- If no policies exist, create them
-- Users can view their own profile
CREATE POLICY IF NOT EXISTS "Users can view own profile"
ON public.users
FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY IF NOT EXISTS "Users can update own profile"
ON public.users
FOR UPDATE
USING (auth.uid() = id);

-- Enable RLS if not enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Test query (this should work when authenticated)
-- SELECT * FROM users WHERE id = auth.uid();
