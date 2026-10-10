import React from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export const Toast = () => {
  const { toast } = useBlockchain();

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full transition-all animate-bounce-short">
      <div className={`p-4 rounded-xl border backdrop-blur-xl shadow-2xl flex items-start gap-3 ${
        isSuccess
          ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-100'
          : isError
          ? 'bg-rose-950/80 border-rose-500/40 text-rose-100'
          : 'bg-blue-950/80 border-blue-500/40 text-blue-100'
      }`}>
        <div className="shrink-0 mt-0.5">
          {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          {isError && <AlertTriangle className="w-5 h-5 text-rose-400" />}
          {!isSuccess && !isError && <Info className="w-5 h-5 text-cyan-400" />}
        </div>
        <div className="flex-1 pr-2">
          <h4 className="text-sm font-semibold tracking-wide">{toast.title}</h4>
          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
        </div>
      </div>
    </div>
  );
};
