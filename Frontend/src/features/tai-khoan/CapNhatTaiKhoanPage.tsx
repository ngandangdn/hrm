import { SaveOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Form, Input, Result, Space, Spin, message } from 'antd';

import { useAuthStore } from '@/stores/authStore';
import { useCreateYeuCauCapNhat, useHoSoCaNhan } from '@/features/ho-so/api';

type FormValues = {
  sdt?: string;
  diaChi?: string;
  ngoaiNgu?: string;
  tinHoc?: string;
  kyNangNghe?: string;
  ghiChu?: string;
};

function buildChange(field: string, group: string, oldValue: unknown, newValue: unknown, note?: string) {
  const before = String(oldValue ?? '').trim();
  const after = String(newValue ?? '').trim();
  if (!after || before === after) return null;
  return {
    tenTruong: field,
    nhomThongTin: group,
    giaTriCu: before,
    giaTriMoi: after,
    ghiChu: note,
  };
}

export default function CapNhatTaiKhoanPage() {
  const user = useAuthStore((state) => state.user);
  const profileQuery = useHoSoCaNhan(user?.id_TaiKhoan);
  const createMutation = useCreateYeuCauCapNhat();
  const [form] = Form.useForm<FormValues>();

  if (!user?.id_TaiKhoan) {
    return <Result status="403" title="Chưa xác định được tài khoản" />;
  }

  if (profileQuery.isLoading) {
    return (
      <div className="grid min-h-[360px] place-items-center">
        <Spin />
      </div>
    );
  }

  if (!profileQuery.data) {
    return <Result status="warning" title="Không tìm thấy hồ sơ tài khoản" />;
  }

  const profile = profileQuery.data;

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div>
        <h1 className="m-0 text-2xl font-bold text-hicas-text">Cập nhật tài khoản</h1>
        <p className="m-0 mt-1 text-hicas-muted">Tạo yêu cầu thay đổi thông tin cá nhân để HCNS kiểm tra và duyệt.</p>
      </div>

      <Card className="hicas-card" bordered={false}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Space size={16}>
            <div className="grid h-14 w-14 place-items-center rounded-lg bg-hicas-primary/10 text-2xl text-hicas-primary">
              <UserOutlined />
            </div>
            <div>
              <div className="text-xl font-semibold">{profile.thong_tin_chung.hoTen}</div>
              <div className="text-hicas-muted">
                {profile.thong_tin_chung.id_NhanVien} · {profile.cong_viec.chucVu}
              </div>
            </div>
          </Space>
          <div className="text-left text-sm text-hicas-muted md:text-right">
            <div>Email đăng nhập</div>
            <div className="font-semibold text-hicas-text">{profile.lien_he.email}</div>
          </div>
        </div>
      </Card>

      <Alert
        type="info"
        showIcon
        message="Thông tin gửi đi sẽ tạo yêu cầu cập nhật hồ sơ"
        description="Các thay đổi chỉ có hiệu lực sau khi HCNS duyệt yêu cầu trong mục Quản lý hệ thống."
      />

      <Card className="hicas-card" bordered={false}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            sdt: profile.lien_he.sdt,
            diaChi: profile.lien_he.diaChi,
            ngoaiNgu: profile.cong_viec.ngoaiNgu,
            tinHoc: profile.cong_viec.tinHoc,
            kyNangNghe: profile.cong_viec.kyNangNghe,
          }}
          onFinish={async (values) => {
            const note = values.ghiChu?.trim();
            const changes = [
              buildChange('sdt', 'lien_he', profile.lien_he.sdt, values.sdt, note),
              buildChange('diaChi', 'lien_he', profile.lien_he.diaChi, values.diaChi, note),
              buildChange('ngoaiNgu', 'cong_viec', profile.cong_viec.ngoaiNgu, values.ngoaiNgu, note),
              buildChange('tinHoc', 'cong_viec', profile.cong_viec.tinHoc, values.tinHoc, note),
              buildChange('kyNangNghe', 'cong_viec', profile.cong_viec.kyNangNghe, values.kyNangNghe, note),
            ].filter(Boolean) as Array<{
              tenTruong: string;
              nhomThongTin: string;
              giaTriCu?: string;
              giaTriMoi: string;
              ghiChu?: string;
            }>;

            if (changes.length === 0) {
              message.warning('Bạn chưa thay đổi thông tin nào');
              return;
            }

            await createMutation.mutateAsync({ chiTiet: changes });
            message.success('Đã gửi yêu cầu cập nhật tài khoản');
            await profileQuery.refetch();
          }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Form.Item name="sdt" label="Số điện thoại">
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>
            <Form.Item name="diaChi" label="Địa chỉ">
              <Input placeholder="Nhập địa chỉ liên hệ" />
            </Form.Item>
            <Form.Item name="ngoaiNgu" label="Ngoại ngữ">
              <Input placeholder="Ví dụ: Tiếng Anh B2" />
            </Form.Item>
            <Form.Item name="tinHoc" label="Tin học">
              <Input placeholder="Ví dụ: MOS Excel, Power BI" />
            </Form.Item>
          </div>
          <Form.Item name="kyNangNghe" label="Kỹ năng">
            <Input.TextArea rows={3} placeholder="Bổ sung kỹ năng chuyên môn, nghiệp vụ" />
          </Form.Item>
          <Form.Item name="ghiChu" label="Lý do cập nhật">
            <Input.TextArea rows={3} placeholder="Nhập lý do hoặc ghi chú để HCNS xem xét" />
          </Form.Item>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={createMutation.isPending}>
            Gửi yêu cầu
          </Button>
        </Form>
      </Card>
    </div>
  );
}
