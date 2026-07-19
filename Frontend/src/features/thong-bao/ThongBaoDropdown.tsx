import { BellOutlined, CheckCircleOutlined, InboxOutlined } from '@ant-design/icons';
import { Badge, Button, Dropdown, Empty, Skeleton, Space, Tag, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';

import { useDanhDauDaDoc, useDanhDauTatCaDaDoc, useSoLuongChuaDoc, useThongBaoList } from './api';
import type { ThongBao } from './types';
import { formatNotificationTime, getBackendMessage, notificationTypeColor } from './utils';

const { Text } = Typography;

type ThongBaoDropdownProps = {
  compact?: boolean;
};

export default function ThongBaoDropdown({ compact = false }: ThongBaoDropdownProps) {
  const navigate = useNavigate();
  const unreadQuery = useSoLuongChuaDoc();
  const listQuery = useThongBaoList(1, 6);
  const markReadMutation = useDanhDauDaDoc();
  const markAllMutation = useDanhDauTatCaDaDoc();

  const handleOpenChange = (open: boolean) => {
    if (open) {
      void listQuery.refetch();
      void unreadQuery.refetch();
    }
  };

  const handleRead = async (item: ThongBao) => {
    try {
      if (item.trangThaiDoc === 0) {
        await markReadMutation.mutateAsync(item.id_ThongBao);
      }
      if (item.id_doi_tuong_lien_quan) {
        navigate('/');
      }
    } catch (error) {
      message.error(getBackendMessage(error, 'Không thể đánh dấu thông báo đã đọc'));
    }
  };

  const panel = (
    <div className="w-[380px] rounded-lg bg-white p-3 shadow-lg">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="font-semibold text-hicas-text">Thông báo</div>
          <Text className="text-xs text-hicas-muted">Cập nhật tự động mỗi 30 giây</Text>
        </div>
        <Button
          size="small"
          icon={<CheckCircleOutlined />}
          loading={markAllMutation.isPending}
          onClick={async () => {
            try {
              await markAllMutation.mutateAsync();
              message.success('Đã đánh dấu tất cả thông báo là đã đọc');
            } catch (error) {
              message.error(getBackendMessage(error, 'Không thể đánh dấu tất cả đã đọc'));
            }
          }}
        >
          Đọc tất cả
        </Button>
      </div>

      {listQuery.isLoading ? (
        <Skeleton active paragraph={{ rows: 5 }} />
      ) : !listQuery.data?.data.length ? (
        <Empty image={<InboxOutlined className="text-4xl text-hicas-muted" />} description="Không có thông báo nào" />
      ) : (
        <div className="max-h-[420px] overflow-y-auto">
          {listQuery.data.data.map((item) => (
            <button
              key={item.id_ThongBao}
              className={`mb-2 w-full rounded-lg border p-3 text-left transition hover:border-hicas-primary ${
                item.trangThaiDoc === 0 ? 'border-[#d7d0ff] bg-[#f5f3ff]' : 'border-hicas-border bg-white'
              }`}
              onClick={() => void handleRead(item)}
            >
              <div className="mb-1 flex items-start justify-between gap-3">
                <strong className="text-sm text-hicas-text">{item.tieuDe}</strong>
                <Tag color={notificationTypeColor(item)}>{item.loaiThongBao}</Tag>
              </div>
              <p className="m-0 line-clamp-2 text-sm text-hicas-muted">{item.noiDung}</p>
              <div className="mt-2 flex items-center justify-between">
                <Text className="text-xs text-hicas-muted">{formatNotificationTime(item.thoiGianGui)}</Text>
                {item.trangThaiDoc === 0 && <Badge status="processing" text="Chưa đọc" />}
              </div>
            </button>
          ))}
        </div>
      )}

      <Button className="mt-2 w-full" type="link" onClick={() => navigate('/thong-bao')}>
        Xem tất cả thông báo
      </Button>
    </div>
  );

  return (
    <Dropdown trigger={['click']} dropdownRender={() => panel} onOpenChange={handleOpenChange}>
      <Button type="text" className={compact ? 'px-2' : ''}>
        <Space size={8}>
          <Badge count={unreadQuery.data?.so_luong_chua_doc ?? 0} size="small">
            <BellOutlined className="text-xl" />
          </Badge>
        </Space>
      </Button>
    </Dropdown>
  );
}
