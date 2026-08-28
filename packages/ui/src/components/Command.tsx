import React, { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../lib/cn';

// ─── Command (searchable command palette) ─────────────────────────────────────
export interface CommandItem {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  category?: string;
  keywords?: string[];
  onSelect?: () => void;
}

export interface CommandProps {
  items: CommandItem[];
  placeholder?: string;
  onSelect?: (item: CommandItem) => void;
  className?: string;
  maxHeight?: string;
  emptyMessage?: string;
  /** If true, the command renders as a full popup overlay */
  asPopup?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

function filterItems(items: CommandItem[], query: string): CommandItem[] {
  if (!query.trim()) return items;
  const q = query.toLowerCase();
  return items.filter(
    (item) =>
      item.label.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q) ||
      item.keywords?.some((k) => k.toLowerCase().includes(q))
  );
}

function groupByCategory(items: CommandItem[]): Record<string, CommandItem[]> {
  return items.reduce<Record<string, CommandItem[]>>((acc, item) => {
    const cat = item.category || 'Results';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});
}

const CommandPalette: React.FC<CommandProps & { query: string; setQuery: (v: string) => void }> = ({
  items,
  placeholder = 'Search...',
  onSelect,
  className,
  maxHeight = '320px',
  emptyMessage = 'No results found.',
  query,
  setQuery,
}) => {
  const filtered = filterItems(items, query);
  const grouped = groupByCategory(filtered);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSelect = (item: CommandItem) => {
    item.onSelect?.();
    onSelect?.(item);
  };

  return (
    <div className={cn('w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden', className)}>
      {/* Search input */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
        <Search size={16} className="shrink-0 text-slate-400" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
        />
        {query && (
          <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Results */}
      <div className="overflow-y-auto py-2" style={{ maxHeight }}>
        {filtered.length === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-400 text-center">{emptyMessage}</p>
        ) : (
          Object.entries(grouped).map(([category, catItems]) => (
            <div key={category}>
              <p className="px-4 py-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {category}
              </p>
              {catItems.map((item) => (
                <button
                  key={item.value}
                  onClick={() => handleSelect(item)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                >
                  {item.icon && (
                    <span className="shrink-0 text-slate-400 group-hover:text-blue-600 transition-colors">
                      {item.icon}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{item.label}</p>
                    {item.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{item.description}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export const Command: React.FC<CommandProps> = ({ asPopup, isOpen, onClose, ...rest }) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isOpen) setQuery('');
  }, [isOpen]);

  if (asPopup) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={onClose}
            />
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.15 }}
                className="w-full max-w-xl"
              >
                <CommandPalette {...rest} query={query} setQuery={setQuery} />
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return <CommandPalette {...rest} query={query} setQuery={setQuery} />;
};

export default Command;
