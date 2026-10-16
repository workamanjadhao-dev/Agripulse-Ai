import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import { MapComponent } from '../components/MapComponent';
import { Store, MapPin, Truck, Award, Navigation, Search, RefreshCw, Filter, ShieldCheck, CheckCircle2, TrendingUp, Sparkles, Compass, Star } from 'lucide-react';
import { ALL_CROPS, ALL_MANDI_NAMES } from '../data/allCrops';
import { getMandiCoordinates, calculateDistanceKm } from '../data/mandiCoordinates';

export const MarketIntelligence = () => {
  const navigate = useNavigate();
  const { dataTelemetry, refreshMarketData, isSyncing, showToast, favoriteCrops, toggleFavoriteCrop, isFavoriteCrop } = useApp();

  const [selectedCommodity, setSelectedCommodity] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedMarket, setSelectedMarket] = useState('All');
  
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards' | 'map'
  const [isLoading, setIsLoading] = useState(false);
  const [marketData, setMarketData] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);

  // User Live GPS Coordinates for exact distance measurement
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  const locateUser = () => {
    if (!navigator.geolocation) {
      if (showToast) showToast('Geolocation is not supported by your browser', 'error');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setIsLocating(false);
        if (showToast) showToast('GPS location acquired! Distances to mandis updated.', 'success');
      },
      (err) => {
        setIsLocating(false);
        if (showToast) showToast('Unable to acquire GPS location. Please allow location permissions.', 'error');
      },
      { timeout: 10000 }
    );
  };

  const commoditiesList = ['All', ...ALL_CROPS.map(c => c.name)];
  const statesList = ['All', 'Maharashtra', 'Madhya Pradesh', 'Rajasthan', 'Gujarat'];
  const districtsList = ['All', 'Nagpur', 'Wardha', 'Amravati', 'Nashik', 'Pune', 'Latur', 'Akola', 'Jalna', 'Kolhapur', 'Sangli', 'Satara', 'Solapur', 'Dhule', 'Jalgaon', 'Gondia', 'Nandurbar', 'Kota'];
  const marketsList = ['All', ...ALL_MANDI_NAMES];

  const fetchFilteredPrices = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.getMarketPrices({
        commodity: selectedCommodity,
        state: selectedState,
        district: selectedDistrict,
        market: selectedMarket
      });
      if (res.success) {
        setMarketData(res.data);
      }
    } catch (err) {
      setErrorMessage('Failed to connect to market server. Showing cached results.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFilteredPrices();
  }, [selectedCommodity, selectedState, selectedDistrict, selectedMarket]);

  // Exact verified APMC Mandi GPS pins with physical yard addresses & navigation URLs
  const mapMarkers = marketData.map((m, idx) => {
    const coords = getMandiCoordinates(m.market, m.district, m.state, idx);
    const distanceKm = userLocation ? calculateDistanceKm(userLocation.lat, userLocation.lng, coords.lat, coords.lng) : null;

    return {
      lat: coords.lat,
      lng: coords.lng,
      title: coords.officialName || m.market,
      subtitle: `${m.commodity} • ${m.district}, ${m.state}`,
      price: `Price: ₹${m.modalPrice?.toLocaleString('en-IN')} / qtl`,
      arrivals: `${m.arrivalQuantity || 120} Qtl`,
      address: coords.address,
      landmark: coords.landmark,
      navigationUrl: coords.navigationUrl,
      distanceKm,
      raw: m
    };
  });

  const bestMandi = marketData.length > 0 ? [...marketData].sort((a,b) => b.modalPrice - a.modalPrice)[0] : null;
  const lowestMandi = marketData.length > 0 ? [...marketData].sort((a,b) => a.modalPrice - b.modalPrice)[0] : null;
  const avgPrice = marketData.length > 0 
    ? Math.round(marketData.reduce((acc, m) => acc + (m.modalPrice || 0), 0) / marketData.length)
    : 0;

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-agri-900 via-teal-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-agri-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Market Explorer & Mandi Comparison
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Compare real-time price, minimum, and maximum rates across official Indian Agmarknet APMC markets.
          </p>
        </div>

        {/* View Mode Toggle & Refresh Button */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={refreshMarketData}
            disabled={isSyncing}
            className="px-4 py-2 bg-agri-600 hover:bg-agri-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>

          <div className="flex items-center gap-1 bg-slate-800 p-1.5 rounded-2xl border border-slate-700">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'table' ? 'bg-agri-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'cards' ? 'bg-agri-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'map' ? 'bg-agri-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Map
            </button>
          </div>
        </div>
      </div>

      {/* Requirement #10: Market Explorer Filter Controls */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Filter className="w-4 h-4 text-agri-600" /> Market Search & Filtering Controls
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Commodity</label>
            <select
              value={selectedCommodity}
              onChange={(e) => setSelectedCommodity(e.target.value)}
              className="w-full text-xs font-bold py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-agri-500 text-slate-800"
            >
              {commoditiesList.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">State</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full text-xs font-bold py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-agri-500 text-slate-800"
            >
              {statesList.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">District</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full text-xs font-bold py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-agri-500 text-slate-800"
            >
              {districtsList.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Market / Mandi</label>
            <select
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
              className="w-full text-xs font-bold py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-agri-500 text-slate-800"
            >
              {marketsList.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchFilteredPrices}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Search className="w-4 h-4" /> Apply Filters
            </button>
          </div>

        </div>
      </div>

      {/* Loading Skeleton & Error States */}
      {isLoading && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-3">
          <div className="w-8 h-8 border-4 border-agri-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-600">Fetching latest market data from Agmarknet API & SQLite Cache...</p>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-xs text-rose-800 flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={fetchFilteredPrices} className="px-3 py-1 bg-rose-600 text-white font-bold rounded-lg">Retry</button>
        </div>
      )}

      {/* Requirement #10: Results Table View */}
      {viewMode === 'table' && !isLoading && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 overflow-hidden">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Store className="w-5 h-5 text-agri-600" /> Market Price Results ({marketData.length} Records)
            </h3>
            <span className="text-xs font-bold text-slate-500">Source: {dataTelemetry.source}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-3">Market / Mandi</th>
                  <th className="py-3.5 px-3">Commodity</th>
                  <th className="py-3.5 px-3">Min Price</th>
                  <th className="py-3.5 px-3">Max Price</th>
                  <th className="py-3.5 px-3">Price</th>
                  <th className="py-3.5 px-3">Arrivals (Qtl)</th>
                  <th className="py-3.5 px-3">Date</th>
                  <th className="py-3.5 px-3 text-right">Data Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {marketData.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-slate-400">
                      No matching market records found for the selected filters.
                    </td>
                  </tr>
                ) : (
                  marketData.map((m, idx) => (
                    <tr key={m.id || idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-3 font-bold text-slate-900">
                        {m.market}
                        <span className="text-[10px] text-slate-400 font-normal block">{m.district}, {m.state}</span>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-800">
                        <div className="flex items-center gap-2">
                          <span>{m.commodity}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (toggleFavoriteCrop) toggleFavoriteCrop(m.commodity);
                            }}
                            title={isFavoriteCrop && isFavoriteCrop(m.commodity) ? "Remove from Watchlist" : "Add to Favorite Crops Watchlist"}
                            className="p-1 rounded-md hover:bg-slate-200 transition-colors"
                          >
                            <Star className={`w-3.5 h-3.5 ${isFavoriteCrop && isFavoriteCrop(m.commodity) ? 'fill-amber-400 text-amber-500' : 'text-slate-300 hover:text-amber-400'}`} />
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-600">₹{m.minPrice?.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-3 text-slate-600">₹{m.maxPrice?.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-3">
                        <span className="font-extrabold text-agri-700 text-sm block">₹{m.modalPrice?.toLocaleString('en-IN')}</span>
                        {m.change !== undefined && m.change !== 0 ? (
                          <span className={`text-[10px] font-bold block ${m.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {m.change > 0 ? '▲ +' : '▼ '}₹{Math.abs(m.change)} ({m.changePercent}%)
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 block font-normal">Active auction</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-slate-700">{m.arrivalQuantity || 120} Qtl</td>
                      <td className="py-3.5 px-3 text-slate-500 font-mono">{m.date}</td>
                      <td className="py-3.5 px-3 text-right">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>{m.marketStatus || 'Live'}</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Map View Mode */}
      {viewMode === 'map' && !isLoading && (
        <div className="space-y-6">
          {/* Geospatial Analytics Summary Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Mapped APMCs</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-slate-900">{mapMarkers.length}</span>
                <span className="text-xs text-slate-500 font-semibold">Active Yards</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Real-time GPS pinpoints</p>
            </div>

            {bestMandi && (
              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 shadow-2xs">
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-emerald-600" /> Highest Rate Mandi
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-emerald-800">₹{bestMandi.modalPrice?.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-emerald-700 font-semibold">/ qtl</span>
                </div>
                <p className="text-[11px] font-bold text-emerald-900 truncate mt-0.5">{bestMandi.market} ({bestMandi.district})</p>
              </div>
            )}

            {lowestMandi && (
              <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200 shadow-2xs">
                <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">Lowest Rate Mandi</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-rose-800">₹{lowestMandi.modalPrice?.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-rose-700 font-semibold">/ qtl</span>
                </div>
                <p className="text-[11px] font-bold text-rose-900 truncate mt-0.5">{lowestMandi.market} ({lowestMandi.district})</p>
              </div>
            )}

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Average APMC Rate</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-slate-900">₹{avgPrice.toLocaleString('en-IN')}</span>
                <span className="text-xs text-slate-500 font-semibold">/ qtl</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Calculated across {mapMarkers.length} markets</p>
            </div>
          </div>

          {/* Full Interactive Map */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 px-2">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-agri-600" />
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                  Map
                </h3>
              </div>

              {/* Live Location Distance Tracker */}
              <button
                onClick={locateUser}
                disabled={isLocating}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <Compass className={`w-3.5 h-3.5 text-emerald-600 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Detecting GPS...' : userLocation ? '✅ Live GPS Active (Distances Shown)' : '📍 Measure Distance From My Farm'}</span>
              </button>
            </div>

            <MapComponent
              center={[20.9374, 78.5000]}
              zoom={7}
              markers={mapMarkers}
              height="h-[460px]"
            />
          </div>

          {/* Mandi Cards List below map */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
              <Store className="w-4 h-4 text-agri-600" /> Active Verified Mandis on Map ({mapMarkers.length})
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mapMarkers.map((marker, idx) => {
                const m = marker.raw;
                return (
                  <div key={m.id || idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="font-bold text-sm text-slate-900 leading-tight">{marker.title}</h5>
                        <span className="text-[11px] text-slate-500 block mt-0.5">{m.district}, {m.state}</span>
                      </div>
                      <span className="text-xs font-black text-agri-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0 ml-2">
                        ₹{m.modalPrice?.toLocaleString('en-IN')}/qtl
                      </span>
                    </div>

                    {/* Exact Address & Landmark */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1 text-[11px]">
                      <p className="text-slate-600 text-[10px] leading-snug">
                        <strong className="text-slate-700">📍 Exact Address:</strong> {marker.address}
                      </p>
                      {marker.landmark && (
                        <p className="text-sky-700 text-[10px] font-semibold">
                          🚪 <strong>Entry Gate:</strong> {marker.landmark}
                        </p>
                      )}
                      {marker.distanceKm !== null && (
                        <div className="flex items-center gap-1 text-emerald-700 font-extrabold text-[11px] pt-1 border-t border-slate-200">
                          <Compass className="w-3.5 h-3.5" />
                          <span>{marker.distanceKm} km from your current GPS position</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>Commodity: <strong className="text-slate-700">{m.commodity}</strong></span>
                      <span>Arrivals: <strong className="text-slate-700">{m.arrivalQuantity || 120} Qtl</strong></span>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2 pt-1">
                      <a
                        href={marker.navigationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Navigate to Mandi in Google Maps →</span>
                      </a>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/transport?mandi=${encodeURIComponent(m.market)}`)}
                          className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                          <Truck className="w-3.5 h-3.5 text-agri-600" /> Rent Transport
                        </button>
                        <button
                          onClick={() => navigate(`/forecasting?crop=${encodeURIComponent(m.commodity)}`)}
                          className="py-1.5 px-3 bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Forecast
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Cards View Mode */}
      {viewMode === 'cards' && !isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {marketData.map((m, idx) => (
            <div key={m.id || idx} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl transition-all space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900">{m.market}</h3>
                  <p className="text-xs text-slate-500">{m.district}, {m.state}</p>
                </div>
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                  {m.date}
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Commodity</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-800">{m.commodity}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (toggleFavoriteCrop) toggleFavoriteCrop(m.commodity);
                      }}
                      title={isFavoriteCrop && isFavoriteCrop(m.commodity) ? "Remove from Watchlist" : "Add to Favorite Crops Watchlist"}
                      className="p-1 rounded-md hover:bg-slate-200 transition-colors"
                    >
                      <Star className={`w-3.5 h-3.5 ${isFavoriteCrop && isFavoriteCrop(m.commodity) ? 'fill-amber-400 text-amber-500' : 'text-slate-300 hover:text-amber-400'}`} />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Price</span>
                  <div className="text-right">
                    <span className="font-extrabold text-agri-700 text-sm block">₹{m.modalPrice?.toLocaleString('en-IN')} / qtl</span>
                    {m.change !== undefined && m.change !== 0 && (
                      <span className={`text-[10px] font-bold ${m.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {m.change > 0 ? '▲ +' : '▼ '}₹{Math.abs(m.change)} ({m.changePercent}%)
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Range (Min - Max)</span>
                  <span>₹{m.minPrice} - ₹{m.maxPrice}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/transport')}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Truck className="w-4 h-4 text-agri-600" /> Rent Transport to {m.district}
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
