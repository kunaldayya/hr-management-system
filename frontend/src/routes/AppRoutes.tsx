import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { LoginForm } from "../pages/Login/Login";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { EmployeesPage } from "../pages/Employee";
import ProtectedRoute from "./ProtectedRoute";
import { GuestRoute } from "./GuestRoute";
import { LeaveManagement } from "../pages/LeaveManagement";
import { PayslipManagement } from "../pages/PayslipManagement";
import { useGetApiAuthMe } from "../api/generated/auth/auth";

function isAdminOrHR(role?: string): boolean {
  if (!role) return false;
  const r = role.toLowerCase();
  return r === 'admin' || r === 'hr' || r === '1' || r === '2';
}

export function AppRoutes() {
  const { data: meResponse } = useGetApiAuthMe({
    query: {
      retry: false,
      staleTime: 30_000,
    },
  });

  const user = (meResponse as any)?.data ?? meResponse;
  const userRole: string | undefined =
    user?.role ?? (Array.isArray(user?.roles) ? user.roles[0] : undefined);
  const isAdmin = isAdminOrHR(userRole);

  return (
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
          <Route
            index
            element={
              isAdmin ? (
                <EmployeesPage />
              ) : (
                <Navigate to="/dashboard/leaves" replace />
              )
            }
          />
          <Route
            path="employees"
            element={
              isAdmin ? (
                <EmployeesPage />
              ) : (
                <Navigate to="/dashboard/leaves" replace />
              )
            }
          />
          <Route path="leaves" element={<LeaveManagement isAdmin={isAdmin} />} />
          <Route path="payslips" element={<PayslipManagement isAdmin={isAdmin} />} />

          {/* Catch-all for sub-routes */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>

      {/* 3. Default entry point */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}