-- Migration: 20260918000002_add_it_command_center_schema
-- Phase 2: Super-Advanced IT & Solutions Command Center Schema
-- Strictly additive: ZERO drop tables, ZERO deletes, ZERO column alters

-- 1. Table: it_tech_leads
CREATE TABLE IF NOT EXISTS "it_tech_leads" (
    "id" SERIAL NOT NULL,
    "lead_id" BIGINT,
    "client_name" VARCHAR(150) NOT NULL,
    "company_name" VARCHAR(150),
    "email" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(30) NOT NULL,
    "project_type" VARCHAR(100) NOT NULL DEFAULT 'SaaS Platform',
    "budget_estimate" VARCHAR(100),
    "timeline" VARCHAR(100),
    "requirements" TEXT NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'NEW',
    "assigned_engineer" VARCHAR(150) DEFAULT 'Lead Architect',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT "it_tech_leads_pkey" PRIMARY KEY ("id")
);

-- 2. Table: it_discovery_meetings
CREATE TABLE IF NOT EXISTS "it_discovery_meetings" (
    "id" SERIAL NOT NULL,
    "tech_lead_id" INTEGER,
    "client_name" VARCHAR(150) NOT NULL,
    "meeting_title" VARCHAR(200) NOT NULL,
    "scheduled_at" TIMESTAMP(6) NOT NULL,
    "duration_minutes" INTEGER NOT NULL DEFAULT 45,
    "meet_url" VARCHAR(500) NOT NULL,
    "platform" VARCHAR(50) NOT NULL DEFAULT 'Google Meet',
    "status" VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    "attendees" TEXT,
    "client_notes" TEXT,
    "recording_url" VARCHAR(500),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT "it_discovery_meetings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "it_discovery_meetings_tech_lead_id_fkey" FOREIGN KEY ("tech_lead_id") REFERENCES "it_tech_leads"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- 3. Table: quotation_versions (Immutable Versioning Engine)
CREATE TABLE IF NOT EXISTS "quotation_versions" (
    "id" SERIAL NOT NULL,
    "quotation_number" VARCHAR(100) NOT NULL,
    "version_number" INTEGER NOT NULL DEFAULT 1,
    "parent_quotation_id" BIGINT,
    "superseded_by_id" INTEGER,
    "is_current" BOOLEAN NOT NULL DEFAULT true,
    "client_name" VARCHAR(150) NOT NULL,
    "company_name" VARCHAR(150),
    "client_email" VARCHAR(150) NOT NULL,
    "project_title" VARCHAR(250) NOT NULL,
    "tech_stack" TEXT,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'INR',
    "line_items" TEXT NOT NULL,
    "subtotal" NUMERIC(12,2) NOT NULL DEFAULT 0,
    "tax_amount" NUMERIC(12,2) NOT NULL DEFAULT 0,
    "discount_amount" NUMERIC(12,2) NOT NULL DEFAULT 0,
    "grand_total" NUMERIC(12,2) NOT NULL DEFAULT 0,
    "valid_until" DATE,
    "terms" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    "created_by" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT "quotation_versions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "quotation_versions_number_version_unique" UNIQUE ("quotation_number", "version_number")
);

-- 4. Table: it_projects (Client Software Delivery)
CREATE TABLE IF NOT EXISTS "it_projects" (
    "id" SERIAL NOT NULL,
    "project_code" VARCHAR(50) NOT NULL,
    "client_id" INTEGER,
    "title" VARCHAR(250) NOT NULL,
    "client_name" VARCHAR(150) NOT NULL,
    "lead_engineer" VARCHAR(150) NOT NULL DEFAULT 'Lead Architect',
    "stage" VARCHAR(50) NOT NULL DEFAULT 'Discovery',
    "progress_percent" INTEGER NOT NULL DEFAULT 0,
    "tech_stack" TEXT,
    "repo_url" VARCHAR(500),
    "staging_url" VARCHAR(500),
    "production_url" VARCHAR(500),
    "deadline" DATE,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ON_TRACK',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT "it_projects_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "it_projects_project_code_key" UNIQUE ("project_code")
);

-- 5. Table: it_project_milestones
CREATE TABLE IF NOT EXISTS "it_project_milestones" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "milestone_order" SMALLINT NOT NULL DEFAULT 1,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "percentage" NUMERIC(5,2) NOT NULL DEFAULT 0,
    "amount" NUMERIC(12,2) NOT NULL DEFAULT 0,
    "estimated_weeks" SMALLINT DEFAULT 2,
    "due_date" DATE,
    "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT "it_project_milestones_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "it_project_milestones_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "it_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 6. Table: client_credentials_vault (AES-256 Encrypted Secrets)
CREATE TABLE IF NOT EXISTS "client_credentials_vault" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER,
    "project_id" INTEGER,
    "credential_title" VARCHAR(150) NOT NULL,
    "service_type" VARCHAR(50) NOT NULL DEFAULT 'HOSTING',
    "host_or_url" VARCHAR(500),
    "username" VARCHAR(150),
    "encrypted_secret" TEXT NOT NULL,
    "encryption_iv" VARCHAR(100) NOT NULL,
    "encryption_tag" VARCHAR(100) NOT NULL,
    "notes" TEXT,
    "last_accessed_by" INTEGER,
    "last_accessed_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT "client_credentials_vault_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "client_credentials_vault_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "it_projects"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- 7. Table: it_telemetry_logs (Isolated Dev Telemetry)
CREATE TABLE IF NOT EXISTS "it_telemetry_logs" (
    "id" SERIAL NOT NULL,
    "metric_type" VARCHAR(50) NOT NULL,
    "metric_value" NUMERIC(10,2) NOT NULL,
    "metadata" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT "it_telemetry_logs_pkey" PRIMARY KEY ("id")
);

-- Indexes for optimal lookup performance
CREATE INDEX IF NOT EXISTS "it_tech_leads_status_idx" ON "it_tech_leads"("status");
CREATE INDEX IF NOT EXISTS "it_tech_leads_created_at_idx" ON "it_tech_leads"("created_at");
CREATE INDEX IF NOT EXISTS "it_discovery_meetings_lead_idx" ON "it_discovery_meetings"("tech_lead_id");
CREATE INDEX IF NOT EXISTS "it_discovery_meetings_sched_idx" ON "it_discovery_meetings"("scheduled_at");
CREATE INDEX IF NOT EXISTS "quotation_versions_number_idx" ON "quotation_versions"("quotation_number");
CREATE INDEX IF NOT EXISTS "quotation_versions_is_current_idx" ON "quotation_versions"("is_current");
CREATE INDEX IF NOT EXISTS "it_projects_status_idx" ON "it_projects"("status");
CREATE INDEX IF NOT EXISTS "it_project_milestones_proj_idx" ON "it_project_milestones"("project_id");
CREATE INDEX IF NOT EXISTS "client_credentials_vault_proj_idx" ON "client_credentials_vault"("project_id");
CREATE INDEX IF NOT EXISTS "it_telemetry_logs_metric_idx" ON "it_telemetry_logs"("metric_type");
CREATE INDEX IF NOT EXISTS "it_telemetry_logs_created_at_idx" ON "it_telemetry_logs"("created_at");
