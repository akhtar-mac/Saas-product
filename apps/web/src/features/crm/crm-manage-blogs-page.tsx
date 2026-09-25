import React, { useState } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  FileText,
  Calendar,
  Eye,
  AlertTriangle,
  User,
  ImageIcon,
  Check,
  ExternalLink,
} from 'lucide-react';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  featuredImage: string;
  status: 'Draft' | 'Published' | 'Archived';
  category: string;
  publishedAt: string | null;
  views: number;
}

const INITIAL_BLOGS: BlogPost[] = [
  {
    id: 1,
    title: 'How to Register a Private Limited Company in India',
    slug: 'how-to-register-private-limited-company-india',
    excerpt: 'Step-by-step guide to Pvt Ltd registration with MCA.',
    content: 'Full article content goes here...',
    author: 'ETaxwala Editorial',
    featuredImage: '/blog/company-registration.jpg',
    status: 'Published',
    category: 'Business Registration',
    publishedAt: '2026-09-10',
    views: 1240,
  },
  {
    id: 2,
    title: 'GST Return Filing Due Dates for FY 2026-27',
    slug: 'gst-return-due-dates-2026-27',
    excerpt: 'Never miss a GST filing deadline with this calendar.',
    content: 'Full article content goes here...',
    author: 'CA Team',
    featuredImage: '/blog/gst-dates.jpg',
    status: 'Published',
    category: 'Taxation',
    publishedAt: '2026-09-05',
    views: 856,
  },
  {
    id: 3,
    title: 'Benefits of MSME Udyam Registration',
    slug: 'benefits-msme-udyam-registration',
    excerpt: 'Why every small business should register on Udyam.',
    content: 'Full article content goes here...',
    author: 'Marketing Team',
    featuredImage: '/blog/msme-benefits.jpg',
    status: 'Draft',
    category: 'Other Registrations',
    publishedAt: null,
    views: 0,
  },
];

const BLOG_CATEGORIES = [
  'Business Registration',
  'Taxation',
  'Other Registrations',
  'Trademark and IP',
  'Marketing',
  'Legal',
  'Company Updates',
];

const EMPTY_BLOG: BlogPost = {
  id: 0,
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  author: '',
  featuredImage: '',
  status: 'Draft',
  category: 'Business Registration',
  publishedAt: null,
  views: 0,
};

export default function CrmManageBlogsPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>(INITIAL_BLOGS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [form, setForm] = useState<BlogPost>(EMPTY_BLOG);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const filtered = blogs.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const generateSlug = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 80);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_BLOG);
    setIsModalOpen(true);
  };

  const openEdit = (blog: BlogPost) => {
    setEditing(blog);
    setForm({ ...blog });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditing(null);
    setForm(EMPTY_BLOG);
  };

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({ ...prev, title, slug: editing ? prev.slug : generateSlug(title) }));
  };

  const handleSave = () => {
    if (!form.title.trim()) {
      showToast('Blog title is required', 'error');
      return;
    }
    if (!form.slug.trim()) {
      showToast('Slug is required', 'error');
      return;
    }

    const publishedAt =
      form.status === 'Published' && !form.publishedAt
        ? new Date().toISOString().split('T')[0]
        : form.publishedAt;
    const updatedForm = { ...form, publishedAt };

    if (editing) {
      setBlogs((prev) =>
        prev.map((b) =>
          b.id === editing.id ? { ...updatedForm, id: editing.id, views: editing.views } : b
        )
      );
      showToast('Blog updated successfully');
    } else {
      const newId = Math.max(...blogs.map((b) => b.id), 0) + 1;
      setBlogs((prev) => [...prev, { ...updatedForm, id: newId }]);
      showToast('Blog created successfully');
    }
    closeModal();
  };

  const handleDelete = () => {
    if (deleteId) {
      setBlogs((prev) => prev.filter((b) => b.id !== deleteId));
      showToast('Blog deleted successfully');
      setDeleteId(null);
    }
  };

  const getStatusBadge = (status: BlogPost['status']) => {
    switch (status) {
      case 'Published':
        return 'badge-green';
      case 'Draft':
        return 'badge-gold';
      case 'Archived':
        return 'badge-red';
      default:
        return 'badge-navy';
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1B365D] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#00A896]" />
            Manage Blogs
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create, edit and publish SEO-friendly blog posts for the marketing website.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Blog
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4 border border-slate-100">
          <p className="text-[10px] uppercase tracking-wide text-slate-500 font-bold">
            Total Blogs
          </p>
          <p className="text-2xl font-bold text-[#1B365D] mt-1">{blogs.length}</p>
        </div>
        <div className="card p-4 border border-slate-100">
          <p className="text-[10px] uppercase tracking-wide text-slate-500 font-bold">Published</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {blogs.filter((b) => b.status === 'Published').length}
          </p>
        </div>
        <div className="card p-4 border border-slate-100">
          <p className="text-[10px] uppercase tracking-wide text-slate-500 font-bold">Drafts</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {blogs.filter((b) => b.status === 'Draft').length}
          </p>
        </div>
        <div className="card p-4 border border-slate-100">
          <p className="text-[10px] uppercase tracking-wide text-slate-500 font-bold">
            Total Views
          </p>
          <p className="text-2xl font-bold text-[#00A896] mt-1">
            {blogs.reduce((sum, b) => sum + b.views, 0).toLocaleString('en-IN')}
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
            placeholder="Search blogs by title, author or category..."
            className="input w-full pl-9 text-xs"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input text-xs"
        >
          <option value="all">All Status</option>
          <option value="Published">Published</option>
          <option value="Draft">Draft</option>
          <option value="Archived">Archived</option>
        </select>
      </div>

      {/* Table */}
      <div className="card border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-crm w-full text-xs">
            <thead className="bg-[#FAF9F5] border-b border-[#EAE6DD]">
              <tr>
                <th className="text-left px-4 py-3 font-bold text-slate-600">Blog Title</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">Category</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">Author</th>
                <th className="text-center px-4 py-3 font-bold text-slate-600">Status</th>
                <th className="text-center px-4 py-3 font-bold text-slate-600">Views</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">Published</th>
                <th className="text-right px-4 py-3 font-bold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((blog) => (
                <tr key={blog.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{blog.title}</div>
                    <div className="text-[10px] text-slate-500">/{blog.slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="badge badge-navy text-[10px]">{blog.category}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{blog.author}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`badge text-[10px] ${getStatusBadge(blog.status)}`}>
                      {blog.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-slate-600">
                    {blog.views.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{blog.publishedAt || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(blog)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#1B365D] hover:bg-slate-100"
                        title="Edit"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteId(blog.id)}
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
                    No blogs found matching your filters.
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-sm font-bold text-[#1B365D]">
                {editing ? 'Edit Blog Post' : 'Add New Blog Post'}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Blog Title *
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. How to Register a Pvt Ltd Company"
                    className="input w-full text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Slug *</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="how-to-register-pvt-ltd"
                    className="input w-full text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="input w-full text-xs"
                  >
                    {BLOG_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Author</label>
                  <input
                    type="text"
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    placeholder="Author name"
                    className="input w-full text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value as BlogPost['status'] })
                    }
                    className="input w-full text-xs"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Featured Image URL
                  </label>
                  <input
                    type="text"
                    value={form.featuredImage}
                    onChange={(e) => setForm({ ...form, featuredImage: e.target.value })}
                    placeholder="/blog/image-name.jpg"
                    className="input w-full text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Excerpt</label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  placeholder="Short summary for blog cards and meta description"
                  rows={2}
                  className="input w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Content (Rich text / Markdown)
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Write full blog content here. You can integrate a rich text editor later."
                  rows={10}
                  className="input w-full text-xs font-mono"
                />
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
              <h2 className="text-sm font-bold text-[#1B365D]">Delete Blog?</h2>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              This will permanently delete the blog post and its SEO ranking history.
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
