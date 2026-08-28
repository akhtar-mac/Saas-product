import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../lib/cn';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  error,
  disabled = false,
  className,
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (opt: SelectOption) => {
    if (opt.disabled) return;
    onChange?.(opt.value);
    setIsOpen(false);
  };

  return (
    <div className={cn('w-full', className)} ref={ref}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          id={selectId}
          disabled={disabled}
          onClick={() => setIsOpen((v) => !v)}
          className={cn(
            'w-full h-10 flex items-center justify-between px-4 rounded-lg border text-sm text-left',
            'bg-white dark:bg-slate-900 transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500',
            'disabled:opacity-60 disabled:cursor-not-allowed',
            error
              ? 'border-rose-500'
              : 'border-slate-300 dark:border-slate-700',
            isOpen && 'ring-2 ring-blue-500/30 border-blue-500'
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className={cn('flex items-center gap-2 truncate', !selected && 'text-slate-400')}>
            {selected?.icon && <span className="shrink-0">{selected.icon}</span>}
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown
            size={16}
            className={cn('shrink-0 text-slate-400 transition-transform duration-200', isOpen && 'rotate-180')}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.ul
              role="listbox"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg overflow-hidden py-1 max-h-60 overflow-y-auto"
            >
              {options.map((opt) => (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={opt.value === value}
                  onClick={() => handleSelect(opt)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 text-sm cursor-pointer transition-colors',
                    opt.disabled
                      ? 'opacity-40 cursor-not-allowed'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800',
                    opt.value === value && 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                  )}
                >
                  {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                  <span className="flex-1 truncate">{opt.label}</span>
                  {opt.value === value && <Check size={14} className="shrink-0" />}
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
      {error && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  );
};

export default Select;
