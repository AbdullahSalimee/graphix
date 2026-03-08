// src/app/page.tsx
import CtaSection from "@/components/CtaSection";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
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
      <PricingSection />
      <CTA />    
<Footer/>      
    </div>
  );
}
