import { InboxOutlined } from '@ant-design/icons';
import { Alert, Modal, Table, Upload } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import { useState } from 'react';

export type ImportResult = {
  tong_dong: number;
  thanh_cong: number;
  that_bai: number;
  chi_tiet_loi: { dong: number; loi: string }[];
};

type ImportModalProps = {
  open: boolean;
  loading?: boolean;
  result?: ImportResult;
  onClose: () => void;
  onImport: (file: File) => Promise<void>;
};

export default function ImportModal({ open, loading, result, onClose, onImport }: ImportModalProps) {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  return (
    <Modal
      title="Import danh mục"
      open={open}
      okText="Import"
      cancelText="Đóng"
      confirmLoading={loading}
      okButtonProps={{ disabled: fileList.length === 0 }}
      onCancel={onClose}
      onOk={() => {
        const file = fileList[0]?.originFileObj;
        if (file) void onImport(file);
      }}
    >
      <Upload.Dragger
        accept=".xlsx"
        maxCount={1}
        fileList={fileList}
        beforeUpload={(file) => {
          setFileList([file]);
          return false;
        }}
        onRemove={() => setFileList([])}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Chọn hoặc kéo thả file Excel .xlsx</p>
      </Upload.Dragger>

      {result && (
        <div className="mt-5 space-y-4">
          <Alert
            type={result.that_bai > 0 ? 'warning' : 'success'}
            showIcon
            message={`Tổng ${result.tong_dong} dòng, thành công ${result.thanh_cong}, thất bại ${result.that_bai}`}
          />
          <Table
            size="small"
            rowKey="dong"
            dataSource={result.chi_tiet_loi}
            pagination={false}
            columns={[
              { title: 'Dòng', dataIndex: 'dong', width: 90 },
              { title: 'Lỗi', dataIndex: 'loi' },
            ]}
          />
        </div>
      )}
    </Modal>
  );
}
