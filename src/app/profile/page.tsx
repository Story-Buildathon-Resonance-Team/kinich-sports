"use client";

import { Navigation } from "@/components/custom/navigation";
import { ProfileSidebar, AssetCard, FilterTabs } from "@/components/profile";

export default function ProfilePage() {
  // Mock data - replace with real data from backend
  const athlete = {
    initials: "MC",
    name: "Marcus Chen",
    discipline: "MMA Fighter",
    level: "Competitive" as const,
  };

  const stats = {
    profileScore: 92,
    totalRoyalties: 347,
    totalAssets: 24,
  };

  const assets = [
    {
      id: "1",
      type: "video" as const,
      title: "Explosive Power: Max Burpees",
      price: 15,
      duration: "1:02",
    },
    {
      id: "2",
      type: "video" as const,
      title: "Ground Work: Submissions",
      price: 28,
      duration: "1:45",
    },
    {
      id: "3",
      type: "video" as const,
      title: "Hill Sprint Intervals",
      price: 20,
      duration: "3:28",
    },
    {
      id: "4",
      type: "video" as const,
      title: "Heavy Bag Combinations",
      price: 18,
      duration: "1:18",
    },
    {
      id: "5",
      type: "video" as const,
      title: "Speed Ladder Drills",
      price: 16,
      duration: "2:05",
    },
    {
      id: "6",
      type: "video" as const,
      title: "Core Conditioning Circuit",
      price: 15,
      duration: "1:32",
    },
  ];

  return (
    <div className='min-h-screen'>
      {/* Navigation */}
      <Navigation
        variant='authenticated'
        userName='Marcus Chen'
        walletAddress='0x742d...3a8f'
      />

      {/* Main Layout: Sidebar + Content */}
      <div className='grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 pt-[100px] px-8 lg:px-16 pb-16 max-w-[1600px] mx-auto'>
        {/* Left Sidebar */}
        <ProfileSidebar
          athlete={athlete}
          stats={stats}
          onUploadClick={() => console.log("Upload clicked")}
        />

        {/* Main Content */}
        <main className='min-h-[calc(100vh-164px)]'>
          {/* Page Header */}
          <div className='mb-10'>
            <h1 className='text-[36px] lg:text-[42px] font-light tracking-tight mb-2'>
              Performance Portfolio
            </h1>
            <p className='text-[15px] text-ice/60'>
              Verified training data • Blockchain-registered IP
            </p>
          </div>

          {/* Assets Section */}
          <section>
            {/* Section Header with Filters */}
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8'>
              <h2 className='text-[18px] font-medium uppercase tracking-[1.5px] text-ice/70'>
                All Performance Assets
              </h2>
              <FilterTabs
                onFilterChange={(filter) => console.log("Filter:", filter)}
              />
            </div>

            {/* Assets Grid */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
              {assets.map((asset) => (
                <AssetCard
                  key={asset.id}
                  type={asset.type}
                  title={asset.title}
                  price={asset.price}
                  duration={asset.duration}
                  onClick={() => console.log("Asset clicked:", asset.id)}
                />
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
