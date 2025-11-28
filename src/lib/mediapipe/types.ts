export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface PoseResult {
  landmarks: Landmark[][];
  worldLandmarks: Landmark[][];
}

export interface DrillAnalysis {
  reps: number;
  validReps: number;
  noRepReasons: string[];
  repTimestamps: number[];
  averageCycleTime: number;
  formScore: number;
}

export interface AnalysisMetadata {
  drillId: string;
  timestamp: number;
  analysis: DrillAnalysis;
  rawLandmarks?: PoseResult[]; // Optional, might be too heavy to store everything
}

