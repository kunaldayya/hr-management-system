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
  Navigation24Regular,
  Dismiss24Regular,
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
  const [mobileOpen, setMobileOpen] = useState(false);

  // Retrieving user from useAuth API
  const { user, userRole, isAdmin, isLoading } = useAuth();
  const logoutMutation = usePostApiAuthLogout();

  // FORMATTING: Capitalize ONLY the first letter of the name
  const rawName = user?.email?.split('@')[0] || 'User';
  const userName = rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase();
  
  const visibleNavItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        queryClient.clear(); // Safely clears cached data
        navigate('/login', { replace: true });
      },
    });
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileOpen(false); // Close mobile drawer when user picks a menu item
  };

  return (
    <div className="h-screen w-full bg-slate-100 text-slate-800 flex overflow-hidden font-sans relative">
      
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar (Responsive Drawer on Mobile, Relative in Flow on Desktop) */}
      <aside
        className={`fixed md:static inset-y-0 left-0 flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out z-50 h-full ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${collapsed ? 'md:w-20' : 'md:w-64'} w-64`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0">
          <div className={`flex items-center gap-3 ${collapsed ? 'md:justify-center w-full' : ''}`}>
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500 text-white shrink-0 shadow-sm">
              <Building24Filled className="w-5 h-5" />
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="flex flex-col overflow-hidden">
                <span className="font-bold text-white leading-none">HR Hub</span>
                <span className="text-[11px] text-slate-400 font-medium mt-1 uppercase tracking-wider">Workspace</span>
              </div>
            )}
          </div>

          {/* Close button inside mobile menu */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <Dismiss24Regular className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          {(!collapsed || mobileOpen) && (
            <div className="px-3 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Menu
            </div>
          )}
          
          {visibleNavItems.map(({ key, label, path, icon: Icon }) => {
            const isActive = pathname.startsWith(path);
            const isCollapsedDesktop = collapsed && !mobileOpen;
            
            const navBtn = (
              <button
                key={key}
                onClick={() => handleNavClick(path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 shrink-0 ${
                  isActive
                    ? 'bg-indigo-500/15 text-indigo-400'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                } ${isCollapsedDesktop ? 'justify-center px-0' : ''}`}
              >
                <Icon 
                  className={`w-5 h-5 shrink-0 ${
                    isActive ? 'text-indigo-400' : 'text-slate-400'
                  }`} 
                />
                {!isCollapsedDesktop && <span className="truncate">{label}</span>}
              </button>
            );

            return isCollapsedDesktop ? (
              <Tooltip key={key} content={label} relationship="label" positioning="after">
                {navBtn}
              </Tooltip>
            ) : (
              navBtn
            );
          })}
        </nav>

        {/* User Profile & Collapse Toggle */}
        <div className="p-3 border-t border-slate-800 shrink-0">
          {/* User Info Card */}
          {(!collapsed || mobileOpen) && (
            <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <Avatar name={userName} size={32} color="colorful" className="shrink-0" />
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold text-slate-100 truncate">
                  {isLoading ? 'Loading...' : userName}
                </span>
                <span className="text-xs text-slate-400 capitalize truncate">
                  {isLoading ? '...' : userRole ?? 'Employee'}
                </span>
              </div>
            </div>
          )}

          {/* Desktop Only Collapse Toggle */}
          <button
            onClick={() => setCollapsed((prev) => !prev)}
            className={`hidden md:flex w-full items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors ${
              collapsed ? 'justify-center px-0' : ''
            }`}
          >
            {collapsed ? <PanelLeftExpand24Regular /> : <PanelLeftContract24Regular />}
            {!collapsed && <span>Collapse Sidebar</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
        
        {/* Top Header Navigation */}
        <header className="h-16 px-4 sm:px-8 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            {/* 3-Line Mobile Sidebar Toggle Button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none"
              aria-label="Open Navigation Menu"
            >
              <Navigation24Regular className="w-6 h-6" />
            </button>

            {/* Welcome Heading */}
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight truncate">
              Welcome, <span className="text-indigo-600">{isLoading ? 'Loading...' : userName}</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Notification Bell */}
            <button className="p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors relative">
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
              <Alert24Regular />
            </button>

            {/* Profile Dropdown */}
            <Menu>
              <MenuTrigger disableButtonEnhancement>
                <button className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
                  <Avatar name={userName} size={32} color="colorful" />
                </button>
              </MenuTrigger>
              <MenuPopover className="shadow-xl rounded-2xl border border-slate-100 p-1.5 min-w-[180px]">
                <MenuList>
                  <MenuItem icon={<Person24Regular />} className="rounded-xl">My Profile</MenuItem>
                  <div className="h-px bg-slate-100 my-1 mx-2" />
                  <MenuItem
                    icon={<SignOutRegular className="text-rose-500" />}
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  >
                    {logoutMutation.isPending ? 'Logging out...' : 'Log out'}
                  </MenuItem>
                </MenuList>
              </MenuPopover>
            </Menu>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};