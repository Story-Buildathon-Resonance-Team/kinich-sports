"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AudioAccessResponse } from "@/lib/types/audio";
import { Lock, AlertCircle, Video, Loader2 } from "lucide-react";

interface AudioAccessGateProps {
  athleteId: string;
  children: React.ReactNode;
}

export function AudioAccessGate({ athleteId, children }: AudioAccessGateProps) {
  const router = useRouter();
  const [accessStatus, setAccessStatus] = useState<AudioAccessResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    const checkAccess = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `/api/check-audio-access?athleteId=${athleteId}`,
          { signal: abortController.signal }
        );

        if (!response.ok) {
          throw new Error("Failed to check audio access");
        }

        const data: AudioAccessResponse = await response.json();
        setAccessStatus(data);

        console.log("[AudioAccessGate] Access check:", data);
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }

        console.error("[AudioAccessGate] Error checking access:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to verify access. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (athleteId) {
      checkAccess();
    }

    return () => {
      abortController.abort();
    };
  }, [athleteId]);

  // Loading state
  if (isLoading) {
    return (
      <div className='min-h-screen bg-[#050505] flex items-center justify-center'>
        <div className='text-center flex flex-col items-center gap-4'>
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
          <p className='text-[16px] text-[rgba(245,247,250,0.7)]'>
            Verifying access...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className='min-h-screen bg-[#050505]'>
        <div className='max-w-[600px] mx-auto px-6 pt-[140px]'>
          <div className='bg-[#0a0a0a] border border-orange-500/20 rounded-2xl p-8 text-center'>
            <div className='flex justify-center mb-4'>
              <AlertCircle className="w-12 h-12 text-orange-400" />
            </div>
            <h2 className='text-[24px] font-medium text-[#F5F7FA] mb-3'>
              Verification Error
            </h2>
            <p className='text-[15px] text-[rgba(245,247,250,0.7)] mb-6'>
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className='
                bg-gradient-to-br from-[rgba(0,71,171,0.8)] to-[rgba(0,86,214,0.8)]
                border border-[rgba(184,212,240,0.2)]
                text-[#F5F7FA] font-medium
                rounded-xl px-8 py-3
                transition-all duration-300
                hover:-translate-y-0.5
              '
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Access granted - render children
  if (accessStatus?.hasAccess) {
    return <>{children}</>;
  }

  // Access denied - show locked state
  return (
    <div className='min-h-screen bg-[#050505]'>
      <div className='max-w-[600px] mx-auto px-6 pt-[140px]'>
        <div className='bg-gradient-to-br from-[rgba(0,71,171,0.15)] to-[rgba(26,26,28,0.6)] border border-[rgba(0,71,171,0.2)] rounded-2xl p-8 relative'>
          <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,71,171,0.3)] to-transparent' />

          <div className='text-center'>
            <div className='flex justify-center mb-6'>
              <div className='w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center'>
                <Lock className="w-10 h-10 text-blue-400" />
              </div>
            </div>
            <h2 className='text-[28px] font-medium text-[#F5F7FA] mb-3'>
              Audio Challenges Locked
            </h2>
            <p className='text-[16px] text-[rgba(245,247,250,0.7)] leading-relaxed mb-8'>
              Complete one of the following to unlock audio challenges:
            </p>
          </div>

          <div className='space-y-4 mb-8'>
            {/* World ID Option */}
            <div className='bg-[#0a0a0a] border border-white/10 rounded-xl p-6'>
              <div className='flex items-start gap-4'>
                <img
                  src='/World-Logomark-Black-RGB.svg'
                  alt='World ID'
                  width={48}
                  height={48}
                  className='flex-shrink-0'
                />
                <div className='flex-1'>
                  <h3 className='text-[18px] font-medium text-[#F5F7FA] mb-2'>
                    Connect your World ID
                  </h3>
                  <p className='text-[14px] text-[rgba(245,247,250,0.6)] mb-4'>
                    Prove you're a real human using World ID verification
                  </p>
                  <button
                    onClick={() => router.push("/dashboard")}
                    className='
                      bg-transparent
                      border border-[rgba(245,247,250,0.1)]
                      text-[rgba(245,247,250,0.7)]
                      px-6 py-2 rounded-lg
                      text-[14px] font-medium
                      transition-all duration-300
                      hover:bg-[rgba(0,71,171,0.1)]
                      hover:border-[rgba(0,71,171,0.3)]
                      hover:text-[#F5F7FA]
                    '
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            </div>

            {/* OR Divider */}
            <div className='flex items-center gap-4'>
              <div className='flex-1 h-px bg-[rgba(245,247,250,0.1)]' />
              <span className='text-[13px] font-medium text-[rgba(245,247,250,0.5)] uppercase tracking-wider'>
                Or
              </span>
              <div className='flex-1 h-px bg-[rgba(245,247,250,0.1)]' />
            </div>

            {/* CV Video Option */}
            <div className='bg-[#0a0a0a] border border-white/10 rounded-xl p-6'>
              <div className='flex items-start gap-4'>
                <div className='w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0'>
                  <Video className="w-6 h-6 text-purple-400" />
                </div>
                <div className='flex-1'>
                  <h3 className='text-[18px] font-medium text-[#F5F7FA] mb-2'>
                    Submit a Verified Video Drill
                  </h3>
                  <p className='text-[14px] text-[rgba(245,247,250,0.6)] mb-4'>
                    Complete a video drill that passes our verification pipeline
                  </p>
                  <button
                    onClick={() => router.push("/arena")}
                    className='
                      bg-gradient-to-br from-[rgba(0,71,171,0.8)] to-[rgba(0,86,214,0.8)]
                      border border-[rgba(184,212,240,0.2)]
                      text-[#F5F7FA] font-medium
                      rounded-lg px-6 py-2
                      text-[14px]
                      shadow-[0_2px_12px_rgba(0,71,171,0.2)]
                      transition-all duration-300
                      hover:-translate-y-0.5
                      hover:shadow-[0_4px_16px_rgba(0,71,171,0.3)]
                    '
                  >
                    View Video Drills
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className='text-center text-[13px] text-[rgba(245,247,250,0.5)]'>
            <p>
              This requirement ensures authentic human data for AI training
              models.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
