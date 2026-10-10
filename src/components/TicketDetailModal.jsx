import React, { useState } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { TicketQRCode } from './TicketQRCode';
import { 
  X, 
  ShieldCheck, 
  Calendar, 
  MapPin, 
  Layers, 
  ExternalLink, 
  Send, 
  CheckCircle2, 
  History, 
  ArrowUpRight,
  Copy,
  Check,
  CheckSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TicketDetailModal = () => {
  const { 
    detailModalTicket, 
    setDetailModalTicket, 
    setTransferModalTicket,
    currentAccount,
    events
  } = useBlockchain();

  const navigate = useNavigate();
  const [copiedField, setCopiedField] = useState('');

  if (!detailModalTicket) return null;
  const ticket = detailModalTicket;
  const event = events.find(e => e.id === ticket.eventId);

  const isOwner = currentAccount && currentAccount.address.toLowerCase() === ticket.ownerAddress.toLowerCase();
  const isValid = ticket.status === 'VALID';
  const isUsed = ticket.status === 'USED';

  const copyText = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const handleOpenTransfer = () => {
    setDetailModalTicket(null);
    setTransferModalTicket(ticket);
  };

  const handleVerifyRedirect = () => {
    setDetailModalTicket(null);
    navigate(`/verify?ticketId=${ticket.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-[#0a0f26] border border-blue-500/40 rounded-2xl shadow-2xl shadow-blue-950/80 overflow-hidden my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Glow Header */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* Modal Top Bar */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-cyan-400 bg-cyan-950/70 px-3 py-1 rounded-lg border border-cyan-500/30">
              {ticket.id}
            </span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
              isValid 
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50' 
                : isUsed 
                ? 'bg-rose-950/80 text-rose-300 border-rose-500/50' 
                : 'bg-amber-950/80 text-amber-300 border-amber-500/50'
            }`}>
              ● {ticket.status}
            </span>
          </div>
          <button
            onClick={() => setDetailModalTicket(null)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Header Banner & Title */}
          <div className="relative rounded-xl overflow-hidden border border-slate-800 h-44 group">
            <img
              src={ticket.eventImage}
              alt={ticket.eventTitle}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f26] via-[#0a0f26]/60 to-transparent p-4 flex flex-col justify-end">
              <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-semibold">
                {ticket.eventCategory} • {ticket.tier}
              </span>
              <h2 className="text-xl font-bold text-white tracking-wide mt-0.5">{ticket.eventTitle}</h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-2">
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-cyan-400" /> {ticket.eventDate} ({ticket.eventTime})</span>
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-cyan-400" /> {ticket.eventVenue}</span>
              </div>
            </div>
          </div>

          {/* QR Code and Primary Blockchain Data Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <TicketQRCode ticket={ticket} size={150} showDetails={true} />
              <p className="text-[11px] text-slate-400 text-center mt-2">
                Present this QR code at entry scanner
              </p>
            </div>

            <div className="md:col-span-2 space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Current Token Owner</span>
                  <div className="flex items-center gap-1.5 font-mono text-cyan-300">
                    <span className="truncate max-w-[200px]">{ticket.ownerAddress}</span>
                    <button
                      onClick={() => copyText(ticket.ownerAddress, 'owner')}
                      className="p-1 hover:text-white"
                      title="Copy Address"
                    >
                      {copiedField === 'owner' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Contract Standard</span>
                  <span className="font-mono text-slate-200">ERC-721 Non-Fungible Token</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Network</span>
                  <span className="font-mono text-purple-300">Sepolia EVM Testnet (Simulated)</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Minted At</span>
                  <span className="font-mono text-slate-300">{ticket.formattedMintedAt}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Mint Block Number</span>
                  <span className="font-mono text-slate-300">#{ticket.blockNumber}</span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Transaction Hash</span>
                  <div className="flex items-center gap-1 font-mono text-purple-300">
                    <span className="truncate max-w-[180px]">{ticket.txHash}</span>
                    <button
                      onClick={() => copyText(ticket.txHash, 'tx')}
                      className="p-1 hover:text-white"
                      title="Copy Tx Hash"
                    >
                      {copiedField === 'tx' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Note */}
              {isUsed && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2">
                  <CheckSquare className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Entry Redeemed</span>
                    <p className="text-[11px] text-rose-300 mt-0.5">
                      Used on: {ticket.usedAt || 'Recently'} by {ticket.usedByVerifier || 'Gate Scanner'}. Duplicate admission will be denied.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* On-Chain Provenance / Transfer History */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                On-Chain Provenance & Ownership Chain
              </h4>
            </div>

            <div className="border border-slate-800 rounded-xl bg-slate-950/60 p-4 space-y-3">
              {ticket.transferHistory && ticket.transferHistory.length > 0 ? (
                ticket.transferHistory.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 relative pb-3 border-b border-slate-900 last:border-0 last:pb-0">
                    <div className="w-6 h-6 rounded-full bg-blue-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-mono">
                      {idx + 1}
                    </div>
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white tracking-wide">
                          {item.type === 'MINT' ? 'Token Minted (0x0 → Owner)' : 'Ownership Transferred'}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">{item.date}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1 text-[11px] font-mono text-slate-400">
                        <div>From: <span className="text-slate-300">{item.from.substring(0, 10)}...</span></div>
                        <div>To: <span className="text-cyan-300">{item.to.substring(0, 10)}...</span></div>
                      </div>
                      <p className="text-[10px] font-mono text-slate-500 mt-1 truncate">
                        Tx: {item.txHash}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">Initial mint record recorded in genesis block.</p>
              )}
            </div>
          </div>

          {/* Actions Bottom Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
            <button
              onClick={handleVerifyRedirect}
              className="py-2.5 px-4 rounded-xl border border-blue-500/40 bg-blue-950/30 hover:bg-blue-900/40 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Test In Gate Scanner</span>
            </button>

            {isOwner && isValid && (
              <button
                onClick={handleOpenTransfer}
                className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-glow-violet transition-all flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transfer Ticket to Peer</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
