"use client";

import LandingPage from "@/components/landing/main";

export default function Home() {
  const handleLaunch = () => {
    window.location.href = "/app";
  };

  return <LandingPage onLaunch={handleLaunch} />;
}
