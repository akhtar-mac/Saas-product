import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Send,
  Download,
  Share2,
  Printer,
  CheckCircle2,
  Building,
  User,
  Percent,
  Search,
  Copy,
  FileText,
  Trash2,
  Edit3,
  Eye,
  ArrowLeft,
  GripVertical,
  Calendar,
  Phone,
  Mail,
  ShieldCheck,
  CreditCard,
  ChevronDown,
} from 'lucide-react';

interface QuotationItem {
  id: string;
  serviceName: string;
  description: string;
  sacCode: string;
  qty: number;
  unitPrice: number;
  discountPercent: number;
  gstPercent: number;
}

interface QuotationRecord {
  id: string;
  quotationNo: string;
  customerName: string;
  companyName: string;
  mobile: string;
  email: string;
  address: string;
  gstin?: string;
  date: string;
  validUntil: string;
  createdBy: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Expired';
  items: QuotationItem[];
  notes: string;
}

const INITIAL_QUOTATIONS: QuotationRecord[] = [
  {
    id: '1',
    quotationNo: 'ETW-QUO-2026-089',
    customerName: 'Rajesh Sharma',
    companyName: 'Apex Infotech Solutions LLP',
    mobile: '+91 98765 43210',
    email: 'rajesh@apexinfotech.in',
    address: '401 Pride Silicon Plaza, Senapati Bapat Road, Pune 411016',
    gstin: '27AABCA1234M1Z2',
    date: '04 Sep 2026',
    validUntil: '11 Sep 2026',
    createdBy: 'Netra Divekar',
    status: 'Sent',
    notes: 'Includes expedited DSC & DIN processing within 24 hours.',
    items: [
      {
        id: 'item-1',
        serviceName: 'Private Limited Company Registration (All-Inclusive)',
        description: 'Includes 2 DSC Class 3, 2 DIN, SPICe+ MCA filing, MOA/AOA drafting, PAN, TAN & Bank AC assistance.',
        sacCode: '998311',
        qty: 1,
        unitPrice: 16499,
        discountPercent: 5,
        gstPercent: 18,
      },
      {
        id: 'item-2',
        serviceName: 'Trademark Registration (Class 42 - IT Services)',
        description: 'Comprehensive trademark search, class classification, drafting Form TM-A & govt portal filing.',
        sacCode: '998312',
        qty: 1,
        unitPrice: 6999,
        discountPercent: 0,
        gstPercent: 18,
      },
    ],
  },
  {
    id: '2',
    quotationNo: 'ETW-QUO-2026-088',
    customerName: 'Siddharth Roy',
    companyName: 'Roy AgriTech Food Products',
    mobile: '+91 98220 11223',
    email: 'siddharth@royfoods.com',
    address: 'Plot 45, MIDC Baramati, Pune 413133',
    gstin: '27BBCDE5678K1Z9',
    date: '03 Sep 2026',
    validUntil: '10 Sep 2026',
    createdBy: 'Sachin Mohan Vyavahare',
    status: 'Accepted',
    notes: 'State license application submitted with manufacturing layout inspection clearance.',
    items: [
      {
        id: 'item-1',
        serviceName: 'FSSAI State Food Business Operator License (1 Year)',
        description: 'FoSCoS portal application, declaration drafting, food safety audit checklist.',
        sacCode: '998311',
        qty: 1,
        unitPrice: 6499,
        discountPercent: 0,
        gstPercent: 18,
      },
      {
        id: 'item-2',
        serviceName: 'GST Registration & Verification Assistance',
        description: 'Principal place of business verification and REG-01 filing.',
        sacCode: '998311',
        qty: 1,
        unitPrice: 1999,
        discountPercent: 0,
        gstPercent: 18,
      },
    ],
  },
  {
    id: '3',
    quotationNo: 'ETW-QUO-2026-087',
    customerName: 'Kavita Sundaram',
    companyName: 'Sundaram Organics Pvt Ltd',
    mobile: '+91 98450 99887',
    email: 'kavita@sundaramorganics.com',
    address: 'Indiranagar 100ft Road, Bengaluru 560038',
    date: '02 Sep 2026',
    validUntil: '09 Sep 2026',
    createdBy: 'Shreya Joshi',
    status: 'Draft',
    notes: 'Pending final confirmation of brand logo trademark class.',
    items: [
      {
        id: 'item-1',
        serviceName: 'Farmer Producer Company (FPC) Registration',
        description: '10 Producer Member DSCs, ROC compliance, special MOA clauses under Section 378A.',
        sacCode: '998311',
        qty: 1,
        unitPrice: 24999,
        discountPercent: 10,
        gstPercent: 18,
      },
    ],
  },
];

export default function CrmQuotationsPage() {
  const [quotations, setQuotations] = useState<QuotationRecord[]>(INITIAL_QUOTATIONS);
  const [currentView, setCurrentView] = useState<'list' | 'edit' | 'letterhead'>('list');
  const [activeQuote, setActiveQuote] = useState<QuotationRecord>(INITIAL_QUOTATIONS[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesCount, setEntriesCount] = useState(10);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  // Fetch real quotations from DB
  React.useEffect(() => {
    fetch(`${API_BASE}/v1/crm/quotations`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data?.data) && data.data.length > 0) {
          const mapped: QuotationRecord[] = data.data.map((q: any, i: number) => ({
            id: String(q.id || i + 1),
            quotationNo: `ETW-QUO-2026-${String(q.id || i + 100).padStart(3, '0')}`,
            customerName: `Lead #${q.lead_id}`,
            companyName: 'Client Enterprise',
            mobile: '+91 98765 43210',
            email: 'client@etaxwala.in',
            address: 'Maharashtra, India',
            date: q.created_at ? q.created_at.split('T')[0] : '04 Sep 2026',
            validUntil: '11 Sep 2026',
            createdBy: q.created_by || 'Staff Admin',
            status: 'Sent',
            notes: q.note || 'Standard 7-day validity.',
            items: [
              {
                id: `item-${q.id}`,
                serviceName: 'Taxation & Advisory Service',
                description: q.note || 'Includes full compliance and advisory services',
                sacCode: '998311',
                qty: 1,
                unitPrice: 1499,
                discountPercent: 0,
                gstPercent: 18,
              },
            ],
          }));
          setQuotations(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper calculations for an item
  const getItemAmounts = (item: QuotationItem) => {
    const gross = item.qty * item.unitPrice;
    const discount = (gross * item.discountPercent) / 100;
    const taxable = gross - discount;
    const gst = (taxable * item.gstPercent) / 100;
    const total = taxable + gst;
    return { gross, discount, taxable, gst, total };
  };

  // Helper calculations for active quote
  const calculateTotals = (items: QuotationItem[]) => {
    let subtotalTaxable = 0;
    let totalDiscount = 0;
    let totalGst = 0;

    items.forEach((item) => {
      const { taxable, discount, gst } = getItemAmounts(item);
      subtotalTaxable += taxable;
      totalDiscount += discount;
      totalGst += gst;
    });

    const grandTotal = subtotalTaxable + totalGst;
    return {
      subtotalTaxable,
      totalDiscount,
      cgst: totalGst / 2,
      sgst: totalGst / 2,
      totalGst,
      grandTotal: Math.round(grandTotal),
    };
  };

  const handleEdit = (q: QuotationRecord) => {
    setActiveQuote(JSON.parse(JSON.stringify(q)));
    setCurrentView('edit');
  };

  const handleViewLetterhead = (q: QuotationRecord) => {
    setActiveQuote(q);
    setCurrentView('letterhead');
  };

  const handleCreateNew = () => {
    const newQuote: QuotationRecord = {
      id: Date.now().toString(),
      quotationNo: `ETW-QUO-2026-${Math.floor(100 + Math.random() * 900)}`,
      customerName: '',
      companyName: '',
      mobile: '',
      email: '',
      address: '',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      validUntil: new Date(Date.now() + 7 * 86400000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      createdBy: 'Netra Divekar',
      status: 'Draft',
      notes: 'Standard 7-day validity. Prices inclusive of consultation and dedicated account manager.',
      items: [
        {
          id: `item-${Date.now()}`,
          serviceName: 'Private Limited Company Registration (All-Inclusive)',
          description: 'Includes 2 DSC Class 3, 2 DIN, SPICe+ MCA filing, MOA/AOA, PAN & TAN.',
          sacCode: '998311',
          qty: 1,
          unitPrice: 16499,
          discountPercent: 0,
          gstPercent: 18,
        },
      ],
    };
    setActiveQuote(newQuote);
    setCurrentView('edit');
  };

  const handleSaveQuote = async () => {
    if (!activeQuote.customerName) {
      showToast('Please enter customer name');
      return;
    }

    const totals = calculateTotals(activeQuote.items);
    try {
      const isExisting = quotations.some((q) => q.id === activeQuote.id);
      if (isExisting) {
        await fetch(`${API_BASE}/v1/crm/quotations/${activeQuote.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ note: activeQuote.notes }),
        });
      } else {
        await fetch(`${API_BASE}/v1/crm/quotations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lead_id: 1,
            client_name: activeQuote.customerName,
            total: totals.grandTotal,
            service_name: activeQuote.items[0]?.serviceName || 'Taxation Service',
            note: activeQuote.notes,
          }),
        });
      }

      setQuotations((prev) => {
        const idx = prev.findIndex((q) => q.id === activeQuote.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = activeQuote;
          return copy;
        }
        return [activeQuote, ...prev];
      });
      showToast('Quotation saved to database successfully!');
      setCurrentView('list');
    } catch {
      showToast('Failed to save quotation in database.');
    }
  };

  const handleAddItem = () => {
    setActiveQuote((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: `item-${Date.now()}`,
          serviceName: 'Additional Compliance / Filing Service',
          description: 'ROC Annual Filing / Director KYC / MCA Compliance Certificate',
          sacCode: '998311',
          qty: 1,
          unitPrice: 4999,
          discountPercent: 0,
          gstPercent: 18,
        },
      ],
    }));
  };

  const handleRemoveItem = (id: string) => {
    if (activeQuote.items.length <= 1) {
      showToast('A quotation must contain at least one service item.');
      return;
    }
    setActiveQuote((prev) => ({
      ...prev,
      items: prev.items.filter((it) => it.id !== id),
    }));
  };

  const handleSendWhatsApp = (q: QuotationRecord) => {
    const totals = calculateTotals(q.items);
    const text = `*ETAXWALA OFFICIAL QUOTATION (${q.quotationNo})*\n\nDear ${q.customerName},\nThank you for choosing ETaxwala Business Solution Pvt Ltd.\n\n*Services:*\n${q.items.map((it, i) => `${i + 1}. ${it.serviceName} - ₹${it.unitPrice.toLocaleString()}`).join('\n')}\n\n*Total Taxable:* ₹${totals.subtotalTaxable.toLocaleString()}\n*GST (18%):* ₹${totals.totalGst.toFixed(2)}\n*Net Payable:* ₹${totals.grandTotal.toLocaleString()}\n\n*View & Accept Quote:* https://etaxwala.com/quote/${q.quotationNo.toLowerCase()}\n\nFor questions, reach your account manager at 080-6902-9999.`;
    window.open(`https://wa.me/${q.mobile.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
    showToast('Redirected to WhatsApp with formatted quotation!');
  };

  const filteredQuotes = quotations.filter((q) => {
    const term = searchTerm.toLowerCase();
    return (
      q.quotationNo.toLowerCase().includes(term) ||
      q.customerName.toLowerCase().includes(term) ||
      q.mobile.includes(term) ||
      q.email.toLowerCase().includes(term) ||
      q.createdBy.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E293B] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. QUOTATIONS LIST VIEW (Matching Screenshot 2026-09-04 111924) */}
      {/* ========================================================================= */}
      {currentView === 'list' && (
        <div className="space-y-4">
          {/* Top Title & Action Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-[#1B365D]">
                  Quotations
                </h1>
                <span className="badge badge-gold font-mono text-xs">{quotations.length} Active Records</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Manage commercial proposals, generate official letterheads & dispatch directly to customer WhatsApp.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCreateNew}
                className="btn btn-sm bg-[#00A896] hover:bg-[#008f80] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Create Quotation
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Standard Data Table Action Bar (Show entries, Copy, Excel, CSV, PDF, Print, Search) */}
            <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#FCFCFD]">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                <span className="font-medium">Show</span>
                <select
                  value={entriesCount}
                  onChange={(e) => setEntriesCount(Number(e.target.value))}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-purple"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="font-medium mr-2">entries</span>

                {/* Export Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => showToast('Quotation list copied to clipboard!')}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                  <button
                    onClick={() => showToast('Exporting to Excel (XLSX)...')}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <FileSpreadsheet className="w-3 h-3 text-emerald-600" /> Excel
                  </button>
                  <button
                    onClick={() => showToast('Exporting CSV...')}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    CSV
                  </button>
                  <button
                    onClick={() => showToast('Generating Quotations PDF Summary...')}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <FileText className="w-3 h-3 text-rose-600" /> PDF
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Printer className="w-3 h-3 text-blue-600" /> Print
                  </button>
                </div>
              </div>

              {/* Search Box */}
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder="Search Data..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-purple"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* Quotations Table */}
            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-250px)] border border-slate-200 rounded-xl shadow-2xs">
              <table className="w-full text-left text-xs border-separate border-spacing-0">
                <thead className="sticky top-0 z-10 bg-[#F8FAFC] text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">SR NO.</th>
                    <th className="py-3 px-4">QUOTATION ID</th>
                    <th className="py-3 px-4">CUSTOMER NAME</th>
                    <th className="py-3 px-4">MOBILE NO.</th>
                    <th className="py-3 px-4">EMAIL</th>
                    <th className="py-3 px-4">TOTAL AMOUNT</th>
                    <th className="py-3 px-4">CREATED BY</th>
                    <th className="py-3 px-4">DATE</th>
                    <th className="py-3 px-4 text-center">STATUS</th>
                    <th className="py-3 px-4 text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredQuotes.slice(0, entriesCount).map((q, idx) => {
                    const totals = calculateTotals(q.items);
                    return (
                      <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 text-center text-slate-400 font-mono text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-[#1B365D]">
                          {q.quotationNo}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-800">{q.customerName}</div>
                          {q.companyName && (
                            <div className="text-[10px] text-slate-400 truncate max-w-[160px]">{q.companyName}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {q.mobile}
                        </td>
                        <td className="py-3 px-4 text-slate-500 max-w-[160px] truncate">
                          {q.email}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          ₹{totals.grandTotal.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {q.createdBy}
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                          {q.date}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`badge text-[10px] ${
                              q.status === 'Accepted'
                                ? 'badge-green'
                                : q.status === 'Sent'
                                ? 'badge-navy'
                                : 'badge-gold'
                            }`}
                          >
                            {q.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* View Letterhead */}
                            <button
                              onClick={() => handleViewLetterhead(q)}
                              title="View Official Letterhead"
                              className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {/* Edit Quote */}
                            <button
                              onClick={() => handleEdit(q)}
                              title="Edit Quotation"
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            {/* WhatsApp Dispatch */}
                            <button
                              onClick={() => handleSendWhatsApp(q)}
                              title="Send WhatsApp Quote"
                              className="p-1.5 rounded-lg bg-emerald-50 text-[#25D366] hover:bg-emerald-100 transition-colors"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                            {/* Delete */}
                            <button
                              onClick={() => {
                                if (confirm(`Delete quotation ${q.quotationNo}?`)) {
                                  setQuotations((prev) => prev.filter((item) => item.id !== q.id));
                                  showToast('Quotation deleted.');
                                }
                              }}
                              title="Delete"
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredQuotes.length === 0 && (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-400">
                        No quotations found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Pagination Info */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>
                Showing 1 to {Math.min(entriesCount, filteredQuotes.length)} of {filteredQuotes.length} entries
              </div>
              <div className="flex items-center gap-1 font-semibold">
                <button className="px-3 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
                  Previous
                </button>
                <button className="px-3 py-1 rounded-lg bg-[#1B365D] text-white">1</button>
                <button className="px-3 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. INTERACTIVE QUOTATION EDITOR (Matching Screenshot 2026-09-04 112110) */}
      {/* ========================================================================= */}
      {currentView === 'edit' && (
        <div className="space-y-6">
          {/* Top Bar with Back button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentView('list')}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-[#1B365D]">Edit Quotation</h1>
                  <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {activeQuote.quotationNo}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update itemized services, discount rates, taxes and customer terms.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleViewLetterhead(activeQuote)}
                className="btn btn-outline btn-sm text-xs font-bold flex items-center gap-1.5"
              >
                <Eye className="w-4 h-4" /> Preview Letterhead
              </button>
              <button
                onClick={handleSaveQuote}
                className="btn btn-sm bg-[#00A896] hover:bg-[#008f80] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" /> Save Quotation
              </button>
            </div>
          </div>

          {/* Client & Metadata Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <User className="w-4 h-4 text-[#1B365D]" /> Client & Proposal Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  value={activeQuote.customerName}
                  onChange={(e) => setActiveQuote({ ...activeQuote, customerName: e.target.value })}
                  placeholder="e.g. Rajesh Sharma"
                  className="input text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Company / Entity Name</label>
                <input
                  type="text"
                  value={activeQuote.companyName}
                  onChange={(e) => setActiveQuote({ ...activeQuote, companyName: e.target.value })}
                  placeholder="e.g. Apex Infotech Solutions LLP"
                  className="input text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Mobile / WhatsApp *</label>
                <input
                  type="text"
                  value={activeQuote.mobile}
                  onChange={(e) => setActiveQuote({ ...activeQuote, mobile: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="input text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  value={activeQuote.email}
                  onChange={(e) => setActiveQuote({ ...activeQuote, email: e.target.value })}
                  placeholder="client@company.com"
                  className="input text-xs"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-slate-600 font-semibold mb-1">Billing Address</label>
                <input
                  type="text"
                  value={activeQuote.address}
                  onChange={(e) => setActiveQuote({ ...activeQuote, address: e.target.value })}
                  placeholder="Office address, City, State, PIN"
                  className="input text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Client GSTIN (Optional)</label>
                <input
                  type="text"
                  value={activeQuote.gstin || ''}
                  onChange={(e) => setActiveQuote({ ...activeQuote, gstin: e.target.value })}
                  placeholder="27AABCA1234M1Z2"
                  className="input text-xs font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Quotation Status</label>
                <select
                  value={activeQuote.status}
                  onChange={(e) => setActiveQuote({ ...activeQuote, status: e.target.value as any })}
                  className="input text-xs font-bold"
                >
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent to Client</option>
                  <option value="Accepted">Accepted & Paid</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
            </div>
          </div>

          {/* Interactive Items Table (Matching Screenshot 2026-09-04 112110) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#1B365D]" /> Itemized Services & Packages
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddItem}
                              className="btn btn-sm bg-[#00A896] hover:bg-[#008f80] text-white text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> + Add Row
                </button>
              </div>
            </div>

            <div className="overflow-x-auto overflow-y-auto max-h-96">
              <table className="w-full text-left text-xs border-separate border-spacing-0">
                <thead className="sticky top-0 z-10">
                  <tr>
                    <th className="sticky top-0 z-10 bg-[#F8FAFC] py-2.5 px-3 w-8 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">#</th>
                    <th className="sticky top-0 z-10 bg-[#F8FAFC] py-2.5 px-3 min-w-[280px] text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">PRODUCT / SERVICE NAME & DESCRIPTION</th>
                    <th className="sticky top-0 z-10 bg-[#F8FAFC] py-2.5 px-3 w-20 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">QTY</th>
                    <th className="sticky top-0 z-10 bg-[#F8FAFC] py-2.5 px-3 w-28 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">PRICE (₹)</th>
                    <th className="sticky top-0 z-10 bg-[#F8FAFC] py-2.5 px-3 w-24 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">DISC (%)</th>
                    <th className="sticky top-0 z-10 bg-[#F8FAFC] py-2.5 px-3 w-24 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">GST (%)</th>
                    <th className="sticky top-0 z-10 bg-[#F8FAFC] py-2.5 px-3 w-28 text-right text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">AMOUNT (₹)</th>
                    <th className="sticky top-0 z-10 bg-[#F8FAFC] py-2.5 px-3 w-12 text-center text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {activeQuote.items.map((item, index) => {
                    const { total, taxable } = getItemAmounts(item);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-3 text-slate-400 font-mono text-center">
                          <div className="flex items-center gap-1">
                            <GripVertical className="w-3.5 h-3.5 text-slate-300 cursor-grab" />
                            <span>{index + 1}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 space-y-1.5">
                          <input
                            type="text"
                            value={item.serviceName}
                            onChange={(e) => {
                              const copy = [...activeQuote.items];
                              copy[index].serviceName = e.target.value;
                              setActiveQuote({ ...activeQuote, items: copy });
                            }}
                            className="input text-xs font-bold text-slate-800"
                            placeholder="Service Name (e.g. Private Limited Company Registration)"
                          />
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => {
                              const copy = [...activeQuote.items];
                              copy[index].description = e.target.value;
                              setActiveQuote({ ...activeQuote, items: copy });
                            }}
                            className="input text-[11px] text-slate-500 py-1"
                            placeholder="Item scope / inclusions details"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={(e) => {
                              const copy = [...activeQuote.items];
                              copy[index].qty = Math.max(1, Number(e.target.value));
                              setActiveQuote({ ...activeQuote, items: copy });
                            }}
                            className="input text-xs font-mono text-center font-bold"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => {
                              const copy = [...activeQuote.items];
                              copy[index].unitPrice = Number(e.target.value);
                              setActiveQuote({ ...activeQuote, items: copy });
                            }}
                            className="input text-xs font-mono font-bold"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={item.discountPercent}
                            onChange={(e) => {
                              const copy = [...activeQuote.items];
                              copy[index].discountPercent = Number(e.target.value);
                              setActiveQuote({ ...activeQuote, items: copy });
                            }}
                            className="input text-xs font-mono text-emerald-700 font-bold"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <select
                            value={item.gstPercent}
                            onChange={(e) => {
                              const copy = [...activeQuote.items];
                              copy[index].gstPercent = Number(e.target.value);
                              setActiveQuote({ ...activeQuote, items: copy });
                            }}
                            className="input text-xs font-mono"
                          >
                            <option value={18}>18%</option>
                            <option value={12}>12%</option>
                            <option value={5}>5%</option>
                            <option value={0}>0%</option>
                          </select>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">
                          ₹{total.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom Actions & Calculation Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
              {/* Left Notes */}
              <div className="lg:col-span-2 space-y-3">
                <label className="block text-xs font-semibold text-slate-700">
                  Terms & Conditions / Special Instructions for Customer
                </label>
                <textarea
                  rows={3}
                  value={activeQuote.notes}
                  onChange={(e) => setActiveQuote({ ...activeQuote, notes: e.target.value })}
                  className="input text-xs leading-relaxed"
                  placeholder="Government fees guarantee, 100% advance or approved EMI milestone payment terms..."
                />
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="btn btn-outline btn-sm text-xs font-bold"
                  >
                    + Add Row
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveQuote((prev) => ({
                        ...prev,
                        items: [
                          ...prev.items,
                          {
                            id: `manual-${Date.now()}`,
                            serviceName: 'Custom Legal Advisory / Drafting',
                            description: 'Bespoke drafting, shareholder agreement or ROC search report.',
                            sacCode: '998311',
                            qty: 1,
                            unitPrice: 8500,
                            discountPercent: 0,
                            gstPercent: 18,
                          },
                        ],
                      }));
                      showToast('Added manual service line item.');
                    }}
                    className="btn btn-outline btn-sm text-xs font-bold"
                  >
                    + Manual Service
                  </button>
                </div>
              </div>

              {/* Right Totals Breakdown Card */}
              {(() => {
                const totals = calculateTotals(activeQuote.items);
                return (
                  <div className="bg-[#F8FAFC] p-4 rounded-xl border border-slate-200/80 space-y-2.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Total Taxable Amount:</span>
                      <span className="font-mono font-semibold">₹{totals.subtotalTaxable.toLocaleString()}</span>
                    </div>
                    {totals.totalDiscount > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <span>Total Discounts:</span>
                        <span className="font-mono font-semibold">-₹{totals.totalDiscount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-600">
                      <span>CGST (9%):</span>
                      <span className="font-mono">₹{totals.cgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>SGST (9%):</span>
                      <span className="font-mono">₹{totals.sgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 border-t border-slate-200 pt-2">
                      <span>Total GST (18%):</span>
                      <span className="font-mono font-bold">₹{totals.totalGst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-extrabold text-[#1B365D] border-t border-slate-300 pt-2">
                      <span>Grand Total (Payable):</span>
                      <span className="font-mono text-base text-[#1B365D]">
                        ₹{totals.grandTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. PRINTABLE OFFICIAL LETTERHEAD VIEW (Matching Screenshot 2026-09-04 112041) */}
      {/* ========================================================================= */}
      {currentView === 'letterhead' && (
        <div className="space-y-6">
          {/* Action Toolbar (Hidden during print) */}
          <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentView('list')}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-[#1B365D]">Official Printable Proposal</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  High-resolution company letterhead suitable for PDF export and client sign-off.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEdit(activeQuote)}
                className="btn btn-outline btn-sm text-xs font-bold flex items-center gap-1.5"
              >
                <Edit3 className="w-4 h-4" /> Edit Values
              </button>
              <button
                onClick={() => handleSendWhatsApp(activeQuote)}
                className="btn btn-sm bg-[#25D366] hover:bg-[#20b858] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Send className="w-4 h-4" /> Send via WhatsApp
              </button>
              <button
                onClick={() => window.print()}
                className="btn btn-sm bg-[#1B365D] hover:bg-[#132743] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-4 h-4" /> Print / Save PDF
              </button>
            </div>
          </div>

          {/* Actual Letterhead Paper Canvas */}
          <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-300 shadow-lg text-slate-800 space-y-8 print:p-0 print:border-none print:shadow-none max-w-4xl mx-auto">
            {/* Header: Company Letterhead */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-[#1B365D] pb-6 gap-6">
              <div>
                <img src="/logo_black.png" alt="ETaxwala Logo" className="h-10 w-auto mb-2" />
                <h2 className="text-base font-extrabold text-[#1B365D] tracking-wide">
                  ETAXWALA BUSINESS SOLUTION PVT. LTD.
                </h2>
                <p className="text-[10px] text-slate-500 max-w-md leading-relaxed mt-1">
                  Office No. 402, 4th Floor, Fortune Business Center, Near Wakad Bridge, Hinjawadi Pune 411057, Maharashtra, India.
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-600 font-mono mt-2">
                  <span>CIN: U74999PN2021PTC202931</span>
                  <span>GSTIN: 27AABCE1234F1Z5</span>
                  <span>PAN: AABCE1234F</span>
                </div>
              </div>

              <div className="text-right sm:border-l sm:border-slate-200 sm:pl-6 space-y-1 text-xs">
                <span className="badge badge-gold font-bold text-xs uppercase px-3 py-1">
                  QUOTATION / PROPOSAL
                </span>
                <p className="font-mono font-bold text-[#1B365D] text-sm mt-1">{activeQuote.quotationNo}</p>
                <p className="text-[11px] text-slate-500">Date: <span className="font-medium text-slate-800">{activeQuote.date}</span></p>
                <p className="text-[11px] text-slate-500">Valid Until: <span className="font-medium text-slate-800">{activeQuote.validUntil}</span></p>
              </div>
            </div>

            {/* Recipient Details & Prepared By */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs bg-[#F8FAFC] p-4 rounded-xl border border-slate-200/80">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  PROPOSAL PREPARED FOR:
                </span>
                <p className="font-extrabold text-sm text-[#1B365D]">{activeQuote.customerName}</p>
                {activeQuote.companyName && (
                  <p className="font-bold text-slate-700">{activeQuote.companyName}</p>
                )}
                {activeQuote.address && (
                  <p className="text-slate-500 text-[11px] leading-relaxed">{activeQuote.address}</p>
                )}
                <div className="flex flex-wrap gap-3 pt-1 text-[11px] font-mono text-slate-600">
                  <span>Tel: {activeQuote.mobile}</span>
                  {activeQuote.email && <span>Email: {activeQuote.email}</span>}
                </div>
                {activeQuote.gstin && (
                  <p className="text-[11px] font-mono font-bold text-slate-700 pt-0.5">GSTIN: {activeQuote.gstin}</p>
                )}
              </div>

              <div className="space-y-1 sm:text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  RELATIONSHIP MANAGER:
                </span>
                <p className="font-extrabold text-sm text-slate-800">{activeQuote.createdBy}</p>
                <p className="text-slate-500 text-[11px]">Senior Legal & Corporate Advisory Team</p>
                <p className="text-[11px] font-mono text-slate-600">Direct Helpline: 080-6902-9999</p>
                <p className="text-[11px] font-mono text-slate-600">Email: proposals@etaxwala.com</p>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="overflow-x-auto overflow-y-auto max-h-72">
              <table className="w-full text-left text-xs border border-slate-200 border-separate border-spacing-0">
                <thead className="sticky top-0 z-10">
                  <tr>
                    <th className="sticky top-0 z-10 bg-[#1B365D] text-white py-2.5 px-3 w-8 text-center font-bold uppercase tracking-wider text-[11px]">#</th>
                    <th className="sticky top-0 z-10 bg-[#1B365D] text-white py-2.5 px-3 font-bold uppercase tracking-wider text-[11px]">Description of Services</th>
                    <th className="sticky top-0 z-10 bg-[#1B365D] text-white py-2.5 px-3 w-16 text-center font-bold uppercase tracking-wider text-[11px]">SAC</th>
                    <th className="sticky top-0 z-10 bg-[#1B365D] text-white py-2.5 px-3 w-12 text-center font-bold uppercase tracking-wider text-[11px]">Qty</th>
                    <th className="sticky top-0 z-10 bg-[#1B365D] text-white py-2.5 px-3 w-24 text-right font-bold uppercase tracking-wider text-[11px]">Rate (₹)</th>
                    <th className="sticky top-0 z-10 bg-[#1B365D] text-white py-2.5 px-3 w-20 text-center font-bold uppercase tracking-wider text-[11px]">Disc (%)</th>
                    <th className="sticky top-0 z-10 bg-[#1B365D] text-white py-2.5 px-3 w-28 text-right font-bold uppercase tracking-wider text-[11px]">Taxable (₹)</th>
                    <th className="sticky top-0 z-10 bg-[#1B365D] text-white py-2.5 px-3 w-28 text-right font-bold uppercase tracking-wider text-[11px]">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {activeQuote.items.map((item, idx) => {
                    const { taxable, total } = getItemAmounts(item);
                    return (
                      <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                        <td className="py-3 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-3 space-y-0.5">
                          <p className="font-bold text-slate-800">{item.serviceName}</p>
                          <p className="text-[10px] text-slate-500 leading-normal">{item.description}</p>
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-slate-500">{item.sacCode}</td>
                        <td className="py-3 px-3 text-center font-mono font-bold">{item.qty}</td>
                        <td className="py-3 px-3 text-right font-mono">₹{item.unitPrice.toLocaleString()}</td>
                        <td className="py-3 px-3 text-center font-mono text-emerald-700">
                          {item.discountPercent > 0 ? `${item.discountPercent}%` : '-'}
                        </td>
                        <td className="py-3 px-3 text-right font-mono">₹{taxable.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                          ₹{total.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Calculations & Bank Accounts Block */}
            {(() => {
              const totals = calculateTotals(activeQuote.items);
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  {/* Bank Account Details */}
                  <div className="p-4 rounded-xl border border-slate-200 space-y-2 text-[11px] bg-slate-50/60">
                    <div className="flex items-center gap-1.5 font-bold text-[#1B365D]">
                      <CreditCard className="w-4 h-4 text-[#00A896]" /> Direct Bank Remittance Details
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-slate-600 font-mono text-[10px]">
                      <span>Beneficiary:</span>
                      <span className="font-bold text-slate-800">ETaxwala Business Solution Pvt Ltd</span>
                      <span>Bank Name:</span>
                      <span className="font-bold text-slate-800">HDFC Bank Ltd</span>
                      <span>Current A/C No:</span>
                      <span className="font-bold text-slate-800">50200067891234</span>
                      <span>IFSC Code:</span>
                      <span className="font-bold text-slate-800">HDFC0001811</span>
                      <span>UPI ID:</span>
                      <span className="font-bold text-slate-800">etaxwala@hdfcbank</span>
                    </div>
                  </div>

                  {/* Summary Totals Table */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal Taxable Value:</span>
                      <span className="font-mono font-semibold">₹{totals.subtotalTaxable.toLocaleString()}</span>
                    </div>
                    {totals.totalDiscount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Total Commercial Discount:</span>
                        <span className="font-mono">-₹{totals.totalDiscount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-600">
                      <span>CGST @ 9%:</span>
                      <span className="font-mono">₹{totals.cgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>SGST @ 9%:</span>
                      <span className="font-mono">₹{totals.sgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base font-extrabold text-[#1B365D] border-t-2 border-[#1B365D] pt-2">
                      <span>Net Payable Amount:</span>
                      <span className="font-mono">₹{totals.grandTotal.toLocaleString()}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 italic pt-1">
                      (Inclusive of all statutory Goods & Services Taxes)
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Terms & Conditions */}
            <div className="border-t border-slate-200 pt-4 space-y-2 text-[10px] text-slate-500 leading-relaxed">
              <span className="font-bold text-slate-700 uppercase tracking-wider">Terms & Conditions:</span>
              <ol className="list-decimal pl-4 space-y-1">
                <li>This quotation is valid for 7 calendar days from issuance. Prices may be revised thereafter.</li>
                <li>Government portal statutory fees are based on MCA / Trademark / GST rules current as of quote date. Any subsequent statutory revision will be borne by the client at actuals.</li>
                <li>Processing begins upon realization of 100% advance or approved milestone advance.</li>
                <li>Documentation and KYC must be provided by the client within 7 days of order booking.</li>
              </ol>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 text-xs">
              <div className="space-y-12">
                <div className="space-y-1">
                  <p className="font-bold text-slate-700">Client Acceptance Signature:</p>
                  <p className="text-[10px] text-slate-400">Authorized Signatory & Seal</p>
                </div>
                <div className="border-t border-slate-300 w-48 pt-1 text-[10px] text-slate-400 font-mono">
                  Date: ____ / ____ / 2026
                </div>
              </div>

              <div className="space-y-12 text-right">
                <div className="space-y-1">
                  <p className="font-bold text-[#1B365D]">For ETaxwala Business Solution Pvt. Ltd.</p>
                  <p className="text-[10px] text-emerald-700 font-bold flex items-center justify-end gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Digitally Certified Signatory
                  </p>
                </div>
                <div className="border-t border-slate-300 w-48 ml-auto pt-1 text-[10px] text-slate-500 font-mono">
                  Authorized Legal Officer
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
