import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Calendar, Clock, DollarSign, X, CheckCircle, ShieldCheck, MapPin, UserCheck, Sparkles, ArrowRight, AlertTriangle } from 'lucide-react';

export const BookingModal = ({ isOpen, onClose, itemData, type }) => {
  const { addBooking, authUser } = useApp();
  const navigate = useNavigate();
  
  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(todayStr);
  const [days, setDays] = useState(1);
  const [location, setLocation] = useState(authUser?.farm_land || authUser?.location || 'Wardha Farm Yard, Maharashtra');
  const [withOperator, setWithOperator] = useState(true);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  if (!isOpen || !itemData) return null;

  const unitRate = itemData.ratePerDay || itemData.ratePerHour || itemData.pricePerQuintalMonth || itemData.rental_price || 1400;
  const totalPrice = unitRate * days;

  // Calculate End Date
  const startDateObj = new Date(date || todayStr);
  const endDateObj = new Date(startDateObj.getTime() + (Math.max(1, days) - 1) * 86400000);
  const endDateStr = endDateObj.toISOString().split('T')[0];

  // Live conflict detection against known active/upcoming reservations
  const upcomingReservations = itemData.upcomingBookings || [];
  const conflictingBooking = upcomingReservations.find(b => 
    b.status !== 'Cancelled' && b.status !== 'Completed' && (b.startDate <= endDateStr && b.endDate >= date)
  );
  const isDateConflict = Boolean(conflictingBooking);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isDateConflict) return;
    setIsSubmitting(true);
    try {
      const itemName = itemData.name || itemData.vehicle_name || itemData.title || 'Agri Machinery';
      const bookingType = type || (itemData.hp ? 'Tractor Rental' : itemData.vehicle_type ? 'Transport Vehicle' : itemData.temp_range ? 'Cold Storage' : 'Farm Equipment');
      const partnerName = itemData.driverName || itemData.driver_name || itemData.ownerName || itemData.contact || 'Suresh Deshmukh';
      const phone = itemData.driverPhone || itemData.driver_phone || itemData.ownerPhone || itemData.contact || '+91 98230 44112';
      
      const payload = {
        resourceId: itemData.id || `RES-${Date.now()}`,
        itemId: itemData.id,
        owner_id: itemData.owner_id || null,
        item: itemName,
        itemName: itemName,
        type: bookingType,
        itemType: bookingType,
        owner: partnerName,
        driver_name: partnerName,
        driverName: partnerName,
        contact_phone: phone,
        driver_phone: phone,
        farmer_name: authUser?.name || 'Farmer Aman',
        farmer_phone: authUser?.phone || '+91 98220 11223',
        startDate: date,
        start_date: date,
        endDate: endDateStr,
        end_date: endDateStr,
        duration: `${days} Day${days > 1 ? 's' : ''}`,
        price: totalPrice,
        totalCost: totalPrice,
        location: location,
        image: itemData.image || '',
        notes: `${notes ? notes + ' | ' : ''}${withOperator ? 'Operator Included' : 'Self-drive'}`
      };

      const result = await addBooking(payload);
      if (result && result.success) {
        setConfirmedBooking(result.data);
      } else {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setConfirmedBooking(null);
    onClose();
  };

  const handleViewBookings = () => {
    handleClose();
    navigate('/bookings');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Success Screen */}
        {confirmedBooking ? (
          <div className="p-6 sm:p-8 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner animate-bounce">
              <CheckCircle className="w-9 h-9" />
            </div>

            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Reservation Confirmed
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">Booking ID: {confirmedBooking.id}</h2>
              <p className="text-xs text-slate-500 mt-1">
                Your reservation for <strong className="text-slate-800">{confirmedBooking.item}</strong> has been secured and dispatched.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2 text-left">
              <div className="flex justify-between text-slate-600">
                <span>Scheduled Period</span>
                <span className="font-bold text-slate-900">{confirmedBooking.startDate} → {confirmedBooking.endDate} ({confirmedBooking.duration})</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Assigned Driver & Phone</span>
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span>{confirmedBooking.driverName || confirmedBooking.driver_name || confirmedBooking.owner}</span>
                  <span className="text-emerald-700 font-black">({confirmedBooking.contact_phone || confirmedBooking.driver_phone || '+91 98230 44112'})</span>
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Location</span>
                <span className="font-bold text-slate-900 truncate max-w-[220px]">{confirmedBooking.location}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-extrabold text-slate-900">
                <span>Payable upon Arrival</span>
                <span className="text-base text-agri-700">₹{confirmedBooking.price?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
              >
                Done
              </button>
              <button
                type="button"
                onClick={handleViewBookings}
                className="flex-1 py-3 bg-gradient-to-r from-agri-600 to-emerald-600 hover:from-agri-700 hover:to-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-agri-900/20 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Go to My Bookings</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-gradient-to-r from-agri-900 via-emerald-950 to-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10 inline-flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  Instant Direct Booking
                </span>
                <h3 className="font-extrabold text-lg mt-1 text-white">{itemData.name || itemData.vehicle_name || itemData.title}</h3>
                <p className="text-[11px] text-slate-300">
                  Partner: {itemData.ownerName || itemData.driverName || 'Verified Agri Provider'} • {itemData.location || 'Maharashtra'}
                </p>
              </div>
              <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-xl transition-colors text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    min={todayStr}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs font-semibold py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-agri-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Duration (Days)</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 7].map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDays(d)}
                        className={`flex-1 py-2 text-[11px] font-extrabold rounded-lg border transition-all ${
                          days === d ? 'bg-agri-600 text-white border-agri-600 shadow-xs' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {d}d
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={days}
                    onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-xs font-semibold py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-agri-500 mt-1.5"
                    placeholder="Custom days"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Farm Pickup / Delivery Address
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Wardha Farm Yard, Kalmeshwar road..."
                    className="w-full text-xs font-medium py-2.5 pl-8 pr-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-agri-500"
                    required
                  />
                </div>
              </div>

              {/* Operator Inclusion */}
              <div 
                onClick={() => setWithOperator(!withOperator)}
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  withOperator ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <UserCheck className={`w-4 h-4 ${withOperator ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <div>
                    <span className="text-xs font-bold block">Trained Driver & Operator Included</span>
                    <span className="text-[10px] text-slate-500">Experienced operator arrives with equipment at zero extra cost</span>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={withOperator} 
                  onChange={() => {}} 
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Special Notes / Implement Requirement</label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Need 7-foot rotavator attachment, call 1 hour before arrival..."
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-agri-500"
                ></textarea>
              </div>

              {/* Pricing Breakdown Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Base Daily Rate</span>
                  <span className="font-bold text-slate-800">₹{unitRate.toLocaleString('en-IN')} / day</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Assigned Driver & Phone</span>
                  <span className="font-bold text-slate-900">
                    {itemData.driverName || itemData.driver_name || itemData.ownerName || 'Suresh Deshmukh'} ({itemData.driverPhone || itemData.driver_phone || itemData.ownerPhone || itemData.contact || '+91 98230 44112'})
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Selected Schedule</span>
                  <span className="font-semibold text-slate-700">{date} to {endDateStr} ({days} Day{days > 1 ? 's' : ''})</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Platform Protection & Service Fee</span>
                  <span className="font-bold text-emerald-600">FREE (AgriPulse Waiver)</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-extrabold text-slate-900">
                  <span>Total Payable Amount</span>
                  <span className="text-base text-agri-700 font-black">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Schedule Overlap / Conflict Alert */}
              {isDateConflict && conflictingBooking && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-900 animate-in fade-in duration-200">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-black text-rose-950">Machinery Occupied / Date Conflict</p>
                    <p className="text-[11px] text-rose-700 mt-0.5 leading-relaxed">
                      This machinery is already reserved between <strong>{conflictingBooking.startDate}</strong> and <strong>{conflictingBooking.endDate}</strong>. Please select different dates to proceed.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero advance deposit. Pay directly after machinery reaches farm.</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isDateConflict}
                  className={`flex-1 py-3 rounded-xl text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-1.5 ${
                    isDateConflict 
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                      : 'bg-gradient-to-r from-agri-600 to-emerald-600 hover:from-agri-700 hover:to-emerald-700 text-white shadow-agri-900/20 disabled:opacity-50'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  {isSubmitting ? 'Reserving...' : isDateConflict ? 'Occupied for Dates' : 'Confirm Reservation'}
                </button>
              </div>

            </form>
          </>
        )}

      </div>
    </div>
  );
};
