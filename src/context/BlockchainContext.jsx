import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_ACCOUNTS, INITIAL_EVENTS, INITIAL_TICKETS, INITIAL_TRANSACTIONS } from '../data/initialData';

const BlockchainContext = createContext(null);

const STORAGE_KEYS = {
  EVENTS: 'chainpass_events_v1',
  TICKETS: 'chainpass_tickets_v1',
  TRANSACTIONS: 'chainpass_transactions_v1',
  ACCOUNT: 'chainpass_active_account_v1'
};

export const BlockchainProvider = ({ children }) => {
  // Load initial states from localStorage with fallbacks
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

  const [currentAccount, setCurrentAccount] = useState(() => {
    try {
      const savedId = localStorage.getItem(STORAGE_KEYS.ACCOUNT);
      if (savedId === 'disconnected') return null;
      const found = DEMO_ACCOUNTS.find(a => a.id === savedId);
      return found || DEMO_ACCOUNTS[0]; // Default Alice connected
    } catch {
      return DEMO_ACCOUNTS[0];
    }
  });

  const isOrganizer = Boolean(
    currentAccount && (
      currentAccount.role === 'ORGANIZER' ||
      currentAccount.id === 'acc-3' ||
      currentAccount.shortName?.toLowerCase() === 'organizer' ||
      currentAccount.address?.toLowerCase() === '0x9e104a0e98b281699923838d64a38f02434e84a7'
    )
  );

  // Modals state
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [purchaseModalEvent, setPurchaseModalEvent] = useState(null);
  const [transferModalTicket, setTransferModalTicket] = useState(null);
  const [detailModalTicket, setDetailModalTicket] = useState(null);
  const [toast, setToast] = useState(null);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    if (currentAccount) {
      localStorage.setItem(STORAGE_KEYS.ACCOUNT, currentAccount.id);
    } else {
      localStorage.setItem(STORAGE_KEYS.ACCOUNT, 'disconnected');
    }
  }, [currentAccount]);

  // Helper to show toasts
  const showToast = (title, message, type = 'info') => {
    const id = Date.now();
    setToast({ id, title, message, type });
    setTimeout(() => {
      setToast(curr => (curr?.id === id ? null : curr));
    }, 4500);
  };

  // Helper random hex
  const generateRandomHex = (length = 64) => {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return '0x' + result;
  };

  // Wallet methods
  const connectWallet = (account) => {
    setCurrentAccount(account);
    setIsWalletModalOpen(false);
    showToast('Wallet Connected', `Connected to ${account.shortName} (${account.shortAddress})`, 'success');
  };

  const disconnectWallet = () => {
    setCurrentAccount(null);
    showToast('Wallet Disconnected', 'Disconnected from local Web3 provider.', 'info');
  };

  const switchAccount = (accountId) => {
    const target = DEMO_ACCOUNTS.find(a => a.id === accountId);
    if (target) {
      setCurrentAccount(target);
      showToast('Account Switched', `Switched active wallet to ${target.shortName}`, 'success');
    }
  };

  // Ticket Purchase
  const purchaseTicket = async ({ event, tier = 'General Admission', quantity = 1 }) => {
    if (!currentAccount) {
      setIsWalletModalOpen(true);
      throw new Error('Please connect your wallet first.');
    }

    const newTicketId = `CP-TK-${Math.floor(1000 + Math.random() * 9000)}`;
    const txHash = generateRandomHex(64);
    const blockNumber = 5826000 + Math.floor(Math.random() * 500);
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ', ' + now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
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
      mintedAt: now.toISOString(),
      formattedMintedAt: formattedDate,
      status: 'VALID',
      txHash: txHash,
      blockNumber: blockNumber,
      usedAt: null,
      usedByVerifier: null,
      transferHistory: [
        {
          from: '0x0000000000000000000000000000000000000000',
          to: currentAccount.address,
          date: formattedDate,
          txHash: txHash,
          type: 'MINT'
        }
      ]
    };

    // Update tickets
    setTickets(prev => [newTicket, ...prev]);

    // Update event sold count
    setEvents(prev => prev.map(ev => {
      if (ev.id === event.id) {
        return {
          ...ev,
          soldTickets: Math.min(ev.totalTickets, ev.soldTickets + quantity)
        };
      }
      return ev;
    }));

    // Add transaction record
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
      gasUsed: `${Math.floor(75000 + Math.random() * 20000).toLocaleString()} Gwei`
    };

    setTransactions(prev => [newTx, ...prev]);

    showToast(
      'Ticket Minted Successfully',
      `NFT Ticket ${newTicketId} minted to ${currentAccount.shortAddress}`,
      'success'
    );

    return newTicket;
  };

  // Ticket Transfer
  const transferTicket = async ({ ticketId, toAddress }) => {
    if (!currentAccount) {
      throw new Error('Please connect your wallet first.');
    }

    const cleanAddress = toAddress.trim();
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!ethAddressRegex.test(cleanAddress)) {
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

    const txHash = generateRandomHex(64);
    const blockNumber = 5826500 + Math.floor(Math.random() * 400);
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ', ' + now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const transferEntry = {
      from: ticket.ownerAddress,
      to: cleanAddress,
      date: formattedDate,
      txHash: txHash,
      type: 'TRANSFER'
    };

    // Update ticket
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          ownerAddress: cleanAddress,
          txHash: txHash,
          blockNumber: blockNumber,
          transferHistory: [...t.transferHistory, transferEntry]
        };
      }
      return t;
    }));

    // Add transaction to ledger
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
      gasUsed: `${Math.floor(48000 + Math.random() * 8000).toLocaleString()} Gwei`
    };

    setTransactions(prev => [newTx, ...prev]);

    showToast(
      'Ownership Transferred',
      `Ticket ${ticketId} transferred to ${cleanAddress.substring(0, 6)}...${cleanAddress.substring(cleanAddress.length - 4)}`,
      'success'
    );

    return { success: true, txHash, blockNumber };
  };

  // Verification
  const verifyTicket = (ticketId) => {
    if (!ticketId) return { found: false, reason: 'Please provide a Ticket ID or scan a QR code.' };
    const query = ticketId.trim().toUpperCase();
    const ticket = tickets.find(t => t.id.toUpperCase() === query);

    if (!ticket) {
      return {
        found: false,
        reason: 'Ticket ID not found in blockchain ledger. Invalid or counterfeit ticket.'
      };
    }

    const event = events.find(e => e.id === ticket.eventId);

    return {
      found: true,
      ticket,
      event,
      isValid: ticket.status === 'VALID',
      isUsed: ticket.status === 'USED'
    };
  };

  // Approve Entry (mark USED)
  const approveTicketEntry = (ticketId) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) {
      throw new Error('Ticket not found.');
    }

    if (ticket.status === 'USED') {
      throw new Error('ENTRY DENIED: Ticket has already been used and redeemed.');
    }

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ', ' + now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }) + ' IST';

    const txHash = generateRandomHex(64);
    const blockNumber = 5827000 + Math.floor(Math.random() * 300);

    let updatedTicket = null;

    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        updatedTicket = {
          ...t,
          status: 'USED',
          usedAt: formattedDate,
          usedByVerifier: currentAccount ? `${currentAccount.shortName} (${currentAccount.shortAddress})` : 'Gate Validator #1'
        };
        return updatedTicket;
      }
      return t;
    }));

    // Add transaction to activity
    const newTx = {
      id: `tx-${Date.now()}`,
      action: 'Entry Verified & Redeemed',
      actionType: 'VERIFY',
      entityId: ticketId,
      entityName: ticket.eventTitle,
      walletAddress: currentAccount ? currentAccount.address : '0x9E104a0e98B281699923838D64a38F02434E84A7',
      shortAddress: currentAccount ? currentAccount.shortAddress : '0x9E10...84A7',
      txHash: txHash,
      shortTxHash: `${txHash.substring(0, 6)}...${txHash.substring(txHash.length - 4)}`,
      blockNumber: blockNumber,
      timestamp: 'Just now',
      status: 'CONFIRMED',
      gasUsed: `${Math.floor(41000 + Math.random() * 5000).toLocaleString()} Gwei`
    };

    setTransactions(prev => [newTx, ...prev]);

    showToast('Entry Approved', `Ticket ${ticketId} status changed to USED on-chain.`, 'success');
    return updatedTicket;
  };

  // Create Event
  const createEvent = (eventData) => {
    const newId = `EVT-${Math.floor(105 + Math.random() * 890)}`;
    const contractAddress = generateRandomHex(40);
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
        year: 'numeric'
      }),
      time: eventData.time || '10:00 AM - 05:00 PM IST',
      venue: eventData.venue,
      price: Number(eventData.price) || 0,
      totalTickets: Number(eventData.totalTickets) || 100,
      soldTickets: 0,
      image: eventData.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
      organizer: eventData.organizer || (currentAccount ? currentAccount.shortName : 'ChainPass Community'),
      organizerAddress: currentAccount ? currentAccount.address : '0x9E104a0e98B281699923838D64a38F02434E84A7',
      contractAddress: contractAddress,
      tokenStandard: 'ERC-721',
      network: 'Sepolia Testnet (Simulated)',
      status: 'ACTIVE',
      description: eventData.description,
      tags: ['Live Event', 'ERC-721', 'ChainPass Verified']
    };

    setEvents(prev => [newEvent, ...prev]);

    const newTx = {
      id: `tx-${Date.now()}`,
      action: 'Smart Contract Deployed',
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
      gasUsed: '1,480,200 Gwei'
    };

    setTransactions(prev => [newTx, ...prev]);

    showToast('Event Created & Contract Deployed', `Event contract deployed at ${contractAddress.substring(0, 8)}...`, 'success');
    return newEvent;
  };

  // Reset demo data
  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEYS.EVENTS);
    localStorage.removeItem(STORAGE_KEYS.TICKETS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.ACCOUNT);

    setEvents(INITIAL_EVENTS);
    setTickets(INITIAL_TICKETS);
    setTransactions(INITIAL_TRANSACTIONS);
    setCurrentAccount(DEMO_ACCOUNTS[0]);

    showToast('Demo State Reset', 'Initial blockchain tickets and events have been restored.', 'info');
  };

  return (
    <BlockchainContext.Provider
      value={{
        events,
        tickets,
        transactions,
        demoAccounts: DEMO_ACCOUNTS,
        currentAccount,
        isOrganizer,
        connectWallet,
        disconnectWallet,
        switchAccount,
        purchaseTicket,
        transferTicket,
        verifyTicket,
        approveTicketEntry,
        createEvent,
        resetDemoData,
        // Modal helpers
        isWalletModalOpen,
        setIsWalletModalOpen,
        purchaseModalEvent,
        setPurchaseModalEvent,
        transferModalTicket,
        setTransferModalTicket,
        detailModalTicket,
        setDetailModalTicket,
        toast,
        showToast
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
