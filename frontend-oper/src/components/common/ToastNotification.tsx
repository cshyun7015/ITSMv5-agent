import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | null;
  onClose: () => void;
}

const ToastNotification: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message || !type) return null;

  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';

  return (
    <div className={`custom-toast glass-panel ${type} show`}>
      <span className="toast-icon">{icon}</span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose}>&times;</button>
      <style>{`
        .custom-toast {
          position: fixed; top: 24px; right: 24px;
          display: flex; align-items: center; gap: 12px;
          padding: 12px 20px; border-radius: 12px;
          background: rgba(23, 23, 23, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff; z-index: 10001;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          transform: translateX(120%); transition: transform 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
        }
        .custom-toast.show { transform: translateX(0); }
        .custom-toast.success { border-left: 4px solid #10b981; }
        .custom-toast.error { border-left: 4px solid #ef4444; }
        .custom-toast.info { border-left: 4px solid #3b82f6; }
        
        .toast-icon { font-size: 18px; }
        .toast-message { font-size: 14px; font-weight: 500; }
        .toast-close {
          background: none; border: none; color: #94a3b8;
          font-size: 18px; cursor: pointer; padding: 0 0 0 8px;
        }
        .toast-close:hover { color: #fff; }
      `}</style>
    </div>
  );
};

export default ToastNotification;
