import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { axiosClient } from '@/api/axiosClient';
import type { ApiResponse } from '@/types/common';
import { nghiPhepKeys } from './queryKeys';
import type {
  BangPhepFilters,
  BangPhepItem,
  DanhSachDonPhepFilters,
  DonNghiPhep,
  DonNghiPhepDetail,
  LeaveStatus,
  LichSuPhepFilters,
  TaoDonPhepPayload,
} from './types';

function definedParams(params: Record<string, string | number | undefined>) {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== ''));
}

function invalidateLeaveQueries(queryClient: ReturnType<typeof useQueryClient>, idDon?: string) {
  queryClient.invalidateQueries({ queryKey: nghiPhepKeys.all });
  if (idDon) {
    queryClient.invalidateQueries({ queryKey: nghiPhepKeys.detail(idDon) });
  }
}

export function useBangPhep(filters: BangPhepFilters) {
  return useQuery({
    queryKey: nghiPhepKeys.bangPhep(filters),
    queryFn: async () => {
      const response = await axiosClient.get<ApiResponse<BangPhepItem[]>>('/api/nghi-phep/bang-phep', {
        params: definedParams({ nam: filters.nam, page: filters.page, size: filters.size }),
      });
      return response.data.data;
    },
  });
}

export function useLichSuPhep(filters: LichSuPhepFilters) {
  return useQuery({
    queryKey: nghiPhepKeys.lichSu(filters),
    queryFn: async () => {
      const response = await axiosClient.get<ApiResponse<DonNghiPhep[]>>('/api/nghi-phep/lich-su', {
        params: definedParams({
          id_nhan_vien: filters.id_nhan_vien,
          nam: filters.nam,
          thang: filters.thang,
          page: filters.page,
          size: filters.size,
        }),
      });
      return response.data.data;
    },
  });
}

export function useDanhSachDonPhep(filters: DanhSachDonPhepFilters) {
  return useQuery({
    queryKey: nghiPhepKeys.danhSach(filters),
    queryFn: async () => {
      const response = await axiosClient.get<ApiResponse<DonNghiPhep[]>>('/api/nghi-phep/danh-sach', {
        params: definedParams({
          nam: filters.nam,
          trang_thai: filters.trang_thai,
          tu_ngay: filters.tu_ngay,
          den_ngay: filters.den_ngay,
          page: filters.page,
          size: filters.size,
        }),
      });
      return response.data.data;
    },
  });
}

export function useChiTietDonPhep(idDon?: string) {
  return useQuery({
    queryKey: nghiPhepKeys.detail(idDon ?? ''),
    enabled: Boolean(idDon),
    queryFn: async () => {
      const response = await axiosClient.get<ApiResponse<DonNghiPhepDetail>>(`/api/nghi-phep/don/${idDon}`);
      return response.data.data;
    },
  });
}

export function useTaoDonPhep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: TaoDonPhepPayload) => {
      const response = await axiosClient.post<ApiResponse<DonNghiPhep>>('/api/nghi-phep/don', payload);
      return response.data;
    },
    retry: false,
    onSuccess: () => invalidateLeaveQueries(queryClient),
  });
}

export function useDuyetDonPhep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ idDon, ghiChu }: { idDon: string; ghiChu?: string }) => {
      const response = await axiosClient.post<ApiResponse<DonNghiPhep>>(`/api/nghi-phep/don/${idDon}/duyet`, { ghiChu });
      return response.data;
    },
    retry: false,
    onSuccess: (_, variables) => invalidateLeaveQueries(queryClient, variables.idDon),
  });
}

export function useTuChoiDonPhep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ idDon, lyDoTuChoi }: { idDon: string; lyDoTuChoi: string }) => {
      const response = await axiosClient.post<ApiResponse<DonNghiPhep>>(`/api/nghi-phep/don/${idDon}/tu-choi`, { lyDoTuChoi });
      return response.data;
    },
    retry: false,
    onSuccess: (_, variables) => invalidateLeaveQueries(queryClient, variables.idDon),
  });
}

export function useHuyDonPhep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (idDon: string) => {
      const response = await axiosClient.post<ApiResponse<DonNghiPhep>>(`/api/nghi-phep/don/${idDon}/huy`, {});
      return response.data;
    },
    retry: false,
    onSuccess: (_, idDon) => invalidateLeaveQueries(queryClient, idDon),
  });
}

export type { LeaveStatus };
