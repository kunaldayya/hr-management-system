import React, { createContext, useContext, useMemo } from 'react';
import { useGetApiAuthMe } from '../api/generated/auth/auth';
import { type UserDto, isAdminOrHR } from '../types/auth';

interface AuthContextType {
  user: UserDto | null;
  userRole?: string;
  isAdmin: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: meResponse, isLoading, isError } = useGetApiAuthMe({
    query: {
      retry: false,
      staleTime: 1000 * 60 * 5, 
      gcTime: 0,
    },
  });

  // Safe extraction resolving union type error
  const user = ((meResponse as any)?.data ?? meResponse) as UserDto | undefined;

  const userRole = user?.role ?? (Array.isArray(user?.roles) ? user.roles[0] : undefined);
  const isAdmin = isAdminOrHR(userRole);
  const isAuthenticated = !isError && Boolean(user?.email);

  const value = useMemo(
    () => ({
      user: user ?? null,
      userRole,
      isAdmin,
      isLoading,
      isAuthenticated,
    }),
    [user, userRole, isAdmin, isLoading, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};