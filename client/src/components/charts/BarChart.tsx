import {
  Bar,
  BarChart as ReBarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface BarChartProps<T extends object> {
  data: T[]
  xKey: keyof T
  yKey: keyof T
  height?: number
  color?: string
}

function BarChart<T extends object>({
  data,
  xKey,
  yKey,
  height = 250,
  color = '#0ea5e9',
}: BarChartProps<T>) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ReBarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
          <XAxis dataKey={String(xKey)} tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis tick={{ fill: '#64748b', fontSize: 12 }} width={70} />
          <Tooltip />
          <Bar dataKey={String(yKey)} fill={color} radius={[6, 6, 0, 0]} />
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default BarChart
