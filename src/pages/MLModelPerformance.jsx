import React from 'react';
import { ML_MODELS, FEATURE_IMPORTANCE } from '../data/mockData';
import { BrainCircuit, Award, CheckCircle2, Sparkles, Activity, Layers, Database } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

export const MLModelPerformance = () => {
  const bestModel = ML_MODELS.find(m => m.isBest) || ML_MODELS[0];
  const lstmModel = ML_MODELS.find(m => m.id === 'lstm') || ML_MODELS[1];

  const modelComparisonChartData = ML_MODELS.map(m => ({
    name: m.id.toUpperCase(),
    r2Score: parseFloat(m.r2Score * 100).toFixed(1),
    mae: parseFloat(m.mae.replace(/[^\d.]/g, ''))
  }));

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-agri-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-agri-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-emerald-300 border border-white/10">
            <BrainCircuit className="w-3.5 h-3.5 text-amber-300" />
            <span>Final-Year Engineering Project Viva Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            AI ML Model Performance & Benchmarking ⭐
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Empirical comparative analysis of 5 Machine Learning algorithms evaluated on 10 years of Indian APMC mandi price time-series dataset.
          </p>
        </div>

        <span className="px-4 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-2xl text-xs font-extrabold uppercase tracking-wider shrink-0">
          Dataset: 1.2M Mandi Records
        </span>
      </div>

      {/* Prominent Best Model Winner Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-agri-900 to-teal-950 text-white p-6 sm:p-8 rounded-3xl border border-emerald-600 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3.5 bg-amber-400 text-slate-950 rounded-2xl shrink-0 shadow-lg">
            <Award className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300 bg-amber-950 px-3 py-0.5 rounded-full border border-amber-700">
              BEST PERFORMING ALGORITHM
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold">{bestModel.name}</h2>
            <p className="text-xs sm:text-sm text-slate-300">
              R² Score: <strong className="text-emerald-300 text-base">{bestModel.r2Score}</strong> | MAE: <strong>{bestModel.mae}</strong> | RMSE: <strong>{bestModel.rmse}</strong> | Execution Time: <strong>{bestModel.trainingTime}</strong>
            </p>
          </div>
        </div>

        <div className="px-5 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center text-xs space-y-1 shrink-0">
          <span className="text-slate-300 block">Forecast Accuracy Score</span>
          <span className="text-2xl font-extrabold text-amber-300">{bestModel.accuracy}</span>
        </div>
      </div>

      {/* Model Benchmark Metrics Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-agri-600" /> Model Comparison Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Algorithm Name</th>
                <th className="py-3 px-3">Model Type</th>
                <th className="py-3 px-3">MAE (Mean Abs Error)</th>
                <th className="py-3 px-3">RMSE</th>
                <th className="py-3 px-3">R² Score</th>
                <th className="py-3 px-3">Accuracy</th>
                <th className="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {ML_MODELS.map(m => (
                <tr key={m.id} className={`hover:bg-slate-50 transition-colors ${m.isBest ? 'bg-agri-50/70 font-bold' : ''}`}>
                  <td className="py-3.5 px-3 font-bold text-slate-900 flex items-center gap-2">
                    {m.isBest && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    <span>{m.name}</span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-600">{m.type}</td>
                  <td className="py-3.5 px-3 text-slate-800">{m.mae}</td>
                  <td className="py-3.5 px-3 text-slate-800">{m.rmse}</td>
                  <td className="py-3.5 px-3 text-agri-700 font-bold">{m.r2Score}</td>
                  <td className="py-3.5 px-3 font-extrabold text-slate-900">{m.accuracy}</td>
                  <td className="py-3.5 px-3 text-right">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      m.isBest ? 'bg-emerald-500 text-slate-950' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recharts Graphs Grid: R2 Accuracy Comparison & LSTM Loss Curves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Graph 1: Model Accuracy Bar Chart */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-agri-600" /> R² Accuracy Score (%) Comparison
          </h3>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modelComparisonChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="r2Score" fill="#16a34a" name="R² Accuracy (%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 2: LSTM Loss Curve */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" /> Deep Learning LSTM Training vs Validation Loss
          </h3>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lstmModel.lossHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="epoch" label={{ value: 'Epochs', position: 'insideBottomRight', offset: -5, fontSize: 10 }} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="train" stroke="#0284c7" strokeWidth={2} name="Training Loss" />
                <Line type="monotone" dataKey="val" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" name="Validation Loss" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Feature Importance Ranking */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-600" /> Feature Importance Weightage (XGBoost)
        </h3>

        <div className="space-y-3">
          {FEATURE_IMPORTANCE.map((feat, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>{feat.name}</span>
                <span className="font-bold text-agri-700">{feat.weight}% Impact Weight</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-agri-600 h-full rounded-full" style={{ width: `${feat.weight * 2.5}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
