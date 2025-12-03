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
              number='74%'
              label='Untapped Potential'
              description="Athletes worldwide can't access elite performance tracking technology"
            />
            <StatCard
              number='0'
              label='Ownership'
              description="Most athletes never own their training data or see compensation when it's used"
            />
            <StatCard
              number='∞'
              label='Value Lost'
              description='Countless hours of training disappear without documentation or recognition'
            />
          </div>
        </div>
      </section>

      <section className='py-[120px] px-6 md:px-16 bg-gradient-to-br from-[#2C2C2E] to-[rgba(0,71,171,0.05)]'>
        <div className='max-w-[800px] mx-auto text-center'>
          <h2 className='text-[40px] md:text-[48px] font-light mb-8 tracking-tight'>
            The future is{" "}
            <span className='text-[rgba(255,107,53,0.85)] font-normal'>
              already here
            </span>
          </h2>

          <p className='text-[18px] leading-relaxed text-[rgba(245,247,250,0.7)] mb-6 font-light'>
            Elite technology shouldn't belong only to elite athletes. Your
            dedication, your technique, your mental preparation—these matter.
            They have value. They deserve permanence.
          </p>

          <p className='text-[18px] leading-relaxed text-[rgba(245,247,250,0.7)] font-light'>
            Kinich turns training sessions into verified performance assets.
            Your videos become proof. Your audio captures become insight.
            Everything registered on blockchain, owned by you, valued by the
            world.
          </p>
        </div>
      </section>

      <section className='py-[120px] px-6 md:px-16 bg-[#2C2C2E]'>
        <div className='max-w-[1200px] mx-auto'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12'>
            <FeatureCard
              icon='🎯'
              title='Computer Vision Verification'
              description='Advanced analysis extracts technique metrics from your training videos—no wearables needed. Cadence, consistency, range of motion, automatically documented.'
            />
            <FeatureCard
              icon='🔐'
              title='Blockchain Ownership'
              description='Every asset you create is registered as intellectual property on Story Protocol. You own it. Forever. No one can take it from you.'
            />
            <FeatureCard
              icon='💰'
              title='Earn From Your Work'
              description='Set your price. When AI companies, gaming studios, or brands license your data, you get paid. Your training becomes your income stream.'
            />
            <FeatureCard
              icon='🎙️'
              title='Mental Performance Capture'
              description='Your mindset matters as much as your mechanics. Record audio capsules about your journey, strategy, and preparation—the invisible edge that makes champions.'
            />
            <FeatureCard
              icon='🌍'
              title='Global Marketplace'
              description='Your training data reaches the world. Game developers building realistic animations. AI researchers training motion models. Coaches studying elite technique.'
            />
            <FeatureCard
              icon='✨'
              title='Build Your Legacy'
              description='Long after you stop competing, your training data continues working. Teaching. Inspiring. Generating value. This is how athletes live forever.'
            />
          </div>
        </div>
      </section>

      <section className='py-[120px] px-6 md:px-16 text-center bg-gradient-to-br from-[#2C2C2E] to-[#1A1A1C]'>
        <h2 className='text-[48px] md:text-[56px] font-light mb-8 tracking-tight'>
          Your arena awaits
        </h2>
        <p className='text-[18px] text-[rgba(245,247,250,0.6)] mb-12'>
          Join the athletes who refuse to let their work disappear
        </p>
        <ButtonCobalt size='large'>Enter The Arena</ButtonCobalt>
      </section>
    </div>
  );
}
