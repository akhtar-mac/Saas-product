import React, { useState } from 'react';
import {
  FolderLock,
  Upload,
  Download,
  FileCheck,
  Clock,
  AlertCircle,
  Trash2,
  Eye,
  Plus,
  ShieldCheck,
} from 'lucide-react';

export default function ClientDocumentsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const documentList = [
    {
      id: 1,
      title: 'PAN Card (Director 1)',
      category: 'KYC',
      type: 'PDF',
      size: '850 KB',
      uploadedAt: '10 Aug 2026',
      status: 'VERIFIED',
      fileName: 'director1_pan.pdf',
    },
    {
      id: 2,
      title: 'Aadhaar Card (Director 1)',
      category: 'KYC',
      type: 'PDF',
      size: '1.2 MB',
      uploadedAt: '10 Aug 2026',
      status: 'VERIFIED',
      fileName: 'director1_aadhaar.pdf',
    },
    {
      id: 3,
      title: 'Passport Photo (Director 1)',
      category: 'KYC',
      type: 'JPEG',
      size: '340 KB',
      uploadedAt: '10 Aug 2026',
      status: 'VERIFIED',
      fileName: 'director1_photo.jpg',
    },
    {
      id: 4,
      title: 'Director 2 Address Proof (Electricity Bill)',
      category: 'Address Proof',
      type: 'PDF',
      size: 'Pending',
      uploadedAt: '-',
      status: 'PENDING_UPLOAD',
      fileName: '',
      isActionRequired: true,
    },
    {
      id: 5,
      title: 'Registered Office Electricity Bill & NOC',
      category: 'Business Proof',
      type: 'PDF',
      size: '2.4 MB',
      uploadedAt: '12 Aug 2026',
      status: 'VERIFIED',
      fileName: 'office_noc_elec.pdf',
    },
    {
      id: 6,
      title: 'Approved RUN Name Reservation Letter',
      category: 'Deliverable',
      type: 'PDF',
      size: '320 KB',
      uploadedAt: '14 Aug 2026',
      status: 'ISSUED',
      fileName: 'CRC_Name_Approval.pdf',
      isCertificate: true,
    },
    {
      id: 7,
      title: 'Draft MOA & AOA Charter',
      category: 'Deliverable',
      type: 'PDF',
      size: '1.6 MB',
      uploadedAt: '15 Aug 2026',
      status: 'ISSUED',
      fileName: 'Draft_MOA_AOA.pdf',
      isCertificate: true,
    },
  ];

  const filteredDocs =
    activeTab === 'all'
      ? documentList
      : activeTab === 'kyc'
      ? documentList.filter((d) => d.category === 'KYC' || d.category === 'Address Proof')
      : activeTab === 'certificates'
      ? documentList.filter((d) => d.isCertificate)
      : documentList.filter((d) => d.status === 'PENDING_UPLOAD');

  const handleFakeUpload = () => {
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-brand-navy">
              Secure Document Vault
            </h1>
            <span className="badge badge-gold">256-Bit Encrypted</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            End-to-end encrypted storage for your company incorporation certificates, DSC keys, KYC proofs & ROC filings.
          </p>
        </div>

        <label className="cursor-pointer">
          <input type="file" className="hidden" onChange={handleFakeUpload} />
          <button className="btn btn-primary btn-sm">
            <Upload className="w-3.5 h-3.5" /> Upload Document
          </button>
        </label>
      </div>

      {uploadSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> Document uploaded successfully and sent to your CA verification specialist!
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-white rounded-xl border border-slate-200 shadow-sm w-fit">
        {[
          { id: 'all', label: 'All Documents', count: documentList.length },
          { id: 'kyc', label: 'KYC & Proofs', count: 4 },
          { id: 'certificates', label: 'Certificates & Deliverables', count: 2 },
          { id: 'pending', label: 'Pending Upload', count: 1 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-brand-navy text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Grid of Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className={`bg-white p-5 rounded-2xl border flex flex-col justify-between transition-all shadow-sm ${
              doc.isActionRequired
                ? 'border-amber-300 bg-amber-50/20'
                : 'border-slate-200 hover:shadow-md'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className={`badge ${
                  doc.status === 'VERIFIED' || doc.status === 'ISSUED'
                    ? 'badge-green'
                    : doc.status === 'PENDING_UPLOAD'
                    ? 'badge-gold'
                    : 'badge-navy'
                }`}>
                  {doc.status.replace('_', ' ')}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  {doc.category}
                </span>
              </div>

              <h4 className="font-display font-bold text-sm text-slate-800 line-clamp-2">
                {doc.title}
              </h4>

              <div className="mt-3 space-y-1 text-xs text-slate-500">
                {doc.fileName ? (
                  <p className="truncate font-mono text-[11px] text-brand-navy font-semibold">
                    📄 {doc.fileName}
                  </p>
                ) : null}
                <p>Size: {doc.size}</p>
                <p>Updated: {doc.uploadedAt}</p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              {doc.status === 'PENDING_UPLOAD' ? (
                <label className="w-full cursor-pointer">
                  <input type="file" className="hidden" onChange={handleFakeUpload} />
                  <button className="btn btn-primary btn-sm w-full text-xs">
                    <Upload className="w-3.5 h-3.5" /> Upload Now
                  </button>
                </label>
              ) : (
                <>
                  <button className="btn btn-outline btn-sm text-xs">
                    <Eye className="w-3 h-3" /> Preview
                  </button>
                  <button className="btn btn-sm text-brand-navy hover:bg-slate-100 text-xs">
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
