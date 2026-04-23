import React, { useState, useEffect } from 'react';
import { operatorApi } from '../api/operatorApi';
import { Operator, Team, TeamRequest } from '../types';
import TeamSidebar from './TeamSidebar';
import OperatorTable from './OperatorTable';
import OperatorDrawer from './OperatorDrawer';
import TenantFormModal from './TenantFormModal';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { useToast } from '../../../hooks/useToast';
import { useAuth } from '../../auth/context/AuthContext';
import { Tenant } from '../types';

interface Organization {
  orgId: number;
  name: string;
}

const OperatorManagement: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
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
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
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

  const handleSelectToggle = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    setConfirmConfig({
      isOpen: true,
      title: `Delete ${selectedIds.length} Operators`,
      message: `Are you sure you want to delete ${selectedIds.length} selected operators? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await Promise.all(selectedIds.map(id => operatorApi.deleteOperator(id)));
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
          setSelectedIds([]);
          toast.success('Selected operators deleted successfully.');
          loadData();
        } catch (error) {
          toast.error('Failed to delete some operators.');
        }
      }
    });
  };

  const handleBulkTeamChange = async (targetTeamId: number) => {
    try {
      // Mocking bulk update via parallel requests for now as per plan
      await Promise.all(selectedIds.map(id => 
        operatorApi.updateOperator(id, { teamId: targetTeamId })
      ));
      setSelectedIds([]);
      toast.success('Operators moved to new team successfully.');
      loadData();
    } catch (error) {
      toast.error('Failed to move some operators.');
    }
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
          toast.success('Operator deleted successfully.');
          loadData();
        } catch (error) {
          toast.error('Failed to delete operator.');
        }
      }
    });
  };

  const handleCreateTenant = async (data: { tenantId: string, name: string, brandColor: string }) => {
    try {
      await operatorApi.createTenant(data);
      setIsTenantModalOpen(false);
      toast.success(`Operating company ${data.name} created successfully.`);
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
          toast.success('Team deleted successfully.');
          loadData();
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Failed to delete team. Make sure it has no members.');
        }
      }
    });
  };

  const handleTeamSubmit = async (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    try {
        if (editingTeam) {
            await operatorApi.updateTeam(editingTeam.teamId, teamForm);
            toast.success('Team updated successfully.');
        } else {
            await operatorApi.createTeam(teamForm);
            toast.success('Team created successfully.');
        }
        setIsTeamModalOpen(false);
        loadData();
    } catch (error) {
        toast.error('Failed to save team.');
    }
  };

  const filteredOperators = operators.filter(op => {
    if (selectedTeamId && op.teamId !== selectedTeamId) return false;
    if (filterTenantId && op.tenantId !== filterTenantId) return false;
    return true;
  });

  const activeTenant = filterTenantId
    ? tenants.find(t => t.tenantId === filterTenantId)
    : null;
  const brandColor = activeTenant?.brandColor || 'var(--primary, #3b82f6)';

  const handleContextChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'ALL_ORGS') {
      setViewMode('tenants');
      setFilterTenantId(null);
      setSelectedTeamId(null);
    } else if (val.startsWith('ORG_')) {
      const tenantId = val.replace('ORG_', '');
      setViewMode('operators');
      setFilterTenantId(tenantId);
      setSelectedTeamId(null);
    } else if (val.startsWith('TEAM_')) {
      const teamId = Number(val.replace('TEAM_', ''));
      const team = teams.find(t => t.teamId === teamId);
      if (team) {
        setViewMode('operators');
        setFilterTenantId(team.tenantId);
        setSelectedTeamId(teamId);
      }
    }
  };

  const currentContextValue = selectedTeamId 
    ? `TEAM_${selectedTeamId}` 
    : filterTenantId 
    ? `ORG_${filterTenantId}` 
    : 'ALL_ORGS';

  return (
    <div
      className="management-page"
      style={{ '--tenant-accent': brandColor } as React.CSSProperties}
    >
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
          {selectedIds.length > 0 && (
            <div className="bulk-action-bar">
              <div className="bulk-info">
                <span className="bulk-count">{selectedIds.length} selected</span>
              </div>
              <div className="bulk-actions">
                <select 
                  className="bulk-select"
                  onChange={(e) => e.target.value && handleBulkTeamChange(Number(e.target.value))}
                  value=""
                >
                  <option value="" disabled>Move to Team...</option>
                  {teams.map(t => <option key={t.teamId} value={t.teamId}>{t.name}</option>)}
                </select>
                <button className="btn-bulk btn-bulk--delete" onClick={handleBulkDelete}>Delete Selected</button>
                <button className="btn-bulk btn-bulk--cancel" onClick={() => setSelectedIds([])}>Cancel</button>
              </div>
            </div>
          )}

          <header className="management-header">
            <div className="header-info">
              {/* ── Breadcrumb ── */}
              {viewMode === 'operators' && user?.roles?.includes('ROLE_ADMIN') && (
                <nav className="breadcrumb">
                  <button
                    className="breadcrumb-link"
                    onClick={() => { setViewMode('tenants'); setFilterTenantId(null); setSelectedTeamId(null); }}
                  >
                    🏢 Companies
                  </button>
                  <span className="breadcrumb-sep">›</span>
                  {activeTenant ? (
                    <>
                      <span
                        className="breadcrumb-dot"
                        style={{ background: brandColor }}
                      />
                      <span className="breadcrumb-current">{activeTenant.name}</span>
                      <span className="breadcrumb-sep">›</span>
                    </>
                  ) : null}
                  <span className="breadcrumb-current">Operators</span>
                </nav>
              )}

              <div className="header-title-row">
                <h2 className="header-title">
                  {viewMode === 'tenants'
                    ? 'Operating Companies'
                    : activeTenant
                    ? `${activeTenant.name} — Operators`
                    : selectedTeamId
                    ? teams.find(t => t.teamId === selectedTeamId)?.name
                    : 'All Operators'
                  }
                </h2>
                
                {/* ── Context Switcher ── */}
                {user?.roles?.includes('ROLE_ADMIN') && (
                  <select 
                    className="context-switcher" 
                    value={currentContextValue}
                    onChange={handleContextChange}
                  >
                    <option value="ALL_ORGS">Global View (All Companies)</option>
                    <optgroup label="Companies">
                      {tenants.map(t => <option key={t.tenantId} value={`ORG_${t.tenantId}`}>🏢 {t.name}</option>)}
                    </optgroup>
                    <optgroup label="Teams">
                      {teams.map(t => <option key={t.teamId} value={`TEAM_${t.teamId}`}>👥 {t.name}</option>)}
                    </optgroup>
                  </select>
                )}
              </div>
              <p className="header-subtitle">
                {viewMode === 'tenants'
                  ? 'Select a company to manage its operators, or add a new one.'
                  : selectedTeamId
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
                    data-testid="view-mode-tenants"
                  >
                    🏢 Companies
                  </button>
                  <button 
                    className={`toggle-btn ${viewMode === 'operators' ? 'active' : ''}`}
                    onClick={() => setViewMode('operators')}
                    data-testid="view-mode-operators"
                  >
                    👥 Operators
                  </button>
                </div>
              )}
              {canManage && (
                viewMode === 'tenants' ? (
                  <button className="btn-primary" onClick={() => setIsTenantModalOpen(true)} data-testid="add-company-btn">+ Add Company</button>
                ) : (
                  <button className="btn-primary" onClick={handleCreateOperator} data-testid="add-operator-btn">+ Add Operator</button>
                )
              )}
            </div>
          </header>

          <div className="content-scrollable">
            {viewMode === 'tenants' ? (
              <div className="tenant-list-grid">
                {tenants.map(t => (
                  <div 
                    key={t.tenantId} 
                    className="tenant-card" 
                    onClick={() => { setFilterTenantId(t.tenantId); setViewMode('operators'); }}
                    style={{ '--tenant-color': t.brandColor } as React.CSSProperties}
                  >
                    <div className="tenant-card__accent" style={{ background: t.brandColor }} />
                    <div className="tenant-card__info">
                      <h4 className="tenant-name">{t.name}</h4>
                      <p className="tenant-id">{t.tenantId}</p>
                    </div>
                    <div className="tenant-card__meta">
                      <span className="meta-item">👥 {operators.filter(op => op.tenantId === t.tenantId).length} Operators</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <OperatorTable 
                operators={filteredOperators}
                selectedIds={selectedIds}
                onSelectToggle={handleSelectToggle}
                onSelectAll={setSelectedIds}
                onRowClick={handleEditOperator}
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
                  <div className="standard-form">
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
                          <button type="button" onClick={handleTeamSubmit} className="btn-primary">Save Team</button>
                      </div>
                  </div>
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
          allTeams={teams}
          organizations={organizations}
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
        
        /* ── Header Improvements ── */
        .header-title-row {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .context-switcher {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          border-radius: 8px;
          padding: 4px 12px;
          color: #94a3b8;
          font-size: 13px;
          font-weight: 600;
          outline: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .context-switcher:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
        }
        .context-switcher optgroup {
          background: #0f172a;
          color: #64748b;
          font-style: normal;
        }
        .context-switcher option {
          background: #1e293b;
          color: #f1f5f9;
        }

        /* ── Bulk Action Bar ── */
        .bulk-action-bar {
          position: sticky;
          top: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 24px;
          padding: 14px 24px;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(59, 130, 246, 0.3);
          box-shadow: 0 4px 20px rgba(0,0,0,0.4);
          animation: slideBulkDown 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideBulkDown {
          from { opacity: 0; transform: translateY(-100%); }
          to { opacity: 1; transform: translateY(0); }
        }

        .bulk-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .bulk-count {
          font-size: 14px;
          font-weight: 700;
          color: #3b82f6;
        }

        .bulk-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .bulk-select {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          border-radius: 8px;
          padding: 6px 12px;
          color: #f1f5f9;
          font-size: 13px;
          outline: none;
          cursor: pointer;
        }
        .bulk-select:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .bulk-select option {
          background: #1e293b;
          color: white;
        }
        .btn-bulk {
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-bulk--delete {
          background: #f43f5e;
          border: none;
          color: white;
        }
        .btn-bulk--delete:hover {
          background: #e11d48;
          box-shadow: 0 0 15px rgba(244, 63, 94, 0.4);
        }
        .btn-bulk--cancel {
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--glass-border);
          color: #94a3b8;
        }
        .btn-bulk--cancel:hover {
          background: rgba(255,255,255,0.1);
          color: white;
        }

        /* ── Tenant Improvements ── */
        .tenant-list-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          padding: 4px;
        }
        .tenant-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--glass-border);
          border-radius: 20px;
          padding: 24px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          gap: 16px;
          position: relative;
          overflow: hidden;
        }
        .tenant-card:hover {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, var(--tenant-color, rgba(59, 130, 246, 0.05)) 100%);
          transform: translateY(-4px);
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
        }
        .tenant-card__accent {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          opacity: 0.8;
        }
        .tenant-card__info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .tenant-name {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 800;
          color: #f1f5f9;
        }
        .tenant-id {
          font-size: 0.75rem;
          font-weight: 600;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .tenant-card__meta {
          margin-top: auto;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.03);
          display: flex;
          align-items: center;
        }
        .meta-item {
          font-size: 13px;
          color: #94a3b8;
          font-weight: 600;
        }

        .content-scrollable {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          padding-top: 0;
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

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

        /* ── Breadcrumb ── */
        .breadcrumb {
          display: flex; align-items: center; gap: 6px;
          margin-bottom: 8px;
        }
        .breadcrumb-link {
          background: none; border: none;
          color: var(--tenant-accent, #3b82f6);
          font-size: 12px; font-weight: 700; cursor: pointer;
          padding: 0; text-decoration: none; transition: opacity 0.2s;
        }
        .breadcrumb-link:hover { opacity: 0.75; }
        .breadcrumb-sep { color: #475569; font-size: 14px; }
        .breadcrumb-current {
          font-size: 12px; color: #94a3b8; font-weight: 600;
        }
        .breadcrumb-dot {
          width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
        }

        /* ── Tenant-accent theming ── */
        .btn-primary { background: var(--tenant-accent, var(--primary-gradient)); }
        .toggle-btn.active { background: var(--tenant-accent, #3b82f6); }

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
