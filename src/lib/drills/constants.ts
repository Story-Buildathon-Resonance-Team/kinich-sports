/**
 * Drill Definitions
 *
 * Single source of truth for all drill templates and audio capsule questions.
 * Used by UI to display available drills and by backend to validate submissions.
 */

export type AssetType = "video" | "audio";
export type ExperienceLevel =
  | "amateur"
  | "competitive"
  | "professional"
  | "elite";

export interface CameraSetup {
  position: string;
  distance: string;
  angle: string;
  notes: string[];
}

export interface VideoDrill {
  drill_type_id: string;
  name: string;
  description: string;
  asset_type: "video";
  experience_level: ExperienceLevel;
  duration_seconds: number;
  equipment_needed: string[];
  camera_setup: CameraSetup;
  standards: string[]; // What constitutes a valid rep
  execution_steps: string[]; // How to perform the drill
}

export interface AudioCapsule {
  drill_type_id: string;
  name: string;
  description: string;
  asset_type: "audio";
  verification_required: boolean; // Whether seed phrase is needed
  questions: string[];
  privacy_reminder: string;
  duration_minutes: number; // Suggested duration
}

// VIDEO DRILLS

export const VIDEO_DRILLS: VideoDrill[] = [
  {
    drill_type_id: "EXPL_BURPEE_001",
    name: "Burpee Max Effort",
    description: "60 seconds max effort explosive power test",
    asset_type: "video",
    experience_level: "competitive",
    duration_seconds: 60,
    equipment_needed: ["Timer", "Clear floor space (2m x 1m minimum)"],
    camera_setup: {
      position: "Side view",
      distance: "3 meters away",
      angle: "Hip height",
      notes: [
        "Show full body (head to feet)",
        "Ensure entire movement space is visible throughout",
      ],
    },
    standards: [
      "Start standing, feet shoulder-width",
      "Drop to plank position (arms extended, body straight)",
      "Chest touches ground briefly",
      "Push back up to plank",
      "Jump feet to hands",
      "Stand fully upright (no jump required at top)",
    ],
    execution_steps: [
      "Start timer, begin burpees immediately",
      "Complete as many reps as possible in 60 seconds",
      "Count your reps aloud",
      "Stop at 60 seconds even if mid-rep",
    ],
  },
];

// AUDIO CAPSULES

const AUDIO_PRIVACY_REMINDER =
  "Avoid sharing personal information about others, specific names of teammates/coaches, or precise locations. Speak naturally about your training experience.";

export const AUDIO_CAPSULES: AudioCapsule[] = [
  {
    drill_type_id: "MENT_CAPSULE_001",
    name: "Identity Capsule 1: The Origin Story",
    description: "Your journey into the sport and what drives you",
    asset_type: "audio",
    verification_required: true,
    duration_minutes: 4,
    privacy_reminder: AUDIO_PRIVACY_REMINDER,
    questions: [
      "What drove you to this sport in the beginning, and what keeps you here now?",
      "Describe the moment you realized you could be great at this.",
      "What's the last song you listened to before training?",
    ],
  },
  {
    drill_type_id: "MENT_CAPSULE_002",
    name: "Identity Capsule 2: The Mentor",
    description: "Training advice that shaped your journey",
    asset_type: "audio",
    verification_required: true,
    duration_minutes: 4,
    privacy_reminder: AUDIO_PRIVACY_REMINDER,
    questions: [
      "What's the best training advice you've ever gotten, and who told you?",
      "What's the WORST training advice someone tried to give you?",
      "If you could go back and tell yourself one thing before your first competition, what is it?",
    ],
  },
  {
    drill_type_id: "MENT_CAPSULE_003",
    name: "Identity Capsule 3: The Strategist",
    description: "Your approach to skill development and weakness management",
    asset_type: "audio",
    verification_required: true,
    duration_minutes: 4,
    privacy_reminder: AUDIO_PRIVACY_REMINDER,
    questions: [
      "If you could steal one skill from any athlete, living or dead, what and who?",
      "How did you attack your weaknesses to get to where you are today?",
      "What do people not understand about training for your sport?",
    ],
  },
  {
    drill_type_id: "MENT_CAPSULE_004",
    name: "Identity Capsule 4: The Change",
    description: "Evolution of your training approach over time",
    asset_type: "audio",
    verification_required: true,
    duration_minutes: 4,
    privacy_reminder: AUDIO_PRIVACY_REMINDER,
    questions: [
      "What's one thing about your training that's completely different from when you started?",
      "What made you change it?",
      "If you're still training in 5 years, what do you think will be different then?",
    ],
  },
];

// HELPER FUNCTIONS

/**
 * Get all available drills (video + audio)
 */
export function getAllDrills(): (VideoDrill | AudioCapsule)[] {
  return [...VIDEO_DRILLS, ...AUDIO_CAPSULES];
}

/**
 * Get drill by drill_type_id
 */
export function getDrillById(
  drill_type_id: string
): VideoDrill | AudioCapsule | undefined {
  return getAllDrills().find((drill) => drill.drill_type_id === drill_type_id);
}

/**
 * Get only video drills
 */
export function getVideoDrills(): VideoDrill[] {
  return VIDEO_DRILLS;
}

/**
 * Get only audio capsules
 */
export function getAudioCapsules(): AudioCapsule[] {
  return AUDIO_CAPSULES;
}

/**
 * Validate if a drill_type_id exists
 */
export function isValidDrillTypeId(drill_type_id: string): boolean {
  return getAllDrills().some((drill) => drill.drill_type_id === drill_type_id);
}
