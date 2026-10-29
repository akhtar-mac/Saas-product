import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/store/auth-store';
import {
  X,
  Play,
  Square,
  Clock,
  Upload,
  Search,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Eye,
  Loader2,
} from 'lucide-react';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5001';

const STATUS_LABELS: Record<number, string> = {
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

const STATUS_COLORS: Record<number, string> = {
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

function StatusBadge({ status }: { status: number }) {
  const color = STATUS_COLORS[status] || '#6b7280';
  return (
    <span
      style={{
        background: color,
        color: '#fff',
        padding: '2px 8px',
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: 'nowrap',
      }}
    >
      {STATUS_LABELS[status] || 'Unknown'}
    </span>
  );
}

function fmtTime(sec: number) {
  const h = Math.floor(sec / 3600),
    m = Math.floor((sec % 3600) / 60),
    s = sec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function fmtDate(d: string) {
  if (!d) return '—';
  const parts = d.split('T')[0].split('-');
  return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : d;
}

function isOverdue(due: string, status: number) {
  if ([4, 5, 6, 7].includes(status) || !due) return false;
  return new Date(due) < new Date(new Date().toDateString());
}

interface OETask {
  ta_id: number;
  task_id: number;
  task_name: string;
  customer_id: number;
  customer_name: string;
  company_name: string;
  contact: string;
  email: string;
  state: string;
  city: string;
  service_id: number;
  service_name: string;
  assign_date: string;
  due_date: string;
  actual_task_status: number;
  sub_customer_name: string;
  assign_by: string;
  added_by_name: string;
}

interface TLEntry {
  id: number;
  status: number;
  work: string;
  date: string;
  time: string;
  username: string;
  start_time?: string;
  end_time?: string;
  work_seconds?: number;
}

interface Doc {
  cd_id: number;
  cd_name: string;
  cd_doc: string;
  cd_from: number;
  cd_to: number;
}

const td: React.CSSProperties = {
  padding: '8px 12px',
  verticalAlign: 'middle',
  fontSize: 13,
  color: '#374151',
};
const sel: React.CSSProperties = {
  padding: '7px 10px',
  border: '1.5px solid #d1d5db',
  borderRadius: 8,
  fontSize: 12,
  color: '#374151',
  outline: 'none',
  background: '#fff',
  cursor: 'pointer',
};
const btn1: React.CSSProperties = {
  background: 'linear-gradient(135deg,#1d4ed8,#1e40af)',
  color: '#fff',
  border: 'none',
  padding: '7px 16px',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
};
const btn2: React.CSSProperties = {
  background: 'linear-gradient(135deg,#6b7280,#4b5563)',
  color: '#fff',
  border: 'none',
  padding: '7px 14px',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
};
const abtn: React.CSSProperties = {
  color: '#fff',
  border: 'none',
  padding: '5px 7px',
  borderRadius: 6,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
};
const ov: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15,24,40,0.6)',
  backdropFilter: 'blur(4px)',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 16,
};
const inp: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  border: '1.5px solid #d1d5db',
  borderRadius: 8,
  fontSize: 13,
  color: '#374151',
  outline: 'none',
  background: '#fff',
  boxSizing: 'border-box',
};
const roi: React.CSSProperties = {
  width: '100%',
  padding: '7px 10px',
  border: 'none',
  borderBottom: '1.5px solid #d1d5db',
  background: '#f9fafb',
  fontSize: 13,
  color: '#374151',
  outline: 'none',
  boxSizing: 'border-box',
};
const lbl: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700,
  color: '#6b7280',
  marginBottom: 4,
};

export default function OpsExecutiveDashboard() {
  const { staffUser, staffToken } = useAuthStore();
  const userId = (staffUser as any)?.id || (staffUser as any)?.userId || 0;
  const authH = { Authorization: `Bearer ${staffToken}` };

  const [tasks, setTasks] = useState<OETask[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [taskStatus, setTaskStatus] = useState(0);
  const [categoryId, setCategoryId] = useState(0);
  const [categories, setCategories] = useState<{ category_id: number; category_name: string }[]>(
    []
  );
  const [counts, setCounts] = useState({
    overdues: 0,
    onhold: 0,
    todays: 0,
    tomorrows: 0,
    next7days: 0,
    next15days: 0,
    notstarted: 0,
    wip: 0,
    pendingfc: 0,
    invoiced: 0,
    completed: 0,
    feespending: 0,
    total: 0,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'details' | 'timeline'>('details');
  const [clientInfo, setClientInfo] = useState<any>(null);
  const [clientLoading, setClientLoading] = useState(false);
  const [curTask, setCurTask] = useState<OETask | null>(null);

  const [workStatus, setWorkStatus] = useState(0);
  const [workText, setWorkText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');

  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [startDisp, setStartDisp] = useState('--:--:--');
  const [endDisp, setEndDisp] = useState('--:--:--');
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerDisp, setTimerDisp] = useState('00:00:00');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [tlOpen, setTlOpen] = useState(false);
  const [timeline, setTimeline] = useState<TLEntry[]>([]);
  const [tlLoading, setTlLoading] = useState(false);

  const [sentDocs, setSentDocs] = useState<Doc[]>([]);
  const [rcvDocs, setRcvDocs] = useState<Doc[]>([]);
  const [docsName, setDocsName] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchTasks = useCallback(
    async (ft = filterType, ts = taskStatus, cat = categoryId, s = search) => {
      if (!userId) return;
      setLoading(true);
      try {
        const p = new URLSearchParams({ user_id: String(userId) });
        if (ft) p.set('filterType', ft);
        if (ts) p.set('task_status', String(ts));
        if (cat) p.set('category_id', String(cat));
        if (s) p.set('search', s);
        const r = await fetch(`${API_BASE}/api/crm/ops-employee/tasks?${p}`, { headers: authH });
        const j = await r.json();
        setTasks(j.data || []);
      } catch {
        setTasks([]);
      } finally {
        setLoading(false);
      }
    },
    [userId, staffToken]
  );

  const fetchStats = useCallback(async () => {
    if (!userId) return;
    try {
      const r = await fetch(`${API_BASE}/v1/crm/tasks/stats?employee_id=${userId}`, {
        headers: authH,
      });
      const j = await r.json();
      if (j.success) setCounts(j.data);
    } catch {
      /* ignore */
    }
  }, [userId, staffToken]);

  const fetchCats = useCallback(async () => {
    try {
      const r = await fetch(`${API_BASE}/v1/crm/ops-employee/categories`, { headers: authH });
      const j = await r.json();
      if (j.success) setCategories(j.data || []);
    } catch {
      /* ignore */
    }
  }, [staffToken]);

  useEffect(() => {
    fetchTasks();
    fetchStats();
    fetchCats();
  }, []);

  const startTimer = () => {
    const now = new Date();
    const t = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    setStartTime(t);
    setStartDisp(t);
    setEndTime('');
    setEndDisp('--:--:--');
    setTimerRunning(true);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const n = new Date(),
        td2 = n.toISOString().split('T')[0];
      setTimerDisp(
        fmtTime(Math.max(0, Math.floor((n.getTime() - new Date(`${td2} ${t}`).getTime()) / 1000)))
      );
    }, 1000);
  };

  const stopTimer = () => {
    if (!startTime) return;
    if (timerRef.current) clearInterval(timerRef.current);
    const now = new Date();
    const t = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    setEndTime(t);
    setEndDisp(t);
    setTimerRunning(false);
    const td2 = now.toISOString().split('T')[0];
    setTimerDisp(
      fmtTime(
        Math.max(0, Math.floor((now.getTime() - new Date(`${td2} ${startTime}`).getTime()) / 1000))
      )
    );
  };

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStartTime('');
    setEndTime('');
    setStartDisp('--:--:--');
    setEndDisp('--:--:--');
    setTimerDisp('00:00:00');
    setTimerRunning(false);
  };

  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current);
    },
    []
  );

  const openClientInfo = async (task: OETask) => {
    setCurTask(task);
    setModalOpen(true);
    setModalTab('details');
    setClientLoading(true);
    setClientInfo(null);
    setSubmitMsg('');
    resetTimer();
    setWorkText('');
    setSentDocs([]);
    setRcvDocs([]);
    try {
      const p = new URLSearchParams({
        cust_id: String(task.customer_id),
        service_id: String(task.service_id),
        task_id: String(task.task_id),
      });
      const r = await fetch(`${API_BASE}/api/crm/ops-employee/client-info?${p}`, {
        headers: authH,
      });
      const j = await r.json();
      if (j.success) {
        setClientInfo(j.data);
        setWorkStatus(j.data.actual_task_status || 1);
        if (j.data.start_time && !j.data.end_time) {
          setStartTime(j.data.start_time);
          setStartDisp(j.data.start_time);
          setTimerRunning(true);
          if (timerRef.current) clearInterval(timerRef.current);
          const st = j.data.start_time as string;
          timerRef.current = setInterval(() => {
            const n = new Date(),
              td2 = n.toISOString().split('T')[0];
            setTimerDisp(
              fmtTime(
                Math.max(0, Math.floor((n.getTime() - new Date(`${td2} ${st}`).getTime()) / 1000))
              )
            );
          }, 1000);
        }
      }
    } catch {
      /* ignore */
    } finally {
      setClientLoading(false);
    }
    try {
      const dp = new URLSearchParams({
        customer_id: String(task.customer_id),
        service_id: String(task.service_id),
      });
      const dr = await fetch(`${API_BASE}/api/crm/ops-employee/documents?${dp}`, {
        headers: authH,
      });
      const dj = await dr.json();
      if (dj.success) {
        const d: Doc[] = dj.data || [];
        setSentDocs(d.filter((x) => x.cd_from !== task.customer_id));
        setRcvDocs(d.filter((x) => x.cd_from === task.customer_id));
      }
    } catch {
      /* ignore */
    }
  };

  const openTimeline = async (task: OETask) => {
    setCurTask(task);
    setTlOpen(true);
    setTlLoading(true);
    setTimeline([]);
    try {
      const r = await fetch(
        `${API_BASE}/api/crm/ops-employee/work-timeline?task_id=${task.task_id}`,
        { headers: authH }
      );
      const j = await r.json();
      if (j.success) setTimeline(j.data || []);
    } catch {
      /* ignore */
    } finally {
      setTlLoading(false);
    }
  };

  const submitEffort = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!curTask || !userId) return;
    setSubmitting(true);
    setSubmitMsg('');
    try {
      const r = await fetch(`${API_BASE}/api/crm/ops-employee/add-work-effort`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authH },
        body: JSON.stringify({
          cust_id: curTask.customer_id,
          task_id: curTask.task_id,
          status: workStatus,
          work: workText,
          work_service_id: curTask.service_id,
          start_time: startTime,
          end_time: endTime,
          user_id: userId,
        }),
      });
      const j = await r.json();
      if (j.success) {
        setSubmitMsg('Status updated successfully!');
        setWorkText('');
        resetTimer();
        setTasks((p) =>
          p.map((t) =>
            t.task_id === curTask.task_id ? { ...t, actual_task_status: workStatus } : t
          )
        );
        fetchTasks(filterType, taskStatus, categoryId, search);
        fetchStats();
        if (workStatus === 6) setTimeout(() => setModalOpen(false), 1200);
      } else {
        setSubmitMsg('Error: ' + (j.message || 'Something went wrong'));
      }
    } catch {
      setSubmitMsg('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const uploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!curTask || !docFile || !userId) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('customer_docs', docFile);
      fd.append('doc_cust_id', String(curTask.customer_id));
      fd.append('docs_name', docsName || docFile.name);
      fd.append('cd_service_id', String(curTask.service_id));
      fd.append('user_id', String(userId));
      const r = await fetch(`${API_BASE}/v1/crm/ops-employee/upload-document`, {
        method: 'POST',
        headers: authH,
        body: fd,
      });
      const j = await r.json();
      if (j.success) {
        setDocsName('');
        setDocFile(null);
        const dp = new URLSearchParams({
          customer_id: String(curTask.customer_id),
          service_id: String(curTask.service_id),
        });
        const dr = await fetch(`${API_BASE}/v1/crm/ops-employee/documents?${dp}`, {
          headers: authH,
        });
        const dj = await dr.json();
        if (dj.success) {
          const d: Doc[] = dj.data || [];
          setSentDocs(d.filter((x) => x.cd_from !== curTask.customer_id));
          setRcvDocs(d.filter((x) => x.cd_from === curTask.customer_id));
        }
      }
    } catch {
      /* ignore */
    } finally {
      setUploading(false);
    }
  };

  const applyFilter = (ft: string) => {
    setFilterType(ft);
    setTaskStatus(0);
    fetchTasks(ft, 0, categoryId, search);
  };
  const applyStatus = (ts: number) => {
    setTaskStatus(ts);
    setFilterType('');
    fetchTasks('', ts, categoryId, search);
  };
  const applyCat = (cat: number) => {
    setCategoryId(cat);
    fetchTasks(filterType, taskStatus, cat, search);
  };

  const displayed = tasks.filter((t) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      t.customer_name?.toLowerCase().includes(s) ||
      t.company_name?.toLowerCase().includes(s) ||
      t.task_name?.toLowerCase().includes(s) ||
      t.service_name?.toLowerCase().includes(s) ||
      t.contact?.includes(s)
    );
  });

  return (
    <div
      style={{
        fontFamily: 'Inter,system-ui,sans-serif',
        minHeight: '100vh',
        background: '#f1f5f9',
        padding: '24px',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ margin: '0 0 24px', fontSize: 24, fontWeight: 800, color: '#1e3a5f' }}>
          Task Status Dashboard
        </h1>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
          }}
        >
          {[
            { label: 'Total Tasks', count: counts.total, color: '#1e3a5f' },
            { label: 'Not Started', count: counts.notstarted, color: '#dc2626' },
            { label: 'WIP', count: counts.wip, color: '#2563eb' },
            { label: 'Pending From Client', count: counts.pendingfc, color: '#d97706' },
            { label: 'Invoiced', count: counts.invoiced, color: '#7c3aed' },
            { label: 'Payment Pending', count: counts.feespending, color: '#ea580c' },
            { label: 'Completed', count: counts.completed, color: '#16a34a' },
          ].map((card) => (
            <div
              key={card.label}
              style={{
                background: '#fff',
                borderRadius: 12,
                padding: '20px',
                boxShadow: '0 1px 8px rgba(0,0,0,0.08)',
                borderLeft: `4px solid ${card.color}`,
              }}
            >
              <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: '#6b7280' }}>
                {card.label}
              </p>
              <p style={{ margin: 0, fontSize: 32, fontWeight: 800, color: card.color }}>
                {card.count}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
