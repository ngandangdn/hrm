import {
  CalendarOutlined,
  FileTextOutlined,
  IdcardOutlined,
  LinkOutlined,
  MailOutlined,
  PhoneOutlined,
  ReloadOutlined,
  SearchOutlined,
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Alert, Button, Descriptions, Empty, Form, Input, Modal, Skeleton, Space, Tag, Typography, Upload, message } from 'antd';
import type { AxiosError } from 'axios';
import { useEffect, useMemo, useState } from 'react';

import { axiosClient } from '@/api/axiosClient';
import { useAuthStore } from '@/stores/authStore';

import { useCreateYeuCauCapNhat, useDanhSachHoSoNhanSu, useHoSoCaNhan, useUploadFileHopDong } from './api';
import type { HoSoCaNhan, NhanVienHoSoListItem } from './types';

const { Text } = Typography;

type UpdateProfileFormValues = {
  sdt?: string;
  diaChi?: string;
  ghiChu?: string;
};

type UpdateProfileDetail = {
  tenTruong: string;
  nhomThongTin: string;
  giaTriCu?: string;
  giaTriMoi: string;
  ghiChu?: string;
};

function getBackendMessage(error: unknown) {
  const axiosError = error as AxiosError<{ detail?: string; message?: string }>;
  return axiosError.response?.data?.detail ?? axiosError.response?.data?.message ?? 'Không thể tải dữ liệu hồ sơ';
}

function formatDate(value?: string | null) {
  if (!value) return 'Không thời hạn';
  const datePart = value.split('T')[0];
  const [year, month, day] = datePart.split('-');
  return year && month && day ? `${day}/${month}/${year}` : value;
}

function employmentStatus(value: number) {
  return value === 1 ? <Tag color="success">Đang làm việc</Tag> : <Tag color="default">Đã nghỉ việc</Tag>;
}

function contractStatus(value: number) {
  return value === 1 ? <Tag color="blue">Còn hiệu lực</Tag> : <Tag color="default">Hết hiệu lực</Tag>;
}

function fileUrl(path?: string | null) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const baseUrl = String(axiosClient.defaults.baseURL ?? '').replace(/\/$/, '');
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

function SummaryCards({ profile }: { profile: HoSoCaNhan }) {
  const { thong_tin_chung, lien_he, cong_viec, hop_dong } = profile;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <div className="hicas-card p-4">
        <Text className="text-hicas-muted">Mã nhân viên</Text>
        <div className="mt-2 flex items-center gap-2 text-xl font-bold text-hicas-text">
          <IdcardOutlined className="text-hicas-primary" />
          {thong_tin_chung.id_NhanVien}
        </div>
      </div>
      <div className="hicas-card p-4">
        <Text className="text-hicas-muted">Chức vụ</Text>
        <div className="mt-2 text-xl font-bold text-hicas-text">{cong_viec.chucVu}</div>
      </div>
      <div className="hicas-card p-4">
        <Text className="text-hicas-muted">Liên hệ</Text>
        <div className="mt-2 truncate text-xl font-bold text-hicas-text">{lien_he.sdt}</div>
      </div>
      <div className="hicas-card p-4">
        <Text className="text-hicas-muted">Hợp đồng</Text>
        <div className="mt-2 text-xl font-bold text-hicas-text">{hop_dong ? contractStatus(hop_dong.trangThaiHopDong) : <Tag>Chưa có</Tag>}</div>
      </div>
    </div>
  );
}

function employeeMatchesKeyword(employee: NhanVienHoSoListItem, keyword: string) {
  const normalized = keyword.trim().toLowerCase();
  if (!normalized) return true;
  return [
    employee.id_NhanVien,
    employee.hoTen,
    employee.email,
    employee.sdt,
    employee.chucVu,
    employee.nganhNghe ?? '',
    employee.trinhDoHocVan ?? '',
    employee.trinhDoChuyenMon ?? '',
    employee.truongDaoTao ?? '',
    employee.chuyenNganh ?? '',
    employee.kyNangNghe ?? '',
    employee.chungChiNghe ?? '',
    employee.bacKyNangNghe ?? '',
    employee.ngoaiNgu ?? '',
    employee.tinHoc ?? '',
    employee.kinhNghiemLamViec ?? '',
    employee.diaChi ?? '',
    employee.cccd,
    employee.maSoThue ?? '',
  ].some((value) => String(value).toLowerCase().includes(normalized));
}

export default function HoSoNhanSuPage() {
  const user = useAuthStore((state) => state.user);
  const listQuery = useDanhSachHoSoNhanSu();
  const [selectedId, setSelectedId] = useState(user?.id_TaiKhoan ?? 'NV001');
  const [keyword, setKeyword] = useState('');
  const profileQuery = useHoSoCaNhan(selectedId);
  const updateMutation = useCreateYeuCauCapNhat();
  const uploadContractMutation = useUploadFileHopDong();
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [updateForm] = Form.useForm<UpdateProfileFormValues>();

  useEffect(() => {
    const firstId = listQuery.data?.[0]?.id_NhanVien;
    if (firstId && !listQuery.data?.some((employee) => employee.id_NhanVien === selectedId)) {
      setSelectedId(firstId);
    }
  }, [listQuery.data, selectedId]);

  const handleUpdateSubmit = (values: UpdateProfileFormValues) => {
    const chiTiet: UpdateProfileDetail[] = [];

    if (values.sdt && values.sdt !== profileQuery.data?.lien_he.sdt) {
      chiTiet.push({
        tenTruong: 'sdt',
        nhomThongTin: 'Liên hệ',
        giaTriCu: profileQuery.data?.lien_he.sdt ?? undefined,
        giaTriMoi: values.sdt,
        ghiChu: values.ghiChu || undefined,
      });
    }

    if (values.diaChi && values.diaChi !== profileQuery.data?.lien_he.diaChi) {
      chiTiet.push({
        tenTruong: 'diaChi',
        nhomThongTin: 'Liên hệ',
        giaTriCu: profileQuery.data?.lien_he.diaChi ?? undefined,
        giaTriMoi: values.diaChi,
        ghiChu: values.ghiChu || undefined,
      });
    }

    if (chiTiet.length === 0) {
      message.warning('Vui lòng thay đổi ít nhất một thông tin');
      return;
    }

    updateMutation.mutate(
      { chiTiet },
      {
        onSuccess: () => {
          message.success('Đã gửi yêu cầu cập nhật thành công');
          setIsUpdateModalVisible(false);
          updateForm.resetFields();
        },
        onError: (error) => {
          message.error(getBackendMessage(error) || 'Gửi yêu cầu thất bại');
        },
      },
    );
  };

  const employees = useMemo(
    () => (listQuery.data ?? []).filter((employee) => employeeMatchesKeyword(employee, keyword)),
    [keyword, listQuery.data],
  );

  const selectedEmployee = listQuery.data?.find((item) => item.id_NhanVien === selectedId);
  const canUploadContract = user?.id_VaiTro === 'HCNS' || user?.id_VaiTro === 'ADMIN';
  const contractUrl = fileUrl(profileQuery.data?.hop_dong?.tepHopDong);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="m-0 text-2xl font-bold text-hicas-text">Hồ sơ nhân sự</h1>
          <p className="m-0 mt-1 text-hicas-muted">Xem đầy đủ hồ sơ nhân viên, liên hệ, công việc và hợp đồng.</p>
        </div>
        <Space>
          {selectedId === user?.id_TaiKhoan && (
            <Button type="primary" onClick={() => setIsUpdateModalVisible(true)}>
              Yêu cầu cập nhật
            </Button>
          )}
          <Button
            icon={<ReloadOutlined />}
            loading={profileQuery.isFetching || listQuery.isFetching}
            onClick={() => {
              listQuery.refetch();
              profileQuery.refetch();
            }}
          >
            Làm mới
          </Button>
        </Space>
      </div>

      <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <section className="hicas-card p-5">
          <div className="mb-4">
            <Input prefix={<SearchOutlined />} allowClear placeholder="Tìm theo mã, tên, email, SĐT, CCCD" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
          </div>

          {listQuery.isLoading ? (
            <Skeleton active paragraph={{ rows: 8 }} />
          ) : listQuery.isError ? (
            <Alert type="error" showIcon message="Không tải được danh sách nhân sự" description={getBackendMessage(listQuery.error)} />
          ) : employees.length === 0 ? (
            <Empty description="Không có nhân viên phù hợp" />
          ) : (
            <div className="max-h-[720px] space-y-3 overflow-auto pr-1">
              {employees.map((employee) => {
                const active = employee.id_NhanVien === selectedId;
                return (
                  <button
                    key={employee.id_NhanVien}
                    className={`w-full rounded-lg border p-4 text-left transition ${
                      active ? 'border-hicas-primary bg-[#f3f1ff]' : 'border-hicas-border bg-white hover:border-hicas-primary'
                    }`}
                    onClick={() => setSelectedId(employee.id_NhanVien)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-lg bg-hicas-primary text-white">
                        <UserOutlined />
                      </span>
                      <span className="min-w-0">
                        <strong className="block truncate text-hicas-text">{employee.hoTen}</strong>
                        <Text className="text-sm text-hicas-muted">{employee.id_NhanVien}</Text>
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Tag>{employee.email}</Tag>
                      <Tag color="blue">{employee.chucVu}</Tag>
                      {employmentStatus(employee.trangThaiLamViec)}
                    </div>
                    <div className="mt-3 grid gap-1 text-sm text-hicas-muted">
                      <span>SĐT: {employee.sdt}</span>
                      <span>CCCD: {employee.cccd}</span>
                      <span className="truncate">Địa chỉ: {employee.diaChi ?? 'Chưa cập nhật'}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="space-y-4">
          {profileQuery.isLoading ? (
            <div className="hicas-card p-5">
              <Skeleton active paragraph={{ rows: 10 }} />
            </div>
          ) : profileQuery.isError ? (
            <Alert type="error" showIcon message="Không tải được hồ sơ" description={getBackendMessage(profileQuery.error)} />
          ) : profileQuery.data ? (
            <>
              <div className="hicas-card p-5">
                <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="m-0 text-2xl font-bold text-hicas-text">{profileQuery.data.thong_tin_chung.hoTen}</h2>
                    <Space className="mt-2" wrap>
                      {employmentStatus(profileQuery.data.thong_tin_chung.trangThaiLamViec)}
                      <Tag>{selectedEmployee?.id_NhanVien ?? selectedId}</Tag>
                      <Tag color="purple">{profileQuery.data.cong_viec.chucVu}</Tag>
                    </Space>
                  </div>
                </div>
                <SummaryCards profile={profileQuery.data} />
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <div className="hicas-card p-5">
                  <h3 className="m-0 mb-4 flex items-center gap-2 text-lg font-semibold text-hicas-text">
                    <UserOutlined className="text-hicas-primary" />
                    Thông tin chung
                  </h3>
                  <Descriptions column={1} size="middle">
                    <Descriptions.Item label="Mã nhân viên">{profileQuery.data.thong_tin_chung.id_NhanVien}</Descriptions.Item>
                    <Descriptions.Item label="Họ tên">{profileQuery.data.thong_tin_chung.hoTen}</Descriptions.Item>
                    <Descriptions.Item label="Giới tính">{profileQuery.data.thong_tin_chung.gioiTinh}</Descriptions.Item>
                    <Descriptions.Item label="Ngày sinh">
                      <CalendarOutlined className="mr-2 text-hicas-muted" />
                      {formatDate(profileQuery.data.thong_tin_chung.ngaySinh)}
                    </Descriptions.Item>
                    <Descriptions.Item label="CCCD">{profileQuery.data.thong_tin_chung.cccd}</Descriptions.Item>
                    <Descriptions.Item label="Mã số thuế">{profileQuery.data.thong_tin_chung.maSoThue ?? 'Chưa có'}</Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">{employmentStatus(profileQuery.data.thong_tin_chung.trangThaiLamViec)}</Descriptions.Item>
                  </Descriptions>
                </div>

                <div className="hicas-card p-5">
                  <h3 className="m-0 mb-4 flex items-center gap-2 text-lg font-semibold text-hicas-text">
                    <MailOutlined className="text-hicas-primary" />
                    Liên hệ & Công việc
                  </h3>
                  <Descriptions column={1} size="middle">
                    <Descriptions.Item label="Email">{profileQuery.data.lien_he.email}</Descriptions.Item>
                    <Descriptions.Item label="Điện thoại">
                      <PhoneOutlined className="mr-2 text-hicas-muted" />
                      {profileQuery.data.lien_he.sdt}
                    </Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ">{profileQuery.data.lien_he.diaChi ?? 'Chưa cập nhật'}</Descriptions.Item>
                    <Descriptions.Item label="Chức vụ">{profileQuery.data.cong_viec.chucVu}</Descriptions.Item>
                  </Descriptions>
                </div>
              </div>

              <div className="hicas-card p-5">
                <h3 className="m-0 mb-4 flex items-center gap-2 text-lg font-semibold text-hicas-text">
                  <IdcardOutlined className="text-hicas-primary" />
                  Học vấn & kỹ năng nghề
                </h3>
                <Descriptions column={{ xs: 1, md: 2 }} size="middle">
                  <Descriptions.Item label="Ngành nghề">{profileQuery.data.cong_viec.nganhNghe ?? 'Chưa cập nhật'}</Descriptions.Item>
                  <Descriptions.Item label="Trình độ học vấn">{profileQuery.data.cong_viec.trinhDoHocVan ?? 'Chưa cập nhật'}</Descriptions.Item>
                  <Descriptions.Item label="Trình độ chuyên môn">{profileQuery.data.cong_viec.trinhDoChuyenMon ?? 'Chưa cập nhật'}</Descriptions.Item>
                  <Descriptions.Item label="Trường đào tạo">{profileQuery.data.cong_viec.truongDaoTao ?? 'Chưa cập nhật'}</Descriptions.Item>
                  <Descriptions.Item label="Chuyên ngành">{profileQuery.data.cong_viec.chuyenNganh ?? 'Chưa cập nhật'}</Descriptions.Item>
                  <Descriptions.Item label="Năm tốt nghiệp">{profileQuery.data.cong_viec.namTotNghiep ?? 'Chưa cập nhật'}</Descriptions.Item>
                  <Descriptions.Item label="Kỹ năng nghề">{profileQuery.data.cong_viec.kyNangNghe ?? 'Chưa cập nhật'}</Descriptions.Item>
                  <Descriptions.Item label="Chứng chỉ">{profileQuery.data.cong_viec.chungChiNghe ?? 'Chưa cập nhật'}</Descriptions.Item>
                  <Descriptions.Item label="Bậc kỹ năng nghề">{profileQuery.data.cong_viec.bacKyNangNghe ?? 'Chưa cập nhật'}</Descriptions.Item>
                  <Descriptions.Item label="Ngoại ngữ">{profileQuery.data.cong_viec.ngoaiNgu ?? 'Chưa cập nhật'}</Descriptions.Item>
                  <Descriptions.Item label="Tin học">{profileQuery.data.cong_viec.tinHoc ?? 'Chưa cập nhật'}</Descriptions.Item>
                  <Descriptions.Item label="Kinh nghiệm">{profileQuery.data.cong_viec.kinhNghiemLamViec ?? 'Chưa cập nhật'}</Descriptions.Item>
                </Descriptions>
              </div>

              <div className="hicas-card p-5">
                <h3 className="m-0 mb-4 flex items-center gap-2 text-lg font-semibold text-hicas-text">
                  <FileTextOutlined className="text-hicas-primary" />
                  Hợp đồng hiện hành
                </h3>
                {profileQuery.data.hop_dong ? (
                  <Descriptions column={{ xs: 1, md: 2 }} size="middle">
                    <Descriptions.Item label="Mã hợp đồng">{profileQuery.data.hop_dong.id_HopDong}</Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">{contractStatus(profileQuery.data.hop_dong.trangThaiHopDong)}</Descriptions.Item>
                    <Descriptions.Item label="Loại hợp đồng">{profileQuery.data.hop_dong.loaiHopDong}</Descriptions.Item>
                    <Descriptions.Item label="File hợp đồng">
                      <Space wrap>
                        {contractUrl ? (
                          <Button icon={<LinkOutlined />} href={contractUrl} target="_blank" rel="noreferrer">
                            Mở file hợp đồng
                          </Button>
                        ) : (
                          <Tag>Chưa đính kèm</Tag>
                        )}
                        {canUploadContract && (
                          <Upload
                            accept=".pdf,.doc,.docx"
                            showUploadList={false}
                            beforeUpload={(file) => {
                              uploadContractMutation.mutate(
                                { idNhanVien: selectedId, file },
                                {
                                  onSuccess: () => {
                                    message.success('Đã upload file hợp đồng');
                                    profileQuery.refetch();
                                  },
                                  onError: (error) => {
                                    message.error(getBackendMessage(error) || 'Upload file hợp đồng thất bại');
                                  },
                                },
                              );
                              return false;
                            }}
                          >
                            <Button icon={<UploadOutlined />} loading={uploadContractMutation.isPending}>
                              Upload hợp đồng
                            </Button>
                          </Upload>
                        )}
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày bắt đầu">{formatDate(profileQuery.data.hop_dong.ngayBatDau)}</Descriptions.Item>
                    <Descriptions.Item label="Ngày kết thúc">{formatDate(profileQuery.data.hop_dong.ngayKetThuc)}</Descriptions.Item>
                  </Descriptions>
                ) : (
                  <Empty description="Nhân viên chưa có hợp đồng hiện hành" />
                )}
              </div>
            </>
          ) : null}
        </section>
      </div>

      <Modal title="Yêu cầu cập nhật hồ sơ" open={isUpdateModalVisible} onCancel={() => setIsUpdateModalVisible(false)} footer={null} destroyOnClose>
        <Form
          form={updateForm}
          layout="vertical"
          onFinish={handleUpdateSubmit}
          initialValues={{ sdt: profileQuery.data?.lien_he.sdt, diaChi: profileQuery.data?.lien_he.diaChi }}
        >
          <Form.Item name="sdt" label="Số điện thoại mới">
            <Input placeholder="Nhập số điện thoại mới nếu muốn đổi" />
          </Form.Item>
          <Form.Item name="diaChi" label="Địa chỉ mới">
            <Input placeholder="Nhập địa chỉ mới nếu muốn đổi" />
          </Form.Item>
          <Form.Item name="ghiChu" label="Lý do/Ghi chú" rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}>
            <Input.TextArea rows={3} placeholder="Ví dụ: Thay đổi nơi ở..." />
          </Form.Item>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsUpdateModalVisible(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={updateMutation.isPending}>
              Gửi yêu cầu
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
