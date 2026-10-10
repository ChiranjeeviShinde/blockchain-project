import React from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { 
  ShieldCheck, 
  Calendar, 
  MapPin, 
  Send, 
  QrCode, 
  Eye, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  Cpu
} from 'lucide-react';
import { TicketQRCode } from './TicketQRCode';

export const TicketCard = ({ ticket, onShowQR, onTransfer, onViewDetails }) => {
  const { currentAccount } = useBlockchain();

  const isValid = ticket.status === 'VALID';
  const isUsed = ticket.status === 'USED';
  const isTransferred = ticket.status === 'TRANSFERRED';
  const isOwner = currentAccount && currentAccount.address.toLowerCase() === ticket.ownerAddress.toLowerCase();

  return (
    <div className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 holographic-sheen ${
      isValid 
        ? 'bg-gradient-to-br from-[#0c1330] via-[#090e24] to-[#070b1a] border-blue-500/30 hover:border-cyan-400/60 shadow-xl hover:shadow-cyan-950/40' 
        : isUsed
        ? 'bg-[#080c1d] border-rose-500/25 opacity-85 hover:border-rose-400/40'
        : 'bg-[#080c1d] border-amber-500/25 opacity-80'
    }`}>
      {/* Top Artwork with perforated overlay */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={ticket.eventImage}
          alt={ticket.eventTitle}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090e24] via-[#090e24]/40 to-black/30" />

        {/* Top Badges */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between">
          <span className="font-mono text-[11px] font-bold px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-cyan-300 border border-cyan-500/30">
            {ticket.id}
          </span>
          <div className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono flex items-center gap-1 border backdrop-blur-md ${
            isValid
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-400/40 shadow-sm'
              : isUsed
              ? 'bg-rose-950/90 text-rose-300 border-rose-400/40'
              : 'bg-amber-950/90 text-amber-300 border-amber-400/40'
          }`}>
            {isValid && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
            {isUsed && <XCircle className="w-3 h-3 text-rose-400" />}
            {isTransferred && <AlertCircle className="w-3 h-3 text-amber-400" />}
            <span>{ticket.status}</span>
          </div>
        </div>

        {/* Tier label bottom artwork */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs">
          <span className="px-2 py-0.5 rounded bg-blue-950/80 text-blue-200 border border-blue-500/30 text-[11px] font-medium">
            {ticket.tier || 'General Admission'}
          </span>
          <span className="font-mono text-[11px] text-slate-300 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
            ERC-721 NFT
          </span>
        </div>
      </div>

      {/* Ticket Tear Perforation (Dashed Line with Edge Notches) */}
      <div className="relative flex items-center justify-between px-3 -my-1 z-10">
        <div className="w-4 h-4 rounded-full bg-[#050814] -ml-5 border-r border-slate-700/60" />
        <div className="flex-1 border-t-2 border-dashed border-slate-700/80 mx-2" />
        <div className="w-4 h-4 rounded-full bg-[#050814] -mr-5 border-l border-slate-700/60" />
      </div>

      {/* Ticket Details Body */}
      <div className="p-4 space-y-3.5">
        <div>
          <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
            {ticket.eventTitle}
          </h3>
          <div className="space-y-1 mt-2 text-xs text-slate-300">
            <p className="flex items-center gap-1.5 truncate">
              <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{ticket.eventDate} ({ticket.eventTime})</span>
            </p>
            <p className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{ticket.eventVenue}</span>
            </p>
          </div>
        </div>

        {/* Owner & Blockchain Badges */}
        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
          <div className="min-w-0 pr-2">
            <span className="text-slate-400 block text-[9px] uppercase">Owner Wallet</span>
            <span className="text-cyan-300 truncate block font-semibold">
              {ticket.ownerAddress ? `${ticket.ownerAddress.substring(0, 6)}...${ticket.ownerAddress.substring(ticket.ownerAddress.length - 4)}` : 'N/A'}
            </span>
          </div>
          <div className="text-right shrink-0">
            <span className="text-slate-400 block text-[9px] uppercase">Block</span>
            <span className="text-slate-300">#{ticket.blockNumber || 5824900}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-1 grid grid-cols-3 gap-2">
          <button
            onClick={() => onViewDetails(ticket)}
            className="py-2 px-1.5 rounded-lg border border-slate-700/80 bg-slate-900/60 hover:bg-slate-800 text-[11px] font-semibold text-slate-200 hover:text-white transition-colors flex items-center justify-center gap-1"
            title="View Full Ticket Provenance"
          >
            <Eye className="w-3 h-3 text-cyan-400" />
            <span>Details</span>
          </button>

          <button
            onClick={() => onShowQR(ticket)}
            className="py-2 px-1.5 rounded-lg border border-blue-500/40 bg-blue-950/40 hover:bg-blue-900/50 text-[11px] font-semibold text-cyan-300 transition-colors flex items-center justify-center gap-1"
            title="Display QR for Scanner"
          >
            <QrCode className="w-3 h-3 text-cyan-400" />
            <span>Show QR</span>
          </button>

          <button
            onClick={() => onTransfer(ticket)}
            disabled={!isValid || !isOwner}
            className={`py-2 px-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors ${
              isValid && isOwner
                ? 'bg-violet-600/25 hover:bg-violet-600/40 border border-violet-500/40 text-violet-300'
                : 'bg-slate-900/40 border border-slate-800 text-slate-600 cursor-not-allowed'
            }`}
            title={
              !isOwner 
                ? 'Only the current on-chain owner can transfer this ticket' 
                : !isValid 
                ? 'Used tickets cannot be transferred' 
                : 'Transfer ownership to another wallet'
            }
          >
            <Send className="w-3 h-3 text-violet-400" />
            <span>Transfer</span>
          </button>
        </div>
      </div>
    </div>
  );
};
