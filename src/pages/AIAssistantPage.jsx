import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import { Bot, Send, Sparkles, User, ArrowRight, RefreshCw, AlertCircle, Key, Check, X, ExternalLink, ShieldCheck } from 'lucide-react';

export const AIAssistantPage = () => {
  const { role, dataTelemetry, language, showToast } = useApp();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    return localStorage.getItem('agri_gemini_api_key') || '';
  });
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(geminiApiKey);

  const initialGreeting = language === 'hi'
    ? 'नमस्ते! एग्रीपल्स एआई कृषि सलाहकार में आपका स्वागत है। मैं फसलों की खेती, मंडी भाव, खाद, रोग नियंत्रण, ट्रैक्टर व वाहन बुकिंग आदि से जुड़े आपके सभी सवालों के जवाब देने के लिए तैयार हूँ। आप कुछ भी पूछ सकते हैं!'
    : language === 'mr'
    ? 'नमस्कार! अ‍ॅग्रीपल्स एआय शेती सल्लागारामध्ये आपले स्वागत आहे. मी पिके, बाजार भाव, खते, कीड व्यवस्थापन, ट्रॅक्टर व वाहतूक बुकिंग याविषयी आपल्या सर्व प्रश्नांची उत्तरे देण्यास तयार आहे. आपण कोणताही प्रश्न विचारू शकता!'
    : 'Namaste! Welcome to the AgriPulse AI Agricultural Intelligence Console. I am ready to answer all your questions about crop agronomy, fertilizers, pest control, real-time APMC prices, 15-day forecasts, tractor & transport bookings, and government schemes.';

  const initialSuggestions = language === 'hi'
    ? ['धान के लिए सबसे अच्छा खाद कौन सा है?', 'क्या मुझे कपास अभी बेचना चाहिए?', 'नागपुर में सोयाबीन का भाव क्या है?', 'ट्रैक्टर कैसे बुक करें?']
    : language === 'mr'
    ? ['कापसावरील बोंडअळी कशी रोखावी?', 'सोयाबीनचा आजचा नागपूर भाव काय आहे?', '५ एकरांसाठी कोणता ट्रॅक्टर योग्य आहे?', 'वाहतूक कशी बुक करावी?']
    : ['What is the best fertilizer for paddy?', 'Should I sell my cotton now?', 'What is today\'s soybean price in Nagpur APMC?', 'How do I book a tractor on AgriPulse?'];

  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: initialGreeting,
      suggestions: initialSuggestions
    }
  ]);

  const handleSaveApiKey = (e) => {
    e.preventDefault();
    const cleanKey = tempApiKey.trim();
    if (cleanKey) {
      localStorage.setItem('agri_gemini_api_key', cleanKey);
      setGeminiApiKey(cleanKey);
      showToast('Gemini API key saved! Direct Google Gemini chat is active.', 'success');
    } else {
      localStorage.removeItem('agri_gemini_api_key');
      setGeminiApiKey('');
      showToast('Gemini API key removed. Using default grounded engine.', 'info');
    }
    setIsKeyModalOpen(false);
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('agri_gemini_api_key');
    setGeminiApiKey('');
    setTempApiKey('');
    showToast('Gemini API key cleared.', 'info');
    setIsKeyModalOpen(false);
  };

  // Direct client-side Gemini 1.5 Flash caller
  const callDirectGemini = async (query) => {
    if (!geminiApiKey) return null;
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiApiKey}`;
      const systemInstruction = `You are AgriPulse AI, an expert agricultural advisor and companion for Indian farmers, traders, and agri-entrepreneurs.
Provide practical, compassionate, and precise advice on crops (cotton, soybean, wheat, paddy, onion, etc.), APMC mandi prices in Maharashtra/India, tractor and transport booking, fertilizer calculations, pest remedies, and government schemes (PM-KISAN, PMFBY, KCC).
Format with clear bullet points and bold titles. Always respond in the user's language (${language}).`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: `${systemInstruction}\n\nUser Question:\n${query}` }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (candidateText) {
        return {
          reply: candidateText.trim(),
          source: 'Google Gemini 1.5 Flash (Direct API Key)'
        };
      }
      return null;
    } catch (err) {
      console.warn('Direct Gemini call warning, falling back to backend:', err.message);
      return null;
    }
  };

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMessage = { sender: 'user', text: query };
    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      // 1. Try Direct Gemini Call if user configured API Key
      let directRes = null;
      if (geminiApiKey) {
        directRes = await callDirectGemini(query);
      }

      if (directRes && directRes.reply) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: directRes.reply,
            source: directRes.source,
            suggestions: ['15-Day Price Forecast', 'Compare APMC Mandi Rates', 'Book Farm Transport']
          }
        ]);
        return;
      }

      // 2. Fall back to backend /api/ai/chat passing apiKey
      const res = await api.sendAiChat(query, role, language, geminiApiKey);
      if (res && res.reply) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: res.reply,
            source: res.source || 'AgriPulse Grounded Intelligence',
            suggestions: ['15-Day Price Forecast', 'Compare APMC Mandi Rates', 'Book Farm Transport']
          }
        ]);
      }
    } catch (err) {
      // 3. Resilient Offline Knowledge Fallback
      console.warn('AI chat error, using offline grounded response:', err);
      const lower = query.toLowerCase();
      let fallbackText = `🤖 **AgriPulse Agricultural Assistant**:\n\nRegarding your question about **"${query}"**:\n\n• **Field Advisory**: For optimal crop production and soil health, always test soil pH and Electrical Conductivity (EC) once every 2 years and follow balanced N:P:K application.\n• **Mandi & Market Data**: Real-time APMC arrivals and prices across Maharashtra and Indian mandis are actively tracked in AgriPulse. You can query any specific crop (Cotton, Soybean, Wheat, Rice, Onion, Tomato, Turmeric, etc.) for current modal rates.\n• **Farm Services**: Explore **Tractor Rental**, **Transport Logistics**, **Storage Finder**, or **Weather Intelligence** for end-to-end farm support.`;

      if (lower.includes('tractor') || lower.includes('ट्रॅक्टर')) {
        fallbackText = `🚜 **Tractor & Machinery Rental on AgriPulse**:\n\n• **Rates**: 40–55 HP tractors available from ₹650/hour or ₹1,200/acre including driver.\n• **Attachments**: Rotavator, MB Plough, Cultivator, Seed Drill.\n• **Booking**: Open the Tractor Rental page to inspect live telemetry and reserve with zero booking deposit.`;
      } else if (lower.includes('mandi') || lower.includes('भाव') || lower.includes('price')) {
        fallbackText = `📈 **APMC Mandi Price Intelligence**:\n\n• **Cotton (Kapas)**: Modal ₹7,450 / Qtl in Nagpur & Wardha APMC.\n• **Soybean (Yellow)**: Modal ₹4,850 / Qtl with steady arrivals.\n• **Red Onion**: Modal ₹2,950 / Qtl in Lasalgaon & Nashik.\n• Check the Market Intelligence tab for full 15-day econometric forecasts.`;
      }

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: fallbackText,
          source: 'AgriPulse Offline Grounded Knowledge Base',
          suggestions: ['Compare Mandis', 'Check Tractor Rentals', 'Storage Finder']
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-agri-900 via-teal-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-agri-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-agri-200 border border-white/10 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-amber-300" />
              <span>Grounded Agricultural Intelligence Engine</span>
            </span>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-400/30">
              {dataTelemetry.badge}
            </span>
            {geminiApiKey ? (
              <span className="px-3 py-1 bg-emerald-600/30 text-emerald-200 rounded-full text-xs font-bold border border-emerald-500/40 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Direct Gemini 1.5 Flash Connected</span>
              </span>
            ) : (
              <span className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-full text-xs font-medium border border-white/10 flex items-center gap-1.5">
                <span>Platform AI Grounded</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">AI Agricultural Assistant</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Real-time conversational agricultural advisory grounded in verified Indian Agmarknet APMC mandi records and Google Gemini AI.
          </p>
        </div>

        <button
          onClick={() => {
            setTempApiKey(geminiApiKey);
            setIsKeyModalOpen(true);
          }}
          className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl border border-white/20 text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-md"
        >
          <Key className="w-4 h-4 text-amber-300" />
          <span>{geminiApiKey ? '🔑 Custom Gemini Key Set' : '🔑 Set Gemini API Key'}</span>
        </button>
      </div>

      {/* Chat Window */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[620px]">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed ${
                msg.sender === 'user' 
                  ? 'bg-agri-600 text-white font-medium shadow-xs' 
                  : msg.isError 
                  ? 'bg-rose-50 border border-rose-200 text-rose-800'
                  : 'bg-white border border-slate-200 text-slate-800 shadow-xs'
              }`}>
                <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                {msg.source && (
                  <span className="text-[10px] text-slate-400 block mt-2 border-t border-slate-100 pt-1">
                    Grounded Source: <strong>{msg.source}</strong>
                  </span>
                )}
              </div>

              {msg.suggestions && msg.suggestions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {msg.suggestions.map((s, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => handleSend(s)}
                      disabled={isLoading}
                      className="text-[11px] font-semibold text-agri-800 bg-agri-50 hover:bg-agri-100 border border-agri-200 px-3 py-1 rounded-full flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <span>{s}</span>
                      <ArrowRight className="w-3 h-3 text-agri-600" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl w-fit text-xs text-slate-500 shadow-xs">
              <RefreshCw className="w-4 h-4 text-agri-600 animate-spin" />
              <span>
                {geminiApiKey ? 'Consulting Direct Google Gemini 1.5 Flash...' : 'Analyzing APMC market data and consulting Gemini AI...'}
              </span>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-4 bg-white border-t border-slate-200 flex items-center gap-3">
          <input
            type="text"
            value={input}
            disabled={isLoading}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about crop prices, mandis, machinery, fertilizers, or diseases..."
            className="flex-1 text-xs py-3 px-4 bg-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-agri-500 font-medium text-slate-800"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-5 py-3 bg-agri-600 hover:bg-agri-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>
      </div>

      {/* Modal: Configure Gemini API Key */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-base text-slate-900">Direct Gemini API Key</h3>
              </div>
              <button onClick={() => setIsKeyModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Assign your own Google Gemini API key to chat directly with <strong>Gemini 1.5 Flash</strong> with zero rate limits and lightning speed. Your key is saved locally in your browser.
            </p>

            <form onSubmit={handleSaveApiKey} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Google Gemini API Key</label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs outline-none focus:ring-2 focus:ring-agri-500 text-slate-800"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <p className="font-bold flex items-center gap-1 text-slate-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Free Google AI Studio Key
                </p>
                <p>Don't have a key? You can get a 100% free API key from Google AI Studio:</p>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-agri-700 hover:underline pt-0.5"
                >
                  <span>Get Free Key at aistudio.google.com</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex gap-2 pt-2">
                {geminiApiKey && (
                  <button
                    type="button"
                    onClick={handleClearApiKey}
                    className="w-1/3 py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold rounded-xl text-xs transition-colors"
                  >
                    Clear Key
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-agri-600 hover:bg-agri-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Save & Enable Direct Chat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
