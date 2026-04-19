import React from 'react';
import { CustomerTenant } from '../api/customerApi';
import { Team } from '../../operator/types';

interface CustomerTeamSidebarProps {
  tenants: CustomerTenant[];
  teams: Team[];
  selectedTenantId: string | null;
  selectedTeamId: number | null;
  onSelectTenant: (id: string) => void;
  onSelectTeam: (id: number | null) => void;
  onAddTeam: () => void;
  isLoading: boolean;
  canManage: boolean;
}

const CustomerTeamSidebar: React.FC<CustomerTeamSidebarProps> = ({
  tenants,
  teams,
  selectedTenantId,
  selectedTeamId,
  onSelectTenant,
  onSelectTeam,
  onAddTeam,
  isLoading,
  canManage
}) => {
  return (
    <aside className="management-sidebar">
      <div className="sidebar-group">
        <h3 className="sidebar-title">Mapped Customers</h3>
        <div className="sidebar-content">
          {tenants.map(t => (
            <div 
              key={t.tenantId} 
              className={`tenant-item ${selectedTenantId === t.tenantId ? 'active' : ''}`}
              onClick={() => { onSelectTenant(t.tenantId); onSelectTeam(null); }}
            >
              <span className="tenant-icon">🏢</span>
              <span className="tenant-name">{t.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="sidebar-group teams-group">
        <div className="sidebar-header">
           <h3 className="sidebar-title">Customer Teams</h3>
           {canManage && selectedTenantId && (
             <button className="add-team-btn" onClick={onAddTeam}>+</button>
           )}
        </div>
        <div className="sidebar-content">
          <div 
            className={`team-item ${selectedTeamId === null ? 'active' : ''}`}
            onClick={() => onSelectTeam(null)}
          >
            <span className="team-icon">📊</span>
            <span className="team-name">All Users</span>
          </div>
          {isLoading ? (
            <div className="loading-text">Loading teams...</div>
          ) : (
            teams.map(team => (
              <div 
                key={team.teamId} 
                className={`team-item ${selectedTeamId === team.teamId ? 'active' : ''}`}
                onClick={() => onSelectTeam(team.teamId)}
              >
                <div className="team-avatar">{team.name.charAt(0)}</div>
                <div className="team-info">
                  <span className="team-name">{team.name}</span>
                  <span className="org-tag">{team.orgName}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        .management-sidebar { width: 300px; border-right: 1px solid var(--glass-border); display: flex; flex-direction: column; background: rgba(255, 255, 255, 0.01); }
        .sidebar-group { padding: 20px; border-bottom: 1px solid var(--glass-border); }
        .sidebar-title { font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 15px; }
        .sidebar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .sidebar-header .sidebar-title { margin-bottom: 0; }
        
        .tenant-item, .team-item {
          display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 12px;
          cursor: pointer; transition: all 0.2s; margin-bottom: 4px; border: 1px solid transparent;
        }
        .tenant-item:hover, .team-item:hover { background: rgba(255, 255, 255, 0.05); }
        .tenant-item.active, .team-item.active { background: rgba(59, 130, 246, 0.1); border-color: rgba(59, 130, 246, 0.2); color: #3b82f6; }
        
        .tenant-icon { font-size: 16px; }
        .tenant-name { font-size: 14px; font-weight: 600; }
        
        .team-avatar {
          width: 32px; height: 32px; background: #1e293b; border-radius: 8px;
          display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700;
        }
        .active .team-avatar { background: #3b82f6; color: white; }
        
        .team-info { display: flex; flex-direction: column; min-width: 0; }
        .team-name { font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .org-tag { font-size: 10px; color: #64748b; }
        
        .add-team-btn {
          width: 24px; height: 24px; border-radius: 6px; background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2); color: #3b82f6; cursor: pointer; font-weight: bold;
        }
        .add-team-btn:hover { background: #3b82f6; color: white; }
        
        .loading-text { font-size: 12px; color: #64748b; text-align: center; padding: 10px; }
      `}</style>
    </aside>
  );
};

export default CustomerTeamSidebar;
