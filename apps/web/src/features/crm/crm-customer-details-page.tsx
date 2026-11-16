import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../store/auth-store';
import { API_BASE_URL } from '@/lib/api-base';

// Customer Details Page - Customer-centric listing (not order-centric)
export default function CrmCustomerDetailsPage() {
  const { staffUser, staffToken } = useAuthStore();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, pageSize, searchTerm]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const limitParam = pageSize === -1 ? 'all' : pageSize;
      const response = await fetch(
        `${API_BASE_URL}/v1/crm/customer-details-list?limit=${limitParam}&page=${currentPage}`,
        {
          headers: {
            Authorization: `Bearer ${staffToken}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setCustomers(data.data);
        if (data.total) setTotalCount(data.total);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contact?.includes(searchTerm) ||
      c.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = pageSize === -1 ? 1 : Math.ceil(totalCount / pageSize);
  const displayedCustomers = filteredCustomers;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ─── Main Card: CUSTOMER DETAILS LIST ─── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Card Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#003A66]">
            CUSTOMER DETAILS
          </h2>
          <Link
            to="/crm/operation-manage-customer"
            className="w-8 h-8 rounded-full bg-[#003A66] hover:bg-[#002B4D] text-white flex items-center justify-center shadow-xs transition-colors"
            title="Back to Manage Customer"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        {/* Export Toolbar */}
        <div className="p-3 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-300 rounded px-2 py-1 text-xs font-semibold focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={500}>500</option>
                <option value={-1}>All ({customers.length})</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              {['Copy', 'Excel', 'CSV', 'PDF', 'Print'].map((btn) => (
                <button
                  key={btn}
                  onClick={() => alert(`${btn} export executed`)}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded shadow-2xs"
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search Data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded px-3 py-1 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#003A66] w-48"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1E3A8A] text-white uppercase text-[11px] tracking-wider sticky top-0 z-10">
                <th className="py-2.5 px-3 font-bold text-left">Name</th>
                <th className="py-2.5 px-3 font-bold text-left">Mobile</th>
                <th className="py-2.5 px-3 font-bold text-left">Email</th>
                <th className="py-2.5 px-3 font-bold text-left">Password</th>
                <th className="py-2.5 px-3 font-bold text-left">State</th>
                <th className="py-2.5 px-3 font-bold text-left">City</th>
                <th className="py-2.5 px-3 font-bold text-left">Service</th>
                <th className="py-2.5 px-3 font-bold text-left">Amount</th>
                <th className="py-2.5 px-3 font-bold text-left">Added By</th>
                <th className="py-2.5 px-3 font-bold text-left">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-xs text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#1E3A8A] border-t-transparent rounded-full animate-spin" />
                      Loading live SQL customer records from database...
                    </div>
                  </td>
                </tr>
              ) : displayedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-xs text-slate-400">
                    No customers found matching your filter.
                  </td>
                </tr>
              ) : (
                displayedCustomers.map((customer, idx) => (
                  <tr
                    key={customer.id || idx}
                    className={
                      idx % 2 === 0
                        ? 'bg-white hover:bg-sky-50/40'
                        : 'bg-[#F9FAFB] hover:bg-sky-50/40'
                    }
                  >
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      {customer.name || '-'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">
                      {customer.contact || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{customer.email || '-'}</td>
                    <td className="py-2.5 px-3 text-slate-600">{customer.password || '-'}</td>
                    <td className="py-2.5 px-3 text-slate-600">{customer.state || '-'}</td>
                    <td className="py-2.5 px-3 text-slate-600">{customer.city || '-'}</td>
                    <td className="py-2.5 px-3 text-slate-800 font-medium">
                      {customer.service || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{customer.service_price || '-'}</td>
                    <td className="py-2.5 px-3 text-slate-600">{customer.added_by_name || '-'}</td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {customer.date ? new Date(customer.date).toLocaleDateString('en-GB') : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, totalCount)} of {totalCount} entries
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-2.5 py-1 rounded ${
                    currentPage === pageNum
                      ? 'bg-[#1E3A8A] text-white font-bold'
                      : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            {totalPages > 5 && <span className="px-1 text-slate-400">...</span>}
            {totalPages > 5 && (
              <button
                onClick={() => setCurrentPage(totalPages)}
                className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
              >
                {totalPages}
              </button>
            )}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
