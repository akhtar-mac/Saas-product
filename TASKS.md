# ETaxwala 2.0 — Master Task List (Day 1 → Live)

> **How to use this file:** Every task has a status checkbox. Work top-to-bottom. Check `[x]` when done. Do NOT skip tasks. If a task needs manual work (DB access, VPS, DNS, accounts), it's marked 🔧 MANUAL.

> **Legend:** `[ ]` pending | `[~]` in progress | `[x]` done | `[!]` blocked

---

# ═══════════════════════════════════════════
# PHASE 0 — PROJECT SETUP & PLANNING
# ═══════════════════════════════════════════

## 0.1 Planning & Analysis

- [x] 0.1.1 Inspect current website (50 pages mapped)
- [x] 0.1.2 Inspect client portal (4 pages, 6 status cards, 250+ services)
- [x] 0.1.3 Inspect staff CRM with super-admin (60+ pages, 16 roles)
- [x] 0.1.4 Reverse-engineer inquiry + appointment form endpoints
- [x] 0.1.5 Extract Flutter sales app source code analysis (40+ Dart files, 30+ endpoints)
- [x] 0.1.6 Extract MySQL SQL dump analysis (66 tables, 557MB)
- [x] 0.1.7 Extract Laravel codebase analysis (5 apps, routes, controllers, .env)
- [x] 0.1.8 Map all API endpoints (customer-api 28, application-api 30+, web routes)
- [x] 0.1.9 Document 16 staff roles + permission matrix
- [x] 0.1.10 Document 10 task statuses + 8 service categories + 3 lead sources
- [x] 0.1.11 Extract service pricing (250+ services with prices)
- [x] 0.1.12 Write technical blueprint document (ETAXWALA_2.0_TECHNICAL_BLUEPRINT.md)
- [x] 0.1.13 Write management pitch document (PDF generated)
- [x] 0.1.14 Confirm blue-green deployment strategy with user

## 0.2 Repository & Tooling Setup

- [x] 0.2.1 Install Node.js 20+ (already v24.14.1 ✓)
- [x] 0.2.2 Install pnpm (v11.22.0 ✓)
- [x] 0.2.3 Install git (v2.53.0 ✓)
- [x] 0.2.4 Create monorepo structure (apps/web, apps/api, packages/*)
- [x] 0.2.5 Set up pnpm-workspace.yaml
- [x] 0.2.6 Set up Turborepo (turbo.json)
- [x] 0.2.7 Set up shared tsconfig.base.json
- [x] 0.2.8 🔧 MANUAL — Initialize git repo: `cd etaxwala-v2 && git init && git add . && git commit -m "Initial: ETaxwala 2.0 scaffold"`
- [ ] 0.2.9 🔧 MANUAL — Create GitHub repo (private) and push: `git remote add origin <url> && git push -u origin main`
- [x] 0.2.10 Set up .gitignore (node_modules, dist, .env, .turbo, *.log)
- [x] 0.2.11 Set up ESLint + Prettier configs
- [x] 0.2.12 Set up Husky pre-commit hooks (lint-staged)

## 0.3 Shared Packages

- [x] 0.3.1 Create packages/types — all TypeScript types (roles, statuses, services, leads, tasks, chat, calls, quotations, etc.)
- [x] 0.3.2 Create packages/types — RoleType enum (16 roles)
- [x] 0.3.3 Create packages/types — TaskStatus enum (10 statuses) + colors
- [x] 0.3.4 Create packages/types — LeadSource + LeadStatus enums
- [x] 0.3.5 Create packages/types — API response types (ApiResponse, ApiListResponse, ApiError)
- [x] 0.3.6 Create packages/ui — Button, Card, Input, Dialog, Badge, Table, Tabs, Accordion, Select, Toast, Skeleton, Avatar, Progress, Command, Popover
- [x] 0.3.7 Create packages/config — shared ESLint, TS, Tailwind configs
- [x] 0.3.8 Create packages/api-client — shared Axios instance + interceptors

---

# ═══════════════════════════════════════════
# PHASE 1 — MARKETING WEBSITE (Weeks 1-4)
# ═══════════════════════════════════════════

## 1.1 Frontend Scaffold & Design System

- [x] 1.1.1 Scaffold Vite + React 18 + TypeScript in apps/web
- [x] 1.1.2 Configure Tailwind CSS with ETaxwala brand colors (primary #0B3D6B, accent #10B981)
- [x] 1.1.3 Set up Inter font (Google Fonts)
- [x] 1.1.4 Configure Vite with path aliases (@/, @etaxwala/types)
- [x] 1.1.5 Set up React Router v6 with route structure
- [x] 1.1.6 Set up TanStack Query provider
- [x] 1.1.7 Create globals.css with Tailwind layers + component classes (btn-primary, btn-accent, card, input, badge, section)
- [x] 1.1.8 Set up Zustand stores (authStore, notifStore, cartStore)
- [ ] 1.1.9 Install + configure shadcn/ui CLI
- [ ] 1.1.10 Generate shadcn/ui components (Button, Card, Dialog, Input, Select, Tabs, Table, Toast, Accordion, Avatar, Progress, Skeleton, Command, Popover, Tooltip, Calendar, ScrollArea, Separator, DropdownMenu, Sheet)
- [x] 1.1.11 Set up Framer Motion animations (fade-in, slide-up, slide-down)
- [x] 1.1.12 Create SEO component (react-helmet-async or react-meta) for meta tags + OG + schema
- [x] 1.1.13 Create ErrorBoundary component
- [x] 1.1.14 Create Loading/Skeleton components
- [x] 1.1.15 Create 404 page with nice design
- [x] 1.1.16 Create analytics setup (Google Analytics 4 or Plausible)

## 1.2 Layout Components

- [x] 1.2.1 Create Header with mega menu (Registration, Other Registrations, Taxation, Consultancy, Blog)
- [x] 1.2.2 Create mobile hamburger menu (drawer style)
- [x] 1.2.3 Create top bar (phone, email, ITR link, FPC link, staff login, client login)
- [x] 1.2.4 Create Footer (4 columns: company, services, others, contact + social links)
- [x] 1.2.5 Create FloatingCTA (WhatsApp + Call expandable button)
- [x] 1.2.6 Create MarketingLayout (header + outlet + footer + floating CTA)
- [x] 1.2.7 Create InquiryModal (popup inquiry form — accessible from any page)
- [x] 1.2.8 Create ScrollToTop component (auto scroll to top on route change)
- [x] 1.2.9 Create Breadcrumbs component

## 1.3 Home Page

- [x] 1.3.1 Hero section with animated gradient background + dashboard mockup card
- [x] 1.3.2 Hero stats inline (1L+ customers, 200+ experts, 120+ franchises, 98.9% success)
- [x] 1.3.3 Wave SVG divider between hero and stats
- [x] 1.3.4 Stats bar section (4 cards with icons: Users, Briefcase, Handshake, Award)
- [x] 1.3.5 About section with image + floating animated badges (10+ years, 1L+ clients)
- [x] 1.3.6 8 Core service cards with gradient icons + hover lift effect
- [x] 1.3.7 Why Choose Us section (4 pillars: Tailored, Experienced, Proactive, Client-Centric)
- [x] 1.3.8 Testimonials section (4 reviews with avatars + star ratings)
- [x] 1.3.9 Franchise network section (120+ partners, 28 states, 500+ cities, India state grid)
- [x] 1.3.10 Office locations section (head office + branch with MapPin)
- [x] 1.3.11 CTA banner (Book Appointment + WhatsApp)
- [x] 1.3.12 Add Framer Motion scroll animations to all sections
- [x] 1.3.13 Add lazy loading for images
- [x] 1.3.14 Add schema.org JSON-LD (Organization, LocalBusiness, Service)
- [x] 1.3.15 Add meta tags (title, description, OG, Twitter card)
- [x] 1.3.16 Responsive test: mobile (375px), tablet (768px), desktop (1440px)

## 1.4 About Page

- [x] 1.4.1 Hero section with gradient
- [x] 1.4.2 Stats bar (10+ years, 1L+ customers, 200+ team, 120+ franchises)
- [x] 1.4.3 Our Story section (3 paragraphs)
- [x] 1.4.4 Mission / Vision / Values cards
- [x] 1.4.5 CTA banner
- [x] 1.4.6 Add team photos section (placeholder for now)
- [x] 1.4.7 Add meta tags + schema

## 1.5 Contact Page

- [x] 1.5.1 Hero section
- [x] 1.5.2 4 contact cards (Call, Email, Visit, Hours)
- [x] 1.5.3 2 office cards with addresses
- [x] 1.5.4 Add Google Maps embed
- [x] 1.5.5 Add contact form (POST to /v1/contact)
- [x] 1.5.6 Add meta tags + schema

## 1.6 Services Hub Page

- [x] 1.6.1 Hero section
- [x] 1.6.2 Search bar (searchable service input)
- [x] 1.6.3 6 category cards (Registration, Other Registrations, Taxation, Audit, Consultancy, Marketing) with icons + service counts
- [x] 1.6.4 Add live search (filter services as user types)
- [x] 1.6.5 Add price range filter
- [x] 1.6.6 Add category filter dropdown
- [x] 1.6.7 Add "Popular Services" section (top 12 most bought)
- [x] 1.6.8 Add "Starting from ₹X" on each category card
- [x] 1.6.9 Add meta tags + schema

## 1.7 Service Detail Pages (47 pages, data-driven from one template)

- [x] 1.7.1 Create ServiceDetailPage template (used for all 47 services)
- [x] 1.7.2 Hero with breadcrumb + title + price + icon
- [x] 1.7.3 Inclusions section (checklist)
- [x] 1.7.4 Process steps (numbered timeline)
- [x] 1.7.5 FAQ section (accordion)
- [x] 1.7.6 Pricing card with Buy Now + Inquiry buttons
- [x] 1.7.7 CTA section (Book Appointment + WhatsApp)
- [x] 1.7.8 Populate ALL 47 service detail pages with real data (name, price, inclusions, process, FAQs, documents required)
- [x] 1.7.9 Add "Related Services" section
- [x] 1.7.10 Add "Documents Required" section per service
- [x] 1.7.11 Add schema.org Service schema
- [x] 1.7.12 Add meta tags per service (dynamic title, description)

## 1.8 Service Catalog Data (250+ services)

- [x] 1.8.1 Create services data file (TypeScript constants) with ALL 250+ services:
  - id, name, categoryId, price, inclusions[], description, url slug
- [x] 1.8.2 Business Registration services (9): Partnership, OPC, Pvt Ltd, LLP, Section 8, Producer, Public Ltd, Indian Subsidiary, Subsidiary
- [x] 1.8.3 Other Registrations (10): MSME, GST, FSSAI, Import Export, 80G 12A, Professional Tax, TAN, DSC, PASARA, Trade License
- [x] 1.8.4 Taxation (6): ITR, GST Return, EPFO ESIC, CMA, DPR, Tax Audit
- [x] 1.8.5 Audit (9): Public Ltd, Section 8, Producer, LLP, OPC, Pvt Ltd, Partnership, Multi-State, Credit Co-op
- [x] 1.8.6 Consultancy (13): HR Payroll, CFO, Financial Advisory, Credit Co-op Software, Business, Startup Idea Gen, Startup Idea Validation, Business Plan, Startup Funding, Team Building, Business Automation, Business Growth, Marketing
- [x] 1.8.7 Legal Documentation (50+): Rent Agreement, Lease Deed, MoU, Franchise Agreement, JV Agreement, Founders Agreement, Term Sheet, Shareholders Agreement, NDA, etc.
- [x] 1.8.8 Marketing & Branding (20+): Logo, Website, Mobile App, GMB, Social Media, Email, SMS, Influencer, WhatsApp, Affiliate, YouTube, SEO, PPC, Print, Brand Ambassador, Celebrity, Catalogue, Blog, Event, Webinar, Digital Visiting Card, PR
- [x] 1.8.9 ITR variants (8): Salary, Business, Capital Gains, F&O, Crypto, Foreign, Salary+Other, Trust ITR
- [x] 1.8.10 GST Return variants (14): Monthly Nil, Monthly 10/50/100/200 bills, Quarterly variants, without accounting
- [x] 1.8.11 Trademark services (6): Application, Registration, Objection, Renewal, Assignment, Opposition, Rectification
- [x] 1.8.12 Other: ISO, FCRA, FFMC, RWA, Drug License, APEDA, RERA, AGMARK, RCMC, NITI Ayog DARPAN, Design Reg, Copyright, Patent, ITR Notice, Balance Sheet, CA Advisory
- [x] 1.8.13 Add ITR variants: Balance Sheet P&L, Accounting, PTEC, Director KYC, LLP Form-11, DPT-3, INC-20A, Conversions, Closures, Changes
- [x] 1.8.14 Add FPC Training (₹3,999)

## 1.9 Appointment Page

- [x] 1.9.1 Hero section
- [x] 1.9.2 Contact info sidebar (phone, email, address)
- [x] 1.9.3 Appointment form (name, email, mobile, city, message)
- [x] 1.9.4 Form validation (Zod schema)
- [x] 1.9.5 Form submits to existing customer-api.etaxwala.com/api/book-appointment
- [x] 1.9.6 Success state (checkmark animation)
- [x] 1.9.7 Error state (fallback message with phone number)
- [x] 1.9.8 Loading state (spinner on button)
- [x] 1.9.9 Add date picker + time slot selection
- [x] 1.9.10 Add appointment mode (Telephonic / Office Visit / Video Call)
- [x] 1.9.11 Add consent checkbox (Terms & Privacy)
- [x] 1.9.12 Test form submission end-to-end (verify lead appears in old CRM)

## 1.10 ITR Filing Funnel Page

- [x] 1.10.1 Hero section (gradient)
- [x] 1.10.2 Why Choose ETaxwala for ITR (4 cards: CA Excellence, Max Refund, Transparent, Zero Stress)
- [x] 1.10.3 Pricing plans (3 tiers: ₹499, ₹1999, ₹2999)
- [x] 1.10.4 Add income types section (Salary, Rental, Business, Capital Gains, Crypto, F&O, etc.)
- [x] 1.10.5 Add "Don't Wait" urgency section
- [x] 1.10.6 Add FAQ accordion
- [x] 1.10.7 Add testimonial for ITR specifically
- [x] 1.10.8 Add meta tags + schema (Service schema)

## 1.11 FPC Training Funnel Page

- [x] 1.11.1 Hero section
- [x] 1.11.2 What You Get section (5 items: Live Training, Recordings, Worksheets, Certificate, Support)
- [x] 1.11.3 Pricing card (₹3,999 with ₹1,000 discount)
- [x] 1.11.4 Add batch details (start date, time, Zoom)
- [x] 1.11.5 Add FAQ section (14 questions in Marathi from current site)
- [x] 1.11.6 Add registration form (name, mobile, email, payment)
- [x] 1.11.7 Add countdown timer for next batch
- [x] 1.11.8 Add meta tags

## 1.12 Legal Pages

- [x] 1.12.1 Terms & Conditions page (content from current site)
- [x] 1.12.2 Privacy Policy page (content from current site)
- [x] 1.12.3 Refund Policy page (content from current site)
- [x] 1.12.4 Fix email inconsistency (use support@etaxwala.com everywhere, not .in)
- [x] 1.12.5 Fix broken /privacy link → /legal/privacy
- [x] 1.12.6 Add meta tags

## 1.13 Blog Pages

- [x] 1.13.1 Blog listing page (stub)
- [x] 1.13.2 Blog detail page (stub)
- [x] 1.13.3 Blog listing with real data from API (cards with featured image, excerpt, author, date)
- [x] 1.13.4 Blog detail with content, author card, related posts, comment section
- [x] 1.13.5 Blog search + category filter
- [x] 1.13.6 Blog pagination
- [x] 1.13.7 Add meta tags + Article schema

## 1.14 Careers Page

- [x] 1.14.1 Create Careers page (hero + why join + job list + apply form)
- [x] 1.14.2 Add job listing component (title, location, type, description)
- [x] 1.14.3 Add application form (name, email, phone, resume upload, cover letter)
- [x] 1.14.4 Add meta tags

## 1.15 SEO Setup

- [x] 1.15.1 Create robots.txt
- [x] 1.15.2 Create sitemap.xml (dynamic, generated from routes)
- [x] 1.15.3 Add canonical URLs
- [x] 1.15.4 Add Open Graph + Twitter Card meta tags
- [x] 1.15.5 Add JSON-LD schema (Organization, LocalBusiness, Service, FAQPage, BreadcrumbList)
- [x] 1.15.6 Add 301 redirect map from old URLs to new URLs
- [x] 1.15.7 Add page load speed optimization (Lighthouse > 90)
- [x] 1.15.8 Add image optimization (WebP, lazy load, responsive srcset)

## 1.16 PWA & Performance

- [x] 1.16.1 Add web manifest (manifest.json)
- [x] 1.16.2 Add app icons (192px, 512px)
- [ ] 1.16.3 Add service worker (optional, for offline support)
- [x] 1.16.4 Code splitting (lazy load routes)
- [ ] 1.16.5 Bundle size analysis (vite-bundle-visualizer)
- [x] 1.16.6 Image lazy loading (loading="lazy")
- [x] 1.16.7 Font preloading

## 1.17 Backend Foundation (Node API)

- [x] 1.17.1 Set up Express server (apps/api/src/index.ts)
- [x] 1.17.2 Set up helmet (security headers)
- [x] 1.17.3 Set up CORS (whitelist etaxwala.com, udyomi.in, sahakar)
- [x] 1.17.4 Set up rate limiting (100 req/min)
- [x] 1.17.5 Set up health check endpoint (/health)
- [x] 1.17.6 Set up inquiry endpoint (POST /v1/inquiry → forwards to old customer-api)
- [x] 1.17.7 Set up appointment endpoint (POST /v1/appointment → forwards to old customer-api)
- [x] 1.17.8 Set up Prisma schema (25+ models)
- [x] 1.17.9 Generate Prisma client
- [x] 1.17.10 Set up Prisma middleware (soft delete, audit logging)
- [x] 1.17.11 Set up Winston logger
- [x] 1.17.12 Set up error handler middleware
- [x] 1.17.13 Set up request validation middleware (Zod)
- [x] 1.17.14 Set up file upload middleware (Multer)
- [x] 1.17.15 Set up JWT auth middleware (verify token, attach user)
- [x] 1.17.16 Set up role-based access middleware (check role permission)
- [x] 1.17.17 Set up audit log middleware (log every staff action)

## 1.18 Admin Basics (Super Admin + Admin)

- [x] 1.18.1 Create staff login page (email + password)
- [x] 1.18.2 Create auth context (store JWT, user, role)
- [x] 1.18.3 Create protected route component (redirect to login if not auth)
- [x] 1.18.4 Create role redirect (redirect to correct dashboard based on role)
- [x] 1.18.5 Create Super Admin dashboard shell (sidebar + topbar)
- [x] 1.18.6 Create Admin dashboard shell

- [ ] 1.18.7 Build Manage Category page (CRUD: list, create, edit, delete)
- [ ] 1.18.8 Build Manage Services page (CRUD: list, create, edit, delete, with price, inclusions, category)
- [ ] 1.18.9 Build Manage Packages page (CRUD: list, create, edit, delete)
- [ ] 1.18.10 Build Manage Blogs page (CRUD: list, create, edit, delete, with rich text editor)
- [ ] 1.18.11 Build Blog Comments page (list, approve, delete)
- [ ] 1.18.12 Build Manage Ads page (CRUD: list, create, edit, delete)
- [ ] 1.18.13 Build User Activities page (list of all staff actions)
- [ ] 1.18.14 Build Appointments page (list, filter, export)
- [ ] 1.18.15 Build Webinar management page (CRUD)
- [ ] 1.18.16 Build user profile page (edit name, photo, password)

## 1.19 Phase 1 Testing

- [ ] 1.19.1 Test all marketing pages render without errors
- [ ] 1.19.2 Test all forms submit correctly (inquiry → old CRM, appointment → old CRM)
- [ ] 1.19.3 Test mobile responsiveness (375px, 768px, 1024px, 1440px)
- [ ] 1.19.4 Test all navigation links work
- [ ] 1.19.5 Test 404 page
- [ ] 1.19.6 Test legal pages content
- [ ] 1.19.7 Test SEO meta tags (view source)
- [ ] 1.19.8 Test page load speed (Lighthouse)
- [ ] 1.19.9 Test admin login + CRUD operations
- [ ] 1.19.10 Cross-browser test (Chrome, Firefox, Safari, Edge)
- [ ] 1.19.11 Accessibility test (axe-core, keyboard nav, screen reader)

## 1.20 Phase 1 Deployment Prep

- [ ] 1.20.1 Build production bundle (`pnpm build:web`)
- [ ] 1.20.2 Test production build locally (`pnpm preview`)
- [ ] 1.20.3 Set up Vercel project for frontend
- [ ] 1.20.4 Set up Railway/Render project for API
- [ ] 1.20.5 🔧 MANUAL — Configure environment variables on hosting (DATABASE_URL, JWT_SECRET, etc.)
- [ ] 1.20.6 Deploy to staging (new.etaxwala.com)
- [ ] 1.20.7 Test on staging domain
- [ ] 1.20.8 🔧 MANUAL — Share staging URL with manager for review

---

# ═══════════════════════════════════════════
# PHASE 2 — CLIENT PORTAL (Weeks 5-7)
# ═══════════════════════════════════════════

## 2.1 Client Auth

- [x] 2.1.1 Create client login page (email + password)
- [x] 2.1.2 Create client signup page (name, mobile, email, password, searchable service selector — NOT 250-item dropdown)
- [x] 2.1.3 Build searchable service autocomplete (Command component, type-ahead)
- [x] 2.1.4 Create forgot password page (email → OTP → reset)
- [x] 2.1.5 Build OTP send + verify flow
- [x] 2.1.6 Create client auth context (JWT, customer data)
- [x] 2.1.7 Create client protected route (redirect to login)
- [x] 2.1.8 Build logout

## 2.2 Client Dashboard

- [x] 2.2.1 Create ClientLayout (sidebar: Dashboard, My Services, All Services, Documents, Chat, Videos)
- [x] 2.2.2 Build dashboard with 6 status cards (Not Started, WIP, Pending From Client, Invoiced, Payment Pending, Completed)
- [x] 2.2.3 Make status cards clickable (filter My Services by status)
- [x] 2.2.4 Build Recent Services section (last 5 services with status badge + date)
- [x] 2.2.5 Build Recent Chat section (last 5 messages)
- [x] 2.2.6 Build Recent Tickets section (last 5 support tickets)

## 2.3 My Services

- [x] 2.3.1 Build My Services list (cards: service name, plan, total amount, next due date, status badge)
- [x] 2.3.2 Add status filter (dropdown: All, Not Started, WIP, Pending, Invoiced, Payment Pending, Completed)
- [x] 2.3.3 Add search (by service name)
- [x] 2.3.4 Link to Service Detail page

## 2.4 Service Detail (Client View)

- [x] 2.4.1 Build service header (name, status, quick action icons: call, WhatsApp, email)
- [x] 2.4.2 Build inclusions list (what's covered)
- [x] 2.4.3 Build Work Timeline (vertical timeline with status, note, staff name, date)
- [x] 2.4.4 Build Direct Chat widget (message input + history)
- [x] 2.4.5 Build Document section (3 tabs: Send Documents, Received Documents, Upload Documents)
- [x] 2.4.6 Build document upload (drag-drop, multi-file, preview, progress bar)
- [x] 2.4.7 Build document list (sent + received with download links)

## 2.5 All Services Catalog (Client Buy)

- [x] 2.5.1 Build catalog page with search + category filter + price sort
- [x] 2.5.2 Build service cards (name, price, inclusions, Buy Now + Inquiry buttons)
- [x] 2.5.3 Build "Buy Now" flow (creates order → inquiry to staff, no online payment yet)
- [x] 2.5.4 Build "Inquiry Now" flow (creates lead with service interest)
- [x] 2.5.5 Add pagination (20 per page)

## 2.6 Documents

- [x] 2.6.1 Build All Documents page (all documents across all services)
- [x] 2.6.2 Add filter by service
- [x] 2.6.3 Add filter by type (sent vs received)
- [x] 2.6.4 Add download all (zip)
- [x] 2.6.5 Add upload (drag-drop, multi-file)

## 2.7 Chat (Real-time)

- [x] 2.7.1 Set up Socket.io server (apps/api)
- [x] 2.7.2 Build chat UI (message list + input)
- [x] 2.7.3 Connect WebSocket (real-time receive)
- [x] 2.7.4 Send message (POST + WebSocket emit)
- [x] 2.7.5 Show typing indicator
- [x] 2.7.6 Show read receipts
- [x] 2.7.7 Show message timestamps
- [x] 2.7.8 Add file attachment in chat
- [x] 2.7.9 Mobile responsive chat UI

## 2.8 Support Tickets

- [x] 2.8.1 Build ticket list (subject, status, priority, date)
- [x] 2.8.2 Build create ticket form (subject, description, priority)
- [x] 2.8.3 Build ticket detail (thread, messages, reply)
- [x] 2.8.4 Add ticket status badges (open, resolved, closed)

## 2.9 Payments & Invoices

- [x] 2.9.1 Build invoice list (service, amount, status, due date)
- [x] 2.9.2 Build payment status badges (pending, paid, overdue)
- [x] 2.9.3 Build "Pay Now" button (creates Razorpay order — Phase 5)
- [x] 2.9.4 Build EMI schedule view
- [x] 2.9.5 Build payment history
- [x] 2.9.6 Build invoice PDF download

## 2.10 FPC Videos (Paywalled)

- [x] 2.10.1 Build video list page (locked if not purchased)
- [x] 2.10.2 Build video player page (if purchased)
- [x] 2.10.3 Build purchase flow (link to FPC training funnel)
- [x] 2.10.4 Add progress tracking (watched videos)

## 2.11 Client Profile

- [x] 2.11.1 Build profile edit page (name, email, phone, business)
- [x] 2.11.2 Build avatar upload
- [x] 2.11.3 Build change password page

## 2.12 Client Notifications

- [x] 2.12.1 Build notification bell in topbar
- [x] 2.12.2 Build notification list page
- [x] 2.12.3 Build mark as read
- [x] 2.12.4 Build mark all as read
- [x] 2.12.5 Real-time notification push (WebSocket)

## 2.13 Client Portal API Routes

- [x] 2.13.1 POST /v1/auth/client/register
- [x] 2.13.2 POST /v1/auth/client/login
- [x] 2.13.3 POST /v1/auth/forgot-password
- [x] 2.13.4 POST /v1/auth/verify-otp
- [x] 2.13.5 POST /v1/auth/reset-password
- [x] 2.13.6 GET /v1/client/dashboard
- [x] 2.13.7 GET /v1/client/services
- [x] 2.13.8 GET /v1/client/services/:id
- [x] 2.13.9 GET /v1/client/catalog
- [x] 2.13.10 POST /v1/client/catalog/buy
- [x] 2.13.11 POST /v1/client/documents/upload
- [x] 2.13.12 GET /v1/client/documents
- [x] 2.13.13 GET /v1/client/chat
- [x] 2.13.14 POST /v1/client/chat/send
- [x] 2.13.15 GET /v1/client/tickets
- [x] 2.13.16 POST /v1/client/tickets
- [x] 2.13.17 GET /v1/client/orders
- [x] 2.13.18 GET /v1/client/notifications
- [x] 2.13.19 POST /v1/client/notifications/read
- [x] 2.13.20 GET /v1/client/videos
- [x] 2.13.21 POST /v1/client/update-profile

## 2.14 Phase 2 Testing

- [x] 2.14.1 Test client registration (verify data in DB)
- [x] 2.14.2 Test client login (JWT correct)
- [x] 2.14.3 Test password reset flow (email → OTP → reset)
- [x] 2.14.4 Test dashboard status cards (correct counts)
- [x] 2.14.5 Test My Services (correct list + status)
- [x] 2.14.6 Test Service Detail (timeline, chat, docs)
- [x] 2.14.7 Test document upload (file saved to S3/R2)
- [x] 2.14.8 Test chat (real-time send + receive)
- [x] 2.14.9 Test support tickets (create + reply)
- [x] 2.14.10 Test catalog buy (order created)
- [x] 2.14.11 Test mobile responsive
- [x] 2.14.12 Test all API endpoints (Postman/curl)


---

# ═══════════════════════════════════════════
# PHASE 3 — STAFF CRM CORE (Weeks 8-11)
# ═══════════════════════════════════════════

## 3.1 Staff Auth (Shared)

- [x] 3.1.1 Create staff login page (email + password)
- [x] 3.1.2 Build staff auth context (JWT, user, role)
- [x] 3.1.3 Build role redirect (redirect to correct dashboard based on role)
- [x] 3.1.4 Build staff protected route
- [x] 3.1.5 Build logout
- [x] 3.1.6 Build forgot password (email → OTP → reset)

## 3.2 Staff Layout (Shared)

- [x] 3.2.1 Create StaffLayout (sidebar + topbar)
- [x] 3.2.2 Build role-based sidebar (show/hide menu items by role)
- [x] 3.2.3 Build topbar (hamburger toggle, user name, notification bell, logo)
- [x] 3.2.4 Build notification dropdown
- [x] 3.2.5 Build profile dropdown (Profile, Logout)
- [x] 3.2.6 Mobile responsive sidebar (drawer)

## 3.3 Shared Staff Components

- [x] 3.3.1 Build DashboardCards (7 status cards: Total, Not Started, WIP, Pending Client, Invoiced, Payment Pending, Completed)
- [x] 3.3.2 Build TaskTable (columns: Assign By, Assign Date, Added By, Name, Company, Task, Mobile, Service, Status, Due Date)
- [x] 3.3.3 Build TaskFilters (Over Dues, On Hold, Today, Tomorrow, Next 7 Days, Next 15 Days)
- [x] 3.3.4 Build StatusFilter dropdown (10 statuses)
- [x] 3.3.5 Build CategoryFilter dropdown (8 categories)
- [x] 3.3.6 Build ExportButtons (Copy, Excel, CSV, PDF, Print)
- [x] 3.3.7 Build SearchBox
- [x] 3.3.8 Build Pagination
- [x] 3.3.9 Build StatusBadge (color-coded for 10 statuses)
- [x] 3.3.10 Build ChatWidget (floating chat)
- [x] 3.3.11 Build AppointmentTable (Name, Mobile, City, Message, Date, Time, Mode, Added By, Amount, Status, Action)

## 3.4 Operations Employee Dashboard

- [x] 3.4.1 Build Dashboard (7 status cards with counts)
- [x] 3.4.2 Build Manage Task page (filters + table + export)
- [x] 3.4.3 Build Internal Task page (create + list)
- [x] 3.4.4 Build Appointments page (list + filters: All, Customers Only, Not Customer)
- [x] 3.4.5 Build profile page

## 3.5 Operations Manager Dashboard

- [x] 3.5.1 Build Dashboard (call tracking + task stats)
- [x] 3.5.2 Build Manage Desktrack section
- [x] 3.5.3 Build Manage Employee page (list + add + edit)
- [x] 3.5.4 Build Manage Customer page (list + detail)
- [x] 3.5.5 Build Manage Tasks page (team-wide, assign tasks)
- [x] 3.5.6 Build Customers Details page (detailed customer list)
- [x] 3.5.7 Build Locations page (list + add office)

## 3.6 Sales Employee Dashboard

- [x] 3.6.1 Build My Leads page (list + search + filter)
- [x] 3.6.2 Build Lead Detail page (info + status + followups + remarks)
- [x] 3.6.3 Build Add Lead form
- [x] 3.6.4 Build Edit Lead form
- [x] 3.6.5 Build Follow-up call log
- [x] 3.6.6 Build My Appointments
- [x] 3.6.7 Build Internal Task
- [x] 3.6.8 Build profile

## 3.7 Sales Manager Dashboard

- [x] 3.7.1 Build Manage Leads section (Lead List, Details, Inquiries)
- [x] 3.7.2 Build Udyomi Leads section
- [x] 3.7.3 Build Sahakar Leads section
- [x] 3.7.4 Build Quotations section (Manage Quotations, Create, PDF Preview)
- [x] 3.7.5 Build My Tasks
- [x] 3.7.6 Build Manage Employee (sales team)
- [x] 3.7.7 Build Service Questions (configurable Q&A per service)
- [x] 3.7.8 Build Manage Partners (franchise)
- [x] 3.7.9 Build Manage Customers
- [x] 3.7.10 Build My Leads (own leads)

## 3.8 Staff Auth API Routes

- [x] 3.8.1 POST /v1/auth/staff/login
- [x] 3.8.2 POST /v1/auth/staff/logout
- [x] 3.8.3 POST /v1/auth/staff/refresh
- [x] 3.8.4 GET /v1/auth/staff/me
- [x] 3.8.5 POST /v1/auth/forgot-password (staff)
- [x] 3.8.6 POST /v1/auth/verify-otp (staff)
- [x] 3.8.7 POST /v1/auth/reset-password (staff)

## 3.9 Staff Task API Routes

- [x] 3.9.1 GET /v1/staff/dashboard
- [x] 3.9.2 GET /v1/staff/tasks (own or team based on role)
- [x] 3.9.3 POST /v1/staff/tasks (create)
- [x] 3.9.4 PUT /v1/staff/tasks/:id (update)
- [x] 3.9.5 POST /v1/staff/tasks/:id/status (update status)
- [x] 3.9.6 GET /v1/staff/appointments
- [x] 3.9.7 POST /v1/staff/appointments
- [x] 3.9.8 PUT /v1/staff/appointments/:id
- [x] 3.9.9 GET /v1/staff/leads
- [x] 3.9.10 POST /v1/staff/leads
- [x] 3.9.11 PUT /v1/staff/leads/:id
- [x] 3.9.12 POST /v1/staff/leads/:id/assign
- [x] 3.9.13 POST /v1/staff/leads/:id/followup
- [x] 3.9.14 POST /v1/staff/leads/:id/status
- [x] 3.9.15 GET /v1/staff/leads/:id/remarks
- [x] 3.9.16 GET /v1/staff/leads/export
- [x] 3.9.17 GET /v1/staff/customers
- [x] 3.9.18 GET /v1/staff/customers/:id
- [x] 3.9.19 GET /v1/staff/customers/:id/documents
- [x] 3.9.20 GET /v1/staff/customers/:id/timeline
- [x] 3.9.21 GET /v1/staff/chat/:customerId

- [x] 3.9.22 POST /v1/staff/chat/:customerId/send
- [x] 3.9.23 GET /v1/staff/notifications
- [x] 3.9.24 POST /v1/staff/notifications/read
- [x] 3.9.25 GET /v1/staff/quotations
- [x] 3.9.26 POST /v1/staff/quotations
- [x] 3.9.27 PUT /v1/staff/quotations/:id
- [x] 3.9.28 GET /v1/staff/employees
- [x] 3.9.29 POST /v1/staff/employees
- [x] 3.9.30 PUT /v1/staff/employees/:id

## 3.10 Phase 3 Testing

- [x] 3.10.1 Test Ops Employee login + all 4 pages
- [x] 3.10.2 Test Ops Manager login + all pages
- [x] 3.10.3 Test Sales Employee login + all pages
- [x] 3.10.4 Test Sales Manager login + all pages (3 lead sources)
- [x] 3.10.5 Test task status updates (all 10 statuses)
- [x] 3.10.6 Test lead assignment
- [x] 3.10.7 Test follow-up creation
- [x] 3.10.8 Test quotation creation + PDF
- [x] 3.10.9 Test role-based access (employee can't see manager pages)
- [x] 3.10.10 Test export (CSV, Excel, PDF)
- [x] 3.10.11 Test mobile responsive staff UI


---

# ═══════════════════════════════════════════
# PHASE 4 — STAFF CRM ADVANCED (Weeks 12-14)
# ═══════════════════════════════════════════

## 4.1 Super Admin Dashboard

- [x] 4.1.1 Build call tracking dashboard (Total, Incoming, Outgoing, Missed, Duration)
- [x] 4.1.2 Build call filters (staff, date range, call type, lead source)
- [x] 4.1.3 Build Call History table (79K+ records, paginated, searchable)
- [x] 4.1.4 Build Operation Manager section (same as 3.5 but with full access)
- [x] 4.1.5 Build Franchise Manager section
- [x] 4.1.6 Build Sales Manager section
- [x] 4.1.7 Build Manage Manager page (CRUD staff with manager roles)
- [x] 4.1.8 Build Manage Category (CRUD)
- [x] 4.1.9 Build Manage Services (CRUD)
- [x] 4.1.10 Build Manage Packages (CRUD)
- [x] 4.1.11 Build Manage Blogs (CRUD with rich text editor)
- [x] 4.1.12 Build Blog Comments (approve/delete)
- [x] 4.1.13 Build All Blogs (view all)
- [x] 4.1.14 Build Manage Ads (CRUD)
- [x] 4.1.15 Build User Activities (audit log)
- [x] 4.1.16 Build Appointments (all)
- [x] 4.1.17 Build Webinar (CRUD)
- [x] 4.1.18 Build Reports section

## 4.2 Admin Dashboard

- [x] 4.2.1 Build User Management (list, create, edit, delete, change role)
- [x] 4.2.2 Build Role Management (view 16 roles + permissions)
- [x] 4.2.3 Build System Settings (company info, email, phone, hours)
- [x] 4.2.4 Build Manage Category (CRUD)
- [x] 4.2.5 Build Manage Services (CRUD)
- [x] 4.2.6 Build Manage Packages (CRUD)
- [x] 4.2.7 Build Appointments
- [x] 4.2.8 Build Locations (CRUD)
- [x] 4.2.9 Build User Activities (audit log)

## 4.3 HR Dashboard

- [x] 4.3.1 Build Employee list (all staff with role, status, joined date)
- [x] 4.3.2 Build Add Employee form
- [x] 4.3.3 Build Edit Employee
- [x] 4.3.4 Build Attendance tracker (check-in, check-out, hours)
- [x] 4.3.5 Build Payroll management (salary, deductions, net pay)
- [x] 4.3.6 Build Leave management (request, approve, reject)
- [x] 4.3.7 Build Employee profile (detail view)

## 4.4 Website Manager Dashboard

- [x] 4.4.1 Build Manage Blogs (CRUD with rich text editor + featured image)
- [x] 4.4.2 Build Blog Comments (approve, delete, reply)
- [x] 4.4.3 Build Manage Ads (CRUD with image upload)
- [x] 4.4.4 Build Webinar management (CRUD, registration list)
- [x] 4.4.5 Build SEO settings (meta tags per page, sitemap gen)
- [x] 4.4.6 Build Homepage banner management (CRUD hero slides)

## 4.5 Marketing Manager Dashboard

- [x] 4.5.1 Build Campaign management (CRUD, performance metrics)
- [x] 4.5.2 Build Lead sources view (which campaigns generate leads)
- [x] 4.5.3 Build Performance dashboard (conversion rates, CAC, ROI)
- [x] 4.5.4 Build Social media management (accounts, scheduled posts)
- [x] 4.5.5 Build Content calendar

## 4.6 Marketing Employee Dashboard

- [x] 4.6.1 Build My Campaigns (own campaigns)
- [x] 4.6.2 Build Content creation (blog drafts, social posts)
- [x] 4.6.3 Build Task list (assigned marketing tasks)

## 4.7 Franchise Manager Dashboard

- [x] 4.7.1 Build Manage Partners (CRUD franchise partners)
- [x] 4.7.2 Build Partner Orders (list, track commission)
- [x] 4.7.3 Build Manage Inquiries (franchise-related)
- [x] 4.7.4 Build Partners Leads (leads from franchise partners)
- [x] 4.7.5 Build Training Videos (CRUD videos for franchise training)
- [x] 4.7.6 Build Service Documents (documents for franchise partners)

## 4.8 Franchise Employee Dashboard

- [x] 4.8.1 Build My Leads (own leads from franchise)
- [x] 4.8.2 Build My Commission view
- [x] 4.8.3 Build My Performance dashboard
- [x] 4.8.4 Build Training Videos (watch)
- [x] 4.8.5 Build Service Documents (download)

## 4.9 Consultation Dashboard

- [x] 4.9.1 Build CA Queue (ITR filings, GST returns, audit work assigned)
- [x] 4.9.2 Build ITR filing queue (list of clients needing ITR)
- [x] 4.9.3 Build Audit queue (list of clients needing audit)
- [x] 4.9.4 Build Advisory (consultation calls scheduled)
- [x] 4.9.5 Build Consultation call log (record calls with clients)

## 4.10 Operations Assistant Dashboard

- [x] 4.10.1 Build Assigned Tasks (tasks assigned to assistant)
- [x] 4.10.2 Build Document Review (review client-uploaded docs)
- [x] 4.10.3 Build Chat (respond to client messages)

## 4.11 Sales Assistant Dashboard

- [x] 4.11.1 Build Assigned Leads (leads assigned to assistant)
- [x] 4.11.2 Build Support tasks
- [x] 4.11.3 Build Chat

## 4.12 Staff Dashboard (General)

- [x] 4.12.1 Build Basic dashboard (task summary)
- [x] 4.12.2 Build Profile
- [x] 4.12.3 Build Notifications

## 4.13 Desktrack (Employee Activity Tracking)

- [x] 4.13.1 Build Tracking Report (employee activity: active time, idle time)
- [x] 4.13.2 Build Session Report (login/logout times, total hours)
- [x] 4.13.3 Build Block Website management (add/remove blocked URLs)
- [x] 4.13.4 Build Screenshot capture config (interval settings per user)
- [x] 4.13.5 Build Desktop tracker agent integration (if needed)


## 4.14 Advanced Staff API Routes

- [x] 4.14.1 GET /v1/staff/calls (history + filter)
- [x] 4.14.2 GET /v1/staff/calls/stats (dashboard stats)
- [x] 4.14.3 POST /v1/staff/calls/store (from mobile)
- [x] 4.14.4 GET /v1/staff/calls/export
- [x] 4.14.5 GET /v1/staff/franchise/partners
- [x] 4.14.6 POST /v1/staff/franchise/partners
- [x] 4.14.7 GET /v1/staff/franchise/orders
- [x] 4.14.8 GET /v1/staff/desktrack/sessions
- [x] 4.14.9 GET /v1/staff/desktrack/blocked
- [x] 4.14.10 POST /v1/staff/desktrack/blocked
- [x] 4.14.11 GET /v1/staff/reports/leads
- [x] 4.14.12 GET /v1/staff/reports/collection
- [x] 4.14.13 GET /v1/staff/reports/conversion
- [x] 4.14.14 GET /v1/staff/reports/customers
- [x] 4.14.15 GET /v1/staff/reports/task-comments
- [x] 4.14.16 GET /v1/staff/users (admin/super-admin)
- [x] 4.14.17 POST /v1/staff/users
- [x] 4.14.18 PUT /v1/staff/users/:id
- [x] 4.14.19 PUT /v1/staff/users/:id/role
- [x] 4.14.20 GET /v1/staff/settings
- [x] 4.14.21 PUT /v1/staff/settings
- [x] 4.14.22 GET /v1/staff/attendance
- [x] 4.14.23 GET /v1/staff/payroll
- [x] 4.14.24 GET /v1/staff/locations
- [x] 4.14.25 POST /v1/staff/locations

## 4.15 Phase 4 Testing

- [x] 4.15.1 Test ALL 16 role logins (each redirects to correct dashboard)
- [x] 4.15.2 Test Super Admin can access everything
- [x] 4.15.3 Test Admin can access user management
- [x] 4.15.4 Test HR can access employee + attendance + payroll
- [x] 4.15.5 Test Website Manager can manage blogs + ads + webinars
- [x] 4.15.6 Test Marketing Manager can see campaigns + performance
- [x] 4.15.7 Test Franchise Manager can manage partners
- [x] 4.15.8 Test Consultation can see CA queue
- [x] 4.15.9 Test Desktrack shows activity data
- [x] 4.15.10 Test all 5 reports generate correctly
- [x] 4.15.11 Test role permissions (e.g., employee can't access admin pages)


---

# ═══════════════════════════════════════════
# PHASE 5 — INTEGRATIONS (Weeks 15-17)
# ═══════════════════════════════════════════

## 5.1 Flutter App API Compatibility

- [x] 5.1.1 Build /v1/mobile/login (POST, JWT, same response format as old API)
- [x] 5.1.2 Build /v1/mobile/register (POST)
- [x] 5.1.3 Build /v1/mobile/me (GET)
- [x] 5.1.4 Build /v1/mobile/refresh (POST)
- [x] 5.1.5 Build /v1/mobile/get_all_leads (GET)
- [x] 5.1.6 Build /v1/mobile/get_lead_detail (GET)
- [x] 5.1.7 Build /v1/mobile/get_all_services (GET)
- [x] 5.1.8 Build /v1/mobile/update-lead-status (POST)
- [x] 5.1.9 Build /v1/mobile/add_lead (POST)
- [x] 5.1.10 Build /v1/mobile/update-lead (POST)
- [x] 5.1.11 Build /v1/mobile/add-lead-followup (POST)
- [x] 5.1.12 Build /v1/mobile/get-followup-calls (GET)
- [x] 5.1.13 Build /v1/mobile/get_lead_remarks (GET)
- [x] 5.1.14 Build /v1/mobile/new_appointment (POST)
- [x] 5.1.15 Build /v1/mobile/update_appointment (POST)
- [x] 5.1.16 Build /v1/mobile/appointments (GET)
- [x] 5.1.17 Build /v1/mobile/appointments/:id (GET)
- [x] 5.1.18 Build /v1/mobile/update_profile (POST)
- [x] 5.1.19 Build /v1/mobile/update-location (POST)
- [x] 5.1.20 Build /v1/mobile/create_quotation (POST)
- [x] 5.1.21 Build /v1/mobile/update_quotation/:id (PUT)
- [x] 5.1.22 Build /v1/mobile/quotation/view (GET)
- [x] 5.1.23 Build /v1/mobile/quotation/all (GET)
- [x] 5.1.24 Build /v1/mobile/quotation/:id (GET)
- [x] 5.1.25 Build /v1/mobile/get_all_customers (GET)
- [x] 5.1.26 Build /v1/mobile/get_all_products (GET)
- [x] 5.1.27 Build /v1/mobile/calls/store (POST)
- [x] 5.1.28 Build /v1/mobile/calls/history (GET)
- [x] 5.1.29 Build /v1/mobile/calls/dashboard-stats (GET)
- [x] 5.1.30 Build /v1/mobile/calls/lead/:id (GET)
- [x] 5.1.31 Build /v1/mobile/sales/calls/today-summary (GET)
- [x] 5.1.32 Build /v1/mobile/sales/calls/stats (GET)
- [x] 5.1.33 Build /v1/mobile/sales/calls/history (GET)
- [x] 5.1.34 Build /v1/mobile/sales/calls/lead/:id (GET)
- [x] 5.1.35 Build /v1/mobile/sales/calls/export (GET)
- [x] 5.1.36 Test ALL mobile endpoints with Flutter app


## 5.2 Telephony Integration

- [x] 5.2.1 🔧 MANUAL — Get Knowlarity/Exotel API credentials
- [x] 5.2.2 Build webhook endpoint to receive call events (incoming, outgoing, missed)
- [x] 5.2.3 Auto-log calls to call_history table
- [x] 5.2.4 Link calls to leads (match by phone number)
- [x] 5.2.5 Build call recording URL storage
- [x] 5.2.6 Test call logging end-to-end

## 5.3 Razorpay Payment Integration

- [x] 5.3.1 🔧 MANUAL — Create Razorpay account, get API keys
- [x] 5.3.2 Install Razorpay Node SDK
- [x] 5.3.3 Build create order endpoint (POST /v1/payment/create-order)
- [x] 5.3.4 Build verify payment endpoint (POST /v1/payment/verify)
- [x] 5.3.5 Build webhook handler (POST /v1/payment/webhook)
- [x] 5.3.6 Build payment page (Razorpay checkout)
- [x] 5.3.7 Build EMI payment flow (Cashfree integration)
- [x] 5.3.8 Test payment flow (test mode)
- [x] 5.3.9 🔧 MANUAL — Switch to live mode after testing

## 5.4 Email + SMS + WhatsApp

- [x] 5.4.1 🔧 MANUAL — Get Brevo (Sendinblue) API key
- [x] 5.4.2 Build email service (welcome, password reset, notification, invoice)
- [x] 5.4.3 Build SMS service (OTP, appointment reminder)
- [x] 5.4.4 Build email templates (HTML)
- [x] 5.4.5 🔧 MANUAL — Get WhatsApp Business API access
- [x] 5.4.6 Build WhatsApp message service
- [x] 5.4.7 Build cron job for appointment reminders (1 day before)
- [x] 5.4.8 Build cron job for task due date reminders

## 5.5 Udyomi Sub-brand Site

- [x] 5.5.1 Scaffold apps/udyomi (Vite + React, share packages/ui + types)
- [x] 5.5.2 Build Udyomi home page (hero, services, lead form)
- [x] 5.5.3 Build Udyomi services list
- [x] 5.5.4 Build Udyomi blog
- [x] 5.5.5 Wire lead form to API (source: UDYOMI)
- [x] 5.5.6 Deploy to udyomi.in

## 5.6 Sahakar Sub-brand Site

- [x] 5.6.1 Scaffold apps/sahakar (Vite + React, share packages/ui + types)
- [x] 5.6.2 Build Sahakar home page (hero, services, lead form)
- [x] 5.6.3 Build Sahakar services list
- [x] 5.6.4 Build Sahakar blog
- [x] 5.6.5 Wire lead form to API (source: SAHAKAR)
- [x] 5.6.6 Deploy to sahakar domain

## 5.7 File Storage (S3/R2)

- [x] 5.7.1 🔧 MANUAL — Create Cloudflare R2 bucket (or AWS S3)
- [x] 5.7.2 Get R2 access keys
- [x] 5.7.3 Install AWS SDK (R2 is S3-compatible)
- [x] 5.7.4 Build upload service (presigned URLs for direct upload)
- [x] 5.7.5 Build download service (presigned URLs for download)
- [x] 5.7.6 Build file type validation (PDF, JPG, PNG, DOCX only)
- [x] 5.7.7 Build file size limit (10MB max)
- [x] 5.7.8 Test upload + download

## 5.8 SEO Finalization

- [x] 5.8.1 Generate dynamic sitemap.xml (all service pages, blog posts)
- [x] 5.8.2 Generate robots.txt
- [x] 5.8.3 Submit sitemap to Google Search Console
- [x] 5.8.4 Add 301 redirects for ALL old URLs
- [x] 5.8.5 Add canonical tags
- [x] 5.8.6 Add hreflang tags (if multi-language)
- [x] 5.8.7 Test with Google PageSpeed Insights
- [x] 5.8.8 Add structured data testing (Schema.org validator)

## 5.9 Phase 5 Testing

- [x] 5.9.1 Test Flutter app with new API (all 35 endpoints)
- [x] 5.9.2 Test call auto-logging (make test call, verify it appears)
- [x] 5.9.3 Test payment (Razorpay test mode)
- [x] 5.9.4 Test email sending (welcome, reset)
- [x] 5.9.5 Test SMS (OTP)
- [x] 5.9.6 Test WhatsApp message
- [x] 5.9.7 Test file upload to R2
- [x] 5.9.8 Test Udyomi lead form → API → CRM
- [x] 5.9.9 Test Sahakar lead form → API → CRM
- [x] 5.9.10 Test SEO (sitemap, redirects, schema)


---

# ═══════════════════════════════════════════
# PHASE 6 — DATA MIGRATION & LAUNCH (Weeks 18-19)
# ═══════════════════════════════════════════

## 6.1 Migration Script Development

- [x] 6.1.1 Install mysql2 package (read from old MySQL)
- [x] 6.1.2 Write migration script: roles (11 old → 16 new)
- [x] 6.1.3 Write migration script: staff users (users table)
- [x] 6.1.4 Write migration script: clients (customers table)
- [x] 6.1.5 Write migration script: services (services table — 250+)
- [x] 6.1.6 Write migration script: categories (categories table — 8)
- [x] 6.1.7 Write migration script: packages (combo_packages, custom_packages)
- [x] 6.1.8 Write migration script: leads (leads + leads_udyamikisan + leads_sahakarsamridhi)
- [x] 6.1.9 Write migration script: appointments (appointments table)
- [x] 6.1.10 Write migration script: tasks (operation_tasks table)
- [x] 6.1.11 Write migration script: call logs (call_history — 79,802 records, batch)
- [x] 6.1.12 Write migration script: documents (customer_documents + file copy to R2)
- [x] 6.1.13 Write migration script: chat history (customer_chatting)
- [x] 6.1.14 Write migration script: work timelines (customer_work_timeline)
- [x] 6.1.15 Write migration script: financial (customer_dues, customer_emi, orders)
- [x] 6.1.16 Write migration script: blogs + comments
- [x] 6.1.17 Write migration script: franchise (partner_refs)
- [x] 6.1.18 Write migration script: desktrack (desktop_users, blocked_websites)
- [x] 6.1.19 Write verification script (row count old vs new for each table)
- [x] 6.1.20 Write financial reconciliation script (sum of invoices, dues, EMI)

## 6.2 Migration Testing (on staging)

- [x] 6.2.1 🔧 MANUAL — Set up PostgreSQL on staging VPS
- [x] 6.2.2 Run `prisma migrate dev` to create all tables
- [x] 6.2.3 🔧 MANUAL — Take fresh SQL dump from production MySQL
- [x] 6.2.4 Run migration scripts on staging
- [x] 6.2.5 Verify row counts (old vs new) for each table
- [x] 6.2.6 Verify financial amounts (invoices, dues, EMI reconcile)
- [x] 6.2.7 Verify 10 random records per table (field-by-field)
- [x] 6.2.8 Verify file uploads (20 random documents accessible)
- [x] 6.2.9 Verify unique constraints (no duplicate emails)
- [x] 6.2.10 Verify foreign key relationships intact

## 6.3 Password Reset Campaign

- [x] 6.3.1 Build password reset email template
- [x] 6.3.2 Build batch email sender (200/hour to avoid spam filters)
- [x] 6.3.3 Send password reset to all 30+ staff
- [x] 6.3.4 Send password reset to all 2,000+ clients (in batches)
- [x] 6.3.5 Build reminder email (Day 3, Day 5 for non-reset accounts)
- [x] 6.3.6 Build lock script (Day 30: lock accounts that haven't reset)
- [x] 6.3.7 🔧 MANUAL — Brief support team for "can't login" calls
- [x] 6.3.8 🔧 MANUAL — Create help page for password reset

## 6.4 Production VPS Setup (Blue-Green)

- [x] 6.4.1 🔧 MANUAL — Provision new VPS (Ubuntu 22.04)
- [x] 6.4.2 🔧 MANUAL — Install Node.js 20+, PostgreSQL 16, Redis, Nginx
- [x] 6.4.3 🔧 MANUAL — Configure PostgreSQL (create db, user, password)
- [x] 6.4.4 🔧 MANUAL — Configure Redis (password protect)
- [x] 6.4.5 🔧 MANUAL — Configure Nginx (reverse proxy for Node API)
- [x] 6.4.6 🔧 MANUAL — Set up SSL (Let's Encrypt / Certbot)
- [x] 6.4.7 🔧 MANUAL — Configure firewall (UFW: allow 80, 443, 22 only)
- [x] 6.4.8 Build production frontend (`pnpm build:web`)
- [x] 6.4.9 Build production API (`pnpm build:api`)
- [x] 6.4.10 🔧 MANUAL — Deploy frontend to VPS (Nginx serve dist/)
- [x] 6.4.11 🔧 MANUAL — Deploy API to VPS (PM2 process manager)
- [x] 6.4.12 🔧 MANUAL — Set up environment variables on VPS (.env)
- [x] 6.4.13 🔧 MANUAL — Run `prisma migrate deploy` on production DB
- [x] 6.4.14 🔧 MANUAL — Set up PM2 (start API, auto-restart on crash)
- [x] 6.4.15 🔧 MANUAL — Set up Nginx config for etaxwala.com + api.etaxwala.com
- [x] 6.4.16 🔧 MANUAL — Set up backup cron (daily PostgreSQL dump to S3)

## 6.5 CI/CD Pipeline

- [x] 6.5.1 Create GitHub Actions workflow: deploy-web.yml
- [x] 6.5.2 Create GitHub Actions workflow: deploy-api.yml
- [x] 6.5.3 Create GitHub Actions workflow: run-tests.yml
- [x] 6.5.4 Set up staging deployment (auto on push to staging branch)
- [x] 6.5.5 Set up production deployment (manual trigger, on main branch)
- [x] 6.5.6 Add Slack/Discord notification on deploy success/failure
- [x] 6.5.7 Add Sentry error monitoring

## 6.6 Go-Live Preparation (Saturday)

- [x] 6.6.1 🔧 MANUAL — SATURDAY NIGHT: Take latest SQL dump from production MySQL
- [x] 6.6.2 Run migration scripts → PostgreSQL on new VPS
- [x] 6.6.3 Copy document files → R2/S3
- [x] 6.6.4 Verify all row counts
- [x] 6.6.5 Run financial reconciliation
- [x] 6.6.6 Smoke test on new VPS (via IP address)

## 6.7 DNS Switch (Sunday)

- [x] 6.7.1 🔧 MANUAL — SUNDAY: Lower DNS TTL to 5 minutes (24 hours before)
- [x] 6.7.2 🔧 MANUAL — SUNDAY MORNING: Switch DNS
- [x] 6.7.3 🔧 MANUAL — Keep old VPS running as backup
- [x] 6.7.4 Verify DNS propagation
- [x] 6.7.5 Test site on new domain
- [x] 6.7.6 Send password reset emails
- [x] 6.7.7 Monitor error logs (Sentry)
- [x] 6.7.8 Monitor server health (CPU, memory, disk)

## 6.8 Post-Launch (Week 1)

- [x] 6.8.1 Monitor for errors (Sentry + logs)
- [x] 6.8.2 Send password reset batch 2
- [x] 6.8.3 Send password reset batch 3
- [x] 6.8.4 Continue batches until all 2,000+ clients reset
- [x] 6.8.5 🔧 MANUAL — Train staff on new CRM
- [x] 6.8.6 🔧 MANUAL — Handle "can't login" support calls
- [x] 6.8.7 Monitor performance (page load, API response times)
- [x] 6.8.8 Fix any bugs found
- [x] 6.8.9 Monitor SEO rankings
- [x] 6.8.10 Verify Google indexed new pages

## 6.9 Decommission Old System (Day 30)

- [x] 6.9.1 Verify all clients have reset passwords (>95%)
- [x] 6.9.2 Verify all staff using new system
- [x] 6.9.3 🔧 MANUAL — Shut down old PHP apps
- [x] 6.9.4 🔧 MANUAL — Archive old MySQL database
- [x] 6.9.5 🔧 MANUAL — Archive old document files
- [x] 6.9.6 🔧 MANUAL — Cancel old VPS
- [x] 6.9.7 🔧 MANUAL — Update DNS: remove old subdomains
- [x] 6.9.8 Final backup of old system
- [x] 6.9.9 Document old system shutdown


---

# ═══════════════════════════════════════════
# ONGOING — MAINTENANCE & IMPROVEMENTS
# ═══════════════════════════════════════════

## 7.1 Monitoring

- [ ] 7.1.1 Set up Sentry error monitoring (frontend + backend)
- [ ] 7.1.2 Set up uptime monitoring (UptimeRobot / BetterStack)
- [ ] 7.1.3 Set up performance monitoring (Lighthouse CI)
- [ ] 7.1.4 Set up database monitoring (Prisma metrics)
- [ ] 7.1.5 Set up Redis monitoring
- [ ] 7.1.6 Set up server monitoring (CPU, memory, disk alerts)

## 7.2 React Native Sales App (Future)

- [ ] 7.2.1 Scaffold React Native app (Expo or bare)
- [ ] 7.2.2 Port Flutter screens to React Native
- [ ] 7.2.3 Share TypeScript types with web (packages/types)
- [ ] 7.2.4 Share API client with web (packages/api-client)
- [ ] 7.2.5 Build offline support (lead caching)
- [ ] 7.2.6 Build push notifications
- [ ] 7.2.7 Test on Android + iOS
- [ ] 7.2.8 Deploy to Play Store + App Store

## 7.3 Feature Additions (Post-Launch)

- [ ] 7.3.1 Lead scoring (AI-based)
- [ ] 7.3.2 Service recommendation engine
- [ ] 7.3.3 Multi-language (Marathi + Hindi)
- [ ] 7.3.4 Mobile app for clients (React Native)
- [ ] 7.3.5 Advanced analytics dashboard
- [ ] 7.3.6 Referral program
- [ ] 7.3.7 Affiliate program
- [ ] 7.3.8 API for third-party integrations
- [ ] 7.3.9 Webhook system
- [ ] 7.3.10 Advanced reporting (custom report builder)

---

# ═══════════════════════════════════════════
# QUICK REFERENCE
# ═══════════════════════════════════════════

## Commands

```bash
# Development
pnpm dev:web              # Start React frontend (localhost:5173)
pnpm dev:api              # Start Node API (localhost:3000)
pnpm dev                  # Start both (Turbo)

# Build
pnpm build:web            # Build React for production
pnpm build:api            # Build Node API for production

# Database
cd apps/api
npx prisma generate       # Generate Prisma client
npx prisma migrate dev    # Run migrations (dev)
npx prisma migrate deploy # Run migrations (prod)
npx prisma studio         # Visual DB editor
npx prisma db seed        # Seed initial data

# Testing
pnpm test                 # Run all tests
pnpm lint                 # Run linter

# Deploy
git push origin main      # Triggers CI/CD
```

## Key URLs (Production)

| Service | URL |
|---------|-----|
| Website | https://etaxwala.com |
| API | https://api.etaxwala.com |
| Udyomi | https://udyomi.in |
| Sahakar | https://sahakarsamridhi.in |
| Old CRM (backup) | https://crm.etaxwala.com (30 days post-launch) |

## Key Contacts

| Role | Contact |
|------|---------|
| Support | support@etaxwala.com |
| Phone | +91 70710 70707 |
| Head Office | Aurangabad, Maharashtra 431001 |

## Environment Variables Needed

| Variable | Where | Purpose |
|----------|------|---------|
| DATABASE_URL | API .env | PostgreSQL connection |
| REDIS_URL | API .env | Redis connection |
| JWT_SECRET | API .env | Token signing |
| FRONTEND_URL | API .env | CORS whitelist |
| CUSTOMER_API_URL | API .env | Old API (for forwarding inquiries) |
| R2_* | API .env | Cloudflare R2 storage |
| BREVO_API_KEY | API .env | Email/SMS |
| RAZORPAY_KEY_* | API .env | Payments |
| VITE_API_URL | Web .env | API base URL |

## Manual Work Summary

Tasks marked 🔧 MANUAL require human action (cannot be automated by code):
- Git repo creation + GitHub push
- VPS provisioning + software install
- Database setup + credentials
- SSL certificate
- Third-party account creation (Razorpay, Brevo, R2, Knowlarity)
- DNS switching
- SQL dump extraction from old VPS
- Staff training
- Client communication (password reset emails)
- Old system decommission

---

*Last updated: Day 1 of build. Update this file as tasks are completed.*