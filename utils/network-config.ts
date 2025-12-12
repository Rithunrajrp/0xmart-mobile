/**
 * Network and Stablecoin Configuration for Mobile App
 *
 * Mobile users can ONLY create wallets on L2 networks (Ethereum Layer 2 solutions)
 * to reduce gas fees and improve transaction speed.
 */

import { NetworkType, StablecoinType } from "../types";

export interface NetworkInfo {
  name: string;
  layer: "L1" | "L2";
  isEVM: boolean;
  supportedStablecoins: StablecoinType[];
  description: string;
}

/**
 * Complete network configuration with L1/L2 classification
 */
export const NETWORK_CONFIG: Record<NetworkType, NetworkInfo> = {
  ETHEREUM: {
    name: "Ethereum",
    layer: "L1",
    isEVM: true,
    supportedStablecoins: ["USDT", "USDC", "DAI", "BUSD"],
    description: "Ethereum mainnet (high gas fees)",
  },
  POLYGON: {
    name: "Polygon",
    layer: "L2",
    isEVM: true,
    supportedStablecoins: ["USDT", "USDC", "DAI", "BUSD"],
    description: "Fast and low-cost L2 solution",
  },
  BSC: {
    name: "BNB Smart Chain",
    layer: "L1",
    isEVM: true,
    supportedStablecoins: ["USDT", "USDC", "DAI", "BUSD"],
    description: "Binance's blockchain (separate L1)",
  },
  ARBITRUM: {
    name: "Arbitrum",
    layer: "L2",
    isEVM: true,
    supportedStablecoins: ["USDT", "USDC", "DAI"],
    description: "Ethereum L2 with optimistic rollups",
  },
  OPTIMISM: {
    name: "Optimism",
    layer: "L2",
    isEVM: true,
    supportedStablecoins: ["USDT", "USDC", "DAI"],
    description: "Ethereum L2 with fast finality",
  },
  AVALANCHE: {
    name: "Avalanche",
    layer: "L1",
    isEVM: true,
    supportedStablecoins: ["USDT", "USDC", "DAI"],
    description: "High-performance L1 blockchain",
  },
  BASE: {
    name: "Base",
    layer: "L2",
    isEVM: true,
    supportedStablecoins: ["USDT", "USDC", "DAI"],
    description: "Coinbase's Ethereum L2",
  },
  SUI: {
    name: "Sui",
    layer: "L1",
    isEVM: false,
    supportedStablecoins: [],
    description: "Not yet supported",
  },
  TON: {
    name: "TON",
    layer: "L1",
    isEVM: false,
    supportedStablecoins: [],
    description: "Not yet supported",
  },
};

/**
 * Get all L2 networks (mobile-compatible)
 */
export const L2_NETWORKS: NetworkType[] = Object.entries(NETWORK_CONFIG)
  .filter(([_, config]) => config.layer === "L2" && config.supportedStablecoins.length > 0)
  .map(([network]) => network as NetworkType);

/**
 * Get all L1 networks
 */
export const L1_NETWORKS: NetworkType[] = Object.entries(NETWORK_CONFIG)
  .filter(([_, config]) => config.layer === "L1")
  .map(([network]) => network as NetworkType);

/**
 * Check if a stablecoin is supported on a specific network
 */
export function isStablecoinSupportedOnNetwork(
  stablecoin: StablecoinType,
  network: NetworkType
): boolean {
  return NETWORK_CONFIG[network].supportedStablecoins.includes(stablecoin);
}

/**
 * Get available networks for a specific stablecoin
 * @param stablecoin - The stablecoin to check
 * @param mobileOnly - If true, only return L2 networks (for mobile apps)
 */
export function getNetworksForStablecoin(
  stablecoin: StablecoinType,
  mobileOnly = false
): NetworkType[] {
  const allNetworks = Object.entries(NETWORK_CONFIG)
    .filter(([_, config]) => config.supportedStablecoins.includes(stablecoin))
    .map(([network]) => network as NetworkType);

  if (mobileOnly) {
    return allNetworks.filter((network) => NETWORK_CONFIG[network].layer === "L2");
  }

  return allNetworks;
}

/**
 * Get available stablecoins for a specific network
 */
export function getStablecoinsForNetwork(network: NetworkType): StablecoinType[] {
  return NETWORK_CONFIG[network].supportedStablecoins;
}

/**
 * Check if a network is L2
 */
export function isL2Network(network: NetworkType): boolean {
  return NETWORK_CONFIG[network].layer === "L2";
}

/**
 * Get network display name
 */
export function getNetworkName(network: NetworkType): string {
  return NETWORK_CONFIG[network].name;
}

/**
 * Get all available stablecoins across all networks
 */
export function getAllStablecoins(): StablecoinType[] {
  const coins = new Set<StablecoinType>();
  Object.values(NETWORK_CONFIG).forEach((config) => {
    config.supportedStablecoins.forEach((coin) => coins.add(coin));
  });
  return Array.from(coins);
}

/**
 * Stablecoin display information
 */
export const STABLECOIN_INFO: Record<
  StablecoinType,
  { name: string; symbol: string; description: string }
> = {
  USDT: {
    name: "Tether",
    symbol: "USDT",
    description: "Stablecoin pegged to USD",
  },
  USDC: {
    name: "USD Coin",
    symbol: "USDC",
    description: "Fully reserved stablecoin",
  },
  DAI: {
    name: "Dai",
    symbol: "DAI",
    description: "Decentralized stablecoin",
  },
  BUSD: {
    name: "Binance USD",
    symbol: "BUSD",
    description: "Binance-backed stablecoin",
  },
};
