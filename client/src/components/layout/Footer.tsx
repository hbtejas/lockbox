function Footer() {
  return (
    <footer className="mt-20 border-t border-[var(--border)] glass-panel border-r-0 border-l-0 border-b-0">
      <div className="mx-auto max-w-[1200px] px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          
          <div className="flex flex-col items-start justify-start">
            <span className="text-xl font-bold tracking-[0.2em] text-[var(--text)] uppercase inline-block border-b-4 border-yellow-400 pb-1">
              Lockbox
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-800 dark:text-slate-200 mb-2">Tracking Tools</h4>
            <a href="/timeline" className="text-[10px] sm:text-xs text-slate-500 hover:text-slate-900 transition-colors">Timeline</a>
            <a href="/portfolio" className="text-[10px] sm:text-xs text-slate-500 hover:text-slate-900 transition-colors">Portfolio</a>
            <a href="/watchlist" className="text-[10px] sm:text-xs text-slate-500 hover:text-slate-900 transition-colors">Watchlist</a>
            <a href="/alerts" className="text-[10px] sm:text-xs text-slate-500 hover:text-slate-900 transition-colors">Alerts</a>
            <a href="/results" className="text-[10px] sm:text-xs text-slate-500 hover:text-slate-900 transition-colors">Results</a>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-800 dark:text-slate-200 mb-2">Research Tools</h4>
            <a href="/dashboard" className="text-[10px] sm:text-xs text-slate-500 hover:text-slate-900 transition-colors">Ideas Dashboard</a>
            <a href="/screener" className="text-[10px] sm:text-xs text-slate-500 hover:text-slate-900 transition-colors">Company Search</a>
            <a href="#" className="text-[10px] sm:text-xs text-slate-500 hover:text-slate-900 transition-colors">Sector Search</a>
            <a href="/screener" className="text-[10px] sm:text-xs text-slate-500 hover:text-slate-900 transition-colors">Stock Screener</a>
            <a href="/market-monitor" className="text-[10px] sm:text-xs text-slate-500 hover:text-slate-900 transition-colors">Market Monitor</a>
            <a href="#" className="text-[10px] sm:text-xs text-slate-500 hover:text-slate-900 transition-colors">Macro Indicators</a>
            <a href="#" className="text-[10px] sm:text-xs text-slate-500 hover:text-slate-900 transition-colors">Raw Materials</a>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-800 dark:text-slate-200 mb-2">Policies</h4>
            <a href="#" className="text-[10px] sm:text-xs text-slate-500 hover:text-slate-900 transition-colors">Privacy Policy</a>
            <a href="#" className="text-[10px] sm:text-xs text-slate-500 hover:text-slate-900 transition-colors">Terms of Use</a>
            <a href="#" className="text-[10px] sm:text-xs text-slate-500 hover:text-slate-900 transition-colors">Cancellation Policy</a>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-800 dark:text-slate-200 mb-2">About</h4>
            <a href="#" className="text-[10px] sm:text-xs text-slate-500 hover:text-slate-900 transition-colors">Features</a>
            <a href="#" className="text-[10px] sm:text-xs text-slate-500 hover:text-slate-900 transition-colors">What's New</a>
            <a href="/pricing" className="text-[10px] sm:text-xs text-slate-500 hover:text-slate-900 transition-colors">Pricing</a>
          </div>

        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 py-4 px-4 sm:px-8">
        <div className="mx-auto flex max-w-[1200px] flex-col justify-between items-center text-[10px] text-slate-400 sm:flex-row gap-4">
          <p>© 2026 Lockbox Financial Services Private Limited | All rights reserved <br/><span className="text-[8px]">(formerly known as Lockbox Advisory Services Private Limited)</span></p>
          <div className="flex items-center gap-4">
            <span className="font-bold tracking-widest uppercase text-[10px] text-slate-600">Connect with us</span>
            <div className="w-px h-3 bg-slate-300"></div>
            <a href="#" className="hover:text-slate-900">X</a>
            <a href="#" className="hover:text-slate-900">in</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
