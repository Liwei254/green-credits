import React, { useEffect, useState } from "react";
import { BrowserProvider } from "ethers";

import WalletConnect from "./components/WalletConnect"; // FIXED
import Dashboard from "./components/Dashboard";        // ensure the file is renamed from Dshboard.tsx to Dashboard.tsx
import ActionForm from "./components/ActionForm";
import Leaderboard from "./components/Leaderboard";

const App: React.FC = () => {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [address, setAddress] = useState<string>("");

  useEffect(() => {
    if (window.ethereum) setProvider(new BrowserProvider(window.ethereum));
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h1>🌱 Green Credits dApp</h1>
      <WalletConnect provider={provider} address={address} setAddress={setAddress} />
      {address && provider && (
        <>
          <Dashboard provider={provider} address={address} />
          <ActionForm provider={provider} />
          <Leaderboard provider={provider} />
        </>
      )}
    </div>
  );
};

export default App;