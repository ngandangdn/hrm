import { useMutation, useQuery } from '@tanstack/react-query';
import { axiosClient } from '@/api/axiosClient';
import type { ApiResponse } from '@/types/common';

export interface DonNghiViec {
  id_DonNghiViec: string;
  ngayTao: string;
  ngayLamViecCuoi: string;
  lyDoNghiViec: string;
  noiDungBanGiao: string;
  trangThai: number; // -1: Nháp, 0: Chờ duyệt, 1: Đã ra quyết định (giả định)
  ghiChu?: string;
  id_NhanVien: string;
}

export interface QuyetDinhNghiViec {
  id_QuyetDinh: string;
  soQuyetDinh: string;
  ngayKy: string;
  ngayHieuLuc: string;
  nguoiKy: string;
  lyDoNghiViec: string;
  tepQuyetDinh?: string;
  id_DonNghiViec: string;
}

export function useListDonNghiViec() {
  return useQuery({
    queryKey: ['nghi-viec', 'don'],
    queryFn: async () => {
      const response = await axiosClient.get<ApiResponse<DonNghiViec[]>>('/api/nghi-viec/don');
      return response.data.data;
    },
  });
}

export function useDonNghiViec(idDon?: string) {
  return useQuery({
    queryKey: ['nghi-viec', 'don', idDon],
    enabled: Boolean(idDon),
    queryFn: async () => {
      const response = await axiosClient.get<ApiResponse<DonNghiViec>>(`/api/nghi-viec/don/${idDon}`);
      return response.data.data;
    },
  });
}

export function useCreateDonNghiViec() {
  return useMutation({
    mutationFn: async (payload: { ngayLamViecCuoi: string; lyDoNghiViec: string; noiDungBanGiao: string; ghiChu?: string; is_draft?: boolean }) => {
      const url = payload.is_draft ? '/api/nghi-viec/don/nhap' : '/api/nghi-viec/don';
      const response = await axiosClient.post<ApiResponse<any>>(url, payload);
      return response.data.data;
    },
  });
}

export function useCreateQuyetDinh() {
  return useMutation({
    mutationFn: async (payload: {
      soQuyetDinh: string;
      ngayKy: string;
      ngayHieuLuc: string;
      nguoiKy: string;
      lyDoNghiViec: string;
      tepQuyetDinh?: string;
      banHanh: boolean;
      id_DonNghiViec: string;
    }) => {
      const response = await axiosClient.post<ApiResponse<QuyetDinhNghiViec>>('/api/nghi-viec/quyet-dinh', payload);
      return response.data.data;
    },
  });
}
