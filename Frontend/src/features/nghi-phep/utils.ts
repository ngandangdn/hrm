import type { AxiosError } from 'axios';

export function toNumber(value: string | number | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

export function formatLeaveNumber(value: string | number | null | undefined) {
  const numeric = toNumber(value);
  return Number.isInteger(numeric) ? String(numeric) : numeric.toFixed(1);
}

export function formatDateOnly(value?: string | null) {
  if (!value) return '—';
  const [datePart] = value.split('T');
  const [year, month, day] = datePart.split('-');
  if (!year || !month || !day) return '—';
  return `${day}/${month}/${year}`;
}

export function formatDateTime(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function getBackendMessage(error: unknown) {
  const axiosError = error as AxiosError<{ detail?: string; message?: string }>;
  return axiosError.response?.data?.detail ?? axiosError.response?.data?.message ?? 'Có lỗi xảy ra, vui lòng thử lại';
}

export function getHttpStatus(error: unknown) {
  const axiosError = error as AxiosError;
  return axiosError.response?.status;
}

export function currentYear() {
  return new Date().getFullYear();
}
