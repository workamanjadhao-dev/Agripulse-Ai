import React from 'react';
import { BarChart3, TrendingUp, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

export const DemandSupply = () => {
  const demandSupplyData = [
    { crop: 'Cotton', demand: 85, supply: 65, gap: '+20% Deficit (High Demand)' },
    { crop: 'Soybean', demand: 60, supply: 80, gap: '-20% Oversupply' },
    { crop: 'Wheat', demand: 75, supply: 72, gap: 'Balanced' },
    { crop: 'Onion', demand: 90, supply: 55, gap: '+35% Severe Deficit' },
    { crop: 'Tur Dal', demand: 95, supply: 60, gap: '+35% High Price Surge' }
  ];

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-agri-900 via-teal-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-agri-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-agri-200 border border-white/10">
            <BarChart3 className="w-3.5 h-3.5 text-amber-300" />
            <span>Macro-Commodity Balance Sheet</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Market Demand & Supply Forecast
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Identify high-demand commodities (🟢 High Demand) vs market gluts (🔴 Oversupply) across regional mandis.
          </p>
        </div>
      </div>

      {/* Recharts Bar Chart */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-agri-600" /> Regional Market Demand Index vs Arrivals Supply
        </h3>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={demandSupplyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="crop" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
              <Bar dataKey="demand" fill="#16a34a" name="Market Demand Score" radius={[6, 6, 0, 0]} />
              <Bar dataKey="supply" fill="#0284c7" name="Mandi Arrival Supply" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Commodity Status Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <h3 className="font-bold text-base text-slate-900">🟢 High Demand Crops</h3>
          </div>
          <p className="text-xs text-slate-500">Cotton, Red Onion, Tur Dal</p>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full inline-block">
            Prices expected to rise +5% to +12%
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <h3 className="font-bold text-base text-slate-900">🟡 Normal Balance</h3>
          </div>
          <p className="text-xs text-slate-500">Lokwan Wheat, Basmati Rice</p>
          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full inline-block">
            Stable sideways price movement
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500"></span>
            <h3 className="font-bold text-base text-slate-900">🔴 Oversupply Risk</h3>
          </div>
          <p className="text-xs text-slate-500">Yellow Soybean, Hybrid Tomato</p>
          <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full inline-block">
            High arrivals; sell early or store
          </span>
        </div>
      </div>

    </div>
  );
};
