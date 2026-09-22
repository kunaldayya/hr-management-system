import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { LoginForm } from "../pages/Login/Login";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { EmployeesPage } from "../pages/Employee";
import ProtectedRoute from "./ProtectedRoute";
import { GuestRoute } from "./GuestRoute";
import { LeaveManagement } from "../pages/LeaveManagement";
import { PayslipManagement } from "../pages/PayslipManagement";

export function AppRoutes() {
  const isAdmin = true;

  return (
    <Routes>
      {/* 1. Guest-only routes (Redirects to /dashboard if logged in) */}
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
          <Route index element={<EmployeesPage />} />
          <Route path="employees" element={<EmployeesPage />} />
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