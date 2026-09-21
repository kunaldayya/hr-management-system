import React, { useState } from 'react';
import {
  Avatar,
  Button,
  Input,
  Text,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
} from '@fluentui/react-components';
import {
  People24Regular,
  SignOutRegular,
  SearchRegular,
  Alert24Regular,
  Navigation24Regular,
  Building24Regular,
  Briefcase24Regular,
  ChartMultiple24Regular,
  Person24Regular,
} from '@fluentui/react-icons';

import styles from './DashboardLayout.module.css';

interface DashboardLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, onLogout }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'employees' | 'departments' | 'analytics'>('employees');

  return (
    <div className={styles.layoutRoot}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''}`}>
        <div>
          <div className={styles.brandContainer}>
            <div className={styles.brandLogo}>
              <Building24Regular />
            </div>
            {!collapsed && (
              <Text weight="bold" size={400} style={{ color: '#0f172a', whiteSpace: 'nowrap' }}>
                HR Portal
              </Text>
            )}
          </div>

          <nav className={styles.navGroup}>
            <div
              className={`${styles.navItem} ${activeTab === 'employees' ? styles.navItemActive : ''} ${
                collapsed ? styles.navItemCollapsed : ''
              }`}
              onClick={() => setActiveTab('employees')}
              title={collapsed ? 'Employees' : undefined}
            >
              <div className={styles.navIcon}>
                <People24Regular />
              </div>
              {!collapsed && <span>Employees</span>}
            </div>

            <div
              className={`${styles.navItem} ${activeTab === 'departments' ? styles.navItemActive : ''} ${
                collapsed ? styles.navItemCollapsed : ''
              }`}
              onClick={() => setActiveTab('departments')}
              title={collapsed ? 'Departments' : undefined}
            >
              <div className={styles.navIcon}>
                <Briefcase24Regular />
              </div>
              {!collapsed && <span>Departments</span>}
            </div>

            <div
              className={`${styles.navItem} ${activeTab === 'analytics' ? styles.navItemActive : ''} ${
                collapsed ? styles.navItemCollapsed : ''
              }`}
              onClick={() => setActiveTab('analytics')}
              title={collapsed ? 'Analytics' : undefined}
            >
              <div className={styles.navIcon}>
                <ChartMultiple24Regular />
              </div>
              {!collapsed && <span>Analytics</span>}
            </div>
          </nav>
        </div>

        {/* Bottom Toggle Button */}
        <Button
          appearance="subtle"
          icon={<Navigation24Regular />}
          onClick={() => setCollapsed((prev) => !prev)}
          className={`${styles.toggleButton} ${collapsed ? styles.toggleButtonCollapsed : ''}`}
          style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {!collapsed && 'Collapse'}
        </Button>
      </aside>

      {/* Main Content Area */}
      <div className={styles.mainContentWrapper}>
        <header className={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Input
              className={styles.searchBar}
              contentBefore={<SearchRegular />}
              placeholder="Search portal…"
            />
          </div>

          <div className={styles.headerActions}>
            <Button appearance="subtle" icon={<Alert24Regular />} aria-label="Notifications" />

            <Menu>
              <MenuTrigger disableButtonEnhancement>
                <Button appearance="transparent" style={{ padding: 0 }}>
                  <Avatar name="Admin User" color="brand" badge={{ status: 'available' }} />
                </Button>
              </MenuTrigger>
              <MenuPopover>
                <MenuList>
                  <MenuItem icon={<Person24Regular />}>Profile Settings</MenuItem>
                  <MenuItem icon={<SignOutRegular />} onClick={onLogout}>
                    Log out
                  </MenuItem>
                </MenuList>
              </MenuPopover>
            </Menu>
          </div>
        </header>

        <main className={styles.contentBody}>{children}</main>
      </div>
    </div>
  );
};