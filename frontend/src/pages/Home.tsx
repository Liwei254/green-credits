import React, { useState, useEffect } from "react";
import { BrowserProvider } from "ethers";
import Hero from "../components/Hero";
import FeatureCards from "../components/FeatureCards";
import SiteFooter from "../components/SiteFooter";

interface HomeProps {
  provider: PatchedBrowserProvider | null;
  address: string;
  setAddress: (addr: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  connectWallet: () => Promise<void>;
}

export default function Home({ provider, address, setAddress, theme, toggleTheme, connectWallet }: HomeProps) {
  const [showWalkthrough, setShowWalkthrough] = useState(false);

  useEffect(() => {
    const onboardingCompleted = localStorage.getItem("onboardingCompleted");
    if (!onboardingCompleted) {
      setShowWalkthrough(true);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-6xl mx-auto">
            <Hero onGetStarted={connectWallet} showWalkthrough={showWalkthrough} setShowWalkthrough={setShowWalkthrough} />
          </div>
        </div>
        <div className="flex items-center justify-center px-4 pb-16">
          <div className="w-full max-w-6xl mx-auto">
            <FeatureCards />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
