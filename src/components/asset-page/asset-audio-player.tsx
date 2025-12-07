"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/custom/card";
import { Play, Pause, Volume2, Mic } from "lucide-react";

interface AssetAudioPlayerProps {
  audioUrl: string;
  challengeName: string;
}

export function AssetAudioPlayer({
  audioUrl,
  challengeName,
}: AssetAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card variant='elevated' hover={false} className='p-8 bg-gradient-to-br from-[#0a0a0a] to-[#1a1a2e] border-purple-500/20'>
      <audio ref={audioRef} src={audioUrl} preload='metadata' />

      <div className='space-y-8'>
        {/* Visualizer Placeholder */}
        <div className="h-24 flex items-center justify-center gap-1">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="w-1.5 bg-purple-500/40 rounded-full animate-pulse"
              style={{
                height: isPlaying ? `${Math.max(20, Math.random() * 100)}%` : '20%',
                animationDuration: `${0.5 + Math.random() * 0.5}s`,
                animationPlayState: isPlaying ? 'running' : 'paused'
              }}
            />
          ))}
        </div>

        {/* Icon Header - Centered */}
        <div className='text-center'>
          <h3 className='text-[24px] font-light tracking-tight text-white mb-1'>
            {challengeName}
          </h3>
          <p className='text-[14px] text-purple-400 font-medium uppercase tracking-wider'>
            Audio Identity Capsule
          </p>
        </div>

        {/* Controls Container */}
        <div className="flex flex-col items-center gap-6">
          {/* Play/Pause Button */}
          <button
            onClick={togglePlayPause}
            className='
                flex items-center justify-center
                w-24 h-24
                bg-white text-black
                rounded-full
                shadow-[0_0_40px_rgba(168,85,247,0.3)]
                transition-all duration-300
                hover:scale-105
                hover:shadow-[0_0_60px_rgba(168,85,247,0.5)]
                cursor-pointer
                '
          >
            {isPlaying ? (
              <Pause className='w-10 h-10 fill-current' />
            ) : (
              <Play className='w-10 h-10 fill-current ml-1.5' />
            )}
          </button>

          {/* Progress Bar */}
          <div className='w-full space-y-2'>
            <input
              type='range'
              min='0'
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className='w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 transition-colors'
            />
            <div className='flex justify-between text-xs font-mono text-gray-500'>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
