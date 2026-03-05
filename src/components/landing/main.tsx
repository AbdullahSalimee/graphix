"use client";


import Benefits from "./Benefits";
import BgStars from "./BgStars";
import CTA from "./CTA";
import Footer from "./Footer";
import Hero from "./Hero";
import HowItWorks from "./HowitWorks";
import Marquee from "./Marquee";
import Testimonials from "./Testimonials";

type LandingPageProps = {
  onLaunch: () => void;
};

export default function LandingPage({ onLaunch }: LandingPageProps) {
  return (
    <div>
      <Hero onLaunch={onLaunch} />
      <BgStars/>
      <Marquee />
      <HowItWorks />
      <Benefits />
      <Testimonials />
      <CTA onLaunch={onLaunch} />
      <Footer/>
    </div>
  );
}
