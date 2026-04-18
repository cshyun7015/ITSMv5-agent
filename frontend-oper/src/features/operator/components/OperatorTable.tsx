import React from 'react';
import { Operator } from '../types';

interface OperatorTableProps {
  operators: Operator[];
  onEdit: (op: Operator) => void;
  onDelete: (id: number) => void;
  isLoading: boolean;
  canManage: boolean;
}

const OperatorTable: React.FC<OperatorTableProps> = ({
  operators,
  onEdit,
  onDelete,
  isLoading,
  canManage
}) => {
  if (isLoading) {
    return <div className="loader-container">Loading operators...</div>;
  }

  if (operators.length === 0) {
    return (
      <div className="empty-container">
        <div className="empty-icon">👥</div>
        <p>No operators found in this team.</p>
      </div>
    );
  }

  return (
    <div className="management-table-wrapper">
      <table className="management-table">
        <thead>
          <tr>
            <th>Member</th>
            <th>Role</th>
            <th>Team</th>
            <th>Organization</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {operators.map((op) => (
            <tr key={op.memberId}>
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
                <span className="team-text">{op.teamName || '-'}</span>
              </td>
              <td>
                <span className="org-text">{op.tenantName}</span>
              </td>
              <td>
                <span className={`status-pill ${op.isActive ? 'status-pill--active' : 'status-pill--inactive'}`}>
                  {op.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>
                <div className="action-buttons">
                  <button className="btn-icon btn-icon--edit" onClick={() => onEdit(op)}>
                    Edit
                  </button>
                  {canManage && (
                    <button className="btn-icon btn-icon--delete" onClick={() => onDelete(op.memberId)}>
                      Delete
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <style>{`
        .management-table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .management-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0 8px;
        }

        .management-table th {
          text-align: left;
          padding: 12px 20px;
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .management-table tbody tr {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(10px);
          transition: all 0.2s;
        }
        .management-table tbody tr:hover {
          background: rgba(255, 255, 255, 0.06);
          transform: translateX(4px);
        }

        .management-table td {
          padding: 12px 20px;
          border-top: 1px solid var(--glass-border);
          border-bottom: 1px solid var(--glass-border);
        }
        .management-table td:first-child {
          border-left: 1px solid var(--glass-border);
          border-radius: 12px 0 0 12px;
        }
        .management-table td:last-child {
          border-right: 1px solid var(--glass-border);
          border-radius: 0 12px 12px 0;
        }

        .member-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .member-avatar {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #1e293b;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          color: #94a3b8;
        }
        .member-info {
          display: flex;
          flex-direction: column;
        }
        .member-name {
          font-size: 14px;
          font-weight: 700;
          color: #f1f5f9;
        }
        .member-email {
          font-size: 11px;
          color: #64748b;
        }

        .role-badge {
          font-size: 10px;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 6px;
          text-transform: uppercase;
        }
        .role-badge--admin {
          background: rgba(139, 92, 246, 0.1);
          color: #a78bfa;
          border: 1px solid rgba(139, 92, 246, 0.2);
        }
        .role-badge--operator {
          background: rgba(16, 185, 129, 0.1);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .team-text { font-size: 14px; color: #f8fafc; font-weight: 500; }
        .org-text { font-size: 11px; color: #64748b; }

        .status-pill {
          font-size: 10px;
          font-weight: 800;
          padding: 2px 10px;
          border-radius: 20px;
        }
        .status-pill--active {
          background: rgba(34, 197, 94, 0.1);
          color: #4ade80;
          border: 1px solid rgba(34, 197, 94, 0.2);
        }
        .status-pill--inactive {
          background: rgba(239, 68, 68, 0.1);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }
        .btn-icon {
          background: transparent;
          border: 1px solid var(--glass-border);
          padding: 4px 12px;
          border-radius: 8px;
          color: #94a3b8;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-icon--edit:hover {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }
        .btn-icon--delete:hover {
          background: #f43f5e;
          color: white;
          border-color: #f43f5e;
        }

        .loader-container, .empty-container {
          padding: 60px;
          text-align: center;
          color: var(--text-muted);
        }
        .empty-icon { font-size: 40px; margin-bottom: 16px; opacity: 0.3; }
      `}</style>
    </div>
  );
};

export default OperatorTable;
