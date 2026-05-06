// /components/charts/TradingViewChart.tsx
// Lightweight chart component using recharts (already installed)
// This replaces the previous version that depended on the uninstalled lightweight-charts package.

import React, { useState } from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { BarChart3, LineChart, AreaChart as AreaChartIcon, Maximize2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChartProps {
  data: {
    timestamp: number
    open: number
    high: number
    low: number
    close: number
    volume: number
  }[]
  symbol: string
}

export function TradingViewChart({ data, symbol }: ChartProps) {
  const [chartType, setChartType] = useState<'candlestick' | 'line' | 'area'>('line')

  const chartData = data.map((d) => ({
    date: new Date(d.timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    close: d.close,
    open: d.open,
    high: d.high,
    low: d.low,
    volume: d.volume,
  }))

  return (
    <div className="relative group glass rounded-3xl p-6 border border-white/5">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-bold">{symbol}</h3>
          <div className="flex bg-white/5 p-1 rounded-xl gap-1">
            <button
              onClick={() => setChartType('candlestick')}
              className={cn(
                'p-1.5 rounded-lg transition-all',
                chartType === 'candlestick' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-300',
              )}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('line')}
              className={cn(
                'p-1.5 rounded-lg transition-all',
                chartType === 'line' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-300',
              )}
            >
              <LineChart className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('area')}
              className={cn(
                'p-1.5 rounded-lg transition-all',
                chartType === 'area' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-300',
              )}
            >
              <AreaChartIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <Maximize2 className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="h-[500px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <CartesianGrid stroke="rgba(30,30,46,0.5)" />
            <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} />
            <YAxis domain={['auto', 'auto']} tick={{ fill: '#6b7280', fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                background: '#111118',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#fff',
              }}
            />
            {chartType === 'area' ? (
              <Area
                type="monotone"
                dataKey="close"
                stroke="#6366f1"
                fill="rgba(99,102,241,0.15)"
                strokeWidth={2}
              />
            ) : chartType === 'candlestick' ? (
              <>
                <Bar dataKey="volume" fill="rgba(99,102,241,0.15)" yAxisId="volume" />
                <Line type="monotone" dataKey="close" stroke="#6366f1" dot={false} strokeWidth={2} />
              </>
            ) : (
              <Line type="monotone" dataKey="close" stroke="#6366f1" dot={false} strokeWidth={2} />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
