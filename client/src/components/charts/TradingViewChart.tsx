'use client';

import React, { useEffect, useRef, useState } from 'react';
import { 
  createChart, 
  ColorType, 
  IChartApi, 
  ISeriesApi, 
  CandlestickData, 
  LineData,
  UTCTimestamp
} from 'lightweight-charts';
import { Maximize2, Settings2, BarChart3, LineChart, AreaChart as AreaChartIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChartProps {
  data: {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
  symbol: string;
}

export function TradingViewChart({ data, symbol }: ChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  
  const [chartType, setChartType] = useState<'candlestick' | 'line' | 'area'>('candlestick');
  const [showSMA20, setShowSMA20] = useState(false);
  const [showSMA50, setShowSMA50] = useState(false);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0a0a0f' },
        textColor: '#6b7280',
      },
      grid: {
        vertLines: { color: 'rgba(30, 30, 46, 0.5)' },
        horzLines: { color: 'rgba(30, 30, 46, 0.5)' },
      },
      crosshair: {
        mode: 0,
        vertLine: {
          labelBackgroundColor: '#6366f1',
        },
        horzLine: {
          labelBackgroundColor: '#6366f1',
        },
      },
      timeScale: {
        borderColor: '#1e1e2e',
        timeVisible: true,
      },
      rightPriceScale: {
        borderColor: '#1e1e2e',
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    });

    chartRef.current = chart;

    let mainSeries: ISeriesApi<'Candlestick'> | ISeriesApi<'Line'> | ISeriesApi<'Area'>;
    
    if (chartType === 'line') {
      mainSeries = chart.addLineSeries({ color: '#6366f1', lineWidth: 2 });
      mainSeries.setData(data.map(d => ({ time: (d.timestamp / 1000) as UTCTimestamp, value: d.close })));
    } else if (chartType === 'area') {
      mainSeries = chart.addAreaSeries({ 
        lineColor: '#6366f1', 
        topColor: 'rgba(99, 102, 241, 0.4)', 
        bottomColor: 'rgba(99, 102, 241, 0.0)' 
      });
      mainSeries.setData(data.map(d => ({ time: (d.timestamp / 1000) as UTCTimestamp, value: d.close })));
    } else {
      mainSeries = chart.addCandlestickSeries({
        upColor: '#22c55e',
        downColor: '#ef4444',
        borderVisible: false,
        wickUpColor: '#22c55e',
        wickDownColor: '#ef4444',
      });
      mainSeries.setData(data.map((d) => ({
        time: (d.timestamp / 1000) as UTCTimestamp,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      })).filter(d => d.open != null));
    }

    const volumeSeries = chart.addHistogramSeries({
      color: '#1e1e2e',
      priceFormat: { type: 'volume' },
      priceScaleId: '', 
    });
    volumeSeries.priceScale().applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
    
    volumeSeries.setData(data.map((d) => ({
      time: (d.timestamp / 1000) as UTCTimestamp,
      value: d.volume,
      color: d.close >= d.open ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)',
    })).filter(d => d.value != null));

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data]);

  return (
    <div className="relative group glass rounded-3xl p-6 border border-white/5">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-bold">{symbol}</h3>
          <div className="flex bg-white/5 p-1 rounded-xl gap-1">
            <button 
              onClick={() => setChartType('candlestick')}
              className={cn("p-1.5 rounded-lg transition-all", chartType === 'candlestick' ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-300")}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setChartType('line')}
              className={cn("p-1.5 rounded-lg transition-all", chartType === 'line' ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-300")}
            >
              <LineChart className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setChartType('area')}
              className={cn("p-1.5 rounded-lg transition-all", chartType === 'area' ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-300")}
            >
              <AreaChartIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Indicators</label>
            <button 
              onClick={() => setShowSMA20(!showSMA20)}
              className={cn("px-2 py-1 rounded text-[10px] font-bold border transition-all", showSMA20 ? "bg-yellow-500/10 border-yellow-500/50 text-yellow-500" : "bg-white/5 border-white/10 text-gray-500")}
            >
              SMA 20
            </button>
            <button 
              onClick={() => setShowSMA50(!showSMA50)}
              className={cn("px-2 py-1 rounded text-[10px] font-bold border transition-all", showSMA50 ? "bg-blue-500/10 border-blue-500/50 text-blue-500" : "bg-white/5 border-white/10 text-gray-500")}
            >
              SMA 50
            </button>
          </div>
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <Maximize2 className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      <div ref={chartContainerRef} className="h-[500px] w-full" />
    </div>
  );
}
