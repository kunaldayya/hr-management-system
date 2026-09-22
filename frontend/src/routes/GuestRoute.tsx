import { Navigate, Outlet } from "react-router-dom";
import { Spinner } from "@fluentui/react-components";
import { useGetApiAuthMe } from "../api/generated/auth/auth";

export function GuestRoute() {
  const { data: user, isLoading, isError } = useGetApiAuthMe({
    query: {
      retry: false,
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen w-screen flex justify-center items-center bg-[#070A13]">
        <Spinner size="large" label="Loading..." />
      </div>
    );
  }

  // If already authenticated, bypass login and redirect to dashboard
  if (user && !isError) {
    return <Navigate to="/dashboard" replace />;
  }

  // If not logged in, allow access to public routes
  return <Outlet />;
}