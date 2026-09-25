import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface CrmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  icon?: React.ReactNode;
}

export function CrmModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  icon,
}: CrmModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
    '2xl': 'max-w-7xl',
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div
        className={`relative w-full ${sizeClasses[size]} bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#EAE6DD] animate-scale-in max-h-[94vh] flex flex-col`}
      >
        <div className="h-1 bg-multicolor" />
        <div className="p-4 sm:p-5 bg-white border-b border-[#EAE6DD] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            {icon ? (
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1B365D] flex items-center justify-center shrink-0">
                {icon}
              </div>
            ) : null}
            <div>
              <h3 className="font-extrabold text-sm text-[#1B365D]">{title}</h3>
              {description ? <p className="text-[11px] text-slate-500">{description}</p> : null}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 sm:p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export default CrmModal;
