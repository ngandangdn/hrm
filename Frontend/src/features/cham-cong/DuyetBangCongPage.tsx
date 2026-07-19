import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Form, Input, InputNumber, Modal, Space, Table, Tag, message } from 'antd';
import type { AxiosError } from 'axios';
import { useState } from 'react';

import {
  approveGiaiTrinh,
  finalizeBangCong,
  getDuyetBangCong,
  rejectGiaiTrinh,
  type DonGiaiTrinhCong,
} from '@/api/chamCongApi';

type DuyetBangCongItem = {
  id_BangCong: string;
  id_NhanVien: string;
  tenBangCong: string;
  tuNgay: string;
  denNgay: string;
  trangThai?: number;
  trangThaiKy?: string;
};

type RejectFormValues = {
  lyDoTuChoi: string;
};

function getBackendMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<{ detail?: string; message?: string }>;
  return axiosError.response?.data?.detail ?? axiosError.response?.data?.message ?? fallback;
}

function statusTag(status: number) {
  if (status === 1) return <Tag color="success">Đã duyệt</Tag>;
  if (status === 2) return <Tag color="error">Từ chối</Tag>;
  return <Tag color="warning">Chờ duyệt</Tag>;
}

function periodStatusTag(status: string) {
  if (status === 'Đã chốt') return <Tag color="success">{status}</Tag>;
  if (status === 'Chờ chốt') return <Tag color="warning">{status}</Tag>;
  return <Tag>{status}</Tag>;
}

function getPeriodStatus(record: DuyetBangCongItem) {
  if (record.trangThaiKy) return record.trangThaiKy;
  if (record.trangThai === 1) return 'Đã chốt';
  return 'Chờ chốt';
}

export function DuyetBangCongPage() {
  const queryClient = useQueryClient();
  const [rejectingDon, setRejectingDon] = useState<DonGiaiTrinhCong | null>(null);
  const [rejectForm] = Form.useForm<RejectFormValues>();

  const { data, isLoading } = useQuery({
    queryKey: ['duyet-bang-cong'],
    queryFn: getDuyetBangCong,
  });

  const approveMutation = useMutation({
    mutationFn: (variables: { id: string; soGioCong: number }) => approveGiaiTrinh(variables.id, { soGioCong: variables.soGioCong }),
    onSuccess: (result) => {
      message.success(result.message || 'Đã duyệt đơn giải trình');
      queryClient.invalidateQueries({ queryKey: ['duyet-bang-cong'] });
      queryClient.invalidateQueries({ queryKey: ['bang-cong'] });
    },
    onError: (error) => message.error(getBackendMessage(error, 'Duyệt thất bại')),
  });

  const rejectMutation = useMutation({
    mutationFn: (variables: { id: string; lyDoTuChoi: string }) => rejectGiaiTrinh(variables.id, { lyDoTuChoi: variables.lyDoTuChoi }),
    onSuccess: (result) => {
      message.success(result.message || 'Đã từ chối đơn giải trình');
      setRejectingDon(null);
      rejectForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['duyet-bang-cong'] });
    },
    onError: (error) => message.error(getBackendMessage(error, 'Từ chối thất bại')),
  });

  const finalizeMutation = useMutation({
    mutationFn: finalizeBangCong,
    onSuccess: (result) => {
      message.success(result.message || 'Chốt bảng công thành công');
      queryClient.invalidateQueries({ queryKey: ['duyet-bang-cong'] });
      queryClient.invalidateQueries({ queryKey: ['bang-cong'] });
    },
    onError: (error) => message.error(getBackendMessage(error, 'Chốt bảng công thất bại')),
  });

  const handleApprove = (record: DonGiaiTrinhCong) => {
    let soGioCong = 8;
    Modal.confirm({
      title: 'Xác nhận duyệt đơn giải trình',
      content: (
        <div className="space-y-3 pt-2">
          <p className="m-0">Số giờ công được cộng vào bảng công thực tế:</p>
          <InputNumber className="w-full" min={0.5} max={24} step={0.5} defaultValue={8} onChange={(value) => (soGioCong = Number(value ?? 8))} />
        </div>
      ),
      okText: 'Duyệt',
      cancelText: 'Hủy',
      onOk: () => approveMutation.mutate({ id: record.id_DonGiaiTrinh, soGioCong }),
    });
  };

  const pendingColumns = [
    { title: 'Mã đơn', dataIndex: 'id_DonGiaiTrinh', key: 'id_DonGiaiTrinh', width: 170 },
    { title: 'Mã NV', dataIndex: 'id_NhanVien', key: 'id_NhanVien', width: 110 },
    { title: 'Ngày giải trình', dataIndex: 'ngayGiaiTrinh', key: 'ngayGiaiTrinh', width: 130 },
    { title: 'Lý do', dataIndex: 'lyDo', key: 'lyDo', width: 260 },
    { title: 'Trạng thái', dataIndex: 'trangThai', key: 'trangThai', width: 120, render: statusTag },
    {
      title: 'Hành động',
      key: 'action',
      width: 190,
      render: (_: unknown, record: DonGiaiTrinhCong) => (
        <Space>
          <Button type="primary" icon={<CheckOutlined />} size="small" onClick={() => handleApprove(record)} loading={approveMutation.isPending}>
            Duyệt
          </Button>
          <Button danger icon={<CloseOutlined />} size="small" onClick={() => setRejectingDon(record)} loading={rejectMutation.isPending}>
            Từ chối
          </Button>
        </Space>
      ),
    },
  ];

  const bangCongColumns = [
    { title: 'Mã bảng công', dataIndex: 'id_BangCong', key: 'id_BangCong', width: 170 },
    { title: 'Mã NV', dataIndex: 'id_NhanVien', key: 'id_NhanVien', width: 110 },
    { title: 'Tên bảng công', dataIndex: 'tenBangCong', key: 'tenBangCong', width: 260 },
    { title: 'Từ ngày', dataIndex: 'tuNgay', key: 'tuNgay', width: 120 },
    { title: 'Đến ngày', dataIndex: 'denNgay', key: 'denNgay', width: 120 },
    { title: 'Trạng thái', key: 'trangThaiKy', width: 120, render: (_: unknown, record: DuyetBangCongItem) => periodStatusTag(getPeriodStatus(record)) },
    {
      title: 'Hành động',
      key: 'action',
      width: 140,
      render: (_: unknown, record: DuyetBangCongItem) => (
        <Button
          size="small"
          disabled={getPeriodStatus(record) === 'Đã chốt'}
          loading={finalizeMutation.isPending}
          onClick={() => finalizeMutation.mutate(record.id_BangCong)}
        >
          Chốt công
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="m-0 text-2xl font-bold text-hicas-text">Duyệt bảng công</h1>
        <p className="m-0 mt-1 text-hicas-muted">Xử lý đơn giải trình trước khi chốt bảng công</p>
      </div>

      <Card title="Đơn giải trình chờ duyệt" className="shadow-sm">
        <Table
          dataSource={data?.don_giai_trinh_cho_duyet ?? []}
          columns={pendingColumns}
          rowKey="id_DonGiaiTrinh"
          loading={isLoading}
          scroll={{ x: 1000 }}
          locale={{ emptyText: 'Không có đơn giải trình chờ duyệt' }}
        />
      </Card>

      <Card title="Bảng công trong phạm vi duyệt" className="shadow-sm">
        <Table
          dataSource={data?.bang_cong ?? []}
          columns={bangCongColumns}
          rowKey="id_BangCong"
          loading={isLoading}
          scroll={{ x: 1100 }}
          locale={{ emptyText: 'Không có bảng công trong phạm vi duyệt' }}
        />
      </Card>

      <Modal
        title="Từ chối đơn giải trình"
        open={Boolean(rejectingDon)}
        onCancel={() => {
          setRejectingDon(null);
          rejectForm.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={rejectForm}
          layout="vertical"
          onFinish={(values) => rejectingDon && rejectMutation.mutate({ id: rejectingDon.id_DonGiaiTrinh, lyDoTuChoi: values.lyDoTuChoi })}
        >
          <Form.Item name="lyDoTuChoi" label="Lý do từ chối" rules={[{ required: true, message: 'Vui lòng nhập lý do từ chối' }]}>
            <Input.TextArea rows={4} maxLength={255} showCount />
          </Form.Item>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setRejectingDon(null)}>Hủy</Button>
            <Button danger type="primary" htmlType="submit" loading={rejectMutation.isPending}>
              Từ chối
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
