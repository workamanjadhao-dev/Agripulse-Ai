import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Sparkles, CheckCircle2, AlertTriangle, Cpu, ArrowRight, HelpCircle } from 'lucide-react';
import { ALL_CROPS } from '../data/allCrops';

export const EquipmentGuide = () => {
  const navigate = useNavigate();

  // Wizard state
  const [wizardStep, setWizardStep] = useState(1);
  const [wizCrop, setWizCrop] = useState('Cotton');
  const [wizSize, setWizSize] = useState('5 Acres');
  const [wizTask, setWizTask] = useState('Land Preparation');
  const [wizSoil, setWizSoil] = useState('Black Cotton Soil');
  const [recommendedEq, setRecommendedEq] = useState(null);

  const guides = [
    {
      id: 'rotavator',
      name: 'Rotavator (Rotary Tiller)',
      purpose: 'Primary & secondary tillage, soil pulverization, and crop residue mixing.',
      crops: 'Cotton, Soybean, Wheat, Rice, Sugarcane',
      soil: 'Black Cotton Soil, Loamy & Clay Soil',
      hp: '40 - 55 HP Tractor',
      capacity: '1.2 - 1.5 Acres / Hour',
      rate: '₹1,000 - ₹1,400 / Day',
      howToUse: 'Attach via 3-point linkage and PTO shaft running at 540 RPM. Maintain slow forward speed for deep tillage.',
      safety: 'Ensure PTO shield guard is locked. Never touch rotating blades while engine is running.',
      advantages: 'Saves 30% fuel and time compared to traditional plowing + harrowing.',
      image: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'harvester',
      name: 'Combine Harvester',
      purpose: 'Reaping, threshing, gathering, and winnowing in a single operation.',
      crops: 'Wheat, Paddy Rice, Soybean, Gram',
      soil: 'Dry & Firm Field Soil',
      hp: '55 - 75 HP (Track or Wheel mounted)',
      capacity: '2.5 - 3.5 Acres / Hour',
      rate: '₹7,500 - ₹9,000 / Day',
      howToUse: 'Adjust reel speed and cutter bar height according to crop moisture level.',
      safety: 'Inspect field for large stones or iron pipes before operating cutter bar.',
      advantages: 'Reduces harvest labor by 95% and minimizes post-harvest shattering losses.',
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'seed-drill',
      name: 'Automatic Seed Cum Fertilizer Drill',
      purpose: 'Precision seed sowing and simultaneous fertilizer placement at required depth.',
      crops: 'Wheat, Pulses, Gram, Maize',
      soil: 'Well-pulverized seedbed soil',
      hp: '35 - 45 HP Tractor',
      capacity: '1.0 - 1.2 Acres / Hour',
      rate: '₹800 - ₹1,100 / Day',
      howToUse: 'Calibrate seed meter fluted rollers according to recommended seed rate per acre.',
      safety: 'Clean seed hopper regularly to prevent chemical fertilizer clumping.',
      advantages: 'Ensures 98% germination rate and uniform plant population.',
      image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600&auto=format&fit=crop&q=80'
    }
  ];

  const handleWizardSubmit = () => {
    let rec = 'Shaktiman 7-Feet Rotavator + 45 HP Tractor';
    if (wizTask === 'Harvesting') rec = 'Dasmesh Combine Harvester';
    if (wizTask === 'Sowing') rec = 'Fieldking Seed Drill + 40 HP Tractor';
    setRecommendedEq(rec);
    setWizardStep(2);
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-agri-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-agri-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-agri-200 border border-white/10">
            <BookOpen className="w-3.5 h-3.5 text-amber-300" />
            <span>Educational Agricultural Machinery Directory</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Agricultural Equipment Guide
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Detailed operating specifications, tractor HP matching, soil compatibility, safety guidelines, and ROI benefits for 10+ farm implements.
          </p>
        </div>

        <button
          onClick={() => navigate('/machinery-advisor')}
          className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2 shrink-0"
        >
          <Cpu className="w-4 h-4" />
          <span>AI Machinery Advisor Wizard →</span>
        </button>
      </div>

      {/* "Find the Right Equipment" Wizard Box */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="p-2 bg-agri-100 text-agri-700 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-slate-900">Find the Right Equipment Wizard</h3>
            <p className="text-xs text-slate-500">Answer 4 quick farm parameters to find your exact implement match</p>
          </div>
        </div>

        {wizardStep === 1 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Target Crop</label>
                <select
                  value={wizCrop}
                  onChange={(e) => setWizCrop(e.target.value)}
                  className="w-full text-xs font-bold py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {ALL_CROPS.map((c) => (
                    <option key={c.key} value={c.key}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Farm Land Size</label>
                <select
                  value={wizSize}
                  onChange={(e) => setWizSize(e.target.value)}
                  className="w-full text-xs font-bold py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="2 Acres">1 - 3 Acres</option>
                  <option value="5 Acres">3 - 8 Acres</option>
                  <option value="15 Acres">10+ Acres</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Farming Task</label>
                <select
                  value={wizTask}
                  onChange={(e) => setWizTask(e.target.value)}
                  className="w-full text-xs font-bold py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Land Preparation">Land Preparation / Tillage</option>
                  <option value="Sowing">Seed Sowing</option>
                  <option value="Harvesting">Harvesting</option>
                  <option value="Spraying">Pesticide Spraying</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Soil Type</label>
                <select
                  value={wizSoil}
                  onChange={(e) => setWizSoil(e.target.value)}
                  className="w-full text-xs font-bold py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Black Cotton Soil">Black Cotton Soil</option>
                  <option value="Red Loamy Soil">Red Loamy Soil</option>
                  <option value="Sandy Soil">Sandy Alluvial Soil</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleWizardSubmit}
              className="px-6 py-3 bg-agri-600 hover:bg-agri-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              <span>Generate Equipment Match</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="p-6 bg-agri-50 rounded-2xl border border-agri-200 space-y-3">
            <span className="text-[10px] font-extrabold uppercase bg-agri-200 text-agri-900 px-2.5 py-0.5 rounded-full">
              WIZARD RECOMMENDATION RESULT
            </span>
            <h4 className="font-extrabold text-xl text-slate-900">Recommended Match: {recommendedEq}</h4>
            <p className="text-xs text-slate-600">
              For {wizSize} of {wizCrop} on {wizSoil}, this combination gives optimal fuel efficiency and soil seedbed texture.
            </p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setWizardStep(1)} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-xl text-xs font-bold">
                Change Inputs
              </button>
              <button onClick={() => navigate('/equipment')} className="px-4 py-2 bg-agri-600 text-white rounded-xl text-xs font-bold">
                Rent This Implement Now →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Guides List */}
      <div className="space-y-6">
        {guides.map(g => (
          <div key={g.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm p-6 sm:p-8 space-y-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-4">
              <img src={g.image} alt={g.name} className="w-full h-56 rounded-2xl object-cover shadow-sm" />
            </div>

            <div className="lg:col-span-8 space-y-4">
              <div>
                <h3 className="font-extrabold text-xl text-slate-900">{g.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{g.purpose}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] font-bold block">TRACTOR HP</span>
                  <span className="font-bold text-slate-800">{g.hp}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] font-bold block">WORKING RATE</span>
                  <span className="font-bold text-slate-800">{g.capacity}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] font-bold block">RENTAL COST</span>
                  <span className="font-bold text-agri-700">{g.rate}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] font-bold block">SUITABLE SOIL</span>
                  <span className="font-bold text-slate-800">{g.soil}</span>
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-600">
                <p><strong>Operating Instruction:</strong> {g.howToUse}</p>
                <p className="text-rose-600"><strong>Safety Alert:</strong> {g.safety}</p>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
