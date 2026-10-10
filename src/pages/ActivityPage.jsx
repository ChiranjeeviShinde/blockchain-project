import React from 'react';
import { DemoBadge } from '../components/DemoBadge';
import { BlockchainActivityTimeline } from '../components/BlockchainActivityTimeline';
import { useBlockchain } from '../context/BlockchainContext';
import { Activity, Layers, Cpu, ShieldCheck, RefreshCw } from 'lucide-react';

export const ActivityPage = () => {
  const { transactions, resetDemoData } = useBlockchain();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <DemoBadge text="ON-CHAIN EVM TRANSACTION EXPLORER • SEPOLIA TESTNET" />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Blockchain Activity Explorer
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Live cryptographic ledger tracking ERC-721 token mints, ownership transfers, event contract deployments, and turnstile admissions.
          </p>
        </div>

        <button
          onClick={resetDemoData}
          className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Ledger</span>
        </button>
      </div>

      {/* Explorer Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl glass-panel border border-white/[0.08]">
        <div>
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Total Ledger Entries</span>
          <p className="text-xl font-black text-white mt-0.5">{transactions.length}</p>
        </div>
        <div>
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Latest Block Height</span>
          <p className="text-xl font-black text-cyan-400 mt-0.5">#5,827,042</p>
        </div>
        <div>
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Consensus Status</span>
          <p className="text-xl font-black text-emerald-400 mt-0.5">100% Finalized</p>
        </div>
        <div>
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Average Gas Price</span>
          <p className="text-xl font-black text-purple-300 mt-0.5">18.4 Gwei</p>
        </div>
      </div>

      {/* Timeline Component */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/[0.08] space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            Transaction Timeline
          </h3>
          <span className="text-xs font-mono text-slate-400">
            Chronological Sequence
          </span>
        </div>

        <BlockchainActivityTimeline showFilter={true} />
      </div>
    </div>
  );
};
