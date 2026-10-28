import BlockTixABI from './BlockTixABI.json';

// Chain Constants
export const SEPOLIA_CHAIN_ID = 11155111;
export const SEPOLIA_CHAIN_ID_HEX = '0xaa36a7';

export const SEPOLIA_NETWORK_PARAMS = {
  chainId: SEPOLIA_CHAIN_ID_HEX,
  chainName: 'Sepolia Test Network',
  nativeCurrency: {
    name: 'Sepolia Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: [
    'https://rpc.sepolia.org',
    'https://ethereum-sepolia-rpc.publicnode.com',
    'https://rpc2.sepolia.org',
  ],
  blockExplorerUrls: ['https://sepolia.etherscan.io'],
};

// Contract Address Storage Key for persistence
export const CONTRACT_ADDRESS_STORAGE_KEY = 'blocktix_contract_address_v1';

/**
 * Returns configured contract address:
 * 1. From localStorage override (if updated by user in UI or settings)
 * 2. From Vite environment variable VITE_CONTRACT_ADDRESS
 * 3. Default empty string (signals contract needs deployment or address entry)
 */
export const getContractAddress = () => {
  try {
    const local = localStorage.getItem(CONTRACT_ADDRESS_STORAGE_KEY);
    if (local && /^0x[a-fA-F0-9]{40}$/.test(local.trim())) {
      return local.trim();
    }
  } catch (e) {
    // ignore
  }

  const envAddr = import.meta.env.VITE_CONTRACT_ADDRESS;
  if (envAddr && /^0x[a-fA-F0-9]{40}$/.test(envAddr.trim())) {
    return envAddr.trim();
  }

  return '';
};

export const setContractAddress = (address) => {
  if (!address) {
    localStorage.removeItem(CONTRACT_ADDRESS_STORAGE_KEY);
  } else {
    localStorage.setItem(CONTRACT_ADDRESS_STORAGE_KEY, address.trim());
  }
};

export const CONTRACT_ABI = BlockTixABI;
