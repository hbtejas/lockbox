import React from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, ShieldCheck, Zap } from 'lucide-react'
import { formatPercent } from '../../utils/formatPercent'

const picks = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', score: 9, reason: 'Strong Cash Flows', growth: 12.5, type: 'Blue Chip' },
  { symbol: 'TCS', name: 'Tata Consultancy', score: 8, reason: 'High ROCE (40%)', growth: 8.2, type: 'Consistent' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', score: 9, reason: 'Low NPAs', growth: 18.4, type: 'Growth' },
  { symbol: 'INFY', name: 'Infosys', score: 7, reason: 'Digital Growth', growth: 10.1, type: 'Tech' },
]

const TopPicksGrid = () => {
  const navigate = useNavigate()

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <Zap size={16} className="text-amber-500 fill-amber-500" />
          High Conviction Ideas
        </h3>
        <button 
          onClick={() => navigate('/screener')}
          className="text-xs font-semibold text-brand-600 hover:underline"
        >
          View All
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {picks.map((pick) => (
          <div 
            key={pick.symbol}
            onClick={() => navigate(`/company/${pick.symbol}`)}
            className="card-shell p-4 cursor-pointer hover:border-brand-300 transition-all group"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{pick.type}</p>
                <h4 className="text-sm font-bold mt-1 group-hover:text-brand-600 transition-colors">{pick.symbol}</h4>
              </div>
              <span className="flex items-center justify-center w-6 h-6 rounded bg-emerald-500 text-white text-[11px] font-bold">
                {pick.score}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 italic">"{pick.reason}"</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400">Proj. Growth</span>
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp size={10} />
                {formatPercent(pick.growth, true)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default TopPicksGrid
