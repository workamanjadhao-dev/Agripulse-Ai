import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Home, 
  TrendingUp, 
  Sparkles, 
  Scale, 
  Store, 
  Truck, 
  Sprout, 
  CloudSun, 
  BarChart3, 
  Warehouse, 
  Tractor, 
  Wrench, 
  BookOpen, 
  Cpu, 
  ShoppingBag, 
  Bot, 
  CalendarCheck, 
  Receipt, 
  Bell, 
  FileSpreadsheet, 
  User, 
  ShieldCheck, 
  X,
  BrainCircuit,
  UserCheck,
  Filter,
  ChevronRight,
  Globe
} from 'lucide-react';

export const Sidebar = ({ isOpen, closeSidebar }) => {
  const { role, t, language, setLanguage, authUser, userProfile, showToast } = useApp();
  const location = useLocation();
  const [showAllTools, setShowAllTools] = useState(false);

  const roleConfig = {
    farmer: {
      label: 'Farmer',
      color: 'bg-emerald-500',
      textColor: 'text-emerald-700',
      bgLight: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      dot: 'bg-emerald-500',
    },
    owner: {
      label: 'Equipment Owner',
      color: 'bg-amber-500',
      textColor: 'text-amber-700',
      bgLight: 'bg-amber-50',
      borderColor: 'border-amber-200',
      dot: 'bg-amber-500',
    },
    buyer: {
      label: 'Buyer / Trader',
      color: 'bg-blue-500',
      textColor: 'text-blue-700',
      bgLight: 'bg-blue-50',
      borderColor: 'border-blue-200',
      dot: 'bg-blue-500',
    },
    admin: {
      label: 'Platform Admin',
      color: 'bg-purple-500',
      textColor: 'text-purple-700',
      bgLight: 'bg-purple-50',
      borderColor: 'border-purple-200',
      dot: 'bg-purple-500',
    }
  };

  const currentRole = roleConfig[role] || roleConfig.farmer;

  const roleNavGroups = {
    farmer: [
      {
        title: 'Core Tools',
        items: [
          { label: 'Dashboard', path: '/dashboard', icon: Home },
          { label: 'AI Price Forecast', path: '/forecasting', icon: Sparkles, badge: 'AI' },
          { label: 'Sell / Hold Advisor', path: '/sell-decision', icon: Scale, badge: 'AI' },
          { label: 'My Crops', path: '/my-crops', icon: Sprout },
          { label: 'Live Market Prices', path: '/prices', icon: TrendingUp },
          { label: 'Weather', path: '/weather', icon: CloudSun },
        ]
      },
      {
        title: 'Machinery & Services',
        items: [
          { label: 'Tractor Rental', path: '/tractors', icon: Tractor },
          { label: 'Transport', path: '/transport', icon: Truck },
          { label: 'Equipment', path: '/equipment', icon: Wrench },
          { label: 'Storage Finder', path: '/storage', icon: Warehouse },
        ]
      },
      {
        title: 'Trade & Account',
        items: [
          { label: 'Marketplace', path: '/marketplace', icon: ShoppingBag },
          { label: 'AI Assistant', path: '/assistant', icon: Bot },
          { label: 'My Bookings', path: '/bookings', icon: CalendarCheck },
          { label: 'Price Alerts', path: '/watchlist', icon: Bell },
          { label: 'Profile', path: '/profile', icon: User },
        ]
      }
    ],

    owner: [
      {
        title: 'Fleet Console',
        items: [
          { label: 'Dashboard', path: '/dashboard', icon: Home },
          { label: 'Tractor Listings', path: '/tractors', icon: Tractor },
          { label: 'Transport Fleet', path: '/transport', icon: Truck },
          { label: 'Equipment', path: '/equipment', icon: Wrench },
          { label: 'Bookings', path: '/bookings', icon: CalendarCheck, badge: 'Income' },
        ]
      },
      {
        title: 'Earnings & Reports',
        items: [
          { label: 'Transactions', path: '/transactions', icon: Receipt },
          { label: 'Supply Chain', path: '/supply-chain', icon: Truck },
          { label: 'Reports', path: '/reports', icon: FileSpreadsheet },
          { label: 'AI Assistant', path: '/assistant', icon: Bot },
          { label: 'Profile', path: '/profile', icon: User },
        ]
      }
    ],

    buyer: [
      {
        title: 'Sourcing',
        items: [
          { label: 'Dashboard', path: '/dashboard', icon: Home },
          { label: 'Marketplace', path: '/marketplace', icon: ShoppingBag },
          { label: 'Live Prices', path: '/prices', icon: TrendingUp },
          { label: 'Demand & Supply', path: '/demand-supply', icon: BarChart3 },
        ]
      },
      {
        title: 'Logistics & Alerts',
        items: [
          { label: 'Storage', path: '/storage', icon: Warehouse },
          { label: 'Transport', path: '/transport', icon: Truck },
          { label: 'Transactions', path: '/transactions', icon: Receipt },
          { label: 'Price Alerts', path: '/watchlist', icon: Bell },
          { label: 'Reports', path: '/reports', icon: FileSpreadsheet },
          { label: 'Profile', path: '/profile', icon: User },
        ]
      }
    ],

    admin: [
      {
        title: 'Platform Admin',
        items: [
          { label: 'Dashboard', path: '/dashboard', icon: Home },
          { label: 'Admin Panel', path: '/admin', icon: ShieldCheck, badge: 'Admin' },
          { label: 'Live Prices', path: '/prices', icon: TrendingUp },
          { label: 'AI Assistant', path: '/assistant', icon: Bot },
        ]
      },
      {
        title: 'ML & Analytics',
        items: [
          { label: 'ML Performance', path: '/ml-models', icon: BrainCircuit, badge: 'Viva' },
          { label: 'Demand & Supply', path: '/demand-supply', icon: BarChart3 },
          { label: 'Reports', path: '/reports', icon: FileSpreadsheet },
          { label: 'Marketplace', path: '/marketplace', icon: ShoppingBag },
          { label: 'Bookings', path: '/bookings', icon: CalendarCheck },
        ]
      }
    ]
  };

  const allNavGroups = [
    {
      title: 'Intelligence',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: Home },
        { label: 'Live Prices', path: '/prices', icon: TrendingUp },
        { label: 'AI Forecast', path: '/forecasting', icon: Sparkles },
        { label: 'Sell Advisor', path: '/sell-decision', icon: Scale },
        { label: 'Supply Chain', path: '/supply-chain', icon: Truck },
      ]
    },
    {
      title: 'Farm Operations',
      items: [
        { label: 'My Crops', path: '/my-crops', icon: Sprout },
        { label: 'Weather', path: '/weather', icon: CloudSun },
        { label: 'Demand & Supply', path: '/demand-supply', icon: BarChart3 },
        { label: 'Storage', path: '/storage', icon: Warehouse },
      ]
    },
    {
      title: 'Machinery',
      items: [
        { label: 'Tractors', path: '/tractors', icon: Tractor },
        { label: 'Transport', path: '/transport', icon: Truck },
        { label: 'Equipment', path: '/equipment', icon: Wrench },
        { label: 'Equipment Guide', path: '/equipment-guide', icon: BookOpen },
        { label: 'Machinery Advisor', path: '/machinery-advisor', icon: Cpu },
      ]
    },
    {
      title: 'Trade',
      items: [
        { label: 'Marketplace', path: '/marketplace', icon: ShoppingBag },
        { label: 'AI Assistant', path: '/assistant', icon: Bot },
        { label: 'ML Performance', path: '/ml-models', icon: BrainCircuit, badge: 'Viva' },
      ]
    },
    {
      title: 'Account',
      items: [
        { label: 'Bookings', path: '/bookings', icon: CalendarCheck },
        { label: 'Transactions', path: '/transactions', icon: Receipt },
        { label: 'Price Alerts', path: '/watchlist', icon: Bell },
        { label: 'Reports', path: '/reports', icon: FileSpreadsheet },
        { label: 'Profile', path: '/profile', icon: User },
        { label: 'Admin Panel', path: '/admin', icon: ShieldCheck },
      ]
    }
  ];

  const activeNavGroups = showAllTools ? allNavGroups : (roleNavGroups[role] || roleNavGroups.farmer);
  const displayName = authUser?.name || userProfile?.name || 'AgriPulse User';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'U';

  return (
    <>
      {/* Dark Backdrop - click to close */}
      {isOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        />
      )}

      {/* Sidebar Panel - slides in from left, ALWAYS hidden by default */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200 shadow-2xl flex flex-col
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>

        {/* Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-green-600 to-emerald-500 text-white rounded-xl shadow-sm">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-slate-900 text-sm tracking-tight">{t('AgriPulse AI') || 'AgriPulse AI'}</p>
              <p className="text-[10px] text-slate-400 font-medium">{t('Navigation Menu') || 'Navigation Menu'}</p>
            </div>
          </div>
          <button
            onClick={closeSidebar}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User / Role Card */}
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div translate="no" className={`notranslate w-9 h-9 rounded-xl ${currentRole.color} text-white font-extrabold text-sm flex items-center justify-center shadow-sm shrink-0`}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p translate="no" className="notranslate font-bold text-sm text-slate-900 truncate">{displayName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${currentRole.dot}`}></span>
                <span className={`text-[10px] font-bold ${currentRole.textColor} uppercase tracking-wide`}>{t(currentRole.label) || currentRole.label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Language Selector */}
        <div className="px-4 py-2.5 border-b border-slate-100 bg-white flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-agri-600" /> {t('language') || 'Language'}
          </span>
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            {[
              { code: 'en', label: 'English' },
              { code: 'hi', label: 'हिंदी' },
              { code: 'mr', label: 'मराठी' }
            ].map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  setLanguage(l.code);
                  showToast?.(`Language set to ${l.label}`);
                }}
                className={`text-[11px] font-bold px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  language === l.code
                    ? 'bg-white text-agri-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Nav Mode Toggle */}
        <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <Filter className="w-3 h-3" /> {t('Filtered by role') || 'Filtered by role'}
          </span>
          <button
            onClick={() => setShowAllTools(!showAllTools)}
            className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
              showAllTools
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
          >
            {showAllTools ? (t('Showing All') || 'Showing All') : (t('Show All') || 'Show All')}
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-5">
          {activeNavGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-0.5">
              <h3 className="px-3 mb-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                {t(group.title) || group.title}
              </h3>
              {group.items.map((item, iIdx) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={iIdx}
                    to={item.path}
                    onClick={closeSidebar}
                    className={`
                      flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group
                      ${isActive
                        ? 'bg-green-600 text-white shadow-sm shadow-green-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-green-600'}`} />
                      <span className="text-xs font-semibold">{t(item.label) || item.label}</span>
                    </div>
                    {item.badge ? (
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase ${
                        isActive ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'
                      }`}>
                        {item.badge}
                      </span>
                    ) : isActive ? (
                      <ChevronRight className="w-3.5 h-3.5 text-white/70" />
                    ) : null}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50">
          <p className="text-[10px] text-slate-400 text-center font-medium">
            AgriPulse AI
          </p>
        </div>

      </aside>
    </>
  );
};
