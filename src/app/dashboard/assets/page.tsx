"use client";

import { useState } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Video, Mic, Play, ChevronRight, Clock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

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

    if (!sdkHasLoaded || !user || isLoading) {
        return (
            <div className="p-8 space-y-4 max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <Skeleton className="h-10 w-48 rounded-lg bg-white/5" />
                </div>
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-xl bg-white/5" />
                ))}
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
        const secs = seconds % 60;
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
        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto animate-fade-in-up">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Your Assets</h1>
                    <p className="text-gray-400 mt-1">Manage your registered IP performance data</p>
                </div>
            </div>

            {!assets || assets.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/5">
                    <p className="text-gray-400 mb-4">No assets found in your portfolio.</p>
                    <button
                        onClick={() => router.push("/dashboard/arena")}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
                    >
                        Go to Arena
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {assets.map((asset) => {
                        const metadata = asset.metadata || {};
                        const title = metadata.drill_name || metadata.challenge_name || metadata.title || asset.drill_type_id;
                        const isVideo = asset.asset_type === "video";

                        // Extract duration
                        let duration = 0;
                        if (metadata.video_metadata?.duration_seconds) {
                            duration = metadata.video_metadata.duration_seconds;
                        } else if (metadata.recording_duration_seconds) {
                            duration = metadata.recording_duration_seconds;
                        } else if (metadata.duration_seconds) {
                            duration = metadata.duration_seconds;
                        }

                        return (
                            <div
                                key={asset.id}
                                onClick={() => router.push(`/dashboard/assets/${asset.id}`)}
                                className="group relative flex items-center gap-4 p-4 bg-[#0a0a0a] hover:bg-[#111] border border-white/5 hover:border-white/10 rounded-xl transition-all duration-200 cursor-pointer overflow-hidden"
                            >
                                {/* Asset Icon/Thumbnail */}
                                <div className={cn(
                                    "w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0",
                                    isVideo ? "bg-blue-900/20 text-blue-400" : "bg-purple-900/20 text-purple-400"
                                )}>
                                    {isVideo ? <Video className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">

                                    {/* Title & Type */}
                                    <div className="md:col-span-5">
                                        <h3 className="text-white font-medium text-lg truncate pr-4 group-hover:text-blue-400 transition-colors">
                                            {title}
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                            <span className="uppercase tracking-wider font-bold text-[10px]">
                                                {asset.asset_type}
                                            </span>
                                            <span>•</span>
                                            <span className="capitalize">{metadata.athlete_profile?.experience_level || "Competitive"}</span>
                                        </div>
                                    </div>

                                    {/* Metrics */}
                                    <div className="md:col-span-3 flex items-center gap-6 text-sm text-gray-400">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4" />
                                            <span>{formatDuration(duration)}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4" />
                                            <span>{formatDate(asset.created_at)}</span>
                                        </div>
                                    </div>

                                    {/* Price & Status */}
                                    <div className="md:col-span-4 flex items-center justify-end gap-4">
                                        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs font-mono text-white">
                                            {asset.license_fee} $IP
                                        </div>

                                        <div className={cn(
                                            "px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border",
                                            asset.status === 'active' || asset.status === 'registered'
                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                        )}>
                                            {asset.status === 'registered' ? 'Active' : asset.status}
                                        </div>

                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-white/10 group-hover:text-white transition-colors">
                                            <ChevronRight className="w-4 h-4" />
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

