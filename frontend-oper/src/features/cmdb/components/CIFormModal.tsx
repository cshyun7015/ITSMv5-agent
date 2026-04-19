import React, { useState, useEffect } from 'react';
import { ciApi } from '../api/ciApi';
import { incidentApi } from '../../incident/api/incidentApi';
import { codeApi } from '../../code/api/codeApi';
import { fulfillmentApi } from '../../fulfillment/api/fulfillmentApi';
import { ConfigurationItem, CIRequest } from '../types';
import { CodeDTO } from '../../fulfillment/types';
import { useAuth } from '../../auth/context/AuthContext';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { CIDiscoveryService, DiscoverySuggestion } from '../api/CIDiscoveryService';


interface CIFormModalProps {
  ci?: ConfigurationItem;
  onClose: () => void;
  onSuccess: () => void;
}

const CIFormModal: React.FC<CIFormModalProps> = ({ ci, onClose, onSuccess }) => {
  const { user } = useAuth();
  const isEdit = !!ci;

  const [tenants, setTenants] = useState<any[]>([]);
  const [types, setTypes] = useState<CodeDTO[]>([]);
  const [statuses, setStatuses] = useState<CodeDTO[]>([]);
  const [operators, setOperators] = useState<any[]>([]);

  const [targetTenantId, setTargetTenantId] = useState(ci?.tenantId || '');
  const [name, setName] = useState(ci?.name || '');
  const [typeCode, setTypeCode] = useState(ci?.typeCode || 'SERVER');
  const [statusCode, setStatusCode] = useState(ci?.statusCode || 'PROVISIONING');
  const [serialNumber, setSerialNumber] = useState(ci?.serialNumber || '');
  const [ownerId, setOwnerId] = useState<number | undefined>(ci?.ownerId);
  const [location, setLocation] = useState(ci?.location || '');
  const [description, setDescription] = useState(ci?.description || '');
  const [configJson, setConfigJson] = useState(ci?.configJson || '{}');


  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isHardDelete, setIsHardDelete] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'details' | 'connections' | 'history'>('general');
  const [cis, setCIs] = useState<ConfigurationItem[]>([]);
  const [suggestions, setSuggestions] = useState<DiscoverySuggestion[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);



  useEffect(() => {
    loadMetadata();
  }, []);

  const loadMetadata = async () => {
    try {
      const [tenantData, typeData, statusData, operatorData] = await Promise.all([
        fulfillmentApi.getTenants(),
        codeApi.getCodesByGroup('CI_TYPE'),
        codeApi.getCodesByGroup('CI_STATUS'),
        incidentApi.getOperators()
      ]);
      setTenants(tenantData);
      setTypes(typeData);
      setStatuses(statusData);
      setOperators(operatorData);
      
      if (!isEdit && tenantData.length > 0 && !targetTenantId) {
        setTargetTenantId(tenantData[0].tenantId);
      }
    } catch (error) {
      console.error('Failed to load CMDB metadata');
    }
  };

  const handleRunDiscovery = async () => {
    if (!targetTenantId) return;
    setIsDiscovering(true);
    try {
      const allCIs = await ciApi.getCIs(targetTenantId);
      setCIs(allCIs);
      
      const [liveDeps, metaSuggestions] = await Promise.all([
        CIDiscoveryService.getLiveDependencies(targetTenantId),
        Promise.resolve(CIDiscoveryService.getMetadataSuggestions(allCIs))
      ]);
      
      // Filter suggestions relevant to the current CI if editing
      const relevant = [...liveDeps, ...metaSuggestions].filter(s => 
        !isEdit || s.sourceId === ci?.ciId || s.targetId === ci?.ciId
      );
      
      setSuggestions(relevant);
    } catch (error) {
      console.error('Discovery failed');
    } finally {
      setIsDiscovering(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'connections') {
      handleRunDiscovery();
    }
  }, [activeTab]);


  const handleDeleteClick = () => {
    if (!ci) return;
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!ci) return;
    setIsDeleteConfirmOpen(false);
    setIsSubmitting(true);
    try {
      await ciApi.deleteCI(ci.ciId, isHardDelete);
      onSuccess();
    } catch (error) {
      console.error('Failed to delete CI');
      alert('Failed to delete asset. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTenantId) {
      alert('Please select a customer.');
      return;
    }
    setIsSubmitting(true);

    try {
      const payload: CIRequest = {
        tenantId: targetTenantId,
        name,
        typeCode,
        statusCode,
        serialNumber,
        ownerId,
        location,
        description,
        configJson
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
          <h2>{isEdit ? 'Asset Management' : 'Register New Asset'}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </header>

        <div className="modal-tabs">
          <button className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>General</button>
          <button className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>Technical Details</button>
          <button className={`tab-btn ${activeTab === 'connections' ? 'active' : ''}`} onClick={() => setActiveTab('connections')}>Connections</button>
          <button className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>Log</button>
        </div>

        <form onSubmit={handleSubmit} className="standard-form">
          {activeTab === 'general' && (
            <div className="tab-pane fade-in">

          <div className="form-section customer-section">
            <label>Customer Company (Tenant) <span className="required-star">*</span></label>
            <select 
              value={targetTenantId} 
              onChange={e => setTargetTenantId(e.target.value)} 
              className="modern-input tenant-select"
              required
              disabled={isEdit}
            >
              <option value="" disabled>Select a customer...</option>
              {tenants.map(t => (
                <option key={t.tenantId} value={t.tenantId}>{t.name} ({t.tenantId})</option>
              ))}
            </select>
            {isEdit && <span className="helper-text">Customer cannot be changed after registration.</span>}
          </div>

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
          </div>
          )}

          {activeTab === 'details' && (
            <div className="tab-pane fade-in">
              <div className="details-header">
                <h3>Technical Properties</h3>
                <p>Managed technical attributes for this asset type in JSON format.</p>
              </div>
              <div className="json-editor">
                <div className="editor-top">
                  <span className="editor-label">Configuration JSON</span>
                  <button type="button" className="btn-format" onClick={() => {
                    try { setConfigJson(JSON.stringify(JSON.parse(configJson), null, 2)); } catch(e) {}
                  }}>Format JSON</button>
                </div>
                <textarea 
                  value={configJson} 
                  onChange={e => setConfigJson(e.target.value)} 
                  className="modern-input textarea json-textarea" 
                  spellCheck={false}
                  placeholder='{ "cpu": "8 Core", "ram": "32GB", "ip": "10.0.1.5" }'
                />
                <div className="editor-footer">
                  <span className="helper-text">This data is used by the discovery engine for automated matching.</span>
                </div>
              </div>
            </div>
          )}


          {activeTab === 'connections' && (
            <div className="tab-pane fade-in">
              <div className="details-header">
                <div className="flex-row">
                  <div className="header-text">
                    <h3>Dependency Discovery</h3>
                    <p>Automated and manual relationships for this asset.</p>
                  </div>
                  <button type="button" className="btn-discovery-run" onClick={handleRunDiscovery} disabled={isDiscovering}>
                    {isDiscovering ? 'Scanning...' : '🔄 Rescan Network'}
                  </button>
                </div>
              </div>

              <div className="connections-grid">
                <div className="connection-section">
                  <div className="section-title">Manual Relationships</div>
                  <div className="empty-placeholder mini">No manual links defined.</div>
                  <button type="button" className="btn-add-link">+ Add Manual Link</button>
                </div>

                <div className="connection-section suggestions">
                  <div className="section-title">Discovery Suggestions</div>
                  <div className="suggestion-list">
                    {suggestions.map((s, i) => (
                      <div key={i} className={`suggestion-card ${s.type.toLowerCase()}`}>
                        <div className="s-type-badge">{s.type}</div>
                        <div className="s-info">
                          <div className="s-path">
                            <span className="s-name">{s.sourceName}</span>
                            <span className="s-arrow">→</span>
                            <span className="s-name">{s.targetName}</span>
                          </div>
                          <div className="s-reason">{s.reason}</div>
                          <div className="s-confidence">Confidence: {Math.round(s.confidence * 100)}%</div>
                        </div>
                        <button type="button" className="btn-approve-s" title="Approve & Link">✓</button>
                      </div>
                    ))}
                    {suggestions.length === 0 && !isDiscovering && (
                      <div className="empty-placeholder mini">No automated suggestions found.</div>
                    )}
                    {isDiscovering && (
                      <div className="discovering-loader">
                        <div className="mini-spinner"></div>
                        <span>Scanning Prometheus traffic...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}


          {activeTab === 'history' && (
            <div className="tab-pane fade-in">
              <div className="details-header">
                <h3>Lifecycle Audit Log</h3>
                <p>History of changes and status transitions.</p>
              </div>
              <div className="empty-history">
                <div className="icon">📜</div>
                <p>Initial registration: {ci?.createdAt || 'Pending'}</p>
                <p>Last update: {ci?.updatedAt || 'Pending'}</p>
              </div>
            </div>
          )}


          <div className="form-actions">
            {isEdit && (
              <button 
                type="button" 
                className="btn-delete" 
                onClick={handleDeleteClick} 
                disabled={isSubmitting}
                style={{ marginRight: 'auto' }}
              >
                Delete Asset
              </button>
            )}
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (isEdit ? 'Update Asset' : 'Register Asset')}
            </button>
          </div>
        </form>
      </div>

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        title="Delete Configuration Item"
        message="Please select the deletion method for this asset."
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteConfirmOpen(false)}
      >
        <div className="delete-options">
          <label className={`delete-option-card ${!isHardDelete ? 'active' : ''}`}>
            <input 
              type="radio" 
              checked={!isHardDelete} 
              onChange={() => setIsHardDelete(false)} 
            />
            <div className="option-info">
              <span className="option-title">Soft Delete (Recommended)</span>
              <p className="option-desc">Keep record for audit history but hide from active lists.</p>
            </div>
          </label>
          <label className={`delete-option-card danger ${isHardDelete ? 'active' : ''}`}>
            <input 
              type="radio" 
              checked={isHardDelete} 
              onChange={() => setIsHardDelete(true)} 
            />
            <div className="option-info">
              <span className="option-title">Hard Delete (Physical)</span>
              <p className="option-desc">Permanently remove this record and all associated data from the database.</p>
            </div>
          </label>
        </div>
      </ConfirmDialog>

      <style>{`
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 3000; }
        .modal-content.ci-form-modal { 
          background: #0f172a; width: 100%; max-width: 550px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); 
          box-shadow: 0 30px 60px rgba(0,0,0,0.5); animation: zoomIn 0.3s ease-out;
        }
        @keyframes zoomIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        .modal-header { padding: 24px 32px 12px; border-bottom: none; display: flex; justify-content: space-between; align-items: center; }
        .modal-header h2 { margin: 0; font-size: 20px; font-weight: 800; color: #fff; }
        .close-btn { background: none; border: none; color: #64748b; font-size: 32px; cursor: pointer; }

        .modal-tabs { display: flex; gap: 8px; padding: 0 32px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .tab-btn { 
          padding: 12px 16px; background: none; border: none; color: #64748b; font-size: 13px; font-weight: 700; 
          cursor: pointer; position: relative; transition: all 0.2s;
        }
        .tab-btn:hover { color: #fff; }
        .tab-btn.active { color: #3b82f6; }
        .tab-btn.active::after { 
          content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px; 
          background: #3b82f6; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5); 
        }

        .standard-form { padding: 32px; display: flex; flex-direction: column; gap: 24px; min-height: 480px; }
        .tab-pane.fade-in { animation: fadeIn 0.3s ease-out; display: flex; flex-direction: column; gap: 24px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

        .details-header { margin-bottom: 8px; }
        .details-header h3 { margin: 0 0 4px; font-size: 16px; color: #fff; }
        .details-header p { margin: 0; font-size: 12px; color: #64748b; }

        .json-editor { display: flex; flex-direction: column; gap: 12px; }
        .editor-top { display: flex; justify-content: space-between; align-items: center; }
        .editor-label { font-size: 12px; font-weight: 700; color: #64748b; }
        .btn-format { background: rgba(59, 130, 246, 0.1); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 6px; padding: 4px 10px; font-size: 11px; font-weight: 700; cursor: pointer; }
        .btn-format:hover { background: #3b82f6; color: #fff; }
        .json-textarea { font-family: 'JetBrains Mono', monospace; font-size: 13px; min-height: 280px !important; color: #34d399 !important; line-height: 1.6; }
        .flex-row { display: flex; justify-content: space-between; align-items: flex-start; }
        .btn-discovery-run { 
          background: rgba(59, 130, 246, 0.1); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.2); 
          padding: 8px 14px; border-radius: 8px; font-size: 11px; font-weight: 800; cursor: pointer; transition: all 0.2s;
        }
        .btn-discovery-run:hover:not(:disabled) { background: #3b82f6; color: #fff; }

        .connections-grid { display: flex; flex-direction: column; gap: 24px; padding-bottom: 24px; }
        .connection-section { display: flex; flex-direction: column; gap: 12px; }
        .section-title { font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
        
        .empty-placeholder.mini { 
          padding: 24px; background: rgba(255,255,255,0.01); border: 1px dashed rgba(255,255,255,0.05); 
          border-radius: 12px; font-size: 12px; text-align: center; color: #475569;
        }
        .btn-add-link { 
          align-self: flex-start; background: none; border: 1px dashed rgba(59, 130, 246, 0.3); 
          color: #3b82f6; padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer;
        }

        .suggestion-list { display: flex; flex-direction: column; gap: 10px; }
        .suggestion-card { 
          display: flex; align-items: center; gap: 16px; padding: 12px 16px; 
          background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px;
          position: relative; overflow: hidden;
        }
        .suggestion-card.traffic { border-left: 3px solid #10b981; }
        .suggestion-card.metadata { border-left: 3px solid #3b82f6; }
        
        .s-type-badge { position: absolute; right: 8px; top: 8px; font-size: 8px; font-weight: 900; opacity: 0.3; }
        .s-info { flex: 1; }
        .s-path { display: flex; align-items: center; gap: 8px; margin-bottom: 2px; }
        .s-name { font-size: 13px; font-weight: 700; color: #f8fafc; }
        .s-arrow { color: #475569; }
        .s-reason { font-size: 11px; color: #94a3b8; margin-bottom: 4px; }
        .s-confidence { font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; }
        
        .btn-approve-s { 
          background: #10b981; color: #fff; border: none; width: 28px; height: 28px; 
          border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;
          font-weight: 900; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3); transition: all 0.2s;
        }
        .btn-approve-s:hover { transform: scale(1.1); }

        .discovering-loader { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 40px; color: #3b82f6; font-size: 13px; font-weight: 700; }
        .mini-spinner { width: 20px; height: 20px; border: 2px solid rgba(59, 130, 246, 0.2); border-top-color: #3b82f6; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .json-editor-placeholder, .empty-history {
          flex: 1; min-height: 200px; display: flex; flex-direction: column; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.1); border-radius: 12px;
          padding: 40px; text-align: center; color: #64748b;
        }
        .warning-panel { color: #f59e0b; font-weight: 600; font-size: 13px; }
        .info-panel { color: #3b82f6; font-weight: 600; font-size: 13px; }
        .empty-history .icon { font-size: 32px; margin-bottom: 16px; opacity: 0.5; }
        .empty-history p { margin: 4px 0; font-size: 13px; }

        .form-section { display: flex; flex-direction: column; gap: 8px; }
        
        .customer-section { background: rgba(59, 130, 246, 0.05); padding: 16px; border-radius: 12px; border: 1px solid rgba(59, 130, 246, 0.1); }
        .tenant-select { border-color: rgba(59, 130, 246, 0.3) !important; font-weight: 700; color: #60a5fa !important; }
        .helper-text { font-size: 11px; color: #64748b; margin-top: 4px; }

        .form-row { display: flex; gap: 16px; }
        .form-group { flex: 1; display: flex; flex-direction: column; gap: 8px; }
        .form-group label, .form-section label { font-size: 13px; font-weight: 700; color: #64748b; }
        .required-star { color: #f43f5e; }

        .modern-input {
          background: rgba(255,255,255,0.03); border: 1px solid #1e293b; border-radius: 12px; padding: 12px 16px;
          color: #fff; font-size: 14px; outline: none; transition: all 0.2s;
        }
        .modern-input:focus:not(:disabled) { border-color: #3b82f6; background: rgba(255,255,255,0.05); }
        .modern-input:disabled { opacity: 0.6; cursor: not-allowed; }
        .textarea { resize: vertical; min-height: 100px; }

        .form-actions { display: flex; justify-content: flex-end; gap: 16px; margin-top: 12px; }
        .btn-secondary { background: none; border: none; color: #94a3b8; font-weight: 700; cursor: pointer; }
        .btn-primary { 
          background: #3b82f6; color: #fff; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 800;
          cursor: pointer; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4); transition: all 0.2s;
        }
        .btn-primary:active { transform: translateY(0); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-delete {
          background: rgba(244, 63, 94, 0.1); color: #fb7185; border: 1px solid rgba(244, 63, 94, 0.2);
          padding: 12px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s;
        }
        .btn-delete:hover:not(:disabled) { background: #f43f5e; color: #fff; box-shadow: 0 4px 15px rgba(244, 63, 94, 0.3); }
        .btn-delete:disabled { opacity: 0.5; cursor: not-allowed; }

        .delete-options { display: flex; flex-direction: column; gap: 12px; margin-top: 8px; }
        .delete-option-card {
          display: flex; align-items: flex-start; gap: 12px; padding: 12px;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05);
          border-radius: 12px; cursor: pointer; transition: all 0.2s;
        }
        .delete-option-card:hover { background: rgba(255,255,255,0.05); }
        .delete-option-card.active { border-color: #3b82f6; background: rgba(59, 130, 246, 0.1); }
        .delete-option-card.danger.active { border-color: #f43f5e; background: rgba(244, 63, 94, 0.1); }
        
        .option-info { display: flex; flex-direction: column; gap: 2px; }
        .option-title { font-size: 14px; font-weight: 700; color: #fff; }
        .option-desc { font-size: 11px; color: #94a3b8; margin: 0; line-height: 1.4; }
      `}</style>
    </div>
  );
};

export default CIFormModal;
