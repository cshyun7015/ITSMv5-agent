import React, { useEffect, useState } from 'react';
import { requestApi } from '../api/requestApi';
import { ServiceRequest, ApprovalStep, AttachmentInfo, ServiceRequestPriority, ServiceRequestStatus, CodeDTO } from '../types';
import { useToast } from '../../../hooks/useToast';
import { ArrowLeft, Edit2, Trash2, Save, X, Paperclip, ShieldCheck, Info, Calendar, User, Building, Hash } from 'lucide-react';
import './../requests.css';

interface RequestDetailProps {
  requestId: number;
  onBack: () => void;
  onSuccess: () => void;
}

const RequestDetail: React.FC<RequestDetailProps> = ({ requestId, onBack, onSuccess }) => {
  const { toast } = useToast();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [approvals, setApprovals] = useState<ApprovalStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState<ServiceRequestPriority>('NORMAL');
  const [editStatus, setEditStatus] = useState<ServiceRequestStatus>('DRAFT');
  const [editResolution, setEditResolution] = useState('');
  const [editAssigneeId, setEditAssigneeId] = useState<number | null>(null);
  const [editRequesterId, setEditRequesterId] = useState<number | null>(null);
  const [priorityOptions, setPriorityOptions] = useState<CodeDTO[]>([]);
  const [statusOptions, setStatusOptions] = useState<CodeDTO[]>([]);
  const [operators, setOperators] = useState<any[]>([]);
  const [tenantUsers, setTenantUsers] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    loadOptions();
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
      
      // Initialize Edit States
      setEditTitle(reqData.title);
      setEditDescription(reqData.description);
      setEditPriority(reqData.priority);
      setEditStatus(reqData.status);
      setEditResolution(reqData.resolution || '');
      setEditAssigneeId(null);
      setEditRequesterId(null);
      // 고객사 사용자 목록 로드 (대리 요청자 선택용)
      if (reqData.tenantId) {
        requestApi.getTenantUsers(reqData.tenantId).then(setTenantUsers).catch(() => []);
      }
    } catch (error) {
      console.error('Failed to load request details', error);
      toast.error('Failed to load request details');
    } finally {
      setIsLoading(false);
    }
  };

  const loadOptions = async () => {
    try {
      const [pData, sData, opData] = await Promise.all([
        requestApi.getCodesByGroup('SR_PRIORITY').catch(() => []),
        requestApi.getCodesByGroup('SR_STATUS').catch(() => []),
        requestApi.getOperators().catch(() => [])
      ]);
      setPriorityOptions(pData);
      setStatusOptions(sData);
      setOperators(opData);
    } catch (err) {
      console.error('Failed to load options', err);
    }
  };

  const handleToggleEdit = () => {
    if (isEditing && request) {
      // Revert if canceling
      setEditTitle(request.title);
      setEditDescription(request.description);
      setEditPriority(request.priority);
      setEditStatus(request.status);
      setEditResolution(request.resolution || '');
    }
    setIsEditing(!isEditing);
  };

  const handleSaveChanges = async () => {
    if (!editTitle.trim()) {
      toast.warning('Title is required');
      return;
    }
    setIsSubmitting(true);
    try {
      await requestApi.updateRequest(requestId, {
        title: editTitle,
        description: editDescription,
        priority: editPriority,
        status: editStatus,
        resolution: editResolution,
        ...(editAssigneeId !== null && { assigneeId: editAssigneeId }),
        ...(editRequesterId !== null && { requesterId: editRequesterId }),
      });
      toast.success('Changes saved successfully');
      await loadData();
      setIsEditing(false);
      onSuccess();
    } catch (error) {
      toast.error('Failed to save changes');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssign = async () => {
    setIsSubmitting(true);
    try {
      await requestApi.assignToMe(requestId);
      toast.success('Request assigned to you');
      await loadData();
      onSuccess();
    } catch (error) {
      toast.error('Failed to assign request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this request permanently? This action is irreversible.')) return;
    setIsSubmitting(true);
    try {
      await requestApi.deleteRequest(requestId);
      toast.success('Request deleted');
      onSuccess();
      onBack();
    } catch (error) {
      toast.error('Deletion failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="loading-container"><div className="loading-spinner"></div><p>Accessing Mission Log...</p></div>;
  if (!request) return <div className="error-container"><h1>404</h1><p>Request Trace Hidden or Lost.</p><button onClick={onBack} className="btn-primary">Back to Board</button></div>;

  const isFieldEditable = (field: string) => {
    const status = request.status;
    const matrix: Record<string, ServiceRequestStatus[]> = {
      title:       ['DRAFT', 'OPEN'],
      description: ['DRAFT', 'OPEN'],
      priority:    ['DRAFT', 'OPEN', 'IN_PROGRESS'],
      status:      ['DRAFT', 'OPEN', 'IN_PROGRESS', 'RESOLVED'], // Allow DRAFT -> OPEN
      resolution:  ['IN_PROGRESS', 'RESOLVED'],
      tenant:      ['DRAFT'],
      catalog:     ['DRAFT'],
      attachments: ['DRAFT', 'OPEN', 'IN_PROGRESS'],
      requester:   ['DRAFT'],
      assignee:    ['OPEN', 'IN_PROGRESS'],
      // System fields are always locked
      requestNo:   [],
      sla:         [],
      createdAt:   [],
      submittedAt: [],
      resolvedAt:  [],
      closedAt:    [],
    };
    // If status is CLOSED or REJECTED, nothing should be editable regardless of matrix
    if (status === 'CLOSED' || status === 'REJECTED') return false;
    
    return (matrix[field] ?? []).includes(status);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  return (
    <div className={`request-detail-view ${isEditing ? 'editing-mode' : ''}`} data-testid="request-detail-view">
      <header className="detail-header">
        <div className="header-top">
          {!isEditing && (
            <button className="btn-back" onClick={onBack} data-testid="btn-back">
              <ArrowLeft size={18} /> Back to List
            </button>
          )}
          
          <div className="header-actions" style={{ marginLeft: isEditing ? 'auto' : '0' }}>
            {!isEditing ? (
              <>
                {request.status !== 'CLOSED' && request.status !== 'REJECTED' && (
                  <button className="btn-primary" onClick={handleToggleEdit} data-testid="btn-edit-request">
                    <Edit2 size={16} /> Edit Request
                  </button>
                )}
                <button className="btn-danger-ghost" onClick={handleDelete} disabled={isSubmitting} data-testid="btn-delete-request">
                  <Trash2 size={16} /> Delete
                </button>
              </>
            ) : (
              <>
                <button className="btn-cancel-standard" onClick={handleToggleEdit} disabled={isSubmitting}>
                  <X size={16} /> Cancel
                </button>
                <button className="btn-primary" onClick={handleSaveChanges} disabled={isSubmitting} data-testid="btn-save-request">
                  <Save size={16} /> Save Changes
                </button>
              </>
            )}
          </div>
        </div>

        <div className="header-main">
          <div className="id-tag"><Hash size={14} /> {request.requestNo}</div>
          {isEditing && isFieldEditable('title') ? (
            <input 
              type="text" 
              className="title-edit-input" 
              value={editTitle} 
              onChange={e => setEditTitle(e.target.value)}
              placeholder="Enter Request Title"
              autoFocus
            />
          ) : (
            <h1>{request.title}</h1>
          )}
          <div className={`status-badge ${request.status.toLowerCase()}`}>{request.status}</div>
        </div>
      </header>

      <div className="detail-layout">
        <div className="main-content-area">
          {/* Comprehensive Attributes Grid */}
          <section className="detail-section attributes-grid-section">
            <div className="section-header">
              <Info size={18} />
              <span className="section-title">All System Attributes</span>
            </div>
            
            <div className="attributes-table">
              <div className="attr-group">
                <div className="group-label">Core Identity</div>
                <div className="attr-row">
                  <span className="attr-label">Request No</span>
                  <span className="attr-value mono">{request.requestNo}</span>
                </div>
                <div className="attr-row">
                  <span className="attr-label">Customer Organization</span>
                  <span className="attr-value"><Building size={14} /> {request.tenantId}</span>
                </div>
                <div className="attr-row">
                  <span className="attr-label">Service Catalog</span>
                  <span className="attr-value">{request.catalogName || 'Default Catalog'}</span>
                </div>
              </div>

              <div className="attr-group">
                <div className="group-label">Lifecycle Events</div>
                <div className="attr-row">
                  <span className="attr-label"><Calendar size={14} /> Created At</span>
                  <span className="attr-value">{formatDate(request.createdAt)}</span>
                </div>
                <div className="attr-row">
                  <span className="attr-label"><Calendar size={14} /> Submitted At</span>
                  <span className="attr-value">{formatDate(request.submittedAt)}</span>
                </div>
                <div className="attr-row">
                  <span className="attr-label"><Calendar size={14} /> Resolved At</span>
                  <span className="attr-value">{formatDate(request.resolvedAt)}</span>
                </div>
                <div className="attr-row">
                  <span className="attr-label"><Calendar size={14} /> Closed At</span>
                  <span className="attr-value">{formatDate(request.closedAt)}</span>
                </div>
              </div>

              <div className="attr-group">
                <div className="group-label">Assignments & Priority</div>
                <div className="attr-row">
                  <span className="attr-label"><User size={14} /> Requester</span>
                  {isEditing && isFieldEditable('requester') ? (
                    <select
                      className="attr-select"
                      value={editRequesterId ?? ''}
                      onChange={e => setEditRequesterId(e.target.value ? Number(e.target.value) : null)}
                    >
                      <option value="">— Keep current ({request.requesterName}) —</option>
                      {tenantUsers.map(u => (
                        <option key={u.id || u.memberId} value={u.id || u.memberId}>{u.name || u.username}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="attr-value">{request.requesterName}</span>
                  )}
                </div>
                <div className="attr-row">
                  <span className="attr-label"><User size={14} /> Current Assignee</span>
                  {isEditing && isFieldEditable('assignee') ? (
                    <select
                      className="attr-select"
                      value={editAssigneeId ?? ''}
                      onChange={e => setEditAssigneeId(e.target.value ? Number(e.target.value) : null)}
                    >
                      <option value="">— Keep current ({request.assigneeName ?? 'Unassigned'}) —</option>
                      {operators.map(op => (
                        <option key={op.id || op.memberId} value={op.id || op.memberId}>{op.name || op.username}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="attr-value">{request.assigneeName || 'Unassigned'}</span>
                  )}
                </div>
                <div className="attr-row">
                  <span className="attr-label">Priority Level</span>
                  {isEditing ? (
                    <select 
                      className="attr-select" 
                      value={editPriority} 
                      onChange={e => setEditPriority(e.target.value as ServiceRequestPriority)}
                      disabled={!isFieldEditable('priority')}
                    >
                      {priorityOptions.map(opt => (
                        <option key={opt.codeId} value={opt.codeId}>{opt.codeName}</option>
                      ))}
                    </select>
                  ) : (
                    <span className={`priority-pill ${request.priority}`}>{request.priority}</span>
                  )}
                </div>
                <div className="attr-row">
                  <span className="attr-label">Current Status</span>
                  {isEditing && isFieldEditable('status') ? (
                    <select 
                      className="attr-select" 
                      value={editStatus} 
                      onChange={e => setEditStatus(e.target.value as ServiceRequestStatus)}
                    >
                      {statusOptions.map(opt => (
                        <option key={opt.codeId} value={opt.codeId}>{opt.codeId} - {opt.codeName}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="attr-value-badge">{request.status}</span>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="detail-section">
            <div className="section-header">
              <span className="section-title">Request Description</span>
            </div>
            {isEditing ? (
              <textarea 
                className="description-edit-area" 
                value={editDescription}
                onChange={e => setEditDescription(e.target.value)}
                rows={10}
                disabled={!isFieldEditable('description')}
              />
            ) : (
              <div className="description-box">{request.description}</div>
            )}
          </section>

          {(isEditing || ['IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(request.status)) && (
            <section className="detail-section resolution-sec">
              <div className="section-header">
                <span className="section-title">Resolution & Fulfillment</span>
              </div>
              {isEditing ? (
                <textarea 
                  className="description-edit-area resolution-input" 
                  value={editResolution}
                  onChange={e => setEditResolution(e.target.value)}
                  placeholder="Enter resolution summary..."
                  rows={4}
                />
              ) : (
                <div className="description-box">
                  {request.resolution || 'No resolution recorded.'}
                </div>
              )}
            </section>
          )}
        </div>

        <aside className="side-panel">
          <section className="detail-section">
            <div className="section-header">
              <ShieldCheck size={18} />
              <span className="section-title">Governance Track</span>
            </div>
            <div className="approval-track">
              {approvals.map((step, idx) => (
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
                  </div>
                </div>
              ))}
              {approvals.length === 0 && <div className="no-data">No approvals required for this request type.</div>}
            </div>
          </section>

          <section className="detail-section">
            <div className="section-header">
              <Paperclip size={18} />
              <span className="section-title">Evidence Files</span>
            </div>
            {request.attachments && request.attachments.length > 0 ? (
              <div className="attachment-list">
                {request.attachments.map((att) => (
                  <div key={att.id} className="att-item" onClick={() => requestApi.downloadAttachment(att.id, att.fileName)}>
                    <span className="att-name">{att.fileName}</span>
                    <span className="att-size">{(att.fileSize / 1024).toFixed(1)} KB</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">No attachments provided.</div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
};

export default RequestDetail;
