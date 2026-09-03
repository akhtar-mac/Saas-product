import { useState, useEffect, useRef } from 'react';
import {
  X,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Send,
  Phone,
  CheckCircle2,
  Building2,
  FileText,
  Scale,
  ShieldCheck,
  User,
  Loader2,
  MessageCircle,
  HelpCircle,
  Clock,
  Award,
} from 'lucide-react';

interface ChatOption {
  label: string;
  sublabel?: string;
  badge?: string;
  value: string;
  icon?: any;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  advisoryPoints?: string[];
  options?: ChatOption[];
  isLeadForm?: boolean;
}

interface ConsultationState {
  category: string;
  subService: string;
  specifics: string;
  name: string;
  mobile: string;
}

export default function McqChatbot({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [consultation, setConsultation] = useState<ConsultationState>({
    category: '',
    subService: '',
    specifics: '',
    name: '',
    mobile: '',
  });

  const [formName, setFormName] = useState('');
  const [formMobile, setFormMobile] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    initChat();
  }, []);

  const initChat = () => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages([
        {
          id: 'welcome',
          sender: 'bot',
          text: 'Welcome to the ETaxwala Advisory Desk. I am your Chartered Accountant practice assistant. Select your practice area to get instant statutory guidelines, fee schedules, and compliance advisory:',
          options: [
            {
              label: 'Company & LLP Incorporation',
              sublabel: 'Private Limited, LLP, OPC, Section 8',
              badge: 'MCA SPICe+',
              value: 'company',
              icon: Building2,
            },
            {
              label: 'Income Tax & Assessment Filing',
              sublabel: 'Salaried, Business 44AD/ADA, Capital Gains',
              badge: 'AY 2024-25',
              value: 'itr',
              icon: FileText,
            },
            {
              label: 'GST Registration & Return Filing',
              sublabel: 'New registration, GSTR-1/3B, Revocation',
              badge: 'CBIC Compliant',
              value: 'gst',
              icon: Scale,
            },
            {
              label: 'Trademark & Intellectual Property',
              sublabel: 'Brand name, Logo, TM Objection reply',
              badge: 'Govt IP India',
              value: 'trademark',
              icon: ShieldCheck,
            },
            {
              label: 'Direct CA Consultation / Scrutiny',
              sublabel: 'IT notice reply, tax audit, appeal hearing',
              badge: 'Senior CA 1-on-1',
              value: 'direct_ca',
              icon: Award,
            },
          ],
        },
      ]);
      setIsTyping(false);
    }, 350);
  };

  const handleOptionSelect = (option: ChatOption) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: option.label,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      if (!consultation.category) {
        setConsultation((prev) => ({ ...prev, category: option.label }));
        routeCategory(option.value);
      } else if (!consultation.subService) {
        setConsultation((prev) => ({ ...prev, subService: option.label }));
        routeSubService(option.value, option.label);
      } else if (!consultation.specifics) {
        setConsultation((prev) => ({ ...prev, specifics: option.label }));
        routeLeadCapture();
      }
      setIsTyping(false);
    }, 450);
  };

  // Step 2: In-depth Sub-service breakdown with statutory facts
  const routeCategory = (val: string) => {
    if (val === 'company') {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-sub-${Date.now()}`,
          sender: 'bot',
          text: 'Under the Companies Act 2013 and MCA guidelines, all incorporations include Name Reservation (RUN), Certificate of Incorporation (COI), DINs, DSC, PAN, TAN & Bank A/C. Which legal structure fits your business goals?',
          options: [
            {
              label: 'Private Limited Company (Pvt Ltd)',
              sublabel: 'Required for VC equity funding, ESOPs & startup tax exemption (80-IAC)',
              badge: 'Most Recommended',
              value: 'pvt_ltd',
            },
            {
              label: 'Limited Liability Partnership (LLP)',
              sublabel: 'Zero Dividend Distribution Tax, no mandatory audit if turnover < ₹40 Lakhs',
              badge: 'Low Compliance',
              value: 'llp',
            },
            {
              label: 'One Person Company (OPC)',
              sublabel: '100% solo founder ownership with corporate legal identity',
              badge: 'Solo Founder',
              value: 'opc',
            },
            {
              label: 'Partnership / Sole Proprietorship',
              sublabel: 'Quick 24-hr setup for micro and traditional local businesses',
              badge: 'Fast Setup',
              value: 'proprietorship',
            },
          ],
        },
      ]);
    } else if (val === 'itr') {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-sub-${Date.now()}`,
          sender: 'bot',
          text: 'Our Tax Department optimizes returns across both Old & New Tax Regimes (Section 115BAC), maximizing legal deductions under 80C, 80D, HRA, and tax-loss harvesting. Select your filing profile:',
          options: [
            {
              label: 'Salaried Individual (Form 16 / ITR-1)',
              sublabel: 'HRA claims, multiple employers, home loan interest (Sec 24b)',
              badge: 'ITR-1 / 2',
              value: 'salaried',
            },
            {
              label: 'IT Professionals, Doctors & Freelancers (Sec 44ADA)',
              sublabel: 'Pay tax on just 50% of gross receipts up to ₹75 Lakhs turnover',
              badge: '50% Flat Relief',
              value: '44ada',
            },
            {
              label: 'Stock Market, Crypto & Real Estate (ITR-2 / ITR-3)',
              sublabel: 'Capital gains, F&O trading audit, tax-loss set-off & carry forward',
              badge: 'Capital Gains',
              value: 'fno_crypto',
            },
            {
              label: 'Income Tax Demand Notice / AIS Mismatch',
              sublabel: 'Notice under Sec 143(1), 139(9) defective return, or Sec 148',
              badge: 'Scrutiny Desk',
              value: 'tax_notice',
            },
          ],
        },
      ]);
    } else if (val === 'gst') {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-sub-${Date.now()}`,
          sender: 'bot',
          text: 'GST registration is mandatory for interstate sales, e-commerce sellers, and entities exceeding ₹20L/₹40L threshold. Select your GST advisory need:',
          options: [
            {
              label: 'New GST Registration with TRN & Approval',
              sublabel: 'Aadhaar e-KYC verified, zero rejection guarantee within 3 days',
              badge: '3-Day Dispatch',
              value: 'gst_new',
            },
            {
              label: 'Monthly Return Filing (GSTR-1 & 3B)',
              sublabel: 'Automated 2B Input Tax Credit (ITC) reconciliation & mismatch cleanup',
              badge: '100% ITC Match',
              value: 'gst_returns',
            },
            {
              label: 'GST Revocation of Cancellation (Reg-21)',
              sublabel: 'Restoration of suspended GSTIN and penalty waiver submission',
              badge: 'Revocation Desk',
              value: 'gst_revocation',
            },
          ],
        },
      ]);
    } else if (val === 'trademark') {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-sub-${Date.now()}`,
          sender: 'bot',
          text: 'Trademark filings are processed with the Controller General of Patents, Designs & Trademarks under Form TM-A with Vienna Codification. Select your IP service:',
          options: [
            {
              label: 'Brand Name / Wordmark Filing (™ Status in 24 hrs)',
              sublabel: 'Pre-filing phonetics search report & multi-class brand safety',
              badge: 'Instant ™ Proof',
              value: 'tm_filing',
            },
            {
              label: 'Trademark Objection Reply (Sec 9 / Sec 11)',
              sublabel: 'Legal drafting by certified IP Advocates within 30 days deadline',
              badge: 'Legal Defense',
              value: 'tm_objection',
            },
            {
              label: 'Copyright / Patent Registration',
              sublabel: 'Software source code, artistic works, and mechanical patents',
              badge: 'Full IP Shield',
              value: 'copyright',
            },
          ],
        },
      ]);
    } else {
      routeDirectConsult();
    }
  };

  const routeSubService = (_val: string, label: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `bot-plan-${Date.now()}`,
        sender: 'bot',
        text: `Statutory guidelines for ${label} have been matched with our Practice Head. What is your expected timeframe for dispatch?`,
        advisoryPoints: [
          'Assigned Senior CA with 10+ years experience',
          'Document checklist and MCA/Income Tax filing schedule prepared',
          'Transparent govt challan receipts and zero hidden charges',
        ],
        options: [
          {
            label: '⚡ Priority Fast-Track (Within 24–48 Hours)',
            sublabel: 'Immediate review with same-day portal execution',
            badge: 'Urgent',
            value: 'fast_track',
          },
          {
            label: '📅 Standard Processing (3–5 Working Days)',
            sublabel: 'Standard statutory turnaround time with regular updates',
            badge: 'Standard',
            value: 'standard',
          },
          {
            label: '📋 Advisory & Fee Estimate Consultation First',
            sublabel: 'Discuss deliverables and tax structuring with a CA first',
            badge: 'Consult First',
            value: 'exploring',
          },
        ],
      },
    ]);
  };

  const routeDirectConsult = () => {
    setMessages((prev) => [
      ...prev,
      {
        id: `bot-direct-${Date.now()}`,
        sender: 'bot',
        text: 'Our Senior Practice Partners handle high-value tax litigation, business restructurings, M&A due diligence, and search/scrutiny appeals. Please choose your consultation urgency:',
        options: [
          {
            label: 'Immediate Advisory (Same-Day Video / Phone Conference)',
            sublabel: 'With practicing Chartered Accountant / Advocate',
            badge: 'Same-Day Slot',
            value: 'same_day',
          },
          {
            label: 'Scheduled Advisory Session this week',
            sublabel: 'Review balance sheet, capital structure, or notice draft',
            badge: 'Flexible Slot',
            value: 'this_week',
          },
        ],
      },
    ]);
  };

  const routeLeadCapture = () => {
    setMessages((prev) => [
      ...prev,
      {
        id: `bot-lead-${Date.now()}`,
        sender: 'bot',
        text: 'Thank you. Your dossier has been routed to our Senior CA desk. Please enter your full name and mobile number to receive your formal consultation plan & fee quote:',
        isLeadForm: true,
      },
    ]);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || formMobile.replace(/\D/g, '').length < 10) return;

    setIsSubmitting(true);
    const finalPayload = {
      ...consultation,
      name: formName.trim(),
      mobile: formMobile.replace(/\D/g, ''),
      source: 'Professional Advisory Chatbot',
      createdAt: new Date().toISOString(),
    };

    try {
      const stored = JSON.parse(localStorage.getItem('etaxwala_leads') || '[]');
      stored.unshift(finalPayload);
      localStorage.setItem('etaxwala_leads', JSON.stringify(stored));
    } catch {
      // Graceful fallback
    }

    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPayload),
      });
    } catch {
      // Graceful fallback
    }

    setIsSubmitting(false);
    setIsCompleted(true);

    setMessages((prev) => [
      ...prev,
      {
        id: `bot-success-${Date.now()}`,
        sender: 'bot',
        text: `Consultation Confirmed! Thank you ${formName.trim()}. Reference dossier #${Math.floor(
          100000 + Math.random() * 900000
        )} has been generated. A Senior Chartered Accountant from our desk will contact you on +91 ${formMobile} within 5 minutes.`,
        advisoryPoints: [
          'Pre-call tax calculation & checklist sent to your number',
          '100% confidential under ICAI Client Privilege guidelines',
          'Direct dial assistance active on 1800-TAX-WALA',
        ],
      },
    ]);
  };

  const handleRestart = () => {
    setConsultation({
      category: '',
      subService: '',
      specifics: '',
      name: '',
      mobile: '',
    });
    setFormName('');
    setFormMobile('');
    setIsCompleted(false);
    initChat();
  };

  return (
    <div className="w-[350px] sm:w-[410px] h-[560px] max-h-[82vh] bg-[#FFFFFF] rounded-3xl border border-[#EAE6DD] shadow-2xl flex flex-col overflow-hidden animate-scale-in origin-bottom-right mb-2 select-none z-50">
      {/* Executive Professional Header */}
      <div className="px-4 py-3.5 bg-[#FAF9F5] border-b border-[#EAE6DD] flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-xs shadow-xs">
              CA
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-2 border-white" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-extrabold text-slate-900 tracking-tight">
                ETaxwala Advisory Desk
              </h4>
              <span className="px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200 text-[9px] font-bold text-slate-700">
                Official
              </span>
            </div>
            <p className="text-[10.5px] font-semibold text-slate-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Senior Practicing CAs Active
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleRestart}
            title="Reset consultation"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            title="Close desk"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FFFDF9]/60 scroll-smooth">
        {messages.map((msg, index) => {
          const isLast = index === messages.length - 1;

          if (msg.sender === 'user') {
            return (
              <div key={msg.id} className="flex justify-end animate-fade-in">
                <div className="max-w-[85%] rounded-2xl rounded-tr-xs bg-slate-900 text-white px-3.5 py-2.5 text-xs font-semibold shadow-xs">
                  {msg.text}
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className="flex flex-col gap-2.5 items-start animate-fade-in">
              <div className="flex items-start gap-2.5 max-w-[95%]">
                <div className="w-6 h-6 rounded-md bg-[#FAF9F5] border border-[#EAE6DD] text-slate-700 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                  CA
                </div>
                <div className="space-y-2">
                  <div className="rounded-2xl rounded-tl-xs bg-white p-3.5 border border-[#EAE6DD] text-xs text-slate-800 shadow-2xs leading-relaxed">
                    <p className="font-medium text-[12.5px] leading-relaxed text-slate-800">
                      {msg.text}
                    </p>

                    {/* Advisory Key Points */}
                    {msg.advisoryPoints && (
                      <div className="mt-2.5 pt-2 border-t border-[#F0ECE1] space-y-1.5">
                        {msg.advisoryPoints.map((pt, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{pt}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Interactive MCQ Cards */}
              {msg.options && isLast && !isCompleted && (
                <div className="w-full pl-8 space-y-2 pt-1 animate-scale-in">
                  {msg.options.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleOptionSelect(opt)}
                        className="w-full text-left p-3 rounded-2xl bg-white hover:bg-[#FAF9F5] border border-[#EAE6DD] hover:border-[#7C3AED]/60 transition-all shadow-2xs hover:shadow-xs group cursor-pointer flex flex-col gap-1"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {Icon && (
                              <Icon className="w-4 h-4 text-slate-700 group-hover:text-[#7C3AED] transition-colors shrink-0" />
                            )}
                            <span className="text-xs font-extrabold text-slate-900 group-hover:text-[#7C3AED] transition-colors">
                              {opt.label}
                            </span>
                          </div>

                          {opt.badge && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200/80 text-[9px] font-bold text-slate-600 group-hover:bg-purple-50 group-hover:text-[#7C3AED] group-hover:border-purple-200 transition-colors">
                              {opt.badge}
                            </span>
                          )}
                        </div>

                        {opt.sublabel && (
                          <p className="text-[11px] text-slate-600 leading-snug pl-0.5">
                            {opt.sublabel}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Lead Capture Form */}
              {msg.isLeadForm && isLast && !isCompleted && (
                <form
                  onSubmit={handleLeadSubmit}
                  className="w-full pl-8 space-y-2.5 pt-1 animate-scale-in"
                >
                  <div className="input__container !p-2.5 !gap-1">
                    <label className="input__label !text-[10px]">
                      <User className="w-3 h-3 text-[#0084D1]" />
                      <span>Full Name</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vikramaditya Rao"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="itchy-input !py-2 !px-3 !text-xs"
                      autoFocus
                    />
                  </div>

                  <div className="input__container !p-2.5 !gap-1">
                    <label className="input__label !text-[10px]">
                      <Phone className="w-3 h-3 text-[#7C3AED]" />
                      <span>Mobile / WhatsApp Number</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-xs font-bold text-slate-500">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="98765 43210"
                        value={formMobile}
                        onChange={(e) => setFormMobile(e.target.value.replace(/\D/g, ''))}
                        className="itchy-input !pl-10 !py-2 !px-3 !text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-panda w-full py-2.5 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating Consultation Dossier...</span>
                      </>
                    ) : (
                      <>
                        <span>Connect with Senior CA</span>
                        <ArrowRight className="w-3.5 h-3.5 btn-panda-icon" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 pl-1 animate-fade-in">
            <div className="w-6 h-6 rounded-md bg-[#FAF9F5] border border-[#EAE6DD] text-slate-700 flex items-center justify-center text-[10px] font-black shrink-0">
              CA
            </div>
            <div className="px-3 py-2 rounded-2xl bg-white border border-[#EAE6DD] flex items-center gap-1 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-700 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#0084D1] animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-bounce" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Professional Direct Connect Footer */}
      <div className="px-4 py-2.5 bg-[#FAF9F5] border-t border-[#EAE6DD] flex items-center justify-between text-[11px] font-bold text-slate-700">
        <a
          href="https://wa.me/917071070707?text=Hi%20ETaxwala%20team,%20I%20need%20expert%20CA%20advisory."
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:text-emerald-700 transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>WhatsApp CA Desk</span>
        </a>

        <span className="text-slate-300">•</span>

        <a
          href="tel:+917071070707"
          className="flex items-center gap-1.5 hover:text-[#0084D1] transition-colors"
        >
          <Phone className="w-3.5 h-3.5 text-[#0084D1]" />
          <span>+91 70710 70707</span>
        </a>
      </div>
    </div>
  );
}
