interface StatItemProps {
  label: string;
  value: string | number;
  unit?: string;
  barPercentage?: number;
}

function StatItem({ label, value, unit, barPercentage }: StatItemProps) {
  return (
    <div className='mb-5 last:mb-0'>
      <div className='text-[13px] text-[rgba(245,247,250,0.6)] mb-2'>
        {label}
      </div>

      <div className='text-[28px] font-light font-mono text-[#F5F7FA]'>
        {value}
        {unit && (
          <span className='text-[14px] text-[rgba(0,71,171,0.8)] ml-1'>
            {unit}
          </span>
        )}
      </div>

      {barPercentage !== undefined && (
        <div className='w-full h-1 bg-[rgba(245,247,250,0.1)] rounded-sm mt-2 overflow-hidden'>
          <div
            className='h-full bg-gradient-to-r from-[rgba(0,71,171,0.8)] to-[rgba(184,212,240,0.6)] rounded-sm transition-all duration-[600ms]'
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
    <div className='bg-[rgba(26,26,28,0.6)] border border-[rgba(245,247,250,0.06)] rounded-xl p-6'>
      <h3 className='text-[12px] font-medium uppercase tracking-[1.5px] text-[rgba(245,247,250,0.5)] mb-5'>
        Performance
      </h3>

      {stats.map((stat, index) => (
        <StatItem key={index} {...stat} />
      ))}
    </div>
  );
}
