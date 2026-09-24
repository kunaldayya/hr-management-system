import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

interface RoleProtectedRouteProps {
  isAllowed: boolean;
  fallbackPath: string;
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ isAllowed, fallbackPath }) => {
  if (!isAllowed) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <Outlet />;
};