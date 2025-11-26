import { Landmark } from "./types";

type BurpeeState = "STANDING" | "DOWN" | "UP_PHASE";

export class BurpeeCounter {
  private state: BurpeeState = "STANDING";
  private repCount = 0;
  private lastRepTime = 0;
  private repTimestamps: number[] = [];
  private frameCount = 0;

  // Thresholds
  // Normalized coordinates: Y increases downwards (0 top, 1 bottom)
  // Standing: Shoulder Y < Hip Y. Distance = Hip Y - Shoulder Y > 0 (e.g. 0.4)
  // Horizontal/Down: Shoulder Y ~ Hip Y. Distance ~ 0 (e.g. < 0.15)
  
  private readonly STANDING_THRESHOLD = 0.35; // Must be at least this vertical to count as standing
  private readonly DOWN_THRESHOLD = 0.2; // Must be below this to count as down (horizontal)
  
  constructor() {}

  process(landmarks: Landmark[], timestamp: number): { reps: number; state: string; feedback: string } {
    this.frameCount++;
    
    // MediaPipe Pose Landmarks:
    // 11: left_shoulder, 12: right_shoulder
    // 23: left_hip, 24: right_hip
    // 25: left_knee, 26: right_knee
    // 27: left_ankle, 28: right_ankle

    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftAnkle = landmarks[27];

    if (!leftHip || !leftShoulder) {
        return { reps: this.repCount, state: this.state, feedback: "No pose" };
    }

    // Average hip height (normalized 0-1, 0 is top)
    const hipY = (leftHip.y + rightHip.y) / 2;
    const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
    
    // Vertical distance between hips and shoulders
    // Positive value = Torso is upright (Shoulders above hips)
    // Near zero = Torso is horizontal
    const torsoVerticality = hipY - shoulderY;

    let feedback = "";

    // State Machine
    switch (this.state) {
      case "STANDING":
        feedback = "Go Down";
        // Check if torso becomes horizontal-ish
        if (torsoVerticality < this.DOWN_THRESHOLD) {
          this.state = "DOWN";
        }
        break;

      case "DOWN":
        feedback = "Push Up";
        // Check if starting to rise (torso becoming vertical)
        if (torsoVerticality > this.DOWN_THRESHOLD + 0.1) { // Hysteresis: require moving well past the down threshold
          this.state = "UP_PHASE";
        }
        break;

      case "UP_PHASE":
         feedback = "Stand Up Fully";
         // Confirm standing full extension or jump
         if (torsoVerticality > this.STANDING_THRESHOLD) {
             this.repCount++;
             this.repTimestamps.push(timestamp);
             this.state = "STANDING";
         }
         
         // If user drops back down without fully standing (failed rep / fast cycle)
         if (torsoVerticality < this.DOWN_THRESHOLD) {
             this.state = "DOWN"; // Reset to down
         }
         break;
    }

    // Debug / Tuning info
    const debugInfo = `V: ${torsoVerticality.toFixed(2)}`;

    return {
        reps: this.repCount,
        state: this.state,
        feedback: `${feedback} (${debugInfo})`
    };
  }

  getResult() {
      return {
          reps: this.repCount,
          timestamps: this.repTimestamps
      };
  }

  reset() {
      this.repCount = 0;
      this.state = "STANDING";
      this.repTimestamps = [];
  }
}
