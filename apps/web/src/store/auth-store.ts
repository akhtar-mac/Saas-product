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

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // ─── Client defaults (unauthenticated) ───────────────────────────────────
      customer: null,
      customerToken: null,
      isCustomerAuthenticated: false,

      // ─── Staff defaults (unauthenticated) ────────────────────────────────────
      staffUser: null,
      staffToken: null,
      staffRefreshToken: null,
      isStaffAuthenticated: false,
      activeRole: RoleType.SALES_EMPLOYEE, // default fallback (overwritten on login)

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


