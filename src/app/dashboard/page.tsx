"use client";

import { useEffect, useState, useCallback } from "react";
import { useDynamicContext, DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FilterTabs, AssetCard } from "@/components/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import type { Athlete, SyncAthleteRequest } from "@/lib/types/athlete";
import { AlertCircle, Plus, Shield } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

interface Asset {
  id: string;
  asset_type: "video" | "audio";
  drill_type_id: string;
  asset_url: string;
  license_fee: number;
  metadata: any;
  status: string;
  created_at: string;
}

interface DashboardData {
  athlete: Athlete;
  stats: {
    profileScore: number;
    totalRoyalties: number;
    totalAssets: number;
  };
  assets: Asset[];
}

type FilterOption = "all" | "video" | "audio";

const DEMO_ASSETS = [
  {
    id: "demo-1",
    type: "video" as const,
    title: "Demo: Burpee Max Effort",
    price: 15,
    duration: "1:00",
    isDemo: true,
  },
  {
    id: "demo-2",
    type: "audio" as const,
    title: "Demo: Identity Capsule - Origin Story",
    price: 12,
    duration: "3:45",
    isDemo: true,
  },
];

// Fetcher function for React Query
async function fetchDashboardDataApi(userId: string, primaryWalletAddress: string | undefined, firstName?: string, lastName?: string): Promise<DashboardData> {
  // Attempt to fetch athlete data
  let athleteResponse = await fetch(
    `/api/athletes/me?dynamic_user_id=${userId}`
  );

  // If user not found (404), attempt to sync athlete record
  if (athleteResponse.status === 404 && primaryWalletAddress) {
    console.log("Athlete not found in database, attempting sync...");

    const syncData: SyncAthleteRequest = {
      dynamicUserId: userId,
      walletAddress: primaryWalletAddress,
      firstName: firstName,
      lastName: lastName,
    };

    try {
      const syncResponse = await fetch("/api/sync-athlete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(syncData),
      });

      if (syncResponse.ok) {
        // Retry fetch after successful sync
        athleteResponse = await fetch(
          `/api/athletes/me?dynamic_user_id=${userId}`
        );
      }
    } catch (syncErr) {
      console.error("Auto-sync failed:", syncErr);
    }
  }

  if (!athleteResponse.ok) {
    throw new Error("Failed to fetch athlete data");
  }

  const athleteData = await athleteResponse.json();

  // Fetch assets
  const assetsResponse = await fetch(
    `/api/assets?athlete_id=${athleteData.athlete.id}`
  );

  if (!assetsResponse.ok) {
    throw new Error("Failed to fetch assets");
  }

  const assetsData = await assetsResponse.json();

  return {
    athlete: athleteData.athlete,
    stats: athleteData.stats,
    assets: assetsData.assets,
  };
}

export default function AthleteDashboard() {
  const { user, primaryWallet } = useDynamicContext();
  const [activeFilter, setActiveFilter] = useState<FilterOption>("all");
  const pathname = usePathname();

  // Use React Query for data fetching
  const { data: dashboardData, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard', user?.userId],
    queryFn: () => {
      if (!user?.userId) throw new Error("User not authenticated");
      return fetchDashboardDataApi(user.userId, primaryWallet?.address, user.firstName, user.lastName);
    },
    enabled: !!user?.userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const transformAssetForCard = (asset: Asset) => {
    const metadata = asset.metadata || {};
    const title = metadata.drill_name || metadata.title || asset.drill_type_id;
    let duration = "0:00";
    if (metadata.video_metadata?.duration_seconds) {
      duration = formatDuration(metadata.video_metadata.duration_seconds);
    } else if (metadata.recording_duration_seconds) {
      duration = formatDuration(metadata.recording_duration_seconds);
    } else if (metadata.duration_seconds) {
      duration = formatDuration(metadata.duration_seconds);
    }

    return {
      id: asset.id,
      type: asset.asset_type,
      title,
      price: asset.license_fee,
      duration,
      isDemo: false,
    };
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-[#050505] flex'>
        <DashboardSidebar currentPath={pathname} />
        <div className='flex-1 lg:ml-64 p-8 pt-12'>
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between">
              <Skeleton className="h-12 w-1/3 rounded-lg" />
              <Skeleton className="h-12 w-32 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-[320px] w-full rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className='min-h-screen bg-[#050505] flex'>
        <DashboardSidebar currentPath={pathname} />
        <div className='flex-1 lg:ml-64 flex items-center justify-center p-8'>
          <div className='text-center max-w-md p-8 glass-panel rounded-2xl'>
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Unable to load dashboard</h3>
            <p className='text-gray-400 mb-6 text-sm'>
              {error instanceof Error ? error.message : "We encountered an issue loading your athlete data."}
            </p>
            <button
              onClick={() => refetch()}
              className='px-6 py-2.5 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors'
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { athlete, stats, assets } = dashboardData;

  const isDemoMode = assets.length < 2;
  const realAssets = assets.map(transformAssetForCard);
  const demoAssetsToShow = isDemoMode
    ? DEMO_ASSETS.slice(0, 2 - assets.length)
    : [];
  const allAssets = [...realAssets, ...demoAssetsToShow];

  const filteredAssets =
    activeFilter === "all"
      ? allAssets
      : allAssets.filter((asset) => asset.type === activeFilter);

  const getInitials = (name: string | null): string => {
    if (!name) return "AT";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const capitalizeWords = (str: string | null): string => {
    if (!str) return "";
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const mapLevel = (
    level: string | null
  ): "Competitive" | "Professional" | "Amateur" | "Elite" => {
    if (!level) return "Amateur";
    const normalized = level.toLowerCase();
    if (normalized === "competitive") return "Competitive";
    if (normalized === "professional") return "Professional";
    if (normalized === "elite") return "Elite";
    return "Amateur";
  };

  const athleteProfile = {
    id: athlete.id,
    initials: getInitials(athlete.name),
    name: athlete.name || "Athlete",
    discipline: capitalizeWords(athlete.discipline) || "Athlete",
    level: mapLevel(athlete.competitive_level),
    world_id_verified: athlete.world_id_verified,
    world_id_verified_at: athlete.world_id_verified_at,
  };

  return (
    <div className='min-h-screen bg-[#050505] flex selection:bg-blue-500/30'>
      <DashboardSidebar currentPath={pathname} />

      <div className='flex-1 lg:ml-64 min-h-screen overflow-y-auto relative'>
        <header className="sticky top-0 z-40 flex items-center justify-between px-8 py-6 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 lg:hidden">
          <Link href="/" className="text-xl font-bold text-white">KINICH</Link>
          <DynamicWidget variant="dropdown" />
        </header>

        <div className='p-6 lg:p-8 w-full max-w-full animate-fade-in-up'>
          {/* Top Row Cards */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-10">

            {/* Current / Athlete Card */}
            <div className="xl:col-span-5 bg-[#0a0a0a] rounded-2xl border border-white/10 p-8 relative overflow-hidden group hover:border-white/20 transition-all duration-500">
              {/* Subtle Background Pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:16px_16px] opacity-50" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-600/10 transition-colors duration-500" />

              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-2xl font-bold text-white shadow-lg backdrop-blur-sm group-hover:scale-105 transition-transform duration-300">
                      {athleteProfile.initials}
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white tracking-tight leading-none mb-1">{athleteProfile.name}</h2>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span className="uppercase tracking-wider font-medium text-blue-400">{athleteProfile.discipline}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-600" />
                        <span>{athleteProfile.level}</span>
                      </div>
                    </div>
                  </div>
                  {athleteProfile.world_id_verified && (
                    <div className="bg-blue-500/10 border border-blue-500/20 p-2 rounded-lg text-blue-400" title="Verified Human">
                      <Shield className="w-5 h-5" />
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total IP Value</span>
                      <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">+12.5% this month</span>
                    </div>
                    <div className="text-6xl font-medium text-white tracking-tighter tabular-nums">
                      {stats.totalRoyalties.toLocaleString()}<span className="text-3xl text-gray-600 font-light ml-2">IP</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-2 font-mono">≈ $142.50 USD</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5 hover:bg-white/10 transition-colors">
                      <div className="text-xs text-gray-500 mb-1">Profile Score</div>
                      <div className="text-2xl font-bold text-white">{stats.profileScore}<span className="text-sm text-gray-600 font-normal">/100</span></div>
                      <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${stats.profileScore}%` }} />
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5 hover:bg-white/10 transition-colors">
                      <div className="text-xs text-gray-500 mb-1">Total Assets</div>
                      <div className="text-2xl font-bold text-white">{stats.totalAssets}</div>
                      <div className="text-[10px] text-gray-500 mt-2">Across 2 Categories</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Chart Card */}
            <div className="xl:col-span-7 bg-[#0a0a0a] rounded-2xl border border-white/10 p-8 relative flex flex-col hover:border-white/20 transition-all duration-500">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-bold text-white">Performance</h3>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-medium text-gray-300">Flow State Active</span>
                  </div>
                </div>
                <div className="flex bg-black rounded-lg p-1 border border-white/10">
                  {['1D', '1W', '1M', '1Y', 'ALL'].map((period) => (
                    <button key={period} className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${period === '1M' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-white'}`}>
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              {/* CSS SVG Line Chart - Enhanced */}
              <div className="flex-1 w-full relative min-h-[250px]">
                {/* Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between text-xs text-gray-700 font-mono pointer-events-none">
                  {[100, 75, 50, 25, 0].map((val) => (
                    <div key={val} className="border-b border-white/5 w-full h-0 relative">
                      <span className="absolute -top-3 left-0 opacity-50">{val}</span>
                    </div>
                  ))}
                </div>

                {/* The Line */}
                <svg className="absolute inset-0 w-full h-full overflow-visible pl-8" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#60a5fa" />
                    </linearGradient>
                  </defs>

                  {/* Area Fill */}
                  <path
                    d="M0,250 C50,240 100,200 150,210 C200,220 250,180 300,150 C350,120 400,140 450,100 C500,60 550,80 600,40 L600,250 L0,250 Z"
                    fill="url(#lineGradient)"
                    className="transition-all duration-1000 ease-out"
                  />

                  {/* Line Stroke */}
                  <path
                    d="M0,250 C50,240 100,200 150,210 C200,220 250,180 300,150 C350,120 400,140 450,100 C500,60 550,80 600,40"
                    fill="none"
                    stroke="url(#strokeGradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                  />

                  {/* Data Points */}
                  {[
                    { cx: 150, cy: 210 },
                    { cx: 300, cy: 150 },
                    { cx: 450, cy: 100 },
                    { cx: 600, cy: 40, active: true }
                  ].map((point, i) => (
                    <circle
                      key={i}
                      cx={point.cx}
                      cy={point.cy}
                      r={point.active ? 6 : 4}
                      fill={point.active ? "#ffffff" : "#1e3a8a"}
                      stroke="#3b82f6"
                      strokeWidth="2"
                      className="transition-all duration-300 hover:r-6 hover:fill-white cursor-pointer"
                    />
                  ))}
                </svg>
              </div>

              <div className="flex justify-between text-xs text-gray-500 font-mono mt-4 pl-8">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>
          </div>

          <section>
            <div className='flex flex-col md:flex-row justify-between items-end gap-6 mb-8'>
              <div>
                <h2 className='text-2xl font-bold text-white mb-1'>
                  Portfolio
                </h2>
                <p className="text-sm text-gray-500">Manage your intellectual property assets.</p>
              </div>
              <div className="flex items-center gap-4">
                <FilterTabs
                  onFilterChange={(filter) => setActiveFilter(filter)}
                />
                <Link
                  href="/dashboard/arena"
                  className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]"
                >
                  <Plus className="w-4 h-4" />
                  Add New
                </Link>
              </div>
            </div>

            {isDemoMode && (
              <div className='mb-8 bg-blue-900/10 border border-blue-500/20 rounded-xl p-4 flex items-center gap-4 animate-fade-in-up'>
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className='text-sm text-white font-medium'>Demo Mode Active</p>
                  <p className='text-xs text-gray-400'>Upload your first performance data to unlock full potential.</p>
                </div>
              </div>
            )}

            {filteredAssets.length === 0 ? (
              <div className='text-center py-24 bg-[#0a0a0a] rounded-2xl border border-dashed border-white/10'>
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-6 h-6 text-gray-500" />
                </div>
                <p className='text-lg text-white font-medium mb-2'>
                  No assets found
                </p>
                <p className='text-sm text-gray-500 mb-6'>
                  Start building your portfolio by recording your first drill.
                </p>
                <Link
                  href="/dashboard/arena"
                  className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                >
                  Go to Arena →
                </Link>
              </div>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                {filteredAssets.map((asset) => (
                  <div key={asset.id} className='relative animate-fade-in-up' style={{ animationDelay: '100ms' }}>
                    <AssetCard
                      type={asset.type}
                      title={asset.title}
                      price={asset.price}
                      duration={asset.duration}
                      onClick={() => console.log("Asset clicked:", asset.id)}
                    />
                    {"isDemo" in asset && asset.isDemo && (
                      <div className='absolute top-3 right-3 bg-orange-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-lg'>
                        Demo
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

