-- ─── PHASE 4: EXTERNAL MARKETING INTEGRATIONS, OAUTH VAULT & WEBHOOK INGESTION ───

-- 1. Integration Credentials (AES-256 Encrypted OAuth Vault)
CREATE TABLE IF NOT EXISTS "integration_credentials" (
    "id" SERIAL NOT NULL,
    "provider" VARCHAR(50) NOT NULL,
    "account_id" VARCHAR(150) NOT NULL,
    "account_name" VARCHAR(150) NOT NULL,
    "encrypted_access_token" TEXT NOT NULL,
    "encrypted_refresh_token" TEXT,
    "token_iv" VARCHAR(64) NOT NULL,
    "token_auth_tag" VARCHAR(64) NOT NULL,
    "webhook_secret_encrypted" TEXT,
    "webhook_secret_iv" VARCHAR(64),
    "webhook_secret_tag" VARCHAR(64),
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "token_expiry" TIMESTAMP(6),
    "last_synced_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "integration_credentials_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "idx_integration_credentials_provider" ON "integration_credentials"("provider");
CREATE INDEX IF NOT EXISTS "idx_integration_credentials_status" ON "integration_credentials"("status");

-- 2. Integration Sync Jobs (Automated & Manual Sync Runs)
CREATE TABLE IF NOT EXISTS "integration_sync_jobs" (
    "id" SERIAL NOT NULL,
    "job_code" VARCHAR(50) NOT NULL,
    "integration_id" INTEGER NOT NULL,
    "job_type" VARCHAR(50) NOT NULL DEFAULT 'DAILY_METRICS_SYNC',
    "status" VARCHAR(50) NOT NULL DEFAULT 'RUNNING',
    "records_synced" INTEGER NOT NULL DEFAULT 0,
    "summary_payload" TEXT,
    "error_message" TEXT,
    "started_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(6),

    CONSTRAINT "integration_sync_jobs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "integration_sync_jobs_job_code_key" UNIQUE ("job_code"),
    CONSTRAINT "fk_sync_job_integration" FOREIGN KEY ("integration_id") REFERENCES "integration_credentials"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_integration_sync_jobs_integration" ON "integration_sync_jobs"("integration_id");
CREATE INDEX IF NOT EXISTS "idx_integration_sync_jobs_status" ON "integration_sync_jobs"("status");
CREATE INDEX IF NOT EXISTS "idx_integration_sync_jobs_started_at" ON "integration_sync_jobs"("started_at");

-- 3. Integration Webhooks (Real-Time Inbound Event & Lead Ingestion)
CREATE TABLE IF NOT EXISTS "integration_webhooks" (
    "id" SERIAL NOT NULL,
    "webhook_code" VARCHAR(50) NOT NULL,
    "provider" VARCHAR(50) NOT NULL,
    "event_type" VARCHAR(100) NOT NULL,
    "payload_json" TEXT NOT NULL,
    "signature" VARCHAR(255),
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "error_log" TEXT,
    "received_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(6),

    CONSTRAINT "integration_webhooks_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "integration_webhooks_webhook_code_key" UNIQUE ("webhook_code")
);

CREATE INDEX IF NOT EXISTS "idx_integration_webhooks_provider" ON "integration_webhooks"("provider");
CREATE INDEX IF NOT EXISTS "idx_integration_webhooks_event_type" ON "integration_webhooks"("event_type");
CREATE INDEX IF NOT EXISTS "idx_integration_webhooks_processed" ON "integration_webhooks"("processed");
