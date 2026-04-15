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
        <div className="header__logo">
          <div className="logo-icon">📊</div>
          <span>MSP COMMAND CENTER</span>
        </div>

        <nav className="header__nav">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📈' },
            { id: 'incidents', label: 'Incidents', icon: '⚠️' },
            { id: 'fulfillment', label: 'Fulfillment', icon: '🛠️' },
            { id: 'codes', label: 'System Codes', icon: '⚙️' }
          ].map(item => (
            <button 
              key={item.id}
              className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => { setActiveTab(item.id as any); setSelectedIncidentId(null); setSelectedRequestId(null); }}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="user-identity">
          <div className="user-badge">
            <span className="user-name">{user?.username}</span>
            <span className="user-role">Operations Specialist</span>
          </div>
          <div className="user-avatar">👤</div>
          <button className="logout-btn" onClick={logout}>Sign Out</button>
        </div>
      </header>

      <main className="main-content">
        <div className="workspace-panel">
          {activeTab === 'dashboard' ? (
            <DashboardPage />
          ) : activeTab === 'codes' ? (
            <div className="code-manager">
              <div className="code-manager__header">
                <h2 className="code-manager__title">System Code Configuration</h2>
                <button className="header__button" onClick={handleAdd}>
                  + Add New Code
                </button>
              </div>
              <CodeList codes={MOCK_CODES} onEdit={handleEdit} />
            </div>
          ) : activeTab === 'fulfillment' ? (
            <div className="fulfillment-section">
              {selectedRequestId ? (
                <FulfillmentDetail 
                  requestId={selectedRequestId} 
                  onBack={() => setSelectedRequestId(null)}
                  onUpdated={() => {}} 
                />
              ) : (
                <FulfillmentList onSelectRequest={(id) => setSelectedRequestId(id)} />
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

      <CodeDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setDrawerOpen(false)} 
        title={selectedCode ? 'Edit Code' : 'Create New Code'} 
      />

      <style>{`
        .app-container {
          display: flex;
          flex-direction: column;
        }
        
        .code-manager__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        
        .code-manager__title {
          font-size: 20px;
          font-weight: 700;
          color: #fff;
          margin: 0;
        }

        .header__button {
          background: var(--primary);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }

        /* Legacy fulfillment & incident styles integration */
        .fulfillment-container { padding: 8px; }
        /* ... existing styles preserved in global.css or below ... */
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
