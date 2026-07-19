import { CheckOutlined, CloseOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { Alert, Button, Empty, Form, Input, List, Modal, Select, Space, Table, Tag, Typography, message } from 'antd';
import type { AxiosError } from 'axios';
import { useEffect, useMemo, useState } from 'react';

import { useAuthStore } from '@/stores/authStore';
import { useDuyetYeuCau, useHuyYeuCau, useTuChoiYeuCau, useYeuCauCapNhat, useYeuCauCapNhatDetail } from './api';
import type { YeuCauCapNhat } from './types';

const { Text } = Typography;
const { TextArea } = Input;
const HCNS_OR_ADMIN_ROLE_IDS = new Set(['ADMIN', 'Admin', 'admin', 'HCNS', 'HR', 'QuanLyHCNS', 'MANAGER_HCNS']);

const statusOptions = [
  { label: 'Chờ duyệt', value: 0 },
  { label: 'Đã duyệt', value: 1 },
  { label: 'Từ chối / Đã hủy', value: 2 },
];

function statusTag(status: number) {
  if (status === 0) return <Tag color="processing">Chờ duyệt</Tag>;
  if (status === 1) return <Tag color="success">Đã duyệt</Tag>;
  return <Tag color="error">Từ chối / Đã hủy</Tag>;
}

function getBackendMessage(error: unknown) {
  const axiosError = error as AxiosError<{ detail?: string; message?: string }>;
  return axiosError.response?.data?.detail ?? axiosError.response?.data?.message ?? 'Có lỗi xảy ra, vui lòng thử lại';
}

export default function DuyetYeuCauPage() {
  const user = useAuthStore((state) => state.user);
  const isHcns = HCNS_OR_ADMIN_ROLE_IDS.has(user?.id_VaiTro ?? '');
  const [status, setStatus] = useState<number | 'all'>(0);
  const [keyword, setKeyword] = useState('');
  const [selectedId, setSelectedId] = useState<string>();
  const [myRequestId, setMyRequestId] = useState('');
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectForm] = Form.useForm<{ ghiChu: string }>();

  const listQuery = useYeuCauCapNhat(isHcns, isHcns ? undefined : selectedId);
  const detailQuery = useYeuCauCapNhatDetail(selectedId);
  const approveMutation = useDuyetYeuCau();
  const rejectMutation = useTuChoiYeuCau();
  const cancelMutation = useHuyYeuCau();

  useEffect(() => {
    if (!selectedId && listQuery.data?.[0]) {
      setSelectedId(listQuery.data[0].id_YeuCau);
    }
  }, [listQuery.data, selectedId]);

  const requests = useMemo(() => {
    const rows = listQuery.data ?? [];
    return rows.filter((item) => {
      const matchStatus = status === 'all' || item.trangThai === status;
      const matchKeyword = !keyword.trim() || Object.values(item).some((value) => String(value ?? '').toLowerCase().includes(keyword.toLowerCase()));
      return matchStatus && matchKeyword;
    });
  }, [keyword, listQuery.data, status]);

  const selectedRequest: YeuCauCapNhat | undefined = detailQuery.data?.yeu_cau ?? requests.find((item) => item.id_YeuCau === selectedId);

  const handleConflictAwareError = (error: unknown) => {
    const messageText = getBackendMessage(error);
    if ((error as AxiosError).response?.status === 409 || messageText.includes('xử lý')) {
      Modal.warning({ title: 'Yêu cầu đã được xử lý', content: messageText });
      void listQuery.refetch();
      return;
    }
    message.error(messageText);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="m-0 text-2xl font-bold text-hicas-text">Duyệt yêu cầu cập nhật tài khoản</h1>
        <p className="m-0 mt-1 text-hicas-muted">Theo dõi và xử lý các thay đổi hồ sơ cần phê duyệt</p>
      </div>

      {!isHcns && (
        <Alert
          type="info"
          showIcon
          message="Nhân viên xem yêu cầu của mình"
          description={
            <Space.Compact className="mt-3 w-full max-w-[520px]">
              <Input value={myRequestId} placeholder="Nhập mã yêu cầu cần xem" onChange={(event) => setMyRequestId(event.target.value)} />
              <Button type="primary" onClick={() => setSelectedId(myRequestId.trim())}>
                Xem
              </Button>
            </Space.Compact>
          }
        />
      )}

      <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <section className="hicas-card p-5">
          <div className="mb-4 space-y-3">
            <Input prefix={<SearchOutlined />} allowClear placeholder="Tìm mã yêu cầu, nhân viên" onChange={(event) => setKeyword(event.target.value)} />
            <Select
              className="w-full"
              value={status}
              onChange={setStatus}
              options={[{ label: 'Tất cả trạng thái', value: 'all' }, ...statusOptions]}
            />
          </div>

          {listQuery.isLoading ? (
            <List loading />
          ) : requests.length === 0 ? (
            <Empty description="Không có yêu cầu nào" />
          ) : (
            <div className="space-y-3">
              {requests.map((item) => {
                const active = item.id_YeuCau === selectedId;
                return (
                  <button
                    key={item.id_YeuCau}
                    className={`w-full rounded-lg border p-4 text-left ${active ? 'border-hicas-primary bg-[#f3f1ff]' : 'border-hicas-border bg-white'}`}
                    onClick={() => setSelectedId(item.id_YeuCau)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <strong className="block text-hicas-text">{item.id_YeuCau}</strong>
                        <Text className="text-sm text-hicas-muted">Nhân viên: {item.id_NhanVien}</Text>
                      </div>
                      {statusTag(item.trangThai)}
                    </div>
                    <p className="mb-0 mt-3 text-sm text-hicas-muted">Ngày gửi: {new Date(item.ngayGui).toLocaleString('vi-VN')}</p>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="hicas-card min-h-[560px] p-5">
          {!selectedId ? (
            <Empty description="Chọn yêu cầu để xem chi tiết" />
          ) : detailQuery.isLoading ? (
            <Table loading pagination={false} />
          ) : detailQuery.isError ? (
            <Alert type="error" showIcon message={getBackendMessage(detailQuery.error)} />
          ) : (
            <div className="space-y-5">
              <div className="flex flex-col gap-3 border-b border-hicas-border pb-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="m-0 text-xl font-semibold text-hicas-text">{selectedRequest?.id_YeuCau}</h2>
                  <Text className="text-hicas-muted">Nhân viên: {selectedRequest?.id_NhanVien}</Text>
                </div>
                <Space wrap>
                  {selectedRequest && statusTag(selectedRequest.trangThai)}
                  {isHcns && selectedRequest?.trangThai === 0 && (
                    <>
                      <Button
                        type="primary"
                        icon={<CheckOutlined />}
                        loading={approveMutation.isPending}
                        onClick={async () => {
                          try {
                            await approveMutation.mutateAsync(selectedRequest.id_YeuCau);
                            message.success('Phê duyệt yêu cầu thành công');
                            void detailQuery.refetch();
                          } catch (error) {
                            handleConflictAwareError(error);
                          }
                        }}
                      >
                        Phê duyệt
                      </Button>
                      <Button danger icon={<CloseOutlined />} onClick={() => setRejectOpen(true)}>
                        Từ chối
                      </Button>
                    </>
                  )}
                  {!isHcns && selectedRequest?.trangThai === 0 && (
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      loading={cancelMutation.isPending}
                      onClick={() =>
                        Modal.confirm({
                          title: 'Hủy yêu cầu cập nhật?',
                          okText: 'Hủy yêu cầu',
                          cancelText: 'Đóng',
                          okButtonProps: { danger: true },
                          onOk: async () => {
                            try {
                              await cancelMutation.mutateAsync(selectedRequest.id_YeuCau);
                              message.success('Đã hủy yêu cầu');
                              void detailQuery.refetch();
                            } catch (error) {
                              handleConflictAwareError(error);
                            }
                          },
                        })
                      }
                    >
                      Hủy yêu cầu
                    </Button>
                  )}
                </Space>
              </div>

              <Table
                rowKey="id_ChiTiet"
                pagination={false}
                dataSource={detailQuery.data?.chi_tiet ?? []}
                columns={[
                  { title: 'Trường thông tin', dataIndex: 'tenTruong', width: 180 },
                  { title: 'Nhóm', dataIndex: 'nhomThongTin', width: 160 },
                  {
                    title: 'Giá trị cũ',
                    dataIndex: 'giaTriCu',
                    render: (value) => <span className="rounded bg-[#f5f5f5] px-2 py-1">{value ?? '(trống)'}</span>,
                  },
                  {
                    title: 'Giá trị mới',
                    dataIndex: 'giaTriMoi',
                    render: (value) => <span className="rounded bg-[#ecfdf3] px-2 py-1 font-medium text-[#087443]">{value}</span>,
                  },
                  { title: 'Ghi chú', dataIndex: 'ghiChu' },
                ]}
              />
            </div>
          )}
        </section>
      </div>

      <Modal
        title="Từ chối yêu cầu"
        open={rejectOpen}
        okText="Từ chối"
        cancelText="Hủy"
        confirmLoading={rejectMutation.isPending}
        okButtonProps={{ danger: true }}
        onCancel={() => setRejectOpen(false)}
        onOk={() => rejectForm.submit()}
      >
        <Form
          form={rejectForm}
          layout="vertical"
          requiredMark={false}
          onFinish={async (values) => {
            if (!selectedId) return;
            try {
              await rejectMutation.mutateAsync({ idYeuCau: selectedId, ghiChu: values.ghiChu });
              message.success('Từ chối yêu cầu thành công');
              setRejectOpen(false);
              rejectForm.resetFields();
              void detailQuery.refetch();
            } catch (error) {
              handleConflictAwareError(error);
            }
          }}
        >
          <Form.Item name="ghiChu" label="Lý do từ chối" rules={[{ required: true, message: 'Vui lòng nhập lý do từ chối' }]}>
            <TextArea rows={4} placeholder="Nhập lý do từ chối" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
