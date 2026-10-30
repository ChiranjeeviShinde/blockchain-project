import { ethers } from 'ethers';
import {
  SEPOLIA_CHAIN_ID,
  SEPOLIA_CHAIN_ID_HEX,
  SEPOLIA_NETWORK_PARAMS,
  CONTRACT_ABI,
  getContractAddress,
} from '../contracts/contractConfig';

/**
 * Checks if MetaMask / EVM browser extension is installed in window
 */
export const isMetaMaskInstalled = () => {
  return typeof window !== 'undefined' && Boolean(window.ethereum);
};

/**
 * Returns a fallback public JSON-RPC Provider for Sepolia.
 * Allows reading on-chain data even when user's wallet is not connected.
 */
export const getFallbackProvider = () => {
  const rpcUrl =
    import.meta.env.VITE_SEPOLIA_RPC_URL ||
    SEPOLIA_NETWORK_PARAMS.rpcUrls[0];
  return new ethers.JsonRpcProvider(rpcUrl);
};

/**
 * Returns an ethers BrowserProvider using window.ethereum
 */
export const getBrowserProvider = () => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed. Please install the MetaMask browser extension.');
  }
  return new ethers.BrowserProvider(window.ethereum);
};

/**
 * Fetches the current chain ID connected in MetaMask
 */
export const getCurrentChainId = async () => {
  if (!isMetaMaskInstalled()) return null;
  try {
    const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
    return parseInt(chainIdHex, 16);
  } catch (err) {
    console.error('Failed to get current chainId:', err);
    return null;
  }
};

/**
 * Prompts MetaMask to switch to the Sepolia test network.
 * If Sepolia has not yet been added to the user's MetaMask, it requests adding it.
 */
export const switchToSepolia = async () => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed.');
  }

  try {
    // Attempt standard switch
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
    });
    return true;
  } catch (switchError) {
    // Error code 4902 indicates that the chain has not been added to MetaMask yet
    if (switchError.code === 4902 || switchError?.data?.originalError?.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [SEPOLIA_NETWORK_PARAMS],
        });
        return true;
      } catch (addError) {
        throw new Error(`Failed to add Sepolia network to MetaMask: ${addError.message}`);
      }
    }
    // User rejected switch
    if (switchError.code === 4001) {
      throw new Error('Network switch to Sepolia was cancelled by user.');
    }
    throw switchError;
  }
};

/**
 * Connects to MetaMask, verifies Sepolia network, and returns connected account info
 */
export const connectMetaMaskWallet = async () => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask extension not detected. Please install MetaMask from https://metamask.io');
  }

  // Request accounts
  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts',
  });

  if (!accounts || accounts.length === 0) {
    throw new Error('No Ethereum account authorized. Please unlock MetaMask.');
  }

  const rawAddress = accounts[0];
  const provider = getBrowserProvider();

  // Check network
  const network = await provider.getNetwork();
  const currentChainId = Number(network.chainId);

  if (currentChainId !== SEPOLIA_CHAIN_ID) {
    // Automatically offer to switch to Sepolia
    await switchToSepolia();
  }

  const signer = await provider.getSigner();
  const balanceWei = await provider.getBalance(rawAddress);
  const balanceEth = parseFloat(ethers.formatEther(balanceWei)).toFixed(4);

  return {
    address: ethers.getAddress(rawAddress), // Checksummed address
    shortAddress: `${rawAddress.substring(0, 6)}...${rawAddress.substring(rawAddress.length - 4)}`,
    balanceEth: `${balanceEth} ETH`,
    balanceWei: balanceWei.toString(),
    chainId: SEPOLIA_CHAIN_ID,
    isMetaMask: true,
  };
};

/**
 * Initializes a Read-Only Contract instance
 */
export const getReadOnlyContract = (contractAddress = getContractAddress()) => {
  if (!contractAddress || !ethers.isAddress(contractAddress)) {
    return null;
  }
  const provider = getFallbackProvider();
  return new ethers.Contract(contractAddress, CONTRACT_ABI, provider);
};

/**
 * Initializes a Signer Contract instance for write transactions
 */
export const getSignerContract = async (contractAddress = getContractAddress()) => {
  if (!contractAddress || !ethers.isAddress(contractAddress)) {
    throw new Error('Invalid or unconfigured smart contract address.');
  }
  const provider = getBrowserProvider();
  const signer = await provider.getSigner();
  return new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
};

/**
 * Verifies if an address contains deployed bytecode on Sepolia
 */
export const verifyContractBytecode = async (contractAddress) => {
  if (!contractAddress || !ethers.isAddress(contractAddress)) {
    return { isValid: false, reason: 'Invalid Ethereum address format.' };
  }
  try {
    const provider = isMetaMaskInstalled() ? getBrowserProvider() : getFallbackProvider();
    const code = await provider.getCode(contractAddress);
    if (!code || code === '0x' || code === '0x0') {
      return {
        isValid: false,
        reason: 'No smart contract bytecode found at this address on Sepolia. The address might be an undeployed address or a normal user wallet (EOA).',
      };
    }
    return { isValid: true, reason: 'Smart contract verified on Sepolia.' };
  } catch (err) {
    console.warn('Contract bytecode verification error:', err);
    return { isValid: false, reason: 'Could not query Sepolia RPC for contract bytecode.' };
  }
};

/**
 * Translates Ethereum / ethers error codes into friendly user messages
 */
export const parseBlockchainError = (err) => {
  if (!err) return 'An unexpected error occurred.';

  // MetaMask rejection
  if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
    return 'Transaction rejected by user in MetaMask.';
  }

  // Insufficient funds
  if (
    err.code === 'INSUFFICIENT_FUNDS' ||
    err.message?.includes('insufficient funds') ||
    err.shortMessage?.includes('insufficient funds')
  ) {
    return 'Insufficient Sepolia ETH in your wallet to cover ticket price and gas fees. Please acquire Sepolia testnet ETH from a faucet or use Demo Minting mode.';
  }

  // Missing revert data (CALL_EXCEPTION)
  if (
    err.shortMessage === 'missing revert data' ||
    err.message?.includes('missing revert data') ||
    err.code === 'CALL_EXCEPTION'
  ) {
    return 'Smart contract transaction reverted (missing revert data). This usually means the contract address does not have BlockTix deployed on Sepolia, your wallet has 0 Sepolia ETH for gas, or the event is inactive. You can switch to Demo Minting or verify your contract address in Settings.';
  }

  // Revert reason extraction
  if (err.reason) {
    return err.reason.replace('execution reverted: ', '');
  }
  if (err.data?.message) {
    return err.data.message;
  }
  if (err.shortMessage) {
    return err.shortMessage;
  }
  if (err.message) {
    return err.message;
  }

  return 'Blockchain transaction failed. Please check console for details.';
};

/**
 * Fetch all events from smart contract
 */
export const fetchOnChainEvents = async (contractAddress) => {
  const contract = getReadOnlyContract(contractAddress);
  if (!contract) return [];

  try {
    const rawEvents = await contract.getAllEvents();
    return rawEvents.map((e) => {
      const idNum = Number(e.id);
      const priceEth = ethers.formatEther(e.ticketPrice);
      const timestampMs = Number(e.eventTimestamp) * 1000;
      const dateObj = new Date(timestampMs);

      return {
        id: `ONCHAIN-EVT-${idNum}`,
        contractEventId: idNum,
        title: e.title,
        category: e.category || 'Technology',
        date: dateObj.toISOString().split('T')[0],
        formattedDate: dateObj.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        time: dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' IST',
        venue: e.venue,
        price: parseFloat(priceEth) * 2500000 || 0, // Approx INR conversion for UI display (1 ETH ~ 2,500,000 INR)
        priceEth: `${parseFloat(priceEth).toFixed(5)} ETH`,
        priceWei: e.ticketPrice.toString(),
        totalTickets: Number(e.maxSupply),
        soldTickets: Number(e.soldTickets),
        image: e.imageUri || 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
        organizer: 'Sepolia Event Organizer',
        organizerAddress: e.organizer,
        contractAddress: contractAddress,
        tokenStandard: 'ERC-721',
        network: 'Sepolia Testnet',
        status: e.isActive ? 'ACTIVE' : 'INACTIVE',
        description: e.description || 'Verified on-chain event deployed on Ethereum Sepolia.',
        tags: ['On-Chain', 'ERC-721', 'Sepolia Testnet', 'BlockTix Verified'],
        isOnChain: true,
      };
    });
  } catch (err) {
    console.warn('Failed to fetch on-chain events:', err);
    return [];
  }
};

/**
 * Fetch user tickets from smart contract
 */
export const fetchUserOnChainTickets = async (contractAddress, userAddress) => {
  if (!contractAddress || !userAddress || !ethers.isAddress(userAddress)) {
    return [];
  }

  const contract = getReadOnlyContract(contractAddress);
  if (!contract) return [];

  try {
    const rawTickets = await contract.getUserTickets(userAddress);
    const tickets = [];

    for (const t of rawTickets) {
      const tokenId = Number(t.tokenId);
      const eventId = Number(t.eventId);
      const priceEth = ethers.formatEther(t.pricePaid);
      const purchaseDate = new Date(Number(t.purchaseTime) * 1000);

      // Fetch corresponding event details
      let eventDetails = null;
      try {
        eventDetails = await contract.getEvent(eventId);
      } catch (e) {
        console.warn(`Could not load event ${eventId} for ticket ${tokenId}`);
      }

      const formattedPurchaseDate =
        purchaseDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }) +
        ', ' +
        purchaseDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });

      const eventDate = eventDetails
        ? new Date(Number(eventDetails.eventTimestamp) * 1000)
        : new Date();

      tickets.push({
        id: `ONCHAIN-TK-${tokenId}`,
        tokenId: tokenId,
        eventId: `ONCHAIN-EVT-${eventId}`,
        contractEventId: eventId,
        eventTitle: eventDetails ? eventDetails.title : `Event #${eventId}`,
        eventCategory: eventDetails ? eventDetails.category : 'General',
        eventDate: eventDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        eventTime: eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        eventVenue: eventDetails ? eventDetails.venue : 'On-Chain Venue',
        eventImage:
          eventDetails?.imageUri ||
          'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
        ownerAddress: userAddress,
        originalMinter: t.originalMinter,
        tier: t.tier || 'General Admission',
        pricePaidEth: `${priceEth} ETH`,
        pricePaid: parseFloat(priceEth) * 2500000 || 0,
        mintedAt: purchaseDate.toISOString(),
        formattedMintedAt: formattedPurchaseDate,
        status: t.isUsed ? 'USED' : 'VALID',
        txHash: 'On-Chain Token #' + tokenId,
        blockNumber: 'Confirmed',
        usedAt: t.isUsed ? new Date(Number(t.usedAt) * 1000).toLocaleString() : null,
        usedByVerifier: t.usedByVerifier !== ethers.ZeroAddress ? t.usedByVerifier : null,
        transferHistory: [
          {
            from: t.originalMinter,
            to: userAddress,
            date: formattedPurchaseDate,
            txHash: 'Token Minted',
            type: 'MINT',
          },
        ],
        isOnChain: true,
      });
    }

    return tickets;
  } catch (err) {
    console.warn('Failed to fetch on-chain user tickets:', err);
    return [];
  }
};
