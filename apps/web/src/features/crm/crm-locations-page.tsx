import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  ExternalLink,
  MapPin,
  Navigation,
  RefreshCw,
  Route as RouteIcon,
  Search,
  Users,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { API_BASE_URL } from '@/lib/api-base';

interface LocationUserSummary {
  id: number;
  username: string;
  email: string;
  total_pings: number;
  last_ping_at: string | null;
  last_ping_dmy: string | null;
  last_date: string | null;
  last_mode: string | null;
  last_latitude: string | null;
  last_longitude: string | null;
}

interface LocationPoint {
  id: number;
  user_id: number;
  latitude: string;
  longitude: string;
  accuracy?: string | null;
  speed?: string | null;
  battery_level?: string | null;
  mode: string;
  created_at: string;
  created_at_dmy: string;
  date_str?: string;
}

interface AvailableDateInfo {
  date_str: string;
  date_dmy: string;
  count: number;
}

function getTodayIst(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function formatYmdToDmy(ymd: string): string {
  const parts = ymd.split('-');
  if (parts.length !== 3) return ymd;
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

function renderModeBadge(mode: string | null | undefined) {
  const normalized = (mode || 'foreground').toLowerCase();
  const isBackground = normalized === 'background';
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
        isBackground
          ? 'bg-slate-100 text-slate-700 border-slate-200'
          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
      }`}
    >
      {isBackground ? 'Background' : 'Foreground'}
    </span>
  );
}

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export default function CrmLocationsPage() {
  const { staffToken } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const viewParam = searchParams.get('view');
  const userIdParam = Number(searchParams.get('userId') || 0);
  const dateParam = searchParams.get('date') || getTodayIst();

  const view: 'list' | 'history' | 'route' =
    userIdParam > 0 && viewParam === 'route'
      ? 'route'
      : userIdParam > 0 && viewParam === 'history'
        ? 'history'
        : 'list';

  // List view state
  const [users, setUsers] = useState<LocationUserSummary[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listSearch, setListSearch] = useState('');

  // History view state
  const [selectedUser, setSelectedUser] = useState<{
    id: number;
    username: string;
    email: string;
  } | null>(null);
  const [historyRows, setHistoryRows] = useState<LocationPoint[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyDate, setHistoryDate] = useState('');
  const [historyMode, setHistoryMode] = useState('');
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPagination, setHistoryPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 1,
  });
  const [availableDates, setAvailableDates] = useState<AvailableDateInfo[]>([]);

  // Route view state
  const [routeDateInput, setRouteDateInput] = useState(dateParam);
  const [routePoints, setRoutePoints] = useState<LocationPoint[]>([]);
  const [routeLoading, setRouteLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Sync routeDateInput when URL changes
  useEffect(() => {
    setRouteDateInput(dateParam);
  }, [dateParam]);

  // Load list of tracked users
  const loadUsers = async () => {
    if (!staffToken) return;
    setListLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_BASE_URL}/v1/crm/locations`, {
        headers: { Authorization: `Bearer ${staffToken}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Failed to load user locations');
        setUsers([]);
        return;
      }
      setUsers(data.data || []);
    } catch {
      setErrorMsg('Unable to reach the server for user locations.');
      setUsers([]);
    } finally {
      setListLoading(false);
    }
  };

  // Load user location history
  const loadHistory = async (targetUserId: number, targetPage = historyPage) => {
    if (!staffToken || targetUserId <= 0) return;
    setHistoryLoading(true);
    setErrorMsg(null);
    try {
      const params = new URLSearchParams({
        page: String(targetPage),
        limit: '50',
      });
      if (historyDate) params.set('date', historyDate);
      if (historyMode) params.set('mode', historyMode);

      const res = await fetch(
        `${API_BASE_URL}/v1/crm/locations/users/${targetUserId}?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${staffToken}` },
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Failed to load location history');
        setHistoryRows([]);
        return;
      }
      setSelectedUser(data.user || null);
      setHistoryRows(data.data || []);
      setAvailableDates(data.availableDates || []);
      setHistoryPagination(data.pagination || { page: 1, limit: 50, total: 0, totalPages: 1 });
    } catch {
      setErrorMsg('Unable to reach the server for location history.');
      setHistoryRows([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Load user day route
  const loadRoute = async (targetUserId: number, targetDate: string) => {
    if (!staffToken || targetUserId <= 0) return;
    setRouteLoading(true);
    setErrorMsg(null);
    try {
      const params = new URLSearchParams({ date: targetDate });
      const res = await fetch(
        `${API_BASE_URL}/v1/crm/locations/users/${targetUserId}/route?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${staffToken}` },
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Failed to load day route');
        setRoutePoints([]);
        return;
      }
      setSelectedUser(data.user || null);
      setRoutePoints(data.data || []);
      setAvailableDates(data.availableDates || []);
    } catch {
      setErrorMsg('Unable to reach the server for day route.');
      setRoutePoints([]);
    } finally {
      setRouteLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'list') {
      loadUsers();
    } else if (view === 'history' && userIdParam > 0) {
      loadHistory(userIdParam, historyPage);
    } else if (view === 'route' && userIdParam > 0) {
      loadRoute(userIdParam, dateParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, userIdParam, dateParam, historyDate, historyMode, historyPage, staffToken]);

  // Render Leaflet map for route view
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    if (view !== 'route' || !mapContainerRef.current || routePoints.length === 0) {
      return;
    }

    const validPoints = routePoints
      .map((loc) => ({
        ...loc,
        lat: Number.parseFloat(loc.latitude),
        lng: Number.parseFloat(loc.longitude),
      }))
      .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));

    if (validPoints.length === 0) return;

    const path: [number, number][] = validPoints.map((p) => [p.lat, p.lng]);

    const map = L.map(mapContainerRef.current).setView(path[0], 13);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    if (path.length > 1) {
      const routeLine = L.polyline(path, {
        color: '#2563eb',
        weight: 4,
      }).addTo(map);
      map.fitBounds(routeLine.getBounds(), { padding: [36, 36] });
    } else {
      map.setView(path[0], 15);
    }

    validPoints.forEach((loc, index) => {
      let color = '#2563eb';
      if (index === 0) color = '#16a34a';
      if (index === validPoints.length - 1) color = '#dc2626';

      const numberIcon = L.divIcon({
        className: 'etax-route-number-icon',
        html: `<div style="background:${color};color:#fff;font-weight:700;font-size:12px;border-radius:9999px;width:28px;height:28px;line-height:24px;text-align:center;border:2px solid #fff;box-shadow:0 1px 4px rgba(15,23,42,0.45);">${index + 1}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const popupHtml = `
        <div style="font-size:12px;line-height:1.5;">
          <strong>Point ${index + 1}</strong><br/>
          Latitude: ${escapeHtml(String(loc.latitude))}<br/>
          Longitude: ${escapeHtml(String(loc.longitude))}<br/>
          Mode: ${escapeHtml(loc.mode === 'background' ? 'Background' : 'Foreground')}<br/>
          Time: ${escapeHtml(loc.created_at_dmy || loc.created_at)}
        </div>
      `;

      L.marker([loc.lat, loc.lng], { icon: numberIcon })
        .addTo(map)
        .bindTooltip(`Point ${index + 1}`, { permanent: true, direction: 'top', offset: [0, -10] })
        .bindPopup(popupHtml);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [view, routePoints]);

  const filteredUsers = useMemo(() => {
    const q = listSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        (u.username || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q)
    );
  }, [users, listSearch]);

  const openHistory = (userId: number) => {
    setHistoryDate('');
    setHistoryMode('');
    setHistoryPage(1);
    setSearchParams({ view: 'history', userId: String(userId) });
  };

  const openRoute = (userId: number, dateStr?: string) => {
    const targetDate = dateStr || getTodayIst();
    setRouteDateInput(targetDate);
    setSearchParams({ view: 'route', userId: String(userId), date: targetDate });
  };

  const backToList = () => {
    setSelectedUser(null);
    setSearchParams({});
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold font-display text-slate-900 flex items-center gap-2.5">
            <MapPin className="w-6 h-6 text-[#1B365D]" />
            {view === 'list' && 'User Locations'}
            {view === 'history' &&
              `Location History${selectedUser ? ` of ${selectedUser.username}` : ''}`}
            {view === 'route' &&
              `${selectedUser ? selectedUser.username : 'User'} — Route on ${formatYmdToDmy(dateParam)}`}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {view === 'list' &&
              'Field staff GPS locations recorded from the mobile app (read-only)'}
            {view === 'history' &&
              'Recorded GPS coordinates, tracking mode, timestamp, and Google Maps link'}
            {view === 'route' &&
              'Chronological day route plotted with start (green), waypoints (blue), and latest (red)'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {view === 'list' && (
            <button
              type="button"
              onClick={loadUsers}
              className="btn-outline btn-sm inline-flex items-center gap-1.5"
              disabled={listLoading}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          )}

          {view === 'history' && (
            <>
              <button
                type="button"
                onClick={backToList}
                className="btn-outline btn-sm inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
              <button
                type="button"
                onClick={() => openRoute(userIdParam, historyDate || getTodayIst())}
                className="btn-multicolor btn-sm inline-flex items-center gap-1.5"
              >
                <RouteIcon className="w-3.5 h-3.5" />
                Today&apos;s Route (Map)
              </button>
            </>
          )}

          {view === 'route' && (
            <button
              type="button"
              onClick={() => openHistory(userIdParam)}
              className="btn-outline btn-sm inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to History
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* VIEW 1: USER LIST (matches OM/locations.blade.php) */}
      {view === 'list' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Users className="w-4 h-4 text-[#1B365D]" />
              <span>Tracked Staff ({filteredUsers.length})</span>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={listSearch}
                onChange={(e) => setListSearch(e.target.value)}
                placeholder="Search user or email..."
                aria-label="Search tracked users"
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Last Mode</th>
                  <th className="px-4 py-3 text-right">Total Pings</th>
                  <th className="px-4 py-3">Last Recorded</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {listLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                      Loading tracked users...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                      No users with recorded GPS locations found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-900">{u.username}</td>
                      <td className="px-4 py-3 text-slate-600">{u.email}</td>
                      <td className="px-4 py-3">{renderModeBadge(u.last_mode)}</td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums text-slate-700">
                        {Number(u.total_pings || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap tabular-nums">
                        {u.last_ping_dmy || '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openHistory(u.id)}
                            className="btn-multicolor btn-sm inline-flex items-center gap-1.5"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            View Locations
                          </button>
                          <button
                            type="button"
                            onClick={() => openRoute(u.id, u.last_date || getTodayIst())}
                            className="btn-outline btn-sm inline-flex items-center gap-1.5"
                          >
                            <RouteIcon className="w-3.5 h-3.5" />
                            Route Map
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: USER LOCATION HISTORY (matches OM/viewlocations.blade.php) */}
      {view === 'history' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Filter by Date
                </label>
                <input
                  type="date"
                  value={historyDate}
                  onChange={(e) => {
                    setHistoryDate(e.target.value);
                    setHistoryPage(1);
                  }}
                  aria-label="Filter locations by date"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Mode</label>
                <select
                  value={historyMode}
                  onChange={(e) => {
                    setHistoryMode(e.target.value);
                    setHistoryPage(1);
                  }}
                  aria-label="Filter locations by mode"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">All Modes</option>
                  <option value="foreground">Foreground</option>
                  <option value="background">Background</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                {(historyDate || historyMode) && (
                  <button
                    type="button"
                    onClick={() => {
                      setHistoryDate('');
                      setHistoryMode('');
                      setHistoryPage(1);
                    }}
                    className="btn-outline btn-sm"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {availableDates.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 mr-1">
                  Recent active dates:
                </span>
                {availableDates.slice(0, 6).map((d) => (
                  <button
                    key={d.date_str}
                    type="button"
                    onClick={() => {
                      setHistoryDate(d.date_str);
                      setHistoryPage(1);
                    }}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-colors ${
                      historyDate === d.date_str
                        ? 'bg-[#1B365D] text-white border-[#1B365D]'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {d.date_dmy} ({d.count})
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* History Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span>
                Showing{' '}
                <strong className="text-slate-900">
                  {historyPagination.total.toLocaleString('en-IN')}
                </strong>{' '}
                recorded points
              </span>
              {selectedUser?.email && <span className="text-slate-400">{selectedUser.email}</span>}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                    <th className="px-4 py-3">Latitude</th>
                    <th className="px-4 py-3">Longitude</th>
                    <th className="px-4 py-3">Mode</th>
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">Accuracy / Battery</th>
                    <th className="px-4 py-3 text-right">Map</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {historyLoading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                        Loading location history...
                      </td>
                    </tr>
                  ) : historyRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                        No location records match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    historyRows.map((loc) => (
                      <tr key={loc.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-mono text-slate-800">{loc.latitude}</td>
                        <td className="px-4 py-3 font-mono text-slate-800">{loc.longitude}</td>
                        <td className="px-4 py-3">{renderModeBadge(loc.mode)}</td>
                        <td className="px-4 py-3 text-slate-700 whitespace-nowrap tabular-nums">
                          {loc.created_at_dmy || loc.created_at}
                        </td>
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                          {loc.accuracy || loc.battery_level ? (
                            <span>
                              {loc.accuracy ? `±${Math.round(Number(loc.accuracy))}m` : ''}
                              {loc.accuracy && loc.battery_level ? ' · ' : ''}
                              {loc.battery_level ? `${loc.battery_level}%` : ''}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <a
                            href={`https://www.google.com/maps?q=${encodeURIComponent(loc.latitude)},${encodeURIComponent(loc.longitude)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-outline btn-sm inline-flex items-center gap-1"
                          >
                            View
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {historyPagination.totalPages > 1 && (
              <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Page {historyPagination.page} of {historyPagination.totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={historyPagination.page <= 1}
                    onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                    className="btn-outline btn-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={historyPagination.page >= historyPagination.totalPages}
                    onClick={() =>
                      setHistoryPage((p) => Math.min(historyPagination.totalPages, p + 1))
                    }
                    className="btn-outline btn-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: USER DAY ROUTE MAP (matches OM/user_day_route.blade.php) */}
      {view === 'route' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (routeDateInput) {
                  openRoute(userIdParam, routeDateInput);
                }
              }}
              className="flex flex-wrap items-end gap-3"
            >
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Select Date
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    value={routeDateInput}
                    onChange={(e) => setRouteDateInput(e.target.value)}
                    aria-label="Route date"
                    className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
              <button type="submit" className="btn-multicolor btn-sm">
                Show
              </button>
            </form>

            {availableDates.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 mr-1">
                  Dates with GPS route:
                </span>
                {availableDates.slice(0, 8).map((d) => (
                  <button
                    key={d.date_str}
                    type="button"
                    onClick={() => openRoute(userIdParam, d.date_str)}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-colors ${
                      dateParam === d.date_str
                        ? 'bg-[#1B365D] text-white border-[#1B365D]'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {d.date_dmy} ({d.count})
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-800">
                  {routePoints.length} point{routePoints.length === 1 ? '' : 's'} on{' '}
                  {formatYmdToDmy(dateParam)}
                </span>
                {routePoints.length > 0 && (
                  <span className="text-slate-500">
                    {routePoints[0].created_at_dmy} →{' '}
                    {routePoints[routePoints.length - 1].created_at_dmy}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                  Start
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                  Waypoint
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
                  End
                </span>
              </div>
            </div>

            {routeLoading ? (
              <div className="h-[500px] flex items-center justify-center text-xs text-slate-400">
                Loading route map...
              </div>
            ) : routePoints.length === 0 ? (
              <div className="h-[340px] flex flex-col items-center justify-center text-center px-6 gap-3">
                <MapPin className="w-8 h-8 text-slate-300" />
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    No location data found for {formatYmdToDmy(dateParam)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {availableDates.length > 0
                      ? 'Pick one of the active dates above to inspect the recorded route.'
                      : 'No GPS coordinates have been recorded for this staff member yet.'}
                  </p>
                </div>
                {availableDates.length > 0 && (
                  <button
                    type="button"
                    onClick={() => openRoute(userIdParam, availableDates[0].date_str)}
                    className="btn-multicolor btn-sm"
                  >
                    View Latest Route ({availableDates[0].date_dmy})
                  </button>
                )}
              </div>
            ) : (
              <div ref={mapContainerRef} className="w-full h-[500px] z-0" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
