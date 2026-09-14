import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((message, variant = 'success', timeoutMs = 5000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, variant }]);
    if (timeoutMs) {
      setTimeout(() => remove(id), timeoutMs);
    }
  }, [remove]);

  const value = useMemo(() => ({ show }), [show]);

  const getIcon = (variant) => {
    switch (variant) {
      case 'success': return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-rose-500" />;
      case 'info': return <Info className="h-5 w-5 text-blue-500" />;
      default: return <Info className="h-5 w-5 text-slate-500" />;
    }
  };

  const getVariantStyles = (variant) => {
    switch (variant) {
      case 'success': return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100';
      case 'error': return 'border-rose-500/20 bg-rose-500/10 text-rose-900 dark:text-rose-100';
      case 'info': return 'border-blue-500/20 bg-blue-500/10 text-blue-900 dark:text-blue-100';
      default: return 'border-slate-500/20 bg-slate-500/10 text-slate-900 dark:text-slate-100';
    }
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-8 right-8 space-y-4 z-[9999] pointer-events-none max-w-md w-full">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`pointer-events-auto flex items-center p-5 rounded-3xl border backdrop-blur-xl shadow-2xl ${getVariantStyles(t.variant)}`}
            >
              <div className="flex-shrink-0 mr-4">
                {getIcon(t.variant)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-black uppercase tracking-widest">{t.variant === 'error' ? 'System Fault' : 'Network Update'}</p>
                <p className="text-sm font-bold opacity-90 mt-1">{t.message}</p>
              </div>
              <button
                onClick={() => remove(t.id)}
                className="ml-4 p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 opacity-50" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
