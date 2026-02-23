import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/src/integrations/supabase/client';

const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  profile: null,
  signOut: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.user) {
        supabase
          .from('profiles')
          .select('avatar_url, username')
          .eq('user_id', session.user.id)
          .single()
          .then(({ data }) => {
            if (mounted && data) setProfile(data);
          });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          supabase
            .from('profiles')
            .select('avatar_url, username')
            .eq('user_id', session.user.id)
            .single()
            .then(({ data }) => {
              if (mounted && data) setProfile(data);
            });
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return React.createElement(
    AuthContext.Provider,
    { value: { user, session, loading, profile, signOut } },
    children
  );
};

export const useAuth = () => useContext(AuthContext);
