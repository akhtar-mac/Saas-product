import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Target,
  Share2,
  DollarSign,
  Search,
  Zap,
  Calendar,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Plus,
  CheckCircle2,
  Layers,
  MessageCircle,
  X,
  RefreshCw,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';

import { useAuthStore } from '@/store/auth-store';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

interface SocialPost {
  id: string;
  dbId?: number;
  platform: 'Instagram' | 'Facebook' | 'LinkedIn' | 'YouTube' | 'WhatsApp';
  title: string;
  caption: string;
  hashtags: string[];
  scheduledDate: string;
  status: 'draft' | 'in_design' | 'scheduled' | 'published';
  author: string;
  creativeUrl?: string;
  metrics?: {
    likes?: number;
    shares?: number;
    reach?: number;
    leads?: number;
  };
}

interface AdCampaign {
  id: string;
  dbId?: number;
  name: string;
  platform: 'Google Ads' | 'Meta Ads (FB/IG)' | 'Direct WhatsApp' | 'YouTube Ads';
  dailyBudget: number;
  totalSpent: number;
  leadsGenerated: number;
  cpl: number;
  conversions: number;
  roas: string;
  status: 'active' | 'paused' | 'completed';
}

interface TopKeyword {
  keyword: string;
  rank: number;
  change: string;
  volume: string;
  visits: string;
}

interface MarketingSummary {
  totalLeads: number;
  paidLeads: number;
  organicLeads: number;
  totalAdSpend: number;
  blendedCpl: number;
  blendedRoas: string;
  totalImpressions: number;
  totalClicks: number;
  scheduledPostsCount: number;
  activeCampaignsCount: number;
}

interface AttributionSource {
  source: string;
  leads: number;
  attributedRevenue: string;
}

interface PlatformIntegration {
  id: number;
  provider:
    | 'META_ADS'
    | 'GOOGLE_ADS'
    | 'GOOGLE_SEARCH_CONSOLE'
    | 'INSTAGRAM'
    | 'LINKEDIN'
    | 'WHATSAPP_BUSINESS';
  accountId: string;
  accountName: string;
  status: string;
  lastSyncedAt?: string;
  lastSyncStatus: string;
  tokenMasked: string;
  hasWebhookSecret: boolean;
  createdAt: string;
}

interface SyncJobItem {
  id: number;
  jobCode: string;
  provider?: string;
  accountName?: string;
  jobType: string;
  status: string;
  recordsSynced: number;
  startedAt: string;
  completedAt?: string;
  error?: string;
}

export default function MarketingDashboard() {
  const { staffToken } = useAuthStore();
  const [activeTab, setActiveTab] = useState<
    'social' | 'ads' | 'seo' | 'attribution' | 'integrations'
  >('social');
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [keywords, setKeywords] = useState<TopKeyword[]>([]);
  const [summary, setSummary] = useState<MarketingSummary | null>(null);
  const [attributionSources, setAttributionSources] = useState<AttributionSource[]>([]);
  const [integrations, setIntegrations] = useState<PlatformIntegration[]>([]);
  const [syncJobs, setSyncJobs] = useState<SyncJobItem[]>([]);
  const [syncingId, setSyncingId] = useState<number | null>(null);
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [isNewIntegrationModalOpen, setIsNewIntegrationModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);

  // New post form state
  const [newTitle, setNewTitle] = useState('');
  const [newPlatform, setNewPlatform] = useState<SocialPost['platform']>('Instagram');
  const [newCaption, setNewCaption] = useState('');
  const [newHashtags, setNewHashtags] = useState('');
  const [newDate, setNewDate] = useState('');

  // New integration form state
  const [newProvider, setNewProvider] = useState<PlatformIntegration['provider']>('META_ADS');
  const [newAccountId, setNewAccountId] = useState('');
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccessToken, setNewAccessToken] = useState('');
  const [newRefreshToken, setNewRefreshToken] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers: Record<string, string> = staffToken
        ? { Authorization: `Bearer ${staffToken}` }
        : {};

      const [overviewRes, postsRes, campaignsRes, attributionRes, integrationsRes, syncJobsRes] =
        await Promise.all([
          fetch(`${API_BASE}/v1/marketing/overview`, { headers }),
          fetch(`${API_BASE}/v1/marketing/posts`, { headers }),
          fetch(`${API_BASE}/v1/marketing/campaigns`, { headers }),
          fetch(`${API_BASE}/v1/marketing/attribution`, { headers }),
          fetch(`${API_BASE}/v1/marketing/integrations`, { headers }),
          fetch(`${API_BASE}/v1/marketing/sync-jobs`, { headers }),
        ]);

      const [
        overviewJson,
        postsJson,
        campaignsJson,
        attributionJson,
        integrationsJson,
        syncJobsJson,
      ] = await Promise.all([
        overviewRes.json(),
        postsRes.json(),
        campaignsRes.json(),
        attributionRes.json(),
        integrationsRes.json(),
        syncJobsRes.json(),
      ]);

      if (overviewJson.success && overviewJson.data) {
        if (overviewJson.data.summary) setSummary(overviewJson.data.summary);
        if (overviewJson.data.topKeywords) setKeywords(overviewJson.data.topKeywords);
      }
      if (postsJson.success && postsJson.data?.posts) {
        setPosts(postsJson.data.posts);
      }
      if (campaignsJson.success && campaignsJson.data?.campaigns) {
        setCampaigns(campaignsJson.data.campaigns);
      }
      if (attributionJson.success && attributionJson.data?.topSources) {
        setAttributionSources(attributionJson.data.topSources);
      }
      if (integrationsJson.success && integrationsJson.data?.integrations) {
        setIntegrations(integrationsJson.data.integrations);
      }
      if (syncJobsJson.success && syncJobsJson.data?.jobs) {
        setSyncJobs(syncJobsJson.data.jobs);
      }
    } catch (err) {
      console.error('Failed to load marketing telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [staffToken]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newCaption) return;

    try {
      const res = await fetch(`${API_BASE}/v1/marketing/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(staffToken ? { Authorization: `Bearer ${staffToken}` } : {}),
        },
        body: JSON.stringify({
          title: newTitle,
          platform: newPlatform,
          caption: newCaption,
          hashtags: newHashtags.split(' ').filter(Boolean),
          scheduledDate: newDate || '2026-09-20 18:00',
        }),
      });

      const json = await res.json();
      if (json.success) {
        await fetchData();
        setIsNewPostModalOpen(false);
        setNewTitle('');
        setNewCaption('');
        setNewHashtags('');
        setNewDate('');
      }
    } catch (err) {
      console.error('Failed to create post:', err);
    }
  };

  const handleToggleCampaignStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'PAUSED' : 'ACTIVE';
    try {
      const res = await fetch(`${API_BASE}/v1/marketing/campaigns/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(staffToken ? { Authorization: `Bearer ${staffToken}` } : {}),
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setCampaigns((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: nextStatus.toLowerCase() as any } : c))
        );
      }
    } catch (err) {
      console.error('Failed to toggle campaign status:', err);
    }
  };

  const handleUpdatePostStatus = async (id: string, newStatus: SocialPost['status']) => {
    try {
      const res = await fetch(`${API_BASE}/v1/marketing/posts/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(staffToken ? { Authorization: `Bearer ${staffToken}` } : {}),
        },
        body: JSON.stringify({ status: newStatus.toUpperCase() }),
      });
      const json = await res.json();
      if (json.success) {
        setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p)));
        if (selectedPost && selectedPost.id === id) {
          setSelectedPost({ ...selectedPost, status: newStatus });
        }
      }
    } catch (err) {
      console.error('Failed to update post status:', err);
    }
  };

  const handleTriggerSync = async (id: number) => {
    try {
      setSyncingId(id);
      const res = await fetch(`${API_BASE}/v1/marketing/integrations/${id}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(staffToken ? { Authorization: `Bearer ${staffToken}` } : {}),
        },
      });
      const json = await res.json();
      if (json.success) {
        await fetchData();
      }
    } catch (err) {
      console.error('Failed to trigger sync:', err);
    } finally {
      setSyncingId(null);
    }
  };

  const handleConnectIntegration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountId || !newAccessToken || !newAccountName) return;
    try {
      const res = await fetch(`${API_BASE}/v1/marketing/integrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(staffToken ? { Authorization: `Bearer ${staffToken}` } : {}),
        },
        body: JSON.stringify({
          provider: newProvider,
          accountId: newAccountId,
          accountName: newAccountName,
          accessToken: newAccessToken,
          refreshToken: newRefreshToken || undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchData();
        setIsNewIntegrationModalOpen(false);
        setNewAccountId('');
        setNewAccountName('');
        setNewAccessToken('');
        setNewRefreshToken('');
      }
    } catch (err) {
      console.error('Failed to connect integration:', err);
    }
  };

  const filteredPosts = posts.filter((p) => {
    if (platformFilter === 'all') return true;
    return p.platform.toLowerCase() === platformFilter.toLowerCase();
  });

  const getPlatformIcon = (platform: SocialPost['platform']) => {
    switch (platform) {
      case 'Instagram':
        return <Instagram className="w-4 h-4 text-pink-600" />;
      case 'Facebook':
        return <Facebook className="w-4 h-4 text-blue-600" />;
      case 'LinkedIn':
        return <Linkedin className="w-4 h-4 text-sky-700" />;
      case 'YouTube':
        return <Youtube className="w-4 h-4 text-red-600" />;
      case 'WhatsApp':
        return <MessageCircle className="w-4 h-4 text-emerald-600" />;
      default:
        return <Share2 className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-brand-navy">
              Marketing & Growth Intelligence Hub
            </h1>
            <span className="badge badge-gold">Social, Ads & SEO</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Omni-channel marketing control: Instagram/Facebook post scheduling, Meta & Google Ads
            performance & organic search ranking.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('social')}
            className="px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap btn-multicolor"
          >
            <Share2 className="w-3.5 h-3.5" />
            Social Media ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab('ads')}
            className="px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap btn-multicolor"
          >
            <Target className="w-3.5 h-3.5" />
            Paid Ads ({campaigns.length})
          </button>
          <button
            onClick={() => setActiveTab('seo')}
            className="px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap btn-multicolor"
          >
            <Search className="w-3.5 h-3.5" />
            SEO & Keywords
          </button>
          <button
            onClick={() => setActiveTab('attribution')}
            className="px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap btn-multicolor"
          >
            <Layers className="w-3.5 h-3.5" />
            Attribution & ROI
          </button>
          <Link
            to="/crm/quotations"
            className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-all flex items-center gap-1.5 whitespace-nowrap font-bold"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Quotations
          </Link>
        </div>
      </div>

      {/* Overview Top Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Leads Generated</span>
            <Target className="w-4 h-4 text-[#0084D1]" />
          </div>
          <p className="font-display font-bold text-2xl text-slate-800 mt-2">
            {summary ? summary.totalLeads.toLocaleString('en-IN') : '2,120'}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            Paid ({summary?.paidLeads ?? 1740}) + Organic ({summary?.organicLeads ?? 380})
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Blended CPL</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-display font-bold text-2xl text-slate-800 mt-2">
            ₹{summary?.blendedCpl ?? 106} / lead
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            Optimized across channels
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Total Ad Spend</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <p className="font-display font-bold text-2xl text-slate-800 mt-2">
            ₹{summary ? summary.totalAdSpend.toLocaleString('en-IN') : '1,92,400'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Meta Ads + Google Ads</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Blended ROAS</span>
            <Zap className="w-4 h-4 text-purple-600" />
          </div>
          <p className="font-display font-bold text-2xl text-purple-700 mt-2">
            {summary?.blendedRoas ?? '16.3x'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Live multichannel return</p>
        </div>
      </div>

      {/* ─── TAB 1: SOCIAL MEDIA POSTS ───────────────────────────────── */}
      {activeTab === 'social' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Filter by platform */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 font-semibold text-[11px]">Platform:</span>
              {['all', 'Instagram', 'Facebook', 'LinkedIn'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatformFilter(p)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                    platformFilter === p
                      ? 'bg-brand-navy text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {p === 'all' ? 'All Platforms' : p}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsNewPostModalOpen(true)}
              className="px-4 py-2 btn-multicolor text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" /> Schedule New Post
            </button>
          </div>

          {/* Social Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                        {getPlatformIcon(post.platform)}
                      </div>
                      <span className="text-xs font-bold text-slate-800">{post.platform}</span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        post.status === 'published'
                          ? 'bg-emerald-50 text-emerald-700'
                          : post.status === 'scheduled'
                            ? 'bg-blue-50 text-blue-700'
                            : post.status === 'in_design'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {post.status.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 line-clamp-2 hover:text-[#0084D1] transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                    {post.caption}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {post.hashtags.slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-semibold text-[#0084D1] bg-blue-50/70 px-1.5 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {post.hashtags.length > 3 && (
                      <span className="text-[10px] text-slate-400">
                        +{post.hashtags.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 font-semibold text-slate-600">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {post.scheduledDate}
                  </span>
                  {post.metrics?.likes !== undefined && post.metrics.likes > 0 && (
                    <span className="text-pink-600 font-bold">❤️ {post.metrics.likes}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 2: PAID ADS CAMPAIGNS ───────────────────────────────── */}
      {activeTab === 'ads' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-base text-slate-800">
                  Active Meta & Google Ad Sets
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Live tracking for paid acquisition spend, CPL & ROAS
                </p>
              </div>
              <span className="badge badge-gold">Ad Manager</span>
            </div>

            <div className="overflow-x-auto">
              <table className="table-crm w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                    <th className="py-3 px-4">Campaign Name</th>
                    <th className="py-3 px-4">Platform</th>
                    <th className="py-3 px-4">Daily Budget</th>
                    <th className="py-3 px-4">Total Spent</th>
                    <th className="py-3 px-4">Leads</th>
                    <th className="py-3 px-4">Cost / Lead</th>
                    <th className="py-3 px-4">ROAS</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {campaigns.map((camp) => (
                    <tr key={camp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{camp.name}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                          {camp.platform}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        ₹{camp.dailyBudget.toLocaleString('en-IN')}/day
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        ₹{camp.totalSpent.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#0084D1]">
                        {camp.leadsGenerated}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-600">₹{camp.cpl}</td>
                      <td className="py-3.5 px-4 font-extrabold text-purple-700">{camp.roas}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleToggleCampaignStatus(camp.id, camp.status)}
                          title="Click to toggle active/paused status"
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                            camp.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {camp.status.toUpperCase()}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: SEO & SEARCH RANKINGS ────────────────────────────── */}
      {activeTab === 'seo' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-display font-bold text-base text-slate-800 mb-2">
              Google Search Organic Positions (India)
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Tracked target keywords bringing high-intent tax & business incorporation clients
              without ad spend.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {keywords.map((kw, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                  <p className="text-xs font-bold text-slate-800 capitalize">{kw.keyword}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-2xl font-extrabold text-[#0084D1]">#{kw.rank}</span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {kw.change}
                      </span>
                    </div>
                    <div className="text-right text-[11px] text-slate-400">
                      <p>{kw.visits} clicks</p>
                      <p className="text-[10px]">{kw.volume}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: ATTRIBUTION & MULTI-TOUCH ROI ────────────────────── */}
      {activeTab === 'attribution' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-base text-slate-800">
                  First-Touch & Last-Touch Attribution Matrix
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time UTM parameter tracking mapped to paid ad campaigns and revenue
                </p>
              </div>
              <span className="badge badge-gold">Multi-Touch Attribution</span>
            </div>

            <div className="overflow-x-auto">
              <table className="table-crm w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                    <th className="py-3 px-4">Channel / UTM Source</th>
                    <th className="py-3 px-4">Attributed Leads</th>
                    <th className="py-3 px-4">Attributed Revenue</th>
                    <th className="py-3 px-4 text-right">Conversion Efficiency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {attributionSources.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {item.source}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#0084D1]">{item.leads} leads</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-600">
                        {item.attributedRevenue}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="bg-blue-50 text-[#0084D1] px-2 py-0.5 rounded-full text-[10px] font-bold">
                          High Intent
                        </span>
                      </td>
                    </tr>
                  ))}
                  {attributionSources.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400">
                        No touchpoints logged yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 5: OAUTH INTEGRATIONS & AUTOMATED SYNC ───────────── */}
      {activeTab === 'integrations' && (
        <div className="space-y-6">
          {/* Header & Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-display font-bold text-base text-slate-800">
                  AES-256 Vault: Connected Ad & Analytics Platforms
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Automated background telemetry sync for Meta Ads, Google Ads & Search Console with
                encrypted tokens.
              </p>
            </div>

            <button
              onClick={() => setIsNewIntegrationModalOpen(true)}
              className="px-4 py-2.5 btn-multicolor text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Connect New Provider
            </button>
          </div>

          {/* Connected Providers Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {integrations.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="p-2 rounded-xl bg-slate-50 border border-slate-100 font-mono text-xs font-bold text-brand-navy">
                        {item.provider}
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {item.status.toUpperCase()}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900">{item.accountName}</h4>
                  <p className="text-xs text-slate-400 font-mono mt-1">{item.accountId}</p>

                  <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Vault Token:</span>
                      <span className="font-mono text-slate-700 font-semibold">
                        {item.tokenMasked}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Last Synced:</span>
                      <span className="text-slate-700 font-semibold">
                        {item.lastSyncedAt
                          ? new Date(item.lastSyncedAt).toLocaleTimeString()
                          : 'Never'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> AES-256-GCM
                  </span>
                  <button
                    onClick={() => handleTriggerSync(item.id)}
                    disabled={syncingId === item.id}
                    className="px-3 py-1.5 btn-multicolor rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${syncingId === item.id ? 'animate-spin' : ''}`}
                    />
                    {syncingId === item.id ? 'Syncing...' : 'Sync Now'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Sync History Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-base text-slate-800">
                  Telemetry Synchronization Execution Log
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Chronological audit trail of background worker pulls
                </p>
              </div>
              <span className="badge badge-gold">Live Worker Log</span>
            </div>

            <div className="overflow-x-auto">
              <table className="table-crm w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                    <th className="py-3 px-4">Job Code</th>
                    <th className="py-3 px-4">Provider</th>
                    <th className="py-3 px-4">Job Type</th>
                    <th className="py-3 px-4">Records Synced</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {syncJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {job.jobCode}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {job.provider || 'META_ADS'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{job.jobType}</td>
                      <td className="py-3.5 px-4 font-bold text-[#0084D1]">
                        {job.recordsSynced} records
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {new Date(job.startedAt).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            job.status === 'success'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {job.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {syncJobs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No sync runs recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── SCHEDULE NEW POST MODAL ─────────────────────────────────── */}
      {isNewPostModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-display font-bold text-lg text-slate-800 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-[#0084D1]" /> Schedule Social Post
              </h3>
              <button
                onClick={() => setIsNewPostModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Platform</label>
                <select
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value as SocialPost['platform'])}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                >
                  <option value="Instagram">Instagram (Reel / Carousel)</option>
                  <option value="Facebook">Facebook Page</option>
                  <option value="LinkedIn">LinkedIn Company Page</option>
                  <option value="YouTube">YouTube Shorts / Community</option>
                  <option value="WhatsApp">Direct WhatsApp Broadcast</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Post Title / Hook</label>
                <input
                  type="text"
                  placeholder="e.g., Avoid this ₹10,000 GST late penalty!"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Caption / Copy</label>
                <textarea
                  rows={4}
                  placeholder="Write caption, key pointers and call to action..."
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hashtags</label>
                <input
                  type="text"
                  placeholder="#GSTIndia #TaxTips #ETaxwala"
                  value={newHashtags}
                  onChange={(e) => setNewHashtags(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Scheduled Date & Time</label>
                <input
                  type="text"
                  placeholder="e.g., 2026-09-20 18:00"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <button type="submit" className="w-full py-3 btn-multicolor font-bold">
                Confirm & Schedule Post
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── SELECTED POST PREVIEW MODAL ──────────────────────────────── */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                  {getPlatformIcon(selectedPost.platform)}
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-800">
                    {selectedPost.title}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    {selectedPost.id} • Scheduled: {selectedPost.scheduledDate}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Post Caption
                </span>
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {selectedPost.caption}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Hashtags
                </span>
                <div className="flex flex-wrap gap-1">
                  {selectedPost.hashtags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-semibold text-[#0084D1] bg-blue-50 px-2 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Current Status</span>
                  <span
                    className={`text-xs font-bold uppercase ${
                      selectedPost.status === 'published' ? 'text-emerald-600' : 'text-blue-600'
                    }`}
                  >
                    {selectedPost.status}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {selectedPost.status !== 'published' && (
                    <button
                      onClick={() => handleUpdatePostStatus(selectedPost.id, 'published')}
                      className="px-4 py-2 rounded-xl btn-multicolor text-xs font-bold flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mark Published
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="px-4 py-2 rounded-xl btn-multicolor text-xs font-bold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── CONNECT NEW PROVIDER MODAL ───────────────────────────── */}
      {isNewIntegrationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-display font-bold text-lg text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" /> Connect Marketing Provider
              </h3>
              <button
                onClick={() => setIsNewIntegrationModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConnectIntegration} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Marketing Platform</label>
                <select
                  value={newProvider}
                  onChange={(e) =>
                    setNewProvider(e.target.value as PlatformIntegration['provider'])
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                >
                  <option value="META_ADS">Meta Ads (Facebook & Instagram)</option>
                  <option value="GOOGLE_ADS">Google Ads (Search & Display)</option>
                  <option value="GOOGLE_SEARCH_CONSOLE">Google Search Console</option>
                  <option value="LINKEDIN">LinkedIn Marketing Solutions</option>
                  <option value="WHATSAPP_BUSINESS">WhatsApp Business Cloud</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Account Name / Alias</label>
                <input
                  type="text"
                  placeholder="e.g. ETaxwala Primary Meta Ad Account"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Platform Account ID</label>
                <input
                  type="text"
                  placeholder="e.g. act_8829104810 or 992-120-4491"
                  value={newAccountId}
                  onChange={(e) => setNewAccountId(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  OAuth Access Token / API Secret
                </label>
                <textarea
                  rows={3}
                  placeholder="Paste OAuth token or long-lived API key..."
                  value={newAccessToken}
                  onChange={(e) => setNewAccessToken(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                />
                <p className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Encrypted with AES-256-GCM before database
                  storage
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Refresh Token (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Optional OAuth refresh token for automatic renewal"
                  value={newRefreshToken}
                  onChange={(e) => setNewRefreshToken(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 btn-multicolor font-bold flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" /> Save & Authorize in Vault
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
