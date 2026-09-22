import { Navigate, Outlet } from "react-router-dom";
import { useGetApiAuthMe } from "../api/generated/auth/auth"; 

export default function ProtectedRoute() {
  const { data, isLoading, isError } = useGetApiAuthMe({
    query: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  });

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <div>Loading session...</div>
      </div>
    );
  }

  if (isError || !data) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}