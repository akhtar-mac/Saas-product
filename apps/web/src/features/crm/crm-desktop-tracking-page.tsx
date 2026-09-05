import React, { useState } from 'react';
import {
  Monitor,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Copy,
  FileSpreadsheet,
  FileText,
  Printer,
  Calendar,
  ExternalLink,
  Eye,
  X,
  Radio,
  CheckCircle2,
} from 'lucide-react';

interface TrackingEntry {
  id: number;
  name: string;
  loginTime: string;
  logoutTime: string;
  isLive: boolean;
  screenshotsCount: number;
  screenshots: string[];
}

interface SessionEntry {
  id: number;
  name: string;
  loginTime: string;
  logoutTime: string;
  lunchTime: string;
  meetingTime: string;
  outsideWorkTime: string;
  idleTime: string;
  workingTime: string;
}

const DEMO_TRACKING: TrackingEntry[] = [
  { id: 1, name: 'Ravindra Pawar', loginTime: '04-09-2026 10:15', logoutTime: '(Live)', isLive: true, screenshotsCount: 14, screenshots: ['/placeholder-desk1.jpg'] },
  { id: 2, name: 'Shashikant Panchal', loginTime: '04-09-2026 10:14', logoutTime: '(Live)', isLive: true, screenshotsCount: 12, screenshots: ['/placeholder-desk2.jpg'] },
  { id: 3, name: 'Netra Divekar', loginTime: '04-09-2026 10:07', logoutTime: '(Live)', isLive: true, screenshotsCount: 16, screenshots: ['/placeholder-desk1.jpg'] },
  { id: 4, name: 'Sneha Muley', loginTime: '04-09-2026 10:03', logoutTime: '(Live)', isLive: true, screenshotsCount: 18, screenshots: ['/placeholder-desk2.jpg'] },
  { id: 5, name: 'Shreya Joshi', loginTime: '04-09-2026 10:01', logoutTime: '(Live)', isLive: true, screenshotsCount: 22, screenshots: ['/placeholder-desk1.jpg'] },
  { id: 6, name: 'Ganesh Nikam', loginTime: '04-09-2026 10:00', logoutTime: '(Live)', isLive: true, screenshotsCount: 25, screenshots: ['/placeholder-desk2.jpg'] },
  { id: 7, name: 'Avinash Mate', loginTime: '04-09-2026 10:00', logoutTime: '(Live)', isLive: true, screenshotsCount: 20, screenshots: ['/placeholder-desk1.jpg'] },
  { id: 8, name: 'Manisha Shinde', loginTime: '04-09-2026 08:40', logoutTime: '(Live)', isLive: true, screenshotsCount: 31, screenshots: ['/placeholder-desk2.jpg'] },
  { id: 9, name: 'Ganesh Nikam', loginTime: '03-09-2026 11:56', logoutTime: '(Live)', isLive: true, screenshotsCount: 19, screenshots: ['/placeholder-desk1.jpg'] },
  { id: 10, name: 'Manisha Shinde', loginTime: '03-09-2026 11:48', logoutTime: '(Live)', isLive: true, screenshotsCount: 27, screenshots: ['/placeholder-desk2.jpg'] },
];

const DEMO_SESSIONS: SessionEntry[] = [
  { id: 1, name: 'Avinash Mate', loginTime: '04-09-2026 10:01', logoutTime: '04-09-2026 10:02', lunchTime: '00:00:00', meetingTime: '00:00:00', outsideWorkTime: '00:00:00', idleTime: '00:00:00', workingTime: '00:00:50' },
  { id: 2, name: 'Ganesh Nikam', loginTime: '04-09-2026 10:00', logoutTime: '04-09-2026 10:12', lunchTime: '00:00:00', meetingTime: '00:00:00', outsideWorkTime: '00:00:00', idleTime: '00:00:00', workingTime: '00:11:24' },
  { id: 3, name: 'Manisha Shinde', loginTime: '04-09-2026 08:40', logoutTime: '04-09-2026 10:10', lunchTime: '00:00:00', meetingTime: '00:00:00', outsideWorkTime: '00:00:00', idleTime: '00:05:00', workingTime: '01:29:58' },
  { id: 4, name: 'Netra Divekar', loginTime: '04-09-2026 10:07', logoutTime: '04-09-2026 10:17', lunchTime: '00:00:00', meetingTime: '00:00:00', outsideWorkTime: '00:00:00', idleTime: '00:00:00', workingTime: '00:10:04' },
  { id: 5, name: 'Ravindra Pawar', loginTime: '04-09-2026 10:15', logoutTime: '04-09-2026 10:15', lunchTime: '00:00:00', meetingTime: '00:00:00', outsideWorkTime: '00:00:00', idleTime: '00:00:00', workingTime: '00:00:00' },
  { id: 6, name: 'Shashikant Panchal', loginTime: '04-09-2026 10:14', logoutTime: '04-09-2026 10:14', lunchTime: '00:00:00', meetingTime: '00:00:00', outsideWorkTime: '00:00:00', idleTime: '00:00:00', workingTime: '00:00:00' },
  { id: 7, name: 'Shreya Joshi', loginTime: '04-09-2026 10:13', logoutTime: '04-09-2026 10:13', lunchTime: '00:00:00', meetingTime: '00:00:00', outsideWorkTime: '00:00:00', idleTime: '00:00:00', workingTime: '00:00:00' },
  { id: 8, name: 'Swarupa Patwardhan', loginTime: '04-09-2026 10:17', logoutTime: '04-09-2026 10:17', lunchTime: '00:00:00', meetingTime: '00:00:00', outsideWorkTime: '00:00:00', idleTime: '00:00:00', workingTime: '00:00:00' },
  { id: 9, name: 'Avinash Mate', loginTime: '03-09-2026 09:57', logoutTime: '03-09-2026 19:24', lunchTime: '00:30:29', meetingTime: '00:00:00', outsideWorkTime: '00:00:00', idleTime: '00:10:00', workingTime: '09:26:19' },
  { id: 10, name: 'Ganesh Nikam', loginTime: '03-09-2026 09:45', logoutTime: '03-09-2026 18:59', lunchTime: '00:47:13', meetingTime: '00:00:00', outsideWorkTime: '00:00:00', idleTime: '00:55:00', workingTime: '09:14:02' },
];

export default function CrmDesktopTrackingPage({ defaultTab = 'tracking' }: { defaultTab?: 'tracking' | 'session' }) {
  const [activeTab, setActiveTab] = useState<'tracking' | 'session'>(defaultTab);
  const [staffFilter, setStaffFilter] = useState('All Staff');
  const [fromDate, setFromDate] = useState('2026-09-04');
  const [toDate, setToDate] = useState('2026-09-04');
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [selectedScreenshots, setSelectedScreenshots] = useState<TrackingEntry | null>(null);

  const staffList = [
    'All Staff',
    'Ravindra Pawar',
    'Shashikant Panchal',
    'Netra Divekar',
    'Sneha Muley',
    'Shreya Joshi',
    'Ganesh Nikam',
    'Avinash Mate',
    'Manisha Shinde',
    'Swarupa Patwardhan',
  ];

  const handleReset = () => {
    setStaffFilter('All Staff');
    setFromDate('2026-09-04');
    setToDate('2026-09-04');
    setSearchTerm('');
  };

  return (
    <div className="space-y-4">
      {/* Sub-navigation tabs matching Operation Manager > Manage Desktop */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('tracking')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'tracking'
              ? 'bg-[#003A66] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-emerald-400" />
          <span>Tracking Report</span>
        </button>
        <button
          onClick={() => setActiveTab('session')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'session'
              ? 'bg-[#003A66] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Session Report</span>
        </button>
      </div>

      {/* Main Card with MANAGE TRACKING header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#003A66]">
            MANAGE TRACKING
          </h2>

          {/* Filter Bar with exact button locations */}
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-4">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Select Staff</label>
              <select
                value={staffFilter}
                onChange={(e) => setStaffFilter(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#003A66]"
              >
                {staffList.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-md px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#003A66]"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-md px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#003A66]"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-2">
              <button
                className="flex-1 bg-[#06B6D4] hover:bg-[#0891B2] text-white font-bold text-xs py-2 px-4 rounded-md shadow-xs transition-colors text-center"
              >
                Filter
              </button>
              <button
                onClick={handleReset}
                className="bg-[#1E3A8A] hover:bg-[#1E40AF] text-white font-bold text-xs py-2 px-3 rounded-md shadow-xs transition-colors text-center"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>

        {/* Table Action Bar */}
        <div className="p-3 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-white border border-slate-300 rounded px-2 py-1 text-xs font-semibold focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              {['Copy', 'Excel', 'CSV', 'PDF', 'Print'].map((btn) => (
                <button
                  key={btn}
                  onClick={() => alert(`${btn} export triggered`)}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded shadow-2xs transition-colors"
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search Data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded px-3 py-1 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#003A66] w-48"
            />
          </div>
        </div>

        {/* Table View: Tracking Report */}
        {activeTab === 'tracking' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#1E3A8A] text-white uppercase text-[11px] tracking-wider">
                  <th className="py-2.5 px-4 font-bold">Name</th>
                  <th className="py-2.5 px-4 font-bold">Login Time</th>
                  <th className="py-2.5 px-4 font-bold">Logout Time</th>
                  <th className="py-2.5 px-4 font-bold">Screenshots</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {DEMO_TRACKING.map((item, idx) => (
                  <tr key={item.id} className={idx % 2 === 0 ? 'bg-white hover:bg-sky-50/40' : 'bg-[#F9FAFB] hover:bg-sky-50/40'}>
                    <td className="py-2.5 px-4 font-medium text-slate-800">{item.name}</td>
                    <td className="py-2.5 px-4 text-slate-600">{item.loginTime}</td>
                    <td className="py-2.5 px-4">
                      {item.isLive ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          (Live)
                        </span>
                      ) : (
                        <span className="text-slate-600">{item.logoutTime}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4">
                      <button
                        onClick={() => setSelectedScreenshots(item)}
                        className="text-[#0284c7] hover:underline font-bold flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Screenshots ({item.screenshotsCount})</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Table View: Session Report */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#1E3A8A] text-white uppercase text-[11px] tracking-wider">
                  <th className="py-2.5 px-3 font-bold">Name</th>
                  <th className="py-2.5 px-3 font-bold">Login Time</th>
                  <th className="py-2.5 px-3 font-bold">Logout Time</th>
                  <th className="py-2.5 px-3 font-bold">Lunch Time</th>
                  <th className="py-2.5 px-3 font-bold">Meeting Time</th>
                  <th className="py-2.5 px-3 font-bold">Outside Work Time</th>
                  <th className="py-2.5 px-3 font-bold">Idle Time</th>
                  <th className="py-2.5 px-3 font-bold">Working Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {DEMO_SESSIONS.map((item, idx) => (
                  <tr key={item.id} className={idx % 2 === 0 ? 'bg-white hover:bg-sky-50/40' : 'bg-[#F9FAFB] hover:bg-sky-50/40'}>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{item.name}</td>
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{item.loginTime}</td>
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{item.logoutTime}</td>
                    <td className="py-2.5 px-3 text-slate-600">{item.lunchTime}</td>
                    <td className="py-2.5 px-3 text-slate-600">{item.meetingTime}</td>
                    <td className="py-2.5 px-3 text-slate-600">{item.outsideWorkTime}</td>
                    <td className="py-2.5 px-3 font-semibold text-amber-600">{item.idleTime}</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-700">{item.workingTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing 1 to 10 of 3,809 entries</span>
          <div className="flex items-center gap-1">
            <button className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700">
              Previous
            </button>
            <button className="px-2.5 py-1 rounded bg-[#1E3A8A] text-white font-bold">1</button>
            <button className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700">2</button>
            <button className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700">3</button>
            <span className="px-1 text-slate-400">...</span>
            <button className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700">381</button>
            <button className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Screenshot Preview Modal */}
      {selectedScreenshots && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="bg-[#003A66] text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Desktop Activity Screenshots</h3>
                <p className="text-[11px] text-white/70">Staff: {selectedScreenshots.name} — Status: Active</p>
              </div>
              <button
                onClick={() => setSelectedScreenshots(null)}
                className="p-1 hover:bg-white/10 rounded-md text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="aspect-video bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center text-slate-400 text-xs flex-col gap-2">
                <Monitor className="w-10 h-10 text-cyan-400" />
                <p>Live Desktop Screen Capture Preview (Encrypted Audit Feed)</p>
                <span className="badge badge-green text-[10px]">Captured: {selectedScreenshots.loginTime}</span>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedScreenshots(null)}
                  className="px-4 py-2 text-xs font-bold bg-slate-800 text-white rounded-lg hover:bg-slate-700"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
