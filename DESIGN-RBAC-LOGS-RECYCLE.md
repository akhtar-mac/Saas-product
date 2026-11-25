# ETaxwala CRM (dnyanvedh.com) — RBAC, All-User Activity Logs & Recycle Bin Design

**Branch / Base:** `design/rbac-logs-recycle` (from `80786c3` in `/workspace/review-partner`, Madhur's main line + deployed fixes)
**Status:** Design & Add-Only SQL Draft ONLY (no code deployed, no live SQL executed)
**Shared Database Constraint:** Both the new CRM (`dnyanvedh.com` / `api.dnyanvedh.com`) and the untouched legacy Laravel app (`etaxwala.com`) share `u571670246_etax_crm` on MariaDB `11.8.9-MariaDB-log`. Every schema change must be **100% add-only** (`CREATE TABLE IF NOT EXISTS`, `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, nullable/defaulted columns) so `etaxwala.com` keeps working uninterrupted.

---

> **As built (25 Nov 2026, branch `design/rbac-logs-recycle`).** This document is the original design. What changed while building:
>
> - No `rbac_roles` / `rbac_permissions` / `rbac_role_permissions` tables: roles (all 16 kept), the option catalogue and role defaults live in code (`apps/api/src/rbac/catalog.ts`). The DB holds only per-user changes (`rbac_user_access`, `rbac_user_permission_overrides`). No Prisma schema change; raw SQL with runtime schema detection, so code works before and after the SQL.
> - One global API guard (`rbac/route-guard.ts`) maps routes to options and pins non-"view all" users to their own data; a granted manager option (e.g. _See all leads_, _See all calls_) lifts the pin for that option across the whole company.
> - Only Super Admin and Admin can add/remove options; nobody can grant an option they do not hold; only Super Admin can grant Super-Admin-only options or edit a Super Admin. HR can create/edit/deactivate staff below Admin but not change options.
> - Leads use a `deleted_at` flag (child tables cascade); customers, orders, tasks, service questions and staff accounts are archived to `recycle_bin_items` with their related rows and re-inserted on restore. Restore: Super Admin + Admin. Delete forever: Super Admin only (typed confirmation).
> - Activity Logs: every staff POST/PUT/PATCH/DELETE, logins/logouts and exports, with secrets redacted; times stored UTC, shown IST. Retention 1 year via `apps/api/scripts/purge-audit-logs.mjs` (dry run by default; not scheduled).
> - Department Hubs removal and the sign-out modal were done by the Ops Manager branch, not here.
> - Live steps: see `RUNBOOK-RBAC-LOGS-RECYCLE.md`.

## 1. Current-State Findings (Audit of New App, Old App & Live DB)

### 1.1 Roles, Users & Access Control Today

#### A. Legacy Laravel App (`etaxwala.com`, `/workspace/etax-old/code`)

- **Single user table (`users`, 114 rows total / 101 active):** Stores `user_type` (`1..11`), `company_id` (tenant/franchise scope, e.g. `ETax1` or `0`), `added_by`, and plaintext `password`.
- **Role IDs (`users.user_type`):**
  `1` Super Admin, `2` Admin, `3` Sales Manager, `4` Operations Manager, `5` Franchise Manager, `6` Sales Executive, `7` Operations Executive, `8` Franchise Executive, `9` Operations Assistant, `10` Consultation, `11` Marketing Manager. (`0` is Customer in `customers`.)
- **No RBAC tables:** `staff_users` and `staff_user_roles` on the DB are completely ignored by Laravel.
- **Menu & route gating (`resources/views/ui/header.blade.php`):** Hardcoded `@switch(Session::get('user_type'))` with ad-hoc user-ID exceptions (e.g. `user_id == 91`, `user_id == 61` in `OEController` / sidebar). `@case(9)` (Operations Assistant) is missing; `@case(10)` lacks `@break` so Consultation inherits Marketing Manager items.
- **User creation:** Split across role controllers (`SuperAdmin::AddNewAdmin`, `Admin::AddAdminManager`, `SMController::AddEmployee`, `OMController::AddEmployee`, `FMController::AddEmployee`, `OperationAssistant`). Managers can only create fixed subordinates under their own `user_type`, `added_by`, and `company_id`, with zero per-user permission customisation.

#### B. New CRM App (`dnyanvedh.com`, `/workspace/review-partner-rbac`)

A partial RBAC structure already exists (`staff_users`, `staff_user_roles`, `permissions.ts`, `requirePermission`), **but it has 6 critical gaps that prevent real role-based + per-user access today**:

1. **Dual-table split-brain (`users` vs `staff_users`):**
   - `POST /v1/auth/staff/login` (`apps/api/src/routes/auth.routes.ts`) checks `users` **first**. If found (`fromUsersTable = true`), it ignores `staff_users` completely and computes permissions from a hardcoded `rolePermissionsMap` inside `auth.routes.ts`. Any custom permissions edited in `staff_users` are silently ignored for legacy staff!
   - Meanwhile, `/v1/admin/users` (`users.routes.ts`) and `/v1/crm/users` (`crm.routes.ts`) only read/write `staff_users` + `staff_user_roles`, never `users`.
   - `staff_users` currently has 116 rows (seeded `id=1..18` + imported legacy users at matching IDs like `41, 42, 43...`, plus `support@etaxwala.com` mapped to `staff_users.id=16` vs `users.id=40`).

2. **Role ID numbering mismatch across 4 files:**
   - `users.user_type`: `3=SM, 4=OM, 5=FM, 6=SE, 7=OE, 8=FE, 9=OA, 10=Consultation, 11=MM`.
   - `auth.routes.ts` (`ROLE_MAP`, `userTypeToRoleIdMap`) & `users.routes.ts` & `crm-user-management-page.tsx`: `3=OM, 4=SM, 5=MM, 6=FM, 7=SE, 8=OE, 9=ME, 10=FP, 11=Consultation, 12=OA, 13=SA, 14=HR, 15=Website Manager, 16=Staff`. Note the bug in `auth.routes.ts`: `user_type=6` (Sales Exec) and `user_type=7` (Ops Exec) **both** map to `role_id=7`.
   - `apps/web/src/features/crm/permissions.ts` (`ROLE_DEFAULT_PERMISSIONS`): `5=FM, 6=MM, 7=OE, 8=FE, 9=OE, 10=ME, 11=FP, 12=Consultation, ... 17=Staff` — `SALES_EMPLOYEE` isn't even a numeric key!
   - `apps/web/src/features/crm/crm-layout.tsx`: `ALL_ROLE_OPTIONS` filter maps `SALES_EMPLOYEE -> 6` and `CONSULTATION -> 10`.

3. **`staff_users.permissions` column is `VARCHAR(191)` (truncation bug!):**
   - Verified on live and box MariaDB: `staff_users.permissions` is `varchar(191)`. Row `id=18` in DB is already truncated mid-JSON at 191 chars (`...,"it:leads","it:quotations`), causing `JSON.parse()` to fail silently on login (`catch {}`).

4. **API permission middleware is unused on core CRM routes:**
   - `requirePermission()` exists in `apps/api/src/middleware/auth.middleware.ts`, **but is called 0 times** across the entire API.
   - `apps/api/src/routes/crm.routes.ts` (6,160 lines: leads, customers, orders, tasks, quotations, `/crm/users`, reports) only applies `verifyJWT` — **zero role or permission checks**. Any logged-in employee can call `GET/POST/PUT/DELETE /v1/crm/users`, `DELETE /v1/crm/customers/:id`, or `DELETE /v1/crm/tasks/:id`.
   - Other routers (`orders.routes.ts`, `call-analytics.routes.ts`, `hr.routes.ts`, `marketing.routes.ts`, `it-desk.routes.ts`, `desktrack.routes.ts`, `users.routes.ts`) only check `requireRole([...])` — so granting an employee an extra manager permission still gets blocked by `403` unless `requirePermission` replaces/augments `requireRole`.

5. **Frontend sidebar & routes mix `can()` with hardcoded role exclusions:**
   - `crm-layout.tsx` wraps accordions in `isSuperAdmin`, `isOpsManager`, `!isSalesEmployee`, `!isFranchiseManager`, `showAdminSection`, etc. Granting a Sales Employee `operations:customers` or `call_analytics:view` has no effect if the parent accordion is hidden by role flags.
   - `App.tsx` only guards ~8 routes with `<CrmProtectedRoute allowedRoleIds={[...]} />`; `/crm/leads`, `/crm/accounts`, `/crm/tasks`, `/crm/call-analytics`, `/crm/quotations`, `/crm/workforce` have no route guard.
   - `hasUserPermission()` only supports additive permissions (union), with **no explicit revoke/deny** mechanism.

6. **Split user-management UIs:**
   - `/crm/users` (`crm-user-management-page.tsx`) filters the table to `MANAGER_ROLE_IDS` only, hiding employees.
   - `/crm/workforce` (`hr-workforce-page.tsx`) creates/deletes employees via the unguarded `/v1/crm/users` endpoints.

---

### 1.2 Logging & Audit Trail Today

| Table                    |        Live Rows | Written By                                               | Contents / Gap                                                                                                                                                                                                                                                                           |
| ------------------------ | ---------------: | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `audit_logs`             |            **0** | `hr`, `marketing`, `disbursement`, `it-desk` routes only | Schema exists (`actor_id, actor_email, actor_role, action, resource, resource_id, payload, ip_address, user_agent, created_at`), unused by `auth`, `users`, `crm`, `orders`, `desktrack`. `auditLog()` middleware in `audit.middleware.ts` has `// TODO: Phase 4 — write to audit_logs`. |
| `user_activity`          |           37,909 | Old Laravel only                                         | Staff login/logout/last_activity sessions. New CRM `auth.routes.ts` does not write to it.                                                                                                                                                                                                |
| `system_logs`            | 62,344 (~1.7 GB) | Desktrack desktop client                                 | `event_type` enum (`login, logout, working_start, lunch_start, meeting_start, outside_start, idle, screenshot`) + `longblob` screenshots.                                                                                                                                                |
| `lead_remarks`           |          212,649 | Old + New CRM                                            | Lead status transitions & remarks.                                                                                                                                                                                                                                                       |
| `customer_work_timeline` |           32,695 | Old + New CRM                                            | Task/delivery milestones.                                                                                                                                                                                                                                                                |
| `event_logs`             |                1 | Legacy SQL event                                         | Unused for staff auditing.                                                                                                                                                                                                                                                               |

---

### 1.3 Deletes Today (Hard vs Soft Delete)

- **Only `appointments.is_delete`** (`int(11)`, default `0`) is a soft-delete column in the entire database.
- `customers`, `blogs`, `ads`, `webinars`, `coupons`, `affiliates`, `staff_users` have `is_active`, yet `DELETE /v1/crm/customers/:id` **hard-deletes** rows anyway.
- **New API (`dnyanvedh.com`) hard-deletes:**
  - `DELETE /v1/crm/customers/:id` -> hard-deletes `customer_emi`, `operation_tasks`, `orders` (or `customers` + `operation_tasks` + `customer_emi`).
  - `DELETE /v1/crm/tasks/:id` -> hard-deletes `task_assign`, `operation_tasks`.
  - `DELETE /v1/crm/internal-tasks/:id` -> hard-deletes `task_comments`, `task_excel`.
  - `DELETE /v1/crm/service-questions/:id` -> hard-deletes `service_questions`.
  - `DELETE /v1/admin/users/:id` & `/v1/crm/users/:id` -> hard-deletes `staff_user_roles`, `staff_users`.
  - `DELETE /v1/crm/desktrack/blocked/:id` & `/ips/:id` -> hard-deletes `blocked_websites`, `ips`.
  - Leads & Quotations have no backend `DELETE` route yet (`crm-quotations-page.tsx` only deletes from React state).
- **Old Laravel app (`etaxwala.com`) hard-deletes (CRITICAL for shared DB):**
  - `LeadController::DeleteSalesLead` -> `DELETE` from `lead_assign`, `leads`.
  - `LeadUdyamikisanController` / `LeadsahakarsamriddhiController` -> `DELETE` from `leads_udyamikisan` / `leads_sahakarsamridhi`.
  - `OMController::deleteCustomer` -> `DELETE` from `orders`, `customer_chatting`, `customer_documents`, `customer_emi`, `customer_dues`, `customer_work_timeline`, `operation_tasks` (+ `task_assign`), `customers`.
  - `OMController::deleteTask` & `OperationAssistant::DeleteCustomerTask` -> `DELETE` from `operation_tasks`, `task_assign`, `customer_work_timeline`.
  - `QuotationController` -> `DELETE` from `sales`, `quotations`.
  - `Admin::DeleteManager`, `SuperAdmin::DeleteAdmin`, `SMController`, `OMController`, `FMController`, `OperationAssistant` -> `DELETE` from `users`.
  - `BlogController` / `CommentController` -> `DELETE` from `blogs` / `comments`.

---

## 2. Target Architecture

### 2.1 Pillar 1 — Unified RBAC (Roles + Per-User Grants & Revokes)

#### A. Canonical Role Registry (`rbac_roles`)

We standardize on one canonical `role_id` (`1..16`) across API, DB, and Frontend, with an explicit `legacy_user_type` column so `users.user_type` (`1..11`) never collides again:

| `role_id` | `role_key`             | Display Name                 | `legacy_user_type` | Category       |
| --------: | ---------------------- | ---------------------------- | -----------------: | -------------- |
|         1 | `super_admin`          | Super Admin                  |                  1 | Executive      |
|         2 | `admin`                | Admin                        |                  2 | Executive      |
|         3 | `operations_manager`   | Operations Manager           |                  4 | Operations     |
|         4 | `sales_manager`        | Sales Manager                |                  3 | Sales          |
|         5 | `marketing_manager`    | Marketing Manager            |                 11 | Marketing      |
|         6 | `franchise_manager`    | Franchise Manager            |                  5 | Partners       |
|         7 | `sales_employee`       | Sales Employee               |                  6 | Sales          |
|         8 | `operations_employee`  | Operations Employee          |                  7 | Operations     |
|         9 | `marketing_employee`   | Marketing Employee           |               NULL | Marketing      |
|        10 | `franchise_partner`    | Franchise Partner / Exec     |                  8 | Partners       |
|        11 | `consultation`         | Consultation (CA Expert)     |                 10 | Experts        |
|        12 | `operations_assistant` | Operations Assistant         |                  9 | Operations     |
|        13 | `sales_assistant`      | Sales Assistant              |               NULL | Sales          |
|        14 | `hr`                   | HR Manager                   |               NULL | Administration |
|        15 | `website_manager`      | Website / Sub-Brands Manager |               NULL | Administration |
|        16 | `staff`                | Staff / Support              |               NULL | Administration |

_(Note: Fix `crm.routes.ts`, `permissions.ts`, `auth.routes.ts`, `users.routes.ts`, and `crm-layout.tsx` to read this single map from `@etaxwala/types` + DB `rbac_roles`.)_

#### B. Complete Permission Catalogue (`rbac_permissions`)

Every sidebar module and every sensitive sub-action gets a `<module>:<action>` key (70+ keys grouped into 10 categories):

1. **Dashboard:** `dashboard:view`
2. **Operations:** `operations:view`, `operations:employees`, `operations:customers_view`, `operations:customers_create`, `operations:customers_edit`, `operations:customers_delete`, `operations:customer_details`, `operations:customer_timeline`, `operations:customer_orders`, `operations:customer_dues`, `operations:tasks_view`, `operations:tasks_create`, `operations:tasks_assign`, `operations:tasks_edit`, `operations:tasks_delete`, `operations:internal_tasks_view`, `operations:internal_tasks_manage`, `operations:locations_view`
3. **Desktrack & Monitoring:** `desktop_tracking:view`, `desktop_tracking:manage_users`, `desktop_tracking:manage_ips`, `desktop_tracking:block_websites`
4. **Sales & Leads:** `sales:view`, `leads:view_own`, `leads:view_team`, `leads:view_all`, `leads:create`, `leads:edit`, `leads:assign`, `leads:delete`, `leads:export`, `leads:subbrands`, `quotations:view`, `quotations:create`, `quotations:edit`, `quotations:delete`, `workforce:view`, `accounts:view`, `service_questions:manage`
5. **Call Reports & Analytics:** `calls:view_own`, `calls:view_team`, `calls:view_all`, `calls:log`, `calls:export`
6. **Franchise & Partners:** `franchise:view`, `franchise:partners_manage`, `franchise:orders_view`, `franchise:inquiries_manage`, `franchise:leads_manage`, `franchise:training_view`
7. **Appointments:** `appointments:view`, `appointments:create`, `appointments:edit`, `appointments:delete`
8. **Catalog & Content (Admin):** `categories:manage`, `services:manage`, `packages:manage`, `coupons:manage`, `blogs:manage`, `ads:manage`, `webinars:manage`
9. **HR, Marketing & IT (when enabled):** `hr:view`, `hr:ats`, `hr:payroll`, `marketing:view`, `marketing:social`, `marketing:ads`, `marketing:attribution`, `it:view`, `it:leads`, `it:quotations`, `it:projects`, `infrastructure:view`
10. **Admin, Users, Logs & Recycle Bin:** `admin:view`, `users:view`, `users:create`, `users:edit`, `users:deactivate`, `users:grant_permissions`, `users:delete`, `roles:manage`, `logs:view`, `logs:export`, `recycle_bin:view`, `recycle_bin:restore`, `recycle_bin:purge`
11. **Chat & Disbursements:** `chat:view`, `chat:send`, `chat:attachments`, `disbursements:request`, `disbursements:approve`

#### C. Default Role Permissions + Per-User Grants & Revokes

Instead of storing comma/JSON text in `staff_users.permissions` (`VARCHAR(191)`), we use **two normalized tables**:

1. `rbac_role_permissions (role_id, permission_key)` — defines the default permissions for each of the 16 roles.
2. `staff_user_permission_overrides (id, staff_user_id, permission_key, effect ENUM('grant','revoke'), granted_by, reason, created_at, updated_at)` — stores **only the delta** per employee:
   - **Grant (`+`):** e.g., Admin creates a Sales Employee (`role_id=7`) and checks `calls:view_all`, `workforce:view`, `operations:customers_view` (options normally belonging to a Manager).
   - **Revoke (`-`):** e.g., Admin creates an Operations Manager (`role_id=3`) but unchecks `operations:customers_delete` for that specific person.

**Effective Permission Formula (Single Source of Truth in `apps/api/src/services/rbac.service.ts`):**

```text
if (user has role_id === 1 [Super Admin]) -> ['*']
else:
  roleDefaults = UNION of rbac_role_permissions for all user.role_ids
  grants       = { p | override.effect === 'grant' }
  revokes      = { p | override.effect === 'revoke' }
  effective    = (roleDefaults ∪ grants) \ revokes
```

#### D. Resolving the `users` <-> `staff_users` Split-Brain

1. Add nullable `legacy_user_id INT NULL` and `company_id VARCHAR(20) NULL` on `staff_users` (plus index).
2. During login (`POST /v1/auth/staff/login`):
   - If authenticated against legacy `users` (plaintext / hash), look up the linked `staff_users` row by `legacy_user_id = users.id` or `LOWER(email)`. If none exists yet, auto-create a shadow `staff_users` row (`legacy_user_id = users.id`, mapped `role_id`, `company_id`) so every legacy user immediately participates in RBAC overrides and audit logs.
   - Always resolve `effectivePermissions` via `rbac.service.ts` (never hardcoded `rolePermissionsMap` in `auth.routes.ts`).
3. When Admin creates/edits/deactivates a user in the new CRM:
   - Write to `staff_users`, `staff_user_roles`, and `staff_user_permission_overrides`.
   - Optionally (only if user toggles "Also allow login on old etaxwala.com"), do **not** break old `users` or keep `users.status` synced; default is `staff_users` only until confirmed with owner.

#### E. API Enforcement (`requirePermission`)

1. Upgrade `requirePermission(keys, mode = 'OR')` in `auth.middleware.ts`:
   - Reads user's effective permissions from a short-TTL in-memory cache (`30s`, invalidated immediately on user role/override update) keyed by `staff_user_id` (falling back to `req.user.permissions` on JWT). Result: granting or revoking an option takes effect within seconds without forcing re-login.
2. Replace `requireRole(...)` and add missing guards on every router:
   - `crm.routes.ts`: Guard every route! E.g. `GET /leads` -> `requirePermission(['leads:view_own', 'leads:view_team', 'leads:view_all'])` + data scope filter (`own`: `assign_to = user_id`, `team`: `company_id` / `added_by`, `all`: unrestricted); `DELETE /customers/:id` -> `requirePermission(['operations:customers_delete'])`; `/crm/users` -> `requirePermission(['users:view' | 'users:create' | 'users:edit' | 'users:delete'])` (or deprecate duplicate `/crm/users` in favor of `/admin/users`).
   - `call-analytics.routes.ts`: `analytics/me` -> `calls:view_own`; `analytics/team` -> `calls:view_team`; `analytics/all` -> `calls:view_all`.
   - `users.routes.ts`: `GET /` -> `users:view`; `POST /` -> `users:create`; `PATCH /:id` -> `users:edit`; `PUT /:id/permissions` -> `users:grant_permissions`; `DELETE /:id` -> `users:delete` (or soft-delete).
   - **Privilege-escalation guard:** A user calling `POST /users` or `PUT /users/:id/permissions` can **never** grant `role_id = 1` or any permission key they do not themselves hold (unless they are `super_admin`).

#### F. Frontend Sidebar, Route Guard & Admin UI

1. **Sidebar (`crm-layout.tsx`):**
   - Remove hardcoded role exclusions (`!isSalesEmployee`, `!isOpsManager`, `showAdminSection`, etc.) and remove the "Department Hubs" section label (per user feedback).
   - Every sidebar item & accordion renders purely based on `can('<permission>')` (computed from `effectivePermissions` returned by `/v1/auth/staff/login` and `/v1/auth/staff/me`, honoring `grants` and `revokes`!).
   - Accordion group renders if **at least one** child item passes `can(...)`.
   - Add two new items under **Admin / Support**:
     - **Activity Logs** (`/crm/logs`, `can('logs:view')`)
     - **Recycle Bin** (`/crm/recycle-bin`, `can('recycle_bin:view')`)
   - **Sign Out Confirmation Modal:** Clicking "Sign Out" opens a themed modal (`Cancel` / `Sign Out`, matching the calmer MNC theme) before clearing the session.
2. **Route Guard (`CrmProtectedRoute` in `App.tsx`):**
   - Support `requiredPermission?: string | string[]` on every `/crm/*` route instead of `allowedRoleIds`, so an employee granted an extra manager feature can actually open the page!
3. **Unified User Management UI (`/crm/users`, replacing split `/crm/users` + `/crm/workforce` creation):**
   - Tabs: **All Staff**, **Managers & Admins**, **Executives & Partners**.
   - **Create / Edit User Modal:**
     - Step 1: Name, Email, Phone, Password (hashed with `bcrypt`), Primary Role (+ optional Secondary Roles), Department / Company Scope.
     - Step 2: **Permission Matrix** grouped by module (`Operations`, `Sales & Leads`, `Call Reports`, `Customers`, `Tasks`, `Quotations`, `Franchise`, `Catalog`, `Admin / Logs / Recycle Bin`).
     - Each toggle shows its source state clearly:
       - **Role Default** (grey/blue pill: inherited from selected role)
       - **+ Extra Grant** (emerald pill: added beyond role default, e.g. Sales Employee given Call Report / Manage Customer)
       - **- Revoked** (rose pill: removed from role default)
     - Quick presets: `Load Role Defaults`, `Copy Permissions From User...` (optional helper).

---

### 2.2 Pillar 2 — All-User Activity Logs (`/crm/logs`)

#### A. What Gets Logged

1. **Authentication:** `LOGIN_SUCCESS`, `LOGIN_FAILED` (email only, never password), `LOGOUT`, `USER_DEACTIVATED_BLOCKED`.
2. **Users & RBAC:** `USER_CREATE`, `USER_UPDATE`, `USER_DEACTIVATE`, `USER_REACTIVATE`, `ROLE_ASSIGN`, `ROLE_REMOVE`, `PERMISSION_OVERRIDE_UPDATE` (captures exact `addedGrants`, `removedGrants`, `addedRevokes`).
3. **CRM Core:** `LEAD_CREATE`, `LEAD_UPDATE`, `LEAD_ASSIGN`, `LEAD_STATUS_CHANGE`, `LEAD_FOLLOWUP_ADD`, `LEAD_REMARK_ADD`, `LEAD_IMPORT`, `LEAD_DELETE`, `LEAD_RESTORE`.
4. **Customers, Orders & Dues:** `CUSTOMER_CREATE`, `CUSTOMER_UPDATE`, `ORDER_CREATE`, `PAYMENT_DUES_UPDATE`, `CUSTOMER_DELETE`, `ORDER_DELETE`, `CUSTOMER_RESTORE`.
5. **Tasks & Operations:** `TASK_CREATE`, `TASK_ASSIGN`, `TASK_STATUS_CHANGE`, `TASK_EFFORT_ADD`, `TASK_DELETE`, `INTERNAL_TASK_CREATE/UPDATE/DELETE`.
6. **Quotations, Appointments, Catalog & Finance:** `QUOTATION_CREATE/UPDATE/DELETE`, `APPOINTMENT_CREATE/UPDATE/DELETE`, `SERVICE_QUESTION_CRUD`, `DISBURSEMENT_REQUEST/APPROVE/REJECT`, `DESKTRACK_CONFIG_CHANGE`.
7. **Recycle Bin:** `RECYCLE_RESTORE`, `RECYCLE_PURGE` (permanent delete).

#### B. Schema & Middleware Wiring

- Reuse the existing `audit_logs` table (currently `0` rows on live) and add 4 add-only nullable columns:
  - `actor_name VARCHAR(120) NULL`
  - `module VARCHAR(50) NULL` (e.g. `auth`, `users`, `leads`, `customers`, `tasks`, `orders`, `quotations`, `recycle_bin`, `desktrack`)
  - `summary VARCHAR(500) NULL` (human-readable one-liner, e.g. `"Changed lead #18421 status from New to Interested"`)
  - `status VARCHAR(20) NOT NULL DEFAULT 'success'` (`success` / `denied` / `error`)
- Wire `auditLog()` middleware / `recordAuditLog()` helper across `auth`, `users`, `crm`, `orders`, `desktrack`, `chat` (keeping `sanitizePayload()` redacting `password`, `token`, `secret`, `cvv`, `card_number`).
- Also write login/logout rows to `user_activity` if needed for legacy report compatibility, OR keep `audit_logs` as the unified source for `/crm/logs` with a secondary tab for **Desktrack Sessions** (`system_logs` metadata without `longblob` screenshots) and **Legacy Login Sessions** (`user_activity`).

#### C. Admin Logs Page UI (`/crm/logs`)

- **Permission:** `logs:view` (default: Super Admin, Admin; export requires `logs:export`).
- **Filters:** User (searchable dropdown), Module, Action type, Status (`success`/`denied`), Date range (`Today`, `Yesterday`, `Last 7 Days`, `Last 30 Days`, `Custom`), Search (`resource_id`, `summary`, `actor_email`, `IP`).
- **Table Columns:** Time (IST / `Asia/Kolkata`), Staff User + Role badge, Module, Action badge, Target (`leads #18421`), Summary, IP Address, Details drawer (`oldState` vs `newState` JSON diff).
- **Retention & Archival:** Recommend 180-day hot retention in `audit_logs` (or configurable; see Questions).

---

### 2.3 Pillar 3 — Recycle Bin (`/crm/recycle-bin`)

#### A. Soft-Delete Columns + Central `recycle_bin_items` Table

Every soft-deletable table gets three **add-only nullable/defaulted columns**:
`deleted_at DATETIME NULL`, `deleted_by INT NULL`, `delete_reason VARCHAR(255) NULL` (plus index on `deleted_at`).

Covered entities:

1. **Leads:** `leads`, `leads_udyamikisan`, `leads_sahakarsamridhi`
2. **Customers & Orders:** `customers`, `orders`
3. **Tasks:** `operation_tasks`, `task_excel` (internal tasks)
4. **Sales & Consultations:** `quotations`, `appointments` (already has `is_delete`, sync `is_delete=1` + `deleted_at`), `service_questions`
5. **Catalog & Content:** `categories`, `services`, `combo_packages`, `coupons`, `blogs`, `ads`, `webinars`
6. **Staff Accounts:** `staff_users`

Plus one central index/snapshot table **`recycle_bin_items`**:

- `id`, `entity_type` (`lead`, `lead_udyami`, `lead_sahakar`, `customer`, `order`, `task`, `internal_task`, `quotation`, `appointment`, `service_question`, `category`, `service`, `package`, `coupon`, `blog`, `staff_user`), `entity_id`, `display_title`, `display_subtitle`, `company_id`, `payload_snapshot` (`LONGTEXT` JSON of deleted row), `related_snapshot` (`LONGTEXT` JSON of child rows soft-deleted/affected), `deleted_by`, `deleted_by_name`, `deleted_by_role`, `delete_reason`, `deleted_at`, `status` (`'deleted' | 'restored' | 'purged'`), `restored_by`, `restored_at`, `purged_by`, `purged_at`.

#### B. How Soft Delete & Cascade Restore Work

- **Soft Delete (`DELETE /v1/crm/.../:id`):**
  1. Wraps in a Prisma transaction (`$transaction`):
     - Reads the target row + child rows (e.g. for Customer: linked `orders`, `operation_tasks`, `customer_emi`, `customer_dues`; for Lead: `lead_assign`).
     - Writes a `recycle_bin_items` row with `payload_snapshot` + `related_snapshot`.
     - Sets `deleted_at = NOW(), deleted_by = req.user.user_id` on the parent (and cascades `deleted_at` to dependent child rows like `orders` / `operation_tasks`, plus sets `is_active = 0` on `customers`, `blogs`, `coupons`, `webinars`, `ads`, `staff_users` and `is_delete = 1` on `appointments`).
     - Writes `audit_logs` (`action = 'DELETE'`).
  2. All `GET` / `COUNT` queries in the new API filter `deleted_at IS NULL` (including raw SQL queries in `crm.routes.ts`!).
- **Restore (`POST /v1/crm/recycle-bin/:id/restore`):**
  - Requires `recycle_bin:restore`.
  - Sets `deleted_at = NULL, deleted_by = NULL, delete_reason = NULL` (and `is_active = 1` / `is_delete = 0`) on the entity and any child records soft-deleted in the same timestamp/batch.
  - Marks `recycle_bin_items.status = 'restored', restored_by, restored_at = NOW()`.
  - Writes `audit_logs` (`action = 'RESTORE'`).
- **Permanent Delete / Purge (`DELETE /v1/crm/recycle-bin/:id/purge`):**
  - **Super Admin (`role_id = 1`) ONLY** (`recycle_bin:purge`), with confirmation modal requiring typed `"DELETE"` or password re-check.
  - Runs the actual SQL `DELETE` on the entity + child tables, marks `recycle_bin_items.status = 'purged'` (retaining metadata for audit compliance), and writes `audit_logs` (`action = 'PURGE'`).

#### C. Shared Database Behaviour with Old Laravel App (`etaxwala.com`)

Because `etaxwala.com` stays live and untouched on the same MariaDB database:

1. **Old app reads:**
   - Setting `is_active = 0` (on `customers`, `blogs`, `coupons`, `webinars`, `ads`) and `is_delete = 1` (on `appointments`) already hides soft-deleted items in most old-app screens.
   - **Important caveat:** The old Laravel app does **not** filter `deleted_at IS NULL` on `leads`, `leads_udyamikisan`, `leads_sahakarsamridhi`, `orders`, `operation_tasks`, `quotations`, `task_excel`, `services`, `categories`, `combo_packages`. Therefore, a lead or task soft-deleted in `dnyanvedh.com` will remain visible in `etaxwala.com` unless staff stop using `etaxwala.com` for those modules OR a tiny read-filter patch is later approved on `etaxwala.com`.
2. **Old app hard-deletes:**
   - As documented in §1.3, `etaxwala.com` still runs SQL `DELETE FROM leads / customers / orders / operation_tasks / quotations / users`.
   - **Optional safety net (not enabled by default):** If staff are still actively deleting in `etaxwala.com`, MySQL `BEFORE DELETE` triggers on `leads` / `customers` / `orders` / `operation_tasks` could copy `OLD.*` into `recycle_bin_items` (though re-inserting auto-increment IDs on restore has edge cases with child rows). Recommendation: keep old app untouched, do deletions in `dnyanvedh.com`, and decide whether a `BEFORE DELETE` capture trigger is wanted during transition.

---

## 3. Phased Implementation Plan & Effort Estimates

| Phase                                                  | Scope                                                                                                                                                                                                                                                                                                                      | Deliverables                                                                                                |        Effort Estimate |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------: |
| **Phase 0: DB Prep**                                   | Run add-only SQL migration & seed `rbac_roles`, `rbac_permissions`, `rbac_role_permissions` (box test first, then live with backup).                                                                                                                                                                                       | SQL applied, Prisma schema updated (`prisma db pull` / model additions, **no `migrate deploy`/`db push`**). |            **0.5 day** |
| **Phase 1: RBAC Backend & Auth Unification**           | Fix `ROLE_MAP` mismatch, link `users` <-> `staff_users` at login, `rbac.service.ts` (defaults + grants - revokes + 30s cache), replace `requireRole` / guard `crm.routes.ts` with `requirePermission` + data scoping, `/v1/admin/users` permission-override endpoints + escalation guard.                                  | Auth + API RBAC enforcement complete.                                                                       |       **2.5 – 3 days** |
| **Phase 2: RBAC Frontend & Sign-Out Modal**            | Update `permissions.ts`, `auth-store.ts`, `CrmProtectedRoute` (`requiredPermission`), refactor `crm-layout.tsx` sidebar to pure `can(...)` (remove Department Hubs heading), add themed Sign-Out confirmation modal, unify `/crm/users` & `/crm/workforce` Create/Edit User modal with role-default + grant/revoke badges. | Role-based sidebar & Admin User/Permission UI complete.                                                     |       **2 – 2.5 days** |
| **Phase 3: All-User Audit Logging & Logs Page**        | Upgrade `audit_logs` columns, wire `recordAuditLog` into `auth`, `users`, `crm`, `orders`, `desktrack`, `chat`, add `GET /v1/admin/logs` + CSV export, build `/crm/logs` UI with filters & JSON diff drawer.                                                                                                               | Full audit trail & Admin Logs page.                                                                         |       **1.5 – 2 days** |
| **Phase 4: Recycle Bin (Soft Delete, Restore, Purge)** | Update all `DELETE` routes + add lead/quotation soft-delete routes, add `deleted_at IS NULL` across `crm.routes.ts` / `orders.routes.ts` / `flutter-compat.routes.ts`, build `GET/POST/DELETE /v1/admin/recycle-bin`, build `/crm/recycle-bin` UI + restore/purge confirmations.                                           | Full Recycle Bin across CRM entities.                                                                       |       **2.5 – 3 days** |
| **Phase 5: QA, Regression & Live Cutover**             | Test all 16 roles + custom grants/revokes on box DB, verify old `etaxwala.com` smoke flows, verify mobile app (`/api/*`) unaffected, backup & deploy to `dnyanvedh.com`.                                                                                                                                                   | Verified release on `dnyanvedh.com`.                                                                        |       **1 – 1.5 days** |
| **Total**                                              |                                                                                                                                                                                                                                                                                                                            |                                                                                                             | **10 – 12.5 dev days** |

---

## 4. Open Questions for the Owner (`akthar shaikh`)

1. **Roles & Default Permissions:** Should we keep all 16 roles in the new CRM (`Super Admin`, `Admin`, `Operations Manager`, `Sales Manager`, `Marketing Manager`, `Franchise Manager`, `Sales Employee`, `Operations Employee`, `Marketing Employee`, `Franchise Partner`, `Consultation`, `Operations Assistant`, `Sales Assistant`, `HR`, `Website Manager`, `Staff`), or hide/merge roles you don't use right now (e.g. `HR`, `Website Manager`, `Marketing Employee`)?
2. **Who Can Grant Extra Permissions?** When creating/editing a user, should **only Super Admin & Admin** be able to grant extra permissions (e.g. giving an employee a manager's option), or should **Department Managers** (SM, OM, FM) also be allowed to grant options within their own department?
3. **Admin (`role_id = 2`) vs Super Admin (`role_id = 1`):** Currently `Admin` has wildcard `['*']` access just like `Super Admin`. Should `Admin` also have full access, or should some sensitive actions (like permanent delete in Recycle Bin or editing Super Admin) be **Super Admin only**?
4. **Data Scope When Granting Extra Features:** If an Admin gives a Sales Employee access to **Call Report** or **Manage Customer**, should they see **only their own** records, **their team's** records, or **all company** records? (Or should there be a toggle per permission: `Own / Team / All`?)
5. **Logs Retention & Scope:** How long should activity logs be kept (e.g. 6 months / 1 year / forever), and should **Activity Logs** include login/logout & Desktrack events in tabs on the same page, or only CRM actions?
6. **Recycle Bin Scope & Purge:** Which items must go to Recycle Bin (Leads, Sub-brand Leads, Customers, Orders, Operations Tasks, Internal Tasks, Quotations, Appointments, Service Questions, Catalog/Blogs, Staff Users)? Who is allowed to **Restore** (Admin + Super Admin, or Managers too?), and should **Permanent Delete** be restricted to **Super Admin only** with auto-purge after e.g. 30/90 days or manual-only?
7. **Old App (`etaxwala.com`) Overlap:** While staff still use `etaxwala.com`, any item soft-deleted in `dnyanvedh.com` (`leads`, `orders`, `tasks`) will still show up in `etaxwala.com` unless we hide it there too. Are staff switching to `dnyanvedh.com` soon, or do you want a lightweight soft-delete filter / delete-capture trigger on the shared DB?
8. **Old-Dashboard Logins Helpful to Inspect:** You offered ID/Password for old dashboards to verify flows—the most helpful ones to inspect (or confirm) are:
   - **Super Admin** (`user_type = 1`) — to confirm `Manage Admin / Manager / Employee` flow.
   - **Admin** (`user_type = 2`) — to confirm `Manage Manager`, `User Activity`, and global report flows.
   - **Operations Manager** (`user_type = 4`) — to confirm `Manage Customer`, `Manage Tasks`, `Delete Order/Task`, and `Call Report` flows (especially alongside the OM fixes!).
   - **Sales Manager** (`user_type = 3`) & **Sales Executive** (`user_type = 6`) — to confirm lead/quotation/employee scoping.
   - **Operations Assistant** (`user_type = 9`) — since its sidebar was broken/empty in the old app, to confirm what an OA is actually supposed to see.
