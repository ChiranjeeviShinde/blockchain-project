import React from 'react';
import { DemoBadge } from '../components/DemoBadge';
import { 
  ShieldCheck, 
  Layers, 
  Cpu, 
  ArrowRight, 
  Lock, 
  Key, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  ExternalLink,
  Code2,
  Terminal,
  QrCode,
  Send,
  Database
} from 'lucide-react';

export const AboutPage = () => {
  const architectureLayers = [
    {
      title: 'React 19 Frontend',
      tech: 'Vite • Tailwind CSS • React Router',
      role: 'User Interface & State Management',
      desc: 'Provides intuitive attendee ticket purchasing, wallet visualization, QR presentation, and organizer dashboards.',
      isSimulated: false,
      color: 'border-blue-500/40 text-blue-400'
    },
    {
      title: 'Wallet Interface',
      tech: 'EIP-1193 / Web3 Provider Simulator',
      role: 'Identity & Cryptographic Signing',
      desc: 'Simulates non-custodial EVM wallet accounts (Alice, Bob, Organizer) with public-key address management and balance tracking.',
      isSimulated: true,
      color: 'border-cyan-500/40 text-cyan-400'
    },
    {
      title: 'Smart Contract Layer',
      tech: 'OpenZeppelin ERC-721 Standard Logic',
      role: 'On-Chain Business Rules',
      desc: 'Implements minting constraints, ownership checks, status transitions (VALID → USED), and transfer authorization controls.',
      isSimulated: true,
      color: 'border-purple-500/40 text-purple-400'
    },
    {
      title: 'Blockchain Network',
      tech: 'EVM Sepolia Testnet (Simulated)',
      role: 'Immutable Distributed Ledger',
      desc: 'Records non-repudiable transaction hashes, gas consumption, block sequencing, and complete token provenance histories.',
      isSimulated: true,
      color: 'border-emerald-500/40 text-emerald-400'
    }
  ];

  const securityFeatures = [
    {
      title: 'Unique Ticket Identifiers',
      desc: 'Every ticket is backed by a globally unique ERC-721 token identifier (e.g. CP-TK-8021) guaranteed to be one-of-a-kind across the platform.',
      icon: Key
    },
    {
      title: 'Ownership Verification',
      desc: 'Cryptographic public keys bind tickets directly to the attendee’s wallet. Gate checks confirm that the presenter holds valid title to the pass.',
      icon: ShieldCheck
    },
    {
      title: 'Controlled Peer Transfers',
      desc: 'Transfers execute through strict authorization rules. Only the current on-chain owner can reassign a pass, eliminating unauthorized secondary scalping.',
      icon: Send
    },
    {
      title: 'QR-Based Fast Identification',
      desc: 'High-density QR payloads encapsulate the token metadata, enabling sub-second lookup and decoding on mobile devices or gate scanner turnstiles.',
      icon: QrCode
    },
    {
      title: 'Duplicate-Entry Prevention',
      desc: 'When an attendee is admitted, the token state transitions irrevocably from VALID to USED. Subsequent presentation attempts trigger ENTRY DENIED.',
      icon: Lock
    },
    {
      title: 'Transparent Transaction History',
      desc: 'Every mint, transfer, and gate admission is logged on an open verifiable ledger, giving organizers and fans full transparency.',
      icon: Database
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Header Banner */}
      <div className="space-y-3">
        <DemoBadge text="B.TECH CSE CAPSTONE • ARCHITECTURAL OVERVIEW" />
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          About Tixora & System Architecture
        </h1>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          Traditional ticketing systems suffer from predatory scalping, counterfeits, opaque resale markups, and database silos. 
          Tixora applies decentralized ledger principles to establish an immutable, verifiable chain of trust.
        </p>
      </div>

      {/* Tagline Showcase */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/80 via-[#0a1233] to-purple-950/80 border border-blue-500/30 text-center">
        <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold block mb-1">
          PROJECT MOTTO
        </span>
        <p className="text-xl sm:text-2xl font-black text-white italic">
          "Every Ticket Has a Chain of Trust."
        </p>
      </div>

      {/* System Architecture Diagram */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/[0.08] space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">
              System Architecture Diagram
            </h2>
            <p className="text-xs text-slate-400">
              Interactive pipeline from user interface to distributed blockchain network
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-300 bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-500/30">
            SIMULATED EVM ENVIRONMENT
          </span>
        </div>

        {/* 4 Connected Layers */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {architectureLayers.map((layer, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-xl bg-slate-900/70 border ${layer.color} space-y-3 flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 text-slate-300">
                    Layer 0{idx + 1}
                  </span>
                  {layer.isSimulated ? (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/90 text-cyan-300 border border-cyan-500/30">
                      Simulated
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-500/30">
                      Live Native
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white mt-2">{layer.title}</h3>
                <p className="text-[11px] font-mono text-cyan-300/90 mt-0.5">{layer.tech}</p>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{layer.desc}</p>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-mono">
                Role: {layer.role}
              </div>
            </div>
          ))}
        </div>

        {/* Text Diagram Representation */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center font-mono text-xs text-cyan-300 flex flex-wrap items-center justify-center gap-3">
          <span className="px-3 py-1 bg-blue-950/60 rounded border border-blue-500/30">React Frontend</span>
          <ArrowRight className="w-4 h-4 text-slate-500" />
          <span className="px-3 py-1 bg-cyan-950/60 rounded border border-cyan-500/30">Wallet Interface (Simulated)</span>
          <ArrowRight className="w-4 h-4 text-slate-500" />
          <span className="px-3 py-1 bg-purple-950/60 rounded border border-purple-500/30">Smart Contract Layer (ERC-721)</span>
          <ArrowRight className="w-4 h-4 text-slate-500" />
          <span className="px-3 py-1 bg-emerald-950/60 rounded border border-emerald-500/30">Blockchain Network (Sepolia)</span>
        </div>
      </div>

      {/* Security by Design Section */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/[0.08] space-y-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
            DEFENSE IN DEPTH
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1">
            Security by Design
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            How cryptographic protocols address ticketing vulnerabilities in practice.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {securityFeatures.map((sec, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                <sec.icon className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">{sec.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{sec.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Academic Disclosures & Realistic Blockchain Limitations */}
      <div className="p-6 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Realistic Engineering Disclosures & Considerations
          </h3>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          While blockchain architecture solves counterfeits and opaque ownership records, real-world systems must also consider:
        </p>

        <ul className="space-y-2 text-xs text-slate-400 font-mono">
          <li className="flex items-start gap-2">
            <span className="text-cyan-400 font-bold">•</span>
            <span><strong className="text-slate-200">Smart Contract Logic Security:</strong> Security fundamentally relies on rigorous audit of Solidity contracts to avoid reentrancy or permission escalation.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-400 font-bold">•</span>
            <span><strong className="text-slate-200">User Wallet Custody:</strong> If an attendee loses their private key or signs a malicious phishing transaction, on-chain ownership can be compromised.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-400 font-bold">•</span>
            <span><strong className="text-slate-200">Turnstile Latency & Offline Contingency:</strong> Physical gate turnstiles require high-speed cached node validation to handle thousands of attendees per hour without network delays.</span>
          </li>
        </ul>
      </div>

    </div>
  );
};
