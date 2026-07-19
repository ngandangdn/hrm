import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { axiosClient } from '@/api/axiosClient';
import type { ApiResponse } from '@/types/common';
import type { ImportResult } from '@/components/common/ImportModal';
import type { PhongHop, PhongHopPayload } from './types';

const ENDPOINT = '/api/danh-muc/phong-hop';

export function useDanhMucPhongHop(page = 1, size = 20) {
  return useQuery({
    queryKey: ['danh-muc', ENDPOINT, page, size],
    queryFn: async () => {
      const response = await axiosClient.get<ApiResponse<PhongHop[]>>(ENDPOINT, { params: { page, size } });
      return response.data.data;
    },
  });
}

export function useCreatePhongHop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: PhongHopPayload) => {
      const response = await axiosClient.post<ApiResponse<PhongHop>>(ENDPOINT, payload);
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['danh-muc', ENDPOINT] }),
  });
}

export function useUpdatePhongHop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: PhongHopPayload }) => {
      const response = await axiosClient.put<ApiResponse<PhongHop>>(`${ENDPOINT}/${encodeURIComponent(id)}`, payload);
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['danh-muc', ENDPOINT] }),
  });
}

export function useDeletePhongHop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosClient.delete<ApiResponse<{ id_Phong: string }>>(`${ENDPOINT}/${encodeURIComponent(id)}`);
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['danh-muc', ENDPOINT] }),
  });
}

export function useImportPhongHop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axiosClient.post<ApiResponse<ImportResult>>(`${ENDPOINT}/import`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['danh-muc', ENDPOINT] }),
  });
}

export async function useExportPhongHop() {
  // Download blob là ngoại lệ kỹ thuật được phép dùng axiosClient trực tiếp ngoài React Query.
  const response = await axiosClient.get(`${ENDPOINT}/export`, { responseType: 'blob' });
  return response.data as Blob;
}
