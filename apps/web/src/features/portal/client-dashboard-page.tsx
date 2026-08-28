import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Upload,
  CreditCard,
  ArrowRight,
  Download,
  PhoneCall,
  UserCheck,
  Building2,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { TaskStatus, TASK_STATUS_LABELS } from '@etaxwala/types';

export default function ClientDashboardPage() {
  const { customer } = useAuthStore();

  const activeService = {
    id: 101,
    name: 'Private Limited Company Registration',
    category: 'Business Registration',
    status: TaskStatus.GOVT_FILING_IN_PROGRESS,
    progressPercent: 65,
    assignedExecutive: 'CA Pooja Kulkarni (Senior CA Executive)',
    assignedExecutivePhone: '+91 91234 56789',
    estimatedCompletion: '28 August 2026',
    orderDate: '10 August 2026',
    price: 16499,
  };

  const actionItems = [
    {
      id: 1,
      type: 'document_pending',
      title: 'Director Electricity Bill / Bank Statement Required',
      description: 'Proof of address for 2nd Director is pending upload for SPICe+ MCA filing.',
      actionText: 'Upload Document',
      link: '/portal/documents',
      isUrgent: true,
    },
    {
      id: 2,
      type: 'approval',
      title: 'Company Name Choice Confirmation',
      description: 'Run name search completed. Selected: "SHARMA AGRI EXPORTS PRIVATE LIMITED".',
      actionText: 'Review Name',
      link: '/portal/services',
      isUrgent: false,
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-navy via-[#00487C] to-brand-navy-dark rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-brand-gold-light">
              <Building2 className="w-3.5 h-3.5" />
              <span>{customer?.business || 'Sharma Agri Exports Pvt Ltd'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">
              Welcome back, {customer?.name || 'Rajesh Sharma'}!
            </h2>
            <p className="text-blue-100/80 text-xs sm:text-sm max-w-xl">
              Track your legal filings, download approved certificates, upload compliance documents, and communicate with your dedicated Chartered Accountant.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/portal/documents" className="btn btn-gold btn-sm">
              <Upload className="w-3.5 h-3.5" /> Upload Documents
            </Link>
            <Link to="/portal/services" className="btn btn-outline-white btn-sm">
              Track Live Filing <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Active Services', value: '1 Active', sub: 'Filing in progress', icon: Clock, color: '#003A66', bg: 'rgba(0,58,102,0.08)' },
          { title: 'Document Vault', value: '6 / 7 Docs', sub: '1 Pending review', icon: FileText, color: '#D97706', bg: 'rgba(217,119,6,0.08)' },
          { title: 'Total Paid Amount', value: '₹16,499', sub: 'All dues cleared', icon: CreditCard, color: '#059669', bg: 'rgba(5,150,105,0.08)' },
          { title: 'Compliance Standing', value: '95% Score', sub: 'Good standing', icon: ShieldCheck, color: '#7C3AED', bg: 'rgba(124,58,237,0.08)' },
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

      {/* Action Required Banner / Alert */}
      {actionItems.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pending Actions For You
            </h3>
            <span className="text-xs text-amber-600 font-semibold">
              {actionItems.length} items need your attention
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {actionItems.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border-l-4 bg-white border border-slate-200 shadow-sm flex items-start justify-between gap-3 ${
                  item.isUrgent ? 'border-l-amber-500' : 'border-l-brand-navy'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <AlertTriangle
                      className={`w-4 h-4 shrink-0 ${
                        item.isUrgent ? 'text-amber-600' : 'text-brand-navy'
                      }`}
                    />
                    <h4 className="text-xs font-bold text-slate-800">
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500">
                    {item.description}
                  </p>
                </div>
                <Link to={item.link} className="shrink-0">
                  <button className="btn btn-primary btn-sm text-xs">
                    {item.actionText}
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Active Service Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="badge badge-navy text-[10px]">
                {activeService.category}
              </span>
              <span className="text-xs text-slate-400 font-mono">Order #{activeService.id}</span>
            </div>
            <h3 className="text-xl font-display font-bold text-brand-navy">
              {activeService.name}
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <span className="badge badge-green">
              Stage 5: Govt Filing In Progress
            </span>
            <Link to={`/portal/services`}>
              <button className="btn btn-outline btn-sm">
                View Full 10-Stage Timeline <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        </div>

        {/* Progress Bar & Specialist Contact */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-600">Filing Completion Progress</span>
              <span className="text-brand-navy font-bold">{activeService.progressPercent}%</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-navy to-brand-gold rounded-full transition-all duration-500"
                style={{ width: `${activeService.progressPercent}%` }}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 text-xs">
              <div>
                <p className="text-slate-400 font-medium">Order Date</p>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {activeService.orderDate}
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Estimated Delivery</p>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {activeService.estimatedCompletion}
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Total Package Fee</p>
                <p className="font-bold text-emerald-700 mt-0.5">
                  ₹{activeService.price.toLocaleString()} (Paid in Full)
                </p>
              </div>
            </div>
          </div>

          {/* Assigned Case Specialist */}
          <div className="p-4 rounded-xl bg-[#F7F8FA] border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-navy text-white flex items-center justify-center font-bold text-sm">
                PK
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Assigned CA Specialist</p>
                <p className="text-xs font-bold text-slate-800">
                  {activeService.assignedExecutive}
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
              <a
                href={`tel:${activeService.assignedExecutivePhone}`}
                className="btn btn-outline btn-sm flex-1 text-xs"
              >
                <PhoneCall className="w-3.5 h-3.5" /> Call CA
              </a>
              <Link to="/portal/support" className="btn btn-primary btn-sm flex-1 text-xs">
                Chat Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Ready Downloads Vault Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-display font-bold text-sm text-slate-800">
              Ready Downloads & Certificates
            </h4>
            <Link to="/portal/documents" className="text-xs text-brand-navy hover:underline font-semibold">
              View All (4)
            </Link>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F7F8FA] border border-slate-200/80">
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-brand-navy" />
                <div>
                  <p className="font-bold text-slate-800">
                    Draft MOA & AOA (Articles)
                  </p>
                  <p className="text-[10px] text-slate-400">PDF • 1.2 MB • Approved</p>
                </div>
              </div>
              <button className="btn btn-outline btn-sm text-xs">
                <Download className="w-3.5 h-3.5" /> Download
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F7F8FA] border border-slate-200/80">
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                <div>
                  <p className="font-bold text-slate-800">
                    Digital Signature Certificate (DSC) Confirmation
                  </p>
                  <p className="text-[10px] text-slate-400">PDF • 450 KB • Issued</p>
                </div>
              </div>
              <button className="btn btn-outline btn-sm text-xs">
                <Download className="w-3.5 h-3.5" /> Download
              </button>
            </div>
          </div>
        </div>

        {/* Add-on Recommendation */}
        <div className="bg-gradient-to-br from-brand-navy to-brand-navy-dark p-6 rounded-2xl text-white space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-brand-gold-light text-xs font-bold uppercase tracking-wider">
            <Zap className="w-4 h-4 text-brand-gold" /> Recommended Add-ons
          </div>
          <h4 className="font-display font-bold text-base">
            Protect your Brand with Trademark Registration
          </h4>
          <p className="text-xs text-blue-100/80 leading-relaxed">
            Get complete legal exclusivity for your company name and logo with ETaxwala IP attorneys starting at ₹6,999.
          </p>
          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Govt + Professional Fees Included</span>
            <Link to="/services" className="btn btn-gold btn-sm">
              Apply Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
