import { CopyOutlined, SaveOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, Button, Checkbox, Empty, Input, Modal, Select, Skeleton, Space, Spin, Tag, Typography, message } from 'antd';
import type { AxiosError } from 'axios';
import { useEffect, useMemo, useState } from 'react';

import { useAuthStore } from '@/stores/authStore';
import { useCapNhatPhanQuyen, usePhanQuyen, useSaoChepQuyen } from './api';
import type { NhanVienOption } from './types';

const { Text } = Typography;
const HCNS_OR_ADMIN_ROLE_IDS = new Set(['ADMIN', 'Admin', 'admin', 'HCNS', 'HR', 'QuanLyHCNS', 'MANAGER_HCNS']);

const employeeSeeds: NhanVienOption[] = [
  { id_NhanVien: 'NV001', hoTen: 'Đặng Kim Ngân', email: 'hcns@hicas.com.vn', chucVu: 'Trưởng phòng HCNS', phongBan: 'Nhân sự' },
  { id_NhanVien: 'NV003', hoTen: 'Phạm Hoàng Nam', email: 'quanly@hicas.com.vn', chucVu: 'Quản lý', phongBan: 'Vận hành' },
  { id_NhanVien: 'NV004', hoTen: 'Nguyễn Thu Hà', email: 'nhanvien@hicas.com.vn', chucVu: 'Nhân viên', phongBan: 'Hành chính' },
];

function getBackendMessage(error: unknown) {
  const axiosError = error as AxiosError<{ detail?: string; message?: string }>;
  return axiosError.response?.data?.detail ?? axiosError.response?.data?.message ?? 'Có lỗi xảy ra, vui lòng thử lại';
}

export default function PhanQuyenPage() {
  const user = useAuthStore((state) => state.user);
  const canManage = HCNS_OR_ADMIN_ROLE_IDS.has(user?.id_VaiTro ?? '');
  const [keyword, setKeyword] = useState('');
  const [manualId, setManualId] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<NhanVienOption>(employeeSeeds[0]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [copyOpen, setCopyOpen] = useState(false);
  const [copySourceId, setCopySourceId] = useState<string>();

  const phanQuyenQuery = usePhanQuyen(selectedEmployee.id_NhanVien);
  const copyQuery = useSaoChepQuyen(copySourceId);
  const updateMutation = useCapNhatPhanQuyen();

  useEffect(() => {
    if (phanQuyenQuery.data) {
      setSelectedRoleIds(phanQuyenQuery.data.vai_tro_da_gan);
    }
  }, [phanQuyenQuery.data]);

  useEffect(() => {
    if (copyQuery.data) {
      setSelectedRoleIds(copyQuery.data);
      setCopyOpen(false);
      message.info('Đã sao chép quyền vào màn hình. Bấm Lưu thay đổi để áp dụng.');
    }
  }, [copyQuery.data]);

  const employees = useMemo(() => {
    if (!keyword.trim()) return employeeSeeds;
    const normalized = keyword.trim().toLowerCase();
    return employeeSeeds.filter((employee) => Object.values(employee).some((value) => String(value ?? '').toLowerCase().includes(normalized)));
  }, [keyword]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="m-0 text-2xl font-bold text-hicas-text">Phân quyền</h1>
        <p className="m-0 mt-1 text-hicas-muted">Quản lý vai trò truy cập theo từng tài khoản nhân viên</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <section className="hicas-card p-5">
          <div className="mb-4 space-y-3">
            <Input prefix={<SearchOutlined />} allowClear placeholder="Tìm theo tên, mã, phòng ban" onChange={(event) => setKeyword(event.target.value)} />
            <Space.Compact className="w-full">
              <Input value={manualId} placeholder="Nhập mã nhân viên" onChange={(event) => setManualId(event.target.value)} />
              <Button
                onClick={() => {
                  const id = manualId.trim();
                  if (!id) return;
                  setSelectedEmployee({ id_NhanVien: id, hoTen: id });
                }}
              >
                Chọn
              </Button>
            </Space.Compact>
            <Select
              allowClear
              className="w-full"
              placeholder="Lọc theo chức vụ"
              options={[...new Set(employeeSeeds.map((item) => item.chucVu).filter(Boolean))].map((value) => ({ label: value, value }))}
            />
          </div>

          {employees.length === 0 ? (
            <Empty description="Không có nhân viên" />
          ) : (
            <div className="space-y-3">
              {employees.map((employee) => {
                const active = employee.id_NhanVien === selectedEmployee.id_NhanVien;
                return (
                  <button
                    key={employee.id_NhanVien}
                    className={`w-full rounded-lg border p-4 text-left transition ${
                      active ? 'border-hicas-primary bg-[#f3f1ff]' : 'border-hicas-border bg-white hover:border-hicas-primary'
                    }`}
                    onClick={() => setSelectedEmployee(employee)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-lg bg-hicas-primary text-white">
                        <UserOutlined />
                      </span>
                      <span>
                        <strong className="block text-hicas-text">{employee.hoTen}</strong>
                        <Text className="text-sm text-hicas-muted">{employee.id_NhanVien}</Text>
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {employee.phongBan && <Tag>{employee.phongBan}</Tag>}
                      {employee.chucVu && <Tag color="blue">{employee.chucVu}</Tag>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="hicas-card min-h-[520px] p-5">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="m-0 text-xl font-semibold text-hicas-text">{selectedEmployee.hoTen}</h2>
              <Text className="text-hicas-muted">{selectedEmployee.id_NhanVien}</Text>
            </div>
            {canManage && (
              <Space>
                <Button icon={<CopyOutlined />} onClick={() => setCopyOpen(true)}>
                  Sao chép quyền
                </Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={updateMutation.isPending}
                  disabled={updateMutation.isPending || selectedRoleIds.length === 0}
                  onClick={async () => {
                    try {
                      await updateMutation.mutateAsync({ idNhanVien: selectedEmployee.id_NhanVien, roleIds: selectedRoleIds });
                      message.success('Cập nhật quyền thành công');
                    } catch (error) {
                      Modal.error({ title: 'Không thể cập nhật quyền', content: getBackendMessage(error) });
                      setSelectedRoleIds(phanQuyenQuery.data?.vai_tro_da_gan ?? []);
                    }
                  }}
                >
                  Lưu thay đổi
                </Button>
              </Space>
            )}
          </div>

          {!canManage && <Alert className="mb-4" type="info" showIcon message="Bạn chỉ có quyền xem, không thể thay đổi phân quyền." />}

          {phanQuyenQuery.isLoading ? (
            <div className="grid min-h-[320px] place-items-center">
              <Spin />
            </div>
          ) : phanQuyenQuery.isError ? (
            <Alert type="error" showIcon message={getBackendMessage(phanQuyenQuery.error)} />
          ) : phanQuyenQuery.data ? (
            <div className="grid gap-3 md:grid-cols-2">
              {phanQuyenQuery.data.vai_tro_he_thong.map((role) => {
                const checked = selectedRoleIds.includes(role.id_VaiTro);
                return (
                  <label
                    key={role.id_VaiTro}
                    className={`rounded-lg border p-4 ${checked ? 'border-hicas-primary bg-[#f3f1ff]' : 'border-hicas-border bg-white'}`}
                  >
                    <Checkbox
                      checked={checked}
                      disabled={!canManage}
                      onChange={(event) => {
                        if (event.target.checked) {
                          setSelectedRoleIds([role.id_VaiTro]);
                        } else {
                          setSelectedRoleIds([]);
                        }
                      }}
                    >
                      <strong>{role.tenVaiTro ?? role.id_VaiTro}</strong>
                    </Checkbox>
                    {role.moTa && <p className="mb-0 mt-2 text-sm text-hicas-muted">{role.moTa}</p>}
                  </label>
                );
              })}
            </div>
          ) : (
            <Skeleton active />
          )}
        </section>
      </div>

      <Modal
        title="Sao chép quyền"
        open={copyOpen}
        okText="Sao chép"
        cancelText="Hủy"
        confirmLoading={copyQuery.isFetching}
        onCancel={() => setCopyOpen(false)}
        onOk={() => {
          if (!copySourceId) {
            message.warning('Vui lòng chọn nhân viên mẫu');
          } else {
            void copyQuery.refetch();
          }
        }}
      >
        <Select
          className="w-full"
          placeholder="Chọn nhân viên mẫu"
          value={copySourceId}
          onChange={setCopySourceId}
          options={employeeSeeds
            .filter((employee) => employee.id_NhanVien !== selectedEmployee.id_NhanVien)
            .map((employee) => ({ label: `${employee.hoTen} - ${employee.id_NhanVien}`, value: employee.id_NhanVien }))}
        />
      </Modal>
    </div>
  );
}
