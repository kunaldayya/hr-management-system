import { Navigate, Outlet } from 'react-router-dom';
import { Spinner } from '@fluentui/react-components';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center bg-slate-50">
        <Spinner size="large" label="Authenticating session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}