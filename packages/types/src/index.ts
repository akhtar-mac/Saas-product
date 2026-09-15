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
  permissions?: string[];
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
  NEW = 0,
  ASSIGNED = 1,
  CONTACTED = 2,
  FOLLOW_UP = 3,
  QUOTATION_SENT = 4,
  CONVERTED = 5,
  PAYMENT_PENDING = 6,
  CLOSED_WON = 7,
  CLOSED_LOST = 8,
  NOT_INTERESTED = 9,
  INVALID_NUMBER = 10,
}

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  [LeadStatus.NEW]: 'New Lead',
  [LeadStatus.ASSIGNED]: 'Assigned',
  [LeadStatus.CONTACTED]: 'Contacted',
  [LeadStatus.FOLLOW_UP]: 'Follow Up',
  [LeadStatus.QUOTATION_SENT]: 'Quotation Sent',
  [LeadStatus.CONVERTED]: 'Converted',
  [LeadStatus.PAYMENT_PENDING]: 'Payment Pending',
  [LeadStatus.CLOSED_WON]: 'Closed Won',
  [LeadStatus.CLOSED_LOST]: 'Closed Lost',
  [LeadStatus.NOT_INTERESTED]: 'Not Interested',
  [LeadStatus.INVALID_NUMBER]: 'Invalid Number',
};

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

// ============ 10-STAGE TASK LIFECYCLE ============

export enum TaskStatus {
  DOCUMENTS_PENDING = 1,
  DOCUMENTS_COLLECTED = 2,
  VERIFICATION_IN_PROGRESS = 3,
  VERIFICATION_COMPLETED = 4,
  GOVT_FILING_IN_PROGRESS = 5,
  GOVT_QUERY_RECEIVED = 6,
  QC_REVIEW = 7,
  GOVT_APPROVAL_RECEIVED = 8,
  COMPLETED = 9,
  CANCELLED = 10,
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.DOCUMENTS_PENDING]: 'Documents Pending',
  [TaskStatus.DOCUMENTS_COLLECTED]: 'Documents Collected',
  [TaskStatus.VERIFICATION_IN_PROGRESS]: 'Verification In Progress',
  [TaskStatus.VERIFICATION_COMPLETED]: 'Verification Completed',
  [TaskStatus.GOVT_FILING_IN_PROGRESS]: 'Govt Filing In Progress',
  [TaskStatus.GOVT_QUERY_RECEIVED]: 'Govt Query / Resubmit',
  [TaskStatus.QC_REVIEW]: 'QC Review',
  [TaskStatus.GOVT_APPROVAL_RECEIVED]: 'Govt Approval Received',
  [TaskStatus.COMPLETED]: 'Service Completed',
  [TaskStatus.CANCELLED]: 'Cancelled',
};

export const TASK_STATUS_LIST: TaskStatus[] = [
  TaskStatus.DOCUMENTS_PENDING,
  TaskStatus.DOCUMENTS_COLLECTED,
  TaskStatus.VERIFICATION_IN_PROGRESS,
  TaskStatus.VERIFICATION_COMPLETED,
  TaskStatus.GOVT_FILING_IN_PROGRESS,
  TaskStatus.GOVT_QUERY_RECEIVED,
  TaskStatus.QC_REVIEW,
  TaskStatus.GOVT_APPROVAL_RECEIVED,
  TaskStatus.COMPLETED,
  TaskStatus.CANCELLED,
];

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  [TaskStatus.DOCUMENTS_PENDING]: '#F59E0B',
  [TaskStatus.DOCUMENTS_COLLECTED]: '#06B6D4',
  [TaskStatus.VERIFICATION_IN_PROGRESS]: '#3B82F6',
  [TaskStatus.VERIFICATION_COMPLETED]: '#10B981',
  [TaskStatus.GOVT_FILING_IN_PROGRESS]: '#8B5CF6',
  [TaskStatus.GOVT_QUERY_RECEIVED]: '#EF4444',
  [TaskStatus.QC_REVIEW]: '#6366F1',
  [TaskStatus.GOVT_APPROVAL_RECEIVED]: '#059669',
  [TaskStatus.COMPLETED]: '#10B981',
  [TaskStatus.CANCELLED]: '#991B1B',
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
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

// ============ API RESPONSES ============

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code?: string;
    message: string;
    details?: unknown;
  };
}

export interface ApiListResponse<T = unknown> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}