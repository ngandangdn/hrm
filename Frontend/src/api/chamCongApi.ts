import { axiosClient } from './axiosClient';
import type { ApiResponse } from '@/types/common';

export type BangCongItem = {
  id_BangCong: string;
  id_NhanVien: string;
  tenBangCong: string;
  loaiHinhTinhCong: 'tingop' | 'redmine' | string;
  trangThaiKy: string;
  tuNgay: string;
  denNgay: string;
  tongGioLogtime?: string | number | null;
  tongGioLogtimeThucTe?: string | number | null;
  ngayCongQuyDoi?: string | number | null;
  soLanDiMuon?: number | null;
  tenDuAn_Task?: string | null;
};

export type BangCongResponse = {
  trangThaiKy: string;
  du_lieu: BangCongItem[];
  message?: string;
};

export type ImportPreviewItem = {
  id_NhanVien: string;
  tenBangCong: string;
  loaiHinhTinhCong: string;
  tongGioLogtime?: string | number | null;
  tongGioLogtimeThucTe?: string | number | null;
  tenDuAn_Task?: string | null;
  soLanDiMuon?: number | null;
  tuNgay: string;
  denNgay: string;
};

export type ImportPreviewResponse = {
  preview_id: string;
  tong_dong: number;
  du_lieu: ImportPreviewItem[];
};

export type ImportConfirmResponse = {
  them_moi: number;
  cap_nhat: number;
};

export type DonGiaiTrinhCong = {
  id_DonGiaiTrinh: string;
  ngayGiaiTrinh: string;
  ngayTao: string;
  trangThai: number;
  lyDo: string;
  lyDoTuChoi?: string | null;
  thoiGianDuyet?: string | null;
  nguoiDuyet: string;
  id_NhanVien: string;
  id_BangCong: string;
};

export type DuyetBangCongResponse = {
  bang_cong: Array<BangCongItem & { trangThai?: number }>;
  don_giai_trinh_cho_duyet: DonGiaiTrinhCong[];
};

export type ApiResult<T> = {
  data: T;
  message: string;
};

export const getBangCong = async (thang: number, nam: number, id_nhan_vien?: string) => {
  const params: Record<string, string | number> = { thang, nam };
  if (id_nhan_vien) {
    params.id_nhan_vien = id_nhan_vien;
  }
  const response = await axiosClient.get<ApiResponse<BangCongResponse>>('/api/cham-cong/bang-cong', { params });
  return response.data.data;
};

export const importChamCong = async (file: File, nguon: 'tingop' | 'redmine') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('nguon', nguon);
  const response = await axiosClient.post<ApiResponse<ImportPreviewResponse>>('/api/cham-cong/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return { data: response.data.data, message: response.data.message };
};

export const confirmImportChamCong = async (preview_id: string) => {
  const response = await axiosClient.post<ApiResponse<ImportConfirmResponse>>('/api/cham-cong/import/xac-nhan', { preview_id });
  return { data: response.data.data, message: response.data.message };
};

export const submitGiaiTrinh = async (payload: { ngayGiaiTrinh: string; lyDo: string; id_BangCong?: string }, file?: File) => {
  const formData = new FormData();
  formData.append('payload_json', JSON.stringify(payload));
  if (file) {
    formData.append('file', file);
  }
  const response = await axiosClient.post<ApiResponse<DonGiaiTrinhCong>>('/api/cham-cong/giai-trinh', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return { data: response.data.data, message: response.data.message };
};

export const getDuyetBangCong = async () => {
  const response = await axiosClient.get<ApiResponse<DuyetBangCongResponse>>('/api/cham-cong/duyet-bang-cong');
  return response.data.data;
};

export const approveGiaiTrinh = async (id_don: string, payload: { soGioCong: number }) => {
  const response = await axiosClient.post<ApiResponse<DonGiaiTrinhCong>>(`/api/cham-cong/don-giai-trinh/${id_don}/dong-y`, payload);
  return { data: response.data.data, message: response.data.message };
};

export const rejectGiaiTrinh = async (id_don: string, payload: { lyDoTuChoi: string }) => {
  const response = await axiosClient.post<ApiResponse<DonGiaiTrinhCong>>(`/api/cham-cong/don-giai-trinh/${id_don}/tu-choi`, payload);
  return { data: response.data.data, message: response.data.message };
};

export const finalizeBangCong = async (id_bang_cong: string) => {
  const response = await axiosClient.post<ApiResponse<BangCongItem>>(`/api/cham-cong/${id_bang_cong}/chot`);
  return { data: response.data.data, message: response.data.message };
};
