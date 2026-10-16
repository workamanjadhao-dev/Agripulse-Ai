import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Sprout,
  Mail,
  Lock,
  User,
  MapPin,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Loader2,
  Globe,
  Check,
  Truck
} from 'lucide-react';

// ─── Translations for LoginPage ───────────────────────────────────────────────
const T = {
  en: {
    tagline: 'Agricultural Price & Supply Chain Intelligence',
    headline: "Intelligent Agriculture for India's Farmers & Buyers",
    subtext: 'Sign in to forecast mandi rates, connect with verified buyers, hire farm machinery, and manage bookings.',
    feature1Title: 'Live Agmarknet Price Telemetry',
    feature1Desc: 'Official modal, min & max rates updated direct from APMC mandis across India.',
    feature2Title: 'Gemini AI Price Forecasting',
    feature2Desc: '7, 15, and 30-day projection curves powered by machine learning & arrivals data.',
    feature3Title: 'Direct Farmer-Buyer Matchmaking',
    feature3Desc: 'Zero intermediary commission — direct trade contracts & spot settlements.',
    demoTitle: 'Demo Credentials',
    demoHint: 'Click any card to auto-fill sign-in',
    selectedBadge: 'Active',
    clickToFill: 'Click to select',
    tabSignIn: 'Sign In',
    tabRegister: 'Create Account',
    emailLabel: 'Email Address',
    emailPlaceholder: 'e.g. farmer@agripulse.in',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter your password',
    rememberMe: 'Remember my session',
    signInBtn: 'Sign In to AgriPulse',
    signingIn: 'Authenticating...',
    noAccount: "Don't have an account?",
    registerLink: 'Register here',
    nameLabel: 'Full Name / Business Title',
    namePlaceholder: 'e.g. Ramesh Patel or Vidarbha Agro',
    roleLabel: 'Primary Role',
    locationLabel: 'Location (District & State)',
    locationPlaceholder: 'e.g. Wardha, Maharashtra',
    phoneLabel: 'Contact Number',
    setPassword: 'Set Password',
    confirmPassword: 'Confirm Password',
    registerBtn: 'Create Account',
    registering: 'Creating Account...',
    haveAccount: 'Already registered?',
    signInLink: 'Sign in here',
    farmerRole: '🌾 Farmer (Crop Producer)',
    buyerRole: '🏬 Buyer / Grain Trader',
    ownerRole: '🚜 Fleet / Machinery Owner',
    langLabel: 'Language',
    farmerTitle: 'Farmer',
    buyerTitle: 'Buyer / Trader',
    ownerTitle: 'Fleet Owner',
    adminTitle: 'Platform Admin',
    errFillFields: 'Please fill all required fields.',
    errPasswordLength: 'Password must be at least 6 characters.',
    errPasswordMatch: 'Passwords do not match. Please verify.',
    errEnterCredentials: 'Please enter your email and password.',
    demoFilledToast: 'credentials filled! Click Sign In to enter.',
  },
  hi: {
    tagline: 'कृषि आपूर्ति श्रृंखला और मूल्य पूर्वानुमान',
    headline: 'भारत के किसानों और खरीदारों के लिए आधुनिक डिजिटल कृषि',
    subtext: 'मंडी भाव पूर्वानुमान, सत्यापित खरीदार संपर्क, ट्रैक्टर/मशीनरी बुकिंग और फसल प्रबंधन के लिए साइन इन करें।',
    feature1Title: 'अगमार्कनेट लाइव मंडी भाव',
    feature1Desc: 'एपीएमसी मंडियों से सीधे आधिकारिक मॉडल, न्यूनतम और अधिकतम भाव अपडेट।',
    feature2Title: 'जेमिनी AI मूल्य पूर्वानुमान',
    feature2Desc: '7, 15 और 30 दिन का सटीक भाव अनुमान ऐतिहासिक आवक डेटा पर आधारित।',
    feature3Title: 'सीधा किसान-खरीदार संपर्क',
    feature3Desc: 'बिना किसी दलाल के — सीधे खरीद-बिक्री अनुबंध और त्वरित भुगतान।',
    demoTitle: 'डेमो क्रेडेंशियल',
    demoHint: 'स्वतः भरने के लिए किसी भी कार्ड पर क्लिक करें',
    selectedBadge: 'चयनित',
    clickToFill: 'भरने हेतु क्लिक करें',
    tabSignIn: 'साइन इन',
    tabRegister: 'नया खाता बनाएँ',
    emailLabel: 'ईमेल पता',
    emailPlaceholder: 'उदा. farmer@agripulse.in',
    passwordLabel: 'पासवर्ड',
    passwordPlaceholder: 'अपना पासवर्ड दर्ज करें',
    rememberMe: 'सत्र याद रखें',
    signInBtn: 'AgriPulse में साइन इन करें',
    signingIn: 'सत्यापन हो रहा है...',
    noAccount: 'खाता नहीं है?',
    registerLink: 'यहाँ नया खाता बनाएँ',
    nameLabel: 'पूरा नाम / व्यवसाय का नाम',
    namePlaceholder: 'उदा. रमेश पटेल या विदर्भ एग्रो',
    roleLabel: 'प्राथमिक भूमिका',
    locationLabel: 'स्थान (जिला और राज्य)',
    locationPlaceholder: 'उदा. वर्धा, महाराष्ट्र',
    phoneLabel: 'संपर्क मोबाइल नंबर',
    setPassword: 'पासवर्ड बनाएँ',
    confirmPassword: 'पासवर्ड की पुष्टि करें',
    registerBtn: 'खाता बनाएँ',
    registering: 'खाता बनाया जा रहा है...',
    haveAccount: 'पहले से खाता है?',
    signInLink: 'साइन इन करें',
    farmerRole: '🌾 किसान (फसल उत्पादक)',
    buyerRole: '🏬 खरीदार / अनाज व्यापारी',
    ownerRole: '🚜 फ्लीट / वाहन व मशीनरी मालिक',
    langLabel: 'भाषा चुनें',
    farmerTitle: 'किसान',
    buyerTitle: 'खरीदार / व्यापारी',
    ownerTitle: 'फ्लीट मालिक',
    adminTitle: 'व्यवस्थापक',
    errFillFields: 'कृपया सभी आवश्यक फ़ील्ड भरें।',
    errPasswordLength: 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।',
    errPasswordMatch: 'पासवर्ड मेल नहीं खाते। कृपया पुनः जांचें।',
    errEnterCredentials: 'कृपया अपना ईमेल और पासवर्ड दर्ज करें।',
    demoFilledToast: 'क्रेडेंशियल भर दिए गए हैं! साइन इन पर क्लिक करें।',
  },
  mr: {
    tagline: 'कृषी पुरवठा साखळी आणि किंमत अंदाज',
    headline: 'महाराष्ट्रातील शेतकरी व खरेदीदारांसाठी आधुनिक डिजिटल शेती',
    subtext: 'मंडी भाव अंदाज, थेट खरेदीदार संपर्क, ट्रॅक्टर व यंत्रसामग्री बुकिंगसाठी साइन इन करा.',
    feature1Title: 'अॅगमार्कनेट थेट बाजार भाव',
    feature1Desc: 'एपीएमसी बाजार समित्यांकडून थेट कमाल, किमान आणि सरासरी दर अपडेट.',
    feature2Title: 'जेमिनी AI भाव अंदाज',
    feature2Desc: '7, 15 आणि 30 दिवसांचे अचूक अंदाज आवक डेटा व मशीन लर्निंगवर आधारित.',
    feature3Title: 'थेट शेतकरी-खरेदीदार जुळणी',
    feature3Desc: 'कोणतेही मध्यस्थ किंवा दलाल नाहीत — थेट करार आणि त्वरित व्यवहार.',
    demoTitle: 'डेमो क्रेडेन्शियल',
    demoHint: 'फॉर्ममध्ये भरण्यासाठी खालील कार्डवर क्लिक करा',
    selectedBadge: 'निवडलेले',
    clickToFill: 'भरण्यासाठी क्लिक करा',
    tabSignIn: 'साइन इन',
    tabRegister: 'नवीन खाते उघडा',
    emailLabel: 'ईमेल पत्ता',
    emailPlaceholder: 'उदा. farmer@agripulse.in',
    passwordLabel: 'पासवर्ड',
    passwordPlaceholder: 'आपला पासवर्ड प्रविष्ट करा',
    rememberMe: 'सत्र लक्षात ठेवा',
    signInBtn: 'AgriPulse मध्ये प्रवेश करा',
    signingIn: 'प्रमाणीकरण सुरू आहे...',
    noAccount: 'खाते नाही का?',
    registerLink: 'येथे नवीन खाते तयार करा',
    nameLabel: 'पूर्ण नाव / व्यवसायाचे नाव',
    namePlaceholder: 'उदा. रमेश पटेल किंवा विदर्भ ऍग्रो',
    roleLabel: 'प्राथमिक भूमिका',
    locationLabel: 'स्थान (जिल्हा व राज्य)',
    locationPlaceholder: 'उदा. वर्धा, महाराष्ट्र',
    phoneLabel: 'मोबाईल क्रमांक',
    setPassword: 'पासवर्ड तयार करा',
    confirmPassword: 'पासवर्डची पुष्टी करा',
    registerBtn: 'खाते तयार करा',
    registering: 'खाते तयार होत आहे...',
    haveAccount: 'आधीच नोंदणी केली आहे का?',
    signInLink: 'येथून साइन इन करा',
    farmerRole: '🌾 शेतकरी (पीक उत्पादक)',
    buyerRole: '🏬 खरेदीदार / धान्य व्यापारी',
    ownerRole: '🚜 ताफा / यंत्रसामग्री मालक',
    langLabel: 'भाषा निवडा',
    farmerTitle: 'शेतकरी',
    buyerTitle: 'खरेदीदार / व्यापारी',
    ownerTitle: 'वाहन व यंत्र मालक',
    adminTitle: 'प्रशासक',
    errFillFields: 'कृपया सर्व आवश्यक फील्ड भरा.',
    errPasswordLength: 'पासवर्ड किमान 6 अक्षरांचा असावा.',
    errPasswordMatch: 'पासवर्ड जुळत नाहीत. कृपया पुन्हा तपासा.',
    errEnterCredentials: 'कृपया आपला ईमेल आणि पासवर्ड प्रविष्ट करा.',
    demoFilledToast: 'क्रेडेन्शियल भरले गेले आहेत! साइन इन वर क्लिक करा.',
  }
};

export const LoginPage = () => {
  const navigate = useNavigate();
  const { loginUser, registerUser, showToast, language, setLanguage } = useApp();

  // Active language synchronizes with AppContext and localStorage
  const currentLang = language || localStorage.getItem('agri_language') || 'en';
  const t = T[currentLang] || T.en;

  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [loginForm, setLoginForm] = useState({ email: '', password: '', rememberMe: true });
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'farmer',
    location: 'Nagpur, Maharashtra',
    phone: '+91 '
  });

  // Handle language switch
  const handleLangChange = (newLang) => {
    setLanguage(newLang);
    localStorage.setItem('agri_language', newLang);
  };

  // ─── 4 Demo Accounts with Rich, Distinctive Colors ────────────────────────
  const demoAccounts = [
    {
      id: 'farmer',
      badge: '🌾',
      title: t.farmerTitle + ' (Wardha)',
      name: 'Ramesh Patel',
      role: 'farmer',
      email: 'farmer@agripulse.in',
      password: 'farmer123',
      subinfo: '5.0 Acres • Black Soil',
      // Emerald / Forest Green Palette
      cardBg: 'bg-emerald-50/70 hover:bg-emerald-100/70',
      activeCardBg: 'bg-emerald-100 border-emerald-600 ring-2 ring-emerald-500/30 shadow-md',
      border: 'border-emerald-200',
      badgePill: 'bg-emerald-600 text-white',
      titleColor: 'text-emerald-950 font-bold',
      nameColor: 'text-emerald-700',
      codeBg: 'bg-emerald-50 text-emerald-900 border border-emerald-200',
    },
    {
      id: 'farmer2',
      badge: '🌾',
      title: t.farmerTitle + ' (Kalmeshwar)',
      name: 'Suresh Deshmukh',
      role: 'farmer',
      email: 'farmer2@agripulse.in',
      password: 'farmer123',
      subinfo: '8.5 Acres • Loamy Soil',
      // Teal / Mint Palette
      cardBg: 'bg-teal-50/70 hover:bg-teal-100/70',
      activeCardBg: 'bg-teal-100 border-teal-600 ring-2 ring-teal-500/30 shadow-md',
      border: 'border-teal-200',
      badgePill: 'bg-teal-600 text-white',
      titleColor: 'text-teal-950 font-bold',
      nameColor: 'text-teal-700',
      codeBg: 'bg-teal-50 text-teal-900 border border-teal-200',
    },
    {
      id: 'buyer',
      badge: '🏬',
      title: t.buyerTitle,
      name: 'Vidarbha Agro Mills',
      role: 'buyer',
      email: 'trader@vidarbhaagro.com',
      password: 'buyer123',
      // Blue / Indigo Palette
      cardBg: 'bg-blue-50/70 hover:bg-blue-100/70',
      activeCardBg: 'bg-blue-100 border-blue-600 ring-2 ring-blue-500/30 shadow-md',
      border: 'border-blue-200',
      badgePill: 'bg-blue-600 text-white',
      titleColor: 'text-blue-950 font-bold',
      nameColor: 'text-blue-700',
      codeBg: 'bg-blue-50 text-blue-900 border border-blue-200',
    },
    {
      id: 'owner',
      badge: '🚜',
      title: t.ownerTitle,
      name: 'Balwinder Logistics',
      role: 'owner',
      email: 'fleet@agripulse.in',
      password: 'owner123',
      // Amber / Warm Orange Palette
      cardBg: 'bg-amber-50/70 hover:bg-amber-100/70',
      activeCardBg: 'bg-amber-100 border-amber-600 ring-2 ring-amber-500/30 shadow-md',
      border: 'border-amber-200',
      badgePill: 'bg-amber-600 text-white',
      titleColor: 'text-amber-950 font-bold',
      nameColor: 'text-amber-700',
      codeBg: 'bg-amber-50 text-amber-900 border border-amber-200',
    },
    {
      id: 'admin',
      badge: '⚙️',
      title: t.adminTitle,
      name: 'Platform Admin',
      role: 'admin',
      email: 'admin@agripulse.in',
      password: 'admin123',
      // Purple / Violet Palette
      cardBg: 'bg-purple-50/70 hover:bg-purple-100/70',
      activeCardBg: 'bg-purple-100 border-purple-600 ring-2 ring-purple-500/30 shadow-md',
      border: 'border-purple-200',
      badgePill: 'bg-purple-600 text-white',
      titleColor: 'text-purple-950 font-bold',
      nameColor: 'text-purple-700',
      codeBg: 'bg-purple-50 text-purple-900 border border-purple-200',
    }
  ];

  const fillDemo = (demo) => {
    setMode('login');
    setLoginForm({ email: demo.email, password: demo.password, rememberMe: true });
    setErrorMessage('');
    showToast(`${demo.badge} ${demo.title} ${t.demoFilledToast}`, 'info');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!loginForm.email || !loginForm.password) {
      setErrorMessage(t.errEnterCredentials);
      return;
    }
    setLoading(true);
    const result = await loginUser({ email: loginForm.email, password: loginForm.password });
    setLoading(false);
    if (result.success) {
      navigate(result.user?.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } else {
      setErrorMessage(result.message || 'Invalid email or password.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!regForm.name || !regForm.email || !regForm.password) {
      setErrorMessage(t.errFillFields);
      return;
    }
    if (regForm.password.length < 6) {
      setErrorMessage(t.errPasswordLength);
      return;
    }
    if (regForm.password !== regForm.confirmPassword) {
      setErrorMessage(t.errPasswordMatch);
      return;
    }
    setLoading(true);
    const result = await registerUser({
      name: regForm.name,
      email: regForm.email,
      password: regForm.password,
      role: regForm.role,
      location: regForm.location,
      phone: regForm.phone
    });
    setLoading(false);
    if (result.success) {
      navigate(result.user?.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } else {
      setErrorMessage(result.message || 'Registration failed. Try a different email.');
    }
  };

  const inputClass =
    'w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30 flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-5xl">

        {/* ── Top Bar: Language Switcher ── */}
        <div className="flex justify-end mb-4">
          {/* Language Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-xs">
            <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mr-1 hidden sm:inline">
              {t.langLabel}:
            </span>
            {[
              { code: 'en', label: 'English' },
              { code: 'hi', label: 'हिंदी' },
              { code: 'mr', label: 'मराठी' }
            ].map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => handleLangChange(l.code)}
                className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-all ${
                  currentLang === l.code
                    ? 'bg-emerald-600 text-white shadow-xs scale-105'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Main Two-Column Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

          {/* ── Left Column: Branding, Features & Demo Credentials ── */}
          <div className="lg:col-span-5 space-y-4">

            {/* Brand Logo & Name */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-tr from-emerald-700 to-teal-500 text-white rounded-2xl shadow-md">
                <Sprout className="w-8 h-8" />
              </div>
              <div>
                <div className="font-extrabold text-2xl text-slate-900 tracking-tight">
                  AgriPulse
                </div>
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">{t.tagline}</p>
              </div>
            </div>

            {/* Headline */}
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">{t.headline}</h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">{t.subtext}</p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-2">
              {[
                { icon: TrendingUp, color: 'bg-emerald-100 text-emerald-700', title: t.feature1Title, desc: t.feature1Desc },
                { icon: Sparkles, color: 'bg-teal-100 text-teal-700', title: t.feature2Title, desc: t.feature2Desc },
                { icon: ShieldCheck, color: 'bg-blue-100 text-blue-700', title: t.feature3Title, desc: t.feature3Desc }
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-3 p-2.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
                  <div className={`p-2 ${f.color} rounded-lg shrink-0`}>
                    <f.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{f.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Demo Credentials Section (4 Distinct Color Options) ── */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wide">{t.demoTitle}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">{t.demoHint}</span>
              </div>

              {/* 4 Cards Grid with customized color accents */}
              <div className="p-3 grid grid-cols-2 gap-2">
                {demoAccounts.map((d) => {
                  const isSelected = loginForm.email === d.email;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => fillDemo(d)}
                      className={`relative flex flex-col items-start p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected ? d.activeCardBg : `${d.cardBg} ${d.border}`
                      }`}
                    >
                      {/* Active Checkmark Pill */}
                      {isSelected && (
                        <span className="absolute top-2 right-2 flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-600 text-white shadow-2xs">
                          <Check className="w-2.5 h-2.5" /> {t.selectedBadge}
                        </span>
                      )}

                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-base">{d.badge}</span>
                        <span className={`text-[11px] ${d.titleColor}`}>{d.title}</span>
                      </div>

                      <div className={`text-[10px] ${d.nameColor} font-medium truncate w-full`}>
                        {d.name}
                      </div>
                      {d.subinfo && (
                        <div className="text-[9px] text-slate-600 font-semibold truncate w-full">
                          {d.subinfo}
                        </div>
                      )}

                      <div className="mt-1 text-[9px] font-mono text-slate-500 truncate w-full">
                        {d.email}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Credentials Details Footer */}
              <div className="px-3 pb-3">
                <div className="bg-slate-50 rounded-xl p-2 space-y-1 border border-slate-100">
                  {demoAccounts.map((d) => (
                    <div key={d.id} className="flex items-center justify-between text-[10px]">
                      <span className={`font-bold ${d.nameColor}`}>
                        {d.badge} {d.title}:
                      </span>
                      <span className="font-mono text-slate-600 select-all">
                        {d.email} <span className="text-slate-400">/</span> {d.password}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* ── Right Column: Sign In / Create Account Card ── */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
              {/* Vibrant Accent Header Line */}
              <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-green-400" />

              <div className="p-6 sm:p-8">
                {/* Mode Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-2xl mb-6 border border-slate-200">
                  {[
                    { key: 'login', label: t.tabSignIn },
                    { key: 'register', label: t.tabRegister }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => {
                        setMode(tab.key);
                        setErrorMessage('');
                      }}
                      className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                        mode === tab.key
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2.5 text-red-700 text-xs font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* ── Login Form ── */}
                {mode === 'login' ? (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">{t.emailLabel}</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="email"
                          required
                          placeholder={t.emailPlaceholder}
                          value={loginForm.email}
                          onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">{t.passwordLabel}</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder={t.passwordPlaceholder}
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                          className={`${inputClass} pr-10`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                        <input
                          type="checkbox"
                          checked={loginForm.rememberMe}
                          onChange={(e) => setLoginForm({ ...loginForm, rememberMe: e.target.checked })}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        {t.rememberMe}
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {t.signingIn}
                        </>
                      ) : (
                        <>
                          {t.signInBtn}
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <p className="text-center text-xs text-slate-500 pt-2">
                      {t.noAccount}{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setMode('register');
                          setErrorMessage('');
                        }}
                        className="font-bold text-emerald-700 hover:underline cursor-pointer"
                      >
                        {t.registerLink}
                      </button>
                    </p>
                  </form>
                ) : (
                  /* ── Register Form ── */
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">{t.nameLabel}</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          required
                          placeholder={t.namePlaceholder}
                          value={regForm.name}
                          onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">{t.emailLabel}</label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                          <input
                            type="email"
                            required
                            placeholder="yourname@domain.com"
                            value={regForm.email}
                            onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                            className={inputClass}
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">{t.roleLabel}</label>
                        <select
                          value={regForm.role}
                          onChange={(e) => setRegForm({ ...regForm, role: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                        >
                          <option value="farmer">{t.farmerRole}</option>
                          <option value="buyer">{t.buyerRole}</option>
                          <option value="owner">{t.ownerRole}</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">{t.locationLabel}</label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                          <input
                            type="text"
                            placeholder={t.locationPlaceholder}
                            value={regForm.location}
                            onChange={(e) => setRegForm({ ...regForm, location: e.target.value })}
                            className={inputClass}
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">{t.phoneLabel}</label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                          <input
                            type="text"
                            placeholder="+91 98230 11223"
                            value={regForm.phone}
                            onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">{t.setPassword}</label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            placeholder="Min. 6 characters"
                            value={regForm.password}
                            onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                            className={inputClass}
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">{t.confirmPassword}</label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            placeholder="Re-type password"
                            value={regForm.confirmPassword}
                            onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {t.registering}
                        </>
                      ) : (
                        <>
                          {t.registerBtn}
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <p className="text-center text-xs text-slate-500 pt-2">
                      {t.haveAccount}{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setMode('login');
                          setErrorMessage('');
                        }}
                        className="font-bold text-emerald-700 hover:underline cursor-pointer"
                      >
                        {t.signInLink}
                      </button>
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
