import React, { useState, useMemo } from 'react';
import { Operator } from '../types';
import SkeletonTable from '../../../components/common/SkeletonTable';

interface OperatorTableProps {
  operators: Operator[];
  selectedIds: number[];
  onSelectToggle: (id: number) => void;
  onSelectAll: (ids: number[]) => void;
  onRowClick: (op: Operator) => void;
  onDelete: (id: number) => void;
  isLoading: boolean;
  canManage: boolean;
}

type SortKey = 'username' | 'roleId' | 'isActive' | 'teamName';
type SortDir = 'asc' | 'desc';

const OperatorTable: React.FC<OperatorTableProps> = ({
  operators,
  selectedIds,
  onSelectToggle,
  onSelectAll,
  onRowClick,
  onDelete,
  isLoading,
  canManage
}) => {
  const [search, setSearch]       = useState('');
  const [roleFilter, setRoleFilter]   = useState<'ALL' | 'ROLE_ADMIN' | 'ROLE_OPERATOR'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'active' | 'inactive'>('ALL');
  const [sortKey, setSortKey]     = useState<SortKey>('username');
  const [sortDir, setSortDir]     = useState<SortDir>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };
  
  const filtered = useMemo(() => {
    let data = [...operators];
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(op =>
        op.username.toLowerCase().includes(q) ||
        op.email.toLowerCase().includes(q)
      );
    }
    if (roleFilter !== 'ALL') data = data.filter(op => op.roleId === roleFilter);
    if (statusFilter === 'active')   data = data.filter(op => op.isActive);
    if (statusFilter === 'inactive') data = data.filter(op => !op.isActive);

    data.sort((a, b) => {
      let aVal: string | boolean = a[sortKey] ?? '';
      let bVal: string | boolean = b[sortKey] ?? '';
      if (typeof aVal === 'boolean') aVal = aVal ? 'a' : 'b';
      if (typeof bVal === 'boolean') bVal = bVal ? 'a' : 'b';
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return data;
  }, [operators, search, roleFilter, statusFilter, sortKey, sortDir]);

  const isAllSelected = filtered.length > 0 && filtered.every(op => selectedIds.includes(op.memberId));

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectAll([]);
    } else {
      onSelectAll(filtered.map(op => op.memberId));
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span className="sort-icon">
      {sortKey === col ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
    </span>
  );

  if (isLoading) return <SkeletonTable rows={7} cols={6} />;

  return (
    <div className="op-table-wrapper">
      <div className="op-controls">
        <div className="op-search-wrap">
          <span className="op-search-icon">🔍</span>
          <input
            type="search"
            className="op-search"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="op-search-clear" onClick={() => setSearch('')}>×</button>
          )}
        </div>

        <div className="op-filters">
          <select
            className="op-filter-select"
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value as any)}
          >
            <option value="ALL">All Roles</option>
            <option value="ROLE_ADMIN">Admin</option>
            <option value="ROLE_OPERATOR">Operator</option>
          </select>

          <select
            className="op-filter-select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
          >
            <option value="ALL">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <span className="op-result-count">
            {filtered.length} / {operators.length} members
          </span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="op-empty">
          <div className="op-empty-icon">🔎</div>
          <p>No operators match your filters.</p>
          <button className="btn-link" onClick={() => { setSearch(''); setRoleFilter('ALL'); setStatusFilter('ALL'); }}>
            Clear filters
          </button>
        </div>
      ) : (
        <div className="management-table-wrapper">
          <table className="management-table">
            <thead>
              <tr>
                <th className="checkbox-col">
                  <input 
                    type="checkbox" 
                    checked={isAllSelected} 
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="sortable" onClick={() => handleSort('username')}>
                  Member <SortIcon col="username" />
                </th>
                <th className="sortable" onClick={() => handleSort('roleId')}>
                  Role <SortIcon col="roleId" />
                </th>
                <th className="sortable" onClick={() => handleSort('teamName')}>
                  Team <SortIcon col="teamName" />
                </th>
                <th>Organization</th>
                <th className="sortable" onClick={() => handleSort('isActive')}>
                  Status <SortIcon col="isActive" />
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((op) => (
                <tr 
                  key={op.memberId} 
                  className={selectedIds.includes(op.memberId) ? 'row-selected' : ''}
                  onClick={() => onRowClick(op)}
                >
                  <td onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(op.memberId)}
                      onChange={() => onSelectToggle(op.memberId)}
                    />
                  </td>
                  <td>
                    <div className="member-cell">
                      <div className="member-avatar">
                        {op.username.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="member-info">
                        <span className="member-name">{op.username}</span>
                        <span className="member-email">{op.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`role-badge ${op.roleId === 'ROLE_ADMIN' ? 'role-badge--admin' : 'role-badge--operator'}`}>
                      {op.roleId === 'ROLE_ADMIN' ? 'Admin' : 'Operator'}
                    </span>
                  </td>
                  <td>
                    <span className="team-text">{op.teamName || '—'}</span>
                  </td>
                  <td>
                    <span className="org-text">{op.tenantName}</span>
                  </td>
                  <td>
                    <span className={`status-pill ${op.isActive ? 'status-pill--active' : 'status-pill--inactive'}`}>
                      {op.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="action-buttons">
                      <button className="btn-icon btn-icon--delete" onClick={() => onDelete(op.memberId)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        /* ── Controls ── */
        .op-controls {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 20px; flex-wrap: wrap;
        }
        .op-search-wrap {
          position: relative; flex: 1; min-width: 200px;
        }
        .op-search-icon {
          position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
          font-size: 14px; pointer-events: none;
        }
        .op-search {
          width: 100%; padding: 10px 36px 10px 36px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px; color: white;
          font-size: 13.5px; outline: none; transition: all 0.2s;
          box-sizing: border-box;
        }
        .op-search:focus {
          border-color: var(--primary, #3b82f6);
          background: rgba(255,255,255,0.07);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
        }
        .op-search::placeholder { color: #475569; }
        .op-search::-webkit-search-cancel-button { display: none; }
        .op-search-clear {
          position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
          background: none; border: none; color: #64748b; cursor: pointer;
          font-size: 18px; line-height: 1; padding: 0; transition: color 0.2s;
        }
        .op-search-clear:hover { color: #f1f5f9; }

        .op-filters { display: flex; align-items: center; gap: 8px; }
        .op-filter-select {
          padding: 8px 14px; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; color: white; font-size: 13px; cursor: pointer;
        }
        .op-filter-select:focus { outline: none; border-color: #3b82f6; }
        .op-filter-select option { background: #1e293b; }

        .op-result-count {
          font-size: 12px; color: #64748b; white-space: nowrap;
          padding: 0 4px;
        }

        /* ── Empty state ── */
        .op-empty {
          padding: 60px; text-align: center; color: #64748b;
        }
        .op-empty-icon { font-size: 36px; margin-bottom: 12px; opacity: 0.4; }
        .op-empty p { margin: 0 0 16px; }
        .btn-link {
          background: none; border: none; color: #3b82f6;
          font-size: 13px; cursor: pointer; text-decoration: underline;
        }

        /* ── Table ── */
        .management-table-wrapper { width: 100%; overflow-x: auto; }
        .management-table {
          width: 100%; border-collapse: separate; border-spacing: 0 8px;
        }
        .management-table th {
          text-align: left; padding: 10px 20px;
          color: var(--text-muted); font-weight: 600;
          font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em;
        }

        .checkbox-col { width: 48px; text-align: center !important; }

        .management-table th.sortable {
          cursor: pointer; user-select: none; white-space: nowrap;
          transition: color 0.2s;
        }
        .management-table th.sortable:hover { color: #f1f5f9; }
        .sort-icon { font-size: 11px; color: #64748b; }

        .management-table tbody tr {
          background: rgba(255,255,255,0.02);
          backdrop-filter: blur(10px); transition: all 0.2s;
          cursor: pointer;
        }
        .management-table tbody tr:hover {
          background: rgba(255,255,255,0.06); transform: translateX(4px);
        }
        .management-table tbody tr.row-selected {
          background: rgba(59, 130, 246, 0.08);
          border-color: rgba(59, 130, 246, 0.2);
        }

        .management-table td {
          padding: 12px 20px;
          border-top: 1px solid var(--glass-border);
          border-bottom: 1px solid var(--glass-border);
        }
        .management-table td:first-child {
          border-left: 1px solid var(--glass-border); border-radius: 12px 0 0 12px;
        }
        .management-table td:last-child {
          border-right: 1px solid var(--glass-border); border-radius: 0 12px 12px 0;
        }

        .member-cell { display: flex; align-items: center; gap: 12px; }
        .member-avatar {
          width: 36px; height: 36px; border-radius: 10px;
          background: #1e293b; display: flex; align-items: center;
          justify-content: center; font-size: 13px; font-weight: 700; color: #94a3b8;
        }
        .member-info { display: flex; flex-direction: column; }
        .member-name { font-size: 14px; font-weight: 700; color: #f1f5f9; }
        .member-email { font-size: 11px; color: #64748b; }

        .role-badge {
          font-size: 10px; font-weight: 800; padding: 3px 9px;
          border-radius: 6px; text-transform: uppercase;
        }
        .role-badge--admin {
          background: rgba(139,92,246,0.1); color: #a78bfa;
          border: 1px solid rgba(139,92,246,0.2);
        }
        .role-badge--operator {
          background: rgba(16,185,129,0.1); color: #34d399;
          border: 1px solid rgba(16,185,129,0.2);
        }

        .team-text { font-size: 14px; color: #f8fafc; font-weight: 500; }
        .org-text  { font-size: 11px; color: #64748b; }

        .status-pill {
          font-size: 10px; font-weight: 800; padding: 3px 10px; border-radius: 20px;
        }
        .status-pill--active {
          background: rgba(34,197,94,0.1); color: #4ade80;
          border: 1px solid rgba(34,197,94,0.2);
        }
        .status-pill--inactive {
          background: rgba(239,68,68,0.1); color: #f87171;
          border: 1px solid rgba(239,68,68,0.2);
        }

        .action-buttons { display: flex; gap: 8px; }
        .btn-icon {
          background: transparent; border: 1px solid var(--glass-border);
          padding: 4px 12px; border-radius: 8px; color: #94a3b8;
          font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s;
        }
        .btn-icon--edit:hover  { background: #3b82f6; color: white; border-color: #3b82f6; }
        .btn-icon--delete:hover { background: #f43f5e; color: white; border-color: #f43f5e; }
      `}</style>
    </div>
  );
};

export default OperatorTable;
