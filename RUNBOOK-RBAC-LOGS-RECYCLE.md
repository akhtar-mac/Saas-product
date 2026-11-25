# Live runbook — RBAC, Activity Logs, Recycle Bin (dnyanvedh.com)

**Status: NOT applied to live. Needs the owner's go-ahead for each live step.**
Files: `MIGRATION-RBAC-LOGS-RECYCLE.sql` (add-only), branch `design/rbac-logs-recycle`.
Database: `u571670246_etax_crm` (MariaDB 11.8.9), shared with the old etaxwala.com app and the mobile backend.

## 0. Order of work

The new API detects the schema at runtime (`information_schema`, cached 5 min), so either order is safe:

| State                    | What staff see                                                                                                                                                                                                                                              |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| New code, **no SQL yet** | Login, menus and role defaults work. Activity Logs show the old columns only. Recycle Bin page says "not set up"; deleting leads/items returns a clear 503 and **removes nothing**. Saving extra options returns a clear 503. Tested (premig_test.py, 9/9). |
| SQL applied, old code    | Nothing changes: all new columns are NULLable with no default; old app, mobile API and old new-app code ignore them. Tested on the box copy.                                                                                                                |
| Both                     | Everything on.                                                                                                                                                                                                                                              |

Recommended: **SQL first (quiet hour), then deploy code.**

## 1. Backup (before anything)

Low-traffic window (e.g. after 9 PM IST). From a machine with DB access:

```bash
TS=$(date +%Y%m%d-%H%M)
mysqldump --single-transaction --quick --routines --triggers \
  -h <host> -u <user> -p u571670246_etax_crm > etax_crm_full_$TS.sql
# small, fast extra copy of the tables we ALTER
mysqldump --single-transaction -h <host> -u <user> -p u571670246_etax_crm \
  audit_logs leads leads_udyamikisan leads_sahakarsamridhi > etax_crm_altered_$TS.sql
ls -lh etax_crm_*_$TS.sql && tail -1 etax_crm_full_$TS.sql   # must end with "-- Dump completed"
```

Or use Hostinger hPanel → Databases → backups → "Create backup" and wait for it to finish. Keep the file off the server too.

## 2. Pre-checks

```sql
SELECT VERSION();                                     -- 10.5+ required (IF NOT EXISTS on ADD COLUMN)
SELECT COUNT(*) FROM audit_logs;                      -- was 0 on live at design time
SELECT table_name, table_rows FROM information_schema.tables
 WHERE table_schema = DATABASE() AND table_name IN ('leads','leads_udyamikisan','leads_sahakarsamridhi','audit_logs');
SHOW PROCESSLIST;                                     -- no long-running query holding the lead tables
```

The ALTERs on the lead tables add NULL columns + one index each; on MariaDB 11 this is INSTANT/INPLACE (no table copy). Expect seconds.

## 3. Apply

```bash
mysql -h <host> -u <user> -p u571670246_etax_crm < MIGRATION-RBAC-LOGS-RECYCLE.sql
```

(or paste the file into phpMyAdmin → SQL). Re-running it is a no-op (verified twice on the box copy).

## 4. Verify

```sql
SHOW TABLES LIKE 'rbac_%';                -- rbac_user_access, rbac_user_permission_overrides
SHOW TABLES LIKE 'recycle_bin_items';
SELECT table_name, column_name FROM information_schema.columns
 WHERE table_schema = DATABASE()
   AND ((table_name='audit_logs' AND column_name IN ('actor_name','actor_source','module','summary','status_code','method','path','changes'))
     OR (table_name IN ('leads','leads_udyamikisan','leads_sahakarsamridhi') AND column_name IN ('deleted_at','deleted_by')))
 ORDER BY 1,2;                            -- expect 14 rows
SELECT COUNT(*) FROM leads;               -- same as pre-check
```

Then (after code deploy):

1. Restart the API, or as Super Admin `POST /v1/crm/access/schema/refresh` (else it picks up the schema within 5 min).
2. Sign in as Super Admin → **Users & Access** loads; **Activity Logs** shows your login; **Recycle Bin** shows tabs (no "not set up" banner).
3. Grant one test option to a test employee, sign in as them, confirm it appears under **More options**; remove it again.
4. Move one test lead to the bin, confirm it disappears from Leads and the mobile app list, restore it.
5. Old app: log in to etaxwala.com, open Leads/Customers/Orders — they load as before.
6. Mobile app: login + leads list.

## 5. Rollback

- **Code only** (preferred): redeploy the previous build. The extra tables/columns are harmless to old code and can stay.
- **Schema** (only if really needed, after confirming nothing in the bin must be kept):

```sql
-- Export anything still in the bin first:
-- mysqldump ... u571670246_etax_crm recycle_bin_items > bin_before_rollback.sql
-- Leads flagged in the bin would REAPPEAR in lists once deleted_at is dropped (they were never removed).
ALTER TABLE leads                 DROP INDEX idx_leads_deleted_at,                 DROP COLUMN deleted_at, DROP COLUMN deleted_by;
ALTER TABLE leads_udyamikisan     DROP INDEX idx_leads_udyamikisan_deleted_at,     DROP COLUMN deleted_at, DROP COLUMN deleted_by;
ALTER TABLE leads_sahakarsamridhi DROP INDEX idx_leads_sahakarsamridhi_deleted_at, DROP COLUMN deleted_at, DROP COLUMN deleted_by;
ALTER TABLE audit_logs DROP INDEX idx_audit_logs_module, DROP INDEX idx_audit_logs_actor_time,
  DROP COLUMN actor_name, DROP COLUMN actor_source, DROP COLUMN module, DROP COLUMN summary,
  DROP COLUMN status_code, DROP COLUMN method, DROP COLUMN path, DROP COLUMN changes;
DROP TABLE IF EXISTS recycle_bin_items;              -- archived customers/orders/tasks in here are lost unless exported
DROP TABLE IF EXISTS rbac_user_permission_overrides;
DROP TABLE IF EXISTS rbac_user_access;               -- users fall back to the role from their old user_type
```

- **Disaster**: restore `etax_crm_full_$TS.sql` (loses writes made after the backup — last resort).

## 6. Log retention (1 year) — not scheduled

`apps/api/scripts/purge-audit-logs.mjs` — dry run by default, refuses < 90 days, deletes in batches of 5,000.

```bash
cd apps/api && node scripts/purge-audit-logs.mjs            # count only
node scripts/purge-audit-logs.mjs --apply                   # after owner approval + audit_logs backup
```

If approved later, a monthly cron (e.g. 1st of month 03:00 IST) can run the `--apply` form. No auto-delete is set up.

## 7. Known gaps on the old app (etaxwala.com — intentionally not patched)

- It still **hard-deletes** with `DELETE FROM` on leads, customers, orders, operation_tasks, quotations and users; those deletes never reach the Recycle Bin and are not in Activity Logs.
- It ignores `deleted_at`, so a lead moved to the bin in dnyanvedh.com still shows in etaxwala.com (and could be edited/deleted there) until staff stop using it.
- Deactivate in dnyanvedh.com sets `users.status`, but the old app's login does not check it, so a deactivated legacy user can still sign in to etaxwala.com. It also knows nothing about extra options.
  Recommendation: move staff fully to dnyanvedh.com (planned), then retire the old app's write screens.
