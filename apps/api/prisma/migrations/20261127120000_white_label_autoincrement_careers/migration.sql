-- White-label tenant settings, careers tables, marketing automation, and
-- AUTO_INCREMENT for primary keys that the API used to fill with MAX(id)+1.
-- MySQL / MariaDB. Each statement is safe to re-run.
-- Do not point this file at a live etaxwala.com or dnyanvedh.com database.

CREATE TABLE IF NOT EXISTS `tenant_settings` (
  `id` INT NOT NULL,
  `company_name` VARCHAR(200) NOT NULL,
  `legal_name` VARCHAR(200) NOT NULL,
  `tagline` VARCHAR(300) NULL,
  `logo_url` VARCHAR(500) NULL,
  `favicon_url` VARCHAR(500) NULL,
  `primary_color` VARCHAR(20) NOT NULL DEFAULT '#1E3A8A',
  `accent_color` VARCHAR(20) NOT NULL DEFAULT '#06B6D4',
  `support_email` VARCHAR(200) NULL,
  `support_phone` VARCHAR(40) NULL,
  `address` VARCHAR(500) NULL,
  `city` VARCHAR(100) NULL,
  `state_name` VARCHAR(100) NULL,
  `gstin` VARCHAR(20) NULL,
  `pan` VARCHAR(15) NULL,
  `website_url` VARCHAR(300) NULL,
  `app_url` VARCHAR(300) NULL,
  `custom_domain` VARCHAR(200) NULL,
  `cors_origins` TEXT NULL,
  `quote_prefix` VARCHAR(20) NOT NULL DEFAULT 'QT',
  `working_hours` VARCHAR(160) NULL,
  `upi_primary` VARCHAR(120) NULL,
  `upi_secondary` VARCHAR(120) NULL,
  `bank_accounts_json` MEDIUMTEXT NULL,
  `razorpay_key_id` TEXT NULL,
  `razorpay_key_secret` TEXT NULL,
  `razorpay_webhook_secret` TEXT NULL,
  `whatsapp_token` TEXT NULL,
  `whatsapp_phone_number_id` VARCHAR(80) NULL,
  `sms_api_key` TEXT NULL,
  `sms_sender_id` VARCHAR(20) NULL,
  `sms_dlt_entity_id` VARCHAR(40) NULL,
  `smtp_host` VARCHAR(200) NULL,
  `smtp_port` INT NULL,
  `smtp_user` VARCHAR(200) NULL,
  `smtp_pass` TEXT NULL,
  `smtp_from_email` VARCHAR(200) NULL,
  `smtp_from_name` VARCHAR(200) NULL,
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `jobs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(150) NOT NULL,
  `location` VARCHAR(120) NOT NULL,
  `type` VARCHAR(50) NOT NULL DEFAULT 'Full-Time',
  `description` TEXT NOT NULL,
  `responsibilities` TEXT NULL,
  `qualifications` TEXT NULL,
  `department` VARCHAR(100) NULL,
  `experience` VARCHAR(50) NULL,
  `posted_date` VARCHAR(50) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `job_applications` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `job_id` INT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NULL,
  `email` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `role_applied` VARCHAR(150) NOT NULL,
  `department` VARCHAR(100) NULL DEFAULT 'General',
  `current_company` VARCHAR(150) NULL,
  `current_title` VARCHAR(150) NULL,
  `experience_years` VARCHAR(50) NULL,
  `expected_ctc` VARCHAR(50) NULL,
  `notice_period_days` VARCHAR(50) NULL,
  `linkedin_url` VARCHAR(500) NULL,
  `portfolio_url` VARCHAR(500) NULL,
  `source` VARCHAR(100) NULL DEFAULT 'Careers Page',
  `status` VARCHAR(50) NOT NULL DEFAULT 'APPLIED',
  `rating` SMALLINT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `candidate_documents` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `application_id` INT NOT NULL,
  `document_type` VARCHAR(50) NOT NULL DEFAULT 'RESUME',
  `file_name` VARCHAR(255) NOT NULL,
  `file_key` VARCHAR(500) NOT NULL,
  `file_size` INT NULL,
  `mime_type` VARCHAR(100) NULL,
  `uploaded_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `candidate_documents_application_id_idx` (`application_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `application_notes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `application_id` INT NOT NULL,
  `author_id` INT NULL,
  `author_name` VARCHAR(150) NULL,
  `note_content` TEXT NOT NULL,
  `is_private` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `interviews` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `application_id` INT NOT NULL,
  `round_number` SMALLINT NOT NULL DEFAULT 1,
  `round_name` VARCHAR(100) NOT NULL DEFAULT 'Conversation',
  `interview_type` VARCHAR(50) NOT NULL DEFAULT 'GOOGLE_MEET',
  `scheduled_at` DATETIME(3) NOT NULL,
  `duration_minutes` INT NOT NULL DEFAULT 45,
  `meeting_link` VARCHAR(500) NULL,
  `interviewer_id` INT NULL,
  `interviewer_name` VARCHAR(150) NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Widen the legacy customer password column so a bcrypt hash (60 chars) fits.
SET @tbl = (SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'customers');
SET @sql = IF(@tbl = 0, 'SELECT 1', 'ALTER TABLE `customers` MODIFY `password` VARCHAR(255) NOT NULL');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- leads.id
SET @tbl = (SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'leads');
SET @pk = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'leads' AND CONSTRAINT_TYPE = 'PRIMARY KEY');
SET @sql = IF(@tbl = 0 OR @pk > 0, 'SELECT 1', 'ALTER TABLE `leads` ADD PRIMARY KEY (`id`)');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
SET @sql = IF(@tbl = 0, 'SELECT 1', 'ALTER TABLE `leads` MODIFY `id` INT NOT NULL AUTO_INCREMENT');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- leads_udyamikisan.id
SET @tbl = (SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'leads_udyamikisan');
SET @pk = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'leads_udyamikisan' AND CONSTRAINT_TYPE = 'PRIMARY KEY');
SET @sql = IF(@tbl = 0 OR @pk > 0, 'SELECT 1', 'ALTER TABLE `leads_udyamikisan` ADD PRIMARY KEY (`id`)');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
SET @sql = IF(@tbl = 0, 'SELECT 1', 'ALTER TABLE `leads_udyamikisan` MODIFY `id` INT NOT NULL AUTO_INCREMENT');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- leads_sahakarsamridhi.id
SET @tbl = (SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'leads_sahakarsamridhi');
SET @pk = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'leads_sahakarsamridhi' AND CONSTRAINT_TYPE = 'PRIMARY KEY');
SET @sql = IF(@tbl = 0 OR @pk > 0, 'SELECT 1', 'ALTER TABLE `leads_sahakarsamridhi` ADD PRIMARY KEY (`id`)');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
SET @sql = IF(@tbl = 0, 'SELECT 1', 'ALTER TABLE `leads_sahakarsamridhi` MODIFY `id` INT NOT NULL AUTO_INCREMENT');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- customers.id
SET @tbl = (SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'customers');
SET @pk = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'customers' AND CONSTRAINT_TYPE = 'PRIMARY KEY');
SET @sql = IF(@tbl = 0 OR @pk > 0, 'SELECT 1', 'ALTER TABLE `customers` ADD PRIMARY KEY (`id`)');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
SET @sql = IF(@tbl = 0, 'SELECT 1', 'ALTER TABLE `customers` MODIFY `id` INT NOT NULL AUTO_INCREMENT');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- orders.id
SET @tbl = (SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders');
SET @pk = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND CONSTRAINT_TYPE = 'PRIMARY KEY');
SET @sql = IF(@tbl = 0 OR @pk > 0, 'SELECT 1', 'ALTER TABLE `orders` ADD PRIMARY KEY (`id`)');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
SET @sql = IF(@tbl = 0, 'SELECT 1', 'ALTER TABLE `orders` MODIFY `id` INT NOT NULL AUTO_INCREMENT');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- quotations.id
SET @tbl = (SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'quotations');
SET @pk = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'quotations' AND CONSTRAINT_TYPE = 'PRIMARY KEY');
SET @sql = IF(@tbl = 0 OR @pk > 0, 'SELECT 1', 'ALTER TABLE `quotations` ADD PRIMARY KEY (`id`)');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
SET @sql = IF(@tbl = 0, 'SELECT 1', 'ALTER TABLE `quotations` MODIFY `id` BIGINT NOT NULL AUTO_INCREMENT');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- lead_followups.id
SET @tbl = (SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'lead_followups');
SET @pk = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'lead_followups' AND CONSTRAINT_TYPE = 'PRIMARY KEY');
SET @sql = IF(@tbl = 0 OR @pk > 0, 'SELECT 1', 'ALTER TABLE `lead_followups` ADD PRIMARY KEY (`id`)');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
SET @sql = IF(@tbl = 0, 'SELECT 1', 'ALTER TABLE `lead_followups` MODIFY `id` INT NOT NULL AUTO_INCREMENT');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- combo_packages.cp_id
SET @tbl = (SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'combo_packages');
SET @pk = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'combo_packages' AND CONSTRAINT_TYPE = 'PRIMARY KEY');
SET @sql = IF(@tbl = 0 OR @pk > 0, 'SELECT 1', 'ALTER TABLE `combo_packages` ADD PRIMARY KEY (`cp_id`)');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
SET @sql = IF(@tbl = 0, 'SELECT 1', 'ALTER TABLE `combo_packages` MODIFY `cp_id` INT NOT NULL AUTO_INCREMENT');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- customer_emi.emi_id
SET @tbl = (SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'customer_emi');
SET @pk = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'customer_emi' AND CONSTRAINT_TYPE = 'PRIMARY KEY');
SET @sql = IF(@tbl = 0 OR @pk > 0, 'SELECT 1', 'ALTER TABLE `customer_emi` ADD PRIMARY KEY (`emi_id`)');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
SET @sql = IF(@tbl = 0, 'SELECT 1', 'ALTER TABLE `customer_emi` MODIFY `emi_id` INT NOT NULL AUTO_INCREMENT');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
