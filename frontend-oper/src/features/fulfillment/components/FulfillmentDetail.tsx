import React, { useEffect, useState } from 'react';
import { fulfillmentApi } from '../api/fulfillmentApi';
import { ServiceRequest, ApprovalStep } from '../types';

interface FulfillmentDetailProps {
  requestId: number;
  onBack: () => void;
  onUpdated: () => void;
}

const FulfillmentDetail: React.FC<FulfillmentDetailProps> = ({ requestId, onBack, onUpdated }) => {
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [approvals, setApprovals] = useState<ApprovalStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [resolution, setResolution] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [requestId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [reqData, approvalData] = await Promise.all([
        fulfillmentApi.getRequest(requestId),
        fulfillmentApi.getApprovals(requestId)
      ]);
      setRequest(reqData);
      setApprovals(approvalData);
      setResolution(reqData.resolution || '');
    } catch (error) {
      console.error('Failed to load request details', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async () => {
    setIsSubmitting(true);
    try {
      await fulfillmentApi.assignToMe(requestId);
      await loadData();
      onUpdated();
    } catch (error) {
      alert('Failed to assign request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolve = async () => {
    if (!resolution.trim()) {
      alert('Please enter a resolution summary');
      return;
    }
    setIsSubmitting(true);
    try {
      await fulfillmentApi.resolve(requestId, resolution);
      await loadData();
      onUpdated();
    } catch (error) {
      alert('Failed to resolve request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = async () => {
    setIsSubmitting(true);
    try {
      await fulfillmentApi.close(requestId);
      await loadData();
      onUpdated();
    } catch (error) {
      alert('Failed to close request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div>Loading details...</div>;
  if (!request) return <div>Request not found</div>;

  return (
    <div className="fulfillment-detail">
      <button className="back-btn" onClick={onBack}>← Back to List</button>

      <div className="detail-grid">
        <div className="main-info">
          <div className="info-header">
            <span className="tenant-tag">{request.tenantId}</span>
            <h1>{request.title}</h1>
            <div className={`status-badge ${request.status}`}>{request.status}</div>
          </div>

          <div className="info-section">
            <h3>Description</h3>
            <div className="content-box">{request.description}</div>
          </div>

          <div className="info-section">
            <h3>Approval History</h3>
            <div className="approval-timeline">
              {approvals.map(step => (
                <div key={step.approvalId} className="timeline-item">
                  <div className={`dot ${step.status}`}></div>
                  <div className="step-info">
                    <strong>{step.approverName}</strong>
                    <span className={`status-text ${step.status}`}>{step.status}</span>
                    {step.comment && <p className="comment">"{step.comment}"</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {request.status === 'IN_PROGRESS' || request.status === 'RESOLVED' || request.status === 'CLOSED' ? (
            <div className="info-section">
              <h3>Resolution</h3>
              {request.status === 'IN_PROGRESS' ? (
                <textarea 
                  className="resolution-input"
                  placeholder="Summarize how this issue was resolved..."
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  disabled={isSubmitting}
                />
              ) : (
                <div className="content-box">{request.resolution}</div>
              )}
            </div>
          ) : null}
        </div>

        <div className="action-sidebar">
          <div className="card-box">
            <h3>Request Info</h3>
            <p><strong>Priority:</strong> {request.priority}</p>
            <p><strong>Requester:</strong> {request.requesterName}</p>
            <p><strong>Created:</strong> {new Date(request.createdAt).toLocaleString()}</p>
            <p><strong>Assignee:</strong> {request.assigneeName || 'Unassigned'}</p>
          </div>

          <div className="actions">
            {request.status === 'OPEN' && (
              <button className="primary-btn" onClick={handleAssign} disabled={isSubmitting}>
                Assign to Me
              </button>
            )}
            {request.status === 'IN_PROGRESS' && (
              <button className="success-btn" onClick={handleResolve} disabled={isSubmitting}>
                Mark as Resolved
              </button>
            )}
            {request.status === 'RESOLVED' && (
              <button className="dark-btn" onClick={handleClose} disabled={isSubmitting}>
                Finalize Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FulfillmentDetail;
