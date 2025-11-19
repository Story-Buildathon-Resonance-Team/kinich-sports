interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div
      className='
      bg-graphite-dark/40
      border border-ice/[0.04]
      rounded-2xl
      p-10
      transition-all duration-400
      hover:border-cobalt/15
      hover:-translate-y-1
    '
    >
      {/* Icon */}
      <div
        className='
        w-12 h-12
        bg-cobalt/10
        rounded-xl
        flex items-center justify-center
        text-2xl
        mb-6
      '
      >
        {icon}
      </div>

      {/* Title */}
      <h3 className='text-[22px] font-medium text-ice mb-4'>{title}</h3>

      {/* Description */}
      <p className='text-[15px] text-ice/60 leading-relaxed font-light'>
        {description}
      </p>
    </div>
  );
}
