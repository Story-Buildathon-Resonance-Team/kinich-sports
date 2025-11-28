"use client";

import { useState, useRef, useEffect } from "react";

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob, duration: number) => void;
  maxDurationSeconds?: number;
  onError?: (error: string) => void;
}

type RecordingState = "idle" | "recording" | "stopped";

export function AudioRecorder({
  onRecordingComplete,
  maxDurationSeconds = 240, // 4 minutes default
  onError,
}: AudioRecorderProps) {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [recordingTime, setRecordingTime] = useState(0);
  const [waveformBars, setWaveformBars] = useState([0, 0, 0, 0, 0]);
  const [hasPermission, setHasPermission] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Request microphone permission
  const requestPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;
      setHasPermission(true);

      // Setup audio context for waveform
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 256;
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      console.log("[AudioRecorder] Microphone access granted");
    } catch (error) {
      console.error("[AudioRecorder] Permission denied:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Microphone access denied. Please enable microphone permissions.";
      onError?.(errorMessage);
    }
  };

  // Animate waveform bars based on audio levels
  const animateWaveform = () => {
    if (!analyserRef.current || recordingState !== "recording") {
      return;
    }

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate average volume for each bar
    const bars = [0, 1, 2, 3, 4].map((i) => {
      const start = Math.floor((i * dataArray.length) / 5);
      const end = Math.floor(((i + 1) * dataArray.length) / 5);
      const slice = dataArray.slice(start, end);
      const average = slice.reduce((a, b) => a + b, 0) / slice.length;
      // Normalize to 0-1 range and add minimum height
      return Math.max(0.2, Math.min(1, average / 255));
    });

    setWaveformBars(bars);
    animationFrameRef.current = requestAnimationFrame(animateWaveform);
  };

  // Start recording
  const startRecording = async () => {
    if (!streamRef.current) {
      await requestPermission();
      return;
    }

    try {
      chunksRef.current = [];

      // Create MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/ogg";

      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType,
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        onRecordingComplete(blob, recordingTime);
        console.log("[AudioRecorder] Recording complete:", {
          size: blob.size,
          duration: recordingTime,
        });
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setRecordingState("recording");
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;
          // Auto-stop at max duration
          if (newTime >= maxDurationSeconds) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);

      // Start waveform animation
      animateWaveform();

      console.log("[AudioRecorder] Recording started");
    } catch (error) {
      console.error("[AudioRecorder] Start recording failed:", error);
      onError?.("Failed to start recording. Please try again.");
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState === "recording") {
      mediaRecorderRef.current.stop();
      setRecordingState("stopped");

      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Stop waveform animation
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      console.log("[AudioRecorder] Recording stopped");
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className='flex flex-col items-center gap-6'>
      {/* Waveform Visualization */}
      <div className='flex items-end justify-center gap-2 h-24'>
        {waveformBars.map((height, index) => (
          <div
            key={index}
            className='w-2 rounded-full transition-all duration-150 ease-out'
            style={{
              height: `${height * 100}%`,
              backgroundColor:
                index === 2
                  ? "rgba(255, 107, 53, 0.8)" // Kinetic orange for center bar
                  : "rgba(0, 71, 171, 0.8)", // Cobalt for other bars
              minHeight: "20%",
            }}
          />
        ))}
      </div>

      {/* Timer Display */}
      <div className='text-center'>
        <div className='text-[32px] font-mono font-light text-[#F5F7FA] tracking-wider'>
          {formatTime(recordingTime)}
        </div>
        <div className='text-[14px] font-mono text-[rgba(245,247,250,0.5)]'>
          {formatTime(maxDurationSeconds)} max
        </div>
      </div>

      {/* Recording Controls */}
      <div className='flex items-center gap-4'>
        {!hasPermission && recordingState === "idle" && (
          <button
            onClick={requestPermission}
            className='
              bg-transparent
              border border-[rgba(245,247,250,0.1)]
              text-[rgba(245,247,250,0.7)]
              px-8 py-3 rounded-lg
              text-[15px] font-medium
              transition-all duration-300
              hover:bg-[rgba(0,71,171,0.1)]
              hover:border-[rgba(0,71,171,0.3)]
              hover:text-[#F5F7FA]
            '
          >
            🎤 Enable Microphone
          </button>
        )}

        {hasPermission && recordingState === "idle" && (
          <button
            onClick={startRecording}
            className='
              relative overflow-hidden
              bg-gradient-to-br from-[rgba(0,71,171,0.8)] to-[rgba(0,86,214,0.8)]
              border border-[rgba(184,212,240,0.2)]
              text-[#F5F7FA] font-medium
              rounded-xl px-10 py-4
              shadow-[0_4px_20px_rgba(0,71,171,0.2)]
              transition-all duration-[400ms]
              hover:-translate-y-0.5
              hover:shadow-[0_8px_28px_rgba(0,71,171,0.3)]
              group
            '
          >
            <span className='absolute inset-0 -left-full bg-gradient-to-r from-transparent via-[rgba(255,107,53,0.2)] to-transparent transition-all duration-[600ms] group-hover:left-full pointer-events-none' />
            <span className='relative z-10 flex items-center gap-3'>
              <span className='text-[20px]'>🎙️</span>
              Start Recording
            </span>
          </button>
        )}

        {recordingState === "recording" && (
          <button
            onClick={stopRecording}
            className='
              bg-gradient-to-br from-[rgba(255,107,53,0.8)] to-[rgba(255,107,53,0.6)]
              border border-[rgba(255,107,53,0.3)]
              text-[#F5F7FA] font-medium
              rounded-xl px-10 py-4
              shadow-[0_4px_20px_rgba(255,107,53,0.3)]
              transition-all duration-300
              hover:-translate-y-0.5
              hover:shadow-[0_8px_28px_rgba(255,107,53,0.4)]
              animate-pulse
            '
          >
            <span className='flex items-center gap-3'>
              <span className='w-3 h-3 bg-[#F5F7FA] rounded-sm' />
              Stop Recording
            </span>
          </button>
        )}
      </div>

      {/* Recording Status */}
      {recordingState === "recording" && (
        <div className='text-[14px] text-[rgba(255,107,53,0.9)] font-medium animate-pulse'>
          ● Recording in progress...
        </div>
      )}
    </div>
  );
}
