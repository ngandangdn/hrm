import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, StopOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';

import type { LeaveStatus } from './types';

export const HCNS_OR_ADMIN_ROLE_IDS = new Set(['ADMIN', 'Admin', 'admin', 'HCNS', 'HR', 'QuanLyHCNS', 'MANAGER_HCNS']);

export const LEAVE_STATUS_META: Record<LeaveStatus, { text: string; color: string; icon: ReactNode }> = {
  0: { text: 'Chờ duyệt', color: 'orange', icon: <ClockCircleOutlined /> },
  1: { text: 'Đã duyệt', color: 'success', icon: <CheckCircleOutlined /> },
  2: { text: 'Từ chối', color: 'error', icon: <CloseCircleOutlined /> },
  3: { text: 'Đã hủy', color: 'default', icon: <StopOutlined /> },
};

export const LEAVE_TYPE_OPTIONS = [
  { label: 'Phép năm', value: 'Phep nam' },
  { label: 'Nghỉ ốm', value: 'Nghi om' },
  { label: 'Nghỉ không lương', value: 'Nghi khong luong' },
  { label: 'Nghỉ việc riêng', value: 'Nghi viec rieng' },
];

export const PAGE_SIZE_OPTIONS = [10, 20];
