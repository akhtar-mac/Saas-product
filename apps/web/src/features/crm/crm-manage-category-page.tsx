import React, { useState } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  Tag,
  LayoutGrid,
  FileText,
  AlertTriangle,
} from 'lucide-react';

interface CategoryItem {
  id: number;
  name: string;
  nameMr?: string;
  description: string;
  icon: string;
  serviceCount: number;
  isActive: boolean;
}

const INITIAL_CATEGORIES: CategoryItem[] = [
  {
    id: 1,
    name: 'Business Registration',
    nameMr: 'व्यवसाय नोंदणी',
    description: 'Pvt Ltd, OPC, LLP, Partnership, Section 8, Producer Company etc.',
    icon: 'Building2',
    serviceCount: 9,
    isActive: true,
  },
  {
    id: 2,
    name: 'Other Registrations',
    nameMr: 'इतर नोंदणी',
    description: 'MSME, GST, FSSAI, Import Export, TAN, PASARA, Trade License etc.',
    icon: 'FileCheck',
    serviceCount: 10,
    isActive: true,
  },
  {
    id: 3,
    name: 'Taxation and Return Filing',
    nameMr: 'कर आणि परतावा',
    description: 'ITR, GST Return, TDS, EPFO ESIC, Tax Audit etc.',
    icon: 'Calculator',
    serviceCount: 6,
    isActive: true,
  },
  {
    id: 4,
    name: 'Audit and Compliances',
    nameMr: 'लेखापरीक्षण आणि अनुपालन',
    description: 'Company audit, statutory compliance, ROC filings etc.',
    icon: 'ClipboardCheck',
    serviceCount: 9,
    isActive: true,
  },
  {
    id: 5,
    name: 'Legal Documentation',
    nameMr: 'कायदेशीर कागदपत्रे',
    description: 'Agreements, MoU, NDA, Deeds, Contracts etc.',
    icon: 'Scale',
    serviceCount: 50,
    isActive: true,
  },
  {
    id: 6,
    name: 'Consultancy',
    nameMr: 'सल्लागार',
    description: 'Startup, Funding, HR Payroll, CFO, Business Growth etc.',
    icon: 'Briefcase',
    serviceCount: 13,
    isActive: true,
  },
  {
    id: 7,
    name: 'Marketing and Branding',
    nameMr: 'मार्केटिंग आणि ब्रँडिंग',
    description: 'Logo, Website, SEO, PPC, Social Media, PR etc.',
    icon: 'Megaphone',
    serviceCount: 22,
    isActive: true,
  },
  {
    id: 8,
    name: 'Trademark and IP',
    nameMr: 'व्यापार चिन्ह आणि IP',
    description: 'Trademark, Copyright, Patent, Design Registration etc.',
    icon: 'ShieldCheck',
    serviceCount: 7,
    isActive: true,
  },
];

const EMPTY_CATEGORY: CategoryItem = {
  id: 0,
  name: '',
  nameMr: '',
  description: '',
  icon: '',
  serviceCount: 0,
  isActive: true,
};

export default function CrmManageCategoryPage() {
  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryItem | null>(null);
  const [form, setForm] = useState<CategoryItem>(EMPTY_CATEGORY);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.nameMr || '').toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
  );

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_CATEGORY);
    setIsModalOpen(true);
  };

  const openEdit = (category: CategoryItem) => {
    setEditing(category);
    setForm({ ...category });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditing(null);
    setForm(EMPTY_CATEGORY);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      showToast('Category name is required', 'error');
      return;
    }

    if (editing) {
      setCategories((prev) =>
        prev.map((c) => (c.id === editing.id ? { ...form, id: editing.id } : c))
      );
      showToast('Category updated successfully');
    } else {
      const newId = Math.max(...categories.map((c) => c.id), 0) + 1;
      setCategories((prev) => [...prev, { ...form, id: newId }]);
      showToast('Category created successfully');
    }
    closeModal();
  };

  const confirmDelete = (id: number) => {
    const category = categories.find((c) => c.id === id);
    if (category && category.serviceCount > 0) {
      showToast('Cannot delete category with active services', 'error');
      return;
    }
    setDeleteId(id);
  };

  const handleDelete = () => {
    if (deleteId) {
      setCategories((prev) => prev.filter((c) => c.id !== deleteId));
      showToast('Category deleted successfully');
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1B365D] flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-[#00A896]" />
            Manage Categories
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create and manage service categories visible on the website and CRM.
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          Add Category
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 border border-slate-100">
          <p className="text-[10px] uppercase tracking-wide text-slate-500 font-bold">Total Categories</p>
          <p className="text-2xl font-bold text-[#1B365D] mt-1">{categories.length}</p>
        </div>
        <div className="card p-4 border border-slate-100">
          <p className="text-[10px] uppercase tracking-wide text-slate-500 font-bold">Active Categories</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {categories.filter((c) => c.isActive).length}
          </p>
        </div>
        <div className="card p-4 border border-slate-100">
          <p className="text-[10px] uppercase tracking-wide text-slate-500 font-bold">Total Services Mapped</p>
          <p className="text-2xl font-bold text-[#00A896] mt-1">
            {categories.reduce((sum, c) => sum + c.serviceCount, 0)}
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
            placeholder="Search by name, Marathi name or description..."
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
                <th className="text-left px-4 py-3 font-bold text-slate-600">Category</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">Marathi Name</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">Description</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">Icon</th>
                <th className="text-center px-4 py-3 font-bold text-slate-600">Services</th>
                <th className="text-center px-4 py-3 font-bold text-slate-600">Status</th>
                <th className="text-right px-4 py-3 font-bold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((category) => (
                <tr key={category.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{category.name}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{category.nameMr || '—'}</td>
                  <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{category.description}</td>
                  <td className="px-4 py-3">
                    <span className="badge badge-navy text-[10px]">{category.icon || '—'}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="badge badge-green text-[10px]">{category.serviceCount}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`badge text-[10px] ${
                        category.isActive ? 'badge-green' : 'badge-red'
                      }`}
                    >
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(category)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#1B365D] hover:bg-slate-100"
                        title="Edit"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => confirmDelete(category.id)}
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
                    No categories found matching your search.
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#1B365D]">
                {editing ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Category Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Business Registration"
                  className="input w-full text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Marathi Name</label>
                <input
                  type="text"
                  value={form.nameMr || ''}
                  onChange={(e) => setForm({ ...form, nameMr: e.target.value })}
                  placeholder="e.g. व्यवसाय नोंदणी"
                  className="input w-full text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Short description of this category"
                  rows={3}
                  className="input w-full text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Icon Name</label>
                  <input
                    type="text"
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    placeholder="e.g. Building2"
                    className="input w-full text-xs"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    id="active"
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-[#1B365D] focus:ring-[#1B365D]"
                  />
                  <label htmlFor="active" className="text-xs font-medium text-slate-700">
                    Active
                  </label>
                </div>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-lg btn-multicolor text-xs font-semibold"
              >
                Cancel
              </button>
              <button onClick={handleSave} className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5">
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
              <h2 className="text-sm font-bold text-[#1B365D]">Delete Category?</h2>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              This action cannot be undone. Make sure no services are linked to this category.
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
