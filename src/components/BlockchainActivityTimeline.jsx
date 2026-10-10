import React, { useState } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { 
  Layers, 
  Send, 
  CheckCircle2, 
  PlusCircle, 
  Ticket, 
  Copy, 
  Check, 
  ExternalLink,
  ShieldCheck,
  Cpu
} from 'lucide-react';

export const BlockchainActivityTimeline = ({ limit = null, showFilter = true }) => {
  const { transactions } = useBlockchain();
  const [filterType, setFilterType] = useState('ALL');
  const [copiedHash, setCopiedHash] = useState(null);

  const copyHash = (hash) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filterType === 'ALL') return true;
    return tx.actionType === filterType;
  });

  const displayList = limit ? filteredTransactions.slice(0, limit) : filteredTransactions;

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case 'PURCHASE':
        return <Ticket className="w-4 h-4 text-cyan-400" />;
      case 'TRANSFER':
        return <Send className="w-4 h-4 text-violet-400" />;
      case 'VERIFY':
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      case 'DEPLOY':
        return <PlusCircle className="w-4 h-4 text-amber-400" />;
      default:
        return <Layers className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Optional Filter Pills */}
      {showFilter && (
        <div className="flex flex-wrap items-center gap-2 pb-2">
          {['ALL', 'PURCHASE', 'TRANSFER', 'VERIFY', 'DEPLOY'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filterType === type
                  ? 'bg-blue-600/30 text-cyan-300 border border-cyan-400/50 shadow-sm'
                  : 'bg-slate-900/50 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {type === 'ALL' ? 'All On-Chain Events' : type}
            </button>
          ))}
        </div>
      )}

      {/* Connected Nodes Timeline */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500/60 before:via-blue-500/40 before:to-purple-500/20">
        {displayList.map((tx, idx) => (
          <div key={tx.id || idx} className="relative group">
            {/* Timeline node circle */}
            <div className="absolute -left-6 top-1 w-6 h-6 rounded-full bg-[#070c22] border-2 border-cyan-400 shadow-glow-cyan/40 flex items-center justify-center -translate-x-1/2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping opacity-75" />
            </div>

            {/* Content card */}
            <div className="glass-panel rounded-xl p-4 transition-all hover:border-cyan-500/40 hover:bg-slate-900/70">
              <div className="flex flex-wrap items-start justify-between gap-2 pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
                    {getActionIcon(tx.actionType)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white tracking-wide">{tx.action}</h4>
                    <p className="text-xs text-slate-400 font-medium">
                      {tx.entityName} <span className="font-mono text-cyan-300">({tx.entityId})</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-right">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 font-semibold">
                    ● {tx.status}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{tx.timestamp}</span>
                </div>
              </div>

              {/* Transaction details row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 pt-1 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Wallet Address</span>
                  <span className="text-slate-300 truncate block font-medium" title={tx.walletAddress}>
                    {tx.shortAddress || tx.walletAddress}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Block Number</span>
                  <span className="text-slate-300">#{tx.blockNumber}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Tx Hash</span>
                  <div className="flex items-center gap-1.5 text-purple-300">
                    <span className="truncate">{tx.shortTxHash || tx.txHash?.substring(0, 10)}</span>
                    <button
                      onClick={() => copyHash(tx.txHash)}
                      className="p-0.5 hover:text-white transition-colors"
                      title="Copy Tx Hash"
                    >
                      {copiedHash === tx.txHash ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {displayList.length === 0 && (
          <div className="p-8 text-center glass-panel rounded-xl text-slate-400 text-xs">
            No on-chain activity found for the selected filter.
          </div>
        )}
      </div>
    </div>
  );
};
