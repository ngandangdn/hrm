import {
  AppstoreOutlined,
  BarChartOutlined,
  BellOutlined,
  CalendarOutlined,
  HomeOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  SettingOutlined,
  UsergroupAddOutlined,
  UserOutlined,
  WalletOutlined,
  DesktopOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Dropdown, Input, Layout, Menu, Typography } from 'antd';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useIdleLogout } from '@/components/common/useIdleLogout';
import { canViewBaoCao } from '@/features/bao-cao/utils';
import { canModerateLichHop } from '@/features/phong-hop/utils';
import { ThongBaoDropdown } from '@/features/thong-bao';
import { canCreateThongBao } from '@/features/thong-bao/utils';
import { useAuthStore } from '@/stores/authStore';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

type MenuItem = {
  key: string;
  label: string;
  icon: ReactNode;
  children?: MenuItem[];
  requiredRole?: string[];
};

const menuItems: MenuItem[] = [
  { key: '/', label: 'Trang chủ', icon: <HomeOutlined /> },
  {
    key: '/he-thong',
    label: 'Quản lý hệ thống',
    icon: <SettingOutlined />,
    children: [
      { key: '/he-thong/phan-quyen', label: 'Phân quyền', icon: <SettingOutlined /> },
      { key: '/he-thong/duyet-yeu-cau', label: 'Duyệt yêu cầu', icon: <UsergroupAddOutlined /> },
    ],
  },
  { key: '/ho-so', label: 'Hồ sơ nhân sự', icon: <UserOutlined /> },
  {
    key: '/nghi-viec',
    label: 'Nghỉ việc',
    icon: <UsergroupAddOutlined />,
    children: [
      { key: '/nghi-viec/don-cua-toi', label: 'Đơn của tôi', icon: <UsergroupAddOutlined /> },
      { key: '/nghi-viec/xu-ly', label: 'Xử lý đơn', icon: <UsergroupAddOutlined /> },
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

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  useIdleLogout();

  const antdMenuItems = useMemo(
    () =>
      menuItems
        .filter((item) => !item.requiredRole?.includes('CAN_VIEW_BAO_CAO') || canViewBaoCao(user?.id_VaiTro))
        .map((item) => ({
          key: item.key,
          icon: item.icon,
          label: item.label,
          children: item.children
            ?.filter((child) => !child.requiredRole?.includes('CAN_CREATE_THONG_BAO') || canCreateThongBao(user?.id_VaiTro))
            .filter((child) => !child.requiredRole?.includes('CAN_MODERATE_LICH_HOP') || canModerateLichHop(user?.id_VaiTro))
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

  return (
    <Layout className="min-h-screen">
      <Sider
        width={300}
        collapsedWidth={88}
        collapsed={collapsed}
        trigger={null}
        className="border-r border-hicas-border bg-white"
      >
        <div className="flex h-full flex-col">
          <div className="flex h-24 items-center gap-4 px-8">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-hicas-primary text-xl text-white">
              <AppstoreOutlined />
            </div>
            {!collapsed && (
              <div>
                <div className="text-2xl font-bold text-hicas-primary">HiCAS HRM</div>
                <Text className="text-hicas-muted">Hệ thống quản trị nhân...</Text>
              </div>
            )}
          </div>

          <Menu
            mode="inline"
            selectedKeys={[selectedMenuKey]}
            defaultOpenKeys={['/he-thong', '/nghi-phep']}
            items={antdMenuItems}
            className="border-none px-4 text-base"
            onClick={({ key }) => {
              navigate(key);
            }}
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
              onClick={({ key }) => navigate(key === 'danh-muc' ? '/danh-muc/phong-hop' : '/he-thong/phan-quyen')}
            />
          </div>
        </div>
      </Sider>

      <Layout>
        <Header className="flex h-20 items-center justify-between border-b border-hicas-border bg-white px-8">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed((value) => !value)}
            />
            <div className="hidden items-center gap-3 text-base md:flex">
              <span>Trang chủ</span>
              <span>›</span>
              <strong className="text-hicas-primary">Tổng quan</strong>
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
                  <div className="text-base font-semibold">{user?.email ?? 'Đặng Kim Ngân'}</div>
                  <Text className="text-sm text-hicas-muted">{user?.id_VaiTro ?? 'Trưởng phòng Nhân sự'}</Text>
                </div>
                <Avatar size={44} className="bg-hicas-primary">
                  {user?.email?.[0]?.toUpperCase() ?? 'A'}
                </Avatar>
              </button>
            </Dropdown>
          </div>
        </Header>

        <Content className="p-8">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

