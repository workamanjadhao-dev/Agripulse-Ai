import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import { 
  ShoppingBag, 
  MapPin, 
  Search, 
  Phone, 
  CheckCircle2, 
  Plus, 
  Sparkles, 
  TrendingUp, 
  X, 
  ArrowRight,
  Filter,
  DollarSign,
  Scale,
  RotateCcw
} from 'lucide-react';
import { ALL_CROPS } from '../data/allCrops';

const DEFAULT_BUYERS = [
  {
    id: 'byr-1',
    business_name: 'Vidarbha Agro Mills Ltd.',
    crop_required: 'Soybean (Yellow)',
    quantity_required: 100,
    location: 'Nagpur, Maharashtra',
    price_offered: 4850,
    status: 'Active',
    contact_phone: '+91 98222 33445',
    notes: 'Grade-A oilseed quality required for solvent extraction plant. Spot RTGS settlement.'
  },
  {
    id: 'byr-2',
    business_name: 'Kalamna Grain Traders & Exporters',
    crop_required: 'Cotton (Kapas)',
    quantity_required: 80,
    location: 'Nagpur APMC Yard',
    price_offered: 7450,
    status: 'Active',
    contact_phone: '+91 98210 99881',
    notes: 'Long-staple Shankar-6 preferred. Direct farm pickup available via AgriPulse logistics.'
  },
  {
    id: 'byr-3',
    business_name: 'Shree Ganesh Flour Mills',
    crop_required: 'Wheat (Lokwan)',
    quantity_required: 150,
    location: 'Kalmeshwar, Nagpur',
    price_offered: 2550,
    status: 'Active',
    contact_phone: '+91 94221 44556',
    notes: 'Clean Lokwan wheat, moisture < 11.5%. Immediate weighing and digital voucher payment.'
  },
  {
    id: 'byr-4',
    business_name: 'Nashik Onion Export Aggregators',
    crop_required: 'Red Onion',
    quantity_required: 120,
    location: 'Lasalgaon, Nashik',
    price_offered: 2950,
    status: 'Active',
    contact_phone: '+91 94220 11990',
    notes: 'Medium-to-large size bulbs suitable for Gulf container dispatch. Crates provided.'
  },
  {
    id: 'byr-5',
    business_name: 'Wardha Cotton Ginning Consortium',
    crop_required: 'Cotton (Kapas)',
    quantity_required: 200,
    location: 'MIDC Sevagram, Wardha',
    price_offered: 7520,
    status: 'Active',
    contact_phone: '+91 98230 77889',
    notes: 'Premium incentive for dry, trash-free cotton bolls. Farm pickup available.'
  }
];

const DEFAULT_MATCHES = [
  {
    matchId: 'mtch-1',
    cropName: 'Cotton (Kapas)',
    farmerQuantity: 36,
    farmerLocation: 'Wardha, Maharashtra',
    buyerName: 'Kalamna Grain Traders & Exporters',
    buyerLocation: 'Nagpur APMC Yard',
    offeredPrice: 7450,
    matchScore: 96,
    logisticsSavings: '₹ 4,200',
    notes: 'Direct farm pickup available with weighbridge verification at Wardha.'
  },
  {
    matchId: 'mtch-2',
    cropName: 'Soybean (Yellow)',
    farmerQuantity: 24,
    farmerLocation: 'Wardha, Maharashtra',
    buyerName: 'Vidarbha Agro Mills Ltd.',
    buyerLocation: 'Nagpur, Maharashtra',
    offeredPrice: 4850,
    matchScore: 92,
    logisticsSavings: '₹ 2,800',
    notes: 'Optimal matching: Buyer warehouse is within 45km of harvest plot.'
  },
  {
    matchId: 'mtch-3',
    cropName: 'Red Onion',
    farmerQuantity: 60,
    farmerLocation: 'Nashik, Maharashtra',
    buyerName: 'Nashik Onion Export Aggregators',
    buyerLocation: 'Lasalgaon, Nashik',
    offeredPrice: 2950,
    matchScore: 94,
    logisticsSavings: '₹ 3,500',
    notes: 'Direct transit to cold storage bay with pre-agreed export standard.'
  }
];

export const FarmerMarketplace = () => {
  const { showToast, role } = useApp();
  const [activeTab, setActiveTab] = useState('buyers'); // 'buyers' | 'matches'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('All');

  const [buyersList, setBuyersList] = useState(() => {
    try {
      const saved = localStorage.getItem('agri_custom_buyers');
      return saved ? JSON.parse(saved) : DEFAULT_BUYERS;
    } catch {
      return DEFAULT_BUYERS;
    }
  });

  const [matchesList, setMatchesList] = useState(DEFAULT_MATCHES);
  const [isLoading, setIsLoading] = useState(false);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedBuyerForOffer, setSelectedBuyerForOffer] = useState(null);

  // Form State for creating a buyer requirement listing
  const [businessName, setBusinessName] = useState('');
  const [cropRequired, setCropRequired] = useState('Cotton (Kapas)');
  const [quantityRequired, setQuantityRequired] = useState(100);
  const [location, setLocation] = useState('Nagpur, Maharashtra');
  const [priceOffered, setPriceOffered] = useState(7400);
  const [contactPhone, setContactPhone] = useState('+91 98220 11223');
  const [notes, setNotes] = useState('Moisture under 10%, spot payment on delivery.');

  const cropsFilterOptions = ['All', ...ALL_CROPS.map(c => c.name)];

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [bRes, mRes] = await Promise.allSettled([
        api.getBuyers({ crop: selectedCrop !== 'All' ? selectedCrop : undefined }),
        api.getMatches({ crop: selectedCrop !== 'All' ? selectedCrop : undefined })
      ]);

      if (bRes.status === 'fulfilled' && bRes.value && bRes.value.data && bRes.value.data.length > 0) {
        const localSaved = JSON.parse(localStorage.getItem('agri_custom_buyers') || '[]');
        const customOnly = localSaved.filter(ls => !bRes.value.data.some(d => d.id === ls.id));
        setBuyersList([...bRes.value.data, ...customOnly]);
      } else {
        const localSaved = JSON.parse(localStorage.getItem('agri_custom_buyers') || '[]');
        setBuyersList(localSaved.length > 0 ? localSaved : DEFAULT_BUYERS);
      }

      if (mRes.status === 'fulfilled' && mRes.value && mRes.value.data && mRes.value.data.length > 0) {
        setMatchesList(mRes.value.data);
      } else {
        setMatchesList(DEFAULT_MATCHES);
      }
    } catch (err) {
      console.warn('Marketplace fetch fallback:', err.message);
      const localSaved = JSON.parse(localStorage.getItem('agri_custom_buyers') || '[]');
      setBuyersList(localSaved.length > 0 ? localSaved : DEFAULT_BUYERS);
      setMatchesList(DEFAULT_MATCHES);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCrop]);

  const handleCreateListing = async (e) => {
    e.preventDefault();
    try {
      const newBuyer = {
        id: `byr-${Date.now()}`,
        business_name: businessName,
        crop_required: cropRequired,
        quantity_required: Number(quantityRequired),
        location,
        price_offered: Number(priceOffered),
        contact_phone: contactPhone,
        notes,
        status: 'Active'
      };

      const updated = [newBuyer, ...buyersList];
      setBuyersList(updated);
      try {
        localStorage.setItem('agri_custom_buyers', JSON.stringify(updated));
      } catch (e) {}

      try {
        await api.createBuyer({
          business_name: businessName,
          crop_required: cropRequired,
          quantity_required: Number(quantityRequired),
          location,
          price_offered: Number(priceOffered),
          contact_phone: contactPhone,
          notes
        });
      } catch (backendErr) {
        console.warn('Backend sync pending for buyer listing:', backendErr.message);
      }

      showToast('Buyer requirement listing posted to marketplace!', 'success');
      setIsAddModalOpen(false);
      setBusinessName('');
    } catch (err) {
      showToast(err.message || 'Failed to create listing', 'error');
    }
  };

  const handleRestoreDefaults = () => {
    localStorage.removeItem('agri_custom_buyers');
    setBuyersList(DEFAULT_BUYERS);
    setMatchesList(DEFAULT_MATCHES);
    setSelectedCrop('All');
    setSearchQuery('');
    showToast('Marketplace listings restored to defaults!', 'info');
  };

  const handleSendOffer = (buyer) => {
    showToast(`Purchase offer initiated with ${buyer.business_name}! Calling ${buyer.contact_phone}...`, 'success');
    setSelectedBuyerForOffer(null);
  };

  const filteredBuyers = buyersList.filter(b => {
    const query = searchQuery.toLowerCase().trim();
    const matchSearch = !query ||
      b.business_name?.toLowerCase().includes(query) ||
      b.crop_required?.toLowerCase().includes(query) ||
      b.location?.toLowerCase().includes(query);

    const matchCrop = selectedCrop === 'All' || 
      (b.crop_required && b.crop_required.toLowerCase().includes(selectedCrop.toLowerCase()));

    return matchSearch && matchCrop;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-agri-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-agri-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-agri-200 border border-white/10">
            <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
            <span>Direct Farmer-to-Trader Marketplace & Sourcing Engine</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Agricultural Buyer & Trader Marketplace
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Connect certified wholesale buyers, millers, and aggregators directly with regional harvest batches without intermediary broker fees.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2 shrink-0 hover:scale-105 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Post Buyer Requirement</span>
        </button>
      </div>

      {/* Tabs & Filter Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto">
          <button
            onClick={() => setActiveTab('buyers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'buyers' ? 'bg-agri-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Buyer Requirements ({filteredBuyers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'matches' ? 'bg-agri-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Algorithmic Matches ({matchesList.length})</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="text-xs font-bold py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-agri-500"
            >
              <option value="All">All Crops ({cropsFilterOptions.length - 1})</option>
              {cropsFilterOptions.filter(c => c !== 'All').map((crop) => (
                <option key={crop} value={crop}>{crop}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-64 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search trader, crop, or city..."
              className="w-full text-xs bg-transparent outline-none text-slate-800 placeholder-slate-400 font-medium"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={handleRestoreDefaults}
            className="text-[11px] font-bold text-slate-500 hover:text-agri-700 flex items-center gap-1 transition-colors px-2 py-1 rounded-lg border border-slate-200"
            title="Restore default marketplace listings"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Restore</span>
          </button>
        </div>
      </div>

      {/* TAB 1: BUYER REQUIREMENTS LIST */}
      {activeTab === 'buyers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBuyers.length === 0 ? (
            <div className="col-span-full bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400 space-y-3">
              <ShoppingBag className="w-12 h-12 mx-auto text-slate-300" />
              <p className="font-bold text-slate-700">No buyer requirements found matching your search filter.</p>
              <button
                onClick={handleRestoreDefaults}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-emerald-700"
              >
                Reset Filters & View All
              </button>
            </div>
          ) : (
            filteredBuyers.map(byr => (
              <div key={byr.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl transition-all space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                        {byr.status || 'Active Requirement'}
                      </span>
                      <h3 className="font-extrabold text-lg text-slate-900 mt-2">{byr.crop_required}</h3>
                      <p className="text-xs font-semibold text-slate-600">{byr.business_name}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 font-medium block">Price Offered</span>
                      <span className="font-extrabold text-agri-700 text-lg">
                        ₹{byr.price_offered?.toLocaleString('en-IN')}
                        <span className="text-xs font-normal text-slate-500">/qtl</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs mt-3">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Quantity Required</span>
                      <span className="font-bold text-slate-800">{byr.quantity_required} Quintals</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Procurement Location</span>
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" /> {byr.location}
                      </span>
                    </div>
                    {byr.notes && (
                      <div className="pt-1 border-t border-slate-200 text-[11px] text-slate-600 italic">
                        "{byr.notes}"
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setSelectedBuyerForOffer(byr)}
                    className="w-full py-3 bg-agri-600 hover:bg-agri-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Phone className="w-4 h-4" /> Contact Buyer & Offer Produce
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: AI FARMER-BUYER MATCHES */}
      {activeTab === 'matches' && (
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-emerald-950 to-slate-900 text-white rounded-2xl border border-emerald-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-300 shrink-0" />
              <p className="text-xs font-medium">
                Our algorithmic matching evaluates crop type, quantity overlap, farmer location, buyer location, and net realized price.
              </p>
            </div>
            <span className="text-xs font-extrabold bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-400/30 shrink-0">
              {matchesList.length} High-Affinity Matches
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matchesList.length === 0 ? (
              <div className="col-span-full bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400">
                <p className="font-bold text-slate-700">No active matches found.</p>
                <p className="text-xs mt-1">Register crops in My Farm and ensure buyer requirements are listed.</p>
              </div>
            ) : (
              matchesList.map((m, idx) => (
                <div key={m.matchId || idx} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl transition-all space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
                          {m.matchScore || 95}% Match Affinity
                        </span>
                        <h3 className="font-extrabold text-lg text-slate-900 mt-2">{m.cropName}</h3>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 font-medium block">Net Rate</span>
                        <span className="font-extrabold text-emerald-700 text-lg">
                          ₹{(m.offeredPrice || m.buyer_offered_price || 7450).toLocaleString('en-IN')}/qtl
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs mt-3">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Prospective Buyer</span>
                        <span className="font-bold text-slate-800">{m.buyerName || m.buyer_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Farmer Plot & Destination</span>
                        <span className="font-semibold text-slate-800 text-right">
                          {m.farmerLocation || 'Wardha Farm'} → {m.buyerLocation || 'Nagpur'}
                        </span>
                      </div>
                      {m.notes && (
                        <div className="pt-1 border-t border-slate-200 text-[11px] text-slate-600 italic">
                          "{m.notes}"
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => handleSendOffer({ business_name: m.buyerName || m.buyer_name, contact_phone: '+91 98222 33445' })}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Accept Match & Initiate Direct Deal
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal: Post Buyer Requirement */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-lg text-slate-900">Post Sourcing Requirement</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Company / Mill / Trader Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mahavira Agro Oil Mills Ltd."
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-agri-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Commodity Required</label>
                  <select
                    value={cropRequired}
                    onChange={(e) => setCropRequired(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-agri-500"
                  >
                    {ALL_CROPS.map(c => (
                      <option key={c.key} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Quantity (Quintals)</label>
                  <input
                    type="number"
                    required
                    value={quantityRequired}
                    onChange={(e) => setQuantityRequired(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-agri-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Price Offered (₹ / Qtl)</label>
                  <input
                    type="number"
                    required
                    value={priceOffered}
                    onChange={(e) => setPriceOffered(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-agri-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-agri-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Procurement Yard / Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nagpur APMC Yard / Wardha Mill"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-agri-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Procurement Notes / Quality Spec</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-agri-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Publish Sourcing Requirement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Direct Offer Confirmation */}
      {selectedBuyerForOffer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900">Initiate Deal with Trader</h3>
              <button onClick={() => setSelectedBuyerForOffer(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2 text-xs">
              <p className="font-bold text-emerald-900 text-sm">{selectedBuyerForOffer.business_name}</p>
              <p className="text-emerald-800">Commodity: <strong>{selectedBuyerForOffer.crop_required}</strong></p>
              <p className="text-emerald-800">Target Rate: <strong>₹{selectedBuyerForOffer.price_offered}/qtl</strong></p>
              <p className="text-emerald-800">Location: {selectedBuyerForOffer.location}</p>
            </div>

            <p className="text-xs text-slate-500">
              Connecting with verified trader via direct phone. Zero platform commission fees on farmer harvest transactions.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedBuyerForOffer(null)}
                className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <a
                href={`tel:${selectedBuyerForOffer.contact_phone}`}
                onClick={() => handleSendOffer(selectedBuyerForOffer)}
                className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md"
              >
                <Phone className="w-4 h-4" /> Call Trader Now
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
