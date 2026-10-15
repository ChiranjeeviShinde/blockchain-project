import React, { useState } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { TicketCard } from '../components/TicketCard';
import { DemoBadge } from '../components/DemoBadge';
import { Link } from 'react-router-dom';
import { 
  Ticket, 
  Wallet, 
  QrCode, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Filter, 
  Layers, 
  PlusCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const MyTicketsPage = () => {
  const { 
    tickets, 
    currentAccount, 
    setIsWalletModalOpen,
    setTransferModalTicket,
    setDetailModalTicket
  } = useBlockchain();

  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, VALID, USED, TRANSFERRED

  // Tickets owned by connected wallet
  const myTickets = currentAccount 
    ? tickets.filter(t => t.ownerAddress.toLowerCase() === currentAccount.address.toLowerCase())
    : [];

  const filteredTickets = myTickets.filter(t => {
    if (statusFilter === 'ALL') return true;
    return t.status === statusFilter;
  });

  const validCount = myTickets.filter(t => t.status === 'VALID').length;
  const usedCount = myTickets.filter(t => t.status === 'USED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <DemoBadge text="ERC-721 DIGITAL ASSET WALLET • SEPOLIA TESTNET" />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            My Digital Tickets
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Cryptographic event passes issued to your wallet. Present QR codes at entrance turnstiles or transfer custody to friends.
          </p>
        </div>

        {/* Connected account summary & quick switcher */}
        {currentAccount && (
          <div className="p-3 rounded-2xl glass-panel border border-cyan-500/30 flex items-center gap-3">
            <img
              src={currentAccount.avatar}
              alt={currentAccount.name}
              className="w-10 h-10 rounded-full object-cover border border-cyan-400"
            />
            <div className="text-xs">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Active Wallet</span>
              <p className="font-bold text-white font-mono">{currentAccount.shortAddress}</p>
              <p className="text-[11px] text-cyan-300 font-medium">{currentAccount.shortName}</p>
            </div>
          </div>
        )}
      </div>

      {/* Wallet Not Connected State */}
      {!currentAccount && (
        <div className="glass-panel rounded-2xl p-12 text-center space-y-5 border border-blue-500/30">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-600/20 text-cyan-400 border border-blue-500/30 flex items-center justify-center shadow-glow-cyan/20">
            <Wallet className="w-8 h-8" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-xl font-bold text-white">Connect Wallet to Access Tickets</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your digital passes are stored on-chain associated with your cryptographic address. Connect your demo wallet to load your passes.
            </p>
          </div>
          <button
            onClick={() => setIsWalletModalOpen(true)}
            className="py-3 px-6 rounded-xl font-bold text-xs bg-gradient-to-r from-brand-blue to-brand-cyan hover:from-blue-600 hover:to-cyan-400 text-white shadow-glow-blue transition-all"
          >
            Connect Demo Wallet
          </button>
        </div>
      )}

      {/* Main Content when wallet connected */}
      {currentAccount && (
        <div className="space-y-6">
          
          {/* Filter Bar & Quick Switcher for Viva Demo */}
          <div className="glass-panel rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 border border-white/[0.08]">
            {/* Status Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono uppercase text-slate-400 mr-2 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-cyan-400" /> Filter:
              </span>
              {[
                { id: 'ALL', label: `All Tickets (${myTickets.length})` },
                { id: 'VALID', label: `Valid Passes (${validCount})` },
                { id: 'USED', label: `Redeemed / Used (${usedCount})` },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    statusFilter === f.id
                      ? 'bg-blue-600/30 text-cyan-300 border border-cyan-400/50 shadow-sm'
                      : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Account Switcher Pills for Instant Transfer Verification
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">Switch Wallet View:</span>
              {demoAccounts.map(acc => (
                <button
                  key={acc.id}
                  onClick={() => switchAccount(acc.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                    currentAccount.id === acc.id
                      ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-400/50'
                      : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                  title={`Switch to ${acc.name}`}
                >
                  {acc.shortName}
                </button>
              ))}
            </div> */}
          </div>

          {/* Tickets Grid */}
          {filteredTickets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTickets.map(ticket => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onViewDetails={(t) => setDetailModalTicket(t)}
                  onShowQR={(t) => setDetailModalTicket(t)}
                  onTransfer={(t) => setTransferModalTicket(t)}
                />
              ))}
            </div>
          ) : (
            /* Attractive Empty State */
            <div className="glass-panel rounded-2xl p-12 text-center space-y-5 border border-white/[0.08]">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-900 border border-slate-800 text-cyan-400 flex items-center justify-center">
                <Ticket className="w-8 h-8 -rotate-12" />
              </div>
              <div className="space-y-1.5 max-w-sm mx-auto">
                <h3 className="text-lg font-bold text-white">No Tickets in this Wallet</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {statusFilter !== 'ALL'
                    ? `No tickets currently match the "${statusFilter}" status filter.`
                    : `Your connected wallet (${currentAccount.shortAddress}) does not hold any event passes yet.`}
                </p>
              </div>
              <div className="pt-2">
                <Link
                  to="/events"
                  className="inline-flex items-center gap-2 py-3 px-6 rounded-xl text-xs font-bold bg-gradient-to-r from-brand-blue to-brand-cyan hover:from-blue-600 hover:to-cyan-400 text-white shadow-glow-blue transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Explore Events & Mint Passes</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
