
// @ts-nocheck
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { cookies } from 'next/headers';

/**
 * Server-side: Get current user
 */
export async function getCurrentUser() {
  const supabase = await createServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * Server-side: Get current user profile
 */
export async function getCurrentUserProfile() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return profile;
}

/**
 * Server-side: Get current session
 */
export async function getCurrentSession() {
  const supabase = await createServerClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    return null;
  }

  return session;
}

/**
 * Server-side: Check if user is authenticated
 */
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}

/**
 * Server-side: Check if user is admin or moderator
 */
export async function isAdmin() {
  const profile = await getCurrentUserProfile();
  return profile?.role === 'admin' || profile?.role === 'moderator';
}

/**
 * Server-side: Require authentication (throws if not authenticated)
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

/**
 * Server-side: Require admin role (throws if not admin)
 */
export async function requireAdmin() {
  const profile = await getCurrentUserProfile();
  if (!profile || (profile.role !== 'admin' && profile.role !== 'moderator')) {
    throw new Error('Admin access required');
  }
  return profile;
}

/**
 * Client-side: Sign up with email and password
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  username?: string
) {
  const supabase = createBrowserClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username || email.split('@')[0],
      },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  return { data, error };
}

/**
 * Client-side: Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string) {
  const supabase = createBrowserClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
}

/**
 * Client-side: Sign out
 */
export async function signOut() {
  const supabase = createBrowserClient();
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Client-side: Reset password
 */
export async function resetPasswordForEmail(email: string) {
  const supabase = createBrowserClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });

  return { error };
}

/**
 * Client-side: Update password
 */
export async function updatePassword(newPassword: string) {
  const supabase = createBrowserClient();

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  return { error };
}

/**
 * Client-side: Update email
 */
export async function updateEmail(newEmail: string) {
  const supabase = createBrowserClient();

  const { error } = await supabase.auth.updateUser({
    email: newEmail,
  });

  return { error };
}

/**
 * Client-side: Resend verification email
 */
export async function resendVerificationEmail(email: string) {
  const supabase = createBrowserClient();

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  });

  return { error };
}

/**
 * Get user by ID (server-side, admin only)
 */
export async function getUserById(userId: string) {
  const supabase = await createServerClient();

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return user;
}

/**
 * Get user by username (server-side)
 */
export async function getUserByUsername(username: string) {
  const supabase = await createServerClient();

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return user;
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(
  userId: string,
  role: 'user' | 'moderator' | 'admin'
) {
  const supabase = await createServerClient();

  // Check if current user is admin
  const currentProfile = await getCurrentUserProfile();
  if (!currentProfile || currentProfile.role !== 'admin') {
    throw new Error('Only admins can update user roles');
  }

  const { error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', userId);

  if (error) {
    throw error;
  }

  return { success: true };
}

/**
 * Get user preferences
 */
export async function getUserPreferences(userId?: string) {
  const supabase = await createServerClient();

  const targetUserId = userId || (await getCurrentUser())?.id;
  if (!targetUserId) {
    return null;
  }

  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', targetUserId)
    .single();

  if (error) {
    console.error('Error fetching preferences:', error);
    return null;
  }

  return data;
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(
  preferences: {
    email_notifications?: boolean;
    collection_vote_notifications?: boolean;
    new_follower_notifications?: boolean;
    locale?: string;
    theme?: string;
  },
  userId?: string
) {
  const supabase = createBrowserClient();

  const targetUserId = userId;
  if (!targetUserId) {
    throw new Error('User ID required');
  }

  const { error } = await supabase
    .from('user_preferences')
    .update(preferences)
    .eq('user_id', targetUserId);

  if (error) {
    throw error;
  }

  return { success: true };
}
