import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Video,
  Play,
  Lock,
  CheckCircle2,
  Clock,
  BookOpen,
  Award,
  Sparkles,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

const TRAINING_MODULES = [
  {
    id: 1,
    title: 'Day 1: FPC Overview, Statutory Framework & Objectives',
    duration: '1 Hour 35 Mins',
    desc: 'Understanding the Farmer Producer Company model, SFAC guidelines, and key legal differences between PACS and FPC.',
    isUnlocked: true,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // demo embed
    slidesUrl: '#',
  },
  {
    id: 2,
    title: 'Day 2: Board of Directors & Governance Structure',
    duration: '1 Hour 40 Mins',
    desc: 'Roles and statutory duties of FPC directors, managing meetings, passing resolutions, and maintaining statutory registers.',
    isUnlocked: true,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    slidesUrl: '#',
  },
  {
    id: 3,
    title: 'Day 3: Equity Grant & SFAC Matching Grant Schemes',
    duration: '1 Hour 45 Mins',
    desc: 'Step-by-step process to apply for SFAC Equity Grant up to ₹15 Lakhs. Criteria, document checklist, and portal filing.',
    isUnlocked: false,
    videoUrl: '',
    slidesUrl: '#',
  },
  {
    id: 4,
    title: 'Day 4: SMART Project Maharashtra & Subsidies',
    duration: '1 Hour 50 Mins',
    desc: 'Accessing World Bank funded SMART Maharashtra agriculture infrastructure grants and DPR preparation.',
    isUnlocked: false,
    videoUrl: '',
    slidesUrl: '#',
  },
  {
    id: 5,
    title: 'Day 5: Agribusiness Marketing & Direct Farmer Market Linkages',
    duration: '1 Hour 30 Mins',
    desc: 'Branding, sorting, packaging, establishing retail supply chains, and B2B corporate contracts.',
    isUnlocked: false,
    videoUrl: '',
    slidesUrl: '#',
  },
];

export default function ClientVideosPage() {
  const { customer } = useAuthStore();
  const [activeVideo, setActiveVideo] = useState(TRAINING_MODULES[0]);

  const hasFpcAccess = customer?.service?.toLowerCase().includes('fpc') || false;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
            ETaxwala Learning Academy
          </span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            FPC Business Masterclass Recordings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full 10-day video curriculum, slide decks, DPR worksheets, and verified certificate.
          </p>
        </div>

        {!hasFpcAccess && (
          <Link
            to="/fpc-training"
            className="px-4 py-2 rounded-xl btn-multicolor font-bold text-xs shadow-sm flex items-center gap-1.5 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" /> <span>Unlock All 10 Modules @ ₹3,999</span>
          </Link>
        )}
      </div>

      {/* Main Video & Playlist Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Active Player */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-900 rounded-3xl overflow-hidden aspect-video border border-slate-800 relative flex items-center justify-center">
            {activeVideo.isUnlocked || hasFpcAccess ? (
              <iframe
                title={activeVideo.title}
                src={activeVideo.videoUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="text-center p-8 text-white space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold">Premium Course Video Locked</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  This module is part of the 10-day FPC Masterclass. Upgrade your account to access
                  all recordings, worksheets, and live CA Q&amp;A.
                </p>
                <Link
                  to="/fpc-training"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl btn-multicolor font-bold text-xs shadow-md mt-2"
                >
                  <span>Enroll in Masterclass</span> <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Video Metadata */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {activeVideo.duration}
              </span>
              <span className="text-xs text-slate-400">Medium: Marathi (मराठी)</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {activeVideo.title}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {activeVideo.desc}
            </p>
          </div>
        </div>

        {/* Course Playlist */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center justify-between">
              <span>Course Syllabus</span>
              <span className="text-xs text-slate-400">{TRAINING_MODULES.length} Lessons</span>
            </h3>

            <div className="space-y-2">
              {TRAINING_MODULES.map((item) => {
                const isSelected = activeVideo.id === item.id;
                const isAccessible = item.isUnlocked || hasFpcAccess;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveVideo(item)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 ring-1 ring-emerald-500'
                        : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isAccessible
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                      }`}
                    >
                      {isAccessible ? (
                        <Play className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Lock className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                        {item.title}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.duration}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
