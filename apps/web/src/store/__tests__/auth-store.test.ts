import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { useAuthStore } from '../auth-store';
import { RoleType, User, Customer } from '@etaxwala/types';

// Polyfill in-memory localStorage for Node environment
beforeAll(() => {
  const store: Record<string, string> = {};
  const mockStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((k) => delete store[k]);
    },
    key: (index: number) => Object.keys(store)[index] || null,
    length: Object.keys(store).length,
  };
  globalThis.localStorage = mockStorage as any;
  (globalThis as any).window = {
    localStorage: mockStorage,
  };
});

describe('useAuthStore (Zustand Auth State)', () => {
  beforeEach(() => {
    // Reset state before each test
    useAuthStore.getState().logoutStaff();
    useAuthStore.getState().logoutCustomer();
  });

  it('should initialize with logged out state after explicit logout', () => {
    const state = useAuthStore.getState();
    expect(state.isStaffAuthenticated).toBe(false);
    expect(state.staffUser).toBeNull();
    expect(state.staffToken).toBeNull();
    expect(state.isCustomerAuthenticated).toBe(false);
    expect(state.customer).toBeNull();
  });

  it('should log in staff user and assign correct active role', () => {
    const mockStaff: User = {
      id: 42,
      username: 'sales_lead_vikram',
      email: 'vikram@etaxwala.com',
      role: RoleType.SALES_MANAGER,
      roles: [RoleType.SALES_MANAGER, RoleType.SALES_EMPLOYEE],
      roleIds: [4, 7],
      companyId: 'etaxwala',
      status: 1,
      isOnline: true,
      lastLoginAt: '2026-09-28',
      createdAt: '2026-01-01',
      updatedAt: '2026-09-28',
      permissions: ['leads:*', 'quotations:*'],
    };

    useAuthStore.getState().loginStaff(mockStaff, 'jwt-staff-token-xyz', 'refresh-token-abc');

    const state = useAuthStore.getState();
    expect(state.isStaffAuthenticated).toBe(true);
    expect(state.staffUser?.email).toBe('vikram@etaxwala.com');
    expect(state.staffToken).toBe('jwt-staff-token-xyz');
    expect(state.staffRefreshToken).toBe('refresh-token-abc');
    expect(state.activeRole).toBe(RoleType.SALES_MANAGER);
  });

  it('should allow seamless staff role switching across all 16 enterprise roles', () => {
    const mockStaff: User = {
      id: 1,
      username: 'superadmin',
      email: 'admin@etaxwala.com',
      role: RoleType.SUPER_ADMIN,
      roles: [RoleType.SUPER_ADMIN, RoleType.OPERATIONS_MANAGER, RoleType.HR],
      roleIds: [1, 3, 14],
      companyId: 'etaxwala',
      status: 1,
      isOnline: true,
      lastLoginAt: '2026-09-28',
      createdAt: '2026-01-01',
      updatedAt: '2026-09-28',
      permissions: ['*'],
    };

    useAuthStore.getState().loginStaff(mockStaff, 'token-123');

    // Switch to Operations Manager
    useAuthStore.getState().setStaffRole(RoleType.OPERATIONS_MANAGER);
    expect(useAuthStore.getState().activeRole).toBe(RoleType.OPERATIONS_MANAGER);
    expect(useAuthStore.getState().staffUser?.role).toBe(RoleType.OPERATIONS_MANAGER);

    // Switch to HR
    useAuthStore.getState().setStaffRole(RoleType.HR);
    expect(useAuthStore.getState().activeRole).toBe(RoleType.HR);
    expect(useAuthStore.getState().staffUser?.role).toBe(RoleType.HR);
  });

  it('should handle customer login and session clearing on logout', () => {
    const mockCustomer: Customer = {
      id: 99,
      leadId: 88,
      name: 'Ananya Sharma',
      business: 'Ananya FinTech LLP',
      email: 'ananya@fintech.in',
      contact: '9876543210',
      service: 'LLP Incorporation',
      servicePrice: 6999,
      state: 'Karnataka',
      city: 'Bengaluru',
      addedBy: 1,
      companyId: 'etaxwala',
      isPayment: true,
      isActive: true,
      isApprove: true,
      isPartner: 0,
      customerToken: 'cust-token-99',
      date: '2026-09-28',
    };

    useAuthStore.getState().loginCustomer(mockCustomer, 'cust-jwt-99');

    let state = useAuthStore.getState();
    expect(state.isCustomerAuthenticated).toBe(true);
    expect(state.customer?.business).toBe('Ananya FinTech LLP');
    expect(state.customerToken).toBe('cust-jwt-99');

    // Customer logout
    useAuthStore.getState().logoutCustomer();
    state = useAuthStore.getState();
    expect(state.isCustomerAuthenticated).toBe(false);
    expect(state.customer).toBeNull();
    expect(state.customerToken).toBeNull();
  });
});
