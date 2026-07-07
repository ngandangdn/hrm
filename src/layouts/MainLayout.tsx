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
  TeamOutlined,
  UsergroupAddOutlined,
  UserOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { Avatar, Badge, Button, Dropdown, Input, Layout, Menu, Tooltip, Typography } from 'antd';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import { useIdleLogout } from '@/components/common/useIdleLogout';
import { useAuthStore } from '@/stores/authStore';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

type MenuItem = {
  key: string;
  label: string;
  icon: ReactNode;
  disabled?: boolean;
  requiredRole?: string[];
};

const menuItems: MenuItem[] = [
  { key: '/', label: 'Trang chủ', icon: <HomeOutlined /> },
  { key: '/ho-so', label: 'Hồ sơ nhân sự', icon: <UserOutlined />, disabled: true },
  { key: '/nghi-phep', label: 'Nghỉ phép', icon: <CalendarOutlined />, disabled: true },
  { key: '/cham-cong', label: 'Chấm công', icon: <AppstoreOutlined />, disabled: true },
  { key: '/thong-bao', label: 'Thông báo', icon: <BellOutlined />, disabled: true },
  { key: '/quan-ly-nhan-su', label: 'Quản lý nhân sự', icon: <TeamOutlined />, disabled: true },
  { key: '/tai-san', label: 'Tài sản', icon: <WalletOutlined />, disabled: true },
  { key: '/phong-hop', label: 'Phòng họp', icon: <UsergroupAddOutlined />, disabled: true },
  { key: '/bao-cao', label: 'Báo cáo', icon: <BarChartOutlined />, disabled: true },
];

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  useIdleLogout();

  const antdMenuItems = useMemo(
    () =>
      menuItems.map((item) => ({
        key: item.key,
        icon: item.icon,
        disabled: item.disabled,
        label: item.disabled ? (
          <Tooltip title="Sắp ra mắt" placement="right">
            <span>{item.label}</span>
          </Tooltip>
        ) : (
          item.label
        ),
      })),
    [],
  );

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
            selectedKeys={['/']}
            items={antdMenuItems}
            className="border-none px-4 text-base"
            onClick={({ key }) => {
              if (key === '/') navigate('/');
            }}
          />

          <div className="mt-auto space-y-2 px-4 pb-8">
            <Menu
              mode="inline"
              selectable={false}
              items={[
                { key: 'danh-muc', icon: <AppstoreOutlined />, label: 'Danh mục', disabled: true },
                { key: 'cai-dat', icon: <SettingOutlined />, label: 'Cài đặt', disabled: true },
              ]}
              className="border-none text-base"
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
            <Badge dot>
              <BellOutlined className="text-xl" />
            </Badge>
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
                  <div className="text-base font-semibold">{user?.email ?? 'Nguyễn Văn A'}</div>
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
