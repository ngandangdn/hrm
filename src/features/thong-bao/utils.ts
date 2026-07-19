import type { AxiosError } from 'axios';

import type { NhanVienNhanOption, ThongBao } from './types';

export const MANAGER_ROLE_IDS = new Set(['MANAGER', 'Manager', 'QUAN_LY', 'QuanLy']);
export const HCNS_OR_ADMIN_ROLE_IDS = new Set(['ADMIN', 'Admin', 'admin', 'HCNS', 'HR', 'QuanLyHCNS', 'MANAGER_HCNS']);

export const DEMO_EMPLOYEE_OPTIONS: NhanVienNhanOption[] = [
  { id_NhanVien: 'NV001', hoTen: 'Đặng Kim Ngân', email: 'hcns@hicas.com.vn', chucVu: 'Trưởng phòng HCNS' },
  { id_NhanVien: 'NV003', hoTen: 'Phạm Hoàng Nam', email: 'quanly@hicas.com.vn', chucVu: 'Quản lý vận hành' },
  { id_NhanVien: 'NV004', hoTen: 'Nguyễn Thu Hà', email: 'nhanvien@hicas.com.vn', chucVu: 'Nhân viên Hành chính' },
];

export function canCreateThongBao(roleId?: string | null) {
  return Boolean(roleId && (HCNS_OR_ADMIN_ROLE_IDS.has(roleId) || MANAGER_ROLE_IDS.has(roleId)));
}

export function isHcnsOrAdmin(roleId?: string | null) {
  return Boolean(roleId && HCNS_OR_ADMIN_ROLE_IDS.has(roleId));
}

export function getBackendMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<{ detail?: string; message?: string }>;
  return axiosError.response?.data?.detail ?? axiosError.response?.data?.message ?? fallback;
}

export function formatNotificationTime(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

export function notificationTypeColor(item: ThongBao) {
  if (item.trangThaiDoc === 0) return 'processing';
  if (item.loaiThongBao.toLowerCase().includes('khẩn')) return 'error';
  return 'default';
}
