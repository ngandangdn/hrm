import { useQuery } from '@tanstack/react-query';

import { axiosClient } from '@/api/axiosClient';
import type { ApiResponse } from '@/types/common';
import type { BaoCaoDanhMuc, BaoCaoFilter, BaoCaoResponse, DinhDangBaoCao, LoaiBaoCao, XuatBaoCaoRequest } from './types';

export const baoCaoKeys = {
  all: ['bao-cao'] as const,
  danhMuc: ['bao-cao', 'danh-muc'] as const,
  detail: (loai: LoaiBaoCao, filters: BaoCaoFilter) => ['bao-cao', loai, filters] as const,
};

function definedParams(filters: BaoCaoFilter) {
  return Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== undefined && value !== ''));
}

export function useDanhMucBaoCao() {
  return useQuery({
    queryKey: baoCaoKeys.danhMuc,
    queryFn: async () => {
      const response = await axiosClient.get<ApiResponse<BaoCaoDanhMuc[]>>('/api/bao-cao/danh-muc');
      return response.data.data;
    },
  });
}

export function useBaoCao(loai: LoaiBaoCao, filters: BaoCaoFilter) {
  return useQuery({
    queryKey: baoCaoKeys.detail(loai, filters),
    queryFn: async () => {
      const response = await axiosClient.get<ApiResponse<BaoCaoResponse>>(`/api/bao-cao/${loai}`, {
        params: definedParams(filters),
      });
      return response.data;
    },
    retry: false,
  });
}

export async function xuatBaoCao(loai: LoaiBaoCao, filters: BaoCaoFilter, dinh_dang: DinhDangBaoCao) {
  const payload: XuatBaoCaoRequest = { ...filters, dinh_dang };
  const response = await axiosClient.post(`/api/bao-cao/${loai}/xuat`, payload, { responseType: 'blob' });
  return response.data as Blob;
}
