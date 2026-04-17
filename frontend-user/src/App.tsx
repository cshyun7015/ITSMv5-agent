import React from 'react';
import { AuthProvider, useAuth } from './features/auth/context/AuthContext';
import LoginPage from './features/auth/components/LoginPage';

/**
 * ITSM Service Portal - User Experience
 * Concept: Lite / Clean / Intuitive / Premium
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
import { 
  LayoutDashboard, 
  BookOpen, 
  ClipboardList, 
  ShieldCheck, 
  LogOut, 
  Building2,
  Terminal
} from 'lucide-react';

import './styles/global.css';

/**
 * ITSM Service Portal - View Controller
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
            <div className="logo-section" onClick={() => setView('dashboard')} style={{ cursor: 'pointer' }}>
               <div className="logo-icon-wrapper">
                 <Terminal size={18} />
               </div>
               <h1 className="logo">
                ITSM<span>Portal</span>
               </h1>
            </div>
            
            <nav className="nav">
              <button 
                className={`nav-item ${view === 'dashboard' ? 'active' : ''}`}
                onClick={() => setView('dashboard')}
              >
                <LayoutDashboard size={18} />
                Dashboard
              </button>
              <button 
                className={`nav-item ${view === 'catalog' || view === 'create' ? 'active' : ''}`}
                onClick={() => setView('catalog')}
              >
                <BookOpen size={18} />
                Service Catalog
              </button>
              <button 
                className={`nav-item ${view === 'list' || view === 'detail' ? 'active' : ''}`}
                onClick={() => setView('list')}
              >
                <ClipboardList size={18} />
                My Requests
              </button>
              {isManager && (
                <button 
                  className={`nav-item ${view === 'approvals' ? 'active' : ''}`}
                  onClick={() => setView('approvals')}
                >
                  <ShieldCheck size={18} />
                  Approvals
                </button>
              )}
            </nav>

            <div className="user-profile">
              <div className="user-info">
                <div className="tenant-badge">
                   <Building2 size={12} />
                   <span>{user?.tenantId}</span>
                </div>
                <span className="username">{user?.username}</span>
              </div>
              <button className="logout-btn-premium" onClick={logout}>
                <LogOut size={16} />
                Sign Out
              </button>
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
        .portal-header {
          background: var(--color-surface);
          border-bottom: 1px solid var(--color-border);
          padding: 12px 0;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: var(--shadow-sm);
        }
        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .logo-section { display: flex; align-items: center; gap: 12px; }
        .logo-icon-wrapper { 
          background: var(--color-primary); color: #fff; 
          width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
          border-radius: 8px; box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
        }
        .logo { font-size: 19px; font-weight: 800; color: var(--color-primary); margin: 0; letter-spacing: -0.5px; }
        .logo span { color: var(--color-text-main); }
        
        .nav { display: flex; gap: 32px; flex: 1; justify-content: center; }
        .nav-item {
          background: none; border: none;
          color: var(--color-text-dim);
          font-weight: 600;
          padding: 12px 0;
          position: relative;
          cursor: pointer;
          font-size: 14px;
          display: flex; align-items: center; gap: 8px;
          transition: var(--transition);
        }
        .nav-item:hover { color: var(--color-primary); }
        .nav-item.active { color: var(--color-primary); }
        .nav-item.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          height: 3px;
          background: var(--color-primary);
          border-radius: 4px;
          animation: scaleX 0.3s ease;
        }
        @keyframes scaleX { from { transform: scaleX(0); } to { transform: scaleX(1); } }

        .user-profile { display: flex; align-items: center; gap: 24px; }
        .user-info { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
        .tenant-badge {
          font-size: 10px; font-weight: 800; color: var(--color-primary);
          background: var(--color-primary-soft);
          padding: 3px 8px; border-radius: 20px;
          text-transform: uppercase; display: flex; align-items: center; gap: 4px;
        }
        .username { font-size: 14px; font-weight: 700; color: var(--color-text-main); }
        
        .logout-btn-premium {
          background: var(--color-surface-soft);
          color: var(--color-text-dim);
          padding: 8px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          border: 1px solid var(--color-border);
          cursor: pointer;
          display: flex; align-items: center; gap: 8px;
        }
        .logout-btn-premium:hover {
          background: #fee2e2;
          border-color: #fecaca;
          color: #ef4444;
        }

        .portal-main { margin-top: 56px; padding-bottom: 80px; }
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
