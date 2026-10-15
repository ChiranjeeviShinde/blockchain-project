import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBlockchain } from '../context/BlockchainContext';
import { EventCard } from '../components/EventCard';
import { DemoBadge } from '../components/DemoBadge';
import { TicketQRCode } from '../components/TicketQRCode';
import { BlockchainActivityTimeline } from '../components/BlockchainActivityTimeline';
import { 
  ShieldCheck, 
  Ticket, 
  ArrowRight, 
  Cpu, 
  Layers, 
  CheckCircle2, 
  Zap, 
  Sparkles, 
  Send, 
  Lock, 
  QrCode, 
  Users, 
  ChevronRight,
  TrendingUp,
  Activity,
  FileCheck
} from 'lucide-react';

export const HomePage = () => {
  const navigate = useNavigate();
  const { events, tickets, setPurchaseModalEvent, currentAccount } = useBlockchain();

  // Pick sample featured events (first 3)
  const featuredEvents = events.slice(0, 3);

  // Sample hero ticket
  const heroTicket = tickets[0] || {
    id: 'CP-TK-8021',
    eventTitle: 'Blockchain Tech Summit 2026',
    eventDate: 'Oct 24, 2026',
    eventVenue: 'Convention Center, Bengaluru',
    tier: 'VIP Access Pass',
    ownerAddress: '0x71A914b43f11E2616Ddf47794D316Fa2930493F2',
    status: 'VALID',
    txHash: '0x4c9f1a238b72459df3014a938c56e300185fb4a1a084c798b3c66f68e09f582b',
    blockNumber: 5824910,
    eventImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80'
  };

  // 4 Prototype statistics
  const stats = [
    {
      label: 'Unique Digital Tickets',
      value: '1,420+',
      subtext: 'ERC-721 Minted (Demo)',
      icon: Ticket,
      color: 'from-blue-500 to-cyan-400'
    },
    {
      label: 'Verified Ownership',
      value: '100%',
      subtext: 'Cryptographic Provenance',
      icon: ShieldCheck,
      color: 'from-emerald-500 to-teal-400'
    },
    {
      label: 'Secure Ticket Transfers',
      value: '380+',
      subtext: 'P2P On-Chain Transfers',
      icon: Send,
      color: 'from-violet-500 to-purple-400'
    },
    {
      label: 'QR-Based Entry',
      value: '< 1.2s',
      subtext: 'Instant Gate Validation',
      icon: QrCode,
      color: 'from-amber-500 to-yellow-400'
    }
  ];

  // Benefits
  const benefits = [
    {
      id: '01',
      title: 'Authentic Tickets',
      description: 'Blockchain-backed records help establish absolute ticket authenticity. Every ticket is an immutable ERC-721 token that cannot be counterfeited or photocopied.',
      icon: ShieldCheck,
      borderGlow: 'hover:border-cyan-400/50'
    },
    {
      id: '02',
      title: 'Transparent Ownership',
      description: 'Track who currently owns a ticket in real-time. Transparent public address logs show minting and transfer chains without exposing private identities.',
      icon: Layers,
      borderGlow: 'hover:border-blue-400/50'
    },
    {
      id: '03',
      title: 'Controlled Transfers',
      description: 'Demonstrate ownership-based ticket transfers. Only the verified owner can reassign a pass, eliminating unauthorized secondary market ticket scalping.',
      icon: ArrowRight,
      borderGlow: 'hover:border-violet-400/50'
    },
    {
      id: '04',
      title: 'Secure Entry',
      description: 'Check ticket validity and usage status before admission. Once admitted, the smart contract state changes to USED, strictly denying duplicate gate entries.',
      icon: Lock,
      borderGlow: 'hover:border-emerald-400/50'
    }
  ];

  // Workflow steps
  const workflowSteps = [
    { title: 'Organizer Creates Event', desc: 'Registers event parameters & deploys ERC-721 contract.' },
    { title: 'Event Is Registered', desc: 'Immutable contract metadata published on Sepolia EVM.' },
    { title: 'Ticket Is Minted', desc: 'Unique digital collectible generated with distinct token ID.' },
    { title: 'Customer Purchases Ticket', desc: 'Wallet authorizes transaction with zero counterfeit risk.' },
    { title: 'Ownership Is Recorded', desc: 'Current wallet address recorded as legal on-chain owner.' },
    { title: 'QR Code Is Generated', desc: 'Dynamic QR encodes verifiable token identification payload.' },
    { title: 'Ticket Is Verified at Entry', desc: 'Gate scanner inspects validity & authenticates signature.' },
    { title: 'Ticket Is Marked USED', desc: 'State permanently updated to USED to prevent reuse.' },
  ];

  return (
    <div className="space-y-24 py-6">
      
      {/* 1. HERO SECTION */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        {/* Ambient background glow meshes */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-cyan/15 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-[30rem] h-[30rem] bg-brand-violet/15 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            <DemoBadge text="Blockchain Project • Sepolia EVM Prototype" />

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12]">
              Ticketing Reimagined for a{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-400">
                Trustless World
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
              Discover events, own verifiable digital tickets, and experience secure entry powered by blockchain technology.
            </p>

            <div className="flex items-center gap-3 text-xs text-cyan-300 font-mono">
              <span className="px-2 py-1 rounded bg-blue-950/80 border border-blue-500/30">
                Tagline: "Every Ticket Has a Chain of Trust."
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/events"
                className="py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-brand-blue via-blue-600 to-brand-cyan hover:from-blue-600 hover:to-cyan-400 text-white shadow-glow-blue transition-all flex items-center gap-2 group"
              >
                <span>Explore Events</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href="#how-it-works"
                className="py-3.5 px-6 rounded-xl font-bold text-sm border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 hover:text-white transition-all flex items-center gap-2"
              >
                <span>How It Works</span>
                <ChevronRight className="w-4 h-4 text-cyan-400" />
              </a>
            </div>

            {/* Quick Feature Badges */}
            <div className="pt-4 grid grid-cols-3 gap-3 border-t border-slate-800/80">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero Counterfeits</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Live QR Scanner</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>P2P Transfers</span>
              </div>
            </div>
          </div>

          {/* Right Hero: Visually Striking Digital Collectible Ticket */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm">
              {/* Animated Glowing Ring behind card */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 rounded-3xl blur-xl opacity-50 animate-pulse-subtle -z-10" />

              {/* Digital Collectible Card Container */}
              <div className="glass-card rounded-2xl border border-cyan-500/40 overflow-hidden shadow-2xl p-5 space-y-4">
                
                {/* Header with Artwork */}
                <div className="relative h-40 rounded-xl overflow-hidden border border-slate-700">
                  <img
                    src={heroTicket.eventImage}
                    alt={heroTicket.eventTitle}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090e24] via-black/30 to-transparent p-3 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-400/40">
                        ERC-721 COLLECTIBLE
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-400/40 flex items-center gap-1 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        VERIFIED ON-CHAIN
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-cyan-300">{heroTicket.tier}</span>
                      <h3 className="text-base font-bold text-white leading-tight">{heroTicket.eventTitle}</h3>
                    </div>
                  </div>
                </div>

                {/* Tear Cutout Perforation */}
                <div className="relative flex items-center justify-between -my-1">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#050814] -ml-7 border-r border-slate-700" />
                  <div className="flex-1 border-t-2 border-dashed border-slate-700/80 mx-2" />
                  <div className="w-3.5 h-3.5 rounded-full bg-[#050814] -mr-7 border-l border-slate-700" />
                </div>

                {/* QR Code and Quick Specs */}
                <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="space-y-1.5 text-xs font-mono">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block">Ticket ID</span>
                      <span className="font-bold text-cyan-300">{heroTicket.id}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block">Owner Address</span>
                      <span className="text-slate-300 text-[11px]">0x71A9...93F2</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block">Event Date</span>
                      <span className="text-slate-300 text-[11px]">{heroTicket.eventDate}</span>
                    </div>
                  </div>

                  <div className="shrink-0 p-1.5 bg-white rounded-xl shadow-md">
                    <TicketQRCode ticket={heroTicket} size={84} showDetails={false} />
                  </div>
                </div>

                {/* Animated Network Indicator Bar */}
                <div className="pt-1 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1.5 text-cyan-300">
                    <Cpu className="w-3.5 h-3.5 animate-spin" />
                    Block #{heroTicket.blockNumber}
                  </span>
                  <span className="text-slate-400">Gas: 18.2 Gwei</span>
                  <span className="text-emerald-400">VALID</span>
                </div>

                {/* Action button */}
                <button
                  onClick={() => navigate('/verify')}
                  className="w-full py-2.5 rounded-xl border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-300 text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Pass in Gate Scanner</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. FOUR STATISTICS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-1 rounded-2xl bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-purple-500/20">
          <div className="bg-[#080d26]/95 backdrop-blur-xl rounded-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                  Tixora Platform Metrics
                </h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-400/80 bg-cyan-950/60 px-2.5 py-0.5 rounded border border-cyan-500/30">
                PROTOTYPE BENCHMARK DATA
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((s, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">{s.label}</span>
                    <div className="p-2 rounded-lg bg-slate-800 text-cyan-400">
                      <s.icon className="w-4 h-4" />
                    </div>
                  </div>
                  <p className={`text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${s.color}`}>
                    {s.value}
                  </p>
                  <p className="text-[11px] font-mono text-slate-400">{s.subtext}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED EVENTS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
                CURATED ON-CHAIN PASSES
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Featured Events
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Explore premier events with blockchain-guaranteed authenticity and instant QR issuance.
            </p>
          </div>

          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 group"
          >
            <span>View All Events Marketplace</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      {/* 4. WHY Tixora? BENEFIT GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
            THE ARCHITECTURAL ADVANTAGE
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Why Tixora?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Eliminating scalping, counterfeit tickets, and entry bottlenecks with cryptographic smart contract logic.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map(b => (
            <div
              key={b.id}
              className={`glass-panel rounded-2xl p-6 space-y-4 border transition-all ${b.borderGlow} hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-glow-cyan/20">
                  <b.icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono font-bold text-slate-500">{b.id}</span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white tracking-wide">{b.title}</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {b.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. HOW IT WORKS WORKFLOW */}
      {/* <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
            COMPLETE VERIFICATION PIPELINE
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            How It Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Smart contracts enforce ticket ownership and transfer rules, while QR codes provide an instant way to identify tickets for gate verification.
          </p>
        </div>

        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
          {workflowSteps.map((step, idx) => (
            <div
              key={idx}
              className="glass-card rounded-xl p-5 border border-slate-800 space-y-2 relative"
            >
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-mono text-xs font-bold flex items-center justify-center">
                  0{idx + 1}
                </span>
                <span className="text-[10px] font-mono text-slate-500">Step {idx + 1}</span>
              </div>
              <h4 className="text-sm font-bold text-white pt-1">{step.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section> */}

      {/* 6. LIVE BLOCKCHAIN ACTIVITY PREVIEW */}
      {/* <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Live Blockchain Ledger Activity</h2>
            <p className="text-xs text-slate-400 mt-1">
              Real-time sequence of simulated ERC-721 mints, transfers, and gate verifications.
            </p>
          </div>
          <Link
            to="/activity"
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
          >
            <span>View Full Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <BlockchainActivityTimeline limit={4} showFilter={false} />
      </section> */}

      {/* 7. BOTTOM CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden border border-cyan-500/40 p-8 sm:p-12 text-center space-y-6 bg-gradient-to-r from-blue-950/90 via-[#0a1030] to-purple-950/90 shadow-2xl">
          <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <DemoBadge text="EXPERIENCE THE FUTURE OF TICKETING" />
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Ready to Experience Trustless Ticketing?
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Explore available tech summits, music festivals, and student expos. Purchase demo passes, test peer-to-peer transfers, and scan QR codes at our simulated entry gate.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/events"
                className="py-3.5 px-8 rounded-xl font-bold text-sm bg-gradient-to-r from-brand-blue via-blue-600 to-brand-cyan hover:from-blue-600 hover:to-cyan-400 text-white shadow-glow-cyan transition-all"
              >
                Explore Events Marketplace
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
