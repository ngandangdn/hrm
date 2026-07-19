import { Table } from 'antd';
import dayjs from 'dayjs';

import { useListTaiSanCuaToi } from './api';
import type { TaiSanCuaToiItem } from './api';

export default function TaiSanCuaToiPage() {
  const { data: listData, isLoading } = useListTaiSanCuaToi();

  const columns = [
    { title: 'Mã Tài Sản', dataIndex: 'id_TaiSan', key: 'id_TaiSan' },
    { title: 'Tên Tài Sản', dataIndex: 'tenTaiSan', key: 'tenTaiSan' },
    { title: 'Serial Number', dataIndex: 'serialNumber', key: 'serialNumber' },
    { title: 'Ngày cấp phát', dataIndex: 'ngayCapPhat', render: (val: string) => dayjs(val).format('DD/MM/YYYY') },
    { title: 'Tình trạng bàn giao', dataIndex: 'tinhTrangBanGiao', key: 'tinhTrangBanGiao' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="m-0 text-2xl font-bold text-hicas-text">Tài sản của tôi</h1>
        <p className="m-0 mt-1 text-hicas-muted">Danh sách thiết bị, tài sản bạn đang được công ty giao phó</p>
      </div>

      <div className="hicas-card p-5">
        <Table
          rowKey="id_GiaoNhan"
          loading={isLoading}
          dataSource={listData}
          columns={columns}
          locale={{ emptyText: 'Bạn chưa được cấp phát tài sản nào' }}
        />
      </div>
    </div>
  );
}
