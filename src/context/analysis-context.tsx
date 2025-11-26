"use client";

import { createContext, useContext, useState, useRef, useEffect, ReactNode } from "react";
import { getPoseLandmarker } from "@/lib/mediapipe/pose-landmarker";
import { BurpeeCounter, BurpeeState } from "@/lib/mediapipe/burpee-counter";
import { PoseLandmarker, DrawingUtils } from "@mediapipe/tasks-vision";
import { toast } from "sonner";

interface AnalysisMetadata {
  drill_type_id: string;
  total_reps: number;
  rep_timestamps: number[];
  verified_by: string;
  timestamp: string;
  performance_data: {
    reps: number;
    consistency_score: number;
  };
}

interface AnalysisContextType {
  setCanvasRef: (ref: HTMLCanvasElement | null) => void;
  isProcessing: boolean;
  progress: number;
  reps: number;
  status: BurpeeState | "Idle";
  feedback: string;
  metadata: AnalysisMetadata | null;
  videoSrc: string | null;
  setVideoSrc: (src: string | null) => void;
  startProcessing: () => Promise<void>;
  resetAnalysis: () => void;
  preloadModel: () => Promise<void>;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reps, setReps] = useState(0);
  const [status, setStatus] = useState<BurpeeState | "Idle">("Idle");
  const [feedback, setFeedback] = useState<string>("");
  const [metadata, setMetadata] = useState<AnalysisMetadata | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const uiCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const counterRef = useRef<BurpeeCounter | null>(null);
  const requestRef = useRef<number>(null);

  useEffect(() => {
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  const ensureModelLoaded = async () => {
    if (landmarkerRef.current) return true;

    try {
      console.log("Loading MediaPipe Pose Landmarker...");
      const landmarker = await getPoseLandmarker();
      landmarkerRef.current = landmarker;
      counterRef.current = new BurpeeCounter();
      console.log("MediaPipe Pose Landmarker loaded");
      return true;
    } catch (error) {
      console.error("Failed to load MediaPipe:", error);
      toast.error("Failed to load AI models");
      return false;
    }
  };

  const resetAnalysis = () => {
    setMetadata(null);
    setReps(0);
    setProgress(0);
    setStatus("Idle");
    setFeedback("");
    if (counterRef.current) counterRef.current.reset();
  };

  const setCanvasRef = (ref: HTMLCanvasElement | null) => {
    uiCanvasRef.current = ref;
  };

  const generateMetadata = () => {
    if (!counterRef.current) return;

    const results = counterRef.current.getResult();

    const meta = {
      drill_type_id: "EXPL_BURPEE_001",
      total_reps: results.reps,
      rep_timestamps: results.timestamps,
      verified_by: "Kinich AI Vision",
      timestamp: new Date().toISOString(),
      performance_data: {
        reps: results.reps,
        consistency_score: 0.95,
      }
    };
    setMetadata(meta);
    toast.success("Analysis Complete", {
      description: `Processed ${results.reps} valid reps.`,
      duration: 5000,
    });
  };

  const startProcessing = async () => {
    if (!videoRef.current) return;

    // Ensure model is loaded before processing
    const isLoaded = await ensureModelLoaded();
    if (!isLoaded) return;

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
              setStatus(result.state);
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
      preloadModel: async () => { await ensureModelLoaded(); }
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
