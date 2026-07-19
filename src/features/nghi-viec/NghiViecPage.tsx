import { PlusOutlined, FileTextOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, Table, Tag, message, DatePicker } from 'antd';
import type { AxiosError } from 'axios';
import { useState } from 'react';
import dayjs from 'dayjs';

import { useListDonNghiViec, useCreateDonNghiViec } from './api';

function statusTag(status: number) {
  if (status === -1) return <Tag color="default">Lưu nháp</Tag>;
  if (status === 0) return <Tag color="processing">Chờ duyệt</Tag>;
  if (status === 1) return <Tag color="success">Đã duyệt / Đã ra QĐ</Tag>;
  return <Tag color="error">Từ chối / Đã hủy</Tag>;
}

export default function NghiViecPage() {
  const { data: listData, isLoading, refetch } = useListDonNghiViec();
  const createMutation = useCreateDonNghiViec();
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = (values: any, is_draft: boolean) => {
    createMutation.mutate(
      {
        ngayLamViecCuoi: values.ngayLamViecCuoi.format('YYYY-MM-DD'),
        lyDoNghiViec: values.lyDoNghiViec,
        noiDungBanGiao: values.noiDungBanGiao,
        ghiChu: values.ghiChu,
        is_draft,
      },
      {
        onSuccess: () => {
          message.success(is_draft ? 'Lưu nháp thành công' : 'Đã gửi đơn xin nghỉ việc');
          setIsModalVisible(false);
          form.resetFields();
          refetch();
        },
        onError: (error) => {
          const axiosError = error as AxiosError<{ detail?: string }>;
          message.error(axiosError.response?.data?.detail || 'Thao tác thất bại');
        },
      }
    );
  };

  const columns = [
    { title: 'Mã Đơn', dataIndex: 'id_DonNghiViec', key: 'id_DonNghiViec' },
    { title: 'Ngày tạo', dataIndex: 'ngayTao', render: (val: string) => dayjs(val).format('DD/MM/YYYY HH:mm') },
    { title: 'Ngày làm việc cuối', dataIndex: 'ngayLamViecCuoi', render: (val: string) => dayjs(val).format('DD/MM/YYYY') },
    { title: 'Lý do', dataIndex: 'lyDoNghiViec' },
    { title: 'Trạng thái', dataIndex: 'trangThai', render: statusTag },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="m-0 text-2xl font-bold text-hicas-text">Đơn xin nghỉ việc của tôi</h1>
          <p className="m-0 mt-1 text-hicas-muted">Xem lịch sử và tạo đơn xin nghỉ việc mới</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
          Tạo đơn mới
        </Button>
      </div>

      <div className="hicas-card p-5">
        <Table
          rowKey="id_DonNghiViec"
          loading={isLoading}
          dataSource={listData}
          columns={columns}
          locale={{ emptyText: 'Chưa có đơn xin nghỉ việc nào' }}
        />
      </div>

      <Modal
        title="Tạo đơn xin nghỉ việc"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="ngayLamViecCuoi" label="Ngày làm việc cuối cùng" rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}>
            <DatePicker className="w-full" format="DD/MM/YYYY" placeholder="Chọn ngày làm việc cuối" />
          </Form.Item>
          <Form.Item name="lyDoNghiViec" label="Lý do nghỉ việc" rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}>
            <Input.TextArea rows={3} placeholder="Ví dụ: Định hướng phát triển cá nhân thay đổi..." />
          </Form.Item>
          <Form.Item name="noiDungBanGiao" label="Nội dung bàn giao dự kiến" rules={[{ required: true, message: 'Vui lòng nhập nội dung bàn giao' }]}>
            <Input.TextArea rows={3} placeholder="Ví dụ: Bàn giao task A cho bạn B, trả laptop..." />
          </Form.Item>
          <Form.Item name="ghiChu" label="Ghi chú thêm (Tùy chọn)">
            <Input.TextArea rows={2} placeholder="Nhập ghi chú" />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
            <Button 
              onClick={() => {
                form.validateFields().then((values) => handleSubmit(values, true));
              }}
              loading={createMutation.isPending}
            >
              Lưu nháp
            </Button>
            <Button 
              type="primary" 
              onClick={() => {
                form.validateFields().then((values) => handleSubmit(values, false));
              }}
              loading={createMutation.isPending}
            >
              Gửi yêu cầu
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
