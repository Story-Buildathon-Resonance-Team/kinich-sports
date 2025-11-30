import { NextResponse } from "next/server";
import { registerIPAsset } from "@/lib/story/actions";
import { buildDrillIPMetadata, buildNFTMetadata } from "@/lib/story/metadata";
import { Address, isAddress } from "viem";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { metadata, ipfsHash, athleteWallet, athleteName } = body;

        if (!metadata || !ipfsHash) {
            return NextResponse.json(
                { error: "Missing required registration data (metadata or ipfsHash)" },
                { status: 400 }
            );
        }

        if (!athleteWallet || !isAddress(athleteWallet)) {
            return NextResponse.json(
                { error: "Invalid or missing athlete wallet address" },
                { status: 400 }
            );
        }

        // 1. Prepare IP Metadata
        const drillInfo = {
            drill_type_id: metadata.drill_type_id || "UNKNOWN_DRILL",
            drill_name: metadata.name || "Unknown Drill",
            experience_level: metadata.athlete_profile?.experience_level || "Amateur",
        };

        const mediaInfo = {
            url: `https://${process.env.PINATA_GATEWAY}/ipfs/${ipfsHash}`,
            type: "video" as const,
            mimeType: "video/mp4", // Assumed for now
        };

        const ipMetadata = buildDrillIPMetadata({
            athleteName: athleteName || "Unknown Athlete",
            athleteAddress: athleteWallet as Address,
            drillInfo,
            media: mediaInfo,
            description: metadata.description,
        });

        // 2. Prepare NFT Metadata (Ownership Token)
        const nftMetadata = buildNFTMetadata({
            title: ipMetadata.title,
            description: ipMetadata.description || "",
            imageUrl: metadata.image || "", // Placeholder or IPFS link
        });

        // 3. Register on Story Protocol
        const result = await registerIPAsset({
            athleteWallet: athleteWallet as Address,
            athleteName: athleteName || "Unknown Athlete",
            ipMetadata,
            nftMetadata,
            licenseFee: 30, // Default license fee in $IP
        });

        if (!result.success) {
            throw new Error(result.error || "Registration failed");
        }

        return NextResponse.json({
            success: true,
            ipId: result.ipId,
            txHash: result.txHash,
            tokenId: result.tokenId ? result.tokenId.toString() : undefined,
            explorerUrl: `https://aeneid.explorer.story.foundation/ipa/${result.ipId}`,
        });
    } catch (error: unknown) {
        console.error("[API] IP Registration error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { error: `Failed to register IP: ${errorMessage}` },
            { status: 500 }
        );
    }
}

