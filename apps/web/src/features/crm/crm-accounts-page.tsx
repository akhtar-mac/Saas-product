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
  CheckCircle2,
  AlertTriangle,
  ListTodo,
  PlusCircle,
  Tag,
  Check,
  Loader2,
} from 'lucide-react';

interface CustomerItem {
  id: number;
  orderId?: number | null;
  packageId?: string | null;
  serviceId?: number;
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
            orderId: c.orderId || null,
            packageId: c.packageId || null,
            serviceId: c.serviceId || 1,
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
  const [couponMessage, setCouponMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
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

  const handleApplyCoupon = async (codeToUse?: string) => {
    const code = (codeToUse !== undefined ? codeToUse : couponCode).trim();
    if (!code) {
      setDiscountAmount(0);
      setCouponMessage(null);
      return;
    }
    if (basePriceTotal <= 0) {
      setCouponMessage({ type: 'error', text: 'Please select category and service first' });
      return;
    }
    setIsValidatingCoupon(true);
    setCouponMessage(null);
    try {
      const res = await fetch(`${API_BASE}/v1/crm/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, total_amount: basePriceTotal }),
      });
      const data = await res.json();
      if (data.success && data.data?.discount_amount !== undefined) {
        setDiscountAmount(data.data.discount_amount);
        setCouponMessage({
          type: 'success',
          text: data.data.message || `Coupon Applied! Saved ₹${data.data.discount_amount}`,
        });
      } else {
        setDiscountAmount(0);
        setCouponMessage({
          type: 'error',
          text: data.error || 'Invalid or expired coupon code',
        });
      }
    } catch (err) {
      setDiscountAmount(0);
      setCouponMessage({ type: 'error', text: 'Failed to validate coupon code' });
    } finally {
      setIsValidatingCoupon(false);
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
        setCouponMessage(null);
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

  // Staff users list for assigning tasks
  const [staffUsers, setStaffUsers] = useState<any[]>([]);
  useEffect(() => {
    fetch(`${API_BASE}/v1/crm/users`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data?.data)) {
          setStaffUsers(data.data);
        }
      })
      .catch(() => {});
  }, [API_BASE]);

  // Notification Toast State
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Manage Tasks State (Action: Manage Tasks)
  const [customerTasks, setCustomerTasks] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [newCustomerTaskTitle, setNewCustomerTaskTitle] = useState('');
  const [selectedTaskToAssign, setSelectedTaskToAssign] = useState<number | null>(null);
  const [assigneeId, setAssigneeId] = useState('');
  const [assignDueDate, setAssignDueDate] = useState('');

  // 2. Edit Customer Modal State (Action: Edit Customer)
  const [editName, setEditName] = useState('');
  const [editBusiness, setEditBusiness] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [editState, setEditState] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editTotal, setEditTotal] = useState(0);
  const [editPaid, setEditPaid] = useState(0);
  const [editUnpaid, setEditUnpaid] = useState(0);
  const [isUpdatingCustomer, setIsUpdatingCustomer] = useState(false);

  // 3. Add New Order Modal State (Action: Add New Order)
  const [orderSubCustomer, setOrderSubCustomer] = useState('');
  const [orderCatId, setOrderCatId] = useState(0);
  const [orderServId, setOrderServId] = useState(0);
  const [orderServPrice, setOrderServPrice] = useState(0);
  const [orderPaymentMode, setOrderPaymentMode] = useState('1');
  const [orderPaidAmount, setOrderPaidAmount] = useState(0);
  const [orderDueDate1, setOrderDueDate1] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [orderDueDate2, setOrderDueDate2] = useState(
    new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [orderCoupon, setOrderCoupon] = useState('');
  const [orderDiscount, setOrderDiscount] = useState(0);
  const [orderCouponMsg, setOrderCouponMsg] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [isValidatingOrderCoupon, setIsValidatingOrderCoupon] = useState(false);
  const [orderComment, setOrderComment] = useState('');
  const [isAddingOrder, setIsAddingOrder] = useState(false);

  // 4. Create Customer Modal State (Action: Create Customer - Key User Request)
  const [isCreateCustomerOpen, setIsCreateCustomerOpen] = useState(false);
  const [createCustName, setCreateCustName] = useState('');
  const [createCustBusiness, setCreateCustBusiness] = useState('');
  const [createCustSubCustomer, setCreateCustSubCustomer] = useState('');
  const [createCustEmail, setCreateCustEmail] = useState('');
  const [createCustMobile, setCreateCustMobile] = useState('');
  const [createCustState, setCreateCustState] = useState('Maharashtra');
  const [createCustCity, setCreateCustCity] = useState('Pune');
  const [createCustCatId, setCreateCustCatId] = useState(0);
  const [createCustServId, setCreateCustServId] = useState(0);
  const [createCustPrice, setCreateCustPrice] = useState(0);
  const [createCustCoupon, setCreateCustCoupon] = useState('');
  const [createCustDiscount, setCreateCustDiscount] = useState(0);
  const [createCustCouponMsg, setCreateCustCouponMsg] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [isValidatingCreateCoupon, setIsValidatingCreateCoupon] = useState(false);
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);

  // 5. Delete Order Confirmation Modal State (Action: Delete Order)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeletingOrder, setIsDeletingOrder] = useState(false);

  // 6. Appointment Form State (Action: Add Appointment)
  const [apptName, setApptName] = useState('');
  const [apptEmail, setApptEmail] = useState('');
  const [apptMobile, setApptMobile] = useState('');
  const [apptCity, setApptCity] = useState('');
  const [isBookingAppt, setIsBookingAppt] = useState(false);

  // ─── ACTION OPENERS ───
  const openManageTasks = (item: CustomerItem) => {
    setActiveCustomer(item);
    setIsTasksDrawerOpen(true);
    setLoadingTasks(true);
    fetch(`${API_BASE}/v1/crm/customers/${item.id}/tasks`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data?.data)) {
          setCustomerTasks(data.data);
        } else {
          setCustomerTasks([]);
        }
      })
      .catch((err) => {
        console.error('Error fetching tasks:', err);
        setCustomerTasks([]);
      })
      .finally(() => setLoadingTasks(false));
  };

  const openEditCustomer = (item: CustomerItem) => {
    setActiveCustomer(item);
    setEditName(item.name);
    setEditBusiness(item.company === '—' ? '' : item.company);
    setEditEmail(item.email);
    setEditMobile(item.mobile);
    setEditState(item.state);
    setEditCity(item.city === '—' ? '' : item.city);
    setEditTotal(item.total);
    setEditPaid(item.paid);
    setEditUnpaid(item.unpaid);
    setIsUpdateCustomerOpen(true);
  };

  const openAddOrder = (item: CustomerItem) => {
    setActiveCustomer(item);
    setOrderSubCustomer(item.subCustomer || '');
    setOrderCoupon('');
    setOrderDiscount(0);
    setOrderCouponMsg(null);
    setOrderComment('');
    const firstCat = dbCategories[0];
    if (firstCat) {
      setOrderCatId(firstCat.category_id);
      fetchServicesForCategory(firstCat.category_id);
    }
    setOrderPaymentMode('1');
    setOrderPaidAmount(item.total || 1499);
    setOrderServPrice(item.total || 1499);
    setIsAddOrderOpen(true);
  };

  const openCreateCustomer = (item: CustomerItem) => {
    setActiveCustomer(item);
    setCreateCustName(item.name);
    setCreateCustBusiness(item.company === '—' ? '' : item.company);
    setCreateCustSubCustomer(item.subCustomer ? `${item.subCustomer} (New Entity)` : 'OPC Branch');
    setCreateCustEmail(item.email);
    setCreateCustMobile(item.mobile);
    setCreateCustState(item.state);
    setCreateCustCity(item.city === '—' ? '' : item.city);
    setCreateCustPrice(item.total || 1999);
    setCreateCustCoupon('');
    setCreateCustDiscount(0);
    setCreateCustCouponMsg(null);
    const firstCat = dbCategories[0];
    if (firstCat) {
      setCreateCustCatId(firstCat.category_id);
      fetchServicesForCategory(firstCat.category_id);
    }
    setIsCreateCustomerOpen(true);
  };

  const openEditSubCustomer = (item: CustomerItem) => {
    setActiveCustomer(item);
    setSubCustomerName(item.subCustomer || '');
    setIsEditSubCustomerOpen(true);
  };

  const openAddAppointment = (item: CustomerItem) => {
    setActiveCustomer(item);
    setApptName(item.name);
    setApptEmail(item.email);
    setApptMobile(item.mobile);
    setApptCity(item.city === '—' ? '' : item.city);
    setAppointmentDesc('');
    setIsAddAppointmentOpen(true);
  };

  const openDeleteConfirm = (item: CustomerItem) => {
    setActiveCustomer(item);
    setIsDeleteConfirmOpen(true);
  };

  // ─── ACTION HANDLERS ───
  const handleUpdateCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCustomer) return;
    setIsUpdatingCustomer(true);
    try {
      const res = await fetch(`${API_BASE}/v1/crm/customers/${activeCustomer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          business: editBusiness,
          email: editEmail,
          contact: editMobile,
          state: editState,
          city: editCity,
          total_amount: Number(editTotal),
          paid_amount: Number(editPaid),
          unpaid_amount: Number(editUnpaid),
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Customer profile & EMI amounts updated successfully!');
        setIsUpdateCustomerOpen(false);
        fetchCustomers();
      } else {
        alert(data.message || 'Failed to update customer');
      }
    } catch (err) {
      alert('Network error updating customer');
    } finally {
      setIsUpdatingCustomer(false);
    }
  };

  const handleAddNewOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCustomer) return;
    setIsAddingOrder(true);
    try {
      const selectedServ = dbServicesByCategory.find((s) => s.service_id === orderServId);
      const servName = selectedServ?.service_name || activeCustomer.service || 'Business Service';
      const netTotal = Math.max((selectedServ?.service_price || orderServPrice) - orderDiscount, 0);
      const paidAmt = orderPaymentMode === '1' ? netTotal : orderPaidAmount;
      const unpaidAmt = Math.max(netTotal - paidAmt, 0);

      const res = await fetch(`${API_BASE}/v1/crm/customers/${activeCustomer.id}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sub_customer_name: orderSubCustomer,
          customer_service: servName,
          customer_service_id: orderServId || 1,
          customer_category_id: orderCatId || 1,
          customer_total_service_price: netTotal,
          customer_paid_amount: paidAmt,
          customer_unpaid_amount: unpaidAmt,
          customer_due_date: orderDueDate1,
          customer_payment_mode: Number(orderPaymentMode),
          customer_unpaid_amount2: orderPaymentMode === '3' ? Math.round(unpaidAmt / 2) : 0,
          customer_due_date2: orderPaymentMode === '3' ? orderDueDate2 : undefined,
          customer_comment: orderComment,
          coupon_code: orderCoupon,
          discount_amount: orderDiscount,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('New order created & tasks spawned successfully!');
        setIsAddOrderOpen(false);
        fetchCustomers();
      } else {
        alert(data.message || 'Failed to add order');
      }
    } catch (err) {
      alert('Network error adding order');
    } finally {
      setIsAddingOrder(false);
    }
  };

  const handleCreateCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCustomer) return;
    if (!createCustName.trim() || !createCustEmail.trim() || !createCustMobile.trim()) {
      alert('Customer Name, Email, and Mobile are required');
      return;
    }
    setIsCreatingCustomer(true);
    try {
      const selectedServ = dbServicesByCategory.find((s) => s.service_id === createCustServId);
      const servName = selectedServ?.service_name || activeCustomer.service || 'General Advisory';
      const netTotal = Math.max(
        (selectedServ?.service_price || createCustPrice) - createCustDiscount,
        0
      );

      const res = await fetch(`${API_BASE}/v1/crm/customers/create-from-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          old_customer_id: activeCustomer.id,
          order_id: activeCustomer.orderId || null,
          customer_name: createCustName.trim(),
          customer_businessName: createCustBusiness.trim(),
          sub_customer_name: createCustSubCustomer.trim(),
          customer_email: createCustEmail.trim(),
          customer_mobile: createCustMobile.trim(),
          customer_state: createCustState,
          customer_city: createCustCity,
          customer_service: servName,
          customer_total_service_price: netTotal,
          apply_coupon: createCustCoupon.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('New Customer Account created & Order transferred successfully!');
        setIsCreateCustomerOpen(false);
        fetchCustomers();
      } else {
        alert(data.message || 'Failed to create customer');
      }
    } catch (err) {
      alert('Network error creating customer');
    } finally {
      setIsCreatingCustomer(false);
    }
  };

  const handleUpdateSubCustomer = async () => {
    if (!activeCustomer) return;
    try {
      const res = await fetch(`${API_BASE}/v1/crm/customers/${activeCustomer.id}/sub-customer`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: activeCustomer.orderId,
          sub_customer_name: subCustomerName,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Sub Customer updated successfully!');
        setIsEditSubCustomerOpen(false);
        fetchCustomers();
      } else {
        alert(data.message || 'Failed to update sub customer');
      }
    } catch (err) {
      alert('Network error updating sub customer');
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCustomer) return;
    setIsBookingAppt(true);
    try {
      const res = await fetch(`${API_BASE}/v1/crm/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: apptName,
          email: apptEmail,
          mobile: apptMobile,
          city: apptCity,
          date: appointmentDate,
          time: appointmentTime,
          conduct_by: appointmentAdvisor,
          message: appointmentDesc,
          order_id: activeCustomer.orderId ? String(activeCustomer.orderId) : null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Appointment booked successfully with ${appointmentAdvisor}!`);
        setIsAddAppointmentOpen(false);
      } else {
        alert(data.message || 'Failed to book appointment');
      }
    } catch (err) {
      alert('Network error booking appointment');
    } finally {
      setIsBookingAppt(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!activeCustomer) return;
    setIsDeletingOrder(true);
    try {
      const query = activeCustomer.orderId ? `?order_id=${activeCustomer.orderId}` : '';
      const res = await fetch(`${API_BASE}/v1/crm/customers/${activeCustomer.id}${query}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast('Order / Customer deleted successfully!');
        setIsDeleteConfirmOpen(false);
        fetchCustomers();
      } else {
        alert(data.message || 'Failed to delete order');
      }
    } catch (err) {
      alert('Network error deleting order');
    } finally {
      setIsDeletingOrder(false);
    }
  };

  const handleAssignTask = async (taskId: number) => {
    if (!assigneeId) {
      alert('Please select an employee to assign task to');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/v1/crm/tasks/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_id: taskId,
          employee_id: Number(assigneeId),
          due_date: assignDueDate || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Task assigned successfully!');
        setSelectedTaskToAssign(null);
        if (activeCustomer) openManageTasks(activeCustomer);
      } else {
        alert(data.message || 'Failed to assign task');
      }
    } catch (err) {
      alert('Network error assigning task');
    }
  };

  const handleAddCustomerTask = async () => {
    if (!newCustomerTaskTitle.trim() || !activeCustomer) return;
    try {
      const res = await fetch(`${API_BASE}/v1/crm/customers/${activeCustomer.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_name: newCustomerTaskTitle.trim(),
          service_id: activeCustomer.serviceId || 1,
          order_id: activeCustomer.orderId || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewCustomerTaskTitle('');
        showToast('Task added successfully!');
        openManageTasks(activeCustomer);
      } else {
        alert(data.message || 'Failed to add task');
      }
    } catch (err) {
      alert('Network error adding task');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await fetch(`${API_BASE}/v1/crm/tasks/${taskId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast('Task deleted successfully!');
        if (activeCustomer) openManageTasks(activeCustomer);
      } else {
        alert(data.message || 'Failed to delete task');
      }
    } catch (err) {
      alert('Network error deleting task');
    }
  };

  const handleValidateOrderCoupon = async () => {
    const code = orderCoupon.trim();
    if (!code) {
      setOrderDiscount(0);
      setOrderCouponMsg(null);
      return;
    }
    setIsValidatingOrderCoupon(true);
    setOrderCouponMsg(null);
    try {
      const res = await fetch(`${API_BASE}/v1/crm/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, total_amount: orderServPrice || 1499 }),
      });
      const data = await res.json();
      if (data.success && data.data?.discount_amount !== undefined) {
        setOrderDiscount(data.data.discount_amount);
        setOrderCouponMsg({
          type: 'success',
          text: data.data.message || `Coupon Applied! Saved ₹${data.data.discount_amount}`,
        });
      } else {
        setOrderDiscount(0);
        setOrderCouponMsg({ type: 'error', text: data.error || 'Invalid or expired coupon' });
      }
    } catch (err) {
      setOrderDiscount(0);
      setOrderCouponMsg({ type: 'error', text: 'Failed to validate coupon' });
    } finally {
      setIsValidatingOrderCoupon(false);
    }
  };

  const handleValidateCreateCoupon = async () => {
    const code = createCustCoupon.trim();
    if (!code) {
      setCreateCustDiscount(0);
      setCreateCustCouponMsg(null);
      return;
    }
    setIsValidatingCreateCoupon(true);
    setCreateCustCouponMsg(null);
    try {
      const res = await fetch(`${API_BASE}/v1/crm/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, total_amount: createCustPrice || 1999 }),
      });
      const data = await res.json();
      if (data.success && data.data?.discount_amount !== undefined) {
        setCreateCustDiscount(data.data.discount_amount);
        setCreateCustCouponMsg({
          type: 'success',
          text: data.data.message || `Coupon Applied! Saved ₹${data.data.discount_amount}`,
        });
      } else {
        setCreateCustDiscount(0);
        setCreateCustCouponMsg({ type: 'error', text: data.error || 'Invalid or expired coupon' });
      }
    } catch (err) {
      setCreateCustDiscount(0);
      setCreateCustCouponMsg({ type: 'error', text: 'Failed to validate coupon' });
    } finally {
      setIsValidatingCreateCoupon(false);
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

                      {/* 3-Dot Dropdown Action Menu (Exact Replica of Old CRM OMController) */}
                      {activeMenuId === item.id && (
                        <div className="absolute right-4 top-8 z-30 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 text-left text-xs divide-y divide-slate-100 animate-scale-in">
                          <div className="py-1">
                            {/* 1. Manage Tasks (AddWorkEffort) */}
                            <button
                              onClick={() => {
                                openManageTasks(item);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2 cursor-pointer"
                            >
                              <ListTodo className="w-3.5 h-3.5 text-blue-600" />
                              Manage Tasks
                            </button>

                            {/* 2. Edit Customer (EditCustomer) */}
                            <button
                              onClick={() => {
                                openEditCustomer(item);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                              Edit Customer
                            </button>

                            {/* 3. Add New Order (addNewOrder) */}
                            <button
                              onClick={() => {
                                openAddOrder(item);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2 cursor-pointer"
                            >
                              <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                              Add New Order
                            </button>

                            {/* 4. Create Customer (createCustomer - Requested by User) */}
                            <button
                              onClick={() => {
                                openCreateCustomer(item);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 hover:bg-purple-50 text-purple-700 font-semibold flex items-center gap-2 cursor-pointer"
                            >
                              <UserPlus className="w-3.5 h-3.5 text-purple-600" />
                              Create Customer
                            </button>
                          </div>

                          <div className="py-1">
                            {/* 5. Edit Sub Customer (EditSubCustomer) */}
                            <button
                              onClick={() => {
                                openEditSubCustomer(item);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2 cursor-pointer"
                            >
                              <Tag className="w-3.5 h-3.5 text-indigo-600" />
                              Edit Sub Customer
                            </button>

                            {/* 6. Add Appointment (AddAppointment) */}
                            <button
                              onClick={() => {
                                openAddAppointment(item);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2 cursor-pointer"
                            >
                              <Calendar className="w-3.5 h-3.5 text-teal-600" />
                              Add Appointment
                            </button>

                            {/* 7. Delete Order (DeleteCustomer) */}
                            <button
                              onClick={() => {
                                openDeleteConfirm(item);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 hover:bg-red-50 text-red-600 font-medium flex items-center gap-2 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-600" />
                              Delete Order
                            </button>
                          </div>
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
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase();
                        setCouponCode(val);
                        if (!val.trim()) {
                          setDiscountAmount(0);
                          setCouponMessage(null);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleApplyCoupon();
                        }
                      }}
                      className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3 py-2 text-slate-800 uppercase focus:outline-none text-xs font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon()}
                      disabled={isValidatingCoupon}
                      className="bg-[#003A66] hover:bg-[#002B4D] text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
                    >
                      {isValidatingCoupon ? 'Checking...' : 'Apply'}
                    </button>
                  </div>
                  {couponMessage && (
                    <div
                      className={`text-[11px] font-semibold mt-1.5 flex items-center gap-1 ${
                        couponMessage.type === 'success' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {couponMessage.type === 'success' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span>{couponMessage.text}</span>
                    </div>
                  )}
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
                  {discountAmount > 0 && (
                    <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">
                      Final Payable: ₹{finalTotalAmount.toLocaleString('en-IN')}
                    </span>
                  )}
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
                    setCouponMessage(null);
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

      {/* ─── 1. ADD NEW ORDER MODAL (addNewOrder) ─── */}
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
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleAddNewOrderSubmit}
              className="p-6 space-y-4 text-xs max-h-[82vh] overflow-y-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    disabled
                    value={activeCustomer.name}
                    className="w-full bg-slate-100 border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-700 font-semibold cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Company/Shop Name
                  </label>
                  <input
                    type="text"
                    disabled
                    value={activeCustomer.company}
                    className="w-full bg-slate-100 border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-700 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Sub Customer
                  </label>
                  <input
                    type="text"
                    value={orderSubCustomer}
                    onChange={(e) => setOrderSubCustomer(e.target.value)}
                    placeholder="e.g. Branch 2 or OPC1"
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Category *
                  </label>
                  <select
                    value={orderCatId}
                    onChange={(e) => {
                      const catId = Number(e.target.value);
                      setOrderCatId(catId);
                      fetchServicesForCategory(catId);
                    }}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-semibold focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  >
                    {dbCategories.map((cat) => (
                      <option key={cat.category_id} value={cat.category_id}>
                        {cat.category_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Service *
                  </label>
                  <select
                    value={orderServId}
                    onChange={(e) => {
                      const servId = Number(e.target.value);
                      setOrderServId(servId);
                      const s = dbServicesByCategory.find((item) => item.service_id === servId);
                      if (s) setOrderServPrice(s.service_price);
                    }}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-semibold focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  >
                    <option value={0}>Select Service</option>
                    {dbServicesByCategory.map((serv) => (
                      <option key={serv.service_id} value={serv.service_id}>
                        {serv.service_name} (₹{serv.service_price})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Apply Coupon
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Coupon code..."
                      value={orderCoupon}
                      onChange={(e) => setOrderCoupon(e.target.value.toUpperCase())}
                      className="flex-1 bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 uppercase focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                    />
                    <button
                      type="button"
                      onClick={handleValidateOrderCoupon}
                      disabled={isValidatingOrderCoupon}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer transition-colors text-xs"
                    >
                      {isValidatingOrderCoupon ? '...' : 'Apply'}
                    </button>
                  </div>
                  {orderCouponMsg && (
                    <p
                      className={`text-[10px] mt-1 font-semibold ${
                        orderCouponMsg.type === 'success' ? 'text-emerald-600' : 'text-red-500'
                      }`}
                    >
                      {orderCouponMsg.text}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={orderPaymentMode}
                    onChange={(e) => setOrderPaymentMode(e.target.value)}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  >
                    <option value="1">Full Payment (No EMI)</option>
                    <option value="2">2 EMIs</option>
                    <option value="3">3 EMIs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Total Service Price
                  </label>
                  <input
                    type="number"
                    value={Math.max(orderServPrice - orderDiscount, 0)}
                    readOnly
                    className="w-full bg-slate-100 border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Paid Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={
                      orderPaymentMode === '1'
                        ? Math.max(orderServPrice - orderDiscount, 0)
                        : orderPaidAmount
                    }
                    onChange={(e) => setOrderPaidAmount(Number(e.target.value))}
                    disabled={orderPaymentMode === '1'}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-bold text-emerald-600 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    1st Due Date
                  </label>
                  <input
                    type="date"
                    value={orderDueDate1}
                    onChange={(e) => setOrderDueDate1(e.target.value)}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
                {orderPaymentMode === '3' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      2nd Due Date
                    </label>
                    <input
                      type="date"
                      value={orderDueDate2}
                      onChange={(e) => setOrderDueDate2(e.target.value)}
                      className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Comment Box
                </label>
                <textarea
                  rows={2}
                  value={orderComment}
                  onChange={(e) => setOrderComment(e.target.value)}
                  placeholder="Order notes, client instructions..."
                  className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl p-3 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                />
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="submit"
                  disabled={isAddingOrder}
                  className="btn-single-moving btn-single-moving-solid px-8 py-2.5 rounded-full font-bold text-xs text-white shadow-xs cursor-pointer"
                  style={
                    {
                      '--c-base': '#06B6D4',
                      '--c-light': '#67E8F9',
                      '--c-dark': '#0891B2',
                    } as React.CSSProperties
                  }
                >
                  <span>{isAddingOrder ? 'Creating Order...' : 'Add Order'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddOrderOpen(false)}
                  className="px-6 py-2.5 rounded-full font-bold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ─── 1. UPDATE CUSTOMER MODAL (Website Clean UI Style) ─── */}
      {isUpdateCustomerOpen && activeCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="rounded-3xl border border-[#EAE6DD] bg-white shadow-2xl overflow-hidden max-w-xl w-full animate-scale-in">
            <div className="h-1 bg-multicolor" />

            <div className="p-4 px-6 border-b border-[#EAE6DD] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#1B365D] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <Edit3 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#1B365D]">
                    Update Customer Profile & EMI
                  </h3>
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

            <form
              onSubmit={handleUpdateCustomerSubmit}
              className="p-6 space-y-4 text-xs max-h-[82vh] overflow-y-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-semibold focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Company / Shop Name
                  </label>
                  <input
                    type="text"
                    value={editBusiness}
                    onChange={(e) => setEditBusiness(e.target.value)}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Mobile No *
                  </label>
                  <input
                    type="text"
                    required
                    value={editMobile}
                    onChange={(e) => setEditMobile(e.target.value)}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-mono focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">State</label>
                  <input
                    type="text"
                    value={editState}
                    onChange={(e) => setEditState(e.target.value)}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">City</label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl">
                <p className="text-[11px] font-bold text-amber-900 mb-2">
                  Customer Account Financials (EMI / Dues)
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">
                      Total Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={editTotal}
                      onChange={(e) => setEditTotal(Number(e.target.value))}
                      className="w-full bg-white border border-[#EAE6DD] rounded-xl px-3 py-1.5 text-slate-800 font-bold focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">
                      Paid Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={editPaid}
                      onChange={(e) => setEditPaid(Number(e.target.value))}
                      className="w-full bg-white border border-[#EAE6DD] rounded-xl px-3 py-1.5 text-emerald-700 font-bold focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">
                      Unpaid Balance (₹)
                    </label>
                    <input
                      type="number"
                      value={editUnpaid}
                      onChange={(e) => setEditUnpaid(Number(e.target.value))}
                      className="w-full bg-white border border-[#EAE6DD] rounded-xl px-3 py-1.5 text-rose-700 font-bold focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUpdateCustomerOpen(false)}
                  className="px-4 py-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingCustomer}
                  className="btn-single-moving btn-single-moving-solid px-6 py-2.5 rounded-full font-bold text-xs text-white shadow-xs cursor-pointer flex items-center gap-1.5"
                  style={
                    {
                      '--c-base': '#06B6D4',
                      '--c-light': '#67E8F9',
                      '--c-dark': '#0891B2',
                    } as React.CSSProperties
                  }
                >
                  {isUpdatingCustomer ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <span>Update Customer</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── 2. CREATE CUSTOMER MODAL (Website Clean UI Style) ─── */}
      {isCreateCustomerOpen && activeCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="rounded-3xl border border-[#EAE6DD] bg-white shadow-2xl overflow-hidden max-w-xl w-full animate-scale-in">
            <div className="h-1 bg-multicolor" />

            <div className="p-4 px-6 border-b border-[#EAE6DD] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#1B365D] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <UserPlus className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#1B365D]">Create Customer</h3>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Convert Order #{activeCustomer.orderId || activeCustomer.id} to an Independent
                    Customer Account
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateCustomerOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleCreateCustomerSubmit}
              className="p-6 space-y-4 text-xs max-h-[82vh] overflow-y-auto"
            >
              {/* Feature Explanation Banner */}
              <div className="p-3.5 bg-blue-50/80 border border-blue-200/90 rounded-2xl flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div className="text-[11px] text-blue-900 leading-relaxed">
                  <strong className="font-bold">Old CRM Create Customer Feature:</strong> When a
                  client branch, sub-entity, or franchisee requires their own separate account, this
                  action registers a brand new Customer & Lead and automatically{' '}
                  <strong className="underline">transfers</strong> order #
                  {activeCustomer.orderId || activeCustomer.id} along with its tasks to the new
                  customer profile.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    New Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={createCustName}
                    onChange={(e) => setCreateCustName(e.target.value)}
                    placeholder="Full name of customer"
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-semibold focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Company / Business Name
                  </label>
                  <input
                    type="text"
                    value={createCustBusiness}
                    onChange={(e) => setCreateCustBusiness(e.target.value)}
                    placeholder="Company or Enterprise"
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Sub Customer / Branch Tag
                  </label>
                  <input
                    type="text"
                    value={createCustSubCustomer}
                    onChange={(e) => setCreateCustSubCustomer(e.target.value)}
                    placeholder="e.g. Pune Branch"
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Mobile No *
                  </label>
                  <input
                    type="text"
                    required
                    value={createCustMobile}
                    onChange={(e) => setCreateCustMobile(e.target.value)}
                    placeholder="10-digit phone"
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-mono focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Email ID *
                  </label>
                  <input
                    type="email"
                    required
                    value={createCustEmail}
                    onChange={(e) => setCreateCustEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">State</label>
                  <input
                    type="text"
                    value={createCustState}
                    onChange={(e) => setCreateCustState(e.target.value)}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">City</label>
                  <input
                    type="text"
                    value={createCustCity}
                    onChange={(e) => setCreateCustCity(e.target.value)}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-[#EAE6DD] rounded-2xl space-y-3">
                <p className="text-[11px] font-bold text-slate-700">Assigned Service & Pricing</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">
                      Service Category
                    </label>
                    <select
                      value={createCustCatId}
                      onChange={(e) => {
                        const catId = Number(e.target.value);
                        setCreateCustCatId(catId);
                        fetchServicesForCategory(catId);
                      }}
                      className="w-full bg-white border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-semibold focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                    >
                      {dbCategories.map((c) => (
                        <option key={c.category_id} value={c.category_id}>
                          {c.category_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">
                      Select Service
                    </label>
                    <select
                      value={createCustServId}
                      onChange={(e) => {
                        const sId = Number(e.target.value);
                        setCreateCustServId(sId);
                        const found = dbServicesByCategory.find((s) => s.service_id === sId);
                        if (found) setCreateCustPrice(found.service_price);
                      }}
                      className="w-full bg-white border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-semibold focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                    >
                      {dbServicesByCategory.map((s) => (
                        <option key={s.service_id} value={s.service_id}>
                          {s.service_name} (₹{s.service_price})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">
                      Service Price (₹)
                    </label>
                    <input
                      type="number"
                      value={createCustPrice}
                      onChange={(e) => setCreateCustPrice(Number(e.target.value))}
                      className="w-full bg-white border border-[#EAE6DD] rounded-xl px-3 py-1.5 text-slate-800 font-bold focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">
                      Coupon Code
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={createCustCoupon}
                        onChange={(e) => setCreateCustCoupon(e.target.value.toUpperCase())}
                        placeholder="e.g. DISCOUNT10"
                        className="flex-1 bg-white border border-[#EAE6DD] rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold"
                      />
                      <button
                        type="button"
                        onClick={handleValidateCreateCoupon}
                        disabled={isValidatingCreateCoupon}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-[11px]"
                      >
                        {isValidatingCreateCoupon ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          'Apply'
                        )}
                      </button>
                    </div>
                    {createCustCouponMsg && (
                      <p
                        className={`text-[10px] mt-1 font-semibold ${createCustCouponMsg.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}
                      >
                        {createCustCouponMsg.text}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-emerald-50/70 border border-emerald-200/60 rounded-xl mt-2 text-xs">
                  <span className="font-bold text-emerald-950">Transferred Order Net Amount:</span>
                  <span className="font-extrabold text-emerald-700 text-sm">
                    ₹{Math.max(createCustPrice - createCustDiscount, 0)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateCustomerOpen(false)}
                  className="px-4 py-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingCustomer}
                  className="btn-single-moving btn-single-moving-solid px-6 py-2.5 rounded-full font-bold text-xs text-white shadow-xs cursor-pointer flex items-center gap-1.5"
                  style={
                    {
                      '--c-base': '#1B365D',
                      '--c-light': '#3B82F6',
                      '--c-dark': '#0F1E36',
                    } as React.CSSProperties
                  }
                >
                  {isCreatingCustomer ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <span>Create & Transfer Customer</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── 3. EDIT SUB CUSTOMER MODAL (Website Clean UI Style) ─── */}
      {isEditSubCustomerOpen && activeCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="rounded-3xl border border-[#EAE6DD] bg-white shadow-2xl overflow-hidden max-w-sm w-full animate-scale-in">
            <div className="h-1 bg-multicolor" />

            <div className="p-4 px-6 border-b border-[#EAE6DD] flex items-center justify-between bg-white">
              <h3 className="font-extrabold text-sm text-[#1B365D]">Edit Sub Customer Name</h3>
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
                  Sub Customer Name / Branch Name
                </label>
                <input
                  type="text"
                  value={subCustomerName}
                  onChange={(e) => setSubCustomerName(e.target.value)}
                  placeholder="e.g. Branch 2 or OPC1"
                  className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditSubCustomerOpen(false)}
                  className="px-4 py-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs"
                >
                  Cancel
                </button>
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

      {/* ─── 4. ADD NEW APPOINTMENT MODAL (Website Clean UI Style) ─── */}
      {isAddAppointmentOpen && activeCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="rounded-3xl border border-[#EAE6DD] bg-white shadow-2xl overflow-hidden max-w-md w-full animate-scale-in">
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
                    value={apptName}
                    onChange={(e) => setApptName(e.target.value)}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-semibold focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={apptEmail}
                    onChange={(e) => setApptEmail(e.target.value)}
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
                    value={apptMobile}
                    onChange={(e) => setApptMobile(e.target.value)}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-mono focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={apptCity}
                    onChange={(e) => setApptCity(e.target.value)}
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
                  Description / Agenda *
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
                  className="flex-1 py-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBookingAppt}
                  className="btn-single-moving btn-single-moving-solid flex-1 py-2.5 rounded-full font-bold text-xs text-white shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  style={
                    {
                      '--c-base': '#1E3A8A',
                      '--c-light': '#3B82F6',
                      '--c-dark': '#172554',
                    } as React.CSSProperties
                  }
                >
                  {isBookingAppt ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <span>Book Appointment</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── 5. DELETE ORDER CONFIRMATION MODAL ─── */}
      {isDeleteConfirmOpen && activeCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="rounded-3xl border border-[#EAE6DD] bg-white shadow-2xl overflow-hidden max-w-md w-full animate-scale-in">
            <div className="h-1 bg-red-500" />

            <div className="p-4 px-6 border-b border-[#EAE6DD] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5 text-red-600">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center font-bold text-xs">
                  <Trash2 className="w-4 h-4 text-red-600" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-800">Delete Order & Tasks</h3>
              </div>
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="text-red-900 leading-relaxed">
                  <p className="font-bold mb-1">Permanent Deletion Warning</p>
                  <p>
                    Are you sure you want to delete order #
                    {activeCustomer.orderId || activeCustomer.id} for{' '}
                    <strong>{activeCustomer.name}</strong>?
                  </p>
                  <p className="mt-2 text-[11px] text-red-700">
                    This will permanently remove the order record, customer EMI schedule, customer
                    dues, and all operations tasks created under this order.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="px-4 py-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteOrder}
                  disabled={isDeletingOrder}
                  className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
                >
                  {isDeletingOrder ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <span>Delete Permanently</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 6. MANAGE TASKS SLIDE-OVER DRAWER (Action: Manage Tasks) ─── */}
      {isTasksDrawerOpen && activeCustomer && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsTasksDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col">
            <div className="h-1 bg-multicolor" />

            {/* Drawer Header */}
            <div className="p-4 px-6 border-b border-[#EAE6DD] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#1B365D] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <ListTodo className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#1B365D]">Manage Customer Tasks</h3>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {activeCustomer.name} • {activeCustomer.service}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTasksDrawerOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-5 space-y-4 flex-1 overflow-y-auto text-xs">
              {/* Add New Task Form */}
              <div className="p-3 bg-[#FAF9F5] border border-[#EAE6DD] rounded-2xl space-y-2">
                <label className="block text-[11px] font-bold text-slate-700">
                  Add New Operations Task
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. GST Registration Filing..."
                    value={newCustomerTaskTitle}
                    onChange={(e) => setNewCustomerTaskTitle(e.target.value)}
                    className="flex-1 bg-white border border-[#EAE6DD] rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                  <button
                    onClick={handleAddCustomerTask}
                    className="btn-single-moving btn-single-moving-solid px-4 py-2 rounded-full text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1"
                    style={
                      {
                        '--c-base': '#1E3A8A',
                        '--c-light': '#3B82F6',
                        '--c-dark': '#172554',
                      } as React.CSSProperties
                    }
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Task List Header */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Active Tasks ({customerTasks.length})
                </span>
              </div>

              {/* Tasks List */}
              {loadingTasks ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-[#1B365D]" />
                  <span className="text-xs font-medium">Loading customer tasks...</span>
                </div>
              ) : customerTasks.length === 0 ? (
                <div className="py-12 text-center text-slate-400 bg-slate-50/70 rounded-2xl border border-dashed border-[#EAE6DD]">
                  <p className="font-semibold text-xs text-slate-600">No tasks generated yet</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Use the box above to add a new task for this order.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {customerTasks.map((t) => {
                    const isAssigningThis = selectedTaskToAssign === t.id;
                    const assignedName = t.assigned_to_name || t.employee_name;
                    return (
                      <div
                        key={t.id}
                        className="p-3 bg-[#FAF9F5] border border-[#EAE6DD] rounded-2xl space-y-2.5 transition-all hover:border-slate-300"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-800 text-xs">{t.task_name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  t.task_status === 'completed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : t.task_status === 'in_progress'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {t.task_status || 'Pending'}
                              </span>
                              {assignedName ? (
                                <span className="text-[10px] font-semibold text-slate-600 bg-white border border-[#EAE6DD] px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <UserPlus className="w-3 h-3 text-emerald-600" />
                                  {assignedName}
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                                  Unassigned
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setSelectedTaskToAssign(isAssigningThis ? null : t.id)}
                              className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors flex items-center gap-1 ${
                                isAssigningThis
                                  ? 'bg-[#1B365D] text-white border-[#1B365D]'
                                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                              }`}
                              title="Assign Staff"
                            >
                              <Send className="w-3 h-3" />
                              <span className="text-[10px]">Assign</span>
                            </button>
                            <button
                              onClick={() => handleDeleteTask(t.id)}
                              className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 flex items-center justify-center text-red-600 transition-colors"
                              title="Delete Task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Inline Staff Assignment Controls */}
                        {isAssigningThis && (
                          <div className="p-2.5 bg-white border border-blue-200 rounded-xl space-y-2 animate-scale-in">
                            <p className="text-[10px] font-bold text-blue-900">
                              Assign Task to Specialist:
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[9px] font-bold text-slate-500 mb-0.5">
                                  Staff Member
                                </label>
                                <select
                                  value={assigneeId}
                                  onChange={(e) => setAssigneeId(e.target.value)}
                                  className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-lg px-2 py-1 text-[11px] font-semibold"
                                >
                                  <option value="">-- Select Specialist --</option>
                                  {staffUsers.map((u) => (
                                    <option key={u.id} value={u.id}>
                                      {u.name || u.email}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-[9px] font-bold text-slate-500 mb-0.5">
                                  Target Due Date
                                </label>
                                <input
                                  type="date"
                                  value={assignDueDate}
                                  onChange={(e) => setAssignDueDate(e.target.value)}
                                  className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-lg px-2 py-1 text-[11px]"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-1.5 pt-1">
                              <button
                                type="button"
                                onClick={() => setSelectedTaskToAssign(null)}
                                className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 text-[10px] font-bold"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAssignTask(t.id)}
                                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shadow-xs"
                              >
                                Confirm Assignment
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── 7. FLOATING TOAST NOTIFICATION BANNER ─── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-scale-in">
          <div
            className={`px-5 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 text-xs font-bold text-white ${
              toastMessage.type === 'success'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-700 border-emerald-400/30'
                : 'bg-gradient-to-r from-rose-600 to-red-700 border-rose-400/30'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-100" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-100" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}
    </div>
  );
}
