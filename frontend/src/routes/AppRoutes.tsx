import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Spinner } from '@fluentui/react-components';
import { DashboardLayout } from '../layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';
import { GuestRoute } from './GuestRoute';
import { RoleProtectedRoute } from './RoleProtectedRoute';
import { useAuth } from '../context/AuthContext';

// Route-level code splitting using React.lazy
const LoginForm = lazy(() => import('../pages/Login/Login').then((m) => ({ default: m.LoginForm })));
const EmployeesPage = lazy(() => import('../pages/Employees/Employee').then((m) => ({ default: m.EmployeesPage })));
const LeaveManagement = lazy(() => import('../pages/Leaves/LeaveManagement').then((m) => ({ default: m.LeaveManagement })));
const PayslipManagement = lazy(() => import('../pages/Payslip/PayslipManagement').then((m) => ({ default: m.PayslipManagement })));
const AttendanceManagement = lazy(() => import('../pages/Attendance/AttendanceManagement').then((m) => ({ default: m.AttendanceManagement })));
const EmployeeDashboard = lazy(() => import('../pages/Dashboard/EmployeeDashboard').then((m) => ({ default: m.EmployeeDashboard })));

const PageFallback: React.FC = () => (
  <div className="w-full h-full min-h-[300px] flex items-center justify-center">
    <Spinner size="medium" label="Loading view..." />
  </div>
);

export function AppRoutes() {
  const { isAdmin } = useAuth();

  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* 1. Guest-only routes */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginForm />} />
        </Route>

        {/* 2. Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={
              <DashboardLayout>
                <Outlet />
              </DashboardLayout>
            }
          >
            {/* Redirect /dashboard directly to /dashboard/overview */}
            <Route index element={<Navigate to="overview" replace />} />

            {/* Overview / Dashboard Home */}
            <Route path="overview" element={<EmployeeDashboard />} />

            {/* Role-gated Employee Directory */}
            <Route element={<RoleProtectedRoute isAllowed={isAdmin} fallbackPath="/dashboard/attendance" />}>
              <Route path="employees" element={<EmployeesPage />} />
            </Route>

            <Route path="attendance" element={<AttendanceManagement isAdmin={isAdmin} />} />
            <Route path="leaves" element={<LeaveManagement isAdmin={isAdmin} />} />
            <Route path="payslips" element={<PayslipManagement isAdmin={isAdmin} />} />
          </Route>
        </Route>

        {/* 3. Global catch-all routes */}
        <Route path="/" element={<Navigate to="/dashboard/overview" replace />} />
        <Route path="*" element={<Navigate to="/dashboard/overview" replace />} />
      </Routes>
    </Suspense>
  );
}