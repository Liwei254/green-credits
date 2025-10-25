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
    `px-3 py-2 rounded-md text-sm font-medium ${isActive ? "bg-gray-200" : "hover:bg-gray-100"}`;

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-green-500 text-white font-bold">G</span>
            <div>
              <div className="font-semibold">Green Credits</div>
              <div className="text-xs text-gray-500">Moonbeam x Polkadot</div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/" className={linkClass} end>Home</NavLink>
            <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
            <NavLink to="/submit" className={linkClass}>Submit</NavLink>
            <NavLink to="/actions" className={linkClass}>Actions</NavLink>
            <NavLink to="/leaderboard" className={linkClass}>Leaderboard</NavLink>
            <NavLink to="/donate" className={linkClass}>Donate</NavLink>
            <NavLink to="/admin" className={linkClass}>Admin</NavLink>
          </nav>
          <WalletConnect provider={provider} address={address} setAddress={setAddress} />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
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
                <p className="text-sm text-gray-600">Connect your wallet to start.</p>
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

      <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-500">
        Built for the Road to Sub0 Hackathon — Green, Transparent, On-chain.
      </footer>
    </div>
  );
};

export default App;