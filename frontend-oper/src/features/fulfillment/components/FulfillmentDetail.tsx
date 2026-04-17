import React, { useEffect, useState } from 'react';
import { fulfillmentApi } from '../api/fulfillmentApi';
import apiClient from '../../../api/client';
import { ServiceRequest, ApprovalStep, AttachmentInfo } from '../types';
import RequestFormModal from './RequestFormModal';

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
  const [showEditModal, setShowEditModal] = useState(false);

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

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this operational entry? This action is tracked.')) return;
    setIsSubmitting(true);
    try {
      await fulfillmentApi.deleteRequest(requestId);
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
    <div className="fulfillment-detail-view">
      <header className="detail-header">
        <button className="back-link" onClick={onBack}>← Back to Board</button>
        <div className="title-row">
            <span className="id-tag">SR-{request.requestId}</span>
            <h1>{request.title}</h1>
            <div className={`status-pill ${request.status}`}>{request.status}</div>
            
            <div className="header-actions">
              <button className="icon-btn edit" onClick={() => setShowEditModal(true)} title="Edit Request">
                ✎ Edit
              </button>
              <button className="icon-btn delete" onClick={handleDelete} title="Delete Request" disabled={isSubmitting}>
                🗑 Delete
              </button>
            </div>
        </div>
      </header>

      <div className="detail-layout">
        <div className="content-side">
          <section className="detail-sec">
            <h3>Request Description</h3>
            <div className="description-box">{request.description}</div>
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
                />
              ) : (
                <div className="description-box">{request.resolution}</div>
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
                  <div key={att.id} className="att-item" onClick={() => fulfillmentApi.downloadAttachment(att.id, att.fileName)}>
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
              <button className="btn-primary" onClick={handleAssign} disabled={isSubmitting}>
                Take Assignment
              </button>
            )}
            {request.status === 'IN_PROGRESS' && (
              <button className="btn-success" onClick={handleResolve} disabled={isSubmitting}>
                Commit Resolution
              </button>
            )}
            {request.status === 'RESOLVED' && (
              <button className="btn-dark" onClick={handleClose} disabled={isSubmitting}>
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

      <style>{`
        .fulfillment-detail-view { color: #f1f5f9; }
        
        .detail-header { margin-bottom: 32px; }
        .back-link { background: none; border: none; color: #3b82f6; cursor: pointer; font-size: 14px; margin-bottom: 12px; }
        .title-row { display: flex; align-items: center; gap: 16px; }
        .id-tag { font-size: 14px; color: #64748b; font-family: monospace; background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 4px; }
        .title-row h1 { font-size: 28px; margin: 0; font-weight: 700; color: #fff; }
        
        .status-pill { font-size: 12px; font-weight: 800; padding: 4px 12px; border-radius: 6px; }
        .status-pill.OPEN { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
        .status-pill.IN_PROGRESS { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
        .status-pill.RESOLVED { background: rgba(16, 185, 129, 0.2); color: #34d399; }

        .detail-layout { display: grid; grid-template-columns: 1fr 320px; gap: 32px; }

        .detail-sec { margin-bottom: 40px; }
        .detail-sec h3 { font-size: 16px; color: #94a3b8; margin-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px; }
        .description-box { background: rgba(255,255,255,0.02); padding: 20px; border-radius: 12px; line-height: 1.6; border: 1px solid rgba(255,255,255,0.05); }

        .approval-track { display: flex; flex-direction: column; gap: 0; }
        .track-item { display: flex; gap: 20px; }
        .track-line { display: flex; flex-direction: column; align-items: center; width: 24px; }
        .track-node { width: 12px; height: 12px; border-radius: 50%; border: 2px solid #334155; background: #0f172a; flex-shrink: 0; margin-top: 6px; }
        .line-seg { width: 2px; flex: 1; background: #334155; }
        .track-item.APPROVED .track-node { border-color: #10b981; background: #10b981; }
        .track-item.APPROVED .line-seg { background: #10b981; }
        .track-item.PENDING .track-node { border-color: #3b82f6; }

        .track-content { padding-bottom: 24px; flex: 1; }
        .approver-info { display: flex; align-items: center; gap: 12px; }
        .approver-info .name { font-weight: 600; }
        .status-label { font-size: 10px; font-weight: 800; padding: 1px 6px; border-radius: 4px; }
        .status-label.APPROVED { background: rgba(16, 185, 129, 0.1); color: #34d399; }
        .status-label.PENDING { background: rgba(59, 130, 246, 0.1); color: #60a5fa; }
        .comment { font-size: 13px; color: #94a3b8; font-style: italic; margin-top: 4px; }

        .resolution-editor { width: 100%; min-height: 150px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #fff; padding: 16px; font-family: inherit; font-size: 14px; outline: none; transition: border-color 0.2s; }
        .resolution-editor:focus { border-color: #3b82f6; }

        .meta-side { display: flex; flex-direction: column; gap: 24px; }
        .meta-card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 24px; }
        .meta-card h3 { font-size: 14px; color: #64748b; margin-top: 0; margin-bottom: 20px; }
        .meta-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 13px; }
        .meta-row .label { color: #94a3b8; }
        .meta-row .value { font-weight: 600; }
        .value.p-P1 { color: #ef4444; }

        .attachment-list { display: flex; flex-direction: column; gap: 12px; }
        .att-item { 
          display: flex; gap: 12px; align-items: center; padding: 8px; 
          background: rgba(0,0,0,0.2); border-radius: 8px; cursor: pointer; transition: all 0.2s;
        }
        .att-item:hover { background: rgba(59, 130, 246, 0.1); border-color: #3b82f6; }
        .att-icon { font-size: 16px; }
        .att-info { display: flex; flex-direction: column; gap: 2px; }
        .att-name { font-size: 13px; font-weight: 600; color: #fff; line-break: anywhere; }
        .att-size { font-size: 11px; color: #64748b; }

        .btn-primary, .btn-success, .btn-dark { width: 100%; padding: 14px; border-radius: 10px; font-weight: 700; border: none; cursor: pointer; transition: transform 0.1s; }
        .btn-primary { background: #3b82f6; color: #fff; }
        .btn-success { background: #10b981; color: #fff; }
        .btn-dark { background: #334155; color: #fff; }
        button:active { transform: scale(0.98); }

        .header-actions { display: flex; gap: 8px; margin-left: auto; }
        .icon-btn {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          color: #94a3b8; padding: 6px 12px; border-radius: 6px; font-size: 12px;
          cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 4px;
        }
        .icon-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .icon-btn.edit:hover { border-color: #3b82f6; color: #60a5fa; }
        .icon-btn.delete:hover { border-color: #ef4444; color: #f87171; }
        .icon-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .loading, .error { padding: 80px; text-align: center; color: #64748b; }
      `}</style>
    </div>
  );
};

export default FulfillmentDetail;
