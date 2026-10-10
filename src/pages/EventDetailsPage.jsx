import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBlockchain } from '../context/BlockchainContext';
import { DemoBadge } from '../components/DemoBadge';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Tag, 
  Ticket, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  ArrowLeft, 
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { events, setPurchaseModalEvent, currentAccount } = useBlockchain();

  const [copied, setCopied] = React.useState(false);

  const event = events.find(e => e.id === id);

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Event Not Found</h2>
        <p className="text-slate-400 text-sm">The requested event contract does not exist on the simulated network.</p>
        <Link to="/events" className="inline-block px-4 py-2 bg-brand-blue text-white rounded-xl text-xs font-bold">
          Back to Events
        </Link>
      </div>
    );
  }

  const remaining = Math.max(0, event.totalTickets - event.soldTickets);
  const percentageSold = Math.round((event.soldTickets / event.totalTickets) * 100);
  const isSoldOut = remaining === 0;

  const copyContractAddress = () => {
    navigator.clipboard.writeText(event.contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </button>
      </div>

      {/* Hero Banner Section */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 h-72 sm:h-96 group">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050814] via-[#050814]/60 to-transparent p-6 sm:p-10 flex flex-col justify-end">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-cyan-950/90 text-cyan-300 border border-cyan-500/30">
              {event.category}
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-blue-950/80 text-blue-300 border border-blue-500/30">
              {event.id}
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Verified Event Contract
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            {event.title}
          </h1>
        </div>
      </div>

      {/* Main Grid: Details (Left) + Purchase & Blockchain Record (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Event Overview & Schedule */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Quick Info Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl glass-panel border border-white/[0.08]">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-blue-600/20 text-cyan-400 border border-blue-500/30">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-mono uppercase">Event Date</span>
                <p className="text-sm font-bold text-white mt-0.5">{event.formattedDate}</p>
                <p className="text-xs text-slate-400">{event.time}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 sm:col-span-2">
              <div className="p-2.5 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-mono uppercase">Venue Location</span>
                <p className="text-sm font-bold text-white mt-0.5">{event.venue}</p>
                <p className="text-xs text-slate-400">Security Gate with QR Verification Checkpoints</p>
              </div>
            </div>
          </div>

          {/* Detailed Description */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-4 border border-white/[0.08]">
            <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              About This Event
            </h3>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {event.description}
            </p>

            <div className="pt-4 border-t border-slate-800">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">Event Highlights</h4>
              <div className="flex flex-wrap gap-2">
                {event.tags && event.tags.map((tag, i) => (
                  <span key={i} className="text-xs font-mono px-3 py-1 rounded-lg bg-slate-900 text-cyan-300 border border-slate-800">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Organizer Details */}
          <div className="glass-panel rounded-2xl p-6 border border-white/[0.08] space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Event Organizer
            </h3>
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-white">{event.organizer}</h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Contract Deployer: {event.organizerAddress}</p>
              </div>
              <span className="text-xs font-mono px-2 py-1 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                Verified Host
              </span>
            </div>
          </div>

        </div>

        {/* Right Column: Checkout Card + Blockchain Record Panel */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Purchase Ticket Checkout Card */}
          <div className="glass-card rounded-2xl p-6 border border-cyan-500/40 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">Standard Pass</span>
                <p className="text-2xl sm:text-3xl font-black text-cyan-400 mt-0.5">
                  ₹{event.price.toLocaleString()}
                </p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-blue-950 text-blue-300 border border-blue-500/30">
                INR Fiat Price
              </span>
            </div>

            {/* Availability progress */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-cyan-400" /> Ticket Availability
                </span>
                <span className={`font-mono font-bold ${isSoldOut ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {isSoldOut ? 'Sold Out' : `${remaining} / ${event.totalTickets} Left`}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-blue to-brand-cyan rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, percentageSold)}%` }}
                />
              </div>
            </div>

            {/* Get Ticket Button */}
            <button
              onClick={() => setPurchaseModalEvent(event)}
              disabled={isSoldOut}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                isSoldOut
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-brand-blue via-blue-600 to-brand-cyan hover:from-blue-600 hover:to-cyan-400 text-white shadow-glow-blue'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>{isSoldOut ? 'Event Sold Out' : 'Get Ticket (Mint Pass)'}</span>
            </button>

            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              Upon confirmation, an ERC-721 token and unique QR pass will be issued immediately to your connected wallet.
            </p>
          </div>

          {/* Blockchain Record Panel */}
          <div className="glass-panel rounded-2xl p-5 border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                  Blockchain Record
                </h4>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
                PROTOTYPE DATA
              </span>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Event ID</span>
                <span className="text-cyan-300 font-bold">{event.id}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Token Standard</span>
                <span className="text-slate-200">{event.tokenStandard}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Network</span>
                <span className="text-purple-300">{event.network}</span>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase mb-1">Contract Address Placeholder</span>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[11px] text-slate-300 truncate max-w-[200px]">
                    {event.contractAddress}
                  </span>
                  <button
                    onClick={copyContractAddress}
                    className="p-1 hover:text-white text-slate-400"
                    title="Copy Contract Address"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400">Verification Status</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-blue-950/40 border border-blue-500/20 text-[11px] text-slate-400">
              Simulated smart contract state. Token mints execute locally and are stored in client memory.
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
