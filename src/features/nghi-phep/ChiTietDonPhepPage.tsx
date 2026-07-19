import { Alert, Button, Modal, Result, Skeleton, Space, Timeline, message } from 'antd';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { useAuthStore } from '@/stores/authStore';
import { HCNS_OR_ADMIN_ROLE_IDS } from './constants';
import { LeaveRequestMiniDetail, confirmAction } from './components';
import { useChiTietDonPhep, useDuyetDonPhep, useHuyDonPhep, useTuChoiDonPhep } from './api';
import { formatDateTime, getBackendMessage, getHttpStatus } from './utils';

export default function ChiTietDonPhepPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const canApprove = HCNS_OR_ADMIN_ROLE_IDS.has(user?.id_VaiTro ?? '');
  const detailQuery = useChiTietDonPhep(id);
  const approveMutation = useDuyetDonPhep();
  const rejectMutation = useTuChoiDonPhep();
  const cancelMutation = useHuyDonPhep();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');

  const handleBusinessError = (error: unknown) => {
    const status = getHttpStatus(error);
    if (status === 409) {
      Modal.warning({ title: 'Trạng thái đơn đã thay đổi', content: getBackendMessage(error) });
      detailQuery.refetch();
    } else {
      message.error(getBackendMessage(error));
    }
  };

  if (detailQuery.isLoading) {
    return <Skeleton active paragraph={{ rows: 10 }} />;
  }

  if (detailQuery.isError) {
    const status = getHttpStatus(detailQuery.error);
    if (status === 403 || status === 404) {
      return <Result status={status} title={status} subTitle={getBackendMessage(detailQuery.error)} extra={<Link to="/nghi-phep/danh-sach-don">Quay lại danh sách</Link>} />;
    }
    return <Alert type="error" showIcon message="Không tải được chi tiết đơn" description={getBackendMessage(detailQuery.error)} />;
  }

  const detail = detailQuery.data;
  if (!detail) return null;
  const request = detail.don;
  const canDecide = canApprove && request.trangThai === 0 && request.id_NhanVien !== user?.id_TaiKhoan;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="m-0 text-2xl font-bold text-hicas-text">Chi tiết đơn nghỉ phép</h1>
          <p className="m-0 mt-1 text-hicas-muted">{request.id_DonPhep}</p>
        </div>
        <Space wrap>
          <Button onClick={() => navigate('/nghi-phep/danh-sach-don')}>Danh sách</Button>
          {request.co_the_huy && (
            <Button
              danger
              loading={cancelMutation.isPending}
              onClick={() =>
                confirmAction('Hủy đơn nghỉ phép?', `Xác nhận hủy đơn ${request.id_DonPhep}.`, async () => {
                  try {
                    const response = await cancelMutation.mutateAsync(request.id_DonPhep);
                    message.success(response.message || 'Hủy đơn thành công');
                    detailQuery.refetch();
                  } catch (error) {
                    handleBusinessError(error);
                  }
                })
              }
            >
              Hủy đơn
            </Button>
          )}
          {canDecide && (
            <>
              <Button
                type="primary"
                loading={approveMutation.isPending}
                onClick={() =>
                  confirmAction('Duyệt đơn nghỉ phép?', `Xác nhận duyệt đơn ${request.id_DonPhep}.`, async () => {
                    try {
                      const response = await approveMutation.mutateAsync({ idDon: request.id_DonPhep });
                      message.success(response.message || 'Duyệt đơn thành công');
                      detailQuery.refetch();
                    } catch (error) {
                      handleBusinessError(error);
                    }
                  })
                }
              >
                Duyệt
              </Button>
              <Button danger onClick={() => setRejectOpen(true)}>
                Từ chối
              </Button>
            </>
          )}
        </Space>
      </div>

      <div className="hicas-card p-5">
        <LeaveRequestMiniDetail request={request} />
      </div>

      <div className="hicas-card p-5">
        <h2 className="m-0 mb-4 text-xl font-semibold text-hicas-text">Lịch sử xử lý</h2>
        <Timeline
          items={[
            { color: 'blue', children: `Tạo đơn: ${formatDateTime(detail.lich_su_xu_ly.ngay_tao)}` },
            {
              color: detail.lich_su_xu_ly.thoi_gian_duyet ? 'green' : 'gray',
              children: `Xử lý: ${formatDateTime(detail.lich_su_xu_ly.thoi_gian_duyet)} - ${detail.lich_su_xu_ly.nguoi_thuc_hien ?? 'PENDING'}`,
            },
            ...(detail.lich_su_xu_ly.ly_do_tu_choi ? [{ color: 'red', children: `Lý do từ chối: ${detail.lich_su_xu_ly.ly_do_tu_choi}` }] : []),
          ]}
        />
      </div>

      <Modal
        title="Từ chối đơn nghỉ phép"
        open={rejectOpen}
        okText="Từ chối"
        cancelText="Đóng"
        confirmLoading={rejectMutation.isPending}
        okButtonProps={{ danger: true, disabled: !reason.trim() || rejectMutation.isPending }}
        onCancel={() => {
          setRejectOpen(false);
          setReason('');
        }}
        onOk={async () => {
          try {
            const response = await rejectMutation.mutateAsync({ idDon: request.id_DonPhep, lyDoTuChoi: reason.trim() });
            message.success(response.message || 'Từ chối đơn thành công');
            setRejectOpen(false);
            setReason('');
            detailQuery.refetch();
          } catch (error) {
            handleBusinessError(error);
          }
        }}
      >
        <Alert className="mb-3" type="warning" showIcon message="Vui lòng nhập lý do từ chối trước khi xác nhận." />
        <textarea
          className="min-h-28 w-full rounded-lg border border-hicas-border p-3 outline-none focus:border-hicas-primary"
          maxLength={255}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Nhập lý do từ chối"
        />
      </Modal>
    </div>
  );
}
