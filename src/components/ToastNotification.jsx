import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  Sparkles
} from 'lucide-react';

const TOAST_CONFIG = {
  success: {
    icon: CheckCircle2,
    defaultTitle: 'Success',
    badgeText: 'Updated',
    borderColor: 'border-emerald-200',
    iconBg: 'bg-emerald-100 text-emerald-700',
    barColor: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    titleColor: 'text-emerald-950',
    glowColor: 'shadow-emerald-500/10'
  },
  error: {
    icon: AlertCircle,
    defaultTitle: 'Error Notice',
    badgeText: 'Alert',
    borderColor: 'border-rose-200',
    iconBg: 'bg-rose-100 text-rose-700',
    barColor: 'bg-gradient-to-r from-rose-500 to-red-500',
    titleColor: 'text-rose-950',
    glowColor: 'shadow-rose-500/10'
  },
  warning: {
    icon: AlertTriangle,
    defaultTitle: 'Warning',
    badgeText: 'Attention',
    borderColor: 'border-amber-200',
    iconBg: 'bg-amber-100 text-amber-700',
    barColor: 'bg-gradient-to-r from-amber-500 to-orange-500',
    titleColor: 'text-amber-950',
    glowColor: 'shadow-amber-500/10'
  },
  info: {
    icon: Info,
    defaultTitle: 'Information',
    badgeText: 'Notice',
    borderColor: 'border-sky-200',
    iconBg: 'bg-sky-100 text-sky-700',
    barColor: 'bg-gradient-to-r from-sky-500 to-blue-500',
    titleColor: 'text-sky-950',
    glowColor: 'shadow-sky-500/10'
  }
};

const ToastItem = ({ toast, onDismiss }) => {
  const [progress, setProgress] = useState(100);
  const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;
  const Icon = config.icon;

  // Countdown timer bar for progress visualization
  useEffect(() => {
    const duration = 4500;
    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className={`
        pointer-events-auto relative w-full overflow-hidden rounded-2xl border bg-white/95 backdrop-blur-md
        p-3.5 sm:p-4 shadow-xl ${config.glowColor} ${config.borderColor}
        transition-all duration-300 animate-in slide-in-from-top-3 fade-in
        hover:shadow-2xl
      `}
    >
      <div className="flex items-start gap-3">
        {/* Visual Icon Badge */}
        <div className={`p-2 rounded-xl shrink-0 ${config.iconBg} shadow-2xs`}>
          <Icon className="w-4 h-4" />
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-xs font-black tracking-tight ${config.titleColor}`}>
              {toast.title || config.defaultTitle}
            </span>
            <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-500 border border-slate-200">
              {config.badgeText}
            </span>
          </div>
          <p className="text-xs font-medium text-slate-700 leading-snug break-words">
            {toast.message}
          </p>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={() => onDismiss(toast.id)}
          className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1 rounded-lg transition-colors cursor-pointer shrink-0"
          title="Dismiss notification"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Auto-Dismiss Progress Countdown Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100">
        <div
          className={`h-full transition-all duration-75 ease-linear ${config.barColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export const ToastNotification = () => {
  const { toasts, removeToast } = useApp();

  if (!toasts || !toasts.length) return null;

  return (
    <aside
      aria-label="Notifications"
      className="fixed top-4 sm:top-6 right-4 sm:right-6 z-[9999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-[calc(100vw-2rem)] sm:w-auto pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={removeToast || (() => {})}
        />
      ))}
    </aside>
  );
};
