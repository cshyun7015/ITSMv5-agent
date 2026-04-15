import React, { useState, useEffect } from 'react';
import { ServiceRequest, Approver, ApprovalProgress } from '../../../types/request';
import { requestApi } from '../../../api/request';
import { memberApi } from '../../../api/member';

interface RequestDetailProps {
  requestId: number;
  onBack: () => void;
  onRefresh: () => void;
}

const RequestDetail: React.FC<RequestDetailProps> = ({ requestId, onBack, onRefresh }) => {
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [approvals, setApprovals] = useState<ApprovalProgress[]>([]);
  const [potentialApprovers, setPotentialApprovers] = useState<Approver[]>([]);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedApproverId, setSelectedApproverId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

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

      if (reqData.status === 'DRAFT') {
        const approvers = await memberApi.getPotentialApprovers();
        setPotentialApprovers(approvers);
      }
    } catch (error) {
      console.error('Failed to load request details', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedApproverId) return;
    try {
      await requestApi.submitRequest(requestId, [parseInt(selectedApproverId)]);
      setShowSubmitModal(false);
      loadData();
      onRefresh();
    } catch (error) {
      alert('Failed to submit request');
    }
  };

  const handleApprovalAction = async (approved: boolean) => {
    const comment = prompt(approved ? 'Enter approval comment (optional):' : 'Enter rejection reason (required):');
    if (!approved && !comment) return;

    try {
      // 현재 사용자의 결재 스텝 찾기 (간이 구현: 첫 번째 PENDING 스텝)
      const myPendingStep = approvals.find(a => a.status === 'PENDING');
      if (!myPendingStep) return;

      await requestApi.processApproval(myPendingStep.approvalId, approved, comment || '');
      loadData();
      onRefresh();
    } catch (error) {
      alert('Failed to process approval');
    }
  };

  if (isLoading) return <div className="loading">Loading request details...</div>;
  if (!request) return <div>Request not found.</div>;

  return (
    <div className="detail-container">
      <div className="detail-header">
        <button className="back-link" onClick={onBack}>← Back to List</button>
        <div className="header-main">
          <h2>{request.title}</h2>
          <span className={`status-badge ${request.status.toLowerCase()}`}>{request.status}</span>
        </div>
      </div>

      <div className="detail-grid">
        <div className="main-info">
          <section className="info-section">
            <h3 className="section-title">Description</h3>
            <div className="description-text">{request.description}</div>
          </section>

          <section className="info-section">
            <h3 className="section-title">Progress & Approvals</h3>
            {approvals.length === 0 ? (
              <p className="no-data">No approval process started yet.</p>
            ) : (
              <div className="approval-timeline">
                {approvals.map(app => (
                  <div key={app.approvalId} className="timeline-item">
                    <div className={`step-dot ${app.status.toLowerCase()}`} />
                    <div className="step-content">
                      <div className="step-header">
                        <span className="approver-name">{app.approverName}</span>
                        <span className={`step-status ${app.status.toLowerCase()}`}>{app.status}</span>
                      </div>
                      {app.comment && <p className="step-comment">"{app.comment}"</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="side-info">
          <div className="meta-card">
            <h4>Request Info</h4>
            <div className="meta-row">
              <span className="label">Priority</span>
              <span className={`priority-tag ${request.priority.toLowerCase()}`}>{request.priority}</span>
            </div>
            <div className="meta-row">
              <span className="label">Requester</span>
              <span>{request.requesterName}</span>
            </div>
            <div className="meta-row">
              <span className="label">Created</span>
              <span>{new Date(request.createdAt).toLocaleString()}</span>
            </div>
            {request.deadline && (
              <div className="meta-row highlight">
                <span className="label">SLA Deadline</span>
                <span>{new Date(request.deadline).toLocaleString()}</span>
              </div>
            )}
          </div>

          {request.status === 'DRAFT' && (
            <button className="btn-primary w-full mt-20" onClick={() => setShowSubmitModal(true)}>
              Submit for Approval
            </button>
          )}

          {request.status === 'PENDING_APPROVAL' && (
            <div className="approval-actions mt-20">
              <button className="btn-primary w-full" onClick={() => handleApprovalAction(true)}>
                Approve Request
              </button>
              <button className="btn-danger w-full mt-10" onClick={() => handleApprovalAction(false)}>
                Reject
              </button>
            </div>
          )}
        </div>
      </div>

      {showSubmitModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Submit Request</h3>
            <p>Select your internal manager to approve this request.</p>
            
            <div className="form-group mt-20">
              <label>Select Approver (Company Admin)</label>
              <select 
                value={selectedApproverId} 
                onChange={e => setSelectedApproverId(e.target.value)}
                className="w-full"
              >
                <option value="">-- Choose Manager --</option>
                {potentialApprovers.map(m => (
                  <option key={m.memberId} value={m.memberId}>{m.username} ({m.email})</option>
                ))}
              </select>
            </div>

            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setShowSubmitModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSubmit} disabled={!selectedApproverId}>
                Confirm Submission
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .detail-container { max-width: 1000px; margin: 0 auto; }
        .back-link { background: none; color: var(--color-primary); margin-bottom: 20px; font-weight: 600; }
        .header-main { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
        .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 700; text-transform: uppercase; }
        .status-badge.draft { background: #f1f5f9; color: #64748b; }
        .status-badge.pending_approval { background: #fffbeb; color: #f59e0b; }
        .status-badge.approved { background: #f0fdf4; color: #16a34a; }
        .status-badge.rejected { background: #fef2f2; color: #ef4444; }
        .btn-danger { background: #ef4444; color: white; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; }
        .mt-10 { margin-top: 10px; }
        
        .detail-grid { display: grid; grid-template-columns: 1fr 300px; gap: 32px; }
        .info-section { background: white; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 24px; }
        .section-title { font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #1e293b; }
        .description-text { white-space: pre-wrap; line-height: 1.6; color: #334155; }

        .meta-card { background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; }
        .meta-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; }
        .meta-row.highlight { color: #ef4444; font-weight: 600; margin-top: 16px; border-top: 1px dashed #cbd5e1; padding-top: 12px; }
        .label { color: #64748b; }

        .approval-timeline { position: relative; padding-left: 24px; }
        .timeline-item { position: relative; padding-bottom: 24px; }
        .timeline-item:last-child { padding-bottom: 0; }
        .step-dot { position: absolute; left: -24px; top: 4px; width: 12px; height: 12px; border-radius: 50%; background: #e2e8f0; }
        .step-dot.approved { background: #16a34a; }
        .step-dot.pending { background: #f59e0b; }
        .step-content { padding-left: 12px; }
        .step-header { display: flex; gap: 12px; align-items: center; }
        .approver-name { font-weight: 600; }
        .step-status { font-size: 11px; text-transform: uppercase; font-weight: 700; }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-content { background: white; padding: 32px; border-radius: 16px; width: 440px; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 32px; }
        
        .w-full { width: 100%; }
        .mt-20 { margin-top: 20px; }
      `}</style>
    </div>
  );
};

export default RequestDetail;
