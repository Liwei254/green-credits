import { useEffect, useRef } from "react";
import WalletConnect from "./WalletConnect";

const links = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/submit", label: "Submit Action" },
  { to: "/actions", label: "Actions" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/donate", label: "Donate" },
  { to: "/admin", label: "Admin" },
];

export default function Navbar() {
  // Provide a way for other components to programmatically trigger connect
  const connectBtnRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    const handler = () => connectBtnRef.current?.click();
    window.addEventListener("open-wallet-connect", handler as any);
    return () => window.removeEventListener("open-wallet-connect", handler as any);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0D1117]/60 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left: brand */}
          <a href="/" className="flex items-center gap-2">
            <span className="inline-block h-5 w-5 rounded-full brand-gradient" />
            <span className="text-lg font-semibold tracking-tight text-green-400">Green Credits</span>
          </a>

          {/* Center: nav (desktop) */}
          <nav className="absolute left-1/2 hidden -translate-x-1/2 lg:block">
            <ul className="flex items-center gap-8 text-sm text-slate-300">
              {links.map((l) => (
                <li key={l.to}>
                  <a className="nav-link" href={l.to}>{l.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right: actions */}
          <div className="flex items-center gap-3">
            {/* Moonbeam × Polkadot badge (small screens shows inline with brand) */}
            <span className="polkadot-badge">
              Built on Moonbeam × Polkadot
            </span>

            {/* Theme toggle (simple) */}
            <button
              aria-label="Toggle theme"
              className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-slate-300 hover:text-white"
              onClick={() => {
                document.documentElement.classList.toggle("light");
              }}
              title="Toggle theme"
            >
              ◐
            </button>

            {/* Wallet connect */}
            <div id="wallet-connect">
              {/* If your WalletConnect component renders its own button, you can ignore this ref. */}
              <div className="[&>button]:!bg-emerald-600 [&>button]:hover:!bg-emerald-700 [&>button]:!text-white">
                <WalletConnect provider={null} address="" setAddress={() => {}} ref={connectBtnRef as any} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}