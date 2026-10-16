import React from 'react';
import { SHIPMENT_TRACKING } from '../data/mockData';
import { MapComponent } from '../components/MapComponent';
import { Truck, CheckCircle2, Clock, MapPin, ShieldCheck, Thermometer, Droplets, Navigation, UserCheck } from 'lucide-react';

export const SupplyChain = () => {
  const shipment = SHIPMENT_TRACKING;

  // Route coordinates: Wardha Farm -> NH-44 -> Nagpur APMC
  const routePoints = [
    [20.7453, 78.6022], // Wardha Farm
    [20.9000, 78.8500], // Transit on NH-44
    [21.1458, 79.0882]  // Nagpur APMC
  ];

  const mapMarkers = [
    { lat: 20.7453, lng: 78.6022, title: 'Origin: Wardha Farm', subtitle: 'Loaded 35 Qtl Cotton' },
    { lat: 20.9000, lng: 78.8500, title: 'In Transit: Vehicle MH 31 FC 4421', subtitle: 'Speed: 48 km/h' },
    { lat: 21.1458, lng: 79.0882, title: 'Destination: Nagpur APMC', subtitle: 'ETA: 11:45 AM' }
  ];

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-agri-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-agri-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-agri-200 border border-white/10">
            <Truck className="w-3.5 h-3.5 text-amber-300" />
            <span>End-to-End Agri Logistics Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Agricultural Supply Chain & Shipment Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Real-time track produce from farm harvest, collection centers, cold storages, transit trucks, to APMC mandi gate verification.
          </p>
        </div>

        <span className="px-4 py-2 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded-2xl text-xs font-bold uppercase tracking-wider shrink-0">
          ● Live Tracking Active
        </span>
      </div>

      {/* Visual Pipeline Stage Timeline Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-extrabold text-indigo-600 uppercase tracking-widest">Active Shipment ID</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">{shipment.shipmentId}</h2>
            <p className="text-xs text-slate-500 mt-0.5">Crop: <strong>{shipment.crop}</strong> ({shipment.quantityQuintals} Quintals)</p>
          </div>

          {/* Telemetry Sensor Badges */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-semibold text-slate-700">
              <Thermometer className="w-4 h-4 text-rose-500" />
              <span>Temp: <strong>{shipment.telemetry.temperature}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-semibold text-slate-700">
              <Droplets className="w-4 h-4 text-blue-500" />
              <span>Humidity: <strong>{shipment.telemetry.humidity}</strong></span>
            </div>
          </div>
        </div>

        {/* Timeline Stages */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative">
          {shipment.stages.map((stg, idx) => (
            <div 
              key={idx} 
              className={`p-4 rounded-2xl border transition-all ${
                stg.completed 
                  ? 'bg-agri-50 border-agri-300 text-agri-900' 
                  : stg.active 
                  ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-400/20 text-indigo-900 animate-pulse-subtle' 
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider">Stage {idx + 1}</span>
                {stg.completed && <CheckCircle2 className="w-4 h-4 text-agri-600" />}
                {stg.active && <Clock className="w-4 h-4 text-indigo-600 animate-spin" />}
              </div>
              <h4 className="font-bold text-xs">{stg.name}</h4>
              <p className="text-[11px] mt-1 line-clamp-2">{stg.label}</p>
              <span className="text-[10px] text-slate-500 font-mono mt-2 block">{stg.time}</span>
            </div>
          ))}
        </div>

      </div>

      {/* Grid: Driver Information & Interactive Route Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Driver & Vehicle Details */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-agri-600" /> Assigned Vehicle & Driver
          </h3>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Driver Name</span>
              <span className="font-bold text-slate-900">{shipment.driver.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Vehicle Reg Number</span>
              <span className="font-bold text-slate-900">{shipment.driver.vehicle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Phone Contact</span>
              <span className="font-bold text-agri-700">{shipment.driver.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Driver Reliability Rating</span>
              <span className="font-bold text-amber-600">⭐ {shipment.driver.rating} / 5.0</span>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800 space-y-1">
            <p className="font-bold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Quality Verified Freight
            </p>
            <p className="text-[11px]">Moisture sensor & GPS tracker active. Tamper-evident seal applied at farm loading.</p>
          </div>
        </div>

        {/* Map Route Simulation */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Navigation className="w-4 h-4 text-agri-600" /> Live Highway GPS Route Simulation
          </h3>
          <MapComponent center={[20.9000, 78.8500]} zoom={9} markers={mapMarkers} route={routePoints} />
        </div>

      </div>

    </div>
  );
};
