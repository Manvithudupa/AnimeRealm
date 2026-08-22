import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const hasSupabaseConfig = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

const unavailableError = {
  message: 'Supabase is not configured for this deployment.',
  code: 'SUPABASE_NOT_CONFIGURED',
};

function createNoopQuery() {
  const result = { data: null, error: unavailableError };
  const query = {
    select: () => query,
    insert: () => query,
    update: () => query,
    upsert: () => query,
    delete: () => query,
    eq: () => query,
    neq: () => query,
    in: () => query,
    is: () => query,
    order: () => query,
    limit: () => query,
    single: async () => result,
    maybeSingle: async () => result,
    then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
  };
  return query;
}

function createNoopSupabase() {
  return {
    from: () => createNoopQuery(),
    auth: {
      getSession: async () => ({ data: { session: null }, error: unavailableError }),
      getUser: async () => ({ data: { user: null }, error: unavailableError }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signOut: async () => ({ error: unavailableError }),
      signInWithPassword: async () => ({ data: null, error: unavailableError }),
      signUp: async () => ({ data: null, error: unavailableError }),
      signInWithOAuth: async () => ({ data: null, error: unavailableError }),
      resetPasswordForEmail: async () => ({ data: null, error: unavailableError }),
      updateUser: async () => ({ data: null, error: unavailableError }),
    },
  } as any;
}

export const supabase = hasSupabaseConfig
  ? createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : createNoopSupabase();
