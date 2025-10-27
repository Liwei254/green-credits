type Props = {
  onGetStarted?: () => void;
};

export default function Hero({ onGetStarted }: Props) {
  return (
    <section className="relative mx-auto max-w-5xl px-4 pb-8 pt-14 md:pt-20">
      <div className="space-y-6 text-center">
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
          <span className="mr-2">🌍</span>
          <span className="text-green-400">Green Credits</span> — Rewarding
          <br className="hidden md:block" /> Every Action That Heals the Planet
        </h1>
        <p className="mx-auto max-w-3xl text-base leading-relaxed text-[color:var(--text-secondary)] md:text-lg">
          Earn Green Credit Tokens (GCT) for real-world eco-actions verified on the Moonbeam.
        </p>
        <div className="flex justify-center">
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
            className="rounded-md bg-[color:var(--cta)] px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-[color:var(--cta-hover)]"
          >
            Get Started
          </button>
        </div>
      </div>
    </section>
  );
}