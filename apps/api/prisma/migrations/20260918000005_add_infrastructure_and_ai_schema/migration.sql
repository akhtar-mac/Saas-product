-- Migration: 20260918000005_add_infrastructure_and_ai_schema
-- Phase 5: Isolated Infrastructure Telemetry & AI Automation Extension Points

CREATE TABLE IF NOT EXISTS "system_health_snapshots" (
    "id" SERIAL PRIMARY KEY,
    "cpu_load_percent" DOUBLE PRECISION NOT NULL,
    "memory_rss_mb" DOUBLE PRECISION NOT NULL,
    "memory_heap_used_mb" DOUBLE PRECISION NOT NULL,
    "memory_heap_total_mb" DOUBLE PRECISION NOT NULL,
    "db_pool_active" INTEGER NOT NULL DEFAULT 0,
    "db_pool_idle" INTEGER NOT NULL DEFAULT 0,
    "db_latency_ms" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "system_status" VARCHAR(30) NOT NULL DEFAULT 'HEALTHY',
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_system_health_snapshots_created_at" ON "system_health_snapshots"("created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_system_health_snapshots_status" ON "system_health_snapshots"("system_status");

CREATE TABLE IF NOT EXISTS "ai_automation_tasks" (
    "id" SERIAL PRIMARY KEY,
    "task_code" VARCHAR(50) UNIQUE NOT NULL,
    "task_type" VARCHAR(50) NOT NULL,
    "input_payload" JSONB NOT NULL,
    "output_result" JSONB NOT NULL,
    "tokens_used" INTEGER NOT NULL DEFAULT 0,
    "latency_ms" INTEGER NOT NULL DEFAULT 0,
    "status" VARCHAR(30) NOT NULL DEFAULT 'COMPLETED',
    "error_message" TEXT,
    "created_by" INTEGER REFERENCES "staff_users"("id") ON DELETE SET NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_ai_automation_tasks_task_type" ON "ai_automation_tasks"("task_type");
CREATE INDEX IF NOT EXISTS "idx_ai_automation_tasks_created_at" ON "ai_automation_tasks"("created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_ai_automation_tasks_status" ON "ai_automation_tasks"("status");
