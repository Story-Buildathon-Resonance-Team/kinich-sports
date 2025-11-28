"use client";

import { Card } from "@/components/custom/card";

interface LicenseDisplayProps {
  licenseFee: number; // In $IP
}

export function LicenseDisplay({ licenseFee }: LicenseDisplayProps) {
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
        <div className='bg-[rgba(0,71,171,0.08)] border border-[rgba(0,71,171,0.15)] rounded-lg p-4'>
          <div className='flex items-baseline gap-2'>
            <span className='text-[32px] font-mono font-light text-[#F5F7FA]'>
              {licenseFee}
            </span>
            <span className='text-[16px] font-mono text-[rgba(0,71,171,0.9)]'>
              $IP
            </span>
          </div>
          <p className='text-[12px] text-[rgba(245,247,250,0.5)] mt-1'>
            License fee (testnet)
          </p>
        </div>

        {/* License Terms Summary */}
        <div className='space-y-2 pt-3 border-t border-[rgba(245,247,250,0.06)]'>
          <div className='flex items-start gap-3'>
            <span className='text-[16px] mt-0.5'>✓</span>
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
            <span className='text-[16px] mt-0.5'>✓</span>
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
            <span className='text-[16px] mt-0.5'>×</span>
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

        {/* Action Button Placeholder */}
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
