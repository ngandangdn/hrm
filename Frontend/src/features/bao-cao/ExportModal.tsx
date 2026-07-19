import { DownloadOutlined } from '@ant-design/icons';
import { Form, Modal, Radio, message } from 'antd';
import { useState } from 'react';

import { xuatBaoCao } from './api';
import type { BaoCaoFilter, DinhDangBaoCao, LoaiBaoCao } from './types';
import { REPORT_LABELS, downloadBlob, getBackendMessage } from './utils';

type ExportModalProps = {
  open: boolean;
  loai: LoaiBaoCao;
  filters: BaoCaoFilter;
  onCancel: () => void;
};

type FormValues = {
  dinh_dang: DinhDangBaoCao;
};

export default function ExportModal({ open, loai, filters, onCancel }: ExportModalProps) {
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    const values = await form.validateFields();
    setLoading(true);
    try {
      const blob = await xuatBaoCao(loai, filters, values.dinh_dang);
      downloadBlob(blob, loai, values.dinh_dang, filters);
      message.success(`Đã xuất báo cáo ${REPORT_LABELS[loai]}`);
      onCancel();
    } catch (error) {
      message.error(getBackendMessage(error, 'Xuất file thất bại, vui lòng thử lại sau'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <span className="inline-flex items-center gap-2">
          <DownloadOutlined />
          Xuất báo cáo {REPORT_LABELS[loai]}
        </span>
      }
      open={open}
      onCancel={onCancel}
      okText="Xác nhận xuất"
      cancelText="Hủy"
      confirmLoading={loading}
      onOk={handleExport}
      destroyOnClose
    >
      <Form form={form} layout="vertical" initialValues={{ dinh_dang: 'excel' }}>
        <Form.Item name="dinh_dang" label="Định dạng file" rules={[{ required: true, message: 'Vui lòng chọn định dạng xuất' }]}>
          <Radio.Group>
            <Radio.Button value="excel">Excel (.xlsx)</Radio.Button>
            <Radio.Button value="pdf">PDF (.pdf)</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <div className="rounded-lg bg-[#f6f7fb] p-3 text-sm text-hicas-muted">
          File sẽ được xuất theo đúng bộ lọc đang áp dụng: {filters.tu_ngay} đến {filters.den_ngay}
          {filters.du_an ? `, dự án ${filters.du_an}` : ''}.
        </div>
      </Form>
    </Modal>
  );
}
