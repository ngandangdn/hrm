import { SendOutlined } from '@ant-design/icons';
import { Button, Form, Input, Radio, Result, Select, Space, message } from 'antd';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuthStore } from '@/stores/authStore';
import { useTaoThongBao } from './api';
import type { DoiTuongNhan, TaoThongBaoPayload } from './types';
import { DEMO_EMPLOYEE_OPTIONS, canCreateThongBao, getBackendMessage, isHcnsOrAdmin } from './utils';

type FormValues = {
  tieuDe: string;
  noiDung: string;
  loaiThongBao: string;
  doi_tuong_nhan: DoiTuongNhan;
  id_nhan_vien_list?: string[];
};

export default function TaoThongBaoPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [form] = Form.useForm<FormValues>();
  const createMutation = useTaoThongBao();
  const canCreate = canCreateThongBao(user?.id_VaiTro);
  const canSendCompanyWide = isHcnsOrAdmin(user?.id_VaiTro);
  const target = Form.useWatch('doi_tuong_nhan', form);

  const recipientOptions = useMemo(
    () =>
      DEMO_EMPLOYEE_OPTIONS.map((employee) => ({
        label: `${employee.hoTen} - ${employee.id_NhanVien} (${employee.email})`,
        value: employee.id_NhanVien,
      })),
    [],
  );

  if (!canCreate) {
    return <Result status="403" title="Không có quyền tạo thông báo" subTitle="Chức năng này chỉ dành cho HCNS/Admin hoặc quản lý." />;
  }

  const handleSubmit = async (values: FormValues) => {
    const payload: TaoThongBaoPayload = {
      tieuDe: values.tieuDe,
      noiDung: values.noiDung,
      loaiThongBao: values.loaiThongBao,
      doi_tuong_nhan: values.doi_tuong_nhan,
      id_nhan_vien_list: values.doi_tuong_nhan === 'CA_NHAN' ? values.id_nhan_vien_list ?? [] : null,
      id_phong_ban_list: null,
      id_du_an_list: null,
    };

    try {
      const response = await createMutation.mutateAsync(payload);
      message.success(`Đã gửi thông báo tới ${response.data.so_luong_nguoi_nhan} người nhận`);
      form.resetFields();
      navigate('/thong-bao');
    } catch (error) {
      message.error(getBackendMessage(error, 'Gửi thông báo thất bại'));
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="m-0 text-2xl font-bold text-hicas-text">Tạo thông báo nội bộ</h1>
        <p className="m-0 mt-1 text-hicas-muted">Gửi thông báo tới toàn công ty hoặc từng nhân viên cụ thể</p>
      </div>

      <Form
        form={form}
        layout="vertical"
        className="hicas-card p-5"
        initialValues={{ loaiThongBao: 'NOI_BO', doi_tuong_nhan: canSendCompanyWide ? 'TOAN_CONG_TY' : 'CA_NHAN' }}
        onFinish={handleSubmit}
      >
        <Form.Item name="tieuDe" label="Tiêu đề" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }, { max: 255, message: 'Tối đa 255 ký tự' }]}>
          <Input placeholder="Ví dụ: Lịch bảo trì hệ thống HRM" />
        </Form.Item>

        <Form.Item name="noiDung" label="Nội dung" rules={[{ required: true, message: 'Vui lòng nhập nội dung thông báo' }]}>
          <Input.TextArea rows={6} placeholder="Nhập nội dung thông báo..." />
        </Form.Item>

        <Form.Item name="loaiThongBao" label="Loại thông báo" rules={[{ required: true, message: 'Vui lòng nhập loại thông báo' }]}>
          <Select
            options={[
              { label: 'Nội bộ', value: 'NOI_BO' },
              { label: 'Nhân sự', value: 'NHAN_SU' },
              { label: 'Chấm công', value: 'CHAM_CONG' },
              { label: 'Nghỉ phép', value: 'NGHI_PHEP' },
              { label: 'Tài sản', value: 'TAI_SAN' },
            ]}
          />
        </Form.Item>

        <Form.Item name="doi_tuong_nhan" label="Đối tượng nhận" rules={[{ required: true, message: 'Vui lòng chọn đối tượng nhận' }]}>
          <Radio.Group>
            <Space direction="vertical">
              <Radio value="TOAN_CONG_TY" disabled={!canSendCompanyWide}>
                Toàn công ty {!canSendCompanyWide && '(chỉ HCNS/Admin)'}
              </Radio>
              <Radio value="CA_NHAN">Cá nhân cụ thể</Radio>
              <Radio value="PHONG_BAN" disabled>
                Theo phòng ban/dự án
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>

        {target === 'CA_NHAN' && (
          <Form.Item
            name="id_nhan_vien_list"
            label="Người nhận"
            rules={[{ required: true, message: 'Vui lòng chọn ít nhất một nhân viên' }]}
          >
            <Select mode="multiple" showSearch optionFilterProp="label" placeholder="Tìm theo tên, mã hoặc email" options={recipientOptions} />
          </Form.Item>
        )}

        <div className="flex justify-end gap-2">
          <Button onClick={() => navigate('/thong-bao')}>Hủy</Button>
          <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={createMutation.isPending}>
            Gửi thông báo
          </Button>
        </div>
      </Form>
    </div>
  );
}
