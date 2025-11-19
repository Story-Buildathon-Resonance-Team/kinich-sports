import {
  Navigation,
  HeroSection,
  StatCard,
  FeatureCard,
  ButtonCobalt,
} from "@/components/custom";

export default function HomePage() {
  return (
    <div className='min-h-screen'>
      {/* Navigation */}
      <Navigation variant='public' />

      {/* Hero Section */}
      <HeroSection />

      {/* Stats Section */}
      <section className='py-[120px] px-16 bg-graphite'>
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

      {/* Mission Section */}
      <section className='py-[120px] px-16 bg-gradient-to-b from-graphite to-cobalt/5'>
        <div className='max-w-[800px] mx-auto text-center'>
          <h2 className='text-[48px] font-light mb-8 tracking-tight'>
            The future is{" "}
            <span className='text-kinetic-orange/85 font-normal'>
              already here
            </span>
          </h2>

          <p className='text-[18px] leading-relaxed text-ice/70 mb-6 font-light'>
            Elite technology shouldn't belong only to elite athletes. Your
            dedication, your technique, your mental preparation—these matter.
            They have value. They deserve permanence.
          </p>

          <p className='text-[18px] leading-relaxed text-ice/70 font-light'>
            Kinich turns training sessions into verified performance assets.
            Your videos become proof. Your audio captures become insight.
            Everything registered on blockchain, owned by you, valued by the
            world.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className='py-[120px] px-16 bg-graphite'>
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

      {/* Footer CTA */}
      <section className='py-[120px] px-16 text-center bg-gradient-to-b from-graphite to-graphite-dark'>
        <h2 className='text-[56px] font-light mb-8 tracking-tight'>
          Your arena awaits
        </h2>
        <p className='text-[18px] text-ice/60 mb-12'>
          Join the athletes who refuse to let their work disappear
        </p>
        <ButtonCobalt size='large'>Enter The Arena</ButtonCobalt>
      </section>
    </div>
  );
}
