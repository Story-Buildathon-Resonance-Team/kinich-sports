interface AssetCardProps {
  type: "video" | "audio";
  title: string;
  price: number;
  duration?: string; // e.g., "1:02"
  thumbnailUrl?: string; // Optional custom thumbnail
  onClick?: () => void;
}

export function AssetCard({
  type,
  title,
  price,
  duration,
  thumbnailUrl,
  onClick,
}: AssetCardProps) {
  return (
    <div
      className='
        bg-graphite-dark/60 
        border border-ice/[0.06]
        rounded-xl
        overflow-hidden
        transition-all duration-300
        hover:border-cobalt/20
        hover:-translate-y-1
        cursor-pointer
      '
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div
        className={`
        relative w-full h-[180px]
        ${
          type === "video"
            ? "bg-gradient-to-br from-cobalt/10 to-graphite-dark/90"
            : "bg-gradient-to-br from-cobalt/8 to-graphite-dark/90"
        }
        flex items-center justify-center
      `}
      >
        {/* Play Icon for Video */}
        {type === "video" && (
          <div
            className='
            w-14 h-14
            bg-ice/95
            rounded-full
            flex items-center justify-center
            shadow-[0_4px_16px_rgba(0,0,0,0.3)]
            transition-all duration-300
            group-hover:scale-110
          '
          >
            <svg
              className='w-5 h-5 text-graphite-dark ml-1'
              fill='currentColor'
              viewBox='0 0 24 24'
            >
              <path d='M8 5v14l11-7z' />
            </svg>
          </div>
        )}

        {/* Audio Wave Bars */}
        {type === "audio" && (
          <div className='flex items-center gap-1 h-[60px]'>
            {[32, 48, 40, 56, 44, 52, 36].map((height, i) => (
              <div
                key={i}
                className='w-1.5 bg-cobalt/60 rounded-full transition-all duration-300 hover:bg-cobalt/80'
                style={{ height: `${height}px` }}
              />
            ))}
          </div>
        )}

        {/* Duration Badge */}
        {duration && (
          <div
            className='
            absolute bottom-3 right-3
            bg-graphite-dark/90
            border border-ice/10
            text-ice
            px-2.5 py-1
            rounded-md
            text-[12px] font-medium font-mono
          '
          >
            {duration}
          </div>
        )}
      </div>

      {/* Asset Info */}
      <div className='p-4'>
        <div className='text-[14px] font-medium text-ice mb-2 line-clamp-2'>
          {title}
        </div>
        <div className='text-[13px] font-semibold text-cobalt/90 font-mono'>
          {price} $IP
        </div>
      </div>
    </div>
  );
}
