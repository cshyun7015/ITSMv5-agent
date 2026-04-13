import React, { useState } from 'react';
import './styles/global.css';
import CodeList from './features/code/components/CodeList';
import CodeDrawer from './features/code/components/CodeDrawer';

const MOCK_CODES = [
  { id: 1, groupId: 'TICKET_PRIORITY', codeId: 'P1', codeName: 'Critical', isActive: true },
  { id: 2, groupId: 'TICKET_PRIORITY', codeId: 'P2', codeName: 'High', isActive: true },
  { id: 3, groupId: 'TICKET_PRIORITY', codeId: 'P3', codeName: 'Normal', isActive: true },
  { id: 4, groupId: 'SERVICE_TYPE', codeId: 'REQ', codeName: 'Service Request', isActive: true },
];

const App: React.FC = () => {
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
        <p className="header__subtitle">Premium Developer Code Management System</p>
      </header>

      <main className="main-content">
        <section className="glass-panel code-manager">
          <div className="code-manager__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h2 className="code-manager__title" style={{ margin: 0 }}>System Codes</h2>
            <button className="btn-primary" onClick={handleAdd}>Add New Code</button>
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

export default App;
