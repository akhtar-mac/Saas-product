# Prisma migrate deploy is not used for etaxwala.in

The historical Prisma migrations in `../migrations_postgres_archive` were generated as **PostgreSQL** SQL (`SERIAL`, `TIMESTAMPTZ`). They must never be applied to the live Hostinger MariaDB database (`u571670246_etax_crm`).

For go-live, after explicit approval, apply only:

`../sql/2026-11-13_add_new_tables_mysql.sql`

See `DEPLOY_ETAXWALA_IN.md` at the repository root.
