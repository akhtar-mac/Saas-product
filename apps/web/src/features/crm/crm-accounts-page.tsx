import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { RoleType } from '@etaxwala/types';
import { API_BASE_URL } from '@/lib/api-base';
import { accessListHas, isServerAccessList } from './permissions';
import EmiServicePricePanel, {
  type ServicePricePayload,
} from './components/emi-service-price-panel';
import {
  Plus,
  Trash2,
  Edit3,
  MoreVertical,
  Calendar,
  Send,
  X,
  UserPlus,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  ListTodo,
  PlusCircle,
  Tag,
  Loader2,
  ShieldAlert,
  Clock,
  MessageSquare,
  History,
  IndianRupee,
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
  cp_type: number; // 1=Basic 2=Standard 3=Premium 4=Diamond 5=Custom
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
  effective_price?: number; // service_price - cp_discount (price to charge)
  category_id?: number;
  category_name?: string;
  cp_type?: number; // 1=Basic 2=Standard 3=Premium 4=Diamond 0=none
  cp_id?: number; // combo_packages primary key

  cp_discount?: number;
}

const EMPTY_DATE_RE = /^(na|n\/a|null|undefined|not required|-|—|\s*)$/i;
const MONTH_INDEX: Record<string, number> = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
};

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function toDateParts(value: unknown): { y: number; m: number; d: number } | null {
  if (value === null || value === undefined || value === '') return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const iso = value.toISOString();
    if (/T00:00:00(?:\.000)?Z$/.test(iso)) {
      const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
      return { y, m, d };
    }
    const ist = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(value);
    const [y, m, d] = ist.split('-').map(Number);
    return { y, m, d };
  }
  const raw = String(value).trim();
  if (!raw || EMPTY_DATE_RE.test(raw)) return null;
  let match = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T].*)?$/);
  if (match) return { y: Number(match[1]), m: Number(match[2]), d: Number(match[3]) };
  match = raw.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})(?:\s.*)?$/);
  if (match) {
    const a = Number(match[1]);
    const b = Number(match[2]);
    const y = Number(match[3]);
    if (b <= 12) return { y, m: b, d: a };
    if (a <= 12) return { y, m: a, d: b };
  }
  match = raw.match(/^[A-Za-z]{3}\s+([A-Za-z]{3})\s+(\d{1,2})\s+(\d{4})(?:\s|$)/);
  if (match) {
    const month = MONTH_INDEX[match[1].toLowerCase()];
    if (month) return { y: Number(match[3]), m: month, d: Number(match[2]) };
  }
  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) return toDateParts(parsed);
  return null;
}

/** Display dates as DD-MM-YYYY (IST). Empty/NA values become '—'. */
function formatDisplayDate(value: unknown): string {
  const parts = toDateParts(value);
  if (!parts) return '—';
  return `${pad2(parts.d)}-${pad2(parts.m)}-${parts.y}`;
}

export default function CrmAccountsPage() {
  const { staffUser, staffToken, activeRole } = useAuthStore();
  // Sales employees only get "Add New Order" in the row action menu
  const isSalesEmployeeView =
    activeRole === RoleType.SALES_EMPLOYEE ||
    (staffUser?.roles || []).includes(RoleType.SALES_EMPLOYEE) ||
    ((staffUser?.roleIds || []).includes(7) &&
      activeRole !== RoleType.OPERATIONS_EMPLOYEE &&
      !(staffUser?.roles || []).includes(RoleType.OPERATIONS_EMPLOYEE));
  const canManageEmi = (() => {
    // Role-based access: the server's option list decides (admins can add/remove it).
    if (isServerAccessList(staffUser?.permissions)) {
      const list = staffUser?.permissions || [];
      return (
        accessListHas(list, 'accounts:emi_collect') ||
        accessListHas(list, 'operations:customer_dues')
      );
    }
    if (isSalesEmployeeView) return false;
    const allowedRoles = new Set<string>([
      RoleType.SUPER_ADMIN,
      RoleType.ADMIN,
      RoleType.OPERATIONS_MANAGER,
      RoleType.OPERATIONS_EMPLOYEE,
      RoleType.OPERATIONS_ASSISTANT,
      RoleType.FRANCHISE_MANAGER,
      RoleType.FRANCHISE_EMPLOYEE,
    ]);
    const roleList = [activeRole, staffUser?.role, ...(staffUser?.roles || [])].filter(
      Boolean
    ) as string[];
    if (roleList.some((r) => allowedRoles.has(r))) return true;
    const allowedIds = new Set([1, 2, 3, 6, 8, 10, 12]);
    return (staffUser?.roleIds || []).some((id) => allowedIds.has(Number(id)));
  })();
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Dynamic categories & services from DB
  const [dbCategories, setDbCategories] = useState<CategoryItem[]>([]);
  const [dbServicesByCategory, setDbServicesByCategory] = useState<ServiceItem[]>([]);
  const [allDbServices, setAllDbServices] = useState<ServiceItem[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  // CP Type filter for customer table (0=All, 1=Basic, 2=Standard, 3=Premium, 4=Diamond, 5=Custom)
  const [cpTypeFilter, setCpTypeFilter] = useState(0);
  // CP Type state for Add Order and Create Customer modals
  const [_orderCpType, setOrderCpType] = useState(0);
  const [orderCpId, setOrderCpId] = useState(0);
  const [createCustCpType, setCreateCustCpType] = useState(0);
  const [createCustCpId, setCreateCustCpId] = useState(0);

  const customDropdownRef = React.useRef<HTMLDivElement>(null);

  const API_BASE = API_BASE_URL;

  // Fetch real customers from database
  const fetchCustomers = useCallback(() => {
    if (debouncedSearchTerm) {
      setSearchLoading(true);
    } else {
      setLoading(true);
    }
    const limitParam = pageSize === -1 ? 'all' : pageSize;
    const pageParam = currentPage;
    const searchParam = debouncedSearchTerm
      ? `&search=${encodeURIComponent(debouncedSearchTerm)}`
      : '';
    fetch(`${API_BASE}/v1/crm/customers?limit=${limitParam}&page=${pageParam}${searchParam}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data?.data)) {
          // API already returns mapped data with orderId, use it directly
          setCustomers(data.data);
          if (data.total) setTotalCount(data.total);
        }
      })
      .catch((err) => console.error('Failed to fetch customers', err))
      .finally(() => {
        setLoading(false);
        setSearchLoading(false);
      });
  }, [API_BASE, pageSize, currentPage, debouncedSearchTerm]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms debounce
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch customers when debounced search or pagination changes
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Close action dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuId(null);
      }
    };
    if (activeMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [activeMenuId]);

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

  // Customer Details Modal (Work Timeline, Service Price, Direct Chat)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailsTab, setDetailsTab] = useState<'timeline' | 'price' | 'chat'>('timeline');
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsTasks, setDetailsTasks] = useState<any[]>([]);
  const [selectedTimelineTaskId, setSelectedTimelineTaskId] = useState<string>('all');
  const [detailsTimeline, setDetailsTimeline] = useState<any[]>([]);
  const [detailsPrice, setDetailsPrice] = useState<ServicePricePayload | null>(null);
  const [detailsChat, setDetailsChat] = useState<any[]>([]);

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
  const [mobileValid, setMobileValid] = useState<boolean | null>(null);
  const [addState, setAddState] = useState('Maharashtra');
  const [addCity, setAddCity] = useState('Chhatrapati Sambhajinagar');
  const [isCustomPkg, setIsCustomPkg] = useState('0'); // '0' = No, '1' = Yes
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0);
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState<number>(0); // actual service_id for form submit
  const [selectedCpId, setSelectedCpId] = useState<number>(0); // cp_id for dropdown display
  const [selectedServiceName, setSelectedServiceName] = useState('');
  const [customPkgName, setCustomPkgName] = useState('');
  const [selectedCustomServiceIds, setSelectedCustomServiceIds] = useState<number[]>([]);
  const [isCustomDropdownOpen, setIsCustomDropdownOpen] = useState(false);
  const [isOrderCustomDropdownOpen, setIsOrderCustomDropdownOpen] = useState(false);
  const [isCreateCustCustomDropdownOpen, setIsCreateCustCustomDropdownOpen] = useState(false);
  // Service pickers (custom div dropdowns with colored cp_type badges)
  const [isAddCustServiceOpen, setIsAddCustServiceOpen] = useState(false);
  const [isOrderServiceOpen, setIsOrderServiceOpen] = useState(false);
  const [isCreateCustServiceOpen, setIsCreateCustServiceOpen] = useState(false);
  const [serviceSearchTerm, setServiceSearchTerm] = useState('');
  const [customServiceSearchTerm, setCustomServiceSearchTerm] = useState('');

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
            // Normalize all numeric fields to Number — serializeBigInt converts BigInt → string
            // so cp_id arrives as "42" but comparisons need strict 42 === 42
            const normalized = data.data.map((s: ServiceItem) => ({
              ...s,
              cp_id: s.cp_id !== undefined ? Number(s.cp_id) : undefined,
              service_id: Number(s.service_id),
              cp_type: s.cp_type !== undefined ? Number(s.cp_type) : undefined,
              cp_discount: s.cp_discount !== undefined ? Number(s.cp_discount) : undefined,
              service_price: Number(s.service_price),
              effective_price:
                s.effective_price !== undefined ? Number(s.effective_price) : undefined,
            }));
            setDbServicesByCategory(normalized);
            // Auto-select first service (set both service_id for submit and cp_id for display)
            const first = normalized[0] as ServiceItem;
            setSelectedServiceId(Number(first.service_id));
            setSelectedCpId(Number(first.cp_id ?? 0));
            setSelectedServiceName(first.service_name);
            const price = first.effective_price ?? first.service_price;
            setActualPrice(Number(price));
            setPaidAmount(Number(price));
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
    setSelectedCpId(0);
    setSelectedServiceName('');
    setActualPrice(0);
    setPaidAmount(0);
    // Reset coupon when category changes
    setDiscountAmount(0);
    setCouponCode('');
    setCouponMessage(null);
    fetchServicesForCategory(catId);
  };

  const handleServiceChange = (cpIdStr: string) => {
    const cpId = Number(cpIdStr);
    // Services are now keyed by cp_id (combo_packages primary key)
    const serv = dbServicesByCategory.find((s) => s.cp_id === cpId);
    if (serv) {
      setSelectedCpId(cpId); // cp_id for dropdown trigger display
      setSelectedServiceId(serv.service_id); // service_id for form submit
      setSelectedServiceName(serv.service_name);
      const price = serv.effective_price ?? serv.service_price;
      setActualPrice(price);
      setPaidAmount(price);
      // Reset coupon when service changes so user re-applies at correct price
      setDiscountAmount(0);
      setCouponCode('');
      setCouponMessage(null);
    }
  };

  const toggleCustomService = (servId: number) => {
    if (selectedCustomServiceIds.includes(servId)) {
      setSelectedCustomServiceIds(selectedCustomServiceIds.filter((id) => id !== servId));
    } else {
      setSelectedCustomServiceIds([...selectedCustomServiceIds, servId]);
    }
  };

  // CP Type badge colors (matching old CRM colors)
  const cpTypeBadge = (cpType?: number) => {
    if (cpType === 1)
      return (
        <span className="ml-1.5 inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500 text-white">
          Basic
        </span>
      );
    if (cpType === 2)
      return (
        <span className="ml-1.5 inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-500 text-white">
          Standard
        </span>
      );
    if (cpType === 3)
      return (
        <span className="ml-1.5 inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-white">
          Premium
        </span>
      );
    if (cpType === 4)
      return (
        <span className="ml-1.5 inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-600 text-white">
          Diamond
        </span>
      );
    return null;
  };
  const cpTypeLabel = (cpType?: number) =>
    cpType === 1
      ? 'Basic'
      : cpType === 2
        ? 'Standard'
        : cpType === 3
          ? 'Premium'
          : cpType === 4
            ? 'Diamond'
            : '';

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

  const handleMobileChange = async (value: string) => {
    setAddMobile(value);
    setMobileValid(null);

    // Check mobile when 10 digits are entered
    if (value.replace(/\D/g, '').length === 10) {
      try {
        const checkRes = await fetch(`${API_BASE}/v1/crm/customers/check-mobile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customerMobile: value }),
        });
        const checkData = await checkRes.json();
        if (checkData.error) {
          setMobileValid(false);
        } else {
          setMobileValid(true);
        }
      } catch (err) {
        console.error('Error checking mobile:', err);
      }
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
    if (mobileValid === false) {
      alert('Mobile number already exists. Please use a different number.');
      return;
    }

    // Check if email already exists
    if (addEmail.trim()) {
      try {
        const checkRes = await fetch(`${API_BASE}/v1/crm/customers/check-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customerEmail: addEmail }),
        });
        const checkData = await checkRes.json();
        if (checkData.error) {
          alert(checkData.error);
          return;
        }
      } catch (err) {
        console.error('Error checking email:', err);
      }
    }

    const serviceLabel =
      isCustomPkg === '1' ? customPkgName || 'Custom Package' : selectedServiceName;

    try {
      const res = await fetch(`${API_BASE}/v1/crm/customers/add-offline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(staffToken ? { Authorization: `Bearer ${staffToken}` } : {}),
        },
        body: JSON.stringify({
          staff_user_id: staffUser?.id ?? undefined,
          customer_name: addCustomerName,
          customer_businessName: addBusinessName,
          customer_email: addEmail,
          customer_mobile: addMobile,
          customer_state: addState,
          customer_city: addCity,
          customer_category_id: selectedCategoryId,
          customer_service_id: selectedServiceId,
          customer_cp_id: isCustomPkg === '1' ? undefined : selectedCpId || undefined,
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

  const filtered = customers.filter((c) => {
    const matchType = cpTypeFilter === 0 || c.cp_type === cpTypeFilter;
    return matchType;
  });

  // Staff users list for assigning tasks (same source as tasks page)
  const [staffUsers, setStaffUsers] = useState<any[]>([]);
  useEffect(() => {
    fetch(`${API_BASE}/v1/crm/operation-staff`)
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

  // ─── Custom Confirm Dialog State ───
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
  }>({ open: false, title: '', message: '', onConfirm: () => {} });

  // Validate create customer mobile
  const validateCreateCustomerMobile = async (mobile: string) => {
    const normalized = mobile.replace(/\D/g, '');
    if (normalized.length === 10) {
      try {
        const res = await fetch(`${API_BASE}/v1/crm/customers/check-mobile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customerMobile: normalized }),
        });
        const data = await res.json();
        setCreateCustMobileValid(!data.exists);
      } catch {
        setCreateCustMobileValid(false);
      }
    } else {
      setCreateCustMobileValid(null);
    }
  };

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    confirmLabel = 'Delete'
  ) => {
    setConfirmDialog({ open: true, title, message, confirmLabel, onConfirm });
  };
  const closeConfirm = () => setConfirmDialog((prev) => ({ ...prev, open: false }));

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
  const [orderIsCustom, setOrderIsCustom] = useState(false);
  const [orderCustomPkgName, setOrderCustomPkgName] = useState('');
  const [orderCustomServiceIds, setOrderCustomServiceIds] = useState<number[]>([]);
  const [orderSubCustomer, setOrderSubCustomer] = useState('');
  const [orderCatId, setOrderCatId] = useState(0);
  const [orderServId, setOrderServId] = useState(0);
  const [orderServPrice, setOrderServPrice] = useState(0);
  const [orderPaymentMode, setOrderPaymentMode] = useState('1');
  const [orderPaidAmount, setOrderPaidAmount] = useState(0);
  const [orderEmi1, setOrderEmi1] = useState(0);
  const [orderEmi2, setOrderEmi2] = useState(0);
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
  const [createCustMobileValid, setCreateCustMobileValid] = useState<boolean | null>(null);
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
  // New fields matching old CRM
  const [createCustIsCustom, setCreateCustIsCustom] = useState(false);
  const [createCustCustomPkgName, setCreateCustCustomPkgName] = useState('');
  const [createCustCustomServiceIds, setCreateCustCustomServiceIds] = useState<number[]>([]);
  const [createCustPaymentMode, setCreateCustPaymentMode] = useState('1');
  const [createCustPaidAmount, setCreateCustPaidAmount] = useState(0);
  const [createCustEmi1, setCreateCustEmi1] = useState(0);
  const [createCustEmi2, setCreateCustEmi2] = useState(0);
  const [createCustDueDate1, setCreateCustDueDate1] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [createCustDueDate2, setCreateCustDueDate2] = useState(
    new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [createCustComment, setCreateCustComment] = useState('');

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
    // Use customer ID and pass order_id as query parameter if available
    const url = item.orderId
      ? `${API_BASE}/v1/crm/customers/${item.id}/tasks?order_id=${item.orderId}`
      : `${API_BASE}/v1/crm/customers/${item.id}/tasks`;
    console.log('Fetching tasks from:', url);
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        console.log('Tasks API response:', data);
        if (data?.success && Array.isArray(data?.data)) {
          console.log('Setting customerTasks:', data.data);
          setCustomerTasks(data.data);
        } else {
          console.log('No tasks found or invalid response');
          setCustomerTasks([]);
        }
      })
      .catch((err) => {
        console.error('Error fetching tasks:', err);
        setCustomerTasks([]);
      })
      .finally(() => setLoadingTasks(false));
  };

  const openCustomerDetails = async (
    item: CustomerItem,
    initialTab: 'timeline' | 'price' | 'chat' = 'timeline'
  ) => {
    setActiveCustomer(item);
    setDetailsTab(initialTab);
    setSelectedTimelineTaskId('all');
    setDetailsTasks([]);
    setDetailsTimeline([]);
    setDetailsPrice(null);
    setDetailsChat([]);
    setIsDetailsOpen(true);
    setDetailsLoading(true);
    const qsOrder = item.orderId ? `order_id=${item.orderId}` : '';
    const qsService = item.serviceId ? `service_id=${item.serviceId}` : '';
    const tlParams = [qsOrder, qsService].filter(Boolean).join('&');
    try {
      const [tlRes, priceRes, chatRes] = await Promise.all([
        fetch(`${API_BASE}/v1/crm/customers/${item.id}/timeline${tlParams ? `?${tlParams}` : ''}`),
        fetch(
          `${API_BASE}/v1/crm/customers/${item.id}/service-price${qsOrder ? `?${qsOrder}` : ''}`
        ),
        fetch(
          `${API_BASE}/v1/crm/customers/${item.id}/direct-chat${qsService ? `?${qsService}` : ''}`
        ),
      ]);
      const [tlJson, priceJson, chatJson] = await Promise.all([
        tlRes.json().catch(() => null),
        priceRes.json().catch(() => null),
        chatRes.json().catch(() => null),
      ]);
      if (tlJson?.success && tlJson.data) {
        setDetailsTasks(tlJson.data.tasks || []);
        setDetailsTimeline(tlJson.data.timeline || []);
      }
      if (priceJson?.success && priceJson.data) {
        setDetailsPrice(priceJson.data);
      }
      if (chatJson?.success && Array.isArray(chatJson.data)) {
        setDetailsChat(chatJson.data);
      }
    } catch (err) {
      console.error('Error loading customer details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const refreshActiveServicePrice = async () => {
    if (!activeCustomer) return;
    const qsOrder = activeCustomer.orderId ? `order_id=${activeCustomer.orderId}` : '';
    try {
      const priceRes = await fetch(
        `${API_BASE}/v1/crm/customers/${activeCustomer.id}/service-price${qsOrder ? `?${qsOrder}` : ''}`
      );
      const priceJson = await priceRes.json().catch(() => null);
      if (priceJson?.success && priceJson.data) {
        setDetailsPrice(priceJson.data);
      }
    } catch (err) {
      console.error('Error refreshing service price:', err);
    }
    fetchCustomers();
  };

  useEffect(() => {
    if (!isDetailsOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsDetailsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isDetailsOpen]);

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
    setOrderIsCustom(false);
    setOrderCustomPkgName('');
    setOrderCustomServiceIds([]);
    setOrderServId(0);
    setOrderServPrice(0);
    setOrderEmi1(0);
    setOrderEmi2(0);
    const firstCat = dbCategories[0];
    if (firstCat) {
      setOrderCatId(firstCat.category_id);
      fetchServicesForCategory(firstCat.category_id);
    }
    setOrderPaymentMode('1');
    setOrderPaidAmount(0);
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
    showConfirm(
      'Delete Order & Tasks',
      `Are you sure you want to permanently delete the order for "${item.name}"? All associated tasks will also be removed. This cannot be undone.`,
      () => {
        // Call handleDeleteOrder after setting active customer
        setIsDeleteConfirmOpen(true);
        setTimeout(() => handleDeleteOrder(), 100);
      },
      'Delete Permanently'
    );
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
      const netTotal = Math.max(orderServPrice - orderDiscount, 0);
      const paidAmt = orderPaymentMode === '1' ? netTotal : orderPaidAmount;
      const emi1 = orderPaymentMode !== '1' ? Math.max(netTotal - paidAmt, 0) : 0;
      const emi2 = orderPaymentMode === '3' ? Math.round(emi1 / 2) : 0;

      let servName = 'Business Service';
      let servId = orderServId;
      if (orderIsCustom) {
        servName = orderCustomPkgName || 'Custom Package';
        servId = orderCustomServiceIds[0] || 1;
      } else {
        const selectedServ = dbServicesByCategory.find((s) => s.service_id === orderServId);
        servName = selectedServ?.service_name || activeCustomer.service || 'Business Service';
      }

      const res = await fetch(`${API_BASE}/v1/crm/customers/${activeCustomer.id}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(staffToken ? { Authorization: `Bearer ${staffToken}` } : {}),
        },
        body: JSON.stringify({
          staff_user_id: staffUser?.id ?? undefined,
          sub_customer_name: orderSubCustomer,
          customer_service: servName,
          customer_service_id: servId || 1,
          customer_cp_id: orderIsCustom ? undefined : orderCpId || undefined,
          customer_category_id: orderCatId || 1,
          is_custom: orderIsCustom ? 1 : 0,
          custom_package_name: orderIsCustom ? orderCustomPkgName : undefined,
          custom_package_services: orderIsCustom ? orderCustomServiceIds : undefined,
          customer_total_service_price: netTotal,
          customer_paid_amount: paidAmt,
          customer_unpaid_amount: emi1,
          customer_due_date: orderDueDate1,
          customer_payment_mode: Number(orderPaymentMode),
          customer_unpaid_amount2: emi2,
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
        showToast(data.message || 'Failed to add order', 'error');
      }
    } catch (err) {
      showToast('Network error adding order', 'error');
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

    // Check mobile on submit
    const normalizedMobile = createCustMobile.replace(/\D/g, '');
    if (normalizedMobile.length === 10) {
      try {
        const res = await fetch(`${API_BASE}/v1/crm/customers/check-mobile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customerMobile: normalizedMobile }),
        });
        const data = await res.json();
        if (data.exists) {
          alert('Mobile number already exists. Please use a different number.');
          return;
        }
      } catch {
        alert('Error checking mobile number');
        return;
      }
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
        headers: {
          'Content-Type': 'application/json',
          ...(staffToken ? { Authorization: `Bearer ${staffToken}` } : {}),
        },
        body: JSON.stringify({
          staff_user_id: staffUser?.id ?? undefined,
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
          customer_service_id: createCustServId || 1,
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
          staff_user_id: staffUser?.id ?? undefined,
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
        headers: {
          'Content-Type': 'application/json',
          ...(staffToken ? { Authorization: `Bearer ${staffToken}` } : {}),
        },
        body: JSON.stringify({
          staff_user_id: staffUser?.id ?? undefined,
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
        showToast(data.message || 'Failed to add task', 'error');
      }
    } catch (err) {
      showToast('Network error adding task', 'error');
    }
  };

  const handleDeleteTask = (taskId: number) => {
    showConfirm(
      'Delete Task',
      'Are you sure you want to delete this task? This action cannot be undone.',
      async () => {
        closeConfirm();
        try {
          const res = await fetch(`${API_BASE}/v1/crm/tasks/${taskId}`, {
            method: 'DELETE',
          });
          const data = await res.json();
          if (data.success) {
            showToast('Task deleted successfully!');
            if (activeCustomer) openManageTasks(activeCustomer);
          } else {
            showToast(data.message || 'Failed to delete task', 'error');
          }
        } catch {
          showToast('Network error deleting task', 'error');
        }
      }
    );
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
    if (!createCustPrice || createCustPrice <= 0) {
      setCreateCustCouponMsg({
        type: 'error',
        text: 'Please select a service first to apply coupon',
      });
      setIsValidatingCreateCoupon(false);
      return;
    }
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
            {/* CP Type Filter */}
            <select
              value={cpTypeFilter}
              onChange={(e) => setCpTypeFilter(Number(e.target.value))}
              className="text-xs bg-white border border-slate-300 rounded px-2 py-1 text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-[#003A66]"
            >
              <option value={0}>All Types</option>
              <option value={1}>Basic</option>
              <option value={2}>Standard</option>
              <option value={3}>Premium</option>
              <option value={4}>Diamond</option>
              <option value={5}>Custom</option>
            </select>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search Data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded px-3 py-1 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#003A66] w-48"
            />
          </div>
        </div>

        {/* Customers Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-2xs">
          <table className="w-full text-left text-xs border-separate border-spacing-0">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#1E3A8A] text-white uppercase text-[11px] tracking-wider sticky top-0 z-10">
                <th className="py-2.5 px-3 font-bold">Name</th>
                <th className="py-2.5 px-3 font-bold">Company</th>
                <th className="py-2.5 px-3 font-bold">Mobile</th>
                <th className="py-2.5 px-3 font-bold">Category</th>
                <th className="py-2.5 px-3 font-bold">Service</th>
                <th className="py-2.5 px-3 font-bold">Type</th>
                <th className="py-2.5 px-3 font-bold">Added By</th>
                <th className="py-2.5 px-3 font-bold">Total</th>
                <th className="py-2.5 px-3 font-bold">Paid</th>
                <th className="py-2.5 px-3 font-bold">Unpaid</th>
                <th className="py-2.5 px-3 font-bold">Due Date</th>
                <th className="py-2.5 px-3 font-bold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && !searchLoading ? (
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
                    key={item.orderId || item.id}
                    className={
                      idx % 2 === 0
                        ? 'bg-white hover:bg-sky-50/40'
                        : 'bg-[#F9FAFB] hover:bg-sky-50/40'
                    }
                  >
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      <button
                        onClick={() => openCustomerDetails(item, 'timeline')}
                        className="hover:text-[#0284c7] hover:underline font-bold text-left"
                        title="View Work Timeline, Service Price & Direct Chat"
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
                      <span className="text-slate-800 font-medium">{item.service}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      {item.cp_type === 1 && (
                        <span className="inline-flex items-center whitespace-nowrap bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          Basic
                        </span>
                      )}
                      {item.cp_type === 2 && (
                        <span className="inline-flex items-center whitespace-nowrap bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          Standard
                        </span>
                      )}
                      {item.cp_type === 3 && (
                        <span className="inline-flex items-center whitespace-nowrap bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          Premium
                        </span>
                      )}
                      {item.cp_type === 4 && (
                        <span className="inline-flex items-center whitespace-nowrap bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          Diamond
                        </span>
                      )}
                      {item.cp_type === 5 && (
                        <span className="inline-flex items-center whitespace-nowrap bg-violet-50 text-violet-700 border border-violet-200 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          Custom
                        </span>
                      )}
                      {(!item.cp_type || item.cp_type === 0) && (
                        <span className="text-slate-400 text-[10px]">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{item.addedBy || '-'}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{item.total}</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-700">{item.paid}</td>
                    <td className="py-2.5 px-3 font-bold text-red-600">{item.unpaid}</td>
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                      {formatDisplayDate(item.dueDate)}
                    </td>
                    <td className="py-2.5 px-3 text-center relative">
                      <button
                        onClick={() => {
                          const uniqueId = item.orderId
                            ? `${item.id}-${item.orderId}`
                            : `${item.id}`;
                          setActiveMenuId(activeMenuId === uniqueId ? null : uniqueId);
                        }}
                        className="p-1 hover:bg-slate-200 rounded text-slate-600"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* 3-Dot Dropdown Action Menu (Exact Replica of Old CRM OMController) */}
                      {(() => {
                        const uniqueId = item.orderId ? `${item.id}-${item.orderId}` : `${item.id}`;
                        return activeMenuId === uniqueId;
                      })() && (
                        <div
                          ref={menuRef}
                          className={`absolute right-0 z-50 w-52 bg-white rounded-lg shadow-lg border border-slate-200 py-1 text-left text-xs max-h-[70vh] overflow-y-auto ${idx >= 2 && idx === filtered.length - 1 ? 'bottom-6' : 'top-6'}`}
                        >
                          {/* 0. Timeline & Service Price (Work Timeline + EMI Breakdown + Direct Chat) */}
                          <button
                            onClick={() => {
                              openCustomerDetails(item, 'timeline');
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3 py-2 hover:bg-slate-50 text-slate-800 font-semibold flex items-center gap-2 cursor-pointer"
                          >
                            <History className="w-3.5 h-3.5 text-sky-600" />
                            Timeline & Service Price
                          </button>
                          <button
                            onClick={() => {
                              openCustomerDetails(item, 'price');
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3 py-2 hover:bg-slate-50 text-slate-800 font-semibold flex items-center gap-2 cursor-pointer"
                          >
                            <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                            Service Price & Collect EMI
                          </button>

                          {/* 1. Manage Tasks (AddWorkEffort) */}
                          {!isSalesEmployeeView && (
                            <button
                              onClick={() => {
                                openManageTasks(item);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-2 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2 cursor-pointer"
                            >
                              <ListTodo className="w-3.5 h-3.5 text-blue-600" />
                              Manage Tasks
                            </button>
                          )}

                          {/* 2. Edit Customer (EditCustomer) */}
                          {!isSalesEmployeeView && (
                            <button
                              onClick={() => {
                                openEditCustomer(item);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-2 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                              Edit Customer
                            </button>
                          )}

                          {/* 3. Add New Order (addNewOrder) */}
                          <button
                            onClick={() => {
                              openAddOrder(item);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3 py-2 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2 cursor-pointer"
                          >
                            <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                            Add New Order
                          </button>

                          {/* 4. Create Customer (createCustomer - Requested by User) */}
                          {!isSalesEmployeeView && (
                            <button
                              onClick={() => {
                                openCreateCustomer(item);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-2 hover:bg-purple-50 text-purple-700 font-semibold flex items-center gap-2 cursor-pointer"
                            >
                              <UserPlus className="w-3.5 h-3.5 text-purple-600" />
                              Create Customer
                            </button>
                          )}

                          {/* 5. Edit Sub Customer (EditSubCustomer) */}
                          {!isSalesEmployeeView && (
                            <button
                              onClick={() => {
                                openEditSubCustomer(item);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-2 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2 cursor-pointer"
                            >
                              <Tag className="w-3.5 h-3.5 text-indigo-600" />
                              Edit Sub Customer
                            </button>
                          )}

                          {/* 6. Add Appointment (AddAppointment) */}
                          {!isSalesEmployeeView && (
                            <button
                              onClick={() => {
                                openAddAppointment(item);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-2 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2 cursor-pointer"
                            >
                              <Calendar className="w-3.5 h-3.5 text-teal-600" />
                              Add Appointment
                            </button>
                          )}

                          {/* 7. Delete Order (DeleteCustomer) */}
                          {!isSalesEmployeeView && (
                            <button
                              onClick={() => {
                                openDeleteConfirm(item);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-2 hover:bg-red-50 text-red-600 font-medium flex items-center gap-2 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-600" />
                              Delete Order
                            </button>
                          )}
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
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, totalCount || customers.length)} of{' '}
            {totalCount || customers.length} entries
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from(
              { length: Math.min(5, Math.ceil((totalCount || customers.length) / pageSize)) },
              (_, i) => {
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
              }
            )}
            {Math.ceil((totalCount || customers.length) / pageSize) > 5 && (
              <span className="px-1 text-slate-400">...</span>
            )}
            {Math.ceil((totalCount || customers.length) / pageSize) > 5 && (
              <button
                onClick={() =>
                  setCurrentPage(Math.ceil((totalCount || customers.length) / pageSize))
                }
                className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
              >
                {Math.ceil((totalCount || customers.length) / pageSize)}
              </button>
            )}
            <button
              onClick={() =>
                setCurrentPage(
                  Math.min(Math.ceil((totalCount || customers.length) / pageSize), currentPage + 1)
                )
              }
              disabled={currentPage === Math.ceil((totalCount || customers.length) / pageSize)}
              className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ─── ADD NEW CUSTOMER MODAL (Old CRM Replica matching Screenshots 1 & 2) ─── */}
      {isAddCustomerOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-4 overflow-y-auto"
          onClick={() => setIsAddCustomerOpen(false)}
        >
          <div
            className="rounded-3xl border border-[#EAE6DD] bg-white shadow-2xl w-full max-w-3xl animate-scale-in my-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1 bg-multicolor" />
            {/* Header — matches Add New Order style */}
            <div className="px-6 py-4 border-b border-[#EAE6DD] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#1B365D] flex items-center justify-center shadow-xs">
                  <UserPlus className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#1B365D]">Add New Customer</h3>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Fill in customer details &amp; package information
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddCustomerOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddOfflineCustomer} className="p-6 space-y-4 text-xs">
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
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-semibold focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
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
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-semibold focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
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
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-semibold focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
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
                    onChange={(e) => handleMobileChange(e.target.value)}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-semibold focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                  {mobileValid === true && (
                    <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                      Mobile Approved
                    </span>
                  )}
                  {mobileValid === false && (
                    <span className="text-[10px] text-red-600 font-bold block mt-0.5">
                      Mobile already exists
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
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-semibold focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
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
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-semibold focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
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
                    {/* Custom Service Picker with colored CP Type badges */}
                    <div className="relative">
                      <div
                        onClick={() => setIsAddCustServiceOpen(!isAddCustServiceOpen)}
                        className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3 py-2 text-slate-800 font-semibold cursor-pointer flex items-center justify-between min-h-[38px]"
                      >
                        {dbServicesByCategory.length === 0 ? (
                          <span className="text-slate-400 text-xs">Select category first...</span>
                        ) : (
                          (() => {
                            // Use selectedCpId (cp_id) for matching — NOT selectedServiceId
                            const sel = dbServicesByCategory.find((s) => s.cp_id === selectedCpId);
                            return sel ? (
                              <span className="flex items-center text-xs">
                                {sel.service_name}
                                {cpTypeBadge(sel.cp_type)}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs">Select Services</span>
                            );
                          })()
                        )}
                        <svg
                          className="w-4 h-4 text-slate-400 ml-1 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                      {isAddCustServiceOpen && dbServicesByCategory.length > 0 && (
                        <div
                          className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-300 rounded-xl shadow-xl z-[200] max-h-56 overflow-y-auto p-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="p-2 border-b border-slate-200">
                            <input
                              type="text"
                              placeholder="Search services..."
                              value={serviceSearchTerm}
                              onChange={(e) => setServiceSearchTerm(e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          {dbServicesByCategory
                            .filter((s) =>
                              s.service_name.toLowerCase().includes(serviceSearchTerm.toLowerCase())
                            )
                            .map((s) => (
                              <div
                                key={s.cp_id}
                                onClick={() => {
                                  handleServiceChange(String(s.cp_id));
                                  setIsAddCustServiceOpen(false);
                                  setServiceSearchTerm('');
                                }}
                                className={`px-3 py-2 rounded-lg text-xs cursor-pointer flex items-center justify-between font-medium transition-colors ${selectedCpId === s.cp_id ? 'bg-sky-100 text-sky-900' : 'hover:bg-slate-50 text-slate-700'}`}
                              >
                                <span className="flex items-center">
                                  {s.service_name}
                                  {cpTypeBadge(s.cp_type)}
                                </span>
                                <span className="text-[10px] text-slate-500 ml-2 flex-shrink-0">
                                  ₹{s.effective_price ?? s.service_price}
                                </span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
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
                        <div className="p-2 border-b border-slate-200">
                          <input
                            type="text"
                            placeholder="Search services..."
                            value={customServiceSearchTerm}
                            onChange={(e) => setCustomServiceSearchTerm(e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        {allDbServices.length === 0 && (
                          <div className="p-3 text-xs text-slate-400 text-center">
                            Loading services...
                          </div>
                        )}
                        {allDbServices
                          .filter((s) =>
                            s.service_name
                              .toLowerCase()
                              .includes(customServiceSearchTerm.toLowerCase())
                          )
                          .map((s) => (
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

              {/* Action Buttons — matching Add New Order */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="btn-multicolor font-bold py-2.5 px-8 text-xs cursor-pointer"
                >
                  Add Customer
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
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-6 rounded-xl transition-colors text-xs cursor-pointer border border-slate-200"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── 1. ADD NEW ORDER MODAL ─── */}
      {isAddOrderOpen && activeCustomer && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-4 overflow-y-auto"
          onClick={() => setIsAddOrderOpen(false)}
        >
          <div
            className="rounded-3xl border border-[#EAE6DD] bg-white shadow-2xl overflow-hidden w-full max-w-3xl animate-scale-in my-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1 bg-multicolor" />
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#EAE6DD] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#1B365D] flex items-center justify-center shadow-xs">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#1B365D]">Add New Order</h3>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {activeCustomer.name} • {activeCustomer.company}
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

            <form onSubmit={handleAddNewOrderSubmit} className="p-6 space-y-4 text-xs">
              {/* Row 1: Name | Company | Sub Customer */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Name</label>
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
                    placeholder="Enter Sub Customer Name (e.g. OPC1, OPC2)"
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              {/* Row 2: Email | Mobile | State | City */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Email</label>
                  <input
                    type="text"
                    disabled
                    value={activeCustomer.email}
                    className="w-full bg-slate-100 border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-600 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Mobile No
                  </label>
                  <input
                    type="text"
                    disabled
                    value={activeCustomer.mobile}
                    className="w-full bg-slate-100 border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-600 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">State</label>
                  <input
                    type="text"
                    disabled
                    value={activeCustomer.state}
                    className="w-full bg-slate-100 border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-600 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">City</label>
                  <input
                    type="text"
                    disabled
                    value={activeCustomer.city}
                    className="w-full bg-slate-100 border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-600 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Row 3: Custom Package | Category/Service or PkgName/CustomServices | Total Amount */}
              <div className="grid grid-cols-12 gap-3 items-end">
                {/* Custom Package toggle */}
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Custom Package
                  </label>
                  <select
                    value={orderIsCustom ? '1' : '0'}
                    onChange={(e) => {
                      const v = e.target.value === '1';
                      setOrderIsCustom(v);
                      setOrderServPrice(0);
                      setOrderDiscount(0);
                      setOrderCoupon('');
                      setOrderCouponMsg(null);
                    }}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-2 py-2 text-slate-800 focus:bg-white"
                  >
                    <option value="0">No</option>
                    <option value="1">Yes</option>
                  </select>
                </div>

                {!orderIsCustom ? (
                  <>
                    {/* Category */}
                    <div className="col-span-4">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Category
                      </label>
                      <select
                        value={orderCatId}
                        onChange={(e) => {
                          const catId = Number(e.target.value);
                          setOrderCatId(catId);
                          setOrderServId(0);
                          setOrderServPrice(0);
                          setOrderDiscount(0);
                          setOrderCoupon('');
                          setOrderCouponMsg(null);
                          fetchServicesForCategory(catId);
                        }}
                        className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-semibold focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                      >
                        <option value={0}>Select Category</option>
                        {dbCategories.map((cat) => (
                          <option key={cat.category_id} value={cat.category_id}>
                            {cat.category_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {/* Service - custom dropdown with colored CP Type badges */}
                    <div className="col-span-4">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Service *
                      </label>
                      <div className="relative">
                        <div
                          onClick={() => setIsOrderServiceOpen(!isOrderServiceOpen)}
                          className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-semibold cursor-pointer flex items-center justify-between min-h-[38px] focus:bg-white"
                        >
                          {(() => {
                            const sel = dbServicesByCategory.find((s) => s.cp_id === orderCpId);
                            return sel ? (
                              <span className="flex items-center text-xs">
                                {sel.service_name}
                                {cpTypeBadge(sel.cp_type)}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs">Select Services</span>
                            );
                          })()}
                          <svg
                            className="w-4 h-4 text-slate-400 ml-1 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                        {isOrderServiceOpen && (
                          <div
                            className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-300 rounded-xl shadow-xl z-[200] max-h-56 overflow-y-auto p-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="p-2 border-b border-slate-200">
                              <input
                                type="text"
                                placeholder="Search services..."
                                value={serviceSearchTerm}
                                onChange={(e) => setServiceSearchTerm(e.target.value)}
                                className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            {dbServicesByCategory.length === 0 && (
                              <div className="p-3 text-xs text-slate-400 text-center">
                                Select a category first...
                              </div>
                            )}
                            {dbServicesByCategory
                              .filter((serv) =>
                                serv.service_name
                                  .toLowerCase()
                                  .includes(serviceSearchTerm.toLowerCase())
                              )
                              .map((serv) => (
                                <div
                                  key={serv.cp_id}
                                  onClick={() => {
                                    setOrderCpId(serv.cp_id!);
                                    setOrderServId(serv.service_id);
                                    setOrderServPrice(serv.effective_price ?? serv.service_price);
                                    setOrderCpType(serv.cp_type || 0);
                                    setOrderDiscount(0);
                                    setOrderCoupon('');
                                    setOrderCouponMsg(null);
                                    setIsOrderServiceOpen(false);
                                    setServiceSearchTerm('');
                                  }}
                                  className={`px-3 py-2 rounded-lg text-xs cursor-pointer flex items-center justify-between font-medium transition-colors ${orderCpId === serv.cp_id ? 'bg-sky-100 text-sky-900' : 'hover:bg-slate-50 text-slate-700'}`}
                                >
                                  <span className="flex items-center">
                                    {serv.service_name}
                                    {cpTypeBadge(serv.cp_type)}
                                  </span>
                                  <span className="text-[10px] text-slate-500 ml-2 flex-shrink-0">
                                    ₹{serv.effective_price ?? serv.service_price}
                                  </span>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Package Name */}
                    <div className="col-span-3">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Package Name
                      </label>
                      <input
                        type="text"
                        value={orderCustomPkgName}
                        onChange={(e) => setOrderCustomPkgName(e.target.value)}
                        placeholder="e.g. pvt ltd"
                        className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white"
                      />
                    </div>
                    {/* Custom Services chip-style multi-select (same as Add New Customer) */}
                    <div className="col-span-5 relative">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Select Custom Services
                      </label>
                      <div
                        onClick={() => setIsOrderCustomDropdownOpen(!isOrderCustomDropdownOpen)}
                        className="w-full min-h-[38px] bg-white border border-[#EAE6DD] rounded-xl px-2 py-1.5 flex flex-wrap gap-1 items-center cursor-pointer"
                      >
                        {orderCustomServiceIds.length === 0 && (
                          <span className="text-[10px] text-slate-400">
                            Click to select services...
                          </span>
                        )}
                        {orderCustomServiceIds.map((id) => {
                          const sv = allDbServices.find((x) => x.service_id === id);
                          return sv ? (
                            <span
                              key={id}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-300 flex items-center gap-1"
                            >
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const ids = orderCustomServiceIds.filter((i) => i !== id);
                                  setOrderCustomServiceIds(ids);
                                  const total = ids.reduce(
                                    (sum, sid) =>
                                      sum +
                                      (allDbServices.find((s) => s.service_id === sid)
                                        ?.service_price || 0),
                                    0
                                  );
                                  setOrderServPrice(total);
                                }}
                              >
                                ×
                              </span>
                              {sv.service_name}
                            </span>
                          ) : null;
                        })}
                      </div>
                      {isOrderCustomDropdownOpen && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-300 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto p-1">
                          <div className="p-2 border-b border-slate-200">
                            <input
                              type="text"
                              placeholder="Search services..."
                              value={customServiceSearchTerm}
                              onChange={(e) => setCustomServiceSearchTerm(e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          {allDbServices.length === 0 && (
                            <div className="p-3 text-xs text-slate-400 text-center">
                              Loading services...
                            </div>
                          )}
                          {allDbServices
                            .filter((s) =>
                              s.service_name
                                .toLowerCase()
                                .includes(customServiceSearchTerm.toLowerCase())
                            )
                            .map((s) => (
                              <div
                                key={s.service_id}
                                onClick={() => {
                                  const ids = orderCustomServiceIds.includes(s.service_id)
                                    ? orderCustomServiceIds.filter((i) => i !== s.service_id)
                                    : [...orderCustomServiceIds, s.service_id];
                                  setOrderCustomServiceIds(ids);
                                  const total = ids.reduce(
                                    (sum, id) =>
                                      sum +
                                      (allDbServices.find((x) => x.service_id === id)
                                        ?.service_price || 0),
                                    0
                                  );
                                  setOrderServPrice(total);
                                }}
                                className={`p-2 rounded-lg text-xs cursor-pointer font-medium flex items-center justify-between ${orderCustomServiceIds.includes(s.service_id) ? 'bg-sky-100 text-sky-900 font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
                              >
                                <span>{s.service_name}</span>
                                <span className="text-[10px] text-slate-500">
                                  ₹{s.service_price}
                                </span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Total Amount */}
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Total Amount
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={orderServPrice}
                    className="w-full bg-slate-100 border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-bold"
                  />
                </div>
              </div>

              {/* Row 4: Apply Coupon | Discount Amount | Payment Mode */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Apply Coupon
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="enter coupon code if any"
                      value={orderCoupon}
                      onChange={(e) => setOrderCoupon(e.target.value.toUpperCase())}
                      className="flex-1 bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 uppercase focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                    />
                    <button
                      type="button"
                      onClick={handleValidateOrderCoupon}
                      disabled={isValidatingOrderCoupon}
                      className="btn-multicolor px-3 py-2 font-bold cursor-pointer text-xs"
                    >
                      {isValidatingOrderCoupon ? '...' : 'Apply'}
                    </button>
                  </div>
                  {orderCouponMsg && (
                    <p
                      className={`text-[10px] mt-1 font-semibold ${orderCouponMsg.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}
                    >
                      {orderCouponMsg.text}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Discount Amount
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={orderDiscount}
                    className="w-full bg-slate-100 border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-bold text-emerald-700"
                  />
                  {orderDiscount > 0 && (
                    <p className="text-[10px] mt-0.5 text-emerald-600 font-semibold">
                      Net Payable: ₹{Math.max(orderServPrice - orderDiscount, 0)}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={orderPaymentMode}
                    onChange={(e) => {
                      setOrderPaymentMode(e.target.value);
                      setOrderEmi1(0);
                      setOrderEmi2(0);
                    }}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  >
                    <option value="1">No EMI</option>
                    <option value="2">2 EMI</option>
                    <option value="3">3 EMI</option>
                  </select>
                </div>
              </div>

              {/* Row 5: Paid Amount | 1st EMI | [2nd EMI] | 1st Due Date | [2nd Due Date] */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Paid Amount
                  </label>
                  <input
                    type="number"
                    value={
                      orderPaymentMode === '1'
                        ? Math.max(orderServPrice - orderDiscount, 0)
                        : orderPaidAmount
                    }
                    onChange={(e) => {
                      const paid = Number(e.target.value);
                      setOrderPaidAmount(paid);
                      const net = Math.max(orderServPrice - orderDiscount, 0);
                      const emi1 = Math.max(net - paid, 0);
                      setOrderEmi1(emi1);
                      setOrderEmi2(orderPaymentMode === '3' ? Math.round(emi1 / 2) : 0);
                    }}
                    disabled={orderPaymentMode === '1'}
                    placeholder="Paid Amount"
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-bold text-emerald-600 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">1st EMI</label>
                  <input
                    type="text"
                    readOnly
                    value={orderPaymentMode === '1' ? 0 : orderEmi1}
                    placeholder="1st EMI"
                    className="w-full bg-slate-100 border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-700 font-bold"
                  />
                </div>
                {orderPaymentMode === '3' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      2nd EMI
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={orderEmi2}
                      className="w-full bg-slate-100 border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-700 font-bold"
                    />
                  </div>
                )}
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
                      className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Row 6: Comment Box | Payment Screenshot */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Comment Box
                  </label>
                  <textarea
                    rows={3}
                    value={orderComment}
                    onChange={(e) => setOrderComment(e.target.value)}
                    placeholder="Comment ..."
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl p-3 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Payment Screenshot
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-700 text-[11px] file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#1B365D] file:text-white hover:file:bg-[#162d4e]"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3 pt-2 border-t border-[#EAE6DD]">
                <button
                  type="submit"
                  disabled={isAddingOrder}
                  className="px-8 py-2.5 rounded-full bg-gradient-to-r from-[#06B6D4] to-[#0891B2] hover:from-[#0891B2] hover:to-[#0e7490] text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                >
                  {isAddingOrder ? 'Adding...' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOrderIsCustom(false);
                    setOrderCustomPkgName('');
                    setOrderCustomServiceIds([]);
                    setOrderServId(0);
                    setOrderServPrice(0);
                    setOrderDiscount(0);
                    setOrderCoupon('');
                    setOrderCouponMsg(null);
                    setOrderComment('');
                    setOrderSubCustomer('');
                    setOrderPaidAmount(0);
                    setOrderEmi1(0);
                    setOrderEmi2(0);
                    setOrderPaymentMode('1');
                  }}
                  className="px-8 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddOrderOpen(false)}
                  className="px-6 py-2.5 rounded-full font-bold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer ml-auto"
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
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsUpdateCustomerOpen(false)}
        >
          <div
            className="rounded-3xl border border-[#EAE6DD] bg-white shadow-2xl overflow-hidden max-w-xl w-full animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
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

      {/* ─── 2. CREATE CUSTOMER MODAL ─── */}
      {isCreateCustomerOpen && activeCustomer && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-4 overflow-y-auto"
          onClick={() => setIsCreateCustomerOpen(false)}
        >
          <div
            className="rounded-3xl border border-[#EAE6DD] bg-white shadow-2xl overflow-hidden w-full max-w-3xl animate-scale-in my-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1 bg-multicolor" />
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#EAE6DD] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#1B365D] flex items-center justify-center shadow-xs">
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
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomerSubmit} className="p-6 space-y-4 text-xs">
              {/* Row 1: Name | Company/Shop Name | Sub Customer */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={createCustName}
                    onChange={(e) => setCreateCustName(e.target.value)}
                    placeholder="Customer Name"
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-semibold focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Company/Shop Name
                  </label>
                  <input
                    type="text"
                    value={createCustBusiness}
                    onChange={(e) => setCreateCustBusiness(e.target.value)}
                    placeholder="Company/Shop Name"
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Sub Customer
                  </label>
                  <input
                    type="text"
                    value={createCustSubCustomer}
                    onChange={(e) => setCreateCustSubCustomer(e.target.value)}
                    placeholder="Enter Sub Customer Name (e.g. OPC1, OPC2)"
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              {/* Row 2: Email | Mobile No | State | City */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={createCustEmail}
                    onChange={(e) => setCreateCustEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Mobile No
                  </label>
                  <input
                    type="text"
                    required
                    value={createCustMobile}
                    onChange={(e) => {
                      setCreateCustMobile(e.target.value);
                      validateCreateCustomerMobile(e.target.value);
                    }}
                    placeholder="Mobile No"
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                  {createCustMobileValid === true && (
                    <p className="text-[10px] text-green-600 mt-1">Mobile Approved</p>
                  )}
                  {createCustMobileValid === false && (
                    <p className="text-[10px] text-red-600 mt-1">Mobile already exists</p>
                  )}
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">State</label>
                  <input
                    type="text"
                    value={createCustState}
                    onChange={(e) => setCreateCustState(e.target.value)}
                    placeholder="State"
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">City</label>
                  <input
                    type="text"
                    value={createCustCity}
                    onChange={(e) => setCreateCustCity(e.target.value)}
                    placeholder="City"
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              {/* Row 3: Custom Package | Category/Service OR PkgName/CustomServices | Total Amount */}
              <div className="grid grid-cols-12 gap-3 items-end">
                {/* Custom Package toggle */}
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Custom Package
                  </label>
                  <select
                    value={createCustIsCustom ? '1' : '0'}
                    onChange={(e) => {
                      const v = e.target.value === '1';
                      setCreateCustIsCustom(v);
                      setCreateCustPrice(0);
                      setCreateCustDiscount(0);
                      setCreateCustCoupon('');
                      setCreateCustCouponMsg(null);
                    }}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-2 py-2 text-slate-800 focus:bg-white"
                  >
                    <option value="0">No</option>
                    <option value="1">Yes</option>
                  </select>
                </div>

                {!createCustIsCustom ? (
                  <>
                    <div className="col-span-4">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Category
                      </label>
                      <select
                        value={createCustCatId}
                        onChange={(e) => {
                          const catId = Number(e.target.value);
                          setCreateCustCatId(catId);
                          setCreateCustServId(0);
                          setCreateCustPrice(0);
                          setCreateCustDiscount(0);
                          setCreateCustCoupon('');
                          setCreateCustCouponMsg(null);
                          fetchServicesForCategory(catId);
                        }}
                        className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-semibold focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                      >
                        <option value={0}>Select Category</option>
                        {dbCategories.map((cat) => (
                          <option key={cat.category_id} value={cat.category_id}>
                            {cat.category_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-4">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Service
                      </label>
                      {/* Custom dropdown with colored CP Type badges */}
                      <div className="relative">
                        <div
                          onClick={() => setIsCreateCustServiceOpen(!isCreateCustServiceOpen)}
                          className="w-full bg-white border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-semibold cursor-pointer flex items-center justify-between min-h-[38px]"
                        >
                          {(() => {
                            const sel = dbServicesByCategory.find(
                              (s) => s.cp_id === createCustCpId
                            );
                            return sel ? (
                              <span className="flex items-center text-xs">
                                {sel.service_name}
                                {cpTypeBadge(sel.cp_type)}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs">Select Services</span>
                            );
                          })()}
                          <svg
                            className="w-4 h-4 text-slate-400 ml-1 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                        {isCreateCustServiceOpen && (
                          <div
                            className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-300 rounded-xl shadow-xl z-[200] max-h-56 overflow-y-auto p-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="p-2 border-b border-slate-200">
                              <input
                                type="text"
                                placeholder="Search services..."
                                value={serviceSearchTerm}
                                onChange={(e) => setServiceSearchTerm(e.target.value)}
                                className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            {dbServicesByCategory.length === 0 && (
                              <div className="p-3 text-xs text-slate-400 text-center">
                                Select a category first...
                              </div>
                            )}
                            {dbServicesByCategory
                              .filter((s) =>
                                s.service_name
                                  .toLowerCase()
                                  .includes(serviceSearchTerm.toLowerCase())
                              )
                              .map((s) => (
                                <div
                                  key={s.cp_id}
                                  onClick={() => {
                                    setCreateCustCpId(s.cp_id!);
                                    setCreateCustServId(s.service_id);
                                    setCreateCustPrice(s.effective_price ?? s.service_price);
                                    setCreateCustCpType(s.cp_type || 0);
                                    setCreateCustDiscount(0);
                                    setCreateCustCoupon('');
                                    setCreateCustCouponMsg(null);
                                    setIsCreateCustServiceOpen(false);
                                    setServiceSearchTerm('');
                                  }}
                                  className={`px-3 py-2 rounded-lg text-xs cursor-pointer flex items-center justify-between font-medium transition-colors ${createCustCpId === s.cp_id ? 'bg-sky-100 text-sky-900' : 'hover:bg-slate-50 text-slate-700'}`}
                                >
                                  <span className="flex items-center">
                                    {s.service_name}
                                    {cpTypeBadge(s.cp_type)}
                                  </span>
                                  <span className="text-[10px] text-slate-500 ml-2 flex-shrink-0">
                                    ₹{s.effective_price ?? s.service_price}
                                  </span>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="col-span-3">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Package Name
                      </label>
                      <input
                        type="text"
                        value={createCustCustomPkgName || ''}
                        onChange={(e) => setCreateCustCustomPkgName(e.target.value)}
                        placeholder="e.g. pvt ltd"
                        className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white"
                      />
                    </div>
                    {/* Custom Services chip-style multi-select (same as Add New Customer) */}
                    <div className="col-span-5 relative">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Select Custom Services
                      </label>
                      <div
                        onClick={() =>
                          setIsCreateCustCustomDropdownOpen(!isCreateCustCustomDropdownOpen)
                        }
                        className="w-full min-h-[38px] bg-white border border-[#EAE6DD] rounded-xl px-2 py-1.5 flex flex-wrap gap-1 items-center cursor-pointer"
                      >
                        {(createCustCustomServiceIds || []).length === 0 && (
                          <span className="text-[10px] text-slate-400">
                            Click to select services...
                          </span>
                        )}
                        {(createCustCustomServiceIds || []).map((id: number) => {
                          const sv = allDbServices.find((x) => x.service_id === id);
                          return sv ? (
                            <span
                              key={id}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-300 flex items-center gap-1"
                            >
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const cur = createCustCustomServiceIds || [];
                                  const ids = cur.filter((i: number) => i !== id);
                                  setCreateCustCustomServiceIds(ids);
                                  const total = ids.reduce(
                                    (sum: number, sid: number) =>
                                      sum +
                                      (allDbServices.find((s) => s.service_id === sid)
                                        ?.service_price || 0),
                                    0
                                  );
                                  setCreateCustPrice(total);
                                }}
                              >
                                ×
                              </span>
                              {sv.service_name}
                            </span>
                          ) : null;
                        })}
                      </div>
                      {isCreateCustCustomDropdownOpen && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-300 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto p-1">
                          <div className="p-2 border-b border-slate-200">
                            <input
                              type="text"
                              placeholder="Search services..."
                              value={customServiceSearchTerm}
                              onChange={(e) => setCustomServiceSearchTerm(e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          {allDbServices.length === 0 && (
                            <div className="p-3 text-xs text-slate-400 text-center">
                              Loading services...
                            </div>
                          )}
                          {allDbServices
                            .filter((s) =>
                              s.service_name
                                .toLowerCase()
                                .includes(customServiceSearchTerm.toLowerCase())
                            )
                            .map((s) => (
                              <div
                                key={s.service_id}
                                onClick={() => {
                                  const cur = createCustCustomServiceIds || [];
                                  const ids = cur.includes(s.service_id)
                                    ? cur.filter((i: number) => i !== s.service_id)
                                    : [...cur, s.service_id];
                                  setCreateCustCustomServiceIds(ids);
                                  const total = ids.reduce(
                                    (sum: number, id: number) =>
                                      sum +
                                      (allDbServices.find((x) => x.service_id === id)
                                        ?.service_price || 0),
                                    0
                                  );
                                  setCreateCustPrice(total);
                                }}
                                className={`p-2 rounded-lg text-xs cursor-pointer font-medium flex items-center justify-between ${(createCustCustomServiceIds || []).includes(s.service_id) ? 'bg-sky-100 text-sky-900 font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
                              >
                                <span>{s.service_name}</span>
                                <span className="text-[10px] text-slate-500">
                                  ₹{s.service_price}
                                </span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Total Amount */}
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Total Amount
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={createCustPrice}
                    className="w-full bg-slate-100 border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-bold"
                  />
                </div>
              </div>

              {/* Row 4: Apply Coupon | Discount Amount | Payment Mode */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Apply Coupon
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="enter coupon code if any"
                      value={createCustCoupon}
                      onChange={(e) => setCreateCustCoupon(e.target.value.toUpperCase())}
                      className="flex-1 bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 uppercase focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                    />
                    <button
                      type="button"
                      onClick={handleValidateCreateCoupon}
                      disabled={isValidatingCreateCoupon}
                      className="btn-multicolor px-3 py-2 font-bold cursor-pointer text-xs"
                    >
                      {isValidatingCreateCoupon ? '...' : 'Apply'}
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
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Discount Amount
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={createCustDiscount}
                    className="w-full bg-slate-100 border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-bold text-emerald-700"
                  />
                  {createCustDiscount > 0 && (
                    <p className="text-[10px] mt-0.5 text-emerald-600 font-semibold">
                      Net Payable: ₹{Math.max(createCustPrice - createCustDiscount, 0)}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={createCustPaymentMode || '1'}
                    onChange={(e) => setCreateCustPaymentMode(e.target.value)}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  >
                    <option value="1">No EMI</option>
                    <option value="2">2 EMI</option>
                    <option value="3">3 EMI</option>
                  </select>
                </div>
              </div>

              {/* Row 5: Paid Amount | 1st EMI | [2nd EMI] | 1st Due Date | [2nd Due Date] */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Paid Amount
                  </label>
                  <input
                    type="number"
                    value={
                      createCustPaidAmount !== undefined
                        ? createCustPaymentMode === '1'
                          ? Math.max(createCustPrice - createCustDiscount, 0)
                          : createCustPaidAmount
                        : Math.max(createCustPrice - createCustDiscount, 0)
                    }
                    onChange={(e) => {
                      const paid = Number(e.target.value);
                      setCreateCustPaidAmount(paid);
                      const net = Math.max(createCustPrice - createCustDiscount, 0);
                      setCreateCustEmi1(Math.max(net - paid, 0));
                      setCreateCustEmi2(
                        createCustPaymentMode === '3' ? Math.round(Math.max(net - paid, 0) / 2) : 0
                      );
                    }}
                    disabled={!createCustPaymentMode || createCustPaymentMode === '1'}
                    placeholder="Paid Amount"
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 font-bold text-emerald-600 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">1st EMI</label>
                  <input
                    type="text"
                    readOnly
                    value={
                      !createCustPaymentMode || createCustPaymentMode === '1'
                        ? 0
                        : createCustEmi1 || 0
                    }
                    placeholder="1st EMI"
                    className="w-full bg-slate-100 border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-700 font-bold"
                  />
                </div>
                {createCustPaymentMode === '3' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      2nd EMI
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={createCustEmi2 || 0}
                      className="w-full bg-slate-100 border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-700 font-bold"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    1st Due Date
                  </label>
                  <input
                    type="date"
                    value={
                      createCustDueDate1 ||
                      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                    }
                    onChange={(e) => setCreateCustDueDate1(e.target.value)}
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white"
                  />
                </div>
                {createCustPaymentMode === '3' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      2nd Due Date
                    </label>
                    <input
                      type="date"
                      value={
                        createCustDueDate2 ||
                        new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                      }
                      onChange={(e) => setCreateCustDueDate2(e.target.value)}
                      className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-800 focus:bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Row 6: Comment Box | Payment Screenshot */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Comment Box
                  </label>
                  <textarea
                    rows={3}
                    value={createCustComment || ''}
                    onChange={(e) => setCreateCustComment(e.target.value)}
                    placeholder="Comment ..."
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl p-3 text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Payment Screenshot
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl px-3 py-2 text-slate-700 text-[11px] file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#1B365D] file:text-white hover:file:bg-[#162d4e]"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3 pt-2 border-t border-[#EAE6DD]">
                <button
                  type="submit"
                  disabled={isCreatingCustomer}
                  className="px-8 py-2.5 rounded-full bg-gradient-to-r from-[#1B365D] to-[#3B82F6] hover:from-[#162d4e] hover:to-[#2563eb] text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                >
                  {isCreatingCustomer ? 'Creating...' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCreateCustName(activeCustomer.name);
                    setCreateCustBusiness(
                      activeCustomer.company === '—' ? '' : activeCustomer.company
                    );
                    setCreateCustSubCustomer(
                      activeCustomer.subCustomer
                        ? `${activeCustomer.subCustomer} (New Entity)`
                        : 'OPC Branch'
                    );
                    setCreateCustEmail(activeCustomer.email);
                    setCreateCustMobile(activeCustomer.mobile);
                    setCreateCustState(activeCustomer.state);
                    setCreateCustCity(activeCustomer.city === '—' ? '' : activeCustomer.city);
                    setCreateCustPrice(0);
                    setCreateCustDiscount(0);
                    setCreateCustCoupon('');
                    setCreateCustCouponMsg(null);
                  }}
                  className="px-8 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateCustomerOpen(false)}
                  className="px-6 py-2.5 rounded-full font-bold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer ml-auto"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── 3. EDIT SUB CUSTOMER MODAL (Website Clean UI Style) ─── */}
      {isEditSubCustomerOpen && activeCustomer && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsEditSubCustomerOpen(false)}
        >
          <div
            className="rounded-3xl border border-[#EAE6DD] bg-white shadow-2xl overflow-hidden max-w-sm w-full animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
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
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsAddAppointmentOpen(false)}
        >
          <div
            className="rounded-3xl border border-[#EAE6DD] bg-white shadow-2xl overflow-hidden max-w-md w-full animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
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
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsDeleteConfirmOpen(false)}
        >
          <div
            className="rounded-3xl border border-[#EAE6DD] bg-white shadow-2xl overflow-hidden max-w-md w-full animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
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
                  className="btn-danger px-5 py-2 font-bold text-xs flex items-center gap-1.5"
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
                    const taskId = t.task_id || t.id;
                    const isAssigningThis = selectedTaskToAssign === taskId;
                    const assignedName =
                      t.assigned_user_name || t.assigned_to_name || t.employee_name;
                    return (
                      <div
                        key={taskId}
                        className="p-3 bg-[#FAF9F5] border border-[#EAE6DD] rounded-2xl space-y-2.5 transition-all hover:border-slate-300"
                      >
                        {/* Task header: name + assign/delete buttons */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            {/* Task name with assigned/unassigned color bar */}
                            <div
                              className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
                                assignedName
                                  ? 'bg-emerald-50 border-emerald-200'
                                  : 'bg-red-50 border-red-200'
                              }`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full shrink-0 ${
                                  assignedName ? 'bg-emerald-500' : 'bg-red-500'
                                }`}
                              />
                              <h4 className="font-bold text-slate-800 text-xs flex-1">
                                {t.task_name}
                              </h4>
                              {assignedName ? (
                                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                                  <UserPlus className="w-3 h-3" />
                                  {assignedName}
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full shrink-0">
                                  Un-Assign
                                </span>
                              )}
                            </div>
                            {formatDisplayDate(t.due_date) !== '—' && (
                              <p className="text-[10px] text-slate-400 mt-1 pl-1">
                                Due: {formatDisplayDate(t.due_date)}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() =>
                                setSelectedTaskToAssign(isAssigningThis ? null : taskId)
                              }
                              className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors flex items-center gap-1 ${
                                isAssigningThis
                                  ? 'bg-[#1B365D] text-white border-[#1B365D]'
                                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                              }`}
                              title="Assign Staff"
                            >
                              <Send className="w-3 h-3" />
                              <span className="text-[10px]">
                                {assignedName ? 'Re-Assign' : 'Assign'}
                              </span>
                            </button>
                            <button
                              onClick={() => handleDeleteTask(taskId)}
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
                                onClick={() => handleAssignTask(taskId)}
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

      {/* ─── CUSTOM CONFIRM DIALOG ─── */}
      {confirmDialog.open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeConfirm} />
          {/* Dialog */}
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm animate-scale-in overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-rose-600 to-red-700">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-extrabold text-white text-sm tracking-wide">
                {confirmDialog.title}
              </h3>
            </div>
            {/* Body */}
            <div className="px-5 py-5">
              <p className="text-slate-700 text-[13px] leading-relaxed">{confirmDialog.message}</p>
            </div>
            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-5 pb-5">
              <button
                onClick={closeConfirm}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDialog.onConfirm()}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{confirmDialog.confirmLabel || 'Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── CUSTOMER DETAILS MODAL (Work Timeline, Service Price, Direct Chat) ─── */}
      {isDetailsOpen && activeCustomer && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsDetailsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Customer Timeline and Service Price"
        >
          <div
            className="bg-white rounded-2xl border border-[#EAE6DD] shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1 bg-multicolor shrink-0" />
            <div className="px-5 py-4 border-b border-slate-200 flex items-start justify-between gap-3 shrink-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-slate-900 truncate">
                    {activeCustomer.name}
                  </h3>
                  {activeCustomer.subCustomer && (
                    <span className="inline-flex items-center whitespace-nowrap bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      {activeCustomer.subCustomer}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeCustomer.company !== '—' ? `${activeCustomer.company} • ` : ''}
                  {activeCustomer.service} • {activeCustomer.mobile}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!isSalesEmployeeView && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsDetailsOpen(false);
                      openEditCustomer(activeCustomer);
                    }}
                    className="btn-outline btn-sm text-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsDetailsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-5 pt-3 border-b border-slate-200 flex items-center gap-2 bg-slate-50/70 shrink-0">
              <button
                type="button"
                onClick={() => setDetailsTab('timeline')}
                className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                  detailsTab === 'timeline'
                    ? 'border-[#1B365D] text-[#1B365D] bg-white rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                Work Timeline ({detailsTimeline.length})
              </button>
              <button
                type="button"
                onClick={() => setDetailsTab('price')}
                className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                  detailsTab === 'price'
                    ? 'border-[#1B365D] text-[#1B365D] bg-white rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <IndianRupee className="w-3.5 h-3.5" />
                Service Price
              </button>
              <button
                type="button"
                onClick={() => setDetailsTab('chat')}
                className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                  detailsTab === 'chat'
                    ? 'border-[#1B365D] text-[#1B365D] bg-white rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Direct Chat ({detailsChat.length})
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {detailsLoading ? (
                <div className="py-12 flex items-center justify-center gap-2 text-xs text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin text-[#1B365D]" />
                  Loading customer timeline and pricing...
                </div>
              ) : detailsTab === 'timeline' ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div>
                      <p className="text-xs font-bold text-slate-700">Filter by Task</p>
                      <p className="text-[11px] text-slate-500">
                        {detailsTasks.length} operation{' '}
                        {detailsTasks.length === 1 ? 'task' : 'tasks'} linked to this customer
                      </p>
                    </div>
                    <select
                      value={selectedTimelineTaskId}
                      onChange={(e) => setSelectedTimelineTaskId(e.target.value)}
                      className="input text-xs py-1.5 sm:w-72"
                    >
                      <option value="all">All Tasks ({detailsTimeline.length} updates)</option>
                      {detailsTasks.map((t) => (
                        <option key={t.task_id} value={String(t.task_id)}>
                          {t.task_name} {t.assigned_user_name ? `(${t.assigned_user_name})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {(() => {
                    const visibleTimeline =
                      selectedTimelineTaskId === 'all'
                        ? detailsTimeline
                        : detailsTimeline.filter(
                            (r) => String(r.task_id) === selectedTimelineTaskId
                          );
                    if (visibleTimeline.length === 0) {
                      return (
                        <div className="py-10 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                          No work timeline entries recorded yet for this customer
                          {selectedTimelineTaskId !== 'all' ? ' / selected task' : ''}.
                        </div>
                      );
                    }
                    const tlStatusCfg = (st: number) => {
                      switch (st) {
                        case 5:
                          return {
                            label: 'Completed',
                            cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                          };
                        case 2:
                          return {
                            label: 'Work In Progress',
                            cls: 'bg-sky-50 text-sky-700 border-sky-200',
                          };
                        case 3:
                          return {
                            label: 'Pending From Client',
                            cls: 'bg-amber-50 text-amber-800 border-amber-200',
                          };
                        case 4:
                          return {
                            label: 'Invoiced',
                            cls: 'bg-violet-50 text-violet-700 border-violet-200',
                          };
                        case 6:
                          return {
                            label: 'Return Back',
                            cls: 'bg-cyan-50 text-cyan-700 border-cyan-200',
                          };
                        case 7:
                          return {
                            label: 'Cancelled',
                            cls: 'bg-slate-100 text-slate-600 border-slate-200',
                          };
                        case 8:
                          return {
                            label: 'Fees Pending',
                            cls: 'bg-orange-50 text-orange-700 border-orange-200',
                          };
                        case 9:
                          return {
                            label: 'On Hold',
                            cls: 'bg-amber-50 text-amber-800 border-amber-200',
                          };
                        default:
                          return {
                            label: 'Not Started',
                            cls: 'bg-rose-50 text-rose-700 border-rose-200',
                          };
                      }
                    };
                    const fmtSecs = (secs: number) => {
                      if (!secs || secs <= 0) return null;
                      const h = Math.floor(secs / 3600);
                      const m = Math.floor((secs % 3600) / 60);
                      const s = secs % 60;
                      return `${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m ` : ''}${s}s`;
                    };
                    return (
                      <div className="relative pl-5 space-y-3 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                        {visibleTimeline.map((entry) => {
                          const st = tlStatusCfg(Number(entry.status));
                          const dur = fmtSecs(Number(entry.work_seconds));
                          return (
                            <div
                              key={entry.id}
                              className="relative bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs"
                            >
                              <span className="absolute -left-[17px] top-4 w-2.5 h-2.5 rounded-full bg-[#3f6f9f] border-2 border-white" />
                              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span
                                    className={`inline-flex items-center whitespace-nowrap px-2 py-0.5 rounded-full border text-[11px] font-semibold ${st.cls}`}
                                  >
                                    {st.label}
                                  </span>
                                  <span className="text-xs font-bold text-slate-800">
                                    {entry.task_name}
                                  </span>
                                  {entry.service_name && (
                                    <span className="text-[11px] text-slate-500">
                                      • {entry.service_name}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-slate-500 whitespace-nowrap">
                                  {formatDisplayDate(entry.date)}
                                  {entry.time ? ` • ${entry.time}` : ''}
                                </span>
                              </div>
                              <p className="text-xs text-slate-700 leading-relaxed">
                                {entry.work || 'Status updated'}
                              </p>
                              <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                                <span className="font-semibold text-slate-700">
                                  By: {entry.username || 'Staff'}
                                </span>
                                {entry.start_time && entry.end_time && (
                                  <span className="inline-flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {entry.start_time} – {entry.end_time}
                                  </span>
                                )}
                                {dur && (
                                  <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                                    Logged: {dur}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              ) : detailsTab === 'price' ? (
                <EmiServicePricePanel
                  customer={activeCustomer}
                  detailsPrice={detailsPrice}
                  apiBase={API_BASE}
                  canManageEmi={canManageEmi}
                  formatDisplayDate={formatDisplayDate}
                  onRefresh={refreshActiveServicePrice}
                  onToast={(type, text) => showToast(text, type)}
                />
              ) : (
                <div className="space-y-3">
                  {detailsChat.length === 0 ? (
                    <div className="py-10 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                      No direct chat messages recorded for this customer.
                    </div>
                  ) : (
                    detailsChat.map((msg) => (
                      <div
                        key={msg.chat_id}
                        className={`flex flex-col ${
                          msg.is_from_customer ? 'items-start' : 'items-end'
                        }`}
                      >
                        <div
                          className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs border ${
                            msg.is_from_customer
                              ? 'bg-slate-50 border-slate-200 text-slate-800'
                              : 'bg-sky-50 border-sky-200 text-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1 text-[10px] text-slate-500">
                            <span className="font-bold text-slate-700">{msg.from_name}</span>
                            <span>→</span>
                            <span>{msg.to_name}</span>
                            {formatDisplayDate(msg.date) !== '—' && (
                              <span>• {formatDisplayDate(msg.date)}</span>
                            )}
                          </div>
                          <p className="leading-relaxed">{msg.chat_msg}</p>
                        </div>
                      </div>
                    ))
                  )}
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
