import React, { useState, useEffect } from 'react';
import { ServiceRequest, Approver, ApprovalProgress } from '../../../types/request';
import { requestApi } from '../../../api/request';
import { memberApi } from '../../../api/member';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  User, 
  Calendar, 
  AlertCircle, 
  ExternalLink,
  History,
  FileText,
  UserCheck,
  Send,
  Info
} from 'lucide-react';

interface RequestDetailProps {
  requestId: number;
  onBack: () => void;
  onRefresh: () => void;
  onEdit: (request: ServiceRequest) => void;
  onDelete: () => void;
}

const RequestDetail: React.FC<RequestDetailProps> = ({ requestId, onBack, onRefresh, onEdit, onDelete }) => {
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

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this request?')) return;
    try {
      await requestApi.deleteRequest(requestId);
      onDelete();
    } catch (error) {
      alert('Failed to delete request');
    }
  };

  const isEditable = (status: string) => ['DRAFT', 'PENDING_APPROVAL', 'REJECTED'].includes(status);

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { color: string, icon: any }> = {
      'DRAFT': { color: '#64748b', icon: <Clock size={14} /> },
      'PENDING_APPROVAL': { color: '#f59e0b', icon: <History size={14} /> },
      'APPROVED': { color: '#10b981', icon: <CheckCircle2 size={14} /> },
      'REJECTED': { color: '#ef4444', icon: <XCircle size={14} /> }
    };
    const config = configs[status] || configs['DRAFT'];
    
    return (
      <span className="status-badge" style={{ backgroundColor: config.color + '15', color: config.color }}>
        {config.icon}
        {status.replace('_', ' ')}
      </span>
    );
  };

  if (isLoading) return <div className="loading">Initializing request view...</div>;
  if (!request) return <div className="error-state">Request data unavailable.</div>;

  return (
    <div className="detail-container">
      <div className="detail-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={18} />
          Back to List
        </button>
        <div className="header-main">
          <div className="title-area">
            <span className="request-id-pill">REQ-{request.requestId}</span>
            <h2>{request.title}</h2>
          </div>
          {getStatusBadge(request.status)}
        </div>
      </div>

      <div className="detail-grid">
        <div className="main-info">
          <section className="info-block premium-card">
            <div className="block-title">
              <FileText size={18} />
              <h3>Description</h3>
            </div>
            <div className="description-text">{request.description}</div>
          </section>

          <section className="info-block premium-card">
            <div className="block-title">
              <History size={18} />
              <h3>Progress & Approvals</h3>
            </div>
            {approvals.length === 0 ? (
              <div className="empty-mini">
                <Info size={16} />
                <span>Approval flow will start upon submission.</span>
              </div>
            ) : (
              <div className="approval-timeline">
                {approvals.map((app, idx) => (
                  <div key={app.approvalId} className={`timeline-step ${app.status.toLowerCase()}`}>
                    <div className="step-connector">
                      <div className="step-point">
                        {app.status === 'APPROVED' ? <CheckCircle2 size={12} /> : 
                         app.status === 'REJECTED' ? <XCircle size={12} /> : null}
                      </div>
                      {idx < approvals.length - 1 && <div className="step-line" />}
                    </div>
                    <div className="step-content">
                      <div className="step-main">
                        <span className="approver-name">{app.approverName}</span>
                        <span className={`step-badge ${app.status.toLowerCase()}`}>{app.status}</span>
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
          <div className="meta-info-card premium-card">
            <div className="card-subtitle">
              <Info size={16} />
              <h4>Request Overview</h4>
            </div>
            
            <div className="meta-list">
              <div className="meta-list-item">
                <span className="meta-label">Priority</span>
                <span className={`priority-tag-clean ${request.priority.toLowerCase()}`}>
                  {request.priority === 'EMERGENCY' ? <AlertCircle size={12} /> : <Clock size={12} />}
                  {request.priority}
                </span>
              </div>
              <div className="meta-list-item">
                <span className="meta-label">Requester</span>
                <div className="meta-user">
                  <User size={14} />
                  <span>{request.requesterName}</span>
                </div>
              </div>
              <div className="meta-list-item">
                <span className="meta-label">Created At</span>
                <div className="meta-time">
                  <Calendar size={14} />
                  <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              {request.deadline && (
                <div className="meta-list-item sla">
                  <span className="meta-label">SLA Deadline</span>
                  <span className="deadline-timer">{new Date(request.deadline).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          <div className="action-panel">
            {(request.status === 'DRAFT' || request.status === 'REJECTED') && (
              <button className="btn-primary w-full shadow-hover" onClick={() => setShowSubmitModal(true)} style={{ marginBottom: '12px' }}>
                <Send size={18} />
                Submit for Approval
              </button>
            )}

            {isEditable(request.status) && (
              <div className="edit-delete-group">
                <button className="btn-secondary w-full" onClick={() => onEdit(request)}>
                  <BookOpen size={18} />
                  Edit Request
                </button>
                <button className="btn-danger-outline w-full" onClick={handleDelete} style={{ marginTop: '12px' }}>
                  <XCircle size={18} />
                  Delete Request
                </button>
              </div>
            )}

            {request.status === 'PENDING_APPROVAL' && (
              <div className="approval-button-group">
                <button className="btn-primary w-full" onClick={() => handleApprovalAction(true)}>
                  <CheckCircle2 size={18} />
                  Approve Request
                </button>
                <button className="btn-danger-outline w-full" onClick={() => handleApprovalAction(false)}>
                  <XCircle size={18} />
                  Reject Request
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showSubmitModal && (
        <div className="modal-overlay glass-background">
          <div className="modal-content premium-card">
            <div className="modal-header">
              <UserCheck size={24} className="icon-gold" />
              <h3>Submit for Approval</h3>
            </div>
            <p className="modal-desc">Please designate your department manager or company admin for this service request.</p>
            
            <div className="form-group-modern">
              <label>Manager / Approver</label>
              <div className="select-wrapper">
                <select 
                  value={selectedApproverId} 
                  onChange={e => setSelectedApproverId(e.target.value)}
                >
                  <option value="">-- Choose Approver --</option>
                  {potentialApprovers.map(m => (
                    <option key={m.memberId} value={m.memberId}>{m.username} ({m.email})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setShowSubmitModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSubmit} disabled={!selectedApproverId}>
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .detail-container { max-width: 1100px; margin: 0 auto; animation: slideUp 0.4s ease; }
        
        .detail-header { margin-bottom: 32px; border-bottom: 1px solid var(--color-border-soft); padding-bottom: 24px; }
        .back-btn { 
          display: flex; align-items: center; gap: 8px; background: none; border: none; 
          color: var(--color-text-dim); font-size: 14px; font-weight: 600; cursor: pointer; margin-bottom: 20px;
          transition: var(--transition);
        }
        .back-btn:hover { color: var(--color-primary); transform: translateX(-4px); }
        
        .header-main { display: flex; justify-content: space-between; align-items: flex-end; }
        .request-id-pill { font-size: 12px; font-weight: 800; color: var(--color-primary); background: var(--color-primary-soft); padding: 4px 10px; border-radius: 20px; border: 1px solid rgba(59, 130, 246, 0.2); }
        .header-main h2 { font-size: 32px; font-weight: 800; color: var(--color-text-main); margin: 8px 0 0 0; letter-spacing: -0.5px; }
        
        .status-badge { display: flex; align-items: center; gap: 8px; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 700; text-transform: uppercase; }

        .detail-grid { display: grid; grid-template-columns: 1fr 340px; gap: 32px; }
        
        .info-block { padding: 32px; margin-bottom: 32px; border: 1px solid var(--color-border); }
        .block-title { display: flex; align-items: center; gap: 10px; color: var(--color-text-dim); margin-bottom: 24px; border-bottom: 1px solid var(--color-border-soft); padding-bottom: 12px; }
        .block-title h3 { font-size: 15px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin: 0; }
        .description-text { font-size: 16px; line-height: 1.7; color: var(--color-text-sub); white-space: pre-wrap; }

        .meta-info-card { padding: 28px; background: var(--color-surface); }
        .card-subtitle { display: flex; align-items: center; gap: 8px; color: var(--color-text-dim); margin-bottom: 24px; }
        .card-subtitle h4 { font-size: 13px; font-weight: 800; text-transform: uppercase; margin: 0; letter-spacing: 0.5px; }

        .meta-list { display: flex; flex-direction: column; gap: 20px; }
        .meta-list-item { display: flex; flex-direction: column; gap: 6px; }
        .meta-label { font-size: 12px; font-weight: 600; color: var(--color-text-dim); }
        .meta-user, .meta-time { display: flex; align-items: center; gap: 8px; font-weight: 700; color: var(--color-text-main); font-size: 15px; }
        .priority-tag-clean { width: fit-content; display: flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 800; border: 1px solid; }
        .priority-tag-clean.emergency { color: #ef4444; border-color: rgba(239, 68, 68, 0.2); }
        .priority-tag-clean.normal { color: #f59e0b; border-color: rgba(245, 158, 11, 0.2); }
        .priority-tag-clean.low { color: #10b981; border-color: rgba(16, 185, 129, 0.2); }
        
        .meta-list-item.sla { background: #fef2f2; padding: 12px; border-radius: 8px; border: 1px solid #fee2e2; }
        .deadline-timer { font-size: 14px; font-weight: 800; color: #ef4444; }

        .approval-timeline { display: flex; flex-direction: column; padding-left: 10px; }
        .timeline-step { display: flex; gap: 24px; position: relative; padding-bottom: 32px; }
        .timeline-step:last-child { padding-bottom: 0; }
        .step-connector { display: flex; flex-direction: column; align-items: center; }
        .step-point { 
          width: 24px; height: 24px; border-radius: 50%; background: var(--color-border-soft); 
          display: flex; align-items: center; justify-content: center; color: #fff; z-index: 2;
        }
        .step-line { width: 2px; flex: 1; background: var(--color-border-soft); margin: 4px 0; }
        .timeline-step.approved .step-point { background: var(--status-active); }
        .timeline-step.approved .step-line { background: var(--status-active); }
        .timeline-step.pending .step-point { background: var(--status-pending); animation: borderPulse 2s infinite; }
        .timeline-step.rejected .step-point { background: #ef4444; }

        .step-main { display: flex; align-items: center; gap: 12px; margin-bottom: 4px; }
        .approver-name { font-weight: 700; color: var(--color-text-main); }
        .step-badge { font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 2px 8px; border-radius: 4px; }
        .step-badge.pending { color: var(--status-pending); background: rgba(245, 158, 11, 0.1); }
        .step-badge.approved { color: var(--status-active); background: rgba(16, 185, 129, 0.1); }
        .step-badge.rejected { color: #ef4444; background: rgba(239, 68, 68, 0.1); }
        .step-comment { margin: 4px 0 0 0; font-size: 14px; font-style: italic; color: var(--color-text-dim); }

        .action-panel { margin-top: 32px; }
        .approval-button-group { display: flex; flex-direction: column; gap: 12px; }
        .btn-danger-outline { 
          display: flex; align-items: center; justify-content: center; gap: 8px;
          background: #fff; border: 1px solid #ef4444; color: #ef4444; 
          padding: 14px; border-radius: 10px; font-weight: 700; cursor: pointer; transition: var(--transition);
        }
        .btn-danger-outline:hover { background: #fef2f2; }

        .modal-overlay.glass-background { background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); }
        .modal-content { padding: 40px; width: 500px; border-radius: var(--radius-xl); box-shadow: var(--shadow-premium); }
        .modal-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
        .modal-header h3 { font-size: 24px; font-weight: 800; color: var(--color-text-main); margin: 0; }
        .modal-desc { color: var(--color-text-dim); font-size: 15px; margin-bottom: 32px; line-height: 1.5; }
        .icon-gold { color: #f59e0b; }
        
        .form-group-modern label { font-size: 14px; font-weight: 700; color: var(--color-text-main); margin-bottom: 10px; display: block; }
        .select-wrapper select { 
          width: 100%; padding: 14px; border-radius: 10px; border: 1px solid var(--color-border); 
          font-family: inherit; font-size: 15px; background: var(--color-surface-soft);
        }
        
        @keyframes borderPulse { 0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); } 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default RequestDetail;
