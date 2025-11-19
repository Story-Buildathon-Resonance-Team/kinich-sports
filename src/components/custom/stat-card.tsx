interface StatCardProps {
  number: string;
  label: string;
  description: string;
}

export function StatCard({ number, label, description }: StatCardProps) {
  return (
    <div
      className='
      relative overflow-hidden
      bg-graphite-dark/60 
      border border-ice/[0.06]
      rounded-2xl 
      px-8 py-12
      text-center
      transition-all duration-400
      hover:border-cobalt/20
      hover:-translate-y-1
      group
    '
    >
      {/* Top accent line - appears on hover */}
      <div className='absolute top-0 left-0 right-0 h-px bg-linear-to-br from-transparent via-cobalt/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400' />

      {/* Stat Number */}
      <div className='text-[64px] font-extralight leading-none text-ice mb-4'>
        {number.includes("%") || number.includes("∞") || number === "0" ? (
          <>
            <span className='text-cobalt/80 font-normal'>{number}</span>
          </>
        ) : (
          number
        )}
      </div>

      {/* Label */}
      <div className='text-[14px] text-ice/60 uppercase tracking-[2px] mb-3 font-medium'>
        {label}
      </div>

      {/* Description */}
      <p className='text-[15px] text-ice/50 leading-relaxed font-light'>
        {description}
      </p>
    </div>
  );
}
