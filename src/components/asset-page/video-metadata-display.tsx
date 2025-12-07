"use client";

import { useState } from "react";
import { VideoDrillMetadata } from "@/lib/types/video";
import HumanBadge from "@/components/custom/human-badge";
import { Video, FileJson, X, AlertTriangle, Activity, Timer, Zap } from "lucide-react";

interface VideoMetadataDisplayProps {
  metadata: VideoDrillMetadata;
  worldIdVerified: boolean;
}

export function VideoMetadataDisplay({
  metadata,
  worldIdVerified,
}: VideoMetadataDisplayProps) {
  const [showMetadataModal, setShowMetadataModal] = useState(false);

  return (
    <div className="space-y-6">
      
      {/* Metrics Grid - Horizontal */}
      <div className="grid grid-cols-3 gap-4">
         <div className="bg-black/20 rounded-xl p-4 border border-white/5 text-center">
            <div className="flex justify-center mb-2">
               <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white mb-1">{metadata.cv_metrics.rep_count}</p>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Reps</p>
         </div>
         <div className="bg-black/20 rounded-xl p-4 border border-white/5 text-center">
            <div className="flex justify-center mb-2">
               <Zap className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white mb-1">{(metadata.cv_metrics.consistency_score * 100).toFixed(0)}%</p>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Consistency</p>
         </div>
         <div className="bg-black/20 rounded-xl p-4 border border-white/5 text-center">
            <div className="flex justify-center mb-2">
               <Timer className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white mb-1">{metadata.cv_metrics.cadence_avg.toFixed(1)}</p>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Cadence</p>
         </div>
      </div>

      {/* Verification Status */}
      <div className="bg-black/20 border border-white/5 rounded-xl p-5">
         <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-medium text-gray-300">Verification Proofs</h4>
            {worldIdVerified && <HumanBadge variant='icon-label' size='small' />}
         </div>
         
         <div className="space-y-3">
            {metadata.verification.is_verified ? (
               <div className="flex items-center justify-between p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center gap-3">
                     <Video className="w-4 h-4 text-blue-400" />
                     <span className="text-sm text-blue-100">CV Video Verification</span>
                  </div>
                  <span className="text-xs font-bold text-blue-400 bg-blue-400/10 px-2 py-1 rounded">
                     {(metadata.verification.human_confidence_score * 100).toFixed(0)}% SCORE
                  </span>
               </div>
            ) : (
               <div className="flex items-center gap-3 p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-orange-200">Verification pending or failed</span>
               </div>
            )}
         </div>
      </div>

      <button
        onClick={() => setShowMetadataModal(true)}
        className='w-full py-3 border border-white/10 hover:bg-white/5 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2'
      >
        <FileJson className='w-4 h-4' />
        View Raw Metadata
      </button>

      {/* Metadata Modal */}
      {showMetadataModal && (
        <div
          className='fixed inset-0 z-[100] overflow-y-auto bg-black/90 backdrop-blur-md p-6 flex items-center justify-center'
          onClick={() => setShowMetadataModal(false)}
        >
          <div
            className='bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='flex items-center justify-between px-6 py-4 border-b border-white/10'>
              <h3 className='text-lg font-bold text-white'>Raw Metadata</h3>
              <button
                onClick={() => setShowMetadataModal(false)}
                className='p-2 hover:bg-white/10 rounded-full transition-colors'
              >
                <X className='w-5 h-5 text-gray-400' />
              </button>
            </div>
            <div className='flex-1 overflow-auto p-6'>
              <pre className='text-xs font-mono text-blue-300 bg-[#050505] p-4 rounded-xl border border-white/5 overflow-x-auto overflow-y-auto max-h-[500px]'>
                {JSON.stringify(metadata, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
