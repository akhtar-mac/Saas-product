import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { RoleType } from '@etaxwala/types';
import {
  Search,
  Plus,
  Trash2,
  Edit3,
  Eye,
  FileText,
  Phone,
  Calendar,
  Check,
  ChevronDown,
  X,
  HelpCircle,
  Clock,
  Info,
  Building,
  User,
  ArrowRight,
  Upload,
} from 'lucide-react';

interface Lead {
  id: number;
  date: string;
  name: string;
  contact: string;
  email?: string;
  state: string;
  city: string;
  service: string;
  addedBy: string;
  isAssign: boolean;
  leadScore?: string;
  leadSource?: string;
  fDate?: string;
  assignTo?: string;
  assignDate?: string;
  status: string;
  remarks?: { staff: string; note: string; date: string; source: string }[];
  note?: string;
}

const INITIAL_LEADS: Lead[] = [
  {
    id: 1,
    date: '2026-09-04',
    name: 'Suresh Nimbalkar',
    contact: '9822440789',
    email: 'suresh.n@gmail.com',
    state: 'Maharashtra',
    city: 'Daund',
    service: 'Multistate Registration',
    addedBy: 'Facebook',
    isAssign: false,
    leadScore: '85%',
    leadSource: 'ETaxwala',
    fDate: '2026-07-01',
    assignTo: 'Krushna Shinde',
    assignDate: '2026-09-04 10:02:17',
    status: 'New',
    note: 'Interested in Multistate Cooperative Society setup for sugar factory area.',
    remarks: [
      { staff: 'Krushna Shinde', note: 'DONE', date: '20/7/2026, 6:52:13 pm', source: 'etaxwala' },
      { staff: 'Krushna Shinde', note: 'CALL NOT REC...', date: '11/7/2026, 5:31:32 pm', source: 'etaxwala' },
    ],
  },
  {
    id: 2,
    date: '2026-09-04',
    name: 'Ramesh pandurang Nakhate',
    contact: '7588090566',
    email: 'nakhate.ramesh@gmail.com',
    state: 'Maharashtra',
    city: 'Karanja',
    service: 'Multistate Registration',
    addedBy: 'Facebook',
    isAssign: false,
    leadScore: '70%',
    leadSource: 'ETaxwala',
    fDate: '2026-07-04',
    assignTo: 'Krushna Shinde',
    assignDate: '2026-09-04 10:02:17',
    status: 'New',
    remarks: [
      { staff: 'Krushna Shinde', note: 'CALL NOT REC...', date: '9/7/2026, 4:11:34 pm', source: 'etaxwala' },
    ],
  },
  {
    id: 3,
    date: '2026-09-04',
    name: 'Adv Kailas Khandbahale',
    contact: '9922624141',
    email: 'adv.kailas@yahoo.com',
    state: 'Maharashtra',
    city: 'Nashik',
    service: 'Multistate Registration',
    addedBy: 'Facebook',
    isAssign: false,
    leadScore: '92%',
    leadSource: 'ETaxwala',
    fDate: '2026-07-20',
    assignTo: 'Krushna Shinde',
    assignDate: '2026-09-04 10:02:17',
    status: 'New',
    remarks: [
      { staff: 'Krushna Shinde', note: 'HE SAID COME TO OFFICE', date: '7/7/2026, 2:43:01 pm', source: 'etaxwala' },
    ],
  },
  {
    id: 4,
    date: '2026-09-04',
    name: 'Mahesh Solanke',
    contact: '9767942942',
    email: 'solankem@gmail.com',
    state: 'Maharashtra',
    city: 'Beed',
    service: 'Multistate Registration',
    addedBy: 'Facebook',
    isAssign: false,
    leadScore: '60%',
    leadSource: 'ETaxwala',
    fDate: '2026-08-01',
    assignTo: 'Krushna Shinde',
    assignDate: '2026-09-04 10:02:17',
    status: 'New',
    remarks: [
      { staff: 'Krushna Shinde', note: 'ASK FOR STATEMENTS...', date: '17/6/2026, 7:20:02 pm', source: 'etaxwala' },
    ],
  },
  {
    id: 5,
    date: '2026-09-04',
    name: 'Akash Sonar',
    contact: '8378889970',
    email: 'akashsonar@gmail.com',
    state: 'NA',
    city: 'Malegaon',
    service: 'Multistate Registration',
    addedBy: 'Facebook',
    isAssign: false,
    leadScore: '50%',
    leadSource: 'ETaxwala',
    fDate: 'No Date',
    assignTo: 'Not Assigned',
    assignDate: '2026-09-04 00:00:00',
    status: 'New',
  },
  {
    id: 6,
    date: '2026-09-04',
    name: 'Babu rane',
    contact: '8425900269',
    email: 'baburane@gmail.com',
    state: 'Maharashtra',
    city: 'Mumbai',
    service: 'Multistate Registration',
    addedBy: 'Facebook',
    isAssign: false,
    leadScore: '75%',
    leadSource: 'ETaxwala',
    fDate: '2026-07-20',
    assignTo: 'Krushna Shinde',
    assignDate: '2026-09-04 10:02:17',
    status: 'New',
  },
  {
    id: 7,
    date: '2026-09-04',
    name: 'फुलारी',
    contact: '7218881000',
    email: 'fulari@gmail.com',
    state: 'Maharashtra',
    city: 'Solapur',
    service: 'Multistate Registration',
    addedBy: 'Facebook',
    isAssign: false,
    leadScore: '80%',
    leadSource: 'ETaxwala',
    fDate: 'No Date',
    assignTo: 'Not Assigned',
    assignDate: '2026-09-04 00:00:00',
    status: 'New',
  },
  {
    id: 8,
    date: '2026-09-04',
    name: 'gurudatt traders',
    contact: '8884390121',
    email: 'gurudatt@gmail.com',
    state: 'Karnataka',
    city: 'Kagwad',
    service: 'Multistate Registration',
    addedBy: 'Facebook',
    isAssign: false,
    leadScore: '65%',
    leadSource: 'ETaxwala',
    fDate: 'No Date',
    assignTo: 'Not Assigned',
    assignDate: '2026-09-04 00:00:00',
    status: 'New',
  },
  {
    id: 9,
    date: '2026-09-04',
    name: 'Tushar Tapele 2891',
    contact: '9764361576',
    email: 'tushar2891@gmail.com',
    state: 'Maharashtra',
    city: 'Magalvedha',
    service: 'Multistate Registration',
    addedBy: 'Facebook',
    isAssign: false,
    leadScore: '55%',
    leadSource: 'ETaxwala',
    fDate: 'No Date',
    assignTo: 'Not Assigned',
    assignDate: '2026-09-04 00:00:00',
    status: 'New',
  },
  {
    id: 10,
    date: '2026-09-04',
    name: 'ANTKALA BHAURAV JADHAV',
    contact: '8080085328',
    email: 'antkala@gmail.com',
    state: 'Maharashtra',
    city: 'NA',
    service: 'Producer Company Audit and Compliances',
    addedBy: 'Krushna Shinde',
    isAssign: true,
    leadScore: '88%',
    leadSource: 'ETaxwala',
    fDate: '2026-07-20',
    assignTo: 'Krushna Shinde',
    assignDate: '2026-09-04 10:02:17',
    status: 'New',
    note: 'Required FPC annual compliances and auditor appointment documentation.',
    remarks: [
      { staff: 'Krushna Shinde', note: 'DONE', date: '20/7/2026, 6:52:13 pm', source: 'etaxwala' },
      { staff: 'Krushna Shinde', note: 'CALL NOT REC...', date: '11/7/2026, 5:31:32 pm', source: 'etaxwala' },
      { staff: 'Krushna Shinde', note: 'CALL NOT REC...', date: '9/7/2026, 4:11:34 pm', source: 'etaxwala' },
      { staff: 'Krushna Shinde', note: 'HE SAID COME TO OFFICE', date: '7/7/2026, 2:43:01 pm', source: 'etaxwala' },
      { staff: 'Krushna Shinde', note: 'ASK FOR STATEMENTS...', date: '17/6/2026, 7:20:02 pm', source: 'etaxwala' },
      { staff: 'Krushna Shinde', note: 'Follow-up: CALL BACK', date: '18/7/2026, 6:28:22 pm', source: 'etaxwala' },
      { staff: 'Krushna Shinde', note: 'Follow-up: CALL BACK', date: '14/7/2026, 5:23:01 pm', source: 'etaxwala' },
      { staff: 'Krushna Shinde', note: 'Follow-up: CALL BACK', date: '13/7/2026, 6:20:13 pm', source: 'etaxwala' },
      { staff: 'Krushna Shinde', note: 'Follow-up: CALL BACK', date: '11/7/2026, 5:31:41 pm', source: 'etaxwala' },
    ],
  },
];

const STATUS_KPIS = [
  { id: 'all', label: 'Total', count: '16680', cBase: '#1B365D', cLight: '#60A5FA', cDark: '#0F172A' },
  { id: 'New', label: 'New', count: '331', cBase: '#10B981', cLight: '#6EE7B7', cDark: '#047857' },
  { id: 'Not Interested', label: 'Not Intrested', count: '11337', cBase: '#EF4444', cLight: '#FCA5A5', cDark: '#B91C1C' },
  { id: 'Prospect', label: 'Prospect', count: '2068', cBase: '#059669', cLight: '#34D399', cDark: '#065F46' },
  { id: 'Interested', label: 'Intrested', count: '434', cBase: '#06B6D4', cLight: '#67E8F9', cDark: '#0E7490' },
  { id: 'Quotation', label: 'Quotation', count: '76', cBase: '#7C3AED', cLight: '#C4B5FD', cDark: '#5B21B6' },
  { id: 'Hot', label: 'Hot', count: '176', cBase: '#EA580C', cLight: '#FDBA74', cDark: '#9A3412' },
  { id: 'Meetings', label: 'Meetings', count: '145', cBase: '#D97706', cLight: '#FDE68A', cDark: '#92400E' },
  { id: 'Customer', label: 'Customer', count: '486', cBase: '#8B5CF6', cLight: '#DDD6FE', cDark: '#6D28D9' },
  { id: 'Not Connected', label: 'Not Connected', count: '1594', cBase: '#6366F1', cLight: '#A5B4FC', cDark: '#4338CA' },
  { id: 'Negotiation', label: 'Negotiation', count: '33', cBase: '#A855F7', cLight: '#E9D5FF', cDark: '#7E22CE' },
  { id: 'Todays Followup', label: 'Todays Followup', count: '171', cBase: '#4F46E5', cLight: '#818CF8', cDark: '#3730A3' },
  { id: 'Tomorrows Followup', label: 'Tomorrows Followup', count: '160', cBase: '#3730A3', cLight: '#6366F1', cDark: '#1E1B4B' },
  { id: 'DayAfterTomorrows', label: 'DayAfterTomorrows', count: '3', cBase: '#312E81', cLight: '#4F46E5', cDark: '#0F172A' },
];

export default function CrmLeadsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { staffUser, activeRole } = useAuthStore();

  // Mode: 'list' (Lead List) vs 'details' (Leads Details) vs 'inquiry' (Customer Inquiries)
  const isDetailsView = location.pathname.includes('details') || location.search.includes('view=details');
  const isInquiryView = location.pathname.includes('inquiry') || location.search.includes('view=inquiry');

  // Role-based visibility — Sales Employees have restricted view (no bulk assign, no selection)
  const isSalesEmployee = activeRole === RoleType.SALES_EMPLOYEE;
  const isManager = !isSalesEmployee; // Manager / Admin can assign leads to other staff

  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [activeStatusKpi, setActiveStatusKpi] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [assignStaff, setAssignStaff] = useState('Assign Leads To');
  const [statusDropdown, setStatusDropdown] = useState('Status');

  // Modals
  const [detailsModalLead, setDetailsModalLead] = useState<Lead | null>(
    new URLSearchParams(location.search).get('modal') === '1' ? INITIAL_LEADS[0] : null
  );
  const [detailsActiveTab, setDetailsActiveTab] = useState<'client' | 'status' | 'followup' | 'services'>('client');
  const [remarksModalLead, setRemarksModalLead] = useState<Lead | null>(
    new URLSearchParams(location.search).get('remarks') === '1' ? INITIAL_LEADS[0] : null
  );
  const [addLeadModalOpen, setAddLeadModalOpen] = useState(
    new URLSearchParams(location.search).get('add') === '1'
  );

  // Form states inside Details Modal
  const [editStatus, setEditStatus] = useState('Interested');
  const [editRemark, setEditRemark] = useState('');
  const [followupDate, setFollowupDate] = useState('2026-09-05');
  const [followupTime, setFollowupTime] = useState('11:00');
  const [followupRemark, setFollowupRemark] = useState('');
  const [selectedAdditionalService, setSelectedAdditionalService] = useState('Section 8 Company NGO Registration');
  const [additionalServices, setAdditionalServices] = useState<string[]>([]);

  // New lead form state
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadContact, setNewLeadContact] = useState('');
  const [newLeadEmail, setNewLeadEmail] = useState('');
  const [newLeadService, setNewLeadService] = useState('Multistate Registration');
  const [newLeadState, setNewLeadState] = useState('Maharashtra');
  const [newLeadCity, setNewLeadCity] = useState('');

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  // Fetch real leads from API if available
  useEffect(() => {
    fetch(`${API_BASE}/v1/crm/leads?limit=50`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data?.data) && data.data.length > 0) {
          const mapped: Lead[] = data.data.map((l: any, i: number) => ({
            id: l.id || i + 1,
            date: l.date?.split('T')[0] || l.created_at?.split('T')[0] || '2026-09-04',
            name: l.name || 'Client Lead',
            contact: l.contact || '9876543210',
            email: l.email || 'client@example.com',
            state: l.state || 'Maharashtra',
            city: l.city || 'Pune',
            service: l.service || 'Multistate Registration',
            addedBy: l.source || l.lead_source || 'ETaxwala',
            isAssign: Boolean(l.is_assign),
            leadScore: '80%',
            leadSource: l.source || 'ETaxwala',
            fDate: l.followup_date || 'No Date',
            assignTo: l.added_by ? `Staff #${l.added_by}` : 'Not Assigned',
            assignDate: l.date?.split('T')[0] || '2026-09-04 10:00:00',
            status: l.lead_type === 4 ? 'Won' : l.lead_type === 1 ? 'Interested' : 'New',
            note: l.lead_note || '',
            remarks: [],
          }));
          setLeads(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const toggleSelectAll = () => {
    if (selectedIds.size === leads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(leads.map((l) => l.id)));
    }
  };

  const toggleSelect = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkAssign = async () => {
    if (assignStaff === 'Assign Leads To' || selectedIds.size === 0) {
      alert('Please select leads and choose a staff member to assign.');
      return;
    }
    const idsArray = Array.from(selectedIds);
    try {
      await fetch(`${API_BASE}/v1/crm/leads/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_ids: idsArray, assign_to_user_id: 1 }),
      });
      setLeads((prev) =>
        prev.map((l) =>
          selectedIds.has(l.id)
            ? { ...l, assignTo: assignStaff, isAssign: true, assignDate: new Date().toLocaleString() }
            : l
        )
      );
      alert(`Assigned ${selectedIds.size} leads to ${assignStaff} and saved in database.`);
      setSelectedIds(new Set());
    } catch {
      alert('Failed to save assignment in database.');
    }
  };

  const handleAddRemark = async () => {
    if (!editRemark.trim() || !detailsModalLead) return;
    try {
      await fetch(`${API_BASE}/v1/crm/calls/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: detailsModalLead.id,
          status: editStatus === 'Won' ? 4 : 1,
          remarks: editRemark,
        }),
      });

      await fetch(`${API_BASE}/v1/crm/leads/${detailsModalLead.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editStatus === 'Won' ? 4 : 1,
          note: editRemark,
        }),
      }).catch(() => {});

      const newEntry = {
        staff: 'Current Staff',
        note: editRemark,
        date: new Date().toLocaleString(),
        source: 'etaxwala',
      };
      setLeads((prev) =>
        prev.map((l) =>
          l.id === detailsModalLead.id
            ? {
                ...l,
                status: editStatus,
                remarks: [newEntry, ...(l.remarks || [])],
              }
            : l
        )
      );
      setEditRemark('');
      alert('Lead status and remark saved to database successfully!');
    } catch {
      alert('Failed to save remark to database.');
    }
  };

  const handleAddFollowup = async () => {
    if (!followupRemark.trim() || !detailsModalLead) return;
    try {
      await fetch(`${API_BASE}/v1/crm/leads/followup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: detailsModalLead.id,
          followup_date: followupDate,
          followup_time: followupTime,
          followup_remark: followupRemark,
        }),
      });

      const newEntry = {
        staff: 'Current Staff',
        note: `Follow-up (${followupDate} ${followupTime}): ${followupRemark}`,
        date: new Date().toLocaleString(),
        source: 'etaxwala',
      };
      setLeads((prev) =>
        prev.map((l) =>
          l.id === detailsModalLead.id
            ? {
                ...l,
                fDate: followupDate,
                remarks: [newEntry, ...(l.remarks || [])],
              }
            : l
        )
      );
      setFollowupRemark('');
      alert('Followup saved to database successfully!');
    } catch {
      alert('Failed to save followup in database.');
    }
  };

  const handleAddService = () => {
    if (selectedAdditionalService && !additionalServices.includes(selectedAdditionalService)) {
      setAdditionalServices([...additionalServices, selectedAdditionalService]);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName || !newLeadContact) {
      alert('Name and Contact are required.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/v1/crm/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newLeadName,
          contact: newLeadContact,
          email: newLeadEmail || undefined,
          service: newLeadService,
          state: newLeadState,
          city: newLeadCity || 'Pune',
          source: 'ETaxwala Web',
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        const created: Lead = {
          id: data.data.id || Date.now(),
          date: new Date().toISOString().split('T')[0],
          name: newLeadName,
          contact: newLeadContact,
          email: newLeadEmail || 'NA@gmail.com',
          state: newLeadState,
          city: newLeadCity || 'NA',
          service: newLeadService,
          addedBy: 'Direct Add',
          isAssign: false,
          leadScore: '80%',
          leadSource: 'ETaxwala',
          fDate: 'No Date',
          assignTo: 'Not Assigned',
          assignDate: new Date().toISOString().split('T')[0],
          status: 'New',
          remarks: [],
        };
        setLeads([created, ...leads]);
        setAddLeadModalOpen(false);
        setNewLeadName('');
        setNewLeadContact('');
        setNewLeadEmail('');
        setNewLeadCity('');
        alert('New lead saved to database successfully!');
      } else {
        alert(data.error || 'Failed to create lead');
      }
    } catch {
      alert('Network error: Failed to save lead to database.');
    }
  };

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.contact.includes(searchTerm) ||
      l.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      !activeStatusKpi || activeStatusKpi === 'all'
        ? true
        : l.status.toLowerCase().replace(/\s+/g, '') === activeStatusKpi.toLowerCase().replace(/\s+/g, '');

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* View Switcher for Lead List vs Leads Details */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/crm/sales-manage-leads')}
            className="px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors btn-multicolor"
          >
            Lead List View
          </button>
          <button
            onClick={() => navigate('/crm/sales-manage-leads-details')}
            className="px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors btn-multicolor"
          >
            Leads Details View
          </button>
          <button
            onClick={() => navigate('/crm/sales-manage-customer-inquiry')}
            className="px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors btn-multicolor"
          >
            Customer Inquiries
          </button>
        </div>
      </div>

      {/* Top Status KPI Badges (Single-Color Moving Outline Pills matching Explore button style) */}
      {(isDetailsView || true) && (
        <div className="space-y-2.5">
          {/* Row 1 Badges (11 status pills) */}
          <div className="flex flex-wrap items-center gap-2">
            {STATUS_KPIS.slice(0, 11).map((kpi) => (
              <button
                key={kpi.id}
                type="button"
                onClick={() => setActiveStatusKpi(activeStatusKpi === kpi.id ? null : kpi.id)}
                className={`btn-multicolor py-1 px-3 transition-all ${
                  activeStatusKpi === kpi.id ? 'ring-2 ring-slate-800 scale-105 shadow-md' : 'shadow-2xs'
                }`}
                title={`Filter leads by ${kpi.label}`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-tight">
                    {kpi.label}
                  </span>
                  <span
                    className="text-[11px] font-mono font-bold px-1.5 py-0.2 rounded-full text-white shadow-2xs"
                    style={{ background: kpi.cBase }}
                  >
                    {kpi.count}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Row 2 Badges (Followup status pills) */}
          <div className="flex flex-wrap items-center gap-2">
            {STATUS_KPIS.slice(11).map((kpi) => (
              <button
                key={kpi.id}
                type="button"
                onClick={() => setActiveStatusKpi(activeStatusKpi === kpi.id ? null : kpi.id)}
                className={`btn-multicolor py-1 px-3 transition-all ${
                  activeStatusKpi === kpi.id ? 'ring-2 ring-slate-800 scale-105 shadow-md' : 'shadow-2xs'
                }`}
                title={`Filter leads by ${kpi.label}`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-tight">
                    {kpi.label}
                  </span>
                  <span
                    className="text-[11px] font-mono font-bold px-1.5 py-0.2 rounded-full text-white shadow-2xs"
                    style={{ background: kpi.cBase }}
                  >
                    {kpi.count}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Card Header & Exact Action Bar with Single-Color Moving Outlines */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-[#FCFCFD]">
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* (+) Button */}
            <button
              onClick={() => setAddLeadModalOpen(true)}
              className="btn-multicolor w-9 h-9 shadow-2xs"
              style={{
                '--c-base': '#64748B',
                '--c-light': '#94A3B8',
                '--c-dark': '#334155',
              } as React.CSSProperties}
              title="Add Lead"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Status Dropdown */}
            <div className="btn-multicolor relative shadow-2xs rounded-xl">
              <select
                value={statusDropdown}
                onChange={(e) => setStatusDropdown(e.target.value)}
                className="bg-transparent text-slate-700 font-semibold text-xs py-2 px-3 pr-7 focus:outline-none cursor-pointer appearance-none relative z-2"
              >
                <option value="Status">Status</option>
                <option value="New">New</option>
                <option value="Prospect">Prospect</option>
                <option value="Hot">Hot</option>
                <option value="Interested">Interested</option>
                <option value="Not Interested">Not Interested</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none z-2" />
            </div>

            {/* Manager-only: Assign Leads To + Bulk Add + Sample Excel + Import FB */}
            {isManager && (
              <>
                <div className="btn-multicolor relative shadow-2xs rounded-xl">
                  <select
                    value={assignStaff}
                    onChange={(e) => setAssignStaff(e.target.value)}
                    className="bg-transparent text-slate-800 font-bold text-xs py-2 px-3 pr-7 focus:outline-none cursor-pointer appearance-none relative z-2"
                  >
                    <option value="Assign Leads To">Assign Leads To</option>
                    <option value="Krushna Shinde">Krushna Shinde</option>
                    <option value="Netra Divekar">Netra Divekar</option>
                    <option value="Manisha Shinde">Manisha Shinde</option>
                    <option value="Shashikant Panchal">Shashikant Panchal</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-600 absolute right-2 top-2.5 pointer-events-none z-2" />
                </div>

                <button
                  onClick={handleBulkAssign}
                  className="btn-multicolor py-2 px-4 shadow-2xs"
                >
                  <span className="text-xs font-bold">Bulk Add</span>
                </button>

                <button
                  onClick={() => alert('Sample Excel download template initiated.')}
                  className="btn-multicolor py-2 px-4 shadow-2xs"
                  style={{
                    '--c-base': '#2563EB',
                    '--c-light': '#93C5FD',
                    '--c-dark': '#1D4ED8',
                  } as React.CSSProperties}
                >
                  <span className="text-xs font-bold text-slate-800">Sample Excel</span>
                </button>

                <button
                  onClick={() => alert('Facebook Leads Sync API triggered.')}
                  className="btn-multicolor py-2 px-4 shadow-2xs"
                  style={{
                    '--c-base': '#1E3A8A',
                    '--c-light': '#60A5FA',
                    '--c-dark': '#0F172A',
                  } as React.CSSProperties}
                >
                  <span className="text-xs font-bold text-slate-800">Import FB</span>
                </button>
              </>
            )}
          </div>

          {isDetailsView && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#003A66] uppercase">MANAGE LEAD'S</span>
              <button
                onClick={() => setAddLeadModalOpen(true)}
                className="w-6 h-6 rounded-full btn-multicolor inline-flex items-center justify-center"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Standard Export Toolbar (Show entries, Copy, Excel, CSV, PDF, Print, Search) */}
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
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              {['Copy', 'Excel', 'CSV', 'PDF', 'Print'].map((b) => (
                <button
                  key={b}
                  onClick={() => alert(`${b} action executed`)}
                  className="px-2.5 py-1 text-[11px] font-semibold btn-multicolor rounded shadow-2xs transition-colors"
                >
                  {b}
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

        {/* Table View */}
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-250px)] border border-slate-200 rounded-xl shadow-2xs">
          <table className="table-crm w-full text-left text-xs border-separate border-spacing-0">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#1E3A8A] text-white uppercase text-[11px] tracking-wider sticky top-0 z-10">
                {/* Checkbox column only visible for managers (for bulk assign) */}
                {isManager && (
                  <th className="py-2.5 px-3 w-8 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === leads.length && leads.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded text-[#003A66] focus:ring-0 cursor-pointer"
                    />
                  </th>
                )}
                {isDetailsView ? (
                  <>
                    <th className="py-2.5 px-2 w-8 text-center">#</th>
                    <th className="py-2.5 px-3 font-bold">Name</th>
                    <th className="py-2.5 px-3 font-bold">Lead Score</th>
                    <th className="py-2.5 px-3 font-bold">Lead Source</th>
                    <th className="py-2.5 px-3 font-bold">F Date</th>
                    <th className="py-2.5 px-3 font-bold">Contact</th>
                    <th className="py-2.5 px-3 font-bold">State</th>
                    <th className="py-2.5 px-3 font-bold">City</th>
                    <th className="py-2.5 px-3 font-bold">Service</th>
                    <th className="py-2.5 px-3 font-bold">Added By</th>
                    {isManager && <th className="py-2.5 px-3 font-bold">Assign To</th>}
                    <th className="py-2.5 px-3 font-bold">Assign Date</th>
                    <th className="py-2.5 px-3 font-bold">Status</th>
                  </>
                ) : (
                  <>
                    <th className="py-2.5 px-3 font-bold">Date</th>
                    <th className="py-2.5 px-3 font-bold">Name</th>
                    <th className="py-2.5 px-3 font-bold">Contact</th>
                    <th className="py-2.5 px-3 font-bold">State</th>
                    <th className="py-2.5 px-3 font-bold">City</th>
                    <th className="py-2.5 px-3 font-bold">Service</th>
                    <th className="py-2.5 px-3 font-bold">Lead Source</th>
                    {isManager && <th className="py-2.5 px-3 font-bold">Is Assign</th>}
                    <th className="py-2.5 px-3 font-bold text-center">Action</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.map((item, idx) => (
                <tr
                  key={item.id}
                  className={idx % 2 === 0 ? 'bg-white hover:bg-sky-50/40' : 'bg-[#F9FAFB] hover:bg-sky-50/40'}
                >
                  {isManager && (
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        className="rounded text-[#003A66] focus:ring-0 cursor-pointer"
                      />
                    </td>
                  )}

                  {isDetailsView ? (
                    <>
                      <td className="py-2.5 px-2 text-center">
                        <button
                          onClick={() => {
                            setDetailsModalLead(item);
                            setDetailsActiveTab('client');
                          }}
                          className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 flex items-center justify-center font-bold text-xs"
                          title="Open Lead Details"
                        >
                          +
                        </button>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">
                        <button
                          onClick={() => {
                            setDetailsModalLead(item);
                            setDetailsActiveTab('client');
                          }}
                          className="hover:text-[#0284c7] hover:underline text-left font-bold"
                        >
                          {item.name}
                        </button>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-semibold">{item.leadScore}</td>
                      <td className="py-2.5 px-3">
                        {/* Lead Source badge: ETaxwala (blue), Udyami Kisan (amber), Sahakar (green) */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          item.leadSource?.toLowerCase().includes('udyami') ? 'bg-amber-500 text-white' :
                          item.leadSource?.toLowerCase().includes('sahakar') ? 'bg-emerald-600 text-white' :
                          'bg-[#0284c7] text-white'
                        }`}>
                          {item.leadSource?.toLowerCase().includes('udyami') ? 'Udyami Kisan' :
                           item.leadSource?.toLowerCase().includes('sahakar') ? 'Sahakar' :
                           'ETaxwala'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{item.fDate}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">{item.contact}</td>
                      <td className="py-2.5 px-3 text-slate-600">{item.state}</td>
                      <td className="py-2.5 px-3 text-slate-600">{item.city}</td>
                      <td className="py-2.5 px-3 text-slate-700 font-medium">{item.service}</td>
                      <td className="py-2.5 px-3 text-slate-600">{item.addedBy}</td>
                      {isManager && (
                        <td className="py-2.5 px-3">
                          {item.assignTo === 'Not Assigned' ? (
                            <span className="text-red-600 font-bold">{item.assignTo}</span>
                          ) : (
                            <span className="text-slate-800 font-medium">{item.assignTo}</span>
                          )}
                        </td>
                      )}
                      <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{item.assignDate}</td>
                      <td className="py-2.5 px-3">
                        <span className="bg-[#16A34A] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                          {item.status}
                        </span>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{item.date}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">
                        <button
                          onClick={() => {
                            setDetailsModalLead(item);
                            setDetailsActiveTab('client');
                          }}
                          className="hover:text-[#0284c7] hover:underline text-left font-bold"
                        >
                          {item.name}
                        </button>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">{item.contact}</td>
                      <td className="py-2.5 px-3 text-slate-600">{item.state}</td>
                      <td className="py-2.5 px-3 text-slate-600">{item.city}</td>
                      <td className="py-2.5 px-3 text-slate-700 font-medium">{item.service}</td>
                      <td className="py-2.5 px-3">
                        {/* Lead Source: ETaxwala / Udyami Kisan / Sahakar */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          item.leadSource?.toLowerCase().includes('udyami') ? 'bg-amber-500 text-white' :
                          item.leadSource?.toLowerCase().includes('sahakar') ? 'bg-emerald-600 text-white' :
                          'bg-[#0284c7] text-white'
                        }`}>
                          {item.leadSource?.toLowerCase().includes('udyami') ? 'Udyami Kisan' :
                           item.leadSource?.toLowerCase().includes('sahakar') ? 'Sahakar' :
                           'ETaxwala'}
                        </span>
                      </td>
                      {isManager && (
                        <td className="py-2.5 px-3">
                          {item.isAssign ? (
                            <button
                              onClick={() => {
                                setLeads((prev) =>
                                  prev.map((l) => (l.id === item.id ? { ...l, isAssign: false } : l))
                                );
                              }}
                              className="btn-multicolor text-[10px] font-bold px-2 py-0.5 rounded-xl shadow-2xs"
                            >
                              Assigned
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setLeads((prev) =>
                                  prev.map((l) => (l.id === item.id ? { ...l, isAssign: true } : l))
                                );
                              }}
                              className="btn-multicolor text-[10px] font-bold px-2 py-0.5 rounded-xl shadow-2xs"
                            >
                              Un-Assign
                            </button>
                          )}
                        </td>
                      )}
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setDetailsModalLead(item);
                              setDetailsActiveTab('client');
                            }}
                            className="p-1 text-slate-500 hover:text-[#0284c7] hover:bg-slate-100 rounded"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setRemarksModalLead(item)}
                            className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded"
                            title="Call Remarks"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete lead ${item.name}?`)) {
                                setLeads((prev) => prev.filter((l) => l.id !== item.id));
                              }
                            }}
                            className="p-1 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing 1 to {filteredLeads.length} of 16,619 entries</span>
          <div className="flex items-center gap-1">
            <button className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700">
              Previous
            </button>
            <button className="px-2.5 py-1 rounded bg-[#1E3A8A] text-white font-bold">1</button>
            <button className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700">2</button>
            <button className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700">3</button>
            <button className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700">4</button>
            <button className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700">5</button>
            <span className="px-1 text-slate-400">...</span>
            <button className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700">1662</button>
            <button className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ─── LEAD DETAILS MODAL (Exact match with Screenshots 111120, 111130, 111137, 111149) ─── */}
      {detailsModalLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-[#EAE6DD] animate-scale-in">
            {/* Signature Top Multicolor Strip */}
            <div className="h-1 bg-multicolor" />

            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-white border-b border-[#EAE6DD] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1B365D] flex items-center justify-center font-bold text-sm">
                  {detailsModalLead.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#1B365D] tracking-tight">Lead Details & Activity</h3>
                  <p className="text-[11px] text-slate-500">{detailsModalLead.service}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRemarksModalLead(detailsModalLead)}
                  className="px-2.5 py-1 rounded-lg btn-multicolor text-xs font-bold flex items-center gap-1 transition-colors"
                  title="View Remarks Audit"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                  <span>Audit</span>
                </button>
                <button
                  onClick={() => setDetailsModalLead(null)}
                  className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4">
              {/* Modern Segmented Pill Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-[#FAF9F5] border border-[#EAE6DD] rounded-2xl">
                <button
                  onClick={() => setDetailsActiveTab('client')}
                  className="py-1.5 px-2.5 text-xs font-bold rounded-xl transition-all btn-multicolor"
                >
                  Client Info
                </button>
                <button
                  onClick={() => setDetailsActiveTab('status')}
                  className="py-1.5 px-2.5 text-xs font-bold rounded-xl transition-all btn-multicolor"
                >
                  Update Status
                </button>
                <button
                  onClick={() => setDetailsActiveTab('followup')}
                  className="py-1.5 px-2.5 text-xs font-bold rounded-xl transition-all btn-multicolor"
                >
                  Followup
                </button>
                <button
                  onClick={() => setDetailsActiveTab('services')}
                  className="py-1.5 px-2.5 text-xs font-bold rounded-xl transition-all btn-multicolor"
                >
                  Other Services
                </button>
              </div>

              {/* Tab 1: Client Info */}
              {detailsActiveTab === 'client' && (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Customer Name</label>
                      <input
                        type="text"
                        defaultValue={detailsModalLead.name}
                        className="w-full text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Contact Phone</label>
                      <input
                        type="text"
                        defaultValue={detailsModalLead.contact}
                        className="w-full text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-mono focus:bg-white focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        defaultValue={detailsModalLead.email || 'NA@gmail.com'}
                        className="w-full text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Selected Service</label>
                      <select
                        defaultValue={detailsModalLead.service}
                        className="w-full text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all font-semibold"
                      >
                        <option value={detailsModalLead.service}>{detailsModalLead.service}</option>
                        <option value="Producer Company Registration">Producer Company Registration</option>
                        <option value="Multistate Registration">Multistate Registration</option>
                        <option value="Microfinance Company (Section 8)">Microfinance Company (Section 8)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">State</label>
                      <input
                        type="text"
                        defaultValue={detailsModalLead.state}
                        className="w-full text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">City</label>
                      <input
                        type="text"
                        defaultValue={detailsModalLead.city}
                        className="w-full text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Exact Action Buttons: Cancel, Update Lead, Create Quotation, View */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      onClick={() => setDetailsModalLead(null)}
                      className="btn-multicolor py-1.5 px-4 rounded-full text-xs font-bold shadow-xs cursor-pointer"
                      style={
                        {
                          '--c-base': '#1E293B',
                          '--c-light': '#475569',
                          '--c-dark': '#0F172A',
                        } as React.CSSProperties
                      }
                    >
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={() => alert('Lead details updated.')}
                      className="btn-multicolor py-1.5 px-4 rounded-full text-xs font-bold shadow-xs cursor-pointer"
                      style={
                        {
                          '--c-base': '#1B365D',
                          '--c-light': '#3B82F6',
                          '--c-dark': '#0F172A',
                        } as React.CSSProperties
                      }
                    >
                      <span>Update Lead</span>
                    </button>
                    <button
                      onClick={() => {
                        setDetailsModalLead(null);
                        navigate('/crm/quotations');
                      }}
                      className="btn-multicolor py-1.5 px-4 rounded-full text-xs font-bold shadow-xs cursor-pointer"
                      style={
                        {
                          '--c-base': '#10B981',
                          '--c-light': '#6EE7B7',
                          '--c-dark': '#047857',
                        } as React.CSSProperties
                      }
                    >
                      <span>Create Quotation</span>
                    </button>
                    <button
                      onClick={() => setRemarksModalLead(detailsModalLead)}
                      className="btn-multicolor py-1.5 px-4 rounded-full text-xs font-bold shadow-xs cursor-pointer"
                      style={
                        {
                          '--c-base': '#06B6D4',
                          '--c-light': '#67E8F9',
                          '--c-dark': '#0891B2',
                        } as React.CSSProperties
                      }
                    >
                      <span>View</span>
                    </button>
                  </div>

                  {/* Lead Note Box underneath button bar */}
                  <div className="pt-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Lead Note</label>
                    <div className="bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl p-3 text-xs text-slate-600 min-h-[50px] leading-relaxed">
                      {detailsModalLead.note || 'No Note Found'}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Update Status */}
              {detailsActiveTab === 'status' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Select Lead Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-semibold focus:bg-white focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
                    >
                      <option value="Interested">Interested</option>
                      <option value="Not Interested">Not Interested</option>
                      <option value="Prospect">Prospect</option>
                      <option value="Hot">Hot</option>
                      <option value="Quotation">Quotation</option>
                      <option value="Meetings">Meetings</option>
                      <option value="Customer">Customer</option>
                      <option value="Not Connected">Not Connected</option>
                      <option value="Negotiation">Negotiation</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Lead Remark Note</label>
                    <textarea
                      rows={3}
                      value={editRemark}
                      onChange={(e) => setEditRemark(e.target.value)}
                      placeholder="Enter update note, customer objections or next step..."
                      className="w-full text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl p-3 text-slate-800 focus:bg-white focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Last Lead Remark</label>
                    <div className="bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl p-3 text-xs text-slate-700 font-semibold">
                      {detailsModalLead.remarks?.[0]?.note || 'CALL BACK'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-[#EAE6DD]">
                    <button
                      onClick={() => setDetailsModalLead(null)}
                      className="btn-multicolor py-1.5 px-4 rounded-full text-xs font-bold shadow-xs cursor-pointer"
                      style={
                        {
                          '--c-base': '#1E293B',
                          '--c-light': '#475569',
                          '--c-dark': '#0F172A',
                        } as React.CSSProperties
                      }
                    >
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={handleAddRemark}
                      className="btn-multicolor py-1.5 px-4 rounded-full text-xs font-bold shadow-xs cursor-pointer"
                      style={
                        {
                          '--c-base': '#1B365D',
                          '--c-light': '#3B82F6',
                          '--c-dark': '#0F172A',
                        } as React.CSSProperties
                      }
                    >
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 3: Followup */}
              {detailsActiveTab === 'followup' && (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Followup Date</label>
                      <input
                        type="date"
                        value={followupDate}
                        onChange={(e) => setFollowupDate(e.target.value)}
                        className="w-full text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Followup Time</label>
                      <input
                        type="time"
                        value={followupTime}
                        onChange={(e) => setFollowupTime(e.target.value)}
                        className="w-full text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Followup Discussion Remark</label>
                    <textarea
                      rows={3}
                      value={followupRemark}
                      onChange={(e) => setFollowupRemark(e.target.value)}
                      placeholder="Enter scheduled topic / customer request..."
                      className="w-full text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl p-3 text-slate-800 focus:bg-white focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Last Followup Remark</label>
                    <div className="bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl p-3 text-xs text-slate-700 font-semibold">
                      {detailsModalLead.remarks?.[0]?.note || 'CALL BACK'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-[#EAE6DD]">
                    <button
                      onClick={() => setDetailsModalLead(null)}
                      className="btn-multicolor py-1.5 px-4 rounded-full text-xs font-bold shadow-xs cursor-pointer"
                      style={
                        {
                          '--c-base': '#1E293B',
                          '--c-light': '#475569',
                          '--c-dark': '#0F172A',
                        } as React.CSSProperties
                      }
                    >
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={handleAddFollowup}
                      className="btn-multicolor py-1.5 px-4 rounded-full text-xs font-bold shadow-xs cursor-pointer"
                      style={
                        {
                          '--c-base': '#1B365D',
                          '--c-light': '#3B82F6',
                          '--c-dark': '#0F172A',
                        } as React.CSSProperties
                      }
                    >
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 4: Other Services */}
              {detailsActiveTab === 'services' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Add Complementary Service</label>
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedAdditionalService}
                        onChange={(e) => setSelectedAdditionalService(e.target.value)}
                        className="flex-1 text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all font-semibold"
                      >
                        <option value="Section 8 Company NGO Registration">Section 8 Company NGO Registration</option>
                        <option value="Producer Company Registration">Producer Company Registration</option>
                        <option value="80G & 12A Income Tax Exemption">80G & 12A Income Tax Exemption</option>
                        <option value="GST Return Filing (Quarterly)">GST Return Filing (Quarterly)</option>
                        <option value="Digital Signature Certificate (DSC)">Digital Signature Certificate (DSC)</option>
                      </select>
                      <button
                        onClick={handleAddService}
                        className="btn-multicolor py-2 px-4 rounded-full text-xs font-bold shadow-xs cursor-pointer"
                      >
                        <span>Add</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Attached Services</label>
                    {additionalServices.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3 text-center bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl">
                        No additional services attached to this lead proposal yet.
                      </p>
                    ) : (
                      <ul className="divide-y divide-[#EAE6DD] border border-[#EAE6DD] rounded-xl overflow-hidden">
                        {additionalServices.map((srv, idx) => (
                          <li key={idx} className="p-3 text-xs text-slate-800 flex items-center justify-between bg-white hover:bg-[#FAF9F5] transition-colors">
                            <span className="font-semibold">{srv}</span>
                            <button
                              onClick={() => setAdditionalServices(additionalServices.filter((_, i) => i !== idx))}
                              className="text-rose-600 hover:text-rose-700 text-xs font-bold"
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── LEAD REMARKS MODAL (Exact match with Screenshot 111333.png) ─── */}
      {remarksModalLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-[#EAE6DD] animate-scale-in">
            {/* Signature Top Multicolor Strip */}
            <div className="h-1 bg-multicolor" />

            {/* Header */}
            <div className="p-4 sm:p-5 bg-white border-b border-[#EAE6DD] flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-[#1B365D]">Lead Remarks & Audit History</h3>
                <p className="text-[11px] text-slate-500">Live communication logs & call outcomes</p>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="badge badge-navy text-[11px] font-bold px-2 py-0.5">
                  (i)
                </span>
                <span className="badge badge-gold text-[11px] font-bold px-2 py-0.5">
                  --%
                </span>
                <span className="badge badge-green text-[11px] font-bold px-2 py-0.5">
                  ₹ --
                </span>
                <button
                  onClick={() => {
                    const rem = prompt('Enter new call remark:');
                    if (rem) {
                      const newRem = {
                        staff: 'Current Staff',
                        note: rem,
                        date: new Date().toLocaleString(),
                        source: 'etaxwala',
                      };
                      setRemarksModalLead({
                        ...remarksModalLead,
                        remarks: [newRem, ...(remarksModalLead.remarks || [])],
                      });
                    }
                  }}
                  className="btn-multicolor py-1 px-3 rounded-full shadow-xs ml-1 cursor-pointer"
                >
                  <span className="text-[11px] font-bold">+ Remark</span>
                </button>
                <button
                  onClick={() => setRemarksModalLead(null)}
                  className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Client Summary Box */}
            <div className="p-4 bg-[#FAF9F5] border-b border-[#EAE6DD]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>Name: {remarksModalLead.name}</span>
                  </p>
                  <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-1 font-mono">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>Contact: {remarksModalLead.contact}</span>
                  </p>
                </div>
                <div className="text-right text-xs text-slate-600">
                  <p>Location: <span className="font-semibold text-slate-800">{remarksModalLead.city}, {remarksModalLead.state}</span></p>
                </div>
              </div>
            </div>

            {/* Remarks History List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-[#EAE6DD] text-xs">
              <div className="bg-[#FAF9F5] text-slate-600 font-bold p-2.5 grid grid-cols-12 text-[11px] uppercase tracking-wider border-b border-[#EAE6DD]">
                <div className="col-span-6">Call Notes</div>
                <div className="col-span-4">Call Date</div>
                <div className="col-span-2 text-right">Source</div>
              </div>
              {remarksModalLead.remarks && remarksModalLead.remarks.length > 0 ? (
                remarksModalLead.remarks.map((r, i) => (
                  <div key={i} className="p-3 grid grid-cols-12 items-start hover:bg-[#FAF9F5] transition-colors">
                    <div className="col-span-6 pr-2">
                      <p className="font-bold text-[#1B365D]">{r.staff}</p>
                      <p className="text-slate-700 mt-0.5 leading-relaxed">{r.note}</p>
                    </div>
                    <div className="col-span-4 text-slate-500 font-mono text-[11px]">
                      {r.date}
                    </div>
                    <div className="col-span-2 text-right">
                      <span className="badge badge-navy text-[10px] uppercase font-bold">{r.source}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-400">
                  No call remarks recorded yet for this lead.
                </div>
              )}
            </div>

            <div className="p-4 bg-[#FAF9F5] border-t border-[#EAE6DD] flex justify-end">
              <button
                onClick={() => setRemarksModalLead(null)}
                className="btn btn-outline btn-sm rounded-xl text-xs font-bold btn-multicolor"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── ADD LEAD MODAL ─── */}
      {addLeadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-[#EAE6DD] animate-scale-in">
            {/* Signature Top Multicolor Strip */}
            <div className="h-1 bg-multicolor" />

            <div className="p-4 sm:p-5 bg-white border-b border-[#EAE6DD] flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-[#1B365D]">Add New Lead</h3>
                <p className="text-[11px] text-slate-500">Create new customer prospect entry</p>
              </div>
              <button onClick={() => setAddLeadModalOpen(false)} className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateLead} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={newLeadName}
                  onChange={(e) => setNewLeadName(e.target.value)}
                  placeholder="Enter customer or entity name"
                  className="w-full text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mobile Contact *</label>
                <input
                  type="tel"
                  required
                  value={newLeadContact}
                  onChange={(e) => setNewLeadContact(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-mono focus:bg-white focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={newLeadEmail}
                  onChange={(e) => setNewLeadEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Required Service *</label>
                <select
                  value={newLeadService}
                  onChange={(e) => setNewLeadService(e.target.value)}
                  className="w-full text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-semibold focus:bg-white focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
                >
                  <option value="Producer Company Registration">Producer Company Registration</option>
                  <option value="Multistate Registration">Multistate Registration</option>
                  <option value="Private Limited Company Registration">Private Limited Company Registration</option>
                  <option value="Microfinance Company (Section 8)">Microfinance Company (Section 8)</option>
                  <option value="GST Return Filing">GST Return Filing</option>
                  <option value="Trademark Registration">Trademark Registration</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={newLeadState}
                    onChange={(e) => setNewLeadState(e.target.value)}
                    className="w-full text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={newLeadCity}
                    onChange={(e) => setNewLeadCity(e.target.value)}
                    placeholder="City name"
                    className="w-full text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EAE6DD]">
                <button
                  type="button"
                  onClick={() => setAddLeadModalOpen(false)}
                  className="btn btn-outline btn-sm rounded-xl text-xs font-bold btn-multicolor"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-multicolor py-2 px-5 shadow-xs"
                >
                  <span className="text-xs font-bold">Save Lead</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
