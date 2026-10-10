import React, { useState, useMemo } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { EventCard } from '../components/EventCard';
import { DemoBadge } from '../components/DemoBadge';
import { 
  Search, 
  SlidersHorizontal, 
  Calendar, 
  IndianRupee, 
  Tag, 
  ArrowUpDown, 
  RotateCcw,
  Sparkles,
  Ticket
} from 'lucide-react';

export const ExploreEventsPage = () => {
  const { events } = useBlockchain();

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [maxPrice, setMaxPrice] = useState(3000);
  const [selectedDate, setSelectedDate] = useState('');
  const [sortBy, setSortBy] = useState('DATE_ASC'); // DATE_ASC, DATE_DESC, PRICE_ASC, PRICE_DESC

  const categories = ['ALL', 'Technology', 'Music & Arts', 'Campus & Academia', 'Gaming'];

  // Filter and sort logic
  const filteredEvents = useMemo(() => {
    return events
      .filter(event => {
        // Name search
        const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description.toLowerCase().includes(searchTerm.toLowerCase());

        // Category filter
        const matchesCategory = selectedCategory === 'ALL' || event.category === selectedCategory;

        // Price filter
        const matchesPrice = event.price <= maxPrice;

        // Date filter
        const matchesDate = !selectedDate || event.date >= selectedDate;

        return matchesSearch && matchesCategory && matchesPrice && matchesDate;
      })
      .sort((a, b) => {
        if (sortBy === 'DATE_ASC') return new Date(a.date) - new Date(b.date);
        if (sortBy === 'DATE_DESC') return new Date(b.date) - new Date(a.date);
        if (sortBy === 'PRICE_ASC') return a.price - b.price;
        if (sortBy === 'PRICE_DESC') return b.price - a.price;
        return 0;
      });
  }, [events, searchTerm, selectedCategory, maxPrice, selectedDate, sortBy]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('ALL');
    setMaxPrice(3000);
    setSelectedDate('');
    setSortBy('DATE_ASC');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="space-y-3">
        <DemoBadge text="SMART CONTRACT EVENT REGISTRY • SEPOLIA TESTNET" />
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Explore Events Marketplace
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Browse authenticated conferences, hackathons, and music festivals. Every purchased pass is cryptographically bound to your wallet.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="glass-panel rounded-2xl p-5 space-y-4 border border-white/[0.08]">
        {/* Top Search Input & Sort Selector */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="relative md:col-span-8">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by event title, venue, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
          </div>

          <div className="md:col-span-4 flex items-center gap-2">
            <div className="relative flex-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 text-xs bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-400 appearance-none cursor-pointer"
              >
                <option value="DATE_ASC">Date: Soonest First</option>
                <option value="DATE_DESC">Date: Furthest First</option>
                <option value="PRICE_ASC">Price: Low to High</option>
                <option value="PRICE_DESC">Price: High to Low</option>
              </select>
            </div>

            <button
              onClick={handleResetFilters}
              title="Reset all filters"
              className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mr-1 font-mono uppercase text-[10px]">
            <Tag className="w-3 h-3 text-cyan-400" /> Categories:
          </span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600/30 text-cyan-300 border border-cyan-400/50 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {cat === 'ALL' ? 'All Categories' : cat}
            </button>
          ))}
        </div>

        {/* Detailed Secondary Filters: Price Slider & Date Picker */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800/80 text-xs">
          {/* Price Range Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5 text-cyan-400" /> Max Price Filter:
              </span>
              <span className="font-mono text-cyan-300 font-bold">₹{maxPrice.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="200"
              max="3000"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>₹200</span>
              <span>₹1,500</span>
              <span>₹3,000</span>
            </div>
          </div>

          {/* Date Picker Filter */}
          <div className="space-y-1.5">
            <span className="text-slate-300 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Filter Starting From Date:
            </span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Results Header and Counter */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          Showing <span className="text-white font-bold">{filteredEvents.length}</span> of {events.length} blockchain events
        </span>
        {searchTerm && (
          <span className="font-mono text-cyan-400">
            Query: "{searchTerm}"
          </span>
        )}
      </div>

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
            <Ticket className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No matching events found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search keywords, increasing the price filter, or resetting all filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="py-2 px-4 rounded-xl text-xs font-bold bg-blue-600/30 text-cyan-300 border border-cyan-400/50 hover:bg-blue-600/50 transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      )}

    </div>
  );
};
