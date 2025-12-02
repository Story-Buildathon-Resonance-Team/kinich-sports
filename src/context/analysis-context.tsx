"use client";

import { createContext, useContext, useState, useRef, useEffect, ReactNode } from "react";
import { getPoseLandmarker } from "@/lib/mediapipe/pose-landmarker";
import { BurpeeCounter } from "@/lib/mediapipe/burpee-counter";
import { PoseLandmarker, DrawingUtils } from "@mediapipe/tasks-vision";
import { toast } from "sonner";
import { VideoDrillMetadata } from "@/lib/types/video";
import { NativeCompressionService } from "@/lib/compression/native";

interface AnalysisContextType {
  setCanvasRef: (ref: HTMLCanvasElement | null) => void;
  isProcessing: boolean;
  progress: number;
  reps: number;
  status: "STANDING" | "DOWN" | "UP_PHASE" | "Idle";
  feedback: string;
  metadata: VideoDrillMetadata | null;
  videoSrc: string | null;
  setVideoSrc: (src: string | null) => void;
  startProcessing: () => Promise<void>;
  resetAnalysis: () => void;

  // Compression Integration
  compressedFile: File | null;
  isCompressing: boolean;
  compressionProgress: number;
  compressVideo: (file: File) => Promise<void>;

  // Upload Integration
  assetId: string | null;
  uploadedVideoUrl: string | null;
  setAssetId: (id: string | null) => void;
  setUploadedVideoUrl: (url: string | null) => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reps, setReps] = useState(0);
  const [status, setStatus] = useState<"STANDING" | "DOWN" | "UP_PHASE" | "Idle">("Idle");
  const [feedback, setFeedback] = useState<string>("");
  const [metadata, setMetadata] = useState<VideoDrillMetadata | null>(null);

  // Compression State
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);

  // Upload State
  const [assetId, setAssetId] = useState<string | null>(null);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const uiCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const counterRef = useRef<BurpeeCounter | null>(null);
  const requestRef = useRef<number>(null);

  useEffect(() => {
    async function load() {
      try {
        const landmarker = await getPoseLandmarker();
        landmarkerRef.current = landmarker;
        counterRef.current = new BurpeeCounter();
        console.log("MediaPipe Pose Landmarker loaded (Background Context)");
      } catch (error) {
        console.error("Failed to load MediaPipe:", error);
        toast.error("Failed to load AI models");
      }
    }
    load();

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  const resetAnalysis = () => {
    setMetadata(null);
    setReps(0);
    setProgress(0);
    setStatus("Idle");
    setFeedback("");
    setCompressedFile(null);
    setCompressionProgress(0);
    setIsCompressing(false);
    setAssetId(null);
    setUploadedVideoUrl(null);
    if (counterRef.current) counterRef.current.reset();
  };

  const compressVideo = async (file: File) => {
    setIsCompressing(true);
    setCompressionProgress(0);
    
    try {
      // Start compression in background
      console.log("Starting background video compression...");
      const result = await NativeCompressionService.compressVideo(file, (p) => {
        setCompressionProgress(p);
      });
      
      console.log("Compression complete:", result.name, result.size);
      setCompressedFile(result);
      toast.success("Video Compressed & Ready for Upload", {
        description: `Size reduced to ${(result.size / 1024 / 1024).toFixed(2)} MB`
      });
    } catch (error) {
      console.error("Compression failed:", error);
      toast.error("Video compression failed");
    } finally {
      setIsCompressing(false);
    }
  };

  const setCanvasRef = (ref: HTMLCanvasElement | null) => {
    uiCanvasRef.current = ref;
  };

  const generateMetadata = () => {
    if (!counterRef.current || !videoRef.current) return;

    const results = counterRef.current.getResult();

    // Construct robust metadata for Story Protocol verification
    const meta: VideoDrillMetadata = {
      // Standard IPFS/NFT Fields
      name: "Burpee Drill Assessment",
      description: `Automated analysis of Burpee drill. ${results.reps} reps performed with ${(results.humanConfidence * 100).toFixed(0)}% confidence.`,
      image: "ipfs://placeholder", // TODO: Generate thumbnail
      properties: {
        drill_type: "Burpee",
        reps: results.reps,
        intensity: "High",
        score: results.avgFormScore
      },

      schema_version: "1.1",
      asset_type: "video_drill",
      drill_type_id: "EXPL_BURPEE_001",
      athlete_profile: {
        discipline: "Fitness", // To be populated dynamically later
        experience_level: "Intermediate"
      },
      context: {
        session_intensity: "High",
        filming_moment: "Assessment",
        device_type: "webcam"
      },
      video_metadata: {
        resolution: `${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`,
        framerate: 30, // Assumed
        duration_seconds: videoRef.current.duration || results.duration,
        // Add compression metadata if available
        file_size_bytes: compressedFile?.size,
        mime_type: compressedFile?.type
      },
      cv_metrics: {
        rep_count: results.reps,
        rep_timestamps: results.timestamps,
        avg_rep_duration: results.reps > 0 ? results.duration / results.reps : 0,
        form_score_avg: results.avgFormScore,
        rom_score: 0.9, // Placeholder for now
        consistency_score: results.consistencyScore,
        cadence_avg: results.duration > 0 ? (results.reps / (results.duration / 60)) : 0
      },
      verification: {
        is_verified: results.reps > 0 && results.humanConfidence > 0.6,
        verification_method: "cv_automated",
        human_confidence_score: results.humanConfidence,
        processed_at: new Date().toISOString()
      }
    };

    setMetadata(meta);
    toast.success("Analysis Complete", {
      description: `Processed ${results.reps} valid reps. Confidence: ${(results.humanConfidence * 100).toFixed(0)}%`,
      duration: 5000,
    });
  };

  const startProcessing = async () => {
    if (!videoRef.current || !landmarkerRef.current) return;

    setIsProcessing(true);
    const video = videoRef.current;

    if (video.videoWidth === 0) {
      await new Promise((resolve) => {
        video.onloadeddata = resolve;
      });
    }

    video.play();

    const processFrame = () => {
      if (video.paused || video.ended) {
        setIsProcessing(false);
        if (video.ended) generateMetadata();
        return;
      }

      const startTimeMs = performance.now();

      if (landmarkerRef.current) {
        const results = landmarkerRef.current.detectForVideo(video, startTimeMs);

        if (uiCanvasRef.current) {
          const canvas = uiCanvasRef.current;
          const ctx = canvas.getContext("2d");

          if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
          }

          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const drawingUtils = new DrawingUtils(ctx);
            if (results.landmarks) {
              for (const landmarks of results.landmarks) {
                drawingUtils.drawLandmarks(landmarks, {
                  radius: (data) => DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 4, 2),
                  color: "#00c2ff",
                  lineWidth: 1
                });
                drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS, {
                  color: "#ffffff",
                  lineWidth: 2
                });
              }
            }
          }
        }

        if (results.landmarks) {
          for (const landmarks of results.landmarks) {
            if (counterRef.current) {
              const result = counterRef.current.process(landmarks, video.currentTime);
              setReps(result.reps);
              setStatus(result.state as "STANDING" | "DOWN" | "UP_PHASE" | "Idle");
              if (result.feedback) setFeedback(result.feedback);
            }
          }
        }
      }

      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }

      requestRef.current = requestAnimationFrame(processFrame);
    };

    requestRef.current = requestAnimationFrame(processFrame);
  };

  return (
    <AnalysisContext.Provider value={{
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
      // Compression exports
      compressedFile,
      isCompressing,
      compressionProgress,
      compressVideo,
      // Upload exports
      assetId,
      uploadedVideoUrl,
      setAssetId,
      setUploadedVideoUrl
    }}>
      {children}
      <div style={{ display: 'none' }}>
        {videoSrc && (
          <video
            ref={videoRef}
            src={videoSrc}
            playsInline
            muted
            crossOrigin="anonymous"
            onEnded={() => setIsProcessing(false)}
          />
        )}
      </div>
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error("useAnalysis must be used within an AnalysisProvider");
  }
  return context;
}
