import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Upload,
  ArrowRight,
  User,
  ShieldCheck,
  ChevronRight,
  X,
} from 'lucide-react';
import { TaskStatus, TASK_STATUS_LABELS } from '@etaxwala/types';

export default function OpsExecutiveDashboard() {
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [nextStage, setNextStage] = useState<number>(TaskStatus.VERIFICATION_IN_PROGRESS);
  const [advanceRemarks, setAdvanceRemarks] = useState('');

  const [myTasks, setMyTasks] = useState([
    {
      id: 101,
      clientName: 'Rajesh Sharma',
      business: 'Sharma Agri Exports Pvt Ltd',
      service: 'Private Limited Company Registration',
      status: TaskStatus.GOVT_FILING_IN_PROGRESS,
      deadline: '28 Aug 2026',
      portal: 'MCA V3',
      srn: 'F89230192',
    },
    {
      id: 104,
      clientName: 'Suresh Patil',
      business: 'Patil Agro Solutions',
      service: 'Section 8 NGO / Microfinance Registration',
      status: TaskStatus.VERIFICATION_IN_PROGRESS,
      deadline: '30 Aug 2026',
      portal: 'MCA CRC',
      srn: 'F89230881',
    },
    {
      id: 105,
      clientName: 'Manish Verma',
      business: 'Verma Tech Labs',
      service: 'Trademark Objection Reply & Legal Notice',
      status: TaskStatus.QC_REVIEW,
      deadline: '26 Aug 2026',
      portal: 'IP India',
      srn: 'TM-640192',
    },
    {
      id: 106,
      clientName: 'Pooja Agarwal',
      business: 'Agarwal Spices',
      service: 'FSSAI Central Food License Renewal',
      status: TaskStatus.DOCUMENTS_COLLECTED,
      deadline: '02 Sep 2026',
      portal: 'FoSCoS',
      srn: 'FSSAI-8912',
    },
  ]);

  const handleOpenAdvance = (task: any) => {
    setSelectedTask(task);
    setNextStage(task.status + 1);
    setIsAdvanceModalOpen(true);
  };

  const handleSaveAdvance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    setMyTasks((prev) =>
      prev.map((t) =>
        t.id === selectedTask.id ? { ...t, status: nextStage } : t
      )
    );
    setIsAdvanceModalOpen(false);
    setAdvanceRemarks('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-brand-navy">
              My Operational Work Queue
            </h1>
            <span className="badge badge-gold">Operations Specialist</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review client documents, execute government portal filings (MCA/GST/ITR/IP), and advance 10-stage milestones.
          </p>
        </div>

        <Link to="/crm/tasks" className="btn btn-primary btn-sm">
          <FileCheck2 className="w-3.5 h-3.5" /> Full Task Board
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Assigned to Me', value: '14 Cases', sub: '4 Due this week', icon: FileCheck2, color: '#003A66', bg: 'rgba(0,58,102,0.08)' },
          { title: 'Document Review', value: '3 Cases', sub: 'Awaiting client upload', icon: Clock, color: '#D97706', bg: 'rgba(217,119,6,0.08)' },
          { title: 'Ready for Govt Portal', value: '5 Cases', sub: 'MCA / GST / FoSCoS', icon: ShieldCheck, color: '#7C3AED', bg: 'rgba(124,58,237,0.08)' },
          { title: 'Delivered This Month', value: '18 Orders', sub: '100% on-time SLA score', icon: CheckCircle2, color: '#059669', bg: 'rgba(5,150,105,0.08)' },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.title} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{kpi.title}</span>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: kpi.bg }}>
                  <Icon className="w-4 h-4" style={{ color: kpi.color }} />
                </div>
              </div>
              <div className="mt-3">
                <p className="font-display font-bold text-2xl text-slate-800">{kpi.value}</p>
                <p className="text-xs text-slate-400 mt-1">{kpi.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Assigned Tasks Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-slate-800">
              Active Service Orders Assigned
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Advancing status automatically notifies the client on their portal timeline</p>
          </div>
          <span className="badge badge-navy">Active Cases</span>
        </div>

        <div className="overflow-x-auto">
          <table className="table-etaxwala">
            <thead>
              <tr>
                <th>Order # / Client</th>
                <th>Service Name</th>
                <th>Govt Portal / SRN</th>
                <th>Deadline</th>
                <th>Current Lifecycle Stage</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {myTasks.map((task) => (
                <tr key={task.id}>
                  <td>
                    <p className="font-bold text-slate-800 text-xs">{task.clientName}</p>
                    <p className="text-[10px] text-slate-400">{task.business} • #{task.id}</p>
                  </td>
                  <td className="text-xs font-semibold text-slate-700">{task.service}</td>
                  <td className="text-xs">
                    <span className="text-brand-navy font-mono font-bold">{task.portal}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">{task.srn}</span>
                  </td>
                  <td className="text-xs text-slate-600 font-semibold">{task.deadline}</td>
                  <td>
                    <span className="badge badge-navy text-[11px]">
                      {TASK_STATUS_LABELS[task.status] || `Stage ${task.status}`}
                    </span>
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => handleOpenAdvance(task)}
                      className="btn btn-primary btn-sm"
                    >
                      Advance Status <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Advance Status Modal */}
      {isAdvanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-bold text-base text-slate-800">
                  Advance Lifecycle Stage for Order #{selectedTask?.id}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Client: {selectedTask?.clientName} • {selectedTask?.service}
                </p>
              </div>
              <button
                onClick={() => setIsAdvanceModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdvance} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Select New 10-Stage Milestone
                </label>
                <select
                  value={nextStage}
                  onChange={(e) => setNextStage(Number(e.target.value))}
                  className="input text-xs font-semibold"
                >
                  {Object.entries(TASK_STATUS_LABELS).map(([code, label]) => (
                    <option key={code} value={code}>
                      Stage {code}: {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Milestone Remarks & Government SRN Details
                </label>
                <textarea
                  rows={3}
                  value={advanceRemarks}
                  onChange={(e) => setAdvanceRemarks(e.target.value)}
                  placeholder="e.g. SPICe+ Part B submitted with SRN F89230192. MCA challan verified. Expected approval in 48 hours."
                  className="input text-xs"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdvanceModalOpen(false)}
                  className="btn btn-outline btn-sm"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Update Milestone in Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
