import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, Sparkles, Tractor, Wrench, Fuel, Clock, DollarSign, CheckCircle2, ArrowRight } from 'lucide-react';
import { ALL_CROPS } from '../data/allCrops';

export const MachineryAdvisor = () => {
  const navigate = useNavigate();

  const [crop, setCrop] = useState('Cotton');
  const [farmSize, setFarmSize] = useState(5); // acres
  const [activity, setActivity] = useState('Land Preparation');
  const [soilType, setSoilType] = useState('Black Cotton Soil');
  const [budget, setBudget] = useState(5000);

  // Dynamic AI Computation
  const calculatedHp = farmSize > 8 ? 55 : farmSize > 4 ? 45 : 38;
  const recommendedTractor = `${calculatedHp} HP Heavy Duty Tractor`;
  
  let recommendedImplement = 'Shaktiman 7-Feet Rotavator';
  let hoursPerAcre = 1.3;
  let fuelPerHour = 3.6; // Liters
  let ratePerHour = 450;

  if (activity === 'Harvesting') {
    recommendedImplement = 'Dasmesh Combine Harvester';
    hoursPerAcre = 0.6;
    fuelPerHour = 7.5;
    ratePerHour = 1100;
  } else if (activity === 'Sowing') {
    recommendedImplement = 'Fieldking 9-Row Seed Drill';
    hoursPerAcre = 0.9;
    fuelPerHour = 2.8;
    ratePerHour = 400;
  }

  const totalWorkingHours = (farmSize * hoursPerAcre).toFixed(1);
  const totalFuelRequirement = (totalWorkingHours * fuelPerHour).toFixed(1);
  const totalEstimatedCost = Math.round(totalWorkingHours * ratePerHour);

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-agri-900 via-teal-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-agri-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-agri-200 border border-white/10">
            <Cpu className="w-3.5 h-3.5 text-amber-300" />
            <span>Smart Farm Mechanization Optimizer</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            AI Farm Machinery Advisor ⭐
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Calculate exact tractor horsepower, implement pairing, estimated fuel consumption, working duration, and rental cost based on your farm acreage.
          </p>
        </div>
      </div>

      {/* Form Input Box */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-agri-600" /> Farm Parameters Input
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Target Crop</label>
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="w-full text-xs font-bold py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl"
            >
              {ALL_CROPS.map((c) => (
                <option key={c.key} value={c.key}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Farm Size (Acres)</label>
            <input
              type="number"
              min="1"
              max="100"
              value={farmSize}
              onChange={(e) => setFarmSize(Number(e.target.value) || 1)}
              className="w-full text-xs font-bold py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Farming Activity</label>
            <select
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className="w-full text-xs font-bold py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="Land Preparation">Land Preparation / Tillage</option>
              <option value="Sowing">Seed Sowing</option>
              <option value="Harvesting">Harvesting</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Soil Type</label>
            <select
              value={soilType}
              onChange={(e) => setSoilType(e.target.value)}
              className="w-full text-xs font-bold py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="Black Cotton Soil">Black Cotton Soil</option>
              <option value="Red Loamy Soil">Red Loamy Soil</option>
              <option value="Sandy Soil">Sandy Soil</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Target Budget (₹)</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value) || 0)}
              className="w-full text-xs font-bold py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Generated Recommendation Results Card */}
      <div className="bg-gradient-to-r from-emerald-950 via-agri-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-700 space-y-6">
        
        <div className="flex items-center justify-between border-b border-emerald-800 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <h2 className="font-extrabold text-xl">AI Machinery Optimization Output</h2>
          </div>
          <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-3 py-1 rounded-full border border-emerald-500/30">
            Field Area: {farmSize} Acres
          </span>
        </div>

        {/* 5 Result Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
          
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-1">
            <Tractor className="w-5 h-5 text-emerald-300" />
            <span className="text-[10px] font-bold text-slate-300 uppercase block">RECOMMENDED TRACTOR</span>
            <span className="font-extrabold text-sm text-white">{recommendedTractor}</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-1">
            <Wrench className="w-5 h-5 text-amber-300" />
            <span className="text-[10px] font-bold text-slate-300 uppercase block">RECOMMENDED IMPLEMENT</span>
            <span className="font-extrabold text-sm text-white">{recommendedImplement}</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-1">
            <Clock className="w-5 h-5 text-blue-300" />
            <span className="text-[10px] font-bold text-slate-300 uppercase block">WORKING DURATION</span>
            <span className="font-extrabold text-sm text-white">{totalWorkingHours} Hours</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-1">
            <Fuel className="w-5 h-5 text-rose-300" />
            <span className="text-[10px] font-bold text-slate-300 uppercase block">EXPECTED FUEL</span>
            <span className="font-extrabold text-sm text-white">~{totalFuelRequirement} Liters Diesel</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-1">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span className="text-[10px] font-bold text-slate-300 uppercase block">ESTIMATED RENTAL COST</span>
            <span className="font-extrabold text-lg text-emerald-300">₹{totalEstimatedCost.toLocaleString('en-IN')}</span>
          </div>

        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-emerald-800/80">
          <p className="text-xs text-slate-300">
            Sample Output Verdict: <strong>“Recommended: {calculatedHp} HP tractor + {recommendedImplement}.”</strong>
          </p>

          <button
            onClick={() => navigate('/tractors')}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition-all shrink-0"
          >
            Find Matching Machinery →
          </button>
        </div>

      </div>

    </div>
  );
};
