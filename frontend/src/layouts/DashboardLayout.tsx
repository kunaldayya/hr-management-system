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
  SignOutRegular,
  Alert24Regular,
  Building24Filled,
  Person24Regular,
  CalendarCheckmark24Regular,
  DocumentEdit24Regular,
  Clock24Regular,
  People24Regular,
  Dashboard20Regular,
  PanelLeftContract24Regular,
  PanelLeftExpand24Regular,
} from '@fluentui/react-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import { useAuth } from '../context/AuthContext';
import { usePostApiAuthLogout } from '../api/generated/auth/auth';

const NAV_ITEMS = [
  { key: 'overview', label: 'Dashboard', path: '/dashboard/overview', icon: Dashboard20Regular },
  { key: 'employees', label: 'Employees', path: '/dashboard/employees', icon: People24Regular, adminOnly: true },
  { key: 'attendance', label: 'Attendance', path: '/dashboard/attendance', icon: Clock24Regular },
  { key: 'leaves', label: 'Leaves', path: '/dashboard/leaves', icon: CalendarCheckmark24Regular },
  { key: 'payslips', label: 'Payslips', path: '/dashboard/payslips', icon: DocumentEdit24Regular },
];

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const queryClient = useQueryClient();
  const [collapsed, setCollapsed] = useState(false);

  const { user, userRole, isAdmin, isLoading } = useAuth();
  const logoutMutation = usePostApiAuthLogout();

  const userName = user?.email?.split('@')[0] || 'User';
  const visibleNavItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    queryClient.clear();
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        navigate('/login', { replace: true });
      },
    });
  };

  return (
    <div className="h-screen max-h-screen w-full bg-slate-100 text-slate-800 flex overflow-hidden font-sans antialiased box-border">
      {/* Sidebar */}
      <aside
        className={`relative z-20 flex flex-col justify-between bg-[#0B132B] text-slate-300 transition-all duration-300 ease-in-out select-none h-full ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="flex flex-col p-4 gap-4 overflow-hidden">
          {/* Brand Header */}
          <div className={`flex items-center gap-3 py-1 shrink-0 ${collapsed ? 'justify-center' : 'px-2'}`}>
            <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0 shadow-md shadow-blue-500/20">
              <Building24Filled />
            </div>
            {!collapsed && (
              <div className="flex flex-col whitespace-nowrap overflow-hidden">
                <span className="font-bold text-base text-white tracking-wide">HR MS</span>
                <span className="text-xs text-slate-400">Management System</span>
              </div>
            )}
          </div>

          {/* User Profile Card */}
          <div className={`rounded-xl bg-[#142042] border border-slate-800/80 flex items-center transition-all shrink-0 ${
            collapsed ? 'p-2 justify-center' : 'p-3 gap-3'
          }`}>
            <Tooltip content={collapsed ? `${userName} (${userRole})` : ''} positioning="after" relationship="label">
              <Avatar name={userName} size={36} color="brand" className="shrink-0" />
            </Tooltip>
            {!collapsed && (
              <div className="flex flex-col overflow-hidden whitespace-nowrap">
                <span className="text-sm font-semibold text-white truncate">
                  {isLoading ? 'Loading...' : userName}
                </span>
                <span className="text-xs text-slate-400 truncate capitalize">
                  {isLoading ? '...' : userRole ?? 'Employee'}
                </span>
              </div>
            )}
          </div>

          {!collapsed && (
            <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase px-2 -mb-2 shrink-0">
              Menu
            </span>
          )}

          {/* Nav List */}
          <nav className="flex flex-col gap-1 overflow-y-auto min-h-0">
            {visibleNavItems.map(({ key, label, path, icon: Icon }) => {
              const isActive = pathname.startsWith(path);
              const navBtn = (
                <button
                  key={key}
                  onClick={() => navigate(path)}
                  className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all group shrink-0 ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 font-semibold border-l-4 border-blue-500 rounded-l-none'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  } ${collapsed ? 'justify-center px-0' : ''}`}
                >
                  <Icon className={`shrink-0 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
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
        <div className="p-4 border-t border-slate-800/80 shrink-0">
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-slate-50">
        {/* Header Bar */}
        <header className="h-14 px-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-sm">
          <h1 className="text-slate-800 font-semibold text-base">
            Welcome, <span className="text-blue-600">{isLoading ? 'User' : userName}</span>
          </h1>

          <div className="flex items-center gap-3">
            <button
              className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              aria-label="Notifications"
            >
              <Alert24Regular />
            </button>

            <Menu>
              <MenuTrigger disableButtonEnhancement>
                <button className="rounded-full p-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                  <Avatar name={userName} size={32} color="brand" />
                </button>
              </MenuTrigger>
              <MenuPopover className="p-1 shadow-lg rounded-xl">
                <MenuList>
                  <MenuItem icon={<Person24Regular />}>Profile Settings</MenuItem>
                  <MenuItem
                    icon={<SignOutRegular className="text-red-500" />}
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                  >
                    {logoutMutation.isPending ? 'Logging out...' : 'Log out'}
                  </MenuItem>
                </MenuList>
              </MenuPopover>
            </Menu>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="flex-1 flex flex-col p-4 md:p-5 min-h-0 overflow-hidden bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
};