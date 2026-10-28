import React, { useState } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { DemoBadge } from '../components/DemoBadge';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Ticket, 
  Calendar, 
  IndianRupee, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Send, 
  Cpu, 
  Eye, 
  Sparkles, 
  Layers, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  ExternalLink,
  Settings2,
  Globe,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';

const PRESET_IMAGES = [
  { label: 'Web3 & AI Summit', url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80' },
  { label: 'Neon Cyber Festival', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80' },
  { label: 'College Hackathon', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80' },
  { label: 'Solidity Dev Conf', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80' },
  { label: 'Metaverse Gaming Arena', url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80' }
];

export const OrganizerPage = () => {
  const navigate = useNavigate();
  const { 
    events, 
    tickets, 
    transactions, 
    createEvent, 
    currentAccount, 
    isOrganizer, 
    organizerOverride,
    setOrganizerOverride,
    switchAccount, 
    setIsWalletModalOpen,
    contractAddress,
    isContractConfigured,
    contractOwner,
    isSepolia,
    refreshOnChainData
  } = useBlockchain();

  // Active sub-view: 'OVERVIEW' | 'CREATE_EVENT'
  const [activeView, setActiveView] = useState('OVERVIEW');

  // Create Event Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Technology',
    date: '',
    time: '10:00 AM - 05:00 PM IST',
    venue: '',
    price: 999,
    priceEth: '0.0001',
    totalTickets: 200,
    image: PRESET_IMAGES[0].url
  });

  const [deploymentState, setDeploymentState] = useState('IDLE'); // 'IDLE' | 'COMPILING' | 'DEPLOYING' | 'SUCCESS'
  const [deployedEvent, setDeployedEvent] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Computed metrics
  const totalEvents = events.length;
  const totalTicketsSold = events.reduce((sum, e) => sum + e.soldTickets, 0);
  const activeTicketsCount = tickets.filter(t => t.status === 'VALID').length;
  const usedTicketsCount = tickets.filter(t => t.status === 'USED').length;
  const transfersCount = transactions.filter(t => t.actionType === 'TRANSFER').length;
  const totalRevenueInr = events.reduce((sum, e) => sum + (e.soldTickets * e.price), 0);

  const statCards = [
    { title: 'Total Events', value: totalEvents, sub: isContractConfigured ? 'Sepolia & Local' : 'Active Events', icon: Layers, color: 'text-blue-400' },
    { title: 'Tickets Sold', value: totalTicketsSold.toLocaleString(), sub: 'ERC-721 Passes', icon: Ticket, color: 'text-cyan-400' },
    { title: 'Active Tickets', value: activeTicketsCount, sub: 'Valid Passes', icon: CheckCircle2, color: 'text-emerald-400' },
    { title: 'Used Tickets', value: usedTicketsCount, sub: 'Gate Redemptions', icon: ShieldCheck, color: 'text-amber-400' },
    { title: 'Transfers', value: transfersCount, sub: 'P2P Ownership Transfers', icon: Send, color: 'text-purple-400' },
    { title: 'Total Inflow', value: `₹${totalRevenueInr.toLocaleString()}`, sub: 'Contract Volume', icon: IndianRupee, color: 'text-teal-400' },
  ];

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.venue || !formData.date) {
      alert('Please fill out all required fields.');
      return;
    }

    setErrorMessage('');

    try {
      setDeploymentState('DEPLOYING');
      const created = await createEvent(formData);
      setDeployedEvent(created);
      setDeploymentState('SUCCESS');
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Event creation failed.');
      setDeploymentState('IDLE');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Technology',
      date: '',
      time: '10:00 AM - 05:00 PM IST',
      venue: '',
      price: 999,
      priceEth: '0.0001',
      totalTickets: 200,
      image: PRESET_IMAGES[0].url
    });
    setDeploymentState('IDLE');
    setDeployedEvent(null);
    setErrorMessage('');
    setActiveView('OVERVIEW');
  };

  if (!isOrganizer) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <DemoBadge text="RESTRICTED ACCESS • ORGANIZER PORTAL" />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Organizer Dashboard Restricted
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            This dashboard is restricted to authorized event organizers and smart contract deployers.
          </p>
        </div>

        {/* Authorization Rules Explanatory Box */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono max-w-md mx-auto text-left space-y-2.5">
          <span className="text-[10px] text-cyan-400 uppercase tracking-wider block font-bold">
            Smart Contract Authorization Rules:
          </span>
          <ul className="list-disc list-inside space-y-1 text-slate-300 font-sans text-xs">
            <li><strong className="text-white">Contract Owner:</strong> Deployer of BlockTix.sol on Sepolia.</li>
            <li><strong className="text-white">Event Organizer:</strong> Creator address registered with event.</li>
            <li><strong className="text-white">Designated Verifier:</strong> Authorized via <code className="text-cyan-300 font-mono">setVerifier()</code>.</li>
          </ul>

          <div className="pt-2 border-t border-slate-800 text-slate-400 text-xs space-y-1 font-mono">
            <div className="flex justify-between">
              <span>Connected Address:</span>
              <span className="text-slate-200">{currentAccount ? currentAccount.shortAddress : 'None'}</span>
            </div>
            <div className="flex justify-between">
              <span>Access Status:</span>
              <span className="text-rose-400 font-bold">Access Denied</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {/* Faculty / Project Review One-Click Authorization */}
          <button
            onClick={() => setOrganizerOverride(true)}
            className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-glow-emerald transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Enable Organizer Mode (College Review)</span>
          </button>

          {currentAccount ? (
            <button
              onClick={() => switchAccount('acc-3')}
              className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <span>Switch to Organizer Preset</span>
            </button>
          ) : (
            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-brand-blue hover:bg-blue-600 text-white font-bold text-xs shadow-glow-blue transition-all flex items-center justify-center gap-2"
            >
              <span>Connect Wallet</span>
            </button>
          )}

          <button
            onClick={() => navigate('/events')}
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-xs transition-colors"
          >
            Explore Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <DemoBadge text={isContractConfigured ? "ORGANIZER ADMIN • LIVE SEPOLIA SMART CONTRACT" : "ORGANIZER ADMIN • DEMO SIMULATION"} />
            {isContractConfigured && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                SEPOLIA ON-CHAIN
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Organizer Dashboard
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Register ERC-721 event contracts on Ethereum Sepolia, monitor ticket mint volumes, and audit gate entrance throughput in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('OVERVIEW')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeView === 'OVERVIEW'
                ? 'bg-blue-600/30 text-cyan-300 border border-cyan-400/50 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview & Events</span>
          </button>

          <button
            onClick={() => {
              setActiveView('CREATE_EVENT');
              setDeploymentState('IDLE');
              setErrorMessage('');
            }}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeView === 'CREATE_EVENT'
                ? 'bg-gradient-to-r from-brand-blue to-brand-cyan text-white shadow-glow-cyan'
                : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Event</span>
          </button>
        </div>
      </div>

      {/* Contract & Network Status Card */}
      <div className="p-4 rounded-2xl glass-panel border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
            Smart Contract Architecture
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white font-mono">
              {isContractConfigured ? contractAddress : 'Demo Mode (No Sepolia contract address configured)'}
            </span>
            {isContractConfigured && (
              <a
                href={`https://sepolia.etherscan.io/address/${contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-1 text-xs"
              >
                <span>Etherscan</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Standard: <span className="text-cyan-300 font-mono">ERC-721 + ReentrancyGuard + Ownable</span> • Network: <span className="text-purple-300 font-mono">Sepolia Testnet (11155111)</span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsWalletModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 transition-colors flex items-center gap-1.5"
          >
            <Settings2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Configure Contract</span>
          </button>
          <button
            onClick={refreshOnChainData}
            title="Refresh on-chain data"
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* VIEW 1: OVERVIEW & EVENTS TABLE */}
      {activeView === 'OVERVIEW' && (
        <div className="space-y-8">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {statCards.map((card, i) => (
              <div key={i} className="glass-panel rounded-2xl p-4 border border-white/[0.08] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 uppercase font-mono">{card.title}</span>
                  <card.icon className={`w-4 h-4 ${card.color}`} />
                </div>
                <p className="text-xl sm:text-2xl font-black text-white">{card.value}</p>
                <p className="text-[10px] text-slate-500 font-mono">{card.sub}</p>
              </div>
            ))}
          </div>

          {/* Events Management Table */}
          <div className="glass-panel rounded-2xl border border-white/[0.08] overflow-hidden space-y-4">
            <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Active Event Smart Contracts</h3>
                <p className="text-xs text-slate-400">Deployed events and on-chain ticket sales allocations.</p>
              </div>
              <button
                onClick={() => setActiveView('CREATE_EVENT')}
                className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>New Event</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-4">Event</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Sold / Capacity</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Source</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {events.map((event) => {
                    const percentSold = Math.round((event.soldTickets / event.totalTickets) * 100);
                    return (
                      <tr key={event.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={event.image}
                              alt={event.title}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-800"
                            />
                            <div>
                              <p className="font-bold text-white truncate max-w-xs">{event.title}</p>
                              <p className="font-mono text-[10px] text-cyan-400">{event.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-slate-300">{event.category}</td>
                        <td className="p-4 text-slate-300 whitespace-nowrap">{event.formattedDate}</td>
                        <td className="p-4">
                          <div>
                            <span className="font-mono text-white font-semibold">
                              {event.soldTickets} / {event.totalTickets}
                            </span>
                            <div className="w-24 bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                              <div 
                                className="bg-cyan-400 h-full rounded-full transition-all"
                                style={{ width: `${percentSold}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-mono font-semibold text-cyan-300 whitespace-nowrap">
                          {event.isOnChain ? (event.priceEth || '0.0001 ETH') : `₹${event.price.toLocaleString()}`}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            event.isOnChain ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}>
                            {event.isOnChain ? 'ON-CHAIN' : 'DEMO'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => navigate(`/events/${event.id}`)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="View Event Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: CREATE EVENT FORM & SMART CONTRACT DEPLOYER */}
      {activeView === 'CREATE_EVENT' && (
        <div className="max-w-3xl mx-auto glass-panel rounded-2xl p-6 sm:p-8 border border-white/[0.08] space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-cyan-400 uppercase font-semibold">
                  SMART CONTRACT COMPILER & DEPLOYER
                </span>
                {isContractConfigured && currentAccount?.isMetaMask && (
                  <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded">
                    SEPOLIA TESTNET
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-white mt-0.5">
                Register Event on Blockchain
              </h2>
            </div>
            <button
              onClick={() => setActiveView('OVERVIEW')}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          {deploymentState === 'IDLE' && (
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              
              {/* Event Name */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI & Crypto Research Colloquium 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-950/80 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Event Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide an overview of speakers, schedule, and entry guidelines..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-950/80 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Category, Date, Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Music & Arts">Music & Arts</option>
                    <option value="Campus & Academia">Campus & Academia</option>
                    <option value="Gaming">Gaming</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Time Range</label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Venue */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Venue & Turnstile Gates *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Auditorium Hall 2, Tech Campus, Bengaluru"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-950/80 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Price & Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Price in Sepolia ETH
                  </label>
                  <input
                    type="text"
                    placeholder="0.0001"
                    value={formData.priceEth}
                    onChange={(e) => setFormData({ ...formData, priceEth: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-950/80 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Display Price (INR ₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-950/80 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Total Mint Cap (Supply)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.totalTickets}
                    onChange={(e) => setFormData({ ...formData, totalTickets: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-950/80 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              {/* Cover Image URL */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  Event Cover Image
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-400"
                />
                
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Or select theme preset:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {PRESET_IMAGES.map((preset, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setFormData({ ...formData, image: preset.url })}
                        className={`px-2 py-1 rounded-lg text-[11px] border transition-colors ${
                          formData.image === preset.url
                            ? 'bg-blue-600/30 text-cyan-300 border-cyan-400'
                            : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-brand-blue via-blue-600 to-brand-cyan hover:from-blue-600 hover:to-cyan-400 text-white shadow-glow-blue transition-all flex items-center justify-center gap-2"
                >
                  <Cpu className="w-4 h-4" />
                  <span>
                    {isContractConfigured && currentAccount?.isMetaMask
                      ? 'Submit Event Transaction to Sepolia Blockchain'
                      : 'Create Event (Demo Mode)'}
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* Deployment Animation */}
          {deploymentState === 'DEPLOYING' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-cyan-400 animate-spin flex items-center justify-center shadow-glow-cyan" />
              <div>
                <h4 className="text-base font-bold text-white">
                  Broadcasting Event Transaction to EVM Blockchain...
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  Please review and confirm transaction in MetaMask. Ethers.js is recording event specifications on Sepolia.
                </p>
              </div>
            </div>
          )}

          {/* Deployment Success */}
          {deploymentState === 'SUCCESS' && deployedEvent && (
            <div className="py-4 space-y-4 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Event Registered Successfully!</h4>
                <p className="text-xs text-emerald-300 mt-0.5">
                  The event is live and available on the BlockTix marketplace.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Event ID</span>
                  <span className="font-mono text-cyan-300 font-bold">{deployedEvent.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Contract Address</span>
                  <span className="font-mono text-purple-300 truncate max-w-[200px]">{deployedEvent.contractAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Ticket Supply</span>
                  <span className="font-mono text-slate-200">{deployedEvent.totalTickets} Passes</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={resetForm}
                  className="py-2.5 px-3 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors"
                >
                  Back to Dashboard
                </button>
                <button
                  onClick={() => navigate(`/events/${deployedEvent.id}`)}
                  className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan hover:from-blue-600 hover:to-cyan-400 text-xs font-bold text-white shadow-glow-cyan transition-all flex items-center justify-center gap-1.5"
                >
                  <span>View Public Event</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
