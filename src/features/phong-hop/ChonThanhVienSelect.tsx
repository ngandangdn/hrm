import { Select } from 'antd';

import type { NhanVienOption } from './types';

type Props = {
  value?: string[];
  onChange?: (value: string[]) => void;
  disabledIds?: string[];
  loading?: boolean;
  employees?: NhanVienOption[];
};

export default function ChonThanhVienSelect({ value, onChange, disabledIds = [], loading, employees = [] }: Props) {
  return (
    <Select
      mode="multiple"
      value={value}
      onChange={onChange}
      loading={loading}
      showSearch
      optionFilterProp="label"
      options={employees.map((employee) => ({
        value: employee.id_NhanVien,
        label: `${employee.hoTen} - ${employee.id_NhanVien} (${employee.email})`,
        disabled: disabledIds.includes(employee.id_NhanVien),
      }))}
      placeholder="Chọn nhân viên tham dự"
    />
  );
}
