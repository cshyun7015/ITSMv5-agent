import React, { useState, useEffect } from 'react';
import { CodeDTO } from '../../../types/code';
import { useToast } from '../../../hooks/useToast';
import { codeApi } from '../api/codeApi';

interface CodeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData: CodeDTO | null;
  title: string;
}

const CodeDrawer: React.FC<CodeDrawerProps> = ({ isOpen, onClose, onSuccess, initialData, title }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<CodeDTO>>({
    groupId: '',
    codeId: '',
    codeName: '',
    description: '',
    sortOrder: 10,
    isActive: true
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const defaults = {
      groupId: '',
      codeId: '',
      codeName: '',
      description: '',
      sortOrder: 10,
      isActive: true
    };

    if (initialData) {
      console.log('CodeDrawer received initialData:', JSON.stringify(initialData));
      setFormData({ ...defaults, ...initialData });
    } else {
      setFormData(defaults);
    }
    setFieldErrors({});
  }, [initialData, isOpen]);

  const handleSubmit = async (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});

    // Data cleaning
    const cleanData = {
      ...formData,
      groupId: formData.groupId?.trim().toUpperCase() || '',
      codeId: formData.codeId?.trim().toUpperCase() || '',
      codeName: formData.codeName?.trim() || '',
      sortOrder: formData.sortOrder,
      isActive: formData.isActive
    };
    // Ensure id is not in the body if we want to be safe, or keep it if backend expects it.
    // Let's remove it to see if it fixes 400.
    const { id: _, ...payload } = cleanData as any;

    console.log('PAYLOAD TO SEND (cleaned):', JSON.stringify(payload));
    try {
      if (initialData?.id) {
        console.log(`Updating code ID ${initialData.id}...`);
        await codeApi.updateCode(initialData.id, payload as any);
        console.log('Update API SUCCESS');
        toast.success('Code updated successfully');
      } else {
        console.log('Creating new code...');
        await codeApi.createCode(cleanData);
        console.log('Create API SUCCESS');
        toast.success('Code created successfully');
      }
      onSuccess();
    } catch (error: any) {
      console.error('API ERROR:', error.response?.status, error.response?.data);
      console.error('Failed to save code', error);
      if (error.response?.status === 400 && error.response?.data?.errors) {
        setFieldErrors(error.response.data.errors);
        toast.error('Please check the validation errors');
      } else {
        toast.error(error.response?.data?.message || 'Failed to save code');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="drawer-overlay" onClick={onClose} data-testid="code-drawer-overlay">
      <div className="drawer-content glass-panel" onClick={(e) => e.stopPropagation()} data-testid="code-drawer-content">
        <header className="drawer-header">
          <h2 className="drawer-header__title">{title}</h2>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </header>

        <div className="drawer-form">
          <div className="form-group">
            <label className="form-label" htmlFor="groupId">Group ID</label>
            <input 
              id="groupId"
              type="text" 
              className={`form-input ${fieldErrors.groupId ? 'form-input--error' : ''}`} 
              required
              value={formData.groupId}
              onChange={(e) => setFormData(prev => ({ ...prev, groupId: e.target.value.toUpperCase() }))}
              placeholder="e.g. SR_STATUS" 
            />
            {fieldErrors.groupId && <span className="field-error">{fieldErrors.groupId}</span>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="codeId">Code ID</label>
            <input 
              id="codeId"
              type="text" 
              className={`form-input ${fieldErrors.codeId ? 'form-input--error' : ''}`} 
              required
              value={formData.codeId}
              onChange={(e) => setFormData(prev => ({ ...prev, codeId: e.target.value.toUpperCase() }))}
              placeholder="e.g. OPEN" 
            />
            {fieldErrors.codeId && <span className="field-error">{fieldErrors.codeId}</span>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="codeName">Code Name</label>
            <input 
              id="codeName"
              type="text" 
              className={`form-input ${fieldErrors.codeName ? 'form-input--error' : ''}`} 
              required
              value={formData.codeName}
              onChange={(e) => setFormData(prev => ({ ...prev, codeName: e.target.value }))}
              placeholder="e.g. 접수 완료" 
            />
            {fieldErrors.codeName && <span className="field-error">{fieldErrors.codeName}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              className="form-input" 
              rows={3} 
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Explain the purpose of this code" 
            />
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label className="form-label">Sort Order</label>
              <input 
                type="number" 
                className="form-input" 
                value={formData.sortOrder}
                onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) }))}
              />
            </div>
            <div className="form-group half checkbox">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                />
                Active
              </label>
            </div>
          </div>
          
          <div className="drawer-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
              <button 
                type="button" 
                className="btn-primary" 
                disabled={isSubmitting}
                onClick={handleSubmit}
                data-testid="save-code-btn"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
          </div>
        </div>
      </div>

      <style>{`
        .drawer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          display: flex;
          justify-content: flex-end;
          z-index: 1000;
          animation: fadeIn 0.3s ease-out;
        }
        .drawer-content {
          width: 480px;
          height: 100%;
          border-radius: 24px 0 0 24px;
          border-right: none;
          transform: translateX(0);
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
        }
        .drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }
        .drawer-header__title {
          font-size: 1.5rem;
          margin: 0;
          background: linear-gradient(to right, #fff, var(--text-muted));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .btn-close {
          background: transparent;
          border: none;
          color: white;
          font-size: 2rem;
          cursor: pointer;
        }
        .form-group {
          margin-bottom: 24px;
        }
        .form-label {
          display: block;
          margin-bottom: 8px;
          color: var(--text-muted);
          font-size: 0.9rem;
        }
        .form-input {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          border-radius: 10px;
          color: white;
          outline: none;
          transition: var(--transition-smooth);
        }
        .form-input:focus {
          border-color: var(--primary);
          background: rgba(255, 255, 255, 0.1);
          box-shadow: 0 0 0 4px var(--primary-glow);
        }
        .form-input--error {
          border-color: #ef4444;
          background: rgba(239, 68, 68, 0.05);
        }
        .form-input--error:focus {
          border-color: #f87171;
          box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.2);
        }
        .field-error {
          display: block;
          margin-top: 6px;
          color: #f87171;
          font-size: 0.8rem;
          font-weight: 500;
        }
        .drawer-actions {
          margin-top: auto;
          display: flex;
          gap: 12px;
          padding-top: 32px;
        }
        .btn-secondary {
          flex: 1;
          background: transparent;
          color: white;
          border: 1px solid var(--glass-border);
          padding: 12px;
          border-radius: 10px;
          cursor: pointer;
          transition: var(--transition-smooth);
        }
        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.05);
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default CodeDrawer;
