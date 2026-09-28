import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';

const prisma = new PrismaClient();
const API_BASE = 'http://localhost:5001';

interface TestStats {
  total: number;
  passed: number;
  failed: number;
  errors: string[];
}

const stats: TestStats = { total: 0, passed: 0, failed: 0, errors: [] };

function assert(condition: boolean, testName: string, detail?: string) {
  stats.total++;
  if (condition) {
    stats.passed++;
    console.log(`✅ PASS ${testName}`);
  } else {
    stats.failed++;
    const errMsg = `❌ FAIL ${testName}${detail ? `: ${detail}` : ''}`;
    console.error(errMsg);
    stats.errors.push(errMsg);
  }
}

async function main() {
  console.log('=================================================================');
  console.log('STARTING PHASE 5: INFRASTRUCTURE TELEMETRY & AI AUTOMATION TESTS');
  console.log('=================================================================\n');

  // ── Step 0: Authenticate Personas ──
  console.log('--- Step 0: Authenticating Personas ---');
  
  // Super Admin (Role 1)
  const adminRes = await fetch(`${API_BASE}/v1/auth/staff/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@etaxwala.com', password: 'Password@123' }),
  });
  const adminData: any = await adminRes.json();
  const adminToken = adminData.data?.accessToken;
  assert(adminRes.status === 200 && !!adminToken, '0a. Super Admin authenticated cleanly');

  // Sales Persona (Role 7) for negative RBAC testing
  const salesRes = await fetch(`${API_BASE}/v1/auth/staff/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'priya.sales@etaxwala.com', password: 'Password@123' }),
  });
  const salesData: any = await salesRes.json();
  const salesToken = salesData.data?.accessToken;
  assert(salesRes.status === 200 && !!salesToken, '0b. Sales Persona authenticated for negative RBAC checks');

  // HR Persona (Role 14) for AI ATS tests
  const hrRes = await fetch(`${API_BASE}/v1/auth/staff/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'hr@etaxwala.com', password: 'Password@123' }),
  });
  const hrData: any = await hrRes.json();
  const hrToken = hrData.data?.accessToken;
  assert(hrRes.status === 200 && !!hrToken, '0c. HR Persona authenticated for AI ATS tests');

  // ── Step 1: Strict RBAC Isolation on Infrastructure Telemetry ──
  console.log('\n--- Step 1: Strict RBAC Isolation on Infrastructure Telemetry ---');

  // 1a. Unauthenticated GET /v1/infrastructure/metrics -> 401
  const unauthInfra = await fetch(`${API_BASE}/v1/infrastructure/metrics`);
  assert(unauthInfra.status === 401, '1a. Unauthenticated GET /v1/infrastructure/metrics rejected with 401');

  // 1b. Unauthorized Sales Role -> 403
  const forbiddenInfra = await fetch(`${API_BASE}/v1/infrastructure/metrics`, {
    headers: { Authorization: `Bearer ${salesToken}` },
  });
  assert(forbiddenInfra.status === 403, '1b. Unauthorized Sales Role rejected from telemetry with 403');

  // 1c. Authorized Super Admin -> 200 with live metrics
  const authInfra = await fetch(`${API_BASE}/v1/infrastructure/metrics`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const metricsData: any = await authInfra.json();
  assert(
    authInfra.status === 200 &&
    typeof metricsData.data?.cpu_load_percent === 'number' &&
    typeof metricsData.data?.memory_rss_mb === 'number' &&
    typeof metricsData.data?.db_latency_ms === 'number' &&
    metricsData.data?.system_status === 'HEALTHY',
    '1c. Authorized Super Admin receives live telemetry metrics (CPU, RAM, DB Latency, Status)'
  );

  // ── Step 2: Telemetry History & Database Benchmarking ──
  console.log('\n--- Step 2: Telemetry History & Database Benchmarking ---');

  // 2a. POST /v1/infrastructure/benchmark -> multi-iteration database latency
  const benchRes = await fetch(`${API_BASE}/v1/infrastructure/benchmark`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const benchData: any = await benchRes.json();
  assert(
    benchRes.status === 200 &&
    Array.isArray(benchData.data?.latencies) &&
    benchData.data?.latencies.length === 5 &&
    typeof benchData.data?.avg_latency_ms === 'number',
    '2a. Database benchmark calculates multi-query latency distribution'
  );

  // 2b. GET /v1/infrastructure/history -> historical snapshots from PostgreSQL
  const historyRes = await fetch(`${API_BASE}/v1/infrastructure/history?limit=10`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const historyData: any = await historyRes.json();
  assert(
    historyRes.status === 200 &&
    Array.isArray(historyData.data) &&
    historyData.data.length > 0,
    '2b. Historical telemetry snapshots retrieved from system_health_snapshots table'
  );

  // 2c. GET /v1/infrastructure/database-stats -> 100 tables & zero regression confirmation
  const dbStatsRes = await fetch(`${API_BASE}/v1/infrastructure/database-stats`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const dbStatsData: any = await dbStatsRes.json();
  assert(
    dbStatsRes.status === 200 &&
    dbStatsData.data?.total_tables === 100 &&
    dbStatsData.data?.legacy_tables_count === 74 &&
    dbStatsData.data?.database_integrity_status.includes('ZERO REGRESSION'),
    '2c. Infrastructure health confirms 100 public tables and zero database regression'
  );

  // ── Step 3: AI Resume & ATS Fit Scoring ──
  console.log('\n--- Step 3: AI Resume & ATS Fit Scoring ---');

  // 3a. Unauthorized Sales persona rejected from AI endpoints -> 403
  const forbiddenAi = await fetch(`${API_BASE}/v1/ai/score-resume`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${salesToken}` },
    body: JSON.stringify({
      candidate_name: 'Rahul Verma',
      position: 'Senior Fullstack Engineer',
      skills: ['TypeScript', 'React', 'Node.js'],
    }),
  });
  assert(forbiddenAi.status === 403, '3a. Unauthorized role rejected from AI ATS endpoint with 403');

  // 3b. Authorized HR Persona evaluates candidate resume
  const resumeScoreRes = await fetch(`${API_BASE}/v1/ai/score-resume`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${hrToken}` },
    body: JSON.stringify({
      candidate_name: 'Arunav Sharma',
      position: 'Senior Backend Engineer',
      skills: ['TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'Redis'],
      experience_years: 6,
      job_requirements: ['TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'Kubernetes'],
    }),
  });
  const resumeScoreData: any = await resumeScoreRes.json();
  assert(
    resumeScoreRes.status === 200 &&
    resumeScoreData.data?.result?.score >= 80 &&
    resumeScoreData.data?.result?.recommendation === 'STRONG_FIT' &&
    Array.isArray(resumeScoreData.data?.result?.suggested_interview_questions),
    '3b. AI Resume Scorer generates score (80+), recommendation, and tailored interview questions'
  );

  // 3c. Verification in PostgreSQL ai_automation_tasks
  const scoredTask = await prisma.ai_automation_tasks.findFirst({
    where: { task_code: resumeScoreData.data?.task_code },
  });
  assert(
    !!scoredTask &&
    scoredTask.task_type === 'RESUME_SCORE' &&
    scoredTask.status === 'COMPLETED' &&
    scoredTask.tokens_used > 0,
    '3c. AI Resume task persisted in ai_automation_tasks table with token metrics'
  );

  // ── Step 4: AI IT Architecture & Milestone Scoping ──
  console.log('\n--- Step 4: AI IT Architecture & Milestone Scoping ---');

  // 4a. Super Admin / IT Lead generates IT Scope
  const scopeRes = await fetch(`${API_BASE}/v1/ai/generate-scope`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      project_title: 'Enterprise Fintech Gateway & Multi-Tenant Ledger',
      project_type: 'High-Throughput SaaS',
      client_requirements: 'Automated reconciliation for 50,000 daily transactions with AES-256 vault and bank webhooks',
      tech_stack_preference: ['Next.js 14', 'Node.js', 'PostgreSQL', 'Kafka', 'Redis'],
      budget_range: '₹15,00,000 - ₹25,00,000',
      target_timeline_weeks: 10,
    }),
  });
  const scopeData: any = await scopeRes.json();
  assert(
    scopeRes.status === 200 &&
    Array.isArray(scopeData.data?.result?.suggested_milestones) &&
    scopeData.data?.result?.suggested_milestones.length === 4 &&
    Array.isArray(scopeData.data?.result?.risk_mitigations),
    '4a. AI IT Scope Generator produces 4-phase delivery plan and risk mitigations'
  );

  // 4b. Scope task persisted in PostgreSQL
  const scopeTask = await prisma.ai_automation_tasks.findFirst({
    where: { task_code: scopeData.data?.task_code },
  });
  assert(
    !!scopeTask &&
    scopeTask.task_type === 'IT_SCOPE_GEN' &&
    scopeTask.status === 'COMPLETED',
    '4b. IT Scope task persisted in PostgreSQL ai_automation_tasks'
  );

  // ── Step 5: AI Marketing Copy & Content Multi-Variation Generator ──
  console.log('\n--- Step 5: AI Marketing Copy & Content Multi-Variation Generator ---');

  // 5a. Marketing Lead / Admin generates marketing copy
  const copyRes = await fetch(`${API_BASE}/v1/ai/generate-copy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      topic: 'GST Quarterly Reconciliation Automation',
      platform: 'LinkedIn',
      objective: 'LEAD_GENERATION',
      tone: 'Authoritative C-Suite',
      target_audience: 'CFOs & Finance Directors',
    }),
  });
  const copyData: any = await copyRes.json();
  assert(
    copyRes.status === 200 &&
    Array.isArray(copyData.data?.result?.variations) &&
    copyData.data?.result?.variations.length === 3 &&
    !!copyData.data?.result?.best_time_to_post,
    '5a. AI Marketing Assistant generates 3 style variations (Executive, Urgent, Storytelling) + optimal posting time'
  );

  // 5b. Copy task persisted in PostgreSQL
  const copyTask = await prisma.ai_automation_tasks.findFirst({
    where: { task_code: copyData.data?.task_code },
  });
  assert(
    !!copyTask &&
    copyTask.task_type === 'MARKETING_COPY_GEN' &&
    copyTask.status === 'COMPLETED',
    '5b. Marketing Copy task persisted in PostgreSQL ai_automation_tasks'
  );

  // 5c. GET /v1/ai/tasks returns historical audit log
  const tasksRes = await fetch(`${API_BASE}/v1/ai/tasks?limit=10`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const tasksData: any = await tasksRes.json();
  assert(
    tasksRes.status === 200 &&
    Array.isArray(tasksData.data) &&
    tasksData.data.length >= 3,
    '5c. GET /v1/ai/tasks returns chronological audit history of all AI tasks'
  );

  // ── Step 6: Verifying Legacy Database Integrity & Row Safety ──
  console.log('\n--- Step 6: Verifying Legacy Database Integrity & Row Safety ---');
  
  const [leadsCount, staffCount, customersCount, ordersCount, quotationsCount] = await Promise.all([
    prisma.leads.count(),
    prisma.staff_users.count(),
    prisma.customers.count(),
    prisma.orders.count(),
    prisma.quotations.count(),
  ]);

  assert(leadsCount >= 15691, `6a. Leads intact: ${leadsCount} (>= 15,691)`);
  assert(staffCount >= 18, `6b. Staff users intact: ${staffCount} (>= 18)`);
  assert(customersCount >= 1374, `6c. Customers intact: ${customersCount} (>= 1,374)`);
  assert(ordersCount >= 2204, `6d. Orders intact: ${ordersCount} (>= 2,204)`);
  assert(quotationsCount >= 1875, `6e. Quotations intact: ${quotationsCount} (>= 1,875)`);

  console.log('\n=================================================================');
  console.log(`PHASE 5 VERIFICATION SUMMARY: ${stats.passed}/${stats.total} PASSED (${stats.failed} FAILED)`);
  console.log('=================================================================\n');

  if (stats.failed > 0) {
    process.exit(1);
  }
}

main()
  .catch(err => {
    console.error('Fatal test error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
