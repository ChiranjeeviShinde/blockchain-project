import React from 'react';
import { Calendar, MapPin, Tag, Users, ArrowRight, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBlockchain } from '../context/BlockchainContext';

export const EventCard = ({ event }) => {
  const navigate = useNavigate();
  const { setPurchaseModalEvent } = useBlockchain();

  const remaining = Math.max(0, event.totalTickets - event.soldTickets);
  const percentageSold = Math.round((event.soldTickets / event.totalTickets) * 100);
  const isSoldOut = remaining === 0;

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col group h-full">
      {/* Event Cover Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b112c] via-[#0b112c]/40 to-transparent" />
        
        {/* Category & Smart Contract Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-cyan-300 border border-cyan-500/30">
            {event.category}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-purple-300 border border-purple-500/30">
            ERC-721
          </span>
        </div>

        {/* Price tag over image */}
        <div className="absolute bottom-3 left-3">
          <div className="px-3 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-slate-700">
            <span className="text-xs text-slate-400">Tickets from</span>
            <p className="text-base font-extrabold text-cyan-400">₹{event.price.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
            {event.title}
          </h3>

          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          <div className="mt-4 space-y-1.5 text-xs text-slate-300">
            <p className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{event.formattedDate} • {event.time}</span>
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="truncate">{event.venue}</span>
            </p>
          </div>
        </div>

        {/* Availability Bar */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-cyan-400" /> Availability
            </span>
            <span className={`font-mono font-semibold ${isSoldOut ? 'text-rose-400' : 'text-emerald-400'}`}>
              {isSoldOut ? 'Sold Out' : `${remaining} tickets left`}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                percentageSold > 85 ? 'bg-amber-400' : 'bg-gradient-to-r from-brand-blue to-brand-cyan'
              }`}
              style={{ width: `${Math.min(100, percentageSold)}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={() => navigate(`/events/${event.id}`)}
            className="py-2.5 px-3 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800/80 text-xs font-semibold text-slate-200 hover:text-white transition-all text-center"
          >
            View Details
          </button>

          <button
            onClick={() => setPurchaseModalEvent(event)}
            disabled={isSoldOut}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              isSoldOut
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-brand-blue via-blue-600 to-brand-cyan hover:from-blue-600 hover:to-cyan-400 text-white shadow-glow-blue'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Get Ticket</span>
          </button>
        </div>
      </div>
    </div>
  );
};
