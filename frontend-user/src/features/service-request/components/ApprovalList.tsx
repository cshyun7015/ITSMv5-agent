import React, { useState, useEffect } from 'react';
import { requestApi } from '../../../api/request';
import { ServiceRequest } from '../../../types/request';
import { ShieldCheck, User, Clock, ExternalLink, Inbox, Search } from 'lucide-react';

interface ApprovalListProps {
  onSelect: (requestId: number) => void;
}

const ApprovalList: React.FC<ApprovalListProps> = ({ onSelect }) => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadApprovals();
  }, []);

  const loadApprovals = async () => {
    try {
      // 테넌트 전체 목록을 가져온 후 PENDING_APPROVAL 상태인 것만 필터링 (간이 구현)
      const data = await requestApi.getRequests();
      setRequests(data.filter(r => r.status === 'PENDING_APPROVAL'));
    } catch (error) {
      console.error('Failed to load approvals');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="approval-list-container">
      <div className="list-header">
        <div className="title-area">
          <div className="title-with-icon">
            <ShieldCheck size={28} className="icon-primary" />
            <h2>Pending Approvals</h2>
          </div>
          <p>Review and process incoming IT service requests from your department</p>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-state">
           <div className="spinner" />
           <p>Scanning pending tasks...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="empty-state premium-card">
          <div className="empty-icon"><Inbox size={48} /></div>
          <h3>All Clear!</h3>
          <p>There are no service requests currently awaiting your approval.</p>
        </div>
      ) : (
        <div className="table-wrapper premium-card">
          <table className="modern-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Requester</th>
                <th>Request Title</th>
                <th>Priority</th>
                <th>Submitted Date</th>
                <th className="action-col">Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req.requestId} onClick={() => onSelect(req.requestId)}>
                  <td className="id-cell">REQ-{req.requestId}</td>
                  <td className="user-cell">
                    <User size={14} />
                    {req.requesterName}
                  </td>
                  <td className="title-cell">{req.title}</td>
                  <td>
                    <span className={`priority-pill ${req.priority.toLowerCase()}`}>
                       <Clock size={12} />
                       {req.priority}
                    </span>
                  </td>
                  <td className="date-cell">{new Date(req.createdAt).toLocaleDateString()}</td>
                  <td className="action-col">
                    <button className="review-btn" onClick={(e) => { e.stopPropagation(); onSelect(req.requestId); }}>
                      Review
                      <ExternalLink size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .approval-list-container { animation: fadeIn 0.4s ease; }
        
        .list-header { margin-bottom: 32px; border-bottom: 1px solid var(--color-border-soft); padding-bottom: 24px; }
        .title-with-icon { display: flex; align-items: center; gap: 16px; margin-bottom: 8px; }
        .icon-primary { color: var(--color-primary); }
        .title-area h2 { font-size: 28px; font-weight: 800; color: var(--color-text-main); margin: 0; letter-spacing: -0.5px; }
        .title-area p { color: var(--color-text-dim); margin: 0; font-size: 15px; }

        .table-wrapper { overflow: hidden; border: 1px solid var(--color-border); }
        .modern-table { width: 100%; border-collapse: collapse; text-align: left; }
        
        .modern-table th { 
          background: var(--color-surface-soft); padding: 16px 24px; 
          font-size: 13px; font-weight: 700; color: var(--color-text-dim); 
          text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--color-border);
        }
        
        .modern-table tr { cursor: pointer; transition: var(--transition); }
        .modern-table tr:hover { background: var(--color-primary-soft); }
        
        .modern-table td { padding: 20px 24px; border-bottom: 1px solid var(--color-border-soft); font-size: 15px; color: var(--color-text-sub); }
        
        .id-cell { font-family: 'Mono', monospace; font-weight: 700; color: var(--color-primary); font-size: 13px; }
        .user-cell { display: flex; align-items: center; gap: 8px; font-weight: 600; color: var(--color-text-main); }
        .title-cell { font-weight: 600; color: var(--color-text-main); }
        
        .priority-pill { 
          display: inline-flex; align-items: center; gap: 6px; 
          padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 800; border: 1px solid;
          text-transform: uppercase;
        }
        .priority-pill.emergency { color: #ef4444; border-color: rgba(239, 68, 68, 0.2); background: rgba(239, 68, 68, 0.05); }
        .priority-pill.normal { color: #f59e0b; border-color: rgba(245, 158, 11, 0.2); background: rgba(245, 158, 11, 0.05); }
        .priority-pill.low { color: #10b981; border-color: rgba(16, 185, 129, 0.2); background: rgba(16, 185, 129, 0.05); }

        .date-cell { color: var(--color-text-dim); font-size: 14px; }
        
        .action-col { text-align: right; }
        .review-btn { 
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--color-surface); border: 1px solid var(--color-primary); color: var(--color-primary); 
          padding: 8px 16px; border-radius: 8px; font-weight: 700; font-size: 13px; transition: var(--transition);
        }
        .review-btn:hover { background: var(--color-primary); color: #fff; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3); }

        .empty-state { 
          padding: 100px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 16px; 
          background: var(--color-surface-soft); border: 2px dashed var(--color-border);
        }
        .empty-icon { color: var(--color-border); opacity: 0.6; }
        .empty-state h3 { font-size: 22px; font-weight: 800; color: var(--color-text-main); margin: 0; }
        .empty-state p { color: var(--color-text-dim); font-size: 16px; margin: 0; }

        .loading-state { padding: 100px; text-align: center; color: var(--color-text-dim); }
        .spinner { 
          width: 40px; height: 40px; border: 3px solid var(--color-border-soft); border-top-color: var(--color-primary); 
          border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 20px;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default ApprovalList;
