import React, { useState, useEffect } from 'react';
import {
  Code,
  Terminal,
  Cpu,
  Server,
  Video,
  FileText,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  Search,
  Sparkles,
  GitBranch,
  Shield,
  Activity,
  Send,
  X,
  Phone,
  Mail,
  DollarSign,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

interface TechLead {
  id: string;
  clientName: string;
  companyName?: string;
  email: string;
  phone: string;
  projectType: string;
  budgetEstimate: string;
  timeline: string;
  requirements: string;
  status: 'new' | 'discovery_booked' | 'proposal_sent' | 'won' | 'lost';
  assignedEngineer: string;
  createdAt: string;
}

interface ClientMeeting {
  id: string;
  leadId?: string;
  clientName: string;
  meetingTitle: string;
  dateTime: string;
  durationMinutes: number;
  meetUrl: string;
  platform: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'rescheduled';
  attendees: string[];
  clientNotes?: string;
}

interface TechQuotation {
  id: string;
  quoteNumber: string;
  clientName: string;
  companyName?: string;
  clientEmail: string;
  projectTitle: string;
  techStack: string[];
  currency: 'INR' | 'USD';
  milestones: {
    title: string;
    description: string;
    percentage: number;
    amount: number;
    estimatedWeeks: number;
  }[];
  totalAmount: number;
  validUntil: string;
  status: 'draft' | 'sent' | 'client_reviewed' | 'accepted' | 'rejected';
}

interface TechProject {
  id: string;
  title: string;
  clientName: string;
  leadEngineer: string;
  stage: string;
  progressPercent: number;
  techStack: string[];
  repoUrl?: string;
  stagingUrl?: string;
  deadline: string;
  status: 'on_track' | 'needs_review' | 'blocked' | 'delivered';
}

interface TelemetryData {
  server: {
    status: string;
    uptime: string;
    cpuCount: number;
    nodeVersion: string;
    memory: { rssMb: number; heapUsedMb: number; heapTotalMb: number };
  };
  services: {
    database: { status: string; engine: string; poolActive: number; latencyMs: number };
    redis: { status: string; latencyMs: number };
    websockets: { status: string; connectedClients: number; activeRooms: number };
  };
  endpointsTraffic: { path: string; requestsToday: number; avgLatency: string; successRate: string }[];
}

export default function ItCommandDashboard() {
  const [activeTab, setActiveTab] = useState<'leads' | 'meetings' | 'quotes' | 'telemetry'>('leads');
  const [leads, setLeads] = useState<TechLead[]>([]);
  const [meetings, setMeetings] = useState<ClientMeeting[]>([]);
  const [quotations, setQuotations] = useState<TechQuotation[]>([]);
  const [projects, setProjects] = useState<TechProject[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Modals
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  // Form states for meeting
  const [meetClientName, setMeetClientName] = useState('');
  const [meetTitle, setMeetTitle] = useState('');
  const [meetDateTime, setMeetDateTime] = useState('');
  const [meetNotes, setMeetNotes] = useState('');

  // Form states for quote
  const [quoteClient, setQuoteClient] = useState('');
  const [quoteEmail, setQuoteEmail] = useState('');
  const [quoteProject, setQuoteProject] = useState('');
  const [quoteBudget, setQuoteBudget] = useState(450000);
  const [quoteStack, setQuoteStack] = useState('React, TypeScript, Node.js, PostgreSQL');

  const staffToken = useAuthStore((s) => s.staffToken);
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${staffToken || 'demo-staff-token'}`,
  });

  const fetchAll = async () => {
    try {
      setLoading(true);
      const headers = getHeaders();
      const [leadsRes, meetingsRes, quotesRes, projRes, teleRes] = await Promise.all([
        fetch(`${API_BASE}/v1/it/leads`, { headers }),
        fetch(`${API_BASE}/v1/it/meetings`, { headers }),
        fetch(`${API_BASE}/v1/it/quotations`, { headers }),
        fetch(`${API_BASE}/v1/it/projects`, { headers }),
        fetch(`${API_BASE}/v1/it/telemetry`, { headers }),
      ]);

      const [leadsJson, meetingsJson, quotesJson, projJson, teleJson] = await Promise.all([
        leadsRes.json(),
        meetingsRes.json(),
        quotesRes.json(),
        projRes.json(),
        teleRes.json(),
      ]);

      if (leadsJson.success) setLeads(leadsJson.data.leads);
      if (meetingsJson.success) setMeetings(meetingsJson.data.meetings);
      if (quotesJson.success) setQuotations(quotesJson.data.quotations);
      if (projJson.success) setProjects(projJson.data.projects);
      if (teleJson.success) setTelemetry(teleJson.data);
    } catch (err) {
      console.error('Failed to load IT dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleCopyMeet = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetClientName || !meetTitle) return;

    try {
      const res = await fetch(`${API_BASE}/v1/it/meetings`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          clientName: meetClientName,
          meetingTitle: meetTitle,
          dateTime: meetDateTime || 'Tomorrow, 4:00 PM',
          clientNotes: meetNotes,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setMeetings([json.data, ...meetings]);
        setIsMeetingModalOpen(false);
        setMeetClientName('');
        setMeetTitle('');
        setMeetNotes('');
      }
    } catch (err) {
      console.error('Failed to schedule meeting:', err);
    }
  };

  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteClient || !quoteProject) return;

    try {
      const res = await fetch(`${API_BASE}/v1/it/quotations`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          clientName: quoteClient,
          clientEmail: quoteEmail || 'client@business.com',
          projectTitle: quoteProject,
          techStack: quoteStack.split(',').map((s) => s.trim()),
          totalAmount: quoteBudget,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setQuotations([json.data, ...quotations]);
        setIsQuoteModalOpen(false);
        setQuoteClient('');
        setQuoteEmail('');
        setQuoteProject('');
      }
    } catch (err) {
      console.error('Failed to create quotation:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner with Engineering Theme */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-brand-navy to-slate-900 p-6 rounded-2xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold">
                IT & Solutions Command Center
              </h1>
              <p className="text-xs text-blue-200/70 mt-0.5">
                Internal Tech Team Workspace • Client Discovery Calls • Technical Proposals & Quotations • Telemetry
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/10 text-xs font-bold">
          <button
            onClick={() => setActiveTab('leads')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'leads' ? 'bg-[#0084D1] text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Inbound Leads ({leads.length})
          </button>
          <button
            onClick={() => setActiveTab('meetings')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'meetings' ? 'bg-[#0084D1] text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            Discovery Calls ({meetings.length})
          </button>
          <button
            onClick={() => setActiveTab('quotes')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'quotes' ? 'bg-[#0084D1] text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Quotations ({quotations.length})
          </button>
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'telemetry' ? 'bg-[#0084D1] text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            System Health
          </button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase">Tech Pipeline</p>
          <p className="font-display font-bold text-2xl text-brand-navy mt-1">₹19.5 Lakh</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">3 Discovery Calls Active</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase">Quotations Sent</p>
          <p className="font-display font-bold text-2xl text-purple-700 mt-1">₹5.0 Lakh</p>
          <p className="text-[11px] text-slate-400 mt-1">FinPulse Logistics Fleet System</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase">Active Projects</p>
          <p className="font-display font-bold text-2xl text-[#0084D1] mt-1">{projects.length} In Progress</p>
          <p className="text-[11px] text-slate-400 mt-1">Apex Commodities + ETaxwala 2.0</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase">API Health & Uptime</p>
          <p className="font-display font-bold text-2xl text-emerald-600 mt-1">99.9% Uptime</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">PostgreSQL & WebSockets Live</p>
        </div>
      </div>

      {/* ─── TAB 1: INBOUND TECH LEADS ───────────────────────────────── */}
      {activeTab === 'leads' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-lg text-slate-800">
                Inbound Software & Tech Inquiries
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Prospective clients appointing ETaxwala IT team for custom CRM, SaaS, or Mobile Apps
              </p>
            </div>
            <button
              onClick={() => setIsMeetingModalOpen(true)}
              className="px-4 py-2 bg-brand-navy text-white text-xs font-bold rounded-xl hover:bg-brand-navy/90 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Schedule Discovery Call
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-[#0084D1] rounded-full">
                      {lead.projectType}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      lead.status === 'won' ? 'bg-emerald-50 text-emerald-700' :
                      lead.status === 'discovery_booked' ? 'bg-purple-50 text-purple-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {lead.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900">{lead.clientName}</h3>
                  {lead.companyName && (
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">{lead.companyName}</p>
                  )}

                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
                    <p className="font-medium line-clamp-2">{lead.requirements}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 text-[11px]">
                    <div>
                      <p className="text-slate-400">Budget Range</p>
                      <p className="font-bold text-emerald-600">{lead.budgetEstimate}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Timeline</p>
                      <p className="font-bold text-slate-700">{lead.timeline}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${lead.phone}`}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                      title={lead.phone}
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={`mailto:${lead.email}`}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                      title={lead.email}
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <button
                    onClick={() => {
                      setMeetClientName(lead.clientName);
                      setMeetTitle(`Discovery Call: ${lead.projectType}`);
                      setMeetNotes(lead.requirements);
                      setIsMeetingModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-[#0084D1] text-white text-xs font-bold rounded-lg hover:bg-[#0070b3] transition-colors flex items-center gap-1"
                  >
                    <Video className="w-3 h-3" /> Book Meet
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 2: DISCOVERY MEETINGS ───────────────────────────────── */}
      {activeTab === 'meetings' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-lg text-slate-800">
                Client Tech Discovery & Scope Consultations
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Google Meet & Zoom video discovery sessions with prospective clients
              </p>
            </div>
            <button
              onClick={() => setIsMeetingModalOpen(true)}
              className="px-4 py-2 bg-[#0084D1] text-white text-xs font-bold rounded-xl hover:bg-[#0070b3] transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> New Meeting Link
            </button>
          </div>

          <div className="space-y-4">
            {meetings.map((meet) => (
              <div
                key={meet.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="badge badge-navy text-[10px]">{meet.platform}</span>
                    <span className="badge badge-green text-[10px]">{meet.dateTime}</span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900">{meet.meetingTitle}</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Client: <span className="font-bold text-slate-800">{meet.clientName}</span> • Duration: {meet.durationMinutes} mins
                  </p>
                  {meet.clientNotes && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 max-w-2xl">
                      <span className="font-bold text-slate-700">Agenda / Scope Notes:</span> {meet.clientNotes}
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 self-start md:self-auto">
                  <button
                    onClick={() => handleCopyMeet(meet.meetUrl)}
                    className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    {copiedUrl === meet.meetUrl ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied Link
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" /> Copy Meet Link
                      </>
                    )}
                  </button>

                  <a
                    href={meet.meetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Video className="w-4 h-4" /> Join Video Call
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 3: QUOTATIONS STUDIO ────────────────────────────────── */}
      {activeTab === 'quotes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-lg text-slate-800">
                Technical Quotations & Proposals Studio
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Milestone-based pricing, scope breakdown, and proposals generated for client sign-off
              </p>
            </div>
            <button
              onClick={() => setIsQuoteModalOpen(true)}
              className="px-4 py-2 bg-[#0084D1] text-white text-xs font-bold rounded-xl hover:bg-[#0070b3] transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Create Quotation
            </button>
          </div>

          <div className="space-y-6">
            {quotations.map((quote) => (
              <div key={quote.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400">{quote.quoteNumber}</span>
                      <span className="badge badge-gold text-[10px]">{quote.status.toUpperCase()}</span>
                    </div>
                    <h3 className="font-display font-bold text-lg text-slate-900 mt-1">{quote.projectTitle}</h3>
                    <p className="text-xs text-slate-500">Prepared for: <span className="font-bold text-slate-800">{quote.clientName} ({quote.companyName || quote.clientEmail})</span></p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-xs text-slate-400">Total Project Value</p>
                    <p className="font-display font-extrabold text-2xl text-brand-navy mt-0.5">
                      ₹{quote.totalAmount.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Tech Stack Chips */}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase mb-2">Architectural Tech Stack</p>
                  <div className="flex flex-wrap gap-1.5">
                    {quote.techStack.map((tech, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Milestone Breakdown Table */}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase mb-2">Scope Milestones & Payments</p>
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase">
                        <tr>
                          <th className="py-2.5 px-4">Milestone Phase</th>
                          <th className="py-2.5 px-4">Deliverables</th>
                          <th className="py-2.5 px-4">Split</th>
                          <th className="py-2.5 px-4 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {quote.milestones.map((m, idx) => (
                          <tr key={idx}>
                            <td className="py-2.5 px-4 font-bold text-slate-800">{m.title}</td>
                            <td className="py-2.5 px-4 text-slate-600">{m.description}</td>
                            <td className="py-2.5 px-4 font-semibold text-slate-500">{m.percentage}% ({m.estimatedWeeks} wks)</td>
                            <td className="py-2.5 px-4 font-bold text-brand-navy text-right">
                              ₹{m.amount.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 4: SYSTEM HEALTH & DEV TELEMETRY ─────────────────────── */}
      {activeTab === 'telemetry' && telemetry && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Server Runtime</span>
                <Server className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="font-display font-bold text-xl text-slate-800 mt-2">{telemetry.server.uptime}</p>
              <p className="text-[11px] text-slate-400 mt-1">Node {telemetry.server.nodeVersion} • {telemetry.server.cpuCount} Cores</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">PostgreSQL Database</span>
                <Cpu className="w-4 h-4 text-[#0084D1]" />
              </div>
              <p className="font-display font-bold text-xl text-emerald-600 mt-2">Connected ({telemetry.services.database.latencyMs}ms)</p>
              <p className="text-[11px] text-slate-400 mt-1">{telemetry.services.database.engine} • Pool active</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Memory Footprint</span>
                <Terminal className="w-4 h-4 text-purple-600" />
              </div>
              <p className="font-display font-bold text-xl text-slate-800 mt-2">{telemetry.server.memory.rssMb} MB RSS</p>
              <p className="text-[11px] text-slate-400 mt-1">Heap: {telemetry.server.memory.heapUsedMb} MB / {telemetry.server.memory.heapTotalMb} MB</p>
            </div>
          </div>

          {/* Active Projects Tracker */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-display font-bold text-base text-slate-800 mb-4">
              Active Software Projects in Development
            </h3>
            <div className="space-y-4">
              {projects.map((proj) => (
                <div key={proj.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                        {proj.stage}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 mt-1">{proj.title}</h4>
                      <p className="text-xs text-slate-400">Client: {proj.clientName} • Lead: {proj.leadEngineer}</p>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      {proj.repoUrl && (
                        <a
                          href={proj.repoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1"
                        >
                          <GitBranch className="w-3.5 h-3.5 text-slate-500" /> Repo
                        </a>
                      )}
                      {proj.stagingUrl && (
                        <a
                          href={proj.stagingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-[#0084D1] text-white font-bold hover:bg-[#0070b3] flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Staging
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1">
                      <span>Delivery Progress</span>
                      <span>{proj.progressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#0084D1] h-2 rounded-full transition-all duration-500"
                        style={{ width: `${proj.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: SCHEDULE DISCOVERY MEETING ───────────────────────── */}
      {isMeetingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-display font-bold text-lg text-slate-800 flex items-center gap-2">
                <Video className="w-5 h-5 text-[#0084D1]" /> Schedule Client Discovery Call
              </h3>
              <button onClick={() => setIsMeetingModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Client / Company Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Rajesh Khanna (Zenith Retail)"
                  value={meetClientName}
                  onChange={(e) => setMeetClientName(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Meeting Title / Topic *</label>
                <input
                  type="text"
                  placeholder="e.g., SaaS Discovery: Architecture & Pricing Call"
                  value={meetTitle}
                  onChange={(e) => setMeetTitle(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Date & Time</label>
                <input
                  type="text"
                  placeholder="e.g., Tomorrow, 3:30 PM"
                  value={meetDateTime}
                  onChange={(e) => setMeetDateTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Scope & Requirement Notes</label>
                <textarea
                  rows={3}
                  placeholder="What tech requirements or questions to address on call..."
                  value={meetNotes}
                  onChange={(e) => setMeetNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#0084D1] text-white font-bold rounded-xl hover:bg-[#0070b3] transition-colors"
              >
                Generate Google Meet & Save
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: CREATE TECHNICAL QUOTATION ───────────────────────── */}
      {isQuoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-display font-bold text-lg text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0084D1]" /> Create Technical Proposal
              </h3>
              <button onClick={() => setIsQuoteModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuote} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Client Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Vikram Malhotra"
                  value={quoteClient}
                  onChange={(e) => setQuoteClient(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Client Email *</label>
                <input
                  type="email"
                  placeholder="vikram@finpulse.in"
                  value={quoteEmail}
                  onChange={(e) => setQuoteEmail(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Project Title *</label>
                <input
                  type="text"
                  placeholder="e.g., Enterprise Logistics CRM & Driver Telemetry Fleet System"
                  value={quoteProject}
                  onChange={(e) => setQuoteProject(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Total Budget (INR) *</label>
                <input
                  type="number"
                  value={quoteBudget}
                  onChange={(e) => setQuoteBudget(Number(e.target.value))}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tech Stack (comma separated)</label>
                <input
                  type="text"
                  value={quoteStack}
                  onChange={(e) => setQuoteStack(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#0084D1] text-white font-bold rounded-xl hover:bg-[#0070b3] transition-colors"
              >
                Generate Milestone Quotation
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
