import { ButtonCobalt } from "./button-cobalt";

export function HeroSection() {
  return (
    <section
      className='
      min-h-screen
      flex flex-col items-center justify-center
      px-16 pt-[120px] pb-16
      relative
    '
    >
      {/* Star field overlay - optional, can be added as separate component */}
      <div className='absolute inset-0 pointer-events-none opacity-100'>
        <div
          className='absolute inset-0'
          style={{
            backgroundImage: `
              radial-gradient(circle at 15% 20%, rgba(245, 247, 250, 0.02) 1px, transparent 1px),
              radial-gradient(circle at 85% 30%, rgba(245, 247, 250, 0.015) 1px, transparent 1px),
              radial-gradient(circle at 45% 60%, rgba(245, 247, 250, 0.02) 1px, transparent 1px),
              radial-gradient(circle at 75% 80%, rgba(245, 247, 250, 0.015) 1px, transparent 1px)
            `,
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
          }}
        />
      </div>

      {/* Hero Content */}
      <div className='max-w-[900px] text-center relative z-10'>
        <h1 className='text-[72px] font-light leading-[1.1] mb-8 tracking-tight'>
          Your training has{" "}
          <span className='font-semibold text-gradient-logo'>fingerprints</span>
        </h1>

        <p className='text-[20px] leading-relaxed text-ice/70 mb-12 font-light'>
          Every rep tells a story. Every session builds a legacy. Transform your
          training data into verified performance assets that the world can see,
          learn from, and value.
        </p>

        <ButtonCobalt size='large'>Start Your Legacy</ButtonCobalt>
      </div>
    </section>
  );
}
