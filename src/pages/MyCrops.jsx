import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Sprout, 
  Calendar, 
  Plus, 
  CheckCircle2, 
  TrendingUp, 
  Sparkles, 
  X, 
  Edit3, 
  Trash2, 
  MapPin, 
  ShoppingBag, 
  Truck, 
  Warehouse 
} from 'lucide-react';
import { ALL_CROPS } from '../data/allCrops';

export const MyCrops = () => {
  const navigate = useNavigate();
  const { crops, addCrop, updateCrop, deleteCrop, showToast, userProfile, updateUserProfile, authUser } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);

  // Farmland Profile Edit State
  const [isEditLandModalOpen, setIsEditLandModalOpen] = useState(false);
  const [landForm, setLandForm] = useState({
    farmLand: userProfile?.farmLand || '',
    farmSizeAcres: userProfile?.farmSizeAcres || 3.0,
    soilType: userProfile?.soilType || 'Black Cotton Soil',
    location: userProfile?.location || 'Wardha, Maharashtra'
  });

  // Sync landForm when userProfile updates
  React.useEffect(() => {
    if (userProfile) {
      setLandForm({
        farmLand: userProfile.farmLand || (authUser ? `${authUser.name}'s Agro Farm` : 'My Agricultural Farm'),
        farmSizeAcres: userProfile.farmSizeAcres !== undefined && userProfile.farmSizeAcres !== null ? userProfile.farmSizeAcres : 3.0,
        soilType: userProfile.soilType || 'Black Cotton Soil',
        location: userProfile.location || 'Wardha, Maharashtra'
      });
    }
  }, [userProfile, authUser]);

  const handleUpdateLand = async (e) => {
    e.preventDefault();
    await updateUserProfile({
      id: authUser?.id || userProfile?.id,
      farmLand: landForm.farmLand,
      farmSizeAcres: Number(landForm.farmSizeAcres) || 3.0,
      soilType: landForm.soilType,
      location: landForm.location
    });
    setIsEditLandModalOpen(false);
  };

  // Form State for Adding Crop
  const [cropName, setCropName] = useState('Cotton (Kapas)');
  const [quantity, setQuantity] = useState(35);
  const [unit, setUnit] = useState('Quintal');
  const [location, setLocation] = useState(userProfile?.location || 'Wardha, Maharashtra');
  const [sowingDate, setSowingDate] = useState('2026-06-15');
  const [expectedHarvestDate, setExpectedHarvestDate] = useState('2026-10-20');
  const [stage, setStage] = useState('Flowering & Boll Formation');
  const [progressPercent, setProgressPercent] = useState(65);
  const [healthStatus, setHealthStatus] = useState('Excellent');
  const [soilType, setSoilType] = useState(userProfile?.soilType || 'Black Cotton Soil');

  const cropSuggestions = ALL_CROPS.map(c => c.name);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    await addCrop({
      crop_name: cropName,
      quantity: Number(quantity),
      unit,
      location: location || userProfile?.location || 'Maharashtra',
      sowing_date: sowingDate,
      expected_harvest_date: expectedHarvestDate,
      stage,
      progress_percent: Number(progressPercent),
      health_status: healthStatus,
      soil_type: soilType || userProfile?.soilType || 'Black Cotton Soil',
      expected_yield_quintals: Number(quantity)
    });
    setIsAddModalOpen(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingCrop) return;
    await updateCrop(editingCrop.id, {
      crop_name: editingCrop.crop_name,
      quantity: Number(editingCrop.quantity),
      unit: editingCrop.unit || 'Quintal',
      location: editingCrop.location,
      sowing_date: editingCrop.sowing_date,
      expected_harvest_date: editingCrop.expected_harvest_date,
      stage: editingCrop.stage,
      progress_percent: Number(editingCrop.progress_percent),
      health_status: editingCrop.health_status,
      status: editingCrop.status
    });
    setEditingCrop(null);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from your farm crops?`)) {
      await deleteCrop(id);
    }
  };

  const totalFarmYield = crops.reduce((acc, c) => acc + (Number(c.quantity) || 0), 0);

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-agri-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-agri-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-agri-200 border border-white/10">
            <Sprout className="w-3.5 h-3.5 text-amber-300" />
            <span>Farm Crop Management & Stage Tracking</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            My Farm Crops Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Register and manage your farm crops with full lifecycle progress, quantity tracking, location details, and direct AI price predictions.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2 shrink-0 hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Crop Field</span>
        </button>
      </div>

      {/* ── Farmland & Soil Profile Card (Isolated Per User) ── */}
      <div className="bg-white rounded-3xl border border-emerald-200/80 p-6 sm:p-7 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-slate-100 pb-5">
          <div className="flex items-start sm:items-center gap-4">
            <div className="p-3 bg-gradient-to-tr from-emerald-600 to-teal-600 text-white rounded-2xl shadow-md shrink-0">
              <Sprout className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  {userProfile?.farmLand || (authUser ? `${authUser.name}'s Farm` : 'My Agricultural Land')}
                </h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {authUser?.name ? `Farmer: ${authUser.name}` : 'Registered Landholder'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{userProfile?.location || 'Wardha, Maharashtra'}</span>
                <span>•</span>
                <span className="text-slate-600 font-medium">Default Mandi: {userProfile?.defaultMandi || 'Nagpur APMC'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditLandModalOpen(true)}
            className="px-4 py-2 bg-slate-100 hover:bg-emerald-50 text-emerald-800 hover:border-emerald-300 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 self-start md:self-auto cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Edit Farmland & Soil</span>
          </button>
        </div>

        {/* Farmland Quick Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5">
          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Farmland Area</span>
            <span className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5 block">
              {userProfile?.farmSizeAcres ? `${userProfile.farmSizeAcres} Acres` : '3.0 Acres'}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Soil Type Classification</span>
            <span className="text-base sm:text-lg font-extrabold text-emerald-800 mt-0.5 block truncate" title={userProfile?.soilType || 'Black Cotton Soil'}>
              {userProfile?.soilType || 'Black Cotton Soil'}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Active Crops Cultivated</span>
            <span className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5 block">
              {crops.length} Crop Batches
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Expected Yield</span>
            <span className="text-base sm:text-lg font-extrabold text-agri-700 mt-0.5 block">
              {totalFarmYield} Quintals
            </span>
          </div>
        </div>
      </div>

      {/* Crops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {crops.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400">
            <Sprout className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-700">No farm crops registered yet.</p>
            <p className="text-xs mt-1">Click "+ Add New Crop Field" above to register your first produce batch.</p>
          </div>
        ) : (
          crops.map(crop => (
            <div key={crop.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
              
              <div>
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900">{crop.crop_name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" /> {crop.location || 'Wardha, Maharashtra'}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-agri-100 text-agri-800 px-3 py-1 rounded-full">
                      {crop.progress_percent || 20}% Ready
                    </span>
                    <button
                      onClick={() => setEditingCrop(crop)}
                      className="p-1.5 text-slate-400 hover:text-agri-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit Crop"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(crop.id, crop.crop_name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Crop"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Lifecycle Stage Progress Bar */}
                <div className="space-y-2 mt-3">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600">Current Stage: <strong className="text-agri-700">{crop.stage || 'Vegetative Growth'}</strong></span>
                    <span className="text-slate-400">Harvest: {crop.expected_harvest_date}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-agri-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(5, crop.progress_percent || 20))}%` }}
                    ></div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-2 gap-2 text-xs mt-3">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Total Quantity</span>
                    <span className="font-extrabold text-slate-900 text-sm">{crop.quantity} {crop.unit || 'Quintal'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Crop Status</span>
                    <span className="font-bold text-emerald-700">{crop.status || 'Growing'}</span>
                  </div>
                  <div className="mt-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Sowing Date</span>
                    <span className="font-medium text-slate-700">{crop.sowing_date}</span>
                  </div>
                  <div className="mt-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Health Status</span>
                    <span className="font-bold text-slate-800">{crop.health_status || 'Good'}</span>
                  </div>
                </div>
              </div>

              {/* Action Links */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <button 
                  onClick={() => navigate(`/forecasting?crop=${encodeURIComponent(crop.crop_name)}`)}
                  className="text-agri-700 font-bold hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> View Price Forecast →
                </button>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => navigate(`/marketplace?crop=${encodeURIComponent(crop.crop_name)}`)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1 font-semibold"
                    title="Find Buyers for this crop"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-blue-600" /> Buyers
                  </button>
                  <button 
                    onClick={() => navigate('/transport')}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1 font-semibold"
                    title="Find transport"
                  >
                    <Truck className="w-3.5 h-3.5 text-indigo-600" /> Transport
                  </button>
                  <button 
                    onClick={() => navigate('/storage')}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1 font-semibold"
                    title="Find storage"
                  >
                    <Warehouse className="w-3.5 h-3.5 text-purple-600" /> Storage
                  </button>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

      {/* MODAL: ADD CROP */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-agri-800 to-agri-600 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base">Register New Farm Crop</h3>
                <p className="text-xs text-agri-100">Add to your farm inventory for tracking & AI forecasting</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-white hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Crop Name</label>
                <select
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-agri-500 outline-none"
                >
                  {cropSuggestions.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Estimated Quantity</label>
                  <input
                    type="number"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-agri-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-agri-500 outline-none"
                  >
                    <option value="Quintal">Quintal</option>
                    <option value="Ton">Ton</option>
                    <option value="Kg">Kg</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Farm Location</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-agri-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Sowing Date</label>
                  <input
                    type="date"
                    required
                    value={sowingDate}
                    onChange={(e) => setSowingDate(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-agri-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Harvest Date</label>
                  <input
                    type="date"
                    required
                    value={expectedHarvestDate}
                    onChange={(e) => setExpectedHarvestDate(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-agri-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Lifecycle Stage</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-agri-500 outline-none"
                  >
                    <option value="Sowing">Sowing</option>
                    <option value="Vegetative Growth">Vegetative Growth</option>
                    <option value="Flowering & Boll Formation">Flowering & Boll Formation</option>
                    <option value="Pod Filling Stage">Pod Filling Stage</option>
                    <option value="Harvest Ready">Harvest Ready</option>
                    <option value="Harvested">Harvested</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Progress (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={progressPercent}
                    onChange={(e) => setProgressPercent(Number(e.target.value))}
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-agri-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-agri-600 hover:bg-agri-700 text-white rounded-xl font-bold text-xs shadow-md transition-all"
                >
                  Save Crop Field to Farm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT CROP */}
      {editingCrop && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base">Edit Farm Crop Record</h3>
                <p className="text-xs text-slate-400">{editingCrop.crop_name}</p>
              </div>
              <button onClick={() => setEditingCrop(null)} className="text-white hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Quantity ({editingCrop.unit || 'Qtl'})</label>
                  <input
                    type="number"
                    required
                    value={editingCrop.quantity}
                    onChange={(e) => setEditingCrop({ ...editingCrop, quantity: Number(e.target.value) })}
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-agri-700 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status</label>
                  <select
                    value={editingCrop.status || 'Growing'}
                    onChange={(e) => setEditingCrop({ ...editingCrop, status: e.target.value })}
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none"
                  >
                    <option value="Growing">Growing</option>
                    <option value="Harvested">Harvested</option>
                    <option value="Ready to Sell">Ready to Sell</option>
                    <option value="Storage Cured">Storage Cured</option>
                    <option value="Sold">Sold</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Stage Description</label>
                <input
                  type="text"
                  value={editingCrop.stage || ''}
                  onChange={(e) => setEditingCrop({ ...editingCrop, stage: e.target.value })}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Progress (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingCrop.progress_percent || 20}
                    onChange={(e) => setEditingCrop({ ...editingCrop, progress_percent: Number(e.target.value) })}
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Health Status</label>
                  <input
                    type="text"
                    value={editingCrop.health_status || 'Good'}
                    onChange={(e) => setEditingCrop({ ...editingCrop, health_status: e.target.value })}
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-agri-600 hover:bg-agri-700 text-white rounded-xl font-bold text-xs shadow-md transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT FARMLAND & SOIL DETAILS */}
      {isEditLandModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base flex items-center gap-2">
                  <Sprout className="w-4 h-4 text-emerald-400" />
                  Edit Farmland & Soil Details
                </h3>
                <p className="text-xs text-slate-300">Customized to your specific agricultural holding</p>
              </div>
              <button onClick={() => setIsEditLandModalOpen(false)} className="text-white hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateLand} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Farmland / Holding Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deshmukh Natural Farms (Kalmeshwar)"
                  value={landForm.farmLand}
                  onChange={(e) => setLandForm({ ...landForm, farmLand: e.target.value })}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Farm Size (Acres)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    placeholder="e.g. 8.5"
                    value={landForm.farmSizeAcres}
                    onChange={(e) => setLandForm({ ...landForm, farmSizeAcres: e.target.value })}
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-800 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Soil Type</label>
                  <select
                    value={landForm.soilType}
                    onChange={(e) => setLandForm({ ...landForm, soilType: e.target.value })}
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Black Cotton Soil">Black Cotton Soil (Regur)</option>
                    <option value="Medium Loamy Soil">Medium Loamy Soil</option>
                    <option value="Red Loamy Soil">Red Loamy Soil</option>
                    <option value="Alluvial Soil">Alluvial Soil</option>
                    <option value="Clayey Soil">Clayey Soil</option>
                    <option value="Sandy Loam">Sandy Loam</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Farmland Location / District</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kalmeshwar, Nagpur, Maharashtra"
                  value={landForm.location}
                  onChange={(e) => setLandForm({ ...landForm, location: e.target.value })}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditLandModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold text-xs shadow-md transition-all"
                >
                  Save Farmland
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
