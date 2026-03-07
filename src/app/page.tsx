// src/app/page.tsx
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import PricingSection from "@/components/landing/Pricing";
import HeroSection from "@/components/landing/Section";

export default function Home() {
  return (
    <div className="relative overflow-hidden bg-[#111212]">
      <Hero />
      <HeroSection />
      <HowItWorks />
      <PricingSection/>
    </div>
  );
}
