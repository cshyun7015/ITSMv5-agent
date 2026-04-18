import React, { useState, useEffect } from 'react';
import './styles/global.css';
import { AuthProvider, useAuth } from './features/auth/context/AuthContext';
import LoginPage from './features/auth/components/LoginPage';
import CodeManagement from './features/code/components/CodeManagement';
import FulfillmentList from './features/fulfillment/components/FulfillmentList';
import FulfillmentDetail from './features/fulfillment/components/FulfillmentDetail';
import IncidentBoard from './features/incident/components/IncidentBoard';
import IncidentDetail from './features/incident/components/IncidentDetail';
import DashboardPage from './features/dashboard/components/DashboardPage';
import CatalogManagement from './features/catalog/components/CatalogManagement';
import ChangeBoard from './features/change/components/ChangeBoard';
import { codeApi } from './features/code/api/codeApi';
import { CodeDTO } from './features/fulfillment/types';

const AdminCommandCenter: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'catalog' | 'changes' | 'codes' | 'fulfillment' | 'incidents'>('dashboard');
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState<number | null>(null);

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
            { id: 'catalog', label: 'Service Catalog', icon: '📋' },
            { id: 'changes', label: 'Changes', icon: '🔄' },
            { id: 'incidents', label: 'Incidents', icon: '⚠️' },
            { id: 'fulfillment', label: 'Requests', icon: '📩' },
            { id: 'codes', label: 'Codes', icon: '🏷️' }
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
          ) : activeTab === 'catalog' ? (
            <CatalogManagement />
          ) : activeTab === 'changes' ? (
            <ChangeBoard />
          ) : activeTab === 'codes' ? (
            <CodeManagement />
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
