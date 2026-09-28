import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../lib/cn';

// ─── Toast Types ──────────────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number; // ms, default 4000
  action?: { label: string; onClick: () => void };
}

// ─── Individual Toast ─────────────────────────────────────────────────────────
interface ToastProps extends ToastItem {
  onDismiss: (id: string) => void;
}

const toastConfig: Record<ToastType, { icon: React.ReactNode; classes: string }> = {
  success: {
    icon: <CheckCircle2 size={18} className="text-emerald-500" />,
    classes: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30',
  },
  error: {
    icon: <XCircle size={18} className="text-rose-500" />,
    classes: 'border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/30',
  },
  warning: {
    icon: <AlertTriangle size={18} className="text-amber-500" />,
    classes: 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30',
  },
  info: {
    icon: <Info size={18} className="text-blue-500" />,
    classes: 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30',
  },
};

const Toast: React.FC<ToastProps> = ({ id, type, title, description, duration = 4000, action, onDismiss }) => {
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const config = toastConfig[type];

  useEffect(() => {
    timerRef.current = setTimeout(() => onDismiss(id), duration);
    return () => clearTimeout(timerRef.current);
  }, [id, duration, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.95 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn(
        'relative w-80 max-w-full flex gap-3 p-4 rounded-xl border shadow-lg',
        'bg-white dark:bg-slate-900',
        config.classes
      )}
      role="alert"
    >
      <span className="shrink-0 mt-0.5">{config.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</p>
        {description && <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">{description}</p>}
        {action && (
          <button
            onClick={action.onClick}
            className="mt-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            {action.label}
          </button>
        )}
      </div>
      <button
        onClick={() => onDismiss(id)}
        className="shrink-0 p-0.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
};

// ─── Toast Container ──────────────────────────────────────────────────────────
export interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center';
}

const positions = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
};

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
  position = 'top-right',
}) => (
  <div className={cn('fixed z-[9999] flex flex-col gap-2', positions[position])}>
    <AnimatePresence mode="popLayout">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onDismiss={onDismiss} />
      ))}
    </AnimatePresence>
  </div>
);

// ─── useToast hook helper ─────────────────────────────────────────────────────
let _toastId = 0;
export function createToast(type: ToastType, title: string, options?: Partial<Omit<ToastItem, 'id' | 'type' | 'title'>>): ToastItem {
  return { id: `toast-${++_toastId}`, type, title, ...options };
}

export default ToastContainer;
