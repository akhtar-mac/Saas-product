import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { RoleType } from '@etaxwala/types';
import { Plus, Phone, ChevronDown, X, User } from 'lucide-react';

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
  followupRemarks?: { date: string; remark: string; staff: string }[];
  note?: string;
  quotedPrice?: string;
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
      {
        staff: 'Krushna Shinde',
        note: 'CALL NOT REC...',
        date: '11/7/2026, 5:31:32 pm',
        source: 'etaxwala',
      },
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
      {
        staff: 'Krushna Shinde',
        note: 'CALL NOT REC...',
        date: '9/7/2026, 4:11:34 pm',
        source: 'etaxwala',
      },
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
      {
        staff: 'Krushna Shinde',
        note: 'HE SAID COME TO OFFICE',
        date: '7/7/2026, 2:43:01 pm',
        source: 'etaxwala',
      },
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
      {
        staff: 'Krushna Shinde',
        note: 'ASK FOR STATEMENTS...',
        date: '17/6/2026, 7:20:02 pm',
        source: 'etaxwala',
      },
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
      {
        staff: 'Krushna Shinde',
        note: 'CALL NOT REC...',
        date: '11/7/2026, 5:31:32 pm',
        source: 'etaxwala',
      },
      {
        staff: 'Krushna Shinde',
        note: 'CALL NOT REC...',
        date: '9/7/2026, 4:11:34 pm',
        source: 'etaxwala',
      },
      {
        staff: 'Krushna Shinde',
        note: 'HE SAID COME TO OFFICE',
        date: '7/7/2026, 2:43:01 pm',
        source: 'etaxwala',
      },
      {
        staff: 'Krushna Shinde',
        note: 'ASK FOR STATEMENTS...',
        date: '17/6/2026, 7:20:02 pm',
        source: 'etaxwala',
      },
      {
        staff: 'Krushna Shinde',
        note: 'Follow-up: CALL BACK',
        date: '18/7/2026, 6:28:22 pm',
        source: 'etaxwala',
      },
      {
        staff: 'Krushna Shinde',
        note: 'Follow-up: CALL BACK',
        date: '14/7/2026, 5:23:01 pm',
        source: 'etaxwala',
      },
      {
        staff: 'Krushna Shinde',
        note: 'Follow-up: CALL BACK',
        date: '13/7/2026, 6:20:13 pm',
        source: 'etaxwala',
      },
      {
        staff: 'Krushna Shinde',
        note: 'Follow-up: CALL BACK',
        date: '11/7/2026, 5:31:41 pm',
        source: 'etaxwala',
      },
    ],
  },
];

// Status KPIs — numeric IDs 0-10 match backend STATUS_KEY_MAP
const STATUS_KPIS = [
  { id: 'all', label: 'Total', cBase: '#1B365D' },
  { id: 0, label: 'New', cBase: '#10B981' },
  { id: 1, label: 'Not Intrested', cBase: '#EF4444' },
  { id: 2, label: 'Intrested', cBase: '#06B6D4' },
  { id: 3, label: 'Quotation', cBase: '#7C3AED' },
  { id: 4, label: 'Hot', cBase: '#EA580C' },
  { id: 5, label: 'Customer', cBase: '#8B5CF6' },
  { id: 6, label: 'Not Connected', cBase: '#6366F1' },
  { id: 7, label: 'Negotiation', cBase: '#A855F7' },
  { id: 8, label: 'Prospected', cBase: '#059669' },
  { id: 9, label: 'Cust. Followup', cBase: '#D97706' },
  { id: 10, label: 'Meetings', cBase: '#4F46E5' },
];

const FOLLOWUP_FILTERS = [
  { id: 'today', label: "Today's Followup", cBase: '#0EA5E9' },
  { id: 'tomorrow', label: "Tomorrow's Followup", cBase: '#3730A3' },
  { id: 'dayafter', label: 'Day After Tomorrow', cBase: '#312E81' },
];

export default function CrmLeadsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { staffUser, activeRole } = useAuthStore();

  // Mode: 'list' (Lead List) vs 'details' (Leads Details) vs 'inquiry' (Customer Inquiries)
  const isDetailsView =
    location.pathname.includes('details') || location.search.includes('view=details');
  const isInquiryView =
    location.pathname.includes('inquiry') || location.search.includes('view=inquiry');

  // Role-based visibility — Sales Employees have restricted view (no bulk assign, no selection)
  const isSalesEmployee = activeRole === RoleType.SALES_EMPLOYEE;
  const isManager = !isSalesEmployee; // Manager / Admin can assign leads to other staff
  const activeStaffName =
    staffUser?.username ||
    (staffUser as any)?.name ||
    (isSalesEmployee ? 'Sales Employee' : 'Sales Manager');
  const activeUserId = staffUser?.id || 1;

  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [activeStatusKpi, setActiveStatusKpi] = useState<number | 'all' | null>(null);
  const [activeFollowup, setActiveFollowup] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(''); // debounced version for API
  const [pageSize, setPageSize] = useState<number | 'all'>(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [kpiCounts, setKpiCounts] = useState<Record<string | number, number>>({});
  const [assignStaff, setAssignStaff] = useState('Assign Leads To');
  const [statusDropdown, setStatusDropdown] = useState('Status');
  const [selectedSource, setSelectedSource] = useState(() => {
    const s = new URLSearchParams(location.search).get('source');
    return s || 'ALL';
  });

  // Sync selectedSource with location.search whenever URL changes (e.g., via sidebar navigation)
  useEffect(() => {
    const urlSource = new URLSearchParams(location.search).get('source') || 'ALL';
    setSelectedSource(urlSource);
    setCurrentPage(1);
  }, [location.search]);

  // Modals
  const [detailsModalLead, setDetailsModalLead] = useState<Lead | null>(
    new URLSearchParams(location.search).get('modal') === '1' ? INITIAL_LEADS[0] : null
  );
  const [detailsActiveTab, setDetailsActiveTab] = useState<
    'client' | 'status' | 'followup' | 'services'
  >('client');
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
  const [selectedAdditionalService, setSelectedAdditionalService] = useState(
    'Section 8 Company NGO Registration'
  );
  const [additionalServices, setAdditionalServices] = useState<string[]>([]);

  // Remarks Modal In-place states & Service QA
  const [inModalRemark, setInModalRemark] = useState('');
  const [serviceQAModalOpen, setServiceQAModalOpen] = useState(false);
  const [qaFormAnswers, setQaFormAnswers] = useState<{ [key: string]: string }>({});
  const [hasServiceQuestions, setHasServiceQuestions] = useState(false);

  // Custom Wizard Modals
  const [leadScoreModalOpen, setLeadScoreModalOpen] = useState(false);
  const [scoreInputValue, setScoreInputValue] = useState('80');
  const [quotedPriceModalOpen, setQuotedPriceModalOpen] = useState(false);
  const [priceInputValue, setPriceInputValue] = useState('15000');

  // New lead form state
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadContact, setNewLeadContact] = useState('');
  const [newLeadEmail, setNewLeadEmail] = useState('');
  const [newLeadService, setNewLeadService] = useState('');
  const [newLeadState, setNewLeadState] = useState('Maharashtra');
  const [newLeadCity, setNewLeadCity] = useState('');
  const [newLeadTargetBrand, setNewLeadTargetBrand] = useState('etaxwala');
  const [availableServices, setAvailableServices] = useState<
    { id: string | number; name: string }[]
  >([]);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  // Sync target brand when selectedSource changes
  useEffect(() => {
    setNewLeadTargetBrand(selectedSource === 'ALL' ? 'etaxwala' : selectedSource);
  }, [selectedSource]);

  // Fetch dynamic services when target brand changes or modal opens
  useEffect(() => {
    const brandToFetch =
      newLeadTargetBrand || (selectedSource === 'ALL' ? 'etaxwala' : selectedSource);
    fetch(`${API_BASE}/v1/crm/services?source=${brandToFetch}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data?.data)) {
          const mapped = data.data.map((s: any) => ({
            id: s.service_id || s.id,
            name: s.service_name || s.name || `Service #${s.service_id}`,
          }));
          setAvailableServices(mapped);
          if (mapped.length > 0 && !newLeadService) {
            setNewLeadService(mapped[0].name);
          }
        }
      })
      .catch(() => {});
  }, [newLeadTargetBrand, selectedSource, addLeadModalOpen]);

  // Service questions availability for selected remarks lead
  useEffect(() => {
    if (remarksModalLead) {
      setHasServiceQuestions(true);
    } else {
      setHasServiceQuestions(false);
    }
  }, [remarksModalLead]);

  // Debounce search: wait 300ms after user stops typing before firing API call
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Fetch leads — uses AbortController to cancel stale requests
  useEffect(() => {
    const controller = new AbortController();
    setLoadingLeads(true);

    const params = new URLSearchParams();
    params.set('limit', pageSize === 'all' ? 'all' : String(pageSize));
    params.set('page', String(currentPage));
    if (selectedSource && selectedSource !== 'ALL') {
      params.set('source', selectedSource);
    }
    if (activeFollowup) {
      params.set('followup', activeFollowup);
    } else if (activeStatusKpi !== null && activeStatusKpi !== 'all') {
      params.set('status', String(activeStatusKpi));
    }
    if (debouncedSearch) params.set('search', debouncedSearch);
    // Sales employees only see their own assigned leads
    if (isSalesEmployee && activeUserId && activeUserId > 1) {
      params.set('assigned_to', String(activeUserId));
    }

    fetch(`${API_BASE}/v1/crm/leads?${params.toString()}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data?.data)) {
          const mapped: Lead[] = data.data.map((l: any, i: number) => ({
            id: Number(l.id) || i + 1,
            date: l.date?.split('T')[0] || '2026-09-04',
            name: l.name || 'Client Lead',
            contact: l.contact || '9876543210',
            email: l.email || '',
            state: l.state || 'Maharashtra',
            city: l.city || 'Pune',
            service: l.service || 'Business Registration',
            addedBy: l.addedBy || l.source || 'ETaxwala',
            isAssign: Boolean(l.isAssign),
            leadScore:
              l.leadScore ||
              (l.lead_score != null && Number(l.lead_score) > 0 ? `${l.lead_score}%` : 'N/A'),
            quotedPrice: l.quotedPrice
              ? String(l.quotedPrice)
              : l.quoted_price
                ? `₹${Number(l.quoted_price).toLocaleString()}`
                : 'N/A',
            leadSource: l.source || 'ETaxwala',
            fDate: l.followupDate || 'No Date',
            assignTo: l.assignTo || 'Not Assigned',
            assignDate: l.assignDate || l.date?.split('T')[0] || '',
            status: l.status || l.lead_status_name || 'New',
            note: l.note || '',
            remarks: [],
          }));
          setLeads(mapped);
          const pg = data.pagination;
          if (pg?.total != null) setTotalLeads(Number(pg.total));
          if (pg?.totalPages != null) setTotalPages(Number(pg.totalPages));
          else if (pg?.total != null) {
            const sz = pageSize === 'all' ? Number(pg.total) || 1 : Number(pageSize);
            setTotalPages(Math.max(1, Math.ceil(Number(pg.total) / sz)));
          }
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') console.error(err);
      })
      .finally(() => setLoadingLeads(false));

    // Cancel previous request when dependencies change
    return () => controller.abort();
  }, [
    activeStatusKpi,
    activeFollowup,
    currentPage,
    pageSize,
    debouncedSearch,
    selectedSource,
    refetchTrigger,
    isSalesEmployee,
    activeUserId,
  ]);

  // Fetch all KPI counts via single fast endpoint
  useEffect(() => {
    const countParams = new URLSearchParams();
    // Sales employees get counts scoped to their own assigned leads
    if (isSalesEmployee && activeUserId && activeUserId > 1) {
      countParams.set('assigned_to', String(activeUserId));
    }
    const countUrl = `${API_BASE}/v1/crm/leads/counts${countParams.toString() ? '?' + countParams.toString() : ''}`;
    fetch(countUrl)
      .then((r) => r.json())
      .then((data) => {
        if (data?.success && data.counts) setKpiCounts(data.counts);
      })
      .catch(() => {});
  }, [isSalesEmployee, activeUserId]);

  // Helper to parse staff names from remarks
  const parseRemarkItem = (r: any) => {
    const text = r.lead_remark || r.remark || '';
    const parts = text.split(' : ');
    let staffName = r.staff_name;
    let noteText = text;
    if (parts.length > 1 && parts[0].trim().length > 0 && parts[0].trim().length < 35) {
      if (!staffName || staffName.startsWith('Staff #') || staffName === 'Staff') {
        staffName = parts[0].trim();
      }
      noteText = parts.slice(1).join(' : ').trim();
    }
    if (!staffName || staffName.startsWith('Staff #')) staffName = 'Sales Staff';

    return {
      staff: staffName,
      note: noteText,
      date: r.date ? new Date(r.date).toLocaleString() : 'N/A',
      source: r.lead_source || r.source || 'etaxwala',
    };
  };

  // Fetch live remarks from DB when detailsModalLead is opened
  useEffect(() => {
    if (!detailsModalLead?.id) return;
    fetch(`${API_BASE}/v1/crm/leads/${detailsModalLead.id}/remarks`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData?.success) {
          const loadedRemarks = Array.isArray(resData?.data)
            ? resData.data.map(parseRemarkItem)
            : [];
          const loadedFollowups = Array.isArray(resData?.followups)
            ? resData.followups.map((f: any) => {
                const parsed = parseRemarkItem(f);
                return {
                  date: f.followup_date ? new Date(f.followup_date).toLocaleDateString() : 'N/A',
                  remark: parsed.note,
                  staff: parsed.staff,
                };
              })
            : [];

          setDetailsModalLead((prev) =>
            prev && prev.id === detailsModalLead.id
              ? {
                  ...prev,
                  remarks: loadedRemarks,
                  followupRemarks: loadedFollowups,
                  leadScore: resData.lead_score != null ? `${resData.lead_score}%` : prev.leadScore,
                  quotedPrice: resData.quoted_price ?? prev.quotedPrice,
                }
              : prev
          );
        }
      })
      .catch(() => {});
  }, [detailsModalLead?.id]);

  // Fetch live remarks from DB when remarksModalLead is opened
  useEffect(() => {
    if (!remarksModalLead?.id) return;
    fetch(`${API_BASE}/v1/crm/leads/${remarksModalLead.id}/remarks`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData?.success && Array.isArray(resData?.data)) {
          const loadedRemarks = resData.data.map(parseRemarkItem);
          const loadedFollowups = Array.isArray(resData?.followups)
            ? resData.followups.map((f: any) => {
                const parsed = parseRemarkItem(f);
                return {
                  date: f.followup_date ? new Date(f.followup_date).toLocaleDateString() : 'N/A',
                  remark: parsed.note,
                  staff: parsed.staff,
                };
              })
            : [];

          setRemarksModalLead((prev) =>
            prev && prev.id === remarksModalLead.id
              ? { ...prev, remarks: loadedRemarks, followupRemarks: loadedFollowups }
              : prev
          );
        }
      })
      .catch(() => {});
  }, [remarksModalLead?.id]);

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
            ? {
                ...l,
                assignTo: assignStaff,
                isAssign: true,
                assignDate: new Date().toLocaleString(),
              }
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
    if (!detailsModalLead) return;

    if (editStatus === 'Customer') {
      const targetLeadId = detailsModalLead.id;
      setDetailsModalLead(null);
      navigate(`/crm/leads/${targetLeadId}/won`);
      return;
    }

    if (!editRemark.trim()) return;
    try {
      await fetch(`${API_BASE}/v1/crm/leads/${detailsModalLead.id}/remarks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          remark: editRemark,
          user_id: activeUserId,
          user_name: activeStaffName,
          lead_source: detailsModalLead.leadSource || 'etaxwala',
        }),
      });

      await fetch(`${API_BASE}/v1/crm/calls/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: detailsModalLead.id,
          status: editStatus === 'Won' ? 4 : 1,
          remarks: editRemark,
        }),
      }).catch(() => {});

      await fetch(`${API_BASE}/v1/crm/leads/${detailsModalLead.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editStatus === 'Won' ? 4 : 1,
          note: editRemark,
        }),
      }).catch(() => {});

      const newEntry = {
        staff: activeStaffName,
        note: editRemark,
        date: new Date().toLocaleString(),
        source: detailsModalLead.leadSource || 'etaxwala',
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
      if (detailsModalLead) {
        setDetailsModalLead({
          ...detailsModalLead,
          status: editStatus,
          remarks: [newEntry, ...(detailsModalLead.remarks || [])],
        });
      }
      setEditRemark('');
      alert('Lead remark saved to database successfully!');
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
          user_id: activeUserId,
        }),
      });

      const newFollowupEntry = {
        date: followupDate,
        remark: followupRemark,
        staff: activeStaffName,
      };
      setLeads((prev) =>
        prev.map((l) => (l.id === detailsModalLead.id ? { ...l, fDate: followupDate } : l))
      );
      setDetailsModalLead({
        ...detailsModalLead,
        fDate: followupDate,
        followupRemarks: [newFollowupEntry, ...(detailsModalLead.followupRemarks || [])],
      });
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

  // ─── Lead Remarks Modal Handlers (Save Remark, Update Score, Update Price) ───
  const handleSaveInModalRemark = async () => {
    if (!inModalRemark.trim() || !remarksModalLead) return;
    try {
      await fetch(`${API_BASE}/v1/crm/leads/${remarksModalLead.id}/remarks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          remark: inModalRemark,
          user_id: activeUserId,
          user_name: activeStaffName,
          lead_source: remarksModalLead.leadSource || 'etaxwala',
        }),
      });
      const newRem = {
        staff: activeStaffName,
        note: inModalRemark,
        date: new Date().toLocaleString(),
        source: remarksModalLead.leadSource || 'etaxwala',
      };
      const updatedRemarks = [newRem, ...(remarksModalLead.remarks || [])];
      setRemarksModalLead({
        ...remarksModalLead,
        remarks: updatedRemarks,
      });
      setLeads((prev) =>
        prev.map((l) => (l.id === remarksModalLead.id ? { ...l, remarks: updatedRemarks } : l))
      );
      setInModalRemark('');
    } catch (err) {
      console.error(err);
      alert('Failed to save remark');
    }
  };

  const handleOpenLeadScoreModal = () => {
    if (!remarksModalLead) return;
    const current = remarksModalLead.leadScore ? remarksModalLead.leadScore.replace('%', '') : '80';
    setScoreInputValue(current);
    setLeadScoreModalOpen(true);
  };

  const handleSaveLeadScoreModal = async () => {
    if (!remarksModalLead) return;
    const scoreNum = parseInt(scoreInputValue, 10);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      alert('Please enter a valid percentage between 0 and 100');
      return;
    }
    try {
      await fetch(`${API_BASE}/v1/crm/leads/${remarksModalLead.id}/score`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_score: scoreNum }),
      });
      const newScore = `${scoreNum}%`;
      setRemarksModalLead((prev) => (prev ? { ...prev, leadScore: newScore } : null));
      setLeads((prev) =>
        prev.map((l) => (l.id === remarksModalLead.id ? { ...l, leadScore: newScore } : l))
      );
      setLeadScoreModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update lead score');
    }
  };

  const handleOpenQuotedPriceModal = () => {
    if (!remarksModalLead) return;
    const current = remarksModalLead.quotedPrice || '15000';
    setPriceInputValue(current);
    setQuotedPriceModalOpen(true);
  };

  const handleSaveQuotedPriceModal = async () => {
    if (!remarksModalLead) return;
    const priceNum = parseFloat(priceInputValue);
    if (isNaN(priceNum) || priceNum < 0) {
      alert('Please enter a valid price');
      return;
    }
    try {
      await fetch(`${API_BASE}/v1/crm/leads/${remarksModalLead.id}/quoted-price`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoted_price: priceNum }),
      });
      const newPrice = String(priceNum);
      setRemarksModalLead((prev) => (prev ? { ...prev, quotedPrice: newPrice } : null));
      setLeads((prev) =>
        prev.map((l) => (l.id === remarksModalLead.id ? { ...l, quotedPrice: newPrice } : l))
      );
      setQuotedPriceModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update quoted price');
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName || !newLeadContact) {
      alert('Name and Contact are required.');
      return;
    }
    const targetBrand =
      newLeadTargetBrand || (selectedSource === 'ALL' ? 'etaxwala' : selectedSource);
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
          source: targetBrand,
          subbrand: targetBrand,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAddLeadModalOpen(false);
        setNewLeadName('');
        setNewLeadContact('');
        setNewLeadEmail('');
        setNewLeadCity('');
        setRefetchTrigger((prev) => prev + 1);

        // Refresh counts
        fetch(`${API_BASE}/v1/crm/leads/counts`)
          .then((r) => r.json())
          .then((cData) => {
            if (cData?.success && cData.counts) setKpiCounts(cData.counts);
          })
          .catch(() => {});

        const brandName =
          targetBrand === 'udyamikisan'
            ? 'Udyami Kisan'
            : targetBrand === 'sahakar'
              ? 'Sahakar Samriddhi'
              : 'ETaxwala';
        alert(`New lead saved to ${brandName} database successfully!`);
      } else {
        alert(data.error || 'Failed to create lead');
      }
    } catch {
      alert('Network error: Failed to save lead to database.');
    }
  };

  const filteredLeads = leads.filter((l) => {
    if (isDetailsView && !l.isAssign) return false;
    if (statusDropdown && statusDropdown !== 'Status' && statusDropdown !== 'ALL') {
      const matchKpi = STATUS_KPIS.find((k) => String(k.id) === statusDropdown);
      const targetLabel = matchKpi ? matchKpi.label.toLowerCase() : statusDropdown.toLowerCase();
      const leadStat = (l.status || '').toLowerCase();
      if (!leadStat.includes(targetLabel) && String(l.status) !== statusDropdown) {
        return false;
      }
    }
    return true;
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
        <div className="space-y-2">
          {/* Row 1: Status KPI Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {STATUS_KPIS.map((kpi) => (
              <button
                key={String(kpi.id)}
                type="button"
                onClick={() => {
                  const next = activeStatusKpi === kpi.id ? null : kpi.id;
                  setActiveStatusKpi(next as any);
                  setActiveFollowup(null);
                  setCurrentPage(1);
                }}
                className={`btn-multicolor py-1 px-3 transition-all ${
                  activeStatusKpi === kpi.id
                    ? 'ring-2 ring-slate-800 scale-105 shadow-md'
                    : 'shadow-2xs'
                }`}
                title={`Filter leads by ${kpi.label}`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-tight">
                    {kpi.label}
                  </span>
                  <span
                    className="text-[11px] font-mono font-bold px-1.5 rounded-full text-white shadow-2xs"
                    style={{ background: kpi.cBase }}
                  >
                    {kpiCounts[kpi.id] != null ? Number(kpiCounts[kpi.id]).toLocaleString() : '--'}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Row 2: Followup Date Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Followup:
            </span>
            {FOLLOWUP_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  const next = activeFollowup === f.id ? null : f.id;
                  setActiveFollowup(next);
                  setActiveStatusKpi(null);
                  setCurrentPage(1);
                }}
                className={`btn-multicolor py-1 px-3 transition-all ${
                  activeFollowup === f.id
                    ? 'ring-2 ring-slate-800 scale-105 shadow-md'
                    : 'shadow-2xs'
                }`}
                title={`Show ${f.label}`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-tight">
                    {f.label}
                  </span>
                  <span
                    className="text-[11px] font-mono font-bold px-1.5 rounded-full text-white shadow-2xs"
                    style={{ background: f.cBase }}
                  >
                    {f.id === 'today' && kpiCounts['followup_today'] != null
                      ? Number(kpiCounts['followup_today']).toLocaleString()
                      : f.id === 'tomorrow' && kpiCounts['followup_tomorrow'] != null
                        ? Number(kpiCounts['followup_tomorrow']).toLocaleString()
                        : f.id === 'dayafter' && kpiCounts['followup_dayafter'] != null
                          ? Number(kpiCounts['followup_dayafter']).toLocaleString()
                          : '--'}
                  </span>
                </div>
              </button>
            ))}
            {(activeStatusKpi !== null || activeFollowup !== null) && (
              <button
                onClick={() => {
                  setActiveStatusKpi(null);
                  setActiveFollowup(null);
                  setCurrentPage(1);
                }}
                className="text-[10px] font-bold text-red-500 hover:text-red-700 underline px-1"
              >
                × Clear Filter
              </button>
            )}
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
              style={
                {
                  '--c-base': '#64748B',
                  '--c-light': '#94A3B8',
                  '--c-dark': '#334155',
                } as React.CSSProperties
              }
              title="Add Lead"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Status Dropdown */}
            <div className="btn-multicolor relative shadow-2xs rounded-xl">
              <select
                value={statusDropdown}
                onChange={(e) => {
                  const val = e.target.value;
                  setStatusDropdown(val);
                  if (val === 'Status' || val === 'ALL') {
                    setActiveStatusKpi(null);
                  } else {
                    const foundKpi = STATUS_KPIS.find(
                      (k) => String(k.id) === val || k.label.toLowerCase() === val.toLowerCase()
                    );
                    if (foundKpi) {
                      setActiveStatusKpi(foundKpi.id as any);
                    } else {
                      setActiveStatusKpi(val as any);
                    }
                  }
                  setCurrentPage(1);
                }}
                className="bg-transparent text-slate-700 font-semibold text-xs py-2 px-3 pr-7 focus:outline-none cursor-pointer appearance-none relative z-2"
              >
                <option value="Status">All Statuses</option>
                {STATUS_KPIS.filter((k) => k.id !== 'all').map((k) => (
                  <option key={String(k.id)} value={String(k.id)}>
                    {k.label}
                  </option>
                ))}
                <option value="New">New</option>
                <option value="Prospect">Prospect</option>
                <option value="Hot">Hot</option>
                <option value="Interested">Interested</option>
                <option value="Not Interested">Not Interested</option>
                <option value="Follow Up">Follow Up</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
                <option value="Not Connected">Not Connected</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Prospected">Prospected</option>
                <option value="Cust. Followup">Cust. Followup</option>
                <option value="Meetings">Meetings</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none z-2" />
            </div>

            {/* Source / Sub-brand Filter Dropdown */}
            <div className="btn-multicolor relative shadow-2xs rounded-xl">
              <select
                value={selectedSource}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedSource(val);
                  setCurrentPage(1);
                  if (val === 'ALL') {
                    navigate('/crm/leads', { replace: true });
                  } else {
                    navigate(`/crm/leads?source=${val}`, { replace: true });
                  }
                }}
                className="bg-transparent text-slate-700 font-semibold text-xs py-2 px-3 pr-7 focus:outline-none cursor-pointer appearance-none relative z-2"
              >
                <option value="ALL">All Sources / Sub-brands</option>
                <option value="etaxwala">ETaxwala Leads</option>
                <option value="udyamikisan">Udyami Kisan Leads</option>
                <option value="sahakar">Sahakar Samriddhi Leads</option>
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

                <button onClick={handleBulkAssign} className="btn-multicolor py-2 px-4 shadow-2xs">
                  <span className="text-xs font-bold">Bulk Add</span>
                </button>

                <button
                  onClick={() => alert('Sample Excel download template initiated.')}
                  className="btn-multicolor py-2 px-4 shadow-2xs"
                  style={
                    {
                      '--c-base': '#2563EB',
                      '--c-light': '#93C5FD',
                      '--c-dark': '#1D4ED8',
                    } as React.CSSProperties
                  }
                >
                  <span className="text-xs font-bold text-slate-800">Sample Excel</span>
                </button>

                <button
                  onClick={() => alert('Facebook Leads Sync API triggered.')}
                  className="btn-multicolor py-2 px-4 shadow-2xs"
                  style={
                    {
                      '--c-base': '#1E3A8A',
                      '--c-light': '#60A5FA',
                      '--c-dark': '#0F172A',
                    } as React.CSSProperties
                  }
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
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === 'all') {
                    setPageSize('all');
                  } else {
                    setPageSize(Number(v));
                  }
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-300 rounded px-2 py-1 text-xs font-semibold focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value="all">All</option>
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
            {loadingLeads && (
              <span className="text-xs text-slate-400 animate-pulse">Loading...</span>
            )}
            <input
              type="text"
              placeholder="Search Data..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.map((item, idx) => (
                <tr
                  key={item.id}
                  className={
                    idx % 2 === 0
                      ? 'bg-white hover:bg-sky-50/40'
                      : 'bg-[#F9FAFB] hover:bg-sky-50/40'
                  }
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

                  {/* Column 1: # (+) Call Remarks Button */}
                  <td className="py-2.5 px-2 text-center">
                    <button
                      onClick={() => setRemarksModalLead(item)}
                      className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 flex items-center justify-center font-bold text-xs shadow-2xs transition-all cursor-pointer"
                      title="Open Call Remarks"
                    >
                      +
                    </button>
                  </td>

                  {/* Column 2: Name */}
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

                  {/* Column 3: Lead Score */}
                  <td className="py-2.5 px-3 text-slate-600 font-semibold">
                    {item.leadScore || 'N/A'}
                  </td>

                  {/* Column 4: Lead Source */}
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.leadSource?.toLowerCase().includes('udyami')
                          ? 'bg-amber-500 text-white'
                          : item.leadSource?.toLowerCase().includes('sahakar')
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#0284c7] text-white'
                      }`}
                    >
                      {item.leadSource?.toLowerCase().includes('udyami')
                        ? 'Udyami Kisan'
                        : item.leadSource?.toLowerCase().includes('sahakar')
                          ? 'Sahakar'
                          : 'ETaxwala'}
                    </span>
                  </td>

                  {/* Column 5: F Date */}
                  <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                    {item.fDate || 'No Date'}
                  </td>

                  {/* Column 6: Contact */}
                  <td className="py-2.5 px-3 font-mono text-slate-700">{item.contact}</td>

                  {/* Column 7: State */}
                  <td className="py-2.5 px-3 text-slate-600">{item.state}</td>

                  {/* Column 8: City */}
                  <td className="py-2.5 px-3 text-slate-600">{item.city}</td>

                  {/* Column 9: Service */}
                  <td className="py-2.5 px-3 text-slate-700 font-medium">{item.service}</td>

                  {/* Column 10: Added By */}
                  <td className="py-2.5 px-3 text-slate-600">{item.addedBy || 'N/A'}</td>

                  {/* Column 11: Assign To (Manager view) */}
                  {isManager && (
                    <td className="py-2.5 px-3">
                      {item.assignTo === 'Not Assigned' ? (
                        <span className="text-red-600 font-bold">{item.assignTo}</span>
                      ) : (
                        <span className="text-slate-800 font-medium">{item.assignTo}</span>
                      )}
                    </td>
                  )}

                  {/* Column 12: Assign Date */}
                  <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                    {item.assignDate || 'N/A'}
                  </td>

                  {/* Column 13: Status */}
                  <td className="py-2.5 px-3">
                    <span className="bg-[#16A34A] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar — wired to API totalLeads / totalPages */}
        <div className="p-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            {pageSize === 'all'
              ? `Showing all ${totalLeads.toLocaleString()} entries`
              : `Showing ${filteredLeads.length === 0 ? 0 : (currentPage - 1) * Number(pageSize) + 1}–${Math.min(currentPage * Number(pageSize), totalLeads)} of ${totalLeads.toLocaleString()} entries`}
          </span>
          {pageSize !== 'all' && (
            <div className="flex items-center gap-1 flex-wrap">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(1)}
                className="px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed font-mono"
                title="First Page"
              >
                «
              </button>
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Prev
              </button>

              {/* Page number buttons — show 5 around current */}
              {(() => {
                const pages: number[] = [];
                let start = Math.max(1, currentPage - 2);
                let end = Math.min(totalPages, start + 4);
                if (end - start < 4) start = Math.max(1, end - 4);
                for (let p = start; p <= end; p++) pages.push(p);
                return (
                  <>
                    {start > 1 && <span className="px-1 text-slate-400">…</span>}
                    {pages.map((pg) => (
                      <button
                        key={pg}
                        onClick={() => setCurrentPage(pg)}
                        className={`px-2.5 py-1 rounded ${
                          pg === currentPage
                            ? 'bg-[#1E3A8A] text-white font-bold'
                            : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        {pg}
                      </button>
                    ))}
                    {end < totalPages && <span className="px-1 text-slate-400">…</span>}
                  </>
                );
              })()}

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed font-mono"
                title="Last Page"
              >
                »
              </button>

              {/* Go to page */}
              <span className="ml-2 text-slate-400">Go to:</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                defaultValue={currentPage}
                key={currentPage}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const v = Number((e.target as HTMLInputElement).value);
                    if (v >= 1 && v <= totalPages) setCurrentPage(v);
                  }
                }}
                className="w-14 px-2 py-1 text-xs border border-slate-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-[#003A66]"
              />
              <span className="text-slate-400">/ {totalPages.toLocaleString()}</span>
            </div>
          )}
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
                  <h3 className="font-extrabold text-sm text-[#1B365D] tracking-tight">
                    Lead Details & Activity
                  </h3>
                  <p className="text-[11px] text-slate-500">{detailsModalLead.service}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Lead Score badge */}
                {detailsModalLead.leadScore && (
                  <span className="badge badge-navy text-[11px] font-bold px-2 py-0.5">
                    Score: {detailsModalLead.leadScore}
                  </span>
                )}
                {/* Quoted Price badge */}
                {detailsModalLead.quotedPrice && (
                  <span className="badge badge-gold text-[11px] font-bold px-2 py-0.5">
                    ₹ {Number(detailsModalLead.quotedPrice).toLocaleString('en-IN')}
                  </span>
                )}
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
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Customer Name
                      </label>
                      <input
                        type="text"
                        defaultValue={detailsModalLead.name}
                        className="w-full text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="text"
                        defaultValue={detailsModalLead.contact}
                        className="w-full text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-mono focus:bg-white focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        defaultValue={detailsModalLead.email || 'NA@gmail.com'}
                        className="w-full text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Selected Service
                      </label>
                      <select
                        defaultValue={detailsModalLead.service}
                        className="w-full text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all font-semibold"
                      >
                        <option value={detailsModalLead.service}>{detailsModalLead.service}</option>
                        <option value="Producer Company Registration">
                          Producer Company Registration
                        </option>
                        <option value="Multistate Registration">Multistate Registration</option>
                        <option value="Microfinance Company (Section 8)">
                          Microfinance Company (Section 8)
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        defaultValue={detailsModalLead.state}
                        className="w-full text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        City
                      </label>
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
                        const targetId = detailsModalLead.id;
                        setDetailsModalLead(null);
                        navigate(`/crm/leads/${targetId}/won`);
                      }}
                      className="btn-multicolor py-1.5 px-4 rounded-full text-xs font-bold shadow-xs cursor-pointer"
                      style={
                        {
                          '--c-base': '#7C3AED',
                          '--c-light': '#A78BFA',
                          '--c-dark': '#5B21B6',
                        } as React.CSSProperties
                      }
                    >
                      <span>Convert to Customer</span>
                    </button>
                    <button
                      onClick={() => {
                        const targetLead = detailsModalLead;
                        setDetailsModalLead(null);
                        navigate('/crm/quotations', { state: { lead: targetLead } });
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
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Lead Note
                    </label>
                    <div className="bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl p-3 text-xs text-slate-600 min-h-[50px] leading-relaxed">
                      {detailsModalLead.note || 'No Note Found'}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Update Status (with Lead Remarks History) */}
              {detailsActiveTab === 'status' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Select Lead Status
                    </label>
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

                  {/* Show Quoted Price field when status is Quotation */}
                  {editStatus === 'Quotation' && (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Quoted Price (₹) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        placeholder="Enter quoted price"
                        className="w-full text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Lead Remark Note
                    </label>
                    <textarea
                      rows={2}
                      value={editRemark}
                      onChange={(e) => setEditRemark(e.target.value)}
                      placeholder="Enter update note, customer objections or next step..."
                      className="w-full text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl p-3 text-slate-800 focus:bg-white focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Last Lead Remark
                    </label>
                    <div className="bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl p-3 text-xs text-slate-700 font-semibold">
                      {detailsModalLead.remarks?.[0]?.note || 'No remark yet'}
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
                        editStatus === 'Customer'
                          ? ({
                              '--c-base': '#7C3AED',
                              '--c-light': '#A78BFA',
                              '--c-dark': '#5B21B6',
                            } as React.CSSProperties)
                          : ({
                              '--c-base': '#1B365D',
                              '--c-light': '#3B82F6',
                              '--c-dark': '#0F172A',
                            } as React.CSSProperties)
                      }
                    >
                      <span>
                        {editStatus === 'Customer' ? '🎉 Convert to Customer' : 'Add Remark'}
                      </span>
                    </button>
                  </div>

                  {/* Customer conversion hint */}
                  {editStatus === 'Customer' && (
                    <div className="bg-purple-50 border border-purple-200 rounded-xl px-3 py-2.5 text-xs text-purple-700 flex items-start gap-2">
                      <span className="text-base leading-none mt-0.5">💡</span>
                      <span>
                        Selecting <strong>Customer</strong> status will open the{' '}
                        <strong>Won Conversion Form</strong> where you can record the service,
                        payment, and advance amount — and automatically create the customer +
                        operations task.
                      </span>
                    </div>
                  )}

                  <div className="border-t border-[#EAE6DD] pt-3">
                    <p className="text-[11px] font-bold text-slate-700 mb-2 uppercase tracking-wider">
                      📋 Lead Remarks History
                    </p>
                    <div className="max-h-48 overflow-y-auto space-y-1.5">
                      {detailsModalLead.remarks && detailsModalLead.remarks.length > 0 ? (
                        detailsModalLead.remarks.map((r, i) => (
                          <div
                            key={i}
                            className="bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2"
                          >
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-[10px] font-bold text-[#1B365D]">
                                {r.staff}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">{r.date}</span>
                            </div>
                            <p className="text-xs text-slate-700 leading-relaxed">{r.note}</p>
                            <span className="text-[9px] badge badge-navy mt-0.5 inline-block uppercase">
                              {r.source}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 text-center py-3">
                          No lead remarks yet.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Followup (with Followup Remarks History) */}
              {detailsActiveTab === 'followup' && (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Followup Date
                      </label>
                      <input
                        type="date"
                        value={followupDate}
                        onChange={(e) => setFollowupDate(e.target.value)}
                        className="w-full text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Followup Time
                      </label>
                      <input
                        type="time"
                        value={followupTime}
                        onChange={(e) => setFollowupTime(e.target.value)}
                        className="w-full text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Followup Discussion Remark
                    </label>
                    <textarea
                      rows={2}
                      value={followupRemark}
                      onChange={(e) => setFollowupRemark(e.target.value)}
                      placeholder="Enter scheduled topic / customer request..."
                      className="w-full text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl p-3 text-slate-800 focus:bg-white focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Last Followup Remark
                    </label>
                    <div className="bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl p-3 text-xs text-slate-700 font-semibold">
                      {detailsModalLead.followupRemarks?.[0]?.remark || 'No followup yet'}
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
                      <span>Add Followup</span>
                    </button>
                  </div>

                  {/* Followup Remarks History — alag section */}
                  <div className="border-t border-[#EAE6DD] pt-3">
                    <p className="text-[11px] font-bold text-slate-700 mb-2 uppercase tracking-wider">
                      📅 Followup History
                    </p>
                    <div className="max-h-48 overflow-y-auto space-y-1.5">
                      {detailsModalLead.followupRemarks &&
                      detailsModalLead.followupRemarks.length > 0 ? (
                        detailsModalLead.followupRemarks.map((f, i) => (
                          <div
                            key={i}
                            className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2"
                          >
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-[10px] font-bold text-amber-700">
                                {f.staff}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">{f.date}</span>
                            </div>
                            <p className="text-xs text-slate-700 leading-relaxed">{f.remark}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 text-center py-3">
                          No followup remarks yet.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Other Services */}
              {detailsActiveTab === 'services' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Add Other / Complementary Service to Lead
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedAdditionalService}
                        onChange={(e) => setSelectedAdditionalService(e.target.value)}
                        className="flex-1 text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all font-semibold"
                      >
                        {availableServices && availableServices.length > 0 ? (
                          availableServices.map((svc, i) => (
                            <option key={i} value={svc.name}>
                              {svc.name}
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="Private LTD Company Registration">
                              Private LTD Company Registration
                            </option>
                            <option value="Limited Liability Partnership (LLP)">
                              Limited Liability Partnership (LLP)
                            </option>
                            <option value="Credit Co-Operative Society (Taluka Level) Registration">
                              Credit Co-Operative Society (Taluka Level) Registration
                            </option>
                            <option value="80G & 12A Income Tax Exemption">
                              80G & 12A Income Tax Exemption
                            </option>
                            <option value="ISO Certification">ISO Certification</option>
                            <option value="NITI Aayog DARPAN Certificate">
                              NITI Aayog DARPAN Certificate
                            </option>
                            <option value="Digital Signature (Signing Only)">
                              Digital Signature (Signing Only)
                            </option>
                            <option value="GST Return Filing (Quarterly)">
                              GST Return Filing (Quarterly)
                            </option>
                          </>
                        )}
                      </select>
                      <button
                        onClick={handleAddService}
                        className="btn-multicolor py-2 px-4 rounded-full text-xs font-bold shadow-xs cursor-pointer"
                        style={
                          {
                            '--c-base': '#10B981',
                            '--c-light': '#6EE7B7',
                            '--c-dark': '#047857',
                          } as React.CSSProperties
                        }
                      >
                        <span>+ Add</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Attached Services for {detailsModalLead.name}
                    </label>
                    <div className="space-y-1.5">
                      {/* Main Service */}
                      <div className="p-3 text-xs text-slate-800 flex items-center justify-between bg-blue-50/70 border border-blue-200 rounded-xl font-bold">
                        <span className="flex items-center gap-1.5 text-[#1B365D]">
                          ⭐ {detailsModalLead.service}{' '}
                          <span className="text-[10px] text-blue-600 font-mono">
                            (Primary Service)
                          </span>
                        </span>
                      </div>

                      {/* Additional Services List */}
                      {additionalServices.length === 0 ? (
                        <p className="text-xs text-slate-400 py-3 text-center bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl">
                          No additional services attached to this lead proposal yet. Select a
                          service above and click + Add.
                        </p>
                      ) : (
                        <ul className="divide-y divide-[#EAE6DD] border border-[#EAE6DD] rounded-xl overflow-hidden">
                          {additionalServices.map((srv, idx) => (
                            <li
                              key={idx}
                              className="p-3 text-xs text-slate-800 flex items-center justify-between bg-white hover:bg-[#FAF9F5] transition-colors"
                            >
                              <span className="font-semibold text-slate-700">🔹 {srv}</span>
                              <button
                                onClick={() =>
                                  setAdditionalServices(
                                    additionalServices.filter((_, i) => i !== idx)
                                  )
                                }
                                className="text-rose-600 hover:text-rose-700 text-xs font-bold cursor-pointer"
                              >
                                Remove
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Create Quotation Button with all attached services */}
                  <div className="pt-2 border-t border-[#EAE6DD] flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">
                      {1 + additionalServices.length} Total Service(s) attached
                    </span>
                    <button
                      onClick={() => {
                        const targetLead = {
                          ...detailsModalLead,
                          additionalServices: additionalServices,
                        };
                        setDetailsModalLead(null);
                        navigate('/crm/quotations', { state: { lead: targetLead } });
                      }}
                      className="btn-multicolor py-2 px-5 rounded-full text-xs font-bold shadow-xs cursor-pointer"
                      style={
                        {
                          '--c-base': '#10B981',
                          '--c-light': '#6EE7B7',
                          '--c-dark': '#047857',
                        } as React.CSSProperties
                      }
                    >
                      <span>Create Quotation with Attached Services</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── LEAD REMARKS MODAL (Exact match with Old CRM Screenshot) ─── */}
      {remarksModalLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-scale-in">
            {/* Header: Deep Red matching screenshot */}
            <div className="bg-[#B91C1C] text-white p-3.5 sm:p-4 flex items-center justify-between">
              <h3 className="font-extrabold text-base tracking-wide text-white flex items-center gap-2">
                <span>Lead Remarks</span>
              </h3>
              <div className="flex items-center gap-1.5">
                {/* (i) Service Questions Button — only visible if service has questions */}
                {hasServiceQuestions && (
                  <button
                    onClick={() => setServiceQAModalOpen(!serviceQAModalOpen)}
                    className="bg-white/20 hover:bg-white/30 text-white font-bold text-xs px-2.5 py-1 rounded transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                    title="Service Question & Answers"
                  >
                    <span className="font-mono text-xs">(i)</span>
                  </button>
                )}

                {/* Lead Score Button */}
                <button
                  onClick={handleOpenLeadScoreModal}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-2.5 py-1 rounded transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                  title="Click to calculate/update Lead Score %"
                >
                  <span>{remarksModalLead.leadScore || '--%'}</span>
                </button>

                {/* Quoted Price Button */}
                <button
                  onClick={handleOpenQuotedPriceModal}
                  className="bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs px-2.5 py-1 rounded transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                  title="Click to enter/update Quoted Price"
                >
                  <span>
                    ₹{' '}
                    {remarksModalLead.quotedPrice
                      ? Number(remarksModalLead.quotedPrice).toLocaleString('en-IN')
                      : '--'}
                  </span>
                </button>

                {/* + Remark Button */}
                <button
                  onClick={() => {
                    const inputEl = document.getElementById('modalRemarkInput');
                    if (inputEl) inputEl.focus();
                  }}
                  className="bg-[#1D4ED8] hover:bg-blue-700 text-white font-bold text-xs px-3 py-1 rounded transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                >
                  <span>+ Remark</span>
                </button>

                <button
                  onClick={() => {
                    setRemarksModalLead(null);
                    setServiceQAModalOpen(false);
                  }}
                  className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="bg-[#FAF9F6] p-4 sm:p-5 border-b border-[#EAE6DD] text-xs space-y-3">
              {/* Summary Row */}
              <div className="bg-white p-3 rounded-xl border border-[#EAE6DD] shadow-2xs space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold text-slate-900">Name: {remarksModalLead.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-semibold">Location:</span>
                    <span className="font-bold text-slate-800">
                      {remarksModalLead.city || 'NA'}, {remarksModalLead.state || 'NA'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 font-mono text-slate-700 pt-0.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Contact: {remarksModalLead.contact}</span>
                </div>
              </div>

              {/* Service Questionnaire Section (Toggled by (i) button) */}
              {serviceQAModalOpen && (
                <div className="bg-amber-50/90 border border-amber-300 p-3.5 rounded-xl animate-fade-in space-y-2.5">
                  <div className="flex items-center justify-between border-b border-amber-200 pb-1.5">
                    <h4 className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                      <span>📋 Service Questionnaire ({remarksModalLead.service})</span>
                    </h4>
                    <button
                      onClick={() => setServiceQAModalOpen(false)}
                      className="text-amber-700 hover:text-amber-900 text-[11px] font-bold"
                    >
                      Close [X]
                    </button>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                        1. Proposed Entity / Company Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Acme Farmers Producer Co Ltd"
                        value={qaFormAnswers['proposed_name'] || ''}
                        onChange={(e) =>
                          setQaFormAnswers({ ...qaFormAnswers, proposed_name: e.target.value })
                        }
                        className="w-full text-xs bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-slate-800"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                          2. No. of Directors / Members
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 5 Directors"
                          value={qaFormAnswers['directors'] || ''}
                          onChange={(e) =>
                            setQaFormAnswers({ ...qaFormAnswers, directors: e.target.value })
                          }
                          className="w-full text-xs bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                          3. Approx Annual Turnover
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. ₹ 25 Lakhs"
                          value={qaFormAnswers['turnover'] || ''}
                          onChange={(e) =>
                            setQaFormAnswers({ ...qaFormAnswers, turnover: e.target.value })
                          }
                          className="w-full text-xs bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-slate-800"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                        4. Special Client Requirements
                      </label>
                      <input
                        type="text"
                        placeholder="Enter specific requirement or notes"
                        value={qaFormAnswers['special_req'] || ''}
                        onChange={(e) =>
                          setQaFormAnswers({ ...qaFormAnswers, special_req: e.target.value })
                        }
                        className="w-full text-xs bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-slate-800"
                      />
                    </div>
                    <button
                      onClick={() => {
                        alert('Service Question Answers saved successfully!');
                        setServiceQAModalOpen(false);
                      }}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-2xs"
                    >
                      Save Questionnaire
                    </button>
                  </div>
                </div>
              )}

              {/* In-Modal Remark Entry */}
              <div className="space-y-2">
                <textarea
                  id="modalRemarkInput"
                  rows={2}
                  value={inModalRemark}
                  onChange={(e) => setInModalRemark(e.target.value)}
                  placeholder="Enter remark..."
                  className="w-full text-xs bg-white border border-[#EAE6DD] rounded-xl p-3 text-slate-800 focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 shadow-2xs"
                />
                <div className="flex justify-start">
                  <button
                    onClick={handleSaveInModalRemark}
                    className="bg-[#16A34A] hover:bg-green-700 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Save Remark
                  </button>
                </div>
              </div>

              {/* Combined History: Call Notes & Followup Remarks */}
              <div className="space-y-3">
                {/* Call Notes History List */}
                <div className="bg-white border border-[#EAE6DD] rounded-xl overflow-hidden shadow-2xs">
                  <div className="bg-[#FAF9F5] p-2.5 grid grid-cols-12 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-[#EAE6DD]">
                    <div className="col-span-6 flex items-center gap-1.5">
                      <span>📞 Call Notes History</span>
                      <span className="text-[10px] bg-blue-100 text-[#0284c7] font-bold px-1.5 py-0.2 rounded-full">
                        {remarksModalLead.remarks?.length || 0}
                      </span>
                    </div>
                    <div className="col-span-4">Call Date</div>
                    <div className="col-span-2 text-right">Source</div>
                  </div>
                  <div className="max-h-44 overflow-y-auto divide-y divide-slate-100">
                    {remarksModalLead.remarks && remarksModalLead.remarks.length > 0 ? (
                      remarksModalLead.remarks.map((r, i) => (
                        <div
                          key={i}
                          className="p-2.5 grid grid-cols-12 items-start hover:bg-slate-50/70 transition-colors"
                        >
                          <div className="col-span-6 pr-2">
                            <p className="font-bold text-[#0284c7]">{r.staff}</p>
                            <p className="text-slate-700 mt-0.5 leading-relaxed text-xs">
                              {r.note}
                            </p>
                          </div>
                          <div className="col-span-4 text-slate-500 font-mono text-[11px] pt-0.5">
                            {r.date}
                          </div>
                          <div className="col-span-2 text-right pt-0.5">
                            <span className="text-[10px] font-bold text-slate-400 lowercase">
                              {r.source}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-slate-400 text-xs">
                        No call remarks recorded yet for this lead.
                      </div>
                    )}
                  </div>
                </div>

                {/* Followup Remarks History List */}
                <div className="bg-white border border-amber-200 rounded-xl overflow-hidden shadow-2xs">
                  <div className="bg-amber-50/80 p-2.5 flex items-center justify-between text-[11px] font-bold text-amber-900 uppercase tracking-wider border-b border-amber-200">
                    <div className="flex items-center gap-1.5">
                      <span>📅 Followup Remarks History</span>
                      <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.2 rounded-full">
                        {remarksModalLead.followupRemarks?.length || 0}
                      </span>
                    </div>
                    <span className="text-[10px] text-amber-700 font-normal lowercase">
                      scheduled followups
                    </span>
                  </div>
                  <div className="max-h-40 overflow-y-auto divide-y divide-amber-100/60">
                    {remarksModalLead.followupRemarks &&
                    remarksModalLead.followupRemarks.length > 0 ? (
                      remarksModalLead.followupRemarks.map((f, i) => (
                        <div
                          key={i}
                          className="p-2.5 grid grid-cols-12 items-start hover:bg-amber-50/40 transition-colors"
                        >
                          <div className="col-span-8 pr-2">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-amber-900 text-xs">{f.staff}</span>
                              <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                                Followup
                              </span>
                            </div>
                            <p className="text-slate-700 mt-0.5 text-xs leading-relaxed">
                              {f.remark}
                            </p>
                          </div>
                          <div className="col-span-4 text-right text-slate-500 font-mono text-[11px] pt-0.5">
                            {f.date}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-slate-400 text-xs">
                        No followup remarks recorded yet for this lead.
                      </div>
                    )}
                  </div>
                </div>
              </div>
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
              <button
                onClick={() => setAddLeadModalOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateLead} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Customer Name *
                </label>
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
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Mobile Contact *
                </label>
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
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newLeadEmail}
                  onChange={(e) => setNewLeadEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Target Lead List / Sub-brand *
                </label>
                <select
                  value={newLeadTargetBrand}
                  onChange={(e) => {
                    setNewLeadTargetBrand(e.target.value);
                    setNewLeadService('');
                  }}
                  className="w-full text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-semibold focus:bg-white focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
                >
                  <option value="etaxwala">ETaxwala Leads</option>
                  <option value="udyamikisan">Udyami Kisan Leads</option>
                  <option value="sahakar">Sahakar Samriddhi Leads</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Required Service *
                </label>
                <select
                  value={newLeadService}
                  onChange={(e) => setNewLeadService(e.target.value)}
                  className="w-full text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-semibold focus:bg-white focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
                >
                  {availableServices.length > 0 ? (
                    availableServices.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Business Registration Advisory">
                        Business Registration Advisory
                      </option>
                      <option value="Farmer Producer Company Registration">
                        Farmer Producer Company Registration
                      </option>
                      <option value="Credit Cooperative Society (State Level)">
                        Credit Cooperative Society (State Level)
                      </option>
                    </>
                  )}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={newLeadState}
                    onChange={(e) => setNewLeadState(e.target.value)}
                    className="w-full text-xs bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    City
                  </label>
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
                <button type="submit" className="btn-multicolor py-2 px-5 shadow-xs">
                  <span className="text-xs font-bold">Save Lead</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── CUSTOM WIZARD MODAL 1: LEAD SCORE ─── */}
      {leadScoreModalOpen && remarksModalLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-[#EAE6DD] animate-scale-in">
            <div className="h-1 bg-multicolor" />
            <div className="p-4 bg-white border-b border-[#EAE6DD] flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-[#1B365D]">
                Calculate & Update Lead Score
              </h3>
              <button
                onClick={() => setLeadScoreModalOpen(false)}
                className="w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Lead Probability Score (%)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={scoreInputValue}
                    onChange={(e) => setScoreInputValue(e.target.value)}
                    className="flex-1 accent-[#7C3AED] cursor-pointer"
                  />
                  <div className="w-14 text-center font-bold text-sm bg-purple-50 text-[#7C3AED] border border-purple-200 py-1 rounded-xl font-mono">
                    {scoreInputValue}%
                  </div>
                </div>
              </div>

              {/* Presets */}
              <div className="flex gap-1.5 justify-between">
                {['25', '50', '75', '90', '100'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setScoreInputValue(p)}
                    className={`px-2 py-1 text-[11px] rounded-lg font-bold transition-all ${
                      scoreInputValue === p
                        ? 'bg-[#7C3AED] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {p}%
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EAE6DD]">
                <button
                  type="button"
                  onClick={() => setLeadScoreModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveLeadScoreModal}
                  className="btn-multicolor px-4 py-1.5 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  <span>Update Score</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── CUSTOM WIZARD MODAL 2: QUOTED PRICE ─── */}
      {quotedPriceModalOpen && remarksModalLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-[#EAE6DD] animate-scale-in">
            <div className="h-1 bg-multicolor" />
            <div className="p-4 bg-white border-b border-[#EAE6DD] flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-[#1B365D]">Enter Quoted Price</h3>
              <button
                onClick={() => setQuotedPriceModalOpen(false)}
                className="w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Service Proposal Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-slate-400 text-xs">
                    ₹
                  </span>
                  <input
                    type="number"
                    placeholder="e.g. 15000"
                    value={priceInputValue}
                    onChange={(e) => setPriceInputValue(e.target.value)}
                    className="w-full text-xs font-bold bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl pl-7 pr-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Price Presets */}
              <div className="grid grid-cols-4 gap-1.5">
                {['4999', '14999', '24999', '49999'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setPriceInputValue(val)}
                    className={`px-1.5 py-1 text-[10px] rounded-lg font-bold transition-all text-center ${
                      priceInputValue === val
                        ? 'bg-[#10B981] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    ₹{Number(val).toLocaleString('en-IN')}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EAE6DD]">
                <button
                  type="button"
                  onClick={() => setQuotedPriceModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveQuotedPriceModal}
                  className="btn-multicolor px-4 py-1.5 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                  style={
                    {
                      '--c-base': '#10B981',
                      '--c-light': '#6EE7B7',
                      '--c-dark': '#047857',
                    } as React.CSSProperties
                  }
                >
                  <span>Save Quoted Price</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
