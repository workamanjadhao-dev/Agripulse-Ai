import React from 'react';
import { useApp } from '../context/AppContext';
import { FileSpreadsheet, Download, CheckCircle2 } from 'lucide-react';

export const ReportsAnalytics = () => {
  const { showToast } = useApp();

  const reports = [
    { title: 'AI Crop Price Forecast Audit', desc: '15-day projected price curves vs actual APMC spot arrivals.', type: 'AI Forecast' },
    { title: 'Mandi Intelligence & Freight Summary', desc: 'Net realized price calculations across Vidarbha APMCs.', type: 'Logistics' },
    { title: 'Farmer Annual Sales & Revenue Statement', desc: 'Aggregated crop sales receipts and payout history.', type: 'Financial' },
    { title: 'Machinery Rental & Utilization Report', desc: 'Tractor and implement rental duration and fuel expenditure.', type: 'Machinery' }
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="bg-gradient-to-r from-agri-900 via-teal-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-agri-700">
        <h1 className="text-2xl sm:text-4xl font-extrabold">Reports & Analytics Export</h1>
        <p className="text-xs sm:text-sm text-slate-300">Download PDF and CSV reports for farm documentation and bank loans.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((r, idx) => (
          <div key={idx} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <span className="text-[10px] font-extrabold bg-agri-100 text-agri-800 px-2.5 py-0.5 rounded-full">{r.type}</span>
            <h3 className="font-bold text-lg text-slate-900">{r.title}</h3>
            <p className="text-xs text-slate-500">{r.desc}</p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => showToast(`Exporting ${r.title} as PDF...`, 'success')} className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                <Download className="w-4 h-4" /> Export PDF
              </button>
              <button onClick={() => showToast(`Exporting ${r.title} as CSV...`, 'info')} className="flex-1 py-2.5 bg-slate-100 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4" /> Export CSV
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
