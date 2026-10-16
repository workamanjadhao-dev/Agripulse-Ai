import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CROPS, MANDIS, TRACTORS, EQUIPMENT, VEHICLES, STORAGES } from '../data/mockData';
import { Search, X, TrendingUp, Store, Tractor, Truck, Warehouse } from 'lucide-react';

export const GlobalSearchModal = () => {
  const { isSearchOpen, setIsSearchOpen, t } = useApp();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  if (!isSearchOpen) return null;

  const handleSelect = (path) => {
    setIsSearchOpen(false);
    setQuery('');
    navigate(path);
  };

  const filteredCrops = CROPS.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));
  const filteredMandis = MANDIS.filter(m => m.name.toLowerCase().includes(query.toLowerCase()) || m.district.toLowerCase().includes(query.toLowerCase()));
  const filteredTractors = TRACTORS.filter(t => t.name.toLowerCase().includes(query.toLowerCase()) || t.brand.toLowerCase().includes(query.toLowerCase()));
  const filteredEquipment = EQUIPMENT.filter(e => e.name.toLowerCase().includes(query.toLowerCase()));
  const filteredVehicles = VEHICLES.filter(v => v.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 px-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-agri-600 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full text-sm sm:text-base outline-none bg-transparent text-slate-800 placeholder-slate-400 font-medium"
            autoFocus
          />
          <button 
            onClick={() => setIsSearchOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          
          {!query && (
            <div className="text-center py-8 text-slate-400 text-xs">
              Type anything to search across the entire AgriPulse system...
            </div>
          )}

          {query && (
            <>
              {/* Crops */}
              {filteredCrops.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-agri-600" /> Crops & Price Forecasts
                  </h4>
                  <div className="space-y-1">
                    {filteredCrops.map(crop => (
                      <div
                        key={crop.id}
                        onClick={() => handleSelect(`/forecasting?crop=${crop.id}`)}
                        className="p-2.5 hover:bg-agri-50 rounded-xl cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <span className="text-xs font-semibold text-slate-800">{crop.name}</span>
                        <span className="text-xs font-bold text-agri-700">{crop.currentAvgPrice} {crop.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mandis */}
              {filteredMandis.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-amber-600" /> Nearby Mandis
                  </h4>
                  <div className="space-y-1">
                    {filteredMandis.map(mandi => (
                      <div
                        key={mandi.id}
                        onClick={() => handleSelect(`/markets?mandi=${mandi.id}`)}
                        className="p-2.5 hover:bg-amber-50 rounded-xl cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{mandi.name}</p>
                          <p className="text-[10px] text-slate-500">{mandi.district}, {mandi.state}</p>
                        </div>
                        <span className="text-xs font-medium text-slate-600">{mandi.distanceKm} km away</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tractors & Equipment */}
              {(filteredTractors.length > 0 || filteredEquipment.length > 0) && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Tractor className="w-3.5 h-3.5 text-emerald-600" /> Machinery & Implements
                  </h4>
                  <div className="space-y-1">
                    {filteredTractors.map(tr => (
                      <div
                        key={tr.id}
                        onClick={() => handleSelect('/tractors')}
                        className="p-2.5 hover:bg-emerald-50 rounded-xl cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <span className="text-xs font-semibold text-slate-800">{tr.name} ({tr.hp} HP)</span>
                        <span className="text-xs font-bold text-slate-700">₹{tr.ratePerDay}/day</span>
                      </div>
                    ))}
                    {filteredEquipment.map(eq => (
                      <div
                        key={eq.id}
                        onClick={() => handleSelect('/equipment')}
                        className="p-2.5 hover:bg-emerald-50 rounded-xl cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <span className="text-xs font-semibold text-slate-800">{eq.name}</span>
                        <span className="text-xs font-bold text-slate-700">₹{eq.ratePerDay}/day</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vehicles */}
              {filteredVehicles.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-blue-600" /> Agricultural Transport
                  </h4>
                  <div className="space-y-1">
                    {filteredVehicles.map(vh => (
                      <div
                        key={vh.id}
                        onClick={() => handleSelect('/transport')}
                        className="p-2.5 hover:bg-blue-50 rounded-xl cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <span className="text-xs font-semibold text-slate-800">{vh.title}</span>
                        <span className="text-xs font-bold text-slate-700">₹{vh.ratePerKm}/km</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </>
          )}

        </div>

      </div>
    </div>
  );
};
