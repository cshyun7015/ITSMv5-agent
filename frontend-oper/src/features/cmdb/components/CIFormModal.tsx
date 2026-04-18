import React, { useState, useEffect } from 'react';
import { ciApi } from '../api/ciApi';
import { incidentApi } from '../../incident/api/incidentApi';
import { codeApi } from '../../code/api/codeApi';
import { ConfigurationItem, CIRequest } from '../types';
import { CodeDTO } from '../../fulfillment/types';
import { useAuth } from '../../auth/context/AuthContext';

interface CIFormModalProps {
  ci?: ConfigurationItem;
  onClose: () => void;
  onSuccess: () => void;
}

const CIFormModal: React.FC<CIFormModalProps> = ({ ci, onClose, onSuccess }) => {
  const { user } = useAuth();
  const isEdit = !!ci;

  const [types, setTypes] = useState<CodeDTO[]>([]);
  const [statuses, setStatuses] = useState<CodeDTO[]>([]);
  const [operators, setOperators] = useState<any[]>([]);

  const [name, setName] = useState(ci?.name || '');
  const [typeCode, setTypeCode] = useState(ci?.typeCode || 'SERVER');
  const [statusCode, setStatusCode] = useState(ci?.statusCode || 'PROVISIONING');
  const [serialNumber, setSerialNumber] = useState(ci?.serialNumber || '');
  const [ownerId, setOwnerId] = useState<number | undefined>(ci?.ownerId);
  const [location, setLocation] = useState(ci?.location || '');
  const [description, setDescription] = useState(ci?.description || '');

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadMetadata();
  }, []);

  const loadMetadata = async () => {
    try {
      const [typeData, statusData, operatorData] = await Promise.all([
        codeApi.getCodesByGroup('CI_TYPE'),
        codeApi.getCodesByGroup('CI_STATUS'),
        incidentApi.getOperators()
      ]);
      setTypes(typeData);
      setStatuses(statusData);
      setOperators(operatorData);
    } catch (error) {
      console.error('Failed to load CMDB metadata');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.tenantId) return;
    setIsSubmitting(true);

    try {
      const payload: CIRequest = {
        tenantId: user.tenantId,
        name,
        typeCode,
        statusCode,
        serialNumber,
        ownerId,
        location,
        description
      };

      if (isEdit && ci) {
        await ciApi.updateCI(ci.ciId, payload);
      } else {
        await ciApi.createCI(payload);
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save CI');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content ci-form-modal">
        <header className="modal-header">
          <h2>{isEdit ? 'Configuration Item Detail' : 'Register New Asset'}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </header>

        <form onSubmit={handleSubmit} className="standard-form">
          <div className="form-section">
            <label>CI Name <span className="required-star">*</span></label>
            <input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="modern-input" 
              required 
              placeholder="e.g. Production Web Server 01" 
            />
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Asset Type <span className="required-star">*</span></label>
              <select value={typeCode} onChange={e => setTypeCode(e.target.value)} className="modern-input">
                {types.map(t => <option key={t.codeId} value={t.codeId}>{t.codeName}</option>)}
              </select>
            </div>
            <div className="form-group half">
              <label>Lifecycle Status <span className="required-star">*</span></label>
              <select value={statusCode} onChange={e => setStatusCode(e.target.value)} className="modern-input status-select">
                {statuses.map(s => <option key={s.codeId} value={s.codeId}>{s.codeName}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Serial Number</label>
              <input value={serialNumber} onChange={e => setSerialNumber(e.target.value)} className="modern-input" placeholder="S/N or Asset ID" />
            </div>
            <div className="form-group half">
              <label>Owner / Manager</label>
              <select value={ownerId || ''} onChange={e => setOwnerId(Number(e.target.value))} className="modern-input">
                <option value="">Unassigned</option>
                {operators.map(op => <option key={op.memberId} value={op.memberId}>{op.username}</option>)}
              </select>
            </div>
          </div>

          <div className="form-section">
            <label>Location / Data Center</label>
            <input value={location} onChange={e => setLocation(e.target.value)} className="modern-input" placeholder="e.g. Seoul-DC-A / Rack 12" />
          </div>

          <div className="form-section">
            <label>Description & Specs</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="modern-input textarea" rows={4} />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (isEdit ? 'Update Asset' : 'Register Asset')}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 3000; }
        .modal-content.ci-form-modal { 
          background: #0f172a; width: 100%; max-width: 550px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); 
          box-shadow: 0 30px 60px rgba(0,0,0,0.5); animation: zoomIn 0.3s ease-out;
        }
        @keyframes zoomIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        .modal-header { padding: 24px 32px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; }
        .modal-header h2 { margin: 0; font-size: 20px; font-weight: 800; color: #fff; }
        .close-btn { background: none; border: none; color: #64748b; font-size: 32px; cursor: pointer; }

        .standard-form { padding: 32px; display: flex; flex-direction: column; gap: 24px; }
        .form-section { display: flex; flex-direction: column; gap: 8px; }
        .form-row { display: flex; gap: 16px; }
        .form-group { flex: 1; display: flex; flex-direction: column; gap: 8px; }
        .form-group label, .form-section label { font-size: 13px; font-weight: 700; color: #64748b; }
        .required-star { color: #f43f5e; }

        .modern-input {
          background: rgba(255,255,255,0.03); border: 1px solid #1e293b; border-radius: 12px; padding: 12px 16px;
          color: #fff; font-size: 14px; outline: none; transition: all 0.2s;
        }
        .modern-input:focus { border-color: #3b82f6; background: rgba(255,255,255,0.05); }
        .textarea { resize: vertical; min-height: 100px; }

        .form-actions { display: flex; justify-content: flex-end; gap: 16px; margin-top: 12px; }
        .btn-secondary { background: none; border: none; color: #94a3b8; font-weight: 700; cursor: pointer; }
        .btn-primary { 
          background: #3b82f6; color: #fff; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 800;
          cursor: pointer; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4); transition: all 0.2s;
        }
        .btn-primary:hover:not(:disabled) { transform: translateY(-2px); background: #2563eb; }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  );
};

// End of CIFormModal
export default CIFormModal;
