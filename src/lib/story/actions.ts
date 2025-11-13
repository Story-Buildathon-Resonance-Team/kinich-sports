/**
 * Story Protocol Server Actions
 *
 * Server-side functions that interact with Story Protocol blockchain.
 *
 * ONLY call from:
 * - API routes (server-side)
 * - Background jobs (CV verification, cron)
 *
 * NEVER import in client components.
 */

import { getStoryClient } from "./client";
import { SPG_NFT_CONTRACT, ACTIVE_NETWORK } from "./config";
import { uploadJSONToIPFS, generateMetadataHash } from "./ipfs";
import { IpMetadata } from "@story-protocol/core-sdk";
import { Address, parseEther, zeroAddress } from "viem";

// Story Protocol constants (Aeneid testnet)
const ROYALTY_POLICY_LAP =
  "0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E" as Address;
const WIP_TOKEN_ADDRESS =
  "0xC92EC2f4c86F70bD1E27F9b15a0F24C8B0C9E48c" as Address;

export interface RegisterIPAssetParams {
  athleteWallet: Address;
  athleteName: string;
  ipMetadata: IpMetadata;
  nftMetadata: {
    name: string;
    description: string;
    image?: string;
  };
  licenseFee: number; // Amount in $IP (e.g., 15)
}

export interface RegisterIPAssetResult {
  success: boolean;
  ipId?: Address;
  txHash?: string;
  tokenId?: bigint;
  error?: string;
}

export interface ClaimableRevenueResult {
  claimable: bigint;
  claimableInIP: number;
  currency: Address;
  error?: string;
}

/**
 * Register IP Asset on Story Protocol
 *
 * Steps:
 * 1. Upload IP metadata to IPFS
 * 2. Upload NFT metadata to IPFS
 * 3. Mint NFT + register as IP Asset
 * 4. Attach Commercial Use license
 * 5. Set 90/10 royalty split
 *
 * Platform pays gas, athlete receives NFT.
 */
export async function registerIPAsset(
  params: RegisterIPAssetParams
): Promise<RegisterIPAssetResult> {
  try {
    const client = getStoryClient();
    const { athleteWallet, ipMetadata, nftMetadata, licenseFee } = params;

    console.log("[Story] Starting IP registration");
    console.log("[Story] Athlete:", athleteWallet);
    console.log("[Story] License fee:", licenseFee, "$IP");

    // Upload IP metadata to IPFS
    const ipMetadataCID = await uploadJSONToIPFS(ipMetadata);
    const ipMetadataHash = generateMetadataHash(ipMetadata);
    const ipMetadataURI = `https://ipfs.io/ipfs/${ipMetadataCID}`;

    console.log("[Story] IP metadata:", ipMetadataURI);

    // Upload NFT metadata to IPFS
    const nftMetadataCID = await uploadJSONToIPFS(nftMetadata);
    const nftMetadataHash = generateMetadataHash(nftMetadata);
    const nftMetadataURI = `https://ipfs.io/ipfs/${nftMetadataCID}`;

    console.log("[Story] NFT metadata:", nftMetadataURI);

    // Get platform wallet for royalty split
    const platformWallet = process.env.PLATFORM_WALLET_ADDRESS as Address;
    if (!platformWallet) {
      throw new Error("PLATFORM_WALLET_ADDRESS not configured");
    }

    // Register IP Asset with license
    const response = await client.ipAsset.registerIpAsset({
      nft: {
        type: "mint",
        spgNftContract: SPG_NFT_CONTRACT,
        recipient: athleteWallet,
      },
      licenseTermsData: [
        {
          terms: {
            transferable: true,
            royaltyPolicy: ROYALTY_POLICY_LAP,
            defaultMintingFee: parseEther(licenseFee.toString()),
            expiration: BigInt(0),
            commercialUse: true,
            commercialAttribution: false,
            commercializerChecker: zeroAddress,
            commercializerCheckerData: "0x",
            commercialRevShare: 0,
            commercialRevCeiling: BigInt(0),
            derivativesAllowed: false,
            derivativesAttribution: false,
            derivativesApproval: false,
            derivativesReciprocal: false,
            derivativeRevCeiling: BigInt(0),
            currency: WIP_TOKEN_ADDRESS,
            uri: "",
          },
        },
      ],
      royaltyShares: [
        { recipient: athleteWallet, percentage: 90 },
        { recipient: platformWallet, percentage: 10 },
      ],
      ipMetadata: {
        ipMetadataURI,
        ipMetadataHash: ipMetadataHash as `0x${string}`,
        nftMetadataURI,
        nftMetadataHash: nftMetadataHash as `0x${string}`,
      },
    });

    console.log("[Story] ✅ IP registered");
    console.log("[Story] IP ID:", response.ipId);
    console.log("[Story] TX:", response.txHash);
    console.log(
      `[Story] Explorer: ${ACTIVE_NETWORK.protocolExplorer}/ipa/${response.ipId}`
    );

    return {
      success: true,
      ipId: response.ipId as Address,
      txHash: response.txHash,
      tokenId: response.tokenId,
    };
  } catch (error) {
    console.error("[Story] ❌ Registration failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get claimable revenue for an IP Asset
 *
 * Queries $IP earned from license sales in the IP Royalty Vault.
 */
export async function getClaimableRevenue(
  ipId: Address,
  athleteWallet: Address
): Promise<ClaimableRevenueResult> {
  try {
    const client = getStoryClient();

    console.log("[Story] Checking claimable revenue");
    console.log("[Story] IP ID:", ipId);
    console.log("[Story] Claimer:", athleteWallet);

    const claimableWei = await client.royalty.claimableRevenue({
      ipId: ipId,
      claimer: athleteWallet,
      token: WIP_TOKEN_ADDRESS,
    });

    const claimableIP = Number(claimableWei) / 1e18;

    console.log("[Story] Claimable:", claimableIP, "$IP");

    return {
      claimable: claimableWei,
      claimableInIP: claimableIP,
      currency: WIP_TOKEN_ADDRESS,
    };
  } catch (error) {
    console.error("[Story] ❌ Revenue check failed:", error);
    return {
      claimable: BigInt(0),
      claimableInIP: 0,
      currency: WIP_TOKEN_ADDRESS,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Missing function claim all revenue to athlete wallet
