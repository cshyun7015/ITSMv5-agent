import React, { useState, useEffect } from 'react';
import { requestApi } from '../../../api/request';
import { ServiceRequest } from '../../../types/request';

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
    <div className="approval-list">
      <div className="header">
        <h2>Requests Pending Approval</h2>
        <p>Review and process service requests from your team</p>
      </div>

      {isLoading ? (
        <div>Loading approvals...</div>
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <p>No pending approvals. Good job!</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="approval-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Requester</th>
                <th>Title</th>
                <th>Priority</th>
                <th>Requested At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req.requestId}>
                  <td>#{req.requestId}</td>
                  <td>{req.requesterName}</td>
                  <td className="title-cell">{req.title}</td>
                  <td>
                    <span className={`priority-badge ${req.priority.toLowerCase()}`}>
                      {req.priority}
                    </span>
                  </td>
                  <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn-outline" onClick={() => onSelect(req.requestId)}>Review</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .approval-list .header { margin-bottom: 24px; }
        .table-container { background: white; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
        .approval-table { width: 100%; border-collapse: collapse; }
        .approval-table th { background: #f8fafc; padding: 12px 16px; text-align: left; font-size: 13px; color: #64748b; font-weight: 600; border-bottom: 1px solid #e2e8f0; }
        .approval-table td { padding: 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
        .title-cell { font-weight: 500; }
        .btn-outline { border: 1px solid var(--color-primary); color: var(--color-primary); padding: 6px 12px; border-radius: 6px; font-weight: 600; background: white; }
        .btn-outline:hover { background: var(--color-primary); color: white; }
        .priority-badge { font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px; }
        .priority-badge.emergency { color: #ef4444; background: #fef2f2; }
        .priority-badge.normal { color: #f59e0b; background: #fffbeb; }
        .priority-badge.low { color: #10b981; background: #f0fdf4; }
      `}</style>
    </div>
  );
};

export default ApprovalList;
