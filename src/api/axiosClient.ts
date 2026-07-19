import axios, { AxiosError } from 'axios';

import { useAuthStore } from '@/stores/authStore';

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
});

axiosClient.interceptors.request.use((config) => {
  // getState() is Zustand's API for reading state outside the React tree (interceptors, utilities...).
  // Do not call useAuthStore() here because hooks only belong inside React components/hooks.
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
