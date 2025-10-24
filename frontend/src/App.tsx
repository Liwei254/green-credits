import React, { useEffect, useState } from "react";
import { BrowserProvider } from "ethers";

import WalletConnect from "./components/WalletConnect";
import Dashboard from "./components/Dashboard";
import ActionForm from "./components/ActionForm";
import Leaderboard from "./components/Leaderboard";
// If these files exist, keep them; otherwise comment them out.
// import AdminVerify from "./components/AdminVerify";
// import ActionsList from "./components/ActionsList";

const App: React.FC = () => {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [address, setAddress] = useState<string>("");

  useEffect(() => {
    const eth = (window as any).ethereum;
    if (eth) {
      try {
        const p = new BrowserProvider(eth);
        setProvider(p);
      } catch (e) {
        console.error("Failed to initialize BrowserProvider:", e);
        setProvider(null);
      }
    } else {
      setProvider(null);
    }
  }, []);

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: 16 }}>
      <h1>🌱 Green Credits</h1>
      <WalletConnect provider={provider} address={address} setAddress={setAddress} />

      {address && provider && (
        <>
          <Dashboard provider={provider} address={address} />
          <ActionForm provider={provider} />
          {/* Uncomment these if the files exist */}
          {/* <ActionsList provider={provider} /> */}
          {/* <AdminVerify provider={provider} /> */}
          <Leaderboard provider={provider} />
        </>
      )}

      {!address && <p>Connect your wallet to get started.</p>}
    </div>
  );
};

export default App;