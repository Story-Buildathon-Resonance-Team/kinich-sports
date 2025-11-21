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

// Dynamic styling
const cssOverrides = `
.dynamic-shadow-dom {
  /* Base colors */
  --dynamic-base-1: #2C2C2E;
  --dynamic-base-2: #1A1A1C;
  --dynamic-base-3: #2C2C2E;
  --dynamic-base-4: #1A1A1C;
  --dynamic-overlay: rgba(26, 26, 28, 0.95);
  
  /* Text colors */
  --dynamic-text-primary: #F5F7FA;
  --dynamic-text-secondary: rgba(245, 247, 250, 0.7);
  --dynamic-text-tertiary: rgba(245, 247, 250, 0.5);
  
  /* Brand colors */
  --dynamic-brand-primary-color: #0047AB;
  --dynamic-brand-secondary-color: rgba(0, 71, 171, 0.15);
  --dynamic-brand-hover-color: #0056D6;
  
  /* Border and shape */
  --dynamic-border-radius: 12px;
  --dynamic-modal-border: 1px solid rgba(245, 247, 250, 0.06);
  
  /* Typography */
  --dynamic-font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  
  /* Buttons */
  --dynamic-connect-button-background: linear-gradient(135deg, rgba(0, 71, 171, 0.8) 0%, rgba(0, 86, 214, 0.8) 100%);
  --dynamic-connect-button-color: #F5F7FA;
  --dynamic-connect-button-border: 1px solid rgba(184, 212, 240, 0.2);
  
  /* Wallet list */
  --dynamic-wallet-list-tile-background: rgba(26, 26, 28, 0.6);
  --dynamic-wallet-list-tile-border: 1px solid rgba(245, 247, 250, 0.06);
  --dynamic-wallet-list-tile-background-hover: rgba(0, 71, 171, 0.1);
  --dynamic-wallet-list-tile-border-hover: 1px solid rgba(0, 71, 171, 0.3);
  
  /* Search/Input fields */
  --dynamic-search-bar-background: #3A3A3C;
  --dynamic-search-bar-border: 2px solid rgba(245, 247, 250, 0.1);
  --dynamic-search-bar-background-focus: #424244;
  --dynamic-search-bar-border-focus: 2px solid rgba(0, 71, 171, 0.4);
  
  /* Footer */
  --dynamic-footer-background-color: rgba(26, 26, 28, 0.6);
  --dynamic-footer-text-color: rgba(245, 247, 250, 0.7);
  --dynamic-footer-border: 1px solid rgba(245, 247, 250, 0.06);
  
  /* Modal */
  --dynamic-modal-padding: 3rem;
}

/* Additional custom styles for elements not controlled by CSS variables */
.dynamic-shadow-dom input,
.dynamic-shadow-dom textarea,
.dynamic-shadow-dom select {
  background: #3A3A3C !important;
  border: 2px solid rgba(245, 247, 250, 0.1) !important;
  color: #F5F7FA !important;
  border-radius: 8px !important;
  padding: 0 16px !important;
  height: 56px !important;
}

.dynamic-shadow-dom input:focus,
.dynamic-shadow-dom textarea:focus,
.dynamic-shadow-dom select:focus {
  border-color: rgba(0, 71, 171, 0.4) !important;
  background: #424244 !important;
  box-shadow: 0 0 0 4px rgba(255, 107, 53, 0.15) !important;
  outline: none !important;
}

.dynamic-shadow-dom input::placeholder,
.dynamic-shadow-dom textarea::placeholder {
  color: rgba(245, 247, 250, 0.3) !important;
}

/* Modal styling */
.dynamic-shadow-dom [class*="modal"],
.dynamic-shadow-dom [class*="Modal"] {
  background: rgba(26, 26, 28, 0.95) !important;
  border: 1px solid rgba(245, 247, 250, 0.06) !important;
  border-radius: 12px !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3) !important;
}

/* Headers in modals */
.dynamic-shadow-dom h1,
.dynamic-shadow-dom h2,
.dynamic-shadow-dom h3 {
  background: linear-gradient(135deg, #b8d4f0 0%, #F5F7FA 50%, #b8d4f0 100%) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  font-weight: 300 !important;
}

/* Primary buttons */
.dynamic-shadow-dom button[type="submit"],
.dynamic-shadow-dom [class*="primary-button"],
.dynamic-shadow-dom [class*="connect-button"],
.dynamic-shadow-dom [class*="PrimaryButton"] {
  background: linear-gradient(135deg, rgba(0, 71, 171, 0.8) 0%, rgba(0, 86, 214, 0.8) 100%) !important;
  border: 1px solid rgba(184, 212, 240, 0.2) !important;
  border-radius: 10px !important;
  padding: 16px 24px !important;
  color: #F5F7FA !important;
  box-shadow: 0 4px 20px rgba(0, 71, 171, 0.2) !important;
  transition: all 0.4s ease !important;
}

.dynamic-shadow-dom button:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 28px rgba(0, 71, 171, 0.3) !important;
  border-color: rgba(255, 107, 53, 0.3) !important;
}

/* Wallet tiles */
.dynamic-shadow-dom [class*="wallet-list"] button,
.dynamic-shadow-dom [class*="WalletList"] button {
  background: rgba(26, 26, 28, 0.6) !important;
  border: 1px solid rgba(245, 247, 250, 0.06) !important;
  border-radius: 12px !important;
  transition: all 0.3s ease !important;
}

.dynamic-shadow-dom [class*="wallet-list"] button:hover,
.dynamic-shadow-dom [class*="WalletList"] button:hover {
  background: rgba(0, 71, 171, 0.1) !important;
  border-color: rgba(0, 71, 171, 0.3) !important;
  transform: translateY(-2px) !important;
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
