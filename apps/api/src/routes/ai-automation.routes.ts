import { Router, Request, Response, NextFunction } from 'express';
import { verifyJWT, requireRole } from '../middleware/auth.middleware.js';
import { AiAutomationService } from '../services/ai-automation.service.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Allowed roles: Super Admin (1), Admin (2), Operations (3), HR Manager (14), IT Lead (15), Marketing Lead (16)
const AI_ALLOWED_ROLES = [1, 2, 3, 14, 15, 16];

router.use(verifyJWT);
router.use(requireRole(AI_ALLOWED_ROLES));

/**
 * POST /v1/ai/score-resume
 * ATS candidate resume scoring against job requirements
 */
router.post('/score-resume', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { candidate_name, position, skills, experience_years, education, job_requirements } = req.body;
    if (!candidate_name || !position || !skills) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: candidate_name, position, skills',
      });
    }

    const userId = (req as any).user?.id;
    const result = await AiAutomationService.scoreResume(
      {
        candidate_name,
        position,
        skills: Array.isArray(skills) ? skills : [skills],
        experience_years: Number(experience_years) || 1,
        education,
        job_requirements,
      },
      userId
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /v1/ai/generate-scope
 * IT Command Center scope and architecture blueprint generation
 */
router.post('/generate-scope', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { project_title, project_type, client_requirements, tech_stack_preference, budget_range, target_timeline_weeks } = req.body;
    if (!project_title || !client_requirements) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: project_title, client_requirements',
      });
    }

    const userId = (req as any).user?.id;
    const result = await AiAutomationService.generateITScope(
      {
        project_title,
        project_type: project_type || 'Custom Enterprise Platform',
        client_requirements,
        tech_stack_preference,
        budget_range,
        target_timeline_weeks: Number(target_timeline_weeks) || 8,
      },
      userId
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /v1/ai/generate-copy
 * Marketing Hub multi-variation copy and hashtag generation
 */
router.post('/generate-copy', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { topic, platform, objective, tone, target_audience } = req.body;
    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameter: topic',
      });
    }

    const userId = (req as any).user?.id;
    const result = await AiAutomationService.generateMarketingCopy(
      {
        topic,
        platform: platform || 'LinkedIn',
        objective: objective || 'LEAD_GENERATION',
        tone,
        target_audience,
      },
      userId
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /v1/ai/tasks
 * Historical log of AI automation executions
 */
router.get('/tasks', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const taskType = req.query.task_type as string | undefined;
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const tasks = await AiAutomationService.getTasks(taskType, limit);

    res.json({
      success: true,
      data: tasks,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
