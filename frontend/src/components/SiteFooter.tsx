export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#0D1117]/60">
      <div className="mx-auto max-w-7xl px-4">
        <div className="py-8 text-center text-sm text-slate-400">
          <div className="mb-3">
            © {new Date().getFullYear()} <span className="text-green-400">Green Credits</span> — Building a sustainable, transparent future on Moonbeam.
          </div>
          <div className="flex items-center justify-center gap-5 text-slate-300">
            <a className="hover:text-white" href="https://moonbeam.network/" target="_blank" rel="noreferrer">🌙 Moonbeam</a>
            <a className="hover:text-white" href="https://github.com/Liwei254/green-credits" target="_blank" rel="noreferrer">📦 Github</a>
            <a className="hover:text-white" href="https://github.com/Liwei254/green-credits#readme" target="_blank" rel="noreferrer">📘 Docs</a>
          </div>
        </div>
      </div>
    </footer>
  );
}