import { Loader2, Upload, Database, Activity, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/custom/card";
import { useAnalysis } from "@/context/analysis-context";
import { cn } from "@/lib/utils";

interface CompressionStatusProps {
    uploadProgress?: "idle" | "uploading" | "creating-record" | "analyzing" | "updating-metadata" | "registering" | "complete";
    isUploading?: boolean;
}

export function CompressionStatus({ uploadProgress = "idle", isUploading = false }: CompressionStatusProps) {
    const { isCompressing, compressionProgress, compressedFile, isProcessing } = useAnalysis();

    // Don't show if nothing is happening
    if (!isCompressing && !compressedFile && !isUploading && !isProcessing) return null;

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Determine current stage
    const getCurrentStage = () => {
        if (isCompressing) {
            return {
                icon: <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />,
                label: "Compressing Video",
                sublabel: `${Math.round(compressionProgress)}%`,
                color: "bg-blue-500/10",
                progress: compressionProgress,
                showProgress: true
            };
        }

        if (uploadProgress === "uploading") {
            return {
                icon: <Upload className="w-4 h-4 text-purple-400" />,
                label: "Uploading to Supabase",
                sublabel: "Transferring file...",
                color: "bg-purple-500/10",
                showProgress: false
            };
        }

        if (uploadProgress === "creating-record") {
            return {
                icon: <Database className="w-4 h-4 text-indigo-400" />,
                label: "Creating Asset Record",
                sublabel: "Initializing database...",
                color: "bg-indigo-500/10",
                showProgress: false
            };
        }

        if (uploadProgress === "analyzing" || isProcessing) {
            return {
                icon: <Activity className="w-4 h-4 text-orange-400" />,
                label: "Running AI Analysis",
                sublabel: "Processing burpee reps...",
                color: "bg-orange-500/10",
                showProgress: false
            };
        }

        if (compressedFile && uploadProgress === "idle" && !isProcessing) {
            return {
                icon: <CheckCircle2 className="w-4 h-4 text-green-400" />,
                label: "Ready for Analysis",
                sublabel: formatSize(compressedFile.size),
                color: "bg-green-500/10",
                showProgress: false
            };
        }

        return null;
    };

    const stage = getCurrentStage();
    if (!stage) return null;

    return (
        <Card className="p-3 bg-black/40 backdrop-blur border border-white/10 mb-4 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-full", stage.color)}>
                    {stage.icon}
                </div>
                <div>
                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                        {stage.label}
                    </p>
                    <p className="text-xs font-mono text-white">
                        {stage.sublabel}
                    </p>
                </div>
            </div>

            {stage.showProgress && (
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-3">
                    <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${stage.progress}%` }}
                    />
                </div>
            )}

            {/* Animated spinner for indeterminate states */}
            {!stage.showProgress && (uploadProgress === "uploading" || uploadProgress === "creating-record" || uploadProgress === "analyzing" || isProcessing) && (
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-3">
                    <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-pulse" style={{ width: "100%" }} />
                </div>
            )}
        </Card>
    );
}

