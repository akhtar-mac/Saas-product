import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { API_BASE_URL } from '@/lib/api-base';
import {
  Bell,
  X,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  PhoneCall,
  Zap,
  Clock,
  Check,
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'lead' | 'payment' | 'qc' | 'sla' | 'system';
  title: string;
  detail: string;
  time: string;
  isRead: boolean;
  urgent?: boolean;
}

const DEMO_NOTIFICATIONS: Notification[] = [];

const typeConfig: Record<
  Notification['type'],
  { icon: React.ElementType; bg: string; color: string }
> = {
  lead: { icon: PhoneCall, bg: 'bg-blue-50', color: 'text-blue-600' },
  payment: { icon: DollarSign, bg: 'bg-emerald-50', color: 'text-emerald-600' },
  sla: { icon: AlertTriangle, bg: 'bg-red-50', color: 'text-red-600' },
  qc: { icon: CheckCircle2, bg: 'bg-purple-50', color: 'text-purple-600' },
  system: { icon: Zap, bg: 'bg-amber-50', color: 'text-amber-600' },
};

type FilterTab = 'all' | 'unread' | 'urgent';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLButtonElement | null>;
}

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { staffToken } = useAuthStore();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [tab, setTab] = useState<FilterTab>('all');

  const API_BASE = API_BASE_URL;

  const loadChatNotifications = () => {
    if (!staffToken) return;
    fetch(`${API_BASE}/v1/chat/conversations`, {
      headers: { Authorization: `Bearer ${staffToken}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data?.success || !Array.isArray(data.data)) return;
        const mapped: Notification[] = data.data
          .filter((c: any) => Number(c.unreadCount) > 0)
          .map((c: any) => ({
            id: `chat-${c.id}`,
            type: 'lead' as const,
            title: c.participant?.name || c.title || 'Staff Member',
            detail:
              c.lastMessage?.content ||
              (c.lastMessage?.messageType === 'file' ? 'Sent an attachment' : 'New message'),
            time: c.updatedAt ? new Date(c.updatedAt).toLocaleString() : '',
            isRead: false,
            conversationId: c.id,
          }));
        setNotifications(mapped);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (isOpen) loadChatNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, staffToken]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const dismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filtered =
    tab === 'unread'
      ? notifications.filter((n) => !n.isRead)
      : tab === 'urgent'
        ? notifications.filter((n) => n.urgent)
        : notifications;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="absolute right-0 top-full mt-2 z-50 w-[380px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4 text-brand-navy" />
            <h3 className="font-display font-bold text-sm text-slate-800">Notifications</h3>
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[10px] font-semibold text-brand-navy hover:text-brand-gold-dark flex items-center gap-1 transition-colors"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-slate-100">
          {(['all', 'unread', 'urgent'] as FilterTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold capitalize transition-colors ${
                tab === t ? 'bg-brand-navy text-white' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {t}
              {t === 'unread' && unreadCount > 0 && (
                <span className="ml-1 text-[10px] font-bold opacity-80">({unreadCount})</span>
              )}
            </button>
          ))}
        </div>

        {/* Notification List */}
        <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-50">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">
              <Bell className="w-6 h-6 mx-auto mb-2 opacity-30" />
              {tab === 'unread'
                ? 'All caught up!'
                : tab === 'urgent'
                  ? 'No urgent alerts'
                  : 'No notifications'}
            </div>
          ) : (
            filtered.map((notif) => {
              const cfg = typeConfig[notif.type];
              const Icon = cfg.icon;
              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    markRead(notif.id);
                    const convId = (notif as any).conversationId;
                    if (convId) {
                      fetch(`${API_BASE}/v1/chat/conversations/${convId}/read`, {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${staffToken}` },
                      }).catch(() => {});
                      onClose();
                      navigate(`/crm/chat?conversationId=${convId}`);
                    }
                  }}
                  className={`flex gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors group ${
                    !notif.isRead ? 'bg-blue-50/30' : ''
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}
                  >
                    <Icon className={`w-4 h-4 ${cfg.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-xs font-bold leading-tight ${!notif.isRead ? 'text-slate-800' : 'text-slate-600'}`}
                      >
                        {notif.title}
                        {notif.urgent && (
                          <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 text-[9px] font-bold">
                            URGENT
                          </span>
                        )}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dismiss(notif.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-slate-200 text-slate-400 transition-all shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">
                      {notif.detail}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      {notif.time}
                      {!notif.isRead && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 ml-1" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-slate-100 text-center">
          <button className="text-[11px] font-semibold text-brand-navy hover:text-brand-gold-dark transition-colors">
            View all notifications →
          </button>
        </div>
      </div>
    </>
  );
}

/* Badge component for use in header */
export function NotificationBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
      {count > 9 ? '9+' : count}
    </span>
  );
}
