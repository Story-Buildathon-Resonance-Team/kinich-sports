# Kinich Sports Performance

**Your training has fingerprints. Own them.**

Kinich is a blockchain-native platform where athletes register training performance data as intellectual property assets. Moving beyond traditional outcome metrics, Kinich captures "training context" - the inputs, methods, and mental patterns that create performance rather than just biometrics or game statistics.

## The Problem We're Solving

The sports analytics market is projected to reach **$14.5B by 2030**, fueled by AI training data, betting platforms, and performance insights. Yet **98% of athletes** receive nothing while organizations profit from their data. The ecosystem is broken:

- **Fragmented data** with no ownership rights
- **No compensation structure** for athlete training footage
- **Legal gray areas** leaving athletes unprotected
- **AI companies** facing lawsuits and scraping restrictions, desperate for licensed training data

**Kinich fixes this**: Athletes upload training sessions → we verify and structure the data → they own it as registered IP on Story Protocol → when organizations license it, athletes get paid.

## Why Story Protocol Matters

Story Protocol provides the legal infrastructure this industry desperately needs:

- **Blockchain-native IP registration** with programmable licensing terms
- **Clear attribution** and enforceable ownership rights
- **Automatic royalty distribution** (90% athlete, 10% platform)
- **Transparent licensing** for AI companies, research labs, and media platforms

Every training video and audio capsule becomes a registered IP asset with trackable provenance and monetization built-in.

## Tech Stack

### Frontend

- **Next.js 15** (App Router)
- **React 19** with TypeScript
- **Tailwind CSS v4** (custom design system)
- **GSAP** + **Lenis** for animations and smooth scrolling
- **Dynamic** for wallet authentication
- **World ID** for human verification

### Backend & Infrastructure

- **Supabase** (PostgreSQL database + storage)
- **Story Protocol SDK** for IP registration
- **Pinata** for IPFS metadata storage
- **MediaPipe Pose Landmarker** for computer vision analysis
- **Native Browser APIs** for video compression

### Blockchain

- **Story Protocol** (Aeneid testnet)
- **Viem** for blockchain interactions
- **Wagmi** for React hooks

## 📁 Project Structure

```
src/
├── app/                          # Next.js app router pages
│   ├── api/                      # API routes (server-side)
│   ├── dashboard/                # Athlete dashboard (layout + pages)
│   ├── asset/[id]/              # Individual asset view
│   └── page.tsx                  # Landing page
│
├── components/                   # React components
│   ├── dashboard/                # Dashboard-specific components
│   ├── custom/                   # Reusable UI components
│   ├── audio/                    # Audio recording/playback
│   ├── drills/                   # Video drill analyzer
│   └── asset-page/               # Asset detail components
│
├── context/                      # React Context providers
│   └── analysis-context.tsx      # CV analysis state management
│
├── hooks/                        # Custom React hooks
│   ├── useAudioUpload.ts         # Audio upload logic
│   └── useVideoUpload.ts         # Video upload + CV pipeline
│
├── lib/                          # Core business logic
│   ├── drills/                   # Drill definitions (video + audio)
│   ├── mediapipe/                # Computer vision (pose detection)
│   ├── compression/              # Native video compression
│   ├── story/                    # Story Protocol integration
│   ├── scoring/                  # Profile score calculation
│   └── types/                    # TypeScript type definitions
│
├── scripts/                      # Deployment scripts
│   └── deploy-spg-nft-collection.ts
│
├── supabase/                     # Database schema
│   └── schema.sql
│
└── utils/                        # Utility functions
    └── supabase/                 # Supabase client configs
```

## Installation

### Prerequisites

- Node.js (v18+)
- pnpm, npm, or yarn
- Supabase account
- Story Protocol testnet access
- Pinata account (IPFS)
- Dynamic account
- World ID (optional, for human verification)

### Setup Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/Story-Buildathon-Resonance-Team/kinich-sports.git
   cd kinich-sports
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Fill in all required environment variables. See `.env.example` for the complete list.

4. **Set up Supabase database**

   - Create a new Supabase project
   - Run the schema from `src/supabase/schema.sql`
   - Configure storage buckets for athlete assets

5. **Deploy SPG NFT Collection** (Story Protocol)

   ```bash
   pnpm tsx src/scripts/deploy-spg-nft-collection.ts
   ```

   Add the resulting contract address to your `.env.local` as `NEXT_PUBLIC_SPG_NFT_CONTRACT`

6. **Run development server**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## 🔐 World ID Integration

Kinich uses **World ID** for human verification to ensure only real humans create training data, not bots or AI-generated content. This is critical for data integrity when licensing to AI companies and research institutions.

**For detailed integration documentation**, see:

- [Kinich World ID Integration Guide](https://github.com/Story-Buildathon-Resonance-Team/kinich-sports/blob/main/World%20ID%20Integration.md)
- [Official World ID Documentation](https://docs.world.org/world-id/concepts)

## Computer Vision Pipeline

Kinich uses **MediaPipe Pose Landmarker** to extract training context from video submissions:

- **Human pose detection** (33 body keypoints per frame)
- **Rep counting** via hip vertical displacement analysis
- **Cadence calculation** (reps per minute)
- **Consistency scoring** based on rep timing variance

**For detailed CV metrics**, see [`src/lib/types/video.ts`](src/lib/types/video.ts)

The pipeline runs client-side in the browser using WebAssembly, ensuring privacy while generating structured, valuable training data.

## Demo

- **Live Site**: [https://kinich-sports.vercel.app](https://kinich-sports.vercel.app)
- **Demo Video**: _(Coming soon)_

## Team

Built by:

- **Natalia Gómez** - [GitHub](https://github.com/inatgomez)
- **Craig Mutugi** - [GitHub](https://github.com/cmm25)
- **Xavier Duncan** - [GitHub](https://github.com/xmd512) - _Collaborator_

---

**Built for Story Protocol SWA Season 2 Buildathon** | Data Track Submission
