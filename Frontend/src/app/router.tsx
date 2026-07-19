import { createBrowserRouter, Navigate } from 'react-router-dom';

import ComingSoonPage from '@/components/common/ComingSoonPage';
import DashboardPlaceholder from '@/components/common/DashboardPlaceholder';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import LoginPage from '@/features/auth/LoginPage';
import DanhMucQuyPhepPage from '@/features/danh-muc/DanhMucQuyPhepPage';
import DanhMucQuyenPage from '@/features/danh-muc/DanhMucQuyenPage';
import DanhMucTaiSanPage from '@/features/danh-muc/DanhMucTaiSanPage';
import PhongHopPage from '@/features/danh-muc/PhongHopPage';
import DuyetYeuCauPage from '@/features/he-thong/DuyetYeuCauPage';
import PhanQuyenPage from '@/features/he-thong/PhanQuyenPage';
import HoSoNhanSuPage from '@/features/ho-so/HoSoNhanSuPage';
import NghiViecPage from '@/features/nghi-viec/NghiViecPage';
import XuLyNghiViecPage from '@/features/nghi-viec/XuLyNghiViecPage';
import TaiSanCuaToiPage from '@/features/tai-san/TaiSanCuaToiPage';
import QuanLyTaiSanPage from '@/features/tai-san/QuanLyTaiSanPage';
import CapNhatTaiKhoanPage from '@/features/tai-khoan/CapNhatTaiKhoanPage';
import { ChamCongPage, DuyetBangCongPage } from '@/features/cham-cong';
import { BangPhepPage, ChiTietDonPhepPage, DanhSachDonPhepPage, TaoDonPhepPage } from '@/features/nghi-phep';
import { TaoThongBaoPage, ThongBaoListPage } from '@/features/thong-bao';
import { BaoCaoPage } from '@/features/bao-cao';
import { DangKyHopPage, DuyetLichHopPage, LichHopListPage, SuaLichHopPage } from '@/features/phong-hop';
import AuthLayout from '@/layouts/AuthLayout';
import MainLayout from '@/layouts/MainLayout';

export const router = createBrowserRouter([
  {
    path: '/dang-nhap',
    element: <AuthLayout />,
    children: [{ index: true, element: <LoginPage /> }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <MainLayout />,
        children: [
          { index: true, element: <DashboardPlaceholder /> },
          { path: 'he-thong', element: <Navigate to="/he-thong/phan-quyen" replace /> },
          { path: 'he-thong/phan-quyen', element: <PhanQuyenPage /> },
          { path: 'he-thong/duyet-yeu-cau', element: <DuyetYeuCauPage /> },
          { path: 'danh-muc', element: <Navigate to="/danh-muc/phong-hop" replace /> },
          { path: 'danh-muc/phong-hop', element: <PhongHopPage /> },
          { path: 'danh-muc/tai-san', element: <DanhMucTaiSanPage /> },
          { path: 'danh-muc/quyen', element: <DanhMucQuyenPage /> },
          { path: 'danh-muc/quy-phep', element: <DanhMucQuyPhepPage /> },
          { path: 'ho-so', element: <HoSoNhanSuPage /> },
          { path: 'nghi-viec/don-cua-toi', element: <NghiViecPage /> },
          { path: 'nghi-viec/xu-ly', element: <XuLyNghiViecPage /> },
          { path: 'nghi-phep', element: <Navigate to="/nghi-phep/bang-phep" replace /> },
          { path: 'nghi-phep/bang-phep', element: <BangPhepPage /> },
          { path: 'nghi-phep/lich-su', element: <BangPhepPage /> },
          { path: 'nghi-phep/tao-don', element: <TaoDonPhepPage /> },
          {
            path: 'tai-san/cua-toi',
            element: <TaiSanCuaToiPage />,
          },
          {
            path: 'tai-san/quan-ly',
            element: <QuanLyTaiSanPage />,
          },
          { path: 'nghi-phep/danh-sach-don', element: <DanhSachDonPhepPage /> },
          { path: 'nghi-phep/don/:id', element: <ChiTietDonPhepPage /> },
          { path: 'cham-cong', element: <Navigate to="/cham-cong/bang-cong" replace /> },
          { path: 'cham-cong/bang-cong', element: <ChamCongPage /> },
          { path: 'cham-cong/duyet', element: <DuyetBangCongPage /> },
          { path: 'thong-bao', element: <ThongBaoListPage /> },
          { path: 'thong-bao/tao-moi', element: <TaoThongBaoPage /> },
          { path: 'bao-cao', element: <BaoCaoPage /> },
          { path: 'tai-khoan/cap-nhat', element: <CapNhatTaiKhoanPage /> },
          { path: 'tai-san', element: <ComingSoonPage moduleName="Tai san" /> },
          { path: 'phong-hop', element: <LichHopListPage /> },
          { path: 'phong-hop/dat-lich', element: <DangKyHopPage /> },
          { path: 'phong-hop/duyet', element: <DuyetLichHopPage /> },
          { path: 'phong-hop/:id/sua', element: <SuaLichHopPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
