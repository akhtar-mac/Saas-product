import React, { useState, useEffect, useRef } from 'react';
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
  Clock,
  Award,
  Lock,
  Globe2,
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
  inputType?: 'name' | 'mobile' | 'none';
  isFinalDossier?: boolean;
}

interface ConsultationState {
  language: 'en' | 'hi' | 'mr';
  name: string;
  mobile: string;
  category: string;
  subService: string;
  specifics: string;
}

export default function McqChatbot({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [consultation, setConsultation] = useState<ConsultationState>({
    language: 'en',
    name: '',
    mobile: '',
    category: '',
    subService: '',
    specifics: '',
  });

  const [inputName, setInputName] = useState('');
  const [inputMobile, setInputMobile] = useState('');
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

  // ─── STEP 1: Always ask for Language first ───
  const initChat = () => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages([
        {
          id: 'welcome-lang',
          sender: 'bot',
          text: '🙏 Namaste! Welcome to ETaxwala Advisory Desk.\n\nPlease choose your preferred language / कृपया अपनी भाषा चुनें / कृपया आपली भाषा निवडा:',
          options: [
            {
              label: 'English',
              sublabel: 'Continue in English',
              badge: 'Default',
              value: 'en',
              icon: Globe2,
            },
            {
              label: 'हिंदी (Hindi)',
              sublabel: 'हिंदी में बात करें',
              badge: 'लोकप्रिय',
              value: 'hi',
              icon: Globe2,
            },
            {
              label: 'मराठी (Marathi)',
              sublabel: 'मराठीमध्ये सुरू ठेवा',
              badge: 'महाराष्ट्र',
              value: 'mr',
              icon: Globe2,
            },
          ],
        },
      ]);
      setIsTyping(false);
    }, 350);
  };

  // Helper to persist/update lead in localStorage and API
  const saveLead = (updatedData: Partial<ConsultationState>) => {
    const lead = {
      ...consultation,
      ...updatedData,
      source: 'MCQ Advisory Chatbot',
      updatedAt: new Date().toISOString(),
    };
    try {
      const stored = JSON.parse(localStorage.getItem('etaxwala_leads') || '[]');
      const existingIdx = stored.findIndex(
        (l: any) => l.mobile && l.mobile === lead.mobile
      );
      if (existingIdx >= 0) {
        stored[existingIdx] = { ...stored[existingIdx], ...lead };
      } else {
        stored.unshift(lead);
      }
      localStorage.setItem('etaxwala_leads', JSON.stringify(stored));
    } catch {
      // Graceful fallback
    }

    // Attempt backend dispatch
    try {
      fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
      }).catch(() => {});
    } catch {
      // Graceful fallback
    }
  };

  // ─── STEP 2: When Language is selected -> Ask for Name ───
  const handleLanguageSelect = (lang: 'en' | 'hi' | 'mr', label: string) => {
    const userMsg: ChatMessage = {
      id: `user-lang-${Date.now()}`,
      sender: 'user',
      text: label,
    };
    setMessages((prev) => [...prev, userMsg]);
    setConsultation((prev) => ({ ...prev, language: lang }));
    setIsTyping(true);

    setTimeout(() => {
      let botText = 'Great! To connect you with our Senior Chartered Accountant, may I know your full name?';
      if (lang === 'hi') {
        botText = 'बहुत बढ़िया! हमारे वरिष्ठ चार्टर्ड अकाउंटेंट से जोड़ने के लिए, कृपया अपना पूरा नाम बताएं:';
      } else if (lang === 'mr') {
        botText = 'छान! आमच्या वरिष्ठ चार्टर्ड अकाउंटंटशी जोडण्यासाठी, कृपया आपले पूर्ण नाव सांगा:';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-ask-name-${Date.now()}`,
          sender: 'bot',
          text: botText,
          inputType: 'name',
        },
      ]);
      setIsTyping(false);
    }, 450);
  };

  // ─── STEP 3: User submits Name -> Message him something & Ask for Number ───
  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = inputName.trim();
    if (cleanName.length < 2) return;

    const userMsg: ChatMessage = {
      id: `user-name-${Date.now()}`,
      sender: 'user',
      text: cleanName,
    };
    setMessages((prev) => [...prev, userMsg]);
    setConsultation((prev) => ({ ...prev, name: cleanName }));
    setIsTyping(true);

    const firstName = cleanName.split(' ')[0];
    const lang = consultation.language;

    setTimeout(() => {
      let botText = `Nice to meet you, ${firstName}! 🙏\n\nWhat is your WhatsApp / Mobile number so our Senior CA can share your personalized tax filing plan and consultation details?`;
      if (lang === 'hi') {
        botText = `नमस्ते ${firstName} जी! 🙏\n\nकृपया अपना व्हाट्सएप / मोबाइल नंबर दर्ज करें ताकि हमारे सीनियर सीए आपको परामर्श रिपोर्ट और फीस विवरण भेज सकें:`;
      } else if (lang === 'mr') {
        botText = `नमस्कार ${firstName} जी! 🙏\n\nकृपया आपला व्हॉट्सॲप / मोबाइल नंबर टाका जेणेकरून आमचे वरिष्ठ सीए तुम्हाला सल्ला आणि माहिती पाठवू शकतील:`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-ask-mobile-${Date.now()}`,
          sender: 'bot',
          text: botText,
          inputType: 'mobile',
        },
      ]);
      setIsTyping(false);
    }, 500);
  };

  // ─── STEP 4: User submits Number -> WE HAVE LEADS! -> Show MCQ options ───
  const handleMobileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMobile = inputMobile.replace(/\D/g, '');
    if (cleanMobile.length < 10) return;

    const userMsg: ChatMessage = {
      id: `user-mobile-${Date.now()}`,
      sender: 'user',
      text: `+91 ${cleanMobile}`,
    };
    setMessages((prev) => [...prev, userMsg]);

    const updated = {
      mobile: cleanMobile,
      name: consultation.name,
    };
    setConsultation((prev) => ({ ...prev, mobile: cleanMobile }));

    // SAVE LEAD IMMEDIATELY — Lead is secured right here!
    saveLead(updated);

    setIsTyping(true);
    const firstName = consultation.name.split(' ')[0] || 'there';
    const lang = consultation.language;

    setTimeout(() => {
      let botText = `Thank you, ${firstName}! Your contact details are saved with our CA desk.\n\nNow, select your legal or tax requirement so we can match you with the right specialist:`;
      if (lang === 'hi') {
        botText = `धन्यवाद ${firstName} जी! आपका विवरण सीए डेस्क पर सुरक्षित कर लिया गया है।\n\nअब कृपया अपनी आवश्यकता चुनें ताकि हम आपको सही विशेषज्ञ से जोड़ सकें:`;
      } else if (lang === 'mr') {
        botText = `धन्यवाद ${firstName} जी! तुमची माहिती सीए डेस्कवर सुरक्षित झाली आहे.\n\nआता कृपया आपली सेवा निवडा जेणेकरून आम्ही योग्य सीए नियुक्त करू शकू:`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-categories-${Date.now()}`,
          sender: 'bot',
          text: botText,
          options: getCategoryOptions(lang),
        },
      ]);
      setIsTyping(false);
    }, 550);
  };

  // Category MCQ Options (multi-language labels)
  const getCategoryOptions = (lang: 'en' | 'hi' | 'mr'): ChatOption[] => {
    if (lang === 'hi') {
      return [
        {
          label: 'कंपनी और एलएलपी रजिस्ट्रेशन (Company & LLP)',
          sublabel: 'Private Limited, LLP, OPC, Section 8',
          badge: 'MCA SPICe+',
          value: 'company',
          icon: Building2,
        },
        {
          label: 'इनकम टैक्स रिटर्न फाइलिंग (ITR Filing)',
          sublabel: 'Salaried, Business 44AD/ADA, Capital Gains',
          badge: 'AY 2025-26',
          value: 'itr',
          icon: FileText,
        },
        {
          label: 'जीएसटी रजिस्ट्रेशन और रिटर्न (GST Services)',
          sublabel: 'New registration, GSTR-1/3B, Revocation',
          badge: 'CBIC Compliant',
          value: 'gst',
          icon: Scale,
        },
        {
          label: 'ट्रेडमार्क और ब्रांड सुरक्षा (Trademark & IP)',
          sublabel: 'Brand name, Logo, TM Objection reply',
          badge: 'Govt IP India',
          value: 'trademark',
          icon: ShieldCheck,
        },
        {
          label: 'सीनियर सीए से सीधी सलाह (Direct CA 1-on-1)',
          sublabel: 'IT notice reply, tax audit, appeal hearing',
          badge: 'Senior CA 1-on-1',
          value: 'direct_ca',
          icon: Award,
        },
      ];
    }

    if (lang === 'mr') {
      return [
        {
          label: 'कंपनी आणि एलएलपी नोंदणी (Company & LLP)',
          sublabel: 'Private Limited, LLP, OPC, Section 8',
          badge: 'MCA SPICe+',
          value: 'company',
          icon: Building2,
        },
        {
          label: 'इन्कम टॅक्स रिटर्न फायलिंग (ITR Filing)',
          sublabel: 'Salaried, Business 44AD/ADA, Capital Gains',
          badge: 'AY 2025-26',
          value: 'itr',
          icon: FileText,
        },
        {
          label: 'जीएसटी नोंदणी आणि रिटर्न (GST Services)',
          sublabel: 'New registration, GSTR-1/3B, Revocation',
          badge: 'CBIC Compliant',
          value: 'gst',
          icon: Scale,
        },
        {
          label: 'ट्रेडमार्क आणि ब्रँड संरक्षण (Trademark & IP)',
          sublabel: 'Brand name, Logo, TM Objection reply',
          badge: 'Govt IP India',
          value: 'trademark',
          icon: ShieldCheck,
        },
        {
          label: 'वरिष्ठ सीए सोबत थेट सल्ला (Direct CA 1-on-1)',
          sublabel: 'IT notice reply, tax audit, appeal hearing',
          badge: 'Senior CA 1-on-1',
          value: 'direct_ca',
          icon: Award,
        },
      ];
    }

    // Default English
    return [
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
        badge: 'AY 2025-26',
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
    ];
  };

  // ─── STEP 5: Handle MCQ option clicks ───
  const handleOptionSelect = (option: ChatOption) => {
    // Check if selecting language
    if (!consultation.name && (option.value === 'en' || option.value === 'hi' || option.value === 'mr')) {
      handleLanguageSelect(option.value as 'en' | 'hi' | 'mr', option.label);
      return;
    }

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
        saveLead({ category: option.label });
        routeCategory(option.value);
      } else if (!consultation.subService) {
        setConsultation((prev) => ({ ...prev, subService: option.label }));
        saveLead({ subService: option.label });
        routeSubService(option.value, option.label);
      } else if (!consultation.specifics) {
        setConsultation((prev) => ({ ...prev, specifics: option.label }));
        saveLead({ specifics: option.label });
        routeFinalDossier(option.label);
      }
      setIsTyping(false);
    }, 450);
  };

  // Sub-service routing
  const routeCategory = (val: string) => {
    if (val === 'company') {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-sub-${Date.now()}`,
          sender: 'bot',
          text: 'Under the Companies Act 2013, all incorporations include Name Reservation (RUN), COI, DINs, DSC, PAN, TAN & Bank A/C. Which legal structure fits your business?',
          options: [
            {
              label: 'Private Limited Company (Pvt Ltd)',
              sublabel: 'Required for VC equity funding, ESOPs & 80-IAC tax holiday',
              badge: 'Most Recommended',
              value: 'pvt_ltd',
            },
            {
              label: 'Limited Liability Partnership (LLP)',
              sublabel: 'Zero Dividend Distribution Tax, no audit if turnover < ₹40L',
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
          text: 'Our Tax Department optimizes returns across both Old & New Regimes (Section 115BAC), maximizing refunds under 80C, 80D & HRA. Select your filing profile:',
          options: [
            {
              label: 'Salaried Individual (Form 16 / ITR-1)',
              sublabel: 'HRA claims, multiple employers, home loan interest (Sec 24b)',
              badge: 'ITR-1 / 2',
              value: 'salaried',
            },
            {
              label: 'IT Professionals, Doctors & Freelancers (Sec 44ADA)',
              sublabel: 'Pay tax on just 50% of gross receipts up to ₹75 Lakhs',
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
          text: 'GST registration is mandatory for interstate sales, e-commerce, and entities exceeding ₹20L/₹40L threshold. Select your GST need:',
          options: [
            {
              label: 'New GST Registration with TRN & Approval',
              sublabel: 'Aadhaar e-KYC verified, zero rejection guarantee in 3 days',
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
          text: 'Trademark filings are processed with IP India under Form TM-A with Vienna Codification. Select your IP service:',
          options: [
            {
              label: 'Brand Name / Wordmark Filing (™ Status in 24 hrs)',
              sublabel: 'Pre-filing phonetics search report & multi-class brand safety',
              badge: 'Instant ™ Proof',
              value: 'tm_filing',
            },
            {
              label: 'Trademark Objection Reply (Sec 9 / Sec 11)',
              sublabel: 'Legal drafting by certified IP Advocates within 30 days',
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
        text: `Statutory guidelines for ${label} have been assigned to our CA desk. What is your expected timeframe for dispatch?`,
        advisoryPoints: [
          'Assigned Senior CA with 10+ years corporate experience',
          'Document checklist and filing schedule shared directly',
          'Transparent govt challan receipts with zero hidden fees',
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
        text: 'Our Senior Practice Partners handle tax litigation, scrutiny appeals, and advisory. Please select your consultation urgency:',
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

  const routeFinalDossier = (specificsLabel: string) => {
    setIsCompleted(true);
    const refId = Math.floor(100000 + Math.random() * 900000);

    setMessages((prev) => [
      ...prev,
      {
        id: `bot-final-${Date.now()}`,
        sender: 'bot',
        text: `🎉 Consultation Confirmed! Thank you ${consultation.name}.\n\nReference dossier #${refId} has been generated. A Senior Chartered Accountant from our desk will contact you on +91 ${consultation.mobile} within 5 minutes.`,
        advisoryPoints: [
          `Selected: ${consultation.category || 'Tax & Compliance'} → ${consultation.subService || 'Consultation'}`,
          `Timeframe: ${specificsLabel}`,
          '100% confidential under ICAI Client Privilege guidelines',
        ],
        isFinalDossier: true,
      },
    ]);
  };

  const handleRestart = () => {
    setConsultation({
      language: 'en',
      name: '',
      mobile: '',
      category: '',
      subService: '',
      specifics: '',
    });
    setInputName('');
    setInputMobile('');
    setIsCompleted(false);
    initChat();
  };

  const currentMsg = messages[messages.length - 1];
  const activeInputType = currentMsg?.inputType || 'none';

  return (
    <div className="w-[calc(100vw-1.5rem)] sm:w-[410px] max-w-[410px] h-[540px] max-h-[74vh] sm:max-h-[84vh] bg-[#FFFFFF] rounded-2xl sm:rounded-3xl border border-[#EAE6DD] shadow-2xl flex flex-col overflow-hidden animate-scale-in origin-bottom-right mb-2 select-none z-50">
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
            title="Reset chat"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            title="Close chat"
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
                    <p className="font-medium text-[12.5px] leading-relaxed text-slate-800 whitespace-pre-line">
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

              {/* Interactive Options Cards */}
              {msg.options && isLast && (
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

              {/* Inline Input Form for Name */}
              {msg.inputType === 'name' && isLast && (
                <form
                  onSubmit={handleNameSubmit}
                  className="w-full pl-8 space-y-2 pt-1 animate-scale-in"
                >
                  <div className="flex items-center gap-2 bg-white rounded-xl border border-[#EAE6DD] p-1.5 focus-within:border-[#7C3AED] focus-within:ring-2 focus-within:ring-[#7C3AED]/20 shadow-xs">
                    <User className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
                    <input
                      type="text"
                      autoFocus
                      required
                      placeholder={
                        consultation.language === 'hi'
                          ? 'अपना पूरा नाम लिखें (उदा. राहुल शर्मा)...'
                          : consultation.language === 'mr'
                          ? 'आपले पूर्ण नाव लिहा (उदा. राहुल शर्मा)...'
                          : 'Enter your full name (e.g. Rahul Sharma)...'
                      }
                      value={inputName}
                      onChange={(e) => setInputName(e.target.value)}
                      className="w-full text-xs font-semibold text-slate-900 focus:outline-none bg-transparent px-1 py-1.5"
                    />
                    <button
                      type="submit"
                      disabled={!inputName.trim()}
                      className="p-2 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white disabled:opacity-40 cursor-pointer shrink-0 transition-colors"
                      title="Submit Name"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              )}

              {/* Inline Input Form for Mobile */}
              {msg.inputType === 'mobile' && isLast && (
                <form
                  onSubmit={handleMobileSubmit}
                  className="w-full pl-8 space-y-2 pt-1 animate-scale-in"
                >
                  <div className="flex items-center gap-2 bg-white rounded-xl border border-[#EAE6DD] p-1.5 focus-within:border-[#7C3AED] focus-within:ring-2 focus-within:ring-[#7C3AED]/20 shadow-xs">
                    <span className="text-xs font-bold text-slate-500 pl-2 pr-2 border-r border-[#EAE6DD] shrink-0">
                      +91
                    </span>
                    <input
                      type="tel"
                      autoFocus
                      required
                      maxLength={10}
                      placeholder="98765 43210"
                      value={inputMobile}
                      onChange={(e) => setInputMobile(e.target.value.replace(/\D/g, ''))}
                      className="w-full text-xs font-bold text-slate-900 focus:outline-none bg-transparent px-1 py-1.5 font-mono tracking-wider"
                    />
                    <button
                      type="submit"
                      disabled={inputMobile.length < 10}
                      className="p-2 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white disabled:opacity-40 cursor-pointer shrink-0 transition-colors"
                      title="Submit Mobile"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                    <span className="flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-400" />
                      100% Confidential
                    </span>
                    <span>Direct CA Callback</span>
                  </div>
                </form>
              )}

              {/* Final Dossier WhatsApp CTA */}
              {msg.isFinalDossier && (
                <div className="w-full pl-8 pt-2 space-y-2 animate-scale-in">
                  <a
                    href={`https://wa.me/918069029999?text=${encodeURIComponent(
                      `Hi ETaxwala! My name is ${consultation.name}, mobile ${consultation.mobile}. I need CA assistance with: ${consultation.category} (${consultation.subService || 'Consultation'}).`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#1EBE59] text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Chat with Assigned CA on WhatsApp Now</span>
                  </a>
                </div>
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
          href="https://wa.me/918069029999?text=Hi%20ETaxwala%20team,%20I%20need%20expert%20CA%20advisory."
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:text-emerald-700 transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>WhatsApp CA Desk</span>
        </a>

        <span className="text-slate-300">•</span>

        <a
          href="tel:08069029999"
          className="flex items-center gap-1.5 hover:text-[#0084D1] transition-colors"
        >
          <Phone className="w-3.5 h-3.5 text-[#0084D1]" />
          <span>080-6902-9999</span>
        </a>
      </div>
    </div>
  );
}
