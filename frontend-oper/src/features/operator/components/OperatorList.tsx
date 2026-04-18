import React, { useState, useEffect } from 'react';
import { operatorApi } from '../api/operatorApi';
import { Operator, Team, TeamRequest } from '../types';
import OperatorFormModal from './OperatorFormModal';

interface Organization {
  orgId: number;
  name: string;
}

const OperatorList: React.FC = () => {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState<Operator | undefined>();
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  
  // Team CRUD State
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | undefined>();
  const [teamForm, setTeamForm] = useState<TeamRequest>({ name: '', description: '', orgId: 0 });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [opData, teamData] = await Promise.all([
        operatorApi.getOperators(),
        operatorApi.getTeams()
      ]);
      setOperators(opData);
      setTeams(teamData);

      // Extract unique organizations for team creation (for ADMIN)
      const orgsMap = new Map<number, Organization>();
      teamData.forEach((t: Team) => {
          if (t.orgId) orgsMap.set(t.orgId, { orgId: t.orgId, name: t.orgName || 'Unknown Org' });
      });
      setOrganizations(Array.from(orgsMap.values()));
    } catch (error) {
      console.error('Failed to load data', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = () => {
    setSelectedOperator(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (op: Operator) => {
    setSelectedOperator(op);
    setIsModalOpen(true);
  };

  const handleDeleteOperator = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this operator?')) {
      try {
        await operatorApi.deleteOperator(id);
        loadData();
      } catch (error) {
        console.error('Failed to delete operator', error);
      }
    }
  };

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

  const handleDeleteTeam = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this team? It must be empty.')) {
        try {
            await operatorApi.deleteTeam(id);
            loadData();
            if (selectedTeamId === id) setSelectedTeamId(null);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to delete team. Make sure it has no members.');
        }
    }
  }

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
        console.error('Failed to save team', error);
        alert('Failed to save team.');
    }
  };

  const filteredOperators = selectedTeamId 
    ? operators.filter(op => op.teamId === selectedTeamId)
    : operators;

  return (
    <div className="operator-management-layout">
      <aside className="team-sidebar">
        <div className="sidebar-header">
          <h3>Operation Teams</h3>
          <button className="icon-btn small" onClick={handleCreateTeam} title="Add Team">+</button>
        </div>
        <div className="team-list">
          <div 
            className={`team-item ${selectedTeamId === null ? 'active' : ''}`}
            onClick={() => setSelectedTeamId(null)}
          >
            <span className="team-icon">ALL</span>
            <span className="team-name">All Operators</span>
            <span className="count">{operators.length}</span>
          </div>
          {teams.map((team: Team) => (
            <div 
              key={team.teamId} 
              className={`team-item ${selectedTeamId === team.teamId ? 'active' : ''}`}
              onClick={() => setSelectedTeamId(team.teamId)}
            >
              <span className="team-icon">{team.name.substring(0, 1).toUpperCase()}</span>
              <div className="team-info">
                  <span className="team-name">{team.name}</span>
                  {organizations.length > 1 && <span className="org-tag-small">{team.orgName}</span>}
              </div>
              <div className="team-actions">
                <button className="icon-btn xs" onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleEditTeam(team); }}>✎</button>
                <button className="icon-btn xs delete" onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleDeleteTeam(team.teamId); }}>×</button>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <div className="operator-content">
        <header className="page-header">
          <div className="header-left">
            <h1>{selectedTeamId ? teams.find((t: Team) => t.teamId === selectedTeamId)?.name : 'All Operators'}</h1>
            <p className="subtitle">
                {selectedTeamId 
                    ? teams.find((t: Team) => t.teamId === selectedTeamId)?.description || 'Manage members of this team'
                    : 'Manage all MSP operation team accounts and roles'}
            </p>
          </div>
          <button className="btn-primary" onClick={handleCreate}>
            <span className="icon">+</span> New Operator
          </button>
        </header>

        {isLoading ? (
          <div className="loading-state">Loading data...</div>
        ) : (
          <div className="operator-grid">
            {filteredOperators.map((op: Operator) => (
              <div key={op.memberId} className="operator-card">
                <div className="card-header">
                  <div className="user-avatar">
                    {op.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="status-indicator">
                    <span className={`status-dot ${op.isActive ? 'active' : 'inactive'}`}></span>
                    {op.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
                <div className="card-body">
                  <h3>{op.username}</h3>
                  <p className="email">{op.email}</p>
                  <div className="meta-tags">
                    <span className="role-badge">{op.roleId === 'ROLE_ADMIN' ? 'Admin' : 'Operator'}</span>
                    <span className="team-badge">{op.teamName || 'No Team'}</span>
                    {organizations.length > 1 && <span className="org-badge">{op.tenantName}</span>}
                  </div>
                </div>
                <div className="card-footer">
                  <button className="btn-text" onClick={() => handleEdit(op)}>Edit</button>
                  <button className="btn-text delete" onClick={() => handleDeleteOperator(op.memberId)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isTeamModalOpen && (
          <div className="modal-overlay">
              <div className="modal-content team-modal">
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
                              placeholder="e.g. Service Desk L1"
                              required
                          />
                      </div>
                      <div className="form-section">
                          <label>Description</label>
                          <textarea 
                              value={teamForm.description} 
                              onChange={e => setTeamForm({...teamForm, description: e.target.value})}
                              className="modern-input modern-textarea"
                              placeholder="Brief description of the team's role"
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

      {isModalOpen && (
        <OperatorFormModal 
          operator={selectedOperator}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            loadData();
          }}
        />
      )}

      <style>{`
        .operator-management-layout { display: flex; min-height: calc(100vh - 80px); background: #0b0f1a; }
        
        .team-sidebar { 
          width: 300px; background: rgba(15, 23, 42, 0.8); border-right: 1px solid rgba(255,255,255,0.05); 
          padding: 32px 20px; display: flex; flex-direction: column; gap: 24px;
        }
        .sidebar-header { display: flex; justify-content: space-between; align-items: center; padding: 0 12px; }
        .sidebar-header h3 { margin: 0; font-size: 14px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
        
        .team-list { display: flex; flex-direction: column; gap: 8px; }
        .team-item { 
          display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 12px;
          cursor: pointer; transition: all 0.2s; position: relative; border: 1px solid transparent;
        }
        .team-item:hover { background: rgba(255,255,255,0.03); }
        .team-item.active { background: rgba(59, 130, 246, 0.1); border-color: rgba(59, 130, 246, 0.2); }
        
        .team-icon { 
          width: 32px; height: 32px; background: #1e293b; border-radius: 8px; display: flex; 
          align-items: center; justify-content: center; font-size: 12px; font-weight: 800; color: #94a3b8;
        }
        .team-item.active .team-icon { background: #3b82f6; color: #fff; }
        
        .team-info { display: flex; flex-direction: column; flex: 1; min-width: 0; }
        .team-name { font-size: 14px; font-weight: 700; color: #f1f5f9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .org-tag-small { font-size: 10px; color: #64748b; }
        
        .team-actions { display: flex; gap: 4px; opacity: 0; transition: opacity 0.2s; }
        .team-item:hover .team-actions { opacity: 1; }
        
        .icon-btn { 
          background: rgba(255,255,255,0.05); border: none; color: #94a3b8; cursor: pointer; border-radius: 6px;
          display: flex; align-items: center; justify-content: center; transition: all 0.2s;
        }
        .icon-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .icon-btn.delete:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
        .icon-btn.small { width: 28px; height: 28px; font-size: 18px; }
        .icon-btn.xs { width: 22px; height: 22px; font-size: 12px; }

        .operator-content { flex: 1; padding: 40px; overflow-y: auto; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        .page-header h1 { font-size: 32px; font-weight: 800; color: #fff; margin: 0; }
        .subtitle { color: #64748b; margin: 8px 0 0 0; font-size: 16px; }
        
        .operator-grid { 
          display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; 
        }

        .meta-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
        .role-badge, .team-badge, .org-badge { 
          font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 4px; border: 1px solid transparent;
        }
        .role-badge { background: rgba(139, 92, 246, 0.1); color: #a78bfa; border-color: rgba(139, 92, 246, 0.2); }
        .team-badge { background: rgba(16, 185, 129, 0.1); color: #34d399; border-color: rgba(16, 185, 129, 0.2); }
        .org-badge { background: rgba(59, 130, 246, 0.1); color: #60a5fa; border-color: rgba(59, 130, 246, 0.2); }

        .modern-textarea { min-height: 80px; resize: vertical; }
        .team-modal { max-width: 400px !important; }
        .count { font-size: 11px; background: #1e293b; color: #64748b; padding: 2px 6px; border-radius: 10px; font-weight: 700; }
        .team-item.active .count { background: rgba(59, 130, 246, 0.2); color: #fff; }
      `}</style>
    </div>
  );
};

export default OperatorList;
