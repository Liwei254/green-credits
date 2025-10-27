import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import WalletConnect from "./WalletConnect";

interface HeaderProps {
  provider: any;
  address: string;
  setAddress: (addr: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ provider, address, setAddress, theme, toggleTheme }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-md ${
      isActive
        ? "text-green-400 bg-green-400/10"
        : "text-gray-300 hover:text-green-400"
    }`;

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/submit", label: "Submit Action" },
    { to: "/actions", label: "Actions" },
    { to: "/leaderboard", label: "Leaderboard" },
    { to: "/donate", label: "Donate" },
    { to: "/admin", label: "Admin" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0D1117]/95 backdrop-blur-md border-b border-gray-800 shadow-md">
      {/* Top Row — Logo + Badge + Wallet + Mobile Toggle */}
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Brand Section */}
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white font-bold text-lg shadow-lg">
            🌱
          </span>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-green-400 tracking-tight">
                Green Credits
              </span>
              <span className="text-[10px] font-semibold text-white px-2 py-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 shadow-sm">
                BUILT ON MOONBEAM × POLKADOT
              </span>
            </div>
            <span className="text-xs text-gray-400">
              Rewarding Every Action That Heals the Planet
            </span>
          </div>
        </Link>

        {/* Desktop CTA + Theme Toggle */}
        <div className="hidden md:flex items-center gap-3">
          <WalletConnect provider={provider} address={address} setAddress={setAddress} />
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-300 hover:text-green-400 transition"
            title="Toggle theme"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-gray-300 hover:text-green-400 transition"
          aria-label="Toggle navigation"
        >
          {menuOpen ? "✖" : "☰"}
        </button>
      </div>

      {/* Desktop Nav */}
      <nav className="hidden md:flex justify-center items-center gap-5 px-6 py-3 border-t border-gray-800 bg-[#0D1117]/80">
        {navLinks.map((link) => (
          <NavLink key={link.to} to={link.to} className={linkClass} end={link.to === "/"}>
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Mobile Nav — collapsible */}
      <div
        className={`md:hidden bg-[#0D1117]/95 border-t border-gray-800 transition-all duration-300 overflow-hidden ${
          menuOpen ? "max-h-[500px] py-4" : "max-h-0"
        }`}
      >
        <nav className="flex flex-col items-center gap-3">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={linkClass}
              end={link.to === "/"}
            >
              {link.label}
            </NavLink>
          ))}

          {/* Wallet + Theme on Mobile */}
          <div className="mt-4 flex flex-col items-center gap-3">
            <WalletConnect provider={provider} address={address} setAddress={setAddress} />
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-300 hover:text-green-400 transition"
              title="Toggle theme"
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
