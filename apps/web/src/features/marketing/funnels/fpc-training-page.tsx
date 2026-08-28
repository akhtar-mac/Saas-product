import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Video, FileText, Award, Users, Calendar, Clock,
  Sparkles, ChevronDown, Loader2, BookOpen, ShieldCheck, ArrowRight,
  TrendingUp, PhoneCall, HelpCircle
} from 'lucide-react';
import SEO from '@/components/seo';
import Breadcrumbs from '@/components/breadcrumbs';

const FPC_FAQS = [
  {
    q: 'हा FPC कोर्स कोणासाठी उपयुक्त आहे? (Who is this course for?)',
    a: 'हा कोर्स शेतकरी उत्पादक कंपनी (FPC) चे संचालक (Directors), प्रमोटर्स, कृषी पदवीधर, शेतकरी गट नेते आणि कृषी व्यवसाय सुरू करू इच्छिणाऱ्या प्रत्येकासाठी डिझाइन केला आहे.',
  },
  {
    q: 'ट्रेनिंगचे माध्यम काय असेल? (What is the medium of instruction?)',
    a: 'हे संपूर्ण प्रशिक्षण सोप्या आणि स्पष्ट मराठी भाषेत (In Marathi) लाईव्ह झूम (Zoom) वर घेतले जाईल. सर्व महत्त्वाच्या कायदेशीर व व्यावसायिक संकल्पनांचे मराठीत स्पष्टीकरण दिले जाईल.',
  },
  {
    q: 'लाईव्ह क्लास चुकल्यास रेकॉर्डिंग मिळेल का? (Will I get class recordings?)',
    a: 'होय! प्रत्येक सेशन संपल्यानंतर 24 तासांच्या आत तुम्हाला त्या सेशनची रेकॉर्डिंग आणि स्टडी मटेरिअल आमच्या लर्निंग पोर्टलवर लाईफटाईम ॲक्सेससह दिले जाईल.',
  },
  {
    q: 'FPC नोंदणी व शासकीय अनुदानाबाबत (Government Subsidies) मार्गदर्शन मिळेल का?',
    a: 'होय! SFAC, NABARD, SMART योजना, केंद्र व राज्य शासनाचे विविध प्रकल्प अनुदान (Grants up to ₹15 Lakhs) आणि बँक लोन प्रपोजल कसे तयार करावे, याचे सविस्तर प्रॅक्टिकल मार्गदर्शन दिले जाईल.',
  },
  {
    q: 'कोर्स पूर्ण झाल्यावर प्रमाणपत्र (Certificate) मिळेल का?',
    a: 'होय, 10 दिवसांचे प्रशिक्षण पूर्ण झाल्यावर ETaxwala Academy तर्फे डिजिटल व्हेरिफायड Certificate of Completion प्रदान केले जाईल.',
  },
  {
    q: 'ट्रेनिंग नंतर काही अडचण आल्यास सपोर्ट मिळेल का? (Post Training Support)',
    a: 'होय! सर्व सहभागींना आमच्या एक्सक्लुझिव्ह व्हॉट्सॲप व टेलिग्राम कम्युनिटीमध्ये लाईफटाईम ॲक्सेस मिळतो, जिथे तुम्ही थेट आमच्या सीए (CA) व कृषी तज्ञांशी चर्चा करू शकता.',
  },
];

const schema = z.object({
  name: z.string().min(1, 'नाव आवश्यक आहे (Name is required)'),
  mobile: z.string().min(10, '१० अंकी मोबाईल नंबर आवश्यक (10-digit mobile required)'),
  email: z.string().email('योग्य ईमेल आयडी आवश्यक (Valid email required)'),
  city: z.string().min(1, 'जिल्हा / शहर आवश्यक (City/District required)'),
  fpc_name: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const CUSTOMER_API = 'https://customer-api.etaxwala.com/api';

export default function FPCTrainingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Countdown timer state for next batch
  const [timeLeft, setTimeLeft] = useState({
    days: 4,
    hours: 14,
    minutes: 32,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setStatus('loading');
    try {
      const res = await fetch(`${CUSTOMER_API}/add-inquiry-lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          contact: data.mobile,
          city: data.city,
          state: 'Maharashtra',
          service: 'FPC Training Program',
          message: `FPC Name: ${data.fpc_name || 'New'}. Registered for 10-day Marathi Masterclass batch.`,
          consent: true,
        }),
      });
      if (res.ok) {
        setStatus('success');
        reset();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      <SEO
        title="FPC Business Training Program — Farmer to Founder Masterclass"
        description="10-day live online Farmer Producer Company (FPC) training in Marathi. Learn ROC compliance, NABARD subsidies, business planning & marketing. ₹3,999 only."
        url="/fpc-training"
        keywords="FPC training, farmer producer company, Marathi agri training, SFAC subsidy, NABARD FPC loan, smart project maharashtra, CA training"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'Course',
          name: 'Farmer to Founder: FPC Masterclass in Marathi',
          description: 'Comprehensive 10-day live masterclass on operating and monetizing Farmer Producer Companies in India.',
          provider: {
            '@type': 'Organization',
            name: 'ETaxwala Academy',
          },
          offers: {
            '@type': 'Offer',
            price: '3999',
            priceCurrency: 'INR',
          },
        }}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 py-16 lg:py-24 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none"
             style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="container-etaxwala relative z-10">
          <div className="mb-4">
            <Breadcrumbs items={[{ label: 'FPC Training' }]} className="text-emerald-300" />
          </div>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" /> १० दिवसांचा प्रॅक्टिकल ऑनलाईन कोर्स
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.18]">
              शेतकरी ते उद्योजक: <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">FPC बिझनेस ट्रेनिंग प्रोग्राम</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-emerald-100/90 leading-relaxed">
              तुमची शेतकरी उत्पादक कंपनी (Farmer Producer Company) यशस्वीपणे चालवा, सरकारी अनुदान (Subsidies) मिळवा आणि थेट नफा कमवा. संपूर्ण मार्गदर्शन सोप्या मराठीत.
            </p>

            {/* Countdown Badge */}
            <div className="mt-6 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 inline-block">
              <p className="text-xs uppercase font-bold text-amber-300 tracking-wider mb-2">नवीन बॅच सुरू होण्यास शिल्लक वेळ:</p>
              <div className="flex items-center gap-3 text-center">
                <div className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-white/10">
                  <span className="text-xl font-bold text-white">{timeLeft.days}</span>
                  <span className="block text-[10px] text-slate-400">दिवस</span>
                </div>
                <span className="text-lg font-bold text-white/50">:</span>
                <div className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-white/10">
                  <span className="text-xl font-bold text-white">{timeLeft.hours}</span>
                  <span className="block text-[10px] text-slate-400">तास</span>
                </div>
                <span className="text-lg font-bold text-white/50">:</span>
                <div className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-white/10">
                  <span className="text-xl font-bold text-white">{timeLeft.minutes}</span>
                  <span className="block text-[10px] text-slate-400">मिनिटे</span>
                </div>
                <span className="text-lg font-bold text-white/50">:</span>
                <div className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-white/10">
                  <span className="text-xl font-bold text-white">{timeLeft.seconds}</span>
                  <span className="block text-[10px] text-slate-400">सेकंद</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Batch Details Bar (1.11.4) */}
      <section className="bg-slate-900 text-white py-5 border-y border-slate-800">
        <div className="container-etaxwala">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center md:text-left divide-y md:divide-y-0 md:divide-x divide-slate-800">
            <div className="pt-2 md:pt-0">
              <p className="text-[11px] text-slate-400 uppercase font-bold">माध्यम / Platform</p>
              <p className="text-sm font-bold text-white flex items-center justify-center md:justify-start gap-1.5 mt-0.5">
                <Video className="w-4 h-4 text-emerald-400" /> Live Zoom + Recordings
              </p>
            </div>
            <div className="pt-2 md:pt-0 md:pl-6">
              <p className="text-[11px] text-slate-400 uppercase font-bold">भाषा / Language</p>
              <p className="text-sm font-bold text-white flex items-center justify-center md:justify-start gap-1.5 mt-0.5">
                <BookOpen className="w-4 h-4 text-amber-400" /> सोपी मराठी (Marathi)
              </p>
            </div>
            <div className="pt-2 md:pt-0 md:pl-6">
              <p className="text-[11px] text-slate-400 uppercase font-bold">वेळ / Timing</p>
              <p className="text-sm font-bold text-white flex items-center justify-center md:justify-start gap-1.5 mt-0.5">
                <Clock className="w-4 h-4 text-blue-400" /> 07:30 PM – 09:00 PM
              </p>
            </div>
            <div className="pt-2 md:pt-0 md:pl-6">
              <p className="text-[11px] text-slate-400 uppercase font-bold">कालावधी / Duration</p>
              <p className="text-sm font-bold text-white flex items-center justify-center md:justify-start gap-1.5 mt-0.5">
                <Calendar className="w-4 h-4 text-purple-400" /> 10 दिवस (Daily 1.5 Hrs)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content & Registration Form */}
      <section className="section bg-slate-50 dark:bg-slate-950 py-16">
        <div className="container-etaxwala max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-12">
            
            {/* Left: What You Learn */}
            <div className="lg:col-span-7 space-y-8">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">कोर्समध्ये काय शिकायला मिळेल?</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { title: 'FPC स्थापना व ROC कायदे', desc: 'MCA V3 पोर्टल, MoA-AoA नियम व वार्षिक कंप्लायन्स.' },
                    { title: 'शासकीय अनुदान व योजना', desc: 'SFAC Equity Grant, NABARD Subsidy व SMART प्रोजेक्ट.' },
                    { title: 'DPR व बँक लोन प्रपोजल', desc: 'बँकेसाठी प्रोजेक्ट रिपोर्ट तयार करणे व फायनान्शियल प्लॅनिंग.' },
                    { title: 'अॅग्री कमोडिटी मार्केटिंग', desc: 'थेट विक्री, ब्रँडिंग, पॅकेजिंग व B2B रिटेल नेटवर्क.' },
                    { title: 'जीएसटी व टॅक्सेशन नियम', desc: 'कृषी उत्पादनावरील जीएसटी सूट व सीए ऑडिट प्रोसेस.' },
                    { title: 'लाईव्ह केस स्टडीज', desc: 'महाराष्ट्रातील यशस्वी FPC च्या यशोगाथा व बिझनेस मॉडेल्स.' },
                  ].map((item) => (
                    <div key={item.title} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <h4 className="font-bold text-sm text-emerald-600 dark:text-emerald-400">{item.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inclusions Card */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">प्रशिक्षणासोबत मिळणारे फायदे:</h3>
                <div className="space-y-3">
                  {[
                    '१० दिवसांचे लाईव्ह परस्परसंवादी वर्ग (Live Interactive Sessions)',
                    'सर्व सेशन्सचे व्हिडिओ रेकॉर्डिंग (Lifetime Video Access)',
                    'तयार DPR, बिझनेस प्लॅन फॉरमॅट्स व एक्सेल शीट्स',
                    'प्रशिक्षण पूर्ण केल्याचे डिजिटल प्रमाणपत्र (Verified Certificate)',
                    'तज्ज्ञ सीए आणि कृषी सल्लागारांकडून ३ महिने विनामूल्य मदत',
                  ].map((text, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Registration Form (1.11.6) */}
            <div className="lg:col-span-5">
              <div className="sticky top-24 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-emerald-500 shadow-xl space-y-6">
                <div className="text-center border-b border-slate-100 dark:border-slate-800 pb-5">
                  <span className="text-[11px] font-extrabold uppercase px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                    प्रवेश सुरू आहे (Limited Seats)
                  </span>
                  <div className="mt-3 flex items-baseline justify-center gap-2">
                    <span className="text-4xl font-extrabold text-slate-900 dark:text-slate-100">₹३,९९९</span>
                    <span className="text-base text-slate-400 line-through">₹४,९९९</span>
                    <span className="text-xs font-bold text-emerald-600">(₹१,००० सूट)</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">सर्व १० दिवस + रेकॉर्डिंग्ज + सर्टिफिकेट समाविष्ट</p>
                </div>

                {status === 'success' ? (
                  <div className="text-center py-6 space-y-3">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">नोंदणी यशस्वी झाली!</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      आमची टीम तुम्हाला व्हॉट्सॲप आणि फोनवर संपर्क करून झूम लिंक व पेमेंट डिटेल्स पाठवेल.
                    </p>
                    <button
                      onClick={() => setStatus('idle')}
                      className="text-xs text-emerald-600 font-bold hover:underline"
                    >
                      दुसऱ्या सदस्याची नोंदणी करा
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        पूर्ण नाव (Full Name) *
                      </label>
                      <input
                        {...register('name')}
                        placeholder="तुमचे नाव टाका"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                      {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name.message}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        मोबाईल / व्हॉट्सॲप नंबर *
                      </label>
                      <input
                        {...register('mobile')}
                        placeholder="१० अंकी फोन नंबर"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                      {errors.mobile && <p className="mt-1 text-xs text-rose-500">{errors.mobile.message}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        ईमेल आयडी (Email) *
                      </label>
                      <input
                        {...register('email')}
                        type="email"
                        placeholder="example@gmail.com"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                      {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        जिल्हा / तालुका (District/City) *
                      </label>
                      <input
                        {...register('city')}
                        placeholder="उदा. पुणे / छत्रपती संभाजीनगर"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                      {errors.city && <p className="mt-1 text-xs text-rose-500">{errors.city.message}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        FPC चे नाव (असल्यास)
                      </label>
                      <input
                        {...register('fpc_name')}
                        placeholder="तुमच्या कंपनीचे नाव (ऐच्छिक)"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {status === 'loading' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> नोंदणी होत आहे...
                        </>
                      ) : (
                        <>
                          <span>सीट बुक करा (Book Seat Now)</span> <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    {status === 'error' && (
                      <p className="text-center text-xs text-rose-500 font-medium">
                        काही तांत्रिक अडचण आली आहे. कृपया थेट कॉल करा: +91 70710 70707
                      </p>
                    )}
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 1.11.5: FAQ Section in Marathi */}
      <section className="section bg-white dark:bg-slate-900 py-16 border-t border-slate-200 dark:border-slate-800">
        <div className="container-etaxwala max-w-3xl">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">वारंवार विचारले जाणारे प्रश्न</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">शंका व निरसन (FAQs)</h2>
          </div>
          <div className="space-y-3">
            {FPC_FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-800/40">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 hover:text-emerald-600"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-emerald-600' : 'text-slate-400'}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-200/60 dark:border-slate-700/60 pt-3">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}