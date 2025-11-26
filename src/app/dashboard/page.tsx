"use client";

import { useEffect, useState, useCallback } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { FilterTabs, AssetCard } from "@/components/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import type { Athlete, SyncAthleteRequest } from "@/lib/types/athlete";
import { AlertCircle, Plus, Shield } from "lucide-react";
import Link from "next/link";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";

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

export default function AthleteDashboard() {
  const { user, primaryWallet } = useDynamicContext();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterOption>("all");

  const fetchDashboardData = useCallback(async () => {
    if (!user?.userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Attempt to fetch athlete data
      let athleteResponse = await fetch(
        `/api/athletes/me?dynamic_user_id=${user.userId}`
      );

      // If user not found (404), attempt to sync athlete record
      if (athleteResponse.status === 404 && primaryWallet?.address) {
        console.log("Athlete not found in database, attempting sync...");
        
        const syncData: SyncAthleteRequest = {
            dynamicUserId: user.userId,
            walletAddress: primaryWallet.address,
            firstName: user.firstName,
            lastName: user.lastName,
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
                    `/api/athletes/me?dynamic_user_id=${user.userId}`
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

      setDashboardData({
        athlete: athleteData.athlete,
        stats: athleteData.stats,
        assets: assetsData.assets,
      });
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [user?.userId, user?.firstName, user?.lastName, primaryWallet?.address]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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

  if (loading) {
    return (
        <div className='p-8 pt-12'>
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
    );
  }

  if (error || !dashboardData) {
    return (
        <div className='flex items-center justify-center p-8 h-full'>
            <div className='text-center max-w-md p-8 glass-panel rounded-2xl'>
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Unable to load dashboard</h3>
            <p className='text-gray-400 mb-6 text-sm'>
                {error || "We encountered an issue loading your athlete data."}
            </p>
            <button
                onClick={fetchDashboardData}
                className='px-6 py-2.5 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors'
            >
                Retry Connection
            </button>
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
      <div className='h-full'>
        <header className="sticky top-0 z-40 flex items-center justify-between px-8 py-6 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 lg:hidden">
             <Link href="/" className="text-xl font-bold text-white">KINICH</Link>
             <DynamicWidget variant="dropdown" />
        </header>

        <div className='p-6 lg:p-10 max-w-[1400px] mx-auto animate-fade-in-up'>
            {/* Welcome / Stats Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                <div className="lg:col-span-2 glass-panel rounded-3xl p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-600/20 transition-all duration-700" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20 flex items-center justify-center text-xl font-bold text-blue-200">
                                {athleteProfile.initials}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white tracking-tight">{athleteProfile.name}</h1>
                                <div className="flex items-center gap-3 text-gray-400 text-sm">
                                    <span className="uppercase tracking-wider font-medium">{athleteProfile.discipline}</span>
                                    <span className="w-1 h-1 rounded-full bg-gray-600" />
                                    <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs">{athleteProfile.level}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-8 pt-6 border-t border-white/5">
                            <div>
                                <div className="text-sm text-gray-500 mb-1">Total Returns</div>
                                <div className="text-2xl font-bold text-white flex items-center gap-2">
                                    {stats.totalRoyalties} <span className="text-sm text-green-400 font-medium font-mono">+$142.50</span>
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 mb-1">Profile Score</div>
                                <div className="text-2xl font-bold text-white">{stats.profileScore}<span className="text-sm text-gray-500 font-normal">/100</span></div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 mb-1">Verified</div>
                                <div className="flex items-center gap-2">
                                    {athleteProfile.world_id_verified ? (
                                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-bold uppercase tracking-wider border border-blue-500/20">World ID</span>
                                    ) : (
                                        <span className="text-white font-medium flex items-center gap-2">
                                            No <Shield className="w-4 h-4 text-gray-500" />
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-panel rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-orange-500/10 to-transparent" />
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Performance</h3>
                        <p className="text-sm text-gray-400 mb-6">Last 30 days activity</p>
                    </div>
                    
                    {/* Mini Chart Placeholder */}
                    <div className="h-24 flex items-end justify-between gap-1 relative z-10">
                        {[40, 65, 45, 80, 55, 70, 60].map((h, i) => (
                            <div key={i} className="w-full bg-orange-500/20 rounded-t-sm hover:bg-orange-500/40 transition-colors" style={{ height: `${h}%` }} />
                        ))}
                    </div>
                </div>
            </div>

            <section>
                <div className='flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 border-b border-white/5 pb-6'>
                    <div>
                        <h2 className='text-xl font-semibold text-white mb-1'>
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
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-blue-900/20"
                        >
                            <Plus className="w-4 h-4" />
                            Add New
                        </Link>
                    </div>
                </div>

                {isDemoMode && (
                <div className='mb-8 bg-blue-900/10 border border-blue-500/20 rounded-xl p-4 flex items-center gap-3 animate-fade-in-up'>
                    <div className="w-1.5 h-12 bg-blue-500 rounded-full" />
                    <div>
                        <p className='text-sm text-blue-200 font-medium'>Demo Mode Active</p>
                        <p className='text-xs text-blue-300/60'>Showing sample assets. Upload your first performance data to get started.</p>
                    </div>
                </div>
                )}

                {filteredAssets.length === 0 ? (
                <div className='text-center py-24 glass-panel rounded-2xl border-dashed border-white/10'>
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus className="w-6 h-6 text-gray-500" />
                    </div>
                    <p className='text-lg text-white font-medium mb-2'>
                    No assets found
                    </p>
                    <p className='text-sm text-gray-500 mb-6 max-w-xs mx-auto'>
                    {activeFilter !== "all"
                        ? `Try changing the filter or upload your first ${activeFilter} asset.`
                        : "Start building your portfolio by recording your first drill."}
                    </p>
                    <Link 
                        href="/dashboard/arena"
                        className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                    >
                        Go to Arena →
                    </Link>
                </div>
                ) : (
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
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
                        <div className='absolute top-3 right-3 bg-orange-500 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-lg'>
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
  );
}
