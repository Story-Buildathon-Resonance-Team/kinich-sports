"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/custom/card";
import { CircleCheckBig, Ban, Loader2 } from "lucide-react";

interface LicenseDisplayProps {
  licenseFee: number; // In $IP
  storyIpId: string | null;
}

interface LicenseTerms {
  commercialUse: boolean;
  derivativesAllowed: boolean;
  commercialRevShare: number;
  commercialAttribution: boolean;
  uri: string;
}

interface LicenseData {
  terms: LicenseTerms;
  templateName: string;
  licenseTermsId: string;
}

export function LicenseDisplay({ licenseFee, storyIpId }: LicenseDisplayProps) {
  const [licenseData, setLicenseData] = useState<LicenseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLicenseTerms = async () => {
      if (!storyIpId) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/story/license-terms?ipId=${encodeURIComponent(storyIpId)}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch license terms");
        }

        const data: LicenseData = await response.json();
        setLicenseData(data);
      } catch (err) {
        console.error("[LicenseDisplay] Error fetching license terms:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load license terms"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLicenseTerms();
  }, [storyIpId]);

  if (loading) {
    return (
      <Card variant='default' hover={false} className='p-6'>
        <div className='space-y-4'>
          <div>
            <h4 className='text-[16px] font-medium text-[#F5F7FA] mb-1'>
              Commercial Use License
            </h4>
            <p className='text-[13px] text-[rgba(245,247,250,0.6)]'>
              Loading license terms...
            </p>
          </div>
          <div className='flex items-center justify-center py-8'>
            <Loader2 className='w-8 h-8 text-blue-400 animate-spin' />
          </div>
        </div>
      </Card>
    );
  }

  if (error || !licenseData) {
    return (
      <Card variant='default' hover={false} className='p-6'>
        <div className='space-y-4'>
          {/* Header */}
          <div>
            <h4 className='text-[16px] font-medium text-[#F5F7FA] mb-1'>
              Commercial Use License
            </h4>
            <p className='text-[13px] text-[rgba(245,247,250,0.6)]'>
              One-time fee for commercial use rights
            </p>
          </div>

          {/* License Fee */}
          <div className='bg-gradient-to-br from-[rgba(0,71,171,0.12)] to-[rgba(0,71,171,0.05)] border-2 border-[rgba(0,71,171,0.2)] rounded-2xl p-6'>
            <div className='flex items-baseline gap-3 mb-2'>
              <span className='text-[48px] font-mono font-light text-[#F5F7FA] tracking-tight'>
                {licenseFee}
              </span>
              <span className='text-[20px] font-mono text-blue-400 font-medium'>
                $IP
              </span>
            </div>
            <p className='text-[13px] text-[rgba(245,247,250,0.5)]'>
              License fee (testnet)
            </p>
          </div>

          {/* Static fallback terms */}
          <div className='space-y-2 pt-3 border-t border-[rgba(245,247,250,0.06)]'>
            <div className='flex items-start gap-3'>
              <CircleCheckBig className='w-4 h-4 text-[rgba(0,71,171,0.8)] mt-0.5 flex-shrink-0' />
              <div>
                <p className='text-[13px] text-[rgba(245,247,250,0.9)] font-medium mb-0.5'>
                  Commercial Use
                </p>
                <p className='text-[12px] text-[rgba(245,247,250,0.6)]'>
                  Use in commercial AI training, products, and services
                </p>
              </div>
            </div>

            <div className='flex items-start gap-3'>
              <CircleCheckBig className='w-4 h-4 text-[rgba(0,71,171,0.8)] mt-0.5 flex-shrink-0' />
              <div>
                <p className='text-[13px] text-[rgba(245,247,250,0.9)] font-medium mb-0.5'>
                  One-Time Fee
                </p>
                <p className='text-[12px] text-[rgba(245,247,250,0.6)]'>
                  No recurring payments or royalties
                </p>
              </div>
            </div>

            <div className='flex items-start gap-3'>
              <Ban className='w-4 h-4 text-[rgba(245,247,250,0.4)] mt-0.5 flex-shrink-0' />
              <div>
                <p className='text-[13px] text-[rgba(245,247,250,0.9)] font-medium mb-0.5'>
                  No Derivatives
                </p>
                <p className='text-[12px] text-[rgba(245,247,250,0.6)]'>
                  Cannot create derivative works from this asset
                </p>
              </div>
            </div>
          </div>

          {/* Error message if applicable */}
          {error && (
            <p className='text-[12px] text-[rgba(255,107,53,0.8)] mt-2'>
              Unable to load license terms from Story Protocol. Showing default
              terms.
            </p>
          )}

          {/* Action Button */}
          <button
            disabled
            className='
              w-full
              bg-gradient-to-br from-[rgba(0,71,171,0.8)] to-[rgba(0,86,214,0.8)]
              border border-[rgba(184,212,240,0.2)]
              text-[#F5F7FA] font-medium
              rounded-lg px-4 py-2.5
              text-[14px]
              opacity-50 cursor-not-allowed
            '
          >
            License Purchase (Coming Soon)
          </button>

          {/* License URI */}
          <div className='pt-3 border-t border-[rgba(245,247,250,0.06)]'>
            <p className='text-[11px] uppercase tracking-wider text-[rgba(245,247,250,0.5)] mb-2'>
              License Terms
            </p>
            <a
              href=''
              target='_blank'
              rel='noopener noreferrer'
              className='text-[12px] text-[rgba(0,71,171,0.9)] hover:text-[rgba(0,71,171,1)] underline break-all'
            >
              View Full Terms →
            </a>
          </div>
        </div>
      </Card>
    );
  }

  // Render with actual license terms from Story Protocol
  const { terms, templateName } = licenseData;

  return (
    <Card variant='default' hover={false} className='p-6'>
      <div className='space-y-4'>
        {/* Header */}
        <div>
          <h4 className='text-[16px] font-medium text-[#F5F7FA] mb-1'>
            {templateName || "Commercial Use License"}
          </h4>
          <p className='text-[13px] text-[rgba(245,247,250,0.6)]'>
            License terms from Story Protocol
          </p>
        </div>

        {/* License Fee */}
        <div className='bg-gradient-to-br from-[rgba(0,71,171,0.12)] to-[rgba(0,71,171,0.05)] border-2 border-[rgba(0,71,171,0.2)] rounded-2xl p-6'>
          <div className='flex items-baseline gap-3 mb-2'>
            <span className='text-[48px] font-mono font-light text-[#F5F7FA] tracking-tight'>
              {licenseFee}
            </span>
            <span className='text-[20px] font-mono text-blue-400 font-medium'>
              $IP
            </span>
          </div>
          <p className='text-[13px] text-[rgba(245,247,250,0.5)]'>
            License fee (testnet)
          </p>
        </div>

        {/* License Terms from Story Protocol */}
        <div className='space-y-2 pt-3 border-t border-[rgba(245,247,250,0.06)]'>
          {/* Commercial Use */}
          <div className='flex items-start gap-3'>
            {terms.commercialUse ? (
              <CircleCheckBig className='w-4 h-4 text-[rgba(0,71,171,0.8)] mt-0.5 flex-shrink-0' />
            ) : (
              <Ban className='w-4 h-4 text-[rgba(245,247,250,0.4)] mt-0.5 flex-shrink-0' />
            )}
            <div>
              <p className='text-[13px] text-[rgba(245,247,250,0.9)] font-medium mb-0.5'>
                Commercial Use
              </p>
              <p className='text-[12px] text-[rgba(245,247,250,0.6)]'>
                {terms.commercialUse
                  ? "Allowed for commercial AI training, products, and services"
                  : "Not allowed for commercial use"}
              </p>
            </div>
          </div>

          {/* Derivatives Allowed */}
          <div className='flex items-start gap-3'>
            {terms.derivativesAllowed ? (
              <CircleCheckBig className='w-4 h-4 text-[rgba(0,71,171,0.8)] mt-0.5 flex-shrink-0' />
            ) : (
              <Ban className='w-4 h-4 text-[rgba(245,247,250,0.4)] mt-0.5 flex-shrink-0' />
            )}
            <div>
              <p className='text-[13px] text-[rgba(245,247,250,0.9)] font-medium mb-0.5'>
                Derivatives
              </p>
              <p className='text-[12px] text-[rgba(245,247,250,0.6)]'>
                {terms.derivativesAllowed
                  ? "Can create derivative works from this asset"
                  : "Cannot create derivative works from this asset"}
              </p>
            </div>
          </div>

          {/* Revenue Share / Payment Terms */}
          <div className='flex items-start gap-3'>
            <CircleCheckBig className='w-4 h-4 text-[rgba(0,71,171,0.8)] mt-0.5 flex-shrink-0' />
            <div>
              <p className='text-[13px] text-[rgba(245,247,250,0.9)] font-medium mb-0.5'>
                {terms.commercialRevShare > 0
                  ? "Revenue Share"
                  : "One-Time Fee"}
              </p>
              <p className='text-[12px] text-[rgba(245,247,250,0.6)]'>
                {terms.commercialRevShare > 0
                  ? `${terms.commercialRevShare}% of revenue goes to IP owner`
                  : "No recurring payments or royalties"}
              </p>
            </div>
          </div>

          {/* Attribution (if required) */}
          {terms.commercialAttribution && (
            <div className='flex items-start gap-3'>
              <CircleCheckBig className='w-4 h-4 text-[rgba(0,71,171,0.8)] mt-0.5 flex-shrink-0' />
              <div>
                <p className='text-[13px] text-[rgba(245,247,250,0.9)] font-medium mb-0.5'>
                  Attribution Required
                </p>
                <p className='text-[12px] text-[rgba(245,247,250,0.6)]'>
                  Must provide attribution to original creator
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          disabled
          className='
            w-full
            bg-gradient-to-br from-[rgba(0,71,171,0.8)] to-[rgba(0,86,214,0.8)]
            border border-[rgba(184,212,240,0.2)]
            text-[#F5F7FA] font-medium
            rounded-lg px-4 py-2.5
            text-[14px]
            opacity-50 cursor-not-allowed
          '
        >
          License Purchase (Coming Soon)
        </button>

        {/* License URI */}
        <div className='pt-3 border-t border-[rgba(245,247,250,0.06)]'>
          <p className='text-[11px] uppercase tracking-wider text-[rgba(245,247,250,0.5)] mb-2'>
            License Terms
          </p>
          {terms.uri ? (
            <a
              href={terms.uri}
              target='_blank'
              rel='noopener noreferrer'
              className='text-[12px] text-[rgba(0,71,171,0.9)] hover:text-[rgba(0,71,171,1)] underline break-all'
            >
              View Full Terms →
            </a>
          ) : (
            <span className='text-[12px] text-[rgba(245,247,250,0.5)]'>
              No URI available
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
