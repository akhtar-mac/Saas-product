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
  const [unreadChatCount, setUnreadChatCount] = useState(2);
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

    // Listen for incoming messages
    socket.on('message:new', (data: { conversationId: number; message: any }) => {
      if (!data?.message) return;
      const msg = data.message;

      // Don't notify if user is the sender
      const currentUserId = staffUser?.id || (staffUser as any)?.user_id;
      if (msg.senderId && currentUserId && Number(msg.senderId) === Number(currentUserId)) {
        return;
      }

      // 1. Play authentic Staff Chat chime
      playStaffChatChime();

      // 2. Add floating Staff Chat popup
      const newPopup: StaffChatPopupNotificationData = {
        id: `staff-${Date.now()}-${Math.random()}`,
        conversationId: data.conversationId,
        senderId: msg.senderId || 0,
        senderName: msg.sender?.name || msg.senderName || 'Staff Member',
        senderRole: msg.sender?.role || msg.senderRole || 'Operations Specialist',
        senderAvatar: msg.sender?.avatar || msg.senderAvatar,
        messageText: msg.messageText || (msg.fileUrl ? 'Sent an attachment 📎' : 'New message'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setPopups((prev) => [newPopup, ...prev.slice(0, 4)]);
      setUnreadChatCount((prev) => prev + 1);

      // 3. Desktop OS Notification
      showDesktopNotification({
        title: `ETaxwala Staff • ${newPopup.senderName}`,
        body: newPopup.messageText,
        tag: `staff-conv-${data.conversationId}`,
        onClick: () => {
          window.location.href = `/crm/chat?conversationId=${data.conversationId}`;
        },
      });
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
          body: JSON.stringify({ messageText: text.trim() }),
        });

        if (res.ok) {
          playStaffMessageSentChime();
          return true;
        }

        // If HTTP fails or demo mode, emit socket
        if (socketRef.current?.connected) {
          socketRef.current.emit('message:send', {
            conversationId,
            messageText: text.trim(),
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
            messageText: text.trim(),
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
