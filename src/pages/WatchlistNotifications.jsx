import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ALL_CROPS, ALL_MANDIS } from '../data/allCrops';
import { 
  Bell, 
  Plus, 
  TrendingUp, 
  X, 
  Trash2, 
  Star, 
  Search, 
  Check, 
  ArrowUpRight, 
  Sparkles, 
  Layers, 
  Filter,
  SlidersHorizontal,
  ChevronRight,
  BookmarkCheck,
  TrendingDown,
  Info
} from 'lucide-react';

export const WatchlistNotifications = () => {
  const navigate = useNavigate();
  const { 
    favoriteCrops = [], 
    toggleFavoriteCrop, 
    isFavoriteCrop,
    addFavoriteCrop, 
    removeFavoriteCrop,
    priceAlerts = [], 
    addPriceAlert, 
    removePriceAlert,
    showToast 
  } = useApp();

  // Modals state
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isAddCropModalOpen, setIsAddCropModalOpen] = useState(false);

  // Price Alert Form State
  const [crop, setCrop] = useState('Cotton (Kapas)');
  const [mandi, setMandi] = useState('Nagpur APMC');
  const [targetPrice, setTargetPrice] = useState(7500);
  const [condition, setCondition] = useState('above'); // 'above' or 'below'

  // Add Crop Modal Search & Filter State
  const [cropSearch, setCropSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Categories list
  const categories = ['All', 'Cash Crops', 'Oilseeds', 'Grains', 'Pulses', 'Vegetables', 'Fruits', 'Spices'];

  // Resolve watched crops from ALL_CROPS
  const favoriteCropObjects = useMemo(() => {
    return (favoriteCrops || []).map(favKey => {
      const norm = String(favKey).toLowerCase().trim();
      const matched = ALL_CROPS.find(c => 
        c.key.toLowerCase() === norm || 
        c.name.toLowerCase() === norm || 
        c.name.toLowerCase().includes(norm) ||
        norm.includes(c.key.toLowerCase())
      );

      if (matched) return matched;

      // Graceful fallback for custom added crop
      return {
        key: favKey,
        name: favKey,
        nameHi: '',
        nameMr: '',
        category: 'Agri Commodity',
        emoji: '🌾',
        modal: 4500,
        min: 4200,
        max: 4900,
        market: 'Nagpur APMC',
        change: '+1.5%',
        isPos: true
      };
    });
  }, [favoriteCrops]);

  // Filter crops in the "Add Crop" modal
  const filteredAllCrops = useMemo(() => {
    return ALL_CROPS.filter(c => {
      const matchesSearch = 
        !cropSearch || 
        c.name.toLowerCase().includes(cropSearch.toLowerCase()) ||
        c.key.toLowerCase().includes(cropSearch.toLowerCase()) ||
        (c.nameHi && c.nameHi.includes(cropSearch)) ||
        (c.nameMr && c.nameMr.includes(cropSearch)) ||
        c.category.toLowerCase().includes(cropSearch.toLowerCase());

      const matchesCategory = 
        selectedCategory === 'All' || 
        c.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [cropSearch, selectedCategory]);

  // Open Alert Modal pre-filled with specific crop
  const handleOpenAlertForCrop = (targetCropObj) => {
    setCrop(targetCropObj.name || targetCropObj.key);
    setMandi(targetCropObj.market || 'Nagpur APMC');
    // Pre-fill target price with +5% rounded to nearest 50
    const suggestedPrice = Math.round((targetCropObj.modal * 1.05) / 50) * 50;
    setTargetPrice(suggestedPrice);
    setCondition('above');
    setIsAlertModalOpen(true);
  };

  // Submit Price Alert
  const handleCreateAlert = (e) => {
    e.preventDefault();
    addPriceAlert({ 
      commodity: crop, 
      market: mandi, 
      targetPrice: Number(targetPrice), 
      condition 
    });
    setIsAlertModalOpen(false);
  };

  // Quick popular crop recommendations
  const popularCrops = [
    { key: 'Cotton', name: 'Cotton (Kapas)', emoji: '🌿' },
    { key: 'Soybean', name: 'Soybean (Yellow)', emoji: '🌱' },
    { key: 'Wheat', name: 'Wheat (Lokwan)', emoji: '🌾' },
    { key: 'Chana', name: 'Gram (Chana)', emoji: '🥜' },
    { key: 'Tur', name: 'Tur / Arhar (Red Gram)', emoji: '🍲' },
    { key: 'Tomato', name: 'Tomato (Hybrid)', emoji: '🍅' },
    { key: 'Onion', name: 'Onion (Nashik Red)', emoji: '🧅' },
    { key: 'Mustard', name: 'Mustard (Sarson)', emoji: '🌼' }
  ];

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto px-2 sm:px-4">
      {/* ── Top Header Hero ── */}
      <div className="bg-gradient-to-r from-agri-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-agri-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="space-y-2 relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Real-Time Mandi Price Triggers
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Watchlist & Price Alerts
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Add your cultivated crops to your personal Watchlist to monitor APMC arrivals, price swings, and configure automated alert triggers before selling.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 relative z-10 w-full sm:w-auto">
          <button 
            onClick={() => setIsAddCropModalOpen(true)} 
            className="flex-1 sm:flex-initial px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-2xl shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 transform active:scale-95"
          >
            <Star className="w-4 h-4 fill-slate-950" /> + Add Crop to Watchlist
          </button>
          <button 
            onClick={() => {
              setCrop('Cotton (Kapas)');
              setMandi('Nagpur APMC');
              setTargetPrice(7500);
              setIsAlertModalOpen(true);
            }} 
            className="flex-1 sm:flex-initial px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs rounded-2xl border border-slate-700 shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Bell className="w-4 h-4 text-emerald-400" /> + Create Price Alert
          </button>
        </div>
      </div>

      {/* ── Favorite Crops Watchlist Section ── */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                <Star className="w-5 h-5 fill-emerald-600 text-emerald-600" />
              </div>
              <h2 className="font-extrabold text-lg sm:text-xl text-slate-900">
                My Favorite Crops Watchlist
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-100 text-slate-700 border border-slate-200">
                {favoriteCropObjects.length} {favoriteCropObjects.length === 1 ? 'Crop' : 'Crops'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Real-time APMC auction rates for your pinned commodities. Click "Set Price Alert" to trigger notifications.
            </p>
          </div>

          <button
            onClick={() => setIsAddCropModalOpen(true)}
            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-4 h-4" /> Add More Crops
          </button>
        </div>

        {/* Favorite Crops Grid */}
        {favoriteCropObjects.length === 0 ? (
          <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 space-y-4">
            <div className="w-16 h-16 mx-auto bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center">
              <Star className="w-8 h-8 text-emerald-600" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="font-extrabold text-base text-slate-900">Your Watchlist is Currently Empty</h3>
              <p className="text-xs text-slate-500">
                Add crops you grow or trade (like Soybean, Cotton, Wheat, or Chana) to track live auction rates and receive price alerts.
              </p>
            </div>
            <button
              onClick={() => setIsAddCropModalOpen(true)}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Browse & Add Crops to Watchlist
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {favoriteCropObjects.map((c) => (
              <div 
                key={c.key} 
                className="bg-slate-50/80 hover:bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 p-5 shadow-2xs hover:shadow-lg transition-all space-y-4 group relative flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Bar: Icon, Name & Category */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl p-2 bg-white rounded-xl shadow-2xs border border-slate-100 group-hover:scale-110 transition-transform">
                        {c.emoji}
                      </span>
                      <div>
                        <h4 className="font-black text-sm sm:text-base text-slate-900 leading-snug">
                          {c.name}
                        </h4>
                        {(c.nameHi || c.nameMr) && (
                          <p className="text-[11px] text-slate-400 font-medium">
                            {c.nameHi || c.nameMr}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-200/70 text-slate-700 shrink-0">
                      {c.category}
                    </span>
                  </div>

                  {/* Pricing Overview Box */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 space-y-1.5 shadow-2xs">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Benchmark APMC Rate</span>
                      {c.change && (
                        <span className={`text-[11px] font-extrabold flex items-center gap-0.5 ${c.isPos ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {c.isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {c.change}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-900">
                        ₹{c.modal?.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">/ quintal</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                      <span>Range: ₹{c.min} - ₹{c.max}</span>
                      <span className="font-semibold text-slate-700 truncate max-w-[120px]">{c.market}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-2 flex items-center gap-2 border-t border-slate-200/60">
                  <button
                    onClick={() => handleOpenAlertForCrop(c)}
                    className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                    title={`Set high/low trigger alert for ${c.name}`}
                  >
                    <Bell className="w-3.5 h-3.5" /> Set Alert
                  </button>

                  <button
                    onClick={() => navigate(`/market-intelligence?commodity=${encodeURIComponent(c.key)}`)}
                    className="py-2 px-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-[11px] rounded-xl transition-colors flex items-center gap-1"
                    title="View live mandis for this crop"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" /> Mandis
                  </button>

                  <button
                    onClick={() => toggleFavoriteCrop(c.key)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Remove from Favorite Watchlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Active Mandi Price Triggers ── */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                <Bell className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="font-extrabold text-lg sm:text-xl text-slate-900">
                Active Mandi Price Triggers
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-200">
                {priceAlerts.length} Active
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              You will be automatically notified via SMS & push alert whenever APMC auction transactions meet your target price.
            </p>
          </div>

          <button
            onClick={() => {
              setCrop('Cotton (Kapas)');
              setMandi('Nagpur APMC');
              setTargetPrice(7500);
              setIsAlertModalOpen(true);
            }}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-4 h-4 text-emerald-400" /> New Price Trigger
          </button>
        </div>

        {/* Price Alerts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {priceAlerts.length === 0 ? (
            <div className="col-span-full text-center py-8 px-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <Bell className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-bold text-xs text-slate-600">No active price alert triggers configured yet.</p>
              <p className="text-[11px] text-slate-400">Click on "Set Alert" on any crop card above or click "+ Create Price Alert" to begin.</p>
            </div>
          ) : (
            priceAlerts.map(alt => (
              <div 
                key={alt.id} 
                className="p-5 bg-gradient-to-r from-slate-50 to-emerald-50/30 rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-2xs transition-all flex items-start justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                      {alt.condition === 'below' ? 'FALLS BELOW' : 'EXCEEDS'}
                    </span>
                    <span className="text-xs font-black text-slate-900">
                      ₹{Number(alt.targetPrice)?.toLocaleString('en-IN')} / qtl
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900">
                    {alt.commodity || alt.crop}
                  </h4>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span>📍 Market: <strong className="text-slate-700">{alt.market || alt.mandi || 'All APMC Mandis'}</strong></span>
                    {alt.created_at && (
                      <span>• Added: {alt.created_at}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    ACTIVE
                  </span>
                  {removePriceAlert && (
                    <button 
                      onClick={() => removePriceAlert(alt.id)} 
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors" 
                      title="Delete price alert"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL 1: ADD CROP TO WATCHLIST ──                                   */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {isAddCropModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-agri-950 to-emerald-950 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
                  <Star className="w-6 h-6 fill-emerald-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg sm:text-xl">Add Crops to Favorite Watchlist</h3>
                  <p className="text-xs text-slate-300">Choose from all major Indian commodities to monitor live APMC prices</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddCropModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
              {/* Quick Recommendations */}
              <div className="space-y-2">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                  Quick Add Popular Crops
                </span>
                <div className="flex flex-wrap gap-2">
                  {popularCrops.map(pop => {
                    const isAdded = (favoriteCrops || []).some(f => 
                      String(f).toLowerCase().trim() === pop.key.toLowerCase() ||
                      String(f).toLowerCase().trim() === pop.name.toLowerCase()
                    );
                    return (
                      <button
                        key={pop.key}
                        onClick={() => toggleFavoriteCrop(pop.key)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                          isAdded 
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-400 shadow-2xs' 
                            : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border-slate-200'
                        }`}
                      >
                        <span>{pop.emoji}</span>
                        <span>{pop.name}</span>
                        {isAdded ? (
                          <Check className="w-3.5 h-3.5 text-emerald-700" />
                        ) : (
                          <Plus className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Search & Category Filter Controls */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={cropSearch}
                    onChange={(e) => setCropSearch(e.target.value)}
                    placeholder="Search crop name in English, Hindi, or Marathi (e.g. Cotton, Soybean, Chana, Wheat)..."
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 font-semibold focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-colors"
                  />
                  {cropSearch && (
                    <button 
                      onClick={() => setCropSearch('')} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Category Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                        selectedCategory === cat
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Commodity Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                {filteredAllCrops.length === 0 ? (
                  <div className="col-span-full text-center py-10 text-slate-400 text-xs">
                    No crops found matching "{cropSearch}".
                  </div>
                ) : (
                  filteredAllCrops.map(c => {
                    const isAdded = (favoriteCrops || []).some(f => 
                      String(f).toLowerCase().trim() === c.key.toLowerCase() ||
                      String(f).toLowerCase().trim() === c.name.toLowerCase()
                    );

                    return (
                      <div 
                        key={c.key} 
                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          isAdded 
                            ? 'bg-emerald-50/70 border-emerald-300 shadow-2xs' 
                            : 'bg-white hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-2xl p-2 bg-slate-100 rounded-xl shrink-0">
                            {c.emoji}
                          </span>
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs text-slate-900 truncate">
                              {c.name}
                            </h4>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                              <span>{c.category}</span>
                              <span>•</span>
                              <span className="font-extrabold text-agri-700">₹{c.modal?.toLocaleString('en-IN')}/qtl</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => toggleFavoriteCrop(c.key)}
                          className={`px-3 py-2 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-1 ${
                            isAdded
                              ? 'bg-emerald-600 hover:bg-rose-600 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-emerald-500 hover:text-slate-950 text-slate-800 border border-slate-200'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" /> Added
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" /> Add
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500 font-medium">
                {favoriteCropObjects.length} crops selected in your watchlist
              </span>
              <button
                onClick={() => setIsAddCropModalOpen(false)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL 2: CREATE MANDI PRICE ALERT ──                                */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {isAlertModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-agri-950 to-emerald-950 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Create Mandi Price Alert</h3>
                  <p className="text-[11px] text-slate-300">Receive automated notification on price triggers</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAlertModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateAlert} className="p-6 space-y-4 text-xs">
              {/* Crop Picker */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  Select Crop / Commodity
                </label>
                <select
                  value={crop}
                  onChange={(e) => {
                    const chosen = e.target.value;
                    setCrop(chosen);
                    const matched = ALL_CROPS.find(c => c.name === chosen || c.key === chosen);
                    if (matched) {
                      setTargetPrice(Math.round((matched.modal * 1.05) / 50) * 50);
                      setMandi(matched.market || 'Nagpur APMC');
                    }
                  }}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                >
                  <optgroup label="My Watchlist Crops">
                    {favoriteCropObjects.map(c => (
                      <option key={`fav-${c.key}`} value={c.name}>{c.emoji} {c.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="All Agricultural Commodities">
                    {ALL_CROPS.map(c => (
                      <option key={`all-${c.key}`} value={c.name}>{c.emoji} {c.name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Target Mandi Picker */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  Target APMC Market / Mandi
                </label>
                <input 
                  type="text" 
                  value={mandi} 
                  onChange={e => setMandi(e.target.value)} 
                  placeholder="e.g. Nagpur APMC, Nashik APMC, All Mandis"
                  list="mandi-suggestions"
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden" 
                  required 
                />
                <datalist id="mandi-suggestions">
                  <option value="All Mandis (Statewide)" />
                  <option value="Nagpur APMC" />
                  <option value="Nashik APMC" />
                  <option value="Pune Gultekdi" />
                  <option value="Akola APMC" />
                  <option value="Amravati Ganj" />
                  <option value="Kolhapur APMC" />
                  <option value="Lasalgaon Mandi" />
                  <option value="Jalna APMC" />
                  <option value="Latur Mandi" />
                </datalist>
              </div>

              {/* Trigger Condition Radio */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  Alert Trigger Condition
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCondition('above')}
                    className={`py-2 px-3 rounded-xl font-bold border text-center transition-all ${
                      condition === 'above'
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    📈 Price Rises (≥)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCondition('below')}
                    className={`py-2 px-3 rounded-xl font-bold border text-center transition-all ${
                      condition === 'below'
                        ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    📉 Price Drops (≤)
                  </button>
                </div>
              </div>

              {/* Target Trigger Price */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  Target Trigger Price (₹ per Quintal)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-slate-400">₹</span>
                  <input 
                    type="number" 
                    value={targetPrice} 
                    onChange={e => setTargetPrice(Number(e.target.value))} 
                    className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden" 
                    required 
                    min="100" 
                    step="50"
                  />
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <button 
                    type="button"
                    onClick={() => setTargetPrice(p => p + 100)}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-md font-bold text-[10px] text-slate-700"
                  >
                    +₹100
                  </button>
                  <button 
                    type="button"
                    onClick={() => setTargetPrice(p => p + 500)}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-md font-bold text-[10px] text-slate-700"
                  >
                    +₹500
                  </button>
                  <button 
                    type="button"
                    onClick={() => setTargetPrice(p => Math.max(100, p - 100))}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-md font-bold text-[10px] text-slate-700"
                  >
                    -₹100
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
              >
                <Bell className="w-4 h-4 fill-slate-950" /> Activate Price Alert
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
