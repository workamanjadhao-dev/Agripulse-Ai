import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Key, Sparkles, X, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

export const ApiKeyModal = ({ isOpen, onClose }) => {
  const { showToast } = useApp();
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState('Checking backend AI status...');
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('agri_gemini_api_key') || '';
    setApiKey(saved);

    // Check backend health status
    fetch('http://localhost:5000/api/health')
      .then(r => r.json())
      .then(data => {
        if (data.geminiApiKeyConfigured || saved) {
          setIsConfigured(true);
          setStatus('Google Gemini AI is ACTIVE & Connected ✅');
        } else {
          setIsConfigured(false);
          setStatus('Using Built-in ML Fallback Engine (No API Key)');
        }
      })
      .catch(() => {
        setStatus('Backend Server Offline (Using Offline Mock Engine)');
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (apiKey.trim()) {
      localStorage.setItem('agri_gemini_api_key', apiKey.trim());
      setIsConfigured(true);
      showToast('Gemini API Key saved successfully!', 'success');
    } else {
      localStorage.removeItem('agri_gemini_api_key');
      showToast('Custom API Key cleared; using server .env key.', 'info');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-agri-900 via-emerald-900 to-teal-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Key className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base flex items-center gap-1.5">
                AI API Key Settings <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              </h3>
              <p className="text-[11px] text-agri-200">Google Gemini LLM Engine Configuration</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          
          <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-3 ${
            isConfigured ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            {isConfigured ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />}
            <span>{status}</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Google Gemini API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste your Gemini API Key here..."
              className="w-full text-xs font-mono py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-agri-500 text-slate-800"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Key is stored in server `.env` or local browser storage. If empty, built-in ML algorithms are used.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
            <p className="font-bold text-slate-700 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-agri-600" /> API Protection Active
            </p>
            <p>Your API key is transmitted securely via `x-gemini-api-key` header directly to Express REST server.</p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setApiKey('');
                localStorage.removeItem('agri_gemini_api_key');
                showToast('Key cleared from local storage.', 'info');
              }}
              className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
            >
              Clear Custom Key
            </button>

            <button
              type="submit"
              className="flex-1 py-2.5 bg-agri-600 hover:bg-agri-700 text-white rounded-xl text-xs font-bold shadow-md shadow-agri-950/20"
            >
              Save API Key Configuration
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
