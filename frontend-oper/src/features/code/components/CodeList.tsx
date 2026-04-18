import { CodeDTO } from '../../fulfillment/types';

interface CodeListProps {
  codes: CodeDTO[];
  onEdit: (code: CodeDTO) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
  isAdmin?: boolean;
}

const CodeList: React.FC<CodeListProps> = ({ codes, onEdit, onDelete, isLoading, isAdmin }) => {
  if (isLoading) {
    return <div className="loader-container">Loading codes...</div>;
  }

  if (codes.length === 0) {
    return <div className="empty-container">No codes found. Add your first configuration code above.</div>;
  }
  return (
    <div className="code-list">
      <table className="code-list__table">
        <thead className="code-list__header">
          <tr>
            <th>Order</th>
            <th>Code ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody className="code-list__body">
          {codes.map((code) => (
            <tr key={code.id} className="code-list__row">
              <td className="code-list__cell code-list__cell--order">{code.sortOrder}</td>
              <td className="code-list__cell code-list__cell--id">{code.codeId}</td>
              <td className="code-list__cell code-list__cell--name">{code.codeName}</td>
              <td className="code-list__cell code-list__cell--desc">{code.description || '-'}</td>
              <td className="code-list__cell">
                <span className={`status-badge ${code.isActive ? 'status-badge--active' : 'status-badge--inactive'}`}>
                  {code.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="code-list__cell">
                {isAdmin && (
                  <div className="action-buttons">
                    <button className="btn-icon btn-icon--edit" onClick={() => onEdit(code)}>
                      Edit
                    </button>
                    <button className="btn-icon btn-icon--delete" onClick={() => code.id && onDelete(code.id)}>
                      Delete
                    </button>
                  </div>
                )}
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
        .action-buttons {
          display: flex;
          gap: 8px;
        }
        .btn-icon {
          background: transparent;
          padding: 6px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: var(--transition-smooth);
          font-size: 0.8rem;
          font-weight: 600;
        }
        .btn-icon--edit {
          color: var(--primary);
          border: 1px solid var(--primary);
        }
        .btn-icon--edit:hover {
          background: var(--primary);
          color: white;
        }
        .btn-icon--delete {
          color: #ef4444;
          border: 1px solid #ef4444;
        }
        .btn-icon--delete:hover {
          background: #ef4444;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default CodeList;
