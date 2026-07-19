import { FileProtectOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Alert, Button, Form, Input, Modal, Table, Tag, message, DatePicker, Descriptions, Drawer, Space, Checkbox } from 'antd';
import type { AxiosError } from 'axios';
import { useState } from 'react';
import dayjs from 'dayjs';

import { useListDonNghiViec, useCreateQuyetDinh } from './api';
import type { DonNghiViec } from './api';

function statusTag(status: number) {
  if (status === -1) return <Tag color="default">Lưu nháp</Tag>;
  if (status === 0) return <Tag color="processing">Chờ duyệt</Tag>;
  if (status === 1) return <Tag color="success">Đã ra Quyết định</Tag>;
  return <Tag color="error">Từ chối</Tag>;
}

export default function XuLyNghiViecPage() {
  const { data: listData, isLoading, refetch } = useListDonNghiViec();
  const createQDMutation = useCreateQuyetDinh();
  
  const [selectedDon, setSelectedDon] = useState<DonNghiViec | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Lọc ra các đơn không phải là nháp (HR không thấy nháp, hoặc nếu thấy thì không duyệt)
  const dataSource = listData?.filter(d => d.trangThai >= 0) || [];

  const handleCreateQD = (values: any) => {
    if (!selectedDon) return;
    
    createQDMutation.mutate(
      {
        soQuyetDinh: values.soQuyetDinh,
        ngayKy: values.ngayKy.format('YYYY-MM-DD'),
        ngayHieuLuc: values.ngayHieuLuc.format('YYYY-MM-DD'),
        nguoiKy: values.nguoiKy,
        lyDoNghiViec: values.lyDoNghiViec || selectedDon.lyDoNghiViec,
        banHanh: values.banHanh,
        id_DonNghiViec: selectedDon.id_DonNghiViec,
      },
      {
        onSuccess: () => {
          message.success('Đã ra quyết định nghỉ việc thành công!');
          setIsModalVisible(false);
          setIsDrawerOpen(false);
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
    { title: 'Nhân viên', dataIndex: 'id_NhanVien', key: 'id_NhanVien' },
    { title: 'Ngày tạo', dataIndex: 'ngayTao', render: (val: string) => dayjs(val).format('DD/MM/YYYY') },
    { title: 'Ngày làm việc cuối', dataIndex: 'ngayLamViecCuoi', render: (val: string) => dayjs(val).format('DD/MM/YYYY') },
    { title: 'Trạng thái', dataIndex: 'trangThai', render: statusTag },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: DonNghiViec) => (
        <Button 
          type="link" 
          onClick={() => {
            setSelectedDon(record);
            setIsDrawerOpen(true);
          }}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="m-0 text-2xl font-bold text-hicas-text">Xử lý Đơn xin nghỉ việc</h1>
        <p className="m-0 mt-1 text-hicas-muted">Dành cho bộ phận Hành chính Nhân sự (HCNS)</p>
      </div>

      <div className="hicas-card p-5">
        <Table
          rowKey="id_DonNghiViec"
          loading={isLoading}
          dataSource={dataSource}
          columns={columns}
          locale={{ emptyText: 'Chưa có đơn xin nghỉ việc nào' }}
        />
      </div>

      <Drawer
        title="Chi tiết đơn xin nghỉ việc"
        placement="right"
        width={500}
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        extra={
          selectedDon?.trangThai === 0 && (
            <Button type="primary" onClick={() => setIsModalVisible(true)}>
              Ra Quyết định
            </Button>
          )
        }
      >
        {selectedDon && (
          <Descriptions column={1} bordered size="middle">
            <Descriptions.Item label="Mã Đơn">{selectedDon.id_DonNghiViec}</Descriptions.Item>
            <Descriptions.Item label="Mã Nhân Viên">{selectedDon.id_NhanVien}</Descriptions.Item>
            <Descriptions.Item label="Ngày Tạo">{dayjs(selectedDon.ngayTao).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
            <Descriptions.Item label="Ngày NV cuối cùng">{dayjs(selectedDon.ngayLamViecCuoi).format('DD/MM/YYYY')}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">{statusTag(selectedDon.trangThai)}</Descriptions.Item>
            <Descriptions.Item label="Lý do nghỉ việc">{selectedDon.lyDoNghiViec}</Descriptions.Item>
            <Descriptions.Item label="Nội dung bàn giao">{selectedDon.noiDungBanGiao}</Descriptions.Item>
            <Descriptions.Item label="Ghi chú">{selectedDon.ghiChu || 'Không có'}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>

      <Modal
        title="Ra Quyết định nghỉ việc"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Alert 
          message="Lưu ý" 
          description="Việc ra quyết định và Ban hành sẽ lên lịch ngắt kết nối tài khoản của nhân viên vào Ngày hiệu lực." 
          type="warning" 
          showIcon 
          className="mb-4"
        />
        
        <Form form={form} layout="vertical" onFinish={handleCreateQD}>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="soQuyetDinh" label="Số Quyết Định" rules={[{ required: true, message: 'Nhập số QĐ' }]}>
              <Input placeholder="Ví dụ: QD-2026-001" />
            </Form.Item>
            <Form.Item name="nguoiKy" label="Người ký" rules={[{ required: true, message: 'Nhập tên người ký' }]}>
              <Input placeholder="Đặng Kim Ngân" />
            </Form.Item>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="ngayKy" label="Ngày ký" rules={[{ required: true }]}>
              <DatePicker className="w-full" format="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item name="ngayHieuLuc" label="Ngày hiệu lực" rules={[{ required: true }]}>
              <DatePicker className="w-full" format="DD/MM/YYYY" />
            </Form.Item>
          </div>

          <Form.Item name="lyDoNghiViec" label="Lý do ghi trên QĐ (Tùy chọn, mặc định lấy theo đơn)">
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.Item name="banHanh" valuePropName="checked" initialValue={true}>
            <Checkbox>Ban hành (Sẽ áp dụng thu hồi quyền vào ngày hiệu lực)</Checkbox>
          </Form.Item>

          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" icon={<CheckCircleOutlined />} loading={createQDMutation.isPending}>
              Ra Quyết định
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
