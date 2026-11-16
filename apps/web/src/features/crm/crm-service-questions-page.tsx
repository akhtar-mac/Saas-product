import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Trash2, Edit3, X, Save, HelpCircle, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { API_BASE_URL } from '@/lib/api-base';

interface ServiceQuestion {
  id: number;
  service_id: number;
  service_name?: string;
  question: string;
  added_by?: number;
  added_by_name?: string;
  created_at?: string;
  updated_at?: string;
}

interface ServiceOption {
  service_id: number;
  service_name: string;
}

const API_BASE = API_BASE_URL;

export default function CrmServiceQuestionsPage() {
  const { staffUser, staffToken } = useAuthStore();
  const [questions, setQuestions] = useState<ServiceQuestion[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Add modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addServiceId, setAddServiceId] = useState('');
  const [addQuestions, setAddQuestions] = useState<string[]>(['']);
  const [saving, setSaving] = useState(false);

  // Edit modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ServiceQuestion | null>(null);
  const [editServiceId, setEditServiceId] = useState('');
  const [editQuestion, setEditQuestion] = useState('');

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<ServiceQuestion | null>(null);

  const authHeaders = {
    'Content-Type': 'application/json',
    ...(staffToken ? { Authorization: `Bearer ${staffToken}` } : {}),
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchQuestions = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set('q', search.trim());
    fetch(`${API_BASE}/v1/crm/service-questions?${params.toString()}`, { headers: authHeaders })
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data?.data)) {
          setQuestions(data.data);
        }
      })
      .catch(() => showToast('Failed to load questions', 'error'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_BASE, search]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  useEffect(() => {
    fetch(`${API_BASE}/v1/crm/all-services`, { headers: authHeaders })
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data?.data)) {
          setServices(
            data.data.map((s: any) => ({
              service_id: Number(s.service_id),
              service_name: s.service_name,
            }))
          );
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAdd = () => {
    setAddServiceId('');
    setAddQuestions(['']);
    setIsAddOpen(true);
  };

  const addQuestionRow = () => setAddQuestions([...addQuestions, '']);
  const removeQuestionRow = (idx: number) => {
    if (addQuestions.length <= 1) return;
    setAddQuestions(addQuestions.filter((_, i) => i !== idx));
  };
  const updateQuestionRow = (idx: number, value: string) => {
    const next = [...addQuestions];
    next[idx] = value;
    setAddQuestions(next);
  };

  const handleAdd = async () => {
    const clean = addQuestions.map((q) => q.trim()).filter((q) => q.length > 0);
    if (!addServiceId) {
      showToast('Please select a service', 'error');
      return;
    }
    if (clean.length === 0) {
      showToast('Enter at least one question', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/v1/crm/service-questions`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          service_id: Number(addServiceId),
          questions: clean,
          staff_user_id: staffUser?.id ?? undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'Questions added successfully');
        setIsAddOpen(false);
        fetchQuestions();
      } else {
        showToast(data.message || 'Failed to add questions', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (q: ServiceQuestion) => {
    setEditTarget(q);
    setEditServiceId(String(q.service_id));
    setEditQuestion(q.question);
    setIsEditOpen(true);
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    if (!editServiceId || !editQuestion.trim()) {
      showToast('Service and question are required', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/v1/crm/service-questions/${editTarget.id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({
          service_id: Number(editServiceId),
          question: editQuestion.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Question updated successfully');
        setIsEditOpen(false);
        fetchQuestions();
      } else {
        showToast(data.message || 'Failed to update', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`${API_BASE}/v1/crm/service-questions/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      const data = await res.json();
      if (data.success) {
        showToast('Question deleted successfully');
        setDeleteTarget(null);
        fetchQuestions();
      } else {
        showToast(data.message || 'Failed to delete', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    }
  };

  const filtered = questions;

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[100] px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold text-white ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1B365D] flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#00A896]" />
            Service Questions
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Questions shown to sales team while qualifying leads for each service.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Questions
        </button>
      </div>

      {/* Search */}
      <div className="card p-3 border border-slate-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions or service..."
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
                <th className="text-left px-4 py-3 font-bold text-slate-600">Service</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">Question</th>
                <th className="text-center px-4 py-3 font-bold text-slate-600">Added By</th>
                <th className="text-right px-4 py-3 font-bold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-[#1B365D]">
                    {q.service_name || `Service #${q.service_id}`}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{q.question}</td>
                  <td className="px-4 py-3 text-center text-slate-500">
                    {q.added_by_name || q.added_by || '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(q)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#1B365D] hover:bg-slate-100"
                        title="Edit"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(q)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-slate-400">
                    No questions found.
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-slate-400">
                    Loading...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Questions Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-sm font-bold text-[#1B365D]">Add Questions for a Service</h2>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Select Service *
                </label>
                <select
                  value={addServiceId}
                  onChange={(e) => setAddServiceId(e.target.value)}
                  className="input w-full text-xs"
                >
                  <option value="">Select a service</option>
                  {services.map((s) => (
                    <option key={s.service_id} value={s.service_id}>
                      {s.service_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-2">Questions</label>
                <div className="space-y-2">
                  {addQuestions.map((q, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={q}
                        onChange={(e) => updateQuestionRow(idx, e.target.value)}
                        placeholder="Enter question"
                        className="input flex-1 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => removeQuestionRow(idx)}
                        disabled={addQuestions.length <= 1}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addQuestionRow}
                  className="mt-2 text-xs font-semibold text-[#00A896] hover:text-[#1B365D] flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add More
                </button>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-2 sticky bottom-0 bg-white">
              <button
                onClick={() => setIsAddOpen(false)}
                className="px-4 py-2 rounded-lg btn-multicolor text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={saving}
                className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#1B365D]">Edit Question</h2>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Select Service *
                </label>
                <select
                  value={editServiceId}
                  onChange={(e) => setEditServiceId(e.target.value)}
                  className="input w-full text-xs"
                >
                  {services.map((s) => (
                    <option key={s.service_id} value={s.service_id}>
                      {s.service_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Question *
                </label>
                <input
                  type="text"
                  value={editQuestion}
                  onChange={(e) => setEditQuestion(e.target.value)}
                  className="input w-full text-xs"
                />
              </div>
            </div>

            <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setIsEditOpen(false)}
                className="px-4 py-2 rounded-lg btn-multicolor text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                disabled={saving}
                className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-full bg-rose-100 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Delete Question</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  "{deleteTarget.question}" — this cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg btn-multicolor text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
