"use client";

import { useEffect, useState, useCallback } from "react";
import { useDynamicContext, DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FilterTabs, AssetCard } from "@/components/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import type { Athlete, SyncAthleteRequest } from "@/lib/types/athlete";
import { AlertCircle, Plus, Shield, Activity, DollarSign, Layers, Trophy, TrendingUp, BarChart3, LineChart } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import dynamic from 'next/dynamic';

const PerformanceChart = dynamic(() => import('@/components/dashboard/performance-chart'), {
  loading: () => <div className="h-[350px] w-full flex items-center justify-center bg-white/5 rounded-lg animate-pulse">Loading Chart...</div>,
  ssr: false
});

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

const performanceData = [
  { name: 'Mon', value: 4000 },
  { name: 'Tue', value: 3000 },
  { name: 'Wed', value: 5000 },
  { name: 'Thu', value: 2780 },
  { name: 'Fri', value: 1890 },
  { name: 'Sat', value: 6390 },
  { name: 'Sun', value: 8490 },
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
  const { user, primaryWallet, sdkHasLoaded } = useDynamicContext();
  const [activeFilter, setActiveFilter] = useState<FilterOption>("all");
  const [chartType, setChartType] = useState<"area" | "bar">("area");
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

  // Show loading state while SDK is loading, user is not yet resolved, or query is loading
  if (!sdkHasLoaded || !user || isLoading) {
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
    <>
      <div className='p-6 lg:p-8 w-full max-w-[1600px] mx-auto animate-fade-in-up'>

        {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            <div className="bg-[#0a0a0a] rounded-2xl p-6 border border-white/10 hover:border-blue-500/30 transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <DollarSign className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +12.5%
                </span>
              </div>
              <div className="text-3xl font-bold text-white mb-1 tracking-tight">{stats.totalRoyalties.toLocaleString()} <span className="text-lg text-gray-500 font-normal">IP</span></div>
              <div className="text-sm text-gray-500">Total IP Value</div>
            </div>

            <div className="bg-[#0a0a0a] rounded-2xl p-6 border border-white/10 hover:border-purple-500/30 transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                  <Activity className="w-6 h-6" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1 tracking-tight">{stats.profileScore}<span className="text-lg text-gray-500 font-normal">/100</span></div>
              <div className="text-sm text-gray-500">Profile Score</div>
            </div>

            <div className="bg-[#0a0a0a] rounded-2xl p-6 border border-white/10 hover:border-orange-500/30 transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  <Layers className="w-6 h-6" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1 tracking-tight">{stats.totalAssets}</div>
              <div className="text-sm text-gray-500">Total Assets</div>
            </div>

            <div className="bg-[#0a0a0a] rounded-2xl p-6 border border-white/10 hover:border-pink-500/30 transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-xl bg-pink-500/10 text-pink-400 group-hover:bg-pink-500 group-hover:text-white transition-colors">
                  <Trophy className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-white bg-white/10 px-2 py-1 rounded-full">
                  {athleteProfile.level}
                </span>
              </div>
              <div className="text-3xl font-bold text-white mb-1 tracking-tight">#42</div>
              <div className="text-sm text-gray-500">Global Rank</div>
            </div>
          </div>

          {/* Main Chart Section */}
          <div className="bg-[#0a0a0a] rounded-2xl border border-white/10 p-6 mb-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Performance Analytics</h3>
                <p className="text-sm text-gray-500">Your asset growth and engagement over time</p>
              </div>
              <div className="flex items-center gap-4">
                {/* Chart Type Toggle */}
                <div className="flex bg-black rounded-lg p-1 border border-white/10">
                  <button
                    onClick={() => setChartType("area")}
                    className={`p-1.5 rounded-md transition-all ${chartType === 'area' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                    title="Line Chart"
                  >
                    <LineChart className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setChartType("bar")}
                    className={`p-1.5 rounded-md transition-all ${chartType === 'bar' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                    title="Bar Chart"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>
                </div>

                {/* Time Period Toggle */}
                <div className="flex overflow-x-auto bg-black rounded-lg p-1 border border-white/10">
                  {['1D', '1W', '1M', '1Y', 'ALL'].map((period) => (
                    <button key={period} className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all flex-shrink-0 ${period === '1M' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-white'}`}>
                      {period}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="h-[350px] w-full">
              <PerformanceChart data={performanceData} type={chartType} />
            </div>
          </div>

          <section>
            {/* ... (Portfolio Header and Assets Grid remain same) ... */}
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
    </>
  );
}
