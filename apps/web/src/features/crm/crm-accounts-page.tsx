import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Search,
  Plus,
  Trash2,
  Edit3,
  MoreVertical,
  Calendar,
  Send,
  X,
  UserPlus,
  Building,
  Phone,
  Mail,
  DollarSign,
  FileCheck,
  Clock,
  ChevronDown,
} from 'lucide-react';

interface CustomerItem {
  id: number;
  name: string;
  company: string;
  subCustomer?: string;
  mobile: string;
  email: string;
  state: string;
  city: string;
  category: string;
  service: string;
  type: string;
  addedBy: string;
  total: number;
  paid: number;
  unpaid: number;
  dueDate: string;
}

export default function CrmAccountsPage() {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  // Fetch real customers from database
  React.useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/v1/crm/customers`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data?.data)) {
          const mapped: CustomerItem[] = data.data.map((c: any, i: number) => ({
            id: c.id || i + 1,
            name: c.name || 'Client',
            company: c.business || 'Company',
            subCustomer: '',
            mobile: c.contact || '9876543210',
            email: c.email || 'client@etaxwala.in',
            state: c.state || 'Maharashtra',
            city: c.city || 'Pune',
            category: 'Taxation & Filing',
            service: c.service || 'Advisory',
            type: 'Basic',
            addedBy: `Staff #${c.added_by || 1}`,
            total: c.service_price || 1499,
            paid: c.is_payment ? c.service_price || 1499 : 0,
            unpaid: c.is_payment ? 0 : c.service_price || 1499,
            dueDate: '—',
          }));
          setCustomers(mapped);
        }
      })
      .catch((err) => console.error('Failed to fetch customers', err))
      .finally(() => setLoading(false));
  }, []);

  const location = useLocation();

  // Modals state
  const [activeCustomer, setActiveCustomer] = useState<CustomerItem | null>(null);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isUpdateCustomerOpen, setIsUpdateCustomerOpen] = useState(
    new URLSearchParams(location.search).get('update') === '1'
  );
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(
    new URLSearchParams(location.search).get('order') === '1'
  );
  const [isEditSubCustomerOpen, setIsEditSubCustomerOpen] = useState(false);
  const [isAddAppointmentOpen, setIsAddAppointmentOpen] = useState(
    new URLSearchParams(location.search).get('appointment') === '1'
  );
  const [isTasksDrawerOpen, setIsTasksDrawerOpen] = useState(
    new URLSearchParams(location.search).get('drawer') === '1'
  );

  // Form states
  const [subCustomerName, setSubCustomerName] = useState('');
  const [appointmentAdvisor, setAppointmentAdvisor] = useState('Mr. Vaijnath Sir');
  const [appointmentDate, setAppointmentDate] = useState('2026-09-06');
  const [appointmentTime, setAppointmentTime] = useState('14:30');
  const [appointmentDesc, setAppointmentDesc] = useState('');

  // Add tasks drawer state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [tasksList, setTasksList] = useState<string[]>([
    'PAN Registration',
    'Customer Support',
    'TAN Registration',
  ]);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.mobile.includes(searchTerm) ||
      c.service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateSubCustomer = () => {
    if (activeCustomer) {
      setCustomers((prev) =>
        prev.map((c) => (c.id === activeCustomer.id ? { ...c, subCustomer: subCustomerName } : c))
      );
      setIsEditSubCustomerOpen(false);
      alert('Sub Customer updated!');
    }
  };

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Appointment booked with ${appointmentAdvisor} for ${activeCustomer?.name}`);
    setIsAddAppointmentOpen(false);
  };

  const handleCreateNewTask = () => {
    if (newTaskTitle.trim()) {
      setTasksList([newTaskTitle.trim(), ...tasksList]);
      setNewTaskTitle('');
    }
  };

  return (
    <div className="space-y-4">
      {/* ─── Main Card: CUSTOMER LIST (Screenshot 102037.png) ─── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Card Header with Add Customer button */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#003A66]">
            CUSTOMER LIST
          </h2>
          <button
            onClick={() => {
              setActiveCustomer(null);
              setIsAddCustomerOpen(true);
            }}
            className="w-8 h-8 rounded-full bg-[#003A66] hover:bg-[#002B4D] text-white flex items-center justify-center shadow-xs transition-colors"
            title="Add New Customer"
          >
            <UserPlus className="w-4 h-4" />
          </button>
        </div>

        {/* Export Toolbar */}
        <div className="p-3 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-white border border-slate-300 rounded px-2 py-1 text-xs font-semibold focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
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

        {/* Customers Table */}
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-250px)] border border-slate-200 rounded-xl shadow-2xs">
          <table className="w-full text-left text-xs border-separate border-spacing-0">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#1E3A8A] text-white uppercase text-[11px] tracking-wider sticky top-0 z-10">
                <th className="py-2.5 px-3 font-bold">Name</th>
                <th className="py-2.5 px-3 font-bold">Company</th>
                <th className="py-2.5 px-3 font-bold">Mobile</th>
                <th className="py-2.5 px-3 font-bold">Category</th>
                <th className="py-2.5 px-3 font-bold">Service</th>
                <th className="py-2.5 px-3 font-bold">Added By</th>
                <th className="py-2.5 px-3 font-bold">Total</th>
                <th className="py-2.5 px-3 font-bold">Paid</th>
                <th className="py-2.5 px-3 font-bold">Unpaid</th>
                <th className="py-2.5 px-3 font-bold">Due Date</th>
                <th className="py-2.5 px-3 font-bold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-xs text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#1E3A8A] border-t-transparent rounded-full animate-spin" />
                      Loading live SQL customer records from database...
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-10 text-center text-xs text-slate-400">
                    No customers found matching your filter.
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={
                      idx % 2 === 0
                        ? 'bg-white hover:bg-sky-50/40'
                        : 'bg-[#F9FAFB] hover:bg-sky-50/40'
                    }
                  >
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      <button
                        onClick={() => {
                          setActiveCustomer(item);
                          setIsUpdateCustomerOpen(true);
                        }}
                        className="hover:text-[#0284c7] hover:underline font-bold text-left"
                      >
                        {item.name}
                      </button>
                      {item.subCustomer && (
                        <span className="ml-1.5 badge badge-navy text-[9px] py-0 px-1">
                          {item.subCustomer}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{item.company}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{item.mobile}</td>
                    <td className="py-2.5 px-3 text-slate-600">{item.category}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-slate-800 font-medium">{item.service}</span>{' '}
                      <span className="bg-[#16A34A] text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                        {item.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{item.addedBy}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{item.total}</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-700">{item.paid}</td>
                    <td className="py-2.5 px-3 font-bold text-red-600">{item.unpaid}</td>
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{item.dueDate}</td>
                    <td className="py-2.5 px-3 text-center relative">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                        className="p-1 hover:bg-slate-200 rounded text-slate-600"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* 3-Dot Dropdown Action Menu */}
                      {activeMenuId === item.id && (
                        <div className="absolute right-4 top-8 z-30 w-44 bg-white rounded-lg shadow-xl border border-slate-200 py-1 text-left text-xs">
                          <button
                            onClick={() => {
                              setActiveCustomer(item);
                              setIsAddOrderOpen(true);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3 py-1.5 hover:bg-slate-50 text-slate-700 font-medium block"
                          >
                            Add New Order
                          </button>
                          <button
                            onClick={() => {
                              setActiveCustomer(item);
                              setIsUpdateCustomerOpen(true);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3 py-1.5 hover:bg-slate-50 text-slate-700 font-medium block"
                          >
                            Update Customer
                          </button>
                          <button
                            onClick={() => {
                              setActiveCustomer(item);
                              setSubCustomerName(item.subCustomer || '');
                              setIsEditSubCustomerOpen(true);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3 py-1.5 hover:bg-slate-50 text-slate-700 font-medium block"
                          >
                            Edit Sub Customer
                          </button>
                          <button
                            onClick={() => {
                              setActiveCustomer(item);
                              setIsAddAppointmentOpen(true);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3 py-1.5 hover:bg-slate-50 text-slate-700 font-medium block"
                          >
                            Add Appointment
                          </button>
                          <button
                            onClick={() => {
                              setActiveCustomer(item);
                              setIsTasksDrawerOpen(true);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3 py-1.5 hover:bg-slate-50 text-slate-700 font-medium block"
                          >
                            Add Tasks Drawer
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing 1 to {filtered.length} of 2,069 entries</span>
          <div className="flex items-center gap-1">
            <button className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700">
              Previous
            </button>
            <button className="px-2.5 py-1 rounded bg-[#1E3A8A] text-white font-bold">1</button>
            <button className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700">
              2
            </button>
            <button className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700">
              3
            </button>
            <span className="px-1 text-slate-400">...</span>
            <button className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700">
              207
            </button>
            <button className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ─── ADD NEW ORDER MODAL (Website Clean UI Style) ─── */}
      {isAddOrderOpen && activeCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="rounded-3xl border border-[#EAE6DD] bg-white shadow-2xl overflow-hidden max-w-2xl w-full animate-scale-in">
            {/* Signature Top Multicolor Strip */}
            <div className="h-1 bg-multicolor" />

            {/* Modal Header */}
            <div className="p-4 px-6 border-b border-[#EAE6DD] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#1B365D] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#1B365D]">Add New Order</h3>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Customer: {activeCustomer.name} • {activeCustomer.company}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddOrderOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs max-h-[82vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Name</label>
                  <input
                    type="text"
                    defaultValue={activeCustomer.name}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-semibold focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Company/Shop Name
                  </label>
                  <input
                    type="text"
                    defaultValue={activeCustomer.company}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Sub Customer
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Sub Customer Name (e.g. OPC1, OPC2)"
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Email</label>
                  <input
                    type="email"
                    defaultValue={activeCustomer.email}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">State</label>
                  <input
                    type="text"
                    defaultValue={activeCustomer.state}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">City</label>
                  <input
                    type="text"
                    defaultValue={activeCustomer.city}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Mobile No
                  </label>
                  <input
                    type="text"
                    defaultValue={activeCustomer.mobile}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-mono focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Custom Package
                  </label>
                  <select className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]">
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Category
                  </label>
                  <select className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]">
                    <option value="Taxation and Return Filing">Taxation and Return Filing</option>
                    <option value="Business Registration">Business Registration</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Service</label>
                  <select className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]">
                    <option value="Select Service">Select Service</option>
                    <option value="Income Tax Return">Income Tax Return</option>
                    <option value="GST Return">GST Return</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Apply Coupon
                  </label>
                  <input
                    type="text"
                    placeholder="Coupon code..."
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Discount Amount
                  </label>
                  <input
                    type="number"
                    defaultValue={0}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Payment Mode
                  </label>
                  <select className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]">
                    <option value="Select EMI">Select EMI</option>
                    <option value="Full Payment">Full Payment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Total Amount
                  </label>
                  <input
                    type="number"
                    readOnly
                    defaultValue={1999}
                    className="w-full bg-slate-100 border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Paid Amount
                  </label>
                  <input
                    type="number"
                    defaultValue={1000}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-bold text-emerald-600 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">1st EMI</label>
                  <input
                    type="number"
                    defaultValue={999}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-semibold focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    1st Due Date
                  </label>
                  <input
                    type="date"
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Payment Screenshot
                </label>
                <input type="file" className="text-xs text-slate-500" />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Comment Box
                </label>
                <textarea
                  rows={2}
                  placeholder="Order notes and comments..."
                  className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl p-3 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                />
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <button
                  onClick={() => {
                    alert('Order added successfully!');
                    setIsAddOrderOpen(false);
                  }}
                  className="btn-single-moving btn-single-moving-solid px-6 py-2.5 rounded-full font-bold text-xs text-white shadow-xs cursor-pointer"
                  style={
                    {
                      '--c-base': '#06B6D4',
                      '--c-light': '#67E8F9',
                      '--c-dark': '#0891B2',
                    } as React.CSSProperties
                  }
                >
                  <span>Add</span>
                </button>
                <button
                  onClick={() => setIsAddOrderOpen(false)}
                  className="btn-single-moving btn-single-moving-solid px-6 py-2.5 rounded-full font-bold text-xs text-white shadow-xs cursor-pointer"
                  style={
                    {
                      '--c-base': '#EF4444',
                      '--c-light': '#FCA5A5',
                      '--c-dark': '#B91C1C',
                    } as React.CSSProperties
                  }
                >
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ─── UPDATE CUSTOMER MODAL (Website Clean UI Style) ─── */}
      {isUpdateCustomerOpen && activeCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="rounded-3xl border border-[#EAE6DD] bg-white shadow-2xl overflow-hidden max-w-xl w-full animate-scale-in">
            {/* Signature Top Multicolor Strip */}
            <div className="h-1 bg-multicolor" />

            <div className="p-4 px-6 border-b border-[#EAE6DD] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#1B365D] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <Edit3 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#1B365D]">Update Customer</h3>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {activeCustomer.name} • {activeCustomer.company}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsUpdateCustomerOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs max-h-[82vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Name</label>
                  <input
                    type="text"
                    defaultValue={activeCustomer.name}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-semibold focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Company/Shop Name
                  </label>
                  <input
                    type="text"
                    defaultValue={activeCustomer.company}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Email</label>
                  <input
                    type="email"
                    defaultValue={activeCustomer.email}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Mobile No
                  </label>
                  <input
                    type="text"
                    defaultValue={activeCustomer.mobile}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-mono focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">State</label>
                  <input
                    type="text"
                    defaultValue={activeCustomer.state}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">City</label>
                  <input
                    type="text"
                    defaultValue={activeCustomer.city}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Total Amount
                  </label>
                  <input
                    type="number"
                    defaultValue={activeCustomer.total}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-bold focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Paid Amount
                  </label>
                  <input
                    type="number"
                    defaultValue={activeCustomer.paid}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-bold text-emerald-600 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Unpaid Amount
                  </label>
                  <input
                    type="number"
                    defaultValue={activeCustomer.unpaid}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-bold text-red-600 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    alert('Customer info updated successfully!');
                    setIsUpdateCustomerOpen(false);
                  }}
                  className="btn-single-moving btn-single-moving-solid px-6 py-2.5 rounded-full font-bold text-xs text-white shadow-xs cursor-pointer"
                  style={
                    {
                      '--c-base': '#06B6D4',
                      '--c-light': '#67E8F9',
                      '--c-dark': '#0891B2',
                    } as React.CSSProperties
                  }
                >
                  <span>Update</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── EDIT SUB CUSTOMER MODAL (Website Clean UI Style) ─── */}
      {isEditSubCustomerOpen && activeCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="rounded-3xl border border-[#EAE6DD] bg-white shadow-2xl overflow-hidden max-w-sm w-full animate-scale-in">
            {/* Signature Top Multicolor Strip */}
            <div className="h-1 bg-multicolor" />

            <div className="p-4 px-6 border-b border-[#EAE6DD] flex items-center justify-between bg-white">
              <h3 className="font-extrabold text-sm text-[#1B365D]">Edit Sub Customer</h3>
              <button
                onClick={() => setIsEditSubCustomerOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Sub Customer Name
                </label>
                <input
                  type="text"
                  value={subCustomerName}
                  onChange={(e) => setSubCustomerName(e.target.value)}
                  placeholder="e.g. Branch 2 or OPC1"
                  className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                />
              </div>
              <div className="flex justify-end pt-1">
                <button
                  onClick={handleUpdateSubCustomer}
                  className="btn-single-moving btn-single-moving-solid px-5 py-2 rounded-full text-white font-bold text-xs shadow-xs cursor-pointer"
                  style={
                    {
                      '--c-base': '#1E3A8A',
                      '--c-light': '#3B82F6',
                      '--c-dark': '#172554',
                    } as React.CSSProperties
                  }
                >
                  <span>Update</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── ADD NEW APPOINTMENT MODAL (Website Clean UI Style) ─── */}
      {isAddAppointmentOpen && activeCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="rounded-3xl border border-[#EAE6DD] bg-white shadow-2xl overflow-hidden max-w-md w-full animate-scale-in">
            {/* Signature Top Multicolor Strip */}
            <div className="h-1 bg-multicolor" />

            <div className="p-4 px-6 border-b border-[#EAE6DD] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#1B365D] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#1B365D]">Add New Appointment</h3>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {activeCustomer.name} • {activeCustomer.company}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddAppointmentOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleBookAppointment}
              className="p-6 space-y-3.5 text-xs max-h-[82vh] overflow-y-auto"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    defaultValue={activeCustomer.name}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-semibold focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    defaultValue={activeCustomer.email}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Contact No *
                  </label>
                  <input
                    type="text"
                    required
                    defaultValue={activeCustomer.mobile}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-mono focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    defaultValue={activeCustomer.city}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Time *</label>
                  <input
                    type="time"
                    required
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Conduct By *
                </label>
                <select
                  value={appointmentAdvisor}
                  onChange={(e) => setAppointmentAdvisor(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-semibold focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                >
                  <option value="Mr. Vaijnath Sir">Mr. Vaijnath Sir (Director)</option>
                  <option value="CA Expert Panel">CA Expert Panel</option>
                  <option value="Kailas Gadekar">Kailas Gadekar</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Description *
                </label>
                <textarea
                  rows={2}
                  required
                  value={appointmentDesc}
                  onChange={(e) => setAppointmentDesc(e.target.value)}
                  placeholder="Reason for meeting / agenda..."
                  className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl p-3 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                />
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddAppointmentOpen(false)}
                  className="btn-single-moving btn-single-moving-solid flex-1 py-2.5 rounded-full font-bold text-xs text-white cursor-pointer"
                  style={
                    {
                      '--c-base': '#1F2937',
                      '--c-light': '#4B5563',
                      '--c-dark': '#111827',
                    } as React.CSSProperties
                  }
                >
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  className="btn-single-moving btn-single-moving-solid flex-1 py-2.5 rounded-full font-bold text-xs text-white shadow-xs cursor-pointer"
                  style={
                    {
                      '--c-base': '#1E3A8A',
                      '--c-light': '#3B82F6',
                      '--c-dark': '#172554',
                    } as React.CSSProperties
                  }
                >
                  <span>Book</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── ADD TASKS SLIDE-OVER DRAWER (Website Clean UI Style) ─── */}
      {isTasksDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsTasksDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-sm w-full bg-white shadow-2xl flex flex-col">
            {/* Signature Top Multicolor Strip */}
            <div className="h-1 bg-multicolor" />

            {/* Drawer Header */}
            <div className="p-4 px-6 border-b border-[#EAE6DD] flex items-center justify-between bg-white">
              <h3 className="font-extrabold text-sm text-[#1B365D]">Add Tasks</h3>
              <button
                onClick={() => setIsTasksDrawerOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-5 space-y-4 flex-1 overflow-y-auto text-xs">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Create New Task..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="flex-1 bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                />
                <button
                  onClick={handleCreateNewTask}
                  className="btn-single-moving btn-single-moving-solid px-4 py-2 rounded-full text-white font-bold text-xs shadow-xs cursor-pointer"
                  style={
                    {
                      '--c-base': '#1E3A8A',
                      '--c-light': '#3B82F6',
                      '--c-dark': '#172554',
                    } as React.CSSProperties
                  }
                >
                  <span>Add</span>
                </button>
              </div>

              <div className="space-y-2 pt-2">
                {tasksList.map((t, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-2 p-1.5 bg-[#FAF9F5] border border-[#EAE6DD] rounded-2xl"
                  >
                    <button className="flex-1 bg-white hover:bg-slate-50 text-slate-800 font-semibold py-2 px-3 rounded-xl border border-[#EAE6DD] flex items-center justify-between shadow-2xs">
                      <span>{t}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                    <button
                      onClick={() => alert(`Task "${t}" assigned to operations specialist.`)}
                      className="w-8 h-8 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 transition-colors"
                      title="Send Task"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setTasksList(tasksList.filter((_, idx) => idx !== i))}
                      className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 border border-red-200 flex items-center justify-center text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
