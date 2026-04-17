import React, { useState, useEffect } from 'react';
import { fulfillmentApi } from '../api/fulfillmentApi';
import { ServiceRequest, ServiceRequestPriority, CodeDTO } from '../types';

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
    if (!isEdit) {
      loadTenants();
    } else {
      loadStatusOptions();
      loadPriorityOptions();
    }
  }, []);

  const loadStatusOptions = async () => {
    try {
      const data = await fulfillmentApi.getCodesByGroup('SR_STATUS');
      setStatusOptions(data);
    } catch (error) {
      console.error('Failed to load status options', error);
    }
  };

  const loadPriorityOptions = async () => {
    try {
      const data = await fulfillmentApi.getCodesByGroup('SR_PRIORITY');
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
      const data = await fulfillmentApi.getTenants();
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
      const data = await fulfillmentApi.getTenantUsers(tId);
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
        await fulfillmentApi.updateRequest(request!.requestId, {
          title, description, priority, status, resolution
        }, files);
      } else {
        await fulfillmentApi.createRequest({
          title,
          description,
          priority,
          targetTenantId,
          requesterId: useManualRequester ? (requesterId || undefined) : undefined
        }, files);
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
                  <label>Select Customer User (Requester)</label>
                  <select 
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
                    <div key={att.id} className="existing-file-item" onClick={() => fulfillmentApi.downloadAttachment(att.id, att.fileName)}>
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
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Syncing...' : isEdit ? 'Update Entry' : 'Register Request'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center; z-index: 2000;
        }
        .modal-content.request-modal {
          background: #0f172a; border: 1px solid rgba(255,255,255,0.1);
          width: 100%; max-width: 600px; border-radius: 20px; color: #fff;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .modal-header { padding: 24px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; }
        .modal-header h2 { margin: 0; font-size: 20px; font-weight: 700; color: #f8fafc; }
        .close-btn { background: none; border: none; color: #64748b; font-size: 24px; cursor: pointer; }

        .request-form { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-row { display: flex; gap: 20px; }
        .form-group.half { flex: 1; }
        .form-group label { font-size: 13px; font-weight: 600; color: #94a3b8; }
        
        .modern-input {
          background: rgba(255,255,255,0.03); border: 1px solid #334155;
          border-radius: 10px; padding: 12px 16px; color: #fff; font-size: 14px;
          outline: none; transition: border-color 0.2s;
        }
        .modern-input:focus { border-color: #3b82f6; }
        .textarea { resize: vertical; min-height: 100px; }

        .toggle-group { display: flex; gap: 12px; }
        .radio-btn {
          flex: 1; display: flex; align-items: center; justify-content: center;
          padding: 10px; border-radius: 8px; border: 1px solid #334155;
          font-size: 13px; cursor: pointer; transition: all 0.2s;
        }
        .radio-btn input { display: none; }
        .radio-btn.active { border-color: #3b82f6; background: rgba(59, 130, 246, 0.1); color: #60a5fa; }

        .file-input-hidden { display: none; }
        .file-drop-zone {
          border: 2px dashed #334155; border-radius: 10px; padding: 10px;
          text-align: center; font-size: 12px; color: #64748b; cursor: pointer;
          transition: all 0.2s;
        }
        .file-drop-zone:hover { border-color: #3b82f6; color: #3b82f6; background: rgba(59,130,246,0.05); }

        .existing-files { display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px; }
        .existing-file-item {
          font-size: 12px; color: #60a5fa; cursor: pointer; padding: 4px 8px;
          background: rgba(59,130,246,0.1); border-radius: 6px; display: inline-block;
          transition: all 0.2s;
        }
        .existing-file-item:hover { background: rgba(59,130,246,0.2); text-decoration: underline; }

        .status-select { border-color: #3b82f6; font-weight: 600; }
        .resolution-area { border-color: #10b981; min-height: 80px; }

        .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; }
        .btn-cancel { background: transparent; border: none; color: #94a3b8; padding: 10px 20px; cursor: pointer; }
        .btn-submit { background: #3b82f6; color: #fff; border: none; padding: 12px 24px; border-radius: 10px; font-weight: 700; cursor: pointer; }
        .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        .hint { font-size: 11px; color: #ef4444; margin-top: 4px; }
        .animate-in { animation: slideDown 0.3s ease-out; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default RequestFormModal;
