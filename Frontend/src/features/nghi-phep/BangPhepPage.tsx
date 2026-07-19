import { Alert, Card, Empty, InputNumber, Skeleton, Table, Tabs } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuthStore } from '@/stores/authStore';
import { HCNS_OR_ADMIN_ROLE_IDS } from './constants';
import { LeaveStatusTag, UnknownTotalPager } from './components';
import { useBangPhep, useLichSuPhep } from './api';
import type { BangPhepItem, DonNghiPhep } from './types';
import { currentYear, formatDateOnly, formatDateTime, formatLeaveNumber, getBackendMessage, toNumber } from './utils';

const PAGE_SIZE = 10;

export default function BangPhepPage() {
  const user = useAuthStore((state) => state.user);
  const isHcns = HCNS_OR_ADMIN_ROLE_IDS.has(user?.id_VaiTro ?? '');
  const [year, setYear] = useState(currentYear());
  const [quotaPage, setQuotaPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const bangPhepQuery = useBangPhep({ nam: year, page: quotaPage, size: 20 });
  const lichSuQuery = useLichSuPhep({ nam: year, page: historyPage, size: PAGE_SIZE });

  const quotas = bangPhepQuery.data ?? [];
  const mine = quotas.find((item) => item.id_NhanVien === user?.id_TaiKhoan) ?? quotas[0];

  const quotaColumns: ColumnsType<BangPhepItem> = [
    { title: 'Nhân viên', dataIndex: 'id_NhanVien', width: 140, fixed: 'left' },
    { title: 'Năm', dataIndex: 'nam', width: 100 },
    { title: 'Tổng quỹ', dataIndex: 'tongQuyPhep', render: formatLeaveNumber },
    { title: 'Đã dùng', dataIndex: 'soNgayDaDung', render: formatLeaveNumber },
    { title: 'Chờ duyệt', dataIndex: 'soNgayChoDuyet', render: formatLeaveNumber },
    { title: 'Còn lại', dataIndex: 'so_ngay_con_lai', render: formatLeaveNumber },
    { title: 'Trạng thái', dataIndex: 'trangThai', render: (value: number) => (value === 1 ? 'Đang áp dụng' : 'Ngừng') },
  ];

  const historyColumns: ColumnsType<DonNghiPhep> = [
    { title: 'Mã đơn', dataIndex: 'id_DonPhep', width: 170, render: (value: string) => <Link to={`/nghi-phep/don/${value}`}>{value}</Link> },
    { title: 'Ngày tạo', dataIndex: 'ngayTao', width: 150, render: formatDateTime },
    { title: 'Loại phép', dataIndex: 'loaiPhep', width: 160 },
    { title: 'Từ ngày', dataIndex: 'tuNgay', width: 120, render: formatDateOnly },
    { title: 'Đến ngày', dataIndex: 'denNgay', width: 120, render: formatDateOnly },
    { title: 'Số ngày', dataIndex: 'so_ngay_nghi', width: 100, render: formatLeaveNumber },
    { title: 'Trạng thái', dataIndex: 'trangThai', width: 130, render: (value) => <LeaveStatusTag status={value} /> },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="m-0 text-2xl font-bold text-hicas-text">Bảng phép</h1>
          <p className="m-0 mt-1 text-hicas-muted">Theo dõi quỹ phép và lịch sử nghỉ phép của nhân sự</p>
        </div>
        <InputNumber min={2020} max={2100} value={year} onChange={(value) => setYear(Number(value ?? currentYear()))} />
      </div>

      {bangPhepQuery.isLoading ? (
        <Skeleton active paragraph={{ rows: 5 }} />
      ) : bangPhepQuery.isError ? (
        <Alert type="error" showIcon message="Không tải được bảng phép" description={getBackendMessage(bangPhepQuery.error)} />
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <div className="text-hicas-muted">Tổng quỹ phép</div>
            <div className="mt-2 text-3xl font-bold text-hicas-text">{formatLeaveNumber(mine?.tongQuyPhep)} ngày</div>
          </Card>
          <Card>
            <div className="text-hicas-muted">Đã sử dụng</div>
            <div className="mt-2 text-3xl font-bold text-hicas-text">{formatLeaveNumber(mine?.soNgayDaDung)} ngày</div>
          </Card>
          <Card>
            <div className="text-hicas-muted">Đang chờ duyệt</div>
            <div className="mt-2 text-3xl font-bold text-hicas-text">{formatLeaveNumber(mine?.soNgayChoDuyet)} ngày</div>
          </Card>
          <Card>
            <div className="text-hicas-muted">Còn lại</div>
            <div className="mt-2 text-3xl font-bold text-hicas-primary">{formatLeaveNumber(toNumber(mine?.so_ngay_con_lai))} ngày</div>
          </Card>
        </div>
      )}

      <Tabs
        items={[
          {
            key: 'quota',
            label: isHcns ? 'Tổng hợp quỹ phép' : 'Quỹ phép của tôi',
            children: (
              <div className="hicas-card p-4">
                <Table
                  rowKey="id_QuyPhep"
                  loading={bangPhepQuery.isFetching}
                  dataSource={quotas}
                  columns={quotaColumns}
                  pagination={false}
                  scroll={{ x: 850 }}
                  locale={{ emptyText: <Empty description="Chưa có dữ liệu quỹ phép" /> }}
                />
                {isHcns && <UnknownTotalPager page={quotaPage} size={20} currentCount={quotas.length} loading={bangPhepQuery.isFetching} onPageChange={setQuotaPage} />}
              </div>
            ),
          },
          {
            key: 'history',
            label: 'Lịch sử phép',
            children: (
              <div className="hicas-card p-4">
                <Table
                  rowKey="id_DonPhep"
                  loading={lichSuQuery.isFetching}
                  dataSource={lichSuQuery.data ?? []}
                  columns={historyColumns}
                  pagination={false}
                  scroll={{ x: 940 }}
                  locale={{ emptyText: <Empty description="Chưa có lịch sử nghỉ phép" /> }}
                />
                <UnknownTotalPager
                  page={historyPage}
                  size={PAGE_SIZE}
                  currentCount={lichSuQuery.data?.length ?? 0}
                  loading={lichSuQuery.isFetching}
                  onPageChange={setHistoryPage}
                />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
