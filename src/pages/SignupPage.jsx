import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Sprout,
  Mail,
  Lock,
  User,
  MapPin,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  TrendingUp
} from 'lucide-react';

export const SignupPage = () => {
  const navigate = useNavigate();
  const { registerUser } = useApp();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'farmer',
    location: '',
    phone: '',
    farmLand: '',
    farmSizeAcres: '3.5',
    soilType: 'Black Cotton Soil',
    primaryCommodities: '',
    businessName: '',
    defaultMandi: 'Nagpur APMC'
  });

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setErrorMessage('');
  };

  const validate = () => {
    if (!form.name.trim()) return 'Full name is required.';
    if (!form.email.trim()) return 'Email address is required.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) return 'Please enter a valid email address.';
    if (!form.password) return 'Password is required.';
    if (form.password.length < 6) return 'Password must be at least 6 characters long.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match. Please verify.';
    if (!form.role) return 'Please select a role.';
    if (!form.location.trim()) return 'Location is required.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setLoading(true);
    const result = await registerUser({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      role: form.role,
      location: form.location.trim(),
      phone: form.phone.trim(),
      farm_land: form.farmLand.trim() || (form.role === 'farmer' ? `${form.name.trim()} Farm` : ''),
      farm_size_acres: form.role === 'farmer' && form.farmSizeAcres ? Number(form.farmSizeAcres) : null,
      soil_type: form.role === 'farmer' ? form.soilType : '',
      primary_commodities: form.primaryCommodities.trim(),
      business_name: form.businessName.trim() || (form.role === 'farmer' ? `${form.name.trim()} Farms` : `${form.name.trim()} Enterprise`),
      default_mandi: form.defaultMandi.trim() || 'Nagpur APMC'
    });
    setLoading(false);

    if (result.success) {
      setSuccessMessage(`Account created successfully! Welcome, ${result.user?.name}!`);
      setTimeout(() => {
        const redirectPath = result.user?.role === 'admin' ? '/admin' : '/dashboard';
        navigate(redirectPath, { replace: true });
      }, 800);
    } else {
      setErrorMessage(result.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-6 sm:py-10">

      {/* Back button */}
      <div className="max-w-5xl mx-auto w-full mb-6 px-4">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-agri-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </Link>
      </div>

      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 items-center">

        {/* Left Column: Branding */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-agri-700 to-emerald-500 text-white rounded-2xl shadow-md">
              <Sprout className="w-8 h-8" />
            </div>
            <div>
              <span className="font-extrabold text-2xl text-slate-900 tracking-tight flex items-center gap-2">
                AgriPulse <span className="text-xs bg-agri-100 text-agri-800 font-bold px-2 py-0.5 rounded-full border border-agri-200">AI 2.0</span>
              </span>
              <p className="text-xs font-semibold text-agri-700 uppercase tracking-wider">
                Create Your Free Account
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
              Join India's Smartest Agricultural Platform
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Register as a Farmer or Buyer to access AI-powered crop forecasts, live mandi prices, direct trade matching, and cold storage logistics.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Real-time APMC Price Intelligence</h4>
                <p className="text-[11px] text-slate-500">Live Agmarknet prices across Maharashtra mandis.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <div className="p-2 bg-teal-100 text-teal-700 rounded-lg shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Gemini AI Crop Forecasting</h4>
                <p className="text-[11px] text-slate-500">7, 15, and 30-day price projections for smarter sell decisions.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-lg shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Secure & Role-Based Access</h4>
                <p className="text-[11px] text-slate-500">Your account is protected with industry-standard encryption.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Signup Form */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-xl p-6 sm:p-8 relative overflow-hidden">

            {/* Top gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-agri-600 via-emerald-500 to-teal-500" />

            <div className="mb-6">
              <h3 className="text-lg font-extrabold text-slate-900">Create New Account</h3>
              <p className="text-xs text-slate-500 mt-1">All fields marked with * are required</p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-rose-700 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Banner */}
            {successMessage && (
              <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-emerald-700 text-xs font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Full Name / Business Title *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    id="signup-name"
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patel or Vidarbha Agro"
                    value={form.name}
                    onChange={handleChange('name')}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-agri-500/20 focus:border-agri-600 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Email Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      id="signup-email"
                      type="email"
                      required
                      placeholder="yourname@domain.com"
                      value={form.email}
                      onChange={handleChange('email')}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-agri-500/20 focus:border-agri-600 transition-all"
                    />
                  </div>
                </div>

                {/* Role Selector - Admin excluded from public signup */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Primary Role *</label>
                  <select
                    id="signup-role"
                    value={form.role}
                    onChange={handleChange('role')}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-agri-500/20 focus:border-agri-600 transition-all"
                  >
                    <option value="farmer">🌾 Farmer (Crop Producer & Landholder)</option>
                    <option value="trader">💼 Trader (Wholesale Commodity Trader)</option>
                    <option value="buyer">🏬 Buyer / Grain Processor</option>
                    <option value="driver">🚚 Logistics Driver / Transporter</option>
                    <option value="owner">🚜 Fleet / Machinery Owner</option>
                  </select>
                  <p className="text-[10px] text-slate-400">Admin accounts are created by platform operators only.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Location */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Location (District & State) *</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      id="signup-location"
                      type="text"
                      required
                      placeholder="e.g. Wardha, Maharashtra"
                      value={form.location}
                      onChange={handleChange('location')}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-agri-500/20 focus:border-agri-600 transition-all"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Contact Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      id="signup-phone"
                      type="tel"
                      placeholder="+91 98230 11223"
                      value={form.phone}
                      onChange={handleChange('phone')}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-agri-500/20 focus:border-agri-600 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Role-Specific Fields */}
              {form.role === 'farmer' && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🌾</span>
                    <h4 className="text-xs font-bold text-emerald-950">Farmer Land & Soil Profile</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Farm Name / Land Location</label>
                      <input
                        type="text"
                        placeholder="e.g. Patel Organic Farm (Wardha)"
                        value={form.farmLand}
                        onChange={handleChange('farmLand')}
                        className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Farm Size (Acres)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="e.g. 5.0"
                        value={form.farmSizeAcres}
                        onChange={handleChange('farmSizeAcres')}
                        className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Soil Type</label>
                      <select
                        value={form.soilType}
                        onChange={handleChange('soilType')}
                        className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="Black Cotton Soil">Black Cotton Soil (Regur)</option>
                        <option value="Medium Loamy Soil">Medium Loamy Soil</option>
                        <option value="Red Loamy Soil">Red Loamy Soil</option>
                        <option value="Alluvial Soil">Alluvial Soil</option>
                        <option value="Clayey Soil">Clayey Soil</option>
                        <option value="Sandy Loam">Sandy Loam</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Primary Crops Cultivated</label>
                      <input
                        type="text"
                        placeholder="e.g. Cotton (Kapas), Soybean, Wheat"
                        value={form.primaryCommodities}
                        onChange={handleChange('primaryCommodities')}
                        className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {(form.role === 'buyer' || form.role === 'trader') && (
                <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{form.role === 'trader' ? '💼' : '🏬'}</span>
                    <h4 className="text-xs font-bold text-blue-950">Commodity Trading & Procurement Business</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Firm / Company Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Vidarbha Agro Mills Ltd"
                        value={form.businessName}
                        onChange={handleChange('businessName')}
                        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Primary Mandi / Yard</label>
                      <input
                        type="text"
                        placeholder="e.g. Nagpur APMC Yard"
                        value={form.defaultMandi}
                        onChange={handleChange('defaultMandi')}
                        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Commodities Procured</label>
                    <input
                      type="text"
                      placeholder="e.g. Soybean (Yellow), Wheat, Gram (Chana)"
                      value={form.primaryCommodities}
                      onChange={handleChange('primaryCommodities')}
                      className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {(form.role === 'driver' || form.role === 'owner') && (
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{form.role === 'driver' ? '🚚' : '🚜'}</span>
                    <h4 className="text-xs font-bold text-amber-950">Logistics Fleet & Machinery Operation</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Fleet Business Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Balwinder Agro Logistics"
                        value={form.businessName}
                        onChange={handleChange('businessName')}
                        className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Vehicles / Machinery Types</label>
                      <input
                        type="text"
                        placeholder="e.g. Mahindra 575 DI, Bolero Maxi Truck"
                        value={form.primaryCommodities}
                        onChange={handleChange('primaryCommodities')}
                        className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Set Password * <span className="font-normal text-slate-400">(min 6 chars)</span></label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="At least 6 characters"
                      value={form.password}
                      onChange={handleChange('password')}
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-agri-500/20 focus:border-agri-600 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      id="signup-confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Re-type your password"
                      value={form.confirmPassword}
                      onChange={handleChange('confirmPassword')}
                      className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-agri-500/20 transition-all ${
                        form.confirmPassword && form.password !== form.confirmPassword
                          ? 'border-rose-400 focus:border-rose-500'
                          : 'border-slate-200 focus:border-agri-600'
                      }`}
                    />
                  </div>
                  {form.confirmPassword && form.password !== form.confirmPassword && (
                    <p className="text-[10px] text-rose-600 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Passwords do not match
                    </p>
                  )}
                  {form.confirmPassword && form.password === form.confirmPassword && form.password.length >= 6 && (
                    <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Passwords match
                    </p>
                  )}
                </div>
              </div>

              {/* Submit */}
              <button
                id="signup-submit"
                type="submit"
                disabled={loading || (form.confirmPassword && form.password !== form.confirmPassword)}
                className="w-full py-3 px-4 bg-gradient-to-r from-agri-600 to-emerald-600 hover:from-agri-700 hover:to-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Switch to Login */}
              <div className="text-center pt-2">
                <p className="text-xs text-slate-500">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-bold text-agri-700 hover:underline"
                  >
                    Sign In here
                  </Link>
                </p>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
};
