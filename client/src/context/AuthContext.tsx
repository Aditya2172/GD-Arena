import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabase';

export interface SignUpResult {
  needsEmailVerification: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, displayName: string) => Promise<SignUpResult>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  isPasswordRecovery: boolean;
  setIsPasswordRecovery: (isRecovery: boolean) => void;
  loginDemo: (name?: string) => void;
  logout: () => Promise<void>;
  isDemoUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        window.location.hash.includes('type=recovery') ||
        new URLSearchParams(window.location.search).get('type') === 'recovery'
      );
    }
    return false;
  });

  useEffect(() => {
    // Check local storage for persistent session
    const savedToken = localStorage.getItem('gd_arena_token');
    const savedUser = localStorage.getItem('gd_arena_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('gd_arena_token');
        localStorage.removeItem('gd_arena_user');
      }
    } else if (!isSupabaseConfigured) {
      // Default initial demo user if unconfigured
      loginDemo('Aakash Sharma');
    }

    // Check Supabase session if configured
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession()
        .then(({ data: { session } }) => {
          if (session?.user) {
            const authUser: User = {
              id: session.user.id,
              email: session.user.email,
              displayName: session.user.user_metadata?.display_name || session.user.email?.split('@')[0]
            };
            setUser(authUser);
            setToken(session.access_token);
            localStorage.setItem('gd_arena_token', session.access_token);
            localStorage.setItem('gd_arena_user', JSON.stringify(authUser));
          }
        })
        .catch((err) => {
          console.warn('[Auth] Error restoring Supabase session:', err);
        })
        .finally(() => {
          setIsLoading(false);
        });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true);
        }
        if (session?.user) {
          const authUser: User = {
            id: session.user.id,
            email: session.user.email,
            displayName: session.user.user_metadata?.display_name || session.user.email?.split('@')[0]
          };
          setUser(authUser);
          setToken(session.access_token);
        } else if (!localStorage.getItem('gd_arena_token')?.startsWith('demo-')) {
          setUser(null);
          setToken(null);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
          if (error) throw error;
          if (data.user && data.session) {
            const authUser: User = {
              id: data.user.id,
              email: data.user.email,
              displayName: data.user.user_metadata?.display_name || email.split('@')[0]
            };
            setUser(authUser);
            setToken(data.session.access_token);
            localStorage.setItem('gd_arena_token', data.session.access_token);
            localStorage.setItem('gd_arena_user', JSON.stringify(authUser));
          }
        } catch (authErr: any) {
          if (authErr?.message?.includes('Failed to fetch') || authErr?.name === 'TypeError') {
            throw new Error('Authentication service is currently unreachable. Please check your network connection or use 1-Click Demo to proceed.');
          }
          throw authErr;
        }
      } else {
        // Mock login only when Supabase is explicitly not configured
        loginDemo(email.split('@')[0]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, pass: string, displayName: string): Promise<SignUpResult> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password: pass,
            options: { data: { display_name: displayName } }
          });
          if (error) throw error;
          if (data.user && data.session) {
            const authUser: User = {
              id: data.user.id,
              email: data.user.email,
              displayName
            };
            setUser(authUser);
            setToken(data.session.access_token);
            localStorage.setItem('gd_arena_token', data.session.access_token);
            localStorage.setItem('gd_arena_user', JSON.stringify(authUser));
            return { needsEmailVerification: false };
          }
          // Supabase email confirmation required
          return { needsEmailVerification: true };
        } catch (authErr: any) {
          if (authErr?.message?.includes('Failed to fetch') || authErr?.name === 'TypeError') {
            throw new Error('Registration service is currently unreachable. Please check your network connection or use 1-Click Demo to proceed.');
          }
          throw authErr;
        }
      } else {
        loginDemo(displayName);
        return { needsEmailVerification: false };
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: typeof window !== 'undefined' ? `${window.location.origin}` : undefined
          });
          if (error) throw error;
        } catch (authErr: any) {
          if (authErr?.message?.includes('Failed to fetch') || authErr?.name === 'TypeError') {
            throw new Error('Password reset service is currently unreachable. Please check your network connection or use 1-Click Demo to proceed.');
          }
          throw authErr;
        }
      } else {
        // Simulation for local/demo mode
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (newPassword: string): Promise<void> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        try {
          const { error } = await supabase.auth.updateUser({ password: newPassword });
          if (error) throw error;
        } catch (authErr: any) {
          if (authErr?.message?.includes('Failed to fetch') || authErr?.name === 'TypeError') {
            throw new Error('Password update service is currently unreachable. Please check your network connection.');
          }
          throw authErr;
        }
      } else {
        // Mock update for local demo
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loginDemo = (name: string = 'Candidate Priya') => {
    const demoToken = 'demo-' + Math.random().toString(36).substring(2, 9);
    const demoUser: User = {
      id: demoToken,
      email: `${demoToken}@demo.gdarena.app`,
      displayName: name
    };
    setUser(demoUser);
    setToken(demoToken);
    localStorage.setItem('gd_arena_token', demoToken);
    localStorage.setItem('gd_arena_user', JSON.stringify(demoUser));
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('gd_arena_token');
    localStorage.removeItem('gd_arena_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      login,
      signUp,
      resetPassword,
      updatePassword,
      isPasswordRecovery,
      setIsPasswordRecovery,
      loginDemo,
      logout,
      isDemoUser: Boolean(token?.startsWith('demo-'))
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
