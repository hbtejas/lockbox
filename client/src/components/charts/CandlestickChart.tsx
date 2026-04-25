import {
  Bar,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface CandlePoint {
  date: string
  open: number
  high: number
  low: number
  close: number
}

interface CandlestickChartProps {
  data: CandlePoint[]
  height?: number
}

function CandlestickChart({ data, height = 300 }: CandlestickChartProps) {
  const transformed = data.map((point) => ({
    ...point,
    bodyTop: Math.max(point.open, point.close),
    bodyBottom: Math.min(point.open, point.close),
    bodyHeight: Math.abs(point.open - point.close),
  }))

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={transformed}>
          <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis tick={{ fill: '#64748b', fontSize: 12 }} width={70} />
          <Tooltip />
          <Bar dataKey="high" stackId="wicks" fill="transparent" />
          <Bar dataKey="bodyHeight" stackId="body" fill="#2563eb" radius={[2, 2, 2, 2]} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

export default CandlestickChart
