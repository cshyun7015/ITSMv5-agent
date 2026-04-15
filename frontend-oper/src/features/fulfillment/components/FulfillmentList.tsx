import React, { useEffect, useState } from 'react';
import { fulfillmentApi } from '../api/fulfillmentApi';
import { ServiceRequest } from '../types';

interface FulfillmentListProps {
  onSelectRequest: (id: number) => void;
}

const FulfillmentList: React.FC<FulfillmentListProps> = ({ onSelectRequest }) => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await fulfillmentApi.getAllRequests();
      setRequests(data);
    } catch (error) {
      console.error('Failed to load requests', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRequests = requests.filter(req => 
    filterStatus === 'ALL' || req.status === filterStatus
  );

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'OPEN': return 'badge-open';
      case 'IN_PROGRESS': return 'badge-progress';
      case 'RESOLVED': return 'badge-resolved';
      case 'EMERGENCY': return 'badge-emergency';
      default: return 'badge-default';
    }
  };

  if (isLoading) return <div className="loading">Loading requests...</div>;

  return (
    <div className="fulfillment-container">
      <div className="fulfillment-header">
        <h2>Service Fulfillment Board</h2>
        <div className="filter-group">
          {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map(status => (
            <button 
              key={status}
              className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
              onClick={() => setFilterStatus(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="ticket-grid">
        {filteredRequests.map(req => (
          <div key={req.requestId} className="ticket-card" onClick={() => onSelectRequest(req.requestId)}>
            <div className="ticket-id">#{req.requestId}</div>
            <div className={`ticket-status ${getStatusBadgeClass(req.status)}`}>{req.status}</div>
            <div className="ticket-tenant">{req.tenantId}</div>
            <h3 className="ticket-title">{req.title}</h3>
            <div className="ticket-footer">
              <span className={`priority-tag ${req.priority}`}>{req.priority}</span>
              <span className="requester-name">👤 {req.requesterName}</span>
            </div>
            {req.slaDeadline && (
              <div className="sla-warning">
                ⏰ Deadline: {new Date(req.slaDeadline).toLocaleString()}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <div className="empty-state">No requests found matching your criteria.</div>
      )}
    </div>
  );
};

export default FulfillmentList;
