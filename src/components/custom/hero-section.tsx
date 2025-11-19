import { ButtonCobalt } from "./button-cobalt";

export function HeroSection() {
  return (
    <section className='min-h-screen flex flex-col items-center justify-center px-6 md:px-16 pt-[120px] pb-16 relative'>
      {/* Hero Content */}
      <div className='max-w-[900px] text-center relative z-10'>
        <h1 className='text-[48px] md:text-[64px] lg:text-[72px] font-light leading-[1.1] mb-8 tracking-tight'>
          Your training has{" "}
          <span className='font-semibold text-gradient-logo'>fingerprints</span>
        </h1>

        <p className='text-lg md:text-xl leading-relaxed text-[rgba(245,247,250,0.7)] mb-12 font-light max-w-[800px] mx-auto'>
          Every rep tells a story. Every session builds a legacy. Transform your
          training data into verified performance assets that the world can see,
          learn from, and value.
        </p>

        <ButtonCobalt size='large'>Start Your Legacy</ButtonCobalt>
      </div>
    </section>
  );
}
