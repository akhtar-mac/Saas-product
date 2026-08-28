import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Users,
  ClipboardList,
  LayoutDashboard,
  PhoneCall,
  FileText,
  X,
  ArrowRight,
  Zap,
  Building,
  Briefcase,
} from 'lucide-react';

interface CommandItem {
  id: string;
  type: 'page' | 'action' | 'lead' | 'task';
  label: string;
  description?: string;
  icon: React.ElementType;
  iconColor?: string;
  action: () => void;
  tags?: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const STATIC_PAGES: Omit<CommandItem, 'action'>[] = [
  { id: 'dashboard', type: 'page', label: 'Role Dashboard', description: 'Main CRM dashboard', icon: LayoutDashboard, iconColor: '#003A66' },
  { id: 'leads', type: 'page', label: 'Lead Pipeline Management', description: '17,281 live leads', icon: Users, iconColor: '#059669', tags: ['leads', 'pipeline', 'telecalling'] },
  { id: 'tasks', type: 'page', label: '10-Stage Task Engine', description: '4,911 active tasks', icon: ClipboardList, iconColor: '#7C3AED', tags: ['operations', 'tasks', 'kanban', 'milestones'] },
  { id: 'quotations', type: 'page', label: 'Quotations Manager', description: '3.7k+ quotes', icon: FileText, iconColor: '#D97706', tags: ['quotes', 'pricing', 'sales'] },
  { id: 'accounts', type: 'page', label: 'Accounts & Billing', description: 'GST invoices, payments', icon: Building, iconColor: '#9333EA' },
  { id: 'franchise', type: 'page', label: 'Franchise & Partner Hub', description: '124+ centers pan-India', icon: Briefcase, iconColor: '#D97706' },
  { id: 'sales-manager', type: 'page', label: 'Sales Manager Dashboard', description: 'Conversion metrics', icon: PhoneCall, iconColor: '#003A66' },
];

const QUICK_ACTIONS: Omit<CommandItem, 'action'>[] = [
  { id: 'add-lead', type: 'action', label: 'Add New Lead', description: 'Manually create a new lead', icon: Users, iconColor: '#059669', tags: ['create', 'new'] },
  { id: 'export-leads', type: 'action', label: 'Export Leads to CSV', description: 'Download filtered lead data', icon: FileText, iconColor: '#D97706', tags: ['export', 'download', 'csv'] },
  { id: 'kanban-view', type: 'action', label: 'Switch to Kanban View', description: 'Visual task board', icon: Zap, iconColor: '#7C3AED', tags: ['kanban', 'board', 'visual'] },
];

const ROUTE_MAP: Record<string, string> = {
  dashboard: '/crm',
  leads: '/crm/leads',
  tasks: '/crm/tasks',
  quotations: '/crm/quotations',
  accounts: '/crm/accounts',
  franchise: '/crm/franchise',
  'sales-manager': '/crm',
};

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const buildItems = useCallback((): CommandItem[] => {
    const pages = STATIC_PAGES.map((p) => ({
      ...p,
      action: () => {
        const route = ROUTE_MAP[p.id];
        if (route) navigate(route);
        onClose();
      },
    }));

    const actions = QUICK_ACTIONS.map((a) => ({
      ...a,
      action: () => onClose(),
    }));

    return [...pages, ...actions];
  }, [navigate, onClose]);

  const allItems = buildItems();

  const filtered = query.trim()
    ? allItems.filter((item) => {
        const q = query.toLowerCase();
        return (
          item.label.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.tags?.some((t) => t.includes(q))
        );
      })
    : allItems;

  const groupedPages = filtered.filter((i) => i.type === 'page');
  const groupedActions = filtered.filter((i) => i.type === 'action');

  const flatList = [...groupedPages, ...groupedActions];

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, flatList.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      flatList[activeIndex]?.action();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-16 px-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-slide-up">
        {/* Search Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, leads (name/mobile), tasks (ID), staff..."
            className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
            id="cmd-palette-input"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-mono">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[420px] overflow-y-auto p-2">
          {flatList.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">
              <Search className="w-6 h-6 mx-auto mb-2 opacity-30" />
              No results for "{query}"
            </div>
          ) : (
            <>
              {groupedPages.length > 0 && (
                <div className="mb-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-1.5">
                    Pages & Dashboards
                  </p>
                  {groupedPages.map((item, i) => {
                    const globalIdx = i;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={item.action}
                        onMouseEnter={() => setActiveIndex(globalIdx)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                          activeIndex === globalIdx ? 'bg-[#003A66] text-white' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                          style={{
                            background: activeIndex === globalIdx ? 'rgba(255,255,255,0.15)' : `${item.iconColor}15`,
                          }}
                        >
                          <Icon className="w-4 h-4" style={{ color: activeIndex === globalIdx ? 'white' : item.iconColor }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold ${activeIndex === globalIdx ? 'text-white' : 'text-slate-800'}`}>
                            {item.label}
                          </p>
                          {item.description && (
                            <p className={`text-[10px] truncate ${activeIndex === globalIdx ? 'text-white/70' : 'text-slate-400'}`}>
                              {item.description}
                            </p>
                          )}
                        </div>
                        <ArrowRight className={`w-3.5 h-3.5 shrink-0 ${activeIndex === globalIdx ? 'text-white/60' : 'text-slate-300'}`} />
                      </button>
                    );
                  })}
                </div>
              )}

              {groupedActions.length > 0 && (
                <div className="mt-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-1.5">
                    Quick Actions
                  </p>
                  {groupedActions.map((item, i) => {
                    const globalIdx = groupedPages.length + i;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={item.action}
                        onMouseEnter={() => setActiveIndex(globalIdx)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                          activeIndex === globalIdx ? 'bg-[#003A66] text-white' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            background: activeIndex === globalIdx ? 'rgba(255,255,255,0.15)' : `${item.iconColor}15`,
                          }}
                        >
                          <Icon className="w-4 h-4" style={{ color: activeIndex === globalIdx ? 'white' : item.iconColor }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold ${activeIndex === globalIdx ? 'text-white' : 'text-slate-800'}`}>
                            {item.label}
                          </p>
                          {item.description && (
                            <p className={`text-[10px] ${activeIndex === globalIdx ? 'text-white/70' : 'text-slate-400'}`}>
                              {item.description}
                            </p>
                          )}
                        </div>
                        <kbd className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${activeIndex === globalIdx ? 'bg-white/20 text-white/80' : 'bg-slate-100 text-slate-500'}`}>
                          ↵
                        </kbd>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">↑↓</kbd> Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">↵</kbd> Open
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">ESC</kbd> Close
            </span>
          </div>
          <span className="font-semibold text-brand-navy">ETaxwala CRM</span>
        </div>
      </div>
    </div>
  );
}
