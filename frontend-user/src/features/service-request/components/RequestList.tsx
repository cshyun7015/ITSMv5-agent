import React from 'react';
import { ServiceRequest } from '../../../types/request';

interface RequestListProps {
  requests: ServiceRequest[];
  onSelect: (requestId: number) => void;
  onCreate: () => void;
}

const RequestList: React.FC<RequestListProps> = ({ requests, onSelect, onCreate }) => {
  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'DRAFT': '#94a3b8',
      'PENDING_APPROVAL': '#f59e0b',
      'APPROVED': '#10b981',
      'REJECTED': '#ef4444'
    };
    return (
      <span style={{ 
        backgroundColor: colors[status] + '20', 
        color: colors[status],
        padding: '4px 8px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: 600
      }}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const getPriorityTag = (priority: string) => {
    const icons: Record<string, string> = {
      'EMERGENCY': '🚨',
      'NORMAL': '📅',
      'LOW': '☕'
    };
    return <span>{icons[priority]} {priority}</span>;
  };

  return (
    <div className="request-list-container">
      <div className="list-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 600 }}>Active Requests</h2>
          <p style={{ color: '#64748b' }}>Manage and track your service tickets</p>
        </div>
        <button className="btn-primary" onClick={onCreate}>+ New Request</button>
      </div>

      {requests.length === 0 ? (
        <div className="empty-state-small">
          <p>No requests found matching your current view.</p>
        </div>
      ) : (
        <div className="request-grid">
          {requests.map(req => (
            <div key={req.requestId} className="request-card" onClick={() => onSelect(req.requestId)}>
              <div className="card-top">
                <span className="request-id">#{req.requestId}</span>
                {getStatusBadge(req.status)}
              </div>
              <h3 className="card-title">{req.title}</h3>
              <div className="card-meta">
                <div className="meta-item">{getPriorityTag(req.priority)}</div>
                <div className="meta-item">🕒 {new Date(req.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .request-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        .request-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .request-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
          border-color: var(--color-primary);
        }
        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .request-id {
          font-size: 12px;
          color: #94a3b8;
          font-weight: 600;
        }
        .card-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 16px;
          color: #1e293b;
        }
        .card-meta {
          display: flex;
          gap: 16px;
          font-size: 13px;
          color: #64748b;
        }
        .empty-state-small {
          padding: 40px;
          text-align: center;
          background: #f8fafc;
          border-radius: 12px;
          color: #64748b;
        }
      `}</style>
    </div>
  );
};

export default RequestList;
