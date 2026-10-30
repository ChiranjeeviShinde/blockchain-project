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
  Activity,
  AlertTriangle,
  Globe,
  Settings2
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
    isOrganizer,
    organizerOverride,
    setOrganizerOverride,
    networkChainId,
    isSepolia,
    switchToSepoliaNetwork,
    contractAddress,
    isContractConfigured,
    activeMode,
    setActiveMode,
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
    ...(isOrganizer ? [
      { name: 'Verify Ticket', path: '/verify', icon: ShieldCheck },
      { name: 'Organizer Dashboard', path: '/organizer', icon: LayoutDashboard },
    ] : []),
    { name: 'Activity', path: '/activity', icon: Activity },
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
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-blue">Tixora</span>
                </span>
                {/* Live Sepolia Badge */}
                {currentAccount?.isMetaMask && isSepolia && (
                  <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    SEPOLIA
                  </span>
                )}
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
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border text-white transition-all group ${
                    currentAccount.isMetaMask
                      ? 'bg-slate-900/90 border-amber-500/50 hover:border-amber-400 shadow-glow-amber/20'
                      : 'bg-slate-900/80 border-cyan-500/40 hover:border-cyan-400 shadow-glow-cyan/20'
                  }`}
                >
                  <img
                    src={currentAccount.avatar}
                    alt={currentAccount.name}
                    className={`w-6 h-6 rounded-full object-cover border ${
                      currentAccount.isMetaMask ? 'border-amber-400' : 'border-cyan-400/50'
                    }`}
                  />
                  <div className="text-left font-mono">
                    <p className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {currentAccount.shortAddress}
                    </p>
                    <div className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        currentAccount.isMetaMask ? (isSepolia ? 'bg-emerald-400' : 'bg-amber-400') : 'bg-cyan-400'
                      }`} />
                      <p className="text-[10px] text-slate-400 leading-none">
                        {currentAccount.isMetaMask ? (isSepolia ? 'Sepolia' : 'Wrong Net') : currentAccount.shortName}
                      </p>
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
                </button>

                {/* Dropdown */}
                {walletDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-80 glass-dropdown rounded-2xl p-3 space-y-3 z-50 animate-fade-in"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1">
                          {currentAccount.isMetaMask ? '🦊 MetaMask Wallet' : 'Demo Wallet'}
                        </span>
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

                      {/* Network & Contract Details in Dropdown */}
                      <div className="mt-2 pt-2 border-t border-slate-800/80 text-[11px] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Network:</span>
                          {currentAccount.isMetaMask ? (
                            isSepolia ? (
                              <span className="text-emerald-400 font-mono">Sepolia (11155111)</span>
                            ) : (
                              <button
                                onClick={switchToSepoliaNetwork}
                                className="text-amber-400 hover:underline font-mono text-[10px]"
                              >
                                Switch to Sepolia
                              </button>
                            )
                          ) : (
                            <span className="text-cyan-300 font-mono">Simulated</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Contract:</span>
                          <span className={`font-mono text-[10px] ${isContractConfigured ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {isContractConfigured ? `${contractAddress.substring(0, 6)}...${contractAddress.substring(contractAddress.length - 4)}` : 'Not Set (Demo Mode)'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Mode:</span>
                          <button
                            type="button"
                            onClick={() => setActiveMode(activeMode === 'ON_CHAIN' ? 'DEMO' : 'ON_CHAIN')}
                            className="text-[10px] font-mono font-bold text-cyan-300 hover:underline flex items-center gap-1"
                          >
                            <span>{activeMode === 'ON_CHAIN' ? 'Live Sepolia' : 'Demo Mode'}</span>
                            <span className="text-slate-500 text-[9px]">(toggle)</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Organizer Role Toggle for College Project Demonstration */}
                    <div className="p-2 rounded-lg bg-blue-950/20 border border-blue-500/20 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-white block text-[11px]">Organizer Access</span>
                        <span className="text-[10px] text-slate-400">Gate verification & event creation</span>
                      </div>
                      <button
                        onClick={() => setOrganizerOverride(!organizerOverride)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${
                          isOrganizer
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {isOrganizer ? 'AUTHORIZED' : 'ENABLE'}
                      </button>
                    </div>

                    {/* Wallet Modal Trigger */}
                    <button
                      onClick={() => {
                        setIsWalletModalOpen(true);
                        setWalletDropdownOpen(false);
                      }}
                      className="w-full py-1.5 px-2.5 rounded-lg text-left text-xs text-slate-300 hover:bg-slate-800/60 transition-colors flex items-center justify-between"
                    >
                      <span className="flex items-center gap-1.5">
                        <Settings2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Wallet & Contract Settings</span>
                      </span>
                    </button>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setIsWalletModalOpen(true);
                          setWalletDropdownOpen(false);
                        }}
                        className="text-[11px] text-cyan-400 hover:underline"
                      >
                        Switch Wallet
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
              title="Reset Demo State"
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
