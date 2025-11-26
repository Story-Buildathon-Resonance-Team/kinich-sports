"use client";
import { createConfig, WagmiProvider } from "wagmi";
import { http } from "viem";
import { mainnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { ZeroDevSmartWalletConnectors } from "@dynamic-labs/ethereum-aa";
import { PropsWithChildren, useEffect } from "react";
import { aeneid } from "@story-protocol/core-sdk";
import { useRouter, usePathname } from "next/navigation";
import type {
  SyncAthleteRequest,
  SyncAthleteResponse,
  DynamicMetadata,
} from "@/lib/types/athlete";

// setup wagmi
const config = createConfig({
  chains: [mainnet, aeneid],
  multiInjectedProviderDiscovery: false,
  transports: {
    [mainnet.id]: http(),
    [aeneid.id]: http(),
  },
});
const queryClient = new QueryClient();

function DynamicProviderWrapper({ children }: PropsWithChildren) {
  const router = useRouter();
  const pathname = usePathname();

  // Use environment variable or fallback
  const dynamicEnvId = process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID || "4f755b1f-1989-48ae-a596-864c24894094";

  useEffect(() => {
    console.log("Dynamic Environment ID:", dynamicEnvId);

    // Add a scoping class to isolate Dynamic widget styles
    const dynamicContainer = document.querySelector('[data-dynamic-root]');
    if (dynamicContainer) {
      dynamicContainer.classList.add('dynamic-isolated-container');
    }
  }, [dynamicEnvId]);

  // Define custom network overrides cleanly
  const evmNetworks = [
    {
      blockExplorerUrls: ["https://aeneid.storyscan.xyz"],
      chainId: 1315,
      chainName: "Story Aeneid",
      iconUrls: ["https://img.cryptorank.io/coins/story_protocol1690453385800.png"],
      name: "Story Aeneid",
      nativeCurrency: {
        decimals: 18,
        name: "IP",
        symbol: "IP",
      },
      networkId: 1315,
      rpcUrls: ["https://aeneid.storyrpc.io"],
      vanityName: "Story Aeneid",
    },
  ];

  const handleAuthSuccess = async (args: any) => {
    // Sync athlete data on successful authentication
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

      // Sync in background - don't await
      fetch("/api/sync-athlete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(syncData),
      })
        .then((response) => response.json())
        .then((result: SyncAthleteResponse) => {
          if (result.success) {
            console.log(`Athlete ${result.isNewUser ? "created" : "synced"} successfully`);
          } else {
            console.error("Failed to sync athlete:", result.error);
          }
        })
        .catch((error) => {
          console.error("Error syncing athlete:", error);
        });
    }

    // Redirect to dashboard on successful auth from landing page
    if (pathname === "/") {
      router.push("/dashboard");
    }
  };

  const handleUserProfileUpdate = async (user: any) => {
    // Sync profile changes when user updates their information
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
        await fetch("/api/sync-athlete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(syncData),
        });
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    }
  };

  return (
    <DynamicContextProvider
      theme="dark"
      settings={{
        environmentId: dynamicEnvId,
        shadowDOMEnabled: true,
        cssOverrides: `
          :host {
            --dynamic-font-family-primary: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            --dynamic-base-1: #2c2c2e;
            --dynamic-base-2: #1a1a1c;
            --dynamic-overlay: rgba(26, 26, 28, 0.95);
            --dynamic-text-primary: #f5f7fa;
            --dynamic-text-secondary: rgba(245, 247, 250, 0.7);
            --dynamic-brand-primary-color: #0047ab;
          }
        `,
        walletConnectors: [EthereumWalletConnectors, ZeroDevSmartWalletConnectors],
        overrides: { evmNetworks },
        events: {
          onAuthSuccess: handleAuthSuccess,
          onUserProfileUpdate: handleUserProfileUpdate,
          onLogout: (_args) => {
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
