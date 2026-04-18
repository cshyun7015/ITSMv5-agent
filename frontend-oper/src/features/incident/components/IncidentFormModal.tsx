import React, { useState, useEffect } from 'react';
import { incidentApi } from '../api/incidentApi';
import { fulfillmentApi } from '../../fulfillment/api/fulfillmentApi';
import { Incident, IncidentReportRequest } from '../types';

interface IncidentFormModalProps {
  incident?: Incident; // 존재하면 수정 모드, 없으면 생성 모드
  onClose: () => void;
  onSuccess: () => void;
}

const IncidentFormModal: React.FC<IncidentFormModalProps> = ({ incident, onClose, onSuccess }) => {
  const isEdit = !!incident;
  
  const [tenants, setTenants] = useState<any[]>([]);
  const [targetTenantId, setTargetTenantId] = useState(incident?.tenantId || '');
  
  const [title, setTitle] = useState(incident?.title || '');
  const [description, setDescription] = useState(incident?.description || '');
  const [impact, setImpact] = useState(incident?.impact || 'MEDIUM');
  const [urgency, setUrgency] = useState(incident?.urgency || 'MEDIUM');
  const [category, setCategory] = useState(incident?.category || 'General');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit) {
      loadTenants();
    }
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const payload: IncidentReportRequest = {
        tenantId: targetTenantId,
        title,
        description,
        impact,
        urgency,
        category,
        source: isEdit ? incident!.source : 'USER'
      };

      if (isEdit) {
        await incidentApi.updateIncident(incident!.incidentId, payload);
      } else {
        await incidentApi.reportIncident(payload);
      }
      onSuccess();
      onClose();
    } catch (error) {
      alert(isEdit ? 'Failed to update incident' : 'Failed to register incident');
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
          {!isEdit && (
            <div className="form-group">
              <label>Target Organization</label>
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
          )}

          <div className="form-group">
            <label>Incident Global Title</label>
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
            <label>Symptoms & Observations</label>
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
              <label>Impact on Service</label>
              <select 
                value={impact} 
                onChange={(e) => setImpact(e.target.value as any)}
                className="modern-input"
              >
                <option value="HIGH">HIGH - Critical Loss</option>
                <option value="MEDIUM">MEDIUM - Partial Degradation</option>
                <option value="LOW">LOW - Minor / Workaround exists</option>
              </select>
            </div>

            <div className="form-group half">
              <label>Urgency for Resolution</label>
              <select 
                value={urgency} 
                onChange={(e) => setUrgency(e.target.value as any)}
                className="modern-input"
              >
                <option value="HIGH">HIGH - Immediate attention</option>
                <option value="MEDIUM">MEDIUM - Resolved in SLA</option>
                <option value="LOW">LOW - Non-blocking</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Category Code</label>
            <input 
              type="text" 
              value={category} 
              onChange={(e) => setCategory(e.target.value)} 
              className="modern-input" 
              placeholder="e.g. INFRA, SOFTWARE, ACCESS"
              required 
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : isEdit ? 'Update Telemetry' : 'Deploy Incident'}
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
