import React, { useState } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { 
  X, 
  Send, 
  ArrowRight, 
  ShieldAlert, 
  CheckCircle2, 
  Loader2, 
  UserCheck, 
  AlertTriangle,
  Layers,
  Copy,
  Check
} from 'lucide-react';

export const TransferModal = () => {
  const { 
    transferModalTicket, 
    setTransferModalTicket, 
    currentAccount, 
    transferTicket,
    demoAccounts
  } = useBlockchain();

  const [toAddress, setToAddress] = useState('');
  const [stage, setStage] = useState('INPUT'); // 'INPUT' | 'CONFIRM' | 'PROCESSING' | 'SUCCESS'
  const [error, setError] = useState('');
  const [txDetails, setTxDetails] = useState(null);

  if (!transferModalTicket) return null;
  const ticket = transferModalTicket;

  const handleSelectDemoAccount = (acc) => {
    setToAddress(acc.address);
    setError('');
  };

  const handleProceedToConfirm = (e) => {
    e.preventDefault();
    setError('');
    const clean = toAddress.trim();

    if (!clean) {
      setError('Please provide a recipient wallet address.');
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(clean)) {
      setError('Invalid Ethereum address. Must begin with 0x followed by exactly 40 hex characters.');
      return;
    }

    if (currentAccount && clean.toLowerCase() === currentAccount.address.toLowerCase()) {
      setError('Cannot transfer ticket to your own connected address.');
      return;
    }

    setStage('CONFIRM');
  };

  const handleExecuteTransfer = async () => {
    try {
      setStage('PROCESSING');
      await new Promise(r => setTimeout(r, 1800)); // simulate blockchain latency

      const result = await transferTicket({
        ticketId: ticket.id,
        toAddress: toAddress.trim()
      });

      setTxDetails(result);
      setStage('SUCCESS');
    } catch (err) {
      setError(err.message || 'Transfer failed');
      setStage('INPUT');
    }
  };

  const handleClose = () => {
    setTransferModalTicket(null);
    setStage('INPUT');
    setToAddress('');
    setError('');
    setTxDetails(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-[#0c122c] border border-violet-500/40 rounded-2xl p-6 shadow-2xl shadow-violet-950/70 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/15 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-600/30 text-violet-400 border border-violet-500/40 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-violet-400 uppercase font-semibold">
                ERC-721 OWNERSHIP TRANSFER
              </span>
              <h3 className="text-base font-bold text-white">Transfer Digital Ticket</h3>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. INPUT FORM STAGE */}
        {stage === 'INPUT' && (
          <div className="py-4 space-y-4">
            {/* Ticket Info Card */}
            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center gap-3">
              <img
                src={ticket.eventImage}
                alt={ticket.eventTitle}
                className="w-14 h-14 rounded-lg object-cover border border-slate-700"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-mono text-cyan-300 font-semibold">{ticket.id}</span>
                <h4 className="text-sm font-bold text-white truncate">{ticket.eventTitle}</h4>
                <p className="text-xs text-slate-400">{ticket.tier} • {ticket.eventDate}</p>
              </div>
            </div>

            {/* Current Owner Info */}
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/90 text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Current Owner (You)</span>
              <p className="font-mono text-slate-200 truncate mt-0.5">{ticket.ownerAddress}</p>
            </div>

            {/* Recipient Address Input */}
            <form onSubmit={handleProceedToConfirm} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                  Recipient Wallet Address (0x...)
                </label>
                <input
                  type="text"
                  placeholder="0x48B273570Fcf6E91A1A866A238B57D0b89a31C04"
                  value={toAddress}
                  onChange={(e) => {
                    setToAddress(e.target.value);
                    setError('');
                  }}
                  className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400"
                />
                {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
              </div>

              {/* Quick Select Demo Wallets */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block mb-1.5">
                  Quick Select Demo Peer Wallets
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {demoAccounts
                    .filter(a => a.address.toLowerCase() !== ticket.ownerAddress.toLowerCase())
                    .map(acc => (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => handleSelectDemoAccount(acc)}
                        className={`p-2 rounded-lg border text-left text-xs transition-colors ${
                          toAddress.toLowerCase() === acc.address.toLowerCase()
                            ? 'bg-violet-600/20 border-violet-400 text-white'
                            : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/80 text-slate-300'
                        }`}
                      >
                        <p className="font-semibold truncate">{acc.name}</p>
                        <p className="font-mono text-[10px] text-slate-400 truncate">{acc.shortAddress}</p>
                      </button>
                    ))}
                </div>
              </div>

              {/* Warning Notice */}
              <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-200/90 text-[11px] leading-relaxed flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Every transfer updates the ticket's ownership record. Once transferred, you will no longer be able to use or present this ticket for venue entry.
                </span>
              </div>

              {/* Proceed Button */}
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-glow-violet transition-all flex items-center justify-center gap-2"
              >
                <span>Review & Confirm Transfer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* 2. CONFIRMATION STAGE */}
        {stage === 'CONFIRM' && (
          <div className="py-4 space-y-4">
            <div className="text-center">
              <h4 className="text-base font-bold text-white">Confirm Ownership Transfer</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Please verify the transaction details before signing.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <span className="text-slate-400">Ticket ID</span>
                <span className="font-mono text-cyan-300 font-bold">{ticket.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Event</span>
                <span className="font-semibold text-white truncate max-w-[220px]">{ticket.eventTitle}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Current Owner</span>
                <span className="font-mono text-slate-300">{ticket.ownerAddress.substring(0, 6)}...{ticket.ownerAddress.substring(38)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">New Recipient</span>
                <span className="font-mono text-emerald-400 font-bold">{toAddress.substring(0, 6)}...{toAddress.substring(38)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span className="text-slate-400">Gas Fee Estimate</span>
                <span className="font-mono text-purple-300">0.00085 ETH (Simulated)</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-500/30 text-blue-200 text-xs italic text-center">
              "Every transfer updates the ticket's ownership record."
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStage('INPUT')}
                className="py-2.5 px-3 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors"
              >
                Back / Edit
              </button>
              <button
                type="button"
                onClick={handleExecuteTransfer}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-xs font-bold text-white shadow-glow-violet transition-all flex items-center justify-center gap-1.5"
              >
                <span>Authorize Transfer</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* 3. PROCESSING STAGE */}
        {stage === 'PROCESSING' && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full border-4 border-violet-500/20 border-t-violet-400 animate-spin flex items-center justify-center shadow-glow-violet" />
            <div>
              <h4 className="text-base font-bold text-white">Broadcasting Transfer to Sepolia...</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                Updating ERC-721 token ownership registry and generating cryptographic transfer receipt.
              </p>
            </div>
          </div>
        )}

        {/* 4. SUCCESS STAGE */}
        {stage === 'SUCCESS' && (
          <div className="py-4 space-y-4 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h4 className="text-base font-bold text-white">Transfer Completed!</h4>
              <p className="text-xs text-emerald-300 mt-0.5">
                Ticket ownership successfully reassigned to new address.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Transferred Ticket</span>
                <span className="font-mono text-cyan-300 font-bold">{ticket.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">New On-Chain Owner</span>
                <span className="font-mono text-emerald-400 truncate max-w-[220px]">{toAddress}</span>
              </div>
              {txDetails && (
                <div className="flex justify-between pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Transaction Hash</span>
                  <span className="font-mono text-purple-300 truncate max-w-[200px]">{txDetails.txHash}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-400 italic">
              "Every transfer updates the ticket's ownership record."
            </p>

            <button
              onClick={handleClose}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
            >
              Done & Return to My Tickets
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
