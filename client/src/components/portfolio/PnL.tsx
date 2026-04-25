import { formatCurrency } from '../../utils/formatCurrency'
import { formatPercent } from '../../utils/formatPercent'

interface PnLProps {
  invested: number
  currentValue: number
}

function PnL({ invested, currentValue }: PnLProps) {
  const pnl = currentValue - invested
  const pnlPercent = invested ? (pnl / invested) * 100 : 0

  return (
    <div className="card-shell p-4">
      <h3 className="text-sm font-semibold">P&L Snapshot</h3>
      <p className={`number-font mt-2 text-xl font-semibold ${pnl >= 0 ? 'metric-positive' : 'metric-negative'}`}>
        {formatCurrency(pnl)} ({formatPercent(pnlPercent)})
      </p>
    </div>
  )
}

export default PnL
