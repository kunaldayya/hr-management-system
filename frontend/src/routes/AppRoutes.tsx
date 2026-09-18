import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { LoginForm } from "../features/auth/pages/Login";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginForm />} />
      <Route path="/dashboard" element={<div>Welcome to Dashboard</div>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};