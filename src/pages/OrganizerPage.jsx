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
    switchAccount, 
    setIsWalletModalOpen 
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
    totalTickets: 200,
    image: PRESET_IMAGES[0].url
  });

  const [deploymentState, setDeploymentState] = useState('IDLE'); // 'IDLE' | 'COMPILING' | 'DEPLOYING' | 'SUCCESS'
  const [deployedEvent, setDeployedEvent] = useState(null);

  // Computed metrics
  const totalEvents = events.length;
  const totalTicketsSold = events.reduce((sum, e) => sum + e.soldTickets, 0);
  const activeTicketsCount = tickets.filter(t => t.status === 'VALID').length;
  const usedTicketsCount = tickets.filter(t => t.status === 'USED').length;
  const transfersCount = transactions.filter(t => t.actionType === 'TRANSFER').length;
  const totalRevenueInr = events.reduce((sum, e) => sum + (e.soldTickets * e.price), 0);

  const statCards = [
    { title: 'Total Events', value: totalEvents, sub: 'Active Contracts', icon: Layers, color: 'text-blue-400' },
    { title: 'Tickets Sold', value: totalTicketsSold.toLocaleString(), sub: 'ERC-721 Tokens', icon: Ticket, color: 'text-cyan-400' },
    { title: 'Active Tickets', value: activeTicketsCount, sub: 'Valid Gate Passes', icon: CheckCircle2, color: 'text-emerald-400' },
    { title: 'Used Tickets', value: usedTicketsCount, sub: 'Redeemed at Gates', icon: ShieldCheck, color: 'text-amber-400' },
    { title: 'Transfers', value: transfersCount, sub: 'P2P Chain Transfers', icon: Send, color: 'text-purple-400' },
    { title: 'Demo Revenue', value: `₹${totalRevenueInr.toLocaleString()}`, sub: 'Ticket Inflow', icon: IndianRupee, color: 'text-teal-400' },
  ];

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.venue || !formData.date) {
      alert('Please fill out all required fields.');
      return;
    }

    try {
      setDeploymentState('COMPILING');
      await new Promise(r => setTimeout(r, 1000));

      setDeploymentState('DEPLOYING');
      await new Promise(r => setTimeout(r, 1600));

      const created = createEvent(formData);
      setDeployedEvent(created);
      setDeploymentState('SUCCESS');
    } catch (err) {
      alert(err.message);
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
      totalTickets: 200,
      image: PRESET_IMAGES[0].url
    });
    setDeploymentState('IDLE');
    setDeployedEvent(null);
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
            This dashboard is only visible and accessible to authorized event organizers and smart contract deployers.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono max-w-md mx-auto text-left space-y-2.5">
          <div className="flex items-center justify-between text-slate-400">
            <span>Connected Account:</span>
            <span className={currentAccount ? 'text-cyan-300 font-bold' : 'text-rose-400 font-bold'}>
              {currentAccount ? currentAccount.name : 'Disconnected'}
            </span>
          </div>
          {currentAccount ? (
            <>
              <div className="flex items-center justify-between text-slate-400">
                <span>Role:</span>
                <span className="text-amber-400 font-semibold">{currentAccount.role || 'ATTENDEE'}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Address:</span>
                <span className="text-slate-300">{currentAccount.shortAddress}</span>
              </div>
            </>
          ) : (
            <p className="text-slate-400 text-xs font-sans">
              Connect your wallet using the Tixora Organizer Vault to deploy contracts and manage ticket allocations.
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {currentAccount ? (
            <button
              onClick={() => switchAccount('acc-3')}
              className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan hover:from-blue-600 hover:to-cyan-400 text-white font-bold text-xs shadow-glow-cyan transition-all flex items-center justify-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Switch to Organizer Wallet</span>
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
          <DemoBadge text="ORGANIZER ADMIN & CONTRACT DEPLOYER • ERC-721" />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Organizer Dashboard
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Deploy ERC-721 event ticket smart contracts, monitor sales volume, and audit gate entrance throughput in real-time.
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
          <div className="glass-panel rounded-2xl border border-white/[0.08] overflow-hidden space-y-4 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">
                  Events Management Registry
                </h3>
                <p className="text-xs text-slate-400">
                  On-chain deployed smart contracts and allocation telemetry
                </p>
              </div>
              <button
                onClick={() => setActiveView('CREATE_EVENT')}
                className="py-2 px-3.5 rounded-xl text-xs font-bold bg-blue-600/30 text-cyan-300 border border-cyan-400/40 hover:bg-blue-600/50 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Deploy New Event</span>
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase">
                    <th className="py-3 px-3">Event</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Price</th>
                    <th className="py-3 px-3">Total</th>
                    <th className="py-3 px-3">Sold</th>
                    <th className="py-3 px-3">Available</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {events.map(ev => {
                    const available = Math.max(0, ev.totalTickets - ev.soldTickets);
                    return (
                      <tr key={ev.id} className="hover:bg-slate-900/50 transition-colors group">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={ev.image}
                              alt={ev.title}
                              className="w-8 h-8 rounded-lg object-cover shrink-0 border border-slate-700"
                            />
                            <div>
                              <p className="font-bold font-sans text-white group-hover:text-cyan-300 transition-colors truncate max-w-[180px]">
                                {ev.title}
                              </p>
                              <span className="text-[10px] text-cyan-400/80">{ev.id}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-slate-300">
                          {ev.formattedDate}
                        </td>

                        <td className="py-3 px-3 font-bold text-cyan-300">
                          ₹{ev.price.toLocaleString()}
                        </td>

                        <td className="py-3 px-3 text-slate-400">
                          {ev.totalTickets}
                        </td>

                        <td className="py-3 px-3 font-semibold text-emerald-400">
                          {ev.soldTickets}
                        </td>

                        <td className="py-3 px-3 text-slate-300">
                          {available}
                        </td>

                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                            ● {ev.status}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right space-x-1.5 font-sans">
                          <button
                            onClick={() => navigate(`/events/${ev.id}`)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="View Public Event Page"
                          >
                            <Eye className="w-3.5 h-3.5 text-cyan-400" />
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
              <span className="text-[11px] font-mono text-cyan-400 uppercase font-semibold">
                SMART CONTRACT COMPILER & DEPLOYER
              </span>
              <h2 className="text-xl font-bold text-white mt-0.5">
                Create & Deploy Event Pass Contract
              </h2>
            </div>
            <button
              onClick={() => setActiveView('OVERVIEW')}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Ticket Price (INR ₹)
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
                    Total Ticket Supply (Mint Cap)
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

              {/* Cover Image URL & Quick Pickers */}
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
                
                {/* Preset image buttons */}
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Or pick a preset theme:</span>
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
                  <span>Deploy ERC-721 Contract & Publish Event</span>
                </button>
              </div>
            </form>
          )}

          {/* Deployment Animation */}
          {(deploymentState === 'COMPILING' || deploymentState === 'DEPLOYING') && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-cyan-400 animate-spin flex items-center justify-center shadow-glow-cyan" />
              <div>
                <h4 className="text-base font-bold text-white">
                  {deploymentState === 'COMPILING' ? 'Compiling ERC-721 Smart Contract...' : 'Broadcasting Contract Bytecode to EVM Testnet...'}
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  {deploymentState === 'COMPILING' 
                    ? 'Synthesizing OpenZeppelin ERC-721 standard with non-fungible ticket minting functions.'
                    : 'Allocating contract address and creating genesis block entry.'}
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
                <h4 className="text-lg font-bold text-white">Event Contract Successfully Deployed!</h4>
                <p className="text-xs text-emerald-300 mt-0.5">
                  The event is now active on the Tixora explore marketplace.
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
