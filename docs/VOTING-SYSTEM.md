# Voting System Documentation

## Overview

LocalFlavors uses a real-time voting system where authenticated users can upvote or downvote places. Votes are stored in the `votes` table and automatically update the `vote_score` and `vote_count` fields in the `places` table via database triggers.

## How It Works

### Vote Flow

1. User clicks upvote/downvote button on a place
2. System checks if user is authenticated
3. If not authenticated, shows toast notification with "Giriş Yap" button
4. If authenticated, checks for existing vote
5. If same vote exists, removes it (toggle off)
6. If different vote exists, updates it
7. If no vote exists, inserts new vote
8. Database trigger automatically updates `places.vote_score` and `places.vote_count`
9. Page refreshes to show updated scores

### Vote Values

- **Upvote**: `value = 1`
- **Downvote**: `value = -1`

### Score Calculation

- `vote_score` = Sum of all vote values for a place
- `vote_count` = Total number of votes for a place

## Database Schema

### Votes Table

```sql
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  value SMALLINT NOT NULL CHECK (value IN (-1, 1)),
  weight DECIMAL(3, 2) DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, place_id)
);
```

### Database Trigger

The `update_place_votes` trigger automatically recalculates vote statistics:

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

**Important**: The function uses `SECURITY DEFINER` to bypass RLS when updating the `places` table.

## Row Level Security (RLS) Policies

```sql
-- Users can view their own votes
CREATE POLICY "Users can view own votes" ON votes
  FOR SELECT USING (auth.uid() = user_id);

-- Authenticated users can insert votes
CREATE POLICY "Authenticated users can vote" ON votes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own votes
CREATE POLICY "Users can update own votes" ON votes
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own votes
CREATE POLICY "Users can delete own votes" ON votes
  FOR DELETE USING (auth.uid() = user_id);
```

## Frontend Components

### PlacesLeaderboard Component

Location: `components/leaderboard/places-leaderboard.tsx`

Key features:
- Displays upvote/downvote counts separately (green/red)
- Shows total score in orange badge
- Click on row navigates to place detail
- Vote buttons always clickable (shows toast if not logged in)
- Google Maps link opens in new tab

### Toast Notifications

Uses `sonner` library for toast notifications:
- Error toast when not logged in with "Giriş Yap" action button
- Success toast after voting
- Error toast on vote failure

## Session Management

### Important Cookie Settings

Session cookies must NOT have `httpOnly: true` to allow the browser client to read them:

```typescript
// middleware.ts & lib/supabase/server.ts
response.cookies.set(name, value, {
  ...options,
  path: '/',
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  // DO NOT set httpOnly: true
});
```

### Login Dialog Event

Custom event system for opening login dialog from anywhere:

```typescript
// Dispatch event to open login dialog
window.dispatchEvent(new CustomEvent('open-login-dialog'));

// Listen in AuthButton component
useEffect(() => {
  const handleOpenLogin = () => setShowLogin(true);
  window.addEventListener('open-login-dialog', handleOpenLogin);
  return () => window.removeEventListener('open-login-dialog', handleOpenLogin);
}, []);
```

## Production Setup

Run the migration `010_fix_vote_trigger.sql` in Supabase SQL Editor:

```sql
-- This migration is located at:
-- supabase/migrations/010_fix_vote_trigger.sql
```

Or manually run the trigger creation SQL above.

## Troubleshooting

### Votes not updating score

1. Check if trigger exists:
```sql
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'votes';
```

2. If missing, run the trigger creation SQL

3. Manually recalculate scores:
```sql
UPDATE places p SET
  vote_count = COALESCE((SELECT COUNT(*) FROM votes v WHERE v.place_id = p.id), 0),
  vote_score = COALESCE((SELECT SUM(v.value) FROM votes v WHERE v.place_id = p.id), 0);
```

### Session not persisting

1. Clear all cookies in browser
2. Check that `httpOnly` is NOT set in cookie options
3. Re-login

### RLS policy errors

1. Check policies exist:
```sql
SELECT * FROM pg_policies WHERE tablename = 'votes';
```

2. Ensure user exists in `users` table with matching `auth.uid()`
