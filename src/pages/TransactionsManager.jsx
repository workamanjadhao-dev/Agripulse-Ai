import React from 'react';
import { useApp } from '../context/AppContext';
import { Receipt, CheckCircle2, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export const TransactionsManager = () => {
  const { transactions } = useApp();

  return (
    <div className="space-y-8 pb-12">
      <div className="bg-gradient-to-r from-agri-900 via-teal-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-agri-700">
        <h1 className="text-2xl sm:text-4xl font-extrabold">Payments & Transactions Ledger</h1>
        <p className="text-xs sm:text-sm text-slate-300">Financial records for crop sales, equipment rentals, and transport payouts.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
              <th className="py-3 px-3">Transaction ID</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3">Item / Service</th>
              <th className="py-3 px-3">Date</th>
              <th className="py-3 px-3">Amount</th>
              <th className="py-3 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {transactions.map(t => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="py-3.5 px-3 font-bold text-slate-900">{t.id}</td>
                <td className="py-3.5 px-3 text-slate-600">{t.type}</td>
                <td className="py-3.5 px-3 text-slate-800">{t.item}</td>
                <td className="py-3.5 px-3 text-slate-500">{t.date}</td>
                <td className="py-3.5 px-3 font-extrabold text-slate-900">₹{t.amount.toLocaleString('en-IN')}</td>
                <td className="py-3.5 px-3 text-right">
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
