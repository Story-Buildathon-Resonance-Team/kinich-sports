import { ButtonCobalt } from "./button-cobalt";
import React from "react";

function HeroSection() {
  return (
    <section className='min-h-screen flex flex-col items-center justify-center px-6 md:px-16 pt-[120px] pb-16 relative'>
      {/* Hero Content */}
      <div className='max-w-[900px] text-center relative z-10'>
        <h1 className='text-[48px] md:text-[64px] lg:text-[72px] font-light leading-[1.1] mb-8 tracking-tight'>
          Your training is worth{" "}
          <span className='font-semibold text-gradient-logo'>billions</span>.
          You're getting zero.
        </h1>

        <p className='text-lg md:text-xl leading-relaxed text-[rgba(245,247,250,0.7)] mb-12 font-light max-w-[800px] mx-auto'>
          The sports data industry is exploding to $14.5B by 2030. AI companies,
          betting platforms, and analytics firms are making fortunes from
          performance data. Athletes? Giving their performance data for free
          while others profit.
        </p>

        <ButtonCobalt size='large'>Claim What's Yours</ButtonCobalt>
      </div>
    </section>
  );
}

export default React.memo(HeroSection);
