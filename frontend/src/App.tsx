import React, { Suspense } from "react";
import { Spinner } from "@fluentui/react-components";
import { AuthProvider } from "./context/AuthContext";
import { AppRoutes } from "./routes/AppRoutes";

const RouteFallback: React.FC = () => (
  <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
    <Spinner size="huge" label="Loading Application..." />
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<RouteFallback />}>
        <AppRoutes />
      </Suspense>
    </AuthProvider>
  );
}