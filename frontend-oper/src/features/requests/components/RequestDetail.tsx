import React, { useEffect, useState } from 'react';
import { requestApi } from '../api/requestApi';
import { ServiceRequest, ApprovalStep, AttachmentInfo } from '../types';
import RequestFormModal from './RequestFormModal';
import './../requests.css';

interface RequestDetailProps {
  requestId: number;
  onBack: () => void;
  onUpdated: () => void;
}

const RequestDetail: React.FC<RequestDetailProps> = ({ requestId, onBack, onUpdated }) => {
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [approvals, setApprovals] = useState<ApprovalStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [resolution, setResolution] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [requestId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [reqData, approvalData] = await Promise.all([
        requestApi.getRequest(requestId),
        requestApi.getApprovals(requestId)
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
      await requestApi.assignToMe(requestId);
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
      await requestApi.resolve(requestId, resolution);
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
      await requestApi.close(requestId);
      await loadData();
      onUpdated();
    } catch (error) {
      alert('Failed to close request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this operational entry? This action is tracked.')) return;
    setIsSubmitting(true);
    try {
      await requestApi.deleteRequest(requestId);
      onUpdated();
      onBack();
    } catch (error) {
      alert('Deletion failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="loading">Accessing Mission Log...</div>;
  if (!request) return <div className="error">Request Trace Hidden or Lost.</div>;

  return (
    <div className="request-detail-view" data-testid="request-detail-view">
      <header className="detail-header">
        <button className="back-link" onClick={onBack} data-testid="btn-back">← Back to Board</button>
        <div className="title-row">
            <span className="id-tag">SR-{request.requestId}</span>
            <h1>{request.title}</h1>
            <div className={`status-pill ${request.status}`} data-testid="status-pill">{request.status}</div>
            
            <div className="header-actions">
              <button 
                className="icon-btn edit" 
                onClick={() => setShowEditModal(true)} 
                title="Edit Request"
                data-testid="btn-edit-request"
              >
                ✎ Edit
              </button>
              <button 
                className="icon-btn delete" 
                onClick={handleDelete} 
                title="Delete Request" 
                disabled={isSubmitting}
                data-testid="btn-delete-request"
              >
                🗑 Delete
              </button>
            </div>
        </div>
      </header>

      <div className="detail-layout">
        <div className="content-side">
          <section className="detail-sec">
            <h3>Request Description</h3>
            <div className="description-box" data-testid="request-description">{request.description}</div>
          </section>

          <section className="detail-sec">
            <h3>Approval Governance</h3>
            <div className="approval-track">
              {approvals.map((step: ApprovalStep, idx: number) => (
                <div key={step.approvalId} className={`track-item ${step.status}`}>
                  <div className="track-line">
                    <div className="track-node"></div>
                    {idx < approvals.length - 1 && <div className="line-seg"></div>}
                  </div>
                  <div className="track-content">
                    <div className="approver-info">
                      <span className="name">{step.approverName}</span>
                      <span className={`status-label ${step.status}`}>{step.status}</span>
                    </div>
                    {step.comment && <p className="comment">"{step.comment}"</p>}
                  </div>
                </div>
              ))}
              {approvals.length === 0 && <div className="no-data">No approval governance required for this type.</div>}
            </div>
          </section>

          {['IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(request.status) && (
            <section className="detail-sec resolution-sec">
              <h3>Resolution Summary</h3>
              {request.status === 'IN_PROGRESS' ? (
                <textarea 
                  className="resolution-editor"
                  placeholder="Detail the actions taken to fulfill this request..."
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  disabled={isSubmitting}
                  data-testid="resolution-input"
                />
              ) : (
                <div className="description-box" data-testid="resolution-display">{request.resolution}</div>
              )}
            </section>
          )}
        </div>

        <aside className="meta-side">
          <div className="meta-card">
            <h3>Standard Metadata</h3>
            <div className="meta-row"><span className="label">Priority</span><span className={`value p-${request.priority}`}>{request.priority}</span></div>
            <div className="meta-row"><span className="label">Requester</span><span className="value">{request.requesterName}</span></div>
            <div className="meta-row"><span className="label">Client</span><span className="value">{request.tenantId}</span></div>
            <div className="meta-row"><span className="label">Timestamp</span><span className="value">{new Date(request.createdAt).toLocaleString()}</span></div>
            <div className="meta-row"><span className="label">Assignee</span><span className="value">{request.assigneeName || 'Requires Assignee'}</span></div>
          </div>

          {request.attachments && request.attachments.length > 0 && (
            <div className="meta-card">
              <h3>Attachments ({request.attachments.length})</h3>
              <div className="attachment-list">
                {request.attachments.map((att: AttachmentInfo) => (
                  <div 
                    key={att.id} 
                    className="att-item" 
                    onClick={() => requestApi.downloadAttachment(att.id, att.fileName)}
                    data-testid={`attachment-${att.id}`}
                  >
                    <span className="att-icon">📎</span>
                    <div className="att-info">
                      <span className="att-name">{att.fileName}</span>
                      <span className="att-size">{(att.fileSize / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="action-hub">
            {request.status === 'OPEN' && (
              <button className="btn-primary" onClick={handleAssign} disabled={isSubmitting} data-testid="btn-take-assignment">
                Take Assignment
              </button>
            )}
            {request.status === 'IN_PROGRESS' && (
              <button className="btn-success" onClick={handleResolve} disabled={isSubmitting} data-testid="btn-commit-resolution">
                Commit Resolution
              </button>
            )}
            {request.status === 'RESOLVED' && (
              <button className="btn-dark" onClick={handleClose} disabled={isSubmitting} data-testid="btn-close-request">
                Archive and Close
              </button>
            )}
          </div>
        </aside>
      </div>

      {showEditModal && request && (
        <RequestFormModal 
          request={request}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            loadData();
            onUpdated();
          }}
        />
      )}

    </div>
  );
};

export default RequestDetail;
