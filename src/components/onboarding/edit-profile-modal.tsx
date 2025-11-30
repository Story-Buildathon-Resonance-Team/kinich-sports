"use client";

import { useState, useEffect } from "react";
import { X, Loader2, User, Trophy, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/custom/card";
import {
  SPORTS,
  COMPETITIVE_LEVELS,
  SPORT_LABELS,
  COMPETITIVE_LEVEL_LABELS,
  type Sport,
  type CompetitiveLevel,
  type SyncAthleteRequest,
  type SyncAthleteResponse,
  type Athlete,
} from "@/lib/types/athlete";
import { toast } from "sonner";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  athlete: Athlete;
  dynamicUserId: string;
  walletAddress: string;
  onUpdate?: (athlete: Athlete) => void;
}

export function EditProfileModal({
  isOpen,
  onClose,
  athlete,
  dynamicUserId,
  walletAddress,
  onUpdate,
}: EditProfileModalProps) {
  const [name, setName] = useState("");
  const [sport, setSport] = useState<Sport | "">("");
  const [competitiveLevel, setCompetitiveLevel] = useState<CompetitiveLevel | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with athlete data when modal opens
  useEffect(() => {
    if (isOpen && athlete) {
      setName(athlete.name || "");
      setSport((athlete.discipline as Sport) || "");
      setCompetitiveLevel((athlete.competitive_level as CompetitiveLevel) || "");
    }
  }, [isOpen, athlete]);

  if (!isOpen) return null;

  const isFormValid = name.trim() !== "" && sport !== "" && competitiveLevel !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) return;

    setIsSubmitting(true);

    try {
      // Split name into first and last name
      const nameParts = name.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || undefined;

      const syncData: SyncAthleteRequest = {
        dynamicUserId,
        walletAddress,
        firstName,
        lastName,
        sport,
        competitiveLevel,
      };

      const response = await fetch("/api/sync-athlete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(syncData),
      });

      const result: SyncAthleteResponse = await response.json();

      if (result.success) {
        toast.success("Profile updated successfully!");
        if (result.athlete && onUpdate) {
          onUpdate(result.athlete);
        }
        onClose();
      } else {
        toast.error(result.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <Card className="w-full max-w-md bg-[#0a0a0a] border border-white/10 shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-zinc-900/50">
          <div>
            <h2 className="text-lg font-bold text-white">Edit Profile</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Update your athlete information
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name Input */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <User className="w-4 h-4 text-blue-400" />
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 bg-zinc-900/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              required
            />
          </div>

          {/* Sport Select */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <Dumbbell className="w-4 h-4 text-green-400" />
              Sport
            </label>
            <select
              value={sport}
              onChange={(e) => setSport(e.target.value as Sport)}
              className="w-full px-4 py-3 bg-zinc-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all appearance-none cursor-pointer"
              required
            >
              <option value="" disabled className="bg-zinc-900">
                Select your sport
              </option>
              {SPORTS.map((s) => (
                <option key={s} value={s} className="bg-zinc-900">
                  {SPORT_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          {/* Competitive Level Select */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <Trophy className="w-4 h-4 text-yellow-400" />
              Competitive Level
            </label>
            <select
              value={competitiveLevel}
              onChange={(e) => setCompetitiveLevel(e.target.value as CompetitiveLevel)}
              className="w-full px-4 py-3 bg-zinc-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all appearance-none cursor-pointer"
              required
            >
              <option value="" disabled className="bg-zinc-900">
                Select your level
              </option>
              {COMPETITIVE_LEVELS.map((level) => (
                <option key={level} value={level} className="bg-zinc-900">
                  {COMPETITIVE_LEVEL_LABELS[level]}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1 text-gray-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
