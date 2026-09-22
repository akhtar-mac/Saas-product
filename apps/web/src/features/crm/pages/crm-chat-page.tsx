import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  Search, Send, Paperclip, X, FileText, Image as ImageIcon,
  Check, CheckCheck, Clock, Shield, Users, Phone, Mail,
  Building, AlertCircle, Download, RefreshCw, MessageSquare,
  Sparkles, ChevronRight, Eye,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { ChatUser, ChatMessage, ChatConversation, RoleType } from '@etaxwala/types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function CrmChatPage() {
  const { staffUser, staffToken } = useAuthStore();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [staffDirectory, setStaffDirectory] = useState<ChatUser[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [activeParticipant, setActiveParticipant] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'conversations' | 'directory' | 'audit'>('conversations');
  const [onlineOnly, setOnlineOnly] = useState(false);

  // Message composer
  const [messageText, setMessageText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Super Admin audit view
  const [auditConversations, setAuditConversations] = useState<any[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSuperAdmin =
    staffUser?.role === RoleType.SUPER_ADMIN ||
    (Array.isArray(staffUser?.roles) && staffUser.roles.includes(RoleType.SUPER_ADMIN));

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${staffToken}`,
  };

  // ─── Socket.IO Real-Time Connection ─────────────────────────────────────────
  useEffect(() => {
    if (!staffToken) return;

    const socket = io(API_BASE, {
      auth: { token: staffToken },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Staff Chat WebSocket connected:', socket.id);
    });

    // Real-time message receiver
    socket.on('message:new', (data: { conversationId: number; message: any }) => {
      if (activeConversationId === data.conversationId) {
        setMessages((prev) => {
          // Prevent duplicates
          if (prev.some((m) => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
        scrollToBottom();
        // Mark as read immediately since user is on this conversation
        socket.emit('message:read', { conversationId: data.conversationId });
      }

      // Update conversation last message in list
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === data.conversationId) {
            return {
              ...c,
              lastMessage: data.message,
              unreadCount: activeConversationId === data.conversationId ? 0 : c.unreadCount + 1,
              updatedAt: new Date().toISOString(),
            };
          }
          return c;
        })
      );
    });

    // Real-time user presence updates
    socket.on('user:presence', (data: { userId: number; isOnline: boolean; lastSeenAt: string }) => {
      setStaffDirectory((prev) =>
        prev.map((u) => (u.id === data.userId ? { ...u, isOnline: data.isOnline, lastSeenAt: data.lastSeenAt } : u))
      );
      setConversations((prev) =>
        prev.map((c) => {
          if (c.participant && c.participant.id === data.userId) {
            return {
              ...c,
              participant: { ...c.participant, isOnline: data.isOnline, lastSeenAt: data.lastSeenAt },
            };
          }
          return c;
        })
      );
      if (activeParticipant && activeParticipant.id === data.userId) {
        setActiveParticipant((prev) => (prev ? { ...prev, isOnline: data.isOnline, lastSeenAt: data.lastSeenAt } : null));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [staffToken, activeConversationId, activeParticipant]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // ─── Fetch Conversations & Directory on Mount ──────────────────────────────
  const loadConversations = async () => {
    setLoadingConversations(true);
    try {
      const res = await fetch(`${API_BASE}/v1/chat/conversations`, { headers: authHeaders });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setConversations(data.data);
      }
    } catch (err) {
      console.error('Failed to load conversations', err);
    } finally {
      setLoadingConversations(false);
    }
  };

  const loadStaffDirectory = async () => {
    try {
      const res = await fetch(`${API_BASE}/v1/chat/users`, { headers: authHeaders });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setStaffDirectory(data.data);
      }
    } catch (err) {
      console.error('Failed to load staff directory', err);
    }
  };

  const loadAuditConversations = async () => {
    if (!isSuperAdmin) return;
    setLoadingAudit(true);
    try {
      const res = await fetch(`${API_BASE}/v1/chat/admin/conversations`, { headers: authHeaders });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setAuditConversations(data.data);
      }
    } catch (err) {
      console.error('Failed to load audit conversations', err);
    } finally {
      setLoadingAudit(false);
    }
  };

  useEffect(() => {
    loadConversations();
    loadStaffDirectory();
  }, []);

  // ─── Open or Switch to a Conversation ──────────────────────────────────────
  const openConversation = async (convId: number, participant?: ChatUser) => {
    setActiveConversationId(convId);
    if (participant) {
      setActiveParticipant(participant);
    }
    setLoadingMessages(true);
    setErrorMsg(null);

    // Join room on socket
    socketRef.current?.emit('conversation:join', { conversationId: convId });

    try {
      const res = await fetch(`${API_BASE}/v1/chat/conversations/${convId}/messages`, { headers: authHeaders });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setMessages(data.data);
        scrollToBottom();

        // Clear unread count locally
        setConversations((prev) =>
          prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c))
        );
      } else {
        setErrorMsg(data.error || 'Failed to load messages.');
      }
    } catch {
      setErrorMsg('Failed to fetch conversation history.');
    } finally {
      setLoadingMessages(false);
    }
  };

  // Start chat with staff from directory
  const startDirectChat = async (targetUser: ChatUser) => {
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_BASE}/v1/chat/conversations/direct`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ target_user_id: targetUser.id }),
      });
      const data = await res.json();
      if (data.success && data.data?.id) {
        await loadConversations();
        openConversation(data.data.id, targetUser);
        setActiveTab('conversations');
      } else {
        setErrorMsg(data.error || 'Could not start conversation.');
      }
    } catch {
      setErrorMsg('Network error starting chat.');
    }
  };

  // ─── Send Message & Attachments ─────────────────────────────────────────────
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversationId) return;
    if (!messageText.trim() && !selectedFile) return;

    setSending(true);
    setErrorMsg(null);

    try {
      let uploadedAttachments: any[] = [];

      // If file attached, upload first
      if (selectedFile) {
        setUploadingAttachment(true);
        const formData = new FormData();
        formData.append('file', selectedFile);

        const uploadRes = await fetch(`${API_BASE}/v1/chat/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${staffToken}` },
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || !uploadData.success) {
          setErrorMsg(uploadData.error || 'Failed to upload attachment.');
          setSending(false);
          setUploadingAttachment(false);
          return;
        }
        uploadedAttachments = [uploadData.data];
        setUploadingAttachment(false);
      }

      const res = await fetch(`${API_BASE}/v1/chat/conversations/${activeConversationId}/messages`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          content: messageText.trim(),
          attachments: uploadedAttachments,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        // Emit via socket for instant peer delivery
        socketRef.current?.emit('message:send', {
          conversationId: activeConversationId,
          message: data.data,
        });

        // Add to local message list immediately
        setMessages((prev) => [...prev, data.data]);
        setMessageText('');
        setSelectedFile(null);
        scrollToBottom();
      } else {
        setErrorMsg(data.error || 'Failed to send message.');
      }
    } catch {
      setErrorMsg('Connection error sending message.');
    } finally {
      setSending(false);
      setUploadingAttachment(false);
    }
  };

  // Filtered staff directory
  const filteredDirectory = staffDirectory.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.roleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesOnline = onlineOnly ? u.isOnline : true;
    return matchesSearch && matchesOnline;
  });

  // Filtered conversations
  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const name = c.participant?.name || c.title || '';
    const email = c.participant?.email || '';
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="h-[calc(100vh-135px)] flex flex-col bg-[#FAF9F5] rounded-2xl border border-[#EAE6DD] shadow-xs overflow-hidden">
      {/* Top Header Banner */}
      <div className="px-6 py-3.5 bg-[#FFFDF9] border-b border-[#EAE6DD] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1B365D] via-[#7C3AED] to-[#0084D1] text-white flex items-center justify-center shadow-xs">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[#1B365D] flex items-center gap-2">
              ETaxwala Internal Staff Messenger
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live WebSocket
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Direct peer-to-peer internal communications across all 16 departments
            </p>
          </div>
        </div>

        {/* View Switcher & Super Admin Compliance Link */}
        <div className="flex items-center gap-2">
          {isSuperAdmin && (
            <button
              onClick={() => {
                setActiveTab(activeTab === 'audit' ? 'conversations' : 'audit');
                if (activeTab !== 'audit') loadAuditConversations();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'audit'
                  ? 'bg-[#1B365D] text-white shadow-xs'
                  : 'bg-[#FAF9F5] border border-[#EAE6DD] text-[#1B365D] hover:bg-slate-100'
              }`}
              id="admin-audit-toggle"
            >
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              Super Admin Audit Log
            </button>
          )}

          <button
            onClick={() => {
              loadConversations();
              loadStaffDirectory();
            }}
            className="p-2 rounded-xl bg-[#FAF9F5] border border-[#EAE6DD] text-slate-600 hover:text-slate-900 transition-colors"
            title="Refresh Conversations"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* ─── LEFT COLUMN: Chat List / Directory ─────────────────────────── */}
        <div className="w-80 md:w-96 bg-[#FFFDF9] border-r border-[#EAE6DD] flex flex-col shrink-0">
          {/* Search and Tabs */}
          <div className="p-3 border-b border-[#EAE6DD] space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search staff, role, department..."
                className="w-full pl-9 pr-3 py-1.5 bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#7C3AED]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex bg-[#FAF9F5] p-0.5 rounded-xl border border-[#EAE6DD]">
                <button
                  onClick={() => setActiveTab('conversations')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    activeTab === 'conversations'
                      ? 'bg-[#1B365D] text-white shadow-xs'
                      : 'text-slate-600 hover:text-[#1B365D]'
                  }`}
                >
                  Chats ({conversations.length})
                </button>
                <button
                  onClick={() => setActiveTab('directory')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    activeTab === 'directory'
                      ? 'bg-[#1B365D] text-white shadow-xs'
                      : 'text-slate-600 hover:text-[#1B365D]'
                  }`}
                >
                  All Staff ({staffDirectory.length})
                </button>
              </div>

              {/* Online filter checkbox */}
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlineOnly}
                  onChange={(e) => setOnlineOnly(e.target.checked)}
                  className="rounded text-[#7C3AED] focus:ring-[#7C3AED]"
                />
                Online Only
              </label>
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#EAE6DD]/50">
            {activeTab === 'conversations' ? (
              loadingConversations ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading chats...</div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <Users className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-bold text-slate-600">No conversations yet</p>
                  <p className="text-[11px] text-slate-400">
                    Switch to the "All Staff" tab to start a direct message with any team member.
                  </p>
                  <button
                    onClick={() => setActiveTab('directory')}
                    className="btn btn-primary text-xs py-1.5 px-3"
                  >
                    View Staff Directory
                  </button>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = activeConversationId === conv.id;
                  const participant = conv.participant;
                  const name = participant?.name || conv.title || 'Staff Member';
                  const isOnline = participant?.isOnline || false;

                  return (
                    <button
                      key={conv.id}
                      onClick={() => openConversation(Number(conv.id), participant)}
                      className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors ${
                        isSelected
                          ? 'bg-blue-50/70 border-l-4 border-[#1B365D]'
                          : 'hover:bg-[#FAF9F5]'
                      }`}
                    >
                      {/* Avatar with Presence Ring */}
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1B365D] to-[#0084D1] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                            isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                          title={isOnline ? 'Online' : 'Offline'}
                        />
                      </div>

                      {/* Conversation Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{name}</h4>
                          {conv.lastMessage && (
                            <span className="text-[10px] text-slate-400">
                              {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          )}
                        </div>

                        {participant && (
                          <div className="flex flex-wrap gap-1 mb-1">
                            {participant.roles?.map((r) => (
                              <span
                                key={r}
                                className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#7C3AED]/10 text-[#7C3AED]"
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <p className="text-[11px] text-slate-500 truncate max-w-[190px]">
                            {conv.lastMessage ? conv.lastMessage.content || '📎 Attachment' : 'No messages yet'}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E11D48] text-white">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )
            ) : (
              /* All Staff Directory */
              filteredDirectory.map((user) => (
                <div
                  key={user.id}
                  className="p-3 flex items-center justify-between hover:bg-[#FAF9F5] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0084D1] to-[#7C3AED] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                          user.isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                        {user.name}
                        {user.isOnline && (
                          <span className="text-[9px] font-bold text-emerald-600">Online</span>
                        )}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {user.roles?.map((r) => (
                          <span
                            key={r}
                            className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-slate-100 text-slate-700"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {!user.isSelf && (
                    <button
                      onClick={() => startDirectChat(user)}
                      className="px-2.5 py-1 rounded-xl btn-multicolor text-[10px] font-bold shrink-0"
                    >
                      Message
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* ─── CENTER COLUMN: Active Chat Feed / Messages ─────────────────── */}
        <div className="flex-1 flex flex-col bg-[#FAF9F5] overflow-hidden">
          {activeTab === 'audit' ? (
            /* Super Admin Audit Panel */
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              <div className="bg-[#FFFDF9] border border-[#EAE6DD] rounded-2xl p-4 shadow-xs">
                <h2 className="text-sm font-bold text-[#1B365D] flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#7C3AED]" /> Super Admin Compliance & Internal Chat Audit Log
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Immutable communication logs across all personnel in accordance with company governance policies.
                </p>
              </div>

              {loadingAudit ? (
                <div className="text-center py-12 text-slate-400 text-xs">Loading audit logs...</div>
              ) : (
                <div className="table-crm-wrapper bg-white rounded-2xl border border-[#EAE6DD] overflow-hidden shadow-xs">
                  <table className="table-crm w-full text-xs text-left">
                    <thead className="bg-[#FAF9F5] border-b border-[#EAE6DD] text-slate-600 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Conversation ID</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Participants</th>
                        <th className="p-3">Total Messages</th>
                        <th className="p-3">Last Active</th>
                        <th className="p-3 text-right">Audit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {auditConversations.map((ac) => (
                        <tr key={ac.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-slate-600">#{ac.id}</td>
                          <td className="p-3 font-semibold uppercase text-[10px]">{ac.type}</td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {ac.participants?.map((p: any) => (
                                <span key={p.id} className="px-2 py-0.5 rounded-full bg-slate-100 font-medium">
                                  {p.name} ({p.role})
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-3 font-bold text-slate-700">{ac.totalMessages}</td>
                          <td className="p-3 text-slate-500">
                            {ac.lastMessageAt ? new Date(ac.lastMessageAt).toLocaleString() : 'N/A'}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                setActiveTab('conversations');
                                openConversation(ac.id);
                              }}
                              className="px-2 py-1 rounded-xl btn-multicolor text-[10px] font-bold"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : activeConversationId ? (
            /* Active Conversation View */
            <>
              {/* Conversation Top Header */}
              <div className="px-5 py-3 bg-[#FFFDF9] border-b border-[#EAE6DD] flex items-center justify-between shrink-0 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1B365D] to-[#0084D1] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      {activeParticipant?.name ? activeParticipant.name.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                        activeParticipant?.isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      {activeParticipant?.name || 'Staff Member'}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                          activeParticipant?.isOnline
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {activeParticipant?.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                      <span>{activeParticipant?.email}</span>
                      {activeParticipant?.department && (
                        <>
                          <span>•</span>
                          <span>{activeParticipant.department}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Role tags */}
                <div className="flex items-center gap-1.5">
                  {activeParticipant?.roles?.map((r) => (
                    <span
                      key={r}
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#7C3AED]/10 text-[#7C3AED] border border-[#7C3AED]/20"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                {loadingMessages ? (
                  <div className="text-center py-12 text-xs text-slate-400">Loading conversation history...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-16 space-y-2">
                    <MessageSquare className="w-10 h-10 mx-auto text-slate-300" />
                    <h4 className="text-sm font-bold text-slate-700">Beginning of conversation</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      All messages in this conversation are strictly preserved in compliance with internal audit guidelines.
                    </p>
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isSelf = msg.senderId === staffUser?.id;

                    return (
                      <div
                        key={msg.id || i}
                        className={`flex gap-2.5 ${isSelf ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isSelf && (
                          <div className="w-7 h-7 rounded-lg bg-[#1B365D] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-1">
                            {msg.senderName?.charAt(0).toUpperCase() || 'S'}
                          </div>
                        )}

                        <div className={`max-w-[75%] space-y-1 ${isSelf ? 'items-end' : 'items-start'}`}>
                          {/* Sender name for received messages */}
                          {!isSelf && (
                            <p className="text-[10px] font-bold text-slate-500 ml-1">{msg.senderName}</p>
                          )}

                          {/* Bubble */}
                          <div
                            className={`p-3.5 rounded-2xl shadow-2xs text-xs leading-relaxed ${
                              isSelf
                                ? 'bg-[#1B365D] text-white rounded-tr-xs'
                                : 'bg-[#FFFDF9] border border-[#EAE6DD] text-slate-800 rounded-tl-xs'
                            }`}
                          >
                            {/* Message text content */}
                            {msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}

                            {/* Attachments rendering */}
                            {msg.attachments && msg.attachments.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {msg.attachments.map((att) => {
                                  const isImg = att.mimeType.startsWith('image/');
                                  const fileUrl = `${API_BASE}${att.fileUrl}`;

                                  return (
                                    <div
                                      key={att.id}
                                      className={`p-2 rounded-xl border flex items-center gap-2.5 ${
                                        isSelf
                                          ? 'bg-white/10 border-white/20 text-white'
                                          : 'bg-[#FAF9F5] border-slate-200 text-slate-800'
                                      }`}
                                    >
                                      {isImg ? (
                                        <div className="space-y-1">
                                          <img
                                            src={fileUrl}
                                            alt={att.fileName}
                                            className="max-h-48 rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => window.open(fileUrl, '_blank')}
                                          />
                                          <p className="text-[10px] opacity-80">{att.fileName}</p>
                                        </div>
                                      ) : (
                                        <>
                                          <FileText className="w-5 h-5 text-amber-500 shrink-0" />
                                          <div className="flex-1 min-w-0">
                                            <p className="font-bold truncate text-[11px]">{att.fileName}</p>
                                            <p className="text-[9px] opacity-75">
                                              {(att.fileSize / 1024).toFixed(1)} KB
                                            </p>
                                          </div>
                                          <a
                                            href={fileUrl}
                                            download={att.fileName}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-1 rounded hover:bg-black/10 transition-colors"
                                            title="Download File"
                                          >
                                            <Download className="w-4 h-4" />
                                          </a>
                                        </>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Timestamp & Status */}
                            <div
                              className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                                isSelf ? 'text-white/70' : 'text-slate-400'
                              }`}
                            >
                              <span>
                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              {isSelf && <CheckCheck className="w-3 h-3 text-emerald-400" />}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Attachment Preview Strip before sending */}
              {selectedFile && (
                <div className="px-4 py-2 bg-blue-50/70 border-t border-blue-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <FileText className="w-4 h-4 text-[#7C3AED]" />
                    <span className="font-bold truncate max-w-sm">{selectedFile.name}</span>
                    <span className="text-[10px] text-slate-400">
                      ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="p-1 hover:bg-blue-200 rounded-full text-slate-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Error banner */}
              {errorMsg && (
                <div className="px-4 py-2 bg-rose-50 border-t border-rose-200 text-rose-700 text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" /> {errorMsg}
                  </span>
                  <button onClick={() => setErrorMsg(null)}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Message Composer Form */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 bg-[#FFFDF9] border-t border-[#EAE6DD] flex items-center gap-2 shrink-0"
              >
                {/* File Attachment Input (hidden) */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-[#1B365D] transition-colors shrink-0"
                  title="Attach file (PDF, Doc, Image up to 15MB)"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type an internal message (immutable audit trail)..."
                  className="flex-1 py-2 px-3.5 bg-[#FAF9F5] border border-[#EAE6DD] rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1B365D]"
                />

                <button
                  type="submit"
                  disabled={sending || uploadingAttachment || (!messageText.trim() && !selectedFile)}
                  className="px-4 py-2 rounded-xl btn-multicolor text-xs font-bold disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{uploadingAttachment ? 'Uploading...' : sending ? 'Sending...' : 'Send'}</span>
                </button>
              </form>
            </>
          ) : (
            /* No conversation selected state */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#1B365D] to-[#7C3AED] text-white flex items-center justify-center shadow-md">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Select a staff member or conversation
              </h3>
              <p className="text-xs text-slate-500 max-w-md">
                Communicate securely with team members, share quotation drafts, audit notes, and operations documents in real-time.
              </p>
              <button
                onClick={() => setActiveTab('directory')}
                className="btn btn-primary text-xs py-2 px-4 shadow-sm"
              >
                Browse Staff Directory ({staffDirectory.length} Members)
              </button>
            </div>
          )}
        </div>

        {/* ─── RIGHT DRAWER: Staff Profile & Info ─────────────────────────── */}
        {activeParticipant && activeTab !== 'audit' && (
          <div className="hidden lg:flex w-72 bg-[#FFFDF9] border-l border-[#EAE6DD] flex-col p-5 overflow-y-auto space-y-5 shrink-0">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#1B365D] via-[#7C3AED] to-[#0084D1] text-white flex items-center justify-center font-bold text-xl mx-auto shadow-sm">
                {activeParticipant.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{activeParticipant.name}</h4>
                <p className="text-xs text-slate-400">{activeParticipant.department || 'ETaxwala Team'}</p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className={`w-1.5 h-1.5 rounded-full ${activeParticipant.isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                {activeParticipant.isOnline ? 'Active Online' : 'Currently Offline'}
              </div>
            </div>

            {/* Assigned Roles */}
            <div className="space-y-2 pt-3 border-t border-[#EAE6DD]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Assigned Roles ({activeParticipant.roles?.length || 1})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeParticipant.roles?.map((r) => (
                  <span
                    key={r}
                    className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#1B365D]/5 text-[#1B365D] border border-[#1B365D]/15"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-2 pt-3 border-t border-[#EAE6DD]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Contact Details
              </span>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{activeParticipant.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>ETaxwala Business Solutions</span>
                </div>
              </div>
            </div>

            {/* Compliance Badge */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5 font-bold text-[#1B365D]">
                <Shield className="w-3.5 h-3.5 text-[#7C3AED]" /> Compliance Notice
              </div>
              <p className="text-[10px] leading-tight">
                All staff communications are encrypted and audited per company policy.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
