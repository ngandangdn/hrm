import type { LichHop, PhongHop } from './types';

export const MANAGER_ROLE_IDS = new Set(['MANAGER', 'Manager', 'QUAN_LY', 'QuanLy']);
export const HCNS_OR_ADMIN_ROLE_IDS = new Set(['ADMIN', 'Admin', 'admin', 'HCNS', 'HR', 'QuanLyHCNS', 'MANAGER_HCNS']);

export function isHcnsOrAdmin(roleId?: string | null) {
  return Boolean(roleId && HCNS_OR_ADMIN_ROLE_IDS.has(roleId));
}

export function canModerateLichHop(roleId?: string | null) {
  return Boolean(roleId && (HCNS_OR_ADMIN_ROLE_IDS.has(roleId) || MANAGER_ROLE_IDS.has(roleId)));
}

export function lichHopStatusLabel(status: number) {
  if (status === 0) return 'Chờ duyệt';
  if (status === 1) return 'Đã duyệt';
  if (status === 2) return 'Đã hủy';
  if (status === 3) return 'Từ chối';
  return 'Không xác định';
}

export function lichHopStatusColor(status: number) {
  if (status === 0) return 'gold';
  if (status === 1) return 'green';
  if (status === 2) return 'default';
  if (status === 3) return 'red';
  return 'default';
}

export function priorityLabel(value?: string | null) {
  if (value === 'high') return 'Cao';
  if (value === 'urgent') return 'Khẩn cấp';
  return 'Bình thường';
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

export function roomName(rooms: PhongHop[] | undefined, roomId: string) {
  return rooms?.find((room) => room.id_Phong === roomId)?.tenPhong ?? roomId;
}

export function canCancelLichHop(item: LichHop, currentEmployeeId?: string | null, roleId?: string | null) {
  const startsInFuture = new Date(item.thoiGianBatDau).getTime() > Date.now();
  const isOwner = currentEmployeeId ? currentEmployeeId === item.id_NhanVien : true;
  return item.trangThai !== 2 && startsInFuture && (isOwner || isHcnsOrAdmin(roleId));
}
