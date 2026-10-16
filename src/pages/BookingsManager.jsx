import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Tractor,
  Truck,
  Warehouse,
  Wrench,
  Search,
  Filter,
  MapPin,
  Phone,
  Printer,
  X,
  FileText,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  Copy,
  Check,
  Navigation,
  Star,
  Sparkles,
  Award
} from 'lucide-react';

export const BookingsManager = () => {
  const { role, bookings = [], updateBookingStatus, cancelBooking, showToast, authUser, fetchUserData } = useApp();
  const [activeTab, setActiveTab] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [completingBooking, setCompletingBooking] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Completion Form
  const [completionForm, setCompletionForm] = useState({
    acres: '5.0',
    hours: '6 Hours',
    paymentMethod: 'Cash on Delivery / UPI',
    rating: 5,
    feedback: 'Driver arrived promptly. Rotavator tillage completed thoroughly across all field furrows.'
  });

  const validBookings = Array.isArray(bookings) ? bookings.filter(Boolean) : [];

  // Filter bookings
  const filteredBookings = validBookings.filter((bk) => {
    if (!bk) return false;
    // Status filter
    const statusMatch = activeTab === 'All' || bk.status === activeTab;
    
    // Type filter
    const typeStr = (bk.type || bk.item_type || '').toLowerCase();
    const typeMatch =
      selectedType === 'All' ||
      (selectedType === 'Tractor' && typeStr.includes('tractor')) ||
      (selectedType === 'Transport' && (typeStr.includes('transport') || typeStr.includes('vehicle'))) ||
      (selectedType === 'Storage' && (typeStr.includes('storage') || typeStr.includes('warehouse'))) ||
      (selectedType === 'Equipment' && (typeStr.includes('equipment') || typeStr.includes('implement')));

    // Search query
    const item = (bk.item || bk.item_name || '').toLowerCase();
    const owner = (bk.owner || bk.driver_name || '').toLowerCase();
    const id = (bk.id || '').toLowerCase();
    const loc = (bk.location || '').toLowerCase();
    const q = searchQuery.toLowerCase().trim();
    const searchMatch = !q || item.includes(q) || owner.includes(q) || id.includes(q) || loc.includes(q);

    return statusMatch && typeMatch && searchMatch;
  });

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    showToast(`Booking ID ${id} copied to clipboard!`, 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Dispatch Tractor: Upcoming -> Active (Driver en route / on field)
  const handleDispatchTractor = async (booking) => {
    setUpdatingId(booking.id);
    try {
      if (typeof updateBookingStatus === 'function') {
        await updateBookingStatus(booking.id, 'Active', {
          dispatch_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          work_stage: 'Active on Field'
        });
      } else {
        await api.updateBookingStatus(booking.id, 'Active');
        if (typeof fetchUserData === 'function') await fetchUserData();
        showToast('Tractor dispatched! Driver is en route to farm.', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  // Complete Work & Settle Payment: Active -> Completed
  const handleConfirmCompletion = async (e) => {
    e.preventDefault();
    if (!completingBooking) return;
    setUpdatingId(completingBooking.id);
    try {
      if (typeof updateBookingStatus === 'function') {
        await updateBookingStatus(completingBooking.id, 'Completed', {
          ...completionForm,
          completed_at: new Date().toISOString()
        });
      } else {
        await api.updateBookingStatus(completingBooking.id, 'Completed', completionForm);
        if (typeof fetchUserData === 'function') await fetchUserData();
      }
      setCompletingBooking(null);
    } catch (err) {
      showToast(err.message || 'Failed to complete booking', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking reservation?')) return;
    setCancellingId(bookingId);
    try {
      if (typeof cancelBooking === 'function') {
        await cancelBooking(bookingId);
      } else {
        await api.cancelBooking(bookingId);
      }
    } catch (err) {
      showToast(err.message || 'Failed to cancel booking', 'error');
    } finally {
      setCancellingId(null);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      if (typeof fetchUserData === 'function') await fetchUserData();
      showToast('Bookings synchronized successfully!', 'success');
    } finally {
      setIsLoading(false);
    }
  };

  const statusConfig = {
    Upcoming: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Clock, dot: 'bg-blue-500' },
    Active: { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle2, dot: 'bg-emerald-500' },
    Completed: { color: 'bg-slate-100 text-slate-700 border-slate-200', icon: CheckCircle2, dot: 'bg-slate-500' },
    Cancelled: { color: 'bg-rose-100 text-rose-800 border-rose-200', icon: XCircle, dot: 'bg-rose-500' }
  };

  const typeConfig = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('transport') || t.includes('vehicle')) {
      return { icon: Truck, label: 'Transport Fleet', badgeBg: 'bg-amber-100 text-amber-900 border-amber-200', iconBg: 'bg-amber-50 text-amber-700' };
    }
    if (t.includes('storage') || t.includes('warehouse')) {
      return { icon: Warehouse, label: 'Cold Storage / Silo', badgeBg: 'bg-cyan-100 text-cyan-900 border-cyan-200', iconBg: 'bg-cyan-50 text-cyan-700' };
    }
    if (t.includes('equipment') || t.includes('implement')) {
      return { icon: Wrench, label: 'Farm Implement', badgeBg: 'bg-purple-100 text-purple-900 border-purple-200', iconBg: 'bg-purple-50 text-purple-700' };
    }
    return { icon: Tractor, label: 'Tractor Rental', badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-200', iconBg: 'bg-emerald-50 text-emerald-700' };
  };

  // Determine Lifecycle Stage: 1 to 4
  const getLifecycleStage = (status) => {
    if (status === 'Cancelled') return 0;
    if (status === 'Completed') return 4;
    if (status === 'Active') return 3;
    return 1; // Upcoming
  };

  // Stats
  const totalBookings = validBookings.length;
  const upcomingCount = validBookings.filter((b) => b && b.status === 'Upcoming').length;
  const activeCount = validBookings.filter((b) => b && b.status === 'Active').length;
  const completedCount = validBookings.filter((b) => b && b.status === 'Completed').length;
  const totalSpent = validBookings.reduce((sum, b) => sum + (Number((b && (b.price !== undefined ? b.price : b.total_cost)) || 0)), 0);

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-agri-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-agri-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-white/10 px-3 py-0.5 rounded-full border border-white/10">
              Operations & Driver Dispatch Hub
            </span>
            <span className="text-[10px] text-slate-300 font-medium">
              User: <strong className="text-white">{authUser?.name || 'Farmer'}</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black mt-2 tracking-tight">My Bookings & Field Operations</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Live workflow management: track tractor driver dispatch, monitor on-field progress, and mark work completed with instant receipt generation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl flex items-center gap-2 border border-white/20 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/tractors"
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5"
          >
            <span>+ Book Machinery</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div
          onClick={() => setActiveTab('All')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            activeTab === 'All'
              ? 'bg-gradient-to-br from-agri-600 to-agri-700 text-white border-agri-700 shadow-md'
              : 'bg-white border-slate-200 text-slate-700 hover:border-agri-300'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 block">Total Bookings</span>
          <p className="text-2xl sm:text-3xl font-black mt-1">{totalBookings}</p>
          <span className="text-[10px] opacity-75 mt-0.5 block">All machinery & fleets</span>
        </div>

        <div
          onClick={() => setActiveTab('Upcoming')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            activeTab === 'Upcoming'
              ? 'bg-blue-600 text-white border-blue-700 shadow-md'
              : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 block">Upcoming / Scheduled</span>
          <p className="text-2xl sm:text-3xl font-black mt-1">{upcomingCount}</p>
          <span className="text-[10px] opacity-75 mt-0.5 block">Ready to dispatch</span>
        </div>

        <div
          onClick={() => setActiveTab('Active')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            activeTab === 'Active'
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-md'
              : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 block">Active on Field</span>
          <p className="text-2xl sm:text-3xl font-black mt-1">{activeCount}</p>
          <span className="text-[10px] opacity-75 mt-0.5 block">⚡ Driver working now</span>
        </div>

        <div
          onClick={() => setActiveTab('Completed')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            activeTab === 'Completed'
              ? 'bg-slate-700 text-white border-slate-800 shadow-md'
              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 block">Work Finished</span>
          <p className="text-2xl sm:text-3xl font-black mt-1">{completedCount}</p>
          <span className="text-[10px] opacity-75 mt-0.5 block">Paid & completed</span>
        </div>

        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl border bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 text-amber-950">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 block">Total Spend</span>
          <p className="text-2xl sm:text-3xl font-black text-amber-900 mt-1">₹{totalSpent.toLocaleString('en-IN')}</p>
          <span className="text-[10px] text-amber-700 font-semibold mt-0.5 block">Pay on completion</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {['All', 'Upcoming', 'Active', 'Completed', 'Cancelled'].map((tab) => {
            const count = tab === 'All' ? bookings.length : bookings.filter((b) => b.status === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab
                    ? 'bg-agri-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab} <span className="opacity-75 text-[11px]">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Category & Search Input */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="relative shrink-0">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 pr-8 text-slate-700 focus:outline-none focus:ring-2 focus:ring-agri-500 cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Tractor">🚜 Tractors</option>
              <option value="Transport">🚚 Transport</option>
              <option value="Storage">🏬 Cold Storage</option>
              <option value="Equipment">🌾 Implements</option>
            </select>
          </div>

          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search machinery, driver, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-medium py-2 pl-8 pr-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-agri-500"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <CalendarCheck className="w-8 h-8" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-800 mb-1">
              No {activeTab === 'All' ? '' : activeTab} Bookings Found
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
              {searchQuery
                ? `No reservations match "${searchQuery}". Try clearing search filter.`
                : 'Need agricultural machinery, harvest transport, or warehouse space? Hire verified providers in 1-click.'}
            </p>

            {/* 4 Quick Reservation Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left max-w-4xl mx-auto">
              <Link
                to="/tractors"
                className="p-4 bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200 rounded-2xl transition-all group cursor-pointer"
              >
                <div className="w-9 h-9 bg-emerald-600 text-white rounded-xl flex items-center justify-center mb-3 shadow-xs">
                  <Tractor className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-xs text-emerald-950 group-hover:text-emerald-800">Hire Tractor</h4>
                <p className="text-[11px] text-emerald-700/90 mt-0.5">Mahindra, John Deere & Swaraj with Rotavator attachments.</p>
                <span className="text-[10px] font-extrabold text-emerald-800 mt-2 inline-flex items-center gap-1">
                  Browse Tractors →
                </span>
              </Link>

              <Link
                to="/transport"
                className="p-4 bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200 rounded-2xl transition-all group cursor-pointer"
              >
                <div className="w-9 h-9 bg-amber-600 text-white rounded-xl flex items-center justify-center mb-3 shadow-xs">
                  <Truck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-xs text-amber-950 group-hover:text-amber-800">Book Transport</h4>
                <p className="text-[11px] text-amber-700/90 mt-0.5">Pickup trucks & heavy fleets for APMC mandi transit.</p>
                <span className="text-[10px] font-extrabold text-amber-800 mt-2 inline-flex items-center gap-1">
                  View Vehicles →
                </span>
              </Link>

              <Link
                to="/storage"
                className="p-4 bg-cyan-50/70 hover:bg-cyan-100/70 border border-cyan-200 rounded-2xl transition-all group cursor-pointer"
              >
                <div className="w-9 h-9 bg-cyan-600 text-white rounded-xl flex items-center justify-center mb-3 shadow-xs">
                  <Warehouse className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-xs text-cyan-950 group-hover:text-cyan-800">Reserve Storage</h4>
                <p className="text-[11px] text-cyan-700/90 mt-0.5">Cold storage & ventilated silos for onion, cotton, grain.</p>
                <span className="text-[10px] font-extrabold text-cyan-800 mt-2 inline-flex items-center gap-1">
                  Find Warehouses →
                </span>
              </Link>

              <Link
                to="/equipment"
                className="p-4 bg-purple-50/70 hover:bg-purple-100/70 border border-purple-200 rounded-2xl transition-all group cursor-pointer"
              >
                <div className="w-9 h-9 bg-purple-600 text-white rounded-xl flex items-center justify-center mb-3 shadow-xs">
                  <Wrench className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-xs text-purple-950 group-hover:text-purple-800">Farm Implements</h4>
                <p className="text-[11px] text-purple-700/90 mt-0.5">Seed drills, boom sprayers, laser levellers & harvesters.</p>
                <span className="text-[10px] font-extrabold text-purple-800 mt-2 inline-flex items-center gap-1">
                  Rent Implements →
                </span>
              </Link>
            </div>
          </div>
        ) : (
          filteredBookings.map((bk) => {
            const statusInfo = statusConfig[bk.status] || statusConfig.Upcoming;
            const typeInfo = typeConfig(bk.type || bk.item_type);
            const TypeIcon = typeInfo.icon;
            const canCancel = bk.status === 'Upcoming';
            const isUpcoming = bk.status === 'Upcoming';
            const isActive = bk.status === 'Active';
            const isCompleted = bk.status === 'Completed';
            const stage = getLifecycleStage(bk.status);

            const itemName = bk.item || bk.item_name || bk.itemName || 'Agri Equipment';
            const ownerName = bk.owner || bk.driver_name || bk.driverName || 'Verified Partner';
            const phone = bk.contact_phone || bk.driver_phone || '+91 98220 11223';
            const farmerName = bk.farmer_name || bk.farmerName || bk.customer_name || 'Farmer Client';
            const farmerPhone = bk.farmer_phone || bk.farmerPhone || bk.customer_phone || bk.contact_phone || '+91 98220 11223';
            const startDate = bk.startDate || bk.start_date || '2026-10-15';
            const endDate = bk.endDate || bk.end_date || startDate;
            const duration = bk.duration || '1 Day';
            const price = Number(bk.price !== undefined ? bk.price : (bk.total_cost ?? bk.totalCost ?? 0));
            const location = bk.location || 'Maharashtra Hub';

            const currentRole = role || authUser?.role || 'farmer';
            const isDriverOrOwnerView = Boolean(
              bk?.isBookingOwner ||
              currentRole === 'driver' || 
              currentRole === 'owner' ||
              (authUser && (
                (bk?.owner_id && bk.owner_id === authUser.id) ||
                (authUser.name && ownerName && ownerName.toLowerCase().includes(authUser.name.toLowerCase()))
              ))
            );

            return (
              <div
                key={bk.id}
                className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                {/* Header row: Thumbnail, Title, Price, Status */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className={`p-4 rounded-2xl shrink-0 ${typeInfo.iconBg} shadow-inner`}>
                      <TypeIcon className="w-6 h-6" />
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1.5 ${statusInfo.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot} ${isActive ? 'animate-ping' : ''}`}></span>
                          {bk.status === 'Active' ? 'Working on Field' : bk.status}
                        </span>

                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${typeInfo.badgeBg}`}>
                          {typeInfo.label}
                        </span>

                        {isDriverOrOwnerView ? (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                            🚜 Driver Job
                          </span>
                        ) : (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                            🌾 Farmer Booking
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleCopyId(bk.id)}
                          className="text-[10px] font-mono font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-md inline-flex items-center gap-1 transition-colors"
                          title="Click to copy booking ID"
                        >
                          <span>ID: {bk.id}</span>
                          {copiedId === bk.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-2.5 h-2.5 text-slate-400" />}
                        </button>
                      </div>

                      <h3 className="font-black text-lg text-slate-900 tracking-tight truncate">{itemName}</h3>

                      <div className="flex items-center gap-4 flex-wrap text-xs text-slate-600">
                        {isDriverOrOwnerView ? (
                          // Driver View: highlight customer farmer
                          <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Client Farmer: <strong className="text-slate-900">{farmerName}</strong> • Phone: <a href={`tel:${farmerPhone}`} className="text-amber-800 font-extrabold hover:underline">{farmerPhone}</a></span>
                          </div>
                        ) : (
                          // Farmer View: highlight assigned driver
                          <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Driver: <strong className="text-slate-900">{ownerName}</strong> • Phone: <a href={`tel:${phone}`} className="text-emerald-700 font-extrabold hover:underline">{phone}</a></span>
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 text-slate-500">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[200px]">{location}</span>
                        </div>

                        <div className="text-slate-500">
                          📅 <strong>{startDate}</strong> to <strong>{endDate}</strong> ({duration})
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price Block */}
                  <div className="text-left lg:text-right shrink-0">
                    <span className="font-black text-2xl text-agri-700 block leading-tight">
                      ₹{price ? price.toLocaleString('en-IN') : '—'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      {isCompleted ? 'Payment Settled' : 'Pay After Work'}
                    </span>
                  </div>
                </div>

                {/* 4-Step Visual Stepper Bar */}
                {bk.status !== 'Cancelled' && (
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      {/* Step 1 */}
                      <div className={`flex items-center gap-1.5 ${stage >= 1 ? 'text-emerald-700 font-black' : 'text-slate-400'}`}>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${stage >= 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                          1
                        </span>
                        <span className="hidden sm:inline">Booked & Confirmed</span>
                        <span className="sm:hidden">Booked</span>
                      </div>

                      <div className={`h-0.5 flex-1 mx-2 sm:mx-3 ${stage >= 2 ? 'bg-emerald-500' : 'bg-slate-200'}`} />

                      {/* Step 2 */}
                      <div className={`flex items-center gap-1.5 ${stage >= 2 ? 'text-emerald-700 font-black' : 'text-slate-400'}`}>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${stage >= 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                          2
                        </span>
                        <span className="hidden sm:inline">Driver Dispatched</span>
                        <span className="sm:hidden">En Route</span>
                      </div>

                      <div className={`h-0.5 flex-1 mx-2 sm:mx-3 ${stage >= 3 ? 'bg-emerald-500' : 'bg-slate-200'}`} />

                      {/* Step 3 */}
                      <div className={`flex items-center gap-1.5 ${stage >= 3 ? 'text-emerald-700 font-black' : 'text-slate-400'}`}>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${stage >= 3 ? 'bg-emerald-600 text-white animate-pulse' : 'bg-slate-200 text-slate-500'}`}>
                          3
                        </span>
                        <span className="hidden sm:inline">On-Field Work</span>
                        <span className="sm:hidden">Working</span>
                      </div>

                      <div className={`h-0.5 flex-1 mx-2 sm:mx-3 ${stage >= 4 ? 'bg-emerald-700 font-black' : 'bg-slate-200'}`} />

                      {/* Step 4 */}
                      <div className={`flex items-center gap-1.5 ${stage >= 4 ? 'text-emerald-800 font-black' : 'text-slate-400'}`}>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${stage >= 4 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                          4
                        </span>
                        <span className="hidden sm:inline">Work Finished & Paid</span>
                        <span className="sm:hidden">Finished</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Operations & Action Controls */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    {isDriverOrOwnerView ? (
                      <a
                        href={`tel:${farmerPhone}`}
                        className="px-3.5 py-2 text-xs font-black text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
                        title={`Call Farmer ${farmerName} at ${farmerPhone}`}
                      >
                        <Phone className="w-3.5 h-3.5 text-amber-600" />
                        <span>Call Farmer: <strong className="text-amber-950 underline decoration-amber-400">{farmerName}</strong> ({farmerPhone})</span>
                      </a>
                    ) : (
                      <a
                        href={`tel:${phone}`}
                        className="px-3.5 py-2 text-xs font-black text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
                        title={`Call Driver ${ownerName} at ${phone}`}
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Driver: <strong className="text-emerald-950 underline decoration-emerald-400">{ownerName}</strong> ({phone})</span>
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => setSelectedReceipt(bk)}
                      className="px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                      title="View digital reservation pass"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-600" />
                      <span>Digital Pass</span>
                    </button>
                  </div>

                  {/* Lifecycle State Buttons */}
                  <div className="flex items-center gap-2 justify-end flex-wrap">
                    {/* If UPCOMING */}
                    {isUpcoming && (
                      <>
                        {isDriverOrOwnerView ? (
                          // Driver / Owner can dispatch
                          <button
                            type="button"
                            onClick={() => handleDispatchTractor(bk)}
                            disabled={updatingId === bk.id}
                            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                            title="Driver starts driving tractor to farm"
                          >
                            {updatingId === bk.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Navigation className="w-3.5 h-3.5" />
                            )}
                            <span>🚜 Dispatch Tractor (Start Job)</span>
                          </button>
                        ) : (
                          // Farmer sees awaiting dispatch notice
                          <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-2 rounded-xl inline-flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-blue-500" />
                            <span>Awaiting Driver Dispatch</span>
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleCancel(bk.id)}
                          disabled={cancellingId === bk.id}
                          className="px-3 py-2.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                        >
                          {cancellingId === bk.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5" />
                          )}
                          <span>Cancel</span>
                        </button>
                      </>
                    )}

                    {/* If ACTIVE: Action to finish work and settle payment */}
                    {isActive && (
                      <button
                        type="button"
                        onClick={() => {
                          setCompletingBooking(bk);
                          setCompletionForm({
                            acres: '5.0',
                            hours: duration,
                            paymentMethod: 'Cash upon completion',
                            rating: 5,
                            feedback: 'Work completed thoroughly. Field is prepared for sowing.'
                          });
                        }}
                        className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-900/20 transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Driver finished tilling acres, confirm payment"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                        <span>✅ Mark Work Finished & Settle</span>
                      </button>
                    )}

                    {/* If COMPLETED: Completed voucher badge */}
                    {isCompleted && (
                      <span className="text-xs font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl inline-flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-emerald-600" />
                        <span>Work Completed & Invoice Cleared</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: Work Finished & Payment Settlement */}
      {completingBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 relative">
              <button
                onClick={() => setCompletingBooking(null)}
                className="absolute right-4 top-4 p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                  Field Work Completion & Settlement
                </span>
              </div>
              <h2 className="text-xl font-black mt-1">Confirm Work Done: {completingBooking.item}</h2>
              <p className="text-xs text-slate-300 mt-0.5">Booking ID: {completingBooking.id} • Driver: {completingBooking.owner}</p>
            </div>

            <form onSubmit={handleConfirmCompletion} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Acres Tilled / Operated</label>
                  <input
                    type="text"
                    value={completionForm.acres}
                    onChange={(e) => setCompletionForm({ ...completionForm, acres: e.target.value })}
                    className="w-full text-xs font-semibold py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. 5.0 Acres"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Time Duration</label>
                  <input
                    type="text"
                    value={completionForm.hours}
                    onChange={(e) => setCompletionForm({ ...completionForm, hours: e.target.value })}
                    className="w-full text-xs font-semibold py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. 6 Hours / 2 Days"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Method Settled with Driver</label>
                <select
                  value={completionForm.paymentMethod}
                  onChange={(e) => setCompletionForm({ ...completionForm, paymentMethod: e.target.value })}
                  className="w-full text-xs font-semibold py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Cash upon completion">💵 Cash directly to Driver / Operator</option>
                  <option value="UPI / QR Code Scan">📱 Direct UPI (PhonePe / GPay / Paytm)</option>
                  <option value="Bank RTGS / IMPS">🏦 Direct Bank Transfer</option>
                </select>
              </div>

              {/* Driver Rating */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Rate Driver & Machinery Quality</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setCompletionForm({ ...completionForm, rating: star })}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-6 h-6 ${star <= completionForm.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">{completionForm.rating} / 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Feedback & Operator Notes</label>
                <textarea
                  rows="2"
                  value={completionForm.feedback}
                  onChange={(e) => setCompletionForm({ ...completionForm, feedback: e.target.value })}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Driver was punctual, rotavator achieved fine seedbed tilth..."
                ></textarea>
              </div>

              {/* Settlement Summary */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex justify-between items-center text-emerald-950">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">Total Due Amount</span>
                  <strong className="text-lg font-black text-emerald-900">
                    ₹{(completingBooking.price || completingBooking.total_cost || 0).toLocaleString('en-IN')}
                  </strong>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-lg">
                  Zero Platform Commission
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCompletingBooking(null)}
                  className="flex-1 py-3 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingId === completingBooking.id}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-900/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {updatingId === completingBooking.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>Confirm Completion & Settle</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Digital Booking Pass / Receipt */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Pass Header */}
            <div className="bg-gradient-to-r from-agri-900 via-emerald-950 to-slate-900 text-white p-6 relative">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="absolute right-4 top-4 p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                  AgriPulse Verified Voucher
                </span>
              </div>
              <h2 className="text-xl font-black mt-1">Digital Reservation Pass</h2>
              <p className="text-xs text-slate-300 mt-0.5">Booking Reference: {selectedReceipt.id}</p>
            </div>

            {/* Pass Body */}
            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Equipment / Service</span>
                    <strong className="text-sm font-black text-slate-900 block mt-0.5">
                      {selectedReceipt.item || selectedReceipt.item_name}
                    </strong>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Category: {selectedReceipt.type || selectedReceipt.item_type || 'Agri Machinery'}
                    </span>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${statusConfig[selectedReceipt.status]?.color || 'bg-slate-100 text-slate-700'}`}>
                    {selectedReceipt.status}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-3 text-slate-600">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Start Date</span>
                    <span className="font-bold text-slate-900">{selectedReceipt.startDate || selectedReceipt.start_date}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">End Date</span>
                    <span className="font-bold text-slate-900">{selectedReceipt.endDate || selectedReceipt.end_date}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Assigned Driver & Phone</span>
                  <div className="flex items-center justify-between mt-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div>
                      <span className="font-extrabold text-xs text-slate-900 block">{selectedReceipt.owner || selectedReceipt.driver_name || 'Assigned Driver'}</span>
                      <span className="text-[10px] text-slate-400">Verified Equipment Driver</span>
                    </div>
                    <a href={`tel:${selectedReceipt.contact_phone || selectedReceipt.driver_phone}`} className="px-2.5 py-1 bg-white border border-emerald-300 text-emerald-800 font-black text-xs rounded-lg flex items-center gap-1 hover:bg-emerald-50 shadow-2xs">
                      <Phone className="w-3 h-3 text-emerald-600" /> {selectedReceipt.contact_phone || selectedReceipt.driver_phone || '+91 98220 11223'}
                    </a>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Delivery / Farm Location</span>
                  <span className="font-semibold text-slate-800">{selectedReceipt.location || 'Maharashtra Farm Yard'}</span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-1.5">
                <div className="flex justify-between text-emerald-950 font-medium text-xs">
                  <span>Gross Rental Amount</span>
                  <span>₹{(selectedReceipt.price || selectedReceipt.total_cost || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-emerald-700 text-[11px]">
                  <span>Platform Fee & Farm Insurance</span>
                  <span className="font-bold">Waived (₹0)</span>
                </div>
                <div className="pt-2 border-t border-emerald-200 flex justify-between items-center text-sm font-black text-emerald-950">
                  <span>Total Due on Delivery</span>
                  <span className="text-base text-emerald-800 font-black">
                    ₹{(selectedReceipt.price || selectedReceipt.total_cost || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Show this digital pass to the partner upon machinery arrival. Zero advance deposit required.</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedReceipt(null)}
                  className="flex-1 py-3 bg-agri-600 hover:bg-agri-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
