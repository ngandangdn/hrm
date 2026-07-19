import { Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import type { FormField } from '@/components/common/DanhMucDrawer';
import DanhMucTable from '@/components/common/DanhMucTable';
import DanhMucTabs from './DanhMucTabs';
import type { TaiSanDanhMuc } from './types';

const columns: ColumnsType<TaiSanDanhMuc> = [
  { title: 'Mã tài sản', dataIndex: 'id_TaiSan', width: 140 },
  { title: 'Tên tài sản', dataIndex: 'tenTaiSan' },
  { title: 'Serial', dataIndex: 'serialNumber', width: 150 },
  { title: 'Ngày mua', dataIndex: 'ngayMua', width: 130 },
  {
    title: 'Giá trị',
    dataIndex: 'giaTri',
    width: 140,
    render: (value) => (value ? Number(value).toLocaleString('vi-VN') : '-'),
  },
  { title: 'Tình trạng', dataIndex: 'tinhTrang', width: 160 },
  {
    title: 'Trạng thái',
    dataIndex: 'trangThai',
    width: 150,
    render: (value: number) => (value === 1 ? <Tag color="success">Hoạt động</Tag> : <Tag>Ngừng</Tag>),
  },
];

const formFields: FormField[] = [
  { name: 'id_TaiSan', label: 'Mã tài sản', required: true },
  { name: 'tenTaiSan', label: 'Tên tài sản', required: true },
  { name: 'serialNumber', label: 'Serial' },
  { name: 'ngayMua', label: 'Ngày mua', type: 'date' },
  { name: 'giaTri', label: 'Giá trị', type: 'number' },
  { name: 'tinhTrang', label: 'Tình trạng', required: true },
  {
    name: 'trangThai',
    label: 'Trạng thái',
    type: 'select',
    required: true,
    options: [
      { label: 'Hoạt động', value: 1 },
      { label: 'Ngừng', value: 0 },
    ],
  },
];

export default function DanhMucTaiSanPage() {
  return (
    <DanhMucTabs>
      <DanhMucTable<TaiSanDanhMuc>
        title="Quản lý danh mục tài sản"
        apiEndpoint="/api/danh-muc/tai-san"
        columns={columns}
        formFields={formFields}
        idField="id_TaiSan"
        lockedFields={['id_TaiSan']}
        pageSize={20}
      />
    </DanhMucTabs>
  );
}
