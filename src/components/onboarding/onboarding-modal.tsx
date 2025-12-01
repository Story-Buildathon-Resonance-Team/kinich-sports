"use client";

import { useState } from "react";
import { Loader2, User, Trophy, Dumbbell } from "lucide-react";
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
} from "@/lib/types/athlete";
import { toast } from "sonner";

interface OnboardingModalProps {
  isOpen: boolean;
  dynamicUserId: string;
  walletAddress: string;
  onComplete: () => void;
}

export function OnboardingModal({
  isOpen,
  dynamicUserId,
  walletAddress,
  onComplete,
}: OnboardingModalProps) {
  const [name, setName] = useState("");
  const [sport, setSport] = useState<Sport | "">("");
  const [competitiveLevel, setCompetitiveLevel] = useState<CompetitiveLevel | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        toast.success("Profile created successfully!");
        onComplete();
      } else {
        toast.error(result.error || "Failed to create profile");
      }
    } catch (error) {
      console.error("Error creating profile:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-md bg-[#0a0a0a] border border-white/10 shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 bg-zinc-900/50">
          <h2 className="text-xl font-bold text-white">Welcome to Kinich</h2>
          <p className="text-sm text-gray-400 mt-1">
            Complete your athlete profile to get started
          </p>
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

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 text-base font-medium mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Creating Profile...
              </>
            ) : (
              "Complete Setup"
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}
