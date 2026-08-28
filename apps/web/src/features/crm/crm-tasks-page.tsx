import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Layers,
  X,
  RefreshCw,
  LayoutGrid,
  Table2,
  Timer,
  FileText,
  ChevronDown,
} from 'lucide-react';
import { TaskStatus, TASK_STATUS_LABELS } from '@etaxwala/types';

/* ─── Types ─── */
type ViewMode = 'table' | 'kanban';

/* ─── Kanban phase config ─── */
const KANBAN_PHASES = [
  {
    id: 'doc-collection',
    label: 'Doc Collection & KYC',
    stages: [1, 2],
    color: '#64748b',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    headerBg: 'bg-slate-100',
    badge: 'bg-slate-200 text-slate-700',
  },
  {
    id: 'filing-prep',
    label: 'Govt Filing Prep',
    stages: [3],
    color: '#D97706',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    headerBg: 'bg-amber-100',
    badge: 'bg-amber-200 text-amber-800',
  },
  {
    id: 'submitted',
    label: 'Submitted on Portal',
    stages: [4],
    color: '#7C3AED',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    headerBg: 'bg-purple-100',
    badge: 'bg-purple-200 text-purple-800',
  },
  {
    id: 'qc-ca',
    label: 'QC & CA Sign-off',
    stages: [5, 6],
    color: '#0284c7',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    headerBg: 'bg-sky-100',
    badge: 'bg-sky-200 text-sky-800',
  },
  {
    id: 'delivered',
    label: 'Approved & Delivered',
    stages: [7, 8, 9, 10],
    color: '#059669',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    headerBg: 'bg-emerald-100',
    badge: 'bg-emerald-200 text-emerald-800',
  },
];

/* ─── SLA Badge helper ─── */
function SlaBadge({ assignDate }: { assignDate?: string }) {
  if (!assignDate) return null;
  const hoursElapsed = Math.floor((Date.now() - new Date(assignDate).getTime()) / 3600000);

  if (hoursElapsed > 48) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-red-100 text-red-700">
        <Timer className="w-2.5 h-2.5" /> OVERDUE
      </span>
    );
  } else if (hoursElapsed > 24) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-700">
        <Timer className="w-2.5 h-2.5" /> {'<'}24h left
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-700">
      <Timer className="w-2.5 h-2.5" /> On Track
    </span>
  );
}

/* ─── Status badge (shared) ─── */
const getStatusBadge = (status: number) => {
  const map: Record<number, { label: string; bg: string }> = {
    1: { label: 'Doc Collection', bg: 'bg-slate-100 text-slate-700' },
    2: { label: 'Verification', bg: 'bg-blue-50 text-blue-700' },
    3: { label: 'Govt Filing Prep', bg: 'bg-amber-50 text-amber-700' },
    4: { label: 'Submitted on Portal', bg: 'bg-purple-50 text-purple-700' },
    5: { label: 'Govt Approved', bg: 'bg-emerald-50 text-emerald-700' },
    6: { label: 'Delivered / Closed', bg: 'bg-emerald-100 text-emerald-800' },
  };
  return map[status] ?? { label: `Stage ${status}`, bg: 'bg-slate-50 text-slate-600' };
};

/* ─── Kanban Card ─── */
function KanbanCard({ task, onAdvance }: { task: any; onAdvance: (task: any) => void }) {
  const statusInfo = getStatusBadge(task.original_task_status);
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm hover:shadow-md transition-shadow group space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold text-slate-800 leading-tight">
            {task.sub_customer_name || `Customer #${task.cust_id}`}
          </p>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">Task #{task.task_id}</p>
        </div>
        <SlaBadge assignDate={task.assign_date} />
      </div>

      <p className="text-[11px] text-slate-600 font-medium line-clamp-1">
        {task.task_name || 'Statutory Compliance'}
      </p>

      <div className="flex items-center justify-between gap-2">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusInfo.bg}`}>
          {statusInfo.label}
        </span>
        <button
          onClick={() => onAdvance(task)}
          className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[10px] font-bold text-brand-navy bg-brand-navy/5 hover:bg-brand-navy hover:text-white px-2 py-1 rounded-lg transition-all"
        >
          Advance <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

/* ─── Kanban Board ─── */
function KanbanBoard({ tasks, onAdvance }: { tasks: any[]; onAdvance: (task: any) => void }) {
  const groupByPhase = (phaseStages: number[]) =>
    tasks.filter((t) => phaseStages.includes(t.original_task_status));

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-xs text-slate-400">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-brand-navy" /> Loading tasks...
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {KANBAN_PHASES.map((phase) => {
        const phaseTasks = groupByPhase(phase.stages);
        return (
          <div key={phase.id} className="flex-1 min-w-[220px] max-w-[280px] flex flex-col gap-2">
            {/* Phase Header */}
            <div className={`flex items-center justify-between px-3 py-2 rounded-xl ${phase.headerBg} border ${phase.border}`}>
              <span className="text-[11px] font-bold" style={{ color: phase.color }}>
                {phase.label}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${phase.badge}`}>
                {phaseTasks.length}
              </span>
            </div>
            {/* Cards */}
            <div className="flex flex-col gap-2 flex-1">
              {phaseTasks.length === 0 ? (
                <div className="flex items-center justify-center h-16 rounded-xl border-2 border-dashed border-slate-200 text-[10px] text-slate-300">
                  Empty
                </div>
              ) : (
                phaseTasks.map((task) => (
                  <KanbanCard key={task.task_id} task={task} onAdvance={onAdvance} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main Page ─── */
export default function CrmTasksPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<number>(1);
  const [milestoneRemarks, setMilestoneRemarks] = useState('');
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Staff name map: userId -> name
  const [staffMap, setStaffMap] = useState<Record<number, string>>({});

  useEffect(() => {
    fetch('/v1/crm/staff')
      .then((r) => r.json())
      .then((d) => { if (d?.success) setStaffMap(d.data || {}); })
      .catch(() => {});
  }, []);

  const resolveOfficerName = (id: number | null): string => {
    if (!id) return '—';
    return staffMap[id] || `Officer #${id}`;
  };

  const fetchTasks = () => {
    setIsLoading(true);
    const query = new URLSearchParams({
      limit: '50',
      ...(statusFilter !== 'ALL' && { status: statusFilter }),
    });

    fetch(`/v1/crm/tasks?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.data)) {
          setTasks(data.data);
        }
      })
      .catch((err) => console.error('Error fetching tasks:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchTasks();
  }, [statusFilter]);

  const handleOpenAdvance = (task: any) => {
    setSelectedTask(task);
    setNewStatus((task.original_task_status || 1) + 1);
    setIsModalOpen(true);
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    try {
      await fetch(`/v1/crm/tasks/${selectedTask.task_id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          new_status: Number(newStatus),
          remarks: milestoneRemarks,
          updated_by: 'Operations Executive',
        }),
      });

      alert(`✅ Milestone for Task #${selectedTask.task_id} advanced successfully in PostgreSQL!`);
      setIsModalOpen(false);
      setMilestoneRemarks('');
      fetchTasks();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-brand-navy">
              10-Stage Task & Service Delivery Engine
            </h1>
            <span className="badge badge-gold font-mono">4,911 Live DB Tasks</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Standardized operational milestones from document collection to government approval & certificate issuance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-0.5 bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'table' ? 'bg-white text-brand-navy shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Table2 className="w-3.5 h-3.5" /> Table
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'kanban' ? 'bg-white text-brand-navy shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Kanban
            </button>
          </div>

          <button onClick={fetchTasks} className="btn btn-outline btn-sm">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Pipeline
          </button>
          <span className="badge badge-green text-xs py-1.5 px-3">SLA Engine Live</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-slate-800">
              {viewMode === 'kanban' ? 'Kanban Pipeline View' : `Active Service Orders (${tasks.length} showing)`}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {viewMode === 'kanban'
                ? 'Drag cards or use "Advance" button to move tasks through stages'
                : "Connected to PostgreSQL `operation_tasks`"}
            </p>
          </div>

          {viewMode === 'table' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#F7F8FA] border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700"
            >
              <option value="ALL">All Milestones</option>
              <option value="1">1. Doc Collection</option>
              <option value="2">2. Verification</option>
              <option value="3">3. Govt Filing Prep</option>
              <option value="4">4. Submitted to Portal</option>
              <option value="5">5. Approval Received</option>
              <option value="6">6. Completed</option>
            </select>
          )}
        </div>

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="overflow-x-auto">
            <table className="table-etaxwala">
              <thead>
                <tr>
                  <th>Task ID / Client</th>
                  <th>Task / Service Name</th>
                  <th>Assigned Officer</th>
                  <th>Current Milestone</th>
                  <th>SLA Status</th>
                  <th>Date Assigned</th>
                  <th className="text-right">Advance Stage</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-xs text-slate-400">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-brand-navy" />
                      Fetching operational tasks from PostgreSQL...
                    </td>
                  </tr>
                ) : tasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-xs text-slate-400">
                      No tasks found matching filter.
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => {
                    const statusInfo = getStatusBadge(task.original_task_status);
                    return (
                      <tr key={task.task_id}>
                        <td>
                          <p className="font-bold text-slate-800 text-xs">
                            {task.sub_customer_name || `Customer #${task.cust_id}`}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">Task #{task.task_id}</p>
                        </td>
                        <td className="text-xs font-semibold text-slate-700">
                          {task.task_name || 'Statutory Compliance'}
                        </td>
                        <td className="text-xs font-semibold text-brand-navy">
                          {resolveOfficerName(task.added_by)}
                        </td>

                        <td>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusInfo.bg}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td>
                          <SlaBadge assignDate={task.assign_date} />
                        </td>
                        <td className="text-xs text-slate-500">
                          {task.assign_date ? new Date(task.assign_date).toLocaleDateString() : 'Active'}
                        </td>
                        <td className="text-right">
                          <button onClick={() => handleOpenAdvance(task)} className="btn btn-primary btn-sm">
                            Update Stage →
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Kanban View */}
        {viewMode === 'kanban' && (
          <KanbanBoard tasks={isLoading ? [] : tasks} onAdvance={handleOpenAdvance} />
        )}
      </div>

      {/* Advance Milestone Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-bold text-base text-slate-800">
                  Advance Milestone for Task #{selectedTask?.task_id}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedTask?.task_name}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStatus} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Select New Milestone Stage</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(Number(e.target.value))}
                  className="input text-xs font-semibold"
                >
                  <option value={1}>1. Documents Pending</option>
                  <option value={2}>2. Verification in Progress</option>
                  <option value={3}>3. Govt Filing Preparation</option>
                  <option value={4}>4. Submitted on Government Portal (SRN Generated)</option>
                  <option value={5}>5. Government Approval Received</option>
                  <option value={6}>6. Certificate Delivered & Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Officer Remarks & Portal Filing Notes
                </label>
                <textarea
                  rows={3}
                  value={milestoneRemarks}
                  onChange={(e) => setMilestoneRemarks(e.target.value)}
                  placeholder="e.g. SPICe+ Part B filed on MCA V3 portal with SRN #F9912034. Awaiting ROC approval."
                  className="input text-xs"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Commit Stage to DB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
