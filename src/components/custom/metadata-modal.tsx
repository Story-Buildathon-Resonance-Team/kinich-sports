"use client";

import { X, Copy, Check, Upload, FileJson, ExternalLink, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/custom/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface MetadataModalProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: any;
  onUpload?: () => void;
  onRegister?: () => void;
  athleteWallet?: string;
  athleteName?: string;
}

export function MetadataModal({
  isOpen,
  onClose,
  metadata,
  athleteWallet,
  athleteName
}: MetadataModalProps) {
  const [copied, setCopied] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [ipfsHash, setIpfsHash] = useState<string | null>(null);
  const [gatewayUrl, setGatewayUrl] = useState<string | null>(null);
  const [registrationResult, setRegistrationResult] = useState<{
    ipId: string;
    explorerUrl: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(metadata, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      const response = await fetch("/api/ipfs/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(metadata),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setIpfsHash(data.ipfsHash);
      setGatewayUrl(data.gatewayUrl);
      toast.success("Metadata uploaded to IPFS successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload metadata to IPFS");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRegister = async () => {
    if (!ipfsHash) return;

    setIsRegistering(true);
    try {
      const response = await fetch("/api/story/register-ip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metadata,
          ipfsHash,
          athleteWallet: athleteWallet || "0x...", // Fallback if not provided, but should be
          athleteName: athleteName || "Athlete"
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setRegistrationResult({
        ipId: data.ipId,
        explorerUrl: data.explorerUrl
      });
      toast.success("Asset registered on Story Protocol!");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Failed to register IP asset");
    } finally {
      setIsRegistering(false);
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
              <p className="text-xs text-gray-400">Ready for IPFS Upload & Verification</p>
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
          {ipfsHash ? (
            <div className="mb-6 p-4 bg-[#0a291b] border border-[#1a4d33] rounded-xl animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-1.5 bg-[#1a4d33] rounded-full">
                  <Check className="w-4 h-4 text-[#4ade80]" />
                </div>
                <p className="text-sm font-semibold text-[#4ade80]">Successfully Uploaded to IPFS</p>
              </div>
              <div className="space-y-3">
                <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                  <p className="text-[10px] uppercase tracking-wider text-[#4ade80]/70 font-bold mb-1.5 flex items-center gap-2">
                    CID (Hash)
                    <span className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] text-gray-400 font-normal normal-case">Immutable Identifier</span>
                  </p>
                  <p className="text-xs font-mono text-[#86efac] break-all select-all hover:text-white transition-colors cursor-text">{ipfsHash}</p>
                </div>
                <div>
                  <a
                    href={gatewayUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1.5 transition-colors group w-fit"
                  >
                    View on Dedicated Gateway
                    <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            </div>
          ) : null}

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
          {!ipfsHash ? (
            <Button
              className="bg-blue-600 hover:bg-blue-500 text-white gap-2"
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload to IPFS
                </>
              )}
            </Button>
          ) : !registrationResult ? (
            <Button
              className="bg-green-600 hover:bg-green-500 text-white gap-2"
              onClick={handleRegister}
              disabled={isRegistering}
            >
              {isRegistering ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Registering...
                </>
              ) : (
                "Register Asset on Story"
              )}
            </Button>
          ) : (
            <Button asChild className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2">
              <a href={registrationResult.explorerUrl} target="_blank" rel="noopener noreferrer">
                View on Story Explorer
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}


