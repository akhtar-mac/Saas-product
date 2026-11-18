import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth-store';
import { playStaffChatChime, playStaffMessageSentChime } from '@/lib/staff-chat-audio';
import {
  showDesktopNotification,
  requestNotificationPermission,
} from '@/lib/whatsapp-desktop-notification';
import { API_BASE_URL } from '@/lib/api-base';
import {
  StaffChatPopupContainer,
  StaffChatPopupNotificationData,
} from '../components/staff-chat-popup';

const API_BASE = API_BASE_URL;

interface ChatNotificationContextValue {
  unreadChatCount: number;
  triggerTestStaffNotification: (customText?: string) => void;
  triggerTestWhatsAppNotification: (customText?: string) => void; // alias
  sendQuickReply: (conversationId: number, text: string) => Promise<boolean>;
  requestDesktopPermission: () => Promise<void>;
  socket: Socket | null;
}

const ChatNotificationContext = createContext<ChatNotificationContextValue | null>(null);

export function useChatNotification() {
  const ctx = useContext(ChatNotificationContext);
  if (!ctx) {
    throw new Error('useChatNotification must be used within ChatNotificationProvider');
  }
  return ctx;
}

export function ChatNotificationProvider({ children }: { children: React.ReactNode }) {
  const { staffUser, staffToken } = useAuthStore();
  const [popups, setPopups] = useState<StaffChatPopupNotificationData[]>([]);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  // Initialize background Socket.IO connection for real-time Staff Chat popups
  useEffect(() => {
    if (!staffToken) return;

    // Auto request notification permission on mount
    requestNotificationPermission().catch(() => {});

    const socket = io(API_BASE, {
      auth: { token: staffToken },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔔 Global Staff Chat Notification Socket connected:', socket.id);
    });

    const currentUserId = staffUser?.id || (staffUser as any)?.user_id;

    const pushChatPopup = (payload: {
      conversationId: number;
      senderId?: number;
      senderName?: string;
      senderRole?: string;
      senderAvatar?: string;
      messageText?: string;
      message?: any;
    }) => {
      const msg = payload.message || {};

      // Don't notify if user is the sender
      const senderId = payload.senderId ?? msg.senderId;
      if (senderId && currentUserId && Number(senderId) === Number(currentUserId)) {
        return;
      }

      // 1. Play authentic Staff Chat chime
      playStaffChatChime();

      // 2. Add floating Staff Chat popup
      const newPopup: StaffChatPopupNotificationData = {
        id: `staff-${Date.now()}-${Math.random()}`,
        conversationId: payload.conversationId,
        senderId: senderId || 0,
        senderName: payload.senderName || msg.senderName || msg.sender?.name || 'Staff Member',
        senderRole: payload.senderRole || msg.senderRole || msg.sender?.role || 'Staff',
        senderAvatar: payload.senderAvatar || msg.senderAvatar || msg.sender?.avatar,
        messageText:
          payload.messageText ||
          msg.messageText ||
          msg.content ||
          (msg.fileUrl ? 'Sent an attachment 📎' : 'New message'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      // Same conversation: replace older popup so only the latest message shows on top
      setPopups((prev) => [
        newPopup,
        ...prev.filter((p) => p.conversationId !== payload.conversationId).slice(0, 4),
      ]);
      setUnreadChatCount((prev) => prev + 1);

      // 3. Desktop OS Notification
      showDesktopNotification({
        title: `ETaxwala Staff • ${newPopup.senderName}`,
        body: newPopup.messageText,
        tag: `staff-conv-${payload.conversationId}`,
        onClick: () => {
          window.location.href = `/crm/chat?conversationId=${payload.conversationId}`;
        },
      });
    };

    // Listen for incoming messages broadcast to conversation rooms
    socket.on('message:new', (data: { conversationId: number; message: any }) => {
      if (!data?.message) return;
      pushChatPopup({
        conversationId: data.conversationId,
        senderId: data.message.senderId,
        senderName: data.message.senderName,
        senderAvatar: data.message.senderAvatar,
        messageText: data.message.content || data.message.messageText,
        message: data.message,
      });
    });

    // Listen for personal-room chat alerts (global popup even outside the chat room)
    socket.on('notification:chat', (data: any) => {
      if (!data?.conversationId) return;
      pushChatPopup(data);
    });

    return () => {
      socket.disconnect();
    };
  }, [staffToken, staffUser]);

  const dismissPopup = useCallback((id: string) => {
    setPopups((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const sendQuickReply = useCallback(
    async (conversationId: number, text: string): Promise<boolean> => {
      if (!staffToken || !text.trim()) return false;

      try {
        const res = await fetch(`${API_BASE}/v1/chat/conversations/${conversationId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${staffToken}`,
          },
          body: JSON.stringify({ content: text.trim() }),
        });

        if (res.ok) {
          playStaffMessageSentChime();
          return true;
        }

        // If HTTP fails or demo mode, emit socket
        if (socketRef.current?.connected) {
          socketRef.current.emit('message:send', {
            conversationId,
            message: {
              content: text.trim(),
              senderId: staffUser?.id,
              senderName: staffUser?.username,
            },
          });
          playStaffMessageSentChime();
          return true;
        }
        return false;
      } catch (err) {
        console.warn('Quick reply failed, fallback to socket:', err);
        if (socketRef.current?.connected) {
          socketRef.current.emit('message:send', {
            conversationId,
            message: {
              content: text.trim(),
              senderId: staffUser?.id,
              senderName: staffUser?.username,
            },
          });
          playStaffMessageSentChime();
          return true;
        }
        return false;
      }
    },
    [staffToken]
  );

  const triggerTestStaffNotification = useCallback((customText?: string) => {
    // Play sound
    playStaffChatChime();

    const sampleSenders = [
      { name: 'Priya Sharma', role: 'Operations Head', avatar: '' },
      { name: 'CA Pooja Kulkarni', role: 'Senior Tax CA', avatar: '' },
      { name: 'Vikas Shinde', role: 'Compliance Specialist', avatar: '' },
      { name: 'Rohan Gupta', role: 'Sales Lead', avatar: '' },
    ];

    const randomSender = sampleSenders[Math.floor(Math.random() * sampleSenders.length)];

    const testMsg: StaffChatPopupNotificationData = {
      id: `staff-test-${Date.now()}`,
      conversationId: 1,
      senderId: 999,
      senderName: randomSender.name,
      senderRole: randomSender.role,
      messageText:
        customText ||
        'GST Return & MCA SPICe+ documents verified successfully for client #1373! 📋',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setPopups((prev) => [testMsg, ...prev.slice(0, 4)]);
    setUnreadChatCount((prev) => prev + 1);

    showDesktopNotification({
      title: `ETaxwala Staff • ${testMsg.senderName}`,
      body: testMsg.messageText,
      tag: 'staff-test',
      onClick: () => {
        window.location.href = `/crm/chat?conversationId=1`;
      },
    });
  }, []);

  const requestDesktopPermission = useCallback(async () => {
    await requestNotificationPermission();
  }, []);

  return (
    <ChatNotificationContext.Provider
      value={{
        unreadChatCount,
        triggerTestStaffNotification,
        triggerTestWhatsAppNotification: triggerTestStaffNotification,
        sendQuickReply,
        requestDesktopPermission,
        socket: socketRef.current,
      }}
    >
      {children}
      <StaffChatPopupContainer
        notifications={popups}
        onDismiss={dismissPopup}
        onQuickReply={sendQuickReply}
      />
    </ChatNotificationContext.Provider>
  );
}
