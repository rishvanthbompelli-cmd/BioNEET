import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { withAdminFlag } from '../lib/adminConfig';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      login: (userData, token, refreshToken) => {
        set({
          user: withAdminFlag(userData),
          token,
          refreshToken,
          isAuthenticated: true,
        });
      },

      setTokens: (token, refreshToken) => {
        set({ token, refreshToken });
      },

      updateUser: (updates) => {
        set((state) => ({
          user: withAdminFlag(state.user ? { ...state.user, ...updates } : updates),
        }));
      },

      logout: () => {
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
      },

      isAdmin: () => !!get().user?.isAdmin,

      getRefreshToken: () => get().refreshToken,
    }),
    {
      name: 'daily-mission-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
