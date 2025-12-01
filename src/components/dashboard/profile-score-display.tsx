"use client";

interface ProfileScoreDisplayProps {
  score: number;
  worldIdVerified: boolean;
  audioCount?: number;
}

export function ProfileScoreDisplay({
  score,
  worldIdVerified,
  audioCount = 0,
}: ProfileScoreDisplayProps) {
  const getScoreColor = (s: number) => {
    if (s >= 80) return "text-emerald-400";
    if (s >= 60) return "text-blue-400";
    if (s >= 40) return "text-yellow-400";
    return "text-orange-400";
  };

  const getScoreBadge = (s: number) => {
    if (s >= 80) return "Elite";
    if (s >= 60) return "Advanced";
    if (s >= 40) return "Intermediate";
    return "Developing";
  };

  return (
    <div className='relative group'>
      <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
        {score}
        <span className='text-lg text-gray-500 font-normal'>/100</span>
      </div>
      <div className='text-xs text-gray-400 mt-1'>{getScoreBadge(score)}</div>

      {/* Tooltip on hover */}
      <div className='absolute hidden group-hover:block bottom-full mb-2 p-3 bg-black border border-white/10 rounded-lg text-xs w-64 z-50'>
        <div className='space-y-1'>
          <div>World ID: {worldIdVerified ? "15pts" : "0pts"}</div>
          <div>Video Quality: Top 5 videos (max 60pts)</div>
          <div>Audio Capsules: {Math.min(audioCount * 4, 12)}pts / 12pts</div>
          <div>Consistency: Monthly streak (max 8pts)</div>
        </div>
      </div>
    </div>
  );
}
