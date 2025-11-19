# Authentication Best Practices - Local Flavours

## Overview

This document outlines the authentication architecture and best practices implemented in Local Flavours.

## Architecture

### 1. Client-Side Authentication (Browser)

**Location**: `lib/supabase/client.ts`

**Key Features**:
- ✅ **Singleton Pattern**: Single Supabase client instance across the app
- ✅ **PKCE Flow**: Proof Key for Code Exchange for enhanced security
- ✅ **Auto Token Refresh**: Automatic session refresh before expiration
- ✅ **Persistent Sessions**: Sessions stored in localStorage
- ✅ **Production-Ready Cookies**: Proper cookie configuration for production

**Configuration**:
```typescript
{
  auth: {
    flowType: 'pkce',                    // Secure authentication flow
    autoRefreshToken: true,              // Auto-refresh before expiration
    detectSessionInUrl: true,            // Handle OAuth callbacks
    persistSession: true,                // Save session in localStorage
    storage: window.localStorage,        // Browser storage
  },
  cookies: {
    domain: window.location.hostname,   // Current domain
    path: '/',                           // All paths
    sameSite: 'lax',                    // CSRF protection
  }
}
```

### 2. Server-Side Authentication

**Location**: `lib/supabase/server.ts`

**Key Features**:
- ✅ **Server Components Support**: Works with Next.js server components
- ✅ **Cookie-Based Sessions**: Server-side cookie reading/writing
- ✅ **Production Security**: HttpOnly, Secure flags in production
- ✅ **PKCE Flow**: Same secure flow as client

**Configuration**:
```typescript
{
  cookies: {
    getAll: () => cookieStore.getAll(),
    setAll: (cookies) => {
      cookies.forEach(({ name, value, options }) => {
        cookieStore.set(name, value, {
          ...options,
          path: '/',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          httpOnly: true,
        });
      });
    }
  },
  auth: {
    flowType: 'pkce',
    autoRefreshToken: true,
    detectSessionInUrl: true,
    persistSession: true,
  }
}
```

### 3. Middleware (Session Refresh)

**Location**: `middleware.ts`

**Responsibilities**:
- ✅ **Session Refresh**: Automatically refreshes expired sessions
- ✅ **Route Protection**: Blocks unauthenticated access to protected routes
- ✅ **Role Verification**: Checks admin/moderator roles
- ✅ **Cookie Management**: Updates cookies on every request

**Protected Routes**:
- `/my-collections` - User collections management
- `/favorites` - User favorites
- `/settings` - User settings
- `/profile/edit` - Profile editing

**Admin Routes**:
- `/admin/*` - All admin panel routes

### 4. Auth Context (React State)

**Location**: `lib/contexts/auth-context.tsx`

**Key Features**:
- ✅ **Centralized State**: Single source of truth for auth state
- ✅ **Profile Management**: Automatic profile fetching
- ✅ **Race Condition Protection**: Prevents concurrent profile fetches
- ✅ **Event Handling**: Responds to all auth state changes
- ✅ **Loading States**: Proper loading indicators

**State Management**:
```typescript
{
  user: User | null,           // Supabase auth user
  profile: UserProfile | null, // Database user profile
  session: Session | null,     // Current session
  loading: boolean            // Loading state
}
```

**Auth Events Handled**:
- `SIGNED_IN` - User logged in
- `SIGNED_OUT` - User logged out
- `TOKEN_REFRESHED` - Token auto-refreshed
- `INITIAL_SESSION` - Initial session loaded
- `USER_UPDATED` - User data updated

## Problem Solved: Refresh Data Loss

### Issue
On production, after page refresh, user profile data was lost even though the user was authenticated.

### Root Causes
1. **Event Skipping**: `INITIAL_SESSION` event was being skipped, so profile wasn't fetched on refresh
2. **No Singleton**: Multiple client instances caused session management issues
3. **Missing Cookie Config**: Production cookies weren't properly configured
4. **Race Conditions**: Concurrent profile fetches caused state inconsistencies

### Solution

#### 1. Client Singleton
```typescript
// Before: New instance every time
export function createClient() {
  return createBrowserClient(...);
}

// After: Singleton pattern
let client: SupabaseClient | null = null;

export function createClient() {
  if (client) return client;
  client = createBrowserClient(...);
  return client;
}
```

#### 2. Profile Fetch on All Events
```typescript
// Before: Only SIGNED_IN and TOKEN_REFRESHED
if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
  await fetchProfile(user.id);
}

// After: All relevant events including INITIAL_SESSION
if (
  event === 'SIGNED_IN' ||
  event === 'TOKEN_REFRESHED' ||
  event === 'INITIAL_SESSION' ||
  event === 'USER_UPDATED'
) {
  await fetchProfile(user.id);
}
```

#### 3. Race Condition Protection
```typescript
const fetchingProfile = useRef(false);

const fetchProfile = useCallback(async (userId: string, force = false) => {
  // Prevent concurrent fetches
  if (!force && fetchingProfile.current) return null;

  // Don't fetch if we already have it
  if (!force && profile?.id === userId) return profile;

  fetchingProfile.current = true;
  try {
    // Fetch profile
  } finally {
    fetchingProfile.current = false;
  }
}, [supabase, profile]);
```

#### 4. Production Cookie Configuration
```typescript
cookies: {
  domain: window.location.hostname,
  path: '/',
  sameSite: 'lax',
}

// Middleware & Server
{
  ...options,
  path: '/',
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,
}
```

## Best Practices

### DO ✅

1. **Use Singleton Client**: Prevent multiple instances
2. **Handle All Auth Events**: Don't skip INITIAL_SESSION
3. **Protect Against Race Conditions**: Use refs to prevent concurrent fetches
4. **Configure Production Cookies**: Set secure, httpOnly, sameSite
5. **Use Middleware for Session Refresh**: Keep sessions alive
6. **Clear State on Logout**: Reset all auth state
7. **Show Loading States**: Prevent UI flicker
8. **Type Safety**: Use TypeScript for database types

### DON'T ❌

1. **Don't Skip INITIAL_SESSION**: Profile won't load on refresh
2. **Don't Create Multiple Clients**: Causes session issues
3. **Don't Forget Cookie Config**: Production auth will fail
4. **Don't Block on Profile Fetch**: App should load even if profile fails
5. **Don't Use Empty Dependency Array**: Won't react to changes
6. **Don't Forget to Reset Client on Logout**: State may persist

## Environment Variables

Required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Testing Checklist

### Local Development
- [ ] Login works
- [ ] Logout works
- [ ] Profile loads after login
- [ ] Profile persists on page refresh
- [ ] Protected routes redirect when logged out
- [ ] Admin routes only accessible to admins

### Production
- [ ] Login works
- [ ] Logout works
- [ ] Profile loads after login
- [ ] **Profile persists on page refresh** ✅ FIXED
- [ ] Session refresh works automatically
- [ ] Cookies are set with secure flags
- [ ] Protected routes work
- [ ] Admin routes work

## Debugging

### Check Session in Browser Console
```javascript
// Get current session
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);

// Check localStorage
console.log('Auth token:', localStorage.getItem('sb-access-token'));
```

### Check Cookies
```javascript
// In browser console
document.cookie.split(';').filter(c => c.includes('sb-'));
```

### Check Auth Events
Uncomment debug logs in `auth-context.tsx`:
```typescript
console.log('🔄 Auth state changed:', event);
console.log('✅ Profile fetched:', data);
```

## Migration from Old Implementation

### Changes Made

1. **lib/supabase/client.ts**
   - Added singleton pattern
   - Added PKCE configuration
   - Added production cookie settings
   - Added resetClient helper

2. **lib/supabase/server.ts**
   - Added production cookie settings
   - Added PKCE configuration
   - Added TypeScript types

3. **lib/contexts/auth-context.tsx**
   - Added race condition protection
   - Added INITIAL_SESSION event handling
   - Added force refresh option
   - Added client reset on logout
   - Updated dependency arrays

4. **middleware.ts**
   - Added production cookie settings
   - Improved session refresh logic

### Breaking Changes

None. All changes are backwards compatible.

### Performance Improvements

- ✅ Singleton reduces memory usage
- ✅ Race condition protection prevents duplicate requests
- ✅ Smart caching prevents unnecessary profile fetches
- ✅ Auto token refresh reduces authentication overhead

## Support

If you encounter authentication issues:

1. Check browser console for errors
2. Verify environment variables
3. Check cookie settings in browser DevTools
4. Review auth event logs
5. Verify middleware is running on protected routes

## Related Files

- `lib/supabase/client.ts` - Browser client
- `lib/supabase/server.ts` - Server client
- `lib/contexts/auth-context.tsx` - Auth context
- `middleware.ts` - Session middleware
- `lib/api/auth.ts` - Auth helpers
- `components/auth/auth-button.tsx` - Auth UI

---

**Last Updated**: 2025-01-19
**Version**: 2.0.0
**Status**: ✅ Production Ready
