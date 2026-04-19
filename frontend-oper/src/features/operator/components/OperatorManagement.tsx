import React, { useState, useEffect } from 'react';
import { operatorApi } from '../api/operatorApi';
import { Operator, Team, TeamRequest } from '../types';
import TeamSidebar from './TeamSidebar';
import OperatorTable from './OperatorTable';
import OperatorDrawer from './OperatorDrawer';
import TenantFormModal from './TenantFormModal';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { useAuth } from '../../auth/context/AuthContext';
import { Tenant } from '../types';

interface Organization {
  orgId: number;
  name: string;
}

const OperatorManagement: React.FC = () => {
  const { user } = useAuth();
  const canManage = user?.roles?.some(role => ['ROLE_ADMIN', 'ROLE_OPERATOR'].includes(role)) ?? false;

  const [operators, setOperators] = useState<Operator[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'tenants' | 'operators'>(
    user?.roles?.includes('ROLE_ADMIN') ? 'tenants' : 'operators'
  );
  
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [filterTenantId, setFilterTenantId] = useState<string | null>(null);

  // Tenant Modal State
  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);
  
  // Operator Modal State
  const [isOperatorModalOpen, setIsOperatorModalOpen] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState<Operator | undefined>();

  // Team CRUD State
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | undefined>();
  const [teamForm, setTeamForm] = useState<TeamRequest>({ name: '', description: '', orgId: 0 });

  // ConfirmDialog state
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const promises: any[] = [
        operatorApi.getOperators(),
        operatorApi.getTeams()
      ];
      
      if (user?.roles?.includes('ROLE_ADMIN')) {
        promises.push(operatorApi.getTenants());
      }

      const results = await Promise.all(promises);
      setOperators(results[0]);
      setTeams(results[1]);
      
      if (user?.roles?.includes('ROLE_ADMIN')) {
        setTenants(results[2]);
      }

      // Extract unique organizations (for ADMIN create team)
      const orgsMap = new Map<number, Organization>();
      results[1].forEach((t: Team) => {
          if (t.orgId) orgsMap.set(t.orgId, { orgId: t.orgId, name: t.orgName || 'Unknown Org' });
      });
      setOrganizations(Array.from(orgsMap.values()));
    } catch (error) {
      console.error('Failed to load operator management data', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => loadData();

  // Operator Actions
  const handleCreateOperator = () => {
    setSelectedOperator(undefined);
    setIsOperatorModalOpen(true);
  };

  const handleEditOperator = (op: Operator) => {
    setSelectedOperator(op);
    setIsOperatorModalOpen(true);
  };

  const handleDeleteOperator = (id: number) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Operator',
      message: 'Are you sure you want to delete this operator? Their account will be deactivated and removed from the active list.',
      onConfirm: async () => {
        try {
          await operatorApi.deleteOperator(id);
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
          loadData();
        } catch (error) {
          alert('Failed to delete operator');
        }
      }
    });
  };

  const handleCreateTenant = async (data: { tenantId: string, name: string, brandColor: string }) => {
    try {
      await operatorApi.createTenant(data);
      setIsTenantModalOpen(false);
      loadData();
    } catch (error) {
      throw error;
    }
  };

  const handleSelectTenant = (tenantId: string) => {
    setFilterTenantId(tenantId);
    setSelectedTeamId(null);
    setViewMode('operators');
  };

  // Team Actions
  const handleCreateTeam = () => {
    setEditingTeam(undefined);
    setTeamForm({ name: '', description: '', orgId: organizations[0]?.orgId || 0 });
    setIsTeamModalOpen(true);
  };

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team);
    setTeamForm({ name: team.name, description: team.description || '', orgId: team.orgId });
    setIsTeamModalOpen(true);
  };

  const handleDeleteTeam = (id: number) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Team',
      message: 'Are you sure you want to delete this team? A team can only be deleted if it has no assigned members.',
      onConfirm: async () => {
        try {
          await operatorApi.deleteTeam(id);
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
          if (selectedTeamId === id) setSelectedTeamId(null);
          loadData();
        } catch (error: any) {
          alert(error.response?.data?.message || 'Failed to delete team. Make sure it has no members.');
        }
      }
    });
  };

  const handleTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        if (editingTeam) {
            await operatorApi.updateTeam(editingTeam.teamId, teamForm);
        } else {
            await operatorApi.createTeam(teamForm);
        }
        setIsTeamModalOpen(false);
        loadData();
    } catch (error) {
        alert('Failed to save team.');
    }
  };

  const filteredOperators = operators.filter(op => {
    if (selectedTeamId && op.teamId !== selectedTeamId) return false;
    if (filterTenantId && op.tenantId !== filterTenantId) return false;
    return true;
  });

  return (
    <div className="management-page">
      <div className="management-container">
        <TeamSidebar 
          teams={teams}
          organizations={organizations}
          selectedTeamId={selectedTeamId}
          onSelectTeam={setSelectedTeamId}
          onAddTeam={handleCreateTeam}
          onEditTeam={handleEditTeam}
          onDeleteTeam={handleDeleteTeam}
          isLoading={isLoading}
          canManage={canManage}
          totalCount={operators.length}
        />

        <div className="management-main">
          <header className="management-header">
            <div className="header-info">
              <h2 className="header-title">
                {selectedTeamId ? teams.find(t => t.teamId === selectedTeamId)?.name : 'All Operators'}
              </h2>
              <p className="header-subtitle">
                {selectedTeamId 
                  ? teams.find(t => t.teamId === selectedTeamId)?.description || 'Administration for this operation team'
                  : 'Manage all security accounts and team assignments for the MSP portal.'}
              </p>
            </div>
            <div className="header-actions">
              <button className="btn-secondary" onClick={handleRefresh}>🔄 Refresh</button>
              {user?.roles?.includes('ROLE_ADMIN') && (
                <div className="view-mode-toggle">
                  <button 
                    className={`toggle-btn ${viewMode === 'tenants' ? 'active' : ''}`}
                    onClick={() => { setViewMode('tenants'); setFilterTenantId(null); }}
                  >
                    🏢 Companies
                  </button>
                  <button 
                    className={`toggle-btn ${viewMode === 'operators' ? 'active' : ''}`}
                    onClick={() => setViewMode('operators')}
                  >
                    👥 Operators
                  </button>
                </div>
              )}
              {canManage && (
                viewMode === 'tenants' ? (
                  <button className="btn-primary" onClick={() => setIsTenantModalOpen(true)}>+ Add Company</button>
                ) : (
                  <button className="btn-primary" onClick={handleCreateOperator}>+ Add Operator</button>
                )
              )}
            </div>
          </header>

          <div className="management-content">
            {viewMode === 'tenants' ? (
              <div className="tenant-list-grid">
                {tenants.map(tenant => (
                  <div key={tenant.tenantId} className="tenant-card" onClick={() => handleSelectTenant(tenant.tenantId)}>
                    <div className="tenant-accent" style={{ background: tenant.brandColor }}></div>
                    <div className="tenant-info">
                      <div className="tenant-id">{tenant.tenantId}</div>
                      <div className="tenant-name">{tenant.name}</div>
                    </div>
                    <div className="tenant-stats">
                      <div className="stat-item">
                        <span className="stat-value">{operators.filter(op => op.tenantId === tenant.tenantId).length}</span>
                        <span className="stat-label">Operators</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <OperatorTable 
                operators={filteredOperators}
                onEdit={handleEditOperator}
                onDelete={handleDeleteOperator}
                isLoading={isLoading}
                canManage={canManage}
              />
            )}
          </div>
        </div>
      </div>

      {isTeamModalOpen && (
          <div className="modal-overlay">
              <div className="modal-content small-modal">
                  <header className="modal-header">
                      <h2>{editingTeam ? 'Edit Team' : 'Create New Team'}</h2>
                      <button className="close-btn" onClick={() => setIsTeamModalOpen(false)}>&times;</button>
                  </header>
                  <form onSubmit={handleTeamSubmit} className="standard-form">
                      {organizations.length > 1 && (
                          <div className="form-section">
                              <label>Target Organization</label>
                              <select 
                                  value={teamForm.orgId} 
                                  onChange={e => setTeamForm({...teamForm, orgId: Number(e.target.value)})}
                                  className="modern-input"
                                  required
                              >
                                  {organizations.map((org: Organization) => (
                                      <option key={org.orgId} value={org.orgId}>{org.name}</option>
                                  ))}
                              </select>
                          </div>
                      )}
                      <div className="form-section">
                          <label>Team Name</label>
                          <input 
                              value={teamForm.name} 
                              onChange={e => setTeamForm({...teamForm, name: e.target.value})}
                              className="modern-input"
                              placeholder="e.g. Cloud Ops L1"
                              required
                          />
                      </div>
                      <div className="form-section">
                          <label>Description</label>
                          <textarea 
                              value={teamForm.description} 
                              onChange={e => setTeamForm({...teamForm, description: e.target.value})}
                              className="modern-input"
                              placeholder="Brief scope of the team"
                              style={{ minHeight: '80px' }}
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

      {isOperatorModalOpen && (
        <OperatorDrawer 
          operator={selectedOperator}
          isOpen={isOperatorModalOpen}
          onClose={() => setIsOperatorModalOpen(false)}
          onSuccess={() => {
            setIsOperatorModalOpen(false);
            loadData();
          }}
        />
      )}

      {isTenantModalOpen && (
        <TenantFormModal 
          isOpen={isTenantModalOpen}
          onClose={() => setIsTenantModalOpen(false)}
          onSubmit={handleCreateTenant}
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
        .management-page {
          height: calc(100vh - 120px);
          display: flex;
        }

        .management-container {
          flex: 1;
          display: flex;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
          border-radius: 20px;
          overflow: hidden;
        }

        .management-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .management-header {
          padding: 24px 32px;
          border-bottom: 1px solid var(--glass-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255, 255, 255, 0.01);
        }

        .header-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: white;
          margin: 0 0 4px 0;
        }

        .header-subtitle {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin: 0;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .management-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px 32px;
        }

        /* Generic Management Styles matching CodeManagement */
        .btn-primary {
          background: var(--primary-gradient);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.2);
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.05);
          color: white;
          border: 1px solid var(--glass-border);
          padding: 10px 20px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .small-modal { max-width: 400px !important; }

        /* Modal Styles */
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.7);
          backdrop-filter: blur(8px); display: flex; align-items: center;
          justify-content: center; z-index: 3000; animation: fadeIn 0.2s ease;
        }
        .modal-content {
          background: rgba(15, 23, 42, 0.95); border: 1px solid var(--glass-border);
          border-radius: 20px; padding: 32px; width: 100%; max-width: 500px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .modal-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 24px; border-bottom: 1px solid var(--glass-border);
          padding-bottom: 16px;
        }
        .modal-header h2 { margin: 0; font-size: 1.25rem; color: #fff; }
        .close-btn {
          background: transparent; border: none; color: #94a3b8;
          font-size: 1.5rem; cursor: pointer; transition: color 0.2s;
        }
        .close-btn:hover { color: #fff; }

        .form-section { margin-bottom: 20px; }
        .form-section label {
          display: block; margin-bottom: 8px; font-size: 0.85rem;
          color: #94a3b8; font-weight: 700;
        }
        .modern-input {
          width: 100%; padding: 12px 16px; background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--glass-border); border-radius: 12px;
          color: white; outline: none; transition: all 0.2s;
        }
        .modern-input:focus {
          border-color: var(--primary); background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }
        .modern-input::placeholder { color: #475569; }

        .form-actions {
          display: flex; gap: 12px; margin-top: 32px;
        }
        .form-actions button { flex: 1; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .view-mode-toggle {
          display: flex;
          background: rgba(255, 255, 255, 0.05);
          padding: 4px;
          border-radius: 12px;
          border: 1px solid var(--glass-border);
          margin: 0 8px;
        }
        .toggle-btn {
          padding: 6px 16px;
          border: none;
          background: transparent;
          color: #94a3b8;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .toggle-btn.active {
          background: #3b82f6;
          color: white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .tenant-list-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }
        .tenant-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .tenant-card:hover {
          transform: translateY(-4px);
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
        }
        .tenant-accent {
          position: absolute;
          top: 0; left: 0; right: 0; height: 4px;
        }
        .tenant-id {
          font-family: monospace;
          font-size: 0.75rem;
          color: #3b82f6;
          font-weight: 700;
          letter-spacing: 1px;
        }
        .tenant-name {
          font-size: 1.15rem;
          font-weight: 800;
          color: white;
        }
        .tenant-stats {
          border-top: 1px solid var(--glass-border);
          padding-top: 16px;
          display: flex;
          gap: 20px;
        }
        .stat-item {
          display: flex;
          flex-direction: column;
        }
        .stat-value {
          font-size: 1.25rem;
          font-weight: 800;
          color: white;
        }
        .stat-label {
          font-size: 0.7rem;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
};

export default OperatorManagement;
