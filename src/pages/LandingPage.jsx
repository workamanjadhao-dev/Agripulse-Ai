import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sprout, 
  TrendingUp, 
  Sparkles, 
  Scale, 
  Store, 
  Truck, 
  Tractor, 
  ShieldCheck, 
  Users, 
  BrainCircuit, 
  CheckCircle2, 
  ArrowRight,
  PlayCircle
} from 'lucide-react';
import { CROPS } from '../data/mockData';

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-16 pb-12">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-agri-950 via-agri-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 lg:p-16 shadow-2xl border border-agri-800">
        
        {/* Subtle Background Glow Elements */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-agri-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-agri-800/80 border border-agri-600/50 rounded-full text-xs font-semibold text-agri-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Next-Gen AgriTech Intelligence Platform</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
              Smart Farming. <br />
              <span className="bg-gradient-to-r from-agri-300 via-emerald-200 to-teal-300 bg-clip-text text-transparent">
                Better Prices.
              </span> <br />
              Stronger Supply Chains.
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal max-w-xl">
              AI-powered agricultural intelligence that helps farmers predict crop prices, find the best markets, rent equipment, manage transportation, and make smarter selling decisions.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => navigate('/prices')}
                className="px-6 py-3.5 bg-gradient-to-r from-agri-500 to-emerald-600 hover:from-agri-600 hover:to-emerald-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-agri-950/50 transition-all flex items-center gap-2 group"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Explore Crop Prices</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/forecasting')}
                className="px-6 py-3.5 bg-slate-800/90 hover:bg-slate-700/90 text-white font-bold text-xs sm:text-sm rounded-2xl border border-slate-700 shadow-md transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Predict Crop Prices</span>
              </button>

              <button
                onClick={() => navigate('/tractors')}
                className="px-5 py-3.5 bg-slate-800/50 hover:bg-slate-700/50 text-slate-200 font-semibold text-xs sm:text-sm rounded-2xl border border-slate-700/60 transition-all flex items-center gap-2"
              >
                <Tractor className="w-4 h-4 text-emerald-400" />
                <span>Rent Equipment</span>
              </button>
            </div>

            {/* Guided Walkthrough Banner Callout */}
            <div className="pt-4">
              <div 
                onClick={() => navigate('/walkthrough')}
                className="p-4 bg-emerald-950/70 border border-emerald-500/40 rounded-2xl cursor-pointer hover:border-emerald-400 transition-all flex items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-600 text-white rounded-xl group-hover:scale-105 transition-transform">
                    <PlayCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white flex items-center gap-2">
                      Try Interactive Demo Flow <span className="bg-emerald-500 text-slate-950 text-[10px] px-2 py-0.5 rounded-full font-extrabold">NEW</span>
                    </p>
                    <p className="text-[11px] text-emerald-200">See how a farmer sells cotton from forecast → mandi → transport → profit.</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform shrink-0" />
              </div>
            </div>

          </div>

          {/* Right Hero Visual Card */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900/90 border border-slate-700/80 rounded-3xl p-6 shadow-2xl backdrop-blur-md space-y-4">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-bold text-xs text-slate-200 uppercase tracking-wider">Live AI Intelligence Stream</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Vidarbha & MP Region</span>
              </div>

              {/* Sample Ticker Cards */}
              <div className="space-y-3">
                {CROPS.slice(0, 3).map((crop) => (
                  <div 
                    key={crop.id}
                    onClick={() => navigate(`/forecasting?crop=${crop.id}`)}
                    className="p-3.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-2xl cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <img src={crop.image} alt={crop.name} className="w-10 h-10 rounded-xl object-cover" />
                      <div>
                        <p className="text-xs font-bold text-white">{crop.name}</p>
                        <p className="text-[10px] text-slate-400">15-Day Target: ₹{crop.forecastData[3]?.price}/qtl</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-extrabold text-white">₹{crop.currentAvgPrice}</p>
                      <span className={`text-[10px] font-bold ${crop.change1d >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {crop.change1d >= 0 ? '+' : ''}{crop.change1d} ({crop.changePercent}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-agri-950/80 border border-agri-700/50 rounded-xl text-[11px] text-agri-200 flex items-center justify-between">
                <span className="font-medium">Model Accuracy (XGBoost): <strong>94.2%</strong></span>
                <button onClick={() => navigate('/ml-models')} className="text-emerald-400 font-bold hover:underline">
                  View ML Viva Specs →
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Platform Statistics */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Farmers Connected', value: '25,000+', icon: Users, color: 'text-agri-600 bg-agri-50' },
          { label: 'Mandis Covered', value: '140+', icon: Store, color: 'text-amber-600 bg-amber-50' },
          { label: 'Crops Tracked', value: '35+', icon: Sprout, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Price Predictions', value: '1.2M+', icon: BrainCircuit, color: 'text-blue-600 bg-blue-50' },
          { label: 'Machinery Listed', value: '4,500+', icon: Tractor, color: 'text-teal-600 bg-teal-50' }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm text-center space-y-2">
              <div className={`w-10 h-10 mx-auto rounded-2xl flex items-center justify-center ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">{stat.value}</h3>
              <p className="text-xs font-semibold text-slate-500">{stat.label}</p>
            </div>
          );
        })}
      </section>

      {/* 6 Key Pillars Grid */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-agri-700 uppercase tracking-widest bg-agri-50 px-3 py-1 rounded-full border border-agri-200">
            Complete Digital Agriculture Ecosystem
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Engineered for Modern Indian Agriculture
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Connecting price intelligence, market arbitrage, rental logistics, and cold storage in one seamless platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'AI Crop Price Forecasting',
              desc: 'Predict 7, 15, and 30-day crop prices using XGBoost and LSTM models trained on historical APMC mandi data.',
              icon: Sparkles,
              path: '/forecasting',
              color: 'text-agri-600 bg-agri-100'
            },
            {
              title: 'Should I Sell Now? Advisor',
              desc: 'Financial decision tool comparing immediate sale vs holding, accounting for storage costs & freight.',
              icon: Scale,
              path: '/sell-decision',
              color: 'text-amber-600 bg-amber-100'
            },
            {
              title: 'Mandi Intelligence Engine',
              desc: 'Discover highest-profit mandis based on live prices minus transportation and toll expenses.',
              icon: Store,
              path: '/markets',
              color: 'text-emerald-600 bg-emerald-100'
            },
            {
              title: 'End-to-End Supply Chain',
              desc: 'Track produce shipments live from farm harvest to warehouse, transit truck, and APMC gate entry.',
              icon: Truck,
              path: '/supply-chain',
              color: 'text-blue-600 bg-blue-100'
            },
            {
              title: 'Tractor & Machinery Rentals',
              desc: 'Rent 35-60 HP tractors, rotavators, harvesters, and seed drills with verified local equipment owners.',
              icon: Tractor,
              path: '/tractors',
              color: 'text-teal-600 bg-teal-100'
            },
            {
              title: 'Cold Storage & Warehouses',
              desc: 'Locate available temperature-controlled cold storages and dry grain silos with price booking.',
              icon: ShieldCheck,
              path: '/storage',
              color: 'text-purple-600 bg-purple-100'
            }
          ].map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div 
                key={idx}
                onClick={() => navigate(pillar.path)}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer space-y-4 group"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${pillar.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 group-hover:text-agri-700 transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {pillar.desc}
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-agri-700 group-hover:translate-x-1 transition-transform">
                  <span>Explore Feature</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Trust & ML Viva Callout */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-xl">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
            For Final-Year Viva & Hackathons
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold">Complete Machine Learning Model Benchmark</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Detailed benchmarking section comparing Linear Regression, Random Forest, XGBoost, ARIMA, and LSTM with MAE, RMSE, R² scores, and loss curves.
          </p>
        </div>
        <button
          onClick={() => navigate('/ml-models')}
          className="px-6 py-4 bg-agri-600 hover:bg-agri-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xl transition-all whitespace-nowrap"
        >
          View ML Performance Dashboard →
        </button>
      </section>

    </div>
  );
};
