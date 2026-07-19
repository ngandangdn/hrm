import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { axiosClient } from '@/api/axiosClient';
import type { ApiResponse } from '@/types/common';

import type { LichHop, LichHopCreatePayload, LichHopXuLyPayload, NhanVienOption, PhongHop } from './types';

const PHONG_HOP_ENDPOINT = '/api/danh-muc/phong-hop';
const LICH_HOP_ENDPOINT = '/api/danh-muc/lich-hop';
const NHAN_VIEN_OPTIONS_ENDPOINT = '/api/danh-muc/nhan-vien-options';

export function usePhongHopOptions() {
  return useQuery({
    queryKey: ['phong-hop', 'rooms'],
    queryFn: async () => {
      const response = await axiosClient.get<ApiResponse<PhongHop[]>>(PHONG_HOP_ENDPOINT, {
        params: { page: 1, size: 100 },
      });
      return response.data.data;
    },
  });
}

export function useLichHopList() {
  return useQuery({
    queryKey: ['phong-hop', 'lich-hop'],
    queryFn: async () => {
      const response = await axiosClient.get<ApiResponse<LichHop[]>>(LICH_HOP_ENDPOINT);
      return response.data.data;
    },
  });
}

export function useNhanVienLichHopOptions() {
  return useQuery({
    queryKey: ['phong-hop', 'nhan-vien-options'],
    queryFn: async () => {
      const response = await axiosClient.get<ApiResponse<NhanVienOption[]>>(NHAN_VIEN_OPTIONS_ENDPOINT);
      return response.data.data;
    },
  });
}

export function useDangKyHop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: LichHopCreatePayload) => {
      const response = await axiosClient.post<ApiResponse<LichHop>>(LICH_HOP_ENDPOINT, payload);
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['phong-hop', 'lich-hop'] }),
  });
}

export function useHuyLichHop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosClient.delete<ApiResponse<LichHop>>(`${LICH_HOP_ENDPOINT}/${encodeURIComponent(id)}`);
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['phong-hop', 'lich-hop'] }),
  });
}

export function useDuyetLichHop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosClient.post<ApiResponse<LichHop>>(`${LICH_HOP_ENDPOINT}/${encodeURIComponent(id)}/duyet`);
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['phong-hop', 'lich-hop'] }),
  });
}

export function useTuChoiLichHop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: LichHopXuLyPayload }) => {
      const response = await axiosClient.post<ApiResponse<LichHop>>(`${LICH_HOP_ENDPOINT}/${encodeURIComponent(id)}/tu-choi`, payload);
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['phong-hop', 'lich-hop'] }),
  });
}

export function useCanThiepLichHop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: LichHopXuLyPayload }) => {
      const response = await axiosClient.post<ApiResponse<LichHop>>(`${LICH_HOP_ENDPOINT}/${encodeURIComponent(id)}/can-thiep`, payload);
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['phong-hop', 'lich-hop'] }),
  });
}
