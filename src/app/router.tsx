import { createBrowserRouter, Navigate } from 'react-router-dom';

import ProtectedRoute from '@/components/common/ProtectedRoute';
import AuthLayout from '@/layouts/AuthLayout';
import MainLayout from '@/layouts/MainLayout';
import LoginPage from '@/features/auth/LoginPage';
import DashboardPlaceholder from '@/features/dashboard/DashboardPlaceholder';

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
          // TODO F2-F9: add module routes here. MenuItem will support requiredRole?: string[] for client RBAC.
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
