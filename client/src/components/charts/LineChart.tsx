import {
  CartesianGrid,
  Line,
  LineChart as ReLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface LineChartProps<T extends object> {
  data: T[]
  xKey: keyof T
  yKey: keyof T
  color?: string
  height?: number
}

function LineChart<T extends object>({
  data,
  xKey,
  yKey,
  color = '#2563eb',
  height = 260,
}: LineChartProps<T>) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ReLineChart data={data}>
          <CartesianGrid strokeDasharray="4 4" stroke="rgba(148,163,184,0.25)" />
          <XAxis dataKey={String(xKey)} tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis tick={{ fill: '#64748b', fontSize: 12 }} width={70} />
          <Tooltip />
          <Line type="monotone" dataKey={String(yKey)} stroke={color} strokeWidth={2.5} dot={false} />
        </ReLineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default LineChart
