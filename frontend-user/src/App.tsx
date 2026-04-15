import React from 'react';
import { AuthProvider, useAuth } from './features/auth/context/AuthContext';
import LoginPage from './features/auth/components/LoginPage';

/**
 * ITSM Service Portal - User Experience
 * Concept: Lite / Clean / Intuitive
 */
import RequestList from './features/service-request/components/RequestList';
import RequestForm from './features/service-request/components/RequestForm';
import RequestDetail from './features/service-request/components/RequestDetail';
import ApprovalList from './features/service-request/components/ApprovalList';
import DashboardPage from './features/dashboard/components/DashboardPage';
import { requestApi } from './api/request';
import { ServiceRequest, ServiceRequestDTO } from './types/request';
import CatalogBrowser from './features/service-catalog/components/CatalogBrowser';
import { CatalogItem } from './features/service-catalog/api/catalogApi';

/**
 * ITSM Service Portal - User Experience
 * View Controller for Service Requests
 */
const ServicePortal: React.FC = () => {
  const { user, logout } = useAuth();
  const [view, setView] = React.useState<'dashboard' | 'catalog' | 'list' | 'create' | 'detail' | 'approvals'>('dashboard');
  const [selectedRequestId, setSelectedRequestId] = React.useState<number | null>(null);
  const [selectedCatalogItem, setSelectedCatalogItem] = React.useState<CatalogItem | null>(null);
  const [requests, setRequests] = React.useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const isManager = user?.roles.includes('ROLE_MANAGER');

  React.useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const data = await requestApi.getRequests();
      setRequests(data);
    } catch (error) {
      console.error('Failed to load requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDraft = async (data: ServiceRequestDTO) => {
    setIsLoading(true);
    try {
      await requestApi.createDraft(data);
      await loadRequests();
      setView('list');
    } catch (error) {
      alert('Failed to create draft');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRequest = (id: number) => {
    setSelectedRequestId(id);
    setView('detail');
  };

  const handleSelectCatalogItem = (item: CatalogItem) => {
    setSelectedCatalogItem(item);
    setView('create');
  };

  return (
    <div className="portal">
      <header className="portal-header">
        <div className="portal-container">
          <div className="header-content">
            <h1 className="logo" onClick={() => setView('list')} style={{ cursor: 'pointer' }}>
              ITSM<span>Portal</span>
            </h1>
            <nav className="nav">
              <button 
                className={`nav-item ${view === 'dashboard' ? 'active' : ''}`}
                onClick={() => setView('dashboard')}
              >
                Dashboard
              </button>
              <button 
                className={`nav-item ${view === 'catalog' || view === 'create' ? 'active' : ''}`}
                onClick={() => setView('catalog')}
              >
                Service Catalog
              </button>
              <button 
                className={`nav-item ${view === 'list' || view === 'detail' ? 'active' : ''}`}
                onClick={() => setView('list')}
              >
                My Requests
              </button>
              {isManager && (
                <button 
                  className={`nav-item ${view === 'approvals' ? 'active' : ''}`}
                  onClick={() => setView('approvals')}
                >
                  Pending Approvals
                </button>
              )}
            </nav>
            <div className="user-profile">
              <div className="user-info">
                <span className="tenant-tag">{user?.tenantId}</span>
                <span className="username">{user?.username}</span>
              </div>
              <button className="logout-btn-clean" onClick={logout}>Sign Out</button>
            </div>
          </div>
        </div>
      </header>

      <main className="portal-main portal-container">
        {view === 'dashboard' && (
          <DashboardPage />
        )}

        {view === 'list' && (
          <RequestList 
            requests={requests} 
            onSelect={handleSelectRequest} 
            onCreate={() => setView('catalog')} 
          />
        )}

        {view === 'catalog' && (
          <CatalogBrowser onSelectItem={handleSelectCatalogItem} />
        )}

        {view === 'create' && selectedCatalogItem && (
          <RequestForm 
            catalogItem={selectedCatalogItem}
            onSubmit={handleCreateDraft} 
            onCancel={() => setView('catalog')} 
            isLoading={isLoading}
          />
        )}

        {view === 'detail' && selectedRequestId && (
          <RequestDetail 
            requestId={selectedRequestId} 
            onBack={() => setView('list')}
            onRefresh={loadRequests}
          />
        )}

        {view === 'approvals' && (
          <ApprovalList 
            onSelect={handleSelectRequest}
          />
        )}
      </main>

      <style>{`
        :root {
          --color-primary: #3b82f6;
          --color-primary-hover: #2563eb;
          --color-surface: #ffffff;
          --color-border: #e2e8f0;
          --color-text-main: #1e293b;
          --color-text-dim: #64748b;
          --radius-md: 8px;
          --radius-lg: 12px;
        }
        .portal-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        .portal-header {
          background: var(--color-surface);
          border-bottom: 1px solid var(--color-border);
          padding: 16px 0;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .logo {
          font-size: 20px;
          font-weight: 600;
          color: var(--color-primary);
        }
        .logo span {
          color: var(--color-text-main);
        }
        .nav {
          display: flex;
          gap: 32px;
        }
        .nav-item {
          background: none;
          color: var(--color-text-dim);
          font-weight: 500;
          padding: 8px 0;
          position: relative;
          cursor: pointer;
          border: none;
        }
        .nav-item.active {
          color: var(--color-primary);
        }
        .nav-item.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: var(--color-primary);
          border-radius: 2px;
        }
        .user-profile {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
        }
        .tenant-tag {
          font-size: 10px;
          font-weight: 700;
          color: var(--color-primary);
          background: #eff6ff;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
        }
        .username {
          font-size: 14px;
          font-weight: 500;
          color: var(--color-text-main);
        }
        .logout-btn-clean {
          background: #f1f5f9;
          color: var(--color-text-dim);
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          border: none;
          cursor: pointer;
        }
        .logout-btn-clean:hover {
          background: #fee2e2;
          color: #ef4444;
        }

        .portal-main {
          margin-top: 48px;
          padding-bottom: 80px;
        }

        .btn-primary {
          background: var(--color-primary);
          color: #fff;
          padding: 10px 20px;
          border-radius: var(--radius-md);
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-primary:hover {
          background: var(--color-primary-hover);
          transform: translateY(-1px);
        }
        .btn-primary:disabled {
          background: #94a3b8;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

const AuthWrapper: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <ServicePortal /> : <LoginPage />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AuthWrapper />
    </AuthProvider>
  );
};

export default App;
