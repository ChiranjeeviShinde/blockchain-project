import React, { useState } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { TicketQRCode } from './TicketQRCode';
import confetti from 'canvas-confetti';
import { 
  X, 
  CheckCircle2, 
  Loader2, 
  Sparkles, 
  ShieldCheck, 
  Wallet, 
  ArrowRight,
  ExternalLink,
  Layers,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PurchaseModal = () => {
  const { 
    purchaseModalEvent, 
    setPurchaseModalEvent, 
    currentAccount, 
    setIsWalletModalOpen,
    purchaseTicket,
    networkChainId,
    isSepolia,
    switchToSepoliaNetwork,
    contractAddress,
    isContractConfigured,
    activeMode,
  } = useBlockchain();

  const navigate = useNavigate();

  // purchase state: 'IDLE' | 'CONFIRMING' | 'MINTING' | 'SUCCESS' | 'ERROR'
  const [purchaseStep, setPurchaseStep] = useState('IDLE');
  const [ticketTier, setTicketTier] = useState('General Admission');
  const [createdTicket, setCreatedTicket] = useState(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const [purchaseError, setPurchaseError] = useState('');

  // Preference for minting mode: 'ON_CHAIN' or 'DEMO'
  const [mintModePreference, setMintModePreference] = useState(() => {
    return (currentAccount?.isMetaMask && isContractConfigured && activeMode === 'ON_CHAIN') ? 'ON_CHAIN' : 'DEMO';
  });

  if (!purchaseModalEvent) return null;

  const event = purchaseModalEvent;
  const isVip = ticketTier === 'VIP Pass (+ ₹1000)';
  const price = isVip ? event.price + 1000 : event.price;
  const isOnChainMode = Boolean(currentAccount?.isMetaMask && isContractConfigured && mintModePreference === 'ON_CHAIN');
  const displayEthPrice = event.priceEth || '0.0001 ETH';

  const handleStartPurchase = async () => {
    if (!currentAccount) {
      setIsWalletModalOpen(true);
      return;
    }

    setPurchaseError('');

    try {
      if (isOnChainMode && currentAccount.isMetaMask && !isSepolia) {
        await switchToSepoliaNetwork();
      }

      setPurchaseStep('CONFIRMING');

      // Call purchaseTicket which handles MetaMask transaction or demo fallback
      const minted = await purchaseTicket({
        event,
        tier: ticketTier,
        quantity: 1,
        forceDemo: !isOnChainMode,
      });

      setCreatedTicket(minted);
      setPurchaseStep('SUCCESS');

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        // ignore if canvas-confetti is not loaded
      }
    } catch (err) {
      console.error('Purchase failed in modal:', err);
      setPurchaseError(err.message || 'Transaction could not be completed.');
      setPurchaseStep('ERROR');
    }
  };

  const handleClose = () => {
    setPurchaseModalEvent(null);
    setPurchaseStep('IDLE');
    setCreatedTicket(null);
    setPurchaseError('');
  };

  const handleViewTickets = () => {
    handleClose();
    navigate('/my-tickets');
  };

  const copyHash = (hash) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-[#0c122c] border border-blue-500/40 rounded-2xl p-6 shadow-2xl shadow-blue-950/80 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono tracking-widest text-cyan-400 uppercase font-semibold">
                ERC-721 SMART CONTRACT MINT
              </span>
              {isOnChainMode && (
                <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded">
                  LIVE SEPOLIA
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-white mt-0.5">
              {purchaseStep === 'SUCCESS' ? 'Ticket Minted Successfully!' : 'Get Event Pass'}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. IDLE / PREPARATION STATE */}
        {purchaseStep === 'IDLE' && (
          <div className="py-4 space-y-4">
            {/* Event Summary Card */}
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <img
                src={event.image}
                alt={event.title}
                className="w-16 h-16 rounded-lg object-cover border border-slate-700"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white truncate">{event.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{event.formattedDate} • {event.venue}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-500/30">
                    {event.category}
                  </span>
                  <span className="text-xs font-bold text-cyan-400">
                    {isOnChainMode ? displayEthPrice : `₹${price.toLocaleString()}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Ticket Tier Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">Select Ticket Tier</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTicketTier('General Admission')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    ticketTier === 'General Admission'
                      ? 'bg-blue-600/25 border-cyan-400 shadow-glow-cyan/40 text-white'
                      : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <p className="text-xs font-bold">General Admission</p>
                  <p className="text-sm font-semibold text-cyan-300 mt-1">
                    {isOnChainMode ? displayEthPrice : `₹${event.price.toLocaleString()}`}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setTicketTier('VIP Pass (+ ₹1000)')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    ticketTier === 'VIP Pass (+ ₹1000)'
                      ? 'bg-blue-600/25 border-cyan-400 shadow-glow-cyan/40 text-white'
                      : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <p className="text-xs font-bold">VIP Pass (+ ₹1,000)</p>
                  <p className="text-sm font-semibold text-cyan-300 mt-1">
                    {isOnChainMode ? displayEthPrice : `₹${(event.price + 1000).toLocaleString()}`}
                  </p>
                </button>
              </div>
            </div>

            {/* Minting Mode Selector when MetaMask is connected */}
            {currentAccount?.isMetaMask && (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">Minting Mode</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    isOnChainMode ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  }`}>
                    {isOnChainMode ? 'LIVE CONTRACT' : 'DEMO SIMULATION'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMintModePreference('DEMO')}
                    className={`p-2.5 rounded-lg text-left text-xs transition-all border ${
                      !isOnChainMode
                        ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-glow-cyan/20'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <p className="font-bold flex items-center gap-1 text-cyan-300">
                      <Sparkles className="w-3.5 h-3.5" /> Demo Mint (Free)
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Instant test mint to your wallet</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMintModePreference('ON_CHAIN')}
                    disabled={!isContractConfigured}
                    className={`p-2.5 rounded-lg text-left text-xs transition-all border ${
                      isOnChainMode
                        ? 'bg-amber-950/60 border-amber-400 text-white shadow-glow-amber/20'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed'
                    }`}
                  >
                    <p className="font-bold flex items-center gap-1 text-amber-300">
                      <Layers className="w-3.5 h-3.5" /> Sepolia Contract
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {isContractConfigured ? 'Requires Sepolia test ETH' : 'Requires deployed contract'}
                    </p>
                  </button>
                </div>
              </div>
            )}

            {/* Blockchain Details Section */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Connected Wallet</span>
                {currentAccount ? (
                  <span className="font-mono text-cyan-300 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    {currentAccount.shortAddress} {currentAccount.isMetaMask ? '(MetaMask)' : `(${currentAccount.shortName})`}
                  </span>
                ) : (
                  <button
                    onClick={() => setIsWalletModalOpen(true)}
                    className="text-amber-400 underline font-semibold flex items-center gap-1"
                  >
                    <Wallet className="w-3.5 h-3.5" /> Connect Wallet Required
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Smart Contract Standard</span>
                <span className="font-mono text-slate-200">ERC-721 (Non-Fungible Token)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Network</span>
                <span className={`font-mono ${isOnChainMode ? 'text-amber-300 font-bold' : 'text-purple-300'}`}>
                  {isOnChainMode ? 'Ethereum Sepolia Testnet (Live)' : 'Ethereum Sepolia (Demo Mode)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Gas Fee Estimate</span>
                <span className="font-mono text-emerald-400">
                  {isOnChainMode ? 'Standard Sepolia Gas' : '≈ 0.0012 ETH (Simulated)'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-sm font-bold">
                <span className="text-white">Total Amount</span>
                <span className="text-cyan-400">
                  {isOnChainMode ? displayEthPrice : `₹${price.toLocaleString()}`}
                </span>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <button
                onClick={handleStartPurchase}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-brand-blue via-blue-600 to-brand-cyan hover:from-blue-600 hover:to-cyan-400 text-white shadow-glow-blue transition-all flex items-center justify-center gap-2 group"
              >
                <span>Confirm Purchase & Mint Ticket</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* 2. TRANSACTION PROCESSING STATES */}
        {(purchaseStep === 'CONFIRMING' || purchaseStep === 'MINTING') && (
          <div className="py-10 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-blue-500/20 border-t-cyan-400 animate-spin flex items-center justify-center shadow-glow-cyan" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Layers className="w-8 h-8 text-cyan-400 animate-pulse" />
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold text-white tracking-wide">
                {purchaseStep === 'CONFIRMING' 
                  ? (isOnChainMode ? 'Approve in MetaMask...' : 'Confirming Purchase Request...') 
                  : 'Minting NFT on Sepolia Blockchain...'}
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1.5 leading-relaxed">
                {isOnChainMode
                  ? 'Please review and confirm the transaction in your MetaMask browser popup window. Ethers.js is awaiting on-chain block inclusion.'
                  : 'Allocating event ticket token ID and recording ownership on the ledger.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-1.5 text-xs font-mono font-medium ${
                purchaseStep === 'CONFIRMING' ? 'text-amber-400 animate-pulse' : 'text-emerald-400'
              }`}>
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Sign Tx
              </div>
              <span className="w-6 h-[1px] bg-slate-700" />
              <div className={`flex items-center gap-1.5 text-xs font-mono font-medium ${
                purchaseStep === 'MINTING' ? 'text-cyan-400 animate-pulse' : 'text-slate-500'
              }`}>
                <span className="w-2 h-2 rounded-full bg-slate-600" />
                Sepolia Mint
              </div>
              <span className="w-6 h-[1px] bg-slate-700" />
              <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-slate-500">
                <span className="w-2 h-2 rounded-full bg-slate-600" />
                Confirmed
              </div>
            </div>
          </div>
        )}

        {/* ERROR STATE */}
        {purchaseStep === 'ERROR' && (
          <div className="py-6 space-y-4 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/40">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Transaction Cancelled or Failed</h4>
              <p className="text-xs text-rose-300 mt-1.5 max-w-sm mx-auto leading-relaxed">
                {purchaseError}
              </p>
            </div>

            <div className="space-y-2 pt-2">
              {/* One-click Demo Mint fallback */}
              <button
                type="button"
                onClick={async () => {
                  try {
                    setPurchaseStep('CONFIRMING');
                    const minted = await purchaseTicket({
                      event,
                      tier: ticketTier,
                      quantity: 1,
                      forceDemo: true,
                    });
                    setCreatedTicket(minted);
                    setPurchaseStep('SUCCESS');
                    try {
                      confetti({
                        particleCount: 80,
                        spread: 70,
                        origin: { y: 0.6 },
                      });
                    } catch (err) {}
                  } catch (err) {
                    setPurchaseError(err.message || 'Demo minting failed');
                    setPurchaseStep('ERROR');
                  }
                }}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-brand-blue via-blue-600 to-brand-cyan hover:from-blue-600 hover:to-cyan-400 text-white shadow-glow-cyan transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>⚡ Mint in Demo Mode Instead (Instant & Free)</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setPurchaseStep('IDLE')}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Try Again</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. SUCCESS STATE */}
        {purchaseStep === 'SUCCESS' && createdTicket && (
          <div className="py-4 space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-b from-emerald-950/50 to-blue-950/30 border border-emerald-500/40 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/50 mb-2">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-white">Ticket Minted Successfully!</h4>
              <p className="text-xs text-emerald-300 font-mono mt-0.5">
                {createdTicket.isOnChain
                  ? `Recorded on Ethereum Sepolia • Block #${createdTicket.blockNumber}`
                  : 'Saved to local blockchain state • Ready for Gate Entry'}
              </p>
            </div>

            {/* Ticket Card Preview with QR */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
              <div className="shrink-0">
                <TicketQRCode ticket={createdTicket} size={110} showDetails={false} />
              </div>
              <div className="flex-1 space-y-1.5 text-left w-full text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Ticket ID</span>
                  <p className="font-mono font-bold text-cyan-300 text-sm">{createdTicket.id}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Event Name</span>
                  <p className="font-semibold text-white truncate">{createdTicket.eventTitle}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Owner Wallet</span>
                  <p className="font-mono text-slate-300 text-[11px] truncate">{createdTicket.ownerAddress}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Mint Timestamp</span>
                  <p className="text-slate-300 text-[11px]">{createdTicket.formattedMintedAt}</p>
                </div>
              </div>
            </div>

            {/* Tx Hash Row */}
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] text-slate-400 uppercase block font-mono">Transaction Hash</span>
                {createdTicket.isOnChain && createdTicket.txHash?.startsWith('0x') ? (
                  <a
                    href={`https://sepolia.etherscan.io/tx/${createdTicket.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[11px] text-cyan-300 hover:underline flex items-center gap-1 truncate"
                  >
                    <span className="truncate">{createdTicket.txHash}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                ) : (
                  <span className="font-mono text-[11px] text-purple-300 truncate block">
                    {createdTicket.txHash}
                  </span>
                )}
              </div>
              <button
                onClick={() => copyHash(createdTicket.txHash)}
                className="shrink-0 p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 transition-colors"
                title="Copy Transaction Hash"
              >
                {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleClose}
                className="py-2.5 px-3 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleViewTickets}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan hover:from-blue-600 hover:to-cyan-400 text-xs font-bold text-white shadow-glow-cyan transition-all flex items-center justify-center gap-1.5"
              >
                <span>View My Tickets</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
