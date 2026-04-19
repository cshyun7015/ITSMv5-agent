import React, { useEffect, useRef } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const ICONS: Record<ToastType, string> = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
};

const COLORS: Record<ToastType, string> = {
  success: '#10b981',
  error:   '#ef4444',
  warning: '#f59e0b',
  info:    '#3b82f6',
};

const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => onRemove(toast.id), 4000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [toast.id, onRemove]);

  return (
    <div className={`toast-item toast-${toast.type}`}>
      <span className="toast-icon">{ICONS[toast.type]}</span>
      <span className="toast-message">{toast.message}</span>
      <button className="toast-close" onClick={() => onRemove(toast.id)}>×</button>
      <style>{`
        .toast-item {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 18px; border-radius: 14px; min-width: 280px; max-width: 420px;
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(16px);
          box-shadow: 0 16px 40px -8px rgba(0,0,0,0.5);
          animation: toastIn 0.35s cubic-bezier(0.22, 1, 0.36, 1);
          position: relative; overflow: hidden;
        }
        .toast-item::before {
          content: '';
          position: absolute; left: 0; top: 0; bottom: 0; width: 4px;
          border-radius: 14px 0 0 14px;
        }
        .toast-success::before { background: ${COLORS.success}; }
        .toast-error::before   { background: ${COLORS.error}; }
        .toast-warning::before { background: ${COLORS.warning}; }
        .toast-info::before    { background: ${COLORS.info}; }

        .toast-icon { font-size: 18px; flex-shrink: 0; }
        .toast-message { font-size: 13.5px; font-weight: 500; color: #f1f5f9; flex: 1; line-height: 1.4; }
        .toast-close {
          background: none; border: none; color: #64748b;
          font-size: 20px; cursor: pointer; padding: 0; line-height: 1;
          flex-shrink: 0; transition: color 0.2s;
        }
        .toast-close:hover { color: #f1f5f9; }

        @keyframes toastIn {
          from { opacity: 0; transform: translateX(110%); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;
  return (
    <div className="toast-container">
      {toasts.map(t => <ToastItem key={t.id} toast={t} onRemove={onRemove} />)}
      <style>{`
        .toast-container {
          position: fixed; top: 24px; right: 24px;
          display: flex; flex-direction: column; gap: 10px;
          z-index: 10001; pointer-events: none;
        }
        .toast-container > * { pointer-events: auto; }
      `}</style>
    </div>
  );
};

export default ToastContainer;
