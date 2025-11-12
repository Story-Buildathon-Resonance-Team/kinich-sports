import { aeneid } from "@story-protocol/core-sdk";
import { Address, Chain } from "viem";

// Network type
type NetworkType = "aeneid" | "mainnet";

interface STORY_CONFIG {
  rpcProviderUrl: string;
  blockExplorer: string;
  protocolExplorer: string;
  chain: Chain;
}

// Get the active network from environment
const getNetwork = (): NetworkType => {
  const network = process.env.NEXT_PUBLIC_STORY_NETWORK as NetworkType;
  if (network && network !== "aeneid" && network !== "mainnet") {
    console.warn(`Invalid STORY_NETWORK: ${network}. Defaulting to aeneid.`);
    return "aeneid";
  }
  return network || "aeneid";
};

export const STORY_NETWORK = getNetwork();

// Network configuration
export const STORY_CONFIG = {
  aeneid: {
    chain: aeneid,
    rpcProviderUrl: "https://aeneid.storyrpc.io",
    blockExplorer: "https://aeneid.storyscan.io",
    protocolExplorer: "https://aeneid.explorer.story.foundation",
  },
  mainnet: {
    chain: aeneid, // Placeholder - update when mainnet is available
    rpcProviderUrl: "https://mainnet.storyrpc.io",
    blockExplorer: "https://storyscan.io",
    protocolExplorer: "https://explorer.story.foundation",
  },
} as const;

// Active network info
export const ACTIVE_NETWORK = STORY_CONFIG[STORY_NETWORK];

// Contract addresses - SPG NFT contract per network
export const SPG_NFT_CONTRACT: Address =
  (process.env.NEXT_PUBLIC_SPG_NFT_CONTRACT as Address) ||
  "0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc"; // Aeneid default

// Commercial Use License Configuration
// This is the only license type used in Kinich
// Athletes set the minting fee (ie. 30-100 $IP), no derivatives allowed
export const COMMERCIAL_USE_LICENSE = {
  // License Terms ID for "Commercial Use Only" (no derivatives)
  termsId: "2",

  // Default minting fee in $IP (can be overridden per asset)
  defaultMintingFee: 30,

  // Royalty split: 90% athlete, 10% platform
  athleteShare: 90,
  platformShare: 10,
} as const;

// Helper to convert $IP amount to wei (18 decimals)
export function ipToWei(amount: number): bigint {
  return BigInt(Math.floor(amount * 1e18));
}

// Helper to convert wei to $IP
export function weiToIp(wei: bigint): number {
  return Number(wei) / 1e18;
}
