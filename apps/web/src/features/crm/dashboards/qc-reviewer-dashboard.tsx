import React, { useState } from 'react';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  ShieldCheck,
  RotateCcw,
  X,
} from 'lucide-react';

export default function QcReviewerDashboard() {
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const [qcQueue, setQcQueue] = useState([
    {
      id: 301,
      client: 'Sharma Agri Exports Pvt Ltd',
      service: 'SPICe+ Part B Incorporation Filing',
      filedBy: 'CA Pooja Kulkarni',
      docsCount: 8,
      status: 'Pending QC',
    },
    {
      id: 302,
      client: 'Green Leaf Bio Organics',
      service: 'Trademark Class 31 Filing',
      filedBy: 'Vikas Shinde',
      docsCount: 4,
      status: 'Pending QC',
    },
    {
      id: 303,
      client: 'Apex Logistics LLP',
      service: 'GST New Application ARN-901',
      filedBy: 'Megha More',
      docsCount: 6,
      status: 'Pending QC',
    },
  ]);

  const handleApprove = (id: number) => {
    setQcQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const handleOpenReject = (item: any) => {
    setSelectedCase(item);
    setIsModalOpen(true);
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCase) {
      setQcQueue((prev) => prev.filter((item) => item.id !== selectedCase.id));
    }
    setIsModalOpen(false);
    setRejectReason('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-brand-navy">
              Quality Check (QC) Review Desk
            </h1>
            <span className="badge badge-gold">Zero-Defect Quality Gate</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pre-submission audit to prevent government rejections, MCA/GST query notices, and
            spelling defects.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="badge badge-green text-xs py-1.5 px-3">Pass Rate: 96.4%</span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Pending QC Reviews',
            value: qcQueue.length,
            sub: 'Awaiting inspection',
            icon: FileCheck2,
            color: '#003A66',
            bg: 'rgba(0,58,102,0.08)',
          },
          {
            title: 'Passed QC Today',
            value: '19 Filings',
            sub: 'Ready for govt portal',
            icon: CheckCircle2,
            color: '#059669',
            bg: 'rgba(5,150,105,0.08)',
          },
          {
            title: 'Returned with Defects',
            value: '2 Filings',
            sub: 'Sent back to operations',
            icon: RotateCcw,
            color: '#DC2626',
            bg: 'rgba(220,38,38,0.08)',
          },
          {
            title: 'First-Pass Quality Rate',
            value: '96.4%',
            sub: '+1.2% this month',
            icon: ShieldCheck,
            color: '#7C3AED',
            bg: 'rgba(124,58,237,0.08)',
          },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.title}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{kpi.title}</span>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: kpi.bg }}
                >
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

      {/* QC Queue Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-slate-800">
              Pre-Filing Document Inspection Queue
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click QC Pass to approve or Return to send back with defect annotations
            </p>
          </div>
          <span className="badge badge-navy">Inspection Queue</span>
        </div>

        <div className="overflow-x-auto">
          <table className="table-crm">
            <thead>
              <tr>
                <th>Case # / Client</th>
                <th>Filing Application</th>
                <th>Prepared By</th>
                <th>Attached Files</th>
                <th className="text-right">QC Decision</th>
              </tr>
            </thead>
            <tbody>
              {qcQueue.map((item) => (
                <tr key={item.id}>
                  <td>
                    <p className="font-bold text-slate-800 text-xs">{item.client}</p>
                    <p className="text-[10px] text-slate-400">Order #{item.id}</p>
                  </td>
                  <td className="text-xs text-slate-700 font-medium">{item.service}</td>
                  <td className="text-xs text-brand-navy font-semibold">{item.filedBy}</td>
                  <td className="text-xs text-slate-500">{item.docsCount} verified PDFs</td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="btn btn-primary btn-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> QC Pass
                      </button>
                      <button
                        onClick={() => handleOpenReject(item)}
                        className="btn btn-sm"
                        style={{ background: '#fee2e2', color: '#b91c1c' }}
                      >
                        <XCircle className="w-3.5 h-3.5" /> Return
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* QC Return Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-bold text-base text-slate-800">
                  Return Case #{selectedCase?.id} for Corrections
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Specify defects for {selectedCase?.filedBy} before re-submission
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Defect Description & Annotation
                </label>
                <textarea
                  rows={4}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Director's father name in MOA draft does not match PAN card spelling. Please rectify clause 3 and re-submit."
                  className="input text-xs"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-outline btn-sm btn-multicolor"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-sm"
                  style={{ background: '#dc2626', color: 'white' }}
                >
                  Confirm Return with Notes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
