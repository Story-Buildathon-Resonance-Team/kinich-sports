"use client";

import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import ProfileScoreDisplay from "@/components/dashboard/profile-score-display";
import ProfileHeaderSection from "@/components/dashboard/profile-header-section";
import DashboardLoading from "@/app/dashboard/loading";
import {
  Activity,
  DollarSign,
  Layers,
  Trophy,
  BarChart3,
  LineChart,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

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

const DEMO_PERFORMANCE_DATA = [
  { name: "Mon", value: 0 },
  { name: "Tue", value: 0 },
  { name: "Wed", value: 0 },
  { name: "Thu", value: 0 },
  { name: "Fri", value: 0 },
  { name: "Sat", value: 0 },
  { name: "Sun", value: 0 },
];

export default function AthleteDashboard() {
  const { user, sdkHasLoaded } = useDynamicContext();
  const [chartType, setChartType] = useState<"area" | "bar">("area");
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!user?.userId) return;
      
      try {
        const [athleteRes] = await Promise.all([
            fetch(`/api/athletes/me?dynamic_user_id=${user.userId}`)
        ]);

        if (!isMounted || !user?.userId) return;

        if (!athleteRes.ok) throw new Error("Failed to fetch athlete");
        const athleteData = await athleteRes.json();
        
        if (!isMounted || !user?.userId) return;

        const assetsRes = await fetch(`/api/assets?athlete_id=${athleteData.athlete.id}`);
        const assetsData = assetsRes.ok ? await assetsRes.json() : { assets: [] };

        if (!isMounted || !user?.userId) return;

        setData({
          athlete: athleteData.athlete,
          stats: athleteData.stats,
          assets: assetsData.assets
        });
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (sdkHasLoaded && user) {
      loadData();
    }

    return () => {
      isMounted = false;
    };
  }, [user, sdkHasLoaded]);


  if (!sdkHasLoaded || !user || loading) {
    return <DashboardLoading />;
  }

  if (!data) {
    return (
        <div className="p-8 text-center">Failed to load data. Please refresh.</div>
    )
  }

  const { athlete, stats, assets } = data;

  const audioCount = assets.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (asset: any) => asset.asset_type === "audio"
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const generateChartData = (assets: any[]) => {
    if (!assets || assets.length === 0) return [];
    const sortedAssets = [...assets].sort(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    let cumulativeValue = 0;
    const dataMap = new Map<string, number>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sortedAssets.forEach((asset: any) => {
      const date = new Date(asset.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      cumulativeValue += Number(asset.license_fee) || 0;
      dataMap.set(date, cumulativeValue);
    });
    const chartData = Array.from(dataMap.entries()).map(([name, value]) => ({
      name,
      value,
    }));
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

  const chartData = assets && assets.length > 0
    ? generateChartData(assets)
    : DEMO_PERFORMANCE_DATA;

  return (
    <div className='p-6 lg:p-8 w-full max-w-[1600px] mx-auto animate-fade-in-up'>
      {/* Profile Header Section */}
      <ProfileHeaderSection
        athlete={athleteProfile}
        onVerificationSuccess={() => window.location.reload()}
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
