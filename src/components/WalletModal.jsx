import React, { useState } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { 
  X, 
  Wallet, 
  Check, 
  Sparkles, 
  Shield, 
  ArrowRight, 
  RefreshCw, 
  AlertTriangle, 
  ExternalLink, 
  Layers, 
  Settings2,
  Globe
} from 'lucide-react';

export const WalletModal = () => {
  const {
    isWalletModalOpen,
    setIsWalletModalOpen,
    demoAccounts,
    currentAccount,
    connectWallet,
    disconnectWallet,
    connectMetaMask,
    isMetaMaskInstalled,
    isConnectingWallet,
    walletError,
    networkChainId,
    isSepolia,
    switchToSepoliaNetwork,
    contractAddress,
    setContractAddress,
    isContractConfigured,
    activeMode,
    setActiveMode,
  } = useBlockchain();

  const [activeTab, setActiveTab] = useState('METAMASK'); // 'METAMASK' | 'DEMO' | 'CONFIG'
  const [tempContractAddress, setTempContractAddress] = useState(contractAddress || '');
  const [addressSaved, setAddressSaved] = useState(false);
  const [localError, setLocalError] = useState('');

  if (!isWalletModalOpen) return null;

  const handleMetaMaskConnect = async () => {
    setLocalError('');
    if (!isMetaMaskInstalled) {
      window.open('https://metamask.io/download/', '_blank', 'noopener,noreferrer');
      return;
    }

    try {
      await connectMetaMask();
    } catch (err) {
      setLocalError(err.message || 'MetaMask connection failed.');
    }
  };

  const handleSaveContract = (e) => {
    e.preventDefault();
    const clean = tempContractAddress.trim();
    if (clean && !/^0x[a-fA-F0-9]{40}$/.test(clean)) {
      setLocalError('Contract address must begin with 0x followed by exactly 40 hex characters.');
      return;
    }
    setLocalError('');
    setContractAddress(clean);
    setAddressSaved(true);
    setTimeout(() => setAddressSaved(false), 2500);
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
              <p className="text-xs text-slate-400">MetaMask & Ethereum Sepolia Testnet</p>
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
                <div className="flex items-center gap-2">
                  <p className="text-xs text-slate-400">Currently Connected</p>
                  {currentAccount.isMetaMask ? (
                    <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                      METAMASK • SEPOLIA
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded">
                      DEMO SIMULATION
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-white font-mono mt-0.5">
                  {currentAccount.shortAddress} ({currentAccount.shortName})
                </p>
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

        {/* Network Warning Banner if Connected to Non-Sepolia Network */}
        {currentAccount?.isMetaMask && !isSepolia && (
          <div className="my-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Wrong Network: Sepolia Testnet required (Chain ID: 11155111)</span>
            </div>
            <button
              onClick={switchToSepoliaNetwork}
              className="px-2.5 py-1 bg-amber-500 text-slate-950 font-bold rounded hover:bg-amber-400 transition-colors text-[11px]"
            >
              Switch to Sepolia
            </button>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 my-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('METAMASK')}
            className={`flex-1 py-2 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'METAMASK'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>MetaMask (Real Web3)</span>
          </button>
          <button
            onClick={() => setActiveTab('DEMO')}
            className={`flex-1 py-2 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'DEMO'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Demo Wallets</span>
          </button>
          <button
            onClick={() => setActiveTab('CONFIG')}
            className={`flex-1 py-2 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'CONFIG'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Smart Contract</span>
          </button>
        </div>

        {/* TAB 1: Real MetaMask */}
        {activeTab === 'METAMASK' && (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    🦊
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">MetaMask Browser Extension</h4>
                    <p className="text-[11px] text-slate-400">
                      {isMetaMaskInstalled ? 'Extension detected in browser' : 'MetaMask not detected'}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                  isMetaMaskInstalled ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {isMetaMaskInstalled ? 'INSTALLED' : 'NOT FOUND'}
                </span>
              </div>

              <div className="text-xs text-slate-300 space-y-1.5 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Target Network:</span>
                  <span className="text-cyan-300 font-mono font-semibold">Sepolia Testnet (Chain ID 11155111)</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Contract Status:</span>
                  <span className={`font-mono font-semibold ${isContractConfigured ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {isContractConfigured ? `${contractAddress.substring(0, 6)}...${contractAddress.substring(contractAddress.length - 4)}` : 'Not Configured (Demo Mode)'}
                  </span>
                </div>
              </div>

              {(walletError || localError) && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{localError || walletError}</span>
                </div>
              )}

              <button
                onClick={handleMetaMaskConnect}
                disabled={isConnectingWallet}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 shadow-glow-amber transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isConnectingWallet ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Connecting MetaMask...</span>
                  </>
                ) : isMetaMaskInstalled ? (
                  <>
                    <span>Connect with MetaMask</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Install MetaMask Extension</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
              <p className="font-semibold text-slate-300">Need Sepolia Testnet ETH?</p>
              <p>You can obtain free test ETH from Google Cloud Sepolia Faucet or PoW Sepolia Faucet without real money.</p>
            </div>
          </div>
        )}

        {/* TAB 2: Demo Accounts */}
        {activeTab === 'DEMO' && (
          <div className="space-y-3 py-2">
            <p className="text-xs text-slate-400">
              Select a simulated wallet for local demonstration without needing MetaMask or testnet ETH:
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {demoAccounts.map(account => {
                const isSelected = currentAccount?.id === account.id;
                return (
                  <div
                    key={account.id}
                    onClick={() => {
                      setActiveMode('DEMO');
                      connectWallet(account);
                    }}
                    className={`group cursor-pointer p-3 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-600/20 border-cyan-400 shadow-glow-cyan/50 text-white'
                        : 'bg-slate-900/60 border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/50 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={account.avatar}
                        alt={account.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">
                            {account.name}
                          </span>
                          {isSelected && (
                            <span className="px-1.5 py-0.2 text-[9px] bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 rounded font-mono">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono">{account.shortAddress}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-cyan-300">{account.balanceEth}</p>
                      <p className="text-[10px] text-slate-400">≈ ₹{(account.balanceInr).toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: Contract Address Configuration */}
        {activeTab === 'CONFIG' && (
          <div className="space-y-4 py-2">
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div>
                <label className="text-xs font-bold text-white block">
                  BlockTix Sepolia Contract Address
                </label>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Paste the address where you deployed <code className="text-cyan-300 font-mono">contracts/BlockTix.sol</code> on Sepolia:
                </p>
              </div>

              <form onSubmit={handleSaveContract} className="space-y-2.5">
                <input
                  type="text"
                  placeholder="0x... (e.g. 0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7)"
                  value={tempContractAddress}
                  onChange={(e) => setTempContractAddress(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                />

                {addressSaved && (
                  <p className="text-xs text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Contract address saved to local storage!</span>
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 px-3 text-xs font-bold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors"
                  >
                    Save Contract Address
                  </button>
                  {contractAddress && (
                    <button
                      type="button"
                      onClick={() => {
                        setTempContractAddress('');
                        setContractAddress('');
                      }}
                      className="py-2 px-3 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-500/20 text-[11px] text-slate-300 space-y-1.5">
              <p className="font-semibold text-cyan-300">How to deploy to Sepolia:</p>
              <ol className="list-decimal list-inside space-y-1 text-slate-400">
                <li>Deploy using Remix IDE (<span className="text-slate-200">remix.ethereum.org</span>) with MetaMask on Sepolia.</li>
                <li>Or run <code className="text-cyan-300 font-mono">node scripts/deploy.js</code> with your private key in environment variables.</li>
                <li>Paste the deployed address above or configure <code className="text-cyan-300 font-mono">VITE_CONTRACT_ADDRESS</code> in <code className="text-cyan-300 font-mono">.env</code>.</li>
              </ol>
            </div>
          </div>
        )}

        {/* Security & Academic Notice */}
        <div className="mt-4 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-400">
          <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Security Notice: This dApp never requests or stores your private key or seed phrase.</span>
        </div>
      </div>
    </div>
  );
};
