"use client";

import { useState } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useQuery } from "@tanstack/react-query";
import ProfileScoreDisplay from "@/components/dashboard/profile-score-display";
import ProfileHeaderSection from "@/components/dashboard/profile-header-section";
import DashboardLoading from "@/app/dashboard/loading";
import type { Athlete, SyncAthleteRequest } from "@/lib/types/athlete";
import {
  AlertCircle,
  Activity,
  DollarSign,
  Layers,
  Trophy,
  BarChart3,
  LineChart,
} from "lucide-react";
import dynamic from "next/dynamic";

const PerformanceChart = dynamic(
  () => import("@/components/dashboard/performance-chart"),
  {
    loading: () => (
      <div className='h-[350px] w-full flex items-center justify-center bg-white/5 rounded-lg animate-pulse'>
        Loading Chart...
      </div>
    ),
    ssr: false,
  }
);

interface Asset {
  id: string;
  asset_type: "video" | "audio";
  drill_type_id: string;
  asset_url: string;
  license_fee: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

const DEMO_PERFORMANCE_DATA = [
  { name: "Mon", value: 0 },
  { name: "Tue", value: 0 },
  { name: "Wed", value: 0 },
  { name: "Thu", value: 0 },
  { name: "Fri", value: 0 },
  { name: "Sat", value: 0 },
  { name: "Sun", value: 0 },
];

// Fetcher function for React Query
async function fetchDashboardDataApi(
  userId: string,
  primaryWalletAddress: string | undefined,
  firstName?: string,
  lastName?: string
): Promise<DashboardData> {
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
  const [chartType, setChartType] = useState<"area" | "bar">("area");

  const {
    data: dashboardData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["dashboard", user?.userId],
    queryFn: () => {
      if (!user?.userId) throw new Error("User not authenticated");
      return fetchDashboardDataApi(
        user.userId,
        primaryWallet?.address,
        user.firstName,
        user.lastName
      );
    },
    enabled: !!user?.userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const generateChartData = (assets: Asset[]) => {
    if (!assets || assets.length === 0) return [];

    // Sort assets by date ascending
    const sortedAssets = [...assets].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    let cumulativeValue = 0;
    const dataMap = new Map<string, number>();

    sortedAssets.forEach((asset) => {
      const date = new Date(asset.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      cumulativeValue += Number(asset.license_fee) || 0;
      dataMap.set(date, cumulativeValue);
    });

    // Convert map to array
    const chartData = Array.from(dataMap.entries()).map(([name, value]) => ({
      name,
      value,
    }));

    // If only one data point, add a "start" point to make a line
    if (chartData.length === 1) {
      const firstDate = new Date(sortedAssets[0].created_at);
      firstDate.setDate(firstDate.getDate() - 1);
      chartData.unshift({
        name: firstDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        value: 0
      });
    }

    return chartData;
  };

  // Calculate real chart data
  const chartData = dashboardData?.assets && dashboardData.assets.length > 0
    ? generateChartData(dashboardData.assets)
    : DEMO_PERFORMANCE_DATA; // Fallback to minimal data if no assets

  if (!sdkHasLoaded || !user || isLoading) {
    return <DashboardLoading />;
  }

  if (error || !dashboardData) {
    return (
      <div className='flex-1 flex items-center justify-center p-8'>
        <div className='text-center max-w-md p-8 glass-panel rounded-2xl'>
          <AlertCircle className='w-12 h-12 text-red-500 mx-auto mb-4' />
          <h3 className='text-xl font-bold text-white mb-2'>
            Unable to load dashboard
          </h3>
          <p className='text-gray-400 mb-6 text-sm'>
            {error instanceof Error
              ? error.message
              : "We encountered an issue loading your athlete data."}
          </p>
          <button
            onClick={() => refetch()}
            className='px-6 py-2.5 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors'
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const { athlete, stats, assets } = dashboardData;

  const audioCount = assets.filter(
    (asset) => asset.asset_type === "audio"
  ).length;

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
    <div className='p-6 lg:p-8 w-full max-w-[1600px] mx-auto animate-fade-in-up'>
      {/* Profile Header Section */}
      <ProfileHeaderSection
        athlete={athleteProfile}
        onVerificationSuccess={() => refetch()}
      />

      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8'>
        <div className='bg-[#0a0a0a] rounded-2xl p-6 border border-white/10 hover:border-blue-500/30 transition-colors group'>
          <div className='flex justify-between items-start mb-4'>
            <div className='p-3 rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors'>
              <DollarSign className='w-6 h-6' />
            </div>
          </div>
          <div className='text-3xl font-bold text-white mb-1 tracking-tight'>
            {stats.totalRoyalties.toLocaleString()}{" "}
            <span className='text-lg text-gray-500 font-normal'>IP</span>
          </div>
          <div className='text-sm text-gray-500'>Total IP Value</div>
        </div>

        <div className='bg-[#0a0a0a] rounded-2xl p-6 border border-white/10 hover:border-purple-500/30 transition-colors group'>
          <div className='flex justify-between items-start mb-4'>
            <div className='p-3 rounded-xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors'>
              <Activity className='w-6 h-6' />
            </div>
          </div>
          <ProfileScoreDisplay
            score={stats.profileScore}
            worldIdVerified={athlete.world_id_verified}
            audioCount={audioCount}
          />
          <div className='text-sm text-gray-500 mt-1'>Profile Score</div>
        </div>

        <div className='bg-[#0a0a0a] rounded-2xl p-6 border border-white/10 hover:border-orange-500/30 transition-colors group'>
          <div className='flex justify-between items-start mb-4'>
            <div className='p-3 rounded-xl bg-orange-500/10 text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-colors'>
              <Layers className='w-6 h-6' />
            </div>
          </div>
          <div className='text-3xl font-bold text-white mb-1 tracking-tight'>
            {stats.totalAssets}
          </div>
          <div className='text-sm text-gray-500'>Total Assets</div>
        </div>

        <div className='bg-[#0a0a0a] rounded-2xl p-6 border border-white/10 hover:border-pink-500/30 transition-colors group'>
          <div className='flex justify-between items-start mb-4'>
            <div className='p-3 rounded-xl bg-pink-500/10 text-pink-400 group-hover:bg-pink-500 group-hover:text-white transition-colors'>
              <Trophy className='w-6 h-6' />
            </div>
            <span className='text-xs font-medium text-white bg-white/10 px-2 py-1 rounded-full'>
              {athleteProfile.level}
            </span>
          </div>
          <div className='text-3xl font-bold text-white mb-1 tracking-tight'>
            #42
          </div>
          <div className='text-sm text-gray-500'>Global Rank</div>
        </div>
      </div>

      {/* Main Chart Section */}
      <div className='bg-[#0a0a0a] rounded-2xl border border-white/10 p-6 mb-10'>
        <div className='flex justify-between items-center mb-8'>
          <div>
            <h3 className='text-xl font-bold text-white mb-1'>
              Performance Analytics
            </h3>
            <p className='text-sm text-gray-500'>
              Your asset growth and engagement over time
            </p>
          </div>
          <div className='flex items-center gap-4'>
            {/* Chart Type Toggle */}
            <div className='flex bg-black rounded-lg p-1 border border-white/10'>
              <button
                onClick={() => setChartType("area")}
                className={`p-1.5 rounded-md transition-all ${chartType === "area"
                  ? "bg-white/10 text-white"
                  : "text-gray-500 hover:text-white"
                  }`}
                title='Line Chart'
              >
                <LineChart className='w-4 h-4' />
              </button>
              <button
                onClick={() => setChartType("bar")}
                className={`p-1.5 rounded-md transition-all ${chartType === "bar"
                  ? "bg-white/10 text-white"
                  : "text-gray-500 hover:text-white"
                  }`}
                title='Bar Chart'
              >
                <BarChart3 className='w-4 h-4' />
              </button>
            </div>

            {/* Time Period Toggle */}
            <div className='flex overflow-x-auto bg-black rounded-lg p-1 border border-white/10'>
              {["1D", "1W", "1M", "1Y", "ALL"].map((period) => (
                <button
                  key={period}
                  className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all flex-shrink-0 ${period === "1M"
                    ? "bg-white text-black shadow-sm"
                    : "text-gray-500 hover:text-white"
                    }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className='h-[350px] w-full'>
          <PerformanceChart data={chartData} type={chartType} />
        </div>
      </div>
    </div>
  );
}
