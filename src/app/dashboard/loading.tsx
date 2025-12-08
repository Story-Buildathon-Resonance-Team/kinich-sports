import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className='p-6 lg:p-8 w-full max-w-[1600px] mx-auto animate-fade-in-up'>
      {/* Profile Header Section Skeleton */}
      <div className='relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] mb-8'>
        {/* Banner Skeleton */}
        <div className='absolute top-0 left-0 w-full h-32 md:h-48 z-0'>
          <Skeleton className='w-full h-full' />
        </div>

        {/* Content Container */}
        <div className='relative z-10 px-6 pb-6 pt-16 md:pt-24 md:px-10 flex flex-col md:flex-row items-end md:items-center gap-6'>
          {/* Avatar Skeleton */}
          <div className='relative'>
            <div className='w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-[#0a0a0a] overflow-hidden shadow-2xl'>
              <Skeleton className='w-full h-full' />
            </div>
          </div>

          {/* Info Skeleton */}
          <div className='flex-1 mb-2 space-y-3 w-full'>
            <div className='flex flex-col md:flex-row md:items-center gap-3 md:gap-4'>
              <Skeleton className='h-10 w-48 md:w-64 rounded-lg' />
              <Skeleton className='h-6 w-24 rounded-full' />
            </div>
            <div className='flex items-center gap-4'>
              <Skeleton className='h-4 w-32' />
              <Skeleton className='h-4 w-32' />
            </div>
          </div>

          {/* Actions Skeleton */}
          <div className='flex gap-3 mt-4 md:mt-0 w-full md:w-auto'>
            <Skeleton className='h-10 w-32 rounded-lg' />
            <Skeleton className='h-10 w-32 rounded-lg' />
          </div>
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8'>
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className='bg-[#0a0a0a] rounded-2xl p-6 border border-white/10'
          >
            <div className='flex justify-between items-start mb-4'>
              <Skeleton className='h-12 w-12 rounded-xl' />
            </div>
            <Skeleton className='h-8 w-3/4 mb-2 rounded-lg' />
            <Skeleton className='h-4 w-1/2 rounded-lg' />
          </div>
        ))}
      </div>

      {/* Main Chart Section Skeleton */}
      <div className='bg-[#0a0a0a] rounded-2xl border border-white/10 p-6 mb-10'>
        <div className='flex justify-between items-center mb-8'>
          <div className="space-y-2">
            <Skeleton className='h-8 w-48 rounded-lg' />
            <Skeleton className='h-4 w-64 rounded-lg' />
          </div>
          <div className='flex items-center gap-4'>
            <Skeleton className='h-8 w-24 rounded-lg' />
            <Skeleton className='h-8 w-48 rounded-lg' />
          </div>
        </div>

        <div className='h-[350px] w-full'>
          <Skeleton className='w-full h-full rounded-xl' />
        </div>
      </div>
    </div>
  );
}

