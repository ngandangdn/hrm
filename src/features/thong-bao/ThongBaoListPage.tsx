import { CheckCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Empty, List, Skeleton, Space, Tag, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';

import { useAuthStore } from '@/stores/authStore';
import { useDanhDauDaDoc, useDanhDauTatCaDaDoc, useThongBaoList } from './api';
import type { ThongBao } from './types';
import { canCreateThongBao, formatNotificationTime, getBackendMessage, notificationTypeColor } from './utils';

const { Text } = Typography;

export default function ThongBaoListPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const listQuery = useThongBaoList(1, 50);
  const markReadMutation = useDanhDauDaDoc();
  const markAllMutation = useDanhDauTatCaDaDoc();
  const canCreate = canCreateThongBao(user?.id_VaiTro);

  const handleRead = async (item: ThongBao) => {
    if (item.trangThaiDoc === 1) return;
    try {
      await markReadMutation.mutateAsync(item.id_ThongBao);
      message.success('Đã đánh dấu thông báo là đã đọc');
    } catch (error) {
      message.error(getBackendMessage(error, 'Không thể đánh dấu thông báo đã đọc'));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="m-0 text-2xl font-bold text-hicas-text">Thông báo</h1>
          <p className="m-0 mt-1 text-hicas-muted">Theo dõi thông báo nội bộ được gửi tới tài khoản của bạn</p>
        </div>
        <Space wrap>
          <Button
            icon={<CheckCircleOutlined />}
            loading={markAllMutation.isPending}
            onClick={async () => {
              try {
                const response = await markAllMutation.mutateAsync();
                message.success(`Đã cập nhật ${response.data.so_luong_da_cap_nhat} thông báo`);
              } catch (error) {
                message.error(getBackendMessage(error, 'Không thể đánh dấu tất cả đã đọc'));
              }
            }}
          >
            Đánh dấu tất cả đã đọc
          </Button>
          {canCreate && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/thong-bao/tao-moi')}>
              Tạo thông báo
            </Button>
          )}
        </Space>
      </div>

      <div className="hicas-card p-5">
        {listQuery.isLoading ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : !listQuery.data?.data.length ? (
          <Empty description="Không có thông báo nào" />
        ) : (
          <List
            dataSource={listQuery.data.data}
            renderItem={(item) => (
              <List.Item
                className={`rounded-lg px-4 transition ${item.trangThaiDoc === 0 ? 'bg-[#f5f3ff]' : 'bg-white'}`}
                actions={[
                  item.trangThaiDoc === 0 ? (
                    <Button key="read" type="link" loading={markReadMutation.isPending} onClick={() => void handleRead(item)}>
                      Đánh dấu đã đọc
                    </Button>
                  ) : (
                    <Text key="read" className="text-hicas-muted">
                      Đã đọc
                    </Text>
                  ),
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space wrap>
                      <span>{item.tieuDe}</span>
                      <Tag color={notificationTypeColor(item)}>{item.loaiThongBao}</Tag>
                      {item.trangThaiDoc === 0 && <Tag color="blue">Chưa đọc</Tag>}
                    </Space>
                  }
                  description={
                    <div className="space-y-1">
                      <div>{item.noiDung}</div>
                      <Text className="text-xs text-hicas-muted">{formatNotificationTime(item.thoiGianGui)}</Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );
}
