import { Landmark } from "./types";

export type BurpeeState = "STANDING" | "DOWN" | "UP_PHASE";

export class BurpeeCounter {
  private state: BurpeeState = "STANDING";
  private repCount = 0;
  private lastRepTime = 0;
  private repTimestamps: number[] = [];
  private frameCount = 0;

  // Thresholds: 1.0 = Upright, 0.0 = Horizontal
  private readonly STANDING_RATIO_THRESHOLD = 0.7;
  private readonly DOWN_RATIO_THRESHOLD = 0.3;
  private readonly HYSTERESIS = 0.1;

  process(landmarks: Landmark[], timestamp: number): { reps: number; state: BurpeeState; feedback: string } {
    this.frameCount++;

    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];

    if (!leftHip || !leftShoulder) {
      return { reps: this.repCount, state: this.state, feedback: "No pose" };
    }

    const hipX = (leftHip.x + rightHip.x) / 2;
    const hipY = (leftHip.y + rightHip.y) / 2;
    const shoulderX = (leftShoulder.x + rightShoulder.x) / 2;
    const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;

    // Torso Length (pixels)
    const dx = hipX - shoulderX;
    const dy = hipY - shoulderY;
    const torsoLength = Math.sqrt(dx * dx + dy * dy);

    if (torsoLength < 0.01) {
      return { reps: this.repCount, state: this.state, feedback: "Too small" };
    }

    // Vertical Ratio
    const verticalRatio = dy / torsoLength;
    let feedback = "";

    switch (this.state) {
      case "STANDING":
        feedback = "Go Down";
        if (verticalRatio < this.DOWN_RATIO_THRESHOLD) {
          this.state = "DOWN";
        }
        break;

      case "DOWN":
        feedback = "Push Up";
        if (verticalRatio > (this.DOWN_RATIO_THRESHOLD + this.HYSTERESIS)) {
          this.state = "UP_PHASE";
        }
        break;

      case "UP_PHASE":
        feedback = "Stand Up Fully";
        if (verticalRatio > this.STANDING_RATIO_THRESHOLD) {
          if (timestamp - this.lastRepTime > 1.0) {
            this.repCount++;
            this.repTimestamps.push(timestamp);
            this.lastRepTime = timestamp;
          }
          this.state = "STANDING";
        }

        if (verticalRatio < this.DOWN_RATIO_THRESHOLD) {
          this.state = "DOWN";
        }
        break;
    }

    return {
      reps: this.repCount,
      state: this.state,
      feedback: `${feedback} (R: ${verticalRatio.toFixed(2)})`
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
    this.lastRepTime = 0;
  }
}
