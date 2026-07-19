import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Card, DatePicker, Form, Input, Select, Space, Typography, message } from 'antd';
import type { Dayjs } from 'dayjs';
import { useNavigate } from 'react-router-dom';

import { useDangKyHop, useNhanVienLichHopOptions, usePhongHopOptions } from './api';
import ChonThanhVienSelect from './ChonThanhVienSelect';
import type { LichHopCreatePayload } from './types';

const { Title, Text } = Typography;

type FormValues = {
  id_Phong: string;
  tieuDe: string;
  noiDung?: string;
  mucDoUuTien: string;
  thoiGianBatDau: Dayjs;
  thoiGianKetThuc: Dayjs;
  thanhVien?: string[];
};

export default function DangKyHopPage() {
  const navigate = useNavigate();
  const roomsQuery = usePhongHopOptions();
  const employeesQuery = useNhanVienLichHopOptions();
  const createMutation = useDangKyHop();
  const [form] = Form.useForm<FormValues>();

  const submit = async (values: FormValues) => {
    const payload: LichHopCreatePayload = {
      id_Phong: values.id_Phong,
      tieuDe: values.tieuDe.trim(),
      noiDung: values.noiDung?.trim() || null,
      mucDoUuTien: values.mucDoUuTien,
      thoiGianBatDau: values.thoiGianBatDau.format('YYYY-MM-DDTHH:mm:ss'),
      thoiGianKetThuc: values.thoiGianKetThuc.format('YYYY-MM-DDTHH:mm:ss'),
      id_NhanVienThamGia: values.thanhVien ?? [],
    };

    try {
      await createMutation.mutateAsync(payload);
      message.success('Đã gửi đăng ký lịch họp');
      navigate('/phong-hop');
    } catch (error: unknown) {
      const detail = (error as { response?: { data?: { detail?: string; message?: string } } }).response?.data;
      message.error(detail?.detail ?? detail?.message ?? 'Không thể tạo lịch họp');
    }
  };

  return (
    <Space direction="vertical" size={20} className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Title level={2} className="!mb-1">
            Đăng ký phòng họp
          </Title>
          <Text type="secondary">Tạo lịch họp mới theo phòng và khung thời gian còn trống.</Text>
        </div>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/phong-hop')}>
          Quay lại
        </Button>
      </div>

      <Card className="border-hicas-border">
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          initialValues={{ mucDoUuTien: 'normal' }}
          onFinish={submit}
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <Form.Item name="id_Phong" label="Phòng họp" rules={[{ required: true, message: 'Chọn phòng họp' }]}>
              <Select
                loading={roomsQuery.isLoading}
                placeholder="Chọn phòng họp"
                options={(roomsQuery.data ?? [])
                  .filter((room) => room.trangThai === 1)
                  .map((room) => ({
                    value: room.id_Phong,
                    label: `${room.tenPhong} (${room.sucChua} người)`,
                  }))}
              />
            </Form.Item>
            <Form.Item name="mucDoUuTien" label="Mức độ ưu tiên">
              <Select
                options={[
                  { value: 'normal', label: 'Bình thường' },
                  { value: 'high', label: 'Cao' },
                  { value: 'urgent', label: 'Khẩn cấp' },
                ]}
              />
            </Form.Item>
          </div>

          <Form.Item
            name="tieuDe"
            label="Tiêu đề cuộc họp"
            rules={[
              { required: true, message: 'Nhập tiêu đề cuộc họp' },
              { max: 255, message: 'Tiêu đề tối đa 255 ký tự' },
            ]}
          >
            <Input placeholder="Ví dụ: Họp giao ban phòng HCNS" />
          </Form.Item>

          <Form.Item name="noiDung" label="Nội dung">
            <Input.TextArea rows={4} placeholder="Nội dung hoặc ghi chú cuộc họp" />
          </Form.Item>

          <div className="grid gap-4 lg:grid-cols-2">
            <Form.Item
              name="thoiGianBatDau"
              label="Thời gian bắt đầu"
              rules={[{ required: true, message: 'Chọn thời gian bắt đầu' }]}
            >
              <DatePicker showTime format="DD/MM/YYYY HH:mm" className="w-full" />
            </Form.Item>
            <Form.Item
              name="thoiGianKetThuc"
              label="Thời gian kết thúc"
              rules={[
                { required: true, message: 'Chọn thời gian kết thúc' },
                ({ getFieldValue }) => ({
                  validator(_, value: Dayjs | undefined) {
                    const start = getFieldValue('thoiGianBatDau') as Dayjs | undefined;
                    if (!value || !start || value.isAfter(start)) return Promise.resolve();
                    return Promise.reject(new Error('Thời gian kết thúc phải sau thời gian bắt đầu'));
                  },
                }),
              ]}
            >
              <DatePicker showTime format="DD/MM/YYYY HH:mm" className="w-full" />
            </Form.Item>
          </div>

          <Form.Item name="thanhVien" label="Thành viên tham dự">
            <ChonThanhVienSelect employees={employeesQuery.data ?? []} loading={employeesQuery.isLoading} />
          </Form.Item>

          <div className="flex justify-end gap-3">
            <Button onClick={() => navigate('/phong-hop')}>Hủy</Button>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={createMutation.isPending}>
              Gửi đăng ký
            </Button>
          </div>
        </Form>
      </Card>
    </Space>
  );
}
