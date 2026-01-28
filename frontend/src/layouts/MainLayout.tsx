import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Topbar } from '../components/common/Topbar';
import { ConnectionStatus } from '../components/common/ConnectionStatus';

const MainLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const userRole = (localStorage.getItem('userRole') as 'admin_platform' | 'owner' | 'user') || 'user';
  const userName = localStorage.getItem('userName') || 'Usuário';

  return (
    <div className="main-layout">
      <Sidebar 
        userRole={userRole}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onCollapseChange={setSidebarCollapsed}
      />
      
      <Topbar
        userRole={userRole}
        userName={userName}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        showMenuButton={isMobile}
      />
      
      <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <main className="main-body">
          <Outlet />
        </main>
      </div>

      <style>{`
        .main-layout {
          display: flex;
          min-height: 100vh;
          background: var(--color-background, #fafafa);
          width: 100%;
          overflow-x: hidden;
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          margin-left: 280px;
          margin-top: 64px;
          transition: margin-left 0.3s ease;
          width: calc(100% - 280px);
          max-width: 100vw;
          overflow-x: hidden;
        }

        .main-content.sidebar-collapsed {
          margin-left: 80px;
          width: calc(100% - 80px);
        }

        @media (max-width: 767px) {
          .main-content {
            margin-left: 0 !important;
            width: 100% !important;
            max-width: 100vw;
          }
        }

        .main-body {
          flex: 1;
          overflow-x: hidden;
          overflow-y: auto;
          padding: 1rem;
          max-width: 100%;
        }

        @media (min-width: 768px) {
          .main-body {
            padding: 1.5rem;
          }
        }

        @media (min-width: 1024px) {
          .main-body {
            padding: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default MainLayout;
