import { BarChartOutlined, DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { Alert, Button, DatePicker, Empty, Result, Segmented, Skeleton, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { type Dayjs } from 'dayjs';
import { useMemo, useState } from 'react';

import { useAuthStore } from '@/stores/authStore';

import { useBaoCao, useDanhMucBaoCao } from './api';
import ExportModal from './ExportModal';
import HanhChinhChart from './charts/HanhChinhChart';
import HieuSuatChart from './charts/HieuSuatChart';
import QuanTriChart from './charts/QuanTriChart';
import TongHopChart from './charts/TongHopChart';
import type { BaoCaoFilter, LoaiBaoCao } from './types';
import { REPORT_LABELS, canViewBaoCao, formatValue, getBackendMessage, isForbidden } from './utils';
import { useDebouncedValue } from './useDebouncedValue';

const { RangePicker } = DatePicker;

const DEFAULT_RANGE: [Dayjs, Dayjs] = [dayjs().startOf('month'), dayjs().endOf('month')];
const REPORT_ORDER: LoaiBaoCao[] = ['hanh-chinh', 'hieu-suat', 'tong-hop', 'quan-tri'];

function toFilter(range: [Dayjs, Dayjs]): BaoCaoFilter {
  return {
    tu_ngay: range[0].format('YYYY-MM-DD'),
    den_ngay: range[1].format('YYYY-MM-DD'),
  };
}

function renderChart(loai: LoaiBaoCao, data: NonNullable<ReturnType<typeof useBaoCao>['data']>['data']['bieu_do']) {
  if (loai === 'hanh-chinh') return <HanhChinhChart data={data} />;
  if (loai === 'hieu-suat') return <HieuSuatChart data={data} />;
  if (loai === 'tong-hop') return <TongHopChart data={data} />;
  return <QuanTriChart data={data} />;
}

function buildColumns(rows: Array<Record<string, unknown>>): ColumnsType<Record<string, unknown>> {
  const keys = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  return keys.map((key) => ({
    title: key.replace(/_/g, ' '),
    dataIndex: key,
    key,
    render: (value) => formatValue(value),
  }));
}

export default function BaoCaoPage() {
  const user = useAuthStore((state) => state.user);
  const [loai, setLoai] = useState<LoaiBaoCao>('hanh-chinh');
  const [range, setRange] = useState<[Dayjs, Dayjs]>(DEFAULT_RANGE);
  const [exportOpen, setExportOpen] = useState(false);
  const rawFilter = useMemo(() => toFilter(range), [range]);
  const filter = useDebouncedValue(rawFilter, 300);
  const danhMucQuery = useDanhMucBaoCao();
  const reportQuery = useBaoCao(loai, filter);
  const canView = canViewBaoCao(user?.id_VaiTro);

  const segmentOptions = useMemo(
    () =>
      REPORT_ORDER.map((value) => {
        const fromApi = danhMucQuery.data?.find((item) => item.loai === value);
        return {
          label: fromApi?.ten ?? REPORT_LABELS[value],
          value,
        };
      }),
    [danhMucQuery.data],
  );

  const rows = reportQuery.data?.data.bang_bieu ?? [];
  const columns = useMemo(() => buildColumns(rows), [rows]);

  if (!canView) {
    return (
      <Result
        status="403"
        title="Không có quyền xem báo cáo"
        subTitle="Chức năng báo cáo thống kê chỉ dành cho Quản lý và HCNS."
      />
    );
  }

  const forbiddenFallback = isForbidden(reportQuery.error);
  const hasData = Boolean(reportQuery.data?.data.co_du_lieu);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="m-0 text-2xl font-bold text-hicas-text">Báo cáo thống kê</h1>
          <p className="m-0 mt-1 text-hicas-muted">Xem báo cáo thống kê và xuất Excel/PDF theo bộ lọc hiện tại.</p>
        </div>
        <Space wrap>
          <Button icon={<ReloadOutlined />} onClick={() => reportQuery.refetch()} loading={reportQuery.isFetching}>
            Làm mới
          </Button>
          <Button type="primary" icon={<DownloadOutlined />} disabled={!hasData} onClick={() => setExportOpen(true)}>
            Xuất báo cáo
          </Button>
        </Space>
      </div>

      <div className="hicas-card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Segmented value={loai} options={segmentOptions} onChange={(value) => setLoai(value as LoaiBaoCao)} />
          <RangePicker
            value={range}
            format="DD/MM/YYYY"
            allowClear={false}
            onChange={(values) => {
              if (values?.[0] && values?.[1]) {
                setRange([values[0], values[1]]);
              }
            }}
          />
        </div>
      </div>

      {forbiddenFallback ? (
        <Alert
          type="info"
          showIcon
          message="Báo cáo chi tiết theo phòng ban/dự án hiện chưa khả dụng cho vai trò Quản lý."
          description="Vui lòng đăng nhập tài khoản HCNS hoặc Admin để xem báo cáo toàn công ty."
        />
      ) : reportQuery.isError ? (
        <Alert type="error" showIcon message="Không tải được báo cáo" description={getBackendMessage(reportQuery.error, 'Vui lòng thử lại sau')} />
      ) : reportQuery.isLoading ? (
        <div className="hicas-card p-5">
          <Skeleton active paragraph={{ rows: 10 }} />
        </div>
      ) : !hasData ? (
        <div className="hicas-card p-10">
          <Empty description="Không có dữ liệu cho kỳ báo cáo này" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="hicas-card p-4">
              <div className="text-sm text-hicas-muted">Loại báo cáo</div>
              <div className="mt-1 text-xl font-bold text-hicas-text">{REPORT_LABELS[loai]}</div>
            </div>
            <div className="hicas-card p-4">
              <div className="text-sm text-hicas-muted">Số chỉ số biểu đồ</div>
              <div className="mt-1 text-xl font-bold text-hicas-text">{reportQuery.data?.data.bieu_do.length ?? 0}</div>
            </div>
            <div className="hicas-card p-4">
              <div className="text-sm text-hicas-muted">Kỳ báo cáo</div>
              <div className="mt-1 text-base font-semibold text-hicas-text">
                {filter.tu_ngay} đến {filter.den_ngay}
              </div>
            </div>
          </div>

          <div className="hicas-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="m-0 flex items-center gap-2 text-lg font-semibold text-hicas-text">
                <BarChartOutlined className="text-hicas-primary" />
                Biểu đồ báo cáo
              </h2>
              <Tag color="blue">Đang cập nhật</Tag>
            </div>
            {renderChart(loai, reportQuery.data?.data.bieu_do ?? [])}
          </div>

          <div className="hicas-card p-5">
            <h2 className="m-0 mb-4 text-lg font-semibold text-hicas-text">Bảng số liệu</h2>
            <Table
              rowKey={(_, index) => String(index)}
              columns={columns}
              dataSource={rows}
              pagination={{ pageSize: 8 }}
              scroll={{ x: 900 }}
            />
          </div>
        </>
      )}

      <ExportModal open={exportOpen} loai={loai} filters={filter} onCancel={() => setExportOpen(false)} />
    </div>
  );
}
