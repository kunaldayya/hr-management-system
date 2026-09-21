import React, { useState, useEffect, useCallback } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { LoginForm } from "../features/auth/pages/Login";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { EmployeesPage } from "../pages/Employee";

export const AppRoutes: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => Boolean(localStorage.getItem("accessToken"))
  );

  // Sync auth status across tabs/windows
  useEffect(() => {
    const checkAuth = () => setIsAuthenticated(Boolean(localStorage.getItem("accessToken")));
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const handleLoginSuccess = useCallback(() => {
    setIsAuthenticated(true);
    navigate("/dashboard", { replace: true });
  }, [navigate]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsAuthenticated(false);
    navigate("/login", { replace: true });
  }, [navigate]);

  return (
    <Routes>
      {/* Public Route */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginForm onLoginSuccess={handleLoginSuccess} />
          )
        }
      />

      {/* Protected Dashboard Routes */}
      <Route
        path="/dashboard/*"
        element={
          isAuthenticated ? (
            <DashboardLayout onLogout={handleLogout}>
              <Routes>
                <Route index element={<EmployeesPage />} />
                <Route path="employees" element={<EmployeesPage />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </DashboardLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Catch-all Fallback */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
      />
    </Routes>
  );
};