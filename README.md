# ETaxwala 2.0 — Enterprise Legal, Tax & Compliance Platform

> **India's #1 Institutional LegalTech & CA Advisory Ecosystem**  
> Serving 1,00,000+ Businesses Across 28 States with 120+ Offline Legal Hubs & 100% Digital Execution.

---

## ⚡ Quick Demo Access (1-Click Logins)

The platform includes built-in **1-Click Demo Logins** in development mode so developers, testers, and reviewers can test all roles without manual password entry or database seed dependencies.

| Portal | URL | Demo Account | Default Credentials | Description |
|:---|:---|:---|:---|:---|
| **Staff CRM** | [`http://localhost:5173/crm/login`](http://localhost:5173/crm/login) or [`/login`](http://localhost:5173/login) | **Super Admin** | `admin@etaxwala.com` / `Password@123` | Full administrative privileges across all 16 departments |
| **Staff CRM** | [`http://localhost:5173/crm/login`](http://localhost:5173/crm/login) | **Sales Manager** | `sales.manager@etaxwala.com` / `Password@123` | Lead pipeline, assignments, agent performance |
| **Staff CRM** | [`http://localhost:5173/crm/login`](http://localhost:5173/crm/login) | **Ops Manager** | `ops.manager@etaxwala.com` / `Password@123` | Operations task queue, ROC filing milestones |
| **Staff CRM** | [`http://localhost:5173/crm/login`](http://localhost:5173/crm/login) | **CA Tax Expert** | `ca.expert@etaxwala.com` / `Password@123` | Direct client consultations, audit reports |
| **Staff CRM** | [`http://localhost:5173/crm/login`](http://localhost:5173/crm/login) | **Sales Employee** | `priya.sales@etaxwala.com` / `Password@123` | Call analytics, lead conversion, won-form |
| **Client Portal** | [`http://localhost:5173/portal/login`](http://localhost:5173/portal/login) | **Rajesh Sharma** | `rajesh@apextech.in` / `Password@123` | Client vault, 10-stage milestones, CA chat |

> 💡 **Tip:** On the CRM and Portal login screens, simply click any of the **⚡ 1-Click Demo Login** buttons or click **"Sign In to Dashboard"** directly (credentials are pre-filled).

---

## 🌟 1. System Overview

**ETaxwala 2.0** is an enterprise-grade full-stack platform built as a high-performance **Turborepo Monorepo**. It unifies:

1. **High-Converting Public Website**: Interactive lead capture hero, 250+ services catalog, and conversion funnels (ITR, FPC, Appointments, Direct Pay).
2. **Client Self-Service Portal**: 10-stage milestone tracking, secure document vault, video academy, and real-time CA helpdesk.
3. **Staff CRM & ERP Engine**: 16 specialized role dashboards, 79,900+ call analytics, desktrack activity tracking, won-form processing, staff chat, and workforce management.
4. **Cross-Platform Sales Mobile App**: Flutter dialer and lead management application for sales teams.
5. **Backend API & Integrations**: Node.js + TypeScript with Prisma ORM, Socket.io real-time messaging, Redis, Razorpay/Cashfree payments, Brevo Email/SMS, WhatsApp Business API, and Cloudflare R2 presigned storage.

---

## 🏗️ 2. Enterprise System Architecture

```mermaid
graph TD
    subgraph "Clients & Public Traffic"
        User[Visitors & Clients] -->|HTTPS| Cloudflare[Cloudflare CDN / WAF / SSL]
        MobileUser[Sales Agents on Android/iOS] -->|HTTPS| MobileApp[Flutter Sales App]
    end

    subgraph "Edge / Nginx Reverse Proxy"
        Cloudflare -->|Port 80/443| Nginx[Nginx Reverse Proxy]
        Nginx -->|Static Assets| WebDist[React Vite SPA /dist :5173]
        Nginx -->|/api & /v1 Proxy| ApiCluster[Node.js API Express Cluster :5001]
    end

    subgraph "Monorepo Application Layer"
        WebDist --> AppWeb[apps/web: React 18 + Tailwind]
        MobileApp --> ApiCluster
        ApiCluster --> AppApi[apps/api: Express + TypeScript]
    end

    subgraph "Shared Packages (Turborepo)"
        AppWeb -.-> PkgUI[@etaxwala/ui: Shared Components]
        AppWeb -.-> PkgTypes[@etaxwala/types: Shared DTOs]
        AppApi -.-> PkgTypes
        AppWeb -.-> PkgClient[@etaxwala/api-client: Axios Core]
    end

    subgraph "Data & Persistence"
        AppApi -->|Prisma ORM| Database[(PostgreSQL / MySQL 8: 66 Tables)]
        AppApi -->|Cache & Sessions| Redis[(Redis: Session & Rate Limits)]
        AppApi -->|Presigned Vault| CloudflareR2[(Cloudflare R2 Object Storage)]
    end

    subgraph "External Integrations"
        AppApi -->|Transactional Webhooks| Telephony[Knowlarity / Exotel Telephony]
        AppApi -->|Payments & EMI| Razorpay[Razorpay & Cashfree]
        AppApi -->|Transactional Comms| Brevo[Brevo Email & Fast2SMS DLT]
        AppApi -->|Real-Time Sockets| SocketIO[Socket.io Staff & Client Chat]
    end
```

---

## 👥 3. 16-Role CRM Hierarchy & Permissions

```mermaid
graph TD
    SuperAdmin[1. Super Admin: Full System & Audit Access]
    SuperAdmin --> Admin[2. General Administrator: User & System Config]
    
    Admin --> OpsMgr[3. Operations Manager]
    Admin --> SalesMgr[4. Sales Manager]
    Admin --> MktgMgr[5. Marketing Manager]
    Admin --> FranMgr[6. Franchise Manager]

    SalesMgr --> SalesAgent[7. Sales Employee: Lead Pipeline, Calls & Quotes]
    OpsMgr --> OpsExec[8. Operations Employee: Task & ROC Filing]
    MktgMgr --> MktgExec[9. Marketing Employee: SEO & Content]
    FranMgr --> FranPartner[10. Franchise Partner: Regional Network]

    OpsMgr --> CAExpert[11. Consultation CA: Audits & Advisory]
    OpsMgr --> QCRev[12. Operations Assistant / QC: Document Review]
    SalesMgr --> SalesAssist[13. Sales Assistant: Lead Qualification]
    Admin --> HRMgr[14. HR Manager: Workforce & Attendance]
    Admin --> WebMgr[15. Website Manager: Catalog & Sub-Brands]
    Admin --> Staff[16. Support / General Staff: Desktrack & Tickets]
```

---

## 📁 4. Monorepo Repository Structure

```
etaxwala-v2/
├── apps/
│   ├── web/                          # React 18 + TypeScript + Vite + Tailwind CSS
│   │   ├── src/
│   │   │   ├── app/                  # Application Router (App.tsx)
│   │   │   ├── features/
│   │   │   │   ├── marketing/        # Home, Services (250+), Funnels, Blog, Careers, Legal
│   │   │   │   ├── portal/           # Client Portal (Dashboard, Documents, Payments, Support)
│   │   │   │   └── crm/              # Staff CRM (All 16 Role Dashboards, Leads, Tasks, Quotes)
│   │   │   ├── components/           # Navbar, Footer, Float Drawers, Modals, ErrorBoundary
│   │   │   └── store/                # Zustand Auth Store & Session Management
│   │   └── vite.config.ts            # Proxy configured for API routes
│   │
│   ├── api/                          # Node.js + Express + Prisma ORM + TypeScript
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   ├── auth.routes.ts            # JWT Authentication & Staff Login
│   │   │   │   ├── call-analytics.routes.ts  # Call reports, stats, lead-details
│   │   │   │   ├── crm.routes.ts             # Tasks, Leads, Quotations, Desktrack
│   │   │   │   ├── customer.routes.ts        # Client Portal Endpoints (21 Routes)
│   │   │   │   ├── flutter-compat.routes.ts  # Flutter Mobile Endpoints (35 Routes)
│   │   │   │   └── integrations.routes.ts    # Razorpay, Telephony, Brevo, WhatsApp, R2
│   │   │   ├── middleware/                   # JWT Auth, Rate-Limiting, Multer, Error Handler
│   │   │   └── utils/                        # Winston Logger & Serializers
│   │   └── prisma/
│   │       └── schema.prisma                 # 66 Relational Database Tables
│   │
│   └── mobile/                       # Flutter Cross-Platform Sales App
│       ├── lib/                      # Lead Details, Dialer, Quotation PDF
│       └── android/                  # Native Android dialer & background tracking
│
├── packages/
│   ├── ui/                           # @etaxwala/ui (Shared Components: Button, Card, Dialog, etc.)
│   ├── types/                        # @etaxwala/types (Shared TypeScript Interfaces & DTOs)
│   ├── config/                       # @etaxwala/config (Shared ESLint & TypeScript Configurations)
│   └── api-client/                   # @etaxwala/api-client (Shared Axios client with JWT interceptors)
│
├── scripts/                          # Test, Audit & Migration Scripts
│   ├── test-demo-logins.js           # Live CDP test for CRM & Portal 1-click logins
│   └── audit-browser-crm-admin.cjs   # Automated browser audit suite
├── PROJECT_AUDIT_REPORT.md           # 100% Comprehensive End-to-End System Audit Report
├── turbo.json                        # Turborepo Build Pipeline Config
└── README.md                         # Project Documentation
```

---

## ⚡ 5. Quick Start & Local Development

### Prerequisites
- **Node.js**: `v20.0.0+` (Tested on Node `v22.14.0`)
- **pnpm**: `v9.0.0+` (or `corepack enable pnpm`)
- **Database**: PostgreSQL 16 or MySQL 8 (System operates with in-memory fallbacks when DB is offline)

### 1. Install Monorepo Dependencies
```bash
cd "etaxwala-v2"
pnpm install
```

### 2. Configure Environment Variables
Copy `.env.example` in `apps/api/.env`:
```ini
NODE_ENV="development"
PORT=5001
DATABASE_URL="mysql://root:password@localhost:3306/etaxwala_v2"
JWT_SECRET="your-64-character-high-entropy-jwt-secret"
ENCRYPTION_KEY="your-64-character-encryption-key"
FRONTEND_URL="http://localhost:5173"
```

### 3. Start Development Servers
```bash
# Start all workspace services concurrently via Turborepo:
pnpm dev

# Or start services individually:
pnpm dev:web    # React Frontend on http://localhost:5173
pnpm dev:api    # Express API on http://localhost:5001
```

### 4. Run Automated Tests & Quality Gates
```bash
# Run unit & integration test suite (18/18 tests pass):
pnpm test

# Run TypeScript typechecks across all 6 workspace packages:
pnpm turbo lint

# Run full production build verification:
pnpm turbo build

# Run automated browser login verification:
node scripts/test-demo-logins.js
```

---

## 🛡️ 6. Security Architecture

- **Dual-Token JWT Authentication**: 15-minute access tokens + 7-day refresh tokens signed with high-entropy keys.
- **Production Password Verification**: Enforces `bcrypt.compare` against hashed credentials in database tables. In development (`NODE_ENV !== 'production'`), demo logins are permitted for rapid iteration.
- **Customer IDOR Protection**: Mandatory JWT verification mounted on client portal routes; unauthenticated `?customerId=` parameter bypasses are blocked.
- **Security Headers & Network Armor**: Helmet HTTP headers, CORS whitelisting, IP rate limiting via express rate-limiter, and secure cookie storage.

---

## 📊 7. Full System Audit & Health

A comprehensive 0% to 100% End-to-End system audit was executed across all components. For complete architectural findings, API route matrices, and prioritized technical backlog, see:

👉 [**`PROJECT_AUDIT_REPORT.md`**](./PROJECT_AUDIT_REPORT.md)

---

## 🚀 8. Production Deployment

```bash
# Compile all workspace packages:
pnpm turbo build

# Deploy Web (Nginx SPA static output):
# apps/web/dist/

# Deploy API (PM2 Cluster mode):
pm2 start apps/api/dist/server.js --name "etaxwala-api" -i max
```

---

*Copyright © 2026 ETaxwala Financial Services Pvt Ltd. All rights reserved.*
