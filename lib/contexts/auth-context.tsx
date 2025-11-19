'use client';

import { createContext, useContext, useEffect, useState } from 'react';
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
  const supabase = createClient();

  // Profili getiren yardımcı fonksiyon
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Error fetching profile:', error);
        // Hata olsa bile null set ediyoruz ki "eski" profil kalmasın
        setProfile(null);
        return null;
      }

      setProfile(data);
      return data;
    } catch (error) {
      console.error('❌ Exception fetching profile:', error);
      setProfile(null);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    // 1. İlk Yükleme Fonksiyonu
    async function initializeAuth() {
      try {
        // Mevcut oturumu al
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
          // Oturum varsa profili çek
          if (initialSession.user) {
            await fetchProfile(initialSession.user.id);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        // Ne olursa olsun loading'i kapat
        if (mounted) {
          setLoading(false);
        }
      }
    }

    // Başlat
    initializeAuth();

    // 2. Auth Değişikliklerini Dinle
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      console.log('🔄 Auth state changed:', event);

      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        // Sadece profilimiz eksikse veya kullanıcı değiştiyse profili çek
        // (Gereksiz fetch işlemlerini önler)
        if (!profile || profile.id !== newSession.user.id) {
          await fetchProfile(newSession.user.id);
        }
      } else {
        // Oturum kapandıysa profili temizle
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Dependency array boş kalmalı

  // ... (Geri kalan metodlar aynı kalabilir: signUp, signIn, signOut vb.)

  const signUp = async (email: string, password: string, username?: string) => {
    try {
      const locale = window.location.pathname.split('/')[1] || 'en';
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username || email.split('@')[0],
          },
          emailRedirectTo: `${window.location.origin}/${locale}/auth/callback`,
        },
      });

      if (error) return { user: null, error };

      // Email onayı kapalıysa ve session geldiyse profili hemen çek
      if (data.user && data.session) {
        await fetchProfile(data.user.id);
      }

      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error: error as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { user: null, error };

      if (data.user) {
        await fetchProfile(data.user.id);
      }

      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error: error as AuthError };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setProfile(null);
      setSession(null);
      // Sign out sonrası router.push('/') yapılabilir ama genelde component tarafında yapılır
    }
    return { error };
  };

  const resetPassword = async (email: string) => {
    const locale = window.location.pathname.split('/')[1] || 'en';
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/${locale}/auth/reset-password`,
    });
    return { error };
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
      await fetchProfile(user.id);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

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
