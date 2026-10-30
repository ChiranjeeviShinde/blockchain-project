import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { DEMO_ACCOUNTS, INITIAL_EVENTS, INITIAL_TICKETS, INITIAL_TRANSACTIONS } from '../data/initialData';
import {
  isMetaMaskInstalled,
  getBrowserProvider,
  getCurrentChainId,
  switchToSepolia,
  connectMetaMaskWallet,
  parseBlockchainError,
  fetchOnChainEvents,
  fetchUserOnChainTickets,
  getSignerContract,
  getReadOnlyContract,
} from '../services/blockchainService';
import {
  SEPOLIA_CHAIN_ID,
  getContractAddress,
  setContractAddress as saveContractAddressToStorage,
} from '../contracts/contractConfig';

const BlockchainContext = createContext(null);

const STORAGE_KEYS = {
  EVENTS: 'tixora_events_v2',
  TICKETS: 'tixora_tickets_v2',
  TRANSACTIONS: 'tixora_transactions_v2',
  ACCOUNT: 'tixora_active_account_v2',
  MODE: 'tixora_operating_mode_v2',
};

export const BlockchainProvider = ({ children }) => {
  // Operating Mode: 'DEMO' | 'ON_CHAIN'
  const [activeMode, setActiveMode] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.MODE) || 'DEMO';
    } catch {
      return 'DEMO';
    }
  });

  // Configured Smart Contract Address on Sepolia
  const [contractAddress, setContractAddressState] = useState(() => getContractAddress());
  const isContractConfigured = Boolean(contractAddress && ethers.isAddress(contractAddress));

  // Network State
  const [networkChainId, setNetworkChainId] = useState(null);
  const isSepolia = networkChainId === SEPOLIA_CHAIN_ID;
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [walletError, setWalletError] = useState('');

  // Contract Owner address on-chain
  const [contractOwner, setContractOwner] = useState(null);

  // Local / Simulated state
  const [events, setEvents] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EVENTS);
      return saved ? JSON.parse(saved) : INITIAL_EVENTS;
    } catch {
      return INITIAL_EVENTS;
    }
  });

  const [tickets, setTickets] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TICKETS);
      return saved ? JSON.parse(saved) : INITIAL_TICKETS;
    } catch {
      return INITIAL_TICKETS;
    }
  });

  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  // Active connected account: null when disconnected!
  const [currentAccount, setCurrentAccount] = useState(() => {
    try {
      const savedId = localStorage.getItem(STORAGE_KEYS.ACCOUNT);
      if (!savedId || savedId === 'disconnected') return null;
      const found = DEMO_ACCOUNTS.find(a => a.id === savedId);
      return found || null;
    } catch {
      return null;
    }
  });

  // Organizer manual override for demonstration / academic review testing
  const [organizerOverride, setOrganizerOverride] = useState(false);

  // Organizer authorization logic
  const isOrganizer = Boolean(
    organizerOverride ||
    (currentAccount && (
      currentAccount.role === 'ORGANIZER' ||
      currentAccount.id === 'acc-3' ||
      currentAccount.shortName?.toLowerCase() === 'organizer' ||
      (contractOwner && currentAccount.address && contractOwner.toLowerCase() === currentAccount.address.toLowerCase()) ||
      currentAccount.address?.toLowerCase() === '0x9e104a0e98b281699923838d64a38f02434e84a7'
    ))
  );

  // Modals state
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [purchaseModalEvent, setPurchaseModalEvent] = useState(null);
  const [transferModalTicket, setTransferModalTicket] = useState(null);
  const [detailModalTicket, setDetailModalTicket] = useState(null);
  const [toast, setToast] = useState(null);

  // Persistence effects
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    } catch (e) {
      console.warn(e);
    }
  }, [events]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
    } catch (e) {
      console.warn(e);
    }
  }, [tickets]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.warn(e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MODE, activeMode);
    } catch (e) {
      console.warn(e);
    }
  }, [activeMode]);

  useEffect(() => {
    try {
      if (currentAccount) {
        localStorage.setItem(STORAGE_KEYS.ACCOUNT, currentAccount.id);
      } else {
        localStorage.setItem(STORAGE_KEYS.ACCOUNT, 'disconnected');
      }
    } catch (e) {
      console.warn(e);
    }
  }, [currentAccount]);

  // Helper to show toasts
  const showToast = useCallback((title, message, type = 'info') => {
    const id = Date.now();
    setToast({ id, title, message, type });
    setTimeout(() => {
      setToast(curr => (curr?.id === id ? null : curr));
    }, 4500);
  }, []);

  // Update Contract Address
  const updateContractAddress = (address) => {
    saveContractAddressToStorage(address);
    setContractAddressState(address ? address.trim() : '');
    showToast(
      'Contract Address Updated',
      address ? `Configured Sepolia Contract: ${address.substring(0, 8)}...` : 'Contract address cleared.',
      'info'
    );
  };

  // Check Chain ID on load & listen to MetaMask events
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    getCurrentChainId().then(id => {
      if (id) setNetworkChainId(id);
    });

    const handleAccountsChanged = async (accounts) => {
      if (!accounts || accounts.length === 0) {
        setCurrentAccount(null);
        showToast('MetaMask Disconnected', 'Wallet accounts unlocked or disconnected in MetaMask.', 'info');
      } else {
        const rawAddress = accounts[0];
        try {
          const provider = getBrowserProvider();
          const balanceWei = await provider.getBalance(rawAddress);
          const balanceEth = parseFloat(ethers.formatEther(balanceWei)).toFixed(4);
          const checksumAddress = ethers.getAddress(rawAddress);

          setCurrentAccount({
            id: `metamask-${checksumAddress.toLowerCase()}`,
            name: `MetaMask Wallet`,
            shortName: `${checksumAddress.substring(0, 6)}...${checksumAddress.substring(checksumAddress.length - 4)}`,
            role: 'ATTENDEE',
            address: checksumAddress,
            shortAddress: `${checksumAddress.substring(0, 6)}...${checksumAddress.substring(checksumAddress.length - 4)}`,
            balanceEth: `${balanceEth} ETH`,
            balanceInr: Math.round(parseFloat(balanceEth) * 2500000),
            avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${checksumAddress}`,
            isMetaMask: true,
          });

          showToast('Account Switched', `Active MetaMask: ${checksumAddress.substring(0, 6)}...${checksumAddress.substring(checksumAddress.length - 4)}`, 'success');
        } catch (err) {
          console.error('Error handling accountsChanged:', err);
        }
      }
    };

    const handleChainChanged = (chainIdHex) => {
      const chainIdNum = parseInt(chainIdHex, 16);
      setNetworkChainId(chainIdNum);
      if (chainIdNum !== SEPOLIA_CHAIN_ID) {
        showToast('Network Changed', 'You are not on Sepolia (Chain ID 11155111). Please switch back for live smart contract calls.', 'warning');
      } else {
        showToast('Sepolia Testnet Active', 'Connected to Ethereum Sepolia Testnet.', 'success');
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [showToast]);

  // Load contract owner when contract address changes
  useEffect(() => {
    if (!isContractConfigured) return;
    const contract = getReadOnlyContract(contractAddress);
    if (!contract) return;

    contract.owner()
      .then(ownerAddr => {
        setContractOwner(ownerAddr);
      })
      .catch(err => {
        console.warn('Could not read contract owner:', err);
      });
  }, [contractAddress, isContractConfigured]);

  // Sync On-Chain Events & User Tickets
  const refreshOnChainData = useCallback(async () => {
    if (!isContractConfigured) return;

    try {
      const onChainEvts = await fetchOnChainEvents(contractAddress);
      if (onChainEvts && onChainEvts.length > 0) {
        setEvents(prev => {
          // Merge: remove previous on-chain events, add freshly fetched on-chain events
          const nonOnChain = prev.filter(e => !e.isOnChain);
          return [...onChainEvts, ...nonOnChain];
        });
      }

      if (currentAccount?.address && currentAccount.isMetaMask) {
        const onChainTkts = await fetchUserOnChainTickets(contractAddress, currentAccount.address);
        if (onChainTkts) {
          setTickets(prev => {
            const nonOnChain = prev.filter(t => !t.isOnChain);
            return [...onChainTkts, ...nonOnChain];
          });
        }
      }
    } catch (err) {
      console.warn('Error refreshing on-chain data:', err);
    }
  }, [contractAddress, isContractConfigured, currentAccount]);

  useEffect(() => {
    refreshOnChainData();
  }, [refreshOnChainData]);

  // Real MetaMask Connect Method
  const connectMetaMask = async () => {
    setIsConnectingWallet(true);
    setWalletError('');
    try {
      const walletInfo = await connectMetaMaskWallet();
      const newAcc = {
        id: `metamask-${walletInfo.address.toLowerCase()}`,
        name: `MetaMask Wallet`,
        shortName: walletInfo.shortAddress,
        role: 'ATTENDEE',
        address: walletInfo.address,
        shortAddress: walletInfo.shortAddress,
        balanceEth: walletInfo.balanceEth,
        balanceInr: Math.round(parseFloat(walletInfo.balanceEth) * 2500000),
        avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${walletInfo.address}`,
        isMetaMask: true,
      };

      setCurrentAccount(newAcc);
      setActiveMode(isContractConfigured ? 'ON_CHAIN' : 'DEMO');
      setNetworkChainId(walletInfo.chainId);
      setIsWalletModalOpen(false);

      showToast(
        'MetaMask Connected',
        `Connected to ${walletInfo.shortAddress} on Sepolia Testnet.`,
        'success'
      );
      return newAcc;
    } catch (err) {
      console.error('MetaMask connection failed:', err);
      const friendlyMsg = parseBlockchainError(err);
      setWalletError(friendlyMsg);
      showToast('Connection Failed', friendlyMsg, 'error');
      throw err;
    } finally {
      setIsConnectingWallet(false);
    }
  };

  // Switch Network to Sepolia
  const handleSwitchToSepolia = async () => {
    try {
      await switchToSepolia();
      setNetworkChainId(SEPOLIA_CHAIN_ID);
      showToast('Network Switched', 'Active network changed to Ethereum Sepolia Testnet.', 'success');
    } catch (err) {
      const msg = parseBlockchainError(err);
      showToast('Network Switch Failed', msg, 'error');
    }
  };

  // Connect Simulated / Demo Wallet (Alice / Bob / Organizer)
  const connectWallet = (account) => {
    setCurrentAccount(account);
    setIsWalletModalOpen(false);
    showToast('Demo Wallet Connected', `Connected to ${account.shortName} (${account.shortAddress})`, 'success');
  };

  // Disconnect Wallet
  const disconnectWallet = () => {
    setCurrentAccount(null);
    showToast('Wallet Disconnected', 'Disconnected active Web3 session.', 'info');
  };

  // Switch demo account
  const switchAccount = (accountId) => {
    const target = DEMO_ACCOUNTS.find(a => a.id === accountId);
    if (target) {
      setCurrentAccount(target);
      showToast('Account Switched', `Active wallet changed to ${target.shortName}`, 'success');
    }
  };

  // Helper random hex for demo simulation
  const generateRandomHex = (length = 64) => {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return '0x' + result;
  };

  // ==========================================
  // 1. TICKET PURCHASE
  // ==========================================
  const purchaseTicket = async ({ event, tier = 'General Admission', quantity = 1, forceDemo = false }) => {
    if (!currentAccount) {
      setIsWalletModalOpen(true);
      throw new Error('Please connect your MetaMask wallet first.');
    }

    // Determine if we are doing a real on-chain transaction
    const shouldExecuteOnChain =
      !forceDemo &&
      currentAccount.isMetaMask &&
      isContractConfigured &&
      (event.isOnChain || activeMode === 'ON_CHAIN');

    if (shouldExecuteOnChain) {
      if (networkChainId !== SEPOLIA_CHAIN_ID) {
        await handleSwitchToSepolia();
      }

      try {
        const provider = getBrowserProvider();

        // 1. Verify contract bytecode exists on Sepolia
        const code = await provider.getCode(contractAddress);
        if (!code || code === '0x' || code === '0x0') {
          throw new Error(
            `No smart contract found at address ${contractAddress} on Sepolia Testnet. Please deploy BlockTix.sol via Remix or switch to Demo Minting mode.`
          );
        }

        // Calculate price in wei
        let priceWei = 0n;
        if (event.priceWei) {
          priceWei = BigInt(event.priceWei);
        } else {
          // Default demo price ~ 0.0001 ETH
          priceWei = ethers.parseEther('0.0001');
        }

        // 2. Verify account has enough Sepolia ETH for value + gas
        const balance = await provider.getBalance(currentAccount.address);
        if (balance < priceWei) {
          throw new Error(
            `Insufficient Sepolia ETH in your wallet (${parseFloat(ethers.formatEther(balance)).toFixed(4)} ETH). You need at least ${ethers.formatEther(priceWei)} ETH plus gas to purchase on-chain. Please request free Sepolia ETH from a faucet or switch to Demo Minting.`
          );
        }

        const contract = await getSignerContract(contractAddress);
        const eventIdToCall = event.contractEventId || 1;

        // Call smart contract purchaseTicket
        const tx = await contract.purchaseTicket(eventIdToCall, tier, {
          value: priceWei,
        });

        const receipt = await tx.wait();

        // Extract minted tokenId from TicketPurchased event if present
        let mintedTokenId = null;
        for (const log of receipt.logs) {
          try {
            const parsed = contract.interface.parseLog(log);
            if (parsed && parsed.name === 'TicketPurchased') {
              mintedTokenId = Number(parsed.args[0]);
              break;
            }
          } catch {
            // Ignore unrelated logs
          }
        }

        const fallbackTokenId = mintedTokenId || Math.floor(100 + Math.random() * 900);
        const newTicketId = `ONCHAIN-TK-${fallbackTokenId}`;
        const now = new Date();
        const formattedDate =
          now.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }) +
          ', ' +
          now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          });

        const newTicket = {
          id: newTicketId,
          tokenId: fallbackTokenId,
          eventId: event.id,
          contractEventId: eventIdToCall,
          eventTitle: event.title,
          eventCategory: event.category,
          eventDate: event.formattedDate,
          eventTime: event.time,
          eventVenue: event.venue,
          eventImage: event.image,
          ownerAddress: currentAccount.address,
          originalMinter: currentAccount.address,
          tier: tier,
          pricePaidEth: `${ethers.formatEther(priceWei)} ETH`,
          pricePaid: event.price,
          mintedAt: now.toISOString(),
          formattedMintedAt: formattedDate,
          status: 'VALID',
          txHash: tx.hash,
          blockNumber: receipt.blockNumber,
          usedAt: null,
          usedByVerifier: null,
          isOnChain: true,
          transferHistory: [
            {
              from: ethers.ZeroAddress,
              to: currentAccount.address,
              date: formattedDate,
              txHash: tx.hash,
              type: 'MINT',
            },
          ],
        };

        setTickets(prev => [newTicket, ...prev]);

        // Add confirmed transaction record
        const newTx = {
          id: `tx-${Date.now()}`,
          action: 'NFT Ticket Minted & Purchased',
          actionType: 'PURCHASE',
          entityId: newTicketId,
          entityName: event.title,
          walletAddress: currentAccount.address,
          shortAddress: currentAccount.shortAddress,
          txHash: tx.hash,
          shortTxHash: `${tx.hash.substring(0, 6)}...${tx.hash.substring(tx.hash.length - 4)}`,
          blockNumber: receipt.blockNumber,
          timestamp: 'Just now',
          status: 'CONFIRMED',
          gasUsed: `${receipt.gasUsed?.toString() || '95,000'} Wei`,
          isOnChain: true,
        };

        setTransactions(prev => [newTx, ...prev]);

        showToast(
          'Ticket Minted On-Chain',
          `NFT Ticket #${fallbackTokenId} confirmed in block ${receipt.blockNumber} on Sepolia!`,
          'success'
        );

        return newTicket;
      } catch (err) {
        console.error('On-chain purchase error:', err);
        const friendlyMsg = parseBlockchainError(err);
        showToast('Purchase Failed', friendlyMsg, 'error');
        throw new Error(friendlyMsg);
      }
    }

    // Fallback Demo Simulation
    const newTicketId = `CP-TK-${Math.floor(1000 + Math.random() * 9000)}`;
    const txHash = generateRandomHex(64);
    const blockNumber = 5826000 + Math.floor(Math.random() * 500);
    const now = new Date();
    const formattedDate =
      now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }) +
      ', ' +
      now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });

    const newTicket = {
      id: newTicketId,
      eventId: event.id,
      eventTitle: event.title,
      eventCategory: event.category,
      eventDate: event.formattedDate,
      eventTime: event.time,
      eventVenue: event.venue,
      eventImage: event.image,
      ownerAddress: currentAccount.address,
      originalMinter: currentAccount.address,
      tier: tier,
      pricePaid: event.price,
      pricePaidEth: '0.0001 ETH (Simulated)',
      mintedAt: now.toISOString(),
      formattedMintedAt: formattedDate,
      status: 'VALID',
      txHash: txHash,
      blockNumber: blockNumber,
      usedAt: null,
      usedByVerifier: null,
      isOnChain: false,
      transferHistory: [
        {
          from: '0x0000000000000000000000000000000000000000',
          to: currentAccount.address,
          date: formattedDate,
          txHash: txHash,
          type: 'MINT',
        },
      ],
    };

    setTickets(prev => [newTicket, ...prev]);
    setEvents(prev =>
      prev.map(ev => {
        if (ev.id === event.id) {
          return {
            ...ev,
            soldTickets: Math.min(ev.totalTickets, ev.soldTickets + quantity),
          };
        }
        return ev;
      })
    );

    const newTx = {
      id: `tx-${Date.now()}`,
      action: 'Ticket Minted & Purchased',
      actionType: 'PURCHASE',
      entityId: newTicketId,
      entityName: event.title,
      walletAddress: currentAccount.address,
      shortAddress: currentAccount.shortAddress,
      txHash: txHash,
      shortTxHash: `${txHash.substring(0, 6)}...${txHash.substring(txHash.length - 4)}`,
      blockNumber: blockNumber,
      timestamp: 'Just now',
      status: 'CONFIRMED',
      gasUsed: `${Math.floor(75000 + Math.random() * 20000).toLocaleString()} Gwei`,
      isOnChain: false,
    };

    setTransactions(prev => [newTx, ...prev]);

    showToast(
      'Ticket Minted Successfully',
      `NFT Ticket ${newTicketId} minted to ${currentAccount.shortAddress} (Demo Mode)`,
      'success'
    );

    return newTicket;
  };

  // Quick helper to claim/mint a test pass directly for the currently connected wallet
  const claimDemoTicket = async (targetEvent = null, tier = 'General Admission') => {
    if (!currentAccount) {
      setIsWalletModalOpen(true);
      throw new Error('Please connect your wallet first.');
    }
    const evt = targetEvent || events[0] || INITIAL_EVENTS[0];
    return await purchaseTicket({
      event: evt,
      tier,
      quantity: 1,
      forceDemo: true,
    });
  };

  // ==========================================
  // 2. TICKET TRANSFER
  // ==========================================
  const transferTicket = async ({ ticketId, toAddress }) => {
    if (!currentAccount) {
      throw new Error('Please connect your wallet first.');
    }

    const cleanAddress = toAddress.trim();
    if (!ethers.isAddress(cleanAddress)) {
      throw new Error('Invalid Ethereum wallet address format. Must begin with 0x followed by 40 hex characters.');
    }

    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) {
      throw new Error('Ticket not found.');
    }

    if (ticket.ownerAddress.toLowerCase() !== currentAccount.address.toLowerCase()) {
      throw new Error('Unauthorized: You are not the current on-chain owner of this ticket.');
    }

    if (ticket.status === 'USED') {
      throw new Error('Cannot transfer: This ticket has already been marked USED at venue entry.');
    }

    if (ticket.ownerAddress.toLowerCase() === cleanAddress.toLowerCase()) {
      throw new Error('Cannot transfer to the same wallet address.');
    }

    // On-Chain Transfer via MetaMask
    if (ticket.isOnChain && ticket.tokenId && currentAccount.isMetaMask && isContractConfigured) {
      try {
        const contract = await getSignerContract(contractAddress);
        const tx = await contract.transferTicket(cleanAddress, ticket.tokenId);
        const receipt = await tx.wait();

        const now = new Date();
        const formattedDate =
          now.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }) +
          ', ' +
          now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          });

        const transferEntry = {
          from: ticket.ownerAddress,
          to: cleanAddress,
          date: formattedDate,
          txHash: tx.hash,
          type: 'TRANSFER',
        };

        setTickets(prev =>
          prev.map(t => {
            if (t.id === ticketId) {
              return {
                ...t,
                ownerAddress: cleanAddress,
                txHash: tx.hash,
                blockNumber: receipt.blockNumber,
                transferHistory: [...t.transferHistory, transferEntry],
              };
            }
            return t;
          })
        );

        const newTx = {
          id: `tx-${Date.now()}`,
          action: 'Ownership Transferred On-Chain',
          actionType: 'TRANSFER',
          entityId: ticketId,
          entityName: ticket.eventTitle,
          walletAddress: cleanAddress,
          shortAddress: `${cleanAddress.substring(0, 6)}...${cleanAddress.substring(cleanAddress.length - 4)}`,
          txHash: tx.hash,
          shortTxHash: `${tx.hash.substring(0, 6)}...${tx.hash.substring(tx.hash.length - 4)}`,
          blockNumber: receipt.blockNumber,
          timestamp: 'Just now',
          status: 'CONFIRMED',
          gasUsed: `${receipt.gasUsed?.toString() || '45,000'} Wei`,
          isOnChain: true,
        };

        setTransactions(prev => [newTx, ...prev]);

        showToast(
          'On-Chain Transfer Confirmed',
          `Ticket #${ticket.tokenId} transferred to ${cleanAddress.substring(0, 6)}... on Sepolia!`,
          'success'
        );

        return { success: true, txHash: tx.hash, blockNumber: receipt.blockNumber, isOnChain: true };
      } catch (err) {
        console.error('On-chain transfer failed:', err);
        const friendlyMsg = parseBlockchainError(err);
        showToast('Transfer Failed', friendlyMsg, 'error');
        throw new Error(friendlyMsg);
      }
    }

    // Simulated Transfer
    const txHash = generateRandomHex(64);
    const blockNumber = 5826500 + Math.floor(Math.random() * 400);
    const now = new Date();
    const formattedDate =
      now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }) +
      ', ' +
      now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });

    const transferEntry = {
      from: ticket.ownerAddress,
      to: cleanAddress,
      date: formattedDate,
      txHash: txHash,
      type: 'TRANSFER',
    };

    setTickets(prev =>
      prev.map(t => {
        if (t.id === ticketId) {
          return {
            ...t,
            ownerAddress: cleanAddress,
            txHash: txHash,
            blockNumber: blockNumber,
            transferHistory: [...t.transferHistory, transferEntry],
          };
        }
        return t;
      })
    );

    const newTx = {
      id: `tx-${Date.now()}`,
      action: 'Ownership Transferred',
      actionType: 'TRANSFER',
      entityId: ticketId,
      entityName: ticket.eventTitle,
      walletAddress: cleanAddress,
      shortAddress: `${cleanAddress.substring(0, 6)}...${cleanAddress.substring(cleanAddress.length - 4)}`,
      txHash: txHash,
      shortTxHash: `${txHash.substring(0, 6)}...${txHash.substring(txHash.length - 4)}`,
      blockNumber: blockNumber,
      timestamp: 'Just now',
      status: 'CONFIRMED',
      gasUsed: `${Math.floor(48000 + Math.random() * 8000).toLocaleString()} Gwei`,
      isOnChain: false,
    };

    setTransactions(prev => [newTx, ...prev]);

    showToast(
      'Ownership Transferred',
      `Ticket ${ticketId} transferred to ${cleanAddress.substring(0, 6)}...${cleanAddress.substring(cleanAddress.length - 4)}`,
      'success'
    );

    return { success: true, txHash, blockNumber, isOnChain: false };
  };

  // ==========================================
  // 3. TICKET VERIFICATION (QR & Manual)
  // ==========================================
  const verifyTicket = async (ticketId) => {
    if (!ticketId) return { found: false, reason: 'Please provide a Ticket ID or scan a QR code.' };
    const query = ticketId.trim();

    // Check if query is an on-chain token ID (e.g. "ONCHAIN-TK-1" or just numeric "1")
    let numericTokenId = null;
    if (/^ONCHAIN-TK-\d+$/i.test(query)) {
      numericTokenId = parseInt(query.split('-')[2], 10);
    } else if (/^\d+$/.test(query)) {
      numericTokenId = parseInt(query, 10);
    }

    // Attempt On-Chain Verification if contract configured
    if (numericTokenId && isContractConfigured) {
      try {
        const contract = getReadOnlyContract(contractAddress);
        if (contract) {
          const res = await contract.verifyTicket(numericTokenId);
          if (res && res.exists) {
            const eventDate = new Date(Number(res.eventTimestamp) * 1000);
            return {
              found: true,
              isOnChain: true,
              isValid: res.isValid,
              isUsed: res.isUsed,
              tokenId: numericTokenId,
              ticket: {
                id: `ONCHAIN-TK-${numericTokenId}`,
                tokenId: numericTokenId,
                eventId: `ONCHAIN-EVT-${res.eventId}`,
                eventTitle: res.eventTitle,
                eventVenue: res.venue,
                eventDate: eventDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                }),
                ownerAddress: res.currentOwner,
                originalMinter: res.originalMinter,
                tier: res.tier || 'General Admission',
                status: res.isUsed ? 'USED' : 'VALID',
                isOnChain: true,
              },
              event: {
                title: res.eventTitle,
                venue: res.venue,
                formattedDate: eventDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                }),
              },
            };
          }
        }
      } catch (err) {
        console.warn('On-chain verification query failed:', err);
      }
    }

    // Local / Demo state lookup
    const ticket = tickets.find(
      t => t.id.toUpperCase() === query.toUpperCase() || (t.tokenId && t.tokenId.toString() === query)
    );

    if (!ticket) {
      return {
        found: false,
        reason: 'Ticket ID not found in blockchain ledger. Invalid or counterfeit ticket.',
      };
    }

    const event = events.find(e => e.id === ticket.eventId);

    return {
      found: true,
      ticket,
      event,
      isValid: ticket.status === 'VALID',
      isUsed: ticket.status === 'USED',
      isOnChain: Boolean(ticket.isOnChain),
    };
  };

  // ==========================================
  // 4. APPROVE TICKET ENTRY (Mark USED)
  // ==========================================
  const approveTicketEntry = async (ticketId) => {
    const ticket = tickets.find(
      t => t.id.toUpperCase() === ticketId.trim().toUpperCase() || (t.tokenId && t.tokenId.toString() === ticketId.trim())
    );

    if (!ticket) {
      throw new Error('Ticket not found in local or on-chain records.');
    }

    if (ticket.status === 'USED') {
      throw new Error('ENTRY DENIED: Ticket has already been used and redeemed on-chain.');
    }

    // On-Chain Execution via MetaMask
    if (ticket.isOnChain && ticket.tokenId && currentAccount?.isMetaMask && isContractConfigured) {
      try {
        const contract = await getSignerContract(contractAddress);
        const tx = await contract.useTicket(ticket.tokenId);
        const receipt = await tx.wait();

        const now = new Date();
        const formattedDate =
          now.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }) +
          ', ' +
          now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }) +
          ' IST';

        let updatedTicket = null;
        setTickets(prev =>
          prev.map(t => {
            if (t.id === ticket.id) {
              updatedTicket = {
                ...t,
                status: 'USED',
                usedAt: formattedDate,
                usedByVerifier: currentAccount ? `${currentAccount.shortAddress}` : 'Gate Validator #1',
                txHash: tx.hash,
              };
              return updatedTicket;
            }
            return t;
          })
        );

        const newTx = {
          id: `tx-${Date.now()}`,
          action: 'Entry Verified & Redeemed On-Chain',
          actionType: 'VERIFY',
          entityId: ticket.id,
          entityName: ticket.eventTitle,
          walletAddress: currentAccount.address,
          shortAddress: currentAccount.shortAddress,
          txHash: tx.hash,
          shortTxHash: `${tx.hash.substring(0, 6)}...${tx.hash.substring(tx.hash.length - 4)}`,
          blockNumber: receipt.blockNumber,
          timestamp: 'Just now',
          status: 'CONFIRMED',
          gasUsed: `${receipt.gasUsed?.toString() || '38,000'} Wei`,
          isOnChain: true,
        };

        setTransactions(prev => [newTx, ...prev]);

        showToast(
          'Entry Approved On-Chain',
          `Ticket #${ticket.tokenId} status set to USED in block ${receipt.blockNumber} on Sepolia!`,
          'success'
        );

        return updatedTicket;
      } catch (err) {
        console.error('On-chain entry approval failed:', err);
        const friendlyMsg = parseBlockchainError(err);
        showToast('Approval Failed', friendlyMsg, 'error');
        throw new Error(friendlyMsg);
      }
    }

    // Simulated Entry Approval
    const now = new Date();
    const formattedDate =
      now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }) +
      ', ' +
      now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }) +
      ' IST';

    const txHash = generateRandomHex(64);
    const blockNumber = 5827000 + Math.floor(Math.random() * 300);

    let updatedTicket = null;

    setTickets(prev =>
      prev.map(t => {
        if (t.id === ticket.id) {
          updatedTicket = {
            ...t,
            status: 'USED',
            usedAt: formattedDate,
            usedByVerifier: currentAccount ? `${currentAccount.shortName} (${currentAccount.shortAddress})` : 'Gate Validator #1',
          };
          return updatedTicket;
        }
        return t;
      })
    );

    const newTx = {
      id: `tx-${Date.now()}`,
      action: 'Entry Verified & Redeemed',
      actionType: 'VERIFY',
      entityId: ticket.id,
      entityName: ticket.eventTitle,
      walletAddress: currentAccount ? currentAccount.address : '0x9E104a0e98B281699923838D64a38F02434E84A7',
      shortAddress: currentAccount ? currentAccount.shortAddress : '0x9E10...84A7',
      txHash: txHash,
      shortTxHash: `${txHash.substring(0, 6)}...${txHash.substring(txHash.length - 4)}`,
      blockNumber: blockNumber,
      timestamp: 'Just now',
      status: 'CONFIRMED',
      gasUsed: `${Math.floor(41000 + Math.random() * 5000).toLocaleString()} Gwei`,
      isOnChain: false,
    };

    setTransactions(prev => [newTx, ...prev]);

    showToast('Entry Approved', `Ticket ${ticket.id} status changed to USED.`, 'success');
    return updatedTicket;
  };

  // ==========================================
  // 5. CREATE EVENT
  // ==========================================
  const createEvent = async (eventData) => {
    // If connected with MetaMask on Sepolia and contract configured, execute on-chain
    if (currentAccount?.isMetaMask && isContractConfigured) {
      try {
        const contract = await getSignerContract(contractAddress);
        const timestamp = Math.floor(new Date(eventData.date).getTime() / 1000);
        // Default price in wei (e.g. 0.0001 ETH)
        const priceWei = eventData.priceEth ? ethers.parseEther(eventData.priceEth.toString()) : ethers.parseEther('0.0001');
        const maxSupply = Number(eventData.totalTickets) || 100;

        const tx = await contract.createEvent(
          eventData.title,
          eventData.category || 'Technology',
          eventData.venue,
          timestamp,
          priceWei,
          maxSupply,
          eventData.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
          eventData.description || 'On-chain BlockTix verified event'
        );

        const receipt = await tx.wait();

        // Extract eventId from EventCreated event if present
        let newEventId = null;
        for (const log of receipt.logs) {
          try {
            const parsed = contract.interface.parseLog(log);
            if (parsed && parsed.name === 'EventCreated') {
              newEventId = Number(parsed.args[0]);
              break;
            }
          } catch {
            // Ignore
          }
        }

        const fallbackEventId = newEventId || Math.floor(100 + Math.random() * 900);
        const newId = `ONCHAIN-EVT-${fallbackEventId}`;

        const newEvent = {
          id: newId,
          contractEventId: fallbackEventId,
          title: eventData.title,
          category: eventData.category || 'Technology',
          date: eventData.date,
          formattedDate: new Date(eventData.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          time: eventData.time || '10:00 AM - 05:00 PM IST',
          venue: eventData.venue,
          price: Number(eventData.price) || 999,
          priceEth: `${ethers.formatEther(priceWei)} ETH`,
          priceWei: priceWei.toString(),
          totalTickets: maxSupply,
          soldTickets: 0,
          image: eventData.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
          organizer: currentAccount.shortName,
          organizerAddress: currentAccount.address,
          contractAddress: contractAddress,
          tokenStandard: 'ERC-721',
          network: 'Sepolia Testnet',
          status: 'ACTIVE',
          description: eventData.description,
          tags: ['On-Chain', 'ERC-721', 'Sepolia Testnet', 'Tixora Verified'],
          isOnChain: true,
        };

        setEvents(prev => [newEvent, ...prev]);

        const newTx = {
          id: `tx-${Date.now()}`,
          action: 'Event Registered On-Chain',
          actionType: 'DEPLOY',
          entityId: newId,
          entityName: newEvent.title,
          walletAddress: currentAccount.address,
          shortAddress: currentAccount.shortAddress,
          txHash: tx.hash,
          shortTxHash: `${tx.hash.substring(0, 6)}...${tx.hash.substring(tx.hash.length - 4)}`,
          blockNumber: receipt.blockNumber,
          timestamp: 'Just now',
          status: 'CONFIRMED',
          gasUsed: `${receipt.gasUsed?.toString() || '120,000'} Wei`,
          isOnChain: true,
        };

        setTransactions(prev => [newTx, ...prev]);

        showToast(
          'Event Created On-Chain',
          `Event registered in block ${receipt.blockNumber} on Sepolia!`,
          'success'
        );

        return newEvent;
      } catch (err) {
        console.error('On-chain event creation failed:', err);
        const friendlyMsg = parseBlockchainError(err);
        showToast('Event Creation Failed', friendlyMsg, 'error');
        throw new Error(friendlyMsg);
      }
    }

    // Simulated Event Creation
    const newId = `EVT-${Math.floor(105 + Math.random() * 890)}`;
    const mockContractAddress = generateRandomHex(40);
    const txHash = generateRandomHex(64);
    const blockNumber = 5828000 + Math.floor(Math.random() * 100);

    const newEvent = {
      id: newId,
      title: eventData.title,
      category: eventData.category || 'Technology',
      date: eventData.date,
      formattedDate: new Date(eventData.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      time: eventData.time || '10:00 AM - 05:00 PM IST',
      venue: eventData.venue,
      price: Number(eventData.price) || 0,
      totalTickets: Number(eventData.totalTickets) || 100,
      soldTickets: 0,
      image: eventData.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
      organizer: eventData.organizer || (currentAccount ? currentAccount.shortName : 'Tixora Community'),
      organizerAddress: currentAccount ? currentAccount.address : '0x9E104a0e98B281699923838D64a38F02434E84A7',
      contractAddress: mockContractAddress,
      tokenStandard: 'ERC-721',
      network: 'Sepolia Testnet (Simulated)',
      status: 'ACTIVE',
      description: eventData.description,
      tags: ['Live Event', 'ERC-721', 'Tixora Verified'],
      isOnChain: false,
    };

    setEvents(prev => [newEvent, ...prev]);

    const newTx = {
      id: `tx-${Date.now()}`,
      action: 'Event Created (Demo)',
      actionType: 'DEPLOY',
      entityId: newId,
      entityName: newEvent.title,
      walletAddress: currentAccount ? currentAccount.address : '0x9E104a0e98B281699923838D64a38F02434E84A7',
      shortAddress: currentAccount ? currentAccount.shortAddress : '0x9E10...84A7',
      txHash: txHash,
      shortTxHash: `${txHash.substring(0, 6)}...${txHash.substring(txHash.length - 4)}`,
      blockNumber: blockNumber,
      timestamp: 'Just now',
      status: 'CONFIRMED',
      gasUsed: '1,480,200 Gwei',
      isOnChain: false,
    };

    setTransactions(prev => [newTx, ...prev]);

    showToast(
      'Event Created (Demo Mode)',
      `Event created with simulated contract ${mockContractAddress.substring(0, 8)}...`,
      'success'
    );

    return newEvent;
  };

  // Reset Demo Data
  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEYS.EVENTS);
    localStorage.removeItem(STORAGE_KEYS.TICKETS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.ACCOUNT);

    setEvents(INITIAL_EVENTS);
    setTickets(INITIAL_TICKETS);
    setTransactions(INITIAL_TRANSACTIONS);
    setCurrentAccount(null);

    showToast('Demo State Reset', 'Initial blockchain tickets and events have been restored.', 'info');
  };

  return (
    <BlockchainContext.Provider
      value={{
        // Mode & Network
        activeMode,
        setActiveMode,
        networkChainId,
        isSepolia,
        switchToSepoliaNetwork: handleSwitchToSepolia,
        isMetaMaskInstalled: isMetaMaskInstalled(),
        isConnectingWallet,
        walletError,

        // Contract config
        contractAddress,
        setContractAddress: updateContractAddress,
        isContractConfigured,
        contractOwner,
        refreshOnChainData,

        // Data lists
        events,
        tickets,
        transactions,
        demoAccounts: DEMO_ACCOUNTS,
        currentAccount,
        isOrganizer,
        organizerOverride,
        setOrganizerOverride,

        // Wallet actions
        connectMetaMask,
        connectWallet,
        disconnectWallet,
        switchAccount,

        // Contract / Core actions
        purchaseTicket,
        claimDemoTicket,
        transferTicket,
        verifyTicket,
        approveTicketEntry,
        createEvent,
        resetDemoData,

        // Modals & Toasts
        isWalletModalOpen,
        setIsWalletModalOpen,
        purchaseModalEvent,
        setPurchaseModalEvent,
        transferModalTicket,
        setTransferModalTicket,
        detailModalTicket,
        setDetailModalTicket,
        toast,
        showToast,
      }}
    >
      {children}
    </BlockchainContext.Provider>
  );
};

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
};
