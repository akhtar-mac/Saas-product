// ETaxwala 2.0 — Shared TypeScript Types

// ============ AUTH & ROLES ============

export enum RoleType {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  SALES_MANAGER = 'SALES_MANAGER',
  OPERATIONS_MANAGER = 'OPERATIONS_MANAGER',
  FRANCHISE_MANAGER = 'FRANCHISE_MANAGER',
  SALES_EMPLOYEE = 'SALES_EMPLOYEE',
  OPERATIONS_EMPLOYEE = 'OPERATIONS_EMPLOYEE',
  FRANCHISE_EMPLOYEE = 'FRANCHISE_EMPLOYEE',
  OPERATIONS_ASSISTANT = 'OPERATIONS_ASSISTANT',
  CONSULTATION = 'CONSULTATION',
  MARKETING_MANAGER = 'MARKETING_MANAGER',
  HR = 'HR',
  WEBSITE_MANAGER = 'WEBSITE_MANAGER',
  SALES_ASSISTANT = 'SALES_ASSISTANT',
  MARKETING_EMPLOYEE = 'MARKETING_EMPLOYEE',
  STAFF = 'STAFF',
}

// Old user_type ID → New role mapping (for migration)
export const OLD_TO_NEW_ROLE: Record<number, RoleType> = {
  1: RoleType.SUPER_ADMIN,
  2: RoleType.ADMIN,
  3: RoleType.SALES_MANAGER,
  4: RoleType.OPERATIONS_MANAGER,
  5: RoleType.FRANCHISE_MANAGER,
  6: RoleType.SALES_EMPLOYEE,
  7: RoleType.OPERATIONS_EMPLOYEE,
  8: RoleType.FRANCHISE_EMPLOYEE,
  9: RoleType.OPERATIONS_ASSISTANT,
  10: RoleType.CONSULTATION,
  11: RoleType.MARKETING_MANAGER,
};

export interface User {
  id: number;
  username: string;
  email: string;
  role: RoleType;
  companyId: string;
  status: number;
  isOnline: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  profile?: Profile;
}

export interface Profile {
  id: number;
  userId: number;
  profilePhoto: string | null;
  address: string | null;
  dob: string | null;
  position: string | null;
  about: string | null;
}

// ============ CLIENTS ============

export interface Customer {
  id: number;
  leadId: number | null;
  name: string;
  business: string | null;
  email: string;
  contact: string;
  service: string | null;
  servicePrice: number;
  state: string | null;
  city: string | null;
  addedBy: number | null;
  companyId: string;
  isPayment: boolean;
  isActive: boolean;
  isApprove: boolean;
  isPartner: number;
  customerToken: string;
  date: string;
}

// ============ SERVICES ============

export interface Service {
  id: number;
  categoryId: number;
  name: string;
  nameMr?: string;
  price: number;
  partnerPercentage: number;
  description: string;
  inclusions: string[];
  process?: ProcessStep[];
  documentsRequired?: string[];
  faqs?: FAQ[];
  icon: string | null;
  imageUrl: string | null;
  url: string | null;
  companyId: string;
  isFeatured: boolean;
  isActive: boolean;
  category?: Category;
}

export interface Category {
  id: number;
  name: string;
  nameMr?: string;
  description: string | null;
  icon: string | null;
  companyId: string;
}

export interface ProcessStep {
  step: number;
  title: string;
  description: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface ComboPackage {
  id: number;
  name: string;
  description: string | null;
  totalPrice: number;
  serviceIds: number[];
  discountPercentage: number;
  isActive: boolean;
}

// ============ LEADS ============

export enum LeadSource {
  ETAXWALA = 'ETAXWALA',
  UDYOMI = 'UDYOMI',
  SAHAKAR = 'SAHAKAR',
  OTHER = 'OTHER',
  WEBINAR = 'WEBINAR',
  PARTNER = 'PARTNER',
}

export enum LeadStatus {
  NEW = 'NEW',
  ASSIGNED = 'ASSIGNED',
  CONTACTED = 'CONTACTED',
  FOLLOW_UP = 'FOLLOW_UP',
  CONVERTED = 'CONVERTED',
  LOST = 'LOST',
  CANCELLED = 'CANCELLED',
}

export interface Lead {
  id: number;
  campaignId: number | null;
  source: LeadSource;
  name: string;
  email: string;
  contact: string;
  service: string;
  state: string | null;
  city: string | null;
  leadNote: string | null;
  addedBy: number | null;
  leadType: number;
  isCustomer: boolean;
  isPayment: boolean;
  companyId: string;
  leadScore: number | null;
  quotedPrice: number | null;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
}

// ============ APPOINTMENTS ============

export interface Appointment {
  id: number;
  name: string;
  email: string;
  mobile: string;
  city: string | null;
  message: string | null;
  amount: number | null;
  isComplete: boolean;
  paymentStatus: number;
  apDate: string | null;
  apTime: string | null;
  apMode: string | null;
  isOnline: boolean;
  conductBy: string | null;
  addedBy: string | null;
  date: string;
}

// ============ TASKS ============

export enum TaskStatus {
  NOT_STARTED = 'NOT_STARTED',
  WIP = 'WIP',
  PENDING_CLIENT = 'PENDING_CLIENT',
  INVOICED = 'INVOICED',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  COMPLETED = 'COMPLETED',
  RETURN_BACK = 'RETURN_BACK',
  CANCELLED = 'CANCELLED',
  FEES_PENDING = 'FEES_PENDING',
  ON_HOLD = 'ON_HOLD',
}

export const TASK_STATUS_LIST: TaskStatus[] = [
  TaskStatus.NOT_STARTED,
  TaskStatus.WIP,
  TaskStatus.PENDING_CLIENT,
  TaskStatus.INVOICED,
  TaskStatus.PAYMENT_PENDING,
  TaskStatus.COMPLETED,
  TaskStatus.RETURN_BACK,
  TaskStatus.CANCELLED,
  TaskStatus.FEES_PENDING,
  TaskStatus.ON_HOLD,
];

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  [TaskStatus.NOT_STARTED]: '#94A3B8',
  [TaskStatus.WIP]: '#3B82F6',
  [TaskStatus.PENDING_CLIENT]: '#F59E0B',
  [TaskStatus.INVOICED]: '#8B5CF6',
  [TaskStatus.PAYMENT_PENDING]: '#F97316',
  [TaskStatus.COMPLETED]: '#10B981',
  [TaskStatus.RETURN_BACK]: '#EF4444',
  [TaskStatus.CANCELLED]: '#991B1B',
  [TaskStatus.FEES_PENDING]: '#F97316',
  [TaskStatus.ON_HOLD]: '#64748B',
};

export interface OperationTask {
  id: number;
  assignedBy: number;
  assignedTo: number;
  customerId: number | null;
  leadId: number | null;
  serviceId: number | null;
  taskName: string;
  companyName: string | null;
  clientName: string | null;
  mobile: string | null;
  status: TaskStatus;
  dueDate: string | null;
  priority: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskTimeline {
  id: number;
  taskId: number;
  status: TaskStatus;
  note: string | null;
  staffName: string;
  date: string;
}

// ============ CHAT ============

export interface ChatMessage {
  id: number;
  customerId: number | null;
  staffId: number | null;
  sender: 'client' | 'staff';
  message: string;
  attachmentUrl: string | null;
  isRead: boolean;
  createdAt: string;
}

// ============ CALLS ============

export interface CallHistory {
  id: number;
  leadId: number | null;
  contact: string;
  callType: 'Incoming' | 'Outgoing' | 'Missed' | 'Outgoing Missed';
  duration: number;
  callDate: string;
  staffId: number | null;
  source: string | null;
  recordingUrl: string | null;
}

// ============ QUOTATIONS ============

export interface Quotation {
  id: number;
  quotationNo: string;
  customerId: number | null;
  leadId: number | null;
  staffId: number;
  totalAmount: number;
  overallDiscount: number;
  finalAmount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  notes: string | null;
  pdfUrl: string | null;
  createdAt: string;
  items: QuotationItem[];
}

export interface QuotationItem {
  id: number;
  quotationId: number;
  serviceId: number | null;
  serviceName: string;
  serviceDescription: string | null;
  qty: number;
  price: number;
  discount: number;
  amount: number;
}

// ============ CONTENT ============

export interface Blog {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featuredImage: string | null;
  category: string | null;
  tags: string[];
  authorName: string | null;
  status: 'draft' | 'published';
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: number;
  blogId: number;
  name: string;
  email: string;
  comment: string;
  isApproved: boolean;
  createdAt: string;
}

// ============ INQUIRY FORMS ============

export interface InquiryFormData {
  name: string;
  email: string;
  contact: string;
  service: string;
  state: string;
  city: string;
}

export interface AppointmentFormData {
  name: string;
  email: string;
  mobile: string;
  city: string;
  message: string;
  apDate?: string;
  apTime?: string;
  apMode?: string;
}

// ============ API RESPONSES ============

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface ApiListResponse<T> {
  success: boolean;
  data: T[];
  message: string;
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}

// ============ DASHBOARD ============

export interface DashboardStats {
  notStarted: number;
  wip: number;
  pendingClient: number;
  invoiced: number;
  paymentPending: number;
  completed: number;
}

export interface CallSummary {
  total: number;
  incoming: number;
  outgoing: number;
  missed: number;
  duration: string;
}

// ============ FRANCHISE ============

export interface FranchisePartner {
  id: number;
  name: string;
  email: string;
  contact: string;
  city: string | null;
  state: string | null;
  companyName: string | null;
  partnerCode: string;
  commissionRate: number;
  status: string;
  joinedAt: string;
}