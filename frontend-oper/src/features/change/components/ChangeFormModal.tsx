import React, { useState, useEffect } from 'react';
import { changeApi } from '../api/changeApi';
import { incidentApi } from '../../incident/api/incidentApi';
import { codeApi } from '../../code/api/codeApi';
import { ChangeRequest, ChangeReportRequest } from '../types';
import { CodeDTO } from '../../fulfillment/types';
import { useAuth } from '../../auth/context/AuthContext';

interface ChangeFormModalProps {
  change?: ChangeRequest;
  onClose: () => void;
  onSuccess: () => void;
}

const ChangeFormModal: React.FC<ChangeFormModalProps> = ({ change, onClose, onSuccess }) => {
  const { user } = useAuth();
  const isEdit = !!change;
  const status = change?.statusCode || 'DRAFT';

  // 필드별 읽기 전용 여부 판단
  const isBasicLocked = isEdit && !['DRAFT', 'REJECTED'].includes(status);
  const isFullLocked = isEdit && ['IMPLEMENTING', 'CLOSED'].includes(status);

  const [types, setTypes] = useState<CodeDTO[]>([]);
  const [impacts, setImpacts] = useState<CodeDTO[]>([]);
  const [urgencies, setUrgencies] = useState<CodeDTO[]>([]);
  const [operators, setOperators] = useState<any[]>([]);

  const [title, setTitle] = useState(change?.title || '');
  const [reason, setReason] = useState(change?.reason || '');
  const [description, setDescription] = useState(change?.description || '');
  const [typeCode, setTypeCode] = useState(change?.typeCode || 'NORMAL');
  const [impactCode, setImpactCode] = useState(change?.impactCode || 'MEDIUM');
  const [urgencyCode, setUrgencyCode] = useState(change?.urgencyCode || 'MEDIUM');
  const [affectedCis, setAffectedCis] = useState(change?.affectedCis || '');
  const [plannedStartDate, setPlannedStartDate] = useState(change?.plannedStartDate || '');
  const [plannedEndDate, setPlannedEndDate] = useState(change?.plannedEndDate || '');
  const [reviewNotes, setReviewNotes] = useState(change?.reviewNotes || '');
  
  // 운영 정보 필드
  const [currentStatus, setCurrentStatus] = useState(change?.statusCode || 'DRAFT');
  const [assigneeId, setAssigneeId] = useState<number | undefined>(change?.assigneeId);

  const [approverIds, setApproverIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadMetadata();
  }, []);

  const loadMetadata = async () => {
    try {
      const [typeData, impactData, urgencyData, operatorData] = await Promise.all([
        codeApi.getCodesByGroup('CH_TYPE'),
        codeApi.getCodesByGroup('CH_IMPACT'),
        codeApi.getCodesByGroup('CH_URGENCY'),
        incidentApi.getOperators()
      ]);
      setTypes(typeData);
      setImpacts(impactData);
      setUrgencies(urgencyData);
      setOperators(operatorData);
    } catch (error) {
      console.error('Failed to load change metadata');
    }
  };

  const calculatePriority = () => {
    if (impactCode === 'HIGH' && urgencyCode === 'HIGH') return 'P1';
    if (impactCode === 'HIGH' || urgencyCode === 'HIGH') return 'P2';
    if (impactCode === 'LOW' && urgencyCode === 'LOW') return 'P4';
    return 'P3';
  };

  const handleAddApprover = (id: number) => {
    if (id && !approverIds.includes(id)) {
      setApproverIds([...approverIds, id]);
    }
  };

  const removeApprover = (index: number) => {
    setApproverIds(approverIds.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.tenantId || !user?.memberId) {
      alert('Your session data is incomplete. Please re-login.');
      return;
    }
    setIsSubmitting(true);

    try {
      const payload: Partial<ChangeReportRequest> & { reviewNotes?: string, statusCode?: string, assigneeId?: number } = {
        tenantId: user.tenantId,
        title,
        reason,
        description,
        typeCode,
        impactCode,
        urgencyCode,
        plannedStartDate,
        plannedEndDate,
        affectedCis,
        requesterId: user.memberId,
        reviewNotes,
        statusCode: currentStatus,
        assigneeId: assigneeId
      };

      if (isEdit) {
        await changeApi.updateChange(change.changeId, payload);
      } else {
        const savedChange = await changeApi.createDraft(payload as ChangeReportRequest);
        if (approverIds.length > 0) {
          await changeApi.submitRFC(savedChange.changeId, approverIds);
        }
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to save change request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content change-form-modal">
        <header className="modal-header">
          <div className="header-title">
            <h2>{isEdit ? `Change RFC #${change?.changeId}` : 'New Change Request (RFC)'}</h2>
            {isEdit && <span className={`status-tag ${status}`}>{status}</span>}
          </div>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </header>

        <form onSubmit={handleSubmit} className="change-form">
          <div className="form-section">
            <h3>Basic Information {isBasicLocked && <span className="locked-badge">LOCKED</span>}</h3>
            <div className="form-group">
              <label>Global Title <span className="required-star">*</span></label>
              <input 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                className="modern-input" 
                required 
                placeholder="Briefly describe the change..." 
                disabled={isBasicLocked}
              />
            </div>
            <div className="form-group">
              <label>Reason & Description <span className="required-star">*</span></label>
              <textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                className="modern-input textarea" 
                rows={3} 
                placeholder="Why is this change necessary?"
                required 
                disabled={isBasicLocked}
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Classification & Planning</h3>
            <div className="form-row">
              <div className="form-group half">
                <label>Change Type <span className="required-star">*</span></label>
                <select value={typeCode} onChange={e => setTypeCode(e.target.value)} className="modern-input" disabled={isBasicLocked}>
                  {types.map(t => <option key={t.codeId} value={t.codeId}>{t.codeName}</option>)}
                </select>
              </div>
              <div className="form-group half">
                <label>Priority (Auto)</label>
                <div className={`priority-preview-v2 ${calculatePriority()}`}>
                  {calculatePriority()}
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label>Impact <span className="required-star">*</span></label>
                <select value={impactCode} onChange={e => setImpactCode(e.target.value)} className="modern-input" disabled={isBasicLocked}>
                  {impacts.map(i => <option key={i.codeId} value={i.codeId}>{i.codeName}</option>)}
                </select>
              </div>
              <div className="form-group half">
                <label>Urgency <span className="required-star">*</span></label>
                <select value={urgencyCode} onChange={e => setUrgencyCode(e.target.value)} className="modern-input" disabled={isBasicLocked}>
                  {urgencies.map(u => <option key={u.codeId} value={u.codeId}>{u.codeName}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label>Planned Start</label>
                <input 
                  type="datetime-local" 
                  value={plannedStartDate ? String(plannedStartDate).substring(0,16) : ''} 
                  onChange={e => setPlannedStartDate(e.target.value)} 
                  className="modern-input" 
                  disabled={isFullLocked}
                />
              </div>
              <div className="form-group half">
                <label>Affected CIs</label>
                <input 
                  value={affectedCis} 
                  onChange={e => setAffectedCis(e.target.value)} 
                  className="modern-input" 
                  disabled={isFullLocked}
                />
              </div>
            </div>
          </div>

          {isEdit && (
            <div className="form-section admin-section">
              <h3>Operational Assignment</h3>
              <div className="form-row">
                <div className="form-group half">
                  <label>Current Status</label>
                  <select 
                    value={currentStatus} 
                    onChange={e => setCurrentStatus(e.target.value)} 
                    className="modern-input status-select"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="CAB_APPROVAL">CAB Approval</option>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="IMPLEMENTING">Implementing</option>
                    <option value="CLOSED">Closed</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
                <div className="form-group half">
                  <label>Assignee</label>
                  <select 
                    value={assigneeId || ''} 
                    onChange={e => setAssigneeId(Number(e.target.value))} 
                    className="modern-input"
                  >
                    <option value="">Unassigned</option>
                    {operators.map(op => (
                      <option key={op.memberId} value={op.memberId}>{op.username}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group mt-16">
                <label>Post-Implementation Notes / Review</label>
                <textarea 
                  value={reviewNotes} 
                  onChange={e => setReviewNotes(e.target.value)} 
                  className="modern-input textarea" 
                  rows={2} 
                  placeholder="Technical findings or implementation results..."
                />
              </div>
            </div>
          )}

          {!isEdit && (
            <div className="form-section">
              <h3>CAB Approval Workflow</h3>
              <div className="approval-line-builder">
                <div className="approver-list">
                  {approverIds.map((id, index) => (
                    <div key={index} className="approver-item">
                      <span className="step">STEP {index + 1}</span>
                      <span className="name">{operators.find(op => op.memberId === id)?.username || id}</span>
                      <button type="button" className="remove-btn" onClick={() => removeApprover(index)}>&times;</button>
                    </div>
                  ))}
                </div>
                <div className="add-approver-row">
                  <select 
                    className="modern-input select-sm"
                    onChange={(e) => handleAddApprover(Number(e.target.value))}
                    value=""
                  >
                    <option value="" disabled>+ Add CAB Member</option>
                    {operators.map(op => (
                      <option key={op.memberId} value={op.memberId}>{op.username}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="btn-submit" disabled={isSubmitting || isFullLocked}>
              {isSubmitting ? 'Processing...' : isEdit ? 'Update Change' : 'Submit for RFC'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(10px);
          display: flex; align-items: center; justify-content: center; z-index: 3000;
        }
        .modal-content.change-form-modal {
          background: #0b0f1a; border: 1px solid rgba(255,255,255,0.1);
          width: 100%; max-width: 550px; max-height: 94vh; border-radius: 24px; color: #fff;
          box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.7);
          animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          display: flex; flex-direction: column; overflow: hidden;
        }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

        .modal-header { padding: 24px 32px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .header-title { display: flex; align-items: center; gap: 12px; }
        .modal-header h2 { margin: 0; font-size: 20px; font-weight: 800; color: #e2e8f0; }
        .status-tag { font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 4px; background: rgba(255,255,255,0.1); color: #94a3b8; }
        .status-tag.CAB_APPROVAL { background: rgba(139, 92, 246, 0.2); color: #a78bfa; }
        .status-tag.SCHEDULED { background: rgba(6, 182, 212, 0.2); color: #67e8f9; }
        .status-tag.IMPLEMENTING { background: rgba(245, 158, 11, 0.2); color: #fcd34d; }
        .status-tag.CLOSED { background: rgba(16, 185, 129, 0.2); color: #6ee7b7; }

        .close-btn { background: none; border: none; color: #475569; font-size: 28px; cursor: pointer; }
        .close-btn:hover { color: #fff; }

        .change-form { padding: 24px 32px; overflow-y: auto; display: flex; flex-direction: column; gap: 24px; }
        .form-section h3 { font-size: 11px; font-weight: 800; color: #3b82f6; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; }
        .locked-badge { font-size: 9px; background: #ef4444; color: white; padding: 1px 6px; border-radius: 3px; }
        
        .admin-section { background: rgba(59, 130, 246, 0.05) !important; border: 1px solid rgba(59, 130, 246, 0.2) !important; }
        .mt-16 { margin-top: 16px; }

        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-row { display: flex; gap: 20px; }
        .form-group.half { flex: 1; }
        .form-group label { font-size: 12px; font-weight: 700; color: #64748b; }
        
        .modern-input {
          background: rgba(255,255,255,0.03); border: 1px solid #1e293b;
          border-radius: 12px; padding: 12px 16px; color: #fff; font-size: 14px;
          outline: none; transition: all 0.2s;
        }
        .modern-input:focus:not(:disabled) { border-color: #3b82f6; background: rgba(59, 130, 246, 0.05); }
        .modern-input:disabled { opacity: 0.5; cursor: not-allowed; background: rgba(0,0,0,0.2); }
        .textarea { resize: vertical; min-height: 100px; }

        .priority-preview-v2 {
          height: 44px; display: flex; align-items: center; justify-content: center;
          border-radius: 12px; font-weight: 900; font-size: 15px;
          background: rgba(255,255,255,0.05); color: #94a3b8; border: 1px solid rgba(255,255,255,0.05);
        }
        .priority-preview-v2.P1 { background: rgba(239, 68, 68, 0.15); color: #f87171; border-color: rgba(239, 68, 68, 0.3); }
        .priority-preview-v2.P2 { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border-color: rgba(245, 158, 11, 0.3); }

        .approval-line-builder { background: rgba(0,0,0,0.2); border-radius: 16px; padding: 20px; border: 1px solid rgba(255,255,255,0.05); }
        .approver-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
        .approver-item { 
          display: flex; justify-content: space-between; align-items: center; 
          background: rgba(255,255,255,0.03); padding: 10px 16px; border-radius: 10px;
        }
        .approver-item .step { font-size: 10px; color: #3b82f6; font-weight: 800; }
        .approver-item .name { font-size: 14px; color: #fff; }
        .remove-btn { background: none; border: none; color: #ef4444; font-size: 20px; cursor: pointer; }

        .form-actions { display: flex; justify-content: flex-end; gap: 16px; margin-top: 12px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 24px; }
        .btn-cancel { background: transparent; border: none; color: #94a3b8; font-weight: 600; cursor: pointer; }
        .btn-submit { 
          background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: #fff; border: none; 
          padding: 12px 28px; border-radius: 12px; font-weight: 800; cursor: pointer;
          box-shadow: 0 10px 20px rgba(37, 99, 235, 0.3); transition: all 0.2s;
        }
        .btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 15px 30px rgba(37, 99, 235, 0.4); }
        .btn-submit:disabled { opacity: 0.5; transform: none; box-shadow: none; cursor: not-allowed; }
      `}</style>
    </div>
  );
};

export default ChangeFormModal;
