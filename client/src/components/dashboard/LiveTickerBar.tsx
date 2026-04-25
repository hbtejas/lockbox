import { motion } from 'framer-motion'
import { useAllLivePrices } from '../../hooks/useLivePrice'

export function LiveTickerBar() {
  const prices = useAllLivePrices()
  const priceList = Object.values(prices)

  if (priceList.length === 0) return null

  return (
    <div className="bg-slate-900 text-white overflow-hidden whitespace-nowrap py-1.5 border-b border-slate-800">
      <motion.div
        animate={{ x: [0, -1000] }}
        transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
        className="inline-block"
      >
        {[...priceList, ...priceList].map((p, idx) => (
          <span key={`${p.symbol}-${idx}`} className="mx-6 inline-flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-wider">{p.symbol}</span>
            <span className="number-font text-[11px]">₹{p.price.toLocaleString('en-IN')}</span>
            <span className={`text-[10px] font-bold ${p.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {p.changePercent > 0 ? '+' : ''}{p.changePercent.toFixed(2)}%
            </span>
          </span>
        ))}
      </motion.div>
    </div>
  )
}
