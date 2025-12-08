"use client";
import { createConfig, WagmiProvider } from "wagmi";
import { http } from "viem";
import { mainnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
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
const queryClientInstance = new QueryClient();

function DynamicProviderWrapper({ children }: PropsWithChildren) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  // Use environment variable or fallback for development
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

      try {
        const response = await fetch("/api/sync-athlete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(syncData),
        });
        
        const result: SyncAthleteResponse = await response.json();
          if (result.success) {
            console.log(`Athlete ${result.isNewUser ? "created" : "synced"} successfully`);
           // Invalidate React Query caches to refresh UI immediately
           queryClient.invalidateQueries({ queryKey: ["athlete", userId] });
           queryClient.invalidateQueries({ queryKey: ["dashboard", userId] });
          } else {
            console.error("Failed to sync athlete:", result.error);
          }
      } catch (error) {
          console.error("Error syncing athlete:", error);
      }
    }

    // Redirect to dashboard on successful auth from landing page or auth page
    if (pathname === "/" || pathname === "/auth") {
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
        const response = await fetch("/api/sync-athlete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(syncData),
        });
        
        const result: SyncAthleteResponse = await response.json();
        
        if (result.success) {
            // Invalidate React Query caches to refresh UI immediately
            queryClient.invalidateQueries({ queryKey: ["athlete", userId] });
            queryClient.invalidateQueries({ queryKey: ["dashboard", userId] });
        } else {
            console.error("Failed to update profile:", result.error);
        }
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
        // Include ZeroDev from main, keep Ethereum from HEAD/main
        walletConnectors: [EthereumWalletConnectors, ZeroDevSmartWalletConnectors],
        overrides: { evmNetworks },
        cssOverrides: `
          :host {
            --dynamic-base-1: #1c1c1e;
            --dynamic-base-2: #2c2c2e;
            --dynamic-base-3: #3a3a3c;
            --dynamic-base-4: #48484a;
            
            --dynamic-text-primary: #ffffff;
            --dynamic-text-secondary: #a1a1aa;
            --dynamic-text-tertiary: #71717a;
            
            --dynamic-brand-primary-color: #ffffff;
            --dynamic-brand-secondary-color: #a1a1aa;
            
            --dynamic-badge-background: #2c2c2e;
            --dynamic-badge-color: #ffffff;
            
            --dynamic-overlay: rgba(0, 0, 0, 0.85);
            
            --dynamic-modal-border: 1px solid rgba(255, 255, 255, 0.1);
            --dynamic-radius: 16px;
          }
        `,
        events: {
          onAuthSuccess: handleAuthSuccess,
          onUserProfileUpdate: handleUserProfileUpdate,
          onLogout: () => {
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
    <QueryClientProvider client={queryClientInstance}>
      <DynamicProviderWrapper>
        <WagmiProvider config={config}>
          <DynamicWagmiConnector>{children}</DynamicWagmiConnector>
        </WagmiProvider>
      </DynamicProviderWrapper>
    </QueryClientProvider>
  );
}
