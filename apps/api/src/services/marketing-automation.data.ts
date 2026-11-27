/**
 * Synthetic marketing-automation catalogue.
 * Counts here are the same small demo set the seed script inserts.
 * Nothing in this module calls an external network.
 */

export type FunnelStage = 'generation' | 'nurturing' | 'retention';

export interface ChannelDef {
  id: string;
  name: string;
  category: 'organic' | 'paid';
  stages: FunnelStage[];
  phase: string;
  aiHandles: string;
  humanHandles: string;
  stack: string;
}

export const CHANNELS: ChannelDef[] = [
  {
    id: 'social',
    name: 'Social Media (FB, IG, GMB, YouTube)',
    category: 'organic',
    stages: ['generation', 'nurturing'],
    phase: 'Phase 1',
    aiHandles: 'Monthly calendar, captions, Shorts scripts, GMB updates, comment drafts.',
    humanHandles: 'Weekly batch approval and sensitive comment escalations.',
    stack: 'Meta Graph, Google Business Profile, YouTube Data API (dry-run).',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Marketing',
    category: 'organic',
    stages: ['generation', 'nurturing', 'retention'],
    phase: 'Phase 1',
    aiHandles: 'Qualification bot, drip follow-ups, webinar reminders, renewal nudges.',
    humanHandles: 'Approve Meta templates once; step in on hot leads or complaints.',
    stack: 'WhatsApp Cloud API template send (dry-run).',
  },
  {
    id: 'email',
    name: 'Email Marketing',
    category: 'organic',
    stages: ['nurturing', 'retention'],
    phase: 'Phase 1',
    aiHandles: 'Segments, newsletters, behaviour drips, subject A/B drafts.',
    humanHandles: 'Approve the angle and the weekly deliverability note.',
    stack: 'SMTP dry-run. No message leaves the server.',
  },
  {
    id: 'sms',
    name: 'SMS Marketing',
    category: 'organic',
    stages: ['nurturing', 'retention'],
    phase: 'Phase 2',
    aiHandles: 'Short reminders for webinars, renewals, and missed calls.',
    humanHandles: 'Register DLT entity and templates; approve promo blasts.',
    stack: 'DLT template id stored per tenant. Send is dry-run.',
  },
  {
    id: 'seo',
    name: 'Blogging & SEO',
    category: 'organic',
    stages: ['generation', 'nurturing'],
    phase: 'Phase 2',
    aiHandles: 'Keyword drafts, schema, internal links, social and email snippets.',
    humanHandles: 'Pick the topic and fact-check before publish.',
    stack: 'Headless draft store. No CMS publish call.',
  },
  {
    id: 'webinar',
    name: 'Webinar Management',
    category: 'organic',
    stages: ['generation', 'nurturing'],
    phase: 'Phase 2',
    aiHandles: 'Registration page copy, reminders, attendee vs no-show follow-up.',
    humanHandles: 'Present live or upload one evergreen recording.',
    stack: 'Local registration list. No Zoom or Meet API call.',
  },
  {
    id: 'courses',
    name: 'Training & Courses',
    category: 'organic',
    stages: ['nurturing', 'retention'],
    phase: 'Phase 3',
    aiHandles: 'Module drip plan, learner Q&A drafts, certificate checklist.',
    humanHandles: 'Record the core lesson once; review flagged questions.',
    stack: 'Lesson rows in this CRM. No video host call.',
  },
  {
    id: 'website',
    name: 'Website Management',
    category: 'organic',
    stages: ['generation', 'nurturing'],
    phase: 'Phase 2',
    aiHandles: 'Landing-page drafts, form copy, uptime notes.',
    humanHandles: 'Approve pricing or offer changes.',
    stack: 'Draft pages only. No DNS or deploy call.',
  },
  {
    id: 'paid',
    name: 'Paid Campaign Setup',
    category: 'paid',
    stages: ['generation', 'nurturing'],
    phase: 'Phase 3',
    aiHandles: 'Ad copy, audience notes, pause recommendations. Never spends.',
    humanHandles: 'Hard spend cap and a manual launch lock.',
    stack: 'Dry-run only. Meta and Google Ads are not called.',
  },
];

export interface ApprovalDraft {
  id: number;
  channel: string;
  kind: 'post' | 'email' | 'whatsapp' | 'sms' | 'blog' | 'ad' | 'escalation';
  title: string;
  body: string;
  status: 'pending' | 'approved' | 'edited' | 'regenerated';
  confidence: number;
  stage: FunnelStage;
}

export const DEMO_APPROVALS: ApprovalDraft[] = [
  {
    id: 1,
    channel: 'social',
    kind: 'post',
    title: 'GST calendar — Instagram carousel',
    body: 'Three slides: due dates, a common penalty, and a one-line offer to file with us. Soft navy cards, no stock-photo collage.',
    status: 'pending',
    confidence: 0.86,
    stage: 'generation',
  },
  {
    id: 2,
    channel: 'email',
    kind: 'email',
    title: 'Welcome drip — day 0',
    body: 'Subject: Your registration checklist. Body confirms what we received and asks two qualifying questions. Unsubscribe link is required.',
    status: 'pending',
    confidence: 0.91,
    stage: 'nurturing',
  },
  {
    id: 3,
    channel: 'whatsapp',
    kind: 'whatsapp',
    title: 'Webinar reminder — 15 minutes',
    body: 'Template slot: webinar_reminder_15. Variables: first name, topic, join link. Outside the 24-hour window this must be a Meta-approved template.',
    status: 'pending',
    confidence: 0.8,
    stage: 'nurturing',
  },
  {
    id: 4,
    channel: 'paid',
    kind: 'ad',
    title: 'Pause recommendation — search ad set B',
    body: 'Synthetic CPL moved from 180 to 420 over 3 days. Recommend pause. Launch and spend stay locked until you approve.',
    status: 'pending',
    confidence: 0.77,
    stage: 'generation',
  },
  {
    id: 5,
    channel: 'whatsapp',
    kind: 'escalation',
    title: 'Hot lead asked for a custom discount',
    body: 'Meera Iyer (synthetic) asked for 20% off a private-limited package. Confidence is below the auto-send bar because it mentions a discount.',
    status: 'pending',
    confidence: 0.42,
    stage: 'nurturing',
  },
];

export interface WorkflowRule {
  id: number;
  name: string;
  trigger: string;
  stage: FunnelStage;
  channels: string;
  quietHours: boolean;
  enabled: boolean;
  description: string;
}

export const DEMO_WORKFLOWS: WorkflowRule[] = [
  {
    id: 1,
    name: 'Welcome within 30 seconds',
    trigger: 'lead.created',
    stage: 'nurturing',
    channels: 'whatsapp,email',
    quietHours: true,
    enabled: true,
    description: 'Personal welcome plus two qualifying questions. Held during IST quiet hours.',
  },
  {
    id: 2,
    name: 'Cold lead to webinar',
    trigger: 'lead.score_cold',
    stage: 'nurturing',
    channels: 'email,whatsapp',
    quietHours: true,
    enabled: true,
    description: 'Invite cold leads to the next webinar instead of a sales call.',
  },
  {
    id: 3,
    name: 'Renewal in 15 days',
    trigger: 'renewal.due_in_15d',
    stage: 'retention',
    channels: 'whatsapp,email,sms',
    quietHours: true,
    enabled: true,
    description: 'Compliance deadline reminder. SMS only if a DLT template id is on file.',
  },
  {
    id: 4,
    name: 'Review request after delivery',
    trigger: 'task.completed',
    stage: 'retention',
    channels: 'whatsapp,email',
    quietHours: true,
    enabled: false,
    description: 'Ask for a Google review seven days after the case is marked complete.',
  },
];

export interface PaidCampaignDraft {
  id: number;
  name: string;
  platform: string;
  dailyCap: number;
  proposedDaily: number;
  status: 'draft' | 'approved' | 'rejected';
  launched: boolean;
}

export const DEMO_CAMPAIGNS: PaidCampaignDraft[] = [
  {
    id: 1,
    name: 'Private limited — search',
    platform: 'Google Ads (draft)',
    dailyCap: 2000,
    proposedDaily: 800,
    status: 'draft',
    launched: false,
  },
  {
    id: 2,
    name: 'GST filing — lead form',
    platform: 'Meta Lead Ads (draft)',
    dailyCap: 2000,
    proposedDaily: 2500,
    status: 'draft',
    launched: false,
  },
];

export interface GuardrailState {
  executionMode: 'dry_run';
  dailySpendCap: number;
  monthlySpendCap: number;
  launchRequiresApproval: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  timezone: string;
  promoCooldownHours: number;
  minAutoSendConfidence: number;
  dltRequiredForSms: boolean;
  whatsappTemplateRequired: boolean;
  emailUnsubscribeRequired: boolean;
}

export const DEMO_GUARDRAILS: GuardrailState = {
  executionMode: 'dry_run',
  dailySpendCap: 2000,
  monthlySpendCap: 40000,
  launchRequiresApproval: true,
  quietHoursStart: '21:00',
  quietHoursEnd: '09:00',
  timezone: 'Asia/Kolkata',
  promoCooldownHours: 72,
  minAutoSendConfidence: 0.75,
  dltRequiredForSms: true,
  whatsappTemplateRequired: true,
  emailUnsubscribeRequired: true,
};

export interface FunnelBucket {
  stage: FunnelStage;
  label: string;
  contacts: number;
  detail: string;
}

export const DEMO_FUNNEL: FunnelBucket[] = [
  {
    stage: 'generation',
    label: 'Lead generation',
    contacts: 8,
    detail: 'Organic forms, webinar registrations, and one paused paid draft.',
  },
  {
    stage: 'nurturing',
    label: 'Conversion and nurturing',
    contacts: 5,
    detail: 'Welcome drip and webinar invite. One discount question is waiting in the inbox.',
  },
  {
    stage: 'retention',
    label: 'Client retention',
    contacts: 3,
    detail: 'Paying clients with a renewal reminder rule ready, not yet enabled.',
  },
];

export interface BrandBrain {
  businessName: string;
  offers: string;
  icp: string;
  tone: string;
  faqs: string;
  disclaimers: string;
  proofPoints: string;
}

export const DEMO_BRAND_BRAIN: BrandBrain = {
  businessName: 'Northstar Advisory',
  offers: 'Private limited registration, GST filing, and a quarterly compliance retainer.',
  icp: 'First-time founders in Maharashtra who want a single advisor for incorporation and GST.',
  tone: 'Calm, specific, short sentences. No hype and no guaranteed-approval claims.',
  faqs: 'Timeline is usually 10 to 15 working days after documents are complete. Government fees are extra.',
  disclaimers: 'We are a private advisory desk. Government approval is not guaranteed.',
  proofPoints: 'Synthetic demo only. Do not publish these lines as real client results.',
};

const REWRITES = [
  (body: string) =>
    `${body}\n\nShorter cut: keep one fact, one next step, and the quiet-hours footer.`,
  (body: string) =>
    `${body}\n\nWarmer cut: open with the person's first name and drop the second adjective.`,
  (body: string) =>
    `${body}\n\nStricter cut: remove any fee promise and point to the disclaimer in Brand Brain.`,
];

export function regenerateCopy(body: string, salt: number): string {
  const fn = REWRITES[Math.abs(salt) % REWRITES.length];
  return fn(body);
}

export function spendBlocked(proposed: number, cap: number): string | null {
  if (!Number.isFinite(proposed) || proposed < 0)
    return 'Proposed spend must be a positive number.';
  if (proposed > cap) return `Proposed daily spend ${proposed} is above the hard cap ${cap}.`;
  return null;
}
