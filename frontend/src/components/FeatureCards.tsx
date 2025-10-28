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
    <section className="mx-auto max-w-6xl px-4 pb-16 pt-6 md:pb-24">
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((it) => (
          <div
            key={it.title}
            className="glass hover-scale rounded-xl p-6 text-slate-300 shadow-green-soft"
          >
            <div className="mb-2 text-xl">{it.icon}</div>
            <div className="mb-1 text-lg font-semibold text-white">{it.title}</div>
            <p className="text-sm leading-relaxed text-slate-400 mb-4">{it.desc}</p>
            <Link to={it.link} className="btn btn-primary text-sm">
              {it.buttonText}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
