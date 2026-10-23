import React from 'react';
import { Link } from 'react-router-dom';
import { FileCheck, ArrowRight } from 'lucide-react';
import { TaskStatus, TASK_STATUS_LABELS } from '@etaxwala/types';

export default function ClientServicesPage() {
  const [services, setServices] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch('/v1/customer/services')
      .then((r) => r.json())
      .then((d) => {
        if (d?.success && Array.isArray(d.data)) setServices(d.data);
      })
      .catch(() => {});
  }, []);

  const servicesList =
    services.length > 0
      ? services
      : [
          {
            id: 101,
            name: 'Private Limited Company Registration',
            category: 'Business Registration',
            status: TaskStatus.GOVT_FILING_IN_PROGRESS,
            progress: 65,
            orderDate: '10 Aug 2026',
            assignedTo: 'CA Pooja Kulkarni',
            amount: 16499,
            isPaid: true,
            deliverables: [
              'Certificate of Incorporation (COI)',
              'Company PAN & TAN',
              'Draft MOA & AOA',
              'Bank Account Kit',
            ],
          },
          {
            id: 102,
            name: 'GST Registration & Verification',
            category: 'Taxation & GST',
            status: TaskStatus.COMPLETED,
            progress: 100,
            orderDate: '15 Jul 2026',
            assignedTo: 'Vikas Shinde',
            amount: 999,
            isPaid: true,
            deliverables: ['GSTIN Certificate (Form GST REG-06)', 'ARN Acknowledgment'],
          },
          {
            id: 103,
            name: 'Udyam / MSME Registration',
            category: 'Government Licenses',
            status: TaskStatus.COMPLETED,
            progress: 100,
            orderDate: '16 Jul 2026',
            assignedTo: 'Vikas Shinde',
            amount: 499,
            isPaid: true,
            deliverables: ['Udyam Registration Certificate (Govt of India)'],
          },
        ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-brand-navy">
              My Services & Applications
            </h1>
            <span className="badge badge-gold">10-Stage Milestone Engine</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track step-by-step government filing progress and download official registration
            certificates.
          </p>
        </div>

        <Link to="/services" className="btn btn-primary btn-sm">
          + Order New Service
        </Link>
      </div>

      <div className="space-y-4">
        {servicesList.map((service) => (
          <div
            key={service.id}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2.5">
                  <span className="badge badge-navy text-[10px]">{service.category}</span>
                  <span className="text-xs text-slate-400 font-mono">Order #{service.id}</span>
                </div>
                <h3 className="text-lg font-display font-bold text-slate-800">{service.name}</h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <span>
                    Ordered: <strong className="text-slate-700">{service.orderDate}</strong>
                  </span>
                  <span>
                    Assigned: <strong className="text-brand-navy">{service.assignedTo}</strong>
                  </span>
                  <span>
                    Fee:{' '}
                    <strong className="text-emerald-700">
                      ₹{service.amount.toLocaleString()} (Paid)
                    </strong>
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="text-right">
                  <span
                    className={`badge ${
                      service.status === TaskStatus.COMPLETED ? 'badge-green' : 'badge-gold'
                    }`}
                  >
                    {(TASK_STATUS_LABELS as any)[service.status] || `Stage ${service.status}`}
                  </span>
                  <div className="w-36 h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-brand-navy rounded-full"
                      style={{ width: `${service.progress}%` }}
                    />
                  </div>
                </div>

                <Link to={`/portal/services/${service.id}`}>
                  <button className="btn btn-outline btn-sm text-xs">
                    Track Timeline <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>
            </div>

            {/* Deliverables tags */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-400">Deliverables:</span>
              {service.deliverables.map((del: any, i: number) => (
                <span
                  key={i}
                  className="inline-flex items-center text-[11px] font-semibold bg-[#F7F8FA] text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-lg"
                >
                  <FileCheck className="w-3 h-3 text-brand-navy mr-1.5" />
                  {del}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
