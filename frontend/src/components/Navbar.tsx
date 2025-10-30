import React, { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import WalletConnect from "./WalletConnect";

interface NavbarProps {
  provider: any;
  address: string;
  setAddress: (addr: string) => void;
  connected: boolean;
}

const navCategories = [
  {
    label: "Core Actions",
    items: [
      { to: "/dashboard", label: "Dashboard" },
      { to: "/submit", label: "Submit Action" },
      { to: "/actions", label: "Actions" },
    ],
  },
  {
    label: "Community & Impact",
    items: [
      { to: "/leaderboard", label: "Leaderboard" },
      { to: "/donate", label: "Donate" },
      { to: "/matching", label: "Matching" },
    ],
  },
  {
    label: "Admin",
    items: [
      { to: "/admin", label: "Admin" },
      { to: "/admin/registry", label: "Registry" },
      { to: "/admin/reputation", label: "Reputation" },
    ],
  },
];

const Navbar: React.FC<NavbarProps> = ({ provider, address, setAddress, connected }) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `nav-link ${isActive ? "text-green-400 font-semibold" : "text-slate-300 hover:text-green-300"}`;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (openDropdown && !dropdownRefs.current[openDropdown]?.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown]);

  // Accessibility keyboard support
  const handleKeyDown = (event: React.KeyboardEvent, label: string) => {
    if (["Enter", " "].includes(event.key)) {
      event.preventDefault();
      setOpenDropdown(openDropdown === label ? null : label);
    } else if (event.key === "Escape") {
      setOpenDropdown(null);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0D1117]/60 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Brand / Home */}
         

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 text-slate-300 hover:text-green-300 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle mobile menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              {mobileOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 text-sm">
            {/* Home */}
            <NavLink to="/" className={linkClass} end>
              Home
            </NavLink>

            {/* Dashboard (Standalone) */}
            <NavLink to="/dashboard" className={linkClass}>
              Dashboard
            </NavLink>

            {/* Dropdown Menus */}
            {navCategories.map((category) => (
              <div
                key={category.label}
                className="relative"
                ref={(el) => (dropdownRefs.current[category.label] = el)}
              >
                <button
                  className={`flex items-center gap-1 text-slate-300 hover:text-green-300 transition-colors ${
                    openDropdown === category.label ? "text-green-400" : ""
                  }`}
                  aria-haspopup="true"
                  aria-expanded={openDropdown === category.label}
                  onClick={() => setOpenDropdown(openDropdown === category.label ? null : category.label)}
                  onKeyDown={(e) => handleKeyDown(e, category.label)}
                >
                  {category.label}
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      openDropdown === category.label ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Panel */}
                {openDropdown === category.label && (
                  <div
                    className="absolute left-0 mt-2 w-48 bg-[#0D1117]/95 border border-white/10 rounded-lg shadow-lg backdrop-blur-md transition-all duration-200 ease-out opacity-100 scale-100 transform animate-slideDown z-50"
                  >
                    <div className="py-2">
                      {category.items.map((item) => (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          className={({ isActive }) =>
                            `block px-4 py-2 text-sm rounded-md transition-colors ${
                              isActive
                                ? "bg-green-500/20 text-green-400"
                                : "text-slate-300 hover:bg-white/10 hover:text-green-300"
                            }`
                          }
                          onClick={() => setOpenDropdown(null)}
                        >
                          {item.label}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Retirement (Standalone) */}
            <NavLink to="/retirement" className={linkClass}>
              Retirement
            </NavLink>
          </nav>


   
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-white/10 bg-[#0D1117]/95 backdrop-blur-md animate-fadeIn">
            <nav className="px-4 py-4 space-y-2">
              <NavLink to="/" className={linkClass} onClick={() => setMobileOpen(false)}>
                Home
              </NavLink>
              {navCategories.map((category) => (
                <details key={category.label} className="group">
                  <summary className="cursor-pointer py-2 flex justify-between items-center text-slate-300 hover:text-green-300">
                    {category.label}
                    <svg
                      className="w-4 h-4 group-open:rotate-180 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <ul className="ml-4 mt-2 space-y-1">
                    {category.items.map((item) => (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          className={({ isActive }) =>
                            `block py-1 text-sm ${
                              isActive ? "text-green-400" : "text-slate-300 hover:text-green-300"
                            }`
                          }
                          onClick={() => setMobileOpen(false)}
                        >
                          {item.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
              <NavLink to="/retirement" className={linkClass} onClick={() => setMobileOpen(false)}>
                Retirement
              </NavLink>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
