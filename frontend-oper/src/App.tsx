import React, { useState } from 'react';
import './styles/global.css';
import { AuthProvider, useAuth } from './features/auth/context/AuthContext';
import LoginPage from './features/auth/components/LoginPage';
import CodeList from './features/code/components/CodeList';
import CodeDrawer from './features/code/components/CodeDrawer';

const MOCK_CODES = [
  { id: 1, groupId: 'TICKET_PRIORITY', codeId: 'P1', codeName: 'Critical', isActive: true },
  { id: 2, groupId: 'TICKET_PRIORITY', codeId: 'P2', codeName: 'High', isActive: true },
  { id: 3, groupId: 'TICKET_PRIORITY', codeId: 'P3', codeName: 'Normal', isActive: true },
  { id: 4, groupId: 'SERVICE_TYPE', codeId: 'REQ', codeName: 'Service Request', isActive: true },
];

const AdminCommandCenter: React.FC = () => {
  const { user, logout } = useAuth();
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
        <h1 className="header__title">MSP Admin Command Center</h1>
        <div className="header__actions">
          <span className="user-info">{user?.username} (MSP)</span>
          <button className="logout-btn" onClick={logout}>Sign Out</button>
          <button className="header__button" onClick={handleAdd}>
            + Add New Code
          </button>
        </div>
      </header>

      <main className="main-content">
        <section className="glass-panel code-manager">
          <div className="code-manager__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h2 className="code-manager__title" style={{ margin: 0 }}>System Codes</h2>
          </div>
          
          <CodeList codes={MOCK_CODES} onEdit={handleEdit} />
        </section>
      </main>

      <CodeDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setDrawerOpen(false)} 
        title={selectedCode ? 'Edit Code' : 'Create New Code'} 
      />
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
