import React from 'react';
import { Team } from '../types';

interface Organization {
  orgId: number;
  name: string;
}

interface TeamSidebarProps {
  teams: Team[];
  organizations: Organization[];
  selectedTeamId: number | null;
  onSelectTeam: (id: number | null) => void;
  onAddTeam: () => void;
  onEditTeam: (team: Team) => void;
  onDeleteTeam: (id: number) => void;
  isLoading: boolean;
  canManage: boolean;
  totalCount: number;
}

const TeamSidebar: React.FC<TeamSidebarProps> = ({
  teams,
  organizations,
  selectedTeamId,
  onSelectTeam,
  onAddTeam,
  onEditTeam,
  onDeleteTeam,
  isLoading,
  canManage,
  totalCount
}) => {
  return (
    <aside className="management-sidebar">
      <div className="management-sidebar__header">
        <h3 className="sidebar-title">Operation Teams</h3>
        {canManage && (
          <button className="btn-icon-add" onClick={onAddTeam} title="Create New Team">
            +
          </button>
        )}
      </div>

      <div className="management-sidebar__content">
        <div 
          className={`sidebar-item ${selectedTeamId === null ? 'sidebar-item--active' : ''}`}
          onClick={() => onSelectTeam(null)}
        >
          <div className="sidebar-item__icon">📊</div>
          <div className="sidebar-item__info">
            <span className="sidebar-item__name">All Operators</span>
          </div>
          <span className="sidebar-item__count">{totalCount}</span>
        </div>

        {isLoading ? (
          <div className="sidebar-skeleton">Loading teams...</div>
        ) : (
          organizations.map(org => {
            const orgTeams = teams.filter(t => t.orgId === org.orgId);
            if (orgTeams.length === 0) return null;

            return (
              <div key={org.orgId} className="org-group">
                {organizations.length > 1 && (
                  <div className="org-header">
                    <span className="org-name">{org.name}</span>
                  </div>
                )}
                <div className="org-teams">
                  {orgTeams.map((team) => (
                    <div 
                      key={team.teamId} 
                      className={`sidebar-item ${selectedTeamId === team.teamId ? 'sidebar-item--active' : ''}`}
                      onClick={() => onSelectTeam(team.teamId)}
                    >
                      <div className="sidebar-item__icon">
                        {team.name.substring(0, 1).toUpperCase()}
                      </div>
                      <div className="sidebar-item__info">
                        <span className="sidebar-item__name">{team.name}</span>
                      </div>
                      <div className="sidebar-item__actions">
                        {canManage && (
                          <>
                            <button 
                              className="action-btn action-btn--edit" 
                              onClick={(e) => { e.stopPropagation(); onEditTeam(team); }}
                              title="Edit Team"
                            >
                              ✎
                            </button>
                            <button 
                              className="action-btn action-btn--delete" 
                              onClick={(e) => { e.stopPropagation(); onDeleteTeam(team.teamId); }}
                              title="Delete Team"
                            >
                              ×
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      <style>{`
        .management-sidebar {
          width: 280px;
          border-right: 1px solid var(--glass-border);
          display: flex;
          flex-direction: column;
          background: rgba(255, 255, 255, 0.01);
        }

        .management-sidebar__header {
          padding: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--glass-border);
        }

        .sidebar-title {
          font-size: 0.8rem;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin: 0;
        }

        .btn-icon-add {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          color: #3b82f6;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.2s;
        }
        .btn-icon-add:hover {
          background: #3b82f6;
          color: white;
        }

        .management-sidebar__content {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;
        }
        .sidebar-item:hover {
          background: rgba(255, 255, 255, 0.03);
        }
        .sidebar-item--active {
          background: rgba(59, 130, 246, 0.08);
          border-color: rgba(59, 130, 246, 0.2);
        }

        .sidebar-item__icon {
          width: 32px;
          height: 32px;
          background: #1e293b;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          color: #94a3b8;
          flex-shrink: 0;
        }
        .sidebar-item--active .sidebar-item__icon {
          background: #3b82f6;
          color: white;
        }

        .sidebar-item__info {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .sidebar-item__name {
          font-size: 14px;
          font-weight: 600;
          color: #f1f5f9;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sidebar-item__tag {
          font-size: 10px;
          color: #64748b;
        }

        .sidebar-item__count {
          font-size: 11px;
          background: rgba(255,255,255,0.05);
          color: #64748b;
          padding: 2px 6px;
          border-radius: 10px;
          font-weight: 600;
        }
        .sidebar-item--active .sidebar-item__count {
          background: rgba(59, 130, 246, 0.2);
          color: #fff;
        }

        .sidebar-item__actions {
          display: flex;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .sidebar-item:hover .sidebar-item__actions {
          opacity: 1;
        }

        .action-btn {
          width: 22px;
          height: 22px;
          background: rgba(255,255,255,0.05);
          border: none;
          border-radius: 4px;
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          transition: all 0.2s;
        }
        .action-btn:hover {
          background: rgba(255,255,255,0.12);
          color: white;
        }
        .action-btn--delete:hover {
          background: rgba(239, 68, 68, 0.15);
          color: #f87171;
        }

        .sidebar-skeleton {
          padding: 20px;
          text-align: center;
          color: var(--text-muted);
          font-size: 13px;
        }

        /* Org Grouping Styles */
        .org-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 12px;
        }
        .org-group:first-child { margin-top: 0; }
        
        .org-header {
          padding: 8px 12px;
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 8px;
          margin-bottom: 4px;
        }
        .org-name {
          font-size: 11px;
          font-weight: 800;
          color: #60a5fa;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .org-teams {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding-left: 8px;
          border-left: 1px solid rgba(255, 255, 255, 0.05);
          margin-left: 4px;
        }
      `}</style>
    </aside>
  );
};

export default TeamSidebar;
