import React, { useState } from 'react';
import { ServiceRequestDTO, ServiceRequestPriority } from '../../../types/request';
import { CatalogItem } from '../../service-catalog/api/catalogApi';
import DynamicFormRenderer from '../../service-catalog/components/DynamicFormRenderer';

interface RequestFormProps {
  catalogItem: CatalogItem;
  onSubmit: (data: ServiceRequestDTO) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const RequestForm: React.FC<RequestFormProps> = ({ catalogItem, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState<ServiceRequestDTO>({
    title: `[${catalogItem.categoryName}] ${catalogItem.name}`,
    description: '',
    priority: 'NORMAL',
    catalogId: catalogItem.id
  });

  const [dynamicValues, setDynamicValues] = useState<Record<string, any>>({});

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
    <div className="request-form-container glass-panel">
      <div className="form-header">
        <div className="item-info">
            <span className="cat-label">{catalogItem.categoryName}</span>
            <h2>{catalogItem.name} Request</h2>
            <p>{catalogItem.description}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-group">
            <label>Request Title</label>
            <input 
                type="text" 
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                required
                disabled={isLoading}
            />
            </div>

            <div className="form-group">
            <label>Priority</label>
            <div className="priority-chips">
                {(['EMERGENCY', 'NORMAL', 'LOW'] as ServiceRequestPriority[]).map(p => (
                <button
                    key={p}
                    type="button"
                    className={`chip ${formData.priority === p ? 'active' : ''} ${p.toLowerCase()}`}
                    onClick={() => setFormData({ ...formData, priority: p })}
                    disabled={isLoading}
                >
                    {p}
                </button>
                ))}
            </div>
            </div>

            <div className="form-group">
            <label>General Description</label>
            <textarea 
                rows={4}
                placeholder="Additional notes or context..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                required
                disabled={isLoading}
            />
            </div>
        </div>

        <div className="form-section">
            <h3>Service Specific Details</h3>
            <DynamicFormRenderer 
                schema={catalogItem.jsonSchema} 
                values={dynamicValues} 
                onChange={handleDynamicChange}
                disabled={isLoading}
            />
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={isLoading}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Submitting mission...' : 'Submit Request'}
          </button>
        </div>
      </form>

      <style>{`
        .request-form-container { width: 100%; max-width: 800px; margin: 0 auto; animation: slideIn 0.3s ease; }
        .form-header { margin-bottom: 32px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 24px; }
        .cat-label { font-size: 11px; font-weight: 800; color: #3b82f6; text-transform: uppercase; letter-spacing: 1px; }
        .form-header h2 { margin: 8px 0 4px 0; font-size: 26px; }
        .form-header p { margin: 0; color: #64748b; }

        .form-section { margin-bottom: 40px; }
        .form-section h3 { font-size: 14px; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px; margin-bottom: 24px; }

        .form-group { margin-bottom: 24px; display: flex; flex-direction: column; gap: 8px; }
        .form-group label { font-size: 14px; font-weight: 600; color: #f1f5f9; }
        
        input, textarea { 
          background: rgba(15, 23, 42, 0.4); border: 1px solid #334155; 
          color: #fff; padding: 12px 16px; border-radius: 8px; font-size: 15px; outline: none;
        }
        input:focus, textarea:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }

        .priority-chips { display: flex; gap: 8px; }
        .chip { 
          flex: 1; padding: 10px; border: 1px solid #334155; background: transparent; 
          border-radius: 8px; color: #94a3b8; font-weight: 700; cursor: pointer; transition: all 0.2s;
        }
        .chip.active.emergency { border-color: #ef4444; color: #ef4444; background: rgba(239, 68, 68, 0.05); }
        .chip.active.normal { border-color: #f59e0b; color: #f59e0b; background: rgba(245, 158, 11, 0.05); }
        .chip.active.low { border-color: #10b981; color: #10b981; background: rgba(16, 185, 129, 0.05); }

        .form-actions { display: flex; justify-content: flex-end; gap: 16px; margin-top: 40px; }
        .btn-secondary { background: transparent; border: 1px solid #334155; color: #94a3b8; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; }
        .btn-primary { background: #3b82f6; color: #fff; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; cursor: pointer; }

        @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default RequestForm;
