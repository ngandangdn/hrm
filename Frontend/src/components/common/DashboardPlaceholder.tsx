import {
  BellOutlined,
  CalendarOutlined,
  CheckSquareOutlined,
  ClockCircleOutlined,
  FileDoneOutlined,
  FormOutlined,
  PieChartOutlined,
  SoundOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Button, Empty, Progress, Tag } from 'antd';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';

import { getBangCong } from '@/api/chamCongApi';
import { useDanhSachHoSoNhanSu, useHoSoCaNhan } from '@/features/ho-so/api';
import { useBangPhep, useDanhSachDonPhep, useLichSuPhep } from '@/features/nghi-phep/api';
import { useLichHopList } from '@/features/phong-hop/api';
import { formatDateTime } from '@/features/phong-hop/utils';
import { useSoLuongChuaDoc, useThongBaoList } from '@/features/thong-bao/api';
import { useAuthStore } from '@/stores/authStore';

const STANDARD_WORK_DAYS = 22;

const quickActions = [
  { label: 'Tạo đơn phép', icon: <CalendarOutlined />, to: '/nghi-phep/tao-don' },
  { label: 'Giải trình chấm công', icon: <ClockCircleOutlined />, to: '/cham-cong/bang-cong' },
  { label: 'Đặt phòng họp', icon: <FormOutlined />, to: '/phong-hop/dat-lich' },
];

function toNumber(value?: string | number | null) {
  if (value === undefined || value === null || value === '') return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value: number, digits = 1) {
  return value.toLocaleString('vi-VN', {
    minimumFractionDigits: value % 1 === 0 ? 0 : digits,
    maximumFractionDigits: digits,
  });
}

function getWorkStatusLabel(workDays: number) {
  if (workDays <= 0) return 'Chưa có dữ liệu công';
  if (workDays >= STANDARD_WORK_DAYS) return 'Đủ công tháng này';
  return 'Đang làm việc';
}

export default function DashboardPlaceholder() {
  const user = useAuthStore((state) => state.user);
  const currentMonth = dayjs().month() + 1;
  const currentYear = dayjs().year();
  const today = dayjs().format('dddd, DD/MM/YYYY');

  const profilesQuery = useDanhSachHoSoNhanSu();
  const matchedProfile = (profilesQuery.data ?? []).find((item) => item.email === user?.email);
  const currentEmployeeId = user?.id_TaiKhoan ?? matchedProfile?.id_NhanVien;
  const profileQuery = useHoSoCaNhan(currentEmployeeId);
  const bangPhepQuery = useBangPhep({ nam: currentYear, page: 1, size: 20 });
  const pendingLeaveQuery = useDanhSachDonPhep({ nam: currentYear, trang_thai: 0, page: 1, size: 20 });
  const leaveHistoryQuery = useLichSuPhep({
    id_nhan_vien: currentEmployeeId,
    nam: currentYear,
    page: 1,
    size: 20,
  });
  const unreadQuery = useSoLuongChuaDoc();
  const notificationsQuery = useThongBaoList(1, 3);
  const meetingsQuery = useLichHopList();

  const attendanceQuery = useQuery({
    queryKey: ['dashboard', 'bang-cong', currentEmployeeId, currentMonth, currentYear],
    enabled: Boolean(currentEmployeeId),
    queryFn: () => getBangCong(currentMonth, currentYear, currentEmployeeId),
  });

  const employeeName = profileQuery.data?.thong_tin_chung.hoTen ?? matchedProfile?.hoTen ?? user?.email ?? 'Nhân viên';
  const attendanceRows = attendanceQuery.data?.du_lieu ?? [];
  const workDays = attendanceRows.reduce((sum, row) => sum + toNumber(row.ngayCongQuyDoi), 0);
  const lateCount = attendanceRows.reduce((sum, row) => sum + (row.soLanDiMuon ?? 0), 0);
  const leaveQuota = (bangPhepQuery.data ?? []).find((item) => item.id_NhanVien === currentEmployeeId) ?? bangPhepQuery.data?.[0];
  const remainingLeave = toNumber(leaveQuota?.so_ngay_con_lai);
  const usedLeave = toNumber(leaveQuota?.soNgayDaDung);
  const pendingLeave = toNumber(leaveQuota?.soNgayChoDuyet);
  const unreadCount = unreadQuery.data?.so_luong_chua_doc ?? 0;
  const pendingLeaveCount = pendingLeaveQuery.data?.filter((item) => item.trangThai === 0).length ?? 0;
  const workPercent = Math.min(100, Math.round((workDays / STANDARD_WORK_DAYS) * 100));
  const leaveOrHolidayDays = Math.max(0, STANDARD_WORK_DAYS - workDays);

  const approvedLeaves = (leaveHistoryQuery.data ?? [])
    .filter((item) => item.trangThai === 1 && dayjs(item.tuNgay).valueOf() >= dayjs().startOf('day').valueOf())
    .sort((a, b) => dayjs(a.tuNgay).valueOf() - dayjs(b.tuNgay).valueOf());

  const upcomingMeeting = (meetingsQuery.data ?? [])
    .filter((item) => item.trangThai === 1 && dayjs(item.thoiGianBatDau).isAfter(dayjs()))
    .sort((a, b) => dayjs(a.thoiGianBatDau).valueOf() - dayjs(b.thoiGianBatDau).valueOf())[0];

  const statCards = [
    {
      icon: <FileDoneOutlined />,
      label: 'Tổng ngày công',
      value: formatNumber(workDays),
      suffix: `/ ${STANDARD_WORK_DAYS} ngày`,
      footer: `Tháng ${currentMonth}/${currentYear}`,
      progress: workPercent,
    },
    {
      icon: <PieChartOutlined />,
      label: 'Quỹ phép còn lại',
      value: formatNumber(remainingLeave),
      suffix: 'ngày',
      footer: `Năm ${currentYear}`,
      detail: `Đã dùng ${formatNumber(usedLeave)} ngày · Chờ duyệt ${formatNumber(pendingLeave)} ngày`,
    },
    {
      icon: <BellOutlined />,
      label: 'Thông báo chưa đọc',
      value: String(unreadCount),
      suffix: 'tin mới',
      footer: 'Xem tất cả',
      to: '/thong-bao',
    },
    {
      icon: <CheckSquareOutlined />,
      label: 'Đơn chờ duyệt',
      value: String(pendingLeaveCount),
      suffix: 'yêu cầu',
      footer: 'Quản lý',
      to: '/nghi-phep/danh-sach-don',
    },
  ];

  const scheduleRows = [
    {
      key: 'today',
      label: 'Hôm nay',
      day: dayjs().format('DD'),
      title: 'Ca làm việc hành chính',
      detail: attendanceRows.length > 0 ? `${formatNumber(workDays)} ngày công đã ghi nhận trong tháng` : 'Chưa có dữ liệu công tháng này',
      status: getWorkStatusLabel(workDays),
      statusColor: workDays > 0 ? 'blue' : 'default',
    },
    upcomingMeeting
      ? {
          key: upcomingMeeting.id_LichHop,
          label: 'Lịch họp',
          day: dayjs(upcomingMeeting.thoiGianBatDau).format('DD'),
          title: upcomingMeeting.tieuDe,
          detail: `${formatDateTime(upcomingMeeting.thoiGianBatDau)} - ${formatDateTime(upcomingMeeting.thoiGianKetThuc)}`,
          status: 'Đã duyệt',
          statusColor: 'success',
        }
      : null,
    approvedLeaves[0]
      ? {
          key: approvedLeaves[0].id_DonPhep,
          label: 'Nghỉ phép',
          day: dayjs(approvedLeaves[0].tuNgay).format('DD'),
          title: approvedLeaves[0].loaiPhep,
          detail: `${dayjs(approvedLeaves[0].tuNgay).format('DD/MM/YYYY')} - ${dayjs(approvedLeaves[0].denNgay).format('DD/MM/YYYY')}`,
          status: 'Đã duyệt',
          statusColor: 'success',
        }
      : null,
  ].filter(Boolean);

  const latestNotifications = notificationsQuery.data?.data ?? [];

  return (
    <div className="space-y-8">
      <section className="rounded-lg bg-gradient-to-r from-[#2442ba] via-[#3454d1] to-[#4f68d8] px-10 py-10 text-white shadow-[0_18px_42px_rgba(52,84,209,0.22)]">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="m-0 text-[30px] font-bold">Xin chào, {employeeName}</h1>
            <p className="mt-3 text-lg text-white/85">Hôm nay: {today}</p>
          </div>
          <Tag className="rounded-lg border-white/30 bg-white/25 px-5 py-3 text-base text-white">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-400" />
            {getWorkStatusLabel(workDays)}
          </Tag>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="hicas-card p-6">
            <div className="mb-5 flex items-start justify-between">
              <div className="hicas-icon-tile text-2xl">{card.icon}</div>
              <span className="text-sm text-hicas-muted">{card.footer}</span>
            </div>
            <p className="text-base text-hicas-muted">{card.label}</p>
            <div className="mt-1 flex items-end gap-2">
              <strong className="text-[32px] leading-none text-hicas-text">{card.value}</strong>
              <span className="text-lg text-hicas-muted">{card.suffix}</span>
            </div>
            {'detail' in card && card.detail && <p className="mt-4 text-sm text-green-700">{card.detail}</p>}
            {'progress' in card && <Progress percent={card.progress} showInfo={false} className="mt-8" />}
            {'to' in card && card.to && (
              <Link to={card.to}>
                <Button className="mt-6 w-full">{card.label === 'Đơn chờ duyệt' ? 'Duyệt ngay' : 'Xem ngay'}</Button>
              </Link>
            )}
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <div className="grid gap-5 md:grid-cols-3">
            {quickActions.map((action) => (
              <Link key={action.to} to={action.to} className="hicas-card flex h-[136px] flex-col items-center justify-center gap-3 text-lg text-hicas-text">
                <span className="hicas-icon-tile text-2xl">{action.icon}</span>
                {action.label}
              </Link>
            ))}
          </div>

          <div className="hicas-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-hicas-border px-8 py-5">
              <h2 className="m-0 text-2xl font-bold">
                <CalendarOutlined className="mr-3" />
                Lịch làm việc & Sự kiện
              </h2>
              <span>Tháng {dayjs().format('MM/YYYY')}</span>
            </div>
            <div className="divide-y divide-hicas-border">
              {scheduleRows.map((row) => (
                <div key={row!.key} className="grid grid-cols-[120px_1fr_120px] gap-5 px-8 py-5">
                  <div className="border-r border-hicas-border text-center">
                    <div className="text-sm text-hicas-primary">{row!.label}</div>
                    <div className="text-3xl font-bold">{row!.day}</div>
                  </div>
                  <div>
                    <div className="text-lg font-medium">{row!.title}</div>
                    <div className="mt-3 rounded border border-dashed border-hicas-border bg-[#f8f5ff] px-4 py-3">{row!.detail}</div>
                  </div>
                  <Tag color={row!.statusColor}>{row!.status}</Tag>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="hicas-card p-8">
            <h2 className="m-0 mb-6 text-2xl font-bold">Trạng thái nhân sự</h2>
            <div className="flex items-center justify-center">
              <Progress type="circle" percent={workPercent} strokeColor="#3454d1" size={150} />
            </div>
            <div className="mt-8 space-y-4 text-base">
              <div className="flex justify-between">
                <span>Thời gian làm việc</span>
                <strong>{formatNumber(workDays)} ngày</strong>
              </div>
              <div className="flex justify-between">
                <span>Nghỉ phép/Lễ</span>
                <strong>{formatNumber(leaveOrHolidayDays)} ngày</strong>
              </div>
              <div className="flex justify-between">
                <span>Đi muộn</span>
                <strong>{lateCount} lần</strong>
              </div>
            </div>
          </div>

          <div className="hicas-card overflow-hidden">
            <h2 className="m-0 border-b border-hicas-border px-8 py-5 text-2xl font-bold">
              <SoundOutlined className="mr-3" />
              Thông báo mới
            </h2>
            <div className="space-y-4 p-6">
              {latestNotifications.length === 0 ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có thông báo" />
              ) : (
                latestNotifications.map((item) => (
                  <div key={item.id_ThongBao} className="rounded-lg bg-[#f7f9fc] p-4">
                    <p className="m-0 font-semibold">{item.tieuDe}</p>
                    <p className="m-0 mt-2 line-clamp-3 text-hicas-muted">{item.noiDung}</p>
                    <p className="m-0 mt-2 text-xs text-hicas-muted">{dayjs(item.thoiGianGui).format('DD/MM/YYYY HH:mm')}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
