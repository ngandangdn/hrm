import { Alert, Button, Form, Input, Select, Skeleton, message } from 'antd';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuthStore } from '@/stores/authStore';
import { LEAVE_TYPE_OPTIONS } from './constants';
import { useBangPhep, useTaoDonPhep } from './api';
import type { TaoDonPhepPayload } from './types';
import { currentYear, getBackendMessage } from './utils';

type FormValues = TaoDonPhepPayload;

export default function TaoDonPhepPage() {
  const [form] = Form.useForm<FormValues>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const bangPhepQuery = useBangPhep({ nam: currentYear(), page: 1, size: 20 });
  const createMutation = useTaoDonPhep();
  const ownQuota = useMemo(() => (bangPhepQuery.data ?? []).find((item) => item.id_NhanVien === user?.id_TaiKhoan) ?? bangPhepQuery.data?.[0], [bangPhepQuery.data, user?.id_TaiKhoan]);

  const handleSubmit = async (values: FormValues) => {
    try {
      const response = await createMutation.mutateAsync({ ...values, id_QuyPhep: ownQuota?.id_QuyPhep ?? values.id_QuyPhep });
      message.success(response.message || 'Tạo đơn nghỉ phép thành công');
      navigate(`/nghi-phep/don/${response.data.id_DonPhep}`);
    } catch (error) {
      message.error(getBackendMessage(error));
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="m-0 text-2xl font-bold text-hicas-text">Tạo đơn nghỉ phép</h1>
        <p className="m-0 mt-1 text-hicas-muted">Gửi đơn nghỉ phép để quản lý xem xét và phê duyệt</p>
      </div>

      {bangPhepQuery.isLoading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : !ownQuota ? (
        <Alert type="warning" showIcon message="Chưa có quỹ phép hợp lệ" description="Tài khoản hiện tại chưa có quỹ phép để tạo đơn nghỉ phép." />
      ) : (
        <Form
          form={form}
          layout="vertical"
          className="hicas-card p-5"
          initialValues={{ id_QuyPhep: ownQuota.id_QuyPhep, loaiPhep: LEAVE_TYPE_OPTIONS[0].value }}
          onFinish={handleSubmit}
        >
          <Alert
            className="mb-4"
            type="info"
            showIcon
            message={`Quỹ phép sử dụng: ${ownQuota.id_QuyPhep}`}
            description="Số ngày nghỉ chính thức sẽ được tính khi gửi đơn."
          />
          <Form.Item name="id_QuyPhep" label="Mã quỹ phép" rules={[{ required: true, message: 'Vui lòng chọn quỹ phép' }]}>
            <Select options={[{ label: `${ownQuota.id_QuyPhep} - ${ownQuota.nam}`, value: ownQuota.id_QuyPhep }]} />
          </Form.Item>
          <Form.Item name="loaiPhep" label="Loại phép" rules={[{ required: true, message: 'Vui lòng chọn loại phép' }]}>
            <Select options={LEAVE_TYPE_OPTIONS} />
          </Form.Item>
          <div className="grid gap-4 md:grid-cols-2">
            <Form.Item name="tuNgay" label="Từ ngày" rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}>
              <Input type="date" />
            </Form.Item>
            <Form.Item
              name="denNgay"
              label="Đến ngày"
              dependencies={['tuNgay']}
              rules={[
                { required: true, message: 'Vui lòng chọn ngày kết thúc' },
                ({ getFieldValue }) => ({
                  validator(_, value: string | undefined) {
                    const from = getFieldValue('tuNgay') as string | undefined;
                    if (!from || !value || from <= value) return Promise.resolve();
                    return Promise.reject(new Error('Từ ngày phải nhỏ hơn hoặc bằng đến ngày'));
                  },
                }),
              ]}
            >
              <Input type="date" />
            </Form.Item>
          </div>
          <Form.Item name="lyDo" label="Lý do nghỉ" rules={[{ required: true, message: 'Vui lòng nhập lý do' }, { max: 255, message: 'Tối đa 255 ký tự' }]}>
            <Input.TextArea rows={5} showCount maxLength={255} />
          </Form.Item>
          <div className="flex justify-end gap-3">
            <Button onClick={() => navigate('/nghi-phep/danh-sach-don')}>Đóng</Button>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending} disabled={createMutation.isPending || !ownQuota}>
              Gửi đơn
            </Button>
          </div>
        </Form>
      )}
    </div>
  );
}
