import React, { useState } from 'react';
import { ServiceRequestDTO, ServiceRequestPriority } from '../../../types/request';

interface RequestFormProps {
  onSubmit: (data: ServiceRequestDTO) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const RequestForm: React.FC<RequestFormProps> = ({ onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState<ServiceRequestDTO>({
    title: '',
    description: '',
    priority: 'NORMAL'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;
    onSubmit(formData);
  };

  return (
    <div className="form-container glass-card">
      <div className="form-header">
        <h2>Create Service Request</h2>
        <p>Provide details about the service you need</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Request Title</label>
          <input 
            type="text" 
            placeholder="e.g., Request for new laptop setup"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label>Priority Level</label>
          <div className="priority-selector">
            {(['EMERGENCY', 'NORMAL', 'LOW'] as ServiceRequestPriority[]).map(p => (
              <button
                key={p}
                type="button"
                className={`priority-btn ${formData.priority === p ? 'active' : ''} ${p.toLowerCase()}`}
                onClick={() => setFormData({ ...formData, priority: p })}
                disabled={isLoading}
              >
                <span className="p-icon">{p === 'EMERGENCY' ? '🚨' : p === 'NORMAL' ? '📅' : '☕'}</span>
                {p}
              </button>
            ))}
          </div>
          <p className="priority-hint">
            {formData.priority === 'EMERGENCY' ? 'Requires approval within 4 hours.' : 
             formData.priority === 'NORMAL' ? 'Standard 24-hour turnaround.' : 
             'Low priority, fulfillment within 72 hours.'}
          </p>
        </div>

        <div className="form-group">
          <label>Detailed Description</label>
          <textarea 
            rows={6}
            placeholder="Please describe your requirements in detail..."
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn-ghost" onClick={onCancel} disabled={isLoading}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Save as Draft'}
          </button>
        </div>
      </form>

      <style>{`
        .form-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          padding: 40px;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }
        .form-header {
          margin-bottom: 32px;
        }
        .form-header h2 {
          font-size: 24px;
          margin-bottom: 8px;
        }
        .form-header p {
          color: #64748b;
        }
        .form-group {
          margin-bottom: 24px;
        }
        .form-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
          color: #334155;
        }
        input, textarea {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 15px;
          transition: border 0.2s;
        }
        input:focus, textarea:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .priority-selector {
          display: flex;
          gap: 12px;
        }
        .priority-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          font-weight: 600;
          color: #64748b;
          font-size: 13px;
        }
        .priority-btn.active {
          border-color: currentColor;
          background: #f8fafc;
        }
        .priority-btn.emergency.active { color: #ef4444; background: #fef2f2; }
        .priority-btn.normal.active { color: #f59e0b; background: #fffbeb; }
        .priority-btn.low.active { color: #10b981; background: #f0fdf4; }
        
        .priority-hint {
          font-size: 13px;
          color: #94a3b8;
          margin-top: 8px;
        }
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 16px;
          margin-top: 40px;
          padding-top: 32px;
          border-top: 1px solid #f1f5f9;
        }
        .btn-ghost {
          background: none;
          color: #64748b;
          font-weight: 600;
          padding: 12px 24px;
        }
      `}</style>
    </div>
  );
};

export default RequestForm;
