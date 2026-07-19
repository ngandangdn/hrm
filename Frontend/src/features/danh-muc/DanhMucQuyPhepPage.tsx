import { Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import type { FormField } from '@/components/common/DanhMucDrawer';
import DanhMucTable from '@/components/common/DanhMucTable';
import DanhMucTabs from './DanhMucTabs';
import type { QuyPhepDanhMuc } from './types';

const columns: ColumnsType<QuyPhepDanhMuc> = [
  { title: 'Mã quỹ phép', dataIndex: 'id_QuyPhep', width: 150 },
  { title: 'Mã nhân viên', dataIndex: 'id_NhanVien', width: 130 },
  { title: 'Năm', dataIndex: 'nam', width: 90 },
  { title: 'Tổng phép', dataIndex: 'tongQuyPhep', width: 120 },
  { title: 'Đã dùng', dataIndex: 'soNgayDaDung', width: 120 },
  { title: 'Chờ duyệt', dataIndex: 'soNgayChoDuyet', width: 120 },
  { title: 'Ngày cập nhật', dataIndex: 'ngayCapNhat', width: 170 },
  {
    title: 'Trạng thái',
    dataIndex: 'trangThai',
    width: 140,
    render: (value: number) => (value === 1 ? <Tag color="success">Hiệu lực</Tag> : <Tag>Ngừng</Tag>),
  },
];

const formFields: FormField[] = [
  { name: 'id_QuyPhep', label: 'Mã quỹ phép', required: true },
  { name: 'id_NhanVien', label: 'Mã nhân viên', required: true },
  { name: 'nam', label: 'Năm', type: 'number', required: true },
  { name: 'tongQuyPhep', label: 'Tổng phép', type: 'number', required: true },
  { name: 'soNgayDaDung', label: 'Số ngày đã dùng', type: 'number' },
  { name: 'soNgayChoDuyet', label: 'Số ngày chờ duyệt', type: 'number' },
  { name: 'ngayCapNhat', label: 'Ngày cập nhật', type: 'datetime' },
  {
    name: 'trangThai',
    label: 'Trạng thái',
    type: 'select',
    required: true,
    options: [
      { label: 'Hiệu lực', value: 1 },
      { label: 'Ngừng', value: 0 },
    ],
  },
];

export default function DanhMucQuyPhepPage() {
  return (
    <DanhMucTabs>
      <DanhMucTable<QuyPhepDanhMuc>
        title="Quản lý danh mục quỹ phép"
        apiEndpoint="/api/danh-muc/quy-phep"
        columns={columns}
        formFields={formFields}
        idField="id_QuyPhep"
        lockedFields={['id_QuyPhep']}
        pageSize={20}
      />
    </DanhMucTabs>
  );
}
