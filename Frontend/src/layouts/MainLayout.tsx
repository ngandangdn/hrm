import {
  AppstoreOutlined,
  BarChartOutlined,
  BellOutlined,
  CalendarOutlined,
  DesktopOutlined,
  HomeOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  SettingOutlined,
  UsergroupAddOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Dropdown, Input, Layout, Menu, Typography } from 'antd';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useIdleLogout } from '@/components/common/useIdleLogout';
import { canViewBaoCao } from '@/features/bao-cao/utils';
import { useHoSoCaNhan } from '@/features/ho-so/api';
import { canModerateLichHop } from '@/features/phong-hop/utils';
import { ThongBaoDropdown } from '@/features/thong-bao';
import { canCreateThongBao } from '@/features/thong-bao/utils';
import { useAuthStore } from '@/stores/authStore';

const { Header, Sider, Content, Footer } = Layout;
const { Text } = Typography;

type MenuItem = {
  key: string;
  label: string;
  icon: ReactNode;
  children?: MenuItem[];
  requiredRole?: string[];
};

const SYSTEM_ROLE_IDS = new Set(['ADMIN', 'Admin', 'admin', 'HCNS', 'HR', 'QuanLyHCNS', 'MANAGER_HCNS', 'MANAGER', 'Manager', 'QUAN_LY', 'QuanLy']);

const menuItems: MenuItem[] = [
  { key: '/', label: 'Trang chủ', icon: <HomeOutlined /> },
  {
    key: '/he-thong',
    label: 'Quản lý hệ thống',
    icon: <SettingOutlined />,
    requiredRole: ['CAN_MANAGE_SYSTEM'],
    children: [
      { key: '/he-thong/phan-quyen', label: 'Phân quyền', icon: <SettingOutlined /> },
      { key: '/he-thong/duyet-yeu-cau', label: 'Duyệt yêu cầu', icon: <UsergroupAddOutlined /> },
    ],
  },
  {
    key: '/ho-so',
    label: 'Hồ sơ nhân sự',
    icon: <UserOutlined />,
    children: [
      { key: '/ho-so', label: 'Danh sách hồ sơ', icon: <UserOutlined /> },
      { key: '/nghi-viec/don-cua-toi', label: 'Đơn nghỉ việc', icon: <UsergroupAddOutlined /> },
      { key: '/nghi-viec/xu-ly', label: 'Xử lý đơn nghỉ việc', icon: <UsergroupAddOutlined /> },
    ],
  },
  {
    key: '/nghi-phep',
    label: 'Nghỉ phép',
    icon: <CalendarOutlined />,
    children: [
      { key: '/nghi-phep/bang-phep', label: 'Bảng phép', icon: <CalendarOutlined /> },
      { key: '/nghi-phep/tao-don', label: 'Tạo đơn phép', icon: <CalendarOutlined /> },
      { key: '/nghi-phep/danh-sach-don', label: 'Danh sách đơn', icon: <CalendarOutlined /> },
    ],
  },
  {
    key: '/cham-cong',
    label: 'Chấm công',
    icon: <AppstoreOutlined />,
    children: [
      { key: '/cham-cong/bang-cong', label: 'Bảng chấm công', icon: <AppstoreOutlined /> },
      { key: '/cham-cong/duyet', label: 'Duyệt bảng công', icon: <AppstoreOutlined /> },
    ],
  },
  {
    key: '/thong-bao-menu',
    label: 'Thông báo',
    icon: <BellOutlined />,
    children: [
      { key: '/thong-bao', label: 'Tất cả thông báo', icon: <BellOutlined /> },
      { key: '/thong-bao/tao-moi', label: 'Tạo mới', icon: <BellOutlined />, requiredRole: ['CAN_CREATE_THONG_BAO'] },
    ],
  },
  { key: '/bao-cao', label: 'Báo cáo', icon: <BarChartOutlined />, requiredRole: ['CAN_VIEW_BAO_CAO'] },
  {
    key: '/tai-san',
    label: 'Tài sản',
    icon: <DesktopOutlined />,
    children: [
      { key: '/tai-san/cua-toi', label: 'Tài sản của tôi', icon: <DesktopOutlined /> },
      { key: '/tai-san/quan-ly', label: 'Quản lý tài sản', icon: <DesktopOutlined /> },
    ],
  },
  {
    key: '/phong-hop-menu',
    label: 'Phòng họp',
    icon: <UsergroupAddOutlined />,
    children: [
      { key: '/phong-hop', label: 'Lịch họp', icon: <UsergroupAddOutlined /> },
      { key: '/phong-hop/dat-lich', label: 'Đặt lịch', icon: <CalendarOutlined /> },
      { key: '/phong-hop/duyet', label: 'Duyệt lịch họp', icon: <UsergroupAddOutlined />, requiredRole: ['CAN_MODERATE_LICH_HOP'] },
    ],
  },
];

const routeLabels: Record<string, string> = {
  '/': 'Tổng quan',
  '/he-thong/phan-quyen': 'Phân quyền',
  '/he-thong/duyet-yeu-cau': 'Duyệt yêu cầu',
  '/danh-muc/phong-hop': 'Phòng họp',
  '/danh-muc/tai-san': 'Tài sản',
  '/danh-muc/quyen': 'Quyền',
  '/danh-muc/quy-phep': 'Quỹ phép',
  '/ho-so': 'Hồ sơ nhân sự',
  '/nghi-viec/don-cua-toi': 'Đơn nghỉ việc',
  '/nghi-viec/xu-ly': 'Xử lý đơn nghỉ việc',
  '/nghi-phep/bang-phep': 'Bảng phép',
  '/nghi-phep/tao-don': 'Tạo đơn phép',
  '/nghi-phep/danh-sach-don': 'Danh sách đơn phép',
  '/cham-cong/bang-cong': 'Bảng chấm công',
  '/cham-cong/duyet': 'Duyệt bảng công',
  '/thong-bao': 'Thông báo',
  '/thong-bao/tao-moi': 'Tạo thông báo',
  '/bao-cao': 'Báo cáo thống kê',
  '/tai-khoan/cap-nhat': 'Cập nhật tài khoản',
  '/tai-san/cua-toi': 'Tài sản của tôi',
  '/tai-san/quan-ly': 'Quản lý tài sản',
  '/phong-hop': 'Lịch họp',
  '/phong-hop/dat-lich': 'Đặt lịch họp',
  '/phong-hop/duyet': 'Duyệt lịch họp',
};

function canUseRoleMarker(marker: string, roleId?: string) {
  if (marker === 'CAN_VIEW_BAO_CAO') return canViewBaoCao(roleId);
  if (marker === 'CAN_CREATE_THONG_BAO') return canCreateThongBao(roleId);
  if (marker === 'CAN_MODERATE_LICH_HOP') return canModerateLichHop(roleId);
  if (marker === 'CAN_MANAGE_SYSTEM') return Boolean(roleId && SYSTEM_ROLE_IDS.has(roleId));
  return true;
}

function isMenuItemVisible(item: MenuItem, roleId?: string) {
  return !item.requiredRole?.some((marker) => !canUseRoleMarker(marker, roleId));
}

function getBreadcrumb(pathname: string) {
  if (pathname === '/') return { parent: 'Trang chủ', current: 'Quản lý nhân sự' };
  const segments = pathname.split('/').filter(Boolean);
  const parentPath = segments.length > 1 ? `/${segments[0]}` : '/';
  const parent =
    segments[0] === 'danh-muc'
      ? 'Danh mục'
      : segments[0] === 'nghi-viec'
        ? 'Hồ sơ nhân sự'
        : routeLabels[parentPath] ?? menuItems.find((item) => item.key === parentPath)?.label ?? 'Trang chủ';
  const current =
    routeLabels[pathname] ??
    routeLabels[`/${segments.slice(0, 2).join('/')}`] ??
    routeLabels[parentPath] ??
    'Tổng quan';
  return { parent, current };
}

function getRoleLabel(roleId?: string) {
  if (!roleId) return 'Tài khoản';
  if (['ADMIN', 'Admin', 'admin'].includes(roleId)) return 'Quản trị hệ thống';
  if (['HCNS', 'HR', 'QuanLyHCNS', 'MANAGER_HCNS'].includes(roleId)) return 'Hành chính Nhân sự';
  if (['MANAGER', 'Manager', 'QUAN_LY', 'QuanLy'].includes(roleId)) return 'Quản lý';
  return 'Nhân viên';
}

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const profileQuery = useHoSoCaNhan(user?.id_TaiKhoan);
  useIdleLogout();

  const antdMenuItems = useMemo(
    () =>
      menuItems
        .filter((item) => isMenuItemVisible(item, user?.id_VaiTro))
        .map((item) => ({
          key: item.key,
          icon: item.icon,
          label: item.label,
          children: item.children
            ?.filter((child) => isMenuItemVisible(child, user?.id_VaiTro))
            .map((child) => ({
              key: child.key,
              icon: child.icon,
              label: child.label,
            })),
        })),
    [user?.id_VaiTro],
  );

  const flatMenuItems = menuItems.flatMap((item) => [item, ...(item.children ?? [])]);
  const selectedMenuKey =
    [...flatMenuItems]
      .sort((left, right) => right.key.length - left.key.length)
      .find((item) => item.key !== '/' && location.pathname.startsWith(item.key))?.key ?? '/';
  const breadcrumb = getBreadcrumb(location.pathname);
  const employeeName = profileQuery.data?.thong_tin_chung.hoTen ?? user?.email ?? 'Tài khoản';

  return (
    <Layout className="min-h-screen bg-[#f3f6fb]">
      <Sider
        width={300}
        collapsedWidth={88}
        collapsed={collapsed}
        trigger={null}
        className="border-r border-hicas-border bg-white shadow-[8px_0_24px_rgba(15,23,42,0.03)]"
      >
        <div className="flex h-full flex-col">
          <div className="flex h-24 items-center gap-4 px-8">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-hicas-primary text-xl text-white shadow-[0_10px_20px_rgba(52,84,209,0.22)]">
              <AppstoreOutlined />
            </div>
            {!collapsed && (
              <div>
                <div className="text-2xl font-bold text-hicas-primary">HiCAS HRM</div>
                <Text className="text-hicas-muted">Hệ thống quản trị nhân sự</Text>
              </div>
            )}
          </div>

          <Menu
            mode="inline"
            selectedKeys={[selectedMenuKey]}
            defaultOpenKeys={['/he-thong', '/ho-so', '/nghi-phep']}
            items={antdMenuItems}
            className="border-none px-4 text-base"
            onClick={({ key }) => navigate(key)}
          />

          <div className="mt-auto space-y-2 px-4 pb-8">
            <Menu
              mode="inline"
              selectable={false}
              items={[
                { key: 'danh-muc', icon: <AppstoreOutlined />, label: 'Danh mục' },
                { key: 'cai-dat', icon: <SettingOutlined />, label: 'Cài đặt' },
              ]}
              className="border-none text-base"
              onClick={({ key }) => navigate(key === 'danh-muc' ? '/danh-muc/phong-hop' : '/tai-khoan/cap-nhat')}
            />
          </div>
        </div>
      </Sider>

      <Layout>
        <Header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-hicas-border bg-white/95 px-8 backdrop-blur">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed((value) => !value)}
            />
            <div className="hidden items-center gap-3 text-base md:flex">
              <span>{breadcrumb.parent}</span>
              <span>›</span>
              <strong className="text-hicas-primary">{breadcrumb.current}</strong>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Input
              prefix={<SearchOutlined />}
              placeholder="Tìm kiếm nhân sự, tài liệu..."
              className="hidden w-[320px] rounded-full lg:flex"
            />
            <ThongBaoDropdown compact />
            <QuestionCircleOutlined className="text-xl" />
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'account-update',
                    icon: <UserOutlined />,
                    label: 'Cập nhật tài khoản',
                    onClick: () => navigate('/tai-khoan/cap-nhat'),
                  },
                  {
                    key: 'logout',
                    icon: <LogoutOutlined />,
                    label: 'Đăng xuất',
                    onClick: () => {
                      logout();
                      navigate('/dang-nhap', { replace: true });
                    },
                  },
                ],
              }}
            >
              <button className="flex cursor-pointer items-center gap-3 border-none bg-transparent">
                <div className="hidden text-right md:block">
                  <div className="text-base font-semibold">{employeeName}</div>
                  <Text className="text-sm text-hicas-muted">{getRoleLabel(user?.id_VaiTro)}</Text>
                </div>
                <Avatar size={44} className="bg-hicas-primary">
                  {employeeName[0]?.toUpperCase() ?? 'H'}
                </Avatar>
              </button>
            </Dropdown>
          </div>
        </Header>

        <Content className="min-h-[calc(100vh-144px)] p-8">
          <Outlet />
        </Content>

        <Footer className="border-t border-hicas-border bg-white px-8 py-5 text-sm text-hicas-muted">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <span>© 2026 HiCAS HRM. Hệ thống quản trị nhân sự.</span>
            <span>Phiên bản demo nội bộ</span>
          </div>
        </Footer>
      </Layout>
    </Layout>
  );
}
