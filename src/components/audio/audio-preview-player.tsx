"use client";

import { useState, useRef, useEffect } from "react";

interface AudioPreviewPlayerProps {
  audioBlob: Blob;
  onReRecord: () => void;
  onConfirm: () => void;
  isUploading?: boolean;
}

export function AudioPreviewPlayer({
  audioBlob,
  onReRecord,
  onConfirm,
  isUploading = false,
}: AudioPreviewPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string>("");

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Create blob URL
  useEffect(() => {
    const url = URL.createObjectURL(audioBlob);
    setAudioUrl(url);

    // Cleanup
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [audioBlob]);

  // Handle audio metadata loaded
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  // Handle time update
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // Handle play/pause
  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Handle audio end
  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Handle seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className='w-full max-w-[600px] mx-auto'>
      {/* Audio Element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      {/* Player Card */}
      <div className='bg-[rgba(26,26,28,0.6)] border border-[rgba(245,247,250,0.06)] rounded-xl p-6'>
        <div className='flex flex-col gap-4'>
          {/* Title */}
          <div className='text-center'>
            <h3 className='text-[20px] font-medium text-[#F5F7FA] mb-1'>
              Preview Your Recording
            </h3>
            <p className='text-[14px] text-[rgba(245,247,250,0.6)]'>
              Listen before registering your audio capsule as an IP asset
            </p>
          </div>

          {/* Playback Controls */}
          <div className='flex items-center gap-4'>
            {/* Play/Pause Button */}
            <button
              onClick={togglePlayPause}
              disabled={isUploading}
              className='
                flex items-center justify-center
                w-12 h-12
                bg-gradient-to-br from-[rgba(0,71,171,0.8)] to-[rgba(0,86,214,0.8)]
                border border-[rgba(184,212,240,0.2)]
                rounded-full
                text-[#F5F7FA]
                shadow-[0_4px_16px_rgba(0,71,171,0.2)]
                transition-all duration-300
                hover:-translate-y-0.5
                hover:shadow-[0_6px_20px_rgba(0,71,171,0.3)]
                disabled:opacity-50
                disabled:cursor-not-allowed
                disabled:hover:translate-y-0
              '
            >
              {isPlaying ? (
                <span className='text-[20px]'>⏸️</span>
              ) : (
                <span className='text-[20px]'>▶️</span>
              )}
            </button>

            {/* Progress Bar */}
            <div className='flex-1 flex flex-col gap-1'>
              <input
                type='range'
                min='0'
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                disabled={isUploading}
                className='
                  w-full h-1 
                  bg-[rgba(245,247,250,0.1)]
                  rounded-full
                  appearance-none
                  cursor-pointer
                  disabled:cursor-not-allowed
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-3
                  [&::-webkit-slider-thumb]:h-3
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-[#0047AB]
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-moz-range-thumb]:w-3
                  [&::-moz-range-thumb]:h-3
                  [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:bg-[#0047AB]
                  [&::-moz-range-thumb]:border-0
                  [&::-moz-range-thumb]:cursor-pointer
                '
                style={{
                  background: `linear-gradient(to right, rgba(0,71,171,0.6) 0%, rgba(0,71,171,0.6) ${
                    (currentTime / duration) * 100
                  }%, rgba(245,247,250,0.1) ${
                    (currentTime / duration) * 100
                  }%, rgba(245,247,250,0.1) 100%)`,
                }}
              />

              {/* Time Display */}
              <div className='flex justify-between text-[12px] font-mono text-[rgba(245,247,250,0.5)]'>
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>

          {/* File Info */}
          <div className='flex items-center justify-center gap-4 text-[13px] text-[rgba(245,247,250,0.6)]'>
            <span>Size: {(audioBlob.size / 1024 / 1024).toFixed(2)} MB</span>
            <span>•</span>
            <span>Type: {audioBlob.type}</span>
          </div>

          {/* Action Buttons */}
          <div className='flex gap-3 pt-2'>
            <button
              onClick={onReRecord}
              disabled={isUploading}
              className='
                flex-1
                bg-transparent
                border border-[rgba(245,247,250,0.1)]
                text-[rgba(245,247,250,0.7)]
                px-6 py-3 rounded-lg
                text-[15px] font-medium
                transition-all duration-300
                hover:bg-[rgba(245,247,250,0.08)]
                hover:border-[rgba(245,247,250,0.2)]
                hover:text-[#F5F7FA]
                disabled:opacity-50
                disabled:cursor-not-allowed
              '
            >
              🔄 Re-record
            </button>

            <button
              onClick={onConfirm}
              disabled={isUploading}
              className='
                flex-1
                relative overflow-hidden
                bg-gradient-to-br from-[rgba(0,71,171,0.8)] to-[rgba(0,86,214,0.8)]
                border border-[rgba(184,212,240,0.2)]
                text-[#F5F7FA] font-medium
                rounded-xl px-6 py-3
                shadow-[0_4px_20px_rgba(0,71,171,0.2)]
                transition-all duration-[400ms]
                hover:-translate-y-0.5
                hover:shadow-[0_8px_28px_rgba(0,71,171,0.3)]
                disabled:opacity-50
                disabled:cursor-not-allowed
                disabled:hover:translate-y-0
                group
              '
            >
              <span className='absolute inset-0 -left-full bg-gradient-to-r from-transparent via-[rgba(255,107,53,0.2)] to-transparent transition-all duration-[600ms] group-hover:left-full pointer-events-none' />
              <span className='relative z-10'>
                {isUploading ? "Uploading..." : "✓ Submit Recording"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
