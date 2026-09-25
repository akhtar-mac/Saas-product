import React, { useState } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  Briefcase,
  Tag,
  IndianRupee,
  AlertTriangle,
  Check,
  Star,
} from 'lucide-react';

interface ServiceItem {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  price: number;
  partnerPercentage: number;
  description: string;
  inclusions: string[];
  isFeatured: boolean;
  isActive: boolean;
}

const CATEGORIES = [
  { id: 1, name: 'Business Registration' },
  { id: 2, name: 'Other Registrations' },
  { id: 3, name: 'Taxation and Return Filing' },
  { id: 4, name: 'Audit and Compliances' },
  { id: 5, name: 'Legal Documentation' },
  { id: 6, name: 'Consultancy' },
  { id: 7, name: 'Marketing and Branding' },
  { id: 8, name: 'Trademark and IP' },
];

const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 1,
    name: 'Private Limited Company Registration',
    categoryId: 1,
    categoryName: 'Business Registration',
    price: 16499,
    partnerPercentage: 15,
    description: 'Pvt Ltd registration with DSC, DIN, SPICe+, PAN, TAN.',
    inclusions: ['2 DSC Class 3', '2 DIN', 'SPICe+ Filing', 'PAN/TAN'],
    isFeatured: true,
    isActive: true,
  },
  {
    id: 2,
    name: 'GST Registration',
    categoryId: 2,
    categoryName: 'Other Registrations',
    price: 1999,
    partnerPercentage: 12,
    description: 'GST registration for regular taxpayers.',
    inclusions: ['Application Filing', 'ARN Tracking', 'GST Certificate'],
    isFeatured: true,
    isActive: true,
  },
  {
    id: 3,
    name: 'Income Tax Return Filing (Salary)',
    categoryId: 3,
    categoryName: 'Taxation and Return Filing',
    price: 499,
    partnerPercentage: 10,
    description: 'ITR filing for salaried individuals.',
    inclusions: ['Form 16 Review', 'ITR Filing', 'Acknowledgement'],
    isFeatured: false,
    isActive: true,
  },
  {
    id: 4,
    name: 'Trademark Registration',
    categoryId: 8,
    categoryName: 'Trademark and IP',
    price: 6999,
    partnerPercentage: 12,
    description: 'Comprehensive trademark search and filing.',
    inclusions: ['Trademark Search', 'Class Advice', 'Form TM-A Filing'],
    isFeatured: true,
    isActive: true,
  },
];

const EMPTY_SERVICE: ServiceItem = {
  id: 0,
  name: '',
  categoryId: 1,
  categoryName: 'Business Registration',
  price: 0,
  partnerPercentage: 0,
  description: '',
  inclusions: [],
  isFeatured: false,
  isActive: true,
};

export default function CrmManageServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceItem | null>(null);
  const [form, setForm] = useState<ServiceItem>(EMPTY_SERVICE);
  const [inclusionInput, setInclusionInput] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const filtered = services.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || s.categoryId.toString() === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_SERVICE);
    setInclusionInput('');
    setIsModalOpen(true);
  };

  const openEdit = (service: ServiceItem) => {
    setEditing(service);
    setForm({ ...service });
    setInclusionInput('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditing(null);
    setForm(EMPTY_SERVICE);
    setInclusionInput('');
  };

  const handleCategoryChange = (categoryId: number) => {
    const category = CATEGORIES.find((c) => c.id === categoryId);
    setForm({ ...form, categoryId, categoryName: category?.name || '' });
  };

  const addInclusion = () => {
    if (inclusionInput.trim()) {
      setForm({ ...form, inclusions: [...form.inclusions, inclusionInput.trim()] });
      setInclusionInput('');
    }
  };

  const removeInclusion = (index: number) => {
    setForm({ ...form, inclusions: form.inclusions.filter((_, i) => i !== index) });
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      showToast('Service name is required', 'error');
      return;
    }
    if (form.price <= 0) {
      showToast('Price must be greater than 0', 'error');
      return;
    }

    if (editing) {
      setServices((prev) =>
        prev.map((s) => (s.id === editing.id ? { ...form, id: editing.id } : s))
      );
      showToast('Service updated successfully');
    } else {
      const newId = Math.max(...services.map((s) => s.id), 0) + 1;
      setServices((prev) => [...prev, { ...form, id: newId }]);
      showToast('Service created successfully');
    }
    closeModal();
  };

  const handleDelete = () => {
    if (deleteId) {
      setServices((prev) => prev.filter((s) => s.id !== deleteId));
      showToast('Service deleted successfully');
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1B365D] flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#00A896]" />
            Manage Services
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Add, edit and price the 250+ services offered by ETaxwala.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Service
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4 border border-slate-100">
          <p className="text-[10px] uppercase tracking-wide text-slate-500 font-bold">
            Total Services
          </p>
          <p className="text-2xl font-bold text-[#1B365D] mt-1">{services.length}</p>
        </div>
        <div className="card p-4 border border-slate-100">
          <p className="text-[10px] uppercase tracking-wide text-slate-500 font-bold">Active</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {services.filter((s) => s.isActive).length}
          </p>
        </div>
        <div className="card p-4 border border-slate-100">
          <p className="text-[10px] uppercase tracking-wide text-slate-500 font-bold">Featured</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {services.filter((s) => s.isFeatured).length}
          </p>
        </div>
        <div className="card p-4 border border-slate-100">
          <p className="text-[10px] uppercase tracking-wide text-slate-500 font-bold">
            Avg Partner %
          </p>
          <p className="text-2xl font-bold text-[#00A896] mt-1">
            {services.length
              ? Math.round(
                  services.reduce((sum, s) => sum + s.partnerPercentage, 0) / services.length
                )
              : 0}
            %
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="card p-3 border border-slate-100 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search services by name or description..."
            className="input w-full pl-9 text-xs"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="input text-xs"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-crm w-full text-xs">
            <thead className="bg-[#FAF9F5] border-b border-[#EAE6DD]">
              <tr>
                <th className="text-left px-4 py-3 font-bold text-slate-600">Service</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">Category</th>
                <th className="text-right px-4 py-3 font-bold text-slate-600">Price (₹)</th>
                <th className="text-right px-4 py-3 font-bold text-slate-600">Partner %</th>
                <th className="text-center px-4 py-3 font-bold text-slate-600">Status</th>
                <th className="text-right px-4 py-3 font-bold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((service) => (
                <tr key={service.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                      {service.isFeatured && <Star className="w-3 h-3 text-amber-500" />}
                      {service.name}
                    </div>
                    <div className="text-[10px] text-slate-500 max-w-xs truncate">
                      {service.description}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="badge badge-navy text-[10px]">{service.categoryName}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800">
                    ₹{service.price.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">
                    {service.partnerPercentage}%
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`badge text-[10px] ${
                        service.isActive ? 'badge-green' : 'badge-red'
                      }`}
                    >
                      {service.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(service)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#1B365D] hover:bg-slate-100"
                        title="Edit"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteId(service.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                    No services found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-sm font-bold text-[#1B365D]">
                {editing ? 'Edit Service' : 'Add New Service'}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Service Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Private Limited Company Registration"
                    className="input w-full text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Category *
                  </label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => handleCategoryChange(Number(e.target.value))}
                    className="input w-full text-xs"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="input w-full text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Partner Commission %
                  </label>
                  <input
                    type="number"
                    value={form.partnerPercentage}
                    onChange={(e) =>
                      setForm({ ...form, partnerPercentage: Number(e.target.value) })
                    }
                    className="input w-full text-xs"
                  />
                </div>

                <div className="flex items-center gap-4 pt-5">
                  <div className="flex items-center gap-2">
                    <input
                      id="featured"
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 text-[#1B365D]"
                    />
                    <label htmlFor="featured" className="text-xs font-medium text-slate-700">
                      Featured
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="activeService"
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 text-[#1B365D]"
                    />
                    <label htmlFor="activeService" className="text-xs font-medium text-slate-700">
                      Active
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Short description shown on service cards"
                  rows={3}
                  className="input w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Inclusions
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={inclusionInput}
                    onChange={(e) => setInclusionInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addInclusion())}
                    placeholder="Add an inclusion and press Enter"
                    className="input flex-1 text-xs"
                  />
                  <button
                    type="button"
                    onClick={addInclusion}
                    className="px-3 py-2 rounded-lg btn-multicolor text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.inclusions.map((inc, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#E6F4F1] text-[#006A5C] text-[10px] font-medium"
                    >
                      <Check className="w-3 h-3" />
                      {inc}
                      <button
                        onClick={() => removeInclusion(idx)}
                        className="ml-1 text-[#006A5C] hover:text-rose-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-2 sticky bottom-0 bg-white">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-lg btn-multicolor text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                {editing ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-full bg-rose-100 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-[#1B365D]">Delete Service?</h2>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              This will permanently remove the service from the catalog. This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-lg btn-multicolor text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg text-xs font-semibold btn-multicolor"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg text-xs font-semibold ${
            toast.type === 'error' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
