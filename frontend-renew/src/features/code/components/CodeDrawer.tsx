import React from 'react';

interface CodeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

const CodeDrawer: React.FC<CodeDrawerProps> = ({ isOpen, onClose, title }) => {
  if (!isOpen) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-content glass-panel" onClick={(e) => e.stopPropagation()}>
        <header className="drawer-header">
          <h2 className="drawer-header__title">{title}</h2>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </header>

        <form className="drawer-form">
          <div className="form-group">
            <label className="form-label">Group ID</label>
            <input type="text" className="form-input" placeholder="e.g. TICKET_TYPE" />
          </div>
          <div className="form-group">
            <label className="form-label">Code ID</label>
            <input type="text" className="form-input" placeholder="e.g. INCIDENT" />
          </div>
          <div className="form-group">
            <label className="form-label">Code Name</label>
            <input type="text" className="form-input" placeholder="e.g. Incident Report" />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" rows={3} placeholder="Explain the purpose of this code" />
          </div>
          
          <div className="drawer-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Save Changes</button>
          </div>
        </form>
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
