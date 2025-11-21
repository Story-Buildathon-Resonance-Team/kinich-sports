"use client";
import { createConfig, WagmiProvider } from "wagmi";
import { http } from "viem";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { ZeroDevSmartWalletConnectors } from "@dynamic-labs/ethereum-aa";
import { PropsWithChildren } from "react";
import { aeneid } from "@story-protocol/core-sdk";
import { useRouter, usePathname } from "next/navigation";
import type {
  SyncAthleteRequest,
  SyncAthleteResponse,
  DynamicMetadata,
} from "@/lib/types/athlete";

// setup wagmi
const config = createConfig({
  chains: [aeneid],
  multiInjectedProviderDiscovery: false,
  transports: {
    [aeneid.id]: http(),
  },
});
const queryClient = new QueryClient();

// Dynamic styling - using cssOverrides to ensure styles are injected into Shadow DOM
const cssOverrides = `
.dynamic-shadow-dom {
  --dynamic-base-1: rgba(26, 26, 28, 0.6);
  --dynamic-text-primary: #F5F7FA;
  --dynamic-text-secondary: rgba(245, 247, 250, 0.6);
  --dynamic-brand-primary-color: #0047AB;
  --dynamic-input-background: #3A3A3C;
  --dynamic-input-border: rgba(245, 247, 250, 0.1);
  --dynamic-border-radius: 8px;
  --dynamic-font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.dynamic-shadow-dom [class*="Modal"],
.dynamic-shadow-dom [class*="modal-card"] {
  background: rgba(26, 26, 28, 0.6) !important;
  border: 1px solid rgba(245, 247, 250, 0.06) !important;
  border-radius: 12px !important;
  padding: 48px !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3) !important;
}

.dynamic-shadow-dom h1,
.dynamic-shadow-dom h2 {
  background: linear-gradient(135deg, #b8d4f0 0%, #F5F7FA 50%, #b8d4f0 100%) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  font-weight: 300 !important;
}

.dynamic-shadow-dom input,
.dynamic-shadow-dom select {
  background: #3A3A3C !important;
  border: 2px solid rgba(245, 247, 250, 0.1) !important;
  border-radius: 8px !important;
  height: 56px !important;
  color: #F5F7FA !important;
}

.dynamic-shadow-dom input:focus,
.dynamic-shadow-dom select:focus {
  border-color: rgba(0, 71, 171, 0.4) !important;
  background: #424244 !important;
  box-shadow: 0 0 0 4px rgba(255, 107, 53, 0.15) !important;
}

.dynamic-shadow-dom button[type="submit"],
.dynamic-shadow-dom [class*="primary-button"],
.dynamic-shadow-dom [class*="connect-button"] {
  background: linear-gradient(135deg, rgba(0, 71, 171, 0.8) 0%, rgba(0, 86, 214, 0.8) 100%) !important;
  border: 1px solid rgba(184, 212, 240, 0.2) !important;
  border-radius: 10px !important;
  padding: 16px !important;
  box-shadow: 0 4px 20px rgba(0, 71, 171, 0.2) !important;
}

.dynamic-shadow-dom button:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 28px rgba(0, 71, 171, 0.3) !important;
  border-color: rgba(255, 107, 53, 0.3) !important;
}
`;

function DynamicProviderWrapper({ children }: PropsWithChildren) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <DynamicContextProvider
      settings={{
        environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID as string,
        walletConnectors: [
          EthereumWalletConnectors,
          ZeroDevSmartWalletConnectors,
        ],
        cssOverrides: cssOverrides,
        handlers: {
          handleAuthenticatedUser: async (args) => {
            // This fires every time a user successfully authenticates
            // Extract user data from Dynamic
            const userId = args.user.userId;
            const firstName = args.user.firstName;
            const lastName = args.user.lastName;
            const metadata = args.user.metadata as DynamicMetadata | undefined;

            // Get the primary wallet address
            const primaryWallet = args.user.verifiedCredentials?.[0];

            if (!userId || !primaryWallet?.address) {
              console.error("Missing userId or wallet address from Dynamic");
              return;
            }

            // Prepare sync request
            const syncData: SyncAthleteRequest = {
              dynamicUserId: userId,
              walletAddress: primaryWallet.address,
              firstName: firstName,
              lastName: lastName,
              sport: metadata?.sport,
              competitiveLevel: metadata?.competitiveLevel,
            };

            try {
              // Call our API route to sync with Supabase
              const response = await fetch("/api/sync-athlete", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(syncData),
              });

              const result: SyncAthleteResponse = await response.json();

              if (!result.success) {
                console.error("Failed to sync athlete:", result.error);
                // Note: We don't throw here to avoid blocking the auth flow
                // Navigation component will handle retry logic
              } else {
                console.log(
                  `Athlete ${
                    result.isNewUser ? "created" : "updated"
                  } successfully:`,
                  result.athlete?.id
                );

                // Redirect to dashboard ONLY if user is on landing page
                if (pathname === "/") {
                  router.push("/dashboard");
                }
              }
            } catch (error) {
              console.error("Error syncing athlete to database:", error);
              // Note: We don't throw here to avoid blocking the auth flow
              // Navigation component will handle retry logic
            }
          },
        },
      }}
    >
      {children}
    </DynamicContextProvider>
  );
}

export default function Web3Providers({ children }: PropsWithChildren) {
  return (
    <DynamicProviderWrapper>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <DynamicWagmiConnector>{children}</DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicProviderWrapper>
  );
}
