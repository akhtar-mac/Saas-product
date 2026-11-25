-- ============================================================================
-- ETaxwala CRM (dnyanvedh.com) — Staff Profile (ID card), Shifts, Attendance,
-- Holidays and Leave Requests
-- Add-only migration for MariaDB 10.5+ (live: 11.8.9-MariaDB-log)
-- Database: u571670246_etax_crm (shared with the old etaxwala.com Laravel app)
--
-- SAFETY
--   * CREATE TABLE IF NOT EXISTS only. No ALTER, no DROP, no UPDATE/DELETE,
--     no triggers, no foreign keys to old tables.
--   * The old tables `users`, `staff_users` and `profile` are never touched;
--     etaxwala.com keeps working unchanged.
--   * Staff are identified by (user_source, user_id), the same key as
--     rbac_user_access: 'users' = old staff table, 'staff_users' = new-app only.
--   * Re-running the file is a no-op.
--   * The API works without these tables (profile shows old data, HR screens
--     show "tables not added yet"). DO NOT RUN ON LIVE without the owner's
--     approval and a full backup first.
-- ============================================================================

SET NAMES utf8mb4;

-- ----------------------------------------------------------------------------
-- 1. Staff profile / ID card / shift (one row per staff member)
--    Read merged over the old `profile` row (photo, dob, address, position, about).
--    Shift: 9 hours incl. lunch, start 08:30..10:30 IST, end = start + 9h.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `staff_profiles` (
  `id`                         BIGINT(20)   NOT NULL AUTO_INCREMENT,
  `user_source`                ENUM('users','staff_users') NOT NULL,
  `user_id`                    BIGINT(20)   NOT NULL,
  `employee_code`              VARCHAR(30)  NULL COMMENT 'shown on the ID card, e.g. ETX-0042',
  `profile_photo`              VARCHAR(255) NULL COMMENT 'file in uploads-persistent/staff-photos',
  `designation`                VARCHAR(120) NULL,
  `department`                 VARCHAR(100) NULL,
  `work_location`              VARCHAR(120) NULL,
  `employment_type`            VARCHAR(20)  NULL COMMENT 'full_time, part_time, intern, contract, partner',
  `joining_date`               DATE         NULL,
  `reporting_manager_source`   ENUM('users','staff_users') NULL,
  `reporting_manager_id`       BIGINT(20)   NULL,
  `shift_start`                TIME         NULL COMMENT '08:30..10:30 IST',
  `shift_end`                  TIME         NULL COMMENT 'shift_start + 9h (lunch included)',
  `shift_locked`               TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '1 = only HR can change the shift',
  `shift_updated_at`           DATETIME(3)  NULL,
  `shift_updated_by_source`    ENUM('users','staff_users') NULL,
  `shift_updated_by_id`        BIGINT(20)   NULL,
  `late_grace_minutes`         SMALLINT     NULL COMMENT 'NULL = company default (15)',
  `weekly_off_days`            VARCHAR(60)  NULL COMMENT 'comma list, NULL = Sunday',
  `dob`                        DATE         NULL,
  `gender`                     VARCHAR(20)  NULL,
  `blood_group`                VARCHAR(10)  NULL,
  `personal_email`             VARCHAR(150) NULL,
  `alt_phone`                  VARCHAR(20)  NULL,
  `current_address`            VARCHAR(500) NULL,
  `permanent_address`          VARCHAR(500) NULL,
  `emergency_contact_name`     VARCHAR(120) NULL,
  `emergency_contact_relation` VARCHAR(60)  NULL,
  `emergency_contact_phone`    VARCHAR(20)  NULL,
  `about`                      VARCHAR(2000) NULL,
  `id_card_status`             ENUM('active','suspended','exited') NOT NULL DEFAULT 'active',
  `updated_by_source`          ENUM('users','staff_users') NULL,
  `updated_by_id`              BIGINT(20)   NULL,
  `created_at`                 DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`                 DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_staff_profiles_principal` (`user_source`, `user_id`),
  UNIQUE KEY `uq_staff_profiles_emp_code` (`employee_code`),
  KEY `idx_staff_profiles_dept` (`department`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. Attendance register: one row per staff member per date (marked by HR,
--    or written when HR approves a leave / applies a holiday)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `hr_attendance_records` (
  `id`               BIGINT(20)   NOT NULL AUTO_INCREMENT,
  `user_source`      ENUM('users','staff_users') NOT NULL,
  `user_id`          BIGINT(20)   NOT NULL,
  `attendance_date`  DATE         NOT NULL,
  `status`           ENUM('present','half_day','absent','leave','holiday','week_off','wfh','late') NOT NULL,
  `leave_type`       VARCHAR(20)  NULL COMMENT 'CL, SL, EL, LWP, COMP_OFF, OTHER',
  `half_day_slot`    ENUM('first_half','second_half') NULL,
  `check_in_time`    TIME         NULL COMMENT 'IST',
  `check_out_time`   TIME         NULL COMMENT 'IST',
  `late_minutes`     SMALLINT     NULL COMMENT 'after own shift start + grace',
  `remarks`          VARCHAR(500) NULL,
  `source`           ENUM('hr_manual','holiday','leave_approved','system') NOT NULL DEFAULT 'hr_manual',
  `leave_request_id` BIGINT(20)   NULL,
  `marked_by_source` ENUM('users','staff_users') NULL,
  `marked_by_id`     BIGINT(20)   NULL,
  `marked_by_name`   VARCHAR(150) NULL,
  `created_at`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_hr_att_user_date` (`user_source`, `user_id`, `attendance_date`),
  KEY `idx_hr_att_date_status` (`attendance_date`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. Company holiday calendar (HR / Admin)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `hr_holidays` (
  `id`                INT(11)      NOT NULL AUTO_INCREMENT,
  `holiday_date`      DATE         NOT NULL,
  `title`             VARCHAR(150) NOT NULL,
  `holiday_type`      ENUM('public','company','optional') NOT NULL DEFAULT 'public',
  `description`       VARCHAR(500) NULL,
  `is_active`         TINYINT(1)   NOT NULL DEFAULT 1 COMMENT '0 = removed (kept for history)',
  `created_by_source` ENUM('users','staff_users') NULL,
  `created_by_id`     BIGINT(20)   NULL,
  `created_at`        DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`        DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_hr_holidays_date` (`holiday_date`, `is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 4. Leave requests: staff apply from My Profile, HR approves / rejects.
--    Approval writes 'leave' / 'half_day' rows into hr_attendance_records.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `hr_leave_requests` (
  `id`                 BIGINT(20)   NOT NULL AUTO_INCREMENT,
  `user_source`        ENUM('users','staff_users') NOT NULL,
  `user_id`            BIGINT(20)   NOT NULL,
  `user_name`          VARCHAR(150) NULL,
  `leave_type`         VARCHAR(20)  NOT NULL COMMENT 'CL, SL, EL, LWP, COMP_OFF, OTHER',
  `from_date`          DATE         NOT NULL,
  `to_date`            DATE         NOT NULL,
  `is_half_day`        TINYINT(1)   NOT NULL DEFAULT 0,
  `half_day_slot`      ENUM('first_half','second_half') NULL,
  `total_days`         DECIMAL(5,1) NOT NULL DEFAULT 1.0 COMMENT 'working days (week offs and holidays excluded)',
  `reason`             VARCHAR(1000) NOT NULL,
  `status`             ENUM('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
  `reviewed_by_source` ENUM('users','staff_users') NULL,
  `reviewed_by_id`     BIGINT(20)   NULL,
  `reviewed_by_name`   VARCHAR(150) NULL,
  `reviewed_at`        DATETIME(3)  NULL,
  `review_remark`      VARCHAR(500) NULL,
  `created_at`         DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`         DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_hr_leave_user` (`user_source`, `user_id`, `status`),
  KEY `idx_hr_leave_status_from` (`status`, `from_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- End of migration.
