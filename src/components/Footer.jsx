import React from 'react';
import { Link } from 'react-router-dom';
import { useBlockchain } from '../context/BlockchainContext';
import { 
  Ticket, 
  ShieldCheck, 
  Cpu, 
  RefreshCw, 
  Terminal, 
  ExternalLink,
  Layers,
  Heart
} from 'lucide-react';

export const Footer = () => {
  const { resetDemoData } = useBlockchain();

  return (
    <footer className="w-full bg-[#030611] border-t border-white/[0.07] text-slate-400 text-xs mt-20">
      {/* Top Banner with Network Status */}
      <div className="border-b border-white/[0.05] bg-[#050817]/60 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              EVM Testnet Online
            </span>
            <span className="text-slate-600">|</span>
            <span className="font-mono text-[11px] text-slate-300">
              Chain ID: <span className="text-cyan-300">11155111 (Sepolia)</span>
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="font-mono text-[11px] text-slate-400 hidden sm:inline">
              Gas: <span className="text-emerald-400">18.4 Gwei</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className="text-slate-400">Simulated Block: <span className="text-purple-300">#5,826,490</span></span>
            <button
              onClick={resetDemoData}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline"
            >
              <RefreshCw className="w-3 h-3" /> Reset Demo State
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Column */}
          <div className="md:col-span-1 space-y-3">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-blue to-brand-cyan flex items-center justify-center text-white">
                <Ticket className="w-4 h-4 -rotate-12" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Chain<span className="text-cyan-400">Pass</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed italic">
              "Every Ticket Has a Chain of Trust."
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 font-mono">
              Platform Modules
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/events" className="hover:text-cyan-300 transition-colors">
                  Explore Events Marketplace
                </Link>
              </li>
              <li>
                <Link to="/my-tickets" className="hover:text-cyan-300 transition-colors">
                  My Digital Tickets Wallet
                </Link>
              </li>
              <li>
                <Link to="/verify" className="hover:text-cyan-300 transition-colors">
                  Gatekeeper QR Ticket Scanner
                </Link>
              </li>
              <li>
                <Link to="/organizer" className="hover:text-cyan-300 transition-colors">
                  Organizer Admin Portal
                </Link>
              </li>
              <li>
                <Link to="/activity" className="hover:text-cyan-300 transition-colors">
                  Live Blockchain Explorer
                </Link>
              </li>
            </ul>
          </div>

          {/* Academic & Blockchain Tech */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 font-mono">
              Architecture & Standard
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                ERC-721 NFT Token Standard
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                Cryptographic QR Payloads
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                Double-Spend Entry Prevention
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Non-Custodial Wallet Simulation
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Local State Persistence
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="pt-8 mt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 ChainPass Project.</p>
          <p className="flex items-center gap-1">
            Simulated Web3 Environment • All Transactions Recorded Locally
          </p>
        </div>
      </div>
    </footer>
  );
};
