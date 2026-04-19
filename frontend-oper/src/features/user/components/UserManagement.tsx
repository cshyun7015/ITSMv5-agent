import React, { useState, useEffect } from 'react';
import { customerApi, CustomerTenant, CustomerOrg } from '../api/customerApi';
import { Operator, Team } from '../../operator/types';
import CustomerTeamSidebar from './CustomerTeamSidebar';
import CustomerUserTable from './CustomerUserTable';
import CustomerUserDrawer from './CustomerUserDrawer';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { useAuth } from '../../auth/context/AuthContext';

const UserManagement: React.FC = () => {
  const { user } = useAuth();
  const canManage = user?.roles?.some(role => ['ROLE_ADMIN', 'ROLE_OPERATOR'].includes(role)) ?? false;

  const [users, setUsers] = useState<Operator[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [tenants, setTenants] = useState<CustomerTenant[]>([]);
  const [organizations, setOrganizations] = useState<CustomerOrg[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  
  // Modal visibility
  const [isUserDrawerOpen, setIsUserDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Operator | undefined>();
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | undefined>();
  const [teamForm, setTeamForm] = useState({ name: '', description: '', orgId: 0 });

  const [confirmConfig, setConfirmConfig] = useState({
      isOpen: false,
      title: '',
      message: '',
      onConfirm: () => {}
  });

  const loadInitialData = async () => {
      setIsLoading(true);
      try {
          const tenantData = await customerApi.getTenants();
          setTenants(tenantData);
          if (tenantData.length > 0) {
              setSelectedTenantId(tenantData[0].tenantId);
          }
      } catch (error) {
          console.error('Failed to load customers', error);
      } finally {
          setIsLoading(false);
      }
  };

  const loadTenantData = async (tenantId: string) => {
      setIsLoading(true);
      try {
          const [teamData, userData, orgData] = await Promise.all([
              customerApi.getTeams(tenantId),
              customerApi.getUsers(tenantId),
              customerApi.getOrganizations(tenantId)
          ]);
          setTeams(teamData);
          setUsers(userData);
          setOrganizations(orgData);
      } catch (error) {
          console.error('Failed to load tenant data', error);
      } finally {
          setIsLoading(false);
      }
  };

  useEffect(() => {
      loadInitialData();
  }, []);

  useEffect(() => {
      if (selectedTenantId) {
          loadTenantData(selectedTenantId);
      }
  }, [selectedTenantId]);

  const handleRefresh = () => selectedTenantId && loadTenantData(selectedTenantId);

  // User Actions
  const handleCreateUser = () => {
    setSelectedUser(undefined);
    setIsUserDrawerOpen(true);
  };

  const handleEditUser = (u: Operator) => {
    setSelectedUser(u);
    setIsUserDrawerOpen(true);
  };

  const handleDeleteUser = (id: number) => {
      // Implement if needed or just use existing operator delete API if shared
      alert('Delete function integrated with backend if supported.');
  };

  // Team Actions
  const handleCreateTeam = () => {
      if (!organizations.length) return alert('No organizations found for this customer');
      setEditingTeam(undefined);
      setTeamForm({ name: '', description: '', orgId: organizations[0].orgId });
      setIsTeamModalOpen(true);
  };

  const handleTeamSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          await customerApi.createTeam(teamForm);
          setIsTeamModalOpen(false);
          handleRefresh();
      } catch (error) {
          alert('Failed to save team');
      }
  };

  const filteredUsers = selectedTeamId 
    ? users.filter(u => u.teamId === selectedTeamId)
    : users;

  const currentTenantName = tenants.find(t => t.tenantId === selectedTenantId)?.name || 'Customer';

  return (
    <div className="management-page">
      <div className="management-container">
        <CustomerTeamSidebar 
          tenants={tenants}
          teams={teams}
          selectedTenantId={selectedTenantId}
          selectedTeamId={selectedTeamId}
          onSelectTenant={setSelectedTenantId}
          onSelectTeam={setSelectedTeamId}
          onAddTeam={handleCreateTeam}
          isLoading={isLoading}
          canManage={canManage}
        />

        <div className="management-main">
          <header className="management-header">
            <div className="header-info">
              <h2 className="header-title">
                {currentTenantName} {selectedTeamId ? ` - ${teams.find(t => t.teamId === selectedTeamId)?.name}` : ' All Users'}
              </h2>
              <p className="header-subtitle">Manage customer users and team structures for this tenant.</p>
            </div>
            <div className="header-actions">
              <button className="btn-secondary" onClick={handleRefresh}>🔄 Refresh</button>
              {canManage && (
                <button className="btn-primary" onClick={handleCreateUser}>+ Add User</button>
              )}
            </div>
          </header>

          <div className="management-content">
            <CustomerUserTable 
              users={filteredUsers}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              isLoading={isLoading}
              canManage={canManage}
            />
          </div>
        </div>
      </div>

      {isTeamModalOpen && (
          <div className="modal-overlay">
              <div className="modal-content small-modal">
                  <header className="modal-header">
                      <h2>Create Customer Team</h2>
                      <button className="close-btn" onClick={() => setIsTeamModalOpen(false)}>&times;</button>
                  </header>
                  <form onSubmit={handleTeamSubmit} className="standard-form">
                      <div className="form-section">
                          <label>Organization</label>
                          <select 
                            className="modern-input"
                            value={teamForm.orgId}
                            onChange={e => setTeamForm({...teamForm, orgId: Number(e.target.value)})}
                          >
                              {organizations.map(o => <option key={o.orgId} value={o.orgId}>{o.name}</option>)}
                          </select>
                      </div>
                      <div className="form-section">
                          <label>Team Name</label>
                          <input 
                              className="modern-input"
                              value={teamForm.name}
                              onChange={e => setTeamForm({...teamForm, name: e.target.value})}
                              required
                          />
                      </div>
                      <div className="form-actions">
                          <button type="button" className="btn-secondary" onClick={() => setIsTeamModalOpen(false)}>Cancel</button>
                          <button type="submit" className="btn-primary">Save Team</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {isUserDrawerOpen && (
          <CustomerUserDrawer 
            user={selectedUser}
            tenantId={selectedTenantId!}
            teams={teams}
            isOpen={isUserDrawerOpen}
            onClose={() => setIsUserDrawerOpen(false)}
            onSuccess={() => {
                setIsUserDrawerOpen(false);
                handleRefresh();
            }}
          />
      )}

      <ConfirmDialog 
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />

      <style>{`
        .management-page { height: calc(100vh - 120px); display: flex; }
        .management-container {
          flex: 1; display: flex; background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px); border: 1px solid var(--glass-border);
          border-radius: 20px; overflow: hidden;
        }
        .management-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        .management-header {
          padding: 24px 32px; border-bottom: 1px solid var(--glass-border);
          display: flex; justify-content: space-between; align-items: center;
        }
        .header-title { font-size: 1.25rem; font-weight: 800; color: white; margin-bottom: 4px; }
        .header-subtitle { font-size: 0.85rem; color: var(--text-muted); margin: 0; }
        .header-actions { display: flex; gap: 12px; }
        .management-content { flex: 1; overflow-y: auto; padding: 24px 32px; }
        
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center; z-index: 3000;
        }
        .modal-content {
          background: rgba(15, 23, 42, 0.95); border: 1px solid var(--glass-border);
          border-radius: 20px; padding: 32px; width: 100%; max-width: 450px;
        }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .modal-header h2 { margin: 0; font-size: 1.2rem; color: #fff; }
        .close-btn { background: transparent; border: none; color: #94a3b8; font-size: 1.5rem; cursor: pointer; }
        
        .form-section { margin-bottom: 20px; }
        .form-section label { display: block; margin-bottom: 8px; font-size: 0.85rem; color: #94a3b8; }
        .modern-input {
          width: 100%; padding: 12px; background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--glass-border); border-radius: 10px; color: white;
        }
        .form-actions { display: flex; gap: 12px; margin-top: 30px; }
        .form-actions button { flex: 1; }

        .btn-primary { background: var(--primary-gradient); color: white; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; }
        .btn-secondary { background: rgba(255,255,255,0.05); color: white; border: 1px solid var(--glass-border); padding: 10px 20px; border-radius: 10px; cursor: pointer; }
      `}</style>
    </div>
  );
};

export default UserManagement;
