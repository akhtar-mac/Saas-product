-- ============================================================================
-- ETaxwala CRM (dnyanvedh.com) — RBAC, Activity Logs, Recycle Bin
-- Add-only migration for MariaDB 10.5+ (live: 11.8.9-MariaDB-log)
-- Database: u571670246_etax_crm (shared with the old etaxwala.com Laravel app)
--
-- SAFETY
--   * Only CREATE TABLE IF NOT EXISTS, ALTER TABLE ... ADD COLUMN IF NOT EXISTS
--     and ADD INDEX IF NOT EXISTS. No DROP, no MODIFY/CHANGE of existing
--     columns, no UPDATE/DELETE of existing rows, no triggers.
--   * Every new column is NULLable with no default, so the old app's
--     INSERT/UPDATE/SELECT * statements keep working unchanged.
--   * Re-running the file is a no-op.
--   * DO NOT RUN ON LIVE without the owner's approval. Follow
--     RUNBOOK-RBAC-LOGS-RECYCLE.md (backup, apply, verify, rollback).
--
-- The role catalogue and role default permissions live in code
-- (apps/api/src/rbac/catalog.ts); these tables hold only per-user changes.
-- ============================================================================

SET NAMES utf8mb4;

-- ----------------------------------------------------------------------------
-- 1. Per-user role choice (one row per user whose role was set in the new app)
--    user_source: 'users' = legacy users table (old staff), 'staff_users' = new-app-only accounts
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `rbac_user_access` (
  `id`          INT(11)      NOT NULL AUTO_INCREMENT,
  `user_source` ENUM('users','staff_users') NOT NULL,
  `user_id`     BIGINT(20)   NOT NULL,
  `role_id`     INT(11)      NOT NULL COMMENT 'rbac role id 1..16 (see catalog.ts)',
  `updated_by`  BIGINT(20)   NULL,
  `created_at`  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_rbac_user_access` (`user_source`, `user_id`),
  KEY `idx_rbac_user_access_role` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. Per-user extra options (grant) and removed role options (revoke)
--    Effective = (role defaults + grants) - revokes. Super Admin ignores revokes.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `rbac_user_permission_overrides` (
  `id`             INT(11)      NOT NULL AUTO_INCREMENT,
  `user_source`    ENUM('users','staff_users') NOT NULL,
  `user_id`        BIGINT(20)   NOT NULL,
  `permission_key` VARCHAR(100) NOT NULL,
  `effect`         ENUM('grant','revoke') NOT NULL,
  `granted_by`     BIGINT(20)   NULL,
  `reason`         VARCHAR(255) NULL,
  `created_at`     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_rbac_override` (`user_source`, `user_id`, `permission_key`),
  KEY `idx_rbac_override_perm` (`permission_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. Activity log: extra columns on the existing (empty on live) audit_logs table
-- ----------------------------------------------------------------------------
ALTER TABLE `audit_logs`
  ADD COLUMN IF NOT EXISTS `actor_name`   VARCHAR(150) NULL AFTER `actor_role`,
  ADD COLUMN IF NOT EXISTS `actor_source` VARCHAR(20)  NULL AFTER `actor_name`,
  ADD COLUMN IF NOT EXISTS `module`       VARCHAR(60)  NULL AFTER `resource_id`,
  ADD COLUMN IF NOT EXISTS `summary`      VARCHAR(500) NULL AFTER `module`,
  ADD COLUMN IF NOT EXISTS `status_code`  SMALLINT     NULL AFTER `summary`,
  ADD COLUMN IF NOT EXISTS `method`       VARCHAR(10)  NULL AFTER `status_code`,
  ADD COLUMN IF NOT EXISTS `path`         VARCHAR(255) NULL AFTER `method`,
  ADD COLUMN IF NOT EXISTS `changes`      MEDIUMTEXT   NULL COMMENT 'JSON {before, after}' AFTER `payload`;

ALTER TABLE `audit_logs`
  ADD INDEX IF NOT EXISTS `idx_audit_logs_module` (`module`),
  ADD INDEX IF NOT EXISTS `idx_audit_logs_actor_time` (`actor_id`, `created_at`);

-- ----------------------------------------------------------------------------
-- 4. Recycle Bin: one row per deleted item
--    mode 'flag'    = row stays in its table with deleted_at set (leads)
--    mode 'archive' = full copy of the row(s) kept here; restore re-inserts them
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `recycle_bin_items` (
  `id`                BIGINT(20)   NOT NULL AUTO_INCREMENT,
  `entity_type`       VARCHAR(40)  NOT NULL COMMENT 'lead, lead_udyami, lead_sahakar, customer, order, operation_task, internal_task, service_question, staff_user',
  `entity_id`         VARCHAR(120) NOT NULL,
  `title`             VARCHAR(255) NULL,
  `subtitle`          VARCHAR(255) NULL,
  `mode`              ENUM('flag','archive') NOT NULL,
  `payload_snapshot`  LONGTEXT     NULL COMMENT 'JSON of the main row',
  `related_snapshot`  LONGTEXT     NULL COMMENT 'JSON {tables:[{table,pk,rows}]} used by restore',
  `related_counts`    VARCHAR(500) NULL,
  `deleted_by`        BIGINT(20)   NULL,
  `deleted_by_name`   VARCHAR(150) NULL,
  `deleted_by_source` VARCHAR(20)  NULL,
  `deleted_at`        DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `delete_reason`     VARCHAR(255) NULL,
  `status`            ENUM('in_bin','restored','purged') NOT NULL DEFAULT 'in_bin',
  `restored_by`       BIGINT(20)   NULL,
  `restored_by_name`  VARCHAR(150) NULL,
  `restored_at`       DATETIME(3)  NULL,
  `purged_by`         BIGINT(20)   NULL,
  `purged_by_name`    VARCHAR(150) NULL,
  `purged_at`         DATETIME(3)  NULL,
  PRIMARY KEY (`id`),
  KEY `idx_rbi_status_type` (`status`, `entity_type`),
  KEY `idx_rbi_entity` (`entity_type`, `entity_id`),
  KEY `idx_rbi_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 5. Soft-delete flag on the three lead books.
--    Leads are never removed by the Recycle Bin because call_history and
--    lead_answers have ON DELETE CASCADE foreign keys to leads.id.
--    The old etaxwala.com app and the mobile backend ignore these columns
--    (they would still list a lead that is in the Recycle Bin).
-- ----------------------------------------------------------------------------
ALTER TABLE `leads`
  ADD COLUMN IF NOT EXISTS `deleted_at` DATETIME NULL,
  ADD COLUMN IF NOT EXISTS `deleted_by` BIGINT(20) NULL,
  ADD INDEX IF NOT EXISTS `idx_leads_deleted_at` (`deleted_at`);

ALTER TABLE `leads_udyamikisan`
  ADD COLUMN IF NOT EXISTS `deleted_at` DATETIME NULL,
  ADD COLUMN IF NOT EXISTS `deleted_by` BIGINT(20) NULL,
  ADD INDEX IF NOT EXISTS `idx_leads_udyamikisan_deleted_at` (`deleted_at`);

ALTER TABLE `leads_sahakarsamridhi`
  ADD COLUMN IF NOT EXISTS `deleted_at` DATETIME NULL,
  ADD COLUMN IF NOT EXISTS `deleted_by` BIGINT(20) NULL,
  ADD INDEX IF NOT EXISTS `idx_leads_sahakarsamridhi_deleted_at` (`deleted_at`);

-- End of migration.
