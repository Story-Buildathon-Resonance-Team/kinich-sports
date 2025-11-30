import { Download, FileVideo, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/custom/card";
import { useAnalysis } from "@/context/analysis-context";
import { cn } from "@/lib/utils";

export function CompressionStatus() {
    const { isCompressing, compressionProgress, compressedFile } = useAnalysis();

    if (!isCompressing && !compressedFile) return null;

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (compressedFile) {
            const url = URL.createObjectURL(compressedFile);
            const a = document.createElement('a');
            a.href = url;
            a.download = compressedFile.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    return (
        <Card className="p-3 bg-black/40 backdrop-blur border border-white/10 mb-4 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-full", isCompressing ? "bg-blue-500/10" : "bg-green-500/10")}>
                        {isCompressing ? (
                            <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                        ) : (
                            <FileVideo className="w-4 h-4 text-green-400" />
                        )}
                    </div>
                    <div>
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                            {isCompressing ? "Compressing" : "Supabase Ready"}
                        </p>
                        <p className="text-xs font-mono text-white">
                            {isCompressing 
                                ? `${Math.round(compressionProgress)}%` 
                                : formatSize(compressedFile?.size || 0)
                            }
                        </p>
                    </div>
                </div>

                {!isCompressing && compressedFile && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDownload}
                        className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/5"
                        title="Download Compressed Video"
                    >
                        <Download className="w-4 h-4" />
                    </Button>
                )}
            </div>
            
            {isCompressing && (
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-3">
                    <div 
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${compressionProgress}%` }}
                    />
                </div>
            )}
        </Card>
    );
}

