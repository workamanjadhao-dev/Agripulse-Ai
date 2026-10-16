import React, { useState } from 'react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import { Bot, X, Send, Sparkles, User, RefreshCw, Key, ArrowRight } from 'lucide-react';

export const AIChatWidget = () => {
  const { isAiAssistantOpen, setIsAiAssistantOpen, t, language, role, showToast } = useApp();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isKeyInputOpen, setIsKeyInputOpen] = useState(false);
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('agri_gemini_api_key') || '');

  const greetingText = language === 'hi' 
    ? 'नमस्ते! मैं एग्रीपल्स एआई हूं, आपका कृषि मूल्य और आपूर्ति श्रृंखला सहायक। मैं आज आपकी कैसे सहायता कर सकता हूं?'
    : language === 'mr'
    ? 'नमस्कार! मी अ‍ॅग्रीपल्स एआय आहे, आपला शेती भाव आणि पुरवठा साखळी सहाय्यक. मी आज आपली काय मदत करू शकतो?'
    : 'Namaste! I am AgriPulse AI, your grounded agricultural supply chain & price intelligence assistant. How can I help your farm today?';

  const defaultSuggestions = language === 'hi'
    ? ['क्या मुझे कपास अभी बेचना चाहिए?', 'सोयाबीन का वर्तमान मंडी भाव क्या है?', '5 एकड़ के लिए कौन सा ट्रैक्टर उपयुक्त है?']
    : language === 'mr'
    ? ['मी कापूस आत्ता विकावा का?', 'सोयाबीनचा सध्याचा बाजार भाव काय आहे?', '५ एकरांसाठी कोणता ट्रॅक्टर योग्य आहे?']
    : ['Should I sell my cotton now?', 'What is today\'s soybean price in APMC?', 'Which tractor is suitable for 5 acres?'];

  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: greetingText,
      suggestions: defaultSuggestions
    }
  ]);

  if (!isAiAssistantOpen) return null;

  const handleSaveKey = (e) => {
    e.preventDefault();
    if (geminiKey.trim()) {
      localStorage.setItem('agri_gemini_api_key', geminiKey.trim());
      showToast('Gemini API Key assigned!', 'success');
    } else {
      localStorage.removeItem('agri_gemini_api_key');
      showToast('Gemini Key removed, using default engine.', 'info');
    }
    setIsKeyInputOpen(false);
  };

  const callDirectGemini = async (query) => {
    const key = localStorage.getItem('agri_gemini_api_key');
    if (!key) return null;
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${key}`;
      const systemInstruction = `You are AgriPulse AI, an expert agricultural advisor and companion for Indian farmers, traders, and agri-entrepreneurs.
Provide practical advice on crops, APMC mandi rates, tractor & vehicle bookings, storage, fertilizers, and government schemes. Keep responses concise and formatted with bold points. Language: ${language}.`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: `${systemInstruction}\n\nUser Question:\n${query}` }] }]
        })
      });

      if (!response.ok) return null;
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return { reply: text.trim(), source: 'Google Gemini 1.5 Flash (Direct Key)' };
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg = { sender: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      let directRes = await callDirectGemini(query);
      if (directRes && directRes.reply) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: directRes.reply,
            source: directRes.source,
            suggestions: ['15-Day Price Forecast', 'Compare Mandis', 'Find Storage Space']
          }
        ]);
        return;
      }

      const res = await api.sendAiChat(query, role, language);
      if (res && res.reply) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: res.reply,
            source: res.source || 'AgriPulse Grounded AI',
            suggestions: ['15-Day Price Forecast', 'Compare Mandis', 'Find Storage Space']
          }
        ]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `🤖 **AgriPulse Advisory**: For ${query}, real-time APMC mandi modal rates, tractor fleets, and storage facilities are active across Maharashtra and India. Open the AI Assistant page for full interactive telemetry.`,
          source: 'AgriPulse Grounded Knowledge Engine'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[520px] animate-in slide-in-from-bottom-5 duration-300">
      {/* Assistant Header */}
      <div className="bg-gradient-to-r from-agri-800 via-agri-700 to-teal-700 text-white p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-2xl backdrop-blur-xs">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-extrabold text-base flex items-center gap-1.5">
              {t('assistantTitle')} <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            </h3>
            <p className="text-[11px] text-agri-100 font-medium">Grounded in Live Agmarknet Records</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsKeyInputOpen(!isKeyInputOpen)}
            className="p-1.5 hover:bg-white/20 rounded-xl transition-colors text-white"
            title="Configure Gemini API Key"
          >
            <Key className="w-4 h-4 text-amber-300" />
          </button>
          <button 
            onClick={() => setIsAiAssistantOpen(false)}
            className="p-1.5 hover:bg-white/20 rounded-xl transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Optional Gemini Key Input Drawer */}
      {isKeyInputOpen && (
        <form onSubmit={handleSaveKey} className="bg-amber-50 p-3 border-b border-amber-200 flex items-center gap-2 text-xs">
          <Key className="w-4 h-4 text-amber-700 shrink-0" />
          <input
            type="password"
            placeholder="Assign Gemini API Key (AIzaSy...)"
            value={geminiKey}
            onChange={(e) => setGeminiKey(e.target.value)}
            className="flex-1 py-1.5 px-2 bg-white rounded-lg border border-amber-300 text-xs font-mono outline-none"
          />
          <button type="submit" className="px-3 py-1.5 bg-amber-700 text-white rounded-lg font-bold text-[11px]">
            Save
          </button>
        </form>
      )}

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 text-xs">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-2`}>
            <div className={`flex items-start gap-2 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 font-bold ${
                msg.sender === 'user' ? 'bg-slate-800' : 'bg-agri-600'
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`p-3 rounded-2xl leading-relaxed ${
                msg.sender === 'user' 
                  ? 'bg-agri-600 text-white font-medium shadow-xs' 
                  : 'bg-white border border-slate-200 text-slate-800 shadow-xs'
              }`}>
                <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                {msg.source && (
                  <span className="text-[10px] text-slate-400 block mt-1.5 border-t border-slate-100 pt-1">
                    Grounded: <strong>{msg.source}</strong>
                  </span>
                )}
              </div>
            </div>

            {msg.suggestions && (
              <div className="flex flex-wrap gap-1.5 pl-9">
                {msg.suggestions.map((sug, sIdx) => (
                  <button
                    key={sIdx}
                    onClick={() => handleSend(sug)}
                    className="text-[10px] font-semibold text-agri-800 bg-white border border-agri-200 hover:bg-agri-50 px-2.5 py-1 rounded-full shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>{sug}</span>
                    <ArrowRight className="w-2.5 h-2.5 text-agri-600" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 w-fit text-slate-500 text-xs shadow-xs">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-agri-600" />
            <span>Consulting Agricultural Intelligence...</span>
          </div>
        )}
      </div>

      {/* Input Field */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        <input 
          type="text" 
          value={input}
          disabled={isLoading}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('askAssistantPlaceholder')}
          className="flex-1 text-xs py-2.5 px-3 bg-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-agri-500 font-medium text-slate-800"
        />
        <button 
          type="submit"
          disabled={isLoading || !input.trim()}
          className="p-2.5 bg-agri-600 hover:bg-agri-700 disabled:opacity-50 text-white rounded-xl shadow-md transition-all cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
