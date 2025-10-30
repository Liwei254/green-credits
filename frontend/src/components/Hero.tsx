type Props = {
  onGetStarted?: () => void;
};

export default function Hero({ onGetStarted }: Props) {
  return (
    <section className="relative w-full py-8 md:py-16">
      <div className="space-y-8 text-center">
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-6xl lg:text-7xl">
          <span className="mr-2">🌍</span>
          <span className="text-green-400">Green Credits</span> — Rewarding
          <br className="hidden md:block" /> Every Action That Heals the Planet
        </h1>
        <p className="mx-auto max-w-4xl text-base leading-relaxed text-[color:var(--text-secondary)] md:text-lg lg:text-xl px-4">
          Earn Green Credit Tokens (GCT) for real-world eco-actions verified on the Moonbeam blockchain.
          Join a transparent, community-driven platform that rewards environmental stewardship.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
          <button
            onClick={() => {
              if (onGetStarted) onGetStarted();
              else {
                // Fallback: dispatch a global event the Navbar listens for
                window.dispatchEvent(new Event("open-wallet-connect"));
                // As a soft fallback, try to focus the wallet area
                document.getElementById("wallet-connect")?.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            }}
            className="w-full sm:w-auto rounded-lg bg-[color:var(--cta)] px-8 py-4 text-lg font-semibold text-white transition-all duration-200 hover:bg-[color:var(--cta-hover)] hover:scale-105 hover:shadow-lg shadow-green-soft"
          >
            Get Started
          </button>
          <button
            onClick={() => {
              document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="w-full sm:w-auto rounded-lg border border-white/20 bg-white/5 px-8 py-4 text-lg font-semibold text-white transition-all duration-200 hover:bg-white/10 hover:border-white/30"
          >
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
}
