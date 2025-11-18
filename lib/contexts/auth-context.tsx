'use client';

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database';

type UserProfile = Database['public']['Tables']['users']['Row'];

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    username?: string
  ) => Promise<{
    user: User | null;
    error: AuthError | null;
  }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{
    user: User | null;
    error: AuthError | null;
  }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{
    error: Error | null;
  }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  // Fetch user profile from public.users table with retry logic
  const fetchProfile = useCallback(async (userId: string, retryCount = 0, maxRetries = 3) => {
    try {
      console.log(`🔍 Fetching profile for user: ${userId} (attempt ${retryCount + 1}/${maxRetries + 1})`);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Error fetching profile:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));

        // If profile not found and we haven't exhausted retries, try again
        // This handles the case where the trigger hasn't created the profile yet
        if (error.code === 'PGRST116' && retryCount < maxRetries) {
          const delay = Math.pow(2, retryCount) * 500; // Exponential backoff: 500ms, 1s, 2s
          console.log(`⏳ Profile not found, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchProfile(userId, retryCount + 1, maxRetries);
        }

        // Don't throw, just set profile to null and continue
        setProfile(null);
        return;
      }

      console.log('✅ Profile fetched successfully:', data);
      setProfile(data);
    } catch (error) {
      console.error('❌ Unexpected error fetching profile:', error);
      setProfile(null);
    }
  }, [supabase]);

  // Initialize auth state
  useEffect(() => {
    console.log('🚀 Initializing auth state...');
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('❌ Error getting session:', error);
      }
      console.log(
        '📦 Session data:',
        session ? `Session exists for user ${session.user.id}` : 'No session'
      );
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        console.log('👤 User found, fetching profile...');
        fetchProfile(session.user.id).finally(() => {
          console.log(
            '✅ Auth initialization complete, setting loading = false'
          );
          setLoading(false);
        });
      } else {
        console.log('❌ No user, setting loading = false');
        setLoading(false);
      }
    }).catch((error) => {
      console.error('❌ Unexpected error in getSession:', error);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(
        '🔄 Auth state changed:',
        event,
        session ? 'Session exists' : 'No session'
      );
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        console.log('👤 User in auth change, fetching profile...');
        await fetchProfile(session.user.id);
      } else {
        console.log('❌ No user in auth change');
        setProfile(null);
      }
      console.log('✅ Setting loading = false after auth change');
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  // Sign up with email and password
  const signUp = async (email: string, password: string, username?: string) => {
    try {
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

      if (error) return { user: null, error };

      // If email confirmation is disabled, fetch profile immediately
      if (data.user && data.session) {
        await fetchProfile(data.user.id);
      }

      return { user: data.user, error: null };
    } catch (error) {
      return {
        user: null,
        error: error as AuthError,
      };
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔑 Attempting to sign in...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Sign in error:', error);
        return { user: null, error };
      }

      console.log('✅ Sign in successful, user:', data.user?.id);

      if (data.user) {
        // Fetch profile but don't block on it
        fetchProfile(data.user.id).catch((err) => {
          console.error('❌ Failed to fetch profile after sign in:', err);
        });
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error('❌ Unexpected sign in error:', error);
      return {
        user: null,
        error: error as AuthError,
      };
    }
  };

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setProfile(null);
      setSession(null);
    }
    return { error };
  };

  // Reset password
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { error };
  };

  // Update user profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { error: new Error('No user logged in') };
    }

    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Refresh profile
      await fetchProfile(user.id);

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Refresh profile data
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper hooks
export function useUser() {
  const { user } = useAuth();
  return user;
}

export function useProfile() {
  const { profile } = useAuth();
  return profile;
}

export function useSession() {
  const { session } = useAuth();
  return session;
}
