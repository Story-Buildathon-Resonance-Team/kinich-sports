"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/custom/card";
import { CircleCheckBig, Ban, Loader2, Scale, Coins, ShieldCheck } from "lucide-react";

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
      if (!storyIpId) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/story/license-terms?ipId=${encodeURIComponent(storyIpId)}`
        );

        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch (e) {
            console.warn("[LicenseDisplay] Failed to parse error response:", e);
            errorData = { error: "Failed to fetch license terms (Invalid JSON)" };
          }

          // Handle "IP asset not found" gracefully
          if (response.status === 404 && errorData.error === "IP asset not found") {
            console.warn("[LicenseDisplay] IP asset not yet indexed or found");
            setLoading(false);
            return;
          }
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
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading license terms...</p>
        </div>
      </div>
    );
  }

  // Use actual terms or fallback defaults for display
  const terms = licenseData?.terms || {
    commercialUse: true,
    derivativesAllowed: false,
    commercialRevShare: 0,
    commercialAttribution: true,
    uri: ""
  };

  return (
    <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
      {/* Decorative Gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-2xl rounded-full -mr-10 -mt-10 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-400" />
            License Terms
          </h3>
          <span className="text-xs font-mono text-gray-500 bg-white/5 px-2 py-1 rounded border border-white/5">
            PIL v1.4
          </span>
        </div>

        {/* Fee Card */}
        <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/10 border border-blue-500/20 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-blue-300 font-medium uppercase tracking-wider mb-1">Minting Fee</p>
            <p className="text-2xl font-bold text-white flex items-baseline gap-1">
              {licenseFee} <span className="text-sm font-normal text-blue-400">$IP</span>
            </p>
          </div>
          <div className="h-10 w-10 bg-blue-500/20 rounded-full flex items-center justify-center">
            <Coins className="w-5 h-5 text-blue-400" />
          </div>
        </div>

        {/* Terms Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Commercial Use */}
          <div className={`p-3 rounded-lg border ${terms.commercialUse ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
            <div className="flex items-center gap-2 mb-1">
              {terms.commercialUse ? <CircleCheckBig className="w-4 h-4 text-emerald-400" /> : <Ban className="w-4 h-4 text-red-400" />}
              <span className={`text-sm font-medium ${terms.commercialUse ? 'text-emerald-400' : 'text-red-400'}`}>Commercial</span>
            </div>
            <p className="text-xs text-gray-400 leading-tight">
              {terms.commercialUse ? "Allowed for products & services" : "Personal use only"}
            </p>
          </div>

          {/* Derivatives */}
          <div className={`p-3 rounded-lg border ${terms.derivativesAllowed ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-orange-500/5 border-orange-500/20'}`}>
            <div className="flex items-center gap-2 mb-1">
              {terms.derivativesAllowed ? <CircleCheckBig className="w-4 h-4 text-emerald-400" /> : <Ban className="w-4 h-4 text-orange-400" />}
              <span className={`text-sm font-medium ${terms.derivativesAllowed ? 'text-emerald-400' : 'text-orange-400'}`}>Remixing</span>
            </div>
            <p className="text-xs text-gray-400 leading-tight">
              {terms.derivativesAllowed ? "Creation of derivatives allowed" : "No derivatives allowed"}
            </p>
          </div>

          {/* Rev Share */}
          <div className="p-3 rounded-lg border bg-white/5 border-white/5 col-span-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">Revenue Share</span>
            </div>
            <span className="text-sm font-mono text-white">
              {terms.commercialRevShare > 0 ? `${terms.commercialRevShare}%` : "0%"}
            </span>
          </div>
        </div>

        {/* Footer Link */}
        <div className="mt-6 pt-4 border-t border-white/5 text-center">
          <a
            href="https://github.com/piplabs/pil-document/blob/v1.4.0/Story%20Foundation%20-%20Programmable%20IP%20License%20-%20V%201.4%20-%2011.13.25.docx.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-500 hover:text-white transition-colors"
          >
            View Full License Agreement ↗
          </a>
        </div>
      </div>
    </div>
  );
}
