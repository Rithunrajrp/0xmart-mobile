// Network RPC URLs
export const NETWORK_RPC_URLS = {
  // Mainnet RPCs
  mainnet: {
    ETHEREUM: "https://eth-mainnet.g.alchemy.com/v2/gaUPyjAlPKGic4H_Z-Qm9",
    POLYGON: "https://polygon-mainnet.g.alchemy.com/v2/gaUPyjAlPKGic4H_Z-Qm9",
    BSC: "https://bnb-mainnet.g.alchemy.com/v2/gaUPyjAlPKGic4H_Z-Qm9",
    ARBITRUM: "https://arb-mainnet.g.alchemy.com/v2/gaUPyjAlPKGic4H_Z-Qm9",
    OPTIMISM: "https://opt-mainnet.g.alchemy.com/v2/gaUPyjAlPKGic4H_Z-Qm9",
    AVALANCHE: "https://avax-mainnet.g.alchemy.com/v2/gaUPyjAlPKGic4H_Z-Qm9",
    BASE: "https://base-mainnet.g.alchemy.com/v2/gaUPyjAlPKGic4H_Z-Qm9",
    SUI: "https://fullnode.mainnet.sui.io",
    TON: "https://toncenter.com/api/v2/jsonRPC",
    SOLANA: "https://solana-mainnet.g.alchemy.com/v2/gaUPyjAlPKGic4H_Z-Qm9",
  },
  // Testnet RPCs
  testnet: {
    ETHEREUM: "https://eth-sepolia.g.alchemy.com/v2/gaUPyjAlPKGic4H_Z-Qm9",
    POLYGON: "https://polygon-amoy.g.alchemy.com/v2/gaUPyjAlPKGic4H_Z-Qm9",
    BSC: "https://bnb-testnet.g.alchemy.com/v2/gaUPyjAlPKGic4H_Z-Qm9",
    ARBITRUM: "https://arb-sepolia.g.alchemy.com/v2/gaUPyjAlPKGic4H_Z-Qm9",
    OPTIMISM: "https://opt-sepolia.g.alchemy.com/v2/gaUPyjAlPKGic4H_Z-Qm9",
    AVALANCHE: "https://avax-fuji.g.alchemy.com/v2/gaUPyjAlPKGic4H_Z-Qm9",
    BASE: "https://base-sepolia.g.alchemy.com/v2/gaUPyjAlPKGic4H_Z-Qm9",
    SUI: "https://rpc.ankr.com/sui_testnet/ccfb9591e05e4acb4bdbaca86857878d85b1b94f9c4941accaf466957cd327b6",
    TON: "https://ton-testnet.core.chainstack.com/aeac4714c0fc09dfe9cbce2450ce9dde/api/v2/jsonRPC",
    SOLANA: "https://solana-devnet.g.alchemy.com/v2/gaUPyjAlPKGic4H_Z-Qm9",
  },
};

// 0xMart Smart Contract Addresses
export const CONTRACT_ADDRESSES = {
  // Mainnet contracts (not deployed yet)
  mainnet: {
    ETHEREUM: "0x0000000000000000000000000000000000000000",
    POLYGON: "0x0000000000000000000000000000000000000000",
    BSC: "0x0000000000000000000000000000000000000000",
    ARBITRUM: "0x0000000000000000000000000000000000000000",
    OPTIMISM: "0x0000000000000000000000000000000000000000",
    AVALANCHE: "0x0000000000000000000000000000000000000000",
    BASE: "0x0000000000000000000000000000000000000000",
    SUI: "0x0000000000000000000000000000000000000000",
    TON: "",
    SOLANA: "",
  },
  // Testnet contracts (deployed)
  testnet: {
    ETHEREUM: "0xfFfD214731036E826A283d1600c967771fDdABAe", // Sepolia
    POLYGON: "0xfFfD214731036E826A283d1600c967771fDdABAe", // Amoy
    BSC: "0x0000000000000000000000000000000000000000", // Not deployed
    ARBITRUM: "0xfFfD214731036E826A283d1600c967771fDdABAe", // Sepolia
    OPTIMISM: "0xfFfD214731036E826A283d1600c967771fDdABAe", // Sepolia
    AVALANCHE: "0xfFfD214731036E826A283d1600c967771fDdABAe", // Fuji
    BASE: "0xfFfD214731036E826A283d1600c967771fDdABAe", // Sepolia
    SUI: "0xd3c5601b3110dad07821c27050dfc873a04f48e172463fba7cca5a5aa2b489cd",
    TON: "kQC4Gn_21IQVPj3ey44TKG3PA1ciL-XjeMmYbcO7jnAmKard",
    SOLANA: "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS",
  },
};

// Network display names with testnet suffix
export const NETWORK_DISPLAY_NAMES_WITH_MODE = {
  mainnet: {
    ETHEREUM: "Ethereum Mainnet",
    POLYGON: "Polygon",
    BSC: "BNB Chain",
    ARBITRUM: "Arbitrum One",
    OPTIMISM: "Optimism",
    AVALANCHE: "Avalanche C-Chain",
    BASE: "Base",
    SUI: "Sui Mainnet",
    TON: "TON Mainnet",
    SOLANA: "Solana Mainnet",
  },
  testnet: {
    ETHEREUM: "Ethereum Sepolia",
    POLYGON: "Polygon Amoy",
    BSC: "BSC Testnet",
    ARBITRUM: "Arbitrum Sepolia",
    OPTIMISM: "Optimism Sepolia",
    AVALANCHE: "Avalanche Fuji",
    BASE: "Base Sepolia",
    SUI: "Sui Testnet",
    TON: "TON Testnet",
    SOLANA: "Solana Devnet",
  },
};

/**
 * Get RPC URL for a network based on testnet mode
 */
export function getRpcUrl(network: string, isTestnet: boolean): string {
  const mode = isTestnet ? "testnet" : "mainnet";
  return NETWORK_RPC_URLS[mode][network as keyof typeof NETWORK_RPC_URLS.mainnet] || "";
}

/**
 * Get contract address for a network based on testnet mode
 */
export function getContractAddress(network: string, isTestnet: boolean): string {
  const mode = isTestnet ? "testnet" : "mainnet";
  return CONTRACT_ADDRESSES[mode][network as keyof typeof CONTRACT_ADDRESSES.mainnet] || "";
}

/**
 * Get network display name with testnet suffix
 */
export function getNetworkDisplayName(network: string, isTestnet: boolean): string {
  const mode = isTestnet ? "testnet" : "mainnet";
  return NETWORK_DISPLAY_NAMES_WITH_MODE[mode][network as keyof typeof NETWORK_DISPLAY_NAMES_WITH_MODE.mainnet] || network;
}

/**
 * Check if a network has contracts deployed
 */
export function isNetworkDeployed(network: string, isTestnet: boolean): boolean {
  const address = getContractAddress(network, isTestnet);
  return address !== "" && address !== "0x0000000000000000000000000000000000000000";
}
