import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  X,
  Send,
  ExternalLink,
  Volume2,
  VolumeX,
  Check,
  CheckCheck,
  CornerDownRight,
} from 'lucide-react';

import {
  playStaffMessageSentChime,
  isStaffChatSoundEnabled,
  setStaffChatSoundEnabled,
} from '@/lib/staff-chat-audio';

export interface StaffChatPopupNotificationData {
  id: string;
  conversationId: number;
  senderId: number;
  senderName: string;
  senderRole?: string;
  senderAvatar?: string;
  messageText: string;
  timestamp: string;
}

interface StaffChatPopupProps {
  notifications: StaffChatPopupNotificationData[];
  onDismiss: (id: string) => void;
  onQuickReply: (conversationId: number, text: string) => Promise<boolean>;
}

export function StaffChatPopupContainer({
  notifications,
  onDismiss,
  onQuickReply,
}: StaffChatPopupProps) {
  if (!notifications.length) return null;

  return (
    <div
      className="fixed top-5 right-5 z-[999999] flex flex-col gap-3 max-w-sm w-full pointer-events-none"
      aria-live="polite"
    >
      {notifications.map((item) => (
        <StaffChatPopupItem
          key={item.id}
          data={item}
          onDismiss={() => onDismiss(item.id)}
          onQuickReply={(text) => onQuickReply(item.conversationId, text)}
        />
      ))}
    </div>
  );
}

function StaffChatPopupItem({
  data,
  onDismiss,
  onQuickReply,
}: {
  data: StaffChatPopupNotificationData;
  onDismiss: () => void;
  onQuickReply: (text: string) => Promise<boolean>;
}) {
  const navigate = useNavigate();
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [soundOn, setSoundOn] = useState(() => isStaffChatSoundEnabled());
  const [isHovered, setIsHovered] = useState(false);

  const handleOpenChat = () => {
    onDismiss();
    navigate(`/crm/chat?conversationId=${data.conversationId}`);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || sending) return;

    setSending(true);
    try {
      const ok = await onQuickReply(replyText.trim());
      if (ok) {
        playStaffMessageSentChime();
        setSentSuccess(true);
        setReplyText('');
        setTimeout(() => {
          onDismiss();
        }, 1200);
      }
    } catch {
      // Failed to send
    } finally {
      setSending(false);
    }
  };

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !soundOn;
    setSoundOn(next);
    setStaffChatSoundEnabled(next);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="pointer-events-auto relative overflow-hidden bg-white/98 dark:bg-[#0F172A]/98 backdrop-blur-xl border border-blue-400/30 dark:border-blue-500/20 rounded-2xl shadow-[0_20px_50px_-10px_rgba(0,132,209,0.22),0_0_0_1px_rgba(27,54,93,0.08)] transition-all duration-300 transform animate-in slide-in-from-right-8 fade-in-0"
    >
      {/* Top ETaxwala Staff Brand Bar */}
      <div className="bg-gradient-to-r from-[#1B365D] via-[#005A9C] to-[#0084D1] px-3.5 py-2 text-white flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          {/* ETaxwala Staff Pulse Icon */}
          <div className="relative w-5 h-5 rounded-lg bg-gradient-to-tr from-[#0084D1] to-[#7C3AED] flex items-center justify-center text-white shadow-xs">
            <MessageSquare className="w-3 h-3 fill-white stroke-none" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
          </div>
          <span className="text-xs font-bold tracking-tight flex items-center gap-1.5">
            <span className="text-white">ETaxwala</span>
            <span className="text-white/60 font-normal">•</span>
            <span className="text-cyan-200 text-[11px] font-semibold">Staff Chat</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-cyan-100/90 font-medium">Just now</span>
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            className="p-1 text-white/70 hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer"
            title={soundOn ? 'Mute Staff Chat sounds' : 'Unmute Staff Chat sounds'}
          >
            {soundOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
          {/* Dismiss */}
          <button
            type="button"
            onClick={onDismiss}
            className="p-1 text-white/70 hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer"
            title="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Notification Body */}
      <div className="p-3.5">
        <div className="flex items-start gap-3">
          {/* Sender Avatar */}
          <div className="relative shrink-0">
            {data.senderAvatar ? (
              <img
                src={data.senderAvatar}
                alt={data.senderName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-[#0084D1]/20"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1B365D] to-[#0084D1] text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
                {data.senderName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {data.senderName}
              </h4>
              {data.senderRole && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-[#0084D1] dark:bg-blue-950/60 dark:text-blue-300 shrink-0">
                  {data.senderRole}
                </span>
              )}
            </div>

            {/* Message Bubble snippet */}
            <div className="mt-1.5 relative p-2.5 rounded-xl bg-[#F0F7FF] dark:bg-[#1E293B] border border-blue-200/60 dark:border-blue-900/40 text-xs text-slate-800 dark:text-blue-50 leading-relaxed break-words">
              {data.messageText}
              <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-slate-400 dark:text-slate-500">
                <span>{data.timestamp}</span>
                <CheckCheck className="w-3 h-3 text-[#0084D1] inline" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        {sentSuccess ? (
          <div className="mt-3 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold animate-in fade-in-0">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Reply dispatched to {data.senderName}</span>
          </div>
        ) : (
          <div className="mt-3 flex items-center justify-between gap-2">
            {!replyOpen ? (
              <>
                <button
                  type="button"
                  onClick={() => setReplyOpen(true)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0084D1] dark:bg-blue-900/40 dark:text-blue-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <CornerDownRight className="w-3.5 h-3.5" />
                  <span>Quick Reply</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenChat}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Chat</span>
                </button>
              </>
            ) : (
              <form onSubmit={handleSendReply} className="w-full flex items-center gap-1.5">
                <input
                  type="text"
                  autoFocus
                  placeholder={`Quick reply to ${data.senderName}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-blue-300 dark:border-blue-700 text-xs text-slate-800 dark:text-white bg-white dark:bg-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#0084D1]"
                />
                <button
                  type="submit"
                  disabled={sending || !replyText.trim()}
                  className="btn-multicolor px-3 py-1.5 disabled:opacity-50 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  {sending ? '...' : <Send className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => setReplyOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Backward compatibility alias
export const WhatsAppChatPopupContainer = StaffChatPopupContainer;
export type WhatsAppPopupNotificationData = StaffChatPopupNotificationData;
