import React, { useEffect, useRef } from 'react';
import { LogOut, X } from 'lucide-react';

export interface SignOutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export function SignOutConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Sign out?',
  description = 'You will need to sign in again to access your ETaxwala workspace.',
}: SignOutConfirmModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Move focus inside the dialog on open
    const focusTimer = requestAnimationFrame(() => {
      cancelBtnRef.current?.focus();
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (
            document.activeElement === first ||
            !dialogRef.current.contains(document.activeElement)
          ) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (
            document.activeElement === last ||
            !dialogRef.current.contains(document.activeElement)
          ) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      cancelAnimationFrame(focusTimer);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-900/55 backdrop-blur-sm flex items-center justify-center p-4"
      role="presentation"
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sign-out-modal-title"
        aria-describedby="sign-out-modal-desc"
        className="relative w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-2xl border border-[#EAE6DD]"
      >
        <div className="h-1 bg-multicolor" />
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center shrink-0">
                <LogOut className="w-4 h-4" />
              </div>
              <div>
                <h3
                  id="sign-out-modal-title"
                  className="text-sm font-bold text-slate-900 leading-snug"
                >
                  {title}
                </h3>
                <p id="sign-out-modal-desc" className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-5 flex items-center justify-end gap-2.5">
            <button
              ref={cancelBtnRef}
              type="button"
              onClick={onClose}
              className="btn-outline btn-md"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onConfirm();
              }}
              className="btn-danger btn-md"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignOutConfirmModal;
