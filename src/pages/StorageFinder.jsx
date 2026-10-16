import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import { ALL_CROPS } from '../data/allCrops';
import { BookingModal } from '../components/BookingModal';
import { MapComponent } from '../components/MapComponent';
import { 
  Warehouse, 
  MapPin, 
  Star, 
  Thermometer, 
  CheckCircle2, 
  Search, 
  Plus, 
  X, 
  Filter, 
  Navigation,
  DollarSign,
  RotateCcw,
  Sparkles,
  Phone
} from 'lucide-react';

const REGION_COORDINATES = {
  kalamna: { lat: 21.1712, lng: 79.1350 },
  nagpur: { lat: 21.1458, lng: 79.0882 },
  butibori: { lat: 20.9250, lng: 78.9860 },
  wardha: { lat: 20.7390, lng: 78.6010 },
  sevagram: { lat: 20.7200, lng: 78.5800 },
  amravati: { lat: 20.8870, lng: 77.7420 },
  badnera: { lat: 20.8870, lng: 77.7420 },
  lasalgaon: { lat: 20.1472, lng: 74.2274 },
  nashik: { lat: 19.9975, lng: 73.7898 },
  pune: { lat: 18.5204, lng: 73.8567 },
  akola: { lat: 20.7002, lng: 77.0082 },
  saoner: { lat: 21.3850, lng: 78.9180 },
  umred: { lat: 20.8540, lng: 79.3270 },
  katol: { lat: 21.2720, lng: 78.5860 }
};

const resolveStorageCoords = (st, index = 0) => {
  if (st.latitude && st.longitude && typeof st.latitude === 'number' && !isNaN(st.latitude)) {
    return { lat: st.latitude, lng: st.longitude };
  }
  const loc = `${st.location || ''} ${st.name || ''}`.toLowerCase();
  for (const [key, coords] of Object.entries(REGION_COORDINATES)) {
    if (loc.includes(key)) {
      return coords;
    }
  }
  const jitterLat = ((index % 5) - 2) * 0.035;
  const jitterLng = (((index * 3) % 5) - 2) * 0.045;
  return { lat: 21.1458 + jitterLat, lng: 79.0882 + jitterLng };
};

const DEFAULT_STORAGES = [
  {
    id: 'wh-1',
    name: 'Nagpur Farmers Multi-Commodity Cold Storage',
    location: 'Kalamna Industrial Zone, Nagpur',
    latitude: 21.1712,
    longitude: 79.1350,
    capacity: 1200,
    available_capacity: 380,
    type: 'Cold Storage',
    price_per_quintal_month: 85,
    temp_range: '2°C to 8°C (Humidity controlled)',
    rating: 4.9,
    contact: '+91 712 2654900',
    supportedCrops: ['Red Onion', 'Potato', 'Fruits', 'Vegetables'],
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'wh-2',
    name: 'Wardha Central Cotton & Grain Silo',
    location: 'Sevagram Road, Wardha',
    latitude: 20.7390,
    longitude: 78.6010,
    capacity: 2500,
    available_capacity: 1150,
    type: 'Dry Grain Warehouse',
    price_per_quintal_month: 45,
    temp_range: 'Ambient Aerated',
    rating: 4.8,
    contact: '+91 7152 245100',
    supportedCrops: ['Cotton (Kapas)', 'Soybean (Yellow)', 'Wheat (Lokwan)', 'Tur'],
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'wh-3',
    name: 'Amravati Agro Logistics Cold Chain',
    location: 'MIDC Badnera, Amravati',
    latitude: 20.8870,
    longitude: 77.7420,
    capacity: 1800,
    available_capacity: 720,
    type: 'Cold Storage',
    price_per_quintal_month: 75,
    temp_range: '4°C to 12°C',
    rating: 4.7,
    contact: '+91 721 2511234',
    supportedCrops: ['Soybean (Yellow)', 'Maize (Yellow)', 'Red Onion', 'Gram'],
    image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'wh-4',
    name: 'Lasalgaon Mandi Onion Dehydration Hub',
    location: 'Lasalgaon Yard, Nashik',
    latitude: 20.1472,
    longitude: 74.2274,
    capacity: 3000,
    available_capacity: 950,
    type: 'Ventilated Silo Storage',
    price_per_quintal_month: 60,
    temp_range: '15°C Ambient Air-flow',
    rating: 4.9,
    contact: '+91 2550 266400',
    supportedCrops: ['Red Onion', 'Garlic'],
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'wh-5',
    name: 'Butibori Mega Agro Logistics Park',
    location: 'MIDC Butibori, Nagpur',
    latitude: 20.9250,
    longitude: 78.9860,
    capacity: 4000,
    available_capacity: 1800,
    type: 'Multi-Chamber Cold Chain',
    price_per_quintal_month: 90,
    temp_range: '-2°C to 10°C (CA Monitored)',
    rating: 4.9,
    contact: '+91 7104 288900',
    supportedCrops: ['Red Onion', 'Orange (Nagpur)', 'Pomegranate', 'Soybean (Yellow)'],
    image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&auto=format&fit=crop&q=80'
  }
];

export const StorageFinder = () => {
  const { showToast, authUser, getUserScopedKey } = useApp();
  const [bookingItem, setBookingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'map'
  const localKey = getUserScopedKey ? getUserScopedKey('warehouses') : 'agri_custom_warehouses';

  const [storages, setStorages] = useState(() => {
    try {
      const saved = localStorage.getItem(localKey);
      return saved ? JSON.parse(saved) : DEFAULT_STORAGES;
    } catch {
      return DEFAULT_STORAGES;
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  // New Warehouse Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLocation, setNewLocation] = useState('Nagpur, Maharashtra');
  const [newCapacity, setNewCapacity] = useState(1500);
  const [newType, setNewType] = useState('Cold Storage');
  const [newRate, setNewRate] = useState(85);
  const [newTemp, setNewTemp] = useState('2°C to 8°C');
  const [newContact, setNewContact] = useState('+91 712 2501000');
  const [newSupportedCrops, setNewSupportedCrops] = useState('Red Onion, Potato, Fruits');

  const fetchWarehouses = async () => {
    setIsLoading(true);
    try {
      const res = await api.getWarehouses({
        crop: selectedCrop !== 'All' ? selectedCrop : undefined,
        search: searchQuery || undefined
      });
      if (res && res.data && res.data.length > 0) {
        // Merge with any custom locally stored warehouses
        const localSaved = JSON.parse(localStorage.getItem(localKey) || '[]');
        const customOnly = localSaved.filter(ls => !res.data.some(d => d.id === ls.id));
        setStorages([...res.data, ...customOnly]);
      } else {
        // Fallback to local / defaults
        const localSaved = JSON.parse(localStorage.getItem(localKey) || '[]');
        setStorages(localSaved.length > 0 ? localSaved : DEFAULT_STORAGES);
      }
    } catch (err) {
      console.warn('Backend warehouses load warning, using local facilities:', err.message);
      const localSaved = JSON.parse(localStorage.getItem(localKey) || '[]');
      setStorages(localSaved.length > 0 ? localSaved : DEFAULT_STORAGES);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, [selectedCrop]);

  const handleCreateWarehouse = async (e) => {
    e.preventDefault();
    try {
      const cropsArr = newSupportedCrops.split(',').map(s => s.trim());
      const coords = resolveStorageCoords({ location: newLocation, name: newName });
      
      const newWhObj = {
        id: `wh-${Date.now()}`,
        name: newName,
        location: newLocation,
        latitude: coords.lat,
        longitude: coords.lng,
        capacity: Number(newCapacity),
        available_capacity: Number(newCapacity),
        type: newType,
        price_per_quintal_month: Number(newRate),
        temp_range: newTemp,
        contact: newContact,
        supportedCrops: cropsArr,
        rating: 5.0,
        image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80'
      };

      // Always save locally to guarantee it works even offline
      const updated = [newWhObj, ...storages];
      setStorages(updated);
      try {
        localStorage.setItem(localKey, JSON.stringify(updated));
      } catch (e) {}

      // Attempt backend sync
      try {
        await api.createWarehouse({
          name: newName,
          location: newLocation,
          latitude: coords.lat,
          longitude: coords.lng,
          capacity: Number(newCapacity),
          available_capacity: Number(newCapacity),
          type: newType,
          price_per_quintal_month: Number(newRate),
          temp_range: newTemp,
          contact: newContact,
          supported_crops: cropsArr,
          owner_id: authUser?.id || null
        });
      } catch (backendErr) {
        console.warn('Backend sync pending for warehouse:', backendErr.message);
      }

      showToast('Warehouse facility registered successfully!', 'success');
      setIsAddModalOpen(false);
      setNewName('');
    } catch (err) {
      showToast(err.message || 'Failed to register warehouse', 'error');
    }
  };

  const handleRestoreDefaults = () => {
    localStorage.removeItem('agri_custom_warehouses');
    setStorages(DEFAULT_STORAGES);
    setSelectedRegion('All');
    setSearchQuery('');
    setSelectedCrop('All');
    showToast('Default warehouse facilities restored!', 'info');
  };

  // Filter storages by crop, region, and search query
  const filteredStorages = storages.filter(st => {
    const loc = (st.location || '').toLowerCase();
    const name = (st.name || '').toLowerCase();
    const query = searchQuery.toLowerCase().trim();

    const matchRegion = selectedRegion === 'All' || 
      (selectedRegion === 'Nagpur' && (loc.includes('nagpur') || loc.includes('kalamna'))) ||
      (selectedRegion === 'Wardha' && (loc.includes('wardha') || loc.includes('sevagram'))) ||
      (selectedRegion === 'Amravati' && (loc.includes('amravati') || loc.includes('badnera'))) ||
      (selectedRegion === 'Nashik / Lasalgaon' && (loc.includes('nashik') || loc.includes('lasalgaon'))) ||
      (selectedRegion === 'Butibori' && loc.includes('butibori'));

    const matchSearch = !query || loc.includes(query) || name.includes(query) || (st.type || '').toLowerCase().includes(query);

    const crops = Array.isArray(st.supportedCrops) ? st.supportedCrops : Array.isArray(st.suitableFor) ? st.suitableFor : [];
    const matchCrop = selectedCrop === 'All' || crops.some(c => c.toLowerCase().includes(selectedCrop.toLowerCase()));

    return matchRegion && matchSearch && matchCrop;
  });

  // Geospatial map pins
  const mapMarkers = filteredStorages.map((st, idx) => {
    const coords = resolveStorageCoords(st, idx);
    const totalCap = st.capacity || st.totalCapacityTons || 1000;
    const availCap = st.available_capacity !== undefined ? st.available_capacity : (st.availableCapacityTons || 500);
    const rate = st.price_per_quintal_month || st.pricePerQuintalMonth || 80;

    return {
      id: st.id,
      lat: coords.lat,
      lng: coords.lng,
      title: st.name,
      badge: st.type || 'Cold Storage',
      subtitle: `📍 ${st.location}`,
      price: `₹${rate}/qtl/month`,
      image: st.image || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80',
      landmark: st.temp_range || st.tempRange || 'Climate Monitored',
      detail: `Available: ${availCap} / ${totalCap} Tons | Tel: ${st.contact || '+91 712 2654900'}`,
      actionLabel: '⚡ Reserve Storage Space',
      onAction: () => setBookingItem(st),
      navigationUrl: `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`
    };
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-agri-900 via-purple-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-agri-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-agri-200 border border-white/10">
            <Warehouse className="w-3.5 h-3.5 text-amber-300" />
            <span>Post-Harvest Storage & Cold Chain Network</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Warehouse & Cold Storage Finder
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Locate available temperature-controlled cold storages, government dry silos, and private warehouses across Maharashtra to prevent post-harvest spoilage.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2 shrink-0 hover:scale-105 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ List Storage Facility</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Filters, Search, and View Mode */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="text-xs font-bold py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-agri-500"
            >
              <option value="All">All Supported Crops ({ALL_CROPS.length})</option>
              {ALL_CROPS.map((c) => (
                <option key={c.key} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-64 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search warehouse or city..."
              className="w-full text-xs bg-transparent outline-none text-slate-800 placeholder-slate-400 font-medium"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'cards' ? 'bg-agri-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cards View
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'map' ? 'bg-agri-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Interactive Map ({filteredStorages.length})</span>
          </button>
        </div>
      </div>

      {/* Quick Location Chips */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="font-bold text-slate-500 text-[11px] shrink-0">Storage Hubs:</span>
          {['All', 'Nagpur', 'Wardha', 'Amravati', 'Nashik / Lasalgaon', 'Butibori'].map((hub) => (
            <button
              key={hub}
              type="button"
              onClick={() => setSelectedRegion(hub)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all border ${
                selectedRegion === hub
                  ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              📍 {hub}
            </button>
          ))}
        </div>
        <button
          onClick={handleRestoreDefaults}
          className="text-[11px] font-bold text-slate-500 hover:text-purple-700 flex items-center gap-1 transition-colors shrink-0"
          title="Restore default facilities"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Restore Default Hubs</span>
        </button>
      </div>

      {/* Interactive Map View */}
      {viewMode === 'map' && (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 p-5 rounded-3xl border border-purple-800/50 shadow-lg text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-300">Live Post-Harvest Telemetry</span>
              </div>
              <h3 className="text-lg font-black flex items-center gap-2">
                <Navigation className="w-5 h-5 text-purple-400" />
                Geospatial Warehouse & Cold Chain Map
              </h3>
              <p className="text-xs text-slate-300">
                Click any warehouse pin to inspect temperature ranges, real-time vacant tonnage capacity, monthly rates, or trigger GPS directions.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-2xl border border-white/10 shrink-0">
              <MapPin className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-slate-200">
                <strong className="text-white text-sm">{filteredStorages.length}</strong> Facilities Pinned
              </span>
            </div>
          </div>

          <MapComponent center={[20.9500, 78.5000]} zoom={8} markers={mapMarkers} height="h-[520px]" />
        </div>
      )}

      {/* Storage Cards Grid */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredStorages.length === 0 ? (
            <div className="col-span-full bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400">
              <Warehouse className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="font-bold text-slate-700">No storage facilities found matching your criteria.</p>
              <button
                onClick={handleRestoreDefaults}
                className="mt-3 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-xl text-xs font-bold"
              >
                Reset Filters & View All
              </button>
            </div>
          ) : (
            filteredStorages.map((st, idx) => {
              const coords = resolveStorageCoords(st, idx);
              const totalCap = st.capacity || st.totalCapacityTons || 1000;
              const availCap = st.available_capacity !== undefined ? st.available_capacity : (st.availableCapacityTons || 500);
              const usedTons = totalCap - availCap;
              const usedPercent = Math.min(100, Math.max(0, Math.round((usedTons / totalCap) * 100)));
              const rate = st.price_per_quintal_month || st.pricePerQuintalMonth || 80;
              const cropsList = Array.isArray(st.supportedCrops) ? st.supportedCrops : Array.isArray(st.suitableFor) ? st.suitableFor : ['General Produce'];

              return (
                <div key={st.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl transition-all space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Warehouse className="w-6 h-6 text-purple-600" />
                        <div>
                          <h3 className="font-bold text-lg text-slate-900">{st.name}</h3>
                          <span className="text-[10px] bg-purple-100 text-purple-800 font-extrabold px-2.5 py-0.5 rounded-full">
                            {st.type || 'Cold Storage'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-bold text-amber-900">{st.rating || 4.8}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {st.location}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">
                        {coords.lat.toFixed(4)}°N, {coords.lng.toFixed(4)}°E
                      </span>
                    </div>

                    {/* Capacity Progress Bar */}
                    <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-600">Available Vacant Space:</span>
                        <span className="text-emerald-700">{availCap} / {totalCap} Tons</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            usedPercent > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${usedPercent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                        <span>{usedPercent}% Occupied</span>
                        <span className="text-slate-600 font-semibold">{st.temp_range || st.tempRange || 'Controlled'}</span>
                      </div>
                    </div>

                    {/* Supported Crops Badges */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-400 block">Suitable Commodities:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {cropsList.map((crop, cIdx) => (
                          <span
                            key={cIdx}
                            className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-lg border border-slate-200"
                          >
                            {crop}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Rate */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block">Storage Rate</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-extrabold text-slate-900">₹{rate}</span>
                        <span className="text-xs text-slate-500">/ qtl / month</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
                        title="Open in Google Maps Directions"
                      >
                        <Navigation className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => setBookingItem(st)}
                        className="px-5 py-2.5 bg-agri-600 hover:bg-agri-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5 hover:scale-105 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Reserve Space</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Add Warehouse Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Warehouse className="w-5 h-5 text-purple-600" />
                <h3 className="font-extrabold text-lg text-slate-900">List New Warehouse / Cold Storage</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWarehouse} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Facility Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mahavira Cold Storage & Multi-Chamber Silo"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Storage Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Cold Storage">Cold Storage</option>
                    <option value="Dry Grain Warehouse">Dry Grain Warehouse</option>
                    <option value="Ventilated Silo Storage">Ventilated Silo Storage</option>
                    <option value="Controlled Atmosphere (CA)">Controlled Atmosphere (CA)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Total Capacity (Tons)</label>
                  <input
                    type="number"
                    required
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Rate (₹ / Qtl / Month)</label>
                  <input
                    type="number"
                    required
                    value={newRate}
                    onChange={(e) => setNewRate(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Temperature / Climate</label>
                  <input
                    type="text"
                    required
                    value={newTemp}
                    onChange={(e) => setNewTemp(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Location / Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MIDC Industrial Area, Wardha"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Supported Crops (Comma separated)</label>
                <input
                  type="text"
                  required
                  value={newSupportedCrops}
                  onChange={(e) => setNewSupportedCrops(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Contact Phone</label>
                <input
                  type="text"
                  required
                  value={newContact}
                  onChange={(e) => setNewContact(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Register Warehouse Space
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal
        isOpen={!!bookingItem}
        onClose={() => setBookingItem(null)}
        itemData={bookingItem}
        type="Storage"
      />
    </div>
  );
};
