"use client";
import { createConfig, WagmiProvider } from "wagmi";
import { http } from "viem";
import { mainnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { ZeroDevSmartWalletConnectors } from "@dynamic-labs/ethereum-aa";
import { PropsWithChildren, useEffect, useCallback, useRef, useMemo } from "react";
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
  const pathnameRef = useRef(pathname);
  const queryClient = useQueryClient();

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAuthSuccess = useCallback(async (args: any) => {
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
        .then(res => res.json())
        .then((result: SyncAthleteResponse) => {
          if (result.success) {
            console.log(`Athlete ${result.isNewUser ? "created" : "synced"} successfully`);
            queryClient.invalidateQueries({ queryKey: ["athlete", userId] });
            queryClient.invalidateQueries({ queryKey: ["dashboard", userId] });
          } else {
            console.error("Failed to sync athlete:", result.error);
          }
        })
        .catch((error) => {
          console.error("Error syncing athlete:", error);
        });
    }

    // Redirect to dashboard on successful auth from landing page or auth page
    // Use ref to access current pathname without stale closure
    const currentPath = pathnameRef.current;
    if (currentPath === "/" || currentPath === "/auth") {
      router.push("/dashboard");
    }
  }, [queryClient, router]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUserProfileUpdate = useCallback(async (user: any) => {
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

      // Sync in background - don't await
      fetch("/api/sync-athlete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(syncData),
      }).catch(err => console.error("Background sync error:", err));
    }
  }, []);

  const handleLogout = useCallback(() => {
    router.push("/");
  }, [router]);

  const settings = useMemo(() => ({
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
      onLogout: handleLogout,
    },
  }), [dynamicEnvId, evmNetworks, handleAuthSuccess, handleUserProfileUpdate, handleLogout]);

  return (
    <DynamicContextProvider
      theme="dark"
      settings={settings}
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
