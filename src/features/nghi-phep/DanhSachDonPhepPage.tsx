import { Alert, Button, Form, Input, Modal, Select, Space, Table, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuthStore } from '@/stores/authStore';
import { HCNS_OR_ADMIN_ROLE_IDS, LEAVE_STATUS_META } from './constants';
import { LeaveRequestMiniDetail, LeaveStatusTag, UnknownTotalPager, confirmAction, useRejectModal } from './components';
import { useDanhSachDonPhep, useDuyetDonPhep, useHuyDonPhep, useTuChoiDonPhep } from './api';
import type { DanhSachDonPhepFilters, DonNghiPhep, LeaveStatus } from './types';
import { currentYear, formatDateOnly, formatDateTime, formatLeaveNumber, getBackendMessage, getHttpStatus } from './utils';

const PAGE_SIZE = 10;

export default function DanhSachDonPhepPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const canApprove = HCNS_OR_ADMIN_ROLE_IDS.has(user?.id_VaiTro ?? '');
  const [filters, setFilters] = useState<DanhSachDonPhepFilters>({ nam: currentYear(), page: 1, size: PAGE_SIZE });
  const [preview, setPreview] = useState<DonNghiPhep | null>(null);
  const [rejectTarget, setRejectTarget] = useState<DonNghiPhep | null>(null);
  const rejectModal = useRejectModal();
  const listQuery = useDanhSachDonPhep(filters);
  const approveMutation = useDuyetDonPhep();
  const rejectMutation = useTuChoiDonPhep();
  const cancelMutation = useHuyDonPhep();

  const handleBusinessError = (error: unknown) => {
    const status = getHttpStatus(error);
    if (status === 409) {
      Modal.warning({ title: 'Trạng thái đơn đã thay đổi', content: getBackendMessage(error) });
    } else {
      message.error(getBackendMessage(error));
    }
  };

  const approve = (record: DonNghiPhep) => {
    confirmAction('Duyệt đơn nghỉ phép?', `Xác nhận duyệt đơn ${record.id_DonPhep}.`, async () => {
      try {
        const response = await approveMutation.mutateAsync({ idDon: record.id_DonPhep });
        message.success(response.message || 'Duyệt đơn thành công');
      } catch (error) {
        handleBusinessError(error);
      }
    });
  };

  const cancel = (record: DonNghiPhep) => {
    confirmAction('Hủy đơn nghỉ phép?', `Xác nhận hủy đơn ${record.id_DonPhep}.`, async () => {
      try {
        const response = await cancelMutation.mutateAsync(record.id_DonPhep);
        message.success(response.message || 'Hủy đơn thành công');
      } catch (error) {
        handleBusinessError(error);
      }
    });
  };

  const columns: ColumnsType<DonNghiPhep> = [
    { title: 'Mã đơn', dataIndex: 'id_DonPhep', width: 170, fixed: 'left', render: (value: string) => <Link to={`/nghi-phep/don/${value}`}>{value}</Link> },
    { title: 'Nhân viên', dataIndex: 'id_NhanVien', width: 120 },
    { title: 'Ngày tạo', dataIndex: 'ngayTao', width: 150, render: formatDateTime },
    { title: 'Loại phép', dataIndex: 'loaiPhep', width: 150 },
    { title: 'Từ ngày', dataIndex: 'tuNgay', width: 120, render: formatDateOnly },
    { title: 'Đến ngày', dataIndex: 'denNgay', width: 120, render: formatDateOnly },
    { title: 'Số ngày', dataIndex: 'so_ngay_nghi', width: 100, render: formatLeaveNumber },
    { title: 'Trạng thái', dataIndex: 'trangThai', width: 130, render: (value) => <LeaveStatusTag status={value} /> },
    {
      title: 'Thao tác',
      key: 'action',
      width: 260,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => setPreview(record)}>
            Xem nhanh
          </Button>
          <Button size="small" onClick={() => navigate(`/nghi-phep/don/${record.id_DonPhep}`)}>
            Chi tiết
          </Button>
          {record.co_the_huy && (
            <Button size="small" danger loading={cancelMutation.isPending} onClick={() => cancel(record)}>
              Hủy
            </Button>
          )}
          {canApprove && record.trangThai === 0 && record.id_NhanVien !== user?.id_TaiKhoan && (
            <>
              <Button size="small" type="primary" loading={approveMutation.isPending} onClick={() => approve(record)}>
                Duyệt
              </Button>
              <Button
                size="small"
                danger
                onClick={() => {
                  setRejectTarget(record);
                  rejectModal.setOpen(true);
                }}
              >
                Từ chối
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="m-0 text-2xl font-bold text-hicas-text">Danh sách đơn nghỉ phép</h1>
          <p className="m-0 mt-1 text-hicas-muted">Theo dõi và xử lý các đơn nghỉ phép trong phạm vi phụ trách</p>
        </div>
        <Button type="primary" onClick={() => navigate('/nghi-phep/tao-don')}>
          Tạo đơn phép
        </Button>
      </div>

      {listQuery.isError && <Alert type="error" showIcon message="Không tải được danh sách đơn" description={getBackendMessage(listQuery.error)} />}

      <Form
        layout="inline"
        className="hicas-card gap-3 p-4"
        onFinish={(values: { nam?: number; trang_thai?: LeaveStatus; tu_ngay?: string; den_ngay?: string }) =>
          setFilters({ ...filters, ...values, page: 1 })
        }
        initialValues={{ nam: filters.nam }}
      >
        <Form.Item name="nam" label="Năm">
          <Input type="number" className="w-28" />
        </Form.Item>
        <Form.Item name="trang_thai" label="Trạng thái">
          <Select
            allowClear
            className="w-36"
            options={Object.entries(LEAVE_STATUS_META).map(([value, meta]) => ({ label: meta.text, value: Number(value) }))}
          />
        </Form.Item>
        <Form.Item name="tu_ngay" label="Từ ngày">
          <Input type="date" />
        </Form.Item>
        <Form.Item name="den_ngay" label="Đến ngày">
          <Input type="date" />
        </Form.Item>
        <Button htmlType="submit">Lọc</Button>
      </Form>

      <div className="hicas-card p-4">
        <Table
          rowKey="id_DonPhep"
          loading={listQuery.isFetching}
          dataSource={listQuery.data ?? []}
          columns={columns}
          pagination={false}
          scroll={{ x: 1280 }}
        />
        <UnknownTotalPager
          page={filters.page}
          size={filters.size}
          currentCount={listQuery.data?.length ?? 0}
          loading={listQuery.isFetching}
          onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
        />
      </div>

      <Modal title="Xem nhanh đơn nghỉ phép" open={Boolean(preview)} footer={null} onCancel={() => setPreview(null)} width={760}>
        {preview && <LeaveRequestMiniDetail request={preview} />}
      </Modal>

      <Modal
        title={`Từ chối đơn ${rejectTarget?.id_DonPhep ?? ''}`}
        open={rejectModal.open}
        okText="Từ chối"
        cancelText="Đóng"
        confirmLoading={rejectMutation.isPending}
        okButtonProps={{ danger: true, disabled: !rejectModal.reason.trim() || rejectMutation.isPending }}
        onCancel={rejectModal.close}
        onOk={async () => {
          if (!rejectTarget) return;
          try {
            const response = await rejectMutation.mutateAsync({ idDon: rejectTarget.id_DonPhep, lyDoTuChoi: rejectModal.reason.trim() });
            message.success(response.message || 'Từ chối đơn thành công');
            rejectModal.close();
            setRejectTarget(null);
          } catch (error) {
            handleBusinessError(error);
          }
        }}
      >
        <Input.TextArea rows={4} maxLength={255} showCount value={rejectModal.reason} onChange={(event) => rejectModal.setReason(event.target.value)} placeholder="Nhập lý do từ chối" />
      </Modal>
    </div>
  );
}
