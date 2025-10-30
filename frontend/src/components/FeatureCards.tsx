import React from "react";
import { Link } from "react-router-dom";

const items = [
  {
    icon: "🪙",
    title: "Earn Tokens",
    desc: "Get rewarded for your positive environmental impact with Moonbeam‑Verified GCT tokens.",
    link: "/submit",
    buttonText: "Submit Action",
  },
  {
    icon: "🌿",
    title: "Build Trust",
    desc: "Transparent on‑chain verification ensures every action is authentic and traceable.",
    link: "/actions",
    buttonText: "View Actions",
  },
  {
    icon: "🤝",
    title: "Join the Community",
    desc: "Connect with like‑minded individuals making a difference for our planet.",
    link: "/leaderboard",
    buttonText: "View Leaderboard",
  },
];

export default function FeatureCards() {
  return (
    <section id="features" className="w-full py-8 md:py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          How It Works
        </h2>
        <p className="text-lg text-[color:var(--text-secondary)] max-w-2xl mx-auto px-4">
          Three simple steps to start making a difference and earning rewards
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3 px-4">
        {items.map((it, index) => (
          <div
            key={it.title}
            className="glass hover-scale rounded-xl p-8 text-center text-slate-300 shadow-green-soft transition-all duration-300 hover:shadow-2xl"
          >
            <div className="relative mb-6">
              <div className="text-6xl mb-4">{it.icon}</div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {index + 1}
              </div>
            </div>
            <div className="mb-3 text-xl font-semibold text-white">{it.title}</div>
            <p className="text-base leading-relaxed text-slate-400 mb-6">{it.desc}</p>
            <Link
              to={it.link}
              className="inline-block w-full btn btn-primary text-base py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105"
            >
              {it.buttonText}
            </Link>
          </div>
        ))}
      </div>

      <div className="text-center mt-16 px-4">
        <div className="glass rounded-xl p-8 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-4">Ready to Make a Difference?</h3>
          <p className="text-lg text-[color:var(--text-secondary)] mb-6">
            Join thousands of environmental stewards already earning rewards for their positive impact.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/submit"
              className="btn btn-primary text-lg py-4 px-8 rounded-lg transition-all duration-200 hover:scale-105"
            >
              Start Earning Today
            </Link>
            <Link
              to="/leaderboard"
              className="border border-white/20 bg-white/5 text-white text-lg py-4 px-8 rounded-lg transition-all duration-200 hover:bg-white/10 hover:border-white/30"
            >
              View Leaderboard
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
