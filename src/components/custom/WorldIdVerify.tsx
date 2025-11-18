"use client";

import {
  IDKitWidget,
  VerificationLevel,
  ISuccessResult,
} from "@worldcoin/idkit";
import { useState } from "react";

interface WorldIdVerifyProps {
  athleteId: string; // UUID of the athlete from the database
  onVerificationSuccess?: () => void;
  onVerificationError?: (error: string) => void;
}

export default function WorldIdVerify({
  athleteId,
  onVerificationSuccess,
  onVerificationError,
}: WorldIdVerifyProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Called when World ID returns a proof (before showing success screen)
  // This is where we verify the proof with our backend
  const handleVerify = async (proof: ISuccessResult) => {
    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch("/api/verify-world-id", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          proof,
          athlete_id: athleteId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Backend verification failed
        throw new Error(data.error || "Verification failed");
      }

      // Verification succeeded - data contains success message
      return; // IDKit will show success screen
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Verification failed";
      setError(errorMessage);

      if (onVerificationError) {
        onVerificationError(errorMessage);
      }

      // Re-throw so IDKit shows error screen
      throw new Error(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  // Called when user closes the modal (after success screen)
  const onSuccess = () => {
    console.log("World ID verification completed successfully");

    if (onVerificationSuccess) {
      onVerificationSuccess();
    }
  };

  return (
    <div className='flex flex-col items-start gap-2'>
      <IDKitWidget
        app_id={process.env.NEXT_PUBLIC_WORLD_ID_APP_ID as `app_${string}`}
        action='verify-athlete-profile'
        onSuccess={onSuccess}
        handleVerify={handleVerify}
        verification_level={VerificationLevel.Device}
      >
        {({ open }) => (
          <button
            onClick={open}
            disabled={isVerifying}
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            {isVerifying ? "Verifying..." : "Verify with World ID"}
          </button>
        )}
      </IDKitWidget>

      {error && <p className='text-sm text-red-600'>{error}</p>}
    </div>
  );
}
