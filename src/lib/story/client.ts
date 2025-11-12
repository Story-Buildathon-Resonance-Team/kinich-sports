/**
 * Story Protocol Client - Server-side only
 *
 * This file initializes the Story Protocol client using the platform's backend wallet.
 * The platform wallet sponsors all IP asset registrations for athletes.
 *
 * IMPORTANT: This file should ONLY be imported in API routes (server-side)
 */

import { StoryClient, StoryConfig } from "@story-protocol/core-sdk";
import { http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { ACTIVE_NETWORK } from "./config";

// Singleton Story client instance
let storyClient: StoryClient | null = null;

/**
 * Initialize the Story Protocol client
 * This uses the platform's backend wallet to sponsor transactions
 */
export function getStoryClient(): StoryClient {
  // Return existing client if already initialized
  if (storyClient) {
    return storyClient;
  }

  // Validate environment variable
  const privateKey = process.env.WALLET_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error(
      "WALLET_PRIVATE_KEY environment variable is required for Story Protocol operations"
    );
  }

  // Create account from private key
  const account = privateKeyToAccount(`0x${privateKey}` as `0x${string}`);

  // Configure Story client
  const config: StoryConfig = {
    account,
    transport: http(ACTIVE_NETWORK.rpcProviderUrl),
    chainId: "aeneid", // Will be dynamic when launched
  };

  // Initialize client
  storyClient = StoryClient.newClient(config);

  console.log("[Story Client] Initialized successfully");
  console.log("[Story Client] Network:", ACTIVE_NETWORK.rpcProviderUrl);
  console.log("[Story Client] Platform wallet:", account.address);

  return storyClient;
}

/**
 * Get the platform wallet address
 * Useful for logging and debugging
 */
export function getPlatformWalletAddress(): string {
  const privateKey = process.env.WALLET_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("WALLET_PRIVATE_KEY not configured");
  }

  const account = privateKeyToAccount(`0x${privateKey}` as `0x${string}`);
  return account.address;
}
