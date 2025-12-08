"use client";

import { useState } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Video, Mic, Play, Clock, SlidersHorizontal, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import FilterTabs from "@/components/dashboard/filter-tabs"; // Import our newly memoized FilterTabs
import AssetCard from "@/components/dashboard/asset-card";

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

// Fetcher function
async function fetchAssetsApi(userId: string): Promise<Asset[]> {
    const athleteResponse = await fetch(
        `/api/athletes/me?dynamic_user_id=${userId}`
    );

    if (!athleteResponse.ok) {
        throw new Error("Failed to fetch athlete data");
    }

    const athleteData = await athleteResponse.json();

    const assetsResponse = await fetch(
        `/api/assets?athlete_id=${athleteData.athlete.id}`
    );

    if (!assetsResponse.ok) {
        throw new Error("Failed to fetch assets");
    }

    const assetsData = await assetsResponse.json();
    return assetsData.assets || [];
}

export default function AssetsPage() {
    const { user, sdkHasLoaded } = useDynamicContext();
    const router = useRouter();
    const [activeFilter, setActiveFilter] = useState<"all" | "video" | "audio">("all");

    const {
        data: assets,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["assets-list", user?.userId],
        queryFn: () => {
            if (!user?.userId) throw new Error("User not authenticated");
            return fetchAssetsApi(user.userId);
        },
        enabled: !!user?.userId,
    });

    const filteredAssets = assets?.filter(asset => {
        if (activeFilter === "all") return true;
        return asset.asset_type === activeFilter;
    });

    if (!sdkHasLoaded || !user || isLoading) {
        return (
            <div className="p-6 lg:p-8 w-full max-w-[1600px] mx-auto space-y-8">
                <div className="flex justify-between items-end">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48 rounded-lg bg-white/5" />
                        <Skeleton className="h-4 w-64 rounded-lg bg-white/5" />
                    </div>
                    <Skeleton className="h-10 w-48 rounded-lg bg-white/5" />
                </div>
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-24 w-full rounded-xl bg-white/5" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 flex items-center justify-center p-8 min-h-[50vh]">
                <div className="text-center max-w-md p-8 glass-panel rounded-2xl border border-white/10 bg-zinc-900/50">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Unable to load assets</h3>
                    <p className="text-gray-400 mb-6 text-sm">
                        {error instanceof Error ? error.message : "Error loading assets"}
                    </p>
                </div>
            </div>
        );
    }

    const formatDuration = (seconds?: number): string => {
        if (!seconds) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <div className="p-6 lg:p-8 w-full max-w-[1600px] mx-auto animate-fade-in-up">
            <div className="flex justify-end mb-6">
                <FilterTabs
                    defaultFilter="all"
                    onFilterChange={(filter) => setActiveFilter(filter)}
                />
            </div>

            {!filteredAssets || filteredAssets.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/5">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
                        <SlidersHorizontal className="w-8 h-8" />
                    </div>
                    <p className="text-white font-medium mb-1">No assets found</p>
                    <p className="text-gray-400 mb-6 text-sm max-w-md mx-auto">
                        {assets && assets.length > 0
                            ? `No ${activeFilter} assets found in your portfolio.`
                            : "Start building your portfolio by recording your first drill."}
                    </p>
                    {(assets && assets.length === 0) && (
                        <button
                            onClick={() => router.push("/dashboard/arena")}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
                        >
                            Go to Arena
                        </button>
                    )}
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {filteredAssets.map((asset) => {
                        const metadata = asset.metadata || {};
                        const title = metadata.drill_name || metadata.challenge_name || metadata.title || asset.drill_type_id;
                        const isVideo = asset.asset_type === "video";

                        // Extract duration
                        let duration = "0:00";
                        if (metadata.video_metadata?.duration_seconds) {
                            duration = formatDuration(metadata.video_metadata.duration_seconds);
                        } else if (metadata.recording_duration_seconds) {
                            duration = formatDuration(metadata.recording_duration_seconds);
                        } else if (metadata.duration_seconds) {
                            duration = formatDuration(metadata.duration_seconds);
                        }

                        return (
                            <div key={asset.id}>
                                <div className="md:hidden p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl transition-all cursor-pointer" onClick={() => router.push(`/dashboard/assets/${asset.id}`)}>
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", isVideo ? "bg-blue-900/20" : "bg-purple-900/20")}>
                                            {isVideo ? <Video className="w-4 h-4 text-blue-400" /> : <Mic className="w-4 h-4 text-purple-400" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-white font-medium text-sm truncate">{title}</h3>
                                            <p className="text-xs text-gray-500 truncate">ID: {asset.id.slice(0, 8)}</p>
                                        </div>
                                        <div className={cn("px-2 py-1 rounded-full text-[10px] font-bold", asset.status === 'active' || asset.status === 'registered' ? "bg-emerald-500/10 text-emerald-400" : "bg-yellow-500/10 text-yellow-400")}>
                                            {asset.status === 'registered' ? 'Active' : asset.status}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                                        <div className="flex items-center gap-1 text-gray-400">
                                            <Calendar className="w-3 h-3" />
                                            <span>{formatDate(asset.created_at)}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-400">
                                            <Clock className="w-3 h-3" />
                                            <span>{duration}</span>
                                        </div>
                                    </div>
                                    <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                                        <span className="text-xs text-gray-400">License Fee</span>
                                        <span className="text-sm font-bold text-white font-mono">{asset.license_fee} <span className="text-xs text-gray-500">$IP</span></span>
                                    </div>
                                </div>

                                <div className="hidden md:grid grid-cols-[auto_1.5fr_1fr_1fr_auto] gap-6 p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl transition-all cursor-pointer items-center" onClick={() => router.push(`/dashboard/assets/${asset.id}`)}>
                                    <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center relative overflow-hidden", isVideo ? "bg-blue-900/20" : "bg-purple-900/20")}>
                                        {isVideo ? <Video className="w-5 h-5 text-blue-400" /> : <Mic className="w-5 h-5 text-purple-400" />}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-3 mb-1.5">
                                            <h3 className="text-white font-medium text-sm truncate">{title}</h3>
                                            <div className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border", isVideo ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-purple-500/10 text-purple-400 border-purple-500/20")}>
                                                {isVideo ? "VIS" : "AUD"}
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 truncate">ID: {asset.id.slice(0, 8)}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Level</span>
                                        <p className="text-sm text-white capitalize">{metadata.athlete_profile?.experience_level || "Competitive"}</p>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                                            <Calendar className="w-3 h-3" />
                                            <span>{formatDate(asset.created_at)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <Clock className="w-3 h-3" />
                                            <span>{duration}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 justify-end">
                                        <div className="text-sm font-bold text-white font-mono">{asset.license_fee} <span className="text-xs text-gray-500">$IP</span></div>
                                        <div className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border", asset.status === 'active' || asset.status === 'registered' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20")}>
                                            {asset.status === 'registered' ? 'Active' : asset.status}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

