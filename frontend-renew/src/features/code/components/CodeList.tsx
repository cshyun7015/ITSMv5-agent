import React from 'react';

interface CodeItem {
  id: number;
  groupId: string;
  codeId: string;
  codeName: string;
  isActive: boolean;
}

interface CodeListProps {
  codes: CodeItem[];
  onEdit: (code: CodeItem) => void;
}

const CodeList: React.FC<CodeListProps> = ({ codes, onEdit }) => {
  return (
    <div className="code-list">
      <table className="code-list__table">
        <thead className="code-list__header">
          <tr>
            <th>Group ID</th>
            <th>Code ID</th>
            <th>Name</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody className="code-list__body">
          {codes.map((code) => (
            <tr key={code.id} className="code-list__row">
              <td className="code-list__cell">{code.groupId}</td>
              <td className="code-list__cell">{code.codeId}</td>
              <td className="code-list__cell">{code.codeName}</td>
              <td className="code-list__cell">
                <span className={`status-badge ${code.isActive ? 'status-badge--active' : 'status-badge--inactive'}`}>
                  {code.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="code-list__cell">
                <button className="btn-icon" onClick={() => onEdit(code)}>
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <style>{`
        .code-list__table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0 12px;
          margin-top: 20px;
        }
        .code-list__header th {
          text-align: left;
          padding: 12px 20px;
          color: var(--text-muted);
          font-weight: 500;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .code-list__row {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(8px);
          transition: var(--transition-smooth);
        }
        .code-list__row:hover {
          background: rgba(255, 255, 255, 0.07);
          transform: scale(1.005);
        }
        .code-list__cell {
          padding: 16px 20px;
          border-top: 1px solid var(--glass-border);
          border-bottom: 1px solid var(--glass-border);
        }
        .code-list__cell:first-child {
          border-left: 1px solid var(--glass-border);
          border-radius: 12px 0 0 12px;
        }
        .code-list__cell:last-child {
          border-right: 1px solid var(--glass-border);
          border-radius: 0 12px 12px 0;
        }
        .status-badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .status-badge--active {
          background: rgba(34, 197, 94, 0.1);
          color: #4ade80;
          border: 1px solid rgba(34, 197, 94, 0.2);
        }
        .status-badge--inactive {
          background: rgba(239, 68, 68, 0.1);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
        .btn-icon {
          background: transparent;
          color: var(--primary);
          border: 1px solid var(--primary);
          padding: 6px 14px;
          border-radius: 8px;
          cursor: pointer;
          transition: var(--transition-smooth);
        }
        .btn-icon:hover {
          background: var(--primary);
          color: white;
        }
      `}</style>
    </div>
  );
};

export default CodeList;
