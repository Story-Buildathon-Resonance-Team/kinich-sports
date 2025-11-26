interface StatCardProps {
  number: string;
  label: string;
  description: string;
}

export function StatCard({ number, label, description }: StatCardProps) {
  return (
    <div className='relative overflow-hidden bg-[rgba(26,26,28,0.6)] border border-[rgba(245,247,250,0.06)] rounded-2xl px-8 py-12 text-center transition-all duration-[400ms] hover:border-[rgba(0,71,171,0.2)] hover:-translate-y-1 group'>
      <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,71,171,0.3)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-[400ms]' />

      <div className='text-[64px] font-extralight leading-none text-[#F5F7FA] mb-4'>
        {number.includes("%") || number.includes("∞") || number === "0" ? (
          <span className='text-[rgba(0,71,171,0.8)] font-normal'>
            {number}
          </span>
        ) : (
          number
        )}
      </div>

      <div className='text-[14px] text-[rgba(245,247,250,0.6)] uppercase tracking-[2px] mb-3 font-medium'>
        {label}
      </div>

      <p className='text-[15px] text-[rgba(245,247,250,0.5)] leading-relaxed font-light'>
        {description}
      </p>
    </div>
  );
}
