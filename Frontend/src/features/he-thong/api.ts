import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { axiosClient } from '@/api/axiosClient';
import type { ApiResponse } from '@/types/common';
import type { PhanQuyenData, YeuCauCapNhat, YeuCauCapNhatDetail } from './types';

export function usePhanQuyen(idNhanVien?: string) {
  return useQuery({
    queryKey: ['phan-quyen', idNhanVien],
    enabled: Boolean(idNhanVien),
    queryFn: async () => {
      const response = await axiosClient.get<ApiResponse<PhanQuyenData>>(`/api/phan-quyen/${idNhanVien}`);
      return response.data.data;
    },
  });
}

export function useCapNhatPhanQuyen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ idNhanVien, roleIds }: { idNhanVien: string; roleIds: string[] }) => {
      const response = await axiosClient.put<ApiResponse<unknown>>(`/api/phan-quyen/${idNhanVien}`, {
        id_VaiTro_list: roleIds,
      });
      return response.data.data;
    },
    onSuccess: (_, variables) => queryClient.invalidateQueries({ queryKey: ['phan-quyen', variables.idNhanVien] }),
  });
}

export function useSaoChepQuyen(idNhanVienMau?: string) {
  return useQuery({
    queryKey: ['phan-quyen-copy-source', idNhanVienMau],
    enabled: false,
    queryFn: async () => {
      const response = await axiosClient.get<ApiResponse<PhanQuyenData>>(`/api/phan-quyen/${idNhanVienMau}`);
      return response.data.data.vai_tro_da_gan;
    },
  });
}

export function useYeuCauCapNhat(isHcns: boolean, selectedId?: string) {
  return useQuery({
    queryKey: ['yeu-cau-cap-nhat', isHcns ? 'hcns' : selectedId],
    enabled: isHcns || Boolean(selectedId),
    queryFn: async () => {
      if (isHcns) {
        const response = await axiosClient.get<ApiResponse<YeuCauCapNhat[]>>('/api/phe-duyet/yeu-cau-cap-nhat');
        return response.data.data;
      }
      const response = await axiosClient.get<ApiResponse<YeuCauCapNhatDetail>>(`/api/ho-so/yeu-cau-cap-nhat/${selectedId}`);
      return [response.data.data.yeu_cau];
    },
  });
}

export function useYeuCauCapNhatDetail(idYeuCau?: string) {
  return useQuery({
    queryKey: ['yeu-cau-cap-nhat-detail', idYeuCau],
    enabled: Boolean(idYeuCau),
    queryFn: async () => {
      const response = await axiosClient.get<ApiResponse<YeuCauCapNhatDetail>>(`/api/ho-so/yeu-cau-cap-nhat/${idYeuCau}`);
      return response.data.data;
    },
  });
}

export function useDuyetYeuCau() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (idYeuCau: string) => {
      const response = await axiosClient.post<ApiResponse<YeuCauCapNhat>>(`/api/phe-duyet/yeu-cau-cap-nhat/${idYeuCau}/duyet`, {});
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['yeu-cau-cap-nhat'] }),
  });
}

export function useTuChoiYeuCau() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ idYeuCau, ghiChu }: { idYeuCau: string; ghiChu: string }) => {
      const response = await axiosClient.post<ApiResponse<YeuCauCapNhat>>(`/api/phe-duyet/yeu-cau-cap-nhat/${idYeuCau}/tu-choi`, {
        ghiChu,
      });
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['yeu-cau-cap-nhat'] }),
  });
}

export function useHuyYeuCau() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (idYeuCau: string) => {
      const response = await axiosClient.delete<ApiResponse<YeuCauCapNhat>>(`/api/ho-so/yeu-cau-cap-nhat/${idYeuCau}`);
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['yeu-cau-cap-nhat'] }),
  });
}
