/**
 * IPFS Upload Utility using Pinata
 * Handles uploading JSON metadata and files to IPFS
 */

import { PinataSDK } from "pinata";
import { createHash } from "crypto";

// Initialize Pinata client
const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway:
    process.env.NEXT_PUBLIC_GATEWAY_URL! ||
    "https://gateway.pinata.cloud/ipfs/",
});

/**
 * Upload JSON metadata to IPFS via Pinata
 * Returns the IPFS CID
 */
export async function uploadJSONToIPFS(jsonMetadata: any): Promise<string> {
  try {
    const result = await pinata.upload.public.json(jsonMetadata);
    return result.cid;
  } catch (error) {
    console.error("[IPFS] Error uploading JSON:", error);
    throw new Error(
      `Failed to upload JSON to IPFS: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Upload a file to IPFS via Pinata
 * Returns the IPFS CID
 */
export async function uploadFileToIPFS(file: File): Promise<string> {
  try {
    const result = await pinata.upload.public.file(file);
    return result.cid;
  } catch (error) {
    console.error("[IPFS] Error uploading file:", error);
    throw new Error(
      `Failed to upload file to IPFS: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Generate SHA-256 hash of JSON metadata
 * Used for IP metadata hash in Story Protocol
 */
export function generateMetadataHash(jsonMetadata: any): string {
  const hash = createHash("sha256")
    .update(JSON.stringify(jsonMetadata))
    .digest("hex");

  return `0x${hash}`; // Add 0x prefix for blockchain compatibility
}

/**
 * Get IPFS gateway URL from hash
 * Uses Pinata's dedicated gateway for better performance
 */
export function getIPFSUrl(cid: string): string {
  const gateway = process.env.NEXT_PUBLIC_GATEWAY_URL;

  if (gateway) {
    // Remove trailing slash if present, then add it back
    const cleanGateway = gateway.endsWith("/") ? gateway.slice(0, -1) : gateway;
    return `${cleanGateway}/${cid}`;
  }

  // Fallback to Pinata public gateway
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
}

/**
 * Validate that Pinata is properly configured
 */
export function isPinataConfigured(): boolean {
  return !!process.env.PINATA_JWT;
}
