import React, { useEffect, useState } from "react";
import { BrowserProvider } from "ethers";
import { Link, Route, Routes, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import WalletConnect from "./components/WalletConnect";
import Dashboard from "./components/Dashboard";
import ActionForm from "./components/ActionForm";
import ActionsList from "./components/ActionsList";
import AdminVerify from "./components/AdminVerify";
import AdminRegistry from "./components/AdminRegistry";
import AdminReputation from "./components/AdminReputation";
import Donate from "./components/Donate";
import Leaderboard from "./components/Leaderboard";
import MatchingPool from "./components/MatchingPool";
import Home from "./pages/Home";
import Retirement from "./pages/Retirement";

const MOONBASE_PARAMS = {
  chainId: "0x507", // 1287
  chainName: "Moonbase Alpha",
  nativeCurrency: { name: "Dev", symbol: "DEV", decimals: 18 },
  rpcUrls: ["https://rpc.api.moonbase.moonbeam.network"],
  blockExplorerUrls: ["https://moonbase.moonscan.io"],
};

function getInjectedProvider(): any {
  const eth = (window as any).ethereum;
  if (!eth) return null;
  if (Array.isArray(eth.providers)) {
    const mm = eth.providers.find((p: any) => p && p.isMetaMask);
    return mm ?? eth.providers[0];
  }
  return eth;
}

const App: React.FC = () => {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [address, setAddress] = useState<string>("");
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const eth = (window as any).ethereum;
    if (eth) {
      try {
        setProvider(new BrowserProvider(eth));
      } catch (e) {
        console.error("Failed to initialize BrowserProvider:", e);
        setProvider(null);
      }
    } else {
      setProvider(null);
    }
  }, []);

  const connected = !!address && !!provider;

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const connectWallet = async () => {
    const ethereum = getInjectedProvider();
    if (!ethereum) {
      alert("No injected wallet found. Please install MetaMask.");
      return;
    }

    try {
      const currentChain: string = await ethereum.request({ method: "eth_chainId" });
      if (currentChain !== MOONBASE_PARAMS.chainId) {
        try {
          await ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: MOONBASE_PARAMS.chainId }],
          });
        } catch (e: any) {
          if (e?.code === 4902) {
            await ethereum.request({
              method: "wallet_addEthereumChain",
              params: [MOONBASE_PARAMS],
            });
          } else {
            throw e;
          }
        }
      }

      await ethereum.request({ method: "eth_requestAccounts" });

      const fresh = new BrowserProvider(ethereum);
      const signer = await fresh.getSigner();
      const addr = await signer.getAddress();
      setAddress(addr);
    } catch (err: any) {
      console.error(err);
      alert(err?.message ?? "Failed to connect wallet");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--card-bg)]/90 backdrop-blur-sm border-b border-[rgba(0,0,0,0.1)] shadow-lg">
        <div className="max-w-6xl mx-auto px-12 py-4 flex items-center justify-between">
          {/* Brand Section */}
          <Link to="/" className="flex items-center gap-3">
            
            <div>
              <div className="font-bold text-lg text-[var(--primary-green)] flex items-center gap-2">
                Green Credits
                <span className="polkadot-badge text-xs">Built on Moonbeam × Polkadot</span>
              </div>
              <div className="text-xs text-[var(--text-secondary)]">
                Rewarding Every Action That Heals the Planet
              </div>
            </div>
          </Link>
          {/* WalletConnect */}
          <WalletConnect provider={provider} address={address} setAddress={setAddress} />
        </div>

        {/* ✅ Use the dropdown-based Navbar */}
        <div className="max-w-6xl mx-auto px-12 pb-4">
          <Navbar
            provider={provider}
            address={address}
            setAddress={setAddress}
            connected={connected}
          />
        </div>
      </header>

      {/* Routes */}
      <main>
        <Routes>
          <Route
            path="/"
            element={
              <Home
                provider={provider}
                address={address}
                setAddress={setAddress}
                theme={theme}
                toggleTheme={toggleTheme}
                connectWallet={connectWallet}
              />
            }
          />
          <Route
            path="/dashboard"
            element={
              connected ? (
                <Dashboard provider={provider!} address={address} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/submit"
            element={
              connected ? <ActionForm provider={provider!} /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/actions"
            element={
              connected ? <ActionsList provider={provider!} /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/leaderboard"
            element={
              connected ? <Leaderboard provider={provider!} /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/donate"
            element={
              connected ? <Donate provider={provider!} /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/admin"
            element={
              connected ? <AdminVerify provider={provider!} /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/admin/registry"
            element={
              connected ? <AdminRegistry provider={provider!} /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/admin/reputation"
            element={
              connected ? (
                <AdminReputation provider={provider!} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/matching"
            element={
              connected ? <MatchingPool provider={provider!} /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/retirement"
            element={
              connected ? (
                <Retirement provider={provider!} address={address} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="footer text-center py-8">
        <p className="text-gray-600 mb-4">
          © 2024 Green Credits. Building a sustainable future on Moonbeam.
        </p>
        <div className="footer-links flex justify-center gap-6">
          <a
            href="https://moonbeam.network"
            target="_blank"
            rel="noopener noreferrer"
          >
            🌙 Moonbeam
          </a>
          <a
            href="https://polkadot.network"
            target="_blank"
            rel="noopener noreferrer"
          >
            🔗 Polkadot
          </a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">
            💻 GitHub
          </a>
          <a
            href="https://docs.moonbeam.network"
            target="_blank"
            rel="noopener noreferrer"
          >
            📚 Docs
          </a>
        </div>
      </footer>
    </div>
  );
};

export default App;
