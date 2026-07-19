import { Button, Modal, Tag, Typography } from 'antd';
import { useState } from 'react';

import { LEAVE_STATUS_META } from './constants';
import type { DonNghiPhep, LeaveStatus } from './types';
import { formatDateOnly, formatDateTime, formatLeaveNumber } from './utils';

const { Text } = Typography;

export function LeaveStatusTag({ status }: { status: LeaveStatus }) {
  const meta = LEAVE_STATUS_META[status] ?? LEAVE_STATUS_META[0];
  return (
    <Tag color={meta.color} icon={meta.icon}>
      {meta.text}
    </Tag>
  );
}

export function UnknownTotalPager({
  page,
  size,
  currentCount,
  loading,
  onPageChange,
}: {
  page: number;
  size: number;
  currentCount: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <Text className="text-hicas-muted">
        Trang {page}, hiển thị {currentCount} bản ghi
      </Text>
      <div className="flex gap-2">
        <Button disabled={loading || page <= 1} onClick={() => onPageChange(page - 1)}>
          Trước
        </Button>
        <Button disabled={loading || currentCount < size} onClick={() => onPageChange(page + 1)}>
          Sau
        </Button>
      </div>
    </div>
  );
}

export function LeaveRequestMiniDetail({ request }: { request: DonNghiPhep }) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <Text className="text-hicas-muted">Mã đơn</Text>
          <div className="font-semibold">{request.id_DonPhep}</div>
        </div>
        <div>
          <Text className="text-hicas-muted">Trạng thái</Text>
          <div>
            <LeaveStatusTag status={request.trangThai} />
          </div>
        </div>
        <div>
          <Text className="text-hicas-muted">Nhân viên</Text>
          <div className="font-semibold">{request.id_NhanVien ?? '—'}</div>
        </div>
        <div>
          <Text className="text-hicas-muted">Loại phép</Text>
          <div className="font-semibold">{request.loaiPhep}</div>
        </div>
        <div>
          <Text className="text-hicas-muted">Thời gian nghỉ</Text>
          <div className="font-semibold">
            {formatDateOnly(request.tuNgay)} - {formatDateOnly(request.denNgay)}
          </div>
        </div>
        <div>
          <Text className="text-hicas-muted">Số ngày nghỉ</Text>
          <div className="font-semibold">{formatLeaveNumber(request.so_ngay_nghi)} ngày</div>
        </div>
        <div>
          <Text className="text-hicas-muted">Ngày tạo</Text>
          <div className="font-semibold">{formatDateTime(request.ngayTao)}</div>
        </div>
        <div>
          <Text className="text-hicas-muted">Người duyệt</Text>
          <div className="font-semibold">{request.nguoiDuyet}</div>
        </div>
      </div>
      <div>
        <Text className="text-hicas-muted">Lý do</Text>
        <div className="mt-1 rounded-lg border border-hicas-border bg-white p-3">{request.lyDo}</div>
      </div>
      {request.lyDoTuChoi && (
        <div>
          <Text className="text-hicas-muted">Lý do từ chối</Text>
          <div className="mt-1 rounded-lg border border-red-100 bg-red-50 p-3 text-red-700">{request.lyDoTuChoi}</div>
        </div>
      )}
    </div>
  );
}

export function useRejectModal() {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const close = () => {
    setOpen(false);
    setReason('');
  };
  return { open, reason, setReason, setOpen, close };
}

export function confirmAction(title: string, content: string, onOk: () => void) {
  Modal.confirm({
    title,
    content,
    okText: 'Xác nhận',
    cancelText: 'Đóng',
    onOk,
  });
}
