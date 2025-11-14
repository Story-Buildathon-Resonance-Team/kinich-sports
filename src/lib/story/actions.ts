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
import {
  IpMetadata,
  WIP_TOKEN_ADDRESS,
  ClaimAllRevenueResponse,
} from "@story-protocol/core-sdk";
import { Address, parseEther, TransactionReceipt, zeroAddress } from "viem";

// Story Protocol constants (Aeneid testnet)
const ROYALTY_POLICY_LAP =
  "0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E" as Address;

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
  licenseTermsIds?: bigint[];
  tokenId?: bigint;
  error?: string;
}

export interface MintLicenseTokensParams {
  licensorIpId: Address;
  licenseTermsId: bigint;
  maxMintingFee: bigint;
  maxRevenueShare: number;
  buyerWallet: Address;
}

export interface MintedLicenseResult {
  success: boolean;
  licenseTokensIds?: bigint[];
  txHash?: string;
  receipt?: TransactionReceipt;
  error?: string;
}

export interface ClaimableRevenueResult {
  success: boolean;
  claimable?: bigint;
  error?: string;
}

export interface ClaimAllRevenueResult {
  success: boolean;
  storyResponse?: ClaimAllRevenueResponse;
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
            uri: "https://github.com/piplabs/pil-document/blob/9a1f803fcf8101a8a78f1dcc929e6014e144ab56/off-chain-terms/CommercialUse.json",
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

    console.log("[Story] IP registered");
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
      licenseTermsIds: response.licenseTermsIds,
    };
  } catch (error) {
    console.error("[Story] Registration failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Mint license token to licensee wallet
 *
 * Sells a Commercial Use license for an IP Asset to a licensee.
 */

export async function mintLicenseTokenToLicensee(
  params: MintLicenseTokensParams
): Promise<MintedLicenseResult> {
  try {
    const client = getStoryClient();
    const {
      licensorIpId,
      licenseTermsId,
      maxMintingFee,
      maxRevenueShare,
      buyerWallet,
    } = params;

    console.log("[Story] Minting license token");
    console.log("[Story] IP ID:", licensorIpId);
    console.log("[Story] License Terms ID:", licenseTermsId.toString());
    console.log("[Story] Buyer:", buyerWallet);

    const response = await client.license.mintLicenseTokens({
      licensorIpId: licensorIpId,
      licenseTermsId: licenseTermsId,
      maxMintingFee: maxMintingFee,
      maxRevenueShare: maxRevenueShare,
      receiver: buyerWallet,
    });

    console.log("[Story] License token minted");
    console.log("[Sotyr] License Token IDs:", response.licenseTokenIds);
    console.log("[Story] TX:", response.txHash);

    return {
      success: true,
      licenseTokensIds: response.licenseTokenIds,
      txHash: response.txHash,
      receipt: response.receipt,
    };
  } catch (error) {
    console.error("[Story] License minting failed:", error);
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
  claimerWallet: Address
): Promise<ClaimableRevenueResult> {
  try {
    const client = getStoryClient();

    console.log("[Story] Checking claimable revenue");
    console.log("[Story] IP ID:", ipId);
    console.log("[Story] Claimer:", claimerWallet);

    const claimableRevenue = await client.royalty.claimableRevenue({
      ipId: ipId,
      claimer: claimerWallet,
      token: WIP_TOKEN_ADDRESS,
    });

    console.log("[Story] Claimable:", claimableRevenue, "$IP");

    return {
      success: true,
      claimable: claimableRevenue,
    };
  } catch (error) {
    console.error("[Story] Revenue check failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Claim all revenue for an IP Asset
 *
 * Claims all revenue from license sales in the IP Royalty Vault.
 */

export async function claimRevenueFromIpVault(
  ipId: Address
): Promise<ClaimAllRevenueResult> {
  try {
    const client = getStoryClient();

    console.log("[Story] Claiming revenue");
    console.log("[Story] IP Royalty Vault:", ipId);

    const response = await client.royalty.claimAllRevenue({
      ancestorIpId: ipId,
      claimer: ipId,
      childIpIds: [],
      royaltyPolicies: [ROYALTY_POLICY_LAP],
      currencyTokens: [WIP_TOKEN_ADDRESS],
      claimOptions: {
        autoTransferAllClaimedTokensFromIp: true,
        autoUnwrapIpTokens: true,
      },
    });

    console.log("[Story] Revenue claimed");
    console.log("[Story] TXs:", response.txHashes);
    console.log("[Story] Claimed tokens:", response.claimedTokens);

    return {
      success: true,
      storyResponse: response,
    };
  } catch (error) {
    console.error("[Story] Revenue claim failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
