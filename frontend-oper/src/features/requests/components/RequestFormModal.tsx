import React, { useState, useEffect } from 'react';
import { requestApi } from '../api/requestApi';
import { ServiceRequest, ServiceRequestPriority, CodeDTO, CreateRequestDTO, UpdateRequestDTO } from '../types';
import './../requests.css';

interface RequestFormModalProps {
  request?: ServiceRequest; // 존재하면 수정 모드, 없으면 생성 모드
  onClose: () => void;
  onSuccess: () => void;
}

const RequestFormModal: React.FC<RequestFormModalProps> = ({ request, onClose, onSuccess }) => {
  const isEdit = !!request;
  const [tenants, setTenants] = useState<any[]>([]);
  const [targetTenantId, setTargetTenantId] = useState(request?.tenantId || '');
  const [tenantUsers, setTenantUsers] = useState<any[]>([]);
  const [requesterId, setRequesterId] = useState<number | ''>('');
  const [useManualRequester, setUseManualRequester] = useState(false);
  
  const [title, setTitle] = useState(request?.title || '');
  const [description, setDescription] = useState(request?.description || '');
  const [priority, setPriority] = useState<ServiceRequestPriority>(request?.priority || 'NORMAL');
  const [priorityOptions, setPriorityOptions] = useState<CodeDTO[]>([]);
  const [status, setStatus] = useState(request?.status || 'DRAFT');
  const [statusOptions, setStatusOptions] = useState<CodeDTO[]>([]);
  const [resolution, setResolution] = useState(request?.resolution || '');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadStatusOptions();
    loadPriorityOptions();
    if (!isEdit) {
      loadTenants();
    }
  }, []);

  const loadStatusOptions = async () => {
    try {
      const data = await requestApi.getCodesByGroup('SR_STATUS');
      setStatusOptions(data);
    } catch (error) {
      console.error('Failed to load status options', error);
    }
  };

  const loadPriorityOptions = async () => {
    try {
      const data = await requestApi.getCodesByGroup('SR_PRIORITY');
      setPriorityOptions(data);
    } catch (error) {
      console.error('Failed to load priority options', error);
    }
  };

  useEffect(() => {
    if (targetTenantId && useManualRequester) {
      loadTenantUsers(targetTenantId);
    } else {
      setTenantUsers([]);
      setRequesterId('');
    }
  }, [targetTenantId, useManualRequester]);

  const loadTenants = async () => {
    try {
      const data = await requestApi.getTenants();
      setTenants(data);
      if (data.length > 0 && !targetTenantId) {
        setTargetTenantId(data[0].tenantId);
      }
    } catch (error) {
      console.error('Failed to load tenants', error);
    }
  };

  const loadTenantUsers = async (tId: string) => {
    try {
      const data = await requestApi.getTenantUsers(tId);
      setTenantUsers(data);
    } catch (error) {
      console.error('Failed to load tenant users', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (isEdit) {
        const dto: UpdateRequestDTO = {
          title, description, priority, status, resolution
        };
        await requestApi.updateRequest(request!.requestId, dto, files);
      } else {
        const dto: CreateRequestDTO = {
          title,
          description,
          priority,
          targetTenantId,
          requesterId: useManualRequester ? (requesterId || undefined) : undefined
        };
        await requestApi.createRequest(dto, files);
      }
      onSuccess();
      onClose();
    } catch (error) {
      alert(isEdit ? 'Failed to update request' : 'Failed to create request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content request-modal">
        <header className="modal-header">
          <h2>{isEdit ? `Edit Request #${request?.requestId}` : 'Register Manual Request'}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </header>

        <form onSubmit={handleSubmit} className="request-form">
          {!isEdit && (
            <>
              <div className="form-group">
                <label>Target Customer Organization</label>
                <select 
                  value={targetTenantId} 
                  onChange={(e) => setTargetTenantId(e.target.value)}
                  className="modern-input"
                  required
                >
                  <option value="" disabled>Select Organization</option>
                  {tenants.map(t => (
                    <option key={t.tenantId} value={t.tenantId}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Requester Setting</label>
                <div className="toggle-group">
                  <label className={`radio-btn ${!useManualRequester ? 'active' : ''}`}>
                    <input 
                      type="radio" 
                      name="req-type" 
                      checked={!useManualRequester} 
                      onChange={() => setUseManualRequester(false)} 
                    />
                    Operator (Me)
                  </label>
                  <label className={`radio-btn ${useManualRequester ? 'active' : ''}`}>
                    <input 
                      type="radio" 
                      name="req-type" 
                      checked={useManualRequester} 
                      onChange={() => setUseManualRequester(true)} 
                    />
                    Select Customer User
                  </label>
                </div>
              </div>

              {useManualRequester && (
                <div className="form-group animate-in">
                  <label htmlFor="requester-select">Select Customer User (Requester)</label>
                  <select 
                    id="requester-select"
                    value={requesterId} 
                    onChange={(e) => setRequesterId(Number(e.target.value))}
                    className="modern-input"
                    required
                  >
                    <option value="" disabled>Select User</option>
                    {tenantUsers.map(u => (
                      <option key={u.memberId} value={u.memberId}>{u.username} ({u.email})</option>
                    ))}
                  </select>
                  {tenantUsers.length === 0 && <p className="hint">No users found for this organization.</p>}
                </div>
              )}
            </>
          )}

          <div className="form-group">
            <label>Request Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="modern-input" 
              placeholder="Summary of the issue or request"
              required 
              data-testid="input-title"
            />
          </div>

          <div className="form-group">
            <label>Detailed Description</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className="modern-input textarea" 
              placeholder="Provide all relevant details..."
              rows={5}
              required 
              data-testid="input-description"
            />
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Priority Tier</label>
              <select 
                value={priority} 
                onChange={(e) => setPriority(e.target.value as ServiceRequestPriority)}
                className="modern-input"
              >
                {priorityOptions.length > 0 ? (
                  priorityOptions.map(opt => (
                    <option key={opt.codeId} value={opt.codeId}>{opt.codeId} - {opt.codeName}</option>
                  ))
                ) : (
                  <>
                    <option value="LOW">LOW - Standard Buffer</option>
                    <option value="NORMAL">NORMAL - Priority Process</option>
                    <option value="EMERGENCY">EMERGENCY - Critical Escalation</option>
                  </>
                )}
              </select>
            </div>

            <div className="form-group half">
              <label>Evidence / Attachments</label>
              {isEdit && request?.attachments && request.attachments.length > 0 && (
                <div className="existing-files">
                  {request.attachments.map(att => (
                    <div key={att.id} className="existing-file-item" onClick={() => requestApi.downloadAttachment(att.id, att.fileName)}>
                      📎 {att.fileName} ({(att.fileSize / 1024).toFixed(1)} KB)
                    </div>
                  ))}
                </div>
              )}
              <input 
                type="file" 
                multiple 
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
                className="file-input-hidden"
                id="manual-files"
              />
              <label htmlFor="manual-files" className="file-drop-zone">
                {files.length > 0 ? `${files.length} new files selected` : 'Click to Upload Additional Files'}
              </label>
            </div>
          </div>

          {isEdit && (
            <div className="form-row animate-in">
              <div className="form-group half">
                <label>Current Status</label>
                <select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="modern-input status-select"
                >
                  {statusOptions.length > 0 ? (
                    statusOptions.map(opt => (
                      <option key={opt.codeId} value={opt.codeId}>{opt.codeId} ({opt.codeName})</option>
                    ))
                  ) : (
                    <>
                      <option value="DRAFT">DRAFT (작성 중)</option>
                      <option value="PENDING_APPROVAL">PENDING_APPROVAL (결재 대기)</option>
                      <option value="OPEN">OPEN (접수 완료)</option>
                      <option value="IN_PROGRESS">IN_PROGRESS (처리 중)</option>
                      <option value="RESOLVED">RESOLVED (해결 완료)</option>
                      <option value="CLOSED">CLOSED (종료)</option>
                      <option value="REJECTED">REJECTED (반려)</option>
                    </>
                  )}
                </select>
              </div>
              
              {status === 'RESOLVED' && (
                <div className="form-group half animate-in">
                  <label>Resolution Summary</label>
                  <textarea 
                    value={resolution} 
                    onChange={(e) => setResolution(e.target.value)}
                    className="modern-input resolution-area"
                    placeholder="Describe how the request was resolved..."
                    rows={3}
                    required
                  />
                </div>
              )}
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="btn-submit" disabled={isSubmitting} data-testid="btn-submit-request">
              {isSubmitting ? 'Syncing...' : isEdit ? 'Update Entry' : 'Register Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestFormModal;
