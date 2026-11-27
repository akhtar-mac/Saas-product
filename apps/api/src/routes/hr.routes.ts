import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';
import { prisma } from '../config/db.js';
import { verifyJWT, requireRole } from '../middleware/auth.middleware.js';
import { validate, ApiError, asyncHandler } from '../middleware/error.middleware.js';
import { recordAuditLog } from '../services/audit.service.js';
import { sendNotification, broadcastRoleNotification } from '../services/notification.service.js';
import { getPagination, formatPaginatedResponse } from '../services/pagination.util.js';
import { generateStorageKey } from '../services/storage.service.js';
import { overview as hrmsOverview } from '../hrms/hrms-service.js';

const router = Router();

// Local uploads directory for resumes
const uploadDir = path.join(process.cwd(), 'uploads', 'resumes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const resumeStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${safeName}_${Date.now()}${ext}`);
  },
});

const uploadResume = multer({
  storage: resumeStorage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = new Set(['.pdf', '.doc', '.docx']);
    if (!allowedExts.has(ext)) {
      return cb(new Error('Disallowed file format. Only PDF, DOC, and DOCX resumes are accepted.'));
    }
    cb(null, true);
  },
});

// Zod Validation Schemas
const applySchema = z.object({
  name: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  role: z.string().optional(),
  role_applied: z.string().optional(),
  department: z.string().optional(),
  current_company: z.string().optional(),
  current_title: z.string().optional(),
  experience: z.string().optional(),
  experience_years: z.string().optional(),
  expected_ctc: z.string().optional(),
  notice_period_days: z.string().optional(),
  linkedin: z.string().optional(),
  linkedin_url: z.string().optional(),
  portfolio_url: z.string().optional(),
  source: z.string().optional(),
  job_id: z.coerce.number().optional(),
  message: z.string().optional(),
});

const statusUpdateSchema = z.object({
  to_status: z.enum([
    'APPLIED',
    'UNDER_REVIEW',
    'SHORTLISTED',
    'INTERVIEW',
    'OFFERED',
    'HIRED',
    'REJECTED',
    'WITHDRAWN',
  ]),
  reason: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
});

const addNoteSchema = z.object({
  note_content: z.string().min(1, 'Note content required'),
  is_private: z.boolean().optional(),
});

const scheduleInterviewSchema = z.object({
  round_number: z.number().optional(),
  round_name: z.string().min(1, 'Round name required'),
  interview_type: z.enum(['GOOGLE_MEET', 'ZOOM', 'TELEPHONIC', 'IN_PERSON']).optional(),
  scheduled_at: z.string().min(1, 'Schedule date/time required'),
  duration_minutes: z.number().optional(),
  meeting_link: z.string().optional(),
  interviewer_id: z.number().optional(),
  interviewer_name: z.string().optional(),
});

const interviewFeedbackSchema = z.object({
  score: z.number().min(1).max(5),
  strengths: z.string().optional(),
  weaknesses: z.string().optional(),
  recommendation: z.enum(['STRONG_HIRE', 'HIRE', 'HOLD', 'NO_HIRE']),
  notes: z.string().optional(),
});

const jobOfferSchema = z.object({
  offered_ctc: z.string().min(1, 'Offered CTC required'),
  designation: z.string().min(1, 'Designation required'),
  joining_date: z.string().optional(),
  offer_letter_key: z.string().optional(),
});

// ─── 0. PUBLIC ENDPOINTS: Job Listings ────────────────────────────────────────
router.get(
  '/jobs',
  asyncHandler(async (_req: Request, res: Response) => {
    let jobs: any[] = [];
    try {
      jobs = await prisma.$queryRawUnsafe<any[]>(`SELECT * FROM jobs ORDER BY id ASC`);
    } catch (err) {
      console.warn('jobs table unavailable:', (err as Error).message);
      res.json({ success: true, data: [], warning: 'Careers table is not ready yet.' });
      return;
    }

    // Provide rich fallback positions if database has only test records
    const defaultPositions = [
      {
        id: 'ca-audit',
        title: 'Chartered Accountant (Audit & Direct Tax)',
        type: 'Full-Time',
        location: 'Aurangabad, MH / Hybrid',
        dept: 'Audit & Tax',
        exp: '2-5 Years',
        description:
          'Conduct corporate audits, direct tax compliance, and representation before tax authorities.',
      },
      {
        id: 'sales-exec',
        title: 'Senior Corporate Sales Executive',
        type: 'Full-Time',
        location: 'Multiple Cities (Pan-India)',
        dept: 'Sales',
        exp: '1-3 Years',
        description:
          'Drive high-volume enterprise onboarding, startup advisory, and B2B partnerships.',
      },
      {
        id: 'cs-legal',
        title: 'Company Secretary & Legal Compliance Officer',
        type: 'Full-Time',
        location: 'Aurangabad, MH',
        dept: 'Legal & ROC',
        exp: '2-4 Years',
        description: 'Drafting statutory resolutions, MCA V3 filings, and corporate governance.',
      },
      {
        id: 'react-dev',
        title: 'Full Stack React & Node.js Developer',
        type: 'Full-Time',
        location: 'Remote / Hybrid',
        dept: 'Technology',
        exp: '2-4 Years',
        description: 'Scale the client portal, internal tools, and the reporting views.',
      },
      {
        id: 'mkt-growth',
        title: 'Digital Growth & Performance Marketer',
        type: 'Full-Time',
        location: 'Aurangabad, MH / Remote',
        dept: 'Marketing',
        exp: '1-3 Years',
        description: 'Manage paid media campaigns, programmatic SEO, and full-funnel attribution.',
      },
    ];

    const formattedDbJobs = jobs.map((j: any) => ({
      id: j.id.toString(),
      title: j.title,
      type: j.type || 'Full-Time',
      location: j.location || 'India',
      dept: 'Corporate Services',
      exp: '1-4 Years',
      description: j.description || '',
      responsibilities: j.responsibilities || '',
      qualifications: j.qualifications || '',
      postedDate: j.posted_date || '',
    }));

    // Merge database jobs with core positions ensuring uniqueness
    const merged = [...formattedDbJobs];
    for (const def of defaultPositions) {
      if (
        !merged.some((m) => m.title.toLowerCase().includes(def.title.toLowerCase().slice(0, 10)))
      ) {
        merged.push({ ...def, responsibilities: '', qualifications: '', postedDate: '' });
      }
    }

    res.json({
      success: true,
      data: merged,
    });
  })
);

router.get(
  '/jobs/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const numId = parseInt(id, 10);
    let job: any = null;

    if (!isNaN(numId)) {
      job = await (prisma as any).jobs.findUnique({
        where: { id: numId },
      });
    }

    if (!job) {
      res.status(404).json({ success: false, error: { message: 'Job opening not found' } });
      return;
    }

    res.json({
      success: true,
      data: job,
    });
  })
);

// ─── 1. PUBLIC ENDPOINT: Submit Job Application ─────────────────────────────
router.post(
  '/apply',
  uploadResume.single('resume'),
  asyncHandler(async (req: Request, res: Response) => {
    const parseResult = applySchema.safeParse(req.body);
    if (!parseResult.success) {
      throw ApiError.badRequest('Validation failed', parseResult.error.errors);
    }
    const data = parseResult.data;

    // Normalize name and names
    const rawName = (data.first_name || data.name || 'Candidate').trim();
    const parts = rawName.split(/\s+/);
    const firstName = parts[0] || 'Candidate';
    const lastName = data.last_name || (parts.length > 1 ? parts.slice(1).join(' ') : null);
    const roleApplied = data.role_applied || data.role || 'General Staff';
    const experienceYears = data.experience_years || data.experience || null;
    const linkedinUrl = data.linkedin_url || data.linkedin || null;

    // Create normalized job_applications record in database
    const application = await (prisma as any).job_applications.create({
      data: {
        job_id: data.job_id || null,
        first_name: firstName,
        last_name: lastName,
        email: data.email,
        phone: data.phone,
        role_applied: roleApplied,
        department: data.department || 'General',
        current_company: data.current_company || null,
        current_title: data.current_title || null,
        experience_years: experienceYears,
        expected_ctc: data.expected_ctc || null,
        notice_period_days: data.notice_period_days || null,
        linkedin_url: linkedinUrl,
        portfolio_url: data.portfolio_url || null,
        source: data.source || 'Careers Page',
        status: 'APPLIED',
        rating: 0,
      },
    });

    // Record document if resume uploaded
    if (req.file) {
      const storageKey = `resumes/${req.file.filename}`;
      await (prisma as any).candidate_documents.create({
        data: {
          application_id: application.id,
          document_type: 'RESUME',
          file_name: req.file.originalname,
          file_key: storageKey,
          file_size: req.file.size,
          mime_type: req.file.mimetype,
        },
      });
    }

    // Record initial applicant message as a note if provided
    if (data.message) {
      await (prisma as any).application_notes.create({
        data: {
          application_id: application.id,
          author_id: null,
          author_name: `${firstName} (Applicant)`,
          note_content: data.message,
          is_private: false,
        },
      });
    }

    // Record application event
    await (prisma as any).application_events.create({
      data: {
        application_id: application.id,
        actor_id: null,
        actor_name: 'System (Online Application)',
        from_status: null,
        to_status: 'APPLIED',
        reason: 'Candidate submitted application from website /careers page',
      },
    });

    // Centralized Notification to HR & Admins
    await broadcastRoleNotification([14, 1, 2], {
      type: 'ats',
      title: 'New Candidate Applied',
      message: `${data.first_name} applied for "${data.role_applied}". Experience: ${data.experience_years || 'N/A'}.`,
      relatedId: application.id,
      redirectUrl: `/crm/hr?applicantId=${application.id}`,
    });

    // Centralized Audit Log
    await recordAuditLog({
      action: 'JOB_APPLICATION_SUBMITTED',
      resource: 'job_applications',
      resourceId: application.id,
      payload: { role: data.role_applied, email: data.email },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({
      success: true,
      message: 'Application received successfully. Our HR team will review your profile.',
      data: {
        id: application.id,
        status: application.status,
      },
    });
  })
);

// ─── PROTECTED STAFF ENDPOINTS (HR / Admins) ────────────────────────────────

// Allowed HR & Admin roles: Super Admin (1), Admin (2), Operations Mgr (3), HR (14), IT/Web Mgr (15)
const HR_ALLOWED_ROLES = [1, 2, 3, 14, 15];

// ─── 2. List Applications with Filter & Pagination ───────────────────────────
router.get(
  '/applications',
  verifyJWT,
  requireRole(HR_ALLOWED_ROLES),
  asyncHandler(async (req: Request, res: Response) => {
    const pagination = getPagination(req);
    const { status, search, department } = req.query;

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = String(status).toUpperCase();
    }
    if (department && department !== 'ALL') {
      where.department = { equals: String(department), mode: 'insensitive' };
    }
    if (search) {
      const q = String(search).trim();
      where.OR = [
        { first_name: { contains: q, mode: 'insensitive' } },
        { last_name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { role_applied: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [items, total, countStats] = await Promise.all([
      (prisma as any).job_applications.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { created_at: 'desc' },
        include: {
          documents: true,
          _count: {
            select: { notes: true, interviews: true },
          },
        },
      }),
      (prisma as any).job_applications.count({ where }),
      (prisma as any).job_applications.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
    ]);

    const counts: Record<string, number> = {
      ALL: 0,
      APPLIED: 0,
      UNDER_REVIEW: 0,
      SHORTLISTED: 0,
      INTERVIEW: 0,
      OFFERED: 0,
      HIRED: 0,
      REJECTED: 0,
      WITHDRAWN: 0,
    };

    countStats.forEach((s: any) => {
      counts[s.status] = s._count.status;
      counts.ALL += s._count.status;
    });

    const paginated = formatPaginatedResponse(items, total, pagination);
    res.json({
      success: true,
      data: {
        ...paginated,
        counts,
      },
    });
  })
);

// ─── 2B. COMPATIBILITY ENDPOINT: List Applicants for HR Dashboard ────────────
function toFrontendStatus(status: string): string {
  switch (status) {
    case 'APPLIED':
      return 'new';
    case 'UNDER_REVIEW':
      return 'review';
    case 'SHORTLISTED':
      return 'shortlisted';
    case 'INTERVIEW':
      return 'interview_scheduled';
    case 'OFFERED':
      return 'offered';
    case 'HIRED':
    case 'REJECTED':
    case 'WITHDRAWN':
      return 'rejected';
    default:
      return 'new';
  }
}

function toBackendStatus(status: string): string {
  switch (status) {
    case 'new':
      return 'APPLIED';
    case 'review':
      return 'UNDER_REVIEW';
    case 'shortlisted':
      return 'SHORTLISTED';
    case 'interview_scheduled':
      return 'INTERVIEW';
    case 'offered':
      return 'OFFERED';
    case 'rejected':
      return 'REJECTED';
    default:
      return 'APPLIED';
  }
}

function mapToApplicantDto(app: any) {
  return {
    id: String(app.id),
    name: [app.first_name, app.last_name].filter(Boolean).join(' '),
    email: app.email,
    phone: app.phone,
    role: app.role_applied,
    department: app.department || 'General',
    experience: app.experience_years ? `${app.experience_years} Years` : 'Experienced',
    linkedin: app.linkedin_url || undefined,
    expectedCtc: app.expected_ctc || undefined,
    noticePeriod: app.notice_period_days ? `${app.notice_period_days} Days` : undefined,
    resumeFileName: app.documents?.[0]?.file_name || undefined,
    resumeUrl: app.documents?.[0]
      ? `/v1/hr/applications/${app.id}/documents/${app.documents[0].id}/download`
      : undefined,
    status: toFrontendStatus(app.status),
    interviewDate: app.interviews?.[0]?.scheduled_at
      ? new Date(app.interviews[0].scheduled_at).toLocaleDateString()
      : undefined,
    interviewType:
      app.interviews?.[0]?.interview_type === 'GOOGLE_MEET' ? 'Google Meet' : 'Telephonic',
    rating: app.rating || 0,
    notes: app.notes?.map((n: any) => `${n.author_name || 'HR'}: ${n.note_content}`) || [],
    appliedAt: app.created_at ? new Date(app.created_at).toISOString() : new Date().toISOString(),
  };
}

router.get(
  '/applicants',
  verifyJWT,
  requireRole(HR_ALLOWED_ROLES),
  asyncHandler(async (_req: Request, res: Response) => {
    let items: any[] = [];
    try {
      items = await (prisma as any).job_applications.findMany({
        orderBy: { created_at: 'desc' },
        include: {
          documents: true,
          notes: { orderBy: { created_at: 'desc' } },
          interviews: { orderBy: { scheduled_at: 'asc' } },
        },
      });
    } catch (err) {
      console.warn('job applications unavailable:', (err as Error).message);
      res.json({
        success: true,
        data: {
          applicants: [],
          counts: {
            total: 0,
            new: 0,
            review: 0,
            shortlisted: 0,
            interview_scheduled: 0,
            offered: 0,
            rejected: 0,
          },
        },
        warning: 'Careers applications table is not ready yet.',
      });
      return;
    }

    const applicants = items.map(mapToApplicantDto);

    const counts = {
      total: items.length,
      new: items.filter((a: any) => a.status === 'APPLIED').length,
      review: items.filter((a: any) => a.status === 'UNDER_REVIEW').length,
      shortlisted: items.filter((a: any) => a.status === 'SHORTLISTED').length,
      interview_scheduled: items.filter((a: any) => a.status === 'INTERVIEW').length,
      offered: items.filter((a: any) => a.status === 'OFFERED').length,
      rejected: items.filter((a: any) => ['REJECTED', 'WITHDRAWN', 'HIRED'].includes(a.status))
        .length,
    };

    res.json({
      success: true,
      data: {
        applicants,
        counts,
      },
    });
  })
);

router.patch(
  '/applicants/:id',
  verifyJWT,
  requireRole(HR_ALLOWED_ROLES),
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw ApiError.badRequest('Invalid applicant ID');

    const { status, note, interviewDate, rating } = req.body;

    const existing = await (prisma as any).job_applications.findUnique({ where: { id } });
    if (!existing) throw ApiError.notFound('Applicant not found');

    const updateData: any = { updated_at: new Date() };
    if (status) {
      updateData.status = toBackendStatus(status);
    }
    if (typeof rating === 'number') {
      updateData.rating = rating;
    }

    await (prisma as any).job_applications.update({
      where: { id },
      data: updateData,
    });

    if (note && typeof note === 'string' && note.trim()) {
      await (prisma as any).application_notes.create({
        data: {
          application_id: id,
          author_id: req.user?.user_id || null,
          author_name: req.user?.username || 'HR Staff',
          note_content: note.trim(),
          is_private: false,
        },
      });
    }

    if (interviewDate) {
      await (prisma as any).interviews.create({
        data: {
          application_id: id,
          round_number: 1,
          round_name: 'HR Screening & Technical Discussion',
          interview_type: 'GOOGLE_MEET',
          scheduled_at: new Date(Date.now() + 24 * 3600 * 1000),
          duration_minutes: 30,
          interviewer_name: 'HR Team',
          status: 'SCHEDULED',
        },
      });
    }

    if (status && status !== toFrontendStatus(existing.status)) {
      await (prisma as any).application_events.create({
        data: {
          application_id: id,
          actor_id: req.user?.user_id || null,
          actor_name: req.user?.username || 'HR Staff',
          from_status: existing.status,
          to_status: updateData.status,
          reason: `Stage changed via HR Command Center`,
        },
      });

      await recordAuditLog({
        userId: req.user?.user_id || 1,
        action: 'UPDATE',
        entityType: 'job_applications',
        entityId: id,
        oldState: { status: existing.status },
        newState: { status: updateData.status },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
    }

    const refreshed = await (prisma as any).job_applications.findUnique({
      where: { id },
      include: {
        documents: true,
        notes: { orderBy: { created_at: 'desc' } },
        interviews: { orderBy: { scheduled_at: 'asc' } },
      },
    });

    res.json({
      success: true,
      data: mapToApplicantDto(refreshed),
    });
  })
);

// ─── 3. Get Single Candidate Application Details (Deep Fetch) ────────────────
router.get(
  '/applications/:id',
  verifyJWT,
  requireRole(HR_ALLOWED_ROLES),
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw ApiError.badRequest('Invalid application ID');

    const app = await (prisma as any).job_applications.findUnique({
      where: { id },
      include: {
        documents: { orderBy: { uploaded_at: 'desc' } },
        notes: { orderBy: { created_at: 'desc' } },
        interviews: {
          orderBy: { scheduled_at: 'asc' },
          include: { feedback: true },
        },
        offers: { orderBy: { created_at: 'desc' } },
        events: { orderBy: { created_at: 'desc' } },
      },
    });

    if (!app) throw ApiError.notFound('Application not found');

    res.json({ success: true, data: app });
  })
);

// ─── 4. Transition Application Status (Strict Workflow) ──────────────────────
router.patch(
  '/applications/:id/status',
  verifyJWT,
  requireRole(HR_ALLOWED_ROLES),
  validate(statusUpdateSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw ApiError.badRequest('Invalid application ID');

    const { to_status, reason, rating } = req.body;

    const existing = await (prisma as any).job_applications.findUnique({ where: { id } });
    if (!existing) throw ApiError.notFound('Application not found');

    const from_status = existing.status;

    // Update status and optional rating
    const updated = await (prisma as any).job_applications.update({
      where: { id },
      data: {
        status: to_status,
        ...(typeof rating === 'number' ? { rating } : {}),
        updated_at: new Date(),
      },
    });

    // Record immutable application event
    await (prisma as any).application_events.create({
      data: {
        application_id: id,
        actor_id: req.user?.user_id || null,
        actor_name: req.user?.username || req.user?.email || 'Staff',
        from_status,
        to_status,
        reason: reason || `Status changed from ${from_status} to ${to_status}`,
      },
    });

    // Centralized Audit Log
    await recordAuditLog({
      actorId: req.user?.user_id,
      actorEmail: req.user?.email,
      actorRole: req.user?.role_name,
      action: 'ATS_CANDIDATE_STATUS_UPDATED',
      resource: 'job_applications',
      resourceId: id,
      payload: { from_status, to_status, reason },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      success: true,
      message: `Candidate stage moved to ${to_status}`,
      data: updated,
    });
  })
);

// ─── 5. Add Application Note ──────────────────────────────────────────────────
router.post(
  '/applications/:id/notes',
  verifyJWT,
  requireRole(HR_ALLOWED_ROLES),
  validate(addNoteSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw ApiError.badRequest('Invalid application ID');

    const { note_content, is_private } = req.body;

    const note = await (prisma as any).application_notes.create({
      data: {
        application_id: id,
        author_id: req.user?.user_id || null,
        author_name: req.user?.username || req.user?.email || 'HR Member',
        note_content,
        is_private: !!is_private,
      },
    });

    await recordAuditLog({
      actorId: req.user?.user_id,
      actorEmail: req.user?.email,
      action: 'ATS_NOTE_ADDED',
      resource: 'application_notes',
      resourceId: note.id,
      payload: { application_id: id, is_private: !!is_private },
    });

    res.status(201).json({ success: true, message: 'Note recorded', data: note });
  })
);

// ─── 6. Schedule Interview Round ──────────────────────────────────────────────
router.post(
  '/applications/:id/interviews',
  verifyJWT,
  requireRole(HR_ALLOWED_ROLES),
  validate(scheduleInterviewSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw ApiError.badRequest('Invalid application ID');

    const data = req.body;

    // Generate meeting link if not provided
    const meetingLink =
      data.meeting_link ||
      `https://meet.google.com/etx-hr-${Math.random().toString(36).slice(2, 6)}-${Math.random().toString(36).slice(2, 5)}`;

    const interview = await (prisma as any).interviews.create({
      data: {
        application_id: id,
        round_number: data.round_number || 1,
        round_name: data.round_name,
        interview_type: data.interview_type || 'GOOGLE_MEET',
        scheduled_at: new Date(data.scheduled_at),
        duration_minutes: data.duration_minutes || 45,
        meeting_link: meetingLink,
        interviewer_id: data.interviewer_id || req.user?.user_id || null,
        interviewer_name: data.interviewer_name || req.user?.username || 'Technical Interviewer',
        status: 'SCHEDULED',
      },
    });

    // Advance candidate status to INTERVIEW if not already there
    await (prisma as any).job_applications.update({
      where: { id },
      data: { status: 'INTERVIEW', updated_at: new Date() },
    });

    // Record Event
    await (prisma as any).application_events.create({
      data: {
        application_id: id,
        actor_id: req.user?.user_id || null,
        actor_name: req.user?.username || 'HR Member',
        from_status: 'SHORTLISTED',
        to_status: 'INTERVIEW',
        reason: `Scheduled ${data.round_name} on ${new Date(data.scheduled_at).toLocaleString()}`,
      },
    });

    // Audit Log
    await recordAuditLog({
      actorId: req.user?.user_id,
      actorEmail: req.user?.email,
      action: 'ATS_INTERVIEW_SCHEDULED',
      resource: 'interviews',
      resourceId: interview.id,
      payload: { application_id: id, round_name: data.round_name },
    });

    res.status(201).json({
      success: true,
      message: 'Interview round scheduled successfully',
      data: interview,
    });
  })
);

// ─── 7. Submit Interview Feedback Scorecard ───────────────────────────────────
router.post(
  ['/interviews/:id/feedback', '/applications/:appId/interviews/:id/feedback'],
  verifyJWT,
  requireRole(HR_ALLOWED_ROLES),
  validate(interviewFeedbackSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw ApiError.badRequest('Invalid interview ID');

    const data = req.body;

    const feedback = await (prisma as any).interview_feedback.create({
      data: {
        interview_id: id,
        interviewer_id: req.user?.user_id || null,
        interviewer_name: req.user?.username || 'Interviewer',
        score: data.score,
        strengths: data.strengths || null,
        weaknesses: data.weaknesses || null,
        recommendation: data.recommendation,
        notes: data.notes || null,
      },
    });

    // Mark interview as COMPLETED
    await (prisma as any).interviews.update({
      where: { id },
      data: { status: 'COMPLETED' },
    });

    await recordAuditLog({
      actorId: req.user?.user_id,
      actorEmail: req.user?.email,
      action: 'ATS_INTERVIEW_FEEDBACK_SUBMITTED',
      resource: 'interview_feedback',
      resourceId: feedback.id,
      payload: { interview_id: id, recommendation: data.recommendation, score: data.score },
    });

    res.status(201).json({ success: true, message: 'Feedback recorded', data: feedback });
  })
);

// ─── 8. Issue Job Offer ───────────────────────────────────────────────────────
router.post(
  '/applications/:id/offers',
  verifyJWT,
  requireRole(HR_ALLOWED_ROLES),
  validate(jobOfferSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw ApiError.badRequest('Invalid application ID');

    const data = req.body;

    const offer = await (prisma as any).job_offers.create({
      data: {
        application_id: id,
        offered_ctc: data.offered_ctc,
        designation: data.designation,
        joining_date: data.joining_date ? new Date(data.joining_date) : null,
        offer_letter_key: data.offer_letter_key || null,
        status: 'DISPATCHED',
        approved_by: req.user?.user_id || null,
      },
    });

    // Update application stage to OFFERED
    await (prisma as any).job_applications.update({
      where: { id },
      data: { status: 'OFFERED', updated_at: new Date() },
    });

    await (prisma as any).application_events.create({
      data: {
        application_id: id,
        actor_id: req.user?.user_id || null,
        actor_name: req.user?.username || 'HR Member',
        from_status: 'INTERVIEW',
        to_status: 'OFFERED',
        reason: `Offer letter dispatched for ${data.designation} at ${data.offered_ctc}`,
      },
    });

    await recordAuditLog({
      actorId: req.user?.user_id,
      actorEmail: req.user?.email,
      action: 'ATS_JOB_OFFER_DISPATCHED',
      resource: 'job_offers',
      resourceId: offer.id,
      payload: { application_id: id, designation: data.designation, offered_ctc: data.offered_ctc },
    });

    res.status(201).json({ success: true, message: 'Job offer dispatched', data: offer });
  })
);

// ─── 9. List Job Openings (Reusing existing jobs table) ────────────────────────
router.get(
  '/openings',
  asyncHandler(async (_req: Request, res: Response) => {
    const openings = await (prisma as any).jobs.findMany({
      orderBy: { created_at: 'desc' },
    });

    res.json({ success: true, data: openings });
  })
);

// ─── 10. HR Workforce & Payroll Summary ───────────────────────────────────────
router.get(
  '/workforce-summary',
  verifyJWT,
  requireRole(HR_ALLOWED_ROLES),
  asyncHandler(async (_req: Request, res: Response) => {
    // Real numbers from the HRMS tables (payroll / accounts are not tracked here yet).
    const o = await hrmsOverview();
    res.json({
      success: true,
      data: {
        totalStaff: o.total_staff,
        presentToday: o.present_today,
        attendanceRate: o.attendance_rate === null ? null : `${o.attendance_rate}%`,
        onLeaveToday: o.on_leave_today,
        pendingLeaves: o.pending_leaves,
        date: o.date,
        departments: o.departments.map((d) => ({
          name: d.department,
          count: d.total,
          present: d.present,
        })),
        payrollSummary: null,
        accountsSummary: null,
        tables_ready: o.tables_ready,
      },
    });
  })
);

// ─── 9. Candidate Document Download with Access Authorization ─────────────────
router.get(
  '/applications/:id/documents/:docId/download',
  verifyJWT,
  requireRole(HR_ALLOWED_ROLES),
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const docId = parseInt(req.params.docId, 10);
    if (isNaN(id) || isNaN(docId)) throw ApiError.badRequest('Invalid application or document ID');

    const doc = await (prisma as any).candidate_documents.findFirst({
      where: { id: docId, application_id: id },
    });

    if (!doc) throw ApiError.notFound('Document not found for this candidate');

    // Audit log document access
    await recordAuditLog({
      actorId: req.user?.user_id,
      actorEmail: req.user?.email,
      action: 'ATS_DOCUMENT_ACCESSED',
      resource: 'candidate_documents',
      resourceId: doc.id,
      payload: { application_id: id, filename: doc.file_name },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    const localFilePath = path.join(process.cwd(), 'uploads', doc.file_key);
    if (fs.existsSync(localFilePath)) {
      res.setHeader('Content-Type', doc.mime_type || 'application/octet-stream');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(doc.file_name)}"`
      );
      fs.createReadStream(localFilePath).pipe(res);
      return;
    }

    // Fallback response with storage metadata
    res.json({
      success: true,
      data: {
        id: doc.id,
        filename: doc.file_name,
        fileKey: doc.file_key,
        mimeType: doc.mime_type,
        fileSize: doc.file_size,
        downloadUrl: `/uploads/${doc.file_key}`,
      },
    });
  })
);

export default router;
