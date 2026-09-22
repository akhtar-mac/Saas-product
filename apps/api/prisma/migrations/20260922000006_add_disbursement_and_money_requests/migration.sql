-- Migration: 20260922000006_add_disbursement_and_money_requests
-- Phase 6: In-Chat Staff Money Requests, Accounts Float Management & Payment Proofs

CREATE TABLE IF NOT EXISTS "disbursement_wallets" (
    "id" SERIAL PRIMARY KEY,
    "officer_id" INTEGER NOT NULL UNIQUE REFERENCES "staff_users"("id") ON DELETE CASCADE,
    "balance" NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    "total_funded" NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    "total_disbursed" NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    "low_balance_threshold" NUMERIC(14,2) NOT NULL DEFAULT 5000.00,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_disbursement_wallets_officer_id" ON "disbursement_wallets"("officer_id");
CREATE INDEX IF NOT EXISTS "idx_disbursement_wallets_is_active" ON "disbursement_wallets"("is_active");

CREATE TABLE IF NOT EXISTS "disbursement_topups" (
    "id" SERIAL PRIMARY KEY,
    "wallet_id" INTEGER NOT NULL REFERENCES "disbursement_wallets"("id") ON DELETE CASCADE,
    "officer_id" INTEGER NOT NULL REFERENCES "staff_users"("id") ON DELETE CASCADE,
    "admin_id" INTEGER NOT NULL REFERENCES "staff_users"("id") ON DELETE CASCADE,
    "amount" NUMERIC(14,2) NOT NULL,
    "payment_mode" VARCHAR(50) NOT NULL DEFAULT 'BANK_TRANSFER',
    "reference_no" VARCHAR(100),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_disbursement_topups_wallet_id" ON "disbursement_topups"("wallet_id");
CREATE INDEX IF NOT EXISTS "idx_disbursement_topups_officer_id" ON "disbursement_topups"("officer_id");
CREATE INDEX IF NOT EXISTS "idx_disbursement_topups_created_at" ON "disbursement_topups"("created_at" DESC);

CREATE TABLE IF NOT EXISTS "disbursement_requests" (
    "id" SERIAL PRIMARY KEY,
    "request_code" VARCHAR(50) UNIQUE NOT NULL,
    "requester_id" INTEGER NOT NULL REFERENCES "staff_users"("id") ON DELETE CASCADE,
    "officer_id" INTEGER REFERENCES "staff_users"("id") ON DELETE SET NULL,
    "conversation_id" INTEGER REFERENCES "chat_conversations"("id") ON DELETE SET NULL,
    "message_id" INTEGER REFERENCES "chat_messages"("id") ON DELETE SET NULL,
    "amount" NUMERIC(14,2) NOT NULL,
    "purpose_category" VARCHAR(100) NOT NULL,
    "purpose_description" TEXT NOT NULL,
    "client_ref" VARCHAR(150),
    "upi_id" VARCHAR(100),
    "qr_code_url" VARCHAR(500),
    "status" VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    "rejection_reason" TEXT,
    "payment_proof_url" VARCHAR(500),
    "utr_number" VARCHAR(100),
    "paid_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_disbursement_requests_requester_id" ON "disbursement_requests"("requester_id");
CREATE INDEX IF NOT EXISTS "idx_disbursement_requests_officer_id" ON "disbursement_requests"("officer_id");
CREATE INDEX IF NOT EXISTS "idx_disbursement_requests_conversation_id" ON "disbursement_requests"("conversation_id");
CREATE INDEX IF NOT EXISTS "idx_disbursement_requests_status" ON "disbursement_requests"("status");
CREATE INDEX IF NOT EXISTS "idx_disbursement_requests_created_at" ON "disbursement_requests"("created_at" DESC);
