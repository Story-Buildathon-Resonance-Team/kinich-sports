import { Play, Music } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

interface AssetCardProps {
  type: "video" | "audio";
  title: string;
  price: number;
  duration?: string;
  thumbnailUrl?: string;
  onClick?: () => void;
}

function AssetCard({
  type,
  title,
  price,
  duration,
  thumbnailUrl,
  onClick,
}: AssetCardProps) {
  return (
    <div
      className='glass-panel glass-panel-hover rounded-2xl overflow-hidden cursor-pointer group relative transform transition-all duration-300 hover:scale-[1.02]'
      onClick={onClick}
    >
      {/* Media Preview Area */}
      <div
        className={cn(
          "relative w-full h-[200px] flex items-center justify-center overflow-hidden",
          type === "video"
            ? "bg-gradient-to-br from-blue-900/20 to-black"
            : "bg-gradient-to-br from-purple-900/20 to-black"
        )}
      >
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
        
        {type === "video" && (
          <div className='w-16 h-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:bg-white/20'>
            <Play className="w-6 h-6 text-white fill-current ml-1" />
          </div>
        )}

        {type === "audio" && (
          <div className='flex items-center gap-1.5 h-[60px]'>
            {[32, 48, 40, 56, 44, 52, 36, 48, 32].map((height, i) => (
              <div
                key={i}
                className='w-1.5 bg-blue-500/60 rounded-full transition-all duration-300 group-hover:bg-blue-400 group-hover:h-[120%]'
                style={{ height: `${height}px` }}
              />
            ))}
          </div>
        )}

        {duration && (
          <div className='absolute bottom-3 right-3 bg-black/60 backdrop-blur-md border border-white/10 text-white/90 px-2.5 py-1 rounded-md text-xs font-mono font-medium'>
            {duration}
          </div>
        )}
        
        {/* Type Badge */}
        <div className="absolute top-3 left-3">
            <span className={cn(
                "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border",
                type === "video" 
                    ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                    : "bg-purple-500/10 border-purple-500/20 text-purple-400"
            )}>
                {type}
            </span>
        </div>
      </div>

      {/* Content Area */}
      <div className='p-5 relative'>
        <div className='text-base font-medium text-white mb-3 line-clamp-2 leading-snug group-hover:text-blue-200 transition-colors'>
          {title}
        </div>
        
        <div className="flex items-center justify-between mt-auto">
            <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-white font-mono">{price}</span>
                <span className="text-xs text-gray-500 font-medium">$IP</span>
            </div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                View Details →
            </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(AssetCard);
