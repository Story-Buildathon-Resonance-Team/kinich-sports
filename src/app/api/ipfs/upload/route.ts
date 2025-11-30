import { NextResponse } from "next/server";
import { PinataSDK } from "pinata";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!body) {
            return NextResponse.json(
                { error: "No metadata provided" },
                { status: 400 }
            );
        }

        const jwt = process.env.PINATA_JWT;
        const gateway = process.env.PINATA_GATEWAY;

        if (!jwt || !gateway) {
            console.error("Missing env vars:", { jwt: !!jwt, gateway: !!gateway });
            throw new Error("Missing PINATA_JWT or PINATA_GATEWAY");
        }

        // Initialize Pinata directly in the route to ensure env vars are loaded
        const pinata = new PinataSDK({
            pinataJwt: jwt,
            pinataGateway: gateway,
        });

        // Convert JSON body to a File object for upload
        const metadataBlob = new Blob([JSON.stringify(body)], { type: 'application/json' });
        const metadataFile = new File([metadataBlob], 'metadata.json', { type: 'application/json' });

        const upload = await pinata.upload.public.file(metadataFile);

        return NextResponse.json({
            ipfsHash: upload.cid,
            pinSize: 0, // Not returned by public upload
            timestamp: new Date().toISOString(),
            gatewayUrl: `https://${gateway}/ipfs/${upload.cid}`
        });
    } catch (error: unknown) {
        console.error("Error uploading to Pinata:", error);

        // Improved error logging for debugging
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Pinata Error:", errorMessage);

        return NextResponse.json(
            { error: `Failed to upload metadata to IPFS` },
            { status: 500 }
        );
    }
}
