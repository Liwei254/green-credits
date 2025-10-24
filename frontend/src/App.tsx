import React, { useEffect, useState } from "react";
import { BrowserProvider } from "ethers";
import WalletConnect from "./components/WalletConnect";
import Dashboard from "./components/Dashboard";
import ActionForm from "./components/ActionForm";
import Leaderboard from "./components/Leaderboard";
import AdminVerify from "./components/AdminVerify";
import ActionsList from "./components/ActionsList";

const App: React.FC = () => {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [address, setAddress] = useState<string>("");

  useEffect(() => {
    if ((window as any).ethereum) {
      setProvider(new (window as any).ethers?.BrowserProvider?.() || new (window as any).ethers?.providers?.Web3Provider?.(window.ethereum) || new (require("ethers").BrowserProvider)(window.ethereum));
    } else if ((window as any).ethereum) {
      setProvider(new (require("ethers").BrowserProvider)(window.ethereum));
    } else if ((window as any).ethereum) {
      // No-op, just to satisfy bundlers
    }
    if ((window as any).ethereum) {
      setProvider(new (require("ethers").BrowserProvider)((window as any).ethereum));
    }
  }, []);

  // Simpler and reliable initialization:
  useEffect(() => {
    if ((window as any).ethereum) {
      const { BrowserProvider } = require("ethers");
      setProvider(new BrowserProvider((window as any).ethereum));
    }
  }, []);

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white font-bold">G</span>
            <div>
              <div className="font-semibold">Green Credits</div>
              <div className="text-xs text-gray-500">Moonbeam x Polkadot</div>
            </div>
          </div>
          <div className="text-xs text-gray-500">Network: Moonbase Alpha (DEV)</div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <WalletConnect provider={provider} address={address} setAddress={setAddress} />

        {address && provider && (
          <>
            <Dashboard provider={provider} address={address} />

            <div className="grid lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-4">
                <ActionForm provider={provider} />
                <ActionsList provider={provider} />
              </div>
              <div className="space-y-4">
                <AdminVerify provider={provider} />
                <Leaderboard provider={provider} />
              </div>
            </div>
          </>
        )}
        {!address && <p className="text-sm text-gray-600">Connect your wallet to start.</p>}
      </main>

      <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-500">
        Built for the Road to Sub0 Hackathon — Green, Transparent, On-chain.
      </footer>
    </div>
  );
};

export default App;