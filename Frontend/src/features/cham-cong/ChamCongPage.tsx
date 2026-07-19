import { CheckCircleOutlined, EyeOutlined, FileDoneOutlined, UploadOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Card, Descriptions, Drawer, DatePicker, Form, Input, Modal, Select, Space, Table, Tag, Upload, message } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import type { AxiosError } from 'axios';
import dayjs, { type Dayjs } from 'dayjs';
import { useMemo, useState } from 'react';

import {
  confirmImportChamCong,
  finalizeBangCong,
  getBangCong,
  importChamCong,
  submitGiaiTrinh,
  type BangCongItem,
  type ImportPreviewResponse,
} from '@/api/chamCongApi';
import { useAuthStore } from '@/stores/authStore';

type ImportFormValues = {
  nguon: 'tingop' | 'redmine';
  file: UploadFile[];
};

type GiaiTrinhFormValues = {
  ngayGiaiTrinh: Dayjs;
  lyDo: string;
  file?: UploadFile[];
};

function getBackendMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<{ detail?: string; message?: string }>;
  return axiosError.response?.data?.detail ?? axiosError.response?.data?.message ?? fallback;
}

function formatNumber(value?: string | number | null) {
  if (value === undefined || value === null || value === '') return '-';
  return Number(value).toLocaleString('vi-VN', { maximumFractionDigits: 2 });
}

function statusTag(status: string) {
  if (status === 'Đã chốt') return <Tag color="success">{status}</Tag>;
  if (status === 'Chờ chốt') return <Tag color="warning">{status}</Tag>;
  return <Tag>{status}</Tag>;
}

export function ChamCongPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [selectedMonth, setSelectedMonth] = useState<Dayjs>(dayjs());
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [isGiaiTrinhModalVisible, setIsGiaiTrinhModalVisible] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<BangCongItem | null>(null);
  const [importPreview, setImportPreview] = useState<ImportPreviewResponse | null>(null);
  const [importForm] = Form.useForm<ImportFormValues>();
  const [giaiTrinhForm] = Form.useForm<GiaiTrinhFormValues>();

  const month = selectedMonth.month() + 1;
  const year = selectedMonth.year();
  const isAdminOrHR = user?.id_VaiTro === 'ADMIN' || user?.id_VaiTro === 'HCNS';

  const { data, isLoading } = useQuery({
    queryKey: ['bang-cong', month, year],
    queryFn: () => getBangCong(month, year),
  });

  const importMutation = useMutation({
    mutationFn: ({ file, nguon }: { file: File; nguon: 'tingop' | 'redmine' }) => importChamCong(file, nguon),
    onSuccess: (result) => {
      setImportPreview(result.data);
      message.success(result.message || 'Tạo preview import thành công');
    },
    onError: (error) => message.error(getBackendMessage(error, 'Import thất bại')),
  });

  const confirmImportMutation = useMutation({
    mutationFn: confirmImportChamCong,
    onSuccess: (result) => {
      message.success(result.message || `Đã lưu ${result.data.them_moi} dòng mới, cập nhật ${result.data.cap_nhat} dòng`);
      setIsImportModalVisible(false);
      setImportPreview(null);
      importForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['bang-cong'] });
    },
    onError: (error) => message.error(getBackendMessage(error, 'Xác nhận import thất bại')),
  });

  const giaiTrinhMutation = useMutation({
    mutationFn: ({ payload, file }: { payload: { ngayGiaiTrinh: string; lyDo: string; id_BangCong?: string }; file?: File }) => submitGiaiTrinh(payload, file),
    onSuccess: (result) => {
      message.success(result.message || 'Nộp đơn giải trình thành công');
      setIsGiaiTrinhModalVisible(false);
      setSelectedRecord(null);
      giaiTrinhForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['bang-cong'] });
    },
    onError: (error) => message.error(getBackendMessage(error, 'Nộp đơn giải trình thất bại')),
  });

  const chotBangCongMutation = useMutation({
    mutationFn: finalizeBangCong,
    onSuccess: (result) => {
      message.success(result.message || 'Chốt bảng công thành công');
      queryClient.invalidateQueries({ queryKey: ['bang-cong'] });
    },
    onError: (error) => message.error(getBackendMessage(error, 'Chốt bảng công thất bại')),
  });

  const columns = useMemo(
    () => [
      { title: 'Tên bảng công', dataIndex: 'tenBangCong', key: 'tenBangCong', width: 220 },
      { title: 'Loại hình', dataIndex: 'loaiHinhTinhCong', key: 'loaiHinhTinhCong', width: 110, render: (value: string) => <Tag>{value}</Tag> },
      { title: 'Từ ngày', dataIndex: 'tuNgay', key: 'tuNgay', width: 120 },
      { title: 'Đến ngày', dataIndex: 'denNgay', key: 'denNgay', width: 120 },
      { title: 'Giờ logtime', dataIndex: 'tongGioLogtime', key: 'tongGioLogtime', width: 120, render: formatNumber },
      { title: 'Giờ thực tế', dataIndex: 'tongGioLogtimeThucTe', key: 'tongGioLogtimeThucTe', width: 120, render: formatNumber },
      { title: 'Ngày công', dataIndex: 'ngayCongQuyDoi', key: 'ngayCongQuyDoi', width: 110, render: formatNumber },
      { title: 'Đi muộn', dataIndex: 'soLanDiMuon', key: 'soLanDiMuon', width: 90, render: (value?: number | null) => value ?? '-' },
      { title: 'Dự án', dataIndex: 'tenDuAn_Task', key: 'tenDuAn_Task', width: 150, render: (value?: string | null) => value ?? '-' },
      { title: 'Trạng thái', dataIndex: 'trangThaiKy', key: 'trangThaiKy', width: 120, render: statusTag },
      {
        title: 'Hành động',
        key: 'action',
        width: 230,
        render: (_: unknown, record: BangCongItem) => (
          <Space>
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedRecord(record);
                setIsDetailOpen(true);
              }}
            >
              Chi tiết
            </Button>
            <Button
              size="small"
              icon={<FileDoneOutlined />}
              disabled={record.trangThaiKy === 'Đã chốt'}
              onClick={() => {
                setSelectedRecord(record);
                giaiTrinhForm.setFieldsValue({ ngayGiaiTrinh: dayjs(record.tuNgay) });
                setIsGiaiTrinhModalVisible(true);
              }}
            >
              Giải trình
            </Button>
          </Space>
        ),
      },
    ],
    [giaiTrinhForm],
  );

  const handleImportSubmit = (values: ImportFormValues) => {
    const file = values.file?.[0]?.originFileObj;
    if (!file) {
      message.warning('Vui lòng chọn file import');
      return;
    }
    importMutation.mutate({ file, nguon: values.nguon });
  };

  const handleGiaiTrinhSubmit = (values: GiaiTrinhFormValues) => {
    const file = values.file?.[0]?.originFileObj;
    giaiTrinhMutation.mutate({
      payload: {
        ngayGiaiTrinh: values.ngayGiaiTrinh.format('YYYY-MM-DD'),
        lyDo: values.lyDo,
        id_BangCong: selectedRecord?.id_BangCong,
      },
      file,
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="m-0 text-2xl font-bold text-hicas-text">Quản lý chấm công</h1>
          <p className="m-0 mt-1 text-hicas-muted">Import dữ liệu, xem bảng công và tạo đơn giải trình</p>
        </div>
        <Space wrap>
          <DatePicker picker="month" value={selectedMonth} onChange={(date) => date && setSelectedMonth(date)} />
          {isAdminOrHR && (
            <>
              <Button type="primary" icon={<UploadOutlined />} onClick={() => setIsImportModalVisible(true)}>
                Import dữ liệu
              </Button>
              <Button
                icon={<CheckCircleOutlined />}
                disabled={!data?.du_lieu?.[0]?.id_BangCong}
                loading={chotBangCongMutation.isPending}
                onClick={() => data?.du_lieu?.[0]?.id_BangCong && chotBangCongMutation.mutate(data.du_lieu[0].id_BangCong)}
              >
                Chốt bảng công
              </Button>
            </>
          )}
        </Space>
      </div>

      {data?.message && <Alert showIcon type="info" message={data.message} />}

      <Card className="shadow-sm">
        <Table
          dataSource={data?.du_lieu ?? []}
          columns={columns}
          rowKey="id_BangCong"
          loading={isLoading}
          scroll={{ x: 1400 }}
          locale={{ emptyText: 'Chưa có dữ liệu chấm công cho kỳ đã chọn' }}
        />
      </Card>

      <Modal
        title="Import dữ liệu chấm công"
        open={isImportModalVisible}
        onCancel={() => {
          setIsImportModalVisible(false);
          setImportPreview(null);
          importForm.resetFields();
        }}
        footer={null}
        width={900}
        destroyOnClose
      >
        {!importPreview ? (
          <Form form={importForm} onFinish={handleImportSubmit} layout="vertical" initialValues={{ nguon: 'tingop' }}>
            <Form.Item name="nguon" label="Nguồn dữ liệu" rules={[{ required: true, message: 'Vui lòng chọn nguồn dữ liệu' }]}>
              <Select
                options={[
                  { label: 'TingOp - nhân viên chính thức', value: 'tingop' },
                  { label: 'Redmine - CTV/TTS', value: 'redmine' },
                ]}
              />
            </Form.Item>
            <Form.Item
              name="file"
              label="File Excel/CSV"
              valuePropName="fileList"
              getValueFromEvent={(event) => event?.fileList}
              rules={[{ required: true, message: 'Vui lòng chọn file .xlsx hoặc .csv' }]}
            >
              <Upload beforeUpload={() => false} maxCount={1} accept=".xlsx,.csv">
                <Button icon={<UploadOutlined />}>Chọn file</Button>
              </Upload>
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={importMutation.isPending} block>
              Tải lên và xem preview
            </Button>
          </Form>
        ) : (
          <div className="space-y-4">
            <Alert
              showIcon
              type="success"
              message={`Preview ${importPreview.preview_id}`}
              description={`Đã đọc ${importPreview.tong_dong} dòng hợp lệ. Xác nhận để lưu vào bảng công.`}
            />
            <Table
              size="small"
              rowKey={(record) => `${record.id_NhanVien}-${record.tuNgay}-${record.denNgay}-${record.tenBangCong}`}
              dataSource={importPreview.du_lieu}
              pagination={{ pageSize: 5 }}
              columns={[
                { title: 'Mã NV', dataIndex: 'id_NhanVien' },
                { title: 'Tên bảng công', dataIndex: 'tenBangCong' },
                { title: 'Loại', dataIndex: 'loaiHinhTinhCong' },
                { title: 'Từ ngày', dataIndex: 'tuNgay' },
                { title: 'Đến ngày', dataIndex: 'denNgay' },
                { title: 'Giờ thực tế', dataIndex: 'tongGioLogtimeThucTe', render: formatNumber },
              ]}
            />
            <div className="flex justify-end gap-2">
              <Button onClick={() => setImportPreview(null)}>Hủy preview</Button>
              <Button type="primary" loading={confirmImportMutation.isPending} onClick={() => confirmImportMutation.mutate(importPreview.preview_id)}>
                Xác nhận import
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title={`Tạo đơn giải trình công${selectedRecord ? ` - ${selectedRecord.tenBangCong}` : ''}`}
        open={isGiaiTrinhModalVisible}
        onCancel={() => {
          setIsGiaiTrinhModalVisible(false);
          setSelectedRecord(null);
          giaiTrinhForm.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form form={giaiTrinhForm} onFinish={handleGiaiTrinhSubmit} layout="vertical">
          <Form.Item name="ngayGiaiTrinh" label="Ngày cần giải trình" rules={[{ required: true, message: 'Vui lòng chọn ngày cần giải trình' }]}>
            <DatePicker className="w-full" format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="lyDo" label="Lý do" rules={[{ required: true, message: 'Vui lòng nhập lý do' }, { max: 255, message: 'Tối đa 255 ký tự' }]}>
            <Input.TextArea rows={4} showCount maxLength={255} placeholder="Ví dụ: Quên chấm công lúc về do máy chấm công lỗi" />
          </Form.Item>
          <Form.Item name="file" label="Minh chứng (.jpg/.png, nếu có)" valuePropName="fileList" getValueFromEvent={(event) => event?.fileList}>
            <Upload beforeUpload={() => false} maxCount={1} accept=".jpg,.png">
              <Button icon={<UploadOutlined />}>Chọn file</Button>
            </Upload>
          </Form.Item>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsGiaiTrinhModalVisible(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={giaiTrinhMutation.isPending}>
              Gửi giải trình
            </Button>
          </div>
        </Form>
      </Modal>

      <Drawer
        title="Chi tiết bảng chấm công"
        placement="right"
        width={560}
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      >
        {selectedRecord && (
          <div className="space-y-4">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Mã bảng công">{selectedRecord.id_BangCong}</Descriptions.Item>
              <Descriptions.Item label="Mã nhân viên">{selectedRecord.id_NhanVien}</Descriptions.Item>
              <Descriptions.Item label="Tên bảng công">{selectedRecord.tenBangCong}</Descriptions.Item>
              <Descriptions.Item label="Loại hình tính công">
                <Tag>{selectedRecord.loaiHinhTinhCong}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Kỳ công">
                {selectedRecord.tuNgay} đến {selectedRecord.denNgay}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">{statusTag(selectedRecord.trangThaiKy)}</Descriptions.Item>
              <Descriptions.Item label="Tổng giờ logtime">{formatNumber(selectedRecord.tongGioLogtime)}</Descriptions.Item>
              <Descriptions.Item label="Tổng giờ thực tế">{formatNumber(selectedRecord.tongGioLogtimeThucTe)}</Descriptions.Item>
              <Descriptions.Item label="Ngày công quy đổi">{formatNumber(selectedRecord.ngayCongQuyDoi)}</Descriptions.Item>
              <Descriptions.Item label="Số lần đi muộn">{selectedRecord.soLanDiMuon ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="Dự án/Task">{selectedRecord.tenDuAn_Task ?? '-'}</Descriptions.Item>
            </Descriptions>

            <Alert
              showIcon
              type="info"
              message="Chi tiết bảng công theo kỳ"
              description="Bảng này hiển thị dữ liệu công, giờ làm, đi muộn và dự án đã ghi nhận trong kỳ."
            />

            <div className="flex justify-end">
              <Button
                type="primary"
                icon={<FileDoneOutlined />}
                disabled={selectedRecord.trangThaiKy === 'Đã chốt'}
                onClick={() => {
                  giaiTrinhForm.setFieldsValue({ ngayGiaiTrinh: dayjs(selectedRecord.tuNgay) });
                  setIsDetailOpen(false);
                  setIsGiaiTrinhModalVisible(true);
                }}
              >
                Tạo giải trình
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
