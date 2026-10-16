import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Sprout, 
  Search, 
  Bell, 
  Globe, 
  UserCheck, 
  Menu, 
  Sparkles,
  ChevronDown,
  X,
  TrendingUp,
  ShieldAlert,
  Calendar,
  CalendarCheck,
  RefreshCw,
  LogIn,
  LogOut,
  User
} from 'lucide-react';

export const Navbar = ({ toggleSidebar }) => {
  const { 
    role, 
    setRole, 
    language, 
    setLanguage, 
    t,
    setIsSearchOpen, 
    setIsAiAssistantOpen,
    dataTelemetry,
    isSyncing,
    refreshMarketData,
    showToast,
    authUser,
    userProfile,
    logoutUser,
    priceAlerts,
    marketPrices
  } = useApp();

  const navigate = useNavigate();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [hasUnreadAlerts, setHasUnreadAlerts] = useState(true);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const roleLabels = {
    farmer: t('farmerRole'),
    owner: t('ownerRole'),
    buyer: t('buyerRole'),
    admin: t('adminRole')
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
      <div className="px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Left Section: Mobile Menu Button & Brand */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 z-20">
          <button 
            onClick={toggleSidebar} 
            className="p-2 text-slate-700 hover:text-agri-700 hover:bg-agri-50 rounded-xl transition-colors shrink-0 z-30 cursor-pointer active:scale-95"
            aria-label="Toggle navigation menu"
            title="Navigation Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-gradient-to-tr from-agri-700 to-agri-500 text-white p-2 rounded-xl shadow-xs shrink-0">
              <Sprout className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="truncate">
              <span className="font-extrabold text-base sm:text-xl text-slate-900 tracking-tight flex items-center gap-1.5 truncate">
                <span className="truncate">{t('appTitle')}</span>
                <span className="hidden sm:inline-block text-xs bg-agri-100 text-agri-800 font-bold px-2 py-0.5 rounded-full border border-agri-200 shrink-0">AI 2.0</span>
              </span>
              <span className="hidden md:block text-[10px] text-slate-500 font-medium tracking-wide truncate">
                {t('appSubtitle')}
              </span>
            </div>
          </div>
        </div>

        {/* Middle Section: Data Status Badge & Refresh Button */}
        <div className="hidden md:flex items-center gap-3">
          
          {/* Status Badge */}
          <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border shadow-2xs ${
            dataTelemetry.status === 'live' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : dataTelemetry.status === 'cached' 
              ? 'bg-amber-50 text-amber-800 border-amber-200' 
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            <span>{dataTelemetry.badge}</span>
            <span className="text-[10px] font-normal text-slate-500">
              ({dataTelemetry.source} • {dataTelemetry.minutesAgo === 0 ? 'Just now' : `${dataTelemetry.minutesAgo}m ago`})
            </span>
          </div>

          {/* Manual Data Refresh Button */}
          <button
            onClick={refreshMarketData}
            disabled={isSyncing}
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-semibold border border-slate-200 flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
            title="Refresh Live Agmarknet Market Prices"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-agri-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? t('syncing') : t('refreshData')}</span>
          </button>

        </div>

        {/* Right Section: Role Switcher, Language Selector, Notifications, AI Bot */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 z-20">
          
          {/* Mobile Search Button */}
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* AI Assistant Quick Pill */}
          <button
            onClick={() => setIsAiAssistantOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-agri-600 to-teal-600 hover:from-agri-700 hover:to-teal-700 text-white rounded-full text-xs font-semibold shadow-xs hover:shadow transition-all cursor-pointer shrink-0"
            title="AI Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span className="hidden sm:inline">{t('aiAssistant')}</span>
          </button>

          {/* Language Selector */}
          <div className="relative flex items-center bg-slate-100 hover:bg-slate-200/80 rounded-xl p-1 border border-slate-200 shadow-2xs shrink-0 transition-colors">
            <Globe className="w-3.5 h-3.5 text-agri-600 ml-1.5 shrink-0 hidden xs:inline" />
            <select
              value={language}
              onChange={(e) => {
                const newLang = e.target.value;
                setLanguage(newLang);
                const langLabel = newLang === 'hi' ? 'हिंदी (Hindi)' : newLang === 'mr' ? 'मराठी (Marathi)' : 'English';
                showToast(`Language set to ${langLabel}`);
              }}
              className="bg-transparent text-xs font-bold text-slate-800 py-1 px-1.5 focus:outline-none cursor-pointer"
              aria-label="Select language"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="mr">मराठी</option>
            </select>
          </div>

          {/* Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-agri-700" />
              <span className="hidden lg:inline">{roleLabels[role]}</span>
              <span className="lg:hidden capitalize">{role}</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>{t('switchPersona')}</span>
                  <span className="text-[10px] text-agri-600 font-normal">Adapts Navigation</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {Object.entries(roleLabels).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setRole(key);
                        setIsRoleDropdownOpen(false);
                        showToast(`Switched to ${label}`);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 text-xs font-medium flex items-center justify-between hover:bg-slate-50 transition-colors ${
                        role === key ? 'bg-agri-50 text-agri-900 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          {label}
                        </div>
                        <p className="text-[10px] text-slate-500 font-normal leading-tight">
                          {key === 'farmer' && (language === 'hi' ? 'फसल भाव, एआई पूर्वानुमान और किराए पर उपकरण' : language === 'mr' ? 'पीक भाव, एआय अंदाज आणि भाड्याने अवजारे' : 'Crop intelligence, AI forecasts, sell advice & hiring')}
                          {key === 'owner' && (language === 'hi' ? 'ट्रैक्टर और वाहनों की सूची, बुकिंग और आय' : language === 'mr' ? 'ट्रॅक्टर व वाहने यादी, बुकिंग आणि उत्पन्न' : 'Fleet management, listing machinery, bookings & income')}
                          {key === 'buyer' && (language === 'hi' ? 'थोक फसल खरीद, सीधे प्रस्ताव और कोल्ड स्टोरेज' : language === 'mr' ? 'घाऊक पीक खरेदी, थेट ऑफर आणि स्टोरेज' : 'Bulk crop sourcing, direct offers, storage & transport')}
                          {key === 'admin' && (language === 'hi' ? 'अगमार्कनेट एपीआई सिंक, डेटाबेस और प्रणाली स्थिति' : language === 'mr' ? 'अ‍ॅगमार्कनेट एपीआय सिंक, डेटाबेस आणि सिस्टीम आरोग्य' : 'Agmarknet API sync, database, AI logs & system health')}
                        </p>
                      </div>
                      {role === key && <span className="w-2.5 h-2.5 rounded-full bg-agri-600 shrink-0 ml-2"></span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notification Drawer Button */}
          <div className="relative">
            <button
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                if (!isNotifOpen) setHasUnreadAlerts(false);
              }}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl relative transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {hasUnreadAlerts && (
                <>
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full animate-ping"></span>
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
                </>
              )}
            </button>

            {/* Notifications Popup Panel */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-2xl py-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 pb-2.5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                      <Bell className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-extrabold text-xs text-slate-900 block leading-tight">Live Platform Alerts</span>
                      <span className="text-[10px] text-slate-400 font-medium">Real-time market updates</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setHasUnreadAlerts(false)}
                      className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 px-2 py-0.5 rounded-md hover:bg-emerald-50 transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => setIsNotifOpen(false)}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 px-2 py-1">
                  {/* Alert 1: APMC Agmarknet Market Sync */}
                  <div className="p-2.5 hover:bg-slate-50/80 rounded-xl transition-colors flex gap-3 items-start">
                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl shrink-0 mt-0.5">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-900">Agmarknet Price Surge: Cotton</p>
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          +1.68%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                        Wardha & Nagpur APMC Cotton (Kapas) price updated to ₹7,400/qtl.
                      </p>
                      <span className="text-[10px] text-slate-400 font-medium mt-1 block">Just now</span>
                    </div>
                  </div>

                  {/* Alert 2: AI Forecasting Engine */}
                  <div className="p-2.5 hover:bg-slate-50/80 rounded-xl transition-colors flex gap-3 items-start">
                    <div className="p-2 bg-teal-100 text-teal-700 rounded-xl shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-900">Gemini AI 15-Day Projections</p>
                        <span className="text-[9px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                          Ready
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                        AI forecast suggests Soybean holding window until post-Diwali arrivals peak.
                      </p>
                      <span className="text-[10px] text-slate-400 font-medium mt-1 block">15 mins ago</span>
                    </div>
                  </div>

                  {/* Alert 3: Telemetry status */}
                  <div className="p-2.5 hover:bg-slate-50/80 rounded-xl transition-colors flex gap-3 items-start">
                    <div className="p-2 bg-blue-100 text-blue-700 rounded-xl shrink-0 mt-0.5">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900">APMC Mandi Data Telemetry</p>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                        {dataTelemetry?.badge || '🟢 Live (Agmarknet)'} — official Govt. mandi rates active.
                      </p>
                      <span className="text-[10px] text-slate-400 font-medium mt-1 block">Live</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 px-4 border-t border-slate-100 text-center">
                  <Link
                    to="/watchlist"
                    onClick={() => setIsNotifOpen(false)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors inline-flex items-center gap-1"
                  >
                    Manage Price Alerts & Notifications →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Account / Login Button */}
          {authUser ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all"
                title="Account Settings"
              >
                <div translate="no" className="notranslate w-6 h-6 rounded-lg bg-gradient-to-tr from-agri-700 to-emerald-600 text-white font-bold flex items-center justify-center text-xs shadow-2xs">
                  {(authUser?.name || userProfile?.name || 'A').trim().charAt(0).toUpperCase()}
                </div>
                <span translate="no" className="notranslate hidden sm:inline text-xs font-bold text-slate-800 max-w-[130px] truncate">
                  {authUser?.name || userProfile?.name || 'My Account'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:inline" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p translate="no" className="notranslate text-xs font-black text-slate-900 truncate">
                      {authUser?.name || userProfile?.name || 'Active User'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {authUser?.email || userProfile?.email || 'Logged In'}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 capitalize border border-emerald-200">
                        {authUser?.role || userProfile?.role || role}
                      </span>
                      {(authUser?.location || userProfile?.location) && (
                        <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                          {authUser?.location || userProfile?.location}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-agri-700 transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Profile & Farm Land</span>
                    </Link>

                    <Link
                      to="/bookings"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-agri-700 transition-colors"
                    >
                      <CalendarCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>My Bookings</span>
                    </Link>

                    <Link
                      to="/login"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-agri-700 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                      <span>Switch / Demo Login</span>
                    </Link>

                    <button
                      id="navbar-logout-btn"
                      onClick={async () => {
                        setIsUserMenuOpen(false);
                        await logoutUser();
                        navigate('/login', { replace: true });
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left border-t border-slate-100 mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-agri-600 hover:bg-agri-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}

        </div>

      </div>
    </header>
  );
};
