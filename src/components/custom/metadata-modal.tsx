"use client";

import { X, Copy, Check, Upload, FileJson, ExternalLink, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/custom/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { VideoDrillMetadata } from "@/lib/types/video";

interface MetadataModalProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: VideoDrillMetadata;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
  athleteWallet?: string;
  athleteName?: string;
}

export function MetadataModal({
  isOpen,
  onClose,
  metadata,
  onSubmit,
  isSubmitting,
  athleteWallet,
  athleteName
}: MetadataModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(metadata, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async () => {
    try {
      await onSubmit();
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to register video");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <Card className="w-full max-w-2xl max-h-[85vh] bg-[#0a0a0a] border border-white/10 shadow-2xl relative z-10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <FileJson className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Asset Metadata</h3>
              <p className="text-xs text-gray-400">Review and register on Story Protocol</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="relative">
            <pre className="text-xs md:text-sm font-mono text-gray-300 bg-[#111] p-4 rounded-xl border border-white/5 overflow-x-auto">
              {JSON.stringify(metadata, null, 2)}
            </pre>
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 p-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg transition-colors group"
              title="Copy JSON"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400 group-hover:text-white" />
              )}
            </button>
          </div>

          {/* Visual Summary (Optional - could be tabs) */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/5">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Drill Type</p>
              <p className="text-sm font-medium text-white">{metadata.drill_type_id}</p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/5">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Confidence</p>
              <p className="text-sm font-medium text-green-400">
                {metadata.verification?.human_confidence_score
                  ? `${(metadata.verification.human_confidence_score * 100).toFixed(0)}%`
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-zinc-900/50 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">
            Close
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-500 text-white gap-2"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Registering on Story...
              </>
            ) : (
              "Submit & Register on Story"
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}


