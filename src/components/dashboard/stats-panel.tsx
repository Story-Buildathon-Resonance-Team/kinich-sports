import React from "react";

interface StatItemProps {
  label: string;
  value: string | number;
  unit?: string;
  barPercentage?: number;
}

function StatItem({ label, value, unit, barPercentage }: StatItemProps) {
  return (
    <div className='mb-6 last:mb-0 group'>
      <div className='flex justify-between items-baseline mb-2'>
        <span className='text-xs font-medium text-gray-500 uppercase tracking-wider group-hover:text-gray-400 transition-colors'>
            {label}
        </span>
      </div>

      <div className='text-3xl font-medium text-white tracking-tight'>
        {value}
        {unit && (
          <span className='text-sm text-blue-400 font-medium ml-1.5'>
            {unit}
          </span>
        )}
      </div>

      {barPercentage !== undefined && (
        <div className='w-full h-1.5 bg-white/5 rounded-full mt-3 overflow-hidden'>
        <div
            className='h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-1000 ease-out group-hover:shadow-[0_0_10px_rgba(59,130,246,0.5)]'
            style={{ width: `${barPercentage}%` }}
          />
        </div>
      )}
    </div>
  );
}

interface StatsPanelProps {
  stats: StatItemProps[];
}

function StatsPanel({ stats }: StatsPanelProps) {
  return (
    <div className="space-y-6 border-t border-white/5 pt-6">
      {stats.map((stat, index) => (
        <StatItem key={index} {...stat} />
      ))}
    </div>
  );
}

export default React.memo(StatsPanel);
