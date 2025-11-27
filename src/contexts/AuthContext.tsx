import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { devSupabase } from '@/lib/supabase-dev';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const isDemo = import.meta.env.VITE_SUPABASE_ANON_KEY === 'YOUR_ANON_KEY_HERE';

  // Usar cliente de desenvolvimento se estiver em modo offline
  const client = import.meta.env.VITE_OFFLINE_MODE === 'true' ? devSupabase : supabase;

  useEffect(() => {
    if (isDemo) {
      const raw = localStorage.getItem('demo_user');
      if (raw) {
        setUser(JSON.parse(raw) as User);
      } else {
        setUser(null);
      }
      setSession(null);
      setLoading(false);
      return;
    }

    const { data: { subscription } } = client.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    client.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [isDemo]);

  const signUp = async (email: string, password: string) => {
    if (isDemo) {
      const usersRaw = localStorage.getItem('demo_users');
      const users = usersRaw ? JSON.parse(usersRaw) : [];
      const exists = users.find((u: any) => u.email === email);
      if (exists) return { error: { message: 'User already registered' } } as any;
      users.push({ email, password });
      localStorage.setItem('demo_users', JSON.stringify(users));
      return { error: null } as any;
    }

    const redirectUrl = `${window.location.origin}/`;
    const { error } = await client.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    if (isDemo) {
      const usersRaw = localStorage.getItem('demo_users');
      const users = usersRaw ? JSON.parse(usersRaw) : [];
      let found = users.find((u: any) => u.email === email && u.password === password);
      if (!found) {
        const existsEmail = users.find((u: any) => u.email === email);
        if (!existsEmail) {
          users.push({ email, password });
          localStorage.setItem('demo_users', JSON.stringify(users));
          found = { email, password };
        } else {
          return { error: { message: 'Credenciais inválidas (modo demo)' } } as any;
        }
      }
      const demoUser: User = {
        id: `demo-${email}`,
        aud: 'authenticated',
        email,
        created_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: { role: 'admin' },
        identities: [],
        phone: '',
      } as any;
      localStorage.setItem('demo_user', JSON.stringify(demoUser));
      setUser(demoUser);
      setSession(null);
      return { error: null } as any;
    }
    const { error } = await client.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    if (isDemo) {
      localStorage.removeItem('demo_user');
      setUser(null);
      setSession(null);
      return;
    }
    await client.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    if (isDemo) return { error: null } as any;
    const redirectUrl = `${window.location.origin}/auth`;
    const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl });
    return { error };
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signOut,
      resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
