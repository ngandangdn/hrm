import type { ColumnsType } from 'antd/es/table';

import type { FormField } from '@/components/common/DanhMucDrawer';
import DanhMucTable from '@/components/common/DanhMucTable';
import DanhMucTabs from './DanhMucTabs';
import type { QuyenDanhMuc } from './types';

const columns: ColumnsType<QuyenDanhMuc> = [
  { title: 'Mã quyền', dataIndex: 'id_Quyen', width: 150 },
  { title: 'Tên quyền', dataIndex: 'tenQuyen' },
  { title: 'Hành động', dataIndex: 'hanhDong', width: 180 },
  { title: 'Mô tả', dataIndex: 'moTa' },
];

const formFields: FormField[] = [
  { name: 'id_Quyen', label: 'Mã quyền', required: true },
  { name: 'tenQuyen', label: 'Tên quyền', required: true },
  { name: 'hanhDong', label: 'Hành động', required: true },
  { name: 'moTa', label: 'Mô tả', type: 'textarea' },
];

export default function DanhMucQuyenPage() {
  return (
    <DanhMucTabs>
      <DanhMucTable<QuyenDanhMuc>
        title="Quản lý danh mục quyền"
        apiEndpoint="/api/danh-muc/quyen"
        columns={columns}
        formFields={formFields}
        idField="id_Quyen"
        lockedFields={['id_Quyen']}
        pageSize={20}
      />
    </DanhMucTabs>
  );
}
