import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { User, MapPin, Phone, ShieldCheck, Globe, Save, Mail, Lock, Leaf, Store, Tractor, LogOut, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ProfileSettings = () => {
  const { userProfile, updateUserProfile, showToast, role, authUser, logoutUser } = useApp();
  const navigate = useNavigate();

  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [farmLand, setFarmLand] = useState('');
  const [farmSizeAcres, setFarmSizeAcres] = useState('3.0');
  const [soilType, setSoilType] = useState('Black Cotton Soil');
  const [commodities, setCommodities] = useState('');
  const [defaultMandi, setDefaultMandi] = useState('');

  // Initialize from authUser/userProfile
  useEffect(() => {
    if (authUser || userProfile) {
      setName(authUser?.name || userProfile?.name || '');
      setPhone(authUser?.phone || userProfile?.phone || '');
      setLocation(authUser?.location || userProfile?.location || '');
      setFarmLand(userProfile?.farmLand || '');
      setFarmSizeAcres(userProfile?.farmSizeAcres !== undefined && userProfile?.farmSizeAcres !== null ? String(userProfile.farmSizeAcres) : '3.0');
      setSoilType(userProfile?.soilType || 'Black Cotton Soil');
      setCommodities(userProfile?.primaryCommodities || '');
      setDefaultMandi(userProfile?.defaultMandi || 'Nagpur APMC');
    }
  }, [authUser, userProfile]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const result = await updateUserProfile({
      id: authUser?.id || userProfile?.id,
      name,
      phone,
      location,
      farmLand,
      farmSizeAcres: Number(farmSizeAcres) || null,
      soilType,
      primaryCommodities: commodities,
      defaultMandi
    });
    setIsSaving(false);
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login', { replace: true });
  };

  const roleConfig = {
    farmer: { label: 'Farmer (Crop Producer & Landholder)', icon: Leaf, color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    trader: { label: 'Wholesale Commodity Trader', icon: Store, color: 'bg-teal-100 text-teal-800 border-teal-200' },
    buyer: { label: 'Wholesale Buyer / Grain Processor', icon: Store, color: 'bg-blue-100 text-blue-800 border-blue-200' },
    driver: { label: 'Logistics Driver / Transporter', icon: Tractor, color: 'bg-amber-100 text-amber-800 border-amber-200' },
    owner: { label: 'Fleet & Machinery Owner', icon: Tractor, color: 'bg-amber-100 text-amber-800 border-amber-200' },
    admin: { label: 'Platform Administrator', icon: ShieldCheck, color: 'bg-purple-100 text-purple-800 border-purple-200' }
  };
  const currentRole = roleConfig[role] || roleConfig.farmer;
  const RoleIcon = currentRole.icon;

  const initials = name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-agri-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-agri-700">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div translate="no" className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-agri-600 to-emerald-500 text-white flex items-center justify-center font-extrabold text-3xl shadow-lg shrink-0 notranslate">
            {initials}
          </div>
          <div className="flex-1">
            <h1 translate="no" className="text-2xl sm:text-3xl font-extrabold notranslate">{name || 'Your Profile'}</h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${currentRole.color}`}>
                <RoleIcon className="w-3 h-3" />
                {currentRole.label}
              </span>
              {authUser?.email && (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {authUser.email}
                </span>
              )}
              <span className="text-xs text-slate-500 font-mono">ID: #{authUser?.id?.substring(0, 12) || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <h2 className="font-bold text-base text-slate-900 mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-agri-600" /> Personal & Farm Details
          </h2>
          <form onSubmit={handleSave} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Full Name / Business Title</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-agri-500 focus:border-agri-600" required />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Contact Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-agri-500 focus:border-agri-600" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Location / District</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Wardha, Maharashtra"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-agri-500 focus:border-agri-600" />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Farm Name / Holding Title</label>
                <input type="text" value={farmLand} onChange={(e) => setFarmLand(e.target.value)}
                  placeholder="e.g. Patel Agro Farms (Wardha)"
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-agri-500 focus:border-agri-600" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Farm Size (Acres)</label>
                <input type="number" step="0.1" value={farmSizeAcres} onChange={(e) => setFarmSizeAcres(e.target.value)}
                  placeholder="e.g. 5.0"
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-800 outline-none focus:ring-2 focus:ring-agri-500 focus:border-agri-600" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Soil Type Classification</label>
                <select value={soilType} onChange={(e) => setSoilType(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-agri-500 focus:border-agri-600">
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
              <label className="font-bold text-slate-700 block mb-1.5">Primary Crops / Commodities</label>
              <input type="text" value={commodities} onChange={(e) => setCommodities(e.target.value)}
                placeholder="e.g. Cotton (Kapas), Soybean (Yellow), Wheat"
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-agri-500 focus:border-agri-600" />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Default APMC Mandi</label>
              <input type="text" value={defaultMandi} onChange={(e) => setDefaultMandi(e.target.value)}
                placeholder="e.g. Nagpur APMC / Wardha Mandi"
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-agri-500 focus:border-agri-600" />
            </div>

            <div className="pt-2 flex gap-3">
              <button type="submit" disabled={isSaving}
                className="flex-1 sm:flex-none px-6 py-3 bg-agri-600 hover:bg-agri-700 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2">
                {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Profile</>}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Account Actions */}
        <div className="space-y-4">
          {/* Account Info Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-500" /> Account Security
            </h2>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-slate-500 font-medium">Email Address</p>
                <p className="font-bold text-slate-800 mt-0.5 truncate">{authUser?.email || '—'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-slate-500 font-medium">Account Role</p>
                <p className="font-bold text-slate-800 mt-0.5 capitalize">{authUser?.role || role}</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-emerald-600 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Account
                </p>
                <p className="text-emerald-600 text-[11px] mt-0.5">Session active</p>
              </div>
            </div>
          </div>

          {/* Sign Out */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <button onClick={handleLogout}
              className="w-full py-2.5 px-4 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
