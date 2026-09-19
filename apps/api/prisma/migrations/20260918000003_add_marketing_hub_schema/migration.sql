-- Migration: 20260918000003_add_marketing_hub_schema
-- Phase 3: Marketing, Social Media Planner, Paid Ads & Growth Attribution Hub
-- Strictly additive: ZERO table drops, ZERO deletes, ZERO column alters

-- 1. Table: social_channel_accounts (Connected Social Profiles)
CREATE TABLE IF NOT EXISTS "social_channel_accounts" (
    "id" SERIAL NOT NULL,
    "platform" VARCHAR(50) NOT NULL, -- Instagram, Facebook, LinkedIn, YouTube, Google Business
    "account_name" VARCHAR(150) NOT NULL,
    "account_handle" VARCHAR(100) NOT NULL,
    "profile_url" VARCHAR(500),
    "followers_count" INTEGER DEFAULT 0,
    "engagement_rate" NUMERIC(5,2) DEFAULT 0,
    "is_connected" BOOLEAN NOT NULL DEFAULT true,
    "access_token_encrypted" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT "social_channel_accounts_pkey" PRIMARY KEY ("id")
);

-- 2. Table: marketing_posts (Social Media Planner)
CREATE TABLE IF NOT EXISTS "marketing_posts" (
    "id" SERIAL NOT NULL,
    "post_code" VARCHAR(50) NOT NULL,
    "platform" VARCHAR(50) NOT NULL,
    "channel_id" INTEGER,
    "title" VARCHAR(250) NOT NULL,
    "caption" TEXT NOT NULL,
    "hashtags" TEXT,
    "creative_url" VARCHAR(500),
    "media_type" VARCHAR(50) DEFAULT 'IMAGE', -- IMAGE, VIDEO, CAROUSEL, REEL
    "scheduled_date" TIMESTAMP(6),
    "status" VARCHAR(50) NOT NULL DEFAULT 'DRAFT', -- DRAFT, IN_DESIGN, SCHEDULED, PUBLISHED, ARCHIVED
    "author_id" INTEGER,
    "author_name" VARCHAR(150) DEFAULT 'Growth Lead',
    "likes_count" INTEGER DEFAULT 0,
    "comments_count" INTEGER DEFAULT 0,
    "shares_count" INTEGER DEFAULT 0,
    "reach_count" INTEGER DEFAULT 0,
    "leads_count" INTEGER DEFAULT 0,
    "published_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT "marketing_posts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "marketing_posts_post_code_key" UNIQUE ("post_code"),
    CONSTRAINT "marketing_posts_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "social_channel_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- 3. Table: ad_campaigns (Paid Ads & Funnel Telemetry)
CREATE TABLE IF NOT EXISTS "ad_campaigns" (
    "id" SERIAL NOT NULL,
    "campaign_code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "platform" VARCHAR(50) NOT NULL, -- Google Ads, Meta Ads (FB/IG), Direct WhatsApp, YouTube
    "objective" VARCHAR(100) DEFAULT 'LEAD_GENERATION',
    "daily_budget" NUMERIC(12,2) NOT NULL DEFAULT 0,
    "total_spent" NUMERIC(12,2) NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "leads_generated" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "cpl" NUMERIC(10,2) NOT NULL DEFAULT 0,
    "roas" NUMERIC(6,2) NOT NULL DEFAULT 0,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, PAUSED, COMPLETED
    "start_date" DATE,
    "end_date" DATE,
    "target_audience" TEXT,
    "landing_page_url" VARCHAR(500),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT "ad_campaigns_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ad_campaigns_campaign_code_key" UNIQUE ("campaign_code")
);

-- 4. Table: ad_metrics_snapshots (Daily / Hourly Spend & Performance Snapshots)
CREATE TABLE IF NOT EXISTS "ad_metrics_snapshots" (
    "id" SERIAL NOT NULL,
    "campaign_id" INTEGER NOT NULL,
    "snapshot_date" DATE NOT NULL,
    "spend_amount" NUMERIC(12,2) NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "leads_count" INTEGER NOT NULL DEFAULT 0,
    "cpl" NUMERIC(10,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT "ad_metrics_snapshots_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ad_metrics_snapshots_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "ad_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 5. Table: marketing_attribution_events (Full Journey Attribution Tracking)
CREATE TABLE IF NOT EXISTS "marketing_attribution_events" (
    "id" SERIAL NOT NULL,
    "lead_id" BIGINT,
    "campaign_id" INTEGER,
    "utm_source" VARCHAR(100),
    "utm_medium" VARCHAR(100),
    "utm_campaign" VARCHAR(150),
    "utm_term" VARCHAR(150),
    "utm_content" VARCHAR(150),
    "referrer_url" VARCHAR(500),
    "landing_page" VARCHAR(500),
    "ip_address" VARCHAR(45),
    "device_type" VARCHAR(50), -- MOBILE, DESKTOP, TABLET
    "touchpoint_sequence" SMALLINT DEFAULT 1,
    "converted_to_order" BOOLEAN NOT NULL DEFAULT false,
    "attributed_revenue" NUMERIC(12,2) DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT "marketing_attribution_events_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "marketing_attribution_events_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "ad_campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Indexes for fast filtering & analytics
CREATE INDEX IF NOT EXISTS "marketing_posts_platform_idx" ON "marketing_posts"("platform");
CREATE INDEX IF NOT EXISTS "marketing_posts_status_idx" ON "marketing_posts"("status");
CREATE INDEX IF NOT EXISTS "marketing_posts_sched_idx" ON "marketing_posts"("scheduled_date");
CREATE INDEX IF NOT EXISTS "ad_campaigns_platform_idx" ON "ad_campaigns"("platform");
CREATE INDEX IF NOT EXISTS "ad_campaigns_status_idx" ON "ad_campaigns"("status");
CREATE INDEX IF NOT EXISTS "ad_metrics_snapshots_date_idx" ON "ad_metrics_snapshots"("snapshot_date");
CREATE INDEX IF NOT EXISTS "marketing_attribution_lead_idx" ON "marketing_attribution_events"("lead_id");
CREATE INDEX IF NOT EXISTS "marketing_attribution_source_idx" ON "marketing_attribution_events"("utm_source");
