import React, { useState, useEffect, useCallback } from 'react';
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

// DB category type
interface CategoryItem {
  category_id: number;
  category_name: string;
}
// DB service type
interface ServiceItem {
  service_id: number;
  service_name: string;
  service_price: number;
  category_id?: number;
  category_name?: string;
}

export default function CrmAccountsPage() {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  // Dynamic categories & services from DB
  const [dbCategories, setDbCategories] = useState<CategoryItem[]>([]);
  const [dbServicesByCategory, setDbServicesByCategory] = useState<ServiceItem[]>([]);
  const [allDbServices, setAllDbServices] = useState<ServiceItem[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const customDropdownRef = React.useRef<HTMLDivElement>(null);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  // Fetch real customers from database
  const fetchCustomers = useCallback(() => {
    setLoading(true);
    const limitParam = pageSize === -1 ? 'all' : pageSize;
    fetch(`${API_BASE}/v1/crm/customers?limit=${limitParam}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data?.data)) {
          const mapped: CustomerItem[] = data.data.map((c: any, i: number) => ({
            id: c.id || i + 1,
            name: c.name || 'Client',
            company: c.business || c.company || 'Company',
            subCustomer: c.subCustomer || '',
            mobile: c.mobile || c.contact || '9876543210',
            email: c.email || 'client@etaxwala.in',
            state: c.state || 'Maharashtra',
            city: c.city || 'Pune',
            category: c.category || 'Taxation & Return Filing',
            service: c.service || 'Advisory',
            type: c.type || 'Basic',
            addedBy: c.addedBy || `Staff #${c.added_by || 1}`,
            total: c.total !== undefined ? c.total : 1499,
            paid: c.paid !== undefined ? c.paid : 0,
            unpaid: c.unpaid !== undefined ? c.unpaid : 1499,
            dueDate: c.dueDate || '—',
          }));
          setCustomers(mapped);
          if (data.total) setTotalCount(data.total);
        }
      })
      .catch((err) => console.error('Failed to fetch customers', err))
      .finally(() => setLoading(false));
  }, [API_BASE, pageSize]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Click outside to close custom package dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (customDropdownRef.current && !customDropdownRef.current.contains(event.target as Node)) {
        setIsCustomDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch categories from DB on mount
  useEffect(() => {
    setLoadingCategories(true);
    fetch(`${API_BASE}/v1/crm/categories`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data?.data) && data.data.length > 0) {
          setDbCategories(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingCategories(false));
  }, [API_BASE]);

  // Fetch all services for custom package multi-select
  useEffect(() => {
    fetch(`${API_BASE}/v1/crm/all-services`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data?.data) && data.data.length > 0) {
          setAllDbServices(data.data);
        }
      })
      .catch(() => {});
  }, [API_BASE]);

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

  // Add Customer Form State (Old CRM Wizard Replica)
  const [addCustomerName, setAddCustomerName] = useState('');
  const [addBusinessName, setAddBusinessName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addMobile, setAddMobile] = useState('');
  const [addState, setAddState] = useState('Maharashtra');
  const [addCity, setAddCity] = useState('Chhatrapati Sambhajinagar');
  const [isCustomPkg, setIsCustomPkg] = useState('0'); // '0' = No, '1' = Yes
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0);
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState<number>(0);
  const [selectedServiceName, setSelectedServiceName] = useState('');
  const [customPkgName, setCustomPkgName] = useState('');
  const [selectedCustomServiceIds, setSelectedCustomServiceIds] = useState<number[]>([]);
  const [isCustomDropdownOpen, setIsCustomDropdownOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [actualPrice, setActualPrice] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentMode, setPaymentMode] = useState('1'); // 1: No EMI, 2: 2 EMI, 3: 3 EMI
  const [paidAmount, setPaidAmount] = useState(0);
  const [dueDate1, setDueDate1] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [dueDate2, setDueDate2] = useState(
    new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [comment, setComment] = useState('');

  // Fetch services when category changes
  const fetchServicesForCategory = useCallback(
    (catId: number) => {
      if (!catId) return;
      setLoadingServices(true);
      fetch(`${API_BASE}/v1/crm/services-by-category/${catId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.success && Array.isArray(data?.data) && data.data.length > 0) {
            setDbServicesByCategory(data.data);
            // Auto-select first service
            const first = data.data[0] as ServiceItem;
            setSelectedServiceId(first.service_id);
            setSelectedServiceName(first.service_name);
            setActualPrice(first.service_price);
            setPaidAmount(first.service_price);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingServices(false));
    },
    [API_BASE]
  );

  // When categories load, auto-select first category and fetch its services
  useEffect(() => {
    if (dbCategories.length > 0 && selectedCategoryId === 0) {
      const firstCat = dbCategories[0];
      setSelectedCategoryId(firstCat.category_id);
      setSelectedCategoryName(firstCat.category_name);
      fetchServicesForCategory(firstCat.category_id);
    }
  }, [dbCategories, selectedCategoryId, fetchServicesForCategory]);

  const handleCategoryChange = (catIdStr: string) => {
    const catId = Number(catIdStr);
    const cat = dbCategories.find((c) => c.category_id === catId);
    setSelectedCategoryId(catId);
    setSelectedCategoryName(cat?.category_name || '');
    setDbServicesByCategory([]);
    setSelectedServiceId(0);
    setSelectedServiceName('');
    setActualPrice(0);
    setPaidAmount(0);
    fetchServicesForCategory(catId);
  };

  const handleServiceChange = (servIdStr: string) => {
    const servId = Number(servIdStr);
    const serv = dbServicesByCategory.find((s) => s.service_id === servId);
    if (serv) {
      setSelectedServiceId(serv.service_id);
      setSelectedServiceName(serv.service_name);
      setActualPrice(serv.service_price);
      setPaidAmount(serv.service_price);
    }
  };

  const toggleCustomService = (servId: number) => {
    if (selectedCustomServiceIds.includes(servId)) {
      setSelectedCustomServiceIds(selectedCustomServiceIds.filter((id) => id !== servId));
    } else {
      setSelectedCustomServiceIds([...selectedCustomServiceIds, servId]);
    }
  };

  // Calculation logic matching old CRM
  const basePriceTotal =
    isCustomPkg === '1'
      ? selectedCustomServiceIds.reduce(
          (acc, id) => acc + (allDbServices.find((s) => s.service_id === id)?.service_price || 0),
          0
        )
      : actualPrice;

  const finalTotalAmount = Math.max(basePriceTotal - discountAmount, 0);

  // When Payment Mode is No EMI ('1'), paidAmount defaults automatically to finalTotalAmount
  useEffect(() => {
    if (paymentMode === '1') {
      setPaidAmount(finalTotalAmount);
    }
  }, [paymentMode, finalTotalAmount]);

  const remainingUnpaid = Math.max(finalTotalAmount - paidAmount, 0);

  const emi1Amount =
    paymentMode === '1'
      ? 0
      : paymentMode === '3'
        ? Math.round(remainingUnpaid / 2)
        : remainingUnpaid;

  const emi2Amount = paymentMode === '3' ? remainingUnpaid - emi1Amount : 0;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/v1/crm/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, total_amount: basePriceTotal }),
      });
      const data = await res.json();
      if (data.success && data.data?.discount_amount !== undefined) {
        setDiscountAmount(data.data.discount_amount);
        alert(data.data.message || `Coupon Applied! Saved ₹${data.data.discount_amount}`);
      } else {
        alert(data.error || 'Invalid or expired coupon code');
      }
    } catch (err) {
      alert('Failed to validate coupon code');
    }
  };

  const handleAddOfflineCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addCustomerName.trim()) {
      alert('Please enter customer name');
      return;
    }
    if (!addMobile.trim()) {
      alert('Please enter customer mobile number');
      return;
    }

    const serviceLabel =
      isCustomPkg === '1' ? customPkgName || 'Custom Package' : selectedServiceName;

    try {
      const res = await fetch(`${API_BASE}/v1/crm/customers/add-offline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: addCustomerName,
          customer_businessName: addBusinessName,
          customer_email: addEmail,
          customer_mobile: addMobile,
          customer_state: addState,
          customer_city: addCity,
          customer_category_id: selectedCategoryId,
          customer_service_id: selectedServiceId,
          customer_service: serviceLabel,
          customer_total_service_price: finalTotalAmount,
          customer_paid_amount: paidAmount,
          customer_unpaid_amount: remainingUnpaid,
          customer_due_date: dueDate1,
          customer_payment_mode: paymentMode,
          customer_unpaid_amount2: emi2Amount,
          customer_due_date2: dueDate2,
          customer_comment: comment,
          coupon_code: couponCode,
          discount_amount: discountAmount,
          is_custom: isCustomPkg,
          custom_package_name: customPkgName,
          custom_package_services: selectedCustomServiceIds,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(
          `Customer "${addCustomerName}" added successfully to database! ${data.data?.total_tasks_created || 0} operations tasks generated.`
        );
        setIsAddCustomerOpen(false);

        // Reload fresh customer list from DB
        fetchCustomers();

        // Reset form
        setAddCustomerName('');
        setAddBusinessName('');
        setAddEmail('');
        setAddMobile('');
        setComment('');
        setSelectedCustomServiceIds([]);
        setDiscountAmount(0);
        setCouponCode('');
        setIsCustomPkg('0');
        setPaymentMode('1');
      } else {
        alert(data.error || 'Failed to add customer');
      }
    } catch (err) {
      console.error('API Error adding customer:', err);
      alert('Error connecting to server. Please try again.');
    }
  };

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
                <option value={100}>100</option>
                <option value={500}>500</option>
                <option value={-1}>All ({totalCount || 1421})</option>
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
          <span>
            Showing 1 to {filtered.length} of {totalCount || customers.length} entries
          </span>
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

      {/* ─── ADD NEW CUSTOMER MODAL (Old CRM Replica matching Screenshots 1 & 2) ─── */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="rounded-2xl border border-slate-200 bg-[#FAF9F5] shadow-2xl overflow-hidden max-w-3xl w-full my-6 animate-scale-in">
            {/* Red Gradient Banner Header (matching Screenshots) */}
            <div className="bg-gradient-to-r from-[#E14D43] to-[#DC2626] px-6 py-4 flex items-center justify-between text-white">
              <h2 className="font-extrabold text-lg tracking-wide text-white">Add New Customer</h2>
              <button
                onClick={() => setIsAddCustomerOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleAddOfflineCustomer}
              className="p-6 space-y-4 text-xs max-h-[82vh] overflow-y-auto"
            >
              {/* Row 1: Name, Company/Shop Name, Email */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Customer Name"
                    value={addCustomerName}
                    onChange={(e) => setAddCustomerName(e.target.value)}
                    className="w-full bg-[#EBF3FF] border border-[#CBD5E1] rounded-xl px-3 py-2 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Company/Shop Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Company/Shop Name"
                    value={addBusinessName}
                    onChange={(e) => setAddBusinessName(e.target.value)}
                    className="w-full bg-[#EBF3FF] border border-[#CBD5E1] rounded-xl px-3 py-2 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="madhurchoudhari10@gmail.com"
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    className="w-full bg-[#EBF3FF] border border-[#CBD5E1] rounded-xl px-3 py-2 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  />
                  {addEmail && (
                    <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                      true
                    </span>
                  )}
                </div>
              </div>

              {/* Row 2: Mobile No, State, City */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Mobile No
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Mobile No"
                    value={addMobile}
                    onChange={(e) => setAddMobile(e.target.value)}
                    className="w-full bg-[#EBF3FF] border border-[#CBD5E1] rounded-xl px-3 py-2 text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  />
                  {addMobile && (
                    <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                      true
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="State"
                    value={addState}
                    onChange={(e) => setAddState(e.target.value)}
                    className="w-full bg-[#EBF3FF] border border-[#CBD5E1] rounded-xl px-3 py-2 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={addCity}
                    onChange={(e) => setAddCity(e.target.value)}
                    className="w-full bg-[#EBF3FF] border border-[#CBD5E1] rounded-xl px-3 py-2 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Row 3: Custom Package toggle, Category/Package Name, Service/Multi-select, Total Amount */}
              {isCustomPkg === '0' ? (
                /* SINGLE SERVICE FLOW (no custom package) */
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Custom Package
                    </label>
                    <select
                      value={isCustomPkg}
                      onChange={(e) => setIsCustomPkg(e.target.value)}
                      className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none"
                    >
                      <option value="0">No</option>
                      <option value="1">Yes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Category{' '}
                      {loadingCategories && (
                        <span className="text-[9px] text-slate-400">(Loading...)</span>
                      )}
                    </label>
                    <select
                      value={selectedCategoryId}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none"
                    >
                      {dbCategories.length === 0 && <option value="">Loading categories...</option>}
                      {dbCategories.map((cat) => (
                        <option key={cat.category_id} value={cat.category_id}>
                          {cat.category_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Service{' '}
                      {loadingServices && (
                        <span className="text-[9px] text-slate-400">(Loading...)</span>
                      )}
                    </label>
                    <select
                      value={selectedServiceId}
                      onChange={(e) => handleServiceChange(e.target.value)}
                      className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none"
                    >
                      {dbServicesByCategory.length === 0 && (
                        <option value="">Select category first...</option>
                      )}
                      {dbServicesByCategory.map((s) => (
                        <option key={s.service_id} value={s.service_id}>
                          {s.service_name} = ₹{s.service_price}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Total Amount
                    </label>
                    <input
                      type="number"
                      readOnly
                      value={basePriceTotal}
                      className="w-full bg-[#E2E8F0] border border-[#CBD5E1] rounded-xl px-3 py-2 text-slate-900 font-bold"
                    />
                  </div>
                </div>
              ) : (
                /* CUSTOM PACKAGE FLOW */
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Custom Package
                    </label>
                    <select
                      value={isCustomPkg}
                      onChange={(e) => setIsCustomPkg(e.target.value)}
                      className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none"
                    >
                      <option value="0">No</option>
                      <option value="1">Yes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Package Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. pvt ltd"
                      value={customPkgName}
                      onChange={(e) => setCustomPkgName(e.target.value)}
                      className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none"
                    />
                  </div>
                  <div className="relative" ref={customDropdownRef}>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Select Custom Services
                    </label>
                    <div
                      onClick={() => setIsCustomDropdownOpen(!isCustomDropdownOpen)}
                      className="w-full min-h-[38px] bg-white border border-[#CBD5E1] rounded-xl px-2 py-1.5 flex flex-wrap gap-1 items-center cursor-pointer"
                    >
                      {selectedCustomServiceIds.length === 0 && (
                        <span className="text-[10px] text-slate-400">
                          Click to select services...
                        </span>
                      )}
                      {selectedCustomServiceIds.map((id) => {
                        const serv = allDbServices.find((s) => s.service_id === id);
                        return serv ? (
                          <span
                            key={id}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-300 flex items-center gap-1"
                          >
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCustomService(id);
                              }}
                            >
                              ×
                            </span>
                            {serv.service_name}
                          </span>
                        ) : null;
                      })}
                    </div>

                    {isCustomDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-300 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto p-1">
                        {allDbServices.length === 0 && (
                          <div className="p-3 text-xs text-slate-400 text-center">
                            Loading services...
                          </div>
                        )}
                        {allDbServices.map((s) => (
                          <div
                            key={s.service_id}
                            onClick={() => toggleCustomService(s.service_id)}
                            className={`p-2 rounded-lg text-xs cursor-pointer font-medium flex items-center justify-between ${
                              selectedCustomServiceIds.includes(s.service_id)
                                ? 'bg-sky-100 text-sky-900 font-bold'
                                : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <span>{s.service_name}</span>
                            <span className="text-[10px] text-slate-500">₹{s.service_price}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Total Amount
                    </label>
                    <input
                      type="number"
                      readOnly
                      value={basePriceTotal}
                      className="w-full bg-[#E2E8F0] border border-[#CBD5E1] rounded-xl px-3 py-2 text-slate-900 font-bold"
                    />
                  </div>
                </div>
              )}

              {/* Row 4: Apply Coupon, Discount Amount, Payment Mode */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Apply Coupon
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="enter coupon code if any"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3 py-2 text-slate-800 uppercase focus:outline-none text-xs font-semibold"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="bg-[#003A66] hover:bg-[#002B4D] text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors shrink-0"
                    >
                      Apply
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Discount Amount
                  </label>
                  <input
                    type="number"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
                    className="w-full bg-[#E2E8F0] border border-[#CBD5E1] rounded-xl px-3 py-2 text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none"
                  >
                    <option value="1">No EMI</option>
                    <option value="2">2 EMI</option>
                    <option value="3">3 EMI</option>
                  </select>
                </div>
              </div>

              {/* Row 5: Paid Amount, 1st EMI, 1st Due Date (and 2nd EMI if 3 EMI) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Paid Amount
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Paid Amount"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(Number(e.target.value) || 0)}
                    className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    1st EMI
                  </label>
                  <input
                    type="number"
                    readOnly
                    value={emi1Amount}
                    className="w-full bg-[#E2E8F0] border border-[#CBD5E1] rounded-xl px-3 py-2 text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    1st Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate1}
                    onChange={(e) => setDueDate1(e.target.value)}
                    className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none"
                  />
                </div>
              </div>

              {/* Additional EMI Row if 3 EMI */}
              {paymentMode === '3' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-sky-50/50 p-3 rounded-xl border border-sky-100">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      2nd EMI
                    </label>
                    <input
                      type="number"
                      readOnly
                      value={emi2Amount}
                      className="w-full bg-[#E2E8F0] border border-[#CBD5E1] rounded-xl px-3 py-2 text-slate-900 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      2nd Due Date
                    </label>
                    <input
                      type="date"
                      value={dueDate2}
                      onChange={(e) => setDueDate2(e.target.value)}
                      className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Row 6: Comment Box & Payment Screenshot */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Comment Box
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Comment ..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full bg-white border border-[#CBD5E1] rounded-xl p-3 text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Payment Screenshot
                  </label>
                  <div className="bg-white border border-[#CBD5E1] rounded-xl p-2 flex items-center gap-2">
                    <input type="file" className="text-xs text-slate-600 w-full" />
                  </div>
                </div>
              </div>

              {/* Buttons (matching Screenshot 1 & 2 Cyan Add button + Red Reset button) */}
              <div className="flex items-center gap-4 pt-2">
                <button
                  type="submit"
                  className="bg-[#00A896] hover:bg-[#0084D1] text-white font-bold py-2.5 px-10 rounded-xl shadow-md transition-colors text-xs cursor-pointer"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddCustomerName('');
                    setAddBusinessName('');
                    setAddEmail('');
                    setAddMobile('');
                    setComment('');
                    setSelectedCustomServiceIds([]);
                    setDiscountAmount(0);
                    setCouponCode('');
                    setIsCustomPkg('0');
                    setPaymentMode('1');
                  }}
                  className="bg-[#DC2626] hover:bg-red-700 text-white font-bold py-2.5 px-8 rounded-xl shadow-md transition-colors text-xs cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
