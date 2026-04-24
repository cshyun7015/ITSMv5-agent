import React, { useState, useEffect } from 'react';
import { incidentApi } from '../api/incidentApi';
import { requestApi } from '../../requests/api/requestApi';
import { codeApi } from '../../code/api/codeApi';
import { Incident, IncidentReportRequest } from '../types';
import { CodeDTO } from '../../requests/types';
import ToastNotification from '../../../components/common/ToastNotification';

interface IncidentFormModalProps {
  incident?: Incident; // 존재하면 수정 모드, 없으면 생성 모드
  onClose: () => void;
  onSuccess: () => void;
}

const IncidentFormModal: React.FC<IncidentFormModalProps> = ({ incident, onClose, onSuccess }) => {
  const isEdit = !!incident;
  
  const [tenants, setTenants] = useState<any[]>([]);
  const [categories, setCategories] = useState<CodeDTO[]>([]);
  const [impacts, setImpacts] = useState<CodeDTO[]>([]);
  const [urgencies, setUrgencies] = useState<CodeDTO[]>([]);
  const [statuses, setStatuses] = useState<CodeDTO[]>([]);
  const [operators, setOperators] = useState<any[]>([]);
  
  const [targetTenantId, setTargetTenantId] = useState(incident?.tenantId || '');
  const [title, setTitle] = useState(incident?.title || '');
  const [description, setDescription] = useState(incident?.description || '');
  const [impact, setImpact] = useState(incident?.impact || 'MEDIUM');
  const [urgency, setUrgency] = useState(incident?.urgency || 'MEDIUM');
  const [category, setCategory] = useState(incident?.category || '');
  const [isMajor, setIsMajor] = useState(incident?.isMajor || false);
  const [affectedService, setAffectedService] = useState(incident?.affectedService || '');
  const [status, setStatus] = useState(incident?.status || 'NEW');
  const [assigneeId, setAssigneeId] = useState<number | undefined>(incident?.assigneeId);
  const [resolution, setResolution] = useState(incident?.resolution || '');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' | null }>({ message: '', type: null });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [tenantData, categoryData, impactData, urgencyData, statusData, operatorData] = await Promise.all([
        !isEdit ? requestApi.getTenants() : Promise.resolve([]),
        codeApi.getCodesByGroup('IN_CATEGORY'),
        codeApi.getCodesByGroup('IN_IMPACT'),
        codeApi.getCodesByGroup('IN_URGENCY'),
        codeApi.getCodesByGroup('IN_STATUS'),
        incidentApi.getOperators()
      ]);
      
      if (!isEdit) {
        setTenants(tenantData);
        if (tenantData.length > 0 && !targetTenantId) {
          setTargetTenantId(tenantData[0].tenantId);
        }
      }
      
      setCategories(categoryData);
      setImpacts(impactData);
      setUrgencies(urgencyData);
      setStatuses(statusData);
      setOperators(operatorData);

      if (!category && categoryData.length > 0) {
        setCategory(categoryData[0].codeId);
      }
    } catch (error) {
      console.error('Failed to load initial form data', error);
      setToast({ message: 'Failed to synchronize metadata', type: 'error' });
    }
  };

  const validateForm = () => {
    if (!title.trim()) return 'Incident title is mandatory.';
    if (!description.trim()) return 'Description is mandatory.';
    if (!category) return 'Category is mandatory.';
    if (!impact) return 'Impact level is mandatory.';
    if (!urgency) return 'Urgency level is mandatory.';

    if (isEdit) {
      if (status !== 'NEW' && !assigneeId) {
        return 'An assignee is required for the current status.';
      }
      if ((status === 'RESOLVED' || status === 'CLOSED') && !resolution.trim()) {
        return 'Resolution detail is required when resolving/closing.';
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const error = validateForm();
    if (error) {
      setToast({ message: error, type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: IncidentReportRequest = {
        tenantId: targetTenantId,
        title,
        description,
        impact,
        urgency,
        category,
        isMajor,
        affectedService,
        status: isEdit ? status : undefined,
        assigneeId: isEdit ? assigneeId : undefined,
        resolution: isEdit ? resolution : undefined,
        source: isEdit ? incident!.source : 'USER'
      };

      if (isEdit) {
        await incidentApi.updateIncident(incident!.incidentId, payload);
      } else {
        await incidentApi.reportIncident(payload);
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      const msg = error.response?.data?.message || (isEdit ? 'Update sequence failed' : 'Deployment failed');
      setToast({ message: msg, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content incident-form-modal">
        <header className="modal-header">
          <h2>{isEdit ? `Update Incident #${incident?.incidentId}` : 'Manual Incident Registration'}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </header>

        <form onSubmit={handleSubmit} className="incident-form">
          <div className="form-row">
            {!isEdit && (
              <div className="form-group half">
                <label>Target Org <span className="required-star">*</span></label>
                <select 
                  value={targetTenantId} 
                  onChange={(e) => setTargetTenantId(e.target.value)}
                  className="modern-input"
                  required
                >
                  <option value="" disabled>Select Org</option>
                  {tenants.map(t => (
                    <option key={t.tenantId} value={t.tenantId}>{t.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className={`form-group ${isEdit ? '' : 'half'}`}>
              <label>Affected Service</label>
              <input 
                type="text" 
                value={affectedService} 
                onChange={(e) => setAffectedService(e.target.value)}
                className="modern-input"
                placeholder="e.g. ERP, VPN, DB"
              />
            </div>
          </div>

          <div className="form-group checkbox-container">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={isMajor} 
                onChange={(e) => setIsMajor(e.target.checked)}
              />
              <span className="checkbox-text">🚨 Mark as Major Incident</span>
            </label>
          </div>

          <div className="form-group">
            <label>Incident Global Title <span className="required-star">*</span></label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="modern-input" 
              placeholder="e.g. Database Connectivity Issue in Production"
              required 
            />
          </div>

          <div className="form-group">
            <label>Symptoms & Observations <span className="required-star">*</span></label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className="modern-input textarea" 
              placeholder="Provide context, logs, or error messages..."
              rows={4}
              required 
            />
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Impact on Service <span className="required-star">*</span></label>
              <select 
                value={impact} 
                onChange={(e) => setImpact(e.target.value as any)}
                className="modern-input"
              >
                <option value="" disabled>Select Impact</option>
                {impacts.map(imp => (
                  <option key={imp.codeId} value={imp.codeId}>{imp.codeName}</option>
                ))}
              </select>
            </div>

            <div className="form-group half">
              <label>Urgency for Resolution <span className="required-star">*</span></label>
              <select 
                value={urgency} 
                onChange={(e) => setUrgency(e.target.value as any)}
                className="modern-input"
              >
                <option value="" disabled>Select Urgency</option>
                {urgencies.map(urg => (
                  <option key={urg.codeId} value={urg.codeId}>{urg.codeName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Category Code <span className="required-star">*</span></label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)} 
              className="modern-input" 
              required
            >
              <option value="" disabled>Select Category</option>
              {categories.map(cat => (
                <option key={cat.codeId} value={cat.codeId}>
                  {cat.codeName} ({cat.codeId})
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Incident Status <span className="required-star">*</span></label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value as any)}
                className="modern-input"
              >
                {statuses.map(st => (
                  <option key={st.codeId} value={st.codeId}>{st.codeName}</option>
                ))}
              </select>
            </div>

            <div className="form-group half">
              <label>Assignee (Specialist) {status !== 'NEW' && <span className="required-star">*</span>}</label>
              <select 
                value={assigneeId || ''} 
                onChange={(e) => setAssigneeId(e.target.value ? Number(e.target.value) : undefined)}
                className="modern-input"
              >
                <option value="">Unassigned</option>
                {operators.map(op => (
                  <option key={op.memberId} value={op.memberId}>{op.username}</option>
                ))}
              </select>
            </div>
          </div>

          {(status === 'RESOLVED' || status === 'CLOSED') && (
            <div className="form-group animate-in">
              <label>Resolution Summary <span className="required-star">*</span></label>
              <textarea 
                value={resolution} 
                onChange={(e) => setResolution(e.target.value)} 
                className="modern-input textarea resolution-box" 
                placeholder="Diagnostic steps, root cause, and final solution..."
                rows={3}
                required 
              />
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : isEdit ? 'Update Telemetry' : 'Deploy Incident'}
            </button>
          </div>
        </form>
        <ToastNotification 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ message: '', type: null })} 
        />
      </div>

      <style>{`
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(10px);
          display: flex; align-items: center; justify-content: center; z-index: 3000;
        }
        .modal-content.incident-form-modal {
          background: #0b0f1a; border: 1px solid rgba(255,255,255,0.1);
          width: 100%; max-width: 550px; border-radius: 24px; color: #fff;
          box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.7);
          animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

        .modal-header { padding: 32px 32px 20px; display: flex; justify-content: space-between; align-items: center; }
        .modal-header h2 { margin: 0; font-size: 22px; font-weight: 800; background: linear-gradient(to right, #fff, #94a3b8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .close-btn { background: none; border: none; color: #475569; font-size: 28px; cursor: pointer; transition: color 0.2s; }
        .close-btn:hover { color: #fff; }

        .incident-form { padding: 0 32px 32px; display: flex; flex-direction: column; gap: 24px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-row { display: flex; gap: 20px; }
        .form-group.half { flex: 1; }
        .form-group label { font-size: 13px; font-weight: 700; color: #64748b; letter-spacing: 0.05em; text-transform: uppercase; }
        
        .modern-input {
          background: rgba(255,255,255,0.03); border: 1px solid #1e293b;
          border-radius: 12px; padding: 14px 18px; color: #fff; font-size: 15px;
          outline: none; transition: all 0.2s;
        }
        .modern-input:focus { border-color: #3b82f6; background: rgba(59, 130, 246, 0.05); box-shadow: 0 0 20px rgba(59, 130, 246, 0.1); }
        .textarea { resize: vertical; min-height: 120px; }

        .form-actions { display: flex; justify-content: flex-end; gap: 16px; margin-top: 12px; }
        .btn-cancel { background: transparent; border: none; color: #94a3b8; font-weight: 600; cursor: pointer; transition: color 0.2s; }
        .btn-cancel:hover { color: #fff; }
        .btn-submit { 
          background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: #fff; border: none; 
          padding: 14px 28px; border-radius: 12px; font-weight: 800; cursor: pointer;
          box-shadow: 0 10px 20px rgba(37, 99, 235, 0.3); transition: all 0.2s;
        }
        .btn-submit:hover { transform: translateY(-2px); box-shadow: 0 15px 30px rgba(37, 99, 235, 0.4); }
        .btn-submit:disabled { opacity: 0.5; transform: none; box-shadow: none; cursor: not-allowed; }
      `}</style>
    </div>
  );
};

export default IncidentFormModal;
