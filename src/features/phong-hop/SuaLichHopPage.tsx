import { ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Descriptions, Popconfirm, Space, Typography, message } from 'antd';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useAuthStore } from '@/stores/authStore';

import { useHuyLichHop, useLichHopList, usePhongHopOptions } from './api';
import TrangThaiLichHopTag from './TrangThaiLichHopTag';
import { canCancelLichHop, formatDateTime, priorityLabel, roomName } from './utils';

const { Title, Text } = Typography;

export default function SuaLichHopPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const user = useAuthStore((state) => state.user);
  const listQuery = useLichHopList();
  const roomsQuery = usePhongHopOptions();
  const cancelMutation = useHuyLichHop();

  const meeting = useMemo(() => listQuery.data?.find((item) => item.id_LichHop === id), [id, listQuery.data]);

  const cancelMeeting = async () => {
    if (!meeting) return;
    try {
      await cancelMutation.mutateAsync(meeting.id_LichHop);
      message.success('Đã hủy lịch họp');
      navigate('/phong-hop');
    } catch (error: unknown) {
      const detail = (error as { response?: { data?: { detail?: string; message?: string } } }).response?.data;
      message.error(detail?.detail ?? detail?.message ?? 'Không thể hủy lịch họp');
    }
  };

  return (
    <Space direction="vertical" size={20} className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Title level={2} className="!mb-1">
            Chi tiết lịch họp
          </Title>
          <Text type="secondary">Xem thông tin lịch họp và hủy lịch khi còn trong phạm vi cho phép.</Text>
        </div>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/phong-hop')}>
          Quay lại
        </Button>
      </div>

      <Card loading={listQuery.isLoading || roomsQuery.isLoading} className="border-hicas-border">
        {!meeting ? (
          <Alert type="info" showIcon message="Không tìm thấy lịch họp trong danh sách hiện tại" />
        ) : (
          <Space direction="vertical" size={20} className="w-full">
            <Descriptions bordered column={{ xs: 1, lg: 2 }}>
              <Descriptions.Item label="Tiêu đề">{meeting.tieuDe}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <TrangThaiLichHopTag status={meeting.trangThai} />
              </Descriptions.Item>
              <Descriptions.Item label="Phòng">{roomName(roomsQuery.data, meeting.id_Phong)}</Descriptions.Item>
              <Descriptions.Item label="Ưu tiên">{priorityLabel(meeting.mucDoUuTien)}</Descriptions.Item>
              <Descriptions.Item label="Bắt đầu">{formatDateTime(meeting.thoiGianBatDau)}</Descriptions.Item>
              <Descriptions.Item label="Kết thúc">{formatDateTime(meeting.thoiGianKetThuc)}</Descriptions.Item>
              <Descriptions.Item label="Người tạo">{meeting.id_NhanVien}</Descriptions.Item>
              <Descriptions.Item label="Thành viên">
                {meeting.thanhVien?.length
                  ? meeting.thanhVien.map((member) => `${member.id_NhanVien} (${member.vaiTroThamGia})`).join(', ')
                  : 'Chưa có thành viên'}
              </Descriptions.Item>
              <Descriptions.Item label="Nội dung">{meeting.noiDung || 'Không có ghi chú'}</Descriptions.Item>
            </Descriptions>

            <div className="flex justify-end gap-3">
              {canCancelLichHop(meeting, undefined, user?.id_VaiTro) && (
                <Popconfirm title="Hủy lịch họp này?" okText="Hủy lịch" cancelText="Đóng" onConfirm={cancelMeeting}>
                  <Button danger icon={<DeleteOutlined />} loading={cancelMutation.isPending}>
                    Hủy lịch
                  </Button>
                </Popconfirm>
              )}
            </div>
          </Space>
        )}
      </Card>
    </Space>
  );
}
