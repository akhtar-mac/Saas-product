# New tenant deployment

This build is a single-tenant CRM. Give each client their own VPS and MySQL database. Do not point `DATABASE_URL` at etaxwala.com or dnyanvedh.com.

## 1. Database

Create an empty MySQL database, then apply the SQL that matches your dump:

1. Import the CRM schema if you are cloning an existing structure.
2. Apply `MIGRATION-RBAC-LOGS-RECYCLE.sql` and `MIGRATION-HRMS-PROFILE.sql` if those tables are not already there.
3. Apply `apps/api/prisma/migrations/20261127120000_white_label_autoincrement_careers/migration.sql`.

That last file adds tenant settings, careers tables, and turns manual `MAX(id)+1` primary keys into `AUTO_INCREMENT`.

## 2. Environment

Copy `apps/api/.env.example` to `apps/api/.env` and `apps/web/.env.example` to `apps/web/.env`. Set `DATABASE_URL`, `JWT_SECRET`, and `ENCRYPTION_KEY`. Leave payment and messaging secrets empty; enter them later in Workspace settings.

## 3. Synthetic data

From the repository root:

```bash
pnpm install
pnpm --filter @etaxwala/api db:seed:synthetic
```

Every seeded person uses the password `Demo@12345`.

| Role               | Email                         |
| ------------------ | ----------------------------- |
| Admin              | admin@demo.crm.local          |
| Operations manager | ops.manager@demo.crm.local    |
| Sales executive    | sales.agent@demo.crm.local    |
| People lead        | hr.lead@demo.crm.local        |
| Marketing lead     | marketing.lead@demo.crm.local |

The seed also writes a fictional brand, Northstar Advisory. Change it under CRM → Workspace settings.

## 4. Existing plaintext passwords

If a restored database still stores plaintext passwords, hash them before anyone signs in. The API no longer accepts a plaintext match.

```bash
pnpm --filter @etaxwala/api db:hash-legacy-passwords
```

The script prints counts only. Empty password columns must be reset by an administrator. Customer passwords are widened to `VARCHAR(255)` so a bcrypt hash fits.

## 5. Run the apps

```bash
pnpm --filter @etaxwala/api dev
pnpm --filter @etaxwala/web dev
```

- CRM login: http://localhost:5173/crm/login
- Workspace settings: http://localhost:5173/crm/settings
- Marketing automation: http://localhost:5173/crm/marketing-automation

Marketing sends, publishes, and ad launches stay in dry-run. Nothing is posted to Meta, Google, WhatsApp, SMS, or email, and no money is spent.

## 6. Custom domain

Point the client's DNS at this VPS, set `FRONTEND_URL`, `CUSTOM_DOMAIN`, and `CORS_ORIGINS`, then restart the API. The same values can be reviewed under Workspace settings → Domain.
