import { Landmark } from "./types";

export type BurpeeState = "STANDING" | "DOWN" | "UP_PHASE";

export class BurpeeCounter {
  private state: BurpeeState = "STANDING";
  private repCount = 0;
  private lastRepTime = 0;
  private repTimestamps: number[] = [];
  private frameCount = 0;

  private totalFormScore = 0;
  private totalPresenceScore = 0;
  private samplesCount = 0;
  private startTime = 0;

  // Thresholds
  private readonly STANDING_RATIO_THRESHOLD = 0.7;
  private readonly DOWN_RATIO_THRESHOLD = 0.3;
  private readonly HYSTERESIS = 0.1;

  process(landmarks: Landmark[], timestamp: number): { reps: number; state: BurpeeState; feedback: string } {
    this.frameCount++;
    if (this.startTime === 0) this.startTime = timestamp;

    // Calculate average visibility (presence confidence)
    const avgVisibility = landmarks.reduce((sum, lm) => sum + (lm.visibility || 0), 0) / landmarks.length;
    this.totalPresenceScore += avgVisibility;
    this.samplesCount++;

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

    const dx = hipX - shoulderX;
    const dy = hipY - shoulderY;
    const torsoLength = Math.sqrt(dx * dx + dy * dy);

    if (torsoLength < 0.01) {
      return { reps: this.repCount, state: this.state, feedback: "Too small" };
    }

    const verticalRatio = dy / torsoLength;
    // Simple form score: how close is the user to ideal vertical (1.0) or horizontal (0.0) states when in those states?
    // We accumulate raw vertical ratio for now, can be processed later.
    this.totalFormScore += verticalRatio;

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
    // Calculate stats
    const duration = this.lastRepTime - (this.repTimestamps[0] || 0); // Approximate active duration

    // Calculate consistency (variance of rep times)
    let consistencyScore = 1.0;
    if (this.repTimestamps.length > 1) {
      const intervals = [];
      for (let i = 1; i < this.repTimestamps.length; i++) {
        intervals.push(this.repTimestamps[i] - this.repTimestamps[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const variance = intervals.reduce((a, b) => a + Math.pow(b - avgInterval, 2), 0) / intervals.length;
      // Score 0-1, where 0 variance is 1.0 score. Decay as variance increases.
      consistencyScore = Math.max(0, 1 - Math.sqrt(variance) / avgInterval);
    }

    return {
      reps: this.repCount,
      timestamps: this.repTimestamps,
      avgFormScore: this.samplesCount > 0 ? this.totalFormScore / this.samplesCount : 0,
      humanConfidence: this.samplesCount > 0 ? this.totalPresenceScore / this.samplesCount : 0,
      consistencyScore,
      duration
    };
  }

  reset() {
    this.repCount = 0;
    this.state = "STANDING";
    this.repTimestamps = [];
    this.lastRepTime = 0;
    this.totalFormScore = 0;
    this.totalPresenceScore = 0;
    this.samplesCount = 0;
    this.startTime = 0;
  }
}
