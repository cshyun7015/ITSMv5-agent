import React, { useState } from 'react';

interface GroupSidebarProps {
  groups: string[];
  selectedGroupId: string | null;
  onSelectGroup: (groupId: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onAddGroup: () => void;
  isLoading?: boolean;
  isAdmin?: boolean;
}

const GroupSidebar: React.FC<GroupSidebarProps> = ({ 
  groups, 
  selectedGroupId, 
  onSelectGroup, 
  onDeleteGroup,
  onAddGroup,
  isLoading,
  isAdmin
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGroups = groups.filter(group => 
    group.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="group-sidebar">
      <div className="group-sidebar__header">
        <div className="group-sidebar__search">
          <input
            type="text"
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        {isAdmin && (
          <button className="add-group-btn" onClick={onAddGroup} title="Add New Group">
            <span>+</span>
          </button>
        )}
      </div>

      <div className="group-sidebar__list">
        {isLoading ? (
          <div className="sidebar-loading">Loading groups...</div>
        ) : filteredGroups.length === 0 ? (
          <div className="sidebar-empty">No groups found</div>
        ) : (
          filteredGroups.map(group => (
            <div key={group} className={`group-item-container ${selectedGroupId === group ? 'active' : ''}`}>
              <button
                className={`group-item ${selectedGroupId === group ? 'group-item--active' : ''}`}
                onClick={() => onSelectGroup(group)}
              >
                <span className="group-item__icon">📁</span>
                <span className="group-item__name">{group}</span>
              </button>
              {isAdmin && (
                <button 
                  className="group-delete-btn" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteGroup(group);
                  }}
                  title="Delete Group"
                >
                  🗑️
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <style>{`
        .group-sidebar {
          width: 280px;
          border-right: 1px solid var(--glass-border);
          display: flex;
          flex-direction: column;
          background: rgba(255, 255, 255, 0.02);
        }

        .group-sidebar__header {
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1px solid var(--glass-border);
        }

        .group-sidebar__search {
          flex: 1;
          position: relative;
        }

        .add-group-btn {
          width: 38px;
          height: 38px;
          background: var(--primary-gradient);
          border: none;
          border-radius: 10px;
          color: white;
          font-size: 1.2rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition-smooth);
        }

        .add-group-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .search-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          border-radius: 10px;
          padding: 8px 12px 8px 32px;
          color: white;
          font-size: 0.85rem;
          outline: none;
          transition: var(--transition-smooth);
        }

        .search-input:focus {
          border-color: var(--primary);
          background: rgba(255, 255, 255, 0.1);
        }

        .search-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 0.8rem;
          opacity: 0.5;
        }

        .group-sidebar__list {
          flex: 1;
          overflow-y: auto;
          padding: 10px;
        }

        .group-item-container {
          position: relative;
          margin-bottom: 4px;
        }

        .group-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          background: transparent;
          border: none;
          border-radius: 10px;
          color: var(--text-muted);
          cursor: pointer;
          transition: var(--transition-smooth);
          text-align: left;
        }

        .group-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }

        .group-item--active {
          background: var(--primary-gradient) !important;
          color: white !important;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }

        .group-delete-btn {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: #ef4444;
          cursor: pointer;
          opacity: 0;
          transition: var(--transition-smooth);
          font-size: 0.9rem;
          padding: 4px;
          border-radius: 4px;
        }

        .group-item-container:hover .group-delete-btn {
          opacity: 0.6;
        }

        .group-delete-btn:hover {
          opacity: 1 !important;
          background: rgba(239, 68, 68, 0.1);
        }

        .group-item__icon {
          font-size: 1.1rem;
        }

        .group-item__name {
          font-size: 0.85rem;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 180px;
        }

        .sidebar-loading, .sidebar-empty {
          padding: 20px;
          text-align: center;
          color: var(--text-muted);
          font-size: 0.85rem;
        }
      `}</style>
    </div>
  );
};

export default GroupSidebar;
