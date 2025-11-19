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

  // Profili güvenli bir şekilde çeken fonksiyon
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Profil çekme hatası (yoksayıldı):', error.message);
        // Profil henüz oluşmamış olabilir (trigger gecikmesi), null set edip devam ediyoruz
        return null;
      }

      setProfile(data);
      return data;
    } catch (error) {
      console.error('❌ Profil çekme istisnası:', error);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        // 1. Mevcut oturumu al
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);

          // Kullanıcı varsa profili çekmeyi dene
          if (initialSession.user) {
            await fetchProfile(initialSession.user.id);
          }
        }
      } catch (error) {
        console.error('Auth başlatma hatası:', error);
      } finally {
        // 2. Ne olursa olsun loading'i kapat (ÇÖZÜM BURASI)
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initializeAuth();

    // Auth durum değişikliklerini dinle
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;
      console.log('🔄 Auth durumu değişti:', event);

      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        // Sadece oturum açma (SIGNED_IN) olayında profili çek
        // INITIAL_SESSION olayını atlıyoruz çünkü yukarıdaki initializeAuth bunu zaten yapıyor
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Profil zaten yüklüyse tekrar çekme (gereksiz network trafiğini önle)
          if (!profile || profile.id !== newSession.user.id) {
            await fetchProfile(newSession.user.id);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        setLoading(false); // Çıkış yapıldığında loading hemen kapanmalı
      }

      // Her auth değişiminde loading'i kapatmayı garantiye al
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Dependency array boş

  // --- Diğer fonksiyonlar (Aynı kalabilir) ---

  const signUp = async (email: string, password: string, username?: string) => {
    try {
      const locale =
        typeof window !== 'undefined'
          ? window.location.pathname.split('/')[1] || 'en'
          : 'en';
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
    try {
      const { error } = await supabase.auth.signOut();
      if (!error) {
        setUser(null);
        setProfile(null);
        setSession(null);
      }
      return { error };
    } catch (error: any) {
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    const locale =
      typeof window !== 'undefined'
        ? window.location.pathname.split('/')[1] || 'en'
        : 'en';
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
