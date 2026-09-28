-- CreateTable: job_applications
CREATE TABLE IF NOT EXISTS "job_applications" (
    "id" SERIAL NOT NULL,
    "job_id" INTEGER,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100),
    "email" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(30) NOT NULL,
    "role_applied" VARCHAR(150) NOT NULL,
    "department" VARCHAR(100) DEFAULT 'General',
    "current_company" VARCHAR(150),
    "current_title" VARCHAR(150),
    "experience_years" VARCHAR(50),
    "expected_ctc" VARCHAR(50),
    "notice_period_days" VARCHAR(50),
    "linkedin_url" VARCHAR(500),
    "portfolio_url" VARCHAR(500),
    "source" VARCHAR(100) DEFAULT 'Careers Page',
    "status" VARCHAR(50) NOT NULL DEFAULT 'APPLIED',
    "rating" SMALLINT DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT "job_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable: candidate_documents
CREATE TABLE IF NOT EXISTS "candidate_documents" (
    "id" SERIAL NOT NULL,
    "application_id" INTEGER NOT NULL,
    "document_type" VARCHAR(50) NOT NULL DEFAULT 'RESUME',
    "file_name" VARCHAR(255) NOT NULL,
    "file_key" VARCHAR(500) NOT NULL,
    "file_size" INTEGER,
    "mime_type" VARCHAR(100),
    "uploaded_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT "candidate_documents_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "candidate_documents_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "job_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable: application_notes
CREATE TABLE IF NOT EXISTS "application_notes" (
    "id" SERIAL NOT NULL,
    "application_id" INTEGER NOT NULL,
    "author_id" INTEGER,
    "author_name" VARCHAR(150),
    "note_content" TEXT NOT NULL,
    "is_private" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT "application_notes_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "application_notes_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "job_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable: interviews
CREATE TABLE IF NOT EXISTS "interviews" (
    "id" SERIAL NOT NULL,
    "application_id" INTEGER NOT NULL,
    "round_number" SMALLINT NOT NULL DEFAULT 1,
    "round_name" VARCHAR(100) NOT NULL DEFAULT 'Technical Round',
    "interview_type" VARCHAR(50) NOT NULL DEFAULT 'GOOGLE_MEET',
    "scheduled_at" TIMESTAMP(6) NOT NULL,
    "duration_minutes" INTEGER NOT NULL DEFAULT 45,
    "meeting_link" VARCHAR(500),
    "interviewer_id" INTEGER,
    "interviewer_name" VARCHAR(150),
    "status" VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT "interviews_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "interviews_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "job_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable: interview_feedback
CREATE TABLE IF NOT EXISTS "interview_feedback" (
    "id" SERIAL NOT NULL,
    "interview_id" INTEGER NOT NULL,
    "interviewer_id" INTEGER,
    "interviewer_name" VARCHAR(150),
    "score" SMALLINT NOT NULL DEFAULT 3,
    "strengths" TEXT,
    "weaknesses" TEXT,
    "recommendation" VARCHAR(50) NOT NULL DEFAULT 'HIRE',
    "notes" TEXT,
    "submitted_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT "interview_feedback_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "interview_feedback_interview_id_fkey" FOREIGN KEY ("interview_id") REFERENCES "interviews"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable: job_offers
CREATE TABLE IF NOT EXISTS "job_offers" (
    "id" SERIAL NOT NULL,
    "application_id" INTEGER NOT NULL,
    "offered_ctc" VARCHAR(50) NOT NULL,
    "designation" VARCHAR(150) NOT NULL,
    "joining_date" DATE,
    "offer_letter_key" VARCHAR(500),
    "status" VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    "approved_by" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT "job_offers_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "job_offers_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "job_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable: application_events
CREATE TABLE IF NOT EXISTS "application_events" (
    "id" SERIAL NOT NULL,
    "application_id" INTEGER NOT NULL,
    "actor_id" INTEGER,
    "actor_name" VARCHAR(150),
    "from_status" VARCHAR(50),
    "to_status" VARCHAR(50) NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT "application_events_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "application_events_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "job_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS "job_applications_status_idx" ON "job_applications"("status");
CREATE INDEX IF NOT EXISTS "job_applications_email_idx" ON "job_applications"("email");
CREATE INDEX IF NOT EXISTS "job_applications_created_at_idx" ON "job_applications"("created_at");
CREATE INDEX IF NOT EXISTS "candidate_documents_app_idx" ON "candidate_documents"("application_id");
CREATE INDEX IF NOT EXISTS "application_notes_app_idx" ON "application_notes"("application_id");
CREATE INDEX IF NOT EXISTS "interviews_app_idx" ON "interviews"("application_id");
CREATE INDEX IF NOT EXISTS "application_events_app_idx" ON "application_events"("application_id");
