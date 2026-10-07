import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, TEACHER_LOGIN_EMAIL } from '../lib/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(supabase));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!supabase) return undefined;
    let isMounted = true;

    supabase.auth.getSession()
      .then(({ data, error: sessionError }) => {
        if (!isMounted) return;
        if (sessionError) setError(sessionError.message);
        setSession(data.session);
        setIsLoading(false);
      })
      .catch((sessionError) => {
        if (isMounted) {
          setError(sessionError.message);
          setIsLoading(false);
        }
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (isMounted) setSession(nextSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(() => ({
    session,
    isLoading,
    error,
    isTeacher: session?.user?.email === TEACHER_LOGIN_EMAIL,
    async signInTeacher(username, password) {
      if (!supabase) throw new Error('Supabase is not configured. Add your project URL and publishable key to .env.local.');
      if (username.trim().toLowerCase() !== 'teacher') {
        throw new Error('Teacher username or password is incorrect.');
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: TEACHER_LOGIN_EMAIL,
        password
      });
      if (signInError) throw signInError;
      if (data.user?.email !== TEACHER_LOGIN_EMAIL) {
        await supabase.auth.signOut();
        throw new Error('This account is not authorized as a teacher.');
      }
    },
    async signOut() {
      if (!supabase) return;
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
    }
  }), [error, isLoading, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
};
