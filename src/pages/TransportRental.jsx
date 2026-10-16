import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import { BookingModal } from '../components/BookingModal';
import { VEHICLES } from '../data/mockData';
import { 
  Truck, 
  Calculator, 
  MapPin, 
  Star, 
  CheckCircle2, 
  Plus, 
  X, 
  Search, 
  Filter,
  Camera,
  Upload,
  Trash2,
  Sparkles,
  Tag,
  ShieldCheck,
  Phone,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

// Comprehensive Farm Produce Transport Categories
export const TRANSPORT_CATEGORIES = [
  { id: 'Pickup', label: 'Pickup Truck (1.5 - 2 Ton)', short: 'Pickup', defaultRate: 18, defaultBase: 600, defaultCap: 15 },
  { id: 'Mini Truck', label: 'Mini Truck / Chhota Hathi (0.8 - 1.2 Ton)', short: 'Mini Truck', defaultRate: 14, defaultBase: 400, defaultCap: 8 },
  { id: 'Tractor Trolley', label: 'Tractor Trolley (3 - 5 Ton)', short: 'Tractor Trolley', defaultRate: 28, defaultBase: 900, defaultCap: 40 },
  { id: 'Medium Duty Truck', label: 'Medium Duty Truck / LCV (3 - 6 Ton)', short: 'Medium Truck', defaultRate: 26, defaultBase: 1100, defaultCap: 35 },
  { id: 'Heavy Commercial Truck', label: 'Heavy Duty Truck (8 - 16 Ton)', short: 'Heavy Truck', defaultRate: 52, defaultBase: 3800, defaultCap: 120 },
  { id: 'Refrigerated Vehicle', label: 'Refrigerated Cold-Chain Van (3 - 8 Ton)', short: 'Cold Van', defaultRate: 42, defaultBase: 2500, defaultCap: 50 },
  { id: 'Livestock Carrier', label: 'Livestock & Cattle Carrier (2 - 4 Ton)', short: 'Livestock', defaultRate: 22, defaultBase: 850, defaultCap: 20 },
  { id: 'Grain Bulk Tipper', label: 'Grain Bulk Tipper / Dumper (6 - 12 Ton)', short: 'Grain Tipper', defaultRate: 46, defaultBase: 3200, defaultCap: 100 },
];

const PRESET_VEHICLE_IMAGES = [
  { label: 'Bolero Pickup', url: 'https://images.unsplash.com/photo-1559297434-fae8a1916a79?w=800&auto=format&fit=crop&q=80' },
  { label: 'Tata Ace Mini', url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&auto=format&fit=crop&q=80' },
  { label: 'Tractor Trolley', url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80' },
  { label: 'Cold-Chain Reefer', url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80' },
  { label: 'Medium LCV Truck', url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&auto=format&fit=crop&q=80' },
  { label: 'Heavy Truck', url: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800&auto=format&fit=crop&q=80' },
  { label: 'Grain Tipper', url: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?w=800&auto=format&fit=crop&q=80' },
];

const DEFAULT_FALLBACK_VEHICLE_IMG = 'https://images.unsplash.com/photo-1559297434-fae8a1916a79?w=800&auto=format&fit=crop&q=80';

export const TransportRental = () => {
  const { showToast, authUser, getUserScopedKey } = useApp();
  const [calcCategory, setCalcCategory] = useState('Pickup');
  const [calcDistance, setCalcDistance] = useState(35); // km
  const [calcWeight, setCalcWeight] = useState(25); // quintals
  const [selectedVehicleType, setSelectedVehicleType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingItem, setBookingItem] = useState(null);

  const [vehiclesList, setVehiclesList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Delete Confirmation Modal State
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // New Vehicle Listing Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newType, setNewType] = useState('Pickup');
  const [customCategory, setCustomCategory] = useState('');
  const [newName, setNewName] = useState('');
  const [newLocation, setNewLocation] = useState('Nagpur, Maharashtra');
  const [newCapacity, setNewCapacity] = useState(15);
  const [newRatePerKm, setNewRatePerKm] = useState(18);
  const [newBasePrice, setNewBasePrice] = useState(600);
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverPhone, setNewDriverPhone] = useState('+91 93701 55667');

  // Image Upload State
  const [imagePreview, setImagePreview] = useState('');
  const [imageUploadError, setImageUploadError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Auto-fill sensible default rate & capacity when category changes
  const handleCategoryChange = (val) => {
    setNewType(val);
    const matched = TRANSPORT_CATEGORIES.find(c => c.id === val);
    if (matched) {
      setNewRatePerKm(matched.defaultRate);
      setNewBasePrice(matched.defaultBase);
      setNewCapacity(matched.defaultCap);
    }
  };

  const fetchVehicles = async () => {
    setIsLoading(true);
    let backendVehicles = [];
    try {
      const res = await api.getVehicles({
        vehicle_type: selectedVehicleType !== 'All' ? selectedVehicleType : undefined,
        search: searchQuery || undefined
      });
      if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
        backendVehicles = res.data;
      }
    } catch (err) {
      console.warn('Vehicles fetch error:', err.message);
    }

    // Load locally saved vehicles scoped to user
    let localSaved = [];
    const localKey = getUserScopedKey ? getUserScopedKey('vehicles') : 'agri_user_vehicles';
    try {
      const saved = localStorage.getItem(localKey);
      if (saved) localSaved = JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse local vehicles:', e);
    }

    // Load deleted ids
    let deletedIds = [];
    const deletedKey = getUserScopedKey ? getUserScopedKey('deleted_vehicle_ids') : 'agri_deleted_vehicle_ids';
    try {
      const savedDeleted = localStorage.getItem(deletedKey);
      if (savedDeleted) deletedIds = JSON.parse(savedDeleted);
    } catch (e) {}

    const baseData = backendVehicles.length > 0 ? backendVehicles : VEHICLES;
    const mergedMap = new Map();
    [...localSaved, ...baseData].forEach(item => {
      if (item && item.id && !mergedMap.has(item.id) && !deletedIds.includes(item.id)) {
        mergedMap.set(item.id, item);
      }
    });

    setVehiclesList(Array.from(mergedMap.values()));
    setIsLoading(false);
  };

  useEffect(() => {
    fetchVehicles();
  }, [selectedVehicleType, searchQuery]);

  // Process image file via Canvas resizing for optimal Base64 performance
  const processImageFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImageUploadError('Please choose a valid image file (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setImageUploadError('Image size exceeds 8MB. Please choose a smaller photo.');
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

  // Freight Calculation based on vehicle category selected in calculator
  const matchedCategoryInfo = TRANSPORT_CATEGORIES.find(c => c.id.toLowerCase() === calcCategory.toLowerCase())
    || TRANSPORT_CATEGORIES[0];

  const matchedFleetVehicle = vehiclesList.find(v => {
    const vType = (v.vehicle_type || v.type || '').toLowerCase();
    return vType === calcCategory.toLowerCase();
  });

  const baseFare = matchedFleetVehicle
    ? (matchedFleetVehicle.basePrice || matchedFleetVehicle.base_price || matchedCategoryInfo.defaultBase)
    : matchedCategoryInfo.defaultBase;

  const ratePerKm = matchedFleetVehicle
    ? (matchedFleetVehicle.ratePerKm || matchedFleetVehicle.rate_per_km || matchedCategoryInfo.defaultRate)
    : matchedCategoryInfo.defaultRate;

  const payloadCapacity = matchedFleetVehicle
    ? (matchedFleetVehicle.capacityQuintals || matchedFleetVehicle.capacity || matchedCategoryInfo.defaultCap)
    : matchedCategoryInfo.defaultCap;

  const dist = Math.max(1, Number(calcDistance) || 1);
  const weight = Math.max(1, Number(calcWeight) || 1);

  // Trips needed based on weight and payload capacity
  const tripsNeeded = Math.max(1, Math.ceil(weight / payloadCapacity));
  const singleTripCost = baseFare + (dist * ratePerKm);
  const totalFreightCost = singleTripCost * tripsNeeded;
  const costPerQuintal = Math.round(totalFreightCost / weight);
  const isOverCapacity = weight > payloadCapacity;

  // Best-fit single-trip recommendation if over payload capacity
  const recommendedCategory = isOverCapacity
    ? TRANSPORT_CATEGORIES.find(c => c.defaultCap >= weight) || TRANSPORT_CATEGORIES[TRANSPORT_CATEGORIES.length - 1]
    : null;

  const handleCreateVehicle = async (e) => {
    e.preventDefault();

    const resolvedCategory = newType === 'Custom'
      ? (customCategory.trim() || 'Custom Vehicle')
      : newType;

    const chosenImage = imagePreview.trim() || DEFAULT_FALLBACK_VEHICLE_IMG;

    const newVehicleObj = {
      id: `vh-${Date.now()}`,
      vehicle_type: resolvedCategory,
      type: resolvedCategory,
      vehicle_name: newName.trim(),
      title: newName.trim(),
      location: newLocation.trim(),
      capacity: Number(newCapacity) || 15,
      capacityQuintals: Number(newCapacity) || 15,
      rate_per_km: Number(newRatePerKm) || 18,
      ratePerKm: Number(newRatePerKm) || 18,
      base_price: Number(newBasePrice) || 600,
      basePrice: Number(newBasePrice) || 600,
      rental_price: Number(newBasePrice) || 600,
      driver_name: newDriverName.trim() || 'Verified Driver',
      driverName: newDriverName.trim() || 'Verified Driver',
      driver_phone: newDriverPhone.trim() || '+91 93701 55667',
      driverPhone: newDriverPhone.trim() || '+91 93701 55667',
      rating: 4.9,
      isAvailable: true,
      availability: 1,
      image: chosenImage
    };

    // Prepend to UI immediately
    setVehiclesList(prev => [newVehicleObj, ...prev]);

    // Save to localStorage for instant local persistence
    const localKey = getUserScopedKey ? getUserScopedKey('vehicles') : 'agri_user_vehicles';
    const deletedKey = getUserScopedKey ? getUserScopedKey('deleted_vehicle_ids') : 'agri_deleted_vehicle_ids';
    try {
      const prevSaved = JSON.parse(localStorage.getItem(localKey) || '[]');
      localStorage.setItem(localKey, JSON.stringify([newVehicleObj, ...prevSaved]));
    } catch (err) {
      console.warn('LocalStorage vehicles save error:', err);
    }

    // Attempt backend sync
    try {
      await api.createVehicle({
        vehicle_type: resolvedCategory,
        vehicle_name: newName.trim(),
        location: newLocation.trim(),
        capacity: Number(newCapacity),
        rate_per_km: Number(newRatePerKm),
        base_price: Number(newBasePrice),
        rental_price: Number(newBasePrice),
        driver_name: newDriverName.trim() || 'Verified Driver',
        driver_phone: newDriverPhone.trim(),
        image: chosenImage,
        owner_id: authUser?.id || null
      });
    } catch (err) {
      console.warn('Backend createVehicle sync:', err?.message || err);
    }

    showToast(`Vehicle "${newName}" (${resolvedCategory}) listed with thumbnail image!`, 'success');
    setIsAddModalOpen(false);
    setNewName('');
    setNewDriverName('');
    setCustomCategory('');
    setImagePreview('');
    setImageUploadError('');
  };

  // Delete vehicle handler
  const handleConfirmDeleteVehicle = async () => {
    if (!vehicleToDelete) return;
    const target = vehicleToDelete;
    setIsDeleting(true);

    const localKey = getUserScopedKey ? getUserScopedKey('vehicles') : 'agri_user_vehicles';
    const deletedKey = getUserScopedKey ? getUserScopedKey('deleted_vehicle_ids') : 'agri_deleted_vehicle_ids';

    // 1. Remove from state immediately
    setVehiclesList(prev => prev.filter(v => v.id !== target.id));

    // 2. Remove from user custom list in localStorage if present
    try {
      const prevSaved = JSON.parse(localStorage.getItem(localKey) || '[]');
      const filtered = prevSaved.filter(v => v.id !== target.id);
      localStorage.setItem(localKey, JSON.stringify(filtered));
    } catch (e) {}

    // 3. Mark in deleted tracking list so it stays deleted across reloads
    try {
      const deletedIds = JSON.parse(localStorage.getItem(deletedKey) || '[]');
      if (!deletedIds.includes(target.id)) {
        localStorage.setItem(deletedKey, JSON.stringify([...deletedIds, target.id]));
      }
    } catch (e) {}

    // 4. Backend deletion
    try {
      await api.deleteVehicle(target.id);
    } catch (err) {
      console.warn('Backend deleteVehicle sync:', err?.message || err);
    }

    showToast(`Vehicle "${target.title || target.vehicle_name}" removed from fleet.`, 'success');
    setIsDeleting(false);
    setVehicleToDelete(null);
  };

  // Restore defaults
  const handleRestoreDefaults = () => {
    try {
      localStorage.removeItem('agri_deleted_vehicle_ids');
    } catch {}
    fetchVehicles();
    showToast('Original transport vehicles restored!', 'info');
  };

  // Derive unique category filter options from presets and loaded vehicles
  const allFilterCategories = Array.from(
    new Set([
      ...TRANSPORT_CATEGORIES.map(c => c.id),
      ...vehiclesList.map(v => v.vehicle_type || v.type).filter(Boolean)
    ])
  ).sort();

  // Filtered vehicles for current view
  const filteredVehicles = vehiclesList.filter(vh => {
    const vType = (vh.vehicle_type || vh.type || '').toLowerCase();
    const matchCategory = selectedVehicleType === 'All' 
      || vType === selectedVehicleType.toLowerCase();

    const query = searchQuery.toLowerCase().trim();
    const matchSearch = !query 
      || (vh.title && vh.title.toLowerCase().includes(query))
      || (vh.vehicle_name && vh.vehicle_name.toLowerCase().includes(query))
      || (vh.location && vh.location.toLowerCase().includes(query))
      || (vh.driverName && vh.driverName.toLowerCase().includes(query))
      || (vh.driver_name && vh.driver_name.toLowerCase().includes(query))
      || (vType.includes(query));

    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-agri-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-agri-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-agri-200 border border-white/10">
            <Truck className="w-3.5 h-3.5 text-amber-300" />
            <span>Farm Logistics</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Pickup & Transport Vehicle Rental
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Rent Bolero pickups, Tata Ace mini trucks, tractor trolleys, medium LCVs, refrigerated cold vans, and grain tippers with instant driver booking.
          </p>
        </div>

        <button
          onClick={() => {
            setImageUploadError('');
            setIsAddModalOpen(true);
          }}
          className="px-5 py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl transition-all flex items-center gap-2 shrink-0 hover:scale-105 active:scale-95 shadow-indigo-950/30"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ List Vehicle for Hire</span>
        </button>
      </div>

      {/* Built-In Transport Freight Calculator Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 text-white p-6 sm:p-8 rounded-3xl border border-indigo-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">Calculate Freight Transport Cost</h3>
              <p className="text-xs text-slate-400">Real-time freight calculation by distance, produce weight, and vehicle capacity</p>
            </div>
          </div>

          {/* Quick Distance Presets */}
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-slate-400 font-semibold mr-1">Quick Distance:</span>
            {[
              { label: '15 km (APMC)', val: 15 },
              { label: '40 km (District)', val: 40 },
              { label: '80 km (Regional)', val: 80 }
            ].map(p => (
              <button
                key={p.val}
                type="button"
                onClick={() => setCalcDistance(p.val)}
                className={`px-2.5 py-1 rounded-lg border font-bold transition-all ${
                  calcDistance === p.val 
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-xs' 
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-500'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span>Vehicle Category</span>
              <span className="text-[10px] text-indigo-300 font-bold">{payloadCapacity} Qtl Max</span>
            </label>
            <select
              value={calcCategory}
              onChange={(e) => setCalcCategory(e.target.value)}
              className="w-full text-xs font-bold py-2.5 px-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {TRANSPORT_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.label} ({cat.defaultCap} Qtl)
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Base: ₹{baseFare} • Rate: ₹{ratePerKm}/km
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Distance (km)</label>
            <input
              type="number"
              min="1"
              value={calcDistance}
              onChange={(e) => setCalcDistance(Math.max(1, Number(e.target.value) || 1))}
              className="w-full text-xs font-bold py-2.5 px-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              One-way / APMC transport distance
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span>Produce Weight (Quintals)</span>
              <span className="text-[10px] text-amber-300">{weight * 100} kg</span>
            </label>
            <input
              type="number"
              min="1"
              value={calcWeight}
              onChange={(e) => setCalcWeight(Math.max(1, Number(e.target.value) || 1))}
              className="w-full text-xs font-bold py-2.5 px-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              {tripsNeeded === 1 ? 'Fits in 1 vehicle trip' : `Requires ${tripsNeeded} vehicle trips`}
            </span>
          </div>

          <div className="bg-emerald-950/80 border border-emerald-500/50 p-4 rounded-2xl flex flex-col justify-between shadow-lg">
            <div>
              <span className="text-[10px] font-extrabold text-emerald-300 uppercase tracking-wider block">Estimated Freight Cost</span>
              <span className="text-2xl sm:text-3xl font-black text-white">₹{totalFreightCost.toLocaleString('en-IN')}</span>
            </div>
            <div className="text-[11px] text-emerald-200/90 font-medium pt-1 border-t border-emerald-500/20 mt-1 flex items-center justify-between">
              <span>₹{costPerQuintal} / Quintal</span>
              <span className="font-bold">{tripsNeeded} Trip{tripsNeeded > 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Capacity Verification & Recommendation Bar */}
        <div className="p-3.5 rounded-2xl border border-slate-800/80 bg-slate-900/60 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {!isOverCapacity ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 w-full text-emerald-300">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Payload Verified:</strong> {weight} Quintals safely fits within {matchedCategoryInfo.short} capacity ({payloadCapacity} Qtl).
                </span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedVehicleType(calcCategory)}
                className="text-[11px] font-bold text-emerald-300 hover:text-white underline shrink-0"
              >
                View Available {matchedCategoryInfo.short}s ({vehiclesList.filter(v => (v.vehicle_type || v.type || '').toLowerCase() === calcCategory.toLowerCase()).length}) →
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 w-full text-amber-200">
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Payload Exceeded:</strong> {weight} Quintals exceeds {matchedCategoryInfo.short} capacity ({payloadCapacity} Qtl). Calculated for <strong>{tripsNeeded} trips</strong>.
                </span>
              </span>
              {recommendedCategory && recommendedCategory.id !== calcCategory && (
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-amber-300">
                    💡 Single-trip option: {recommendedCategory.short} ({recommendedCategory.defaultCap} Qtl)
                  </span>
                  <button
                    type="button"
                    onClick={() => setCalcCategory(recommendedCategory.id)}
                    className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg text-[10px] transition-colors"
                  >
                    Switch to {recommendedCategory.short}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-700">Category:</span>
            <select
              value={selectedVehicleType}
              onChange={(e) => setSelectedVehicleType(e.target.value)}
              className="text-xs font-bold py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Categories ({vehiclesList.length})</option>
              {allFilterCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {selectedVehicleType !== 'All' && (
            <button
              onClick={() => setSelectedVehicleType('All')}
              className="text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-2 py-1 rounded-lg"
            >
              Clear Category Filter
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-80 bg-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vehicle, driver, city, capacity..."
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
        <span>Showing <strong className="text-slate-800">{filteredVehicles.length}</strong> available transport vehicles</span>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRestoreDefaults}
            className="text-[11px] font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
            title="Restore default vehicle listings"
          >
            <RotateCcw className="w-3 h-3" />
            Restore Fleet
          </button>
          <span className="flex items-center gap-1.5 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Live GPS-verified farm transport partners
          </span>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-600">Connecting to agricultural vehicle registry...</p>
        </div>
      )}

      {/* Available Vehicles Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredVehicles.length === 0 ? (
            <div className="col-span-full bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400 space-y-3">
              <Truck className="w-12 h-12 mx-auto text-slate-300" />
              <div>
                <p className="font-bold text-slate-700 text-base">No transport vehicles found.</p>
                <p className="text-xs mt-1 text-slate-500">Try changing filters or restore default vehicle listings.</p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => { setSelectedVehicleType('All'); setSearchQuery(''); }}
                  className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl"
                >
                  Reset Filters
                </button>
                <button
                  onClick={handleRestoreDefaults}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restore Default Fleet
                </button>
              </div>
            </div>
          ) : (
            filteredVehicles.map(vh => (
              <div 
                key={vh.id} 
                className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail Image Box */}
                  <div className="relative h-48 bg-slate-900 overflow-hidden">
                    <img 
                      src={vh.image || DEFAULT_FALLBACK_VEHICLE_IMG} 
                      alt={vh.title || vh.vehicle_name} 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = DEFAULT_FALLBACK_VEHICLE_IMG;
                      }}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />

                    {/* Category & Capacity Badges */}
                    <div className="absolute top-3 left-3 flex flex-col items-start gap-1">
                      <span className="bg-slate-950/85 backdrop-blur-md text-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-white/10 shadow-md">
                        {vh.vehicle_type || vh.type}
                      </span>
                      <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        Cap: {vh.capacityQuintals || vh.capacity} Qtl
                      </span>
                    </div>

                    {/* Top Right: Availability Badge & Quick Remove */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md ${
                        vh.isAvailable !== false ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
                      }`}>
                        {vh.isAvailable !== false ? 'Available' : 'Booked'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setVehicleToDelete(vh);
                        }}
                        title="Remove this vehicle listing"
                        className="p-1.5 bg-slate-950/70 hover:bg-rose-600 text-slate-300 hover:text-white rounded-full transition-colors shadow-md backdrop-blur-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Card Info Content */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-1.5">
                      <h3 className="font-extrabold text-base text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                        {vh.title || vh.vehicle_name}
                      </h3>
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-black bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{vh.rating || 4.8}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> 
                      <span className="truncate">{vh.location}</span>
                    </p>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                      <p className="text-slate-700 font-semibold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Driver: <strong>{vh.driverName || vh.driver_name}</strong>
                      </p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 pl-3.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {vh.driverPhone || vh.driver_phone}
                      </p>
                    </div>

                    <div className="p-3 bg-gradient-to-r from-indigo-50/70 to-slate-50 rounded-2xl border border-indigo-100 text-xs space-y-1.5">
                      <div className="flex justify-between text-slate-600">
                        <span className="text-[11px]">Base Fare</span>
                        <span className="font-bold text-slate-900">₹{vh.basePrice || vh.base_price}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600">
                        <span className="text-[11px]">Rate Per KM</span>
                        <span className="font-black text-indigo-700 text-sm">₹{vh.ratePerKm || vh.rate_per_km}<span className="text-[10px] text-slate-500 font-normal">/km</span></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons: Book & Remove */}
                <div className="p-5 pt-0 flex items-center gap-2">
                  <button
                    disabled={vh.isAvailable === false}
                    onClick={() => setBookingItem(vh)}
                    className={`flex-1 py-3.5 rounded-2xl text-xs font-black shadow-md transition-all ${
                      vh.isAvailable !== false
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-950/20 active:scale-[0.98]'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {vh.isAvailable !== false ? 'Book Driver & Vehicle →' : 'Currently Assigned'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setVehicleToDelete(vh)}
                    title="Remove this vehicle listing"
                    className="p-3.5 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-2xl transition-all shadow-xs group/del active:scale-95 shrink-0"
                  >
                    <Trash2 className="w-4 h-4 group-hover/del:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL: REMOVE / DELETE VEHICLE CONFIRMATION */}
      {vehicleToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4 text-xs animate-in zoom-in-95 duration-200 border border-slate-200">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="p-2.5 bg-rose-100 rounded-2xl text-rose-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900">Remove Vehicle Listing</h3>
                <p className="text-[11px] text-slate-500">Unlist vehicle from transport registry</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <img 
                src={vehicleToDelete.image || DEFAULT_FALLBACK_VEHICLE_IMG} 
                alt={vehicleToDelete.title || vehicleToDelete.vehicle_name} 
                className="w-16 h-16 rounded-xl object-cover border border-slate-200" 
              />
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                  {vehicleToDelete.vehicle_type || vehicleToDelete.type}
                </span>
                <h4 className="font-extrabold text-sm text-slate-900">{vehicleToDelete.title || vehicleToDelete.vehicle_name}</h4>
                <p className="text-[11px] text-slate-500">{vehicleToDelete.location} • ₹{vehicleToDelete.ratePerKm || vehicleToDelete.rate_per_km}/km</p>
              </div>
            </div>

            <p className="text-slate-600 text-xs">
              Are you sure you want to remove <strong className="text-slate-900">{vehicleToDelete.title || vehicleToDelete.vehicle_name}</strong>? It will no longer be visible for freight booking requests.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setVehicleToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDeleteVehicle}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md shadow-rose-900/20 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'Removing...' : 'Yes, Remove Vehicle'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REGISTER VEHICLE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-black text-lg">List Agricultural Transport Vehicle</h3>
                <p className="text-xs text-indigo-200">Earn steady income hauling farm produce to APMC mandis</p>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)} 
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVehicle} className="p-6 space-y-4 text-xs">
              {/* Make & Model */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Vehicle Make & Model Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mahindra Bolero Maxi Truck (1.5 Ton) or Tata Ace Gold"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Category Selector + Custom Option */}
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Vehicle Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={newType}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <optgroup label="Popular Farm Transport Categories">
                        {TRANSPORT_CATEGORIES.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.label}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Custom / Other">
                        <option value="Custom">✨ Other (Add Custom Category)</option>
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Payload Capacity (Quintals) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={newCapacity}
                      onChange={(e) => setNewCapacity(e.target.value)}
                      className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Conditional Custom Category Input */}
                {newType === 'Custom' && (
                  <div className="p-3 bg-amber-50/70 border border-amber-300 rounded-2xl animate-in fade-in slide-in-from-top-1 duration-200">
                    <label className="font-bold text-amber-950 block mb-1 text-[11px] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      Specify Custom Transport Category *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Electric Cargo 3-Wheeler, Heavy Sugarcane Hauler..."
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="w-full py-2 px-3 bg-white border border-amber-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                    />
                  </div>
                )}
              </div>

              {/* IMAGE UPLOAD SECTION WITH THUMBNAIL PREVIEW */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 flex items-center justify-between">
                  <span>Vehicle Thumbnail Image <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] font-normal text-slate-400">Card thumbnail photo</span>
                </label>

                {imagePreview ? (
                  /* Thumbnail Preview Box */
                  <div className="relative rounded-2xl overflow-hidden border-2 border-indigo-400 bg-slate-900 shadow-md group">
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
                        <Upload className="w-3.5 h-3.5" /> Change Photo
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
                        ? 'border-indigo-500 bg-indigo-50 scale-[1.01]' 
                        : 'border-slate-300 hover:border-indigo-500 bg-slate-50 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center gap-1.5 text-slate-500">
                      <div className="p-2.5 rounded-2xl bg-indigo-100 text-indigo-700 shadow-xs">
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
                  {PRESET_VEHICLE_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setImagePreview(preset.url)}
                      className={`shrink-0 px-2 py-1 rounded-lg border font-semibold transition-all ${
                        imagePreview === preset.url 
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' 
                          : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pricing Rates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Base Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newBasePrice}
                    onChange={(e) => setNewBasePrice(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-indigo-700 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Rate Per KM (₹/km)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newRatePerKm}
                    onChange={(e) => setNewRatePerKm(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-indigo-700 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Driver Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Driver Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vinayak Pawar"
                    value={newDriverName}
                    onChange={(e) => setNewDriverName(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Driver Phone Number</label>
                  <input
                    type="text"
                    required
                    value={newDriverPhone}
                    onChange={(e) => setNewDriverPhone(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Base Hub Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nagpur Central Hub / Wardha Market Yard"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm shadow-lg transition-all hover:shadow-indigo-950/20 active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  List Vehicle for Hire
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
        type="Transport"
      />

    </div>
  );
};
