import React, { useState } from 'react';
import {
  LifeBuoy,
  MessageSquare,
  Plus,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  Phone,
  Mail,
  X,
} from 'lucide-react';

export default function ClientSupportPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'CA Pooja Kulkarni (Specialist)',
      isStaff: true,
      time: '11 Aug 2026, 11:35 AM',
      text: 'Hello Rajesh ji! Welcome to ETaxwala. I will be handling your Private Limited Company incorporation. Please let me know if you have any questions regarding your name search or MOA drafting.',
    },
    {
      id: 2,
      sender: 'You',
      isStaff: false,
      time: '12 Aug 2026, 02:10 PM',
      text: 'Thank you Pooja ji. I have uploaded the electricity bill for the registered office. Please confirm if that format is acceptable for MCA.',
    },
    {
      id: 3,
      sender: 'CA Pooja Kulkarni (Specialist)',
      isStaff: true,
      time: '12 Aug 2026, 03:00 PM',
      text: 'Yes, the office utility bill is perfectly verified. We are now awaiting the 2nd Director address proof to submit SPICe+ Part B.',
    },
  ]);

  const tickets = [
    {
      id: 'TCK-902',
      subject: 'Clarification on RUN Name Search Timeline',
      category: 'Service Query',
      createdAt: '11 Aug 2026',
      status: 'Resolved',
    },
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: 'You',
        isStaff: false,
        time: 'Just now',
        text: chatMessage.trim(),
      },
    ]);
    setChatMessage('');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-brand-navy">
              Support & CA Specialist Chat
            </h1>
            <span className="badge badge-gold">Direct CA Line</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Directly communicate with your assigned Chartered Accountant and track resolution tickets.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary btn-sm"
        >
          <Plus className="w-3.5 h-3.5" /> Raise New Ticket
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Chat with Specialist (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[560px] overflow-hidden">
          <div className="p-4 bg-[#F7F8FA] border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand-navy text-white flex items-center justify-center font-bold text-xs">
                PK
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">
                  CA Pooja Kulkarni (Senior Case Specialist)
                </h4>
                <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online • In-Charge
                </p>
              </div>
            </div>

            <div className="text-right text-xs">
              <a
                href="tel:+919123456789"
                className="font-bold text-brand-navy hover:underline inline-flex items-center gap-1"
              >
                <Phone className="w-3.5 h-3.5" /> Call Desk
              </a>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F7F8FA]/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.isStaff ? 'items-start' : 'items-end'}`}
              >
                <span className="text-[10px] text-slate-400 font-medium mb-1 px-1">
                  {msg.sender} • {msg.time}
                </span>
                <div
                  className={`max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.isStaff
                      ? 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-sm'
                      : 'bg-brand-navy text-white rounded-tr-none shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Send Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Type your message or question for CA Pooja..."
              className="input flex-1 text-xs"
            />
            <button type="submit" className="btn btn-primary btn-sm">
              <Send className="w-3.5 h-3.5" /> Send
            </button>
          </form>
        </div>

        {/* Tickets & Support Contact Info (1 Col) */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h4 className="font-display font-bold text-sm text-slate-800">
              Support Tickets
            </h4>

            <div className="space-y-2.5">
              {tickets.map((tck) => (
                <div
                  key={tck.id}
                  className="p-3 rounded-xl bg-[#F7F8FA] border border-slate-200/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-brand-navy">
                      {tck.id}
                    </span>
                    <span className="badge badge-green text-[10px]">{tck.status}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">
                    {tck.subject}
                  </p>
                  <span className="text-[10px] text-slate-400 block">{tck.createdAt}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#FFFDF9] border border-[#EAE6DD] p-6 rounded-3xl space-y-3 shadow-xs relative overflow-hidden">
            <div className="h-0.5 w-10 bg-multicolor rounded-full" />
            <h4 className="font-bold text-sm text-slate-900">Central Grievance Helpline</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              If your assigned specialist is unavailable or you require urgent escalation:
            </p>
            <div className="pt-2 border-t border-[#EAE6DD] space-y-1.5 text-xs text-slate-700">
              <p className="font-semibold flex items-center gap-2"><span>📞</span> Toll-Free: 080-6902-9999</p>
              <p className="font-semibold flex items-center gap-2"><span>✉️</span> support@etaxwala.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#FFFDF9] rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-xl border border-[#EAE6DD] space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE6DD] pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Create Support Ticket
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Our central support &amp; compliance officers will respond within 4 hours
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsModalOpen(false);
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject / Query Topic</label>
                <input
                  type="text"
                  placeholder="e.g. Need clarification regarding MOA clause"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#0084D1]/30"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Service Related To
                </label>
                <select className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0084D1]/30">
                  <option>Order #101 - Private Limited Company Registration</option>
                  <option>Order #102 - GST Registration</option>
                  <option>Billing &amp; Payment Query</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Detailed Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe your issue or question in detail..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#0084D1]/30"
                  required
                />
              </div>

              <div className="pt-3 border-t border-[#EAE6DD] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-outline-multicolor btn-sm cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-multicolor btn-sm cursor-pointer text-xs">
                  <span className="relative z-10">Submit Ticket</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
