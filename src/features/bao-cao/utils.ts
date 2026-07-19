import type { AxiosError } from 'axios';

import type { BaoCaoFilter, DinhDangBaoCao, LoaiBaoCao } from './types';

export const REPORT_MANAGER_ROLE_IDS = new Set(['MANAGER', 'Manager', 'QUAN_LY', 'QuanLy']);
export const REPORT_SENIOR_ROLE_IDS = new Set(['ADMIN', 'Admin', 'admin', 'HCNS', 'HR', 'QuanLyHCNS', 'MANAGER_HCNS']);

export const REPORT_LABELS: Record<LoaiBaoCao, string> = {
  'hanh-chinh': 'Hành chính',
  'hieu-suat': 'Hiệu suất',
  'tong-hop': 'Tổng hợp',
  'quan-tri': 'Quản trị',
};

export function canViewBaoCao(roleId?: string | null) {
  return Boolean(roleId && (REPORT_MANAGER_ROLE_IDS.has(roleId) || REPORT_SENIOR_ROLE_IDS.has(roleId)));
}

export function getBackendMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<{ detail?: string; message?: string }>;
  return axiosError.response?.data?.detail ?? axiosError.response?.data?.message ?? fallback;
}

export function isForbidden(error: unknown) {
  if (!error) return false;
  const axiosError = error as AxiosError;
  return axiosError.response?.status === 403;
}

export function formatValue(value: unknown) {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'number') return value.toLocaleString('vi-VN', { maximumFractionDigits: 2 });
  if (typeof value === 'string' && !Number.isNaN(Number(value)) && value.trim() !== '') {
    return Number(value).toLocaleString('vi-VN', { maximumFractionDigits: 2 });
  }
  return String(value);
}

export function downloadBlob(blob: Blob, loai: LoaiBaoCao, dinhDang: DinhDangBaoCao, filters: BaoCaoFilter) {
  const extension = dinhDang === 'excel' ? 'xlsx' : 'pdf';
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `bao_cao_${loai}_${filters.tu_ngay}_${filters.den_ngay}.${extension}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
