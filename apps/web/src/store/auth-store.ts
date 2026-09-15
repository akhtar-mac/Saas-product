import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RoleType, User, Customer } from '@etaxwala/types';

export interface AuthState {
  // Client state
  customer: Customer | null;
  customerToken: string | null;
  isCustomerAuthenticated: boolean;

  // Staff state
  staffUser: User | null;
  staffToken: string | null;
  staffRefreshToken: string | null;
  isStaffAuthenticated: boolean;
  activeRole: RoleType;

  // Actions
  loginCustomer: (customer: Customer, token: string) => void;
  logoutCustomer: () => void;

  loginStaff: (user: User, token: string, refreshToken?: string) => void;
  setStaffRole: (role: RoleType) => void;
  setStaffToken: (token: string) => void;
  logoutStaff: () => void;
}

const DEFAULT_STAFF: User = {
  id: 1,
  username: 'admin',
  email: 'admin@etaxwala.com',
  role: RoleType.SUPER_ADMIN,
  companyId: 'comp-1',
  status: 1,
  isOnline: true,
  lastLoginAt: '2026-09-05',
  createdAt: '2026-01-01',
  updatedAt: '2026-09-05',
  permissions: ['*'],
  profile: {
    id: 1,
    userId: 1,
    profilePhoto: null,
    address: 'E-Taxwala HQ, Pune',
    dob: '1990-01-01',
    position: 'Executive Director',
    about: 'Administrator',
  },
};

const DEFAULT_CUSTOMER: Customer = {
  id: 101,
  leadId: 501,
  name: 'Rajesh Sharma',
  business: 'Apex Tech Solutions Pvt Ltd',
  email: 'rajesh@apextech.in',
  contact: '+91 98765 43210',
  service: 'Private Limited Company Registration',
  servicePrice: 7999,
  state: 'Maharashtra',
  city: 'Pune',
  addedBy: 1,
  companyId: 'comp-1',
  isPayment: true,
  isActive: true,
  isApprove: true,
  isPartner: 0,
  customerToken: 'demo-customer-token',
  date: '2026-02-15',
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // ─── Client defaults (preview enabled) ───────────────────────────────────
      customer: DEFAULT_CUSTOMER,
      customerToken: 'demo-customer-token',
      isCustomerAuthenticated: true,

      // ─── Staff defaults (authenticated default for immediate CRM preview) ───
      staffUser: DEFAULT_STAFF,
      staffToken: 'demo-staff-token',
      staffRefreshToken: 'demo-refresh-token',
      isStaffAuthenticated: true,
      activeRole: RoleType.SUPER_ADMIN,

      // ─── Client actions ───────────────────────────────────────────────────────
      loginCustomer: (customer, token) =>
        set({
          customer,
          customerToken: token,
          isCustomerAuthenticated: true,
        }),

      logoutCustomer: () =>
        set({
          customer: null,
          customerToken: null,
          isCustomerAuthenticated: false,
        }),

      // ─── Staff actions ────────────────────────────────────────────────────────
      loginStaff: (user, token, refreshToken) =>
        set({
          staffUser: user,
          staffToken: token,
          staffRefreshToken: refreshToken ?? null,
          isStaffAuthenticated: true,
          activeRole: user.role,
        }),

      setStaffRole: (role) =>
        set((state) => ({
          activeRole: role,
          staffUser: state.staffUser ? { ...state.staffUser, role } : null,
        })),

      setStaffToken: (token) =>
        set({ staffToken: token }),

      logoutStaff: () =>
        set({
          staffUser: null,
          staffToken: null,
          staffRefreshToken: null,
          isStaffAuthenticated: false,
          activeRole: RoleType.SALES_EMPLOYEE,
        }),
    }),
    {
      name: 'etaxwala-auth-storage',
      // Only persist essential fields — not derived UI state
      partialize: (state) => ({
        customer: state.customer,
        customerToken: state.customerToken,
        isCustomerAuthenticated: state.isCustomerAuthenticated,
        staffUser: state.staffUser,
        staffToken: state.staffToken,
        staffRefreshToken: state.staffRefreshToken,
        isStaffAuthenticated: state.isStaffAuthenticated,
        activeRole: state.activeRole,
      }),
    }
  )
);


