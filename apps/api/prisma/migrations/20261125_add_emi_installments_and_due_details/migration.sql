-- Add-only SQL for EMI 2, 3, 4+ scheduling and payment collection metadata.
-- Does NOT alter or drop any existing columns in customer_emi, customer_dues, or orders,
-- so etaxwala.com (Laravel) continues reading and writing the same tables untouched.

CREATE TABLE IF NOT EXISTS `customer_emi_installments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `emi_id` INT NOT NULL,
  `customer_id` INT NOT NULL,
  `order_id` INT NOT NULL,
  `installment_no` INT NOT NULL,
  `amount` INT NOT NULL,
  `paid_amount` INT NOT NULL DEFAULT 0,
  `due_date` DATE NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'pending',
  `note` VARCHAR(500) NULL,
  `created_by` INT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_customer_emi_installment` (`emi_id`, `installment_no`),
  KEY `idx_cei_customer_order` (`customer_id`, `order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `customer_due_details` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `cd_id` INT NOT NULL,
  `emi_id` INT NOT NULL,
  `installment_no` INT NULL,
  `payment_mode` VARCHAR(40) NOT NULL DEFAULT 'UPI',
  `payment_reference` VARCHAR(120) NULL,
  `payment_date` DATE NOT NULL,
  `comment` VARCHAR(1000) NULL,
  `proof_storage` VARCHAR(40) NOT NULL DEFAULT 'persistent',
  `created_by` INT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_cdd_cd_id` (`cd_id`),
  KEY `idx_cdd_emi_id` (`emi_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
