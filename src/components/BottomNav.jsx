import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Sparkles, Scale, Store, Tractor } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BottomNav = () => {
  const location = useLocation();
  const { t } = useApp();

  const navItems = [
    { label: 'Home', path: '/dashboard', icon: Home },
    { label: 'Forecast', path: '/forecasting', icon: Sparkles },
    { label: 'Decision', path: '/sell-decision', icon: Scale },
    { label: 'Mandis', path: '/markets', icon: Store },
    { label: 'Rentals', path: '/tractors', icon: Tractor }
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={idx}
              to={item.path}
              className={`flex flex-col items-center py-1.5 px-3 rounded-xl transition-all ${
                isActive 
                  ? 'text-agri-700 font-bold bg-agri-50' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-agri-700' : ''}`} />
              <span className="text-[10px] mt-0.5 font-medium">{t(item.label) || item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};
