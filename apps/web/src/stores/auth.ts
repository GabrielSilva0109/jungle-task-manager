import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthUser, AuthTokens, LoginDto, RegisterDto } from '@jungle/types';
import { authApi } from '../services/api';

interface AuthState {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => void;
  refreshTokens: () => Promise<void>;
  initialize: () => void;
  setUser: (user: AuthUser) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (data: LoginDto) => {
        set({ isLoading: true });
        try {
          const response = await authApi.login(data);
          set({
            user: response.user,
            tokens: response.tokens,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data: RegisterDto) => {
        set({ isLoading: true });
        try {
          const response = await authApi.register(data);
          set({
            user: response.user,
            tokens: response.tokens,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        const { tokens } = get();
        if (tokens?.accessToken) {
          authApi.logout().catch(console.error);
        }
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
        });
      },

      refreshTokens: async () => {
        const { tokens } = get();
        if (!tokens?.refreshToken) return;

        try {
          const newTokens = await authApi.refresh(tokens.refreshToken);
          set({ tokens: newTokens });
        } catch (error) {
          get().logout();
          throw error;
        }
      },

      initialize: () => {
        const { tokens } = get();
        if (tokens?.accessToken) {
          set({ isAuthenticated: true });
        }
      },

      setUser: (user: AuthUser) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
      }),
    },
  ),
);