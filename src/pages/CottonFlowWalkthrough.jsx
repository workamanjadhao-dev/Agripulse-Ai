import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, CheckCircle2, ArrowRight, Sparkles, Scale, Store, Truck, DollarSign } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CottonFlowWalkthrough = () => {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      step: 1,
      title: 'Farmer Crop Overview',
      desc: 'Farmer selects 4.5 Acres of Cotton (Kapas) reaching harvest readiness.',
      actionLabel: 'Check Current Mandi Price →',
      path: '/my-crops'
    },
    {
      step: 2,
      title: 'Inspect Today\'s Mandi Price',
      desc: 'Nagpur APMC spot price for Cotton is ₹7,250 / quintal (+1.68% today).',
      actionLabel: 'Open AI Price Forecasting →',
      path: '/prices'
    },
    {
      step: 3,
      title: 'Generate AI 15-Day Forecast',
      desc: 'XGBoost model predicts Cotton will surge to ₹7,680 / quintal in 10-15 days (+5.9%).',
      actionLabel: 'Calculate "Should I Sell Now?" →',
      path: '/forecasting?crop=cotton'
    },
    {
      step: 4,
      title: 'Evaluate Selling Decision Arbitrage',
      desc: 'Comparing Sell Now vs Holding 10 Days: Net extra profit is +₹14,500 for 35 quintals after storage.',
      actionLabel: 'Find Highest Profit Mandi →',
      path: '/sell-decision?crop=cotton'
    },
    {
      step: 5,
      title: 'Select Best Mandi & Transport',
      desc: 'Wardha Cotton Mandi offers highest spot price ₹7,410. Renting Bolero Maxi Pickup for 42 km.',
      actionLabel: 'Track Shipment Live →',
      path: '/markets'
    },
    {
      step: 6,
      title: 'Live Shipment Delivery & Sale Confirmation',
      desc: 'Shipment AGRI-SHP-8921 arrives at Mandi weighbridge. Payout ₹2,53,750 transferred to bank.',
      actionLabel: 'Complete Walkthrough Simulation ✅',
      path: '/dashboard'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    } else {
      showToast('End-to-End Cotton Farmer Flow Completed Successfully!', 'success');
      navigate('/dashboard');
    }
  };

  const activeStepObj = steps[currentStep - 1];

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-agri-900 via-emerald-950 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-agri-700 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-agri-200 border border-white/10">
          <PlayCircle className="w-3.5 h-3.5 text-amber-300" />
          <span>Interactive End-to-End User Flow Simulation</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          Cotton Farmer Selling Flow Walkthrough
        </h1>
        <p className="text-xs sm:text-sm text-slate-300">
          Follow the step-by-step commercial journey of a farmer selling 35 quintals of Cotton.
        </p>
      </div>

      {/* Progress Stepper Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
        {steps.map(s => (
          <div
            key={s.step}
            onClick={() => setCurrentStep(s.step)}
            className={`p-3 rounded-2xl border text-center cursor-pointer transition-all ${
              currentStep === s.step
                ? 'bg-agri-600 text-white font-extrabold shadow-md'
                : s.step < currentStep
                ? 'bg-emerald-100 border-emerald-300 text-emerald-900 font-bold'
                : 'bg-white border-slate-200 text-slate-400 font-semibold'
            }`}
          >
            <span className="text-[10px] block uppercase">Step {s.step}</span>
            <span className="text-xs truncate block">{s.title.split(' ')[0]}</span>
          </div>
        ))}
      </div>

      {/* Active Step Showcase Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl space-y-6 animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <span className="text-xs font-extrabold uppercase tracking-widest text-agri-700 bg-agri-50 px-3 py-1 rounded-full border border-agri-200">
            Step {activeStepObj.step} of 6: {activeStepObj.title}
          </span>
          <span className="text-xs font-mono text-slate-400">Simulation Active</span>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-extrabold text-slate-900">{activeStepObj.title}</h2>
          <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
            {activeStepObj.desc}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <button
            onClick={() => navigate(activeStepObj.path)}
            className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
          >
            Inspect Full Page ({activeStepObj.path})
          </button>

          <button
            onClick={handleNext}
            className="w-full sm:w-auto px-6 py-3.5 bg-agri-600 hover:bg-agri-700 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-agri-950/20 transition-all flex items-center justify-center gap-2"
          >
            <span>{activeStepObj.actionLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
