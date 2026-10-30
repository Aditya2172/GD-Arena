import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabase';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, displayName: string) => Promise<void>;
  loginDemo: (name?: string) => void;
  logout: () => Promise<void>;
  isDemoUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
      supabase.auth.getSession().then(({ data: { session } }) => {
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
        setIsLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
      } else {
        // Mock login
        loginDemo(email.split('@')[0]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, pass: string, displayName: string) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
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
        }
      } else {
        loginDemo(displayName);
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
