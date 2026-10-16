import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import {
  CloudSun,
  Droplets,
  Wind,
  Sparkles,
  Sun,
  CloudRain,
  CloudLightning,
  Cloud,
  RefreshCw,
  MapPin,
  Navigation,
  Calendar,
  History,
  Bug,
  Tractor,
  Thermometer,
  Columns,
  Search,
  X,
  Compass,
  CheckCircle2,
  AlertCircle,
  Moon,
  CloudMoon,
  Sunrise,
  Sunset,
  Eye,
  Gauge,
  Share2,
  Copy,
  Check,
  ArrowUpRight,
  ArrowDownRight,
  Percent
} from 'lucide-react';

// Maharashtra 36 Districts Pre-configured with Mandi Hubs
const MAHARASHTRA_DISTRICTS = [
  // Vidarbha Division (11 Districts)
  { name: 'Nagpur', division: 'Vidarbha', mandi: 'Kalamna APMC', crops: 'Cotton, Soybean, Oranges' },
  { name: 'Wardha', division: 'Vidarbha', mandi: 'Wardha APMC', crops: 'Cotton, Soybean, Red Gram (Tur)' },
  { name: 'Amravati', division: 'Vidarbha', mandi: 'Amravati APMC', crops: 'Soybean, Cotton, Gram' },
  { name: 'Akola', division: 'Vidarbha', mandi: 'Akola APMC', crops: 'Cotton, Pulses, Jowar' },
  { name: 'Yavatmal', division: 'Vidarbha', mandi: 'Yavatmal APMC', crops: 'Cotton, Soybean' },
  { name: 'Buldhana', division: 'Vidarbha', mandi: 'Malkapur / Khamgaon APMC', crops: 'Soybean, Cotton, Maize' },
  { name: 'Washim', division: 'Vidarbha', mandi: 'Washim APMC', crops: 'Soybean, Wheat, Gram' },
  { name: 'Bhandara', division: 'Vidarbha', mandi: 'Bhandara APMC', crops: 'Paddy / Rice, Pulses, Sugarcane' },
  { name: 'Gondia', division: 'Vidarbha', mandi: 'Gondia APMC', crops: 'Paddy / Rice, Maize' },
  { name: 'Chandrapur', division: 'Vidarbha', mandi: 'Chandrapur APMC', crops: 'Cotton, Paddy, Soybean' },
  { name: 'Gadchiroli', division: 'Vidarbha', mandi: 'Gadchiroli APMC', crops: 'Paddy, Forest Produce, Pulses' },

  // Marathwada Division (8 Districts)
  { name: 'Chhatrapati Sambhajinagar', division: 'Marathwada', mandi: 'Jalna Road APMC', crops: 'Cotton, Maize, Bajra' },
  { name: 'Jalna', division: 'Marathwada', mandi: 'Jalna APMC', crops: 'Sweet Orange (Mosambi), Cotton, Soybean' },
  { name: 'Parbhani', division: 'Marathwada', mandi: 'Parbhani APMC', crops: 'Cotton, Soybean, Jowar' },
  { name: 'Hingoli', division: 'Marathwada', mandi: 'Hingoli APMC', crops: 'Turmeric, Soybean, Cotton' },
  { name: 'Nanded', division: 'Marathwada', mandi: 'Nanded APMC', crops: 'Cotton, Banana, Soybean' },
  { name: 'Beed', division: 'Marathwada', mandi: 'Beed APMC', crops: 'Cotton, Sugarcane, Soybean' },
  { name: 'Latur', division: 'Marathwada', mandi: 'Latur APMC Yard', crops: 'Soybean, Urad, Tur (Pulses)' },
  { name: 'Dharashiv', division: 'Marathwada', mandi: 'Dharashiv APMC', crops: 'Soybean, Gram, Jowar' },

  // North Maharashtra / Khandesh (5 Districts)
  { name: 'Nashik', division: 'North Maharashtra', mandi: 'Lasalgaon / Nashik APMC', crops: 'Onion, Grapes, Tomatoes' },
  { name: 'Jalgaon', division: 'North Maharashtra', mandi: 'Jalgaon APMC', crops: 'Banana, Cotton' },
  { name: 'Dhule', division: 'North Maharashtra', mandi: 'Dhule APMC', crops: 'Cotton, Onion, Bajra' },
  { name: 'Nandurbar', division: 'North Maharashtra', mandi: 'Nandurbar APMC', crops: 'Red Chili, Maize, Cotton' },
  { name: 'Ahilyanagar', division: 'North Maharashtra', mandi: 'Ahilyanagar APMC', crops: 'Sugarcane, Onion, Bajra' },

  // Paschim / Western Maharashtra (5 Districts)
  { name: 'Pune', division: 'Western Maharashtra', mandi: 'Pune APMC Yard', crops: 'Vegetables, Sugarcane, Wheat' },
  { name: 'Satara', division: 'Western Maharashtra', mandi: 'Satara APMC', crops: 'Ginger, Turmeric, Strawberries' },
  { name: 'Sangli', division: 'Western Maharashtra', mandi: 'Sangli Turmeric Market', crops: 'Turmeric, Grapes, Raisins' },
  { name: 'Solapur', division: 'Western Maharashtra', mandi: 'Solapur APMC', crops: 'Pomegranate, Jowar, Grapes' },
  { name: 'Kolhapur', division: 'Western Maharashtra', mandi: 'Kolhapur APMC', crops: 'Sugarcane, Jaggery, Rice' },

  // Konkan Division (7 Districts)
  { name: 'Thane', division: 'Konkan', mandi: 'Kalyan APMC', crops: 'Rice, Vegetables' },
  { name: 'Palghar', division: 'Konkan', mandi: 'Palghar APMC', crops: 'Rice, Chikoo (Sapota)' },
  { name: 'Raigad', division: 'Konkan', mandi: 'Panvel / Alibag APMC', crops: 'Rice, Coconut, Alphonso Mango' },
  { name: 'Ratnagiri', division: 'Konkan', mandi: 'Ratnagiri APMC', crops: 'Alphonso Mango, Cashew, Rice' },
  { name: 'Sindhudurg', division: 'Konkan', mandi: 'Kudal / Sawantwadi APMC', crops: 'Alphonso Mango, Cashew, Spices' },
  { name: 'Mumbai City', division: 'Konkan', mandi: 'Vashi Wholesale Hub', crops: 'Grain Wholesale Terminal' },
  { name: 'Mumbai Suburban', division: 'Konkan', mandi: 'Mumbai APMC Terminal', crops: 'Vegetables & Fruits Wholesale' }
];

// Major Pan-India Agricultural Hubs
const PAN_INDIA_HUBS = [
  { name: 'Indore', state: 'Madhya Pradesh', mandi: 'Indore Mandi', crops: 'Soybean, Wheat' },
  { name: 'Bhopal', state: 'Madhya Pradesh', mandi: 'Karond Mandi', crops: 'Wheat, Gram' },
  { name: 'Ludhiana', state: 'Punjab', mandi: 'Ludhiana Grain Market', crops: 'Wheat, Paddy' },
  { name: 'Karnal', state: 'Haryana', mandi: 'Karnal Grain Market', crops: 'Basmati Rice, Wheat' },
  { name: 'Kota', state: 'Rajasthan', mandi: 'Bhamashah Mandi', crops: 'Mustard, Soybean, Coriander' },
  { name: 'Jaipur', state: 'Rajasthan', mandi: 'Muhana Mandi', crops: 'Mustard, Bajra, Spices' },
  { name: 'Surat', state: 'Gujarat', mandi: 'Surat APMC', crops: 'Cotton, Sugarcane, Vegetables' },
  { name: 'Rajkot', state: 'Gujarat', mandi: 'Bedi APMC', crops: 'Groundnut, Cotton, Cumin' },
  { name: 'Guntur', state: 'Andhra Pradesh', mandi: 'Guntur Mirchi Yard', crops: 'Chilli, Cotton, Tobacco' },
  { name: 'Warangal', state: 'Telangana', mandi: 'Enumamula APMC', crops: 'Cotton, Red Chilli, Paddy' },
  { name: 'Bengaluru', state: 'Karnataka', mandi: 'Yeshwanthpur APMC', crops: 'Ragi, Maize, Vegetables' },
  { name: 'Lucknow', state: 'Uttar Pradesh', mandi: 'Dubagga Mandi', crops: 'Mango, Wheat, Sugarcane' }
];

export const WeatherIntelligence = () => {
  const { showToast } = useApp();

  // Active Location State
  const [activeLocationName, setActiveLocationName] = useState('Nagpur');
  const [activeCoords, setActiveCoords] = useState({ lat: 21.1458, lon: 79.0882 });
  const [isGpsActive, setIsGpsActive] = useState(false);

  // Weather Data State
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGeoLoading, setIsGeoLoading] = useState(false);
  const [copiedAdvisory, setCopiedAdvisory] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedSearchIndex, setSelectedSearchIndex] = useState(-1);
  const searchRef = useRef(null);

  // View Modes: 'realtime' | 'history' | 'compare'
  const [viewMode, setViewMode] = useState('realtime');
  const [pastDaysOption, setPastDaysOption] = useState(14); // 7, 14, 30
  const [forecastSubTab, setForecastSubTab] = useState('7day'); // '7day' | 'hourly'

  // Comparison State
  const [compareRegion, setCompareRegion] = useState('Nashik');
  const [compareWeather, setCompareWeather] = useState(null);
  const [loadingCompare, setLoadingCompare] = useState(false);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initial load
  useEffect(() => {
    loadWeather('Nagpur', 21.1458, 79.0882, pastDaysOption);
  }, []);

  // Search autocomplete handler with debounce
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.searchWeatherLocations(searchQuery.trim());
        if (res && res.success && Array.isArray(res.data)) {
          setSearchResults(res.data);
          setIsSearchOpen(true);
          setSelectedSearchIndex(-1);
        }
      } catch (err) {
        console.warn('Search locations note:', err.message);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load weather function
  const loadWeather = async (locationName, lat = null, lon = null, pastDays = pastDaysOption) => {
    setLoading(true);
    try {
      const params = { pastDays };
      if (lat && lon) {
        params.lat = lat;
        params.lon = lon;
        params.location = locationName || 'Current Location';
      } else {
        params.location = locationName;
      }

      const data = await api.getWeather(params);
      if (data && data.success) {
        setWeather(data);
        setActiveLocationName(data.location || locationName);
        if (lat && lon) {
          setActiveCoords({ lat, lon });
        } else if (data.coordinates) {
          setActiveCoords({ lat: data.coordinates.lat, lon: data.coordinates.lon });
        }
      } else {
        showToast('Unable to fetch live weather telemetry.', 'error');
      }
    } catch (err) {
      showToast('Could not reach weather server. Please check your network.', 'error');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      setIsGeoLoading(false);
    }
  };

  // Comparison loader
  const loadCompareWeather = async (locationName) => {
    setLoadingCompare(true);
    try {
      const data = await api.getWeather({ location: locationName, pastDays: pastDaysOption });
      if (data && data.success) {
        setCompareWeather(data);
      }
    } catch (err) {
      showToast('Could not load comparison data.', 'error');
    } finally {
      setLoadingCompare(false);
    }
  };

  const handleSelectSearchResult = (item) => {
    setSearchQuery('');
    setIsSearchOpen(false);
    setIsGpsActive(false);
    loadWeather(item.displayName, item.lat, item.lon, pastDaysOption);
    showToast(`Weather telemetry loaded for ${item.displayName}`, 'success');
  };

  const handleRegionSelect = (regName) => {
    setIsGpsActive(false);
    const reg = MAHARASHTRA_DISTRICTS.find((d) => d.name === regName);
    loadWeather(regName, null, null, pastDaysOption);
    showToast(`Loaded ${regName} (${reg?.division || 'Maharashtra'})`, 'info');
  };

  const handlePastDaysChange = (days) => {
    setPastDaysOption(days);
    loadWeather(activeLocationName, activeCoords.lat, activeCoords.lon, days);
    if (viewMode === 'compare') {
      loadCompareWeather(compareRegion);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadWeather(activeLocationName, activeCoords.lat, activeCoords.lon, pastDaysOption);
    if (viewMode === 'compare') {
      loadCompareWeather(compareRegion);
    }
    showToast('Refreshing live satellite & ground station telemetry...', 'info');
  };

  // GPS Location Detection with High-Precision Coordinates
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', 'error');
      return;
    }
    setIsGeoLoading(true);
    showToast('Acquiring high-precision GPS satellite coordinates...', 'info');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setIsGpsActive(true);
        setActiveCoords({ lat: latitude, lon: longitude });

        // Attempt Google Maps Geocoder if client library ready
        if (window.google && window.google.maps && window.google.maps.Geocoder) {
          try {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
              if (status === 'OK' && results && results[0]) {
                const detectedName = results[0].formatted_address;
                loadWeather(detectedName, latitude, longitude, pastDaysOption);
                showToast(`GPS Position Locked: ${detectedName}!`, 'success');
                return;
              }
              syncWithBackendReverseGeo(latitude, longitude);
            });
            return;
          } catch (e) {
            // fallback
          }
        }

        syncWithBackendReverseGeo(latitude, longitude);
      },
      (err) => {
        setIsGeoLoading(false);
        showToast('Location permission denied or device GPS unavailable', 'error');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const syncWithBackendReverseGeo = async (latitude, longitude) => {
    try {
      const rev = await api.reverseGeocodeWeather(latitude, longitude);
      const detectedName = rev?.data?.displayName || `Farm (${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E)`;
      loadWeather(detectedName, latitude, longitude, pastDaysOption);
      showToast(`GPS Location Synced: ${detectedName}!`, 'success');
    } catch {
      loadWeather('My Farm Location', latitude, longitude, pastDaysOption);
      showToast('Field coordinates synced!', 'success');
    }
  };

  // Copy agricultural advisory to clipboard
  const handleCopyAdvisory = () => {
    if (!weather) return;
    const summary = `🌾 AgriPulse Micro-Climate Advisory for ${weather.location}:
🌡️ Temp: ${weather.current?.temp} (Feels ${weather.current?.feelsLike})
💧 Humidity: ${weather.current?.humidity} | 🌧️ Rain Chance: ${weather.current?.rainfallChance}
💨 Wind: ${weather.current?.windSpeed} (${weather.current?.windCardinal || 'Stable'})
📋 Spraying: ${weather.advisories?.spray?.status} (${weather.advisories?.spray?.reason})
💧 Irrigation: ${weather.advisories?.irrigation?.status} (${weather.advisories?.irrigation?.reason})
🐛 Pest Risk: ${weather.advisories?.pest?.status}
🌾 Fieldwork: ${weather.advisories?.harvest?.status}
Source: ${weather.source}`;

    navigator.clipboard.writeText(summary);
    setCopiedAdvisory(true);
    showToast('Advisory copied to clipboard for sharing!', 'success');
    setTimeout(() => setCopiedAdvisory(false), 3000);
  };

  // Weather Icon Helper with Nocturnal & Diurnal Recognition
  const getWeatherIcon = (condition = '', size = 'w-6 h-6', isDaytime = true) => {
    const c = (condition || '').toLowerCase();
    if (c.includes('thunder') || c.includes('lightning') || c.includes('storm')) {
      return <CloudLightning className={`${size} text-amber-400`} />;
    }
    if (c.includes('rain') || c.includes('shower') || c.includes('drizzle')) {
      return <CloudRain className={`${size} text-blue-400`} />;
    }
    if (c.includes('cloud') && (c.includes('night') || c.includes('moon') || !isDaytime)) {
      return <CloudMoon className={`${size} text-indigo-300`} />;
    }
    if (c.includes('night') || c === 'clear' && !isDaytime) {
      return <Moon className={`${size} text-indigo-300`} />;
    }
    if (c.includes('cloud') && c.includes('sun')) {
      return <CloudSun className={`${size} text-amber-400`} />;
    }
    if (c.includes('cloud') || c.includes('overcast')) {
      return <Cloud className={`${size} text-slate-300`} />;
    }
    if (c.includes('haze') || c.includes('fog') || c.includes('smoke')) {
      return <Cloud className={`${size} text-amber-200/80`} />;
    }
    return isDaytime ? (
      <Sun className={`${size} text-amber-400`} />
    ) : (
      <Moon className={`${size} text-indigo-300`} />
    );
  };

  const cur = weather?.current || {};
  const pastSum = weather?.pastSummary || {};
  const pastList = weather?.pastHistory || [];
  const adv = weather?.advisories || {};
  const forecast7 = weather?.forecast7Days || [];
  const hourly24 = weather?.next24Hours || [];

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto px-2 sm:px-4">

      {/* ═══════════════════════════════════════════════════════════════════════════
          HERO COCKPIT: COMMAND CENTER & LOCATION BAR
      ═══════════════════════════════════════════════════════════════════════════ */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white p-6 sm:p-8 shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Title & Micro-Climate Station Details */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400">
                Live
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              <span>{weather?.location || activeLocationName}</span>
              {isGpsActive && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Navigation className="w-3 h-3 animate-pulse" />
                  GPS Active
                </span>
              )}
            </h1>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 font-medium">
              <span className="flex items-center gap-1 text-emerald-300">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <strong>Mandi Yard:</strong> {weather?.mandi || 'Regional APMC'}
              </span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="text-slate-400">
                <strong>Primary Crops:</strong> {weather?.primaryCrops || 'Regional Belts'}
              </span>
              {activeCoords.lat && (
                <>
                  <span className="text-slate-600 hidden sm:inline">•</span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {activeCoords.lat.toFixed(2)}°N, {activeCoords.lon.toFixed(2)}°E
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleDetectLocation}
              disabled={isGeoLoading}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                isGpsActive
                  ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-emerald-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
              }`}
            >
              <Navigation className={`w-3.5 h-3.5 ${isGeoLoading ? 'animate-spin' : ''}`} />
              <span>{isGeoLoading ? 'Locating GPS...' : isGpsActive ? 'Field GPS Locked' : 'Detect My Location'}</span>
            </button>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh Telemetry"
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-all flex items-center justify-center cursor-pointer shadow-md"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>

            <button
              onClick={handleCopyAdvisory}
              title="Share Advisory via WhatsApp or Copy"
              className="flex items-center gap-1.5 px-3 py-2.5 bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 rounded-xl border border-emerald-500/30 transition-all text-xs font-bold cursor-pointer"
            >
              {copiedAdvisory ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedAdvisory ? 'Copied!' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* ── Search Bar: Any Indian Location ── */}
        <div className="relative mt-6 z-30" ref={searchRef}>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search ANY city, town, tehsil, or mandi across India (e.g. Pune, Nashik, Wardha, Indore, Ludhiana, Surat, Kota, Guntur, Kolhapur...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0 || isSearching) setIsSearchOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setSelectedSearchIndex((prev) => Math.min(prev + 1, searchResults.length - 1));
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setSelectedSearchIndex((prev) => Math.max(prev - 1, 0));
                } else if (e.key === 'Enter') {
                  e.preventDefault();
                  if (selectedSearchIndex >= 0 && searchResults[selectedSearchIndex]) {
                    handleSelectSearchResult(searchResults[selectedSearchIndex]);
                  } else if (searchResults.length > 0) {
                    handleSelectSearchResult(searchResults[0]);
                  } else if (searchQuery.trim().length >= 2) {
                    loadWeather(searchQuery.trim(), null, null, pastDaysOption);
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }
                } else if (e.key === 'Escape') {
                  setIsSearchOpen(false);
                }
              }}
              className="w-full pl-11 pr-10 py-3 bg-slate-800/90 text-white text-xs font-medium rounded-2xl border border-slate-700/80 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-slate-900 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setIsSearchOpen(false);
                }}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && (
            <div className="absolute left-0 right-0 mt-2 bg-slate-900/98 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 max-h-72 overflow-y-auto divide-y divide-slate-800/60">
              {isSearching ? (
                <div className="px-4 py-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  <span>Searching Pan-India APMC Mandis & Agricultural Centers...</span>
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-between">
                    <span>Matching Indian Locations ({searchResults.length})</span>
                    <span className="text-[9px] text-slate-400 lowercase font-normal">Use ↑↓ and press Enter</span>
                  </div>
                  {searchResults.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSearchResult(item)}
                      onMouseEnter={() => setSelectedSearchIndex(idx)}
                      className={`w-full text-left px-4 py-3 transition-colors flex items-center justify-between group cursor-pointer ${
                        selectedSearchIndex === idx ? 'bg-slate-800' : 'hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
                        <div>
                          <span className="text-xs font-bold text-white block">{item.name}</span>
                          <span className="text-[11px] text-slate-400">
                            {item.district ? `${item.district}, ` : ''}{item.state} (India)
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono opacity-80 group-hover:opacity-100">
                        {item.lat.toFixed(2)}°N, {item.lon.toFixed(2)}°E
                      </span>
                    </button>
                  ))}
                </>
              ) : (
                <div className="px-4 py-4 text-center text-xs text-slate-400">
                  No exact match found for "{searchQuery}". Press Enter to query meteorological coordinates directly.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Select Agricultural Hubs */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase mr-1">
            Top Mandi Belts:
          </span>
          {['Nagpur', 'Pune', 'Nashik', 'Wardha', 'Amravati', 'Kolhapur', 'Indore', 'Ludhiana', 'Jaipur', 'Guntur'].map((c) => (
            <button
              key={c}
              onClick={() => handleRegionSelect(c)}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                activeLocationName.includes(c)
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-black scale-105'
                  : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700/80'
              }`}
            >
              {c}
            </button>
          ))}

          {/* Maharashtra All 36 Districts Dropdown */}
          <select
            value={MAHARASHTRA_DISTRICTS.some((d) => d.name === activeLocationName) ? activeLocationName : ''}
            onChange={(e) => {
              if (e.target.value) handleRegionSelect(e.target.value);
            }}
            className="text-[11px] font-bold px-3 py-1 rounded-lg bg-slate-800/90 text-emerald-300 border border-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="">Maharashtra (All 36 Districts) ▾</option>
            {MAHARASHTRA_DISTRICTS.map((d) => (
              <option key={d.name} value={d.name} className="bg-slate-900 text-white">
                {d.name} ({d.division})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          MODE SELECTION TABS: REALTIME vs HISTORY vs COMPARE
      ═══════════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl overflow-x-auto">
          <button
            onClick={() => setViewMode('realtime')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
              viewMode === 'realtime'
                ? 'bg-white text-slate-900 shadow-sm font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Real-Time & 7-Day Forecast</span>
          </button>

          <button
            onClick={() => setViewMode('history')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
              viewMode === 'history'
                ? 'bg-white text-slate-900 shadow-sm font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4 text-emerald-600" />
            <span>Agro-Rainfall Archive ({pastDaysOption} Days)</span>
          </button>

          <button
            onClick={() => {
              setViewMode('compare');
              if (!compareWeather) loadCompareWeather(compareRegion);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
              viewMode === 'compare'
                ? 'bg-white text-slate-900 shadow-sm font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Columns className="w-4 h-4 text-blue-600" />
            <span>Side-by-Side Mandi Comparison</span>
          </button>
        </div>

        {/* Past Timeline Filter */}
        {(viewMode === 'history' || viewMode === 'compare') && (
          <div className="flex items-center gap-1.5 self-end sm:self-auto px-2">
            <span className="text-[10px] font-black text-slate-400 uppercase">Period:</span>
            {[
              { days: 7, label: '7 Days' },
              { days: 14, label: '14 Days' },
              { days: 30, label: '30 Days' }
            ].map((p) => (
              <button
                key={p.days}
                onClick={() => handlePastDaysChange(p.days)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  pastDaysOption === p.days
                    ? 'bg-emerald-600 text-white shadow-sm font-black'
                    : 'text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 h-80 bg-slate-200 rounded-3xl" />
            <div className="lg:col-span-5 h-80 bg-slate-200 rounded-3xl" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-2xl" />
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* ═══════════════════════════════════════════════════════════════════════════
              MODE 1: REAL-TIME TELEMETRY & 7-DAY FORECAST
          ═══════════════════════════════════════════════════════════════════════════ */}
          {viewMode === 'realtime' && (
            <div className="space-y-6">

              {/* Main Weather Hero + AI Directive Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

                {/* Current Weather Hero Card (7 Cols) */}
                <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                          HYPERLOCAL SURFACE TELEMETRY
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {weather?.location || activeLocationName}
                        </span>
                      </div>

                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-slate-900 text-white">
                        {getWeatherIcon(cur.condition, 'w-3.5 h-3.5', cur.isDaytime)}
                        <span>{cur.condition || 'Clear'}</span>
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 py-2">
                      <div className="flex items-center gap-6">
                        <div className="p-5 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-3xl border border-emerald-200/60 shadow-inner shrink-0">
                          {getWeatherIcon(cur.condition, 'w-20 h-20 sm:w-24 sm:h-24', cur.isDaytime)}
                        </div>

                        <div>
                          <div className="flex items-baseline gap-3">
                            <span className="text-5xl sm:text-7xl font-black text-slate-950 tracking-tighter">
                              {cur.temp || '27°C'}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-slate-500 mt-1">
                            Feels like <strong className="text-slate-800">{cur.feelsLike || cur.temp}</strong>
                          </p>
                          <p className="text-sm font-extrabold text-slate-800 mt-1 capitalize flex items-center gap-1.5">
                            <span>{cur.description || 'Clear agricultural skies observed'}</span>
                          </p>
                        </div>
                      </div>

                      {/* Sun / Moon Timeline Badge */}
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 sm:w-48 space-y-2">
                        <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                          SOLAR EPHEMERIS
                        </span>
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1 text-amber-600 font-bold">
                            <Sunrise className="w-3.5 h-3.5" />
                            {cur.sunrise || '06:06 AM'}
                          </span>
                          <span className="flex items-center gap-1 text-indigo-600 font-bold">
                            <Sunset className="w-3.5 h-3.5" />
                            {cur.sunset || '05:55 PM'}
                          </span>
                        </div>
                        {cur.moonPhase && (
                          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                            <span>Moon:</span>
                            <strong className="text-slate-700">{cur.moonPhase}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 8-Tile Agro-Telemetry Metric Matrix */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors">
                      <div className="flex items-center gap-1.5 text-blue-600 mb-1">
                        <Droplets className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase text-slate-400">Humidity</span>
                      </div>
                      <span className="text-lg font-black text-slate-900 block">{cur.humidity || '67%'}</span>
                      <span className="text-[10px] font-semibold text-slate-400">Dew: {cur.dewPoint || '21°C'}</span>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-teal-200 transition-colors">
                      <div className="flex items-center gap-1.5 text-teal-600 mb-1">
                        <CloudRain className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase text-slate-400">Rain Chance</span>
                      </div>
                      <span className="text-lg font-black text-slate-900 block">{cur.rainfallChance || '0%'}</span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {cur.precipitationMm > 0 ? `${cur.precipitationMm} mm rain` : 'Dry canopy'}
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-colors">
                      <div className="flex items-center gap-1.5 text-indigo-600 mb-1">
                        <Wind className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase text-slate-400">Wind & Drift</span>
                      </div>
                      <span className="text-lg font-black text-slate-900 block">{cur.windSpeed || '3 km/h'}</span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {cur.windCardinal || 'NORTH'} • Gusts {cur.windGust || '8 km/h'}
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-amber-200 transition-colors">
                      <div className="flex items-center gap-1.5 text-amber-600 mb-1">
                        <Gauge className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase text-slate-400">Air Pressure</span>
                      </div>
                      <span className="text-lg font-black text-slate-900 block">{cur.pressureHpa || 1015} hPa</span>
                      <span className="text-[10px] font-semibold text-emerald-600 font-bold">Sea-Level Calibrated</span>
                    </div>
                  </div>
                </div>

                {/* AI Agro-Impact Advisory Cockpit (5 Cols) */}
                <div className="lg:col-span-5 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-emerald-500 text-slate-950 rounded-lg">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
                          AI CROP IMPACT DIRECTIVES
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 bg-white/10 px-2 py-0.5 rounded-md">
                        {weather?.primaryCrops || 'Regional Belts'}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                      Agricultural Decision Windows
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-200 mt-3 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/10">
                      "{adv.aiSummary || `Stable weather window observed over ${weather?.location || 'this location'}. Favorable conditions for routine agricultural operations.`}"
                    </p>
                  </div>

                  {/* 4 Interactive Key Directive Pills */}
                  <div className="grid grid-cols-2 gap-3 mt-6 relative z-10">
                    <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-white/15 transition-all">
                      <span className="text-[10px] font-bold text-amber-300 uppercase block">Spraying</span>
                      <span className="text-xs font-black text-white">{adv.spray?.status || 'Optimal'}</span>
                      <p className="text-[10px] text-slate-300 mt-1 line-clamp-1">{adv.spray?.reason}</p>
                    </div>

                    <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-white/15 transition-all">
                      <span className="text-[10px] font-bold text-blue-300 uppercase block">Irrigation</span>
                      <span className="text-xs font-black text-white">{adv.irrigation?.status || 'Moderate'}</span>
                      <p className="text-[10px] text-slate-300 mt-1 line-clamp-1">{adv.irrigation?.reason}</p>
                    </div>

                    <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-white/15 transition-all">
                      <span className="text-[10px] font-bold text-emerald-300 uppercase block">Pest Risk</span>
                      <span className="text-xs font-black text-white">{adv.pest?.status || 'Low Risk'}</span>
                      <p className="text-[10px] text-slate-300 mt-1 line-clamp-1">{adv.pest?.reason}</p>
                    </div>

                    <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-white/15 transition-all">
                      <span className="text-[10px] font-bold text-teal-300 uppercase block">Fieldwork</span>
                      <span className="text-xs font-black text-white">{adv.harvest?.status || 'Safe'}</span>
                      <p className="text-[10px] text-slate-300 mt-1 line-clamp-1">{adv.harvest?.reason}</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* 4 In-Depth Agricultural Decision Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl">
                      <Droplets className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                      adv.spray?.color === 'rose'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : adv.spray?.color === 'amber'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {adv.spray?.status || 'Optimal Window'}
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900">Chemical Spray Window</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {adv.spray?.reason || 'Ideal wind conditions under 15 km/h for foliar nutrition without chemical drift.'}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 bg-blue-50 text-blue-700 rounded-2xl">
                      <CloudRain className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                      {adv.irrigation?.status || 'Moderate Moisture'}
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900">Irrigation Scheduling</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {adv.irrigation?.reason || 'Maintain regular irrigation moisture for vegetative development.'}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 bg-amber-50 text-amber-700 rounded-2xl">
                      <Bug className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                      adv.pest?.color === 'rose'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : adv.pest?.color === 'amber'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {adv.pest?.status || 'Low Risk'}
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900">Pest & Fungal Risk</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {adv.pest?.reason || 'Favorable thermal profiles with low fungal proliferation index.'}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 bg-teal-50 text-teal-700 rounded-2xl">
                      <Tractor className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                      adv.harvest?.color === 'rose'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {adv.harvest?.status || 'Safe for Fieldwork'}
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900">Fieldwork & Harvesting</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {adv.harvest?.reason || 'Dry soil conditions suitable for tractor operations without risk of wheel slippage.'}
                  </p>
                </div>
              </div>

              {/* ═══════════════════════════════════════════════════════════════════
                  FORECAST SECTION: 7-DAY OUTLOOK vs 24-HOUR HOURLY
              ═══════════════════════════════════════════════════════════════════ */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <CloudSun className="w-5 h-5 text-emerald-700" />
                    <div>
                      <h3 className="font-black text-base text-slate-900">
                        Forecast & Projections ({weather?.location || activeLocationName})
                      </h3>
                      <p className="text-xs text-slate-500">
                        Calibrated high-resolution atmospheric models for farm planning
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center bg-slate-100 p-1.5 rounded-xl self-stretch sm:self-auto">
                    <button
                      onClick={() => setForecastSubTab('7day')}
                      className={`flex-1 sm:flex-initial text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer ${
                        forecastSubTab === '7day' ? 'bg-white text-slate-900 shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      7-Day Outlook
                    </button>
                    <button
                      onClick={() => setForecastSubTab('hourly')}
                      className={`flex-1 sm:flex-initial text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer ${
                        forecastSubTab === 'hourly' ? 'bg-white text-slate-900 shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Next 24 Hours
                    </button>
                  </div>
                </div>

                {forecastSubTab === '7day' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3.5">
                    {forecast7.map((fc, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl border text-center space-y-2.5 transition-all hover:-translate-y-1 hover:shadow-lg ${
                          idx === 0
                            ? 'bg-gradient-to-b from-emerald-50/80 to-white border-emerald-300 ring-2 ring-emerald-500/20'
                            : 'bg-slate-50/70 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black text-xs text-slate-900">{fc.day}</span>
                          {idx === 0 && (
                            <span className="text-[9px] font-black text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                              Today
                            </span>
                          )}
                        </div>

                        <div className="my-2 flex justify-center">
                          {getWeatherIcon(fc.condition, 'w-10 h-10', true)}
                        </div>

                        <div className="space-y-0.5">
                          <p className="font-black text-base text-slate-950">{fc.maxTemp}°C</p>
                          <p className="text-[11px] font-semibold text-slate-400">Low: {fc.minTemp}°C</p>
                        </div>

                        {/* Visual Temperature Range Bar */}
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden my-1">
                          <div
                            className="bg-gradient-to-r from-blue-400 to-amber-500 h-full rounded-full"
                            style={{ width: `${Math.min(100, Math.max(30, (fc.maxTemp / 45) * 100))}%` }}
                          />
                        </div>

                        <p className="text-[11px] font-bold text-slate-700 truncate">{fc.condition}</p>

                        <div className="pt-2 border-t border-slate-200/80 flex items-center justify-center gap-1 text-[10px]">
                          <CloudRain className="w-3 h-3 text-blue-500" />
                          <span className="font-bold text-slate-700">{fc.rainProb}%</span>
                          {fc.rainSumMm > 0 && <span className="text-slate-400 font-medium">({fc.rainSumMm}mm)</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Hourly Horizontal Scroller */}
                    <div className="overflow-x-auto pb-3">
                      <div className="flex gap-3 min-w-[850px]">
                        {hourly24.map((hr, idx) => (
                          <div
                            key={idx}
                            className="flex-1 min-w-[95px] p-3.5 bg-slate-50/80 hover:bg-white hover:shadow-md transition-all rounded-2xl border border-slate-200 text-center space-y-2"
                          >
                            <span className="text-[10px] font-bold text-slate-500 block uppercase">{hr.time}</span>
                            <div className="flex justify-center my-1.5">
                              {getWeatherIcon(hr.condition, 'w-6 h-6', !hr.time.includes('pm') || parseInt(hr.time, 10) < 6)}
                            </div>
                            <span className="text-sm font-black text-slate-900 block">{hr.temp}°C</span>
                            <div className="pt-1.5 border-t border-slate-200/80 space-y-1">
                              <span className="text-[10px] font-bold text-blue-600 block">
                                💧 {hr.humidity}%
                              </span>
                              <span className="text-[9px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded block truncate">
                                {hr.rainProb}% rain
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════════
              MODE 2: PAST HISTORICAL WEATHER ARCHIVE (7, 14, 30 Days)
          ═══════════════════════════════════════════════════════════════════════════ */}
          {viewMode === 'history' && (
            <div className="space-y-6">

              {/* Past Macro Summary Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1">
                  <div className="flex items-center gap-2 text-blue-600 mb-1">
                    <CloudRain className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-500">Cumulative Rainfall</span>
                  </div>
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    {pastSum.totalRainfallMm ?? 0} mm
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">
                    Precipitation recorded over past {pastSum.periodDays || pastDaysOption} days
                  </p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1">
                  <div className="flex items-center gap-2 text-emerald-600 mb-1">
                    <Calendar className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-500">Wet vs Dry Days</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black text-emerald-700 tracking-tight">
                      {pastSum.rainyDays ?? 0}
                    </span>
                    <span className="text-sm font-semibold text-slate-500">
                      rainy / {pastSum.dryDays ?? 0} dry days
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">
                    Precipitation frequency ratio in current period
                  </p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1">
                  <div className="flex items-center gap-2 text-amber-600 mb-1">
                    <Thermometer className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-500">Thermal Range</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                      {pastSum.avgMaxTemp || '32°C'}
                    </span>
                    <span className="text-sm font-semibold text-slate-500">
                      avg min {pastSum.avgMinTemp || '22°C'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">
                    Daily agricultural thermal bandwidth
                  </p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1">
                  <div className="flex items-center gap-2 text-teal-600 mb-1">
                    <Droplets className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-500">Soil Moisture Profile</span>
                  </div>
                  <span className="text-lg font-black text-teal-800 block">
                    {pastSum.soilMoistureStatus || 'Optimal Moisture'}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">
                    Peak rain event: <strong className="text-slate-700">{pastSum.highestRainRecord || 'Nil'}</strong>
                  </p>
                </div>
              </div>

              {/* Day-by-Day Historical Weather Log */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                      <History className="w-5 h-5 text-emerald-600" />
                      Day-by-Day Archive Records ({weather?.location || activeLocationName})
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Ground observations and meteorological archives for the past {pastDaysOption} days across {weather?.location}.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl">
                    {pastList.length} Archived Days
                  </span>
                </div>

                {/* Historical Log Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                  {pastList.map((day, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border transition-all hover:shadow-md ${
                        day.isRainy
                          ? 'bg-blue-50/50 border-blue-200 ring-1 ring-blue-400/20'
                          : 'bg-slate-50/70 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-slate-900">{day.dayName}</span>
                        {day.isRainy ? (
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                            🌧️ Rainy Day
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                            ☀️ Dry Day
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 my-2.5">
                        <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-100">
                          {getWeatherIcon(day.condition, 'w-6 h-6', true)}
                        </div>
                        <div>
                          <span className="text-sm font-black text-slate-900 block">
                            {day.maxTemp}°C / {day.minTemp}°C
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500 capitalize">
                            {day.condition}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">Precipitation:</span>
                        <span className={`font-black ${day.rainMm > 0 ? 'text-blue-700' : 'text-slate-400'}`}>
                          {day.rainMm} mm
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                        <span>Max Wind:</span>
                        <span className="font-semibold text-slate-600">{day.windMax || 10} km/h</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════════
              MODE 3: MULTI-LOCATION COMPARISON (Compare Any 2 Indian Mandis)
          ═══════════════════════════════════════════════════════════════════════════ */}
          {viewMode === 'compare' && (
            <div className="space-y-6">

              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                  <div>
                    <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                      <Columns className="w-5 h-5 text-blue-600" />
                      Side-by-Side Dual Mandi Comparison
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Compare real-time temperatures, rain risks, and fieldwork windows between any 2 agricultural regions in India.
                    </p>
                  </div>
                </div>

                {/* Compare Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Location 1 (Current Active) */}
                  <div className="space-y-4 p-6 rounded-3xl bg-emerald-50/50 border border-emerald-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-900 uppercase tracking-wider">
                        Location 1 (Active)
                      </span>
                      <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1 rounded-xl border border-emerald-200">
                        {weather?.location || activeLocationName}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm">
                      {getWeatherIcon(cur.condition, 'w-14 h-14', cur.isDaytime)}
                      <div>
                        <span className="text-4xl font-black text-slate-950">{cur.temp || '27°C'}</span>
                        <span className="text-xs text-slate-500 block font-medium mt-0.5">
                          Feels {cur.feelsLike} • {cur.condition}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-700 block mt-1">
                          {weather?.mandi}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-emerald-100">
                        <span className="text-slate-500">Relative Humidity:</span>
                        <span className="font-bold text-slate-800">{cur.humidity}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-emerald-100">
                        <span className="text-slate-500">Precipitation Chance:</span>
                        <span className="font-bold text-slate-800">{cur.rainfallChance}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-emerald-100">
                        <span className="text-slate-500">Wind Velocity:</span>
                        <span className="font-bold text-slate-800">{cur.windSpeed} ({cur.windCardinal || 'Stable'})</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-emerald-100">
                        <span className="text-slate-500">Past {pastDaysOption} Days Rainfall:</span>
                        <span className="font-bold text-blue-700">{pastSum.totalRainfallMm ?? 0} mm</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-emerald-100">
                        <span className="text-slate-500">Chemical Spraying:</span>
                        <span className="font-bold text-emerald-700">{adv.spray?.status}</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-500">Harvesting Safety:</span>
                        <span className="font-bold text-teal-700">{adv.harvest?.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Location 2 (Comparison Target) */}
                  <div className="space-y-4 p-6 rounded-3xl bg-blue-50/50 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-blue-900 uppercase tracking-wider">
                        Location 2 (Compare Target)
                      </span>
                      <select
                        value={compareRegion}
                        onChange={(e) => {
                          setCompareRegion(e.target.value);
                          loadCompareWeather(e.target.value);
                        }}
                        className="px-3 py-1.5 bg-white text-xs font-bold rounded-xl border border-blue-300 text-blue-950 focus:outline-none cursor-pointer shadow-xs"
                      >
                        <optgroup label="Maharashtra Districts" className="font-bold">
                          {MAHARASHTRA_DISTRICTS.map((r) => (
                            <option key={r.name} value={r.name}>{r.name}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Pan-India Agricultural Hubs" className="font-bold">
                          {PAN_INDIA_HUBS.map((h) => (
                            <option key={h.name} value={h.name}>{h.name} ({h.state})</option>
                          ))}
                        </optgroup>
                      </select>
                    </div>

                    {loadingCompare ? (
                      <div className="p-12 text-center text-xs font-bold text-slate-500 flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                        <span>Querying comparison telemetry...</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-blue-100 shadow-sm">
                          {getWeatherIcon(compareWeather?.current?.condition, 'w-14 h-14', compareWeather?.current?.isDaytime)}
                          <div>
                            <span className="text-4xl font-black text-slate-950">
                              {compareWeather?.current?.temp || '26°C'}
                            </span>
                            <span className="text-xs text-slate-500 block font-medium mt-0.5">
                              Feels {compareWeather?.current?.feelsLike} • {compareWeather?.current?.condition}
                            </span>
                            <span className="text-[11px] font-bold text-blue-700 block mt-1">
                              {compareWeather?.mandi || 'APMC Yard'}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2.5 text-xs">
                          <div className="flex justify-between py-1.5 border-b border-blue-100">
                            <span className="text-slate-500">Relative Humidity:</span>
                            <span className="font-bold text-slate-800">{compareWeather?.current?.humidity}</span>
                          </div>
                          <div className="flex justify-between py-1.5 border-b border-blue-100">
                            <span className="text-slate-500">Precipitation Chance:</span>
                            <span className="font-bold text-slate-800">{compareWeather?.current?.rainfallChance}</span>
                          </div>
                          <div className="flex justify-between py-1.5 border-b border-blue-100">
                            <span className="text-slate-500">Wind Velocity:</span>
                            <span className="font-bold text-slate-800">
                              {compareWeather?.current?.windSpeed} ({compareWeather?.current?.windCardinal || 'Stable'})
                            </span>
                          </div>
                          <div className="flex justify-between py-1.5 border-b border-blue-100">
                            <span className="text-slate-500">Past {pastDaysOption} Days Rainfall:</span>
                            <span className="font-bold text-blue-700">
                              {compareWeather?.pastSummary?.totalRainfallMm ?? 0} mm
                            </span>
                          </div>
                          <div className="flex justify-between py-1.5 border-b border-blue-100">
                            <span className="text-slate-500">Chemical Spraying:</span>
                            <span className="font-bold text-blue-700">
                              {compareWeather?.advisories?.spray?.status || 'Optimal'}
                            </span>
                          </div>
                          <div className="flex justify-between py-1.5">
                            <span className="text-slate-500">Harvesting Safety:</span>
                            <span className="font-bold text-blue-700">
                              {compareWeather?.advisories?.harvest?.status || 'Safe'}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                </div>
              </div>

            </div>
          )}
        </>
      )}

    </div>
  );
};
