import React, { useState } from 'react';
import {
  Avatar,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  Tooltip,
} from '@fluentui/react-components';
import {
  People24Regular,
  SignOutRegular,
  Alert24Regular,
  Building24Filled,
  Person24Regular,
  CalendarCheckmark24Regular,
  DocumentEdit24Regular,
  PanelLeftContract24Regular,
  PanelLeftExpand24Regular,
} from '@fluentui/react-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

// Import the generated Orval auth hooks
import { useGetApiAuthMe, usePostApiAuthLogout } from '../api/generated/auth/auth';

const NAV_ITEMS = [
  { key: 'employees', label: 'Employees', path: '/dashboard/employees', icon: People24Regular },
  { key: 'leaves', label: 'Leaves', path: '/dashboard/leaves', icon: CalendarCheckmark24Regular },
  { key: 'payslips', label: 'Payslips', path: '/dashboard/payslips', icon: DocumentEdit24Regular },
];

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const queryClient = useQueryClient();
  const [collapsed, setCollapsed] = useState(false);

  // 1. Fetch current authenticated user details from API
  const { data: meResponse, isLoading: isUserLoading } = useGetApiAuthMe();

  // Extract user payload (handling wrapper if present)
  const user = (meResponse as any)?.data ?? meResponse;

  // Extract Name and Role dynamically with fallbacks
  const userName = user?.fullName || user?.name || user?.email || 'User';
  const rawRole: string = user?.role ?? (Array.isArray(user?.roles) ? user.roles[0] : 'Employee');
  const userRole = rawRole;
  const normalizedRole = String(rawRole).toLowerCase();
  const isAdmin = normalizedRole === 'admin' || normalizedRole === 'hr' || normalizedRole === '1' || normalizedRole === '2';

  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (item.key === 'employees') {
      return isAdmin;
    }
    return true;
  });

  const activeTab = visibleNavItems.find((item) => pathname.includes(item.path))?.key || (isAdmin ? 'employees' : 'leaves');

  const handleLogout = () => {
    // Always clean up client-side state immediately
    localStorage.removeItem('accessToken');
    queryClient.clear();
    // Fire logout to backend (revoke refresh token), then navigate regardless
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        navigate('/login', { replace: true });
      },
    });
  };

  const logoutMutation = usePostApiAuthLogout();

  return (
    <div className="min-h-screen w-full bg-slate-100 text-slate-800 flex overflow-hidden font-sans antialiased">
      {/* Sidebar */}
      <aside
        className={`relative z-20 flex flex-col justify-between bg-[#0B132B] text-slate-300 transition-[width] duration-200 ease-in-out overflow-hidden ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="flex flex-col p-4 gap-5">
          {/* Brand Header */}
          <div className={`flex items-center gap-3 py-1 ${collapsed ? 'justify-center' : ''}`}>
            <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0">
              <Building24Filled />
            </div>
            {!collapsed && (
              <div className="flex flex-col whitespace-nowrap overflow-hidden">
                <span className="font-bold text-base text-white tracking-wide">HR MS</span>
                <span className="text-xs text-slate-400">Management System</span>
              </div>
            )}
          </div>

          {/* User Badge - Updated with Dynamic Name & Role */}
          {!collapsed && (
            <div className="p-3 rounded-xl bg-[#142042] flex items-center gap-3 border border-slate-800/80">
              <Avatar name={userName} size={36} color="brand" />
              <div className="flex flex-col overflow-hidden whitespace-nowrap">
                <span className="text-sm font-semibold text-white truncate">
                  {isUserLoading ? 'Loading...' : userName}
                </span>
                <span className="text-xs text-slate-400 truncate">
                  {isUserLoading ? '...' : userRole}
                </span>
              </div>
            </div>
          )}

          {!collapsed && (
            <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase px-2 -mb-2">
              Navigation
            </span>
          )}

          {/* Nav List */}
          <nav className="flex flex-col gap-1">
            {visibleNavItems.map(({ key, label, path, icon: Icon }) => {
              const isActive = activeTab === key;
              const navBtn = (
                <button
                  key={key}
                  onClick={() => navigate(path)}
                  className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors group ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 font-semibold border-l-4 border-blue-500 rounded-l-none'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  } ${collapsed ? 'justify-center px-0' : ''}`}
                >
                  <Icon className={`shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  {!collapsed && <span className="truncate whitespace-nowrap">{label}</span>}
                </button>
              );

              return collapsed ? (
                <Tooltip key={key} content={label} relationship="label" positioning="after">
                  {navBtn}
                </Tooltip>
              ) : (
                navBtn
              );
            })}
          </nav>
        </div>

        {/* Footer Toggle Button */}
        <div className="p-4 border-t border-slate-800/80">
          <button
            onClick={() => setCollapsed((prev) => !prev)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors ${
              collapsed ? 'justify-center px-0' : 'justify-start'
            }`}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftExpand24Regular className="shrink-0" /> : <PanelLeftContract24Regular className="shrink-0" />}
            {!collapsed && <span className="font-medium text-sm whitespace-nowrap">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        {/* Header Bar */}
        <header className="h-16 px-8 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-sm">
          <h1 className="text-slate-800 font-semibold text-lg">
            Welcome,{' '}
            <span className="text-blue-600">
              {isUserLoading ? 'Loading...' : userName}
            </span>
          </h1>

          <div className="flex items-center gap-4">
            <button className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors" aria-label="Notifications">
              <Alert24Regular />
            </button>

            <Menu>
              <MenuTrigger disableButtonEnhancement>
                <button className="rounded-full p-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                  <Avatar name={userName} size={32} color="brand" />
                </button>
              </MenuTrigger>
              <MenuPopover className="!bg-white !border !border-slate-200 !rounded-xl !p-1.5 !shadow-lg">
                <MenuList>
                  <MenuItem icon={<Person24Regular className="text-slate-600" />} className="!rounded-lg hover:!bg-slate-100 !text-slate-700">
                    Profile Settings
                  </MenuItem>
                  <MenuItem
                    icon={<SignOutRegular className="text-red-500" />}
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="!rounded-lg hover:!bg-red-50 !text-red-600"
                  >
                    {logoutMutation.isPending ? 'Logging out...' : 'Log out'}
                  </MenuItem>
                </MenuList>
              </MenuPopover>
            </Menu>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-8 overflow-y-auto bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
};