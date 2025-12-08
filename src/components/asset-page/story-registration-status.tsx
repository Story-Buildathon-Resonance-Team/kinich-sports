"use client";

import { Card } from "@/components/custom/card";
import { CheckCircle2, AlertTriangle, Loader2, ExternalLink, Copy } from "lucide-react";
import { useState } from "react";

interface StoryRegistrationStatusProps {
  storyIpId: string | null;
  storyTxHash: string | null;
  status: "pending" | "active" | "failed";
}

export function StoryRegistrationStatus({
  storyIpId,
  storyTxHash,
  status,
}: StoryRegistrationStatusProps) {
  const [copied, setCopied] = useState(false);
  const explorerUrl = storyIpId
    ? `https://aeneid.explorer.story.foundation/ipa/${storyIpId}`
    : null;

  const handleCopy = () => {
    if (storyIpId) {
      navigator.clipboard.writeText(storyIpId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (status === "pending" || !storyIpId) {
    return (
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/20 overflow-hidden">
           <div className="h-full bg-blue-500 animate-progress-indeterminate" />
        </div>
        <div className='flex items-start gap-4'>
          <div className="p-3 bg-blue-500/10 rounded-xl">
             <Loader2 className='w-6 h-6 text-blue-400 animate-spin' />
          </div>
          <div>
            <h4 className='text-base font-medium text-white mb-1'>
              Registering IP Asset
            </h4>
            <p className='text-sm text-gray-400'>
              Minting on Story Protocol...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="bg-[#0a0a0a] border border-red-500/20 rounded-2xl p-6">
        <div className='flex items-start gap-4'>
          <div className="p-3 bg-red-500/10 rounded-xl">
             <AlertTriangle className='w-6 h-6 text-red-400' />
          </div>
          <div>
            <h4 className='text-base font-medium text-red-400 mb-1'>
              Registration Failed
            </h4>
            <p className='text-sm text-gray-400'>
              Transaction failed. Please retry or contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] border border-green-500/20 rounded-2xl p-6 relative group">
      {/* Background Glow */}
      <div className="absolute -inset-1 bg-green-500/5 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className='relative z-10 flex flex-col gap-6'>
        {/* Header */}
        <div className="flex justify-between items-start">
           <div className="flex gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg h-fit">
                 <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
              <div>
                 <h4 className="text-sm font-medium text-green-400">IP Registered</h4>
                 <p className="text-xs text-gray-500 mt-0.5">Secured on Story Protocol</p>
              </div>
           </div>
           
           {explorerUrl && (
            <a
              href={explorerUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors'
              title="View on Explorer"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
           )}
        </div>

        {/* IP Address Field */}
        <div className="space-y-2">
           <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500">IP Asset ID</label>
           <div className="flex items-center gap-2 p-3 bg-black/40 border border-white/5 rounded-lg group/field hover:border-white/10 transition-colors">
              <code className="text-xs font-mono text-gray-300 truncate flex-1">
                {storyIpId}
              </code>
              <button 
                onClick={handleCopy}
                className="text-gray-500 hover:text-white transition-colors"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
