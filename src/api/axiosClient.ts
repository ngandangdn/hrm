import axios, { AxiosError } from 'axios';

import { useAuthStore } from '@/stores/authStore';

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
});

axiosClient.interceptors.request.use((config) => {
  // Step 1: read the single source of auth state from Zustand, not directly from localStorage.
  const token = useAuthStore.getState().accessToken;
  // Step 2: attach the Bearer token only when it exists.
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Step 3: return the enriched request config for Axios to continue.
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Step 1: backend returns 401 for expired/invalid access token.
    if (error.response?.status === 401) {
      // Step 2: this foundation batch intentionally does not implement automatic refresh-token flow.
      useAuthStore.getState().logout();
      // Step 3: force navigation to login so the user can authenticate again.
      if (window.location.pathname !== '/dang-nhap') {
        window.location.assign('/dang-nhap');
      }
    }
    return Promise.reject(error);
  },
);
