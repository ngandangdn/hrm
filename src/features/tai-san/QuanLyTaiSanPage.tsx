import { SwapOutlined, DownloadOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, Table, Tag, message, DatePicker, Drawer, Space, Descriptions } from 'antd';
import type { AxiosError } from 'axios';
import { useState } from 'react';
import dayjs from 'dayjs';

import { useListTaiSan, useCapPhatTaiSan, useThuHoiTaiSan, useLichSuLuanChuyen } from './api';
import type { TaiSan, LichSuLuanChuyenItem } from './api';

function statusTag(status: number) {
  if (status === 1) return <Tag color="success">Sẵn sàng</Tag>;
  if (status === 0) return <Tag color="processing">Đã cấp phát</Tag>;
  return <Tag color="default">Khác</Tag>;
}

export default function QuanLyTaiSanPage() {
  const { data: listData, isLoading, refetch } = useListTaiSan();
  const capPhatMutation = useCapPhatTaiSan();
  const thuHoiMutation = useThuHoiTaiSan();
  
  const [selectedTaiSan, setSelectedTaiSan] = useState<TaiSan | null>(null);
  
  // Modals state
  const [isCapPhatOpen, setIsCapPhatOpen] = useState(false);
  const [isThuHoiOpen, setIsThuHoiOpen] = useState(false);
  const [isLichSuOpen, setIsLichSuOpen] = useState(false);
  
  const [formCapPhat] = Form.useForm();
  const [formThuHoi] = Form.useForm();

  // Load history when drawer opens
  const { data: lichSuData, isLoading: isLoadingLichSu } = useLichSuLuanChuyen(isLichSuOpen ? selectedTaiSan?.id_TaiSan : undefined);

  const handleCapPhat = (values: any) => {
    if (!selectedTaiSan) return;
    
    capPhatMutation.mutate(
      {
        id_nhan_vien: values.id_nhan_vien,
        id_tai_san_list: [selectedTaiSan.id_TaiSan],
        ngay_cap_phat: values.ngay_cap_phat.format('YYYY-MM-DD'),
        tinh_trang_ban_giao: values.tinh_trang_ban_giao,
      },
      {
        onSuccess: () => {
          message.success('Cấp phát tài sản thành công!');
          setIsCapPhatOpen(false);
          formCapPhat.resetFields();
          refetch();
        },
        onError: (error) => {
          const axiosError = error as AxiosError<{ detail?: string }>;
          message.error(axiosError.response?.data?.detail || 'Cấp phát thất bại');
        },
      }
    );
  };

  const handleThuHoi = (values: any) => {
    if (!selectedTaiSan) return;
    
    thuHoiMutation.mutate(
      {
        id_tai_san: selectedTaiSan.id_TaiSan,
        payload: {
          ngay_thu_hoi: values.ngay_thu_hoi.format('YYYY-MM-DD'),
          tinh_trang_thu_hoi: values.tinh_trang_thu_hoi,
        },
      },
      {
        onSuccess: () => {
          message.success('Thu hồi tài sản thành công!');
          setIsThuHoiOpen(false);
          formThuHoi.resetFields();
          refetch();
        },
        onError: (error) => {
          const axiosError = error as AxiosError<{ detail?: string }>;
          message.error(axiosError.response?.data?.detail || 'Thu hồi thất bại');
        },
      }
    );
  };

  const columns = [
    { title: 'Mã Tài Sản', dataIndex: 'id_TaiSan', key: 'id_TaiSan' },
    { title: 'Tên Tài Sản', dataIndex: 'tenTaiSan', key: 'tenTaiSan' },
    { title: 'Serial Number', dataIndex: 'serialNumber', key: 'serialNumber' },
    { title: 'Tình trạng', dataIndex: 'tinhTrang', key: 'tinhTrang' },
    { title: 'Trạng thái', dataIndex: 'trangThai', render: statusTag },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: TaiSan) => (
        <Space>
          {record.trangThai === 1 && (
            <Button 
              type="primary" 
              size="small"
              onClick={() => {
                setSelectedTaiSan(record);
                setIsCapPhatOpen(true);
              }}
            >
              Cấp phát
            </Button>
          )}
          {record.trangThai === 0 && (
            <Button 
              type="default" 
              size="small"
              danger
              onClick={() => {
                setSelectedTaiSan(record);
                setIsThuHoiOpen(true);
              }}
            >
              Thu hồi
            </Button>
          )}
          <Button 
            type="link" 
            size="small"
            onClick={() => {
              setSelectedTaiSan(record);
              setIsLichSuOpen(true);
            }}
          >
            Lịch sử
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="m-0 text-2xl font-bold text-hicas-text">Quản lý Kho tài sản</h1>
        <p className="m-0 mt-1 text-hicas-muted">Xem, cấp phát và thu hồi tài sản công ty</p>
      </div>

      <div className="hicas-card p-5">
        <Table
          rowKey="id_TaiSan"
          loading={isLoading}
          dataSource={listData}
          columns={columns}
          locale={{ emptyText: 'Chưa có tài sản nào trong kho' }}
        />
      </div>

      {/* Modal Cấp phát */}
      <Modal
        title={`Cấp phát tài sản: ${selectedTaiSan?.tenTaiSan}`}
        open={isCapPhatOpen}
        onCancel={() => setIsCapPhatOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={formCapPhat} layout="vertical" onFinish={handleCapPhat}>
          <Form.Item name="id_nhan_vien" label="Mã Nhân viên nhận" rules={[{ required: true, message: 'Vui lòng nhập mã nhân viên (VD: NV002)' }]}>
            <Input placeholder="NV002" />
          </Form.Item>
          <Form.Item name="ngay_cap_phat" label="Ngày cấp phát" rules={[{ required: true }]}>
            <DatePicker className="w-full" format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="tinh_trang_ban_giao" label="Tình trạng bàn giao" rules={[{ required: true }]}>
            <Input.TextArea rows={2} placeholder="Mới 100%, đầy đủ phụ kiện..." />
          </Form.Item>
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setIsCapPhatOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={capPhatMutation.isPending}>Cấp phát</Button>
          </div>
        </Form>
      </Modal>

      {/* Modal Thu hồi */}
      <Modal
        title={`Thu hồi tài sản: ${selectedTaiSan?.tenTaiSan}`}
        open={isThuHoiOpen}
        onCancel={() => setIsThuHoiOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={formThuHoi} layout="vertical" onFinish={handleThuHoi}>
          <Form.Item name="ngay_thu_hoi" label="Ngày thu hồi" rules={[{ required: true }]}>
            <DatePicker className="w-full" format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="tinh_trang_thu_hoi" label="Tình trạng lúc thu hồi" rules={[{ required: true }]}>
            <Input.TextArea rows={2} placeholder="Bình thường / Hỏng hóc / Mất..." />
          </Form.Item>
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setIsThuHoiOpen(false)}>Hủy</Button>
            <Button danger type="primary" htmlType="submit" loading={thuHoiMutation.isPending}>Thu hồi</Button>
          </div>
        </Form>
      </Modal>

      {/* Drawer Lịch sử */}
      <Drawer
        title={`Lịch sử luân chuyển: ${selectedTaiSan?.tenTaiSan}`}
        placement="right"
        width={500}
        onClose={() => setIsLichSuOpen(false)}
        open={isLichSuOpen}
      >
        {isLoadingLichSu ? (
          <p>Đang tải...</p>
        ) : (lichSuData && lichSuData.length > 0) ? (
          <div className="space-y-4">
            {lichSuData.map((item: LichSuLuanChuyenItem) => (
              <div key={item.id_GiaoNhan} className="p-4 border rounded-md relative border-hicas-border">
                {item.dang_su_dung && (
                  <Tag color="processing" className="absolute top-4 right-4 m-0">Đang sử dụng</Tag>
                )}
                <Descriptions column={1} size="small" title={`Người mượn: ${item.id_NhanVien}`}>
                  <Descriptions.Item label="Ngày mượn">{dayjs(item.ngayCapPhat).format('DD/MM/YYYY')}</Descriptions.Item>
                  <Descriptions.Item label="Tình trạng mượn">{item.tinhTrangBanGiao}</Descriptions.Item>
                  {item.ngayThuHoi && (
                    <>
                      <Descriptions.Item label="Ngày trả">{dayjs(item.ngayThuHoi).format('DD/MM/YYYY')}</Descriptions.Item>
                      <Descriptions.Item label="Tình trạng trả">{item.tinhTrangThuHoi}</Descriptions.Item>
                    </>
                  )}
                </Descriptions>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center mt-10">Chưa có lịch sử luân chuyển nào cho tài sản này.</p>
        )}
      </Drawer>
    </div>
  );
}
