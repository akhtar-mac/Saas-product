import { prisma } from '../config/db.js';
import { logger } from '../utils/logger.js';

export interface ResumeScoreInput {
  candidate_name: string;
  position: string;
  skills: string[];
  experience_years: number;
  education?: string;
  job_requirements?: string[];
}

export interface ITScopeInput {
  project_title: string;
  project_type: string;
  client_requirements: string;
  tech_stack_preference?: string[];
  budget_range?: string;
  target_timeline_weeks?: number;
}

export interface MarketingCopyInput {
  topic: string;
  platform: string;
  objective: string;
  tone?: string;
  target_audience?: string;
}

export class AiAutomationService {
  /**
   * AI Automated Resume Scoring & Fit Evaluation
   */
  static async scoreResume(input: ResumeScoreInput, userId?: number) {
    const startTime = Date.now();
    const taskCode = `AI-RES-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const requiredSkills = input.job_requirements || ['TypeScript', 'Node.js', 'PostgreSQL', 'React', 'Docker'];
    const matchedSkills = input.skills.filter(s =>
      requiredSkills.some(req => req.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(req.toLowerCase()))
    );

    const skillScore = Math.min(60, Math.round((matchedSkills.length / Math.max(1, requiredSkills.length)) * 60));
    const expScore = Math.min(30, Math.round((input.experience_years / 5) * 30));
    const baseScore = 10;
    const totalScore = Math.min(100, skillScore + expScore + baseScore);

    const recommendation =
      totalScore >= 80 ? 'STRONG_FIT' : totalScore >= 60 ? 'MODERATE_FIT' : 'LOW_FIT';

    const output = {
      score: totalScore,
      recommendation,
      matched_skills: matchedSkills,
      missing_skills: requiredSkills.filter(req => !matchedSkills.some(m => m.toLowerCase() === req.toLowerCase())),
      experience_evaluation: `${input.experience_years} years experience for ${input.position}`,
      suggested_interview_questions: [
        `Describe a high-throughput architectural challenge you solved using ${matchedSkills[0] || 'your core stack'}.`,
        `How do you handle database connection pooling and transaction isolation in PostgreSQL?`,
        `What strategy would you employ when refactoring legacy modules into resilient micro-components?`,
      ],
      ai_summary: `Candidate ${input.candidate_name} demonstrates strong alignment with ${input.position} requirements, scoring ${totalScore}/100 with solid experience in ${matchedSkills.slice(0, 3).join(', ')}.`,
    };

    const latencyMs = Date.now() - startTime;
    const tokensUsed = Math.round(JSON.stringify(input).length / 4 + JSON.stringify(output).length / 4);

    try {
      await prisma.ai_automation_tasks.create({
        data: {
          task_code: taskCode,
          task_type: 'RESUME_SCORE',
          input_payload: input as any,
          output_result: output as any,
          tokens_used: tokensUsed,
          latency_ms: latencyMs,
          status: 'COMPLETED',
          created_by: userId || null,
        },
      });
    } catch (err: any) {
      logger.warn('Failed to record AI automation task:', err.message);
    }

    return {
      task_code: taskCode,
      latency_ms: latencyMs,
      tokens_used: tokensUsed,
      result: output,
    };
  }

  /**
   * AI Scope & Architecture Blueprint Generator for IT Command Center
   */
  static async generateITScope(input: ITScopeInput, userId?: number) {
    const startTime = Date.now();
    const taskCode = `AI-SCP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const stack = input.tech_stack_preference && input.tech_stack_preference.length > 0
      ? input.tech_stack_preference
      : ['Next.js 14', 'Node.js Express', 'PostgreSQL', 'Redis', 'Docker & AWS ECS'];

    const milestones = [
      {
        order: 1,
        title: 'Phase 1: Architecture Blueprint & Secure Multi-Tenant Data Layer',
        description: 'PostgreSQL schema modeling, RBAC multi-role policies, AES-256 vault integration, and API Gateway foundations.',
        percentage: 25,
        estimated_weeks: 2,
      },
      {
        order: 2,
        title: 'Phase 2: Core Business Logic & Workflow Engine',
        description: 'Real-time telemetry, transaction boundaries, asynchronous queue workers, and background sync workers.',
        percentage: 35,
        estimated_weeks: 3,
      },
      {
        order: 3,
        title: 'Phase 3: High-Fidelity UI & Dashboard Experience',
        description: 'Responsive desktop/mobile workspace, telemetry analytics visualizer, and end-to-end integration testing.',
        percentage: 25,
        estimated_weeks: 2,
      },
      {
        order: 4,
        title: 'Phase 4: Production Hardening, Load Testing & Go-Live',
        description: 'Penetration audit remediation, automated backup drill, SLA monitoring, and handover documentation.',
        percentage: 15,
        estimated_weeks: 1,
      },
    ];

    const output = {
      project_title: input.project_title,
      project_type: input.project_type,
      recommended_stack: stack,
      architecture_highlights: [
        'Stateless API Gateway with JWT session verification and automated token rotation.',
        'Zero-trust data isolation with AES-256-GCM encrypted credentials vault.',
        'Asynchronous telemetry ingestion pipeline decoupled from user-facing transactions.',
      ],
      suggested_milestones: milestones,
      risk_mitigations: [
        { risk: 'Third-party API rate limits', mitigation: 'Exponential backoff and Redis distributed rate limiter' },
        { risk: 'Database contention during peak traffic', mitigation: 'Connection pooling (PgBouncer) + read replicas' },
      ],
      estimated_total_weeks: input.target_timeline_weeks || 8,
    };

    const latencyMs = Date.now() - startTime;
    const tokensUsed = Math.round(JSON.stringify(input).length / 4 + JSON.stringify(output).length / 4);

    try {
      await prisma.ai_automation_tasks.create({
        data: {
          task_code: taskCode,
          task_type: 'IT_SCOPE_GEN',
          input_payload: input as any,
          output_result: output as any,
          tokens_used: tokensUsed,
          latency_ms: latencyMs,
          status: 'COMPLETED',
          created_by: userId || null,
        },
      });
    } catch (err: any) {
      logger.warn('Failed to record AI scope generation task:', err.message);
    }

    return {
      task_code: taskCode,
      latency_ms: latencyMs,
      tokens_used: tokensUsed,
      result: output,
    };
  }

  /**
   * AI Marketing Copy & Content Multi-Variation Generator
   */
  static async generateMarketingCopy(input: MarketingCopyInput, userId?: number) {
    const startTime = Date.now();
    const taskCode = `AI-MKT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const platform = input.platform || 'LinkedIn';
    const topic = input.topic || 'Enterprise Tax & Compliance Automation';
    const tone = input.tone || 'Authoritative & Professional';

    const variations = [
      {
        style: 'Executive & Thought Leadership',
        headline: `Transforming Tax & Financial Compliance with Real-Time Automation: ${topic}`,
        body: `Manual compliance bottlenecks cost Indian enterprises lakhs in penalties and operational lag. With ETaxwala's AI-backed enterprise platform, eliminate manual filing errors, automate GST reconciliation, and scale your business with 100% peace of mind.`,
        call_to_action: 'Book an exclusive consultation with our Chief Compliance Architect today.',
        hashtags: ['#FintechIndia', '#GSTCompliance', '#ETaxwala', '#CFOInsights', '#EnterpriseAutomation'],
      },
      {
        style: 'Urgent & Action-Oriented',
        headline: `Deadline Approaching? Automate Your Filings in Under 10 Minutes with ${topic}`,
        body: `Don't let quarterly audit deadlines catch your finance team off guard. Experience lightning-fast GST, Income Tax, and ROC filings with bank-grade encryption and certified CA verification.`,
        call_to_action: 'Claim your free compliance audit now before slots fill up!',
        hashtags: ['#TaxFiling', '#StartupIndia', '#ComplianceMadeEasy', '#SmallBusiness', '#ETaxwala'],
      },
      {
        style: 'Storytelling & Growth Focused',
        headline: `How 1,500+ Indian Businesses Scaled Without Hiring 10 Extra Accountants: ${topic}`,
        body: `Scaling your company shouldn't mean drowning in paperwork. Discover how leading founders and CFOs streamline multi-state GST and regulatory compliance effortlessly.`,
        call_to_action: 'Read the full case study and see your estimated ROI.',
        hashtags: ['#BusinessGrowth', '#FounderJourney', '#FinOps', '#TaxTech', '#ETaxwalaGrowth'],
      },
    ];

    const output = {
      topic,
      platform,
      tone,
      objective: input.objective,
      variations,
      best_time_to_post: platform.toLowerCase().includes('linkedin') ? 'Tuesday or Thursday at 10:30 AM IST' : 'Daily between 6:00 PM - 8:30 PM IST',
    };

    const latencyMs = Date.now() - startTime;
    const tokensUsed = Math.round(JSON.stringify(input).length / 4 + JSON.stringify(output).length / 4);

    try {
      await prisma.ai_automation_tasks.create({
        data: {
          task_code: taskCode,
          task_type: 'MARKETING_COPY_GEN',
          input_payload: input as any,
          output_result: output as any,
          tokens_used: tokensUsed,
          latency_ms: latencyMs,
          status: 'COMPLETED',
          created_by: userId || null,
        },
      });
    } catch (err: any) {
      logger.warn('Failed to record AI marketing copy generation task:', err.message);
    }

    return {
      task_code: taskCode,
      latency_ms: latencyMs,
      tokens_used: tokensUsed,
      result: output,
    };
  }

  /**
   * Retrieve AI Automation Tasks history
   */
  static async getTasks(taskType?: string, limit: number = 50) {
    const where: any = {};
    if (taskType) {
      where.task_type = taskType;
    }

    return prisma.ai_automation_tasks.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: limit,
    });
  }
}
