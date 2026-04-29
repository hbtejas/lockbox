import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user:    User | null;
  session: Session | null;
  profile: { name: string; plan: string; email: string } | null;
  loading: boolean;
  // actions
  login:    (email: string, password: string) => Promise<void>;
  signup:   (email: string, password: string, name: string) => Promise<void>;
  logout:   () => Promise<void>;
  fetchProfile: () => Promise<void>;
  initialize: () => () => void;  // returns unsubscribe function
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user:    null,
      session: null,
      profile: null,
      loading: true,

      initialize: () => {
        // Restore existing session on mount
        supabase.auth.getSession().then(({ data }) => {
          set({ user: data.session?.user ?? null, session: data.session, loading: false });
          if (data.session?.user) get().fetchProfile();
        });

        // Listen to all future auth events
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            set({ user: session?.user ?? null, session, loading: false });
            if (session?.user) {
              get().fetchProfile();
            } else {
              set({ profile: null });
            }
          }
        );
        return () => subscription.unsubscribe();
      },

      login: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      },

      signup: async (email, password, name) => {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (error) throw error;
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, session: null, profile: null });
      },

      fetchProfile: async () => {
        const uid = get().user?.id;
        if (!uid) return;
        const { data } = await supabase
          .from('profiles')
          .select('name, plan, email')
          .eq('id', uid)
          .single();
        if (data) set({ profile: data });
      },
    }),
    {
      name: 'lockbox-auth',
      partialize: (s) => ({ user: s.user, session: s.session }),
    }
  )
);
