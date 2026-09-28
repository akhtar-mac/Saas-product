import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  User,
  Phone,
  Mail,
  Download,
  Upload,
  CheckCircle2,
  FileText,
  Clock,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { ServiceTimeline } from '@/components/ui/timeline';
import { TaskStatus, TASK_STATUS_LABELS } from '@etaxwala/types';

export default function ClientServiceDetailPage() {
  const { id } = useParams<{ id: string }>();

  const service = {
    id: Number(id) || 101,
    name: 'Private Limited Company Registration',
    category: 'Business Registration',
    status: TaskStatus.GOVT_FILING_IN_PROGRESS,
    progressPercent: 65,
    orderDate: '10 August 2026',
    estimatedCompletion: '28 August 2026',
    amount: 16499,
    assignedExecutive: {
      name: 'CA Pooja Kulkarni',
      role: 'Senior CA Operations Lead',
      email: 'pooja.k@etaxwala.com',
      phone: '+91 91234 56789',
    },
    history: [
      {
        status: TaskStatus.DOCUMENTS_COLLECTED,
        title: 'Documents Received & KYC Verified',
        remarks: 'PAN, Aadhaar, and Director photos verified successfully.',
        date: '11 Aug 2026, 11:30 AM',
        addedBy: 'CA Pooja Kulkarni',
      },
      {
        status: TaskStatus.VERIFICATION_COMPLETED,
        title: 'Company Name Reservation (RUN Form Approved)',
        remarks: 'Name "SHARMA AGRI EXPORTS PRIVATE LIMITED" approved by Central Registration Centre (CRC).',
        date: '14 Aug 2026, 04:15 PM',
        addedBy: 'CRC Govt Portal',
      },
      {
        status: TaskStatus.GOVT_FILING_IN_PROGRESS,
        title: 'SPICe+ Part B Filing Submitted',
        remarks: 'MOA, AOA, AGILE-PRO, and INC-9 signed via DSC and uploaded to MCA portal. SRN: F89230192.',
        date: '20 Aug 2026, 02:40 PM',
        addedBy: 'CA Pooja Kulkarni',
      },
    ],
    documents: [
      { name: 'Draft Memorandum of Association (MOA)', type: 'PDF', size: '1.4 MB', date: '15 Aug 2026' },
      { name: 'Draft Articles of Association (AOA)', type: 'PDF', size: '1.1 MB', date: '15 Aug 2026' },
      { name: 'RUN Approval Letter', type: 'PDF', size: '320 KB', date: '14 Aug 2026' },
    ],
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back Button */}
      <div className="flex items-center gap-2">
        <Link
          to="/portal/services"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-navy"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Services
        </Link>
      </div>

      {/* Header Info */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-navy text-[10px]">
                {service.category}
              </span>
              <span className="text-xs text-slate-400 font-mono">Order #{service.id}</span>
            </div>
            <h2 className="text-2xl font-display font-bold text-brand-navy">
              {service.name}
            </h2>
          </div>

          <span className="badge badge-green">
            Stage 5: Govt Filing In Progress
          </span>
        </div>

        {/* Key Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <p className="text-slate-400 font-medium">Order Date</p>
            <p className="font-bold text-slate-800 mt-1">{service.orderDate}</p>
          </div>
          <div>
            <p className="text-slate-400 font-medium">Estimated Delivery</p>
            <p className="font-bold text-slate-800 mt-1">{service.estimatedCompletion}</p>
          </div>
          <div>
            <p className="text-slate-400 font-medium">Service Fee</p>
            <p className="font-bold text-emerald-700 mt-1">₹{service.amount.toLocaleString()} (Paid)</p>
          </div>
          <div>
            <p className="text-slate-400 font-medium">Filing Portal</p>
            <p className="font-bold text-brand-navy mt-1">MCA Central Registry (V3)</p>
          </div>
        </div>
      </div>

      {/* 10-Stage Visual Timeline Tracker */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="font-display font-bold text-base text-slate-800">
            Step-by-Step 10-Stage Filing Progress
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status updates directly from our government operations desk
          </p>
        </div>

        <ServiceTimeline
          currentStatus={service.status}
          history={service.history}
        />
      </div>

      {/* Assigned Specialist & Files */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Executive */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-display font-bold text-sm text-slate-800">
            Dedicated Case Specialist
          </h3>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-navy text-white flex items-center justify-center font-bold text-base shadow-sm">
              PK
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                {service.assignedExecutive.name}
              </h4>
              <p className="text-xs text-brand-navy font-semibold">
                {service.assignedExecutive.role}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {service.assignedExecutive.email}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex gap-3">
            <a
              href={`tel:${service.assignedExecutive.phone}`}
              className="btn btn-outline btn-sm flex-1 text-xs"
            >
              <Phone className="w-3.5 h-3.5" /> Call Specialist
            </a>
            <Link to="/portal/support" className="btn btn-primary btn-sm flex-1 text-xs">
              <Mail className="w-3.5 h-3.5" /> Send Message
            </Link>
          </div>
        </div>

        {/* Deliverables Available */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-slate-800">
              Generated Files & Charters
            </h3>
            <Link to="/portal/documents" className="text-xs text-brand-navy font-semibold hover:underline">
              Open Vault →
            </Link>
          </div>

          <div className="space-y-2.5">
            {service.documents.map((doc, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-[#F7F8FA] border border-slate-200/80 text-xs"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText className="w-4 h-4 text-brand-navy shrink-0" />
                  <span className="font-semibold text-slate-800 truncate">
                    {doc.name}
                  </span>
                </div>
                <button className="btn btn-outline btn-sm text-xs shrink-0">
                  <Download className="w-3 h-3" /> Download
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
