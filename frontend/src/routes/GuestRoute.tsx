import { Navigate, Outlet } from "react-router-dom";
import { Spinner } from "@fluentui/react-components";
import { useGetApiAuthMe } from "../api/generated/auth/auth";

export function GuestRoute() {
  const { data, isLoading, isError } = useGetApiAuthMe({
    query: {
      retry: false,
      staleTime: 0,
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen w-screen flex justify-center items-center bg-slate-100">
        <Spinner size="large" label="Loading..." />
      </div>
    );
  }

  // Extract user from wrapped or unwrapped response
  const user = (data as any)?.data ?? data;

  // If authenticated and not in error state, redirect to dashboard
  if (!isError && user?.email) {
    return <Navigate to="/dashboard" replace />;
  }

  // Not logged in — allow access to guest routes (login page)
  return <Outlet />;
}