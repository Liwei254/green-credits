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

const App: React.FC = () => {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [address, setAddress] = useState<string>("");
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

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

  return (
    <div className="min-h-screen relative">
      {/* Floating leaves animation */}
      <div className="floating-leaves">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="leaf">🌿</div>
        ))}
      </div>

      {/* Theme toggle */}
      <button onClick={toggleTheme} className="theme-toggle">
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white font-bold text-lg shadow-lg">🌱</span>
            <div>
              <div className="font-bold text-lg text-green-600 flex items-center gap-2">
                Green Credits
                <span className="polkadot-badge text-xs">Built on Moonbeam × Polkadot</span>
              </div>
              <div className="text-xs text-gray-500">Rewarding Every Action That Heals the Planet</div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-2">
            <NavLink to="/" className={linkClass} end>Home</NavLink>
            <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
            <NavLink to="/submit" className={linkClass}>Submit Action</NavLink>
            <NavLink to="/actions" className={linkClass}>Actions</NavLink>
            <NavLink to="/leaderboard" className={linkClass}>Leaderboard</NavLink>
            <NavLink to="/donate" className={linkClass}>Donate</NavLink>
            <NavLink to="/admin" className={linkClass}>Admin</NavLink>
          </nav>
          <WalletConnect provider={provider} address={address} setAddress={setAddress} />
        </div>
        {/* Mobile navigation */}
        <div className="md:hidden border-t border-gray-200">
          <nav className="flex items-center justify-around py-2">
            <NavLink to="/" className={linkClass} end>Home</NavLink>
            <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
            <NavLink to="/submit" className={linkClass}>Submit</NavLink>
            <NavLink to="/actions" className={linkClass}>Actions</NavLink>
            <NavLink to="/leaderboard" className={linkClass}>Leaderboard</NavLink>
            <NavLink to="/donate" className={linkClass}>Donate</NavLink>
            <NavLink to="/admin" className={linkClass}>Admin</NavLink>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6 relative z-10">
        <Routes>
          <Route
            path="/"
            element={
              connected ? (
                <div className="grid lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 space-y-4">
                    <ActionForm provider={provider!} />
                    <ActionsList provider={provider!} />
                  </div>
                  <div className="space-y-4">
                    <Leaderboard provider={provider!} />
                    <AdminVerify provider={provider!} />
                  </div>
                </div>
              ) : (
                <div className="hero">
                  <h1>🌍 Green Credits — Rewarding Every Action That Heals the Planet</h1>
                  <p>Earn Green Credit Tokens (GCT) for real-world eco-actions verified on the Moonbeam parachain.</p>
                  <div className="cta" onClick={() => document.querySelector('button')?.click()}>
                    Get Started
                  </div>
                  <div className="mission-cards">
                    <div className="mission-card">
                      <h3>🪙 Earn Tokens</h3>
                      <p>Get rewarded for your positive environmental impact with blockchain-verified GCT tokens.</p>
                    </div>
                    <div className="mission-card">
                      <h3>🌱 Build Trust</h3>
                      <p>Transparent on-chain verification ensures every action is authentic and traceable.</p>
                    </div>
                    <div className="mission-card">
                      <h3>🤝 Join the Community</h3>
                      <p>Connect with like-minded individuals making a difference for our planet.</p>
                    </div>
                  </div>
                </div>
              )
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