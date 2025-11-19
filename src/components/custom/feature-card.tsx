interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className='bg-[rgba(26,26,28,0.4)] border border-[rgba(245,247,250,0.04)] rounded-2xl p-10 transition-all duration-[400ms] hover:border-[rgba(0,71,171,0.15)] hover:-translate-y-1'>
      <div className='w-12 h-12 bg-[rgba(0,71,171,0.1)] rounded-xl flex items-center justify-center text-2xl mb-6'>
        {icon}
      </div>

      <h3 className='text-[22px] font-medium text-[#F5F7FA] mb-4'>{title}</h3>

      <p className='text-[15px] text-[rgba(245,247,250,0.6)] leading-relaxed font-light'>
        {description}
      </p>
    </div>
  );
}
