interface AssetCardProps {
  type: "video" | "audio";
  title: string;
  price: number;
  duration?: string;
  thumbnailUrl?: string;
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
      className='bg-[rgba(26,26,28,0.6)] border border-[rgba(245,247,250,0.06)] rounded-xl overflow-hidden transition-all duration-300 hover:border-[rgba(0,71,171,0.2)] hover:-translate-y-1 cursor-pointer group'
      onClick={onClick}
    >
      <div
        className={`
        relative w-full h-[180px]
        ${
          type === "video"
            ? "bg-gradient-to-br from-[rgba(0,71,171,0.1)] to-[rgba(26,26,28,0.9)]"
            : "bg-gradient-to-br from-[rgba(0,71,171,0.08)] to-[rgba(26,26,28,0.9)]"
        }
        flex items-center justify-center
      `}
      >
        {type === "video" && (
          <div className='w-14 h-14 bg-[rgba(245,247,250,0.95)] rounded-full flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.3)] transition-all duration-300 group-hover:scale-110'>
            <svg
              className='w-5 h-5 text-[#1A1A1C] ml-1'
              fill='currentColor'
              viewBox='0 0 24 24'
            >
              <path d='M8 5v14l11-7z' />
            </svg>
          </div>
        )}

        {type === "audio" && (
          <div className='flex items-center gap-1 h-[60px]'>
            {[32, 48, 40, 56, 44, 52, 36].map((height, i) => (
              <div
                key={i}
                className='w-1.5 bg-[rgba(0,71,171,0.6)] rounded-full transition-all duration-300 group-hover:bg-[rgba(0,71,171,0.8)]'
                style={{ height: `${height}px` }}
              />
            ))}
          </div>
        )}

        {duration && (
          <div className='absolute bottom-3 right-3 bg-[rgba(26,26,28,0.9)] border border-[rgba(245,247,250,0.1)] text-[#F5F7FA] px-2.5 py-1 rounded-md text-[12px] font-medium font-mono'>
            {duration}
          </div>
        )}
      </div>

      <div className='p-4'>
        <div className='text-[14px] font-medium text-[#F5F7FA] mb-2 line-clamp-2'>
          {title}
        </div>
        <div className='text-[13px] font-semibold text-[rgba(0,71,171,0.9)] font-mono'>
          {price} $IP
        </div>
      </div>
    </div>
  );
}
