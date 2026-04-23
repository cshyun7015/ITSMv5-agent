import React, { useState, useEffect } from 'react';
import './styles/global.css';
import { AuthProvider, useAuth } from './features/auth/context/AuthContext';
import LoginPage from './features/auth/components/LoginPage';
import CodeManagement from './features/code/components/CodeManagement';
import RequestList from './features/requests/components/RequestList';
import RequestDetail from './features/requests/components/RequestDetail';
import IncidentBoard from './features/incident/components/IncidentBoard';
import IncidentDetail from './features/incident/components/IncidentDetail';
import OperatorDashboard from './features/dashboard/components/OperatorDashboard';
import AdminDashboard from './features/dashboard/components/AdminDashboard';
import CatalogManagement from './features/catalog/components/CatalogManagement';
import ChangeBoard from './features/change/components/ChangeBoard';
import CIList from './features/cmdb/components/CIList';
import OperatorManagement from './features/operator/components/OperatorManagement';
import UserManagement from './features/user/components/UserManagement';

const AdminCommandCenter: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'catalog' | 'cis' | 'changes' | 'codes' | 'requests' | 'incidents' | 'opers' | 'users'>('dashboard');
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState<number | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: '📈' },
    { id: 'catalog', label: 'Service Catalog', icon: '📋' },
    { id: 'requests', label: 'Requests', icon: '📩' },
    { id: 'incidents', label: 'Incidents', icon: '⚠️' },
    { id: 'changes', label: 'Changes', icon: '🔄' },
    { id: 'cis', label: 'CIs', icon: '📦' },
    { id: 'codes', label: 'Codes', icon: '🏷️' },
    { id: 'opers', label: 'Opers', icon: '👥' },
    { id: 'users', label: 'Users', icon: '👤' }
  ];

  return (
    <div className={`app-container sidebar-layout ${isCollapsed ? 'collapsed' : ''}`}>
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar__top">
          <div className="sidebar__logo">
            <div className="logo-icon">📊</div>
            {!isCollapsed && <span className="logo-text">ITSM (운영사)</span>}
          </div>
          <button className="collapse-toggle" onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? '»' : '«'}
          </button>
        </div>

        <nav className="sidebar__nav">
          {navLinks.map(item => (
            <button 
              key={item.id}
              id={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => { setActiveTab(item.id as any); setSelectedIncidentId(null); setSelectedRequestId(null); }}
              title={isCollapsed ? item.label : ''}
            >
              <span className="nav-icon">{item.icon}</span>
              {!isCollapsed && <span className="nav-label">{item.label}</span>}
              {activeTab === item.id && <div className="active-indicator" />}
            </button>
          ))}
        </nav>

        <div className="sidebar__footer">
          <div className="user-profile">
            <div className="user-avatar">👤</div>
            {!isCollapsed && (
              <div className="user-info">
                <span className="user-name">{user?.username}</span>
                <span className="user-role">Operations Specialist</span>
              </div>
            )}
          </div>
          <button className="logout-action" onClick={logout} title={isCollapsed ? 'Sign Out' : ''}>
            <span className="logout-icon">🚪</span>
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="workspace-panel">
          {activeTab === 'dashboard' ? (
            user?.roles.includes('ADMIN') ? (
              <AdminDashboard onNavigate={(tab) => {
                setActiveTab(tab as any);
                setSelectedIncidentId(null);
                setSelectedRequestId(null);
              }} />
            ) : (
              <OperatorDashboard onNavigate={(tab) => {
                setActiveTab(tab as any);
                setSelectedIncidentId(null);
                setSelectedRequestId(null);
              }} />
            )
          ) : activeTab === 'cis' ? (
            <CIList />
          ) : activeTab === 'catalog' ? (
            <CatalogManagement />
          ) : activeTab === 'changes' ? (
            <ChangeBoard />
          ) : activeTab === 'codes' ? (
            <CodeManagement />
          ) : activeTab === 'opers' ? (
            <OperatorManagement />
          ) : activeTab === 'users' ? (
            <UserManagement />
          ) : activeTab === 'requests' ? (
            <div className="requests-section">
              {selectedRequestId ? (
                <RequestDetail 
                  requestId={selectedRequestId} 
                  onBack={() => setSelectedRequestId(null)}
                  onSuccess={() => setSelectedRequestId(null)} 
                />
              ) : (
                <RequestList onSelectRequest={(id) => setSelectedRequestId(id)} />
              )}
            </div>
          ) : (
            <div className="incident-section">
              {selectedIncidentId ? (
                <IncidentDetail 
                  incidentId={selectedIncidentId} 
                  onBack={() => setSelectedIncidentId(null)}
                  onUpdated={() => {}}
                />
              ) : (
                <IncidentBoard onSelectIncident={(id) => setSelectedIncidentId(id)} />
              )}
            </div>
          )}
        </div>
      </main>

      <style>{`
        .app-container.sidebar-layout {
          display: flex;
          flex-direction: row;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          background: #020617;
        }

        .sidebar {
          width: 260px;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(20px);
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 100;
          position: relative;
        }

        .sidebar.collapsed {
          width: 80px;
        }

        .sidebar__top {
          padding: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          min-height: 80px;
        }

        .sidebar__logo {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #fff;
          font-weight: 800;
          font-size: 18px;
          white-space: nowrap;
          overflow: hidden;
        }

        .logo-icon {
          font-size: 24px;
          flex-shrink: 0;
        }

        .collapse-toggle {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.2s;
        }
        .collapse-toggle:hover {
          background: #3b82f6;
          color: #fff;
          border-color: #3b82f6;
        }

        .sidebar__nav {
          flex: 1;
          padding: 16px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          overflow-y: auto;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border: none;
          background: transparent;
          color: #94a3b8;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          white-space: nowrap;
          text-align: left;
          width: 100%;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.03);
          color: #fff;
        }

        .nav-item.active {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .nav-icon {
          font-size: 20px;
          width: 32px;
          display: flex;
          justify-content: center;
          flex-shrink: 0;
        }

        .nav-label {
          font-size: 14px;
          font-weight: 600;
          flex: 1;
        }

        .active-indicator {
          width: 4px;
          height: 20px;
          background: #3b82f6;
          border-radius: 2px;
          position: absolute;
          right: 0;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }

        .sidebar__footer {
          padding: 20px 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.03);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 12px;
          overflow: hidden;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          background: #1e293b;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .user-name {
          font-size: 13px;
          font-weight: 700;
          color: #f8fafc;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-role {
          font-size: 10px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .logout-action {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: rgba(244, 63, 94, 0.05);
          border: 1px solid rgba(244, 63, 94, 0.1);
          color: #fb7185;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 700;
          font-size: 13px;
          transition: all 0.2s;
        }

        .logout-action:hover {
          background: #f43f5e;
          color: #fff;
        }

        .logout-icon {
          font-size: 18px;
          width: 32px;
          display: flex;
          justify-content: center;
          flex-shrink: 0;
        }

        .main-content {
          flex: 1;
          height: 100vh;
          overflow-y: auto;
          background: #020617;
          background-image: 
            radial-gradient(at 0% 0%, rgba(30, 58, 138, 0.15) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(88, 28, 135, 0.15) 0px, transparent 50%);
        }

        .workspace-panel {
          padding: 40px;
          max-width: 1600px;
          margin: 0 auto;
        }

        .sidebar.collapsed .sidebar__top {
          justify-content: center;
          padding: 24px 0;
        }
        .sidebar.collapsed .collapse-toggle {
          position: absolute;
          right: -14px;
          top: 26px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.5);
        }
      `}</style>
    </div>
  );
};

const AuthWrapper: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <AdminCommandCenter /> : <LoginPage />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AuthWrapper />
    </AuthProvider>
  );
};

export default App;
