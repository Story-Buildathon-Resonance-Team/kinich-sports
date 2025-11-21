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
const cssOverrides = {
  /* Base */
  "--dynamic-base-1": "#2C2C2E",
  "--dynamic-base-2": "#1A1A1C",
  "--dynamic-base-3": "#2C2C2E",
  "--dynamic-base-4": "#1A1A1C",
  "--dynamic-overlay": "rgba(26, 26, 28, 0.95)",

  /* Text */
  "--dynamic-text-primary": "#F5F7FA",
  "--dynamic-text-secondary": "rgba(245, 247, 250, 0.7)",
  "--dynamic-text-tertiary": "rgba(245, 247, 250, 0.5)",

  /* Brand */
  "--dynamic-brand-primary-color": "#0047AB",
  "--dynamic-brand-secondary-color": "rgba(0, 71, 171, 0.15)",
  "--dynamic-brand-hover-color": "#0056D6",

  /* Borders / Radius */
  "--dynamic-border-radius": "12px",
  "--dynamic-modal-border": "1px solid rgba(245, 247, 250, 0.06)",

  /* Typography */
  "--dynamic-font-family-primary":
    "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",

  /* Buttons */
  "--dynamic-connect-button-background":
    "linear-gradient(135deg, rgba(0, 71, 171, 0.8) 0%, rgba(0, 86, 214, 0.8) 100%)",
  "--dynamic-connect-button-color": "#F5F7FA",
  "--dynamic-connect-button-border": "1px solid rgba(184, 212, 240, 0.2)",

  /* Wallet list */
  "--dynamic-wallet-list-tile-background": "rgba(26, 26, 28, 0.6)",
  "--dynamic-wallet-list-tile-border": "1px solid rgba(245, 247, 250, 0.06)",
  "--dynamic-wallet-list-tile-background-hover": "rgba(0, 71, 171, 0.1)",
  "--dynamic-wallet-list-tile-border-hover": "1px solid rgba(0, 71, 171, 0.3)",

  /* Search/Input */
  "--dynamic-search-bar-background": "#3A3A3C",
  "--dynamic-search-bar-border": "2px solid rgba(245, 247, 250, 0.1)",
  "--dynamic-search-bar-background-focus": "#424244",
  "--dynamic-search-bar-border-focus": "2px solid rgba(0, 71, 171, 0.4)",

  /* Footer */
  "--dynamic-footer-background-color": "rgba(26, 26, 28, 0.6)",
  "--dynamic-footer-text-color": "rgba(245, 247, 250, 0.7)",
  "--dynamic-footer-border": "1px solid rgba(245, 247, 250, 0.06)",

  /* Modal layout */
  "--dynamic-modal-padding": "3rem",
};

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
