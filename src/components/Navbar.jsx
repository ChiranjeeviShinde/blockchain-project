import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useBlockchain } from '../context/BlockchainContext';
import { 
  Home,
  Ticket, 
  Wallet, 
  ShieldCheck, 
  LayoutDashboard, 
  Compass, 
  Info, 
  Menu, 
  X, 
  ChevronDown, 
  Check, 
  Copy, 
  RefreshCw, 
  Layers,
  ArrowRightLeft,
  Activity
} from 'lucide-react';

export const Navbar = () => {
  const { 
    currentAccount, 
    setIsWalletModalOpen, 
    disconnectWallet, 
    switchAccount, 
    demoAccounts,
    tickets,
    resetDemoData,
    isOrganizer
  } = useBlockchain();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walletDropdownOpen, setWalletDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Active tickets for connected wallet
  const userTickets = currentAccount 
    ? tickets.filter(t => t.ownerAddress.toLowerCase() === currentAccount.address.toLowerCase() && t.status === 'VALID')
    : [];

  const handleCopy = (address) => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Explore Events', path: '/events', icon: Compass },
    { 
      name: 'My Tickets', 
      path: '/my-tickets', 
      icon: Ticket,
      badge: userTickets.length > 0 ? userTickets.length : null
    },
    { name: 'Verify Ticket', path: '/verify', icon: ShieldCheck },
    ...(isOrganizer ? [{ name: 'Organizer Dashboard', path: '/organizer', icon: LayoutDashboard }] : []),
    { name: 'Activity', path: '/activity', icon: Activity },
    // { name: 'About', path: '/about', icon: Info },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full bg-[#050814]/85 backdrop-blur-xl border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-blue via-blue-600 to-brand-cyan flex items-center justify-center text-white shadow-glow-cyan/50 group-hover:scale-105 transition-transform duration-300">
              <Ticket className="w-5 h-5 -rotate-12" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                  Chain<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-blue">Pass</span>
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider font-mono">Chain of Trust Ticketing</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-blue-600/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`
                }
              >
                {link.icon && <link.icon className="w-3.5 h-3.5" />}
                <span>{link.name}</span>
                {link.badge && (
                  <span className="ml-1 px-1.5 py-0.2 text-[10px] font-mono font-bold rounded-full bg-cyan-400 text-slate-950">
                    {link.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>

          {/* Right Wallet Action and Demo Tools */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Connected Wallet button or Connect Wallet CTA */}
            {currentAccount ? (
              <div className="relative">
                <button
                  onClick={() => setWalletDropdownOpen(!walletDropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-cyan-500/40 hover:border-cyan-400 text-white transition-all shadow-glow-cyan/20 group"
                >
                  <img
                    src={currentAccount.avatar}
                    alt={currentAccount.name}
                    className="w-6 h-6 rounded-full object-cover border border-cyan-400/50"
                  />
                  <div className="text-left font-mono">
                    <p className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {currentAccount.shortAddress}
                    </p>
                    <p className="text-[10px] text-cyan-400 leading-none">
                      {currentAccount.shortName}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
                </button>

                {/* Dropdown for account switcher */}
                {walletDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-72 glass-dropdown rounded-2xl p-3 space-y-3 z-50 animate-fade-in"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase text-slate-400">Connected Wallet</span>
                        <button
                          onClick={() => handleCopy(currentAccount.address)}
                          className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 font-mono"
                        >
                          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copied ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <p className="font-mono text-xs text-white truncate mt-1">{currentAccount.address}</p>
                      <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-400">Balance:</span>
                        <span className="font-mono text-cyan-300 font-semibold">{currentAccount.balanceEth}</span>
                      </div>
                    </div>

                    {/* Switch accounts */}
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block px-1 mb-1.5">
                        Switch Demo Account
                      </span>
                      <div className="space-y-1">
                        {demoAccounts.map(acc => (
                          <button
                            key={acc.id}
                            onClick={() => {
                              switchAccount(acc.id);
                              setWalletDropdownOpen(false);
                            }}
                            className={`w-full p-2 rounded-lg text-left text-xs transition-colors flex items-center justify-between ${
                              currentAccount.id === acc.id
                                ? 'bg-blue-600/20 text-cyan-300 border border-cyan-400/40'
                                : 'hover:bg-slate-800/60 text-slate-300'
                            }`}
                          >
                            <span className="truncate">{acc.name}</span>
                            <span className="text-[10px] font-mono text-slate-400">{acc.shortAddress}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <button
                        onClick={() => {
                          resetDemoData();
                          setWalletDropdownOpen(false);
                        }}
                        className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                        title="Reset tickets and transactions to default presentation state"
                      >
                        <RefreshCw className="w-3 h-3 text-cyan-400" />
                        <span>Reset Demo Data</span>
                      </button>

                      <button
                        onClick={() => {
                          disconnectWallet();
                          setWalletDropdownOpen(false);
                        }}
                        className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsWalletModalOpen(true)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-brand-blue via-blue-600 to-brand-cyan hover:from-blue-600 hover:to-cyan-400 text-white shadow-glow-blue transition-all flex items-center gap-2"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet</span>
              </button>
            )}

            {/* Presentation quick reset icon */}
            <button
              onClick={resetDemoData}
              title="Reset Demo Data (Presentation mode)"
              className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40 hover:bg-slate-900/60 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            {currentAccount ? (
              <button
                onClick={() => setIsWalletModalOpen(true)}
                className="px-2.5 py-1.5 rounded-lg bg-blue-950/80 border border-blue-500/30 text-xs font-mono text-cyan-300"
              >
                {currentAccount.shortAddress}
              </button>
            ) : (
              <button
                onClick={() => setIsWalletModalOpen(true)}
                className="px-2.5 py-1.5 rounded-lg bg-brand-blue text-xs font-bold text-white"
              >
                Connect
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#070c24] border-b border-slate-800 px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded-xl text-sm font-semibold ${
                  isActive
                    ? 'bg-blue-600/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`
              }
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {link.icon && <link.icon className="w-4 h-4" />}
                  {link.name}
                </span>
                {link.badge && (
                  <span className="px-2 py-0.5 text-xs font-mono font-bold rounded-full bg-cyan-400 text-slate-950">
                    {link.badge}
                  </span>
                )}
              </div>
            </NavLink>
          ))}

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                resetDemoData();
                setMobileMenuOpen(false);
              }}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Reset Demo State</span>
            </button>
            {currentAccount && (
              <button
                onClick={() => {
                  disconnectWallet();
                  setMobileMenuOpen(false);
                }}
                className="text-xs text-rose-400"
              >
                Disconnect
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
