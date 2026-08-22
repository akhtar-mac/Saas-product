// ETaxwala 2.0 — Service Catalog Data (250+ services with pricing)
// Extracted from current client portal (customer-all-services page)

export interface ServiceItem {
  id: number;
  name: string;
  slug: string;
  category: string;
  price: number;
  inclusions: string[];
  description?: string;
  isFeatured?: boolean;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  color: string;
}

// ═══════════════════════════════════════════
// CATEGORIES (8)
// ═══════════════════════════════════════════

export const categories: CategoryItem[] = [
  { id: 'registration', name: 'Business Registration', slug: 'registration', icon: 'Building2', description: 'Company incorporation: Pvt Ltd, LLP, OPC, Partnership, Section 8, more', color: 'from-blue-500 to-blue-600' },
  { id: 'other-registrations', name: 'Other Registrations', slug: 'other-registrations', icon: 'FileBadge', description: 'GST, MSME, FSSAI, IEC, Professional Tax, DSC, Trade License', color: 'from-emerald-500 to-emerald-600' },
  { id: 'taxation', name: 'Taxation & Return Filing', slug: 'taxation', icon: 'Receipt', description: 'ITR, GST Return, TDS, EPFO/ESIC, Tax Audit, CMA, DPR', color: 'from-purple-500 to-purple-600' },
  { id: 'audit', name: 'Audit & Compliances', slug: 'audit', icon: 'ClipboardCheck', description: 'Statutory audit for Pvt Ltd, LLP, OPC, Section 8, Co-op', color: 'from-rose-500 to-rose-600' },
  { id: 'consultancy', name: 'Business Consultancy', slug: 'consultancy', icon: 'Lightbulb', description: 'CFO, HR/Payroll, Funding, Automation, Growth Strategy', color: 'from-amber-500 to-amber-600' },
  { id: 'ip', name: 'IP & Trademark', slug: 'ip', icon: 'FileBadge', description: 'Trademark, Copyright, Patent, Design, ISO', color: 'from-cyan-500 to-cyan-600' },
  { id: 'marketing', name: 'Marketing & Branding', slug: 'marketing', icon: 'Sparkles', description: 'Logo, Website, Mobile App, SEO, Social Media, Influencer', color: 'from-pink-500 to-pink-600' },
  { id: 'legal', name: 'Legal Documentation', slug: 'legal', icon: 'FileText', description: 'Agreements, Deeds, Contracts, MoU, NDA, Shareholders', color: 'from-indigo-500 to-indigo-600' },
];

// ═══════════════════════════════════════════
// SERVICES (250+)
// ═══════════════════════════════════════════

let _id = 0;
const next = () => ++_id;

export const services: ServiceItem[] = [
  // ── Business Registration (9) ──
  { id: next(), name: 'Partnership Firm Registration', slug: 'partnership-firm', category: 'registration', price: 14999, isFeatured: true, inclusions: ['Partnership Deed Drafting', 'Free Expert Advice', 'PAN Card Apply', 'Continuous legal support'] },
  { id: next(), name: 'One Person Company Registration', slug: 'opc', category: 'registration', price: 16499, inclusions: ['Free Name Search', '2 DSC', '1 DIN', 'Incorporation certificate', 'MOA & AOA', 'PAN & TAN', 'Shares Certificate', 'Bank A/C docs'] },
  { id: next(), name: 'Private Limited Company Registration', slug: 'private-limited', category: 'registration', price: 16499, isFeatured: true, inclusions: ['Name Search & Approval', 'Up to 1L authorized capital', '2 DSC', 'DIN for 2 Directors', 'Incorporation Certificate', 'MOA & AOA', 'PAN & TAN', 'Shares Certificate', 'Bank A/C docs', 'Continuous Legal Support'] },
  { id: next(), name: 'Limited Liability Partnership (LLP) Registration', slug: 'llp', category: 'registration', price: 16499, inclusions: ['Name Search & Approval', 'DSC for 2 Partners', 'DPIN for 2 Partners', 'PAN & TAN', 'Incorporation Certificate', 'LLP Agreement', 'Master file + Bank docs'] },
  { id: next(), name: 'Section 8 Company NGO Registration', slug: 'section-8-ngo', category: 'registration', price: 16499, inclusions: ['Name Search', 'Up to 5L authorized capital', '2 DSC', '2 DIN', 'Incorporation Certificate', 'MOA & AOA', 'PAN & TAN', 'Registration kit', 'Shares Certificate'] },
  { id: next(), name: 'Producer Company Registration', slug: 'producer-company', category: 'registration', price: 29999, inclusions: ['Free Name Search', '10 DSC', '5 DIN', 'Incorporation certificate', 'MOA & AOA', 'PAN & TAN', 'Shares Certificate', 'Bank A/C docs'] },
  { id: next(), name: 'Public Limited Company Registration', slug: 'public-limited', category: 'registration', price: 58999, inclusions: ['Name Search & Approval', '7 DSC', '3 DIN', '10L Authorized Capital', 'PAN & TAN', 'Incorporation Certificate', 'Shares Certificate', 'MOA & AOA'] },
  { id: next(), name: 'Indian Subsidiary Company Registration', slug: 'indian-subsidiary', category: 'registration', price: 29999, inclusions: ['Name search & approval', 'Up to 10L authorized capital', '2 DSC', '2 DIN', 'Incorporation Fees', 'Certificate of Incorporation', 'PAN & TAN', 'Shares Certificate'] },
  { id: next(), name: 'Subsidiary Company Registration', slug: 'subsidiary-company', category: 'registration', price: 29999, inclusions: ['Company formation', 'Statutory compliance'] },

  // ── Credit Co-op / Microfinance (special registrations) ──
  { id: next(), name: 'Microfinance Company (Section 8) Registration', slug: 'microfinance-section-8', category: 'registration', price: 199999, inclusions: ['2 DSC', 'DIN for 2 Directors', 'Incorporation', 'MOA & AOA', 'PAN & TAN', 'Shares Certificate', 'Section 8 Registration', 'Fintech advisory', 'Legal Advisory'] },
  { id: next(), name: 'Peer-to-Peer Lending Company Registration', slug: 'p2p-lending', category: 'registration', price: 199999, inclusions: ['Incorporation', 'Document drafting', 'Application filing', 'RBI submission', 'RBI analysis', 'P2P License grant'] },
  { id: next(), name: 'Credit Co-Operative Society (Taluka Level) Registration', slug: 'credit-coop-taluka', category: 'registration', price: 299999, inclusions: ['Name Search & Approval', 'Bylaws Preparation', 'Resolution Preparation', 'Proposal Preparation', 'Registration Certificate', 'PAN & TAN', 'Registration Kit', 'Shares Certificate', 'Bank A/C docs'] },
  { id: next(), name: 'Credit Co-Operative Society (District Level) Registration', slug: 'credit-coop-district', category: 'registration', price: 399999, isFeatured: true, inclusions: ['Name Search & Approval', 'Bylaws Preparation', 'Resolution Preparation', 'Proposal Preparation', 'Registration Certificate', 'PAN & TAN', 'Registration Kit', 'Shares Certificate', 'Bank A/C docs'] },
  { id: next(), name: 'Multi State Credit Co-Operative Society Registration', slug: 'multistate-credit-coop', category: 'registration', price: 3999999, inclusions: ['Name Search & Approval', 'Bylaws Preparation', 'Resolution Preparation', 'Proposal Preparation', 'NOC Proposal (2 States)', 'Registration Certificate', 'PAN & TAN', 'Registration Kit', 'Shares Certificate'] },
  { id: next(), name: 'Multi State Cooperative Society Registration', slug: 'multistate-cooperative', category: 'registration', price: 3999999, inclusions: ['Multi-state registration', 'Bylaws', 'PAN & TAN'] },

  // ── Other Registrations (10) ──
  { id: next(), name: 'Shop Act Registration', slug: 'shop-act', category: 'other-registrations', price: 999, inclusions: ['Shop & Establishment Registration', 'Free Expert support'] },
  { id: next(), name: 'MSME Registration', slug: 'msme', category: 'other-registrations', price: 999, isFeatured: true, inclusions: ['MSME Registration', 'Experts advice'] },
  { id: next(), name: 'GST Registration (Regular)', slug: 'gst-regular', category: 'other-registrations', price: 4999, isFeatured: true, inclusions: ['GST Registration (Regular)', 'Free Expert Support'] },
  { id: next(), name: 'GST Registration (Composition)', slug: 'gst-composition', category: 'other-registrations', price: 4999, inclusions: ['GST Registration (Composition)', 'Free Expert Support'] },
  { id: next(), name: 'GST Registration for International Businesses', slug: 'gst-international', category: 'other-registrations', price: 16999, inclusions: ['GST for International Businesses'] },
  { id: next(), name: 'Startup India Registration', slug: 'startup-india', category: 'other-registrations', price: 7999, inclusions: ['Startup India Registration', 'Free Expert Support'] },
  { id: next(), name: 'FSSAI Registration (Basic)', slug: 'fssai-basic', category: 'other-registrations', price: 1499, inclusions: ['Basic FSSAI Registration (1 year)'] },
  { id: next(), name: 'FSSAI Registration (State)', slug: 'fssai-state', category: 'other-registrations', price: 14999, inclusions: ['State FSSAI Registration (1 year)'] },
  { id: next(), name: 'FSSAI Registration (Central)', slug: 'fssai-central', category: 'other-registrations', price: 24999, inclusions: ['Central FSSAI Registration (1 year)'] },
  { id: next(), name: 'Import Export Code Registration', slug: 'import-export-code', category: 'other-registrations', price: 2999, inclusions: ['IEC Registration', 'DSC included (All Inclusive)'] },
  { id: next(), name: 'EPFO ESIC Registration', slug: 'epfo-esic', category: 'other-registrations', price: 9999, inclusions: ['PF Registration', 'ESIC Registration', 'Expert Advice'] },
  { id: next(), name: '80G 12A Registration', slug: '80g-12a', category: 'other-registrations', price: 11999, inclusions: ['Consultation', '12A Application Drafting', '80G Application Drafting', 'Filing & Follow-up', '12A and 80G Certificate'] },
  { id: next(), name: 'Professional Tax Registration', slug: 'professional-tax', category: 'other-registrations', price: 4999, inclusions: ['Professional Tax Registration (< 20 employees)'] },
  { id: next(), name: 'TAN Registration', slug: 'tan-registration', category: 'other-registrations', price: 999, inclusions: ['TAN Registration', 'Free Experts Support'] },
  { id: next(), name: 'Digital Signature (Signing Only)', slug: 'dsc-signing', category: 'other-registrations', price: 1999, inclusions: ['Class 3 DSC for Signing (All Inclusive)'] },
  { id: next(), name: 'Digital Signature (Signing + Encryption)', slug: 'dsc-signing-encryption', category: 'other-registrations', price: 2999, inclusions: ['Class 3 DSC for Signing + Encryption (All Inclusive)'] },
  { id: next(), name: 'PSARA License (One District)', slug: 'psara-license', category: 'other-registrations', price: 19999, inclusions: ['PSARA License for One District', 'Expert support'] },
  { id: next(), name: 'NITI Ayog DARPAN Certificate', slug: 'niti-ayog-darpan', category: 'other-registrations', price: 2999, inclusions: ['Consultation', 'Application Drafting', 'Filing & Follow-up', 'DARPAN Certificate'] },
  { id: next(), name: 'Trade License', slug: 'trade-license', category: 'other-registrations', price: 9999, inclusions: ['Trade License for one business'] },
  { id: next(), name: 'AGMARK Certification', slug: 'agmark', category: 'other-registrations', price: 19999, inclusions: ['Consultation', 'Application Drafting', 'Filing & Follow-up', 'AGMARK Certificate'] },
  { id: next(), name: 'RCMC Certification', slug: 'rcmc', category: 'other-registrations', price: 15499, inclusions: ['Consultation', 'Application Drafting', 'Filing & Follow-up', 'RCMC Certificate'] },
  { id: next(), name: 'RERA Registration', slug: 'rera', category: 'other-registrations', price: 19999, inclusions: ['Consultation', 'Documentation', 'Filing & Follow-up', 'RERA Certificate'] },
  { id: next(), name: 'ISO Certification', slug: 'iso-certification', category: 'other-registrations', price: 9999, inclusions: ['Application Drafting', 'Policy Standards', 'Certificate issue', 'ISO 9001:2015'] },
  { id: next(), name: 'FCRA Registration', slug: 'fcra', category: 'other-registrations', price: 24999, inclusions: ['Consultation', 'Documentation', 'Filing & Follow-up', 'FCRA Certificate'] },
  { id: next(), name: 'FFMC License', slug: 'ffmc', category: 'other-registrations', price: 19999, inclusions: ['Consultation', 'Documentation', 'Filing & Follow-up', 'FFMC Licence'] },
  { id: next(), name: 'RWA Registration', slug: 'rwa', category: 'other-registrations', price: 4999, inclusions: ['Consultation', 'Documentation', 'Filing & Follow-up', 'RWA Registration'] },
  { id: next(), name: 'Drug License', slug: 'drug-license', category: 'other-registrations', price: 24999, inclusions: ['Drug license for retail', 'Free Experts Support'] },
  { id: next(), name: 'APEDA Registration', slug: 'apeda', category: 'other-registrations', price: 11999, inclusions: ['APEDA Registration', 'Expert Advice'] },
  { id: next(), name: 'BIS Registration', slug: 'bis', category: 'other-registrations', price: 14999, inclusions: ['BIS Registration'] },
  { id: next(), name: 'E-Anudan Certificate', slug: 'e-anudan', category: 'other-registrations', price: 4999, inclusions: ['E-Anudan Certificate'] },
  { id: next(), name: 'ARIBA ID (ANID Number)', slug: 'ariba-id', category: 'other-registrations', price: 9999, inclusions: ['ARIBA ID Registration'] },
  { id: next(), name: 'LEI Certificate', slug: 'lei-certificate', category: 'other-registrations', price: 4999, inclusions: ['LEI Certificate'] },
  { id: next(), name: 'PTEC Registration', slug: 'ptec', category: 'other-registrations', price: 2999, inclusions: ['PTEC Registration'] },
  { id: next(), name: 'PASARA Training Certificate', slug: 'pasara-training', category: 'other-registrations', price: 4999, inclusions: ['PASARA Training'] },
  { id: next(), name: 'PSARA (State) License', slug: 'psara-state', category: 'other-registrations', price: 39999, inclusions: ['PSARA State License'] },
  { id: next(), name: 'VAT Registration', slug: 'vat', category: 'other-registrations', price: 9999, inclusions: ['VAT Registration'] },

  // ── Taxation & Return Filing ──
  { id: next(), name: 'Income Tax Return (Salary Income)', slug: 'itr-salary', category: 'taxation', price: 499, isFeatured: true, inclusions: ['Income from Salary', 'All Inclusive'] },
  { id: next(), name: 'Income Tax Return (Business & Professional)', slug: 'itr-business', category: 'taxation', price: 1999, inclusions: ['Business & Professional Income (Non-Audit)', 'Other Sources', 'Agriculture Income', 'Salary Income', 'Rental Income'] },
  { id: next(), name: 'Income Tax Return (Capital Gains)', slug: 'itr-capital-gains', category: 'taxation', price: 2999, inclusions: ['Capital Gain Income', 'Business & Professional', 'Other Sources', 'Agriculture', 'Salary', 'Rental'] },
  { id: next(), name: 'Income Tax Return (F&O Income)', slug: 'itr-fno', category: 'taxation', price: 2999, inclusions: ['F&O Income/Loss (Non-Audit)', 'Speculative Income', 'Capital Gains', 'Other Sources', 'Business Income', 'Agriculture', 'Salary', 'Rental'] },
  { id: next(), name: 'Income Tax Return (Crypto Income)', slug: 'itr-crypto', category: 'taxation', price: 3999, inclusions: ['Crypto Income', 'F&O Income', 'Speculative Income', 'Capital Gains', 'Business Income', 'Other Sources', 'Agriculture', 'Salary', 'Rental'] },
  { id: next(), name: 'Income Tax Return (Foreign Income)', slug: 'itr-foreign', category: 'taxation', price: 3999, inclusions: ['Foreign Salary (incl. Tax Relief)', 'DTAA Tax Relief', 'Capital Gains', 'RSU/ESOP', 'Business Income', 'Crypto', 'F&O', 'Speculative', 'Other Sources', 'Agriculture', 'Salary', 'Rental'] },
  { id: next(), name: 'Income Tax Return (Salary + Other Income)', slug: 'itr-salary-other', category: 'taxation', price: 999, inclusions: ['Salary + Other Income'] },
  { id: next(), name: 'Trust ITR Filing (ITR7)', slug: 'itr-trust', category: 'taxation', price: 4999, inclusions: ['Trust ITR (ITR7)'] },
  { id: next(), name: 'Income Tax Notice Response', slug: 'it-notice-response', category: 'taxation', price: 3999, inclusions: ['Tax Expert Consultation', 'Notice Response', 'Revised Return Filing', 'Document submission'] },
  { id: next(), name: 'Income Tax Refund (10%)', slug: 'itr-refund', category: 'taxation', price: 0, inclusions: ['Refund assistance (10% of refund amount)'] },
  { id: next(), name: 'Balance Sheet and P&L (CA Certified)', slug: 'balance-sheet-ca', category: 'taxation', price: 999, inclusions: ['CA Certified Balance Sheet & P&L'] },
  { id: next(), name: 'Balance Sheet and P&L Preparation', slug: 'balance-sheet-prep', category: 'taxation', price: 4999, inclusions: ['Balance Sheet Preparation', 'P&L Preparation'] },
  { id: next(), name: 'Income Tax CA Advisory', slug: 'it-ca-advisory', category: 'taxation', price: 1999, inclusions: ['Zoom Meeting Consultation with CA'] },
  { id: next(), name: 'ITR Verification CA Certified (1 Year)', slug: 'itr-verification-1yr', category: 'taxation', price: 2999, inclusions: ['ITR Verification CA Certified (1 Year)'] },
  { id: next(), name: 'ITR Verification CA Certified (3 Year)', slug: 'itr-verification-3yr', category: 'taxation', price: 7999, inclusions: ['ITR Verification CA Certified (3 Year)'] },
  { id: next(), name: 'CA Attestation With UDIN', slug: 'ca-attestation-udin', category: 'taxation', price: 1999, inclusions: ['CA Attestation with UDIN'] },
  { id: next(), name: 'CS Certification with UDIN', slug: 'cs-certification-udin', category: 'taxation', price: 1999, inclusions: ['CS Certification with UDIN'] },
  { id: next(), name: 'Net Worth Certificate', slug: 'net-worth-certificate', category: 'taxation', price: 4999, inclusions: ['Net Worth Certificate'] },
  { id: next(), name: 'Turnover Certificate', slug: 'turnover-certificate', category: 'taxation', price: 4999, inclusions: ['Turnover Certificate'] },
  { id: next(), name: 'Projected Balance Sheet', slug: 'projected-balance-sheet', category: 'taxation', price: 4999, inclusions: ['Projected Balance Sheet'] },

  // ── GST Returns ──
  { id: next(), name: 'GST Return Filing Monthly (Nil) — 1 Year', slug: 'gst-return-monthly-nil', category: 'taxation', price: 5999, inclusions: ['Monthly Return Filing (12 Month)', 'All GST Returns'] },
  { id: next(), name: 'GST Return Filing Monthly (10 Bills + Accounting) — 1 Year', slug: 'gst-return-monthly-10', category: 'taxation', price: 9999, inclusions: ['Monthly Filing (12 Month)', 'All GST Returns', 'Accounting Included'] },
  { id: next(), name: 'GST Return Filing Monthly (50 Bills + Accounting) — 1 Year', slug: 'gst-return-monthly-50', category: 'taxation', price: 17999, inclusions: ['Monthly Filing (12 Month)', 'All GST Returns', 'Accounting Included'] },
  { id: next(), name: 'GST Return Filing Monthly (100 Bills + Accounting) — 1 Year', slug: 'gst-return-monthly-100', category: 'taxation', price: 23999, inclusions: ['Monthly Filing (12 Month)', 'All GST Returns', 'Accounting Included'] },
  { id: next(), name: 'GST Return Filing Monthly (200 Bills + Accounting) — 1 Year', slug: 'gst-return-monthly-200', category: 'taxation', price: 35999, inclusions: ['Monthly Filing (12 Month)', 'All GST Returns', 'Accounting Included'] },
  { id: next(), name: 'GST Return Filing Quarterly (Nil) — 4 Qrtr', slug: 'gst-return-quarterly-nil', category: 'taxation', price: 5999, inclusions: ['Quarterly Filing (4 Quarter)', 'All GST Returns'] },
  { id: next(), name: 'GST Return Filing Quarterly (10 Bills) — 4 Qrtr', slug: 'gst-return-quarterly-10', category: 'taxation', price: 9999, inclusions: ['Quarterly Filing (4 Quarter)', 'All GST Returns', 'Accounting Included'] },
  { id: next(), name: 'GST Return Filing Quarterly (50 Bills) — 4 Qrtr', slug: 'gst-return-quarterly-50', category: 'taxation', price: 17999, inclusions: ['Quarterly Filing (4 Quarter)', 'All GST Returns', 'Accounting Included'] },
  { id: next(), name: 'GST Return Filing Quarterly (100 Bills) — 1 Year', slug: 'gst-return-quarterly-100', category: 'taxation', price: 23999, inclusions: ['Quarterly Filing (1 Year)', 'All GST Returns', 'Accounting Included'] },
  { id: next(), name: 'GST Return Filing Quarterly (200 Bills) — 1 Year', slug: 'gst-return-quarterly-200', category: 'taxation', price: 35999, inclusions: ['Quarterly Filing (1 Year)', 'All GST Returns', 'Accounting Included'] },
  { id: next(), name: 'GST Return Filing Monthly (Without Accounting) — 1 Year', slug: 'gst-return-monthly-no-acct', category: 'taxation', price: 9999, inclusions: ['Monthly Filing (1 Year)', 'Without Accounting'] },
  { id: next(), name: 'GST Return Filing Quarterly (Without Accounting) — 1 Year', slug: 'gst-return-quarterly-no-acct', category: 'taxation', price: 9999, inclusions: ['Quarterly Filing (1 Year)', 'Without Accounting'] },
  { id: next(), name: 'GST Assessment and Notice Reply', slug: 'gst-assessment', category: 'taxation', price: 9999, inclusions: ['GST Assessment', 'Notice Reply'] },
  { id: next(), name: 'VAT Assessment', slug: 'vat-assessment', category: 'taxation', price: 9999, inclusions: ['VAT Assessment'] },
  { id: next(), name: 'Cancel GST Registration (No Activities)', slug: 'cancel-gst-no-activity', category: 'taxation', price: 1999, inclusions: ['GST Cancellation (no activities)', 'Tax Expert Support'] },
  { id: next(), name: 'Cancel GST Registration (With Return Filing)', slug: 'cancel-gst-with-filing', category: 'taxation', price: 3999, inclusions: ['GST Cancellation', 'Last GST Return Filing', 'Tax Expert Support'] },

  // ── Other Returns ──
  { id: next(), name: 'Professional Tax Return Filing (Up to 20 Employees)', slug: 'prof-tax-return', category: 'taxation', price: 2999, inclusions: ['Professional Tax Return (up to 20 employees)'] },
  { id: next(), name: 'TDS Return Filing (4 Qrtrs, 5 Records)', slug: 'tds-return', category: 'taxation', price: 4999, inclusions: ['TDS Return (4 Quarters, up to 5 records)'] },
  { id: next(), name: 'Form 16 Preparation Per Employee', slug: 'form-16', category: 'taxation', price: 99, inclusions: ['Form 16 per employee'] },
  { id: next(), name: 'EPFO ESIC Return (12 Month, 5 Employees)', slug: 'epfo-esic-return-5', category: 'taxation', price: 4999, inclusions: ['EPFO ESIC Return (12 months, up to 5 employees)'] },
  { id: next(), name: 'EPFO ESIC Return (12 Month, 20 Employees)', slug: 'epfo-esic-return-20', category: 'taxation', price: 9999, inclusions: ['EPFO ESIC Return (12 months, up to 20 employees)'] },
  { id: next(), name: 'PTEC AND PTRC Return Filing', slug: 'ptec-ptrc-return', category: 'taxation', price: 2999, inclusions: ['PTEC + PTRC Return Filing'] },
  { id: next(), name: 'Director KYC DIR-3 KYC', slug: 'director-kyc', category: 'taxation', price: 999, inclusions: ['DIR-3 KYC Filing'] },
  { id: next(), name: 'LLP Annual Return Form-11', slug: 'llp-form-11', category: 'taxation', price: 2499, inclusions: ['LLP Annual Return (Form-11)'] },
  { id: next(), name: 'eForm DPT-3', slug: 'dpt-3', category: 'taxation', price: 2999, inclusions: ['DPT-3 Filing'] },
  { id: next(), name: 'eForm INC-20A', slug: 'inc-20a', category: 'taxation', price: 1999, inclusions: ['INC-20A Filing'] },
  { id: next(), name: 'CSR 1 Form Filing', slug: 'csr-1-form', category: 'taxation', price: 2999, inclusions: ['CSR-1 Form Filing'] },

  // ── Tax Audit ──
  { id: next(), name: 'Tax Audit (With Accounting)', slug: 'tax-audit-with-acct', category: 'taxation', price: 39999, isFeatured: true, inclusions: ['Tax Audit with Accounting (Turnover up to 2 Cr)'] },
  { id: next(), name: 'Tax Audit (Without Accounting)', slug: 'tax-audit-without-acct', category: 'taxation', price: 24999, inclusions: ['Tax Audit without Accounting'] },

  // ── Reports ──
  { id: next(), name: 'CMA Report Preparation', slug: 'cma-report', category: 'taxation', price: 9999, inclusions: ['CMA Report Preparation'] },
  { id: next(), name: 'Detailed Project Report (DPR)', slug: 'dpr', category: 'taxation', price: 14999, inclusions: ['Detailed Project Report'] },
  { id: next(), name: 'Project Report', slug: 'project-report', category: 'taxation', price: 4999, inclusions: ['Project Report'] },

  // ── Accounting ──
  { id: next(), name: 'Accounting & Book Keeping (10 Bills/month) — 1 Year', slug: 'acct-10-bills', category: 'taxation', price: 9999, inclusions: ['Accounting (10 bills/month, 1 year)'] },
  { id: next(), name: 'Accounting & Book Keeping (50 Bills/month) — 1 Year', slug: 'acct-50-bills', category: 'taxation', price: 17999, inclusions: ['Accounting (50 bills/month, 1 year)'] },
  { id: next(), name: 'Accounting & Book Keeping (100 Bills/month) — 1 Year', slug: 'acct-100-bills', category: 'taxation', price: 23999, inclusions: ['Accounting (100 bills/month, 1 year)'] },
  { id: next(), name: 'Accounting & Book Keeping (200 Bills/month) — 1 Year', slug: 'acct-200-bills', category: 'taxation', price: 35999, inclusions: ['Accounting (200 bills/month, 1 year)'] },

  // ── Audit & Compliances (9) ──
  { id: next(), name: 'Public Ltd Company Audit & Compliances', slug: 'audit-public-ltd', category: 'audit', price: 49999, inclusions: ['Statutory Audit', 'Annual Compliances', 'Filing'] },
  { id: next(), name: 'Section 8 Company Audit & Compliances', slug: 'audit-section-8', category: 'audit', price: 24999, inclusions: ['Statutory Audit', 'Annual Compliances'] },
  { id: next(), name: 'Producer Company Audit & Compliances', slug: 'audit-producer', category: 'audit', price: 29999, inclusions: ['Statutory Audit', 'Annual Compliances'] },
  { id: next(), name: 'LLP Audit & Compliances', slug: 'audit-llp', category: 'audit', price: 14999, inclusions: ['LLP Audit', 'Annual Compliances'] },
  { id: next(), name: 'OPC Company Audit & Compliances', slug: 'audit-opc', category: 'audit', price: 14999, inclusions: ['OPC Audit', 'Annual Compliances'] },
  { id: next(), name: 'Pvt Ltd Company Audit & Compliances', slug: 'audit-pvt-ltd', category: 'audit', price: 19999, isFeatured: true, inclusions: ['Statutory Audit', 'Annual Compliances', 'Filing'] },
  { id: next(), name: 'Partnership Audit & Compliances', slug: 'audit-partnership', category: 'audit', price: 9999, inclusions: ['Partnership Audit', 'Compliances'] },
  { id: next(), name: 'Multi-State Audit & Compliances', slug: 'audit-multistate', category: 'audit', price: 49999, inclusions: ['Multi-State Audit', 'Compliances'] },
  { id: next(), name: 'Credit Co-Operative Society Audit & Compliances', slug: 'audit-credit-coop', category: 'audit', price: 49999, inclusions: ['Credit Co-op Audit', 'Compliances'] },
  { id: next(), name: 'Multi State Credit Co-Operative Audit & Compliances', slug: 'audit-multistate-credit-coop', category: 'audit', price: 99999, inclusions: ['Multi-State Credit Co-op Audit'] },
  { id: next(), name: 'Section 8 Microfinance Audit & Compliances', slug: 'audit-microfinance', category: 'audit', price: 39999, inclusions: ['Section 8 Microfinance Audit'] },
  { id: next(), name: 'Nidhi Company Audit & Compliances', slug: 'audit-nidhi', category: 'audit', price: 24999, inclusions: ['Nidhi Company Audit'] },
  { id: next(), name: 'Trust Audit', slug: 'audit-trust', category: 'audit', price: 9999, inclusions: ['Trust Audit'] },

  // ── IP & Trademark ──
  { id: next(), name: 'Trademark Application', slug: 'trademark-application', category: 'ip', price: 6999, isFeatured: true, inclusions: ['Name Search & Approval (1 class)', 'Expert Support', 'Application Preparation', 'Same Day Filing'] },
  { id: next(), name: 'Trademark Registration', slug: 'trademark-registration', category: 'ip', price: 19999, inclusions: ['Name Search (1 class)', 'Trademark Research', 'Application', 'Objection Reply', 'Hearing', 'Complete Support'] },
  { id: next(), name: 'Trademark Objection', slug: 'trademark-objection', category: 'ip', price: 3999, inclusions: ['Objection Reply Drafting', 'Filing', 'Expert Support', 'Same Day Filing'] },
  { id: next(), name: 'Trademark Renewal', slug: 'trademark-renewal', category: 'ip', price: 5999, inclusions: ['Renewal Application Drafting', 'Filing', 'Same Day Filing', 'Status Update'] },
  { id: next(), name: 'Trademark Assignment', slug: 'trademark-assignment', category: 'ip', price: 7999, inclusions: ['Assignment Deed Drafting', 'Application Preparation', 'Status Update'] },
  { id: next(), name: 'Trademark Opposition', slug: 'trademark-opposition', category: 'ip', price: 16999, inclusions: ['Opposition Notice Drafting', 'Filing', 'Notice to Applicant'] },
  { id: next(), name: 'Trademark Rectification', slug: 'trademark-rectification', category: 'ip', price: 11999, inclusions: ['Rectification Drafting & Filing', 'Expert Support', 'Status Update'] },
  { id: next(), name: 'Design Registration', slug: 'design-registration', category: 'ip', price: 19999, inclusions: ['Design Registration (1 article)', 'Expert Support'] },
  { id: next(), name: 'Copyright Registration', slug: 'copyright-registration', category: 'ip', price: 34999, inclusions: ['Application Preparation & Filing', 'Expert Support', 'Status Update'] },
  { id: next(), name: 'Provisional Patent Registration', slug: 'provisional-patent', category: 'ip', price: 14999, inclusions: ['Provisional Application', 'Expert Support'] },
  { id: next(), name: 'Patent Registration', slug: 'patent-registration', category: 'ip', price: 34999, inclusions: ['Complete Application', 'Drawings/Illustrations', 'Abstract & Claims vetting'] },

  // ── Consultancy (13) ──
  { id: next(), name: 'Business Consultancy', slug: 'business-consultancy', category: 'consultancy', price: 4999, isFeatured: true, inclusions: ['Business Consultation', 'Strategic Planning'] },
  { id: next(), name: 'CFO Services', slug: 'cfo-services', category: 'consultancy', price: 19999, inclusions: ['Virtual CFO', 'Financial Planning', 'Cash Flow Management'] },
  { id: next(), name: 'HR and Payroll Management', slug: 'hr-payroll', category: 'consultancy', price: 9999, inclusions: ['HR Setup', 'Payroll Processing', 'Compliance'] },
  { id: next(), name: 'Financial and Strategic Advisory', slug: 'financial-advisory', category: 'consultancy', price: 14999, inclusions: ['Financial Advisory', 'Strategic Planning'] },
  { id: next(), name: 'Startup Idea Generation', slug: 'startup-idea-generation', category: 'consultancy', price: 4999, inclusions: ['Iideation Workshop', 'Market Analysis'] },
  { id: next(), name: 'Startup Idea Validation', slug: 'startup-idea-validation', category: 'consultancy', price: 7999, inclusions: ['Idea Validation', 'Feasibility Study'] },
  { id: next(), name: 'Business Plan Preparation', slug: 'business-plan', category: 'consultancy', price: 9999, inclusions: ['Business Plan Document', 'Financial Projections'] },
  { id: next(), name: 'Startup Funding Consultancy', slug: 'startup-funding', category: 'consultancy', price: 14999, inclusions: ['Funding Strategy', 'Investor Pitch', 'Term Sheet Review'] },
  { id: next(), name: 'Team Building and Training', slug: 'team-building', category: 'consultancy', price: 9999, inclusions: ['Team Structure', 'Training Programs'] },
  { id: next(), name: 'Business Automation', slug: 'business-automation', category: 'consultancy', price: 19999, inclusions: ['Process Audit', 'Automation Setup', 'Software Recommendation'] },
  { id: next(), name: 'Business Growth Consultancy', slug: 'business-growth', category: 'consultancy', price: 19999, inclusions: ['Growth Strategy', 'Expansion Planning'] },
  { id: next(), name: 'Business Setup Consultancy', slug: 'business-setup', category: 'consultancy', price: 9999, inclusions: ['Setup Planning', 'Registration Guidance'] },
  { id: next(), name: 'Business Consultation and Handholding', slug: 'business-handholding', category: 'consultancy', price: 4999, inclusions: ['Consultation', 'Ongoing Support'] },
  { id: next(), name: 'NBFC Business Planning', slug: 'nbfc-planning', category: 'consultancy', price: 49999, inclusions: ['NBFC Business Plan'] },
  { id: next(), name: 'NBFC Business Consultancy', slug: 'nbfc-consultancy', category: 'consultancy', price: 49999, inclusions: ['NBFC Consultancy'] },
  { id: next(), name: 'MLM Business Consultancy', slug: 'mlm-consultancy', category: 'consultancy', price: 19999, inclusions: ['MLM Business Consultancy'] },
  { id: next(), name: 'Banking / Finance Business Training', slug: 'banking-finance-training', category: 'consultancy', price: 19999, inclusions: ['Banking/Finance Training'] },
  { id: next(), name: 'Entrepreneurship Development Program', slug: 'entrepreneurship-dev', category: 'consultancy', price: 9999, inclusions: ['Entrepreneurship Program'] },
  { id: next(), name: 'CSR Fund Consultancy', slug: 'csr-fund', category: 'consultancy', price: 19999, inclusions: ['CSR Fund Consultancy'] },
  { id: next(), name: 'Acquisition of Company', slug: 'acquisition-company', category: 'consultancy', price: 49999, inclusions: ['Acquisition Advisory'] },
  { id: next(), name: 'Marketing Strategy Preparation', slug: 'marketing-strategy', category: 'consultancy', price: 14999, inclusions: ['Marketing Strategy'] },

  // ── Marketing & Branding ──
  { id: next(), name: 'Professional Logo Designing', slug: 'logo-design', category: 'marketing', price: 2999, isFeatured: true, inclusions: ['Logo Design', '3 Concepts', 'Unlimited Revisions'] },
  { id: next(), name: 'Website Development', slug: 'website-dev', category: 'marketing', price: 14999, isFeatured: true, inclusions: ['Responsive Website', '5 Pages', 'SEO Ready', '1 Month Support'] },
  { id: next(), name: 'Website Development (Introductory)', slug: 'website-dev-intro', category: 'marketing', price: 7999, inclusions: ['Basic Website', '3 Pages'] },
  { id: next(), name: 'Landing Page', slug: 'landing-page', category: 'marketing', price: 4999, inclusions: ['Single Landing Page', 'Lead Capture Form'] },
  { id: next(), name: 'Mobile App Development (Introductory)', slug: 'mobile-app-intro', category: 'marketing', price: 49999, inclusions: ['Mobile App (Android + iOS)', '5 Screens', 'API Integration'] },
  { id: next(), name: 'Google My Business Setup', slug: 'gmb-setup', category: 'marketing', price: 2999, inclusions: ['GMB Setup', 'Verification', 'Optimization'] },
  { id: next(), name: 'Social Media Marketing (12 Months)', slug: 'smm-12mo', category: 'marketing', price: 49999, inclusions: ['SMM (12 months)', 'Content Creation', 'Post Scheduling'] },
  { id: next(), name: 'Social Media Marketing (6 Months)', slug: 'smm-6mo', category: 'marketing', price: 29999, inclusions: ['SMM (6 months)'] },
  { id: next(), name: 'Social Media Marketing (3 Months)', slug: 'smm-3mo', category: 'marketing', price: 17999, inclusions: ['SMM (3 months)'] },
  { id: next(), name: 'Email Marketing', slug: 'email-marketing', category: 'marketing', price: 9999, inclusions: ['Email Campaign Setup', 'Template Design'] },
  { id: next(), name: 'SMS Marketing', slug: 'sms-marketing', category: 'marketing', price: 4999, inclusions: ['SMS Campaign'] },
  { id: next(), name: 'Influencer Marketing', slug: 'influencer-marketing', category: 'marketing', price: 29999, inclusions: ['Influencer Outreach', 'Campaign Management'] },
  { id: next(), name: 'WhatsApp Marketing (Official)', slug: 'whatsapp-marketing', category: 'marketing', price: 14999, inclusions: ['Official WhatsApp', 'Green Tick', 'Multi-user', 'Auto Update', 'CRM Integration'] },
  { id: next(), name: 'Affiliate Marketing', slug: 'affiliate-marketing', category: 'marketing', price: 19999, inclusions: ['Affiliate Program Setup'] },
  { id: next(), name: 'YouTube Video Editing (3 Long + 6 Shorts) — 12 Month', slug: 'youtube-editing-12', category: 'marketing', price: 49999, inclusions: ['YouTube Video Editing (12 months)'] },
  { id: next(), name: 'YouTube Video Editing (1 Long + 2 Shorts) — 3 Month', slug: 'youtube-editing-3', category: 'marketing', price: 14999, inclusions: ['YouTube Video Editing (3 months)'] },
  { id: next(), name: 'YouTube Video Editing (2 Long + 4 Shorts) — 6 Month', slug: 'youtube-editing-6', category: 'marketing', price: 29999, inclusions: ['YouTube Video Editing (6 months)'] },
  { id: next(), name: 'Automated Voice Marketing', slug: 'voice-marketing', category: 'marketing', price: 9999, inclusions: ['Voice Call Campaign'] },
  { id: next(), name: 'Website SEO (Up to 5 Keywords)', slug: 'website-seo', category: 'marketing', price: 19999, inclusions: ['SEO (5 keywords)', 'On-page + Off-page', 'Monthly Report'] },
  { id: next(), name: 'Paid Campaign Setup (2 Campaigns on 1 Platform)', slug: 'paid-campaign', category: 'marketing', price: 9999, inclusions: ['Paid Campaign Setup', 'Ad Copy', 'Targeting'] },
  { id: next(), name: 'Print Media Marketing', slug: 'print-marketing', category: 'marketing', price: 19999, inclusions: ['Print Media Campaign'] },
  { id: next(), name: 'Brand Ambassador Appointment', slug: 'brand-ambassador', category: 'marketing', price: 99999, inclusions: ['Brand Ambassador Setup'] },
  { id: next(), name: 'Celebrity Marketing', slug: 'celebrity-marketing', category: 'marketing', price: 199999, inclusions: ['Celebrity Endorsement'] },
  { id: next(), name: 'Professional Catalogue Designing', slug: 'catalogue-design', category: 'marketing', price: 7999, inclusions: ['Catalogue Design'] },
  { id: next(), name: 'Business Proposal Making', slug: 'business-proposal', category: 'marketing', price: 7999, inclusions: ['Business Proposal Document'] },
  { id: next(), name: 'Blog Writing and Publishing (Monthly 5 Blogs)', slug: 'blog-writing', category: 'marketing', price: 9999, inclusions: ['5 Blogs per Month', 'SEO Optimized', 'Publishing'] },
  { id: next(), name: 'Event Marketing', slug: 'event-marketing', category: 'marketing', price: 49999, inclusions: ['Event Marketing'] },
  { id: next(), name: 'Webinar Setup and Management', slug: 'webinar-setup', category: 'marketing', price: 14999, inclusions: ['Webinar Setup', 'Registration Page', 'Recording'] },
  { id: next(), name: 'Digital Visiting Card Designing', slug: 'digital-visiting-card', category: 'marketing', price: 1999, inclusions: ['Digital Visiting Card'] },
  { id: next(), name: 'PR Marketing Management', slug: 'pr-marketing', category: 'marketing', price: 49999, inclusions: ['PR Campaign', 'Media Outreach'] },
  { id: next(), name: 'Marketing Team Building and Training', slug: 'marketing-team', category: 'marketing', price: 29999, inclusions: ['Marketing Team Setup', 'Training'] },
  { id: next(), name: 'Sales Team Building and Training', slug: 'sales-team', category: 'marketing', price: 29999, inclusions: ['Sales Team Setup', 'Training'] },
  { id: next(), name: 'P2P Platform Development', slug: 'p2p-platform-dev', category: 'marketing', price: 499999, inclusions: ['P2P Platform Development'] },

  // ── Legal Documentation (50+) ──
  { id: next(), name: 'Rent Agreement', slug: 'rent-agreement', category: 'legal', price: 1999, inclusions: ['Rent Agreement Drafting'] },
  { id: next(), name: 'Lease Deed', slug: 'lease-deed', category: 'legal', price: 2999, inclusions: ['Lease Deed Drafting'] },
  { id: next(), name: 'Relinquishment Deed', slug: 'relinquishment-deed', category: 'legal', price: 2999, inclusions: ['Relinquishment Deed'] },
  { id: next(), name: 'Memorandum of Understanding (MoU)', slug: 'mou', category: 'legal', price: 4999, inclusions: ['MoU Drafting'] },
  { id: next(), name: 'Franchise Agreement', slug: 'franchise-agreement', category: 'legal', price: 9999, inclusions: ['Franchise Agreement Drafting'] },
  { id: next(), name: 'Joint Venture Agreement', slug: 'jv-agreement', category: 'legal', price: 9999, inclusions: ['JV Agreement Drafting'] },
  { id: next(), name: 'Founders Agreement', slug: 'founders-agreement', category: 'legal', price: 7999, inclusions: ['Founders Agreement Drafting'] },
  { id: next(), name: 'Term Sheet', slug: 'term-sheet', category: 'legal', price: 4999, inclusions: ['Term Sheet Drafting'] },
  { id: next(), name: 'Shareholders Agreement', slug: 'shareholders-agreement', category: 'legal', price: 9999, inclusions: ['Shareholders Agreement Drafting'] },
  { id: next(), name: 'Share Purchase Agreement', slug: 'share-purchase-agreement', category: 'legal', price: 9999, inclusions: ['Share Purchase Agreement'] },
  { id: next(), name: 'Service Level Agreement (SLA)', slug: 'sla', category: 'legal', price: 7999, inclusions: ['SLA Drafting'] },
  { id: next(), name: 'Master Service Agreement', slug: 'master-service-agreement', category: 'legal', price: 9999, inclusions: ['Master Service Agreement'] },
  { id: next(), name: 'Vendor Agreement', slug: 'vendor-agreement', category: 'legal', price: 4999, inclusions: ['Vendor Agreement Drafting'] },
  { id: next(), name: 'Offer Letter', slug: 'offer-letter', category: 'legal', price: 999, inclusions: ['Offer Letter Drafting'] },
  { id: next(), name: 'Consultancy Agreement', slug: 'consultancy-agreement', category: 'legal', price: 4999, inclusions: ['Consultancy Agreement'] },
  { id: next(), name: 'Freelancer Agreement', slug: 'freelancer-agreement', category: 'legal', price: 2999, inclusions: ['Freelancer Agreement'] },
  { id: next(), name: 'Appointment Letter', slug: 'appointment-letter', category: 'legal', price: 999, inclusions: ['Appointment Letter'] },
  { id: next(), name: 'Resignation Letter', slug: 'resignation-letter', category: 'legal', price: 499, inclusions: ['Resignation Letter'] },
  { id: next(), name: 'Website Terms and Conditions', slug: 'website-terms', category: 'legal', price: 4999, inclusions: ['Website T&C Drafting'] },
  { id: next(), name: 'Website Privacy Policy', slug: 'website-privacy', category: 'legal', price: 4999, inclusions: ['Privacy Policy Drafting'] },
  { id: next(), name: 'Website Disclaimer Policy', slug: 'website-disclaimer', category: 'legal', price: 2999, inclusions: ['Disclaimer Policy'] },
  { id: next(), name: 'Non-Disclosure Agreement (NDA)', slug: 'nda', category: 'legal', price: 2999, isFeatured: true, inclusions: ['NDA Drafting'] },
  { id: next(), name: 'Consumer Complaints', slug: 'consumer-complaints', category: 'legal', price: 9999, inclusions: ['Consumer Complaint Filing'] },
  { id: next(), name: 'Power of Attorney', slug: 'power-of-attorney', category: 'legal', price: 2999, inclusions: ['Power of Attorney Drafting'] },
  { id: next(), name: 'Partnership Deed', slug: 'partnership-deed', category: 'legal', price: 4999, inclusions: ['Partnership Deed Drafting'] },
  { id: next(), name: 'Account Opening Resolution', slug: 'account-opening-resolution', category: 'legal', price: 1999, inclusions: ['Bank Account Resolution'] },
  { id: next(), name: 'Agency Agreement', slug: 'agency-agreement', category: 'legal', price: 4999, inclusions: ['Agency Agreement'] },

  // ── Conversions / Changes ──
  { id: next(), name: 'Private Limited to Public Limited', slug: 'pvt-to-public', category: 'registration', price: 29999, inclusions: ['Conversion Filing'] },
  { id: next(), name: 'Private Limited to OPC', slug: 'pvt-to-opc', category: 'registration', price: 14999, inclusions: ['Conversion Filing'] },
  { id: next(), name: 'Public Limited to Private Limited', slug: 'public-to-pvt', category: 'registration', price: 24999, inclusions: ['Conversion Filing'] },
  { id: next(), name: 'OPC to Private Limited', slug: 'opc-to-pvt', category: 'registration', price: 14999, inclusions: ['Conversion Filing'] },
  { id: next(), name: 'LLP to Pvt Ltd Conversion', slug: 'llp-to-pvt', category: 'registration', price: 29999, inclusions: ['Conversion Filing'] },

  // ── Closures ──
  { id: next(), name: 'Close Private Limited Company', slug: 'close-pvt-ltd', category: 'registration', price: 14999, inclusions: ['Closure Filing', 'Strike Off'] },
  { id: next(), name: 'Close One Person Company', slug: 'close-opc', category: 'registration', price: 9999, inclusions: ['Closure Filing'] },
  { id: next(), name: 'Close Limited Liability Partnership', slug: 'close-llp', category: 'registration', price: 9999, inclusions: ['Closure Filing'] },
  { id: next(), name: 'Close Public Limited Company', slug: 'close-public', category: 'registration', price: 24999, inclusions: ['Closure Filing'] },
  { id: next(), name: 'Closing of Producer Company', slug: 'close-producer', category: 'registration', price: 29999, inclusions: ['Closure Filing'] },
  { id: next(), name: 'Closing of Nidhi Company', slug: 'close-nidhi', category: 'registration', price: 24999, inclusions: ['Closure Filing'] },
  { id: next(), name: 'Partnership Dissolution', slug: 'partnership-dissolution', category: 'registration', price: 9999, inclusions: ['Dissolution Agreement'] },

  // ── Company Changes ──
  { id: next(), name: 'Change Company Name', slug: 'change-company-name', category: 'registration', price: 9999, inclusions: ['Name Change Filing'] },
  { id: next(), name: 'Change Registered Office Address', slug: 'change-office-address', category: 'registration', price: 7999, inclusions: ['Address Change Filing'] },
  { id: next(), name: 'Appointment of a Director', slug: 'appoint-director', category: 'registration', price: 4999, inclusions: ['Director Appointment Filing'] },
  { id: next(), name: 'Form DIR 12', slug: 'form-dir-12', category: 'registration', price: 2999, inclusions: ['DIR-12 Filing'] },
  { id: next(), name: 'Form SH-7', slug: 'form-sh-7', category: 'registration', price: 4999, inclusions: ['SH-7 Filing'] },
  { id: next(), name: 'Change Business Objectives', slug: 'change-objectives', category: 'registration', price: 7999, inclusions: ['Object Change Filing'] },
  { id: next(), name: 'Change LLP Agreement', slug: 'change-llp-agreement', category: 'registration', price: 4999, inclusions: ['LLP Agreement Amendment'] },
  { id: next(), name: 'LLP - Form 4', slug: 'llp-form-4', category: 'registration', price: 2999, inclusions: ['LLP Form 4 Filing'] },
  { id: next(), name: 'Share Transfer Form (SH-4)', slug: 'share-transfer', category: 'registration', price: 2999, inclusions: ['Share Transfer Filing'] },
  { id: next(), name: 'MoA/AoA Alteration', slug: 'moa-aoa-alteration', category: 'registration', price: 9999, inclusions: ['MoA/AoA Amendment Filing'] },

  // ── Special Services ──
  { id: next(), name: 'FPC Training Program', slug: 'fpc-training', category: 'consultancy', price: 3999, isFeatured: true, inclusions: ['10-Day Live Training', 'All Videos & Recordings', 'Practical Worksheets', 'Certificate', 'Post-Training Support'] },
  { id: next(), name: 'Credit Co-Operative Society Software', slug: 'credit-coop-software', category: 'consultancy', price: 99999, inclusions: ['Banking Software', 'Setup & Training'] },
  { id: next(), name: 'Banking Software', slug: 'banking-software', category: 'consultancy', price: 199999, inclusions: ['Core Banking Software'] },
  { id: next(), name: 'Banking Stationary and Documentation', slug: 'banking-stationary', category: 'consultancy', price: 29999, inclusions: ['Stationary', 'Documentation'] },
  { id: next(), name: 'Accounting Software', slug: 'accounting-software', category: 'consultancy', price: 19999, inclusions: ['Accounting Software Setup'] },
  { id: next(), name: 'NGO Stationary', slug: 'ngo-stationary', category: 'consultancy', price: 19999, inclusions: ['NGO Stationary'] },
  { id: next(), name: 'Venture Capital Fund Form Filling', slug: 'vc-fund-filling', category: 'consultancy', price: 49999, inclusions: ['VC Fund Filing'] },
  { id: next(), name: 'Equity Grant Scheme', slug: 'equity-grant', category: 'consultancy', price: 19999, inclusions: ['Equity Grant Application'] },
  { id: next(), name: 'Multistate NOC', slug: 'multistate-noc', category: 'consultancy', price: 29999, inclusions: ['Multistate NOC'] },
  { id: next(), name: 'Election Process Management (Multi State Co-op)', slug: 'election-process', category: 'consultancy', price: 49999, inclusions: ['Election Management'] },
  { id: next(), name: 'PoCRA 2 Subsidy Assistance', slug: 'pocra-2-subsidy', category: 'consultancy', price: 19999, inclusions: ['PoCRA Subsidy Assistance'] },
  { id: next(), name: 'Money Lending License (Savkari License)', slug: 'money-lending-license', category: 'registration', price: 29999, inclusions: ['Money Lending License'] },
  { id: next(), name: 'Microfinance Company NBFC (RBI Registered)', slug: 'nbfc-microfinance', category: 'registration', price: 499999, inclusions: ['NBFC Registration'] },
  { id: next(), name: 'Organization DSC', slug: 'org-dsc', category: 'other-registrations', price: 2999, inclusions: ['Organization DSC'] },
  { id: next(), name: 'Return of Allotment (PASS-3)', slug: 'return-allotment', category: 'taxation', price: 4999, inclusions: ['PASS-3 Filing'] },
  { id: next(), name: 'PF Refund', slug: 'pf-refund', category: 'taxation', price: 4999, inclusions: ['PF Refund Assistance'] },
  { id: next(), name: 'ETaxwala Partner', slug: 'etaxwala-partner', category: 'consultancy', price: 0, inclusions: ['Become a Partner'] },
];

// Helper functions
export const getServiceBySlug = (slug: string) => services.find((s) => s.slug === slug);
export const getServicesByCategory = (categoryId: string) => services.filter((s) => s.category === categoryId);
export const getFeaturedServices = () => services.filter((s) => s.isFeatured);
export const getCategoryById = (id: string) => categories.find((c) => c.id === id);
export const formatPrice = (price: number) => price === 0 ? 'Contact Us' : `₹${price.toLocaleString('en-IN')}`;