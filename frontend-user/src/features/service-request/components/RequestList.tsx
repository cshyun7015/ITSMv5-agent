import React from 'react';
import { ServiceRequest } from '../../../types/request';
import { Plus, Calendar, AlertCircle, Clock, CheckCircle2, XCircle, Search, ChevronRight } from 'lucide-react';

interface RequestListProps {
  requests: ServiceRequest[];
  onSelect: (requestId: number) => void;
  onCreate: (catalogMode: boolean) => void;
}

const RequestList: React.FC<RequestListProps> = ({ requests, onSelect, onCreate }) => {
  const isEditable = (status: string) => ['DRAFT', 'PENDING_APPROVAL', 'REJECTED'].includes(status);
  const getStatusBadge = (status: string) => {
    const configs: Record<string, { color: string, icon: any }> = {
      'DRAFT': { color: '#64748b', icon: <Clock size={12} /> },
      'PENDING_APPROVAL': { color: '#f59e0b', icon: <Clock size={12} /> },
      'APPROVED': { color: '#10b981', icon: <CheckCircle2 size={12} /> },
      'REJECTED': { color: '#ef4444', icon: <XCircle size={12} /> }
    };
    
    const config = configs[status] || configs['DRAFT'];
    
    return (
      <span className="status-badge" style={{ 
        backgroundColor: config.color + '15', 
        color: config.color,
        border: `1px solid ${config.color}25`
      }}>
        {config.icon}
        {status.replace('_', ' ')}
      </span>
    );
  };

  const getPriorityTag = (priority: string) => {
    const configs: Record<string, { color: string, icon: any }> = {
      'EMERGENCY': { color: '#ef4444', icon: <AlertCircle size={14} /> },
      'NORMAL': { color: '#f59e0b', icon: <Clock size={14} /> },
      'LOW': { color: '#10b981', icon: <CheckCircle2 size={14} /> }
    };
    const config = configs[priority] || configs['NORMAL'];
    
    return (
      <div className="priority-tag" style={{ color: config.color }}>
        {config.icon}
        {priority}
      </div>
    );
  };

  return (
    <div className="request-list-container">
      <div className="list-header">
        <div className="title-area">
          <h2>Active Requests</h2>
          <p>Track the progress and manage your submitted IT service tickets</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => onCreate(false)}>
            <Plus size={18} />
            Manual Request
          </button>
          <button className="btn-primary" onClick={() => onCreate(true)}>
            <BookOpen size={18} />
            Catalog Request
          </button>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="empty-state premium-card">
          <div className="empty-icon"><Search size={48} /></div>
          <h3>No requests found</h3>
          <p>You haven't submitted any service requests yet.</p>
          <button className="btn-secondary" onClick={onCreate} style={{ marginTop: '16px' }}>Start your first request</button>
        </div>
      ) : (
        <div className="request-grid">
          {requests.map(req => (
            <div key={req.requestId} className="request-card premium-card" onClick={() => onSelect(req.requestId)}>
              <div className="card-top">
                <span className="request-id">REQ-{req.requestId}</span>
                <div className="card-status-group">
                  {isEditable(req.status) && <span className="editable-tag" title="Edit/Delete Available">🛠️</span>}
                  {getStatusBadge(req.status)}
                </div>
              </div>
              <h3 className="card-title">{req.title}</h3>
              <div className="card-footer-meta">
                <div className="meta-left">
                  {getPriorityTag(req.priority)}
                  <div className="meta-item">
                    <Calendar size={14} />
                    {new Date(req.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <ChevronRight size={18} className="arrow-icon" />
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .request-list-container { animation: fadeIn 0.4s ease; }
        
        .list-header { 
          display: flex; justify-content: space-between; align-items: flex-end; 
          margin-bottom: 32px; border-bottom: 1px solid var(--color-border-soft); padding-bottom: 24px;
        }
        .title-area h2 { font-size: 28px; font-weight: 800; color: var(--color-text-main); margin: 0; }
        .title-area p { color: var(--color-text-dim); margin: 6px 0 0 0; font-size: 15px; }

        .request-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 24px; }
        
        .request-card { 
          padding: 24px; cursor: pointer; display: flex; flex-direction: column; min-height: 180px;
          border: 1px solid var(--color-border);
        }
        .request-card:hover { border-color: var(--color-primary); }
        .request-card:hover .arrow-icon { transform: translateX(4px); color: var(--color-primary); }
        
        .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .request-id { font-size: 12px; font-weight: 700; color: var(--color-text-dim); letter-spacing: 0.5px; }
        
        .status-badge { 
          display: flex; align-items: center; gap: 6px; 
          padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase;
        }

        .card-title { font-size: 18px; font-weight: 700; color: var(--color-text-main); margin-bottom: 24px; flex: 1; line-height: 1.4; }
        
        .card-footer-meta { display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px dashed var(--color-border-soft); }
        .meta-left { display: flex; gap: 20px; }
        .meta-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--color-text-dim); font-weight: 500; }
        .priority-tag { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
        
        .arrow-icon { color: var(--color-border); transition: var(--transition); }

        .empty-state { 
          padding: 80px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px;
          background: var(--color-surface-soft); border: 2px dashed var(--color-border);
        }
        .empty-icon { color: var(--color-border); margin-bottom: 8px; }
        .empty-state h3 { margin: 0; color: var(--color-text-main); font-size: 20px; font-weight: 700; }
        .empty-state p { margin: 0; color: var(--color-text-dim); }

        .header-actions { display: flex; gap: 12px; }
        
        .card-status-group { display: flex; align-items: center; gap: 8px; }
        .editable-tag { font-size: 14px; opacity: 0.6; }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default RequestList;
