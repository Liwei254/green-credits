import React from "react";
import { BrowserProvider } from "ethers";
import Hero from "../components/Hero";
import FeatureCards from "../components/FeatureCards";
import SiteFooter from "../components/SiteFooter";

interface HomeProps {
  provider: BrowserProvider | null;
  address: string;
  setAddress: (addr: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  connectWallet: () => Promise<void>;
}

export default function Home({ provider, address, setAddress, theme, toggleTheme, connectWallet }: HomeProps) {
  return (
    <div className="min-h-screen">
      <main>
        <Hero onGetStarted={connectWallet} />
        <FeatureCards />
      </main>
      <SiteFooter />
    </div>
  );
}
