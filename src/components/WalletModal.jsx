import React, { useState } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { X, Wallet, Check, Sparkles, Shield, ArrowRight, RefreshCw } from 'lucide-react';

export const WalletModal = () => {
  const {
    isWalletModalOpen,
    setIsWalletModalOpen,
    demoAccounts,
    currentAccount,
    connectWallet,
    disconnectWallet
  } = useBlockchain();

  const [customAddress, setCustomAddress] = useState('');
  const [customName, setCustomName] = useState('');
  const [error, setError] = useState('');

  if (!isWalletModalOpen) return null;

  const handleCustomConnect = (e) => {
    e.preventDefault();
    setError('');
    const clean = customAddress.trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(clean)) {
      setError('Address must start with 0x followed by exactly 40 hexadecimal characters.');
      return;
    }

    const customAcc = {
      id: `acc-custom-${Date.now()}`,
      name: customName.trim() || 'Custom Wallet',
      shortName: customName.trim() ? customName.trim().substring(0, 10) : 'Custom',
      address: clean,
      shortAddress: `${clean.substring(0, 6)}...${clean.substring(clean.length - 4)}`,
      balanceEth: '1.500 ETH',
      balanceInr: 375000,
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80'
    };

    connectWallet(customAcc);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-[#0c122c] border border-blue-500/30 rounded-2xl p-6 shadow-2xl shadow-blue-950/60 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-cyan-500/20 via-blue-500/10 to-transparent rounded-full blur-2xl -z-10 pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-cyan flex items-center justify-center text-white shadow-glow-cyan">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">Connect Web3 Wallet</h3>
              <p className="text-xs text-slate-400">Simulate Ethereum / EVM Wallet for Tixora</p>
            </div>
          </div>
          <button
            onClick={() => setIsWalletModalOpen(false)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active connection banner if any */}
        {currentAccount && (
          <div className="my-4 p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <p className="text-xs text-slate-400">Currently Connected</p>
                <p className="text-sm font-semibold text-white font-mono">{currentAccount.shortAddress} ({currentAccount.shortName})</p>
              </div>
            </div>
            <button
              onClick={disconnectWallet}
              className="text-xs px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition-colors"
            >
              Disconnect
            </button>
          </div>
        )}

        {/* Demo Accounts List */}
        <div className="my-4">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
            Select Preset Demo Account
          </label>
          <div className="space-y-2.5">
            {demoAccounts.map(account => {
              const isSelected = currentAccount?.id === account.id;
              return (
                <div
                  key={account.id}
                  onClick={() => connectWallet(account)}
                  className={`group cursor-pointer p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-600/20 border-cyan-400 shadow-glow-cyan/50 text-white'
                      : 'bg-slate-900/60 border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/50 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={account.avatar}
                      alt={account.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-700"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                          {account.name}
                        </span>
                        {isSelected && (
                          <span className="px-1.5 py-0.5 text-[10px] bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 rounded font-mono">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{account.shortAddress}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-cyan-300">{account.balanceEth}</p>
                    <p className="text-[11px] text-slate-400">≈ ₹{(account.balanceInr).toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Address Option */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Or Enter Custom Hex Address
            </span>
            <span className="text-[11px] text-cyan-400 font-mono">Sepolia Testnet</span>
          </div>

          <form onSubmit={handleCustomConnect} className="space-y-2.5">
            <input
              type="text"
              placeholder="0x71A914b43f11E2616Ddf47794D316Fa2930493F2"
              value={customAddress}
              onChange={(e) => setCustomAddress(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-mono bg-slate-950/70 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
            {error && <p className="text-xs text-rose-400">{error}</p>}
            <button
              type="submit"
              disabled={!customAddress.trim()}
              className="w-full py-2 px-3 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              <span>Connect Custom Wallet Address</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Academic Prototype Notice */}
        <div className="mt-4 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-400">
          <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Simulated Web3 interface for B.Tech project review. No real ETH or gas required.</span>
        </div>
      </div>
    </div>
  );
};
