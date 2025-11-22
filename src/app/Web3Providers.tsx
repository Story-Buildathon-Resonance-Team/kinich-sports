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
        cssOverrides: <link rel='stylesheet' href='/external-styles.css' />,
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
