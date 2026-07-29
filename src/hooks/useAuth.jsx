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

    /**
     * Fetch the user's profile, or auto-create one if it doesn't exist yet.
     * Defined inside the effect so it closes over `mounted` (passed by value
     * would be stale on unmount). Also acts as a fallback in case the database
     * trigger (on_auth_user_created) hasn't fired yet.
     */
    const fetchAndSetProfile = async (user) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('avatar_url, username')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!mounted) return;

        if (data) {
          setProfile(data);
        } else if (!error) {
          // Profile doesn't exist yet — create one
          const username =
            user.user_metadata?.username ||
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split('@')[0] ||
            'Anime Fan';

          const { data: newProfile } = await supabase
            .from('profiles')
            .upsert(
              { user_id: user.id, username },
              { onConflict: 'user_id' }
            )
            .select('avatar_url, username')
            .single();

          if (mounted && newProfile) {
            setProfile(newProfile);
          }
        }
      } catch {
        // Silently ignore — profile will be created on next page load
      }
    };

    // Get initial session FIRST
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.user) {
        fetchAndSetProfile(session.user);
      }
    });

    // Then listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          fetchAndSetProfile(session.user);
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

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
