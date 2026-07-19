import { useMutation, useQuery } from '@tanstack/react-query';

import { axiosClient } from '@/api/axiosClient';
import type { ApiResponse } from '@/types/common';
import type { HoSoCaNhan, NhanVienHoSoListItem } from './types';

type YeuCauCapNhatHoSo = {
  id_YeuCau: string;
  ngayGui: string;
  trangThai: number;
  id_NhanVien: string;
  nguoiDuyet?: string | null;
  thoiGianDuyet?: string | null;
  ghiChu?: string | null;
};

export function useHoSoCaNhan(idNhanVien?: string) {
  return useQuery({
    queryKey: ['ho-so-ca-nhan', idNhanVien],
    enabled: Boolean(idNhanVien),
    queryFn: async () => {
      const response = await axiosClient.get<ApiResponse<HoSoCaNhan>>(`/api/ho-so-ca-nhan/${idNhanVien}`);
      return response.data.data;
    },
  });
}

export function useDanhSachHoSoNhanSu() {
  return useQuery({
    queryKey: ['ho-so-ca-nhan', 'list'],
    queryFn: async () => {
      const response = await axiosClient.get<ApiResponse<NhanVienHoSoListItem[]>>('/api/ho-so-ca-nhan');
      return response.data.data;
    },
  });
}

export function useUploadFileHopDong() {
  return useMutation({
    mutationFn: async (payload: { idNhanVien: string; file: File }) => {
      const formData = new FormData();
      formData.append('file', payload.file);
      const response = await axiosClient.post<ApiResponse<HoSoCaNhan>>(`/api/ho-so-ca-nhan/${payload.idNhanVien}/hop-dong/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    },
  });
}

export function useUploadFileHoSo() {
  return useMutation({
    mutationFn: async (payload: { idNhanVien: string; loaiHoSo: string; files: File[] }) => {
      const formData = new FormData();
      formData.append('loai_ho_so', payload.loaiHoSo);
      payload.files.forEach((file) => formData.append('files', file));
      const response = await axiosClient.post<ApiResponse<HoSoCaNhan>>(`/api/ho-so-ca-nhan/${payload.idNhanVien}/ho-so/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    },
  });
}

export function useCreateYeuCauCapNhat() {
  return useMutation({
    mutationFn: async (payload: { chiTiet: Array<{ tenTruong: string; nhomThongTin: string; giaTriCu?: string; giaTriMoi: string; ghiChu?: string }> }) => {
      const formData = new FormData();
      formData.append('payload_json', JSON.stringify(payload));
      const response = await axiosClient.post<ApiResponse<YeuCauCapNhatHoSo>>('/api/ho-so/yeu-cau-cap-nhat', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    },
  });
}
