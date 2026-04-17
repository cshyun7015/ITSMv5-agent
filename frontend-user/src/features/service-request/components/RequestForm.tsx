import React, { useState } from 'react';
import { ServiceRequest, ServiceRequestDTO, ServiceRequestPriority } from '../../../types/request';
import { CatalogItem } from '../../service-catalog/api/catalogApi';
import DynamicFormRenderer from '../../service-catalog/components/DynamicFormRenderer';
import { Send, ArrowLeft, AlertCircle, Clock, CheckCircle, Info } from 'lucide-react';

interface RequestFormProps {
  catalogItem?: CatalogItem | null;
  initialData?: ServiceRequest | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const RequestForm: React.FC<RequestFormProps> = ({ catalogItem, initialData, onSubmit, onCancel, isLoading }) => {
  const isEdit = !!initialData;
  const [formData, setFormData] = useState<ServiceRequestDTO>({
    title: initialData?.title || (catalogItem ? `[${catalogItem.categoryName}] ${catalogItem.name}` : ''),
    description: initialData?.description || '',
    priority: (initialData?.priority as ServiceRequestPriority) || 'NORMAL',
    catalogId: catalogItem?.id || undefined
  });

  const [dynamicValues, setDynamicValues] = useState<Record<string, any>>(
    initialData?.dynamicFields ? JSON.parse(initialData.dynamicFields) : {}
  );

  const handleDynamicChange = (id: string, value: any) => {
    setDynamicValues(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;
    
    const formDataObj = new FormData();
    
    // Extract files from dynamic values
    const dynamicData: Record<string, any> = {};
    const files: File[] = [];
    
    Object.entries(dynamicValues).forEach(([key, value]) => {
      if (value instanceof File) {
        files.push(value);
      } else {
        dynamicData[key] = value;
      }
    });

    const requestBody = {
      ...formData,
      dynamicFields: JSON.stringify(dynamicData)
    };
    
    formDataObj.append('request', new Blob([JSON.stringify(requestBody)], { type: 'application/json' }));
    files.forEach(file => formDataObj.append('files', file));
    
    onSubmit(formDataObj as any); // Cast for type compatibility with existing onSubmit
  };

  return (
    <div className="request-form-container premium-card">
      <div className="form-header">
        <button className="back-btn" onClick={onCancel} disabled={isLoading}>
          <ArrowLeft size={18} />
          {isEdit ? 'Back to Details' : 'Back to Selection'}
        </button>
        <div className="item-info">
            <span className="cat-label">{catalogItem?.categoryName || 'General'}</span>
            <h2>{isEdit ? 'Update Request' : (catalogItem ? `${catalogItem.name} Request` : 'General Service Request')}</h2>
            <p>{isEdit ? `Modifying REQ-${initialData.requestId}` : (catalogItem?.description || 'Submit a manual request for any IT service or inquiry.')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-section">
            <div className="section-title">
              <Info size={16} />
              <h3>Basic Information</h3>
            </div>
            
            <div className="form-group">
              <label>Request Title <span className="req">*</span></label>
              <input 
                  type="text" 
                  placeholder="e.g. Access Request for Portal Server"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  required
                  disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label>Priority <span className="req">*</span></label>
              <div className="priority-selector">
                  {(['EMERGENCY', 'NORMAL', 'LOW'] as ServiceRequestPriority[]).map(p => (
                  <button
                      key={p}
                      type="button"
                      className={`priority-chip ${formData.priority === p ? 'active' : ''} ${p.toLowerCase()}`}
                      onClick={() => setFormData({ ...formData, priority: p })}
                      disabled={isLoading}
                  >
                      {p === 'EMERGENCY' && <AlertCircle size={14} />}
                      {p === 'NORMAL' && <Clock size={14} />}
                      {p === 'LOW' && <CheckCircle size={14} />}
                      {p}
                  </button>
                  ))}
              </div>
            </div>

            <div className="form-group">
              <label>General Description <span className="req">*</span></label>
              <textarea 
                  rows={4}
                  placeholder="Please provide additional details or context for your request..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  required
                  disabled={isLoading}
              />
            </div>
        </div>

        {catalogItem?.jsonSchema && (
          <div className="form-section">
              <div className="section-title">
                <LayoutGrid size={16} />
                <h3>Service Specific Details</h3>
              </div>
              <DynamicFormRenderer 
                  schema={catalogItem.jsonSchema} 
                  values={dynamicValues} 
                  onChange={handleDynamicChange}
                  disabled={isLoading}
              />
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={isLoading}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="spinner-small" />
                {isEdit ? 'Updating...' : 'Submitting...'}
              </>
            ) : (
              <>
                <Send size={18} />
                {isEdit ? 'Save Changes' : 'Submit Request'}
              </>
            )}
          </button>
        </div>
      </form>

      <style>{`
        .request-form-container { width: 100%; max-width: 840px; margin: 0 auto; animation: slideIn 0.4s ease; padding: 40px; }
        
        .form-header { margin-bottom: 40px; border-bottom: 1px solid var(--color-border-soft); padding-bottom: 32px; }
        .back-btn { 
          display: flex; align-items: center; gap: 8px; background: none; border: none; 
          color: var(--color-text-dim); font-size: 14px; font-weight: 600; cursor: pointer; margin-bottom: 24px;
          transition: var(--transition); padding: 0;
        }
        .back-btn:hover { color: var(--color-primary); transform: translateX(-4px); }
        
        .cat-label { font-size: 12px; font-weight: 800; color: var(--color-primary); text-transform: uppercase; letter-spacing: 1px; }
        .form-header h2 { margin: 12px 0 8px 0; font-size: 32px; font-weight: 800; color: var(--color-text-main); }
        .form-header p { margin: 0; color: var(--color-text-sub); font-size: 16px; line-height: 1.6; }

        .form-section { margin-bottom: 48px; }
        .section-title { 
          display: flex; align-items: center; gap: 10px; color: var(--color-text-dim);
          border-bottom: 1px solid var(--color-border-soft); padding-bottom: 12px; margin-bottom: 28px; 
        }
        .section-title h3 { font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0; font-weight: 700; }

        .form-group { margin-bottom: 28px; display: flex; flex-direction: column; gap: 10px; }
        .form-group label { font-size: 14px; font-weight: 700; color: var(--color-text-main); }
        .form-group label .req { color: #ef4444; }
        
        input, textarea { 
          background: var(--color-surface); border: 1px solid var(--color-border); 
          color: var(--color-text-main); padding: 14px 18px; border-radius: 10px; font-size: 15px; outline: none;
          transition: var(--transition); box-shadow: var(--shadow-sm);
        }
        input:focus, textarea:focus { 
          border-color: var(--color-primary); 
          box-shadow: 0 0 0 4px var(--color-primary-soft);
        }
        input::placeholder, textarea::placeholder { color: var(--color-text-dim); opacity: 0.6; }

        .priority-selector { display: flex; gap: 12px; }
        .priority-chip { 
          flex: 1; padding: 12px; border: 1px solid var(--color-border); background: var(--color-surface); 
          border-radius: 10px; color: var(--color-text-dim); font-weight: 700; cursor: pointer; 
          transition: var(--transition); display: flex; align-items: center; justify-content: center; gap: 8px;
          font-size: 14px;
        }
        .priority-chip:hover { border-color: var(--color-text-dim); }
        .priority-chip.active.emergency { border-color: #ef4444; color: #ef4444; background: rgba(239, 68, 68, 0.08); box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1); }
        .priority-chip.active.normal { border-color: #f59e0b; color: #f59e0b; background: rgba(245, 158, 11, 0.08); box-shadow: 0 4px 12px rgba(245, 158, 11, 0.1); }
        .priority-chip.active.low { border-color: #10b981; color: #10b981; background: rgba(16, 185, 129, 0.08); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1); }

        .form-actions { display: flex; justify-content: flex-end; gap: 16px; margin-top: 56px; padding-top: 32px; border-top: 1px solid var(--color-border-soft); }

        .spinner-small {
          width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

// LayoutGrid is missing from imports in previous thought, adding it here or to the top
import { LayoutGrid } from 'lucide-react';

export default RequestForm;
