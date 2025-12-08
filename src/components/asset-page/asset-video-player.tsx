"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/custom/card";
import { Play, Pause, Volume2, Video, Maximize, Settings } from "lucide-react";

interface AssetVideoPlayerProps {
  videoUrl: string;
  drillName: string;
}

export function AssetVideoPlayer({
  videoUrl,
  drillName,
}: AssetVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleEnded = () => setIsPlaying(false);
    const handleError = () => {
      setError("Failed to load video. Please check the video URL.");
      setIsPlaying(false);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
    };
  }, []);

  const togglePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen();
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative bg-black rounded-xl overflow-hidden group">
        <video
          ref={videoRef}
          src={videoUrl}
          preload='metadata'
          className='w-full aspect-video object-contain bg-zinc-900'
          onClick={togglePlayPause}
        />
        
        {error && (
          <div className='absolute inset-0 bg-black/80 flex items-center justify-center z-20'>
            <p className='text-sm text-red-400 px-4 text-center'>{error}</p>
          </div>
        )}

        {/* Play/Pause Overlay - Center */}
        {!isPlaying && !error && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Play className="w-6 h-6 text-white ml-1 fill-white" />
             </div>
          </div>
        )}

        {/* Controls Bar - Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           
           {/* Progress Bar */}
           <div className="mb-3 relative h-1 bg-white/20 rounded-full cursor-pointer group/progress">
              <div 
                className="absolute left-0 top-0 bottom-0 bg-blue-500 rounded-full" 
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
              <input
                type='range'
                min='0'
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                disabled={!!error}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
           </div>

           <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <button onClick={togglePlayPause} className="text-white hover:text-blue-400 transition-colors">
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                 </button>
                 
                 <span className="text-xs font-medium text-gray-300 font-mono">
                    {formatTime(currentTime)} / {formatTime(duration)}
                 </span>
              </div>

              <div className="flex items-center gap-3">
                 <button className="text-gray-400 hover:text-white transition-colors">
                    <Settings className="w-4 h-4" />
                 </button>
                 <button onClick={toggleFullscreen} className="text-gray-400 hover:text-white transition-colors">
                    <Maximize className="w-4 h-4" />
                 </button>
              </div>
           </div>
        </div>
    </div>
  );
}
