import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { API_BASE_URL } from '@/lib/api-base';
import {
  FileSpreadsheet,
  Plus,
  Send,
  Printer,
  CheckCircle2,
  Search,
  Copy,
  Trash2,
  Edit3,
  Eye,
  ArrowLeft,
  FileText,
  User,
  Users,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface ServiceOption {
  service_id: number;
  service_name: string;
  service_price: number;
  description?: string;
}

interface LeadRecord {
  id: number;
  name: string;
  contact?: string;
  mobile?: string;
  email?: string;
  city?: string;
  state?: string;
  service?: string;
}

interface QuotationItem {
  id: string;
  isManual?: boolean;
  serviceName: string;
  description: string;
  qty: number;
  unitPrice: number;
  discount: number; // Rupee amount subtraction per item
}

interface QuotationRecord {
  id: string;
  leadId?: string | number;
  quotationNo: string;
  customerName: string;
  companyName?: string;
  mobile: string;
  email: string;
  address: string;
  date: string;
  validUntil?: string;
  createdBy: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Expired';
  items: QuotationItem[];
  overallDiscount: number; // Rupee amount subtraction
  notes: string;
  subject?: string;
}

const DEFAULT_SERVICES: ServiceOption[] = [
  {
    service_id: 1,
    service_name: 'Private Limited Company Registration',
    service_price: 7999,
    description:
      'Complete Pvt Ltd incorporation including Name Approval, DSC, DIN, MOA/AOA, PAN, TAN & Bank AC assistance.',
  },
  {
    service_id: 2,
    service_name: 'GST Registration & Compliance (1 Year)',
    service_price: 4999,
    description:
      'New GST Registration + 12 Months GSTR-1 and GSTR-3B monthly filing & ITC reconciliation.',
  },
  {
    service_id: 3,
    service_name: 'Trademark Filing & Consultation',
    service_price: 3500,
    description:
      'Brand name / Logo trademark search, class selection, draft application & TM filing with government portal.',
  },
  {
    service_id: 4,
    service_name: 'Income Tax Return (ITR-3/4 Business)',
    service_price: 2999,
    description:
      'Preparation & filing of ITR for business owners, freelancers, proprietorships with P&L balance sheet.',
  },
  {
    service_id: 5,
    service_name: 'LLP Incorporation Package',
    service_price: 6499,
    description:
      'Limited Liability Partnership registration, LLP Agreement drafting, DIN, DSC & PAN allocation.',
  },
  {
    service_id: 6,
    service_name: 'Section 8 Non-Profit Company Reg.',
    service_price: 14999,
    description: 'NGO/Section 8 company incorporation, 12A & 80G registration for tax exemption.',
  },
  {
    service_id: 7,
    service_name: 'FSSAI Food License (State 1 Year)',
    service_price: 2499,
    description:
      'FSSAI state food license documentation, submission and certificate issuance for food business.',
  },
  {
    service_id: 8,
    service_name: 'MSME / Udyam Registration',
    service_price: 999,
    description:
      'Govt MSME registration certificate for priority sector lending and tender benefits.',
  },
  {
    service_id: 9,
    service_name: 'Import Export Code (IEC)',
    service_price: 1999,
    description: 'DGFT IEC registration certificate for international import-export transactions.',
  },
  {
    service_id: 10,
    service_name: 'Accounting & Bookkeeping (Monthly)',
    service_price: 3000,
    description:
      'Tally/Zoho monthly bookkeeping, bank reconciliation, financial reporting & TDS calculations.',
  },
  {
    service_id: 11,
    service_name: 'Annual ROC Compliance (Pvt Ltd)',
    service_price: 8999,
    description:
      'Annual ROC filing (AOC-4 & MGT-7), Director KYC, Board Resolutions and Annual Return filing.',
  },
  {
    service_id: 12,
    service_name: 'Payroll Processing (up to 25 employees)',
    service_price: 4500,
    description:
      'Monthly salary slip generation, PF/ESIC computation and monthly return submissions.',
  },
  {
    service_id: 13,
    service_name: 'ISO Certification (9001:2015)',
    service_price: 4999,
    description:
      'Audit assistance & ISO 9001 quality management system certificate for 3 years validity.',
  },
  {
    service_id: 14,
    service_name: 'Digital Signature Certificate (Class 3)',
    service_price: 1200,
    description: 'Class 3 Signing + Encryption DSC with 2-year validity USB token included.',
  },
  {
    service_id: 15,
    service_name: 'Startup India Recognition',
    service_price: 3999,
    description:
      'DPIIT Startup India registration for tax exemption benefits and self-certification compliance.',
  },
];

const INITIAL_QUOTATIONS: QuotationRecord[] = [
  {
    id: 'q-101',
    quotationNo: 'ETAX/2026/0482',
    customerName: 'Rajesh Sharma',
    companyName: 'Apex Techno Solutions Pvt Ltd',
    mobile: '9876543210',
    email: 'rajesh@apextechno.in',
    address: 'Plot No. 42, Tech Park, Sector 62, Noida, UP - 201301',
    date: '2026-10-05',
    validUntil: '2026-10-20',
    createdBy: 'Sales Desk',
    status: 'Sent',
    subject: 'Quotation for Company Registration & Annual GST Filing Package',
    overallDiscount: 500,
    notes:
      'Payment terms: 50% advance along with order confirmation, balance 50% upon delivery of incorporation certificates.',
    items: [
      {
        id: 'item-1',
        isManual: false,
        serviceName: 'Private Limited Company Registration',
        description:
          'Complete Pvt Ltd incorporation including Name Approval, DSC, DIN, MOA/AOA, PAN, TAN & Bank AC assistance.',
        qty: 1,
        unitPrice: 7999,
        discount: 500,
      },
      {
        id: 'item-2',
        isManual: false,
        serviceName: 'GST Registration & Compliance (1 Year)',
        description:
          'New GST Registration + 12 Months GSTR-1 and GSTR-3B monthly filing & ITC reconciliation.',
        qty: 1,
        unitPrice: 4999,
        discount: 0,
      },
    ],
  },
  {
    id: 'q-102',
    quotationNo: 'ETAX/2026/0483',
    customerName: 'Ananya Verma',
    companyName: 'GreenLeaf Organics',
    mobile: '9123456789',
    email: 'ananya@greenleaf.co.in',
    address: '12-A Commercial Complex, M.G. Road, Pune - 411001',
    date: '2026-10-06',
    validUntil: '2026-10-21',
    createdBy: 'Sales Desk',
    status: 'Draft',
    subject: 'Proposal for Trademark Filing and FSSAI Food License',
    overallDiscount: 0,
    notes:
      'Government fee included in pricing. Timeline for trademark application filing is 48 working hours.',
    items: [
      {
        id: 'item-1',
        isManual: false,
        serviceName: 'Trademark Filing & Consultation',
        description:
          'Brand name / Logo trademark search, class selection, draft application & TM filing with government portal.',
        qty: 1,
        unitPrice: 3500,
        discount: 0,
      },
      {
        id: 'item-2',
        isManual: true,
        serviceName: 'Custom Legal Agreement Drafting',
        description:
          'Bespoke vendor contract & confidentiality agreement (NDA) tailored for organic products distribution.',
        qty: 2,
        unitPrice: 2500,
        discount: 500,
      },
    ],
  },
];

function numberToWords(num: number): string {
  if (num <= 0) return 'Zero Rupees Only';
  const a = [
    '',
    'One ',
    'Two ',
    'Three ',
    'Four ',
    'Five ',
    'Six ',
    'Seven ',
    'Eight ',
    'Nine ',
    'Ten ',
    'Eleven ',
    'Twelve ',
    'Thirteen ',
    'Fourteen ',
    'Fifteen ',
    'Sixteen ',
    'Seventeen ',
    'Eighteen ',
    'Nineteen ',
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const numStr = Math.floor(num).toString();
  if (numStr.length > 9) return numStr;
  const n = ('000000000' + numStr).slice(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return numStr;
  let str = '';
  str +=
    n[1] !== '00'
      ? (a[Number(n[1])] || b[Number(n[1][0])] + ' ' + a[Number(n[1][1])]) + 'Crore '
      : '';
  str +=
    n[2] !== '00'
      ? (a[Number(n[2])] || b[Number(n[2][0])] + ' ' + a[Number(n[2][1])]) + 'Lakh '
      : '';
  str +=
    n[3] !== '00'
      ? (a[Number(n[3])] || b[Number(n[3][0])] + ' ' + a[Number(n[3][1])]) + 'Thousand '
      : '';
  str +=
    n[4] !== '0'
      ? (a[Number(n[4])] || b[Number(n[4][0])] + ' ' + a[Number(n[4][1])]) + 'Hundred '
      : '';
  str +=
    n[5] !== '00'
      ? (str !== '' ? 'and ' : '') +
        (a[Number(n[5])] || b[Number(n[5][0])] + ' ' + a[Number(n[5][1])])
      : '';
  return str.trim() ? str.trim() + ' Rupees Only' : 'Zero Rupees Only';
}

export function CrmQuotationsPage() {
  const location = useLocation();

  const [quotations, setQuotations] = useState<QuotationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<'list' | 'edit' | 'preview'>('list');
  const [activeQuote, setActiveQuote] = useState<QuotationRecord | null>(null);

  const [servicesList, setServicesList] = useState<ServiceOption[]>(DEFAULT_SERVICES);
  const [leadsList, setLeadsList] = useState<LeadRecord[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const API_BASE = API_BASE_URL;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch Services from API
  useEffect(() => {
    fetch(`${API_BASE}/v1/crm/services`)
      .then((res) => res.json())
      .then((data) => {
        // API returns { success: true, data: [...] } format
        const list = Array.isArray(data) ? data : data?.data || data?.services || [];
        if (list.length > 0) {
          const mapped = list.map((s: any) => ({
            service_id: s.service_id || s.id,
            service_name: s.service_name || s.title || s.name,
            service_price: Number(s.service_price || s.price || 0),
            description: s.description || s.service_description || '',
          }));
          setServicesList(mapped);
        }
      })
      .catch(() => {
        // Keep default fallback
      });
  }, []);

  // Fetch Leads for quick auto-complete
  useEffect(() => {
    fetch(`${API_BASE}/v1/crm/leads?limit=500`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || data?.leads || [];
        if (list.length > 0) {
          setLeadsList(
            list.map((l: any) => ({
              id: l.id,
              name: l.name || l.contact_name || `Lead #${l.id}`,
              mobile: l.contact || l.mobile || l.phone || '',
              email: l.email || '',
              city: l.city || '',
              state: l.state || '',
              service: l.service || l.service_name || '',
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  // Fetch existing quotations from database
  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/v1/crm/quotations`)
      .then((res) => res.json())
      .then((res) => {
        const dbQuotes: any[] = Array.isArray(res) ? res : res?.data || [];
        if (dbQuotes.length === 0) {
          setLoading(false);
          return;
        }

        const mapped: QuotationRecord[] = dbQuotes.map((q: any) => {
          let items: QuotationItem[] = [];
          let overallDiscount = 0;

          if (q.sales_items && Array.isArray(q.sales_items) && q.sales_items.length > 0) {
            overallDiscount = Number(q.sales_items[0]?.overall_discount || 0);
            items = q.sales_items.map((s: any, idx: number) => ({
              id: `db-item-${q.id}-${idx}`,
              isManual: !s.service_id,
              serviceName: s.service_name || `Service #${s.service_id}`,
              description: s.service_description || '',
              qty: Number(s.qty || 1),
              unitPrice: Number(s.price || 0),
              discount: Number(s.dis || 0),
            }));
          }

          if (items.length === 0) {
            const serviceTitle = q.service_name || 'Professional Tax & Legal Services';
            items = [
              {
                id: `db-item-${q.id}-0`,
                isManual: false,
                serviceName: serviceTitle,
                description: q.note || '',
                qty: 1,
                unitPrice: Number(q.total_amount || 0),
                discount: 0,
              },
            ];
          }

          const createdAt = q.created_at
            ? new Date(q.created_at).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0];

          return {
            id: `db-${q.id}`,
            quotationNo: `ETAX/${createdAt.slice(0, 4)}/${String(q.id).padStart(4, '0')}`,
            customerName: q.client_name || q.customer_name || q.name || `Lead #${q.lead_id}`,
            companyName: q.company_name || '',
            mobile: q.contact || q.mobile || '',
            email: q.email || '',
            address: q.city || q.address || '',
            date: createdAt,
            validUntil: '',
            createdBy: q.created_by || 'Sales Desk',
            status: (q.status as any) || 'Sent',
            subject: q.note || q.service_name || 'Tax & Legal Services Quotation',
            items,
            overallDiscount,
            notes:
              q.note ||
              'Payment terms: 50% advance along with order confirmation, balance 50% upon service completion.',
          } as QuotationRecord;
        });

        setQuotations(mapped);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  // Handle auto-fill if navigated from Lead page state
  useEffect(() => {
    if (location.state && (location.state as any).lead) {
      const lead = (location.state as any).lead;
      handleCreateNewFromLead(lead);
    }
  }, [location.state]);

  const handleCreateNewFromLead = (lead: any) => {
    const today = new Date().toISOString().split('T')[0];
    const validDate = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];
    const nextNo = `ETAX/2026/${String(Math.floor(1000 + Math.random() * 9000))}`;

    let matchedService: ServiceOption | undefined;
    if (lead.service) {
      matchedService = servicesList.find((s) =>
        s.service_name.toLowerCase().includes(String(lead.service).toLowerCase())
      );
    }

    const defaultItem: QuotationItem = matchedService
      ? {
          id: `item-${Date.now()}`,
          isManual: false,
          serviceName: matchedService.service_name,
          description:
            matchedService.description ||
            `${matchedService.service_name} professional service package.`,
          qty: 1,
          unitPrice: matchedService.service_price,
          discount: 0,
        }
      : {
          id: `item-${Date.now()}`,
          isManual: true,
          serviceName: lead.service || 'Tax & Legal Consultation',
          description: 'Comprehensive tax and compliance consultancy service.',
          qty: 1,
          unitPrice: 2500,
          discount: 0,
        };

    const newQ: QuotationRecord = {
      id: `q-${Date.now()}`,
      quotationNo: nextNo,
      customerName: lead.name || lead.contact_name || '',
      companyName: lead.company_name || lead.business_name || '',
      mobile: lead.mobile || lead.phone || lead.contact || '',
      email: lead.email || '',
      address: [lead.city, lead.state].filter(Boolean).join(', ') || '',
      date: today,
      validUntil: validDate,
      createdBy: 'Sales Desk',
      status: 'Draft',
      subject: lead.service ? `Quotation for ${lead.service}` : 'Tax & Legal Services Proposal',
      items: [defaultItem],
      overallDiscount: 0,
      notes:
        'Payment terms: 50% advance along with order confirmation, balance 50% upon service completion.',
    };

    setActiveQuote(newQ);
    setCurrentView('edit');
    showToast(`Draft quotation initialized for lead "${newQ.customerName}"`);
  };

  const getItemAmt = (item: QuotationItem) => {
    const base = (item.qty || 0) * (item.unitPrice || 0);
    const disc = item.discount || 0;
    return Math.max(0, base - disc);
  };

  const getTotals = (q: QuotationRecord) => {
    const subtotal = q.items.reduce(
      (sum, item) => sum + (item.qty || 0) * (item.unitPrice || 0),
      0
    );
    const itemDiscounts = q.items.reduce((sum, item) => sum + (item.discount || 0), 0);
    const afterItemDiscounts = Math.max(0, subtotal - itemDiscounts);
    const overallDisc = q.overallDiscount || 0;
    const finalTotal = Math.max(0, afterItemDiscounts - overallDisc);
    return { subtotal, itemDiscounts, overallDisc, finalTotal };
  };

  const handleCreateNew = () => {
    const today = new Date().toISOString().split('T')[0];
    const validDate = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];
    const nextNo = `ETAX/2026/${String(Math.floor(1000 + Math.random() * 9000))}`;

    const firstService = servicesList[0] || DEFAULT_SERVICES[0];

    const newQ: QuotationRecord = {
      id: `q-${Date.now()}`,
      quotationNo: nextNo,
      customerName: '',
      companyName: '',
      mobile: '',
      email: '',
      address: '',
      date: today,
      validUntil: validDate,
      createdBy: 'Sales Desk',
      status: 'Draft',
      subject: 'Professional Tax & Legal Services Quotation',
      items: [
        {
          id: `item-${Date.now()}`,
          isManual: false,
          serviceName: firstService.service_name,
          description:
            firstService.description || `${firstService.service_name} comprehensive package.`,
          qty: 1,
          unitPrice: firstService.service_price,
          discount: 0,
        },
      ],
      overallDiscount: 0,
      notes:
        'Payment terms: 50% advance along with order confirmation, balance 50% upon delivery of incorporation/service certificates.',
    };

    setActiveQuote(newQ);
    setCurrentView('edit');
  };

  const handleEdit = (q: QuotationRecord) => {
    setActiveQuote(JSON.parse(JSON.stringify(q)));
    setCurrentView('edit');
  };

  const handlePreview = (q: QuotationRecord) => {
    setActiveQuote(q);
    setCurrentView('preview');
  };

  const handleDuplicate = (q: QuotationRecord) => {
    const today = new Date().toISOString().split('T')[0];
    const validDate = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];
    const dup: QuotationRecord = {
      ...JSON.parse(JSON.stringify(q)),
      id: `q-${Date.now()}`,
      quotationNo: `ETAX/2026/${String(Math.floor(1000 + Math.random() * 9000))}`,
      date: today,
      validUntil: validDate,
      status: 'Draft',
    };
    setQuotations([dup, ...quotations]);
    showToast(`Quotation copied as ${dup.quotationNo}`);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      setQuotations(quotations.filter((q) => q.id !== id));
      showToast('Quotation deleted successfully');
    }
  };

  const handleSelectLeadToFill = (leadIdStr: string) => {
    if (!activeQuote) return;
    if (!leadIdStr) {
      setActiveQuote({
        ...activeQuote,
        leadId: undefined,
      });
      return;
    }
    const lead = leadsList.find((l) => String(l.id) === leadIdStr);
    if (lead) {
      let updatedItems = [...activeQuote.items];
      let updatedSubject = activeQuote.subject;

      if (lead.service) {
        const matched = servicesList.find((s) =>
          s.service_name.toLowerCase().includes(String(lead.service).toLowerCase())
        );
        if (matched) {
          updatedItems = [
            {
              id: `item-${Date.now()}`,
              isManual: false,
              serviceName: matched.service_name,
              description:
                matched.description || `${matched.service_name} standard service package.`,
              qty: 1,
              unitPrice: matched.service_price,
              discount: 0,
            },
          ];
          updatedSubject = `Quotation for ${matched.service_name}`;
        } else {
          updatedSubject = `Quotation for ${lead.service}`;
        }
      }

      setActiveQuote({
        ...activeQuote,
        leadId: lead.id,
        customerName: lead.name,
        mobile: lead.mobile || activeQuote.mobile,
        email: lead.email || activeQuote.email,
        address: [lead.city, lead.state].filter(Boolean).join(', ') || activeQuote.address,
        subject: updatedSubject,
        items: updatedItems,
      });
      showToast(`Selected Lead: "${lead.name}" — info auto-populated!`);
    }
  };

  const handleAddProductRow = () => {
    if (!activeQuote) return;
    const firstService = servicesList[0] || DEFAULT_SERVICES[0];
    const newItem: QuotationItem = {
      id: `item-${Date.now()}`,
      isManual: false,
      serviceName: firstService.service_name,
      description:
        firstService.description || `${firstService.service_name} standard service package.`,
      qty: 1,
      unitPrice: firstService.service_price,
      discount: 0,
    };
    setActiveQuote({
      ...activeQuote,
      items: [...activeQuote.items, newItem],
    });
  };

  const handleAddCustomRow = () => {
    if (!activeQuote) return;
    const newItem: QuotationItem = {
      id: `item-${Date.now()}`,
      isManual: true,
      serviceName: '',
      description: '',
      qty: 1,
      unitPrice: 0,
      discount: 0,
    };
    setActiveQuote({
      ...activeQuote,
      items: [...activeQuote.items, newItem],
    });
  };

  const handleRemoveRow = (id: string) => {
    if (!activeQuote) return;
    if (activeQuote.items.length <= 1) {
      alert('Quotation must have at least 1 item.');
      return;
    }
    setActiveQuote({
      ...activeQuote,
      items: activeQuote.items.filter((it) => it.id !== id),
    });
  };

  const handleSelectProductForItem = (itemId: string, serviceName: string) => {
    if (!activeQuote) return;
    const selectedService = servicesList.find((s) => s.service_name === serviceName);
    if (!selectedService) return;

    setActiveQuote({
      ...activeQuote,
      items: activeQuote.items.map((it) => {
        if (it.id === itemId) {
          return {
            ...it,
            serviceName: selectedService.service_name,
            unitPrice: selectedService.service_price,
            description:
              selectedService.description ||
              `${selectedService.service_name} standard service package.`,
          };
        }
        return it;
      }),
    });
  };

  const handleUpdateItemField = (itemId: string, field: keyof QuotationItem, value: any) => {
    if (!activeQuote) return;
    setActiveQuote({
      ...activeQuote,
      items: activeQuote.items.map((it) => {
        if (it.id === itemId) {
          return { ...it, [field]: value };
        }
        return it;
      }),
    });
  };

  const handleSaveQuotation = () => {
    if (!activeQuote) return;
    if (!activeQuote.customerName.trim()) {
      alert('Please enter or select Customer Name.');
      return;
    }

    const idx = quotations.findIndex((q) => q.id === activeQuote.id);
    if (idx >= 0) {
      const updated = [...quotations];
      updated[idx] = activeQuote;
      setQuotations(updated);
    } else {
      setQuotations([activeQuote, ...quotations]);
    }

    // Persist new quotation to database API
    const totals = getTotals(activeQuote);
    fetch(`${API_BASE}/v1/crm/quotations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lead_id: activeQuote.leadId || 1,
        client_name: activeQuote.customerName,
        total: totals.finalTotal,
        note: activeQuote.subject || activeQuote.notes,
        service_name: activeQuote.items[0]?.serviceName || 'Tax Advisory Service',
      }),
    }).catch(() => {});

    showToast(`Quotation ${activeQuote.quotationNo} saved successfully!`);
    setCurrentView('list');
  };

  const handleSendWhatsApp = (q: QuotationRecord) => {
    setActiveQuote(q);
    setCurrentView('preview');
    const totals = getTotals(q);
    const text = `Hello ${q.customerName},\n\nGreetings from Etaxwala Corporate Services!\n\nHere is your official Quotation (*${q.quotationNo}*) dated ${q.date}.\n*Subject:* ${q.subject || 'Tax & Legal Services'}\n\n*Total Amount:* ₹${totals.finalTotal.toLocaleString('en-IN')}\n\nPlease review the official PDF attached and let us know if you have any questions.\n\nThank you,\nEtaxwala Team\nContact: +91 98765 43210`;
    const encoded = encodeURIComponent(text);
    const cleanPhone = (q.mobile || '').replace(/\D/g, '');
    const url = cleanPhone
      ? `https://api.whatsapp.com/send?phone=91${cleanPhone.slice(-10)}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(url, '_blank');
    showToast('Quotation preview opened! Click "Print / Download PDF" to attach PDF in WhatsApp.');
  };

  const filteredQuotations = quotations.filter((q) => {
    const term = searchTerm.toLowerCase();
    return (
      q.quotationNo.toLowerCase().includes(term) ||
      q.customerName.toLowerCase().includes(term) ||
      (q.companyName && q.companyName.toLowerCase().includes(term)) ||
      q.mobile.includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-sans">
      <style>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          .letterhead-container {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}</style>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-700 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce no-print">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}

      {/* VIEW 1: QUOTATIONS LIST VIEW */}
      {currentView === 'list' && (
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Top Title Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-slate-900">Sales Quotations</h1>
                    <span className="bg-blue-100 text-blue-700 font-extrabold text-xs px-2.5 py-0.5 rounded-full border border-blue-200">
                      {loading
                        ? 'Loading...'
                        : `${quotations.length.toLocaleString('en-IN')} Total`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Generate & manage official proposals loaded directly from database
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleCreateNew}
              className="btn-multicolor inline-flex items-center justify-center gap-2 px-5 py-2.5 font-semibold text-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Create New Quotation
            </button>
          </div>

          {/* Search and Table Controls */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/50">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by quote no, client, mobile..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>Per page:</span>
                <select
                  value={entriesPerPage}
                  onChange={(e) => {
                    setEntriesPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1 font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value={25}>25 entries</option>
                  <option value={50}>50 entries</option>
                  <option value={100}>100 entries</option>
                  <option value={500}>500 entries</option>
                  <option value={999999}>Show All ({quotations.length})</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-100/70 text-slate-600 font-semibold text-xs uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Quote No</th>
                    <th className="py-3.5 px-4">Client / Company</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(() => {
                    const totalEntries = filteredQuotations.length;
                    const totalPages = Math.ceil(totalEntries / (entriesPerPage || 1)) || 1;
                    const safePage = Math.min(currentPage, totalPages);
                    const startIndex = (safePage - 1) * entriesPerPage;
                    const paginated =
                      entriesPerPage >= totalEntries
                        ? filteredQuotations
                        : filteredQuotations.slice(startIndex, startIndex + entriesPerPage);

                    if (loading) {
                      return (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                              <span className="text-sm font-medium">
                                Loading all quotations from database...
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    if (paginated.length === 0) {
                      return (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400">
                            No quotations found matching your search.
                          </td>
                        </tr>
                      );
                    }

                    return paginated.map((q) => {
                      const totals = getTotals(q);
                      return (
                        <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-blue-600">
                            {q.quotationNo}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900">{q.customerName}</div>
                            {q.companyName && (
                              <div className="text-xs text-slate-500">{q.companyName}</div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-xs">
                            <div>{q.mobile}</div>
                            {q.email && <div className="text-slate-400">{q.email}</div>}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-500">{q.date}</td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            ₹{totals.finalTotal.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                q.status === 'Sent'
                                  ? 'bg-blue-100 text-blue-700'
                                  : q.status === 'Accepted'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {q.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handlePreview(q)}
                                title="Print Preview / Letterhead"
                                className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleSendWhatsApp(q)}
                                title="Send on WhatsApp"
                                className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(q)}
                                title="Edit Quotation"
                                className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all cursor-pointer"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDuplicate(q)}
                                title="Copy / Duplicate"
                                className="p-1.5 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all cursor-pointer"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(q.id)}
                                title="Delete"
                                className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            {filteredQuotations.length > 0 && (
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                {(() => {
                  const totalEntries = filteredQuotations.length;
                  const totalPages = Math.ceil(totalEntries / (entriesPerPage || 1)) || 1;
                  const safePage = Math.min(currentPage, totalPages);
                  const startIndex = (safePage - 1) * entriesPerPage;
                  const endIndex = Math.min(startIndex + entriesPerPage, totalEntries);

                  return (
                    <>
                      <div>
                        Showing <span className="font-bold text-slate-800">{startIndex + 1}</span>{' '}
                        to <span className="font-bold text-slate-800">{endIndex}</span> of{' '}
                        <span className="font-bold text-slate-800">
                          {totalEntries.toLocaleString('en-IN')}
                        </span>{' '}
                        entries
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          disabled={currentPage <= 1}
                          onClick={() => setCurrentPage(1)}
                          className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          First
                        </button>
                        <button
                          disabled={currentPage <= 1}
                          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                          className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" /> Prev
                        </button>
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg border border-blue-100">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          disabled={currentPage >= totalPages}
                          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                          className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                        >
                          Next <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={currentPage >= totalPages}
                          onClick={() => setCurrentPage(totalPages)}
                          className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          Last
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: EDIT / CREATE QUOTATION FORM VIEW */}
      {currentView === 'edit' && activeQuote && (
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header Action Bar */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentView('list')}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  {activeQuote.id.startsWith('q-') ? 'Edit Quotation' : 'Create Quotation'} (
                  {activeQuote.quotationNo})
                </h1>
                <p className="text-xs text-slate-500">
                  Fill in customer details and select services or add custom items
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePreview(activeQuote)}
                className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
              >
                <Eye className="w-3.5 h-3.5" />
                Print Preview
              </button>
              <button
                onClick={handleSaveQuotation}
                className="btn-multicolor inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Save Quotation
              </button>
            </div>
          </div>

          {/* Section 1: Customer Details */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                1. Customer & Lead Details
              </h2>
            </div>

            {/* Prominent Lead Selection Box */}
            <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-100 space-y-1">
              <label className="block text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                Select Lead (Auto-populates Name, Mobile & Service) *
              </label>
              <select
                value={activeQuote.leadId || ''}
                onChange={(e) => handleSelectLeadToFill(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-blue-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer"
              >
                <option value="">-- Select Existing Lead from CRM --</option>
                {leadsList.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} {l.mobile ? `(${l.mobile})` : ''} {l.city ? `— ${l.city}` : ''}{' '}
                    {l.service ? ` [${l.service}]` : ''}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-blue-600 font-medium pt-0.5">
                Choose a lead from the list or fill customer details manually below.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={activeQuote.customerName}
                  onChange={(e) => setActiveQuote({ ...activeQuote, customerName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Company / Organization
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apex Tech Pvt Ltd"
                  value={activeQuote.companyName || ''}
                  onChange={(e) => setActiveQuote({ ...activeQuote, companyName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Mobile Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210"
                  value={activeQuote.mobile}
                  onChange={(e) => setActiveQuote({ ...activeQuote, mobile: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. client@example.com"
                  value={activeQuote.email}
                  onChange={(e) => setActiveQuote({ ...activeQuote, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Full Billing Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Plot No. 42, Tech Park, Sector 62, Noida, UP"
                  value={activeQuote.address}
                  onChange={(e) => setActiveQuote({ ...activeQuote, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Quotation Date
                </label>
                <input
                  type="date"
                  value={activeQuote.date}
                  onChange={(e) => setActiveQuote({ ...activeQuote, date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Valid Until Date
                </label>
                <input
                  type="date"
                  value={activeQuote.validUntil || ''}
                  onChange={(e) => setActiveQuote({ ...activeQuote, validUntil: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  placeholder="Subject / Proposal Title"
                  value={activeQuote.subject || ''}
                  onChange={(e) => setActiveQuote({ ...activeQuote, subject: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Items & Services Editor */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  2. Line Items & Services
                </h2>
                <p className="text-xs text-slate-500">
                  Select standard services or add custom items. Standard descriptions print on
                  letterhead.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddProductRow}
                  className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-emerald-200 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Product (Dropdown)
                </button>
                <button
                  type="button"
                  onClick={handleAddCustomRow}
                  className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-blue-200 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Custom Item
                </button>
              </div>
            </div>

            {/* Item Rows */}
            <div className="space-y-4">
              {activeQuote.items.map((item, index) => {
                const itemAmount = getItemAmt(item);

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition-all ${
                      item.isManual
                        ? 'bg-blue-50/30 border-blue-200'
                        : 'bg-emerald-50/20 border-emerald-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500">Item #{index + 1}</span>
                        {item.isManual ? (
                          <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Custom Row
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Product (Dropdown)
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveRow(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors"
                        title="Remove row"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                      {/* Name / Dropdown Column */}
                      <div className="md:col-span-6">
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                          {item.isManual ? 'Custom Service Name *' : 'Select Product / Service *'}
                        </label>

                        {item.isManual ? (
                          /* Custom Item Name Input */
                          <input
                            type="text"
                            placeholder="Enter service name (e.g. Legal Advisory Fee)"
                            value={item.serviceName}
                            onChange={(e) =>
                              handleUpdateItemField(item.id, 'serviceName', e.target.value)
                            }
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          /* Standard Service Select Dropdown */
                          <select
                            value={item.serviceName}
                            onChange={(e) => handleSelectProductForItem(item.id, e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {servicesList.map((s) => (
                              <option key={s.service_id} value={s.service_name}>
                                {s.service_name} — ₹{s.service_price.toLocaleString('en-IN')}
                              </option>
                            ))}
                          </select>
                        )}

                        {/* Description field — editable for all service items */}
                        <div className="mt-2">
                          <label className="block text-[10px] font-medium text-slate-500 mb-1">
                            Item Description / Service Scope{' '}
                            <span className="text-slate-400 font-normal">
                              (prints on official preview)
                            </span>
                          </label>
                          <textarea
                            rows={2}
                            placeholder="Enter service scope, included features, or custom notes..."
                            value={item.description || ''}
                            onChange={(e) =>
                              handleUpdateItemField(item.id, 'description', e.target.value)
                            }
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {/* Qty */}
                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                          Qty
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={item.qty}
                          onChange={(e) =>
                            handleUpdateItemField(
                              item.id,
                              'qty',
                              Math.max(1, parseInt(e.target.value) || 1)
                            )
                          }
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Unit Price */}
                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                          Price (₹)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleUpdateItemField(
                              item.id,
                              'unitPrice',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Item Discount */}
                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                          Disc (₹)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={item.discount}
                          onChange={(e) =>
                            handleUpdateItemField(
                              item.id,
                              'discount',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="mt-2 text-right text-xs font-bold text-slate-700">
                      Line Total: ₹{itemAmount.toLocaleString('en-IN')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Notes & Totals */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-7 space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Terms & Conditions / Special Notes
              </label>
              <textarea
                rows={4}
                value={activeQuote.notes}
                onChange={(e) => setActiveQuote({ ...activeQuote, notes: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Payment terms, bank details, delivery timeline..."
              />
            </div>

            <div className="md:col-span-5 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              {(() => {
                const totals = getTotals(activeQuote);
                return (
                  <>
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Subtotal:</span>
                      <span className="font-semibold">
                        ₹{totals.subtotal.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {totals.itemDiscounts > 0 && (
                      <div className="flex justify-between text-xs text-emerald-600">
                        <span>Item Discounts:</span>
                        <span className="font-semibold">
                          - ₹{totals.itemDiscounts.toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-200">
                      <span>Overall Discount (₹):</span>
                      <input
                        type="number"
                        min={0}
                        value={activeQuote.overallDiscount}
                        onChange={(e) =>
                          setActiveQuote({
                            ...activeQuote,
                            overallDiscount: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-28 px-2 py-1 bg-white border border-slate-300 rounded-lg text-right font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-300">
                      <span>Grand Total:</span>
                      <span className="text-blue-600">
                        ₹{totals.finalTotal.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 italic text-right pt-1">
                      {numberToWords(totals.finalTotal)}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: PRINT PREVIEW / LETTERHEAD VIEW */}
      {currentView === 'preview' && activeQuote && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Top Control Bar (Hidden on Print) */}
          <div className="no-print flex items-center justify-between bg-slate-900 text-white p-4 rounded-2xl shadow-xl">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentView('list')}
                className="p-2 hover:bg-slate-800 rounded-xl text-slate-300 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-base font-bold">Print Preview — Quotation Letterhead</h1>
                <p className="text-xs text-slate-400">
                  Ready to print or save as PDF. Press Print or CTRL+P.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentView('edit')}
                className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Quote
              </button>
              <button
                onClick={() => handleSendWhatsApp(activeQuote)}
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Share WhatsApp
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / Download PDF
              </button>
            </div>
          </div>

          {/* OFFICIAL LETTERHEAD CONTAINER */}
          <div className="letterhead-container bg-white rounded-2xl border border-slate-200 shadow-xl p-8 md:p-12 text-slate-800 font-sans relative">
            {/* Header Top Accent Bar */}
            <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 rounded-t-xl -mx-8 -mt-8 md:-mx-12 md:-mt-12 mb-8" />

            {/* Letterhead Header */}
            <div className="flex flex-col md:flex-row justify-between items-start border-b border-slate-200 pb-6 mb-6 gap-6">
              {/* Brand Logo & Name */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <img
                    src="/logo_black.png"
                    alt="ETaxwala"
                    className="h-12 w-auto object-contain"
                    style={{ maxWidth: '180px' }}
                  />
                </div>
                <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                  Etaxwala Corporate Services Private Limited
                  <br />
                  CIN: U74999MH2021PTC361234 | GSTIN: 27AAACE1234H1Z5
                  <br />
                  Corporate Office: 402 Business Bay, M.G. Road, Pune - 411001
                </p>
              </div>

              {/* Quotation Metadata Box */}
              <div className="text-right space-y-1 self-stretch md:self-auto flex flex-col justify-between md:justify-start">
                <div className="inline-block bg-slate-100 text-slate-900 font-black text-xl px-4 py-1.5 rounded-xl border border-slate-200 uppercase tracking-wider">
                  QUOTATION
                </div>
                <div className="pt-2 text-xs text-slate-600 space-y-1">
                  <div>
                    <span className="font-semibold text-slate-500">Quote No: </span>
                    <span className="font-bold text-slate-900">{activeQuote.quotationNo}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500">Date: </span>
                    <span className="font-medium text-slate-800">{activeQuote.date}</span>
                  </div>
                  {activeQuote.validUntil && (
                    <div>
                      <span className="font-semibold text-slate-500">Valid Until: </span>
                      <span className="font-medium text-slate-800">{activeQuote.validUntil}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Billed To & Subject */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/70 p-5 rounded-xl border border-slate-100 mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  PREPARED FOR (CLIENT)
                </span>
                <div className="font-bold text-base text-slate-900">{activeQuote.customerName}</div>
                {activeQuote.companyName && (
                  <div className="text-sm font-semibold text-slate-700">
                    {activeQuote.companyName}
                  </div>
                )}
                {activeQuote.address && (
                  <div className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {activeQuote.address}
                  </div>
                )}
                <div className="text-xs text-slate-500 mt-1">
                  {activeQuote.mobile && <span>Ph: +91 {activeQuote.mobile}</span>}
                  {activeQuote.email && <span className="ml-3">Email: {activeQuote.email}</span>}
                </div>
              </div>

              <div className="md:text-right flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    SUBJECT / SCOPE
                  </span>
                  <div className="font-semibold text-sm text-slate-800 italic">
                    "{activeQuote.subject || 'Professional Service Proposal'}"
                  </div>
                </div>
                <div className="text-xs text-slate-500 pt-2">
                  <span className="font-semibold">Prepared By: </span>
                  {activeQuote.createdBy || 'Sales Desk'}
                </div>
              </div>
            </div>

            {/* LINE ITEMS TABLE (WITH DESCRIPTIONS FOR ALL ITEMS) */}
            <div className="mb-6 overflow-hidden border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-3 w-12 text-center">Sr.</th>
                    <th className="py-3 px-4">Service & Description</th>
                    <th className="py-3 px-3 text-center w-16">Qty</th>
                    <th className="py-3 px-4 text-right w-24">Unit Price</th>
                    <th className="py-3 px-4 text-right w-24">Discount</th>
                    <th className="py-3 px-4 text-right w-28">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {activeQuote.items.map((item, index) => {
                    const lineTotal = getItemAmt(item);
                    return (
                      <tr key={item.id} className="align-top hover:bg-slate-50/50">
                        <td className="py-3.5 px-3 text-center font-bold text-slate-400">
                          {index + 1}
                        </td>
                        <td className="py-3.5 px-4 space-y-1">
                          <div className="font-bold text-slate-900 text-sm">{item.serviceName}</div>
                          {item.description && (
                            <div className="text-slate-600 text-xs leading-relaxed italic bg-slate-50/50 p-2 rounded border border-slate-100/80">
                              {item.description}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-center font-semibold text-slate-800">
                          {item.qty}
                        </td>
                        <td className="py-3.5 px-4 text-right text-slate-800">
                          ₹{item.unitPrice.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 text-right text-slate-500">
                          {item.discount > 0 ? `₹${item.discount.toLocaleString('en-IN')}` : '-'}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                          ₹{lineTotal.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* TOTALS & SUMMARY SECTION */}
            {(() => {
              const totals = getTotals(activeQuote);
              return (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start border-b border-slate-200 pb-6 mb-6">
                  {/* Amount in words */}
                  <div className="md:col-span-7 bg-blue-50/40 p-4 rounded-xl border border-blue-100">
                    <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block mb-1">
                      AMOUNT IN WORDS
                    </span>
                    <div className="text-sm font-bold text-slate-800 italic">
                      {numberToWords(totals.finalTotal)}
                    </div>
                  </div>

                  {/* Totals Breakdown */}
                  <div className="md:col-span-5 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600 py-1 border-b border-slate-100">
                      <span>Subtotal</span>
                      <span className="font-semibold text-slate-800">
                        ₹{totals.subtotal.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {totals.itemDiscounts > 0 && (
                      <div className="flex justify-between text-emerald-600 py-1 border-b border-slate-100">
                        <span>Item Discounts</span>
                        <span className="font-semibold">
                          - ₹{totals.itemDiscounts.toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}

                    {totals.overallDisc > 0 && (
                      <div className="flex justify-between text-emerald-600 py-1 border-b border-slate-100">
                        <span>Additional Discount</span>
                        <span className="font-semibold">
                          - ₹{totals.overallDisc.toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t-2 border-slate-900">
                      <span>Grand Total</span>
                      <span className="text-blue-700">
                        ₹{totals.finalTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* BANK DETAILS & TERMS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-xs">
              {/* Bank Transfer Details */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block mb-2 border-b border-slate-200 pb-1">
                  BANK ACCOUNT DETAILS FOR PAYMENT
                </span>
                <div className="space-y-1 text-slate-700">
                  <div>
                    <span className="font-semibold text-slate-500">Account Name: </span>
                    <span className="font-bold text-slate-900">
                      Etaxwala Corporate Services Pvt Ltd
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500">Bank Name: </span>HDFC Bank Ltd
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500">Account No: </span>50200067891234
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500">IFSC Code: </span>HDFC0000123
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500">Branch: </span>M.G. Road Branch,
                    Pune
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500">UPI ID: </span>etaxwala@hdfcbank
                  </div>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block mb-2 border-b border-slate-200 pb-1">
                  TERMS & CONDITIONS
                </span>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                  {activeQuote.notes ||
                    '1. Quotation is valid for 15 days from issue date.\n2. 50% advance along with order confirmation, balance on delivery.\n3. Government statutory fees subject to actual portal charges.\n4. All disputes subject to Pune jurisdiction.'}
                </p>
              </div>
            </div>

            {/* SIGNATURE SECTION */}
            <div className="flex justify-between items-end pt-6 border-t border-slate-200 text-xs">
              <div className="text-slate-400 italic">
                This is a computer-generated quotation statement.
              </div>

              <div className="text-right space-y-4">
                <div className="text-slate-900 font-bold">
                  For Etaxwala Corporate Services Pvt Ltd
                </div>
                <div className="h-12 flex items-center justify-end">
                  <div className="px-4 py-1.5 border-2 border-dashed border-blue-300 text-blue-600 rounded-lg font-serif italic text-xs font-bold bg-blue-50/50">
                    [ Authorized Signatory & Seal ]
                  </div>
                </div>
                <div className="text-slate-600 font-medium">Authorized Signatory</div>
              </div>
            </div>

            {/* Bottom Footer Line */}
            <div className="mt-8 pt-4 border-t border-slate-100 text-center text-[10px] text-slate-400">
              Etaxwala Corporate Services Pvt Ltd | www.etaxwala.com | Support: +91 98765 43210 |
              support@etaxwala.com
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CrmQuotationsPage;
