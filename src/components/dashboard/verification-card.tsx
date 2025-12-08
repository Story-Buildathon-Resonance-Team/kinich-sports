"use client";

import WorldIdVerify from "../custom/world-id-verify";
import React from "react";
import { ShieldCheck, ScanFace } from "lucide-react";

interface VerificationCardProps {
  athleteId: string;
  isWorldIdVerified: boolean;
  verifiedAt?: string;
  onVerificationSuccess?: () => void;
}

function VerificationCard({
  athleteId,
  isWorldIdVerified,
  verifiedAt,
  onVerificationSuccess,
}: VerificationCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900/20 via-black to-black border border-blue-500/20 p-8 transition-all duration-300 hover:border-blue-500/40 group">
      {/* Background decorative elements */}
      <div className="absolute -top-12 -right-12 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
        <ScanFace className="w-64 h-64 text-blue-500 rotate-12" strokeWidth={1} />
      </div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400 group-hover:text-blue-300 group-hover:bg-blue-500/20 transition-colors">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Verify Humanity</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs font-medium text-blue-400 uppercase tracking-wider">Required</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-400 leading-relaxed mb-6">
          Get your &quot;Human&quot; badge and secure your IP assets.
        </p>

        <WorldIdVerify
          athleteId={athleteId}
          onVerificationSuccess={onVerificationSuccess}
        />
      </div>
    </div>
  );
}

export default React.memo(VerificationCard);
