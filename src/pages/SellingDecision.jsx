import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import { 
  Scale, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ArrowRight, 
  ShieldAlert, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  MapPin,
  Calendar,
  Warehouse,
  Truck,
  HelpCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

import { ALL_CROPS, ALL_MANDIS } from '../data/allCrops';

export const SellingDecision = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { dataTelemetry, t } = useApp();

  const queryCrop = searchParams.get('crop');
  const matchedCrop = queryCrop 
    ? ALL_CROPS.find(c => c.key.toLowerCase() === queryCrop.toLowerCase() || c.name.toLowerCase().includes(queryCrop.toLowerCase()))
    : ALL_CROPS[0];

  const [commodity, setCommodity] = useState(matchedCrop ? matchedCrop.name : 'Soybean (Yellow)');
  const [mandi, setMandi] = useState(matchedCrop?.market || 'Nagpur APMC');
  const [quantity, setQuantity] = useState(40);
  const [currentPrice, setCurrentPrice] = useState(matchedCrop ? matchedCrop.modal : 4700);
  const [holdingDays, setHoldingDays] = useState(15);
  const [storageCostPerDay, setStorageCostPerDay] = useState(3.5);
  const [transportCostPerQtl, setTransportCostPerQtl] = useState(120);

  const [isLoading, setIsLoading] = useState(false);
  const [decisionData, setDecisionData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const commoditiesList = ALL_CROPS.map(c => c.name);

  // When commodity changes, update default mandi and spot price
  const handleCommodityChange = (val) => {
    setCommodity(val);
    const found = ALL_CROPS.find(c => c.name === val);
    if (found) {
      if (found.market) setMandi(found.market);
      if (found.modal) setCurrentPrice(found.modal);
    }
  };

  const fetchDecision = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.getAiSellDecision({
        commodity,
        mandi,
        quantity: Number(quantity) || 1,
        currentPrice: Number(currentPrice) || 0,
        holdingDays: Number(holdingDays) || 1,
        storageCostPerDay: Number(storageCostPerDay) || 0,
        transportCostPerQtl: Number(transportCostPerQtl) || 0
      });
      if (res && res.data) {
        setDecisionData(res.data);
      } else {
        setErrorMessage('Unable to calculate financial decision.');
      }
    } catch (err) {
      console.warn('Decision call error:', err.message);
      setErrorMessage(err.message || 'Error connecting to decision advisor.');
    } finally {
      setIsLoading(false);
    }
  };

  // Run automatically when core parameters change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDecision();
    }, 250);
    return () => clearTimeout(timer);
  }, [commodity, mandi, quantity, currentPrice, holdingDays, storageCostPerDay, transportCostPerQtl]);

  // Derived financial values
  const qty = Number(quantity) || 1;
  const currP = Number(currentPrice) || 0;
  const days = Number(holdingDays) || 1;
  const storageRate = Number(storageCostPerDay) || 0;
  const freightRate = Number(transportCostPerQtl) || 0;

  const decision = decisionData?.decision || (decisionData?.estimatedDifference >= 0 ? 'HOLD' : 'SELL');
  const shouldHold = decision === 'HOLD';
  const expectedPrice = decisionData?.expectedPrice || Math.round(currP * (1 + (shouldHold ? 0.045 : -0.02)));
  const diff = decisionData?.estimatedDifference !== undefined 
    ? decisionData.estimatedDifference 
    : Math.round((qty * (expectedPrice - currP)) - (qty * storageRate * days));
  
  const spotGross = decisionData?.immediateSpotGross || (qty * currP);
  const spotFreight = (qty * freightRate);
  const spotNet = decisionData?.immediateSpotNet || (spotGross - spotFreight);

  const futureGross = decisionData?.futureGross || (qty * expectedPrice);
  const totalStorage = decisionData?.totalStorageCost || (qty * storageRate * days);
  const futureFreight = (qty * freightRate);
  const futureNet = decisionData?.futureNet || (futureGross - totalStorage - futureFreight);

  const breakEvenPrice = decisionData?.breakEvenPrice || Math.round(currP + (storageRate * days));
  const confPct = Math.round((decisionData?.confidence || 0.82) * 100);

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-agri-900 via-emerald-950 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-agri-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Should I Sell Now? Advisor
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Compares immediate spot liquidation against holding produce in certified cold storage & godowns, accounting for freight and carrying costs.
          </p>
        </div>

        <button
          onClick={() => navigate(`/forecasting?crop=${encodeURIComponent(commodity)}`)}
          className="px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0"
        >
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>View 30-Day Price Forecast Curve →</span>
        </button>
      </div>

      {/* Input Configuration Panel */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-agri-600" /> Farmgate Financial Calculator Inputs
          </h3>
          <button
            onClick={fetchDecision}
            disabled={isLoading}
            className="px-3 py-1.5 bg-agri-50 hover:bg-agri-100 text-agri-800 rounded-xl text-xs font-bold border border-agri-200 flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Recalculate</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* 1. Commodity */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Commodity</label>
            <select
              value={commodity}
              onChange={(e) => handleCommodityChange(e.target.value)}
              className="w-full text-xs font-bold py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-agri-500 text-slate-800"
            >
              {commoditiesList.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* 2. Target Mandi */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Target Mandi</label>
            <select
              value={mandi}
              onChange={(e) => setMandi(e.target.value)}
              className="w-full text-xs font-bold py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-agri-500 text-slate-800"
            >
              {[...new Set(ALL_MANDIS.map(m => m.region))].map(region => (
                <optgroup key={region} label={`📍 ${region}`}>
                  {ALL_MANDIS.filter(m => m.region === region).map(m => (
                    <option key={m.name} value={m.name}>{m.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* 3. Quantity */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Quantity (Quintals)</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full text-xs font-bold py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-agri-500 text-slate-800"
            />
          </div>

          {/* 4. Current Price */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Current Spot (₹/Qtl)</label>
            <input
              type="number"
              min="100"
              value={currentPrice}
              onChange={(e) => setCurrentPrice(e.target.value)}
              className="w-full text-xs font-bold py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-agri-500 text-slate-800"
            />
          </div>

          {/* 5. Storage Cost */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Storage (₹/Qtl/Day)</label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={storageCostPerDay}
              onChange={(e) => setStorageCostPerDay(e.target.value)}
              className="w-full text-xs font-bold py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-agri-500 text-slate-800"
            />
          </div>

          {/* 6. Transport / Handling Cost */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Handling Cost (₹/Qtl)</label>
            <input
              type="number"
              min="0"
              value={transportCostPerQtl}
              onChange={(e) => setTransportCostPerQtl(e.target.value)}
              className="w-full text-xs font-bold py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-agri-500 text-slate-800"
            />
          </div>
        </div>

        {/* Quick Holding Days Presets */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-700">Planned Storage Holding Horizon:</span>
            <span className="text-xs font-extrabold text-agri-700 bg-agri-50 px-2 py-0.5 rounded-lg border border-agri-200">
              {holdingDays} Days
            </span>
          </div>

          <div className="flex items-center gap-2">
            {[7, 15, 30, 45].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setHoldingDays(d)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  holdingDays === d 
                    ? 'bg-agri-600 text-white shadow-sm' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {d} Days
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading & Error States */}
      {isLoading && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-3">
          <div className="w-8 h-8 border-4 border-agri-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-700">Evaluating multi-day arrival momentum & cold storage carrying cost...</p>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={fetchDecision} className="px-3 py-1 bg-rose-600 text-white rounded-lg font-bold">Retry</button>
        </div>
      )}

      {/* Primary Arbitrage Verdict Banner - Modern, High-Contrast & Farmer-Friendly */}
      {!isLoading && (() => {
        const perQtlDiff = qty > 0 ? (diff / qty) : 0;
        const isMarginal = diff > 0 && perQtlDiff < 20;
        const isLoss = diff <= 0;

        const bannerBg = isLoss
          ? 'bg-gradient-to-br from-slate-900 via-slate-850 to-rose-950 border border-rose-500/40 shadow-2xl'
          : isMarginal
            ? 'bg-gradient-to-br from-slate-900 via-slate-850 to-amber-950 border border-amber-500/40 shadow-2xl'
            : 'bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950 border border-emerald-500/40 shadow-2xl';

        const badgeColor = isLoss
          ? 'bg-rose-500 text-white'
          : isMarginal
            ? 'bg-amber-400 text-slate-950'
            : 'bg-emerald-400 text-slate-950';

        const actionText = isLoss
          ? 'SELL TODAY (AVOID STORAGE LOSS)'
          : isMarginal
            ? 'MARGINAL GAIN (HOLD OR SELL VIABLE)'
            : 'HOLD IN STORAGE';

        const formattedTotalDiff = diff >= 0 
          ? `+₹${diff.toLocaleString('en-IN')}` 
          : `-₹${Math.abs(diff).toLocaleString('en-IN')}`;

        const formattedPerQtlDiff = perQtlDiff >= 0 
          ? `+₹${perQtlDiff.toFixed(1)}` 
          : `-₹${Math.abs(perQtlDiff).toFixed(1)}`;

        const priceSpread = expectedPrice - currP;
        const formattedPriceSpread = priceSpread >= 0 
          ? `+₹${priceSpread}` 
          : `-₹${Math.abs(priceSpread)}`;

        return (
          <div className={`p-6 sm:p-8 rounded-3xl text-white space-y-6 transition-all ${bannerBg}`}>
            {/* Header Status Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase flex items-center gap-2 shadow-md ${badgeColor}`}>
                  {isLoss ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  ADVISED ACTION: {actionText}
                </span>
                <span className="text-xs bg-white/10 px-3 py-1 rounded-full font-bold text-slate-300">
                  Model Confidence: {confPct}%
                </span>
              </div>

              <div className="text-xs text-slate-300 font-semibold">
                Horizon: <strong>{holdingDays} Days</strong> • Produce: <strong>{quantity} Qtl {commodity}</strong>
              </div>
            </div>

            {/* 3 User-Friendly Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Card 1: Net Financial Difference */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                <span className="text-[11px] uppercase font-bold text-slate-400 block">
                  Net Financial Outcome
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-2xl sm:text-3xl font-black ${
                    diff > 0 ? (isMarginal ? 'text-amber-300' : 'text-emerald-400') : 'text-rose-400'
                  }`}>
                    {formattedTotalDiff}
                  </span>
                  <span className="text-xs text-slate-300 font-semibold">total</span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium">
                  {formattedPerQtlDiff} / quintal spread
                </p>
              </div>

              {/* Card 2: Price Projection */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                <span className="text-[11px] uppercase font-bold text-slate-400 block">
                  Projected Mandi Rate
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black text-white">
                    ₹{expectedPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">/ qtl</span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium flex items-center gap-1">
                  <span>Spot: ₹{currP.toLocaleString('en-IN')}</span>
                  <span className={priceSpread >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    ({formattedPriceSpread}/qtl)
                  </span>
                </p>
              </div>

              {/* Card 3: Break-Even Price */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                <span className="text-[11px] uppercase font-bold text-slate-400 block">
                  Break-Even Threshold
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black text-amber-300">
                    ₹{breakEvenPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">/ qtl</span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium">
                  {expectedPrice >= breakEvenPrice 
                    ? `Safe by +₹${expectedPrice - breakEvenPrice}/qtl above fees`
                    : `Shortfall of ₹${Math.abs(breakEvenPrice - expectedPrice)}/qtl below costs`}
                </p>
              </div>
            </div>

            {/* Practical Farmer Advisory Note */}
            <div className="p-4 bg-black/30 rounded-2xl border border-white/10 text-xs text-slate-200 flex items-start gap-2.5">
              <CheckCircle className={`w-5 h-5 shrink-0 mt-0.5 ${
                isLoss ? 'text-rose-400' : isMarginal ? 'text-amber-400' : 'text-emerald-400'
              }`} />
              <div className="space-y-1">
                <span className="font-bold text-white text-xs uppercase tracking-wider block">
                  Practical Farmer Guidance:
                </span>
                <p className="leading-relaxed text-slate-300 text-xs">
                  {isLoss
                    ? `Immediate spot sale is recommended. After factoring in daily cold storage fees (₹${totalStorage.toLocaleString('en-IN')}), holding this produce would leave you with ₹${Math.abs(diff).toLocaleString('en-IN')} less profit.`
                    : isMarginal
                      ? `Holding provides a marginal profit margin of only +₹${perQtlDiff.toFixed(1)}/qtl (+₹${diff.toLocaleString('en-IN')} total). Because the gain is narrow, selling today to avoid storage hassle or securing quick cash is a completely viable decision.`
                      : `Holding in certified warehouse storage is economically favorable. Expected mandi price appreciation outpaces storage carrying costs by +₹${diff.toLocaleString('en-IN')}.`}
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Side-by-Side Financial Comparison Table */}
      {!isLoading && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-agri-600" /> Option A (Spot Sale) vs Option B (Storage & Hold)
            </h3>
            <p className="text-xs text-slate-500">
              Complete balance sheet comparing today's spot transaction against holding in cold storage / godown at <strong>{mandi}</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Scenario 1: Immediate Sale */}
            <div className={`p-6 rounded-3xl border space-y-4 ${
              !shouldHold ? 'bg-amber-50/60 border-amber-300 ring-2 ring-amber-400/20 shadow-md' : 'bg-slate-50/70 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Option A</span>
                {!shouldHold && (
                  <span className="text-[10px] font-extrabold bg-amber-500 text-white px-2.5 py-0.5 rounded-full">
                    RECOMMENDED
                  </span>
                )}
              </div>

              <h4 className="text-lg font-bold text-slate-900">Sell Immediately Today</h4>

              <div className="space-y-2.5 text-xs pt-2 border-t border-slate-200/80">
                <div className="flex justify-between text-slate-600">
                  <span>Current Spot Price</span>
                  <span className="font-bold text-slate-900">₹{currP.toLocaleString('en-IN')} / qtl</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Gross Mandi Realization ({qty} qtl)</span>
                  <span className="font-bold text-slate-900">₹{spotGross.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span>Mandi Transport & Handling Cost</span>
                  <span className="font-bold">-₹{spotFreight.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Storage Costs Incurred</span>
                  <span className="font-bold text-slate-500">₹0 (No holding)</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-300/80 flex justify-between items-baseline">
                <span className="text-xs font-extrabold text-slate-700 uppercase">Net Realized Cash:</span>
                <span className="text-2xl font-black text-slate-900">₹{spotNet.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Scenario 2: Store & Hold */}
            <div className={`p-6 rounded-3xl border space-y-4 ${
              shouldHold ? 'bg-emerald-50/60 border-emerald-400 ring-2 ring-emerald-500/20 shadow-md' : 'bg-slate-50/70 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Option B</span>
                {shouldHold && (
                  <span className="text-[10px] font-extrabold bg-emerald-600 text-white px-2.5 py-0.5 rounded-full">
                    RECOMMENDED
                  </span>
                )}
              </div>

              <h4 className="text-lg font-bold text-slate-900">Store & Sell in {days} Days</h4>

              <div className="space-y-2.5 text-xs pt-2 border-t border-slate-200/80">
                <div className="flex justify-between text-slate-600">
                  <span>Projected Future Mandi Rate</span>
                  <span className="font-bold text-agri-700">₹{expectedPrice.toLocaleString('en-IN')} / qtl</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Gross Mandi Realization ({qty} qtl)</span>
                  <span className="font-bold text-slate-900">₹{futureGross.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span>Cold Storage Fees ({days}d × ₹{storageRate}/d)</span>
                  <span className="font-bold">-₹{totalStorage.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span>Mandi Transport & Handling Cost</span>
                  <span className="font-bold">-₹{futureFreight.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-300/80 flex justify-between items-baseline">
                <span className="text-xs font-extrabold text-slate-700 uppercase">Net Realized Cash:</span>
                <span className="text-2xl font-black text-agri-700">₹{futureNet.toLocaleString('en-IN')}</span>
              </div>
            </div>

          </div>


          {/* Disclaimer */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{decisionData?.warning || 'AI-assisted financial calculation based on APMC historical price dynamics. Realized spot rates depend on daily mandi arrivals and produce grading.'}</span>
          </div>

        </div>
      )}

    </div>
  );
};
