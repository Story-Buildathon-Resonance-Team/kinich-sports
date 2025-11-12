import { StoryClient, StoryConfig } from "@story-protocol/core-sdk";
import { http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { zeroAddress } from "viem";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function deployCollection() {
  // Initialize client
  const privateKey = process.env.WALLET_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("WALLET_PRIVATE_KEY not found");
  }

  const account = privateKeyToAccount(`0x${privateKey}` as `0x${string}`);

  const config: StoryConfig = {
    account,
    transport: http("https://aeneid.storyrpc.io"),
    chainId: "aeneid",
  };

  const client = StoryClient.newClient(config);

  console.log("Deploying Kinich SPG NFT Collection...");
  console.log("Deployer wallet:", account.address);

  // Deploy collection
  const result = await client.nftClient.createNFTCollection({
    name: "Kinich Performance Assets",
    symbol: "KINICH",
    isPublicMinting: false, // Only platform can mint
    mintOpen: true,
    mintFeeRecipient: zeroAddress, // No minting fees
    contractURI: "", // Optional: can add collection metadata later
  });

  console.log("\n Collection deployed successfully!");
  console.log("SPG NFT Contract Address:", result.spgNftContract);
  console.log("Transaction Hash:", result.txHash);
  console.log("\n Add this to your .env.local:");
  console.log(`NEXT_PUBLIC_SPG_NFT_CONTRACT=${result.spgNftContract}`);
}

deployCollection()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
