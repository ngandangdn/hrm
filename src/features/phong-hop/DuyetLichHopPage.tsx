import { ArrowLeftOutlined, CheckOutlined, CloseOutlined, ReloadOutlined, ToolOutlined } from '@ant-design/icons';
import { Button, Card, Empty, Input, Modal, Popconfirm, Space, Table, Tag, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCanThiepLichHop, useDuyetLichHop, useLichHopList, usePhongHopOptions, useTuChoiLichHop } from './api';
import TrangThaiLichHopTag from './TrangThaiLichHopTag';
import type { LichHop } from './types';
import { formatDateTime, priorityLabel, roomName } from './utils';

const { Title, Text } = Typography;

function getBackendMessage(error: unknown) {
  const detail = (error as { response?: { data?: { detail?: string; message?: string } } }).response?.data;
  return detail?.detail ?? detail?.message ?? 'Không thể xử lý lịch họp';
}

export default function DuyetLichHopPage() {
  const navigate = useNavigate();
  const listQuery = useLichHopList();
  const roomsQuery = usePhongHopOptions();
  const approveMutation = useDuyetLichHop();
  const rejectMutation = useTuChoiLichHop();
  const interveneMutation = useCanThiepLichHop();
  const [rejectModal, setRejectModal] = useState<{ open: boolean; meeting?: LichHop; reason: string }>({
    open: false,
    reason: '',
  });
  const pendingItems = (listQuery.data ?? []).filter((item) => item.trangThai === 0);

  const approveMeeting = async (record: LichHop) => {
    try {
      await approveMutation.mutateAsync(record.id_LichHop);
      message.success('Đã duyệt lịch họp');
    } catch (error) {
      message.error(getBackendMessage(error));
    }
  };

  const rejectMeeting = async () => {
    if (!rejectModal.meeting || !rejectModal.reason.trim()) return;
    try {
      await rejectMutation.mutateAsync({
        id: rejectModal.meeting.id_LichHop,
        payload: { lyDo: rejectModal.reason.trim() },
      });
      message.success('Đã từ chối lịch họp');
      setRejectModal({ open: false, reason: '' });
    } catch (error) {
      message.error(getBackendMessage(error));
    }
  };

  const interveneMeeting = async (record: LichHop) => {
    try {
      await interveneMutation.mutateAsync({
        id: record.id_LichHop,
        payload: { lyDo: 'Can thiệp xử lý xung đột phòng họp' },
      });
      message.success('Đã can thiệp và duyệt lịch họp');
    } catch (error) {
      message.error(getBackendMessage(error));
    }
  };

  const columns: ColumnsType<LichHop> = [
    { title: 'Tiêu đề', dataIndex: 'tieuDe' },
    { title: 'Phòng', dataIndex: 'id_Phong', render: (value: string) => roomName(roomsQuery.data, value) },
    {
      title: 'Thời gian',
      dataIndex: 'thoiGianBatDau',
      render: (_: string, record) => `${formatDateTime(record.thoiGianBatDau)} - ${formatDateTime(record.thoiGianKetThuc)}`,
    },
    {
      title: 'Ưu tiên',
      dataIndex: 'mucDoUuTien',
      render: (value: string) => <Tag color={value === 'urgent' ? 'red' : value === 'high' ? 'orange' : 'blue'}>{priorityLabel(value)}</Tag>,
    },
    { title: 'Trạng thái', dataIndex: 'trangThai', render: (value: number) => <TrangThaiLichHopTag status={value} /> },
    {
      title: 'Xử lý',
      key: 'actions',
      width: 280,
      render: (_, record) => (
        <Space wrap>
          <Button icon={<CheckOutlined />} loading={approveMutation.isPending} onClick={() => approveMeeting(record)}>
            Duyệt
          </Button>
          <Button
            danger
            icon={<CloseOutlined />}
            loading={rejectMutation.isPending}
            onClick={() => setRejectModal({ open: true, meeting: record, reason: '' })}
          >
            Từ chối
          </Button>
          <Popconfirm
            title="Can thiệp duyệt lịch họp?"
            description="Các lịch chồng giờ trong cùng phòng sẽ được chuyển sang trạng thái từ chối."
            okText="Can thiệp"
            cancelText="Đóng"
            onConfirm={() => interveneMeeting(record)}
          >
            <Button icon={<ToolOutlined />} loading={interveneMutation.isPending}>
              Can thiệp
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size={20} className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Title level={2} className="!mb-1">
            Duyệt lịch họp
          </Title>
          <Text type="secondary">Xử lý các lịch phòng họp đang chờ phê duyệt.</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => listQuery.refetch()} loading={listQuery.isFetching}>
            Làm mới
          </Button>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/phong-hop')}>
            Quay lại
          </Button>
        </Space>
      </div>

      <Card className="border-hicas-border">
        <Table
          rowKey="id_LichHop"
          loading={listQuery.isLoading || roomsQuery.isLoading}
          columns={columns}
          dataSource={pendingItems}
          locale={{ emptyText: <Empty description="Không có lịch họp chờ duyệt" /> }}
          scroll={{ x: 980 }}
        />
      </Card>

      <Modal
        title="Từ chối lịch họp"
        open={rejectModal.open}
        okText="Từ chối"
        cancelText="Đóng"
        okButtonProps={{ danger: true, disabled: !rejectModal.reason.trim() || rejectMutation.isPending }}
        confirmLoading={rejectMutation.isPending}
        onOk={rejectMeeting}
        onCancel={() => setRejectModal({ open: false, reason: '' })}
      >
        <Input.TextArea
          rows={4}
          maxLength={255}
          showCount
          value={rejectModal.reason}
          onChange={(event) => setRejectModal((current) => ({ ...current, reason: event.target.value }))}
          placeholder="Nhập lý do từ chối"
        />
      </Modal>
    </Space>
  );
}
