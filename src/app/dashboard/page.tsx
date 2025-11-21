"use client";

import { useEffect, useState } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { ProfileSidebar, AssetCard, FilterTabs } from "@/components/dashboard";
import { getDrillById } from "@/lib/drills/constants";
import type { Athlete } from "@/lib/types/athlete";

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
  const { user } = useDynamicContext();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterOption>("all");

  useEffect(() => {
    if (user?.userId) {
      fetchDashboardData();
    }
  }, [user?.userId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch athlete data and stats
      const athleteResponse = await fetch(
        `/api/athletes/me?dynamic_user_id=${user?.userId}`
      );

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
  };

  const handleVerificationSuccess = () => {
    // Refresh dashboard data to show updated verification status
    fetchDashboardData();
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const transformAssetForCard = (asset: Asset) => {
    const drill = getDrillById(asset.drill_type_id);
    const title = drill?.name || asset.drill_type_id;

    // Get duration from drill constants or metadata
    let duration = "0:00";
    if (drill && "duration_seconds" in drill) {
      duration = formatDuration(drill.duration_seconds);
    } else if (drill && "duration_minutes" in drill) {
      duration = `${drill.duration_minutes}:00`;
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
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-16 h-16 border-4 border-[rgba(245,247,250,0.1)] border-t-[#FF6B35] rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-[#F5F7FA] text-lg'>Loading your arena...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center max-w-md'>
          <p className='text-[#F5F7FA] text-lg mb-4'>
            {error || "Failed to load dashboard"}
          </p>
          <button
            onClick={fetchDashboardData}
            className='px-6 py-3 bg-gradient-to-br from-[rgba(0,71,171,0.8)] to-[rgba(0,86,214,0.8)] border border-[rgba(184,212,240,0.2)] text-[#F5F7FA] rounded-xl hover:shadow-[0_8px_28px_rgba(0,71,171,0.3)] transition-all duration-300'
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { athlete, stats, assets } = dashboardData;

  // Demo mode: show demo assets if athlete has < 2 real assets
  const isDemoMode = assets.length < 2;
  const realAssets = assets.map(transformAssetForCard);
  const demoAssetsToShow = isDemoMode
    ? DEMO_ASSETS.slice(0, 2 - assets.length)
    : [];
  const allAssets = [...realAssets, ...demoAssetsToShow];

  // Filter assets
  const filteredAssets =
    activeFilter === "all"
      ? allAssets
      : allAssets.filter((asset) => asset.type === activeFilter);

  // Get initials for profile
  const getInitials = (name: string | null): string => {
    if (!name) return "AT";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Map competitive_level to level type
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
    discipline: athlete.discipline || "Athlete",
    level: mapLevel(athlete.competitive_level),
    world_id_verified: athlete.world_id_verified,
    world_id_verified_at: athlete.world_id_verified_at,
  };

  return (
    <div className='min-h-screen'>
      <div className='grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 pt-[100px] px-6 lg:px-16 pb-16 max-w-[1600px] mx-auto'>
        <ProfileSidebar
          athlete={athleteProfile}
          stats={stats}
          onUploadClick={() => console.log("Upload clicked")}
          onVerificationSuccess={handleVerificationSuccess}
        />

        <main className='min-h-[calc(100vh-164px)]'>
          <div className='mb-10'>
            <h1 className='text-[32px] lg:text-[42px] font-light tracking-tight mb-2'>
              Performance Portfolio
            </h1>
            <p className='text-[15px] text-[rgba(245,247,250,0.6)]'>
              Verified training data • Blockchain-registered IP
            </p>
          </div>

          <section>
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8'>
              <h2 className='text-[18px] font-medium uppercase tracking-[1.5px] text-[rgba(245,247,250,0.7)]'>
                All Performance Assets
              </h2>
              <FilterTabs
                onFilterChange={(filter) => setActiveFilter(filter)}
              />
            </div>

            {isDemoMode && (
              <div className='mb-6 bg-[rgba(0,71,171,0.08)] border border-[rgba(0,71,171,0.2)] rounded-lg p-4'>
                <p className='text-[13px] text-[rgba(184,212,240,0.9)]'>
                  <strong>Demo Mode:</strong> Showing sample assets. Upload your
                  first performance data to get started.
                </p>
              </div>
            )}

            {filteredAssets.length === 0 ? (
              <div className='text-center py-16'>
                <p className='text-[rgba(245,247,250,0.6)] text-lg mb-4'>
                  No assets found
                </p>
                <p className='text-[rgba(245,247,250,0.4)] text-sm'>
                  {activeFilter !== "all"
                    ? `Try changing the filter or upload your first ${activeFilter} asset.`
                    : "Upload your first performance asset to get started."}
                </p>
              </div>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                {filteredAssets.map((asset) => (
                  <div key={asset.id} className='relative'>
                    <AssetCard
                      type={asset.type}
                      title={asset.title}
                      price={asset.price}
                      duration={asset.duration}
                      onClick={() => console.log("Asset clicked:", asset.id)}
                    />
                    {"isDemo" in asset && asset.isDemo && (
                      <div className='absolute top-3 left-3 bg-[rgba(255,107,53,0.9)] text-[#F5F7FA] text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded'>
                        Demo
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
