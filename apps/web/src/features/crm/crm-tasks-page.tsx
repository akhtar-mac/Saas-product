import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Search,
  Plus,
  Trash2,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  Play,
  Square,
  Upload,
  MessageSquare,
  FileText,
  X,
  ChevronDown,
  UserCheck,
} from 'lucide-react';

interface TaskTimelineStep {
  id: number;
  dateTime: string;
  timeSpent: string;
  staff: string;
  status: 'Completed' | 'Pending From Client' | 'In Progress' | 'Not Started';
  comment: string;
}

interface OperationTask {
  id: number;
  taskName: string;
  customerName: string;
  companyName: string;
  service: string;
  assignTo: string;
  addedBy: string;
  assignDate: string;
  dueDate: string;
  status: 'completed' | 'not-started' | 'wip' | 'pendingfromclient';
  email: string;
  phone: string;
  state: string;
  city: string;
  timeline: TaskTimelineStep[];
}

const INITIAL_TASKS: OperationTask[] = [
  {
    id: 1,
    taskName: 'Niti Aayog/Darpan Registration',
    customerName: 'Siddheshwar Sherekar',
    companyName: 'Shubuusha Micro Service Association',
    service: 'Microfinance Company (Section 8) Registration',
    assignTo: 'Avinash Mate',
    addedBy: 'Kailas Gadekar',
    assignDate: '03-09-2026 12:30',
    dueDate: '04-09-2026',
    status: 'completed',
    email: 'sidhuw840@gmail.com',
    phone: '8237377731',
    state: 'Maharashtra',
    city: 'Satara',
    timeline: [
      { id: 1, dateTime: '2026-09-03 13:52:16', timeSpent: '00:00:00', staff: 'Avinash Mate', status: 'Completed', comment: 'ALL DONE' },
      { id: 2, dateTime: '2026-09-03 13:52:16', timeSpent: '00:00:00', staff: 'Avinash Mate', status: 'Completed', comment: 'ALL DONE' },
      { id: 3, dateTime: '2026-09-03 12:40:47', timeSpent: '00:00:00', staff: 'Avinash Mate', status: 'Pending From Client', comment: 'nomani docs pending' },
    ],
  },
  {
    id: 2,
    taskName: 'Banking Stationary and Documentation',
    customerName: 'Balasaheb Ghadge',
    companyName: 'Mauli Micro Association',
    service: 'MoA/AoA Alteration',
    assignTo: 'Swarupa Patwardhan',
    addedBy: 'Kailas Gadekar',
    assignDate: '03-09-2026 11:59',
    dueDate: '05-09-2026',
    status: 'not-started',
    email: 'growthfund8894@gmail.com',
    phone: '7249696992',
    state: 'Maharashtra',
    city: 'Ratnagiri',
    timeline: [
      { id: 1, dateTime: '2026-09-03 11:59:00', timeSpent: '00:00:00', staff: 'Kailas Gadekar', status: 'In Progress', comment: 'Task assigned to Swarupa' },
    ],
  },
  {
    id: 3,
    taskName: 'Banking Stationary and Documentation',
    customerName: 'Dashrath Madhukar Waghmare',
    companyName: 'Hopewings Micro Association',
    service: 'Microfinance Company (Section 8) Registration',
    assignTo: 'Swarupa Patwardhan',
    addedBy: 'Kailas Gadekar',
    assignDate: '02-09-2026 16:50',
    dueDate: '04-09-2026',
    status: 'not-started',
    email: 'dashrath@gmail.com',
    phone: '9822001122',
    state: 'Maharashtra',
    city: 'Pune',
    timeline: [],
  },
  {
    id: 4,
    taskName: 'Members Addition in Online Form',
    customerName: 'Santosh Eknathrao Thadke',
    companyName: 'NA',
    service: 'Multi State Credit Co-Operative Society Registration',
    assignTo: 'Ganesh Nikam',
    addedBy: 'Kailas Gadekar',
    assignDate: '02-09-2026 14:23',
    dueDate: '30-09-2026',
    status: 'not-started',
    email: 'santosh@yahoo.com',
    phone: '9850123456',
    state: 'Maharashtra',
    city: 'Latur',
    timeline: [],
  },
  {
    id: 5,
    taskName: 'Form MGT 7A FY 25-26',
    customerName: 'Sri Vidya Digital Offer Nidhi Limited',
    companyName: 'Sudhir Vyas',
    service: 'Nidhi Company Audit and Compliances',
    assignTo: 'Kailas Gadekar OS',
    addedBy: 'Netra Divekar',
    assignDate: '01-09-2026 18:12',
    dueDate: '01-11-2026',
    status: 'not-started',
    email: 'sudhirvyas06@gmail.com',
    phone: '9111503756',
    state: 'Maharashtra',
    city: 'Amravati',
    timeline: [],
  },
  {
    id: 6,
    taskName: 'Form AOC 4 FY 25-26',
    customerName: 'Sri Vidya Digital Offer Nidhi Limited',
    companyName: 'Sudhir Vyas',
    service: 'Nidhi Company Audit and Compliances',
    assignTo: 'Kailas Gadekar OS',
    addedBy: 'Netra Divekar',
    assignDate: '01-09-2026 18:12',
    dueDate: '01-11-2026',
    status: 'not-started',
    email: 'sudhirvyas06@gmail.com',
    phone: '9111503756',
    state: 'Maharashtra',
    city: 'Amravati',
    timeline: [],
  },
];

export default function CrmTasksPage() {
  const [tasks, setTasks] = useState<OperationTask[]>(INITIAL_TASKS);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [expandedId, setExpandedId] = useState<number | null>(1); // default row 1 expanded like screenshot
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(10);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  // Fetch real tasks from backend DB
  useEffect(() => {
    fetch(`${API_BASE}/v1/crm/tasks?limit=50`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data?.data) && data.data.length > 0) {
          const mapped: OperationTask[] = data.data.map((t: any, i: number) => ({
            id: t.task_id || t.id || i + 1,
            taskName: t.task_name || `Milestone Task #${t.task_id || i + 1}`,
            customerName: t.sub_customer_name || `Customer #${t.cust_id}`,
            companyName: 'ETaxwala Client',
            service: `Service #${t.service_id}`,
            assignTo: t.added_by ? `Officer #${t.added_by}` : 'Avinash Mate',
            addedBy: 'System Admin',
            assignDate: t.assign_date ? t.assign_date.split('T')[0] : '2026-09-03',
            dueDate: '2026-09-10',
            status: t.original_task_status === 10 ? 'completed' : t.original_task_status > 1 ? 'wip' : 'not-started',
            email: 'client@etaxwala.in',
            phone: '9876543210',
            state: 'Maharashtra',
            city: 'Pune',
            timeline: [
              {
                id: 1,
                dateTime: t.updated_at ? new Date(t.updated_at).toLocaleString() : '2026-09-03 13:50',
                timeSpent: '00:00:00',
                staff: `Officer #${t.added_by || 1}`,
                status: t.original_task_status === 10 ? 'Completed' : 'In Progress',
                comment: `Current Milestone Stage: ${t.original_task_status || 1}`,
              },
            ],
          }));
          setTasks(mapped);
        }
      })
      .catch(() => {});
  }, []);

  // Filters
  const [taskFilter, setTaskFilter] = useState('Tasks');
  const [categoryFilter, setCategoryFilter] = useState('Category');
  const [staffFilter, setStaffFilter] = useState('Staff');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const location = useLocation();

  // Modals
  const [effortModalTask, setEffortModalTask] = useState<OperationTask | null>(
    new URLSearchParams(location.search).get('effort') === '1' ? INITIAL_TASKS[0] : null
  );
  const [assignModalOpen, setAssignModalOpen] = useState(
    new URLSearchParams(location.search).get('assign') === '1'
  );
  const [assignTargetTask, setAssignTargetTask] = useState<OperationTask | null>(
    new URLSearchParams(location.search).get('assign') === '1' ? INITIAL_TASKS[0] : null
  );
  const [assignUser, setAssignUser] = useState('Avinash Mate');
  const [assignDueDate, setAssignDueDate] = useState('2026-09-06');

  // Effort Modal Timer state
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [startTimeCapture, setStartTimeCapture] = useState('--:--');
  const [endTimeCapture, setEndTimeCapture] = useState('--:--');
  const [effortStatus, setEffortStatus] = useState('Completed');
  const [effortNotes, setEffortNotes] = useState('');
  const [uploadedDocs, setUploadedDocs] = useState<{ name: string; date: string }[]>([]);
  const [docNameInput, setDocNameInput] = useState('');

  // Live timer tick
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const startEffortTimer = () => {
    const now = new Date();
    setStartTimeCapture(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
    setIsTimerRunning(true);
  };

  const stopEffortTimer = () => {
    const now = new Date();
    setEndTimeCapture(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
    setIsTimerRunning(false);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === tasks.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(tasks.map((t) => t.id)));
  };

  const toggleSelect = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleResetFilters = () => {
    setTaskFilter('Tasks');
    setCategoryFilter('Category');
    setStaffFilter('Staff');
    setFromDate('');
    setToDate('');
    setSearchTerm('');
  };

  const handleAssignSave = () => {
    if (assignTargetTask) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === assignTargetTask.id
            ? { ...t, assignTo: assignUser, dueDate: assignDueDate, assignDate: new Date().toLocaleDateString() }
            : t
        )
      );
    } else if (selectedIds.size > 0) {
      setTasks((prev) =>
        prev.map((t) =>
          selectedIds.has(t.id)
            ? { ...t, assignTo: assignUser, dueDate: assignDueDate, assignDate: new Date().toLocaleDateString() }
            : t
        )
      );
      setSelectedIds(new Set());
    }
    setAssignModalOpen(false);
    setAssignTargetTask(null);
    alert('Task assigned successfully!');
  };

  const handleSaveEffort = async () => {
    if (!effortModalTask) return;
    const newStage = effortStatus.toLowerCase().includes('completed') ? 10 : 2;
    try {
      await fetch(`${API_BASE}/v1/crm/tasks/${effortModalTask.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          new_status: newStage,
          remarks: effortNotes || `Milestone updated to ${effortStatus}`,
          updated_by: effortModalTask.assignTo || 'Operations Specialist',
        }),
      });

      const newStep: TaskTimelineStep = {
        id: Date.now(),
        dateTime: new Date().toLocaleString(),
        timeSpent: formatTimer(timerSeconds),
        staff: effortModalTask.assignTo || 'Avinash Mate',
        status: effortStatus as any,
        comment: effortNotes || 'Effort logged',
      };

      setTasks((prev) =>
        prev.map((t) =>
          t.id === effortModalTask.id
            ? {
                ...t,
                status: effortStatus.toLowerCase().includes('completed') ? 'completed' : 'wip',
                timeline: [newStep, ...t.timeline],
              }
            : t
        )
      );
      setEffortModalTask(null);
      setTimerSeconds(0);
      setIsTimerRunning(false);
      setEffortNotes('');
      alert('Effort logged and milestone saved to database successfully!');
    } catch {
      alert('Failed to save effort/milestone to database.');
    }
  };

  const filteredTasks = tasks.filter(
    (t) =>
      t.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.assignTo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* ─── Top KPI Metric Cards with Single-Color Moving Outline ─── */}
      <div className="flex flex-wrap items-center gap-2.5">
        {[
          { label: 'OVER DUES', count: 0, cBase: '#EF4444', cLight: '#FCA5A5', cDark: '#B91C1C' },
          { label: 'ON HOLD', count: 29, cBase: '#DC2626', cLight: '#F87171', cDark: '#991B1B' },
          { label: "TODAY'S TASKS", count: 6, cBase: '#1F2937', cLight: '#64748B', cDark: '#0F172A' },
          { label: "TOMORROW'S", count: 22, cBase: '#16A34A', cLight: '#86EFAC', cDark: '#15803D' },
          { label: 'NEXT 7 DAYS', count: 786, cBase: '#F97316', cLight: '#FDBA74', cDark: '#C2410C' },
          { label: 'NEXT 15 DAYS', count: 15, cBase: '#6366F1', cLight: '#A5B4FC', cDark: '#4338CA' },
        ].map((kpi) => (
          <button
            key={kpi.label}
            onClick={() => setSearchTerm(kpi.label === 'OVER DUES' ? '' : kpi.label)}
            className="btn-multicolor group flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer"
          >
            <span className="tracking-tight text-[11px] uppercase font-bold">
              {kpi.label}
            </span>
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-extrabold text-white shadow-2xs"
              style={{ backgroundColor: kpi.cBase }}
            >
              {kpi.count}
            </span>
          </button>
        ))}
      </div>

      {/* ─── Search & Filter Bar (Website Clean UI Style) ─── */}
      <div className="bg-white p-4 rounded-3xl border border-[#EAE6DD] shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5 items-center">
          <select
            value={taskFilter}
            onChange={(e) => setTaskFilter(e.target.value)}
            className="text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
          >
            <option value="Tasks">Tasks</option>
            <option value="PAN Registration">PAN Registration</option>
            <option value="TAN Registration">TAN Registration</option>
            <option value="Income Tax Return">Income Tax Return</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
          >
            <option value="Category">Category</option>
            <option value="Taxation">Taxation</option>
            <option value="Registration">Registration</option>
            <option value="Compliances">Compliances</option>
          </select>

          <select
            value={staffFilter}
            onChange={(e) => setStaffFilter(e.target.value)}
            className="text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
          >
            <option value="Staff">Staff</option>
            <option value="Avinash Mate">Avinash Mate</option>
            <option value="Swarupa Patwardhan">Swarupa Patwardhan</option>
            <option value="Ganesh Nikam">Ganesh Nikam</option>
            <option value="Kailas Gadekar">Kailas Gadekar</option>
          </select>

          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            placeholder="From Date"
            className="text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
          />

          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            placeholder="To Date"
            className="text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
          />

          <button
            onClick={() => alert('Filtered tasks.')}
            className="btn-multicolor px-4 py-2 rounded-full text-xs font-bold shadow-2xs cursor-pointer"
          >
            <span>Filter</span>
          </button>

          <button
            onClick={() => {
              if (selectedIds.size === 0) {
                alert('Please select tasks to bulk assign.');
                return;
              }
              setAssignTargetTask(null);
              setAssignModalOpen(true);
            }}
            className="btn-multicolor px-4 py-2 rounded-full text-xs font-bold shadow-2xs cursor-pointer"
          >
            <span>Bulk Assign</span>
          </button>
        </div>

        <div className="flex items-center gap-2.5 pt-1">
          <button
            onClick={() => {
              const nd = prompt('Enter new due date (YYYY-MM-DD):');
              if (nd && selectedIds.size > 0) {
                setTasks((prev) =>
                  prev.map((t) => (selectedIds.has(t.id) ? { ...t, dueDate: nd } : t))
                );
                alert(`Due date updated for ${selectedIds.size} tasks.`);
              }
            }}
            className="btn-multicolor px-5 py-2 rounded-full text-xs font-bold shadow-2xs cursor-pointer"
          >
            <span>Change Due Date</span>
          </button>

          <button
            onClick={handleResetFilters}
            className="flex-1 btn-multicolor px-5 py-2 rounded-full text-xs font-bold shadow-2xs text-center cursor-pointer"
          >
            <span>Reset All</span>
          </button>
        </div>
      </div>

      {/* ─── Task Table Card with Expandable Horizontal Timeline ─── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Action Bar */}
        <div className="p-3 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-white border border-slate-300 rounded px-2 py-1 text-xs font-semibold focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              {['Copy', 'Excel', 'CSV', 'PDF', 'Print'].map((btn) => (
                <button
                  key={btn}
                  onClick={() => alert(`${btn} export executed`)}
                  className="px-2.5 py-1 text-[11px] font-semibold btn-multicolor rounded shadow-2xs"
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search Data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded px-3 py-1 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#003A66] w-48"
            />
          </div>
        </div>

        {/* Table Data */}
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-250px)] border border-slate-200 rounded-xl shadow-2xs">
          <table className="table-crm w-full text-left text-xs border-separate border-spacing-0">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#1E3A8A] text-white uppercase text-[11px] tracking-wider sticky top-0 z-10">
                <th className="py-2.5 px-3 w-8 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === tasks.length && tasks.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded text-[#003A66] focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="py-2.5 px-3 font-bold">Task Name</th>
                <th className="py-2.5 px-3 font-bold">Customer Name</th>
                <th className="py-2.5 px-3 font-bold">Company Name</th>
                <th className="py-2.5 px-3 font-bold">Service</th>
                <th className="py-2.5 px-3 font-bold">Assign To</th>
                <th className="py-2.5 px-3 font-bold">Added By</th>
                <th className="py-2.5 px-3 font-bold">Assign Date</th>
                <th className="py-2.5 px-3 font-bold">Due Date</th>
                <th className="py-2.5 px-3 font-bold">Status</th>
                <th className="py-2.5 px-3 font-bold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.map((task, idx) => (
                <React.Fragment key={task.id}>
                  <tr
                    className={
                      expandedId === task.id
                        ? 'bg-sky-50/60'
                        : idx % 2 === 0
                        ? 'bg-white hover:bg-sky-50/30'
                        : 'bg-[#F9FAFB] hover:bg-sky-50/30'
                    }
                  >
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(task.id)}
                        onChange={() => toggleSelect(task.id)}
                        className="rounded text-[#003A66] focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setExpandedId(expandedId === task.id ? null : task.id)}
                          className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 flex items-center justify-center font-bold text-[11px]"
                          title="Expand timeline"
                        >
                          {expandedId === task.id ? '-' : '+'}
                        </button>
                        <button
                          onClick={() => setEffortModalTask(task)}
                          className="font-semibold text-slate-900 hover:text-[#0284c7] text-left hover:underline"
                        >
                          {task.taskName}
                        </button>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-800">{task.customerName}</td>
                    <td className="py-2.5 px-3 text-slate-600">{task.companyName}</td>
                    <td className="py-2.5 px-3 text-slate-700 font-medium">{task.service}</td>
                    <td className="py-2.5 px-3 text-slate-800 font-medium">{task.assignTo}</td>
                    <td className="py-2.5 px-3 text-slate-600">{task.addedBy}</td>
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{task.assignDate}</td>
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{task.dueDate}</td>
                    <td className="py-2.5 px-3">
                      {task.status === 'completed' ? (
                        <span className="bg-[#16A34A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          completed
                        </span>
                      ) : (
                        <span className="bg-[#DC2626] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          not-started
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setAssignTargetTask(task);
                            setAssignModalOpen(true);
                          }}
                          className="w-6 h-6 rounded-full bg-[#003A66] hover:bg-[#002B4D] text-white flex items-center justify-center"
                          title="Assign"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete task ${task.taskName}?`)) {
                              setTasks((prev) => prev.filter((t) => t.id !== task.id));
                            }
                          }}
                          className="w-6 h-6 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* ─── Expandable Visual Stepper Timeline ─── */}
                  {expandedId === task.id && (
                    <tr className="bg-[#FAF9F5]">
                      <td colSpan={11} className="p-5">
                        <div className="bg-white rounded-2xl p-5 border border-[#EAE6DD] shadow-xs">
                          <h4 className="text-xs font-bold text-[#1B365D] uppercase mb-4 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-emerald-600" />
                            <span>Task Progress Timeline & Action Audit</span>
                          </h4>

                          {task.timeline.length === 0 ? (
                            <p className="text-xs text-slate-500 italic py-2">No timeline steps logged yet.</p>
                          ) : (
                            <div className="relative flex items-start gap-12 overflow-x-auto py-4 px-2">
                              {/* Continuous timeline connector bar centered on node */}
                              <div className="absolute top-[68px] left-12 right-12 h-0.5 bg-blue-200 -z-0" />

                              {task.timeline.map((step) => (
                                <div key={step.id} className="relative z-10 flex flex-col items-center text-center min-w-[160px]">
                                  <p className="text-[11px] font-mono text-slate-600 font-semibold">{step.dateTime}</p>
                                  <p className="text-[10px] text-slate-400">Time Spent: {step.timeSpent}</p>
                                  <p className="text-[11px] font-bold text-slate-800 mt-0.5">{step.staff}</p>

                                  {/* Step Node */}
                                  <div className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-xs my-2 flex items-center justify-center text-[9px] text-white font-bold" />

                                  {/* Status Pill */}
                                  <span
                                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs ${
                                      step.status === 'Completed'
                                        ? 'bg-[#16A34A] text-white'
                                        : 'bg-[#EF4444] text-white'
                                    }`}
                                  >
                                    {step.status}
                                  </span>

                                  {/* Comment */}
                                  <p className="text-xs font-bold text-slate-700 mt-2 max-w-[180px]">
                                    {step.comment}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing 1 to {filteredTasks.length} of 1,280 entries</span>
          <div className="flex items-center gap-1">
            <button className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700">
              Previous
            </button>
            <button className="px-2.5 py-1 rounded bg-[#1E3A8A] text-white font-bold">1</button>
            <button className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700">2</button>
            <button className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700">3</button>
            <button className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ─── CLIENT INFO & EFFORT TRACKING MODAL (Website Clean UI Style) ─── */}
      {effortModalTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="rounded-3xl border border-[#EAE6DD] bg-white shadow-2xl overflow-hidden max-w-2xl w-full animate-scale-in">
            {/* Signature Top Multicolor Strip */}
            <div className="h-1 bg-multicolor" />

            {/* Modal Header */}
            <div className="p-4 px-6 border-b border-[#EAE6DD] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#1B365D] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#1B365D]">Client Info & Effort Tracking</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Task #{effortModalTask.id} • {effortModalTask.taskName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert(`Opening live WhatsApp chat with ${effortModalTask.phone}`)}
                  className="btn-multicolor px-3.5 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  style={
                    {
                      '--c-base': '#F59E0B',
                      '--c-light': '#FCD34D',
                      '--c-dark': '#D97706',
                    } as React.CSSProperties
                  }
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat</span>
                </button>
                <button
                  onClick={() => {
                    const n = prompt('Add operational note:');
                    if (n) alert('Note saved!');
                  }}
                  className="btn-multicolor px-3.5 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Note</span>
                </button>
                <button
                  onClick={() => setEffortModalTask(null)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 text-xs max-h-[82vh] overflow-y-auto">
              {/* Upper Section: Client Details & Add Effort */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Left: Client Details */}
                <div className="bg-[#FAF9F5] border border-[#EAE6DD] rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-[#1B365D] uppercase tracking-wide flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#1B365D]" />
                    <span>Client Details</span>
                  </h4>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Customer Name</label>
                    <input
                      type="text"
                      readOnly
                      defaultValue={effortModalTask.customerName}
                      className="w-full bg-white border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email Address</label>
                    <input
                      type="email"
                      readOnly
                      defaultValue={effortModalTask.email}
                      className="w-full bg-white border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Mobile Contact</label>
                    <input
                      type="text"
                      readOnly
                      defaultValue={effortModalTask.phone}
                      className="w-full bg-white border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Service Assigned</label>
                    <input
                      type="text"
                      readOnly
                      defaultValue={effortModalTask.service}
                      className="w-full bg-white border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-medium"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">State</label>
                      <input
                        type="text"
                        readOnly
                        defaultValue={effortModalTask.state}
                        className="w-full bg-white border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">City</label>
                      <input
                        type="text"
                        readOnly
                        defaultValue={effortModalTask.city}
                        className="w-full bg-white border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                {/* Right: Add Effort & Live Stopwatch */}
                <div className="bg-[#FAF9F5] border border-[#EAE6DD] rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-[#1B365D] uppercase tracking-wide flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Add Effort & Timer</span>
                  </h4>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Task Status</label>
                    <select
                      value={effortStatus}
                      onChange={(e) => setEffortStatus(e.target.value)}
                      className="w-full text-xs bg-white border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                    >
                      <option value="Completed">Completed</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Pending From Client">Pending From Client</option>
                      <option value="Not Started">Not Started</option>
                    </select>
                  </div>

                  {/* Start Time & End Time buttons */}
                  <div className="grid grid-cols-2 gap-2.5 text-center">
                    <div>
                      <button
                        onClick={startEffortTimer}
                        disabled={isTimerRunning}
                        className="btn-multicolor w-full px-3 py-2.5 rounded-full font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-60 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Start Time</span>
                      </button>
                      <p className="text-[10px] text-slate-500 mt-1 font-mono">Captured: {startTimeCapture}</p>
                    </div>

                    <div>
                      <button
                        onClick={stopEffortTimer}
                        disabled={!isTimerRunning}
                        className="btn-multicolor w-full px-3 py-2.5 rounded-full font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-60 cursor-pointer"
                      >
                        <Square className="w-3.5 h-3.5 fill-current" />
                        <span>End Time</span>
                      </button>
                      <p className="text-[10px] text-slate-500 mt-1 font-mono">Captured: {endTimeCapture}</p>
                    </div>
                  </div>

                  {/* Live Clock Display */}
                  <div className="bg-[#1B365D] text-white font-mono text-xl font-black py-2.5 px-4 rounded-2xl flex items-center justify-center gap-2.5 shadow-md border border-white/10 tracking-widest">
                    <Clock className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span>{formatTimer(timerSeconds)}</span>
                  </div>

                  {/* Add Efforts Textarea */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Operational Notes</label>
                    <textarea
                      rows={2}
                      value={effortNotes}
                      onChange={(e) => setEffortNotes(e.target.value)}
                      placeholder="Add efforts or status update..."
                      className="w-full text-xs bg-white border border-[#EAE6DD] rounded-xl p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                    />
                  </div>

                  <button
                    onClick={handleSaveEffort}
                    className="btn-multicolor w-full py-2.5 rounded-full text-xs font-extrabold shadow-xs cursor-pointer"
                  >
                    <span>Update</span>
                  </button>
                </div>
              </div>

              {/* Lower Section: Document Management */}
              <div className="pt-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#FAF9F5] border border-[#EAE6DD] rounded-2xl p-4">
                    <h5 className="font-bold text-[#1B365D] mb-2 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>Send Documents</span>
                    </h5>
                    <div className="p-3 bg-white border border-[#EAE6DD] rounded-xl text-[11px] text-slate-500">
                      No sent documents yet.
                    </div>
                  </div>

                  <div className="bg-[#FAF9F5] border border-[#EAE6DD] rounded-2xl p-4">
                    <h5 className="font-bold text-[#1B365D] mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Received Documents</span>
                    </h5>
                    <div className="p-3 bg-white border border-[#EAE6DD] rounded-xl text-[11px] text-slate-700 font-medium">
                      PAN Card, Aadhaar, Bank Statement
                    </div>
                  </div>

                  <div className="bg-[#FAF9F5] border border-[#EAE6DD] rounded-2xl p-4">
                    <h5 className="font-bold text-[#1B365D] mb-2 flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-purple-600" />
                      <span>Upload Documents</span>
                    </h5>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Document Name..."
                        value={docNameInput}
                        onChange={(e) => setDocNameInput(e.target.value)}
                        className="w-full bg-white border border-[#EAE6DD] rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                      />
                      <input type="file" className="text-[11px] text-slate-500" />
                      <button
                        onClick={() => {
                          if (docNameInput) {
                            setUploadedDocs([...uploadedDocs, { name: docNameInput, date: new Date().toLocaleDateString() }]);
                            setDocNameInput('');
                            alert('Document uploaded successfully.');
                          }
                        }}
                        className="btn-multicolor w-full py-2 rounded-full text-xs font-bold cursor-pointer"
                      >
                        <span>Upload</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── ASSIGN TASK TO MODAL (Website Clean UI Style) ─── */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="rounded-3xl border border-[#EAE6DD] bg-white shadow-2xl overflow-hidden max-w-sm w-full animate-scale-in">
            {/* Signature Top Multicolor Strip */}
            <div className="h-1 bg-multicolor" />

            <div className="p-4 px-6 border-b border-[#EAE6DD] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#1B365D] text-white flex items-center justify-center">
                  <UserCheck className="w-3.5 h-3.5 text-white" />
                </div>
                <h3 className="font-extrabold text-sm text-[#1B365D]">Assign Task To</h3>
              </div>
              <button
                onClick={() => setAssignModalOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Select User</label>
                <select
                  value={assignUser}
                  onChange={(e) => setAssignUser(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                >
                  <option value="Avinash Mate">Avinash Mate</option>
                  <option value="Swarupa Patwardhan">Swarupa Patwardhan</option>
                  <option value="Ganesh Nikam">Ganesh Nikam</option>
                  <option value="Kailas Gadekar">Kailas Gadekar</option>
                  <option value="Netra Divekar">Netra Divekar</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Due Date</label>
                <input
                  type="date"
                  value={assignDueDate}
                  onChange={(e) => setAssignDueDate(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleAssignSave}
                  className="btn-multicolor w-full py-2.5 rounded-full text-xs font-bold shadow-xs cursor-pointer"
                >
                  <span>Assign</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
