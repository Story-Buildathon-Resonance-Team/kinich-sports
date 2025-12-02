"use client";

import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/custom/card";
import { Upload, Play, Activity, Trophy, CheckCircle2, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalysis } from "@/context/analysis-context";
import { MetadataModal } from "@/components/custom/metadata-modal";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useVideoUpload } from "@/hooks/useVideoUpload";

import { CompressionStatus } from "@/components/drills/compression-status";

export default function BurpeeAnalyzer() {
    const [showMetadata, setShowMetadata] = useState(false);
    const [athleteProfile, setAthleteProfile] = useState<any>(null);
    const { user } = useDynamicContext();
    const {
        setCanvasRef,
        isProcessing,
        progress,
        reps,
        status,
        feedback,
        metadata,
        videoSrc,
        setVideoSrc,
        startProcessing,
        resetAnalysis,
        compressVideo,
        compressedFile,
        assetId
    } = useAnalysis();

    // Fetch athlete profile on mount
    useEffect(() => {
        const fetchProfile = async () => {
            if (!user?.userId) return;

            try {
                const response = await fetch(`/api/athletes/me?dynamic_user_id=${user.userId}`);
                if (response.ok) {
                    const data = await response.json();
                    setAthleteProfile(data.athlete);
                }
            } catch (err) {
                console.error("[BurpeeAnalyzer] Failed to fetch athlete profile:", err);
            }
        };

        fetchProfile();
    }, [user?.userId]);

    // Initialize video upload hook
    const { uploadAndAnalyze, submitToStory, isUploading, error: uploadError, progress: uploadProgress } = useVideoUpload({
        athleteId: athleteProfile?.id,
        athleteProfile: {
            wallet_address: user?.verifiedCredentials?.[0]?.address,
            name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "Kinich Athlete",
            competitive_level: athleteProfile?.competitive_level || "competitive",
        },
        drillTypeId: "EXPL_BURPEE_001",
    });

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const repCounterRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setCanvasRef(canvasRef.current);
        return () => setCanvasRef(null);
    }, [setCanvasRef]);

    useEffect(() => {
        if (reps > 0 && repCounterRef.current) {
            gsap.fromTo(repCounterRef.current,
                { scale: 1.5, color: "#4ade80" },
                { scale: 1, color: "inherit", duration: 0.4, ease: "back.out(1.7)" }
            );
        }
    }, [reps]);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setVideoSrc(url);
            resetAnalysis();

            // Trigger compression immediately when file is uploaded
            compressVideo(file);
        }
    };

    // Auto-trigger upload after compression completes
    useEffect(() => {
        if (compressedFile && !assetId && !isUploading) {
            console.log("[BurpeeAnalyzer] Compression complete, auto-triggering upload...");
            uploadAndAnalyze(compressedFile).catch((err) => {
                console.error("[BurpeeAnalyzer] Auto-upload failed:", err);
            });
        }
    }, [compressedFile, assetId, isUploading, uploadAndAnalyze]);

    if (!videoSrc) {
        return (
            <div ref={containerRef} className="w-full h-full flex items-center justify-center">
                <Card className="w-full max-w-3xl aspect-video relative overflow-hidden bg-black border border-blue-500/20 shadow-2xl shadow-blue-900/10 rounded-xl group flex items-center justify-center transition-colors">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                        <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mb-6 border border-zinc-800 group-hover:border-blue-500/50 transition-colors shadow-lg">
                            <Upload className="w-8 h-8 text-zinc-400 group-hover:text-blue-400" />
                        </div>
                        <p className="text-lg font-medium text-white mb-1">Upload or drop video for analysis</p>

                        <Button
                            variant="outline"
                            className="mt-8 relative overflow-hidden border-white/10 hover:bg-white/5 text-white"
                        >
                            <input
                                type="file"
                                accept="video/*"
                                onChange={handleFileUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            />
                            <span className="relative z-0 flex items-center">
                                Browse Files
                            </span>
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="w-full h-[calc(100vh-100px)] flex gap-6">
            {/* Video Column */}
            <div className="flex-1 h-full bg-black rounded-xl border border-blue-500/20 relative overflow-hidden shadow-2xl">
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full object-contain z-10"
                />

                {isProcessing && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-scan z-20 pointer-events-none" />
                )}

                {/* Controls */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-30 px-6 py-3 bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-full shadow-xl hover:bg-zinc-900 transition-colors">
                    {!isProcessing ? (
                        <Button
                            onClick={startProcessing}
                            className="rounded-full w-12 h-12 p-0 bg-blue-600 hover:bg-blue-500 text-white border-none shadow-lg shadow-blue-900/30"
                        >
                            <Play className="w-5 h-5 fill-current ml-1" />
                        </Button>
                    ) : (
                        <div className="w-12 h-12 flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-white/20 border-t-blue-500 rounded-full animate-spin" />
                        </div>
                    )}

                    <div className="h-8 w-[1px] bg-white/10 mx-2" />

                    <Button
                        variant="ghost"
                        className="text-gray-400 hover:text-white hover:bg-transparent p-0 h-auto"
                    >
                        <label className="cursor-pointer flex flex-col items-center gap-1">
                            <input
                                type="file"
                                accept="video/*"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                            <span className="text-xs font-medium">Change Video</span>
                        </label>
                    </Button>
                </div>
            </div>

            {/* Stats Column */}
            <div className="w-[280px] flex flex-col gap-4 h-full flex-shrink-0">

                {/* Rep Counter */}
                <Card className="p-6 bg-black/60 backdrop-blur border border-white/10 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="p-3 rounded-full bg-blue-500/10 text-blue-400 mb-3 group-hover:scale-110 transition-transform duration-500">
                        <Trophy className="w-6 h-6" />
                    </div>
                    <div ref={repCounterRef} className="text-6xl font-mono font-bold text-white tracking-tighter mb-2 leading-none">
                        {reps}
                    </div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Valid Reps</p>
                </Card>

                {/* Progress & Phase */}
                <div className="grid gap-4">
                    {/* Phase */}
                    <Card className="p-4 bg-black/40 backdrop-blur border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Current Phase</span>
                            <div className={cn("w-1.5 h-1.5 rounded-full", status === "Idle" ? "bg-gray-500" : "bg-green-500 animate-pulse")} />
                        </div>
                        <p className={cn(
                            "text-lg font-bold transition-colors duration-300",
                            status === "DOWN" ? "text-orange-400" :
                                status === "STANDING" ? "text-blue-400" : "text-white"
                        )}>
                            {status === "Idle" ? "--" : status}
                        </p>
                        {feedback && (
                            <p className="text-[10px] text-gray-500 mt-1 font-mono">{feedback}</p>
                        )}
                    </Card>

                    {/* Progress */}
                    <Card className="p-4 bg-black/40 backdrop-blur border border-white/10">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Analysis Progress</span>
                            <Activity className={cn("w-3.5 h-3.5", isProcessing ? "text-blue-400 animate-pulse" : "text-gray-500")} />
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-2">
                            <div
                                className="h-full bg-blue-500 transition-all duration-200 ease-linear"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                            <span>{isProcessing ? "Processing..." : progress === 100 ? "Completed" : "Ready"}</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                    </Card>
                </div>

                {/* Metadata / Result */}
                <div className="flex-1 min-h-[200px] flex flex-col">
                    {/* Always render CompressionStatus if we have a video file, even before metadata */}
                    <CompressionStatus
                        uploadProgress={uploadProgress}
                        isUploading={isUploading}
                    />

                    {metadata ? (
                        <>
                            <Card 
                                onClick={() => setShowMetadata(true)}
                                className="h-full p-5 bg-zinc-900/80 border border-green-500/30 animate-in fade-in duration-700 flex flex-col shadow-lg shadow-green-900/5 cursor-pointer hover:border-green-500/60 transition-colors group/card relative"
                            >
                                <div className="absolute top-3 right-3 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                    <Maximize2 className="w-4 h-4 text-gray-400" />
                                </div>
                                <div className="flex items-center gap-2 text-green-400 mb-4 pb-3 border-b border-white/5">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span className="font-bold text-sm tracking-wide">
                                        {metadata.verification?.is_verified ? "VERIFIED" : "ANALYZED"}
                                    </span>
                                </div>

                                <div className="space-y-4 flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 pointer-events-none">
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase mb-1 font-bold tracking-wider">Drill ID</p>
                                        <p className="text-xs text-white font-mono bg-black/20 p-1.5 rounded border border-white/5">{metadata.drill_type_id}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase mb-1 font-bold tracking-wider">Form Score</p>
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-green-500"
                                                    style={{ width: `${(metadata.cv_metrics?.form_score_avg || 0) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-white font-mono">
                                                {(metadata.cv_metrics?.form_score_avg || 0).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase mb-1 font-bold tracking-wider">Rep Timestamps</p>
                                        <div className="flex flex-wrap gap-1.5 h-20 overflow-y-auto content-start">
                                            {metadata.cv_metrics?.rep_timestamps?.map((ts: number, i: number) => (
                                                <span key={i} className="px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-300 font-mono">
                                                    {ts.toFixed(2)}s
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full mt-4 text-xs h-8 border-white/10 hover:bg-white/5 hover:text-white pointer-events-auto"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowMetadata(true);
                                    }}
                                >
                                    <Maximize2 className="w-3 h-3 mr-2" />
                                    View Full Metadata
                                </Button>
                            </Card>

                            <MetadataModal
                                isOpen={showMetadata}
                                onClose={() => setShowMetadata(false)}
                                metadata={metadata}
                                onSubmit={async () => {
                                    if (assetId && metadata) {
                                        await submitToStory(assetId, metadata);
                                    }
                                }}
                                isSubmitting={uploadProgress === 'registering'}
                                athleteName={user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "Kinich Athlete"}
                                athleteWallet={user?.verifiedCredentials?.[0]?.address}
                            />
                        </>
                    ) : (
                        <div className="h-full flex flex-col gap-3 p-1">
                            <Skeleton className="h-8 w-2/3 bg-white/5 rounded-md" />
                            <Skeleton className="flex-1 w-full bg-white/5 rounded-xl" />
                            <Skeleton className="h-8 w-full bg-white/5 rounded-md" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
