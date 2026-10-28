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
  Check,
  ExternalLink
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

    if (ticket.status === 'USED') {
      setError('Transfer Rejected: This ticket has already been used and redeemed at gate entry. Used tickets cannot be transferred.');
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
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-violet-400 uppercase font-semibold">
                  ERC-721 OWNERSHIP TRANSFER
                </span>
                {ticket.isOnChain && (
                  <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded">
                    ON-CHAIN
                  </span>
                )}
              </div>
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
                <p className="text-xs text-slate-400">{ticket.eventDate} • {ticket.tier}</p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  ticket.status === 'VALID' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}>
                  {ticket.status}
                </span>
              </div>
            </div>

            {/* Anti-Scalping warning if USED */}
            {ticket.status === 'USED' && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                <span>This ticket has already been used for entry and is permanently non-transferable.</span>
              </div>
            )}

            {/* Recipient Form */}
            <form onSubmit={handleProceedToConfirm} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Recipient Ethereum Wallet Address
                </label>
                <input
                  type="text"
                  placeholder="0x48B273570Fcf6E91A1A866A238B57D0b89a31C04"
                  value={toAddress}
                  disabled={ticket.status === 'USED'}
                  onChange={e => {
                    setToAddress(e.target.value);
                    setError('');
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl font-mono text-xs text-white focus:outline-none focus:border-violet-400 disabled:opacity-50"
                />
              </div>

              {/* Quick Select Demo Recipient */}
              <div>
                <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">
                  Or select demonstration peer:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {demoAccounts
                    .filter(a => a.address.toLowerCase() !== currentAccount?.address.toLowerCase())
                    .slice(0, 2)
                    .map(acc => (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => handleSelectDemoAccount(acc)}
                        className={`p-2 rounded-lg border text-left text-xs transition-colors flex items-center gap-2 ${
                          toAddress.toLowerCase() === acc.address.toLowerCase()
                            ? 'bg-violet-600/30 border-violet-400 text-white'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <img src={acc.avatar} alt={acc.name} className="w-5 h-5 rounded-full object-cover" />
                        <span className="truncate">{acc.name.split(' ')[0]} ({acc.shortAddress})</span>
                      </button>
                    ))}
                </div>
              </div>

              {error && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={ticket.status === 'USED' || !toAddress.trim()}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-violet-600 hover:bg-violet-500 text-white shadow-glow-purple transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Review Transfer Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 2. CONFIRM STAGE */}
        {stage === 'CONFIRM' && (
          <div className="py-4 space-y-4">
            <div className="p-3.5 rounded-xl bg-violet-950/30 border border-violet-500/30 space-y-2.5 text-xs">
              <h4 className="font-bold text-white text-sm">Verify Transfer Intent</h4>
              <p className="text-slate-300 leading-relaxed">
                Smart contract ownership of NFT <code className="text-cyan-300 font-mono">{ticket.id}</code> will be reassigned irrevocably.
              </p>
              <div className="pt-2 border-t border-slate-800 space-y-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Owner:</span>
                  <span className="text-slate-300 truncate max-w-[200px]">{currentAccount?.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">New Owner:</span>
                  <span className="text-emerald-400 truncate max-w-[200px]">{toAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Network:</span>
                  <span className="text-purple-300">{ticket.isOnChain ? 'Ethereum Sepolia Testnet' : 'Simulated'}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStage('INPUT')}
                className="flex-1 py-2.5 px-3 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-xs font-semibold text-slate-300"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleExecuteTransfer}
                className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-glow-purple flex items-center justify-center gap-1.5"
              >
                <span>Execute Transfer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 3. PROCESSING STAGE */}
        {stage === 'PROCESSING' && (
          <div className="py-10 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full border-4 border-violet-500/20 border-t-violet-400 animate-spin flex items-center justify-center" />
            <div>
              <h4 className="text-base font-bold text-white">Broadcasting Transfer Transaction...</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                {ticket.isOnChain 
                  ? 'Please confirm the transfer in MetaMask. Ethers.js is awaiting Sepolia block confirmation.' 
                  : 'Updating ERC-721 token ownership registry and generating transfer receipt.'}
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
                Ticket ownership successfully reassigned on the blockchain.
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
              {txDetails?.txHash && (
                <div className="flex justify-between pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Transaction Hash</span>
                  {txDetails.isOnChain && txDetails.txHash.startsWith('0x') ? (
                    <a
                      href={`https://sepolia.etherscan.io/tx/${txDetails.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-cyan-300 hover:underline flex items-center gap-1 text-[11px] truncate max-w-[200px]"
                    >
                      <span className="truncate">{txDetails.txHash}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  ) : (
                    <span className="font-mono text-purple-300 truncate max-w-[200px] text-[11px]">
                      {txDetails.txHash}
                    </span>
                  )}
                </div>
              )}
            </div>

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
