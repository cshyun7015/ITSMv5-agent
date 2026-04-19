import React from 'react';
import { Operator } from '../../operator/types';

interface CustomerUserTableProps {
  users: Operator[];
  onEdit: (u: Operator) => void;
  onDelete: (id: number) => void;
  isLoading: boolean;
  canManage: boolean;
}

const CustomerUserTable: React.FC<CustomerUserTableProps> = ({
  users,
  onEdit,
  onDelete,
  isLoading,
  canManage
}) => {
  if (isLoading) {
    return <div className="loader-container">Loading users...</div>;
  }

  if (users.length === 0) {
    return (
      <div className="empty-container">
        <div className="empty-icon">👥</div>
        <p>No customer users found in this team.</p>
      </div>
    );
  }

  return (
    <div className="management-table-wrapper">
      <table className="management-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Team</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.memberId}>
              <td>
                <div className="member-cell">
                  <div className="member-avatar">{u.username.substring(0, 2).toUpperCase()}</div>
                  <div className="member-info">
                    <span className="member-name">{u.username}</span>
                  </div>
                </div>
              </td>
              <td><span className="email-text">{u.email}</span></td>
              <td><span className="team-text">{u.teamName || '-'}</span></td>
              <td>
                <span className={`status-pill ${u.isActive ? 'active' : 'inactive'}`}>
                  {u.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>
                <div className="action-buttons">
                  <button className="btn-icon btn-icon--edit" onClick={() => onEdit(u)}>Edit</button>
                  {canManage && (
                    <button className="btn-icon btn-icon--delete" onClick={() => onDelete(u.memberId)}>Delete</button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <style>{`
        .management-table-wrapper { width: 100%; overflow-x: auto; }
        .management-table { width: 100%; border-collapse: separate; border-spacing: 0 8px; }
        .management-table th { text-align: left; padding: 12px 20px; color: var(--text-muted); font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
        .management-table tbody tr { background: rgba(255, 255, 255, 0.02); transition: all 0.2s; }
        .management-table tbody tr:hover { background: rgba(255, 255, 255, 0.06); transform: translateX(4px); }
        .management-table td { padding: 12px 20px; border-top: 1px solid var(--glass-border); border-bottom: 1px solid var(--glass-border); }
        .management-table td:first-child { border-left: 1px solid var(--glass-border); border-radius: 12px 0 0 12px; }
        .management-table td:last-child { border-right: 1px solid var(--glass-border); border-radius: 0 12px 12px 0; }
        
        .member-cell { display: flex; align-items: center; gap: 12px; }
        .member-avatar { width: 36px; height: 36px; background: #1e293b; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #94a3b8; }
        .member-name { font-size: 14px; font-weight: 700; color: #f1f5f9; }
        .email-text, .team-text { font-size: 13px; color: #94a3b8; }
        
        .status-pill { font-size: 10px; font-weight: 800; padding: 2px 10px; border-radius: 20px; text-transform: uppercase; }
        .status-pill.active { background: rgba(34, 197, 94, 0.1); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.2); }
        .status-pill.inactive { background: rgba(239, 68, 68, 0.1); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.2); }
        
        .action-buttons { display: flex; gap: 8px; }
        .btn-icon { background: transparent; border: 1px solid var(--glass-border); padding: 4px 12px; border-radius: 8px; color: #94a3b8; font-size: 12px; cursor: pointer; transition: all 0.2s; }
        .btn-icon--edit:hover { background: #3b82f6; color: white; border-color: #3b82f6; }
        .btn-icon--delete:hover { background: #f43f5e; color: white; border-color: #f43f5e; }
        
        .loader-container, .empty-container { padding: 60px; text-align: center; color: var(--text-muted); }
        .empty-icon { font-size: 40px; margin-bottom: 16px; opacity: 0.3; }
      `}</style>
    </div>
  );
};

export default CustomerUserTable;
