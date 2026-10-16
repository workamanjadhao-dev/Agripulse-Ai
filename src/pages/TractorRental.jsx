import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';
import { TRACTORS } from '../data/mockData';
import { BookingModal } from '../components/BookingModal';
import { MapComponent } from '../components/MapComponent';
import { resolveEquipmentCoords } from './EquipmentRental';
import { 
  Tractor, 
  MapPin, 
  Star, 
  Search, 
  UserCheck, 
  Plus, 
  X, 
  Camera, 
  Upload, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  Tag,
  AlertTriangle,
  RotateCcw,
  Navigation,
  Grid,
  Phone,
  Power,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';

// Standard & Popular Indian / Global Tractor Brands
export const POPULAR_BRANDS = [
  'Mahindra',
  'Swaraj',
  'John Deere',
  'Sonalika',
  'Massey Ferguson',
  'New Holland',
  'Kubota',
  'Eicher',
  'Powertrac',
  'Farmtrac',
  'Captain',
  'VST Shakti',
  'Solis',
  'Preet',
  'Indo Farm',
  'Force Motors',
  'ACE'
];

// Presets for quick selection if user does not have a photo file ready
const PRESET_TRACTOR_IMAGES = [
  { label: 'Mahindra Red', url: 'https://images.unsplash.com/photo-1530267981608-bc70a2796de6?w=800&auto=format&fit=crop&q=80' },
  { label: 'Swaraj Blue', url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80' },
  { label: 'John Deere Green', url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=80' },
  { label: 'Harvester Duty', url: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop&q=80' },
  { label: 'Kubota Orange', url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80' },
  { label: 'Massey Classic', url: 'https://images.unsplash.com/photo-1594771804886-a933bb2d609b?w=800&auto=format&fit=crop&q=80' },
];

const DEFAULT_FALLBACK_IMG = 'https://images.unsplash.com/photo-1530267981608-bc70a2796de6?w=800&auto=format&fit=crop&q=80';

export const TractorRental = () => {
  const { role, showToast, authUser, getUserScopedKey } = useApp();
  const [selectedHp, setSelectedHp] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingItem, setBookingItem] = useState(null);
  const [tractors, setTractors] = useState([]);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'map'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Delete Confirmation Modal State
  const [tractorToDelete, setTractorToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // New Listing Form States
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('Mahindra');
  const [customBrand, setCustomBrand] = useState('');
  const [hp, setHp] = useState(45);
  const [ratePerHour, setRatePerHour] = useState(450);
  const [ratePerDay, setRatePerDay] = useState(3200);
  const [location, setLocation] = useState('Nagpur, Maharashtra');
  const [driverName, setDriverName] = useState('Suresh Deshmukh');
  const [phone, setPhone] = useState('+91 98230 44112');
  const [implementsIncluded, setImplementsIncluded] = useState('Rotavator, Cultivator');
  
  // Image Upload State
  const [imagePreview, setImagePreview] = useState('');
  const [imageUploadError, setImageUploadError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const fetchTractors = async () => {
    let backendData = [];
    try {
      const data = await api.getTractors();
      if (Array.isArray(data) && data.length > 0) {
        backendData = data;
      }
    } catch {
      // Backend unavailable, fallback gracefully
    }

    // Load locally saved additions scoped to active user
    let localSaved = [];
    const localKey = getUserScopedKey ? getUserScopedKey('tractors') : 'agri_user_tractors';
    try {
      const saved = localStorage.getItem(localKey);
      if (saved) localSaved = JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse local tractors:', e);
    }

    // Load deleted ids to filter out
    let deletedIds = [];
    const deletedKey = getUserScopedKey ? getUserScopedKey('deleted_tractor_ids') : 'agri_deleted_tractor_ids';
    try {
      const savedDeleted = localStorage.getItem(deletedKey);
      if (savedDeleted) deletedIds = JSON.parse(savedDeleted);
    } catch (e) {}

    const base = backendData.length > 0 ? backendData : TRACTORS;
    const mergedMap = new Map();
    [...localSaved, ...base].forEach(item => {
      if (item && item.id && !mergedMap.has(item.id) && !deletedIds.includes(item.id)) {
        mergedMap.set(item.id, item);
      }
    });

    setTractors(Array.from(mergedMap.values()));
  };

  useEffect(() => {
    fetchTractors();
  }, []);

  // Process File Upload with Canvas Thumbnail Resizing
  const processImageFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImageUploadError('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setImageUploadError('Image size exceeds 8MB. Please choose a smaller image file.');
      return;
    }
    setImageUploadError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Optimal thumbnail canvas resize (max 1000px dimension)
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

  const handleAddTractor = async (e) => {
    e.preventDefault();
    
    // Resolve Brand: custom or selected
    const resolvedBrand = brand === 'Custom' 
      ? (customBrand.trim() || 'Custom') 
      : brand;

    const chosenImage = imagePreview.trim() || DEFAULT_FALLBACK_IMG;

    const newTr = {
      id: `tr-${Date.now()}`,
      name: name.trim(),
      brand: resolvedBrand,
      hp: Number(hp) || 45,
      ratePerHour: Number(ratePerHour) || 450,
      ratePerDay: Number(ratePerDay) || 3200,
      driverName: driverName.trim() || authUser?.name || 'Suresh Deshmukh',
      driverPhone: phone.trim() || authUser?.phone || '+91 98230 44112',
      ownerName: driverName.trim() || authUser?.name || 'Suresh Deshmukh',
      ownerPhone: phone.trim() || authUser?.phone || '+91 98230 44112',
      location: location.trim() || 'Nagpur, Maharashtra',
      distanceKm: 5.4,
      rating: 4.9,
      totalBookings: 0,
      isAvailable: true,
      implementsIncluded: implementsIncluded
        ? implementsIncluded.split(',').map(s => s.trim()).filter(Boolean)
        : ['Rotavator'],
      image: chosenImage
    };

    // Prepend to current state immediately
    setTractors(prev => [newTr, ...prev]);

    // Save to localStorage for instant persistence scoped per user
    const localKey = getUserScopedKey ? getUserScopedKey('tractors') : 'agri_user_tractors';
    const deletedKey = getUserScopedKey ? getUserScopedKey('deleted_tractor_ids') : 'agri_deleted_tractor_ids';
    try {
      const prevSaved = JSON.parse(localStorage.getItem(localKey) || '[]');
      localStorage.setItem(localKey, JSON.stringify([newTr, ...prevSaved]));
    } catch (err) {
      console.warn('LocalStorage save error:', err);
    }

    // Attempt backend sync
    try {
      await api.createTractor({ ...newTr, owner_id: authUser?.id || null });
    } catch (err) {
      console.warn('Backend tractor sync:', err?.message || err);
    }

    showToast(`Machinery "${newTr.name}" (${newTr.brand}) listed with custom thumbnail!`, 'success');
    
    // Reset modal fields
    setIsAddModalOpen(false);
    setName('');
    setBrand('Mahindra');
    setCustomBrand('');
    setImagePreview('');
    setImageUploadError('');
  };

  // Delete tractor listing handler
  const handleConfirmDeleteTractor = async () => {
    if (!tractorToDelete) return;
    const target = tractorToDelete;
    setIsDeleting(true);

    const localKey = getUserScopedKey ? getUserScopedKey('tractors') : 'agri_user_tractors';
    const deletedKey = getUserScopedKey ? getUserScopedKey('deleted_tractor_ids') : 'agri_deleted_tractor_ids';

    // 1. Immediately remove from active state
    setTractors(prev => prev.filter(t => t.id !== target.id));

    // 2. Remove from user custom list in localStorage if present
    try {
      const prevSaved = JSON.parse(localStorage.getItem(localKey) || '[]');
      const filteredSaved = prevSaved.filter(t => t.id !== target.id);
      localStorage.setItem(localKey, JSON.stringify(filteredSaved));
    } catch (err) {}

    // 3. Add to deleted tracking list so it stays deleted across reloads
    try {
      const deletedIds = JSON.parse(localStorage.getItem(deletedKey) || '[]');
      if (!deletedIds.includes(target.id)) {
        localStorage.setItem(deletedKey, JSON.stringify([...deletedIds, target.id]));
      }
    } catch (err) {}

    // 4. Call backend deletion API
    try {
      await api.deleteTractor(target.id);
    } catch (err) {
      console.warn('Backend delete sync:', err?.message || err);
    }

    showToast(`Tractor listing "${target.name}" removed successfully!`, 'success');
    setIsDeleting(false);
    setTractorToDelete(null);
  };

  // Toggle machinery availability (Only for tractor owner / fleet partner)
  const handleToggleAvailability = async (tractor) => {
    try {
      const nextAvailable = !tractor.isAvailable;
      await api.updateTractorAvailability(tractor.id, nextAvailable);
      setTractors(prev => prev.map(t => t.id === tractor.id ? {
        ...t,
        isAvailable: nextAvailable,
        isOccupied: !nextAvailable,
        occupiedReason: nextAvailable ? '' : 'Offline / In Maintenance'
      } : t));
      showToast(`Machinery "${tractor.name}" is now marked as ${nextAvailable ? 'Available' : 'Occupied / In Field'}!`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update availability status', 'error');
    }
  };

  // Restore default fleet machinery listings
  const handleRestoreDefaults = () => {
    try {
      localStorage.removeItem('agri_deleted_tractor_ids');
    } catch {}
    fetchTractors();
    showToast('Original fleet tractors restored successfully!', 'info');
  };

  // Derive unique brand list from loaded tractors and popular presets for filtering
  const allAvailableBrands = Array.from(
    new Set([
      ...POPULAR_BRANDS,
      ...tractors.map(t => t.brand).filter(Boolean)
    ])
  ).sort();

  const filteredTractors = tractors.filter(tr => {
    const matchHp = selectedHp === 'all' 
      || (selectedHp === 'below-40' && tr.hp < 40)
      || (selectedHp === '40-50' && tr.hp >= 40 && tr.hp <= 50) 
      || (selectedHp === '50+' && tr.hp > 50);

    const matchBrand = selectedBrand === 'all' 
      || (tr.brand && tr.brand.toLowerCase() === selectedBrand.toLowerCase());

    const query = searchQuery.toLowerCase().trim();
    const matchSearch = !query 
      || (tr.name && tr.name.toLowerCase().includes(query))
      || (tr.brand && tr.brand.toLowerCase().includes(query))
      || (tr.location && tr.location.toLowerCase().includes(query))
      || (tr.implementsIncluded && tr.implementsIncluded.some(imp => imp.toLowerCase().includes(query)));

    return matchHp && matchBrand && matchSearch;
  });

  // Geospatial map pins for tractor fleet
  const tractorMapMarkers = filteredTractors.map(tr => {
    const coords = resolveEquipmentCoords(tr);
    return {
      id: tr.id,
      lat: coords.lat,
      lng: coords.lng,
      title: tr.name,
      badge: `${tr.hp} HP Tractor`,
      subtitle: `${tr.brand} • ${tr.implementsIncluded?.join(', ') || 'Standard Implements'}`,
      price: `₹${Number(tr.ratePerDay)?.toLocaleString('en-IN') || '0'} / day`,
      address: `${tr.location} (${tr.distanceKm || 8} km away)`,
      image: tr.image,
      landmark: tr.isAvailable !== false ? '✅ Driver & Tractor Ready' : '⏳ In Field Work',
      detail: `Driver: ${tr.ownerName || 'Verified Operator'} (${tr.ownerPhone || 'Active'}) | ₹${tr.ratePerHour}/hr`,
      actionLabel: '⚡ Book Tractor Fleet',
      onAction: () => setBookingItem(tr),
      navigationUrl: `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`
    };
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className={`bg-gradient-to-r ${
        role === 'owner' 
          ? 'from-amber-950 via-slate-900 to-amber-950 border-amber-700/60' 
          : 'from-agri-900 via-emerald-950 to-teal-900 border-agri-700/60'
      } text-white rounded-3xl p-6 sm:p-8 shadow-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-6`}>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-amber-200 border border-white/10">
            <UserCheck className="w-3.5 h-3.5 text-amber-300" />
            <span>Mode: <strong className="uppercase text-white">{role}</strong></span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {role === 'owner' ? 'Owner Fleet & Machinery Listings' : 'Tractor & Machinery Rental'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            {role === 'owner' 
              ? 'List your tractors, rotavators, and harvesters for rent. Upload high-res photos, set custom brands, remove retired tractors, and configure pricing.'
              : 'Rent high-performance 25–65 HP tractors across all major brands with verified drivers and attached implements at transparent rates.'}
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
          <span>+ List Machinery for Rent</span>
        </button>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">HP Category</label>
            <select
              value={selectedHp}
              onChange={(e) => setSelectedHp(e.target.value)}
              className="text-xs font-bold py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-agri-500"
            >
              <option value="all">All HP Ranges ({tractors.length})</option>
              <option value="below-40">&lt; 40 HP (Mini / Orchard)</option>
              <option value="40-50">40 - 50 HP (Medium Field)</option>
              <option value="50+">50+ HP (Heavy Duty)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">Tractor Brand</label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="text-xs font-bold py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-agri-500"
            >
              <option value="all">All Brands ({tractors.length})</option>
              {allAvailableBrands.map(b => (
                <option key={b} value={b.toLowerCase()}>{b}</option>
              ))}
            </select>
          </div>

          {selectedBrand !== 'all' && (
            <button
              onClick={() => setSelectedBrand('all')}
              className="self-end mb-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-2 py-1 rounded-lg"
            >
              Clear Brand Filter
            </button>
          )}

          {/* View Mode: Cards vs Map */}
          <div className="self-end mb-0.5 flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'cards' ? 'bg-agri-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'map' ? 'bg-agri-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Map ({filteredTractors.length})</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-80 bg-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-agri-500">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search brand, model, location, attachment..."
            className="w-full text-xs bg-transparent outline-none text-slate-800 placeholder-slate-400 font-medium"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Showing Count Banner */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>Showing <strong className="text-slate-800">{filteredTractors.length}</strong> available machinery listings</span>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRestoreDefaults}
            className="text-[11px] font-bold text-slate-500 hover:text-agri-700 flex items-center gap-1 transition-colors"
            title="Restore default tractor listings"
          >
            <RotateCcw className="w-3 h-3" />
            Restore Fleet
          </button>
          <span className="flex items-center gap-1.5 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Live verified APMC rental fleet
          </span>
        </div>
      </div>

      {/* INTERACTIVE TRACTOR FLEET MAP VIEW */}
      {viewMode === 'map' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-agri-950 p-5 sm:p-6 rounded-3xl border border-emerald-800/50 shadow-lg text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Live Tractor Fleet Telemetry</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black flex items-center gap-2">
                <Navigation className="w-5 h-5 text-emerald-400" />
                Geospatial Tractor Fleet & Machinery Map
              </h3>
              <p className="text-xs text-slate-300 max-w-2xl">
                Locate nearby available tractors and drivers on the map, inspect horsepower, driver ratings, hourly/daily rental rates, or launch instant GPS navigation.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-2xl border border-white/10 shrink-0">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-200">
                <strong className="text-white text-sm">{filteredTractors.length}</strong> Tractors Located
              </span>
            </div>
          </div>

          {/* Quick Hub Region Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="font-bold text-slate-500 text-[11px] shrink-0">Quick Regions:</span>
            {['All Regions', 'Nagpur', 'Bhandara', 'Umred', 'Saoner', 'Katol', 'Ramtek', 'Kamptee'].map((hub, idx) => (
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
            markers={tractorMapMarkers}
            height="h-[520px]"
          />

          {/* Quick Tractor Strip below map */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Available Machinery in this Hub ({filteredTractors.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTractors.slice(0, 8).map(tr => {
                const coords = resolveEquipmentCoords(tr);
                return (
                  <div key={tr.id} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 hover:border-emerald-500 transition-colors">
                    <img 
                      src={tr.image || DEFAULT_FALLBACK_IMG} 
                      alt={tr.name} 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = DEFAULT_FALLBACK_IMG;
                      }}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-100" 
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-50 text-amber-800">
                          {tr.brand} • {tr.hp}HP
                        </span>
                        <span className="text-xs font-black text-slate-900">₹{tr.ratePerDay}/d</span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 truncate mt-0.5">{tr.name}</p>
                      <p className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                        {tr.location}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <button
                          type="button"
                          onClick={() => setBookingItem(tr)}
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

      {/* Tractor Cards Grid */}
      {viewMode === 'cards' && (
        <>
          {filteredTractors.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Tractor className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-base">No Tractors Found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  No machinery matched your selected filters, or listings have been removed. You can reset filters or restore default fleet listings anytime!
                </p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => { setSelectedHp('all'); setSelectedBrand('all'); setSearchQuery(''); }}
                  className="px-4 py-2 bg-agri-100 hover:bg-agri-200 text-agri-800 text-xs font-bold rounded-xl transition-colors"
                >
                  Reset Filters
                </button>
                <button
                  onClick={handleRestoreDefaults}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restore Default Tractors
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTractors.map(tr => {
                const isTractorOwner = Boolean(
                  tr.isOwner ||
                  (authUser && (
                    (tr.owner_id && tr.owner_id === authUser.id) ||
                    (authUser.name && tr.ownerName && tr.ownerName.toLowerCase().includes(authUser.name.toLowerCase())) ||
                    (authUser.name && tr.driverName && tr.driverName.toLowerCase().includes(authUser.name.toLowerCase()))
                  )) ||
                  role === 'admin'
                );

                const isOccupied = Boolean(tr.isOccupied || !tr.isAvailable);

                return (
                  <div 
                    key={tr.id} 
                    className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Thumbnail Image Box */}
                      <div className="relative h-52 overflow-hidden bg-slate-900">
                        <img 
                          src={tr.image || DEFAULT_FALLBACK_IMG} 
                          alt={tr.name} 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = DEFAULT_FALLBACK_IMG;
                          }}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        />

                        {/* Brand & HP Floating Badges */}
                        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 max-w-[65%]">
                          <span className="bg-slate-950/85 backdrop-blur-md text-amber-300 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border border-white/10 shadow-md">
                            {tr.brand}
                          </span>
                          <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full">
                            {tr.hp} HP
                          </span>
                        </div>

                        {/* Top Right: Availability Badge & Quick Remove Icon (Owner Only) */}
                        <div className="absolute top-3 right-3 flex items-center gap-1.5">
                          {isTractorOwner && (
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 shadow-md border border-amber-300">
                              Your Fleet
                            </span>
                          )}

                          <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full shadow-md ${
                            isOccupied ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-slate-950'
                          }`}>
                            {isOccupied ? (tr.occupiedReason || 'Occupied') : 'Available Now'}
                          </span>

                          {/* Only Owner or Admin can delete */}
                          {isTractorOwner && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setTractorToDelete(tr);
                              }}
                              title="Remove your tractor listing"
                              className="p-1.5 bg-slate-950/70 hover:bg-rose-600 text-slate-300 hover:text-white rounded-full transition-colors shadow-md backdrop-blur-xs cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Card Info Content */}
                      <div className="p-6 space-y-3.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 group-hover:text-agri-700 transition-colors leading-tight">
                              {tr.name}
                            </h3>
                            <p className="text-[11px] font-semibold text-slate-400 mt-0.5 flex items-center gap-1">
                              <Tag className="w-3 h-3 text-agri-600" />
                              Brand: <strong className="text-slate-700">{tr.brand}</strong>
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-amber-500 text-xs font-black bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 shrink-0">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{tr.rating || 4.9}</span>
                          </div>
                        </div>

                        <div className="text-xs text-slate-500 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 truncate">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> 
                            <span className="truncate">{tr.location}</span> 
                            <span className="shrink-0">• <strong>{tr.distanceKm || 6.0} km away</strong></span>
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

                        {/* Implements / Attachments */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Included Implements:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {(tr.implementsIncluded || []).map((imp, iIdx) => (
                              <span key={iIdx} className="text-[11px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-lg border border-slate-200">
                                + {imp}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Driver & Contact Phone Box */}
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0 text-xs shadow-2xs">
                              <UserCheck className="w-4 h-4 text-emerald-700" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Assigned Driver</span>
                              <p className="font-extrabold text-xs text-slate-900 truncate">
                                {tr.driverName || tr.ownerName || 'Suresh Deshmukh'}
                              </p>
                            </div>
                          </div>

                          <a
                            href={`tel:${tr.driverPhone || tr.ownerPhone || '+91 98230 44112'}`}
                            onClick={(e) => e.stopPropagation()}
                            className="px-2.5 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-[11px] font-black transition-colors flex items-center gap-1 shrink-0 shadow-2xs hover:shadow-xs"
                            title={`Call driver ${tr.driverName || tr.ownerName || 'Suresh Deshmukh'}`}
                          >
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <span>{tr.driverPhone || tr.ownerPhone || '+91 98230 44112'}</span>
                          </a>
                        </div>

                        {/* Pricing Box */}
                        <div className="p-3.5 bg-gradient-to-r from-agri-50 to-emerald-50/70 rounded-2xl border border-agri-200 flex items-center justify-between text-xs">
                          <div>
                            <p className="text-slate-500 text-[10px] font-medium">Hourly Rate</p>
                            <p className="font-extrabold text-slate-900 text-base">₹{tr.ratePerHour}<span className="text-[10px] text-slate-500 font-normal">/hr</span></p>
                          </div>
                          <div className="text-right">
                            <p className="text-slate-500 text-[10px] font-medium">Full Day Rate</p>
                            <p className="font-extrabold text-agri-700 text-base">₹{tr.ratePerDay}<span className="text-[10px] text-agri-600 font-normal">/day</span></p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons: Book, Toggle Availability, or Remove */}
                    <div className="p-6 pt-0 flex items-center gap-2">
                      {isTractorOwner ? (
                        // Owner Actions
                        <>
                          <button
                            type="button"
                            onClick={() => handleToggleAvailability(tr)}
                            className={`flex-1 py-3 px-3 rounded-2xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                              tr.isAvailable
                                ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                          >
                            <Power className="w-3.5 h-3.5" />
                            <span>{tr.isAvailable ? 'Mark as Offline / Occupied' : 'Mark as Available Now'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setTractorToDelete(tr)}
                            title="Remove your tractor listing"
                            className="p-3.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-2xl transition-all shadow-xs group/del active:scale-95 shrink-0 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 group-hover/del:scale-110 transition-transform" />
                          </button>
                        </>
                      ) : (
                        // Customer / Farmer Actions
                        <button
                          disabled={isOccupied}
                          onClick={() => setBookingItem(tr)}
                          className={`flex-1 py-3.5 rounded-2xl text-xs font-extrabold transition-all shadow-md ${
                            !isOccupied 
                              ? 'bg-agri-600 hover:bg-agri-700 text-white shadow-agri-950/20 active:scale-[0.98] cursor-pointer' 
                              : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                          }`}
                        >
                          {!isOccupied ? 'Book Machinery Now →' : `Occupied (${tr.occupiedReason || 'Currently in Field Work'})`}
                        </button>
                      )}

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
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* MODAL: REMOVE / DELETE CONFIRMATION */}
      {tractorToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4 text-xs animate-in zoom-in-95 duration-200 border border-slate-200">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="p-2.5 bg-rose-100 rounded-2xl text-rose-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900">Remove Tractor Listing</h3>
                <p className="text-[11px] text-slate-500">Unlist machinery from rental catalog</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <img 
                src={tractorToDelete.image || DEFAULT_FALLBACK_IMG} 
                alt={tractorToDelete.name} 
                className="w-16 h-16 rounded-xl object-cover border border-slate-200" 
              />
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase text-agri-700 bg-agri-100 px-2 py-0.5 rounded-md">
                  {tractorToDelete.brand}
                </span>
                <h4 className="font-extrabold text-sm text-slate-900">{tractorToDelete.name}</h4>
                <p className="text-[11px] text-slate-500">{tractorToDelete.hp} HP • {tractorToDelete.location}</p>
              </div>
            </div>

            <p className="text-slate-600 text-xs">
              Are you sure you want to remove <strong className="text-slate-900">{tractorToDelete.name}</strong>? This tractor will be unlisted from your active fleet and will no longer appear for farmer bookings.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setTractorToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDeleteTractor}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md shadow-rose-900/20 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'Removing...' : 'Yes, Remove Tractor'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Tractor */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 sm:p-7 space-y-4 text-xs max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200 border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div>
                <h3 className="font-black text-lg text-slate-900">List Machinery for Rent</h3>
                <p className="text-[11px] text-slate-500">Provide tractor details, custom brand, and upload a thumbnail image.</p>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTractor} className="space-y-4">
              {/* Tractor Model Name */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tractor Model Name <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. John Deere 5050D PowerPro or Swaraj 855 FE" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-agri-500 font-medium" 
                />
              </div>

              {/* Brand Selector + Custom Option */}
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Tractor Brand <span className="text-rose-500">*</span>
                    </label>
                    <select 
                      value={brand} 
                      onChange={e => setBrand(e.target.value)} 
                      className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-agri-500"
                    >
                      <optgroup label="Popular Tractor Brands">
                        {POPULAR_BRANDS.map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Custom / Other">
                        <option value="Custom">✨ Other (Add Custom Brand)</option>
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Horsepower (HP) <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="number" 
                      min="15" 
                      max="120" 
                      required
                      value={hp} 
                      onChange={e => setHp(e.target.value)} 
                      className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-agri-500 font-semibold" 
                    />
                  </div>
                </div>

                {/* Conditional Custom Brand Input */}
                {brand === 'Custom' && (
                  <div className="p-3 bg-amber-50/70 border border-amber-300 rounded-2xl animate-in fade-in slide-in-from-top-1 duration-200">
                    <label className="font-bold text-amber-950 block mb-1 text-[11px] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      Specify Custom Brand Name *
                    </label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Escorts, Escort Farmtrac, Yanmar, Tafe, International..." 
                      value={customBrand} 
                      onChange={e => setCustomBrand(e.target.value)} 
                      className="w-full py-2 px-3 bg-white border border-amber-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-slate-400 text-xs" 
                    />
                    <p className="text-[10px] text-amber-700 mt-1 font-medium">
                      This custom brand will be saved and added dynamically to the brand filter!
                    </p>
                  </div>
                )}
              </div>

              {/* IMAGE UPLOAD SECTION WITH THUMBNAIL PREVIEW */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 flex items-center justify-between">
                  <span>Tractor Thumbnail Image <span className="text-rose-500">*</span></span>
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
                  {PRESET_TRACTOR_IMAGES.map((preset, idx) => (
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

              {/* Rates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hourly Rate (₹/hr)</label>
                  <input 
                    type="number" 
                    required 
                    value={ratePerHour} 
                    onChange={e => setRatePerHour(e.target.value)} 
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-agri-500" 
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Daily Rate (₹/day)</label>
                  <input 
                    type="number" 
                    required 
                    value={ratePerDay} 
                    onChange={e => setRatePerDay(e.target.value)} 
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-agri-700 focus:outline-none focus:ring-2 focus:ring-agri-500" 
                  />
                </div>
              </div>

              {/* Location & Driver Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Base Location</label>
                  <input 
                    type="text" 
                    required 
                    value={location} 
                    onChange={e => setLocation(e.target.value)} 
                    placeholder="e.g. Nagpur, Maharashtra"
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-agri-500" 
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Driver / Operator Name</label>
                  <input 
                    type="text" 
                    required 
                    value={driverName} 
                    onChange={e => setDriverName(e.target.value)} 
                    placeholder="e.g. Suresh Deshmukh"
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-agri-500" 
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Driver Contact Phone</label>
                  <input 
                    type="text" 
                    required 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)} 
                    placeholder="+91 98230 44112"
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-agri-500" 
                  />
                </div>
              </div>

              {/* Included Implements */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Included Implements (Comma-separated)
                </label>
                <input 
                  type="text" 
                  value={implementsIncluded} 
                  onChange={e => setImplementsIncluded(e.target.value)} 
                  placeholder="e.g. Rotavator, Cultivator, Trolley, Laser Leveler" 
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-agri-500" 
                />
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="w-full py-3.5 bg-agri-600 hover:bg-agri-700 text-white font-black text-sm rounded-2xl shadow-lg transition-all hover:shadow-agri-950/20 active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                List Tractor Machinery
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
        type="Tractor"
      />
    </div>
  );
};
