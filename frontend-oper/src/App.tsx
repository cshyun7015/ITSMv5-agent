import React, { useState } from 'react';
import './styles/global.css';
import { AuthProvider, useAuth } from './features/auth/context/AuthContext';
import LoginPage from './features/auth/components/LoginPage';
import CodeList from './features/code/components/CodeList';
import CodeDrawer from './features/code/components/CodeDrawer';
import FulfillmentList from './features/fulfillment/components/FulfillmentList';
import FulfillmentDetail from './features/fulfillment/components/FulfillmentDetail';
import IncidentBoard from './features/incident/components/IncidentBoard';
import IncidentDetail from './features/incident/components/IncidentDetail';
import DashboardPage from './features/dashboard/components/DashboardPage';

const MOCK_CODES = [
  { id: 1, groupId: 'TICKET_PRIORITY', codeId: 'P1', codeName: 'Critical', isActive: true },
  { id: 2, groupId: 'TICKET_PRIORITY', codeId: 'P2', codeName: 'High', isActive: true },
  { id: 3, groupId: 'TICKET_PRIORITY', codeId: 'P3', codeName: 'Normal', isActive: true },
  { id: 4, groupId: 'SERVICE_TYPE', codeId: 'REQ', codeName: 'Service Request', isActive: true },
];

const AdminCommandCenter: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'codes' | 'fulfillment' | 'incidents'>('dashboard');
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState<number | null>(null);

  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<any>(null);

  const handleEdit = (code: any) => {
    setSelectedCode(code);
    setDrawerOpen(true);
  };

  const handleAdd = () => {
    setSelectedCode(null);
    setDrawerOpen(true);
  };

  return (
    <div className="app-container">
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
          <h1 className="header__title">MSP Operator Portal</h1>
          <nav className="header__nav">
            <button 
              className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </button>
            <button 
              className={`nav-link ${activeTab === 'incidents' ? 'active' : ''}`}
              onClick={() => { setActiveTab('incidents'); setSelectedIncidentId(null); }}
            >
              Incidents
            </button>
            <button 
              className={`nav-link ${activeTab === 'fulfillment' ? 'active' : ''}`}
              onClick={() => { setActiveTab('fulfillment'); setSelectedRequestId(null); }}
            >
              Fulfillment
            </button>
            <button 
              className={`nav-link ${activeTab === 'codes' ? 'active' : ''}`}
              onClick={() => { setActiveTab('codes'); setSelectedCode(null); }}
            >
              System Codes
            </button>
          </nav>
        </div>
        <div className="header__actions">
          <span className="user-info">{user?.username} (MSP)</span>
          <button className="logout-btn" onClick={logout}>Sign Out</button>
          {activeTab === 'codes' && (
            <button className="header__button" onClick={handleAdd}>
              + Add New Code
            </button>
          )}
        </div>
      </header>

      <main className="main-content">
        {activeTab === 'dashboard' ? (
          <DashboardPage />
        ) : activeTab === 'codes' ? (
          <section className="glass-panel code-manager">
            <div className="code-manager__header">
              <h2 className="code-manager__title">System Codes</h2>
            </div>
            <CodeList codes={MOCK_CODES} onEdit={handleEdit} />
          </section>
        ) : activeTab === 'fulfillment' ? (
          <section className="glass-panel fulfillment-section">
            {selectedRequestId ? (
              <FulfillmentDetail 
                requestId={selectedRequestId} 
                onBack={() => setSelectedRequestId(null)}
                onUpdated={() => {}} 
              />
            ) : (
              <FulfillmentList onSelectRequest={(id) => setSelectedRequestId(id)} />
            )}
          </section>
        ) : (
          <section className="glass-panel incident-section">
            {selectedIncidentId ? (
              <IncidentDetail 
                incidentId={selectedIncidentId} 
                onBack={() => setSelectedIncidentId(null)}
                onUpdated={() => {}}
              />
            ) : (
              <IncidentBoard onSelectIncident={(id) => setSelectedIncidentId(id)} />
            )}
          </section>
        )}
      </main>

      <CodeDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setDrawerOpen(false)} 
        title={selectedCode ? 'Edit Code' : 'Create New Code'} 
      />

      <style>{`
        .header__nav {
          display: flex;
          gap: 20px;
        }
        .nav-link {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          font-weight: 600;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 6px;
          transition: all 0.2s;
        }
        .nav-link:hover {
          color: white;
          background: rgba(255, 255, 255, 0.1);
        }
        .nav-link.active {
          color: white;
          background: rgba(255, 255, 255, 0.15);
        }
        
        .fulfillment-container { padding: 8px; }
        .fulfillment-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .ticket-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
        .ticket-card { 
          background: rgba(255, 255, 255, 0.05); 
          border: 1px solid rgba(255, 255, 255, 0.1); 
          border-radius: 12px; p
          padding: 20px; 
          cursor: pointer; 
          transition: transform 0.2s;
        }
        .ticket-card:hover { transform: translateY(-4px); background: rgba(255, 255, 255, 0.08); }
        .ticket-id { font-size: 12px; color: rgba(255, 255, 255, 0.4); margin-bottom: 8px; }
        .ticket-status { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 700; margin-bottom: 12px; }
        .badge-open { background: #3b82f6; color: white; }
        .badge-progress { background: #f59e0b; color: white; }
        .badge-resolved { background: #10b981; color: white; }
        
        .fulfillment-detail .back-btn { background: none; border: none; color: #3b82f6; cursor: pointer; margin-bottom: 20px; }
        .detail-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 32px; }
        .content-box { background: rgba(255, 255, 255, 0.03); padding: 16px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05); margin-top: 8px; line-height: 1.6; }
        .info-section { margin-bottom: 32px; }
        .resolution-input { width: 100%; min-height: 120px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); color: white; padding: 12px; border-radius: 8px; margin-top: 8px; }
        
        .action-sidebar .card-box { background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; margin-bottom: 20px; }
        .actions button { width: 100%; padding: 12px; border-radius: 8px; font-weight: 700; margin-bottom: 12px; border: none; cursor: pointer; }
        .primary-btn { background: #3b82f6; color: white; }
        .success-btn { background: #10b981; color: white; }
        .dark-btn { background: #374151; color: white; }
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
