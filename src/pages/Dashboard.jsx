import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  TrendingUp, 
  Sparkles, 
  Scale, 
  Store, 
  CloudSun, 
  Truck, 
  Sprout, 
  Calendar, 
  ArrowRight, 
  RefreshCw,
  Tractor,
  Wrench,
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  DollarSign,
  Warehouse,
  BarChart3,
  BrainCircuit,
  Plus,
  Search,
  X
} from 'lucide-react';
import { WEATHER_DATA, SHIPMENT_TRACKING } from '../data/mockData';
import { ALL_CROPS, CROP_CATEGORIES } from '../data/allCrops';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { 
    role, 
    setRole, 
    t, 
    language, 
    authUser, 
    userProfile, 
    bookings, 
    marketPrices, 
    dataTelemetry, 
    refreshMarketData, 
    isSyncing, 
    myCrops, 
    crops, 
    buyers, 
    dashboardStats 
  } = useApp();

  const [selectedCropCategory, setSelectedCropCategory] = useState('All');
  const [cropSearchTerm, setCropSearchTerm] = useState('');

  const activeUserName = authUser?.name || userProfile?.name || 'Farmer';

  const roleTitles = {
    farmer: language === 'hi' 
      ? `शुभ प्रभात, ${activeUserName} 🌾`
      : language === 'mr'
      ? `शुभ सकाळ, ${activeUserName} 🌾`
      : `Good Morning, ${activeUserName} 🌾`,
    owner: language === 'hi'
      ? `शुभ प्रभात, ${activeUserName} 🚜`
      : language === 'mr'
      ? `शुभ सकाळ, ${activeUserName} 🚜`
      : `Good Morning, ${activeUserName} 🚜`,
    buyer: language === 'hi'
      ? `शुभ प्रभात, ${activeUserName} 🏬`
      : language === 'mr'
      ? `शुभ सकाळ, ${activeUserName} 🏬`
      : `Good Morning, ${activeUserName} 🏬`,
    trader: language === 'hi'
      ? `शुभ प्रभात, ${activeUserName} 🏬`
      : language === 'mr'
      ? `शुभ सकाळ, ${activeUserName} 🏬`
      : `Good Morning, ${activeUserName} 🏬`,
    driver: language === 'hi'
      ? `शुभ प्रभात, ${activeUserName} 🚚`
      : language === 'mr'
      ? `शुभ सकाळ, ${activeUserName} 🚚`
      : `Good Morning, ${activeUserName} 🚚`,
    admin: language === 'hi'
      ? `सिस्टम व्यवस्थापक कंसोल (${activeUserName}) ⚙️`
      : language === 'mr'
      ? `सिस्टम प्रशासक कंसोल (${activeUserName}) ⚙️`
      : `System Administrator Console (${activeUserName}) ⚙️`
  };

  const roleSubtitles = {
    farmer: t('subFarmer') || 'Track crop market health, manage farmland yields, and forecast APMC prices.',
    owner: t('subOwner') || 'Manage tractor & equipment fleet availability, rentals, and revenue.',
    buyer: t('subBuyer') || 'Direct farmer procurement, quality check contracts, and spot prices.',
    trader: 'Wholesale mandi bidding, trade arbitrage, and multi-market supply chain.',
    driver: 'Active logistics trips, vehicle dispatch schedule, and direct farmer bookings.',
    admin: t('subAdmin') || 'Manage platform users, verify machinery operators, and monitor prices.'
  };

  // Compute live commodity cards across ALL 25 crops
  const displayCards = ALL_CROPS.map(crop => {
    const localizedName = language === 'hi' ? crop.nameHi : language === 'mr' ? crop.nameMr : crop.name;
    const liveMatch = marketPrices.find(m => 
      (m.commodity && m.commodity.toLowerCase().includes(crop.key.toLowerCase())) ||
      (m.crop_name && m.crop_name.toLowerCase().includes(crop.key.toLowerCase()))
    );

    if (liveMatch) {
      const isPos = liveMatch.change !== undefined ? liveMatch.change >= 0 : crop.isPos;
      const formattedChange = (liveMatch.change !== undefined && liveMatch.change !== null && liveMatch.change !== 0)
        ? `${liveMatch.change > 0 ? '+' : '-'}₹${Math.abs(liveMatch.change)} (${liveMatch.changePercent}%)`
        : crop.change;

      return {
        ...crop,
        name: localizedName,
        modal: liveMatch.modalPrice || liveMatch.price,
        min: liveMatch.minPrice || (liveMatch.modalPrice - 200),
        max: liveMatch.maxPrice || (liveMatch.modalPrice + 200),
        market: liveMatch.market || crop.market,
        date: liveMatch.date || new Date().toISOString().split('T')[0],
        source: liveMatch.source || 'Agmarknet',
        change: formattedChange,
        isPos,
        marketStatus: liveMatch.marketStatus || 'Live Auction',
        sessionName: liveMatch.sessionName || 'APMC Live Session'
      };
    }
    return {
      ...crop,
      name: localizedName,
      date: new Date().toISOString().split('T')[0],
      source: 'Agmarknet'
    };
  }).filter(c => {
    const matchesCat = selectedCropCategory === 'All' || c.category === selectedCropCategory;
    const matchesSearch = !cropSearchTerm.trim() || 
      c.name.toLowerCase().includes(cropSearchTerm.toLowerCase()) || 
      c.key.toLowerCase().includes(cropSearchTerm.toLowerCase()) ||
      c.market.toLowerCase().includes(cropSearchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-12">
      
      {/* Top Banner Greeting */}
      <div className="bg-gradient-to-r from-agri-900 via-agri-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-agri-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-white/10 backdrop-blur-xs rounded-full text-xs font-bold text-white border border-white/10 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-amber-300" />
              <span className="capitalize">{role === 'farmer' ? (language === 'hi' ? 'किसान' : language === 'mr' ? 'शेतकरी' : 'Farmer') : role}</span>
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold border bg-emerald-500/20 text-emerald-300 border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{language === 'hi' ? 'लाइव' : language === 'mr' ? 'लाइव्ह' : 'Live'}</span>
            </span>
          </div>
          <h1 translate="no" className="text-2xl sm:text-4xl font-extrabold tracking-tight notranslate">
            {roleTitles[role] || roleTitles.farmer}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-normal max-w-2xl">
            {roleSubtitles[role] || roleSubtitles.farmer}
          </p>
        </div>

        {/* Quick Weather Snapshot Pill */}
        <div 
          onClick={() => navigate('/weather')}
          className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 p-4 rounded-2xl cursor-pointer transition-all flex items-center gap-4 shrink-0"
        >
          <CloudSun className="w-8 h-8 text-amber-300 shrink-0" />
          <div>
            <p className="text-xs font-bold text-white">{WEATHER_DATA.currentTemp} | {WEATHER_DATA.condition}</p>
            <p className="text-[11px] text-slate-300">Rainfall Prob: <strong className="text-amber-300">{WEATHER_DATA.rainfallChance}</strong></p>
          </div>
        </div>

      </div>


      {/* PERSONA SPECIFIC DASHBOARD WORKSPACE CONSOLES */}

      {/* 1. FARMER WORKSPACE */}
      {role === 'farmer' && (
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-6 sm:p-8 rounded-3xl border border-emerald-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-emerald-800/80 pb-4 gap-3">
            <div>
              <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest">FARMER INTELLIGENCE CONSOLE</span>
              <h2 className="text-xl font-extrabold mt-1">My Farm Crops & Market Action Hub</h2>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/my-crops')} className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5">
                <Sprout className="w-4 h-4" /> {t('navMyCrops')}
              </button>
              <button onClick={() => navigate('/forecasting')} className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> {t('navForecasting')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-white/10 rounded-2xl border border-white/10 space-y-1">
              <span className="text-slate-400">Tracked Crops</span>
              <p className="text-2xl font-extrabold text-white">{crops.length || 4} Crops Registered</p>
            </div>
            <div className="p-4 bg-white/10 rounded-2xl border border-white/10 space-y-1">
              <span className="text-slate-400">AI Sell Recommendation</span>
              <p className="text-2xl font-extrabold text-emerald-400">HOLD Cotton 10d</p>
            </div>
            <div className="p-4 bg-white/10 rounded-2xl border border-white/10 space-y-1">
              <span className="text-slate-400">Active Market Prices</span>
              <p className="text-2xl font-extrabold text-amber-300">{marketPrices.length || 6} Mandis Live</p>
            </div>
            <div className="p-4 bg-white/10 rounded-2xl border border-white/10 space-y-1">
              <span className="text-slate-400">Active Bookings</span>
              <p className="text-2xl font-extrabold text-teal-300">{bookings.length} Equipment Booked</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. EQUIPMENT OWNER PERSONA VIEW */}
      {role === 'owner' && (
        <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 text-white p-6 sm:p-8 rounded-3xl border border-amber-700 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-amber-800/80 pb-4 gap-3">
            <div>
              <span className="text-xs font-extrabold text-amber-400 uppercase tracking-widest">OWNER FLEET CONSOLE</span>
              <h2 className="text-xl font-extrabold mt-1">My Listed Fleet & Rental Bookings</h2>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/tractors')} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Add Machinery Listing
              </button>
              <button onClick={() => navigate('/bookings')} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20">
                Incoming Bookings ({bookings.length})
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-white/10 rounded-2xl border border-white/10 space-y-1">
              <span className="text-slate-400">Available Vehicles</span>
              <p className="text-2xl font-extrabold text-white">{dashboardStats?.availableVehicles || 4} Units</p>
            </div>
            <div className="p-4 bg-white/10 rounded-2xl border border-white/10 space-y-1">
              <span className="text-slate-400">Active Bookings</span>
              <p className="text-2xl font-extrabold text-emerald-400">{bookings.length} Active</p>
            </div>
            <div className="p-4 bg-white/10 rounded-2xl border border-white/10 space-y-1">
              <span className="text-slate-400">Available Warehouses</span>
              <p className="text-2xl font-extrabold text-amber-300">{dashboardStats?.availableWarehouses || 4} Facilities</p>
            </div>
            <div className="p-4 bg-white/10 rounded-2xl border border-white/10 space-y-1">
              <span className="text-slate-400">Fleet Availability</span>
              <p className="text-2xl font-extrabold text-teal-300">🟢 Online</p>
            </div>
          </div>
        </div>
      )}

      {/* 3. WHOLESALE BUYER / TRADER PERSONA VIEW */}
      {role === 'buyer' && (
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl border border-blue-700 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-blue-800/80 pb-4 gap-3">
            <div>
              <span className="text-xs font-extrabold text-blue-400 uppercase tracking-widest">TRADER SOURCING PORTAL</span>
              <h2 className="text-xl font-extrabold mt-1">Direct Farmer Crop Harvest Batches</h2>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/marketplace')} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4" /> Browse Crop Batches
              </button>
              <button onClick={() => navigate('/storage')} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20">
                Cold Storage Reservation
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-white/10 rounded-2xl border border-white/10 space-y-1">
              <span className="text-slate-400">Registered Farm Batches</span>
              <p className="text-2xl font-extrabold text-white">{crops.length || 4} Batches</p>
            </div>
            <div className="p-4 bg-white/10 rounded-2xl border border-white/10 space-y-1">
              <span className="text-slate-400">Active Demand Listings</span>
              <p className="text-2xl font-extrabold text-blue-300">{buyers.length || 4} Demands</p>
            </div>
            <div className="p-4 bg-white/10 rounded-2xl border border-white/10 space-y-1">
              <span className="text-slate-400">Total Produce Volume</span>
              <p className="text-2xl font-extrabold text-emerald-300">{dashboardStats?.totalProduceQuintals || 165} Qtl</p>
            </div>
            <div className="p-4 bg-white/10 rounded-2xl border border-white/10 space-y-1">
              <span className="text-slate-400">Brokerage Savings</span>
              <p className="text-2xl font-extrabold text-amber-300">0% Direct</p>
            </div>
          </div>
        </div>
      )}

      {/* 4. PLATFORM ADMIN PERSONA VIEW */}
      {role === 'admin' && (
        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-purple-950 text-white p-6 sm:p-8 rounded-3xl border border-purple-700 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-purple-800/80 pb-4 gap-3">
            <div>
              <span className="text-xs font-extrabold text-purple-400 uppercase tracking-widest">SYSTEM TELEMETRY CONSOLE</span>
              <h2 className="text-xl font-extrabold mt-1">Platform Operations & Data Sync Health</h2>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/admin')} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Full Admin Console
              </button>
              <button onClick={() => navigate('/ml-models')} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20">
                ML Benchmarks
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-white/10 rounded-2xl border border-white/10 space-y-1">
              <span className="text-slate-400">Market API Connection</span>
              <p className="text-2xl font-extrabold text-emerald-400">{dataTelemetry.badge}</p>
            </div>
            <div className="p-4 bg-white/10 rounded-2xl border border-white/10 space-y-1">
              <span className="text-slate-400">Gemini AI Status</span>
              <p className="text-2xl font-extrabold text-purple-300">🟢 Configured</p>
            </div>
            <div className="p-4 bg-white/10 rounded-2xl border border-white/10 space-y-1">
              <span className="text-slate-400">Registered Farmers</span>
              <p className="text-2xl font-extrabold text-blue-300">{dashboardStats?.totalFarmers || 2} Farmers</p>
            </div>
            <div className="p-4 bg-white/10 rounded-2xl border border-white/10 space-y-1">
              <span className="text-slate-400">Wholesale Buyers</span>
              <p className="text-2xl font-extrabold text-white">{dashboardStats?.totalBuyers || 2} Buyers</p>
            </div>
          </div>
        </div>
      )}

      {/* Live Market Prices Cards Section (All 25 Crops) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Store className="w-5 h-5 text-agri-600" /> {t('liveCommodityPrices')}
            </h2>
            <p className="text-xs text-slate-500">{t('liveSub')} • 25 Agricultural Commodities Tracked</p>
          </div>

          <button
            onClick={refreshMarketData}
            disabled={isSyncing}
            className="px-4 py-2 bg-agri-600 hover:bg-agri-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? t('syncing') : t('refreshData')}</span>
          </button>
        </div>

        {/* Category Pills & Quick Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {CROP_CATEGORIES.map(cat => {
              const count = cat === 'All' 
                ? ALL_CROPS.length 
                : ALL_CROPS.filter(c => c.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCropCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCropCategory === cat
                      ? 'bg-agri-600 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search any of 25 crops..."
              value={cropSearchTerm}
              onChange={(e) => setCropSearchTerm(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 bg-white text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-agri-500 text-slate-800"
            />
            {cropSearchTerm && (
              <button
                onClick={() => setCropSearchTerm('')}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {displayCards.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 space-y-2">
            <p className="text-sm font-bold">No crops found matching "{cropSearchTerm}"</p>
            <button 
              onClick={() => { setCropSearchTerm(''); setSelectedCropCategory('All'); }}
              className="text-xs text-agri-600 font-bold hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayCards.map(c => (
            <div 
              key={c.key}
              onClick={() => navigate(`/forecasting?crop=${c.key.toLowerCase()}`)}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer space-y-4 relative flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{c.emoji}</span>
                    <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-agri-700 transition-colors">
                      {c.name}
                    </h3>
                  </div>
                  <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                    c.isPos ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {c.change}
                  </span>
                </div>

                <div className="mt-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-slate-900">₹{c.modal.toLocaleString('en-IN')}</span>
                    <span className="text-xs text-slate-500 font-semibold">/ {t('quintal')}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{t('modalPrice')} at <strong>{c.market}</strong></p>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-2 gap-2 text-xs mt-3">
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold block">{t('minPrice')}</span>
                    <span className="font-bold text-slate-700">₹{c.min.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold block">{t('maxPrice')}</span>
                    <span className="font-extrabold text-slate-900">₹{c.max.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>{t('updated')}: {dataTelemetry.minutesAgo === 0 ? 'Just now' : `${dataTelemetry.minutesAgo}m ago`}</span>
                <span className="font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                  {t('source')}: {c.source}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

      {/* PERSONA-TAILORED QUICK ACTION CARDS */}

      {/* 1. FARMER ACTION CARDS */}
      {role === 'farmer' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            onClick={() => navigate('/forecasting')}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">AI 15-Day Price Forecast</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900">Cotton Target: ₹7,680 <span className="text-xs font-normal text-slate-500">/ Qtl</span></h3>
              <p className="text-xs font-bold text-emerald-600 mt-1">Expected Surge: +5.9% (Confidence: 87%)</p>
            </div>
            <p className="text-[11px] text-slate-500 border-t border-slate-100 pt-2 font-medium">
              Model: <strong>Grounded XGBoost + Gemini LLM</strong>
            </p>
          </div>

          <div 
            onClick={() => navigate('/sell-decision')}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Selling Advisor</span>
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                <Scale className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-full">
                RECOMMENDED: HOLD 10 DAYS
              </span>
              <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                Holding sale captures +₹14,500 extra net profit after deducting storage & freight.
              </p>
            </div>
            <p className="text-[11px] text-agri-700 font-bold border-t border-slate-100 pt-2">
              Calculate Net Margin →
            </p>
          </div>

          <div 
            onClick={() => navigate('/supply-chain')}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Supply Chain</span>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Truck className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-[11px] font-bold rounded-full">
                STATUS: IN TRANSIT
              </span>
              <p className="text-xs font-bold text-slate-900 mt-2">Shipment #{SHIPMENT_TRACKING.shipmentId}</p>
            </div>
            <p className="text-[11px] text-slate-500 border-t border-slate-100 pt-2 font-medium">
              En route: <strong>Wardha Farm → Nagpur APMC</strong>
            </p>
          </div>
        </div>
      )}

      {/* 2. EQUIPMENT OWNER ACTION CARDS */}
      {role === 'owner' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            onClick={() => navigate('/tractors')}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Fleet Utilization</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <Tractor className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900">High Demand Zone</h3>
              <p className="text-xs font-bold text-amber-600 mt-1">+18% Booking Requests for Harvesters</p>
            </div>
            <p className="text-[11px] text-slate-500 border-t border-slate-100 pt-2 font-medium">
              Location: <strong>Nagpur / Wardha Region</strong>
            </p>
          </div>

          <div 
            onClick={() => navigate('/bookings')}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Approvals</span>
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-full">
                2 BOOKING REQUESTS
              </span>
              <p className="text-xs text-slate-600 mt-2">
                Mahindra 575 DI requested for 3 days starting tomorrow.
              </p>
            </div>
            <p className="text-[11px] text-emerald-700 font-bold border-t border-slate-100 pt-2">
              Review & Accept Bookings →
            </p>
          </div>

          <div 
            onClick={() => navigate('/machinery-advisor')}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Rate Advisor</span>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Wrench className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Recommended Rate: ₹1,200/hr</h3>
              <p className="text-xs font-bold text-slate-600 mt-1">Optimized for peak rotavator season</p>
            </div>
            <p className="text-[11px] text-slate-500 border-t border-slate-100 pt-2 font-medium">
              Benchmark: <strong>Regional Average ₹1,150/hr</strong>
            </p>
          </div>
        </div>
      )}

      {/* 3. WHOLESALE BUYER ACTION CARDS */}
      {role === 'buyer' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            onClick={() => navigate('/marketplace')}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Fresh Harvest Batches</span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900">180 Tons Soybean</h3>
              <p className="text-xs font-bold text-blue-600 mt-1">Grade A Quality • Direct Farm Rate</p>
            </div>
            <p className="text-[11px] text-slate-500 border-t border-slate-100 pt-2 font-medium">
              Sourcing: <strong>Amravati & Nagpur Farmers</strong>
            </p>
          </div>

          <div 
            onClick={() => navigate('/storage')}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Cold Storage Space</span>
              <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
                <Warehouse className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="px-2.5 py-1 bg-teal-100 text-teal-800 text-xs font-extrabold rounded-full">
                45% SPACE AVAILABLE
              </span>
              <p className="text-xs text-slate-600 mt-2">
                Nagpur Logistics Park - Humidity Controlled Units
              </p>
            </div>
            <p className="text-[11px] text-teal-700 font-bold border-t border-slate-100 pt-2">
              Reserve Warehouse Bay →
            </p>
          </div>

          <div 
            onClick={() => navigate('/supply-chain')}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Bulk Logistics</span>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Truck className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-[11px] font-bold rounded-full">
                SHIPMENT DISPATCHED
              </span>
              <p className="text-xs font-bold text-slate-900 mt-2">20-Ton Multi-Axle Truck</p>
            </div>
            <p className="text-[11px] text-slate-500 border-t border-slate-100 pt-2 font-medium">
              ETA: <strong>3 Hours to Processing Plant</strong>
            </p>
          </div>
        </div>
      )}

      {/* 4. PLATFORM ADMIN ACTION CARDS */}
      {role === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            onClick={() => navigate('/prices')}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Agmarknet Sync Telemetry</span>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <RefreshCw className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900">{dataTelemetry.badge}</h3>
              <p className="text-xs font-bold text-purple-600 mt-1">12 Major APMC Mandis Synced</p>
            </div>
            <p className="text-[11px] text-slate-500 border-t border-slate-100 pt-2 font-medium">
              Background Scheduler: <strong>Running every 10 mins</strong>
            </p>
          </div>

          <div 
            onClick={() => navigate('/ml-models')}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Model Health</span>
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                <BrainCircuit className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-full">
                GEMINI AI 2.0 READY
              </span>
              <p className="text-xs text-slate-600 mt-2">
                API Response Time: 340ms • Grounding Accuracy: 94.8%
              </p>
            </div>
            <p className="text-[11px] text-emerald-700 font-bold border-t border-slate-100 pt-2">
              View ML Benchmark Metrics →
            </p>
          </div>

          <div 
            onClick={() => navigate('/admin')}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">SQLite Database Metrics</span>
              <div className="p-2 bg-slate-100 text-slate-700 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="px-2.5 py-0.5 bg-slate-200 text-slate-800 text-[11px] font-bold rounded-full">
                STATUS: HEALTHY
              </span>
              <p className="text-xs font-bold text-slate-900 mt-2">Indexes & Cache Active</p>
            </div>
            <p className="text-[11px] text-slate-500 border-t border-slate-100 pt-2 font-medium">
              Tables: <strong>market_prices, bookings, farmer_crops</strong>
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
