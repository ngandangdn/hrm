import { useMutation, useQuery } from '@tanstack/react-query';
import { axiosClient } from '@/api/axiosClient';
import type { ApiResponse } from '@/types/common';

export interface TaiSan {
  id_TaiSan: string;
  tenTaiSan: string;
  serialNumber: string | null;
  ngayMua: string | null;
  giaTri: number | null;
  tinhTrang: string;
  trangThai: number; // 0: Đã cấp phát, 1: Sẵn sàng
}

export interface TaiSanCuaToiItem {
  id_GiaoNhan: string;
  id_TaiSan: string;
  tenTaiSan: string;
  serialNumber: string | null;
  ngayCapPhat: string;
  tinhTrangBanGiao: string;
}

export interface LichSuLuanChuyenItem {
  id_GiaoNhan: string;
  id_TaiSan: string;
  id_NhanVien: string;
  ngayCapPhat: string;
  tinhTrangBanGiao: string;
  ngayThuHoi: string | null;
  trangThai: number;
  dang_su_dung: boolean;
  tinhTrangThuHoi: string | null;
  tepBienBan: string | null;
}

export function useListTaiSan() {
  return useQuery({
    queryKey: ['tai-san'],
    queryFn: async () => {
      const response = await axiosClient.get<ApiResponse<TaiSan[]>>('/api/tai-san');
      return response.data.data;
    },
  });
}

export function useListTaiSanCuaToi() {
  return useQuery({
    queryKey: ['tai-san', 'cua-toi'],
    queryFn: async () => {
      const response = await axiosClient.get<ApiResponse<TaiSanCuaToiItem[]>>('/api/tai-san/cua-toi');
      return response.data.data;
    },
  });
}

export function useLichSuLuanChuyen(idTaiSan?: string) {
  return useQuery({
    queryKey: ['tai-san', idTaiSan, 'lich-su'],
    enabled: Boolean(idTaiSan),
    queryFn: async () => {
      const response = await axiosClient.get<ApiResponse<LichSuLuanChuyenItem[]>>(`/api/tai-san/${idTaiSan}/lich-su-luan-chuyen`);
      return response.data.data;
    },
  });
}

export function useCapPhatTaiSan() {
  return useMutation({
    mutationFn: async (payload: { id_nhan_vien: string; id_tai_san_list: string[]; ngay_cap_phat: string; tinh_trang_ban_giao: string }) => {
      const response = await axiosClient.post<ApiResponse<any>>('/api/tai-san/cap-phat', payload);
      return response.data.data;
    },
  });
}

export function useThuHoiTaiSan() {
  return useMutation({
    mutationFn: async ({ id_tai_san, payload }: { id_tai_san: string; payload: { ngay_thu_hoi: string; tinh_trang_thu_hoi: string; tep_bien_ban?: string } }) => {
      const response = await axiosClient.post<ApiResponse<any>>(`/api/tai-san/${id_tai_san}/thu-hoi`, payload);
      return response.data.data;
    },
  });
}
