# Production Database Setup Guide

## Overview

This guide explains how to set up the production Supabase database with all required tables, triggers, functions, and RLS policies.

## Prerequisites

- Supabase project created
- Access to Supabase SQL Editor
- Environment variables configured in Vercel/hosting platform

## Step-by-Step Setup

### Step 1: Run Base Migrations

Run these migrations in order in Supabase SQL Editor:

1. `supabase/migrations/001_initial_schema.sql` - Core tables
2. `supabase/migrations/002_seed_data.sql` - Initial seed data
3. `supabase/migrations/003_collections_schema.sql` - Collections tables
4. `supabase/migrations/004_auth_setup.sql` - Auth configuration
5. `supabase/migrations/005_add_category_hierarchy.sql` - Category hierarchy
6. `supabase/migrations/006_add_recommended_items.sql` - Recommended items column
7. `supabase/migrations/009_production_auth_fix.sql` - Auth fixes
8. `supabase/migrations/010_fix_vote_trigger.sql` - Vote trigger fix

### Step 2: Verify Vote Trigger

The vote trigger is critical for the voting system. Verify it exists:

```sql
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'votes';
```

If missing or incorrect, run:

```sql
CREATE OR REPLACE FUNCTION update_place_votes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE places SET
      vote_count = COALESCE((SELECT COUNT(*) FROM votes WHERE place_id = OLD.place_id), 0),
      vote_score = COALESCE((SELECT SUM(value) FROM votes WHERE place_id = OLD.place_id), 0),
      updated_at = NOW()
    WHERE id = OLD.place_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE places SET
      vote_count = COALESCE((SELECT COUNT(*) FROM votes WHERE place_id = NEW.place_id), 0),
      vote_score = COALESCE((SELECT SUM(value) FROM votes WHERE place_id = NEW.place_id), 0),
      updated_at = NOW()
    WHERE id = NEW.place_id;
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    UPDATE places SET
      vote_count = COALESCE((SELECT COUNT(*) FROM votes WHERE place_id = NEW.place_id), 0),
      vote_score = COALESCE((SELECT SUM(value) FROM votes WHERE place_id = NEW.place_id), 0),
      updated_at = NOW()
    WHERE id = NEW.place_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_place_vote_stats ON votes;
CREATE TRIGGER update_place_vote_stats
AFTER INSERT OR UPDATE OR DELETE ON votes
FOR EACH ROW
EXECUTE FUNCTION update_place_votes();
```

### Step 3: Verify RLS Policies

Check all required policies exist:

```sql
-- Check votes policies
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'votes';
```

Required policies for votes:
- `Users can view own votes` (SELECT)
- `Authenticated users can vote` (INSERT)
- `Users can update own votes` (UPDATE)
- `Users can delete own votes` (DELETE)

If missing, run:

```sql
-- Votes policies
CREATE POLICY "Users can view own votes" ON votes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can vote" ON votes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own votes" ON votes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes" ON votes
  FOR DELETE USING (auth.uid() = user_id);
```

### Step 4: Add recommended_items Column

If not exists:

```sql
ALTER TABLE collection_places
ADD COLUMN IF NOT EXISTS recommended_items TEXT[] DEFAULT '{}';
```

### Step 5: Seed Initial Data

#### Seed Turkish Cities

Run the seed script or use SQL Editor with data from `lib/data/turkish-cities.ts`.

#### Import Sample Collections

Use the import scripts in `scripts/` folder:

```sql
-- Example: Import Adana collection
-- Update v_user_id with your admin user's ID first
-- Then run scripts/import-adana-collection.sql
```

### Step 6: Create Admin User

1. Register a new user through the app
2. Get the user ID from auth.users:

```sql
SELECT id, email FROM auth.users WHERE email = 'your-admin@email.com';
```

3. Update role to admin:

```sql
UPDATE public.users
SET role = 'admin'
WHERE id = 'USER_ID_HERE';
```

## Environment Variables

Required environment variables for production:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Verifying Setup

### Test Voting System

1. Login as a user
2. Go to homepage
3. Click upvote on a place
4. Verify vote_score updates in database:

```sql
SELECT names->>'tr' as name, vote_count, vote_score
FROM places
ORDER BY vote_score DESC
LIMIT 10;
```

### Test Session Persistence

1. Login
2. Refresh page
3. Should remain logged in

### Test RLS

1. Try to vote without login (should show error toast)
2. Try to vote with login (should succeed)

## Common Issues

### Issue: vote_score not updating

**Solution**: Recreate the trigger with `SECURITY DEFINER`

### Issue: Session lost on refresh

**Solution**: Ensure cookies don't have `httpOnly: true` in middleware and server client

### Issue: RLS policy violation

**Solution**:
1. Verify user exists in `public.users` table
2. Check that `auth.uid()` matches `user_id`

```sql
-- Sync auth users to public users
INSERT INTO public.users (id, username, email)
SELECT id, SPLIT_PART(email, '@', 1), email
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users);
```

## Migration Files Reference

| File | Description |
|------|-------------|
| 001_initial_schema.sql | Core tables (users, places, votes, etc.) |
| 002_seed_data.sql | Initial seed data |
| 003_collections_schema.sql | Collections and collection_places tables |
| 004_auth_setup.sql | Auth configuration |
| 005_add_category_hierarchy.sql | Category parent/child relationships |
| 006_add_recommended_items.sql | recommended_items column |
| 009_production_auth_fix.sql | Production auth fixes |
| 010_fix_vote_trigger.sql | Fixed vote trigger with SECURITY DEFINER |
