import { Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import type { FormField } from '@/components/common/DanhMucDrawer';
import DanhMucTable from '@/components/common/DanhMucTable';
import DanhMucTabs from './DanhMucTabs';
import type { PhongHop } from './types';

const columns: ColumnsType<PhongHop> = [
  { title: 'Mã phòng', dataIndex: 'id_Phong', width: 150 },
  { title: 'Tên phòng', dataIndex: 'tenPhong' },
  { title: 'Sức chứa', dataIndex: 'sucChua', width: 120 },
  {
    title: 'Trạng thái',
    dataIndex: 'trangThai',
    width: 160,
    render: (value: number) => (value === 1 ? <Tag color="success">Hoạt động</Tag> : <Tag>Ngừng hoạt động</Tag>),
  },
  { title: 'Mô tả', dataIndex: 'moTa' },
];

const formFields: FormField[] = [
  { name: 'id_Phong', label: 'Mã phòng', required: true },
  { name: 'tenPhong', label: 'Tên phòng', required: true },
  { name: 'sucChua', label: 'Sức chứa', type: 'number', required: true },
  {
    name: 'trangThai',
    label: 'Trạng thái',
    type: 'select',
    required: true,
    options: [
      { label: 'Hoạt động', value: 1 },
      { label: 'Ngừng hoạt động', value: 0 },
    ],
  },
  { name: 'moTa', label: 'Mô tả', type: 'textarea' },
];

export default function PhongHopPage() {
  return (
    <DanhMucTabs>
      <DanhMucTable<PhongHop>
        title="Quản lý danh mục phòng họp"
        apiEndpoint="/api/danh-muc/phong-hop"
        columns={columns}
        formFields={formFields}
        idField="id_Phong"
        lockedFields={['id_Phong']}
        pageSize={20}
      />
    </DanhMucTabs>
  );
}
