# Deploying ETaxwala 2.0 on etaxwala.in

This note is only about going live on **etaxwala.in** beside the existing Laravel site on **etaxwala.com**, sharing the same MariaDB database `u571670246_etax_crm`. It is not a licence to change production until that go-live is explicitly approved.

## Do not run Prisma migrate deploy

`apps/api/prisma/migrations_postgres_archive` holds the original Prisma migrations. They are PostgreSQL dialect and are **unsafe** on the live MariaDB 11.8.x server. `prisma migrate deploy` must not be run against production. A `prisma migrate diff` of the previous Prisma schema against the live database also proposed drops, column shrinks, and primary-key changes on existing Laravel tables — that script must never be applied.

## Add-only SQL (the only schema change to run later)

After approval, apply this file on the Hostinger host, against `u571670246_etax_crm` over **localhost**:

`apps/api/prisma/sql/2026-11-13_add_new_tables_mysql.sql`

It only creates the 25 new ETaxwala 2.0 tables (utf8mb4, InnoDB) and foreign keys **between those new tables**. It does not drop, rename, shrink, or alter existing Laravel tables. It is idempotent (safe to run twice). It was tested twice against a local restore of the production schema on MariaDB 11.8.6; production is MariaDB 11.8.9. After a successful run, `prisma migrate diff` from that database to `schema.prisma` was empty.

`schema.prisma` is aligned to the live MySQL schema (`prisma db pull`), with the 25 new models merged back. `meetings.hostedby` is mapped to the live column `hostedBy`. Two live tables without a primary key (`internal_chat_groups`, `internal_communications`) are present as `@@ignore` models so Prisma will not try to drop or “fix” them.

## Application build

`pnpm build` must stay green (API + web) before a deploy. Redis is not required: the API does not open a Redis connection.

## Suggested Hostinger layout (not yet created)

- `etaxwala.in` — Vite static build of `apps/web`
- `api.etaxwala.in` — Node.js app, entry `apps/api/dist/index.js`
- `DATABASE_URL` must use **localhost** on the same Business hosting account (username `u571670246`). Do not use the remote `srv647.hstgr.io` host from the application.
- Do not modify etaxwala.com or its existing subdomains.
- `etaxwala.in` must finish domain verification (`pending_verification` / `manual_review`) before DNS and SSL can be completed.

## Remaining risks

- `client_credentials_vault.project_id` is not a Prisma relation to `it_projects`, so Prisma will not add a foreign key on that existing table. Application code already uses `project_id` as a scalar.
- Live `users.id` is `BIGINT UNSIGNED`. Call-analytics code now converts those values with `Number(...)` where a JS number is required.
- Legacy tables without a usable Prisma primary key are ignored by Prisma Client.
