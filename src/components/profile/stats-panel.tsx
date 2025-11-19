interface StatItemProps {
  label: string;
  value: string | number;
  unit?: string;
  barPercentage?: number; // 0-100, optional progress bar
}

function StatItem({ label, value, unit, barPercentage }: StatItemProps) {
  return (
    <div className='mb-5 last:mb-0'>
      {/* Label */}
      <div className='text-[13px] text-ice/60 mb-2'>{label}</div>

      {/* Value */}
      <div className='text-[28px] font-light font-mono text-ice'>
        {value}
        {unit && (
          <span className='text-[14px] text-cobalt/80 ml-1'>{unit}</span>
        )}
      </div>

      {/* Progress Bar (optional) */}
      {barPercentage !== undefined && (
        <div className='w-full h-1 bg-ice/10 rounded-sm mt-2 overflow-hidden'>
          <div
            className='h-full bg-gradient-to-r from-cobalt/80 to-icy-cobalt/60 rounded-sm transition-all duration-600'
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

export function StatsPanel({ stats }: StatsPanelProps) {
  return (
    <div className='bg-graphite-dark/60 border border-ice/[0.06] rounded-xl p-6'>
      {/* Panel Title */}
      <h3 className='text-[12px] font-medium uppercase tracking-[1.5px] text-ice/50 mb-5'>
        Performance
      </h3>

      {/* Stats */}
      {stats.map((stat, index) => (
        <StatItem key={index} {...stat} />
      ))}
    </div>
  );
}
