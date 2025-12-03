import { HeroSection } from "@/components/custom/hero-section";
import { StatCard } from "@/components/custom/stat-card";
import { FeatureCard } from "@/components/custom/feature-card";
import { ButtonCobalt } from "@/components/custom/button-cobalt";
import { Navigation } from "@/components/custom/navigation";

export default function HomePage() {
  return (
    <div className='min-h-screen'>
      <Navigation />
      <HeroSection />

      <section className='py-[120px] px-6 md:px-16 bg-[#2C2C2E]'>
        <div className='max-w-[1200px] mx-auto'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-12'>
            <StatCard
              number='$14.5B'
              label='By 2030'
              description='Sports analytics market growing 20.6% annually—fueled by AI training data, betting platforms, and performance insights from athletes like you'
            />
            <StatCard
              number='Billions'
              label='Lost Revenue'
              description='Organizations profit from athlete data while legal gray areas leave athletes unprotected and uncompensated for their training footage'
            />
            <StatCard
              number='98%'
              label='Getting Nothing'
              description='Data fragmentation, no ownership rights, no compensation structure. The industry explodes while athletes are left behind'
            />
          </div>
        </div>
      </section>

      <section className='py-[120px] px-6 md:px-16 bg-gradient-to-br from-[#2C2C2E] to-[rgba(0,71,171,0.05)]'>
        <div className='max-w-[800px] mx-auto text-center'>
          <h2 className='text-[40px] md:text-[48px] font-light mb-8 tracking-tight'>
            Everyone wants your data.{" "}
            <span className='text-[rgba(255,107,53,0.85)] font-normal'>
              No one's protecting your rights.
            </span>
          </h2>

          <p className='text-[18px] leading-relaxed text-[rgba(245,247,250,0.7)] mb-6 font-light'>
            AI companies need licensed training data—they're facing lawsuits and
            scraping restrictions. Betting platforms are investing billions in
            performance analytics. Teams are buying into sports tech at record
            levels.
          </p>

          <p className='text-[18px] leading-relaxed text-[rgba(245,247,250,0.7)] font-light'>
            But the data ecosystem is broken. Fragmented footage. No legal
            framework. No compensation for athletes. Just legal gray areas and
            missed revenue opportunities everywhere you look.
          </p>

          <p className='text-[18px] leading-relaxed text-[rgba(245,247,250,0.7)] mt-6 font-light'>
            Kinich fixes this: You upload training sessions, we verify and
            structure the data, you own it as registered IP. When organizations
            license it, you get paid. Clean licensing. Clear ownership.
          </p>
        </div>
      </section>

      <section className='py-[120px] px-6 md:px-16 bg-[#2C2C2E]'>
        <div className='max-w-[1200px] mx-auto'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12'>
            <FeatureCard
              icon='🔐'
              title='You Own Your IP'
              description="Every training video and audio capsule is registered as your intellectual property on blockchain. Not a platform's data. Not legal gray area. Yours. Permanently."
            />
            <FeatureCard
              icon='💰'
              title="Get Paid When It's Used"
              description='Set your license fee. AI companies training motion models, research labs, media companies—when they use your data, you earn.'
            />
            <FeatureCard
              icon='⛓️'
              title='Blockchain-Native Ownership'
              description='Every asset registered on Story Protocol with programmable licensing terms. Clear attribution, enforceable rights, automatic royalties. The legal framework the industry desperately needs.'
            />
            <FeatureCard
              icon='🎯'
              title='Computer Vision Captures Your Technique'
              description='Our system extracts cadence, consistency, rep count from your videos. No wearables needed. Your technique becomes structured, valuable data.'
            />
            <FeatureCard
              icon='🎙️'
              title='Your Mind Matters Too'
              description='Audio capsules capture your training philosophy, decision-making, and strategic thinking. The mental edge that creates champions—finally documented and valued.'
            />
            <FeatureCard
              icon='🌍'
              title='Everyone Wants What You Create'
              description='AI companies training models. Media companies building content. Betting platforms analyzing performance. Fans hungry for deeper connection. Sports tech growing to $61.7B by 2030—your training data feeds it all.'
            />
          </div>
        </div>
      </section>
    </div>
  );
}
