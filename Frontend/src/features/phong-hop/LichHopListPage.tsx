import { CalendarOutlined, DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Card, Empty, Popconfirm, Space, Table, Tag, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Link, useNavigate } from 'react-router-dom';

import { useAuthStore } from '@/stores/authStore';

import { useHuyLichHop, useLichHopList, usePhongHopOptions } from './api';
import TrangThaiLichHopTag from './TrangThaiLichHopTag';
import type { LichHop } from './types';
import { canCancelLichHop, canModerateLichHop, formatDateTime, priorityLabel, roomName } from './utils';

const { Title, Text } = Typography;

export default function LichHopListPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const listQuery = useLichHopList();
  const roomsQuery = usePhongHopOptions();
  const cancelMutation = useHuyLichHop();

  const cancelMeeting = async (id: string) => {
    try {
      await cancelMutation.mutateAsync(id);
      message.success('Đã hủy lịch họp');
    } catch (error: unknown) {
      const detail = (error as { response?: { data?: { detail?: string; message?: string } } }).response?.data;
      message.error(detail?.detail ?? detail?.message ?? 'Không thể hủy lịch họp');
    }
  };

  const columns: ColumnsType<LichHop> = [
    {
      title: 'Cuộc họp',
      dataIndex: 'tieuDe',
      render: (value: string, record) => (
        <Space direction="vertical" size={2}>
          <Text strong>{value}</Text>
          <Text type="secondary">{record.noiDung || 'Không có ghi chú'}</Text>
        </Space>
      ),
    },
    {
      title: 'Phòng',
      dataIndex: 'id_Phong',
      render: (value: string) => roomName(roomsQuery.data, value),
    },
    {
      title: 'Thời gian',
      dataIndex: 'thoiGianBatDau',
      render: (_: string, record) => (
        <Space direction="vertical" size={2}>
          <Text>{formatDateTime(record.thoiGianBatDau)}</Text>
          <Text type="secondary">đến {formatDateTime(record.thoiGianKetThuc)}</Text>
        </Space>
      ),
      sorter: (a, b) => new Date(a.thoiGianBatDau).getTime() - new Date(b.thoiGianBatDau).getTime(),
    },
    {
      title: 'Ưu tiên',
      dataIndex: 'mucDoUuTien',
      render: (value: string) => <Tag color={value === 'urgent' ? 'red' : value === 'high' ? 'orange' : 'blue'}>{priorityLabel(value)}</Tag>,
    },
    {
      title: 'Thành viên',
      dataIndex: 'thanhVien',
      render: (_: unknown, record) => `${record.thanhVien?.length ?? 0} người`,
      width: 120,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      render: (value: number) => <TrangThaiLichHopTag status={value} />,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 170,
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => navigate(`/phong-hop/${record.id_LichHop}/sua`)}>
            Xem
          </Button>
          {canCancelLichHop(record, undefined, user?.id_VaiTro) && (
            <Popconfirm title="Hủy lịch họp này?" okText="Hủy lịch" cancelText="Đóng" onConfirm={() => cancelMeeting(record.id_LichHop)}>
              <Button danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size={20} className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Title level={2} className="!mb-1">
            Lịch phòng họp
          </Title>
          <Text type="secondary">Theo dõi, đăng ký và xử lý lịch sử dụng phòng họp.</Text>
        </div>
        <Space wrap>
          {canModerateLichHop(user?.id_VaiTro) && (
            <Link to="/phong-hop/duyet">
              <Button icon={<CalendarOutlined />}>Duyệt lịch họp</Button>
            </Link>
          )}
          <Button icon={<ReloadOutlined />} onClick={() => listQuery.refetch()} loading={listQuery.isFetching}>
            Làm mới
          </Button>
          <Link to="/phong-hop/dat-lich">
            <Button type="primary" icon={<PlusOutlined />}>
              Đăng ký họp
            </Button>
          </Link>
        </Space>
      </div>

      <Card className="border-hicas-border">
        <Table
          rowKey="id_LichHop"
          loading={listQuery.isLoading || roomsQuery.isLoading}
          columns={columns}
          dataSource={listQuery.data ?? []}
          locale={{ emptyText: <Empty description="Chưa có lịch họp" /> }}
          scroll={{ x: 980 }}
        />
      </Card>
    </Space>
  );
}
