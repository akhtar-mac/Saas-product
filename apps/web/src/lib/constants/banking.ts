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

export const OFFICIAL_COMPANY_NAME = 'ETaxwala Business Solution Pvt Ltd';

export const OFFICIAL_UPI_DETAILS = {
  primaryUpiId: 'etaxwalabusiness@icici',
  secondaryUpiId: 'etaxwala@hdfcbank',
  merchantName: 'ETaxwala Business Solution Pvt Ltd',
  phone: '+91 70710 70707',
};

export const OFFICIAL_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'hdfc',
    bankName: 'HDFC Bank Ltd',
    accountName: OFFICIAL_COMPANY_NAME,
    accountNumber: '50200084729118',
    ifsc: 'HDFC0001811',
    branch: 'Beed Bypass Road, Chhatrapati Sambhaji Nagar',
    accountType: 'Corporate Current Account',
    upiId: 'etaxwala@hdfcbank',
    badge: 'Fastest RTGS / NEFT',
    color: '#004C8F',
  },
  {
    id: 'icici',
    bankName: 'ICICI Bank Ltd',
    accountName: OFFICIAL_COMPANY_NAME,
    accountNumber: '034205009823',
    ifsc: 'ICIC0000342',
    branch: 'Jalna Road Commercial Hub, CSN',
    accountType: 'Corporate Current Account',
    upiId: 'etaxwalabusiness@icici',
    badge: 'Instant IMPS Recon',
    color: '#B02A30',
  },
  {
    id: 'sbi',
    bankName: 'State Bank of India (SBI)',
    accountName: OFFICIAL_COMPANY_NAME,
    accountNumber: '39820145892',
    ifsc: 'SBIN0001716',
    branch: 'Kranti Chowk Main Branch, CSN',
    accountType: 'Current Account',
    upiId: 'etaxwalasbi@sbi',
    badge: 'Govt & Institutional',
    color: '#1A5276',
  },
  {
    id: 'axis',
    bankName: 'Axis Bank Ltd',
    accountName: OFFICIAL_COMPANY_NAME,
    accountNumber: '923020048129301',
    ifsc: 'UTIB0000182',
    branch: 'Town Centre, CIDCO, CSN',
    accountType: 'Corporate Current Account',
    color: '#97144D',
  },
  {
    id: 'kotak',
    bankName: 'Kotak Mahindra Bank',
    accountName: OFFICIAL_COMPANY_NAME,
    accountNumber: '7812903841',
    ifsc: 'KKBK0000691',
    branch: 'Nirala Bazar Branch, CSN',
    accountType: 'Current Account',
    color: '#ED1C24',
  },
  {
    id: 'bob',
    bankName: 'Bank of Baroda',
    accountName: OFFICIAL_COMPANY_NAME,
    accountNumber: '18420200001923',
    ifsc: 'BARB0AURANG',
    branch: 'Samarth Nagar Branch, CSN',
    accountType: 'Current Account',
    color: '#F26522',
  },
  {
    id: 'pnb',
    bankName: 'Punjab National Bank (PNB)',
    accountName: OFFICIAL_COMPANY_NAME,
    accountNumber: '0842002100039124',
    ifsc: 'PUNB0084200',
    branch: 'Station Road Branch, CSN',
    accountType: 'Current Account',
    color: '#A21D21',
  },
  {
    id: 'canara',
    bankName: 'Canara Bank',
    accountName: OFFICIAL_COMPANY_NAME,
    accountNumber: '120001849201',
    ifsc: 'CNRB0000842',
    branch: 'Mondha Road Branch, CSN',
    accountType: 'Current Account',
    color: '#0083CA',
  },
  {
    id: 'union',
    bankName: 'Union Bank of India',
    accountName: OFFICIAL_COMPANY_NAME,
    accountNumber: '320101010038472',
    ifsc: 'UBIN0532011',
    branch: 'Adalat Road Branch, CSN',
    accountType: 'Current Account',
    color: '#0D47A1',
  },
  {
    id: 'indusind',
    bankName: 'IndusInd Bank Ltd',
    accountName: OFFICIAL_COMPANY_NAME,
    accountNumber: '250019284712',
    ifsc: 'INDB0000318',
    branch: 'Jalna Road Commercial Hub, CSN',
    accountType: 'Current Account',
    color: '#84191C',
  },
];
