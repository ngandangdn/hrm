import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { axiosClient } from '@/api/axiosClient';
import type { ApiResponse } from '@/types/common';
import type { TaoThongBaoPayload, TaoThongBaoResponse, ThongBao, ThongBaoUnreadCount } from './types';

export const thongBaoKeys = {
  all: ['thong-bao'] as const,
  list: (page: number, size: number) => [...thongBaoKeys.all, 'list', page, size] as const,
  unread: ['thong-bao', 'dem-chua-doc'] as const,
};

function invalidateThongBao(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: thongBaoKeys.all });
  queryClient.invalidateQueries({ queryKey: thongBaoKeys.unread });
}

export function useThongBaoList(page = 1, size = 20) {
  return useQuery({
    queryKey: thongBaoKeys.list(page, size),
    queryFn: async () => {
      const response = await axiosClient.get<ApiResponse<ThongBao[]>>('/api/thong-bao', { params: { page, size } });
      return response.data;
    },
  });
}

export function useSoLuongChuaDoc() {
  return useQuery({
    queryKey: thongBaoKeys.unread,
    queryFn: async () => {
      const response = await axiosClient.get<ApiResponse<ThongBaoUnreadCount>>('/api/thong-bao/dem-chua-doc');
      return response.data.data;
    },
    // Polling 30s is đủ dùng cho phạm vi đồ án; WebSocket/SSE realtime là cải tiến ngoài batch F6.
    refetchInterval: 30_000,
  });
}

export function useDanhDauDaDoc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (idThongBao: string) => {
      const response = await axiosClient.post<ApiResponse<ThongBao>>(`/api/thong-bao/${idThongBao}/danh-dau-da-doc`);
      return response.data;
    },
    onSuccess: () => invalidateThongBao(queryClient),
  });
}

export function useDanhDauTatCaDaDoc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await axiosClient.post<ApiResponse<{ so_luong_da_cap_nhat: number }>>('/api/thong-bao/danh-dau-tat-ca-da-doc');
      return response.data;
    },
    onSuccess: () => invalidateThongBao(queryClient),
  });
}

export function useTaoThongBao() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: TaoThongBaoPayload) => {
      const response = await axiosClient.post<ApiResponse<TaoThongBaoResponse>>('/api/thong-bao', payload);
      return response.data;
    },
    onSuccess: () => invalidateThongBao(queryClient),
  });
}
