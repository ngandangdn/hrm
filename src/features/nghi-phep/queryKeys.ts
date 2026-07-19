import type { BangPhepFilters, DanhSachDonPhepFilters, LichSuPhepFilters } from './types';

export const nghiPhepKeys = {
  all: ['nghi-phep'] as const,
  bangPhep: (filters: BangPhepFilters) => [...nghiPhepKeys.all, 'bang-phep', filters] as const,
  lichSu: (filters: LichSuPhepFilters) => [...nghiPhepKeys.all, 'lich-su', filters] as const,
  danhSach: (filters: DanhSachDonPhepFilters) => [...nghiPhepKeys.all, 'danh-sach', filters] as const,
  detail: (id: string) => [...nghiPhepKeys.all, 'don', id] as const,
};
