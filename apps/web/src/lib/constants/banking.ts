export interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  ifsc: string;
  branch: string;
  accountType: 'Current Account' | 'Corporate Current Account';
  upiId?: string;
  badge?: string;
  color: string;
}

/** Neutral placeholder. Real accounts come from workspace settings, not this file. */
export const OFFICIAL_COMPANY_NAME = 'Your Company';

export const OFFICIAL_UPI_DETAILS = {
  primaryUpiId: '',
  secondaryUpiId: '',
  merchantName: 'Your Company',
  phone: '',
};

export const OFFICIAL_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'unconfigured',
    bankName: 'No bank configured',
    accountName: 'Add accounts in Admin settings',
    accountNumber: '—',
    ifsc: '—',
    branch: '—',
    accountType: 'Current Account',
    badge: 'Not configured',
    color: '#1E3A8A',
  },
];
