import type { WatchlistItem } from '../../types/domain'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatPercent } from '../../utils/formatPercent'

interface StockRowProps {
  item: WatchlistItem
}

function StockRow({ item }: StockRowProps) {
  return (
    <tr className="border-b border-[var(--border)]/60 text-xs">
      <td className="py-2 font-medium">{item.company}</td>
      <td className="py-2">{item.symbol}</td>
      <td className="py-2 number-font">{formatCurrency(item.price)}</td>
      <td className={`py-2 ${item.changePercent >= 0 ? 'metric-positive' : 'metric-negative'}`}>
        {formatPercent(item.changePercent)}
      </td>
      <td className="py-2 number-font">{item.volume.toLocaleString('en-IN')}</td>
      <td className="py-2">{item.peRatio.toFixed(2)}</td>
      <td className="py-2">{formatCurrency(item.marketCap)}</td>
    </tr>
  )
}

export default StockRow
