"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/custom/card";

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
    <Card variant='elevated' hover={false} className='p-6'>
      <audio ref={audioRef} src={audioUrl} preload='metadata' />

      <div className='space-y-6'>
        {/* Title */}
        <div>
          <h3 className='text-[20px] font-medium text-[#F5F7FA] mb-1'>
            {challengeName}
          </h3>
          <p className='text-[13px] text-[rgba(245,247,250,0.5)]'>
            Audio Capsule
          </p>
        </div>

        {/* Play/Pause Button */}
        <div className='flex justify-center'>
          <button
            onClick={togglePlayPause}
            className='
              flex items-center justify-center
              w-16 h-16
              bg-gradient-to-br from-[rgba(0,71,171,0.8)] to-[rgba(0,86,214,0.8)]
              border border-[rgba(184,212,240,0.2)]
              rounded-full
              text-[#F5F7FA]
              shadow-[0_4px_20px_rgba(0,71,171,0.2)]
              transition-all duration-300
              hover:-translate-y-1
              hover:shadow-[0_6px_24px_rgba(0,71,171,0.3)]
            '
          >
            {isPlaying ? (
              <span className='text-[24px]'>⏸️</span>
            ) : (
              <span className='text-[24px]'>▶️</span>
            )}
          </button>
        </div>

        {/* Progress Bar */}
        <div className='space-y-2'>
          <input
            type='range'
            min='0'
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className='
              w-full h-2
              bg-[rgba(245,247,250,0.1)]
              rounded-full
              appearance-none
              cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-[#0047AB]
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-moz-range-thumb]:w-4
              [&::-moz-range-thumb]:h-4
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-[#0047AB]
              [&::-moz-range-thumb]:border-0
            '
            style={{
              background: `linear-gradient(to right, rgba(0,71,171,0.8) 0%, rgba(0,71,171,0.8) ${
                (currentTime / duration) * 100
              }%, rgba(245,247,250,0.1) ${
                (currentTime / duration) * 100
              }%, rgba(245,247,250,0.1) 100%)`,
            }}
          />

          {/* Time Display */}
          <div className='flex justify-between items-center'>
            <span className='text-[13px] font-mono text-[rgba(245,247,250,0.6)]'>
              {formatTime(currentTime)}
            </span>
            <span className='text-[13px] font-mono text-[rgba(245,247,250,0.6)]'>
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume Control */}
        <div className='flex items-center gap-3'>
          <span className='text-[16px]'>🔊</span>
          <input
            type='range'
            min='0'
            max='1'
            step='0.01'
            value={volume}
            onChange={handleVolumeChange}
            className='
              flex-1 h-1
              bg-[rgba(245,247,250,0.1)]
              rounded-full
              appearance-none
              cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-3
              [&::-webkit-slider-thumb]:h-3
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-[rgba(245,247,250,0.6)]
              [&::-moz-range-thumb]:w-3
              [&::-moz-range-thumb]:h-3
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-[rgba(245,247,250,0.6)]
              [&::-moz-range-thumb]:border-0
            '
          />
        </div>
      </div>
    </Card>
  );
}
