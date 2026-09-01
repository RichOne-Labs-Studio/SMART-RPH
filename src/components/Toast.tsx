import React from 'react';
import { ToastMessage } from '../types';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        let bg = 'bg-slate-900 text-white';
        let Icon = Info;

        if (t.type === 'ok') {
          bg = 'bg-emerald-700 text-white shadow-emerald-900/20';
          Icon = CheckCircle2;
        } else if (t.type === 'err') {
          bg = 'bg-rose-700 text-white shadow-rose-900/20';
          Icon = AlertCircle;
        } else if (t.type === 'warn') {
          bg = 'bg-amber-600 text-white shadow-amber-900/20';
          Icon = AlertTriangle;
        }

        return (
          <div
            key={t.id}
            className={`pointer-events-auto p-3.5 rounded-2xl shadow-xl border border-white/10 flex items-center justify-between gap-3 text-xs font-semibold animate-in slide-in-from-bottom-5 duration-300 ${bg}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{t.text}</span>
            </div>
            <button
              onClick={() => onDismiss(t.id)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
