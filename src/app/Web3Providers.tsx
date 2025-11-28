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

  // Use environment variable or fallback for development
  const dynamicEnvId = process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID || "4f755b1f-1989-48ae-a596-864c24894094";

  return (
    <DynamicContextProvider
      settings={{
        environmentId: dynamicEnvId,
        walletConnectors: [
          EthereumWalletConnectors,
          ZeroDevSmartWalletConnectors,
        ],
        cssOverrides: <link rel='stylesheet' href='/external-styles.css' />,
        events: {
          onAuthSuccess: async (args) => {
            const userId = args.user.userId;
            const firstName = args.user.firstName;
            const lastName = args.user.lastName;
            const metadata = args.user.metadata as DynamicMetadata | undefined;
            const primaryWallet = args.user.verifiedCredentials?.[0];

            if (userId && primaryWallet?.address) {
              const syncData: SyncAthleteRequest = {
                dynamicUserId: userId,
                walletAddress: primaryWallet.address,
                firstName: firstName,
                lastName: lastName,
                sport: metadata?.["Sport"],
                competitiveLevel: metadata?.["Competitive Level"],
              };

              try {
                const response = await fetch("/api/sync-athlete", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(syncData),
                });

                const result: SyncAthleteResponse = await response.json();

                if (result.success) {
                  console.log(
                    `Athlete ${
                      result.isNewUser ? "created" : "synced"
                    } successfully`
                  );
                } else {
                  console.error("Failed to sync athlete:", result.error);
                }
              } catch (error) {
                console.error("Error syncing athlete:", error);
              }
            }

            if (pathname === "/") {
              router.push("/dashboard");
            }
          },
          onUserProfileUpdate: async (user) => {
            const userId = user.userId;
            const firstName = user.firstName;
            const lastName = user.lastName;
            const metadata = user.metadata as DynamicMetadata | undefined;
            const primaryWallet = user.verifiedCredentials?.[0];

            if (userId && primaryWallet?.address) {
              const syncData: SyncAthleteRequest = {
                dynamicUserId: userId,
                walletAddress: primaryWallet.address,
                firstName: firstName,
                lastName: lastName,
                sport: metadata?.["Sport"],
                competitiveLevel: metadata?.["Competitive Level"],
              };

              try {
                const response = await fetch("/api/sync-athlete", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(syncData),
                });

                const result: SyncAthleteResponse = await response.json();

                if (result.success) {
                  console.log("Profile updated successfully");
                } else {
                  console.error("Failed to update profile:", result.error);
                }
              } catch (error) {
                console.error("Error updating profile:", error);
              }
            }
          },
          onLogout: (args) => {
            router.push("/");
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
