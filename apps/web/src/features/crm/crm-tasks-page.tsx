import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Clock,
  User,
  CheckCircle2,
  Play,
  Square,
  Upload,
  MessageSquare,
  FileText,
  X,
  UserCheck,
  Loader2,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { API_BASE_URL } from '@/lib/api-base';

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
  assignedToId?: number | null;
  isAssign: number;
  addedBy: string;
  assignBy?: string;
  assignDate: string;
  dueDate: string;
  status:
    | 'completed'
    | 'not-started'
    | 'wip'
    | 'pendingfromclient'
    | 'invoiced'
    | 'returnback'
    | 'cancel'
    | 'feespending'
    | 'onhold';
  email: string;
  phone: string;
  state: string;
  city: string;
  customerId: number;
  serviceId: number;
  timeline: TaskTimelineStep[];
}

export default function CrmTasksPage() {
  const { staffUser, staffToken } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Check if user has a real token (not demo token)
  useEffect(() => {
    if (!staffToken || staffToken === 'demo-staff-token') {
      // Redirect to login if no real token
      navigate('/crm/login');
    }
  }, [staffToken, navigate]);
  const [tasks, setTasks] = useState<OperationTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [opsStaff, setOpsStaff] = useState<
    { id: number; name: string; email: string; role_id: number }[]
  >([]);

  const API_BASE = API_BASE_URL;

  // Check if user is Operations Employee - primary check via role string, fallback via roleId
  const isOpsEmployee =
    staffUser?.role === 'OPERATIONS_EMPLOYEE' ||
    staffUser?.roles?.includes('OPERATIONS_EMPLOYEE' as any) ||
    (staffUser?.roleIds?.includes(7) && !staffUser?.roles?.includes('SALES_EMPLOYEE' as any));

  const [taskFilter, setTaskFilter] = useState('Tasks');
  const [categoryFilter, setCategoryFilter] = useState('Category');
  const [staffFilter, setStaffFilter] = useState('Staff');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [taskStats, setTaskStats] = useState({
    overdues: 0,
    onhold: 0,
    todays: 0,
    tomorrows: 0,
    next7days: 0,
    next15days: 0,
    notstarted: 0,
    wip: 0,
    pendingfc: 0,
    completed: 0,
    total: 0,
  });
  const [categories, setCategories] = useState<{ category_id: number; category_name: string }[]>(
    []
  );

  // Modals
  const [effortModalTask, setEffortModalTask] = useState<OperationTask | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(
    new URLSearchParams(location.search).get('assign') === '1'
  );
  const [assignTargetTask, setAssignTargetTask] = useState<OperationTask | null>(null);
  const [assignUser, setAssignUser] = useState('');
  const [assignDueDate, setAssignDueDate] = useState('');

  // Effort Modal Timer state
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [startTimeCapture, setStartTimeCapture] = useState('--:--:--');
  const [endTimeCapture, setEndTimeCapture] = useState('--:--:--');
  const [effortStatus, setEffortStatus] = useState('1');
  const [effortNotes, setEffortNotes] = useState('');
  const [docNameInput, setDocNameInput] = useState('');
  const [sentDocuments, setSentDocuments] = useState<{ name: string; url: string }[]>([]);
  const [receivedDocuments, setReceivedDocuments] = useState<{ name: string; url: string }[]>([]);
  const [effortSaveMsg, setEffortSaveMsg] = useState('');
  const [effortSaving, setEffortSaving] = useState(false);
  const [docUploading, setDocUploading] = useState(false);
  // Effort modal Work Timeline
  const [effortTimeline, setEffortTimeline] = useState<any[]>([]);
  const [effortTlLoading, setEffortTlLoading] = useState(false);
  const [effortModalTab, setEffortModalTab] = useState<'effort' | 'timeline'>('effort');
  // Table expand timeline
  const [tableTimeline, setTableTimeline] = useState<Record<number, any[]>>({});
  const [tableTlLoading, setTableTlLoading] = useState<Record<number, boolean>>({});
  // Status maps
  const STATUS_LABELS_MAP: Record<number, string> = {
    1: 'Not Started',
    2: 'Work In Progress',
    3: 'Pending From Client',
    4: 'Invoiced',
    5: 'Completed',
    6: 'Return Back',
    7: 'Cancelled',
    8: 'Fees Pending',
    9: 'On Hold',
  };
  const STATUS_SHORT_MAP: Record<string, string> = {
    completed: 'Completed',
    wip: 'WIP',
    pendingfromclient: 'Pending Client',
    invoiced: 'Invoiced',
    returnback: 'Return',
    cancel: 'Cancelled',
    feespending: 'Fees Pend.',
    onhold: 'On Hold',
    notstarted: 'Not Started',
  };
  const STATUS_COLORS_MAP: Record<number, string> = {
    1: '#dc2626',
    2: '#2563eb',
    3: '#d97706',
    4: '#7c3aed',
    5: '#16a34a',
    6: '#0891b2',
    7: '#6b7280',
    8: '#ea580c',
    9: '#b45309',
  };

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
    const timeStr = now.toTimeString().split(' ')[0];
    setStartTimeCapture(timeStr);
    setIsTimerRunning(true);
    setTimerSeconds(0);

    // Save to localStorage for persistence
    if (effortModalTask) {
      localStorage.setItem(
        `timer_${effortModalTask.id}`,
        JSON.stringify({
          startTime: timeStr,
          startedAt: now.getTime(),
        })
      );
    }
  };

  const stopEffortTimer = () => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    setEndTimeCapture(timeStr);
    setIsTimerRunning(false);

    // Clear localStorage
    if (effortModalTask) {
      localStorage.removeItem(`timer_${effortModalTask.id}`);
    }
  };

  const resetEffortTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
    setStartTimeCapture('--:--:--');
    setEndTimeCapture('--:--:--');
  };

  const fmtTimeSec = (sec: number) => {
    const h = Math.floor(sec / 3600),
      m = Math.floor((sec % 3600) / 60),
      s = sec % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
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

  // Fetch real tasks from backend DB
  const loadTasksFromApi = (dateFilterOverride?: string) => {
    const activeDateFilter = dateFilterOverride !== undefined ? dateFilterOverride : dateFilter;
    setLoading(true);
    const params = new URLSearchParams();
    if (activeDateFilter) {
      params.append('date_filter', activeDateFilter);
    } else if (taskFilter && taskFilter !== 'Tasks') {
      params.append('status', taskFilter);
    }
    // Category filter
    if (categoryFilter && categoryFilter !== 'Category') {
      params.append('category_id', String(Number(categoryFilter)));
    }
    // Filter by current logged-in user's ID ONLY for operations employee (not manager)
    if (isOpsEmployee && staffUser?.id) {
      params.append('employee_id', String(staffUser.id));
    }
    // Only apply staff filter if not operations employee
    if (!isOpsEmployee && staffFilter && staffFilter !== 'Staff') {
      const selectedStaff = opsStaff.find((s) => s.name === staffFilter);
      if (selectedStaff) {
        params.append('employee_id', String(selectedStaff.id));
      }
    }
    const url = `${API_BASE}/v1/crm/tasks?${params.toString()}`;
    console.log('API URL:', url);
    console.log('API_BASE:', API_BASE);

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        console.log('API response:', data);
        if (data?.success && Array.isArray(data?.data)) {
          console.log('Tasks count:', data.data.length);
          const mapped: OperationTask[] = data.data.map((t: any, i: number) => ({
            id: t.task_id || t.id || i + 1,
            taskName: t.task_name || `Milestone Task #${t.task_id || i + 1}`,
            customerName: t.customer_name || t.sub_customer_name || `Customer #${t.cust_id}`,
            companyName: t.company_name || 'ETaxwala Client Enterprise',
            service: t.service_name || `Corporate Compliance #${t.service_id}`,
            assignTo:
              t.assigned_to_name ||
              (Number(t.is_assign) === 1
                ? t.assign_to
                  ? `Staff #${t.assign_to}`
                  : 'Assigned'
                : 'Un-Assign'),
            assignedToId: t.assign_to || null,
            isAssign: Number(t.is_assign) || 0,
            addedBy: t.added_by_name || 'Super Admin',
            assignBy: t.assign_by_name || 'N/A',
            assignDate: t.assign_date ? t.assign_date.split(' ')[0] : 'N/A',
            dueDate: t.due_date ? t.due_date.split(' ')[0] : 'N/A',
            status:
              t.actual_task_status === 5 || t.original_task_status === 5
                ? 'completed'
                : t.actual_task_status === 2 || t.original_task_status === 2
                  ? 'wip'
                  : t.actual_task_status === 3 || t.original_task_status === 3
                    ? 'pendingfromclient'
                    : t.actual_task_status === 4 || t.original_task_status === 4
                      ? 'invoiced'
                      : t.actual_task_status === 6 || t.original_task_status === 6
                        ? 'returnback'
                        : t.actual_task_status === 7 || t.original_task_status === 7
                          ? 'cancel'
                          : t.actual_task_status === 8 || t.original_task_status === 8
                            ? 'feespending'
                            : t.actual_task_status === 9 || t.original_task_status === 9
                              ? 'onhold'
                              : 'not-started',
            email:
              t.customer_email && t.customer_email !== 'N/A'
                ? t.customer_email
                : 'client@etaxwala.in',
            phone:
              t.customer_contact && t.customer_contact !== 'N/A'
                ? t.customer_contact
                : '9876543210',
            state: 'Maharashtra',
            city: 'Pune',
            customerId: t.cust_id || 0,
            serviceId: t.service_id || 0,
            timeline: [
              {
                id: 1,
                dateTime: t.updated_at
                  ? new Date(t.updated_at).toLocaleString()
                  : '2026-09-03 13:50',
                timeSpent: '00:00:00',
                staff: t.assigned_to_name || `Officer #${t.added_by || 1}`,
                status: t.actual_task_status === 5 ? 'Completed' : 'In Progress',
                comment: `Current Milestone Stage: ${t.actual_task_status || t.original_task_status || 1}`,
              },
            ],
          }));
          setTasks(mapped);
          // Do NOT auto-expand any task on load
        }
      })
      .catch((err) => console.error('Failed to fetch tasks', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTasksFromApi();
  }, [API_BASE, taskFilter, isOpsEmployee, categoryFilter]);

  // Fetch task stats for the count cards
  const loadTaskStats = () => {
    let url = `${API_BASE}/v1/crm/tasks/stats`;
    if (isOpsEmployee && staffUser?.id) {
      url += `?employee_id=${staffUser.id}`;
    }
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data?.success) setTaskStats(data.data);
      })
      .catch(() => {});
  };

  // Fetch categories
  const loadCategories = () => {
    fetch(`${API_BASE}/v1/crm/ops-employee/categories`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.success) setCategories(data.data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadTaskStats();
  }, [API_BASE, isOpsEmployee, staffUser?.id]);

  useEffect(() => {
    loadCategories();
  }, [API_BASE]);

  // Fetch Operations Staff (Managers, Employees, Assistants) from DB
  useEffect(() => {
    fetch(`${API_BASE}/v1/crm/operation-staff`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data?.data)) {
          setOpsStaff(data.data);
          if (data.data.length > 0) {
            setAssignUser(data.data[0].name);
          }
        }
      })
      .catch(() => {});
  }, [API_BASE]);

  const handleAssignSave = async () => {
    const selectedStaff = opsStaff.find((s) => s.name === assignUser) || opsStaff[0];
    if (!selectedStaff) {
      alert('Please select an employee');
      return;
    }

    try {
      if (assignTargetTask) {
        const res = await fetch(`${API_BASE}/v1/crm/tasks/assign`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            task_id: assignTargetTask.id,
            employee_id: selectedStaff.id,
            due_date: assignDueDate || null,
          }),
        });
        const result = await res.json();
        if (result.success) {
          alert('Task assigned successfully!');
          loadTasksFromApi();
        } else {
          alert(result.message || 'Failed to assign task');
        }
      } else if (selectedIds.size > 0) {
        const res = await fetch(`${API_BASE}/v1/crm/tasks/bulk-assign`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            task_ids: Array.from(selectedIds),
            employee_id: selectedStaff.id,
            due_date: assignDueDate || null,
          }),
        });
        const result = await res.json();
        if (result.success) {
          alert(`Successfully assigned ${selectedIds.size} tasks to ${selectedStaff.name}!`);
          setSelectedIds(new Set());
          loadTasksFromApi();
        } else {
          alert(result.message || 'Failed to bulk assign tasks');
        }
      }
    } catch (err) {
      console.error('Task assignment failed', err);
      alert('Network error while assigning task.');
    } finally {
      setAssignModalOpen(false);
      setAssignTargetTask(null);
    }
  };

  const handleSaveEffort = async () => {
    if (!effortModalTask || !staffUser?.id) return;
    const statusCode = Number(effortStatus) || 1;
    setEffortSaving(true);
    setEffortSaveMsg('');

    // Calculate end time if timer is running but end time not set
    let calculatedEndTime = endTimeCapture !== '--:--:--' ? endTimeCapture : '';
    if (isTimerRunning && startTimeCapture !== '--:--:--' && calculatedEndTime === '') {
      const now = new Date();
      calculatedEndTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    }

    const payload = {
      cust_id: effortModalTask.customerId,
      task_id: effortModalTask.id,
      status: statusCode,
      work: effortNotes,
      work_service_id: effortModalTask.serviceId,
      start_time: startTimeCapture !== '--:--:--' ? startTimeCapture : '',
      end_time: calculatedEndTime,
      user_id: staffUser.id,
    };
    try {
      const res = await fetch(`${API_BASE}/v1/crm/ops-employee/add-work-effort`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${staffToken}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setEffortSaveMsg('Status updated successfully!');
        setEffortNotes('');
        resetEffortTimer();
        // Reload from API to get latest status
        loadTasksFromApi();
        loadTaskStats();
        // Reload timeline
        loadEffortTimeline(effortModalTask.id);
      } else {
        setEffortSaveMsg('Error: ' + (data.message || data.error || 'Failed'));
      }
    } catch {
      setEffortSaveMsg('Network error â€” check connection.');
    } finally {
      setEffortSaving(false);
    }
  };

  // Fetch documents for a task using the correct endpoint
  const fetchDocuments = async (customerId: number, serviceId: number) => {
    try {
      const dp = new URLSearchParams({
        customer_id: String(customerId),
        service_id: String(serviceId),
      });
      const res = await fetch(`${API_BASE}/v1/crm/ops-employee/documents?${dp}`, {
        headers: { Authorization: `Bearer ${staffToken}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const docs = data.data;
        setSentDocuments(
          docs
            .filter((d: any) => d.cd_from !== customerId)
            .map((d: any) => ({ name: d.cd_name, url: d.cd_doc }))
        );
        setReceivedDocuments(
          docs
            .filter((d: any) => d.cd_from === customerId)
            .map((d: any) => ({ name: d.cd_name, url: d.cd_doc }))
        );
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  };

  // Fetch work timeline for effort modal
  const loadEffortTimeline = async (taskId: number) => {
    setEffortTlLoading(true);
    setEffortTimeline([]);
    try {
      const r = await fetch(`${API_BASE}/v1/crm/ops-employee/work-timeline?task_id=${taskId}`, {
        headers: { Authorization: `Bearer ${staffToken}` },
      });
      const j = await r.json();
      if (j.success) setEffortTimeline(j.data || []);
    } catch {
      /* ignore */
    } finally {
      setEffortTlLoading(false);
    }
  };

  // Fetch work timeline for table expand
  const loadTableTimeline = async (taskId: number) => {
    setTableTlLoading((prev) => ({ ...prev, [taskId]: true }));
    try {
      const r = await fetch(`${API_BASE}/v1/crm/ops-employee/work-timeline?task_id=${taskId}`, {
        headers: { Authorization: `Bearer ${staffToken}` },
      });
      const j = await r.json();
      if (j.success) setTableTimeline((prev) => ({ ...prev, [taskId]: j.data || [] }));
    } catch {
      /* ignore */
    } finally {
      setTableTlLoading((prev) => ({ ...prev, [taskId]: false }));
    }
  };

  // Load documents + timeline when effort modal opens
  useEffect(() => {
    if (effortModalTask) {
      fetchDocuments(effortModalTask.customerId, effortModalTask.serviceId);
      loadEffortTimeline(effortModalTask.id);

      // Set current task status in dropdown
      let currentStatus = '1';
      if (effortModalTask.status === 'completed') currentStatus = '5';
      else if (effortModalTask.status === 'wip') currentStatus = '2';
      else if (effortModalTask.status === 'pendingfromclient') currentStatus = '3';
      else if (effortModalTask.status === 'invoiced') currentStatus = '4';
      else if (effortModalTask.status === 'returnback') currentStatus = '6';
      else if (effortModalTask.status === 'cancel') currentStatus = '7';
      else if (effortModalTask.status === 'feespending') currentStatus = '8';
      else if (effortModalTask.status === 'onhold') currentStatus = '9';
      setEffortStatus(currentStatus);

      // Restore timer from localStorage
      const savedTimer = localStorage.getItem(`timer_${effortModalTask.id}`);
      if (savedTimer) {
        try {
          const { startTime, startedAt } = JSON.parse(savedTimer);
          const now = new Date();
          const elapsed = Math.floor((now.getTime() - startedAt) / 1000);
          setStartTimeCapture(startTime);
          setIsTimerRunning(true);
          setTimerSeconds(Math.max(0, elapsed));
        } catch {
          resetEffortTimer();
        }
      } else {
        resetEffortTimer();
      }

      setEffortModalTab('effort');
      setEffortSaveMsg('');
      setEffortNotes('');
    }
  }, [effortModalTask?.id]);

  const filteredTasks = tasks.filter(
    (t) =>
      t.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.assignTo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredTasks.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-4">
      {/* â”€â”€â”€ Top KPI Filter Buttons (matching old CRM: overdues, onhold, todays etc.) â”€â”€â”€ */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { label: 'OVER DUES', key: 'overdues', count: taskStats.overdues, cBase: '#EF4444' },
          { label: 'ON HOLD', key: 'onhold', count: taskStats.onhold, cBase: '#DC2626' },
          { label: "TODAY'S TASKS", key: 'todays', count: taskStats.todays, cBase: '#1F2937' },
          { label: "TOMORROW'S", key: 'tomorrows', count: taskStats.tomorrows, cBase: '#16A34A' },
          { label: 'NEXT 7 DAYS', key: 'nextweeks', count: taskStats.next7days, cBase: '#F97316' },
          {
            label: 'NEXT 15 DAYS',
            key: 'nexttwoweeks',
            count: taskStats.next15days,
            cBase: '#6366F1',
          },
        ].map((kpi) => (
          <button
            key={kpi.label}
            onClick={() => {
              const newFilter = dateFilter === kpi.key ? '' : kpi.key;
              setDateFilter(newFilter);
              setTaskFilter('Tasks');
              loadTasksFromApi(newFilter);
            }}
            className={`group flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer border ${
              dateFilter === kpi.key
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
            }`}
          >
            <span className="tracking-tight text-[11px] uppercase font-bold">{kpi.label}</span>
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-extrabold text-white"
              style={{ backgroundColor: kpi.cBase }}
            >
              {kpi.count}
            </span>
          </button>
        ))}
        {dateFilter && (
          <button
            onClick={() => {
              setDateFilter('');
              loadTasksFromApi('');
            }}
            className="text-xs text-slate-500 hover:text-red-500 px-2 py-1 rounded-lg hover:bg-red-50 font-medium transition-colors"
          >
            âœ• Clear Filter
          </button>
        )}
      </div>

      {/* â”€â”€â”€ Search & Filter Bar (Website Clean UI Style) â”€â”€â”€ */}
      <div className="bg-white p-4 rounded-3xl border border-[#EAE6DD] shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5 items-center">
          <select
            value={taskFilter}
            onChange={(e) => setTaskFilter(e.target.value)}
            className="text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
          >
            <option value="Tasks">All Tasks</option>
            <option value="123">Not Assign</option>
            <option value="1">Not Started</option>
            <option value="2">Work In Progress (WIP)</option>
            <option value="3">Pending From Client</option>
            <option value="4">Invoiced</option>
            <option value="5">Completed</option>
            <option value="6">Return Back</option>
            <option value="7">Cancelled</option>
            <option value="8">Fees Pending</option>
            <option value="9">On Hold</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
          >
            <option value="Category">Category</option>
            {categories.map((cat) => (
              <option key={cat.category_id} value={cat.category_id}>
                {cat.category_name}
              </option>
            ))}
          </select>

          {!isOpsEmployee && (
            <select
              value={staffFilter}
              onChange={(e) => setStaffFilter(e.target.value)}
              className="text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
            >
              <option value="Staff">Staff (All 39)</option>
              {opsStaff.map((staff) => (
                <option key={staff.id} value={staff.name}>
                  {staff.name}{' '}
                  {staff.role_id === 12
                    ? '(Assistant)'
                    : staff.role_id === 3
                      ? '(Manager)'
                      : '(Employee)'}
                </option>
              ))}
            </select>
          )}

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
            onClick={() => loadTasksFromApi()}
            className="btn-multicolor px-4 py-2 rounded-full text-xs font-bold shadow-2xs cursor-pointer"
          >
            <span>Filter</span>
          </button>

          {!isOpsEmployee && (
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
          )}
        </div>

        <div className="flex items-center gap-2.5 pt-1">
          {!isOpsEmployee && (
            <button
              onClick={async () => {
                if (selectedIds.size === 0) {
                  alert('Please select at least one task to update due date.');
                  return;
                }
                const nd = prompt('Enter new due date (YYYY-MM-DD):');
                if (nd) {
                  try {
                    const res = await fetch(`${API_BASE}/v1/crm/tasks/update-due-date`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        task_ids: Array.from(selectedIds),
                        due_date: nd,
                      }),
                    });
                    const result = await res.json();
                    if (result.success) {
                      alert(`Due date updated for ${selectedIds.size} tasks.`);
                      setSelectedIds(new Set());
                      loadTasksFromApi();
                    } else {
                      alert(result.message || 'Failed to update due dates');
                    }
                  } catch {
                    alert('Network error while updating due dates.');
                  }
                }
              }}
              className="btn-multicolor px-5 py-2 rounded-full text-xs font-bold shadow-2xs cursor-pointer"
            >
              <span>Change Due Date</span>
            </button>
          )}

          <button
            onClick={handleResetFilters}
            className="flex-1 btn-multicolor px-5 py-2 rounded-full text-xs font-bold shadow-2xs text-center cursor-pointer"
          >
            <span>Reset All</span>
          </button>
        </div>
      </div>

      {/* â”€â”€â”€ Task Table Card with Expandable Horizontal Timeline â”€â”€â”€ */}
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
                {!isOpsEmployee && (
                  <th className="py-2.5 px-3 w-8 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === tasks.length && tasks.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded text-[#003A66] focus:ring-0 cursor-pointer"
                    />
                  </th>
                )}
                {isOpsEmployee ? (
                  <>
                    <th className="py-2.5 px-3 font-bold">Assign By</th>
                    <th className="py-2.5 px-3 font-bold">Assign Date</th>
                    <th className="py-2.5 px-3 font-bold">Added By</th>
                    <th className="py-2.5 px-3 font-bold">Name</th>
                    <th className="py-2.5 px-3 font-bold">Company Name</th>
                    <th className="py-2.5 px-3 font-bold">Task</th>
                    <th className="py-2.5 px-3 font-bold">Mobile</th>
                    <th className="py-2.5 px-3 font-bold">Service</th>
                    <th className="py-2.5 px-3 font-bold">Status</th>
                    <th className="py-2.5 px-3 font-bold">Due Date</th>
                  </>
                ) : (
                  <>
                    <th className="py-2.5 px-3 font-bold">Task Name</th>
                    <th className="py-2.5 px-3 font-bold">Customer Name</th>
                    <th className="py-2.5 px-3 font-bold">Contact Number</th>
                    <th className="py-2.5 px-3 font-bold">Company Name</th>
                    <th className="py-2.5 px-3 font-bold">Service</th>
                    <th className="py-2.5 px-3 font-bold">Assign To</th>
                    <th className="py-2.5 px-3 font-bold">Added By</th>
                    <th className="py-2.5 px-3 font-bold">Assign Date</th>
                    <th className="py-2.5 px-3 font-bold">Due Date</th>
                    <th className="py-2.5 px-3 font-bold">Status</th>
                    <th className="py-2.5 px-3 font-bold text-center">Action</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={isOpsEmployee ? 10 : 12}
                    className="py-12 text-center text-xs text-slate-500"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#1E3A8A] border-t-transparent rounded-full animate-spin" />
                      Loading live SQL operations tasks from database...
                    </div>
                  </td>
                </tr>
              ) : filteredTasks.length === 0 ? (
                <tr>
                  <td
                    colSpan={isOpsEmployee ? 10 : 12}
                    className="py-10 text-center text-xs text-slate-400"
                  >
                    No tasks found in database matching your filter.
                  </td>
                </tr>
              ) : (
                paginatedTasks.map((task, idx) => (
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
                      {!isOpsEmployee && (
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(task.id)}
                            onChange={() => toggleSelect(task.id)}
                            className="rounded text-[#003A66] focus:ring-0 cursor-pointer"
                          />
                        </td>
                      )}
                      {isOpsEmployee ? (
                        <>
                          <td className="py-2.5 px-3 text-slate-700 font-medium">
                            {task.assignBy}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                            {task.assignDate ? task.assignDate.split('T')[0] : 'N/A'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{task.addedBy}</td>
                          <td className="py-2.5 px-3 text-slate-800 font-medium">
                            {task.customerName}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{task.companyName}</td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  if (expandedId === task.id) {
                                    setExpandedId(null);
                                  } else {
                                    setExpandedId(task.id);
                                    loadTableTimeline(task.id);
                                  }
                                }}
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
                          <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                            {task.phone || 'N/A'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-700 font-medium">{task.service}</td>
                          <td className="py-2.5 px-3">
                            <span
                              title={
                                task.status === 'completed'
                                  ? 'Completed'
                                  : task.status === 'wip'
                                    ? 'Work In Progress'
                                    : task.status === 'pendingfromclient'
                                      ? 'Pending From Client'
                                      : task.status === 'invoiced'
                                        ? 'Invoiced'
                                        : task.status === 'returnback'
                                          ? 'Return Back'
                                          : task.status === 'cancel'
                                            ? 'Cancelled'
                                            : task.status === 'feespending'
                                              ? 'Fees Pending'
                                              : task.status === 'onhold'
                                                ? 'On Hold'
                                                : 'Not Started'
                              }
                              className={`inline-flex items-center whitespace-nowrap border text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                task.status === 'completed'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : task.status === 'wip'
                                    ? 'bg-sky-50 text-sky-700 border-sky-200'
                                    : task.status === 'pendingfromclient'
                                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                                      : task.status === 'invoiced'
                                        ? 'bg-violet-50 text-violet-700 border-violet-200'
                                        : task.status === 'returnback'
                                          ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                                          : task.status === 'cancel'
                                            ? 'bg-slate-100 text-slate-600 border-slate-200'
                                            : task.status === 'feespending'
                                              ? 'bg-orange-50 text-orange-700 border-orange-200'
                                              : task.status === 'onhold'
                                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                                : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}
                            >
                              {STATUS_SHORT_MAP[task.status] || 'Not Started'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                            {task.dueDate ? task.dueDate.split('T')[0] : 'N/A'}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  if (expandedId === task.id) {
                                    setExpandedId(null);
                                  } else {
                                    setExpandedId(task.id);
                                    loadTableTimeline(task.id);
                                  }
                                }}
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
                          <td className="py-2.5 px-3 text-slate-800 font-medium">
                            {task.customerName}
                          </td>
                          <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                            {task.phone || 'N/A'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{task.companyName}</td>
                          <td className="py-2.5 px-3 text-slate-700 font-medium">{task.service}</td>
                          {!isOpsEmployee && (
                            <td className="py-2.5 px-3 font-medium">
                              {task.assignTo === 'Un-Assign' ||
                              task.isAssign === 0 ||
                              !task.assignedToId ? (
                                <span className="inline-flex items-center whitespace-nowrap bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                  Un-Assign
                                </span>
                              ) : (
                                <span className="text-slate-800 font-semibold">
                                  {task.assignTo}
                                </span>
                              )}
                            </td>
                          )}
                          <td className="py-2.5 px-3 text-slate-600">{task.addedBy}</td>
                          <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                            {task.assignDate ? task.assignDate.split('T')[0] : 'N/A'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                            {task.dueDate ? task.dueDate.split('T')[0] : 'N/A'}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              title={
                                task.status === 'completed'
                                  ? 'Completed'
                                  : task.status === 'wip'
                                    ? 'Work In Progress'
                                    : task.status === 'pendingfromclient'
                                      ? 'Pending From Client'
                                      : task.status === 'invoiced'
                                        ? 'Invoiced'
                                        : task.status === 'returnback'
                                          ? 'Return Back'
                                          : task.status === 'cancel'
                                            ? 'Cancelled'
                                            : task.status === 'feespending'
                                              ? 'Fees Pending'
                                              : task.status === 'onhold'
                                                ? 'On Hold'
                                                : 'Not Started'
                              }
                              className={`inline-flex items-center whitespace-nowrap border text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                task.status === 'completed'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : task.status === 'wip'
                                    ? 'bg-sky-50 text-sky-700 border-sky-200'
                                    : task.status === 'pendingfromclient'
                                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                                      : task.status === 'invoiced'
                                        ? 'bg-violet-50 text-violet-700 border-violet-200'
                                        : task.status === 'returnback'
                                          ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                                          : task.status === 'cancel'
                                            ? 'bg-slate-100 text-slate-600 border-slate-200'
                                            : task.status === 'feespending'
                                              ? 'bg-orange-50 text-orange-700 border-orange-200'
                                              : task.status === 'onhold'
                                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                                : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}
                            >
                              {STATUS_SHORT_MAP[task.status] || 'Not Started'}
                            </span>
                          </td>
                          {!isOpsEmployee && (
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
                          )}
                        </>
                      )}
                    </tr>

                    {/* --- Expandable Visual Stepper Timeline --- */}
                    {expandedId === task.id && (
                      <tr className="bg-[#FAF9F5]">
                        <td colSpan={isOpsEmployee ? 10 : 12} className="p-5">
                          <div className="bg-white rounded-2xl p-5 border border-[#EAE6DD] shadow-xs">
                            <h4 className="text-xs font-bold text-[#1B365D] uppercase mb-4 flex items-center gap-2">
                              <Clock className="w-4 h-4 text-emerald-600" />
                              <span>Task Progress Timeline & Action Audit</span>
                            </h4>

                            {tableTlLoading[task.id] ? (
                              <p className="text-xs text-slate-500 italic py-2">
                                Loading timeline...
                              </p>
                            ) : !tableTimeline[task.id] || tableTimeline[task.id].length === 0 ? (
                              <p className="text-xs text-slate-500 italic py-2">
                                No timeline records yet.
                              </p>
                            ) : (
                              <div className="relative flex items-start gap-12 overflow-x-auto py-4 px-2">
                                {/* Continuous timeline connector bar centered on node */}
                                <div className="absolute top-[68px] left-12 right-12 h-0.5 bg-blue-200 -z-0" />

                                {tableTimeline[task.id].map((tl: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="relative z-10 flex flex-col items-center text-center min-w-[160px]"
                                  >
                                    <p className="text-[11px] font-mono text-slate-600 font-semibold">
                                      {tl.date} {tl.time}
                                    </p>
                                    {tl.work_seconds > 0 && (
                                      <p className="text-[10px] text-slate-400">
                                        {(() => {
                                          const h = Math.floor(tl.work_seconds / 3600);
                                          const m = Math.floor((tl.work_seconds % 3600) / 60);
                                          const s = tl.work_seconds % 60;
                                          return `Total: ${h > 0 ? `${h}h ` : ''}${m}m ${s}s`;
                                        })()}
                                      </p>
                                    )}
                                    <p className="text-[11px] font-bold text-slate-800 mt-0.5">
                                      {tl.username || 'Unknown'}
                                    </p>

                                    {/* Step Node */}
                                    <div className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-xs my-2 flex items-center justify-center text-[9px] text-white font-bold" />

                                    {/* Status Pill */}
                                    <span
                                      className={`inline-flex items-center whitespace-nowrap border text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                                        tl.status === 5
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                          : tl.status === 2
                                            ? 'bg-sky-50 text-sky-700 border-sky-200'
                                            : tl.status === 3 || tl.status === 9
                                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                                              : tl.status === 4
                                                ? 'bg-violet-50 text-violet-700 border-violet-200'
                                                : tl.status === 6
                                                  ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                                                  : tl.status === 7
                                                    ? 'bg-slate-100 text-slate-600 border-slate-200'
                                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                      }`}
                                    >
                                      {STATUS_LABELS_MAP[tl.status] || 'Unknown'}
                                    </span>

                                    {/* Comment */}
                                    {tl.work && (
                                      <p className="text-xs font-bold text-slate-700 mt-2 max-w-[180px]">
                                        {tl.work}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {startIndex + 1} to {Math.min(endIndex, filteredTasks.length)} of{' '}
            {filteredTasks.length} entries
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-2.5 py-1 rounded ${
                    currentPage === pageNum
                      ? 'bg-[#1E3A8A] text-white font-bold'
                      : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* â”€â”€â”€ CLIENT INFO & EFFORT TRACKING MODAL â”€â”€â”€ */}
      {effortModalTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="rounded-3xl border border-[#EAE6DD] bg-white shadow-2xl overflow-hidden max-w-2xl w-full"
            style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
          >
            {/* Signature Top Multicolor Strip */}
            <div className="h-1 bg-multicolor" />

            {/* Modal Header */}
            <div className="p-4 px-6 border-b border-[#EAE6DD] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#1B365D] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#1B365D]">
                    Client Info & Effort Tracking
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {effortModalTask.customerName} â€¢ {effortModalTask.taskName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEffortModalTask(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs overflow-y-auto flex-1">
              <>
                {/* Upper Section: Client Details & Add Effort */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Left: Client Details */}
                  <div className="bg-[#FAF9F5] border border-[#EAE6DD] rounded-2xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-[#1B365D] uppercase tracking-wide flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#1B365D]" />
                      <span>Client Details</span>
                    </h4>
                    {[
                      { l: 'Customer Name', v: effortModalTask.customerName },
                      { l: 'Email Address', v: effortModalTask.email },
                      { l: 'Mobile Contact', v: effortModalTask.phone },
                      { l: 'Service Assigned', v: effortModalTask.service },
                    ].map((f) => (
                      <div key={f.l}>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                          {f.l}
                        </label>
                        <input
                          type="text"
                          readOnly
                          defaultValue={f.v}
                          className="w-full bg-white border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-semibold text-xs"
                        />
                      </div>
                    ))}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          readOnly
                          defaultValue={effortModalTask.state}
                          className="w-full bg-white border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          readOnly
                          defaultValue={effortModalTask.city}
                          className="w-full bg-white border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right: Add Effort & Timer */}
                  <div className="bg-[#FAF9F5] border border-[#EAE6DD] rounded-2xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-[#1B365D] uppercase tracking-wide flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Add Effort & Timer</span>
                      <span className="text-[9px] font-normal text-slate-400 normal-case ml-1">
                        (Start/End time optional)
                      </span>
                    </h4>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Task Status
                      </label>
                      <select
                        value={effortStatus}
                        onChange={(e) => setEffortStatus(e.target.value)}
                        className="w-full text-xs bg-white border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                      >
                        <option value="0" disabled>
                          Select Status
                        </option>
                        {Object.entries(STATUS_LABELS_MAP).map(([v, l]) => (
                          <option key={v} value={v}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Start / End Time Buttons */}
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
                        <p className="text-[10px] text-slate-500 mt-1 font-mono">
                          Captured: {startTimeCapture}
                        </p>
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
                        <p className="text-[10px] text-slate-500 mt-1 font-mono">
                          Captured: {endTimeCapture}
                        </p>
                      </div>
                    </div>

                    {/* Live Clock Display */}
                    <div className="bg-[#1B365D] text-white font-mono text-xl font-black py-2.5 px-4 rounded-2xl flex items-center justify-center gap-2.5 shadow-md border border-white/10 tracking-widest">
                      <Clock className="w-4 h-4 text-emerald-400 animate-pulse" />
                      <span>{formatTimer(timerSeconds)}</span>
                    </div>

                    {/* Notes Textarea */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Work Remarks / Efforts
                      </label>
                      <textarea
                        rows={3}
                        value={effortNotes}
                        onChange={(e) => setEffortNotes(e.target.value)}
                        placeholder="Describe work done or status update..."
                        className="w-full text-xs bg-white border border-[#EAE6DD] rounded-xl p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                      />
                    </div>

                    <button
                      onClick={handleSaveEffort}
                      disabled={effortSaving || !Number(effortStatus)}
                      className="btn-multicolor w-full py-2.5 rounded-full text-xs font-extrabold shadow-xs cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60"
                    >
                      {effortSaving ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      <span>{effortSaving ? 'Updating...' : 'Update Status & Save'}</span>
                    </button>
                    {effortSaveMsg && (
                      <div
                        className={`text-[11px] font-semibold px-3 py-2 rounded-xl ${effortSaveMsg.startsWith('S') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}
                      >
                        {effortSaveMsg}
                      </div>
                    )}
                  </div>
                </div>

                {/* Documents Section */}
                <div className="pt-1">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#FAF9F5] border border-[#EAE6DD] rounded-2xl p-4">
                      <h5 className="font-bold text-[#1B365D] mb-2 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        <span>Sent Documents</span>
                      </h5>
                      <div className="p-3 bg-white border border-[#EAE6DD] rounded-xl text-[11px] text-slate-500">
                        {sentDocuments.length === 0 ? (
                          <span>No sent documents yet.</span>
                        ) : (
                          <div className="space-y-1">
                            {sentDocuments.map((doc, idx) => (
                              <a
                                key={idx}
                                href={`${API_BASE}/Docs/${doc.url}`}
                                target="_blank"
                                rel="noreferrer"
                                className="block text-slate-700 hover:text-blue-600 hover:underline"
                              >
                                {doc.name}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-[#FAF9F5] border border-[#EAE6DD] rounded-2xl p-4">
                      <h5 className="font-bold text-[#1B365D] mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Received Documents</span>
                      </h5>
                      <div className="p-3 bg-white border border-[#EAE6DD] rounded-xl text-[11px] text-slate-700 font-medium">
                        {receivedDocuments.length === 0 ? (
                          <span>No received documents yet.</span>
                        ) : (
                          <div className="space-y-1">
                            {receivedDocuments.map((doc, idx) => (
                              <a
                                key={idx}
                                href={`${API_BASE}/Docs/${doc.url}`}
                                target="_blank"
                                rel="noreferrer"
                                className="block text-slate-700 hover:text-emerald-600 hover:underline"
                              >
                                {doc.name}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-[#FAF9F5] border border-[#EAE6DD] rounded-2xl p-4">
                      <h5 className="font-bold text-[#1B365D] mb-2 flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-purple-600" />
                        <span>Upload Document</span>
                      </h5>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Document Name..."
                          value={docNameInput}
                          onChange={(e) => setDocNameInput(e.target.value)}
                          className="w-full bg-white border border-[#EAE6DD] rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                        />
                        <input
                          type="file"
                          id="customer_docs"
                          className="text-[11px] text-slate-500"
                          accept="*"
                        />
                        <button
                          onClick={async () => {
                            const fileInput = document.getElementById(
                              'customer_docs'
                            ) as HTMLInputElement;
                            const file = fileInput?.files?.[0];
                            if (!docNameInput || !file || !effortModalTask || !staffUser?.id) {
                              alert('Please enter document name and select a file');
                              return;
                            }
                            setDocUploading(true);
                            const fd = new FormData();
                            fd.append('customer_docs', file);
                            fd.append('doc_cust_id', String(effortModalTask.customerId));
                            fd.append('docs_name', docNameInput);
                            fd.append('cd_service_id', String(effortModalTask.serviceId));
                            fd.append('user_id', String(staffUser.id));
                            try {
                              const res = await fetch(
                                `${API_BASE}/v1/crm/ops-employee/upload-document`,
                                {
                                  method: 'POST',
                                  headers: { Authorization: `Bearer ${staffToken}` },
                                  body: fd,
                                }
                              );
                              const data = await res.json();
                              if (data.success) {
                                setDocNameInput('');
                                if (fileInput) fileInput.value = '';
                                fetchDocuments(
                                  effortModalTask.customerId,
                                  effortModalTask.serviceId
                                );
                              } else {
                                alert(data.error || 'Upload failed');
                              }
                            } catch {
                              alert('Failed to upload document');
                            } finally {
                              setDocUploading(false);
                            }
                          }}
                          disabled={docUploading}
                          className="btn-multicolor w-full py-2 rounded-full text-xs font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span>{docUploading ? 'Uploading...' : 'Upload'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            </div>
          </div>
        </div>
      )}

      {/* â”€â”€â”€ ASSIGN TASK TO MODAL (Website Clean UI Style) â”€â”€â”€ */}
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
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Select User
                </label>
                <select
                  value={assignUser}
                  onChange={(e) => setAssignUser(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                >
                  {opsStaff.map((staff) => (
                    <option key={staff.id} value={staff.name}>
                      {staff.name}{' '}
                      {staff.role_id === 12
                        ? '(Assistant)'
                        : staff.role_id === 3
                          ? '(Manager)'
                          : '(Employee)'}
                    </option>
                  ))}
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
