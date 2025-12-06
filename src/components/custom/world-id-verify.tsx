"use client";

import {
  IDKitWidget,
  VerificationLevel,
  ISuccessResult,
} from "@worldcoin/idkit";
import { useState } from "react";
import Image from "next/image";

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
    if (onVerificationSuccess) {
      onVerificationSuccess();
    }
  };

  return (
    <div className='flex flex-col items-start gap-4'>
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
            className='
              relative overflow-hidden
              bg-gradient-to-br from-[rgba(0,71,171,0.8)] to-[rgba(0,86,214,0.8)]
              border border-[rgba(184,212,240,0.2)]
              text-[#F5F7FA] font-medium text-[15px]
              rounded-xl px-10 py-4
              shadow-[0_4px_20px_rgba(0,71,171,0.2)]
              transition-all duration-[400ms]
              hover:-translate-y-0.5
              hover:shadow-[0_8px_28px_rgba(0,71,171,0.3)]
              hover:border-[rgba(184,212,240,0.3)]
              disabled:opacity-50
              disabled:cursor-not-allowed
              disabled:transform-none
              cursor-pointer
              group
            '
          >
            {/* Orange sweep effect */}
            <span
              className='
                absolute inset-0 -left-full
                bg-gradient-to-r from-transparent via-[rgba(255,107,53,0.2)] to-transparent
                transition-all duration-[600ms]
                group-hover:left-full
                pointer-events-none
              '
            />

            {/* Button content */}
            <span className='relative z-10 flex items-center gap-3'>
              {isVerifying ? (
                <>
                  <svg
                    className='animate-spin h-5 w-5'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    />
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    />
                  </svg>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Image
                    src='/World-Logomark-Black-RGB.svg'
                    alt='World ID'
                    width={48}
                    height={48}
                  />
                  <span>Connect your World ID</span>
                </>
              )}
            </span>
          </button>
        )}
      </IDKitWidget>

      {/* Error message */}
      {error && (
        <div
          className='
            bg-[rgba(255,107,53,0.1)]
            border border-[rgba(255,107,53,0.3)]
            text-[rgba(255,107,53,0.9)]
            rounded-lg px-4 py-3
            text-sm
          '
        >
          <div className='flex items-start gap-2'>
            <svg
              className='w-5 h-5 flex-shrink-0 mt-0.5'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}
