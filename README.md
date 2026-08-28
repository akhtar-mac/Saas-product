# ETaxwala 2.0 — Enterprise Legal, Tax & Compliance Platform

> **India's #1 Institutional LegalTech & CA Advisory Ecosystem**  
> Serving 1,00,000+ Businesses Across 28 States with 120+ Offline Legal Hubs & 100% Digital Execution.

---

## 🌟 1. System Overview

**ETaxwala 2.0** is an enterprise-grade full-stack platform built as a high-performance **Turborepo Monorepo**. It unifies:
1. **High-Converting Lead Generation Website**: Interactive hero lead capture, 250+ services catalog, and conversion funnels (ITR, FPC, Appointments).
2. **Client Self-Service Portal**: 10-stage vertical milestone tracker, secure document vault, video academy, and real-time CA helpdesk.
3. **Staff CRM & ERP Engine**: 17 dedicated role dashboards, 79,900+ call analytics, desktrack activity tracking, won-form processing, and workforce management.
4. **Flutter Sales Mobile App**: Complete cross-platform mobile dialer and lead management application.
5. **Robust Backend API & Integrations**: Node.js + TypeScript with PostgreSQL (Prisma ORM), Redis, Razorpay/Cashfree payments, Brevo Email/SMS, WhatsApp Business API, and Cloudflare R2 presigned storage.

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
        Nginx -->|Static Assets| WebDist[React Vite SPA /dist]
        Nginx -->|/api & /v1 Proxy| ApiCluster[PM2 Node.js Cluster :5001]
    end

    subgraph "Monorepo Application Layer"
        WebDist --> AppWeb[apps/web: React 18 + Tailwind]
        MobileApp --> ApiCluster
        ApiCluster --> AppApi[apps/api: Express + TypeScript]
    end

    subgraph "Shared Packages (Turborepo)"
        AppWeb -.-> PkgUI[@etaxwala/ui: 13 Core Components]
        AppWeb -.-> PkgTypes[@etaxwala/types: Shared DTOs]
        AppApi -.-> PkgTypes
        AppWeb -.-> PkgClient[@etaxwala/api-client: Axios Core]
    end

    subgraph "Data & Storage Persistence"
        AppApi -->|Prisma ORM| Postgres[(PostgreSQL 16: 66 Tables)]
        AppApi -->|Cache & Queues| Redis[(Redis: Sessions & Rate Limits)]
        AppApi -->|Presigned Vault| CloudflareR2[(Cloudflare R2 Object Storage)]
    end

    subgraph "External Third-Party Gateways"
        AppApi -->|Transactional Webhooks| Telephony[Knowlarity / Exotel Telephony]
        AppApi -->|Payments & EMI| Razorpay[Razorpay & Cashfree]
        AppApi -->|Transactional Comms| Brevo[Brevo Email & Fast2SMS DLT]
        AppApi -->|Milestones| WhatsApp[WhatsApp Business API]
    end
```

---

## 🔄 3. Lead & Customer Lifecycle Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Client as Business Founder
    participant Web as ETaxwala Web (Hero)
    participant API as Backend API (:5001)
    participant CRM as Staff CRM (17 Roles)
    participant Mobile as Flutter Sales App
    participant Vault as Client Portal & Vault

    Client->>Web: Selects "Pvt Ltd" & submits 5-Min Callback Form
    Web->>API: POST /v1/inquiry (Lead Ingest)
    API->>CRM: Assigns Lead to Sales Executive (Round Robin)
    API->>Mobile: Real-time notification & dialer queue
    Mobile->>Client: Sales Agent connects call via Flutter dialer
    Mobile->>API: POST /api/create_quotation (PDF generated)
    Client->>Web: Accepts Quotation & Pays via Razorpay / EMI
    API->>CRM: Triggers "Won Form" & provisions Operation Task
    CRM->>Vault: CA uploads SPICe+ Part B & ROC milestones
    Vault->>Client: SMS / WhatsApp milestone notifications
    Client->>Vault: Downloads Certificate of Incorporation (COI)
```

---

## 👥 4. 17-Role Permission & Hierarchy Matrix

```mermaid
graph TD
    SuperAdmin[1. Super Admin: Full System & Audit Access]
    SuperAdmin --> Admin[2. General Administrator: User & System Config]
    
    Admin --> OpsMgr[3. Operations Manager]
    Admin --> SalesMgr[4. Sales Manager]
    Admin --> HRMgr[5. HR Manager]
    Admin --> MktgMgr[6. Marketing Manager]
    Admin --> FranMgr[7. Franchise Manager]

    OpsMgr --> OpsExec[8. Operations Executive: Task & ROC Filing]
    OpsMgr --> CAExpert[9. Senior CA Specialist: Audits & Advisory]
    OpsMgr --> QCRev[10. QC Reviewer: Document Verification]
    OpsMgr --> OpsAssist[11. Operations Assistant]

    SalesMgr --> SalesAgent[12. Sales Agent: Lead Pipeline & Quotes]
    SalesMgr --> SalesAssist[13. Sales Assistant: Lead Qualification]
    SalesMgr --> SubBrands[14. Sub-Brands: Udyomi & Sahakar Desks]

    HRMgr --> Staff[15. General Staff: Desktrack & Attendance]
    FranMgr --> FranAgent[16. Franchise Partner: Marathwada & CSC Hubs]
    Admin --> Support[17. Helpdesk Support: Ticket Dispatch]
```

---

## 📁 5. Repository Monorepo Structure

```
etaxwala-v2/
├── apps/
│   ├── web/                          # React 18 + TypeScript + Vite + Tailwind CSS
│   │   ├── src/
│   │   │   ├── features/
│   │   │   │   ├── marketing/        # Home (Hero Lead Form), About, Services (250+), Funnels, Blog, Careers
│   │   │   │   ├── portal/           # Client Portal (Dashboard, 10-Stage Milestone, Vault, Payments, Videos)
│   │   │   │   └── crm/              # Staff CRM (All 17 Role Dashboards, Won Form, Leads, Tasks, Quotes, HR)
│   │   │   ├── components/           # SEO, Breadcrumbs, ErrorBoundary, Shared Modals
│   │   │   └── store/                # Zustand Auth Store & Session Managers
│   │   └── vite.config.ts            # Proxy configured for API routes
│   │
│   ├── api/                          # Node.js + Express + Prisma ORM + PostgreSQL
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   ├── auth.routes.ts            # JWT Authentication & Staff Login
│   │   │   │   ├── crm.routes.ts             # Tasks, Leads, Quotations, Desktrack, Reports
│   │   │   │   ├── customer.routes.ts        # Client Portal Endpoints (21 Routes)
│   │   │   │   ├── flutter-compat.routes.ts  # Flutter Mobile Endpoints (35 Routes)
│   │   │   │   ├── integrations.routes.ts    # Razorpay, Telephony, Brevo, WhatsApp, R2
│   │   │   │   └── users.routes.ts           # Admin User Provisioning & Roles
│   │   │   ├── middleware/                   # JWT Auth, Audit Logger, Multer Uploads, Error Handler
│   │   │   └── utils/                        # Winston Logger & Serializers
│   │   └── prisma/
│   │       └── schema.prisma                 # 66 Relational Database Tables
│   │
│   └── mobile/                       # Cross-Platform Flutter Sales Mobile App
│       ├── lib/
│       │   ├── views/
│       │   │   ├── screens/                  # Lead Details, Dialer, Quotation PDF, Appointments
│       │   │   └── constant/domain.dart      # Centralized Mobile API Gateway
│       └── android/                          # Native Android background dialer & call recording
│
├── packages/
│   ├── ui/                           # @etaxwala/ui (13 Shared Components: Button, Card, Dialog, Badge, Popover, etc.)
│   ├── types/                        # @etaxwala/types (Shared TypeScript Interfaces & DTOs)
│   ├── config/                       # @etaxwala/config (Shared ESLint & TypeScript Configurations)
│   └── api-client/                   # @etaxwala/api-client (Shared Axios client with JWT interceptors)
│
├── .github/workflows/                # CI/CD Pipelines (run-tests.yml, deploy-web.yml, deploy-api.yml)
├── scripts/                          # Streaming MySQL -> PostgreSQL Migration Engine
├── turbo.json                        # Turborepo Build Pipeline Config
└── TASKS.md                          # Comprehensive Execution & Roadmap Tracker
```

---

## ⚡ 6. Quick Start & Local Development

### Prerequisites
- **Node.js**: `v20.0.0+`
- **pnpm**: `v9.0.0+`
- **PostgreSQL**: `v16+` (or access to local development instance)
- **Flutter SDK**: `v3.19+` (for mobile app)

### 1. Install Monorepo Dependencies
```bash
cd "etaxwala-v2"
pnpm install
```

### 2. Configure Environment Variables
Copy `.env.example` in `apps/api/.env`:
```ini
DATABASE_URL="postgresql://etaxwala:etaxwala2024@localhost:5432/etaxwala_v2?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
PORT=5001
FRONTEND_URL="http://localhost:5173"
```

### 3. Start Development Servers
```bash
# Start all workspace services concurrently (Turborepo)
pnpm dev

# Or start individually:
pnpm dev:web    # Frontend on http://localhost:5173
pnpm dev:api    # API Server on http://localhost:5001
```

### 4. Run Flutter Mobile App
```bash
cd apps/mobile
flutter pub get
flutter run
```

---

## 🚀 7. Production Build & Deployment

```bash
# Run full monorepo compilation (Zero build errors)
pnpm build

# Run linting and formatting
pnpm lint
pnpm format:check
```

### Automated CI/CD
Every commit to `main` triggers GitHub Actions workflows:
- **`run-tests.yml`**: Monorepo compilation and typecheck gate.
- **`deploy-web.yml`**: Builds and packages `@etaxwala/web` for production Nginx distribution.
- **`deploy-api.yml`**: Compiles `@etaxwala/api` and deploys under PM2 process manager.

---

## 🛡️ 8. Security & Compliance
- **Authentication**: Dual-token JWT (15-min Access Tokens + 7-Day Refresh Tokens).
- **Network Protection**: Helmet headers, CORS whitelisting, and rate-limiting.
- **Data Protection**: 256-Bit SSL encryption for client vault documents on Cloudflare R2.
- **Audit Logging**: Winston multi-transport logger with automatic JSON request audit trails.

---

*Copyright © 2026 ETaxwala Financial Services Pvt Ltd. All rights reserved.*
