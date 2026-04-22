import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import ToastContainer, { Toast, ToastType } from '../components/common/ToastContainer';

interface ToastContextType {
  toast: {
    success: (msg: string) => void;
    error: (msg: string) => void;
    warning: (msg: string) => void;
    info: (msg: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let idCounter = 0;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('ToastProvider MOUNTING/RENDERING');
  useEffect(() => {
    console.log('ToastProvider EFFECT: mounted');
    return () => console.log('ToastProvider EFFECT: unmounted');
  }, []);
  const [toasts, setToasts] = useState<Toast[]>([]);
  console.log(`CURRENT TOASTS STATE: count=${toasts.length}`, toasts);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    console.log(`ADDING TOAST: [${type}] ${message}`);
    const id = `toast-${++idCounter}`;
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    console.log(`REMOVING TOAST: ${id}`);
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (msg: string) => addToast(msg, 'success'),
    error: (msg: string) => addToast(msg, 'error'),
    warning: (msg: string) => addToast(msg, 'warning'),
    info: (msg: string) => addToast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToastContext must be used within ToastProvider');
  return context;
};
