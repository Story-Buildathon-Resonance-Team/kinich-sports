# World ID Integration - Setup & Testing Guide

## Installation

### 1. Install IDKit package

```bash
pnpm add @worldcoin/idkit
```

### 2. Add environment variables

Add to your `.env.local`:

```
NEXT_PUBLIC_WORLD_ID_APP_ID=app_staging_xxxxx
WORLD_ID_APP_ID=app_staging_xxxxx
```

## Documentation explaining use case will go here

## Usage examples component

````
export function HumanBadgeExamples() {
  return (
    <div className='space-y-8 p-8 bg-[#2C2C2E]'>
      <div>
        <h3 className='text-[#F5F7FA] text-lg font-medium mb-4'>
          Athlete Profile Header
        </h3>
        <div className='flex items-center gap-3'>
          <div className='w-12 h-12 rounded-full bg-[rgba(0,71,171,0.2)]' />
          <div>
            <div className='flex items-center gap-2'>
              <span className='text-[#F5F7FA] font-medium'>
                Miguel Rodriguez
              </span>
              <HumanBadge variant='icon-label' size='small' />
            </div>
            <span className='text-[rgba(245,247,250,0.6)] text-sm'>
              Competitive Soccer
            </span>
          </div>
        </div>
      </div>

      <div>
        <h3 className='text-[#F5F7FA] text-lg font-medium mb-4'>
          Asset Card (Dense UI)
        </h3>
        <div className='bg-[rgba(26,26,28,0.6)] border border-[rgba(245,247,250,0.06)] rounded-xl p-4'>
          <div className='flex items-start justify-between mb-3'>
            <div>
              <span className='text-[#F5F7FA] text-sm font-medium'>
                EXPL_BURPEE_001
              </span>
              <div className='flex items-center gap-2 mt-1'>
                <span className='text-[rgba(245,247,250,0.5)] text-xs'>
                  Miguel R.
                </span>
                <HumanBadge variant='icon-only' size='small' />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className='text-[#F5F7FA] text-lg font-medium mb-4'>
          Leaderboard Row
        </h3>
        <div className='flex items-center justify-between bg-[rgba(26,26,28,0.6)] border border-[rgba(245,247,250,0.06)] rounded-lg p-4'>
          <div className='flex items-center gap-3'>
            <span className='text-[rgba(245,247,250,0.5)] font-mono text-sm'>
              #1
            </span>
            <span className='text-[#F5F7FA]'>Marcus Rodriguez</span>
            <HumanBadge variant='icon-label' size='small' />
          </div>
          <span className='text-[#B8D4F0] font-mono font-medium'>347 $IP</span>
        </div>
      </div>

      <div>
        <h3 className='text-[#F5F7FA] text-lg font-medium mb-4'>
          All Badge Sizes
        </h3>
        <div className='flex items-center gap-4'>
          <div>
            <HumanBadge variant='icon-label' size='small' />
            <p className='text-[rgba(245,247,250,0.5)] text-xs mt-1'>Small</p>
          </div>
          <div>
            <HumanBadge variant='icon-label' size='medium' />
            <p className='text-[rgba(245,247,250,0.5)] text-xs mt-1'>Medium</p>
          </div>
          <div>
            <HumanBadge variant='icon-label' size='large' />
            <p className='text-[rgba(245,247,250,0.5)] text-xs mt-1'>Large</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className='text-[#F5F7FA] text-lg font-medium mb-4'>
          Icon Only Variants
        </h3>
        <div className='flex items-center gap-4'>
          <div>
            <HumanBadge variant='icon-only' size='small' />
            <p className='text-[rgba(245,247,250,0.5)] text-xs mt-1'>Small</p>
          </div>
          <div>
            <HumanBadge variant='icon-only' size='medium' />
            <p className='text-[rgba(245,247,250,0.5)] text-xs mt-1'>Medium</p>
          </div>
          <div>
            <HumanBadge variant='icon-only' size='large' />
            <p className='text-[rgba(245,247,250,0.5)] text-xs mt-1'>Large</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```
````
