import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { AuthUser, LoginResponseData } from '@/features/auth/types';

type LoginPayload = LoginResponseData & {
  email: string;
};

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (data: LoginPayload) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      login: (data) =>
        set({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          user: {
            id_TaiKhoan: data.id_TaiKhoan,
            id_VaiTro: data.id_VaiTro,
            email: data.email,
          },
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'hicas-auth',
      // Security trade-off: Bearer JWT in localStorage can be read by XSS.
      // This follows the backend Bearer-token contract for the thesis scope; a stronger production design would use httpOnly cookies.
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
