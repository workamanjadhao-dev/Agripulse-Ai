import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';
import { EQUIPMENT } from '../data/mockData';
import { BookingModal } from '../components/BookingModal';
import { MapComponent } from '../components/MapComponent';
import { useApp } from '../context/AppContext';
import { 
  Wrench, 
  MapPin, 
  Star, 
  Search, 
  Plus, 
  X, 
  Camera, 
  Upload, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  Tag, 
  ShieldCheck, 
  Filter,
  Navigation,
  Grid,
  Compass,
  Layers
} from 'lucide-react';

// Standard Agricultural Implement Categories
export const EQUIPMENT_CATEGORIES = [
  'Rotavator',
  'Harvester',
  'Seed Drill',
  'Sprayer',
  'Laser Leveler',
  'Plough',
  'Thresher',
  'Baler',
  'Cultivator'
];

// Popular Agricultural Implement Brands
export const EQUIPMENT_BRANDS = [
  'Shaktiman',
  'Fieldking',
  'Dasmesh',
  'Lemken',
  'Mitra',
  'Mahindra',
  'Maschio Gaspardo',
  'Preet',
  'Landforce',
  'Captain'
];

// Preset Photos for quick selection if user does not have a photo handy
const PRESET_EQUIPMENT_IMAGES = [
  { label: 'Rotavator', url: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800&auto=format&fit=crop&q=80' },
  { label: 'Combine Harvester', url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80' },
  { label: 'Seed Drill', url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80' },
  { label: 'Boom Sprayer', url: 'https://images.unsplash.com/photo-1530267981608-bc70a2796de6?w=800&auto=format&fit=crop&q=80' },
  { label: 'Laser Leveler', url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=80' },
  { label: 'MB Plough', url: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop&q=80' },
  { label: 'Thresher', url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80' },
];

const DEFAULT_FALLBACK_EQ_IMG = 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800&auto=format&fit=crop&q=80';

// Geolocation coordinate resolver for equipment listings
export const resolveEquipmentCoords = (item) => {
  if (item?.latitude && item?.longitude) {
    const lat = Number(item.latitude);
    const lng = Number(item.longitude);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }
  if (item?.lat && item?.lng) {
    const lat = Number(item.lat);
    const lng = Number(item.lng);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }
  const loc = (item?.location || '').toLowerCase();
  if (loc.includes('kalmeshwar')) return { lat: 21.2333, lng: 78.9167 };
  if (loc.includes('bhandara')) return { lat: 21.1458, lng: 79.6500 };
  if (loc.includes('umred')) return { lat: 20.8544, lng: 79.3256 };
  if (loc.includes('saoner')) return { lat: 21.3853, lng: 78.9189 };
  if (loc.includes('katol')) return { lat: 21.2786, lng: 78.5867 };
  if (loc.includes('hingna')) return { lat: 21.0667, lng: 78.9667 };
  if (loc.includes('ramtek')) return { lat: 21.3986, lng: 79.3292 };
  if (loc.includes('wardha')) return { lat: 20.7453, lng: 78.6022 };
  if (loc.includes('amravati')) return { lat: 20.9374, lng: 77.7796 };
  if (loc.includes('chandrapur')) return { lat: 19.9615, lng: 79.2961 };
  if (loc.includes('yavatmal')) return { lat: 20.3888, lng: 78.1204 };
  if (loc.includes('gondia')) return { lat: 21.4598, lng: 80.1950 };
  if (loc.includes('akola')) return { lat: 20.7002, lng: 77.0082 };

  // Deterministic nearby coordinate in Vidarbha/Nagpur agricultural belt
  const idStr = String(item?.id || item?.name || 'eq');
  const hash = idStr.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const jitterLat = (((hash % 20) - 10) * 0.012);
  const jitterLng = ((((hash >> 2) % 20) - 10) * 0.012);
  return { lat: 21.1458 + jitterLat, lng: 79.0882 + jitterLng };
};

export const EquipmentRental = () => {
  const { role, showToast } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingItem, setBookingItem] = useState(null);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'map'

  const [equipmentList, setEquipmentList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modal: Add Equipment
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Rotavator');
  const [customCategory, setCustomCategory] = useState('');
  const [newBrand, setNewBrand] = useState('Shaktiman');
  const [customBrand, setCustomBrand] = useState('');
  const [newRequiredHp, setNewRequiredHp] = useState('45 - 55 HP');
  const [newRatePerDay, setNewRatePerDay] = useState(1200);
  const [newLocation, setNewLocation] = useState('Kalmeshwar, Nagpur');
  const [newSuitability, setNewSuitability] = useState('Suitable for rapid seedbed preparation and soil aeration.');

  // Image Upload State
  const [imagePreview, setImagePreview] = useState('');
  const [imageUploadError, setImageUploadError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Modal: Delete Confirmation
  const [equipmentToDelete, setEquipmentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchEquipment = async () => {
    setIsLoading(true);
    let backendData = [];
    try {
      const data = await api.getEquipment();
      if (Array.isArray(data) && data.length > 0) {
        backendData = data;
      }
    } catch {
      // Backend unavailable, fallback gracefully
    }

    // Load locally saved additions
    let localSaved = [];
    try {
      const saved = localStorage.getItem('agri_user_equipment');
      if (saved) localSaved = JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse local equipment:', e);
    }

    // Load deleted IDs
    let deletedIds = [];
    try {
      const savedDeleted = localStorage.getItem('agri_deleted_equipment_ids');
      if (savedDeleted) deletedIds = JSON.parse(savedDeleted);
    } catch (e) {}

    const baseData = backendData.length > 0 ? backendData : EQUIPMENT;
    const mergedMap = new Map();
    [...localSaved, ...baseData].forEach(item => {
      if (item && item.id && !mergedMap.has(item.id) && !deletedIds.includes(item.id)) {
        mergedMap.set(item.id, item);
      }
    });

    setEquipmentList(Array.from(mergedMap.values()));
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  // Process File Upload with Canvas Resizing
  const processImageFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImageUploadError('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setImageUploadError('Image size exceeds 8MB. Please choose a smaller file.');
      return;
    }
    setImageUploadError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1000;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.86);
        setImagePreview(compressedDataUrl);
      };
      img.onerror = () => {
        setImagePreview(e.target.result);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleCreateEquipment = async (e) => {
    e.preventDefault();

    const resolvedCategory = newCategory === 'Custom' 
      ? (customCategory.trim() || 'Custom Implement') 
      : newCategory;

    const resolvedBrand = newBrand === 'Custom'
      ? (customBrand.trim() || 'Custom Brand')
      : newBrand;

    const chosenImage = imagePreview.trim() || DEFAULT_FALLBACK_EQ_IMG;
    const coords = resolveEquipmentCoords({ location: newLocation, id: Date.now() });

    const newEqObj = {
      id: `eq-${Date.now()}`,
      name: newName.trim(),
      category: resolvedCategory,
      brand: resolvedBrand,
      requiredHp: newRequiredHp.trim() || '45 HP',
      ratePerDay: Number(newRatePerDay) || 1200,
      location: newLocation.trim() || 'Nagpur, Maharashtra',
      latitude: coords.lat,
      longitude: coords.lng,
      distanceKm: 6.5,
      rating: 4.9,
      suitability: newSuitability.trim() || 'High-performance agricultural implement.',
      image: chosenImage,
      isAvailable: true
    };

    // Prepend to current state immediately
    setEquipmentList(prev => [newEqObj, ...prev]);

    // Save locally
    try {
      const prevSaved = JSON.parse(localStorage.getItem('agri_user_equipment') || '[]');
      localStorage.setItem('agri_user_equipment', JSON.stringify([newEqObj, ...prevSaved]));
    } catch (err) {
      console.warn('LocalStorage equipment save error:', err);
    }

    // Attempt backend sync
    try {
      await api.createEquipment(newEqObj);
    } catch (err) {
      console.warn('Backend createEquipment sync:', err?.message || err);
    }

    showToast(`Equipment "${newEqObj.name}" listed successfully with thumbnail!`, 'success');
    setIsAddModalOpen(false);
    setNewName('');
    setNewCategory('Rotavator');
    setCustomCategory('');
    setNewBrand('Shaktiman');
    setCustomBrand('');
    setImagePreview('');
    setImageUploadError('');
  };

  // Delete equipment listing handler
  const handleConfirmDeleteEquipment = async () => {
    if (!equipmentToDelete) return;
    const target = equipmentToDelete;
    setIsDeleting(true);

    // 1. Immediately remove from state
    setEquipmentList(prev => prev.filter(eq => eq.id !== target.id));

    // 2. Remove from user custom list in localStorage if present
    try {
      const prevSaved = JSON.parse(localStorage.getItem('agri_user_equipment') || '[]');
      const filtered = prevSaved.filter(eq => eq.id !== target.id);
      localStorage.setItem('agri_user_equipment', JSON.stringify(filtered));
    } catch (e) {}

    // 3. Mark in deleted tracking list so it stays deleted across reloads
    try {
      const deletedIds = JSON.parse(localStorage.getItem('agri_deleted_equipment_ids') || '[]');
      if (!deletedIds.includes(target.id)) {
        localStorage.setItem('agri_deleted_equipment_ids', JSON.stringify([...deletedIds, target.id]));
      }
    } catch (e) {}

    // 4. Call backend deletion API
    try {
      await api.deleteEquipment(target.id);
    } catch (err) {
      console.warn('Backend deleteEquipment sync:', err?.message || err);
    }

    showToast(`Equipment listing "${target.name}" removed successfully!`, 'success');
    setIsDeleting(false);
    setEquipmentToDelete(null);
  };

  // Restore default fleet machinery listings
  const handleRestoreDefaults = () => {
    try {
      localStorage.removeItem('agri_deleted_equipment_ids');
    } catch {}
    fetchEquipment();
    showToast('Original equipment catalog restored successfully!', 'info');
  };

  // Dynamic Categories from presets & loaded listings
  const allAvailableCategories = Array.from(
    new Set([
      'all',
      ...EQUIPMENT_CATEGORIES,
      ...equipmentList.map(eq => eq.category).filter(Boolean)
    ])
  );

  const filteredEquipment = equipmentList.filter(eq => {
    const matchCat = selectedCategory === 'all' || 
      (eq.category && eq.category.toLowerCase() === selectedCategory.toLowerCase());

    const query = searchQuery.toLowerCase().trim();
    const matchSearch = !query || 
      (eq.name && eq.name.toLowerCase().includes(query)) || 
      (eq.category && eq.category.toLowerCase().includes(query)) ||
      (eq.brand && eq.brand.toLowerCase().includes(query)) ||
      (eq.suitability && eq.suitability.toLowerCase().includes(query)) ||
      (eq.location && eq.location.toLowerCase().includes(query));

    return matchCat && matchSearch;
  });

  // Geospatial map pins for equipment listings
  const mapMarkers = filteredEquipment.map(eq => {
    const coords = resolveEquipmentCoords(eq);
    return {
      id: eq.id,
      lat: coords.lat,
      lng: coords.lng,
      title: eq.name,
      badge: eq.category || 'Agricultural Implement',
      subtitle: `${eq.brand || 'Implement'} • ${eq.requiredHp || ''}`,
      price: `₹${Number(eq.ratePerDay)?.toLocaleString('en-IN') || '0'} / day`,
      address: `${eq.location} (${eq.distanceKm || 6} km away)`,
      image: eq.image,
      landmark: eq.isAvailable ? '✅ Ready for Dispatch' : '⏳ Currently in Field Work',
      detail: `Rating: ⭐ ${eq.rating || 4.8} | Power: ${eq.requiredHp || 'Standard'}`,
      actionLabel: '⚡ Book This Equipment',
      onAction: () => setBookingItem(eq),
      navigationUrl: `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`
    };
  });

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className={`bg-gradient-to-r ${
        role === 'owner'
          ? 'from-amber-950 via-slate-900 to-amber-950 border-amber-700/60'
          : 'from-agri-900 via-teal-950 to-slate-900 border-agri-700/60'
      } text-white rounded-3xl p-6 sm:p-8 shadow-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-6`}>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-agri-200 border border-white/10">
            <Wrench className="w-3.5 h-3.5 text-amber-300" />
            <span>Farm Machinery & Implements Hub</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Agricultural Equipment Rental
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Rent rotavators, combine harvesters, seed drills, boom sprayers, laser land levelers, and reversible ploughs at transparent daily rates with live geographic tracking.
          </p>
        </div>

        <button 
          onClick={() => {
            setImageUploadError('');
            setIsAddModalOpen(true);
          }}
          className={`px-5 py-3.5 ${
            role === 'owner' ? 'bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-amber-900/30' : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-emerald-900/30'
          } font-black text-xs sm:text-sm rounded-2xl shadow-xl transition-all shrink-0 flex items-center gap-2 hover:scale-105 active:scale-95`}
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ List Equipment for Rent</span>
        </button>
      </div>

      {/* Category Pills, View Mode Toggle & Search */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Implement Category Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {allAvailableCategories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? 'bg-agri-600 text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat === 'all' ? `All Implements (${equipmentList.length})` : cat}
              </button>
            ))}
          </div>

          {/* View Mode Toggle & Search Input */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            
            {/* View Mode: Cards vs Map */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'cards' ? 'bg-agri-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Cards View</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'map' ? 'bg-agri-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Equipment Map ({filteredEquipment.length})</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="flex items-center gap-2 w-full sm:w-72 bg-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-agri-500">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rotavator, harvester, brand, location..."
                className="w-full text-xs bg-transparent outline-none text-slate-800 placeholder-slate-400 font-medium"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Showing Count Banner */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>Showing <strong className="text-slate-800">{filteredEquipment.length}</strong> agricultural implements</span>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRestoreDefaults}
            className="text-[11px] font-bold text-slate-500 hover:text-agri-700 flex items-center gap-1 transition-colors"
            title="Restore original equipment listings"
          >
            <RotateCcw className="w-3 h-3" />
            Restore Catalog
          </button>
          <span className="flex items-center gap-1.5 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Field-tested agricultural implements
          </span>
        </div>
      </div>

      {/* INTERACTIVE EQUIPMENT MAP VIEW */}
      {viewMode === 'map' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-agri-950 p-5 sm:p-6 rounded-3xl border border-emerald-800/50 shadow-lg text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Live GPS Fleet Telemetry</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black flex items-center gap-2">
                <Navigation className="w-5 h-5 text-emerald-400" />
                Agricultural Implements & Machinery Geographic Map
              </h3>
              <p className="text-xs text-slate-300 max-w-2xl">
                Click any implement pin on the map to view machine specs, daily rates, operational readiness, or launch turn-by-turn navigation.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-2xl border border-white/10 shrink-0">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-200">
                <strong className="text-white text-sm">{filteredEquipment.length}</strong> Machinery Located
              </span>
            </div>
          </div>

          {/* Quick Hub Region Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="font-bold text-slate-500 text-[11px] shrink-0">Quick Regions:</span>
            {['All Regions', 'Kalmeshwar', 'Saoner', 'Katol', 'Umred', 'Hingna', 'Ramtek', 'Bhandara'].map((hub, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSearchQuery(hub === 'All Regions' ? '' : hub)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all border ${
                  (hub === 'All Regions' && !searchQuery) || (searchQuery.toLowerCase() === hub.toLowerCase())
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                📍 {hub}
              </button>
            ))}
          </div>

          {/* Dual-Engine Map Component */}
          <MapComponent
            center={[21.1458, 79.0882]}
            zoom={9}
            markers={mapMarkers}
            height="h-[520px]"
          />

          {/* Quick Implement Strip below map */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Implements in this Region ({filteredEquipment.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredEquipment.slice(0, 8).map(eq => {
                const coords = resolveEquipmentCoords(eq);
                return (
                  <div key={eq.id} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 hover:border-emerald-500 transition-colors">
                    <img 
                      src={eq.image || DEFAULT_FALLBACK_EQ_IMG} 
                      alt={eq.name} 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = DEFAULT_FALLBACK_EQ_IMG;
                      }}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-100" 
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
                          {eq.category}
                        </span>
                        <span className="text-xs font-black text-slate-900">₹{eq.ratePerDay}/d</span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 truncate mt-0.5">{eq.name}</p>
                      <p className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                        {eq.location}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <button
                          type="button"
                          onClick={() => setBookingItem(eq)}
                          className="px-2.5 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold"
                        >
                          Book Now
                        </button>
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-emerald-700 hover:underline font-semibold"
                        >
                          Directions →
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CARDS GRID VIEW */}
      {viewMode === 'cards' && (
        <>
          {filteredEquipment.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Wrench className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-base">No Equipment Found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  No agricultural equipment matched your filter or search query. You can reset filters or add a new equipment listing!
                </p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                  className="px-4 py-2 bg-agri-100 hover:bg-agri-200 text-agri-800 text-xs font-bold rounded-xl transition-colors"
                >
                  Reset Filters
                </button>
                <button
                  onClick={handleRestoreDefaults}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restore Catalog
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEquipment.map(eq => (
                <div 
                  key={eq.id} 
                  className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Thumbnail Image Box */}
                    <div className="relative h-52 overflow-hidden bg-slate-900">
                      <img 
                        src={eq.image || DEFAULT_FALLBACK_EQ_IMG} 
                        alt={eq.name} 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = DEFAULT_FALLBACK_EQ_IMG;
                        }}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      />

                      {/* Category & Brand Floating Badges */}
                      <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 max-w-[65%]">
                        <span className="bg-slate-950/85 backdrop-blur-md text-amber-300 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border border-white/10 shadow-md">
                          {eq.category}
                        </span>
                        {eq.brand && (
                          <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full">
                            {eq.brand}
                          </span>
                        )}
                      </div>

                      {/* Top Right: Availability Badge & Quick Remove */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full shadow-md ${
                          eq.isAvailable !== false ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
                        }`}>
                          {eq.isAvailable !== false ? 'Available' : 'Booked'}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEquipmentToDelete(eq);
                          }}
                          title="Remove this equipment listing"
                          className="p-1.5 bg-slate-950/70 hover:bg-rose-600 text-slate-300 hover:text-white rounded-full transition-colors shadow-md backdrop-blur-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Card Info Content */}
                    <div className="p-6 space-y-3.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-extrabold text-base sm:text-lg text-slate-900 group-hover:text-agri-700 transition-colors leading-tight">
                            {eq.name}
                          </h3>
                          <p className="text-[11px] font-semibold text-slate-400 mt-0.5 flex items-center gap-1">
                            <Tag className="w-3 h-3 text-agri-600" />
                            Brand: <strong className="text-slate-700">{eq.brand || 'Verified Make'}</strong>
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500 text-xs font-black bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 shrink-0">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{eq.rating || 4.8}</span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-500 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> 
                          <span className="truncate">{eq.location}</span> 
                          <span className="shrink-0">• <strong>{eq.distanceKm || 7.0} km away</strong></span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setViewMode('map');
                            window.scrollTo({ top: 380, behavior: 'smooth' });
                          }}
                          className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 shrink-0 ml-1 hover:underline cursor-pointer"
                        >
                          <Navigation className="w-3 h-3" /> Map
                        </button>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600">
                        <p className="line-clamp-2">{eq.suitability}</p>
                      </div>

                      {/* Required HP & Daily Rate */}
                      <div className="p-3.5 bg-gradient-to-r from-agri-50 to-teal-50/70 rounded-2xl border border-agri-200 flex items-center justify-between text-xs">
                        <div>
                          <p className="text-slate-500 text-[10px] font-medium">Required Tractor HP</p>
                          <p className="font-extrabold text-slate-900 text-sm">{eq.requiredHp || '40+ HP'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-500 text-[10px] font-medium">Daily Rental Rate</p>
                          <p className="font-extrabold text-agri-700 text-base">₹{eq.ratePerDay}<span className="text-[10px] text-agri-600 font-normal">/day</span></p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons: Reserve, Map & Remove */}
                  <div className="p-6 pt-0 flex items-center gap-2">
                    <button
                      disabled={eq.isAvailable === false}
                      onClick={() => setBookingItem(eq)}
                      className={`flex-1 py-3.5 rounded-2xl text-xs font-extrabold transition-all shadow-md ${
                        eq.isAvailable !== false
                          ? 'bg-agri-600 hover:bg-agri-700 text-white shadow-agri-950/20 active:scale-[0.98]' 
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {eq.isAvailable !== false ? 'Reserve Equipment Now →' : 'Currently Rented'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setViewMode('map');
                        window.scrollTo({ top: 380, behavior: 'smooth' });
                      }}
                      title="View on Interactive Map"
                      className="p-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-2xl transition-all shadow-xs shrink-0 flex items-center justify-center group/map active:scale-95 cursor-pointer"
                    >
                      <Navigation className="w-4 h-4 group-hover/map:scale-110 transition-transform" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEquipmentToDelete(eq)}
                      title="Remove this equipment listing"
                      className="p-3.5 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-2xl transition-all shadow-xs group/del active:scale-95 shrink-0"
                    >
                      <Trash2 className="w-4 h-4 group-hover/del:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* MODAL: DELETE / REMOVE CONFIRMATION */}
      {equipmentToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4 text-xs animate-in zoom-in-95 duration-200 border border-slate-200">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="p-2.5 bg-rose-100 rounded-2xl text-rose-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900">Remove Equipment Listing</h3>
                <p className="text-[11px] text-slate-500">Unlist implement from rental catalog</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <img 
                src={equipmentToDelete.image || DEFAULT_FALLBACK_EQ_IMG} 
                alt={equipmentToDelete.name} 
                className="w-16 h-16 rounded-xl object-cover border border-slate-200" 
              />
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase text-agri-700 bg-agri-100 px-2 py-0.5 rounded-md">
                  {equipmentToDelete.category}
                </span>
                <h4 className="font-extrabold text-sm text-slate-900">{equipmentToDelete.name}</h4>
                <p className="text-[11px] text-slate-500">HP: {equipmentToDelete.requiredHp} • ₹{equipmentToDelete.ratePerDay}/day</p>
              </div>
            </div>

            <p className="text-slate-600 text-xs">
              Are you sure you want to remove <strong className="text-slate-900">{equipmentToDelete.name}</strong>? It will no longer appear in the available implements catalog for farmer reservations.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setEquipmentToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDeleteEquipment}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md shadow-rose-900/20 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'Removing...' : 'Yes, Remove Equipment'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD EQUIPMENT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 sm:p-7 space-y-4 text-xs max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200 border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div>
                <h3 className="font-black text-lg text-slate-900">List Agricultural Equipment for Rent</h3>
                <p className="text-[11px] text-slate-500">List your rotavator, harvester, leveler, or implement</p>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEquipment} className="space-y-4">
              {/* Equipment Name */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Equipment Model Name <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Shaktiman 7-Feet Heavy Duty Rotavator" 
                  value={newName} 
                  onChange={e => setNewName(e.target.value)} 
                  className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-agri-500 font-medium" 
                />
              </div>

              {/* Category & Brand Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Category */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Equipment Category <span className="text-rose-500">*</span>
                  </label>
                  <select 
                    value={newCategory} 
                    onChange={e => setNewCategory(e.target.value)} 
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-agri-500"
                  >
                    <optgroup label="Popular Implements">
                      {EQUIPMENT_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Custom / Other">
                      <option value="Custom">✨ Other (Add Custom Category)</option>
                    </optgroup>
                  </select>
                </div>

                {/* Brand */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Manufacturer / Brand <span className="text-rose-500">*</span>
                  </label>
                  <select 
                    value={newBrand} 
                    onChange={e => setNewBrand(e.target.value)} 
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-agri-500"
                  >
                    <optgroup label="Popular Brands">
                      {EQUIPMENT_BRANDS.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Custom / Other">
                      <option value="Custom">✨ Other (Add Custom Brand)</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Conditional Custom Category Input */}
              {newCategory === 'Custom' && (
                <div className="p-3 bg-amber-50/70 border border-amber-300 rounded-2xl animate-in fade-in slide-in-from-top-1 duration-200">
                  <label className="font-bold text-amber-950 block mb-1 text-[11px] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Specify Custom Implement Category *
                  </label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Potato Digger, Bund Former, Sugarcane Infield Loader..." 
                    value={customCategory} 
                    onChange={e => setCustomCategory(e.target.value)} 
                    className="w-full py-2 px-3 bg-white border border-amber-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs" 
                  />
                </div>
              )}

              {/* Conditional Custom Brand Input */}
              {newBrand === 'Custom' && (
                <div className="p-3 bg-amber-50/70 border border-amber-300 rounded-2xl animate-in fade-in slide-in-from-top-1 duration-200">
                  <label className="font-bold text-amber-950 block mb-1 text-[11px] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Specify Custom Implement Brand *
                  </label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Maschio Gaspardo, Lemken, AgriStar..." 
                    value={customBrand} 
                    onChange={e => setCustomBrand(e.target.value)} 
                    className="w-full py-2 px-3 bg-white border border-amber-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs" 
                  />
                </div>
              )}

              {/* IMAGE UPLOAD SECTION WITH THUMBNAIL PREVIEW */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 flex items-center justify-between">
                  <span>Equipment Thumbnail Image <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] font-normal text-slate-400">Card thumbnail photo</span>
                </label>

                {imagePreview ? (
                  /* Thumbnail Preview Box */
                  <div className="relative rounded-2xl overflow-hidden border-2 border-agri-400 bg-slate-900 shadow-md group">
                    <img 
                      src={imagePreview} 
                      alt="Thumbnail Preview" 
                      className="w-full h-40 object-cover" 
                    />
                    <div className="absolute top-2.5 left-2.5 bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Thumbnail Active
                    </div>
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-white text-slate-900 rounded-xl font-bold text-xs shadow hover:bg-slate-100 flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" /> Change Image
                      </button>
                      <button
                        type="button"
                        onClick={() => setImagePreview('')}
                        className="px-3 py-1.5 bg-rose-600 text-white rounded-xl font-bold text-xs shadow hover:bg-rose-700 flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Drag & Drop Upload Zone */
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        processImageFile(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                      isDragging 
                        ? 'border-agri-500 bg-agri-50 scale-[1.01]' 
                        : 'border-slate-300 hover:border-agri-500 bg-slate-50 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center gap-1.5 text-slate-500">
                      <div className="p-2.5 rounded-2xl bg-agri-100 text-agri-700 shadow-xs">
                        <Camera className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-800">
                        Click to upload photo or drag & drop here
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Supports JPG, PNG, WEBP (Max 8MB) • Displayed as card thumbnail
                      </p>
                    </div>
                  </div>
                )}

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      processImageFile(e.target.files[0]);
                    }
                  }} 
                />

                {imageUploadError && (
                  <p className="text-[11px] text-rose-600 font-semibold">{imageUploadError}</p>
                )}

                {/* Preset image options */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 text-[10px]">
                  <span className="text-slate-400 font-semibold shrink-0">Or pick preset:</span>
                  {PRESET_EQUIPMENT_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setImagePreview(preset.url)}
                      className={`shrink-0 px-2 py-1 rounded-lg border font-semibold transition-all ${
                        imagePreview === preset.url 
                          ? 'bg-agri-600 text-white border-agri-600 shadow-xs' 
                          : 'bg-white text-slate-600 border-slate-200 hover:border-agri-300'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Required HP & Daily Rate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Required Tractor HP <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. 45 - 55 HP or 50+ HP" 
                    value={newRequiredHp} 
                    onChange={e => setNewRequiredHp(e.target.value)} 
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-agri-500" 
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Daily Rate (₹/day) <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="number" 
                    min="100" 
                    required 
                    value={newRatePerDay} 
                    onChange={e => setNewRatePerDay(e.target.value)} 
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-agri-700 focus:outline-none focus:ring-2 focus:ring-agri-500" 
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Base Hub Location</label>
                <input 
                  type="text" 
                  required 
                  value={newLocation} 
                  onChange={e => setNewLocation(e.target.value)} 
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-agri-500" 
                />
              </div>

              {/* Suitability Description */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Suitability & Farm Operations Description</label>
                <textarea 
                  rows={2}
                  required 
                  value={newSuitability} 
                  onChange={e => setNewSuitability(e.target.value)} 
                  placeholder="e.g. High-efficiency rotary tiller perfect for cotton and soybean field preparation." 
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-agri-500 text-xs" 
                />
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="w-full py-3.5 bg-agri-600 hover:bg-agri-700 text-white font-black text-sm rounded-2xl shadow-lg transition-all hover:shadow-agri-950/20 active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                List Equipment for Rent
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal
        isOpen={!!bookingItem}
        onClose={() => setBookingItem(null)}
        itemData={bookingItem}
        type="Equipment"
      />

    </div>
  );
};
