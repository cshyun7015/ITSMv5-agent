import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="custom-confirm-overlay">
      <div className="custom-confirm-modal glass-panel">
        <div className="confirm-icon">⚠️</div>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="confirm-actions">
          <button className="confirm-btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="confirm-btn-action" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
      <style>{`
        .custom-confirm-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          z-index: 10000; animation: fadeIn 0.2s ease;
        }
        .custom-confirm-modal {
          background: rgba(23, 23, 23, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px; padding: 32px;
          max-width: 400px; width: 90%; text-align: center;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .confirm-icon { font-size: 40px; margin-bottom: 16px; }
        .custom-confirm-modal h3 { margin: 0 0 12px 0; font-size: 20px; color: #fff; }
        .custom-confirm-modal p { margin: 0 0 24px 0; color: #94a3b8; font-size: 15px; line-height: 1.5; }
        .confirm-actions { display: flex; gap: 12px; justify-content: center; }
        .confirm-btn-cancel {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          color: #94a3b8; padding: 10px 24px; border-radius: 10px; cursor: pointer;
          font-weight: 600; transition: all 0.2s;
        }
        .confirm-btn-cancel:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .confirm-btn-action {
          background: linear-gradient(135deg, #ef4444, #b91c1c); border: none;
          color: #fff; padding: 10px 24px; border-radius: 10px; cursor: pointer;
          font-weight: 600; transition: all 0.2s; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
        }
        .confirm-btn-action:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4); }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default ConfirmDialog;
