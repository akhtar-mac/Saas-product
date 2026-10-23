import React, { useState } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  Package,
  Check,
  AlertTriangle,
  Star,
} from 'lucide-react';

interface PackageService {
  id: number;
  name: string;
  price: number;
}

interface ComboPackageItem {
  id: number;
  name: string;
  description: string;
  services: PackageService[];
  totalPrice: number;
  discountPercentage: number;
  finalPrice: number;
  isActive: boolean;
  isPopular: boolean;
}

const AVAILABLE_SERVICES: PackageService[] = [
  { id: 1, name: 'Private Limited Company Registration', price: 16499 },
  { id: 2, name: 'GST Registration', price: 1999 },
  { id: 3, name: 'Trademark Registration', price: 6999 },
  { id: 4, name: 'FSSAI State License', price: 6499 },
  { id: 5, name: 'Income Tax Return Filing (Salary)', price: 499 },
  { id: 6, name: 'MSME Udyam Registration', price: 999 },
  { id: 7, name: 'ISO 9001 Certification', price: 14999 },
  { id: 8, name: 'Website Design (5 Pages)', price: 12999 },
];

const INITIAL_PACKAGES: ComboPackageItem[] = [
  {
    id: 1,
    name: 'Startup Essential Combo',
    description: 'Perfect for new businesses: company + GST + trademark basics.',
    services: [
      { id: 1, name: 'Private Limited Company Registration', price: 16499 },
      { id: 2, name: 'GST Registration', price: 1999 },
      { id: 3, name: 'Trademark Registration', price: 6999 },
    ],
    totalPrice: 25497,
    discountPercentage: 12,
    finalPrice: 22437,
    isActive: true,
    isPopular: true,
  },
  {
    id: 2,
    name: 'FSSAI Business Launch Pack',
    description: 'For food businesses: FSSAI + GST + basic ITR.',
    services: [
      { id: 4, name: 'FSSAI State License', price: 6499 },
      { id: 2, name: 'GST Registration', price: 1999 },
      { id: 5, name: 'Income Tax Return Filing (Salary)', price: 499 },
    ],
    totalPrice: 8997,
    discountPercentage: 8,
    finalPrice: 8277,
    isActive: true,
    isPopular: false,
  },
];

const EMPTY_PACKAGE: ComboPackageItem = {
  id: 0,
  name: '',
  description: '',
  services: [],
  totalPrice: 0,
  discountPercentage: 0,
  finalPrice: 0,
  isActive: true,
  isPopular: false,
};

export default function CrmManagePackagesPage() {
  const [packages, setPackages] = useState<ComboPackageItem[]>(INITIAL_PACKAGES);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<ComboPackageItem | null>(null);
  const [form, setForm] = useState<ComboPackageItem>(EMPTY_PACKAGE);
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const filtered = packages.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const calculatePrices = (services: PackageService[], discount: number) => {
    const totalPrice = services.reduce((sum, s) => sum + s.price, 0);
    const finalPrice = Math.round(totalPrice * (1 - discount / 100));
    return { totalPrice, finalPrice };
  };

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_PACKAGE);
    setSelectedServiceIds([]);
    setIsModalOpen(true);
  };

  const openEdit = (pkg: ComboPackageItem) => {
    setEditing(pkg);
    setForm({ ...pkg });
    setSelectedServiceIds(pkg.services.map((s) => s.id));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditing(null);
    setForm(EMPTY_PACKAGE);
    setSelectedServiceIds([]);
  };

  const toggleService = (service: PackageService) => {
    let nextIds: number[];
    let nextServices: PackageService[];

    if (selectedServiceIds.includes(service.id)) {
      nextIds = selectedServiceIds.filter((id) => id !== service.id);
      nextServices = form.services.filter((s) => s.id !== service.id);
    } else {
      nextIds = [...selectedServiceIds, service.id];
      nextServices = [...form.services, service];
    }

    const { totalPrice, finalPrice } = calculatePrices(nextServices, form.discountPercentage);
    setSelectedServiceIds(nextIds);
    setForm({ ...form, services: nextServices, totalPrice, finalPrice });
  };

  const handleDiscountChange = (discount: number) => {
    const { totalPrice, finalPrice } = calculatePrices(form.services, discount);
    setForm({ ...form, discountPercentage: discount, totalPrice, finalPrice });
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      showToast('Package name is required', 'error');
      return;
    }
    if (form.services.length === 0) {
      showToast('Select at least one service', 'error');
      return;
    }

    if (editing) {
      setPackages((prev) =>
        prev.map((p) => (p.id === editing.id ? { ...form, id: editing.id } : p))
      );
      showToast('Package updated successfully');
    } else {
      const newId = Math.max(...packages.map((p) => p.id), 0) + 1;
      setPackages((prev) => [...prev, { ...form, id: newId }]);
      showToast('Package created successfully');
    }
    closeModal();
  };

  const handleDelete = () => {
    if (deleteId) {
      setPackages((prev) => prev.filter((p) => p.id !== deleteId));
      showToast('Package deleted successfully');
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1B365D] flex items-center gap-2">
            <Package className="w-5 h-5 text-[#00A896]" />
            Manage Packages
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create combo packages with bundled services and discounted pricing.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Package
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4 border border-slate-100">
          <p className="text-[10px] uppercase tracking-wide text-slate-500 font-bold">
            Total Packages
          </p>
          <p className="text-2xl font-bold text-[#1B365D] mt-1">{packages.length}</p>
        </div>
        <div className="card p-4 border border-slate-100">
          <p className="text-[10px] uppercase tracking-wide text-slate-500 font-bold">Active</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {packages.filter((p) => p.isActive).length}
          </p>
        </div>
        <div className="card p-4 border border-slate-100">
          <p className="text-[10px] uppercase tracking-wide text-slate-500 font-bold">Popular</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {packages.filter((p) => p.isPopular).length}
          </p>
        </div>
        <div className="card p-4 border border-slate-100">
          <p className="text-[10px] uppercase tracking-wide text-slate-500 font-bold">
            Avg Discount
          </p>
          <p className="text-2xl font-bold text-[#00A896] mt-1">
            {packages.length
              ? Math.round(
                  packages.reduce((sum, p) => sum + p.discountPercentage, 0) / packages.length
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
            placeholder="Search packages by name or description..."
            className="input w-full pl-9 text-xs"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-crm w-full text-xs">
            <thead className="bg-[#FAF9F5] border-b border-[#EAE6DD]">
              <tr>
                <th className="text-left px-4 py-3 font-bold text-slate-600">Package</th>
                <th className="text-center px-4 py-3 font-bold text-slate-600">Services</th>
                <th className="text-right px-4 py-3 font-bold text-slate-600">Total</th>
                <th className="text-right px-4 py-3 font-bold text-slate-600">Discount</th>
                <th className="text-right px-4 py-3 font-bold text-slate-600">Final Price</th>
                <th className="text-center px-4 py-3 font-bold text-slate-600">Status</th>
                <th className="text-right px-4 py-3 font-bold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                      {pkg.isPopular && <Star className="w-3 h-3 text-amber-500" />}
                      {pkg.name}
                    </div>
                    <div className="text-[10px] text-slate-500 max-w-xs truncate">
                      {pkg.description}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="badge badge-navy text-[10px]">
                      {pkg.services.length} services
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-500 line-through">
                    ₹{pkg.totalPrice.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-right text-emerald-600 font-medium">
                    {pkg.discountPercentage}%
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-[#1B365D]">
                    ₹{pkg.finalPrice.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`badge text-[10px] ${pkg.isActive ? 'badge-green' : 'badge-red'}`}
                    >
                      {pkg.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(pkg)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#1B365D] hover:bg-slate-100"
                        title="Edit"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteId(pkg.id)}
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
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    No packages found matching your search.
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
                {editing ? 'Edit Package' : 'Add New Package'}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Package Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Startup Essential Combo"
                    className="input w-full text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Discount %
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form.discountPercentage}
                    onChange={(e) => handleDiscountChange(Number(e.target.value))}
                    className="input w-full text-xs"
                  />
                </div>

                <div className="flex items-center gap-4 pt-5">
                  <div className="flex items-center gap-2">
                    <input
                      id="popular"
                      type="checkbox"
                      checked={form.isPopular}
                      onChange={(e) => setForm({ ...form, isPopular: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 text-[#1B365D]"
                    />
                    <label htmlFor="popular" className="text-xs font-medium text-slate-700">
                      Popular
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="activePkg"
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 text-[#1B365D]"
                    />
                    <label htmlFor="activePkg" className="text-xs font-medium text-slate-700">
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
                  placeholder="Short description shown on the package card"
                  rows={2}
                  className="input w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-2">
                  Select Services *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border border-slate-100 rounded-xl bg-[#FAF9F5]">
                  {AVAILABLE_SERVICES.map((service) => {
                    const selected = selectedServiceIds.includes(service.id);
                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => toggleService(service)}
                        className={`flex items-start gap-2 p-2 rounded-lg text-left text-xs transition-colors ${
                          selected
                            ? 'bg-[#1B365D] text-white'
                            : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-100'
                        }`}
                      >
                        <div
                          className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center ${
                            selected ? 'bg-emerald-500 text-white' : 'bg-slate-200'
                          }`}
                        >
                          {selected && <Check className="w-3 h-3" />}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{service.name}</div>
                          <div
                            className={`text-[10px] ${selected ? 'text-slate-200' : 'text-slate-500'}`}
                          >
                            ₹{service.price.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {form.services.length > 0 && (
                <div className="bg-[#FAF9F5] rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Total Service Price</span>
                    <span>₹{form.totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-xs text-emerald-600">
                    <span>Discount ({form.discountPercentage}%)</span>
                    <span>
                      -₹{Math.round(form.totalPrice - form.finalPrice).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-[#1B365D] pt-2 border-t border-slate-200">
                    <span>Final Package Price</span>
                    <span>₹{form.finalPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}
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
              <h2 className="text-sm font-bold text-[#1B365D]">Delete Package?</h2>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              This will remove the combo package permanently. Any linked orders will not be
              affected.
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
