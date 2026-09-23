import { Navigate, Outlet } from "react-router-dom";
import { Spinner } from "@fluentui/react-components";
import { useGetApiAuthMe } from "../api/generated/auth/auth";

export default function ProtectedRoute() {
  const { data, isLoading, isError } = useGetApiAuthMe({
    query: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  });

  if (isLoading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}
        className="bg-slate-100"
      >
        <Spinner size="large" label="Loading session..." />
      </div>
    );
  }

  // Extract user from wrapped response
  const user = (data as any)?.data ?? data;

  // Not authenticated — redirect to login
  if (isError || !user?.email) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}