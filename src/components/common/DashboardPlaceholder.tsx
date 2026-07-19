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
import { Button, Progress, Tag } from 'antd';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';

import { useAuthStore } from '@/stores/authStore';

const statCards = [
  { icon: <FileDoneOutlined />, label: 'Tổng ngày công', value: '18.5', suffix: '/ 22 ngày', footer: 'Tháng này' },
  { icon: <PieChartOutlined />, label: 'Quỹ phép còn lại', value: '6.5', suffix: 'ngày', footer: 'Năm 2026' },
  { icon: <BellOutlined />, label: 'Thông báo chưa đọc', value: '5', suffix: 'tin mới', footer: 'Xem tất cả' },
  { icon: <CheckSquareOutlined />, label: 'Đơn chờ duyệt', value: '3', suffix: 'yêu cầu', footer: 'Quản lý' },
];

const quickActions = [
  { label: 'Tạo đơn phép', icon: <CalendarOutlined />, to: '/nghi-phep/tao-don' },
  { label: 'Giải trình chấm công', icon: <ClockCircleOutlined />, to: '/cham-cong/bang-cong' },
  { label: 'Đặt phòng họp', icon: <FormOutlined />, to: '/phong-hop/dat-lich' },
];

export default function DashboardPlaceholder() {
  const user = useAuthStore((state) => state.user);
  const today = dayjs().format('dddd, DD/MM/YYYY');

  return (
    <div className="space-y-8">
      <section className="rounded-[14px] bg-gradient-to-r from-[#3f2be8] to-[#6f63ee] px-10 py-10 text-white shadow-hicas">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="m-0 text-[30px] font-bold">Chào buổi sáng, {user?.email ?? 'Đặng Kim Ngân'}</h1>
            <p className="mt-3 text-lg text-white/85">Hôm nay: {today}</p>
          </div>
          <Tag className="rounded-lg border-white/30 bg-white/25 px-5 py-3 text-base text-white">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-400" />
            Đang trong ca làm việc
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
            {card.label === 'Tổng ngày công' && <Progress percent={84} showInfo={false} className="mt-8" />}
            {card.label === 'Đơn chờ duyệt' && (
              <Link to="/nghi-phep/danh-sach-don">
                <Button className="mt-6 w-full">Duyệt ngay</Button>
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
              {[
                ['HÔM NAY', dayjs().format('DD'), 'Ca làm việc hành chính', 'Họp giao ban Phòng Nhân sự (14:00 - 15:30)', 'Đang làm việc'],
                ['NGÀY MAI', dayjs().add(1, 'day').format('DD'), 'Ca làm việc hành chính', '08:00 - 17:30', ''],
                ['SẮP TỚI', dayjs().add(3, 'day').format('DD'), 'Nghỉ phép năm đã duyệt', '', 'Đã duyệt'],
              ].map((row) => (
                <div key={row[1]} className="grid grid-cols-[120px_1fr_120px] gap-5 px-8 py-5">
                  <div className="border-r border-hicas-border text-center">
                    <div className="text-sm text-hicas-primary">{row[0]}</div>
                    <div className="text-3xl font-bold">{row[1]}</div>
                  </div>
                  <div>
                    <div className="text-lg font-medium">{row[2]}</div>
                    {row[3] && <div className="mt-3 rounded border border-dashed border-hicas-border bg-[#f8f5ff] px-4 py-3">{row[3]}</div>}
                  </div>
                  {row[4] && <Tag color={row[4] === 'Đã duyệt' ? 'success' : 'blue'}>{row[4]}</Tag>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="hicas-card p-8">
            <h2 className="m-0 mb-6 text-2xl font-bold">Trạng thái nhân sự</h2>
            <div className="flex items-center justify-center">
              <Progress type="circle" percent={75} strokeColor="#3f2be8" size={150} />
            </div>
            <div className="mt-8 space-y-4 text-base">
              <div className="flex justify-between">
                <span>Thời gian làm việc</span>
                <strong>18.5 ngày</strong>
              </div>
              <div className="flex justify-between">
                <span>Nghỉ phép/Lễ</span>
                <strong>1.5 ngày</strong>
              </div>
              <div className="flex justify-between">
                <span>Vắng mặt/Nghỉ không lương</span>
                <strong>0 ngày</strong>
              </div>
            </div>
          </div>

          <div className="hicas-card overflow-hidden">
            <h2 className="m-0 border-b border-hicas-border px-8 py-5 text-2xl font-bold">
              <SoundOutlined className="mr-3" />
              Thông báo mới
            </h2>
            <div className="p-6">
              <p className="font-semibold">Đơn xin nghỉ phép đã được duyệt</p>
              <p className="text-hicas-muted">Đơn xin nghỉ của bạn đã được Trưởng phòng duyệt. Vui lòng kiểm tra bảng phép để xem số ngày còn lại.</p>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
