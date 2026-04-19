import React, { useState } from 'react';
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
  const [expandedOrgs, setExpandedOrgs] = useState<Record<number, boolean>>(() => {
    // By default, expand the first organization or all orgs if there are few
    const initial: Record<number, boolean> = {};
    organizations.forEach((org, index) => {
      initial[org.orgId] = index === 0 || organizations.length <= 3;
    });
    return initial;
  });

  const toggleOrg = (orgId: number) => {
    setExpandedOrgs(prev => ({
      ...prev,
      [orgId]: !prev[orgId]
    }));
  };

  return (
    <aside className="management-sidebar">
      <div className="management-sidebar__header">
        <h3 className="sidebar-title">Directory</h3>
        {canManage && (
          <button className="btn-icon-add" onClick={onAddTeam} title="Create New Team">
            +
          </button>
        )}
      </div>

      <div className="management-sidebar__content">
        <div 
          className={`sidebar-item global-item ${selectedTeamId === null ? 'sidebar-item--active' : ''}`}
          onClick={() => onSelectTeam(null)}
        >
          <div className="sidebar-item__icon">📊</div>
          <div className="sidebar-item__info">
            <span className="sidebar-item__name">All Operators</span>
          </div>
          <span className="sidebar-item__count">{totalCount}</span>
        </div>

        {isLoading ? (
          <div className="sidebar-skeleton">
            <div className="skeleton-item shimmer" style={{ width: '80%' }}></div>
            <div className="skeleton-item shimmer" style={{ width: '60%' }}></div>
            <div className="skeleton-item shimmer" style={{ width: '70%' }}></div>
          </div>
        ) : (
          organizations.map(org => {
            const orgTeams = teams.filter(t => t.orgId === org.orgId);
            const isExpanded = expandedOrgs[org.orgId];
            if (orgTeams.length === 0 && !canManage) return null;

            return (
              <div key={org.orgId} className={`org-group ${isExpanded ? 'is-expanded' : ''}`}>
                <div className="org-header" onClick={() => toggleOrg(org.orgId)}>
                  <span className={`org-toggle ${isExpanded ? 'active' : ''}`}>▾</span>
                  <span className="org-name">{org.name}</span>
                  <span className="org-badge">{orgTeams.length}</span>
                </div>
                
                {isExpanded && (
                  <div className="org-teams">
                    {orgTeams.map((team) => (
                      <div 
                        key={team.teamId} 
                        className={`sidebar-item team-item ${selectedTeamId === team.teamId ? 'sidebar-item--active' : ''}`}
                        onClick={() => onSelectTeam(team.teamId)}
                      >
                        <div className="sidebar-item__dot" title={team.name} />
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
                )}
              </div>
            );
          })
        )}
      </div>

      <style>{`
        .management-sidebar {
          width: 300px;
          border-right: 1px solid var(--glass-border);
          display: flex;
          flex-direction: column;
          background: rgba(255, 255, 255, 0.01);
        }

        .management-sidebar__header {
          padding: 24px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--glass-border);
        }

        .sidebar-title {
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin: 0;
        }

        .btn-icon-add {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          color: #3b82f6;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-icon-add:hover {
          background: #3b82f6;
          color: white;
          transform: scale(1.05);
        }

        .management-sidebar__content {
          flex: 1;
          padding: 16px 12px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 2px;
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
          background: rgba(255, 255, 255, 0.04);
        }
        .sidebar-item--active {
          background: rgba(59, 130, 246, 0.1);
          border-color: rgba(59, 130, 246, 0.2);
        }

        .sidebar-item__icon {
          width: 24px;
          height: 24px;
          background: rgba(255,255,255,0.05);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: #94a3b8;
          flex-shrink: 0;
        }
        .sidebar-item--active .sidebar-item__icon {
          background: #3b82f6;
          color: white;
        }

        .sidebar-item__dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #475569;
          margin-left: 9px;
          margin-right: 9px;
          flex-shrink: 0;
          transition: all 0.2s;
        }
        .sidebar-item--active .sidebar-item__dot {
          background: #3b82f6;
          box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
        }

        .sidebar-item__info {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .sidebar-item__name {
          font-size: 13.5px;
          font-weight: 500;
          color: #94a3b8;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sidebar-item--active .sidebar-item__name {
          color: #f1f5f9;
          font-weight: 700;
        }

        .global-item .sidebar-item__name {
          font-weight: 600;
          color: #cbd5e1;
        }

        .sidebar-item__count {
          font-size: 10.5px;
          background: rgba(255,255,255,0.06);
          color: #64748b;
          padding: 2px 8px;
          border-radius: 10px;
          font-weight: 700;
        }
        .sidebar-item--active .sidebar-item__count {
          background: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
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
          background: transparent;
          border: none;
          border-radius: 4px;
          color: #64748b;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          transition: all 0.2s;
        }
        .action-btn:hover {
          background: rgba(255,255,255,0.08);
          color: white;
        }
        .action-btn--delete:hover {
          color: #f87171;
        }

        /* ── Tree View Org Styles ── */
        .org-group {
          margin-top: 4px;
        }
        
        .org-header {
          padding: 10px 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          border-radius: 12px;
          transition: all 0.2s;
        }
        .org-header:hover {
          background: rgba(255, 255, 255, 0.03);
        }

        .org-toggle {
          font-size: 12px;
          color: #64748b;
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          width: 16px;
          display: flex;
          justify-content: center;
        }
        .org-toggle.active {
          transform: rotate(0deg);
        }
        .org-toggle:not(.active) {
          transform: rotate(-90deg);
        }

        .org-name {
          font-size: 12px;
          font-weight: 800;
          color: #f8fafc;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          flex: 1;
        }

        .org-badge {
          font-size: 10px;
          color: #475569;
          font-weight: 700;
          padding-right: 4px;
        }

        .org-teams {
          display: flex;
          flex-direction: column;
          gap: 2px;
          margin-left: 20px;
          padding-left: 12px;
          border-left: 1px solid rgba(255, 255, 255, 0.05);
          margin-top: 2px;
          margin-bottom: 8px;
          animation: slideDown 0.25s cubic-bezier(0, 0, 0.2, 1);
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ── Skeleton ── */
        .sidebar-skeleton {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 12px;
        }
        .skeleton-item {
          height: 14px;
          background: rgba(255,255,255,0.04);
          border-radius: 4px;
        }
        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }
        @keyframes loading {
          from { background-position: 200% 0; }
          to { background-position: -200% 0; }
        }
      `}</style>
    </aside>
  );
};

export default TeamSidebar;
