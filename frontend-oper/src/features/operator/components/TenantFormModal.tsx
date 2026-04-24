import React, { useState } from 'react';

interface TenantFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { tenantId: string; name: string; brandColor: string }) => Promise<void>;
}

const TenantFormModal: React.FC<TenantFormModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    tenantId: '',
    name: '',
    brandColor: '#3b82f6'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      alert('Failed to create operating company. The Tenant ID might already be in use.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content small-modal">
        <header className="modal-header">
          <h2>Create New Operating Company</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </header>

        <form onSubmit={handleSubmit} className="standard-form">
          <div className="form-section">
            <label>Tenant ID (Permanent)</label>
            <input
              value={formData.tenantId}
              onChange={e => setFormData({ ...formData, tenantId: e.target.value.toUpperCase() })}
              className="modern-input"
              placeholder="e.g. ACME_OPS"
              required
              pattern="^[A-Z0-9_]+$"
              title="Only uppercase letters, numbers, and underscores are allowed"
            />
            <p className="field-hint">Used for login and URL isolation.</p>
          </div>

          <div className="form-section">
            <label>Company Name</label>
            <input
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="modern-input"
              placeholder="e.g. Acme Operations Hub"
              required
            />
          </div>

          <div className="form-section">
            <label>Brand Color</label>
            <div className="color-input-wrapper">
              <input
                type="color"
                value={formData.brandColor}
                onChange={e => setFormData({ ...formData, brandColor: e.target.value })}
                className="color-picker"
              />
              <input
                type="text"
                value={formData.brandColor}
                onChange={e => setFormData({ ...formData, brandColor: e.target.value })}
                className="modern-input color-text"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Company'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .field-hint {
          font-size: 0.75rem;
          color: #64748b;
          margin-top: 4px;
        }
        .color-input-wrapper {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .color-picker {
          width: 44px;
          height: 44px;
          padding: 0;
          border: 1px solid var(--glass-border);
          border-radius: 8px;
          background: transparent;
          cursor: pointer;
        }
        .color-text {
          flex: 1;
        }
      `}</style>
    </div>
  );
};

export default TenantFormModal;
