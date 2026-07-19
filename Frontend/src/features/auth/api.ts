import { useMutation } from '@tanstack/react-query';

import { axiosClient } from '@/api/axiosClient';
import type { ApiResponse } from '@/types/common';
import type {
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponseData,
  ResetPasswordRequest,
  VerifyOtpRequest,
} from './types';

export function useLogin() {
  return useMutation({
    mutationFn: async (payload: LoginRequest) => {
      const response = await axiosClient.post<ApiResponse<LoginResponseData>>('/api/auth/login', payload);
      return response.data;
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (payload: ForgotPasswordRequest) => {
      const response = await axiosClient.post<ApiResponse<{ email: string }>>('/api/auth/forgot-password', payload);
      return response.data;
    },
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: async (payload: VerifyOtpRequest) => {
      const response = await axiosClient.post<ApiResponse<{ valid: boolean }>>('/api/auth/verify-otp', payload);
      return response.data;
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async (payload: ResetPasswordRequest) => {
      const response = await axiosClient.post<ApiResponse<{ email: string }>>('/api/auth/reset-password', payload);
      return response.data;
    },
  });
}
