import { AppstoreOutlined, CalendarOutlined, DesktopOutlined, SafetyOutlined, VideoCameraOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const tabItems = [
  { key: '/danh-muc/phong-hop', label: 'Phòng họp', icon: <VideoCameraOutlined /> },
  { key: '/danh-muc/tai-san', label: 'Tài sản', icon: <DesktopOutlined /> },
  { key: '/danh-muc/quyen', label: 'Quyền', icon: <SafetyOutlined /> },
  { key: '/danh-muc/quy-phep', label: 'Quỹ phép', icon: <CalendarOutlined /> },
];

export default function DanhMucTabs({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const activeKey = tabItems.find((item) => location.pathname.startsWith(item.key))?.key ?? '/danh-muc/phong-hop';

  return (
    <div className="space-y-6">
      <div className="hicas-section overflow-hidden">
        <div className="flex items-center gap-3 border-b border-hicas-border px-6 py-5">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#edf3ff] text-hicas-primary">
            <AppstoreOutlined />
          </div>
          <div>
            <h1 className="m-0 text-2xl font-bold text-hicas-text">Danh mục hệ thống</h1>
            <p className="m-0 mt-1 text-sm text-hicas-muted">Quản lý dữ liệu nền dùng chung cho các phân hệ.</p>
          </div>
        </div>
        <div className="flex overflow-x-auto border-b border-hicas-border bg-white px-3 md:px-5">
          {tabItems.map((item) => {
            const active = item.key === activeKey;
            return (
              <Link
                key={item.key}
                to={item.key}
                onClick={(event) => {
                  event.preventDefault();
                  navigate(item.key);
                }}
                className={`inline-flex h-12 shrink-0 items-center gap-1.5 border-b-2 px-3 text-xs font-semibold transition md:h-14 md:gap-2 md:px-4 md:text-sm ${
                  active
                    ? 'border-hicas-primary text-hicas-primary'
                    : 'border-transparent text-slate-600 hover:border-[#b9c7ee] hover:text-hicas-primary'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
      {children}
    </div>
  );
}
