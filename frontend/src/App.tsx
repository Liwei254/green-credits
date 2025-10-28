import React, { useEffect, useState } from "react";
import { BrowserProvider } from "ethers";
import { Link, NavLink, Route, Routes, Navigate } from "react-router-dom";

import WalletConnect from "./components/WalletConnect";
import Dashboard from "./components/Dashboard";
import ActionForm from "./components/ActionForm";
import ActionsList from "./components/ActionsList";
import AdminVerify from "./components/AdminVerify";
import Donate from "./components/Donate";
import Leaderboard from "./components/Leaderboard";
import Home from "./pages/Home";

const MOONBASE_PARAMS = {
  chainId: "0x507", // 1287
  chainName: "Moonbase Alpha",
  nativeCurrency: { name: "Dev", symbol: "DEV", decimals: 18 },
  rpcUrls: ["https://rpc.api.moonbase.moonbeam.network"],
  blockExplorerUrls: ["https://moonbase.moonscan.io"]
};

// Prefer MetaMask if multiple providers are injected
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
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
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
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `nav-link ${isActive ? "active" : ""}`;

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const connectWallet = async () => {
    const ethereum = getInjectedProvider();
    if (!ethereum) {
      alert("No injected wallet found. Please install MetaMask.");
      return;
    }

    try {
      // 1) Ensure chain = Moonbase Alpha (1287)
      const currentChain: string = await ethereum.request({ method: "eth_chainId" });
      if (currentChain !== MOONBASE_PARAMS.chainId) {
        try {
          await ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: MOONBASE_PARAMS.chainId }]
          });
        } catch (e: any) {
          // Add chain if it doesn't exist
          if (e?.code === 4902) {
            await ethereum.request({
              method: "wallet_addEthereumChain",
              params: [MOONBASE_PARAMS]
            });
          } else {
            throw e;
          }
        }
      }

      // 2) Request accounts using the raw provider API
      await ethereum.request({ method: "eth_requestAccounts" });

      // 3) Create a fresh BrowserProvider AFTER chain switch + account request
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
      <header className="sticky top-0 z-50 bg-[var(--card-bg)]/90 backdrop-blur-sm border-b border-[rgba(0,0,0,0.1)] shadow-lg">
        <div className="max-w-6xl mx-auto px-12 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white font-bold text-lg shadow-lg">🌱</span>
            <div>
              <div className="font-bold text-lg text-[var(--primary-green)] flex items-center gap-2">
                Green Credits
                <span className="polkadot-badge text-xs">Built on Moonbeam × Polkadot</span>
              </div>
              <div className="text-xs text-[var(--text-secondary)]">Rewarding Every Action That Heals the Planet</div>
            </div>
          </Link>
          <WalletConnect provider={provider} address={address} setAddress={setAddress} />
        </div>
        <div className="max-w-6xl mx-auto px-12 pb-4">
          <nav className="flex items-center justify-center gap-2">
            <NavLink to="/" className={linkClass} end>Home</NavLink>
            <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
            <NavLink to="/submit" className={linkClass}>Submit Action</NavLink>
            <NavLink to="/actions" className={linkClass}>Actions</NavLink>
            <NavLink to="/leaderboard" className={linkClass}>Leaderboard</NavLink>
            <NavLink to="/donate" className={linkClass}>Donate</NavLink>
            <NavLink to="/admin" className={linkClass}>Admin</NavLink>
          </nav>
        </div>
      </header>

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
            element={connected ? <Dashboard provider={provider!} address={address} /> : <Navigate to="/" replace />}
          />
          <Route
            path="/submit"
            element={connected ? <ActionForm provider={provider!} /> : <Navigate to="/" replace />}
          />
          <Route
            path="/actions"
            element={connected ? <ActionsList provider={provider!} /> : <Navigate to="/" replace />}
          />
          <Route
            path="/leaderboard"
            element={connected ? <Leaderboard provider={provider!} /> : <Navigate to="/" replace />}
          />
          <Route
            path="/donate"
            element={connected ? <Donate provider={provider!} /> : <Navigate to="/" replace />}
          />
          <Route
            path="/admin"
            element={connected ? <AdminVerify provider={provider!} /> : <Navigate to="/" replace />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="footer">
        <p className="text-gray-600 mb-4">© 2024 Green Credits. Building a sustainable future on Moonbeam.</p>
        <div className="footer-links">
          <a href="https://moonbeam.network" target="_blank" rel="noopener noreferrer">🌙 Moonbeam</a>
          <a href="https://polkadot.network" target="_blank" rel="noopener noreferrer">🔗 Polkadot</a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">💻 GitHub</a>
          <a href="https://docs.moonbeam.network" target="_blank" rel="noopener noreferrer">📚 Docs</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
