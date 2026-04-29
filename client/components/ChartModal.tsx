// /components/ChartModal.tsx
'use client'

import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts';
import { X, Star, Bell, Share2, Maximize2, Activity, Info, BarChart4, TrendingUp } from 'lucide-react';
import { useMarketStore } from '@/store/marketStore';
import { useChartData } from '@/hooks/useChartData';
import { cn } from '@/lib/utils';
import type { TimeRange, ChartType } from '@/types';
import { formatPrice, getChangeColor } from '@/lib/marketUtils';
import { Badge, PercentageBadge } from './ui/Badge';
import { LoadingSpinner } from './ui/LoadingSpinner';

export function ChartModal() {
  const { selectedStock, closeChart, watchlist, addToWatchlist, removeFromWatchlist, theme } = useMarketStore();
  const [range, setRange] = useState<TimeRange>('1d');
  const [chartType, setChartType] = useState<ChartType>('candlestick');
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<any>(null);
  const volumeSeriesRef = useRef<any>(null);

  const { data, isLoading } = useChartData(selectedStock?.symbol, range);

  useEffect(() => {
    if (!chartContainerRef.current || !data) return;

    const isDark = theme === 'dark';
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: isDark ? '#9ca3af' : '#4b5563',
      },
      grid: {
        vertLines: { color: isDark ? '#1e1e2e' : '#f3f4f6' },
        horzLines: { color: isDark ? '#1e1e2e' : '#f3f4f6' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
      crosshair: {
        mode: 0,
        vertLine: { labelBackgroundColor: '#6366f1' },
        horzLine: { labelBackgroundColor: '#6366f1' },
      },
    });

    chartRef.current = chart;

    if (chartType === 'candlestick') {
      seriesRef.current = chart.addCandlestickSeries({
        upColor: '#22c55e',
        downColor: '#ef4444',
        borderVisible: false,
        wickUpColor: '#22c55e',
        wickDownColor: '#ef4444',
      });
    } else if (chartType === 'area') {
      seriesRef.current = chart.addAreaSeries({
        lineColor: '#6366f1',
        topColor: '#6366f133',
        bottomColor: '#6366f100',
        lineWidth: 3,
      });
    } else {
      seriesRef.current = chart.addLineSeries({
        color: '#6366f1',
        lineWidth: 3,
      });
    }

    volumeSeriesRef.current = chart.addHistogramSeries({
      color: '#6366f133',
      priceFormat: { type: 'volume' },
      priceScaleId: '', // overlay
    });

    volumeSeriesRef.current.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    const formattedData = data.map(d => ({
      time: d.timestamp / 1000,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
      value: d.close, // for line/area
    }));

    const volumeData = data.map(d => ({
      time: d.timestamp / 1000,
      value: d.volume,
      color: d.close >= d.open ? '#22c55e33' : '#ef444433',
    }));

    seriesRef.current.setData(formattedData);
    volumeSeriesRef.current.setData(volumeData);

    chart.timeScale().fitContent();

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
  }, [data, chartType, theme]);

  if (!selectedStock) return null;

  const isWatchlisted = watchlist.includes(selectedStock.symbol);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 lg:p-12">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={closeChart} />
      
      <div className="relative w-full max-w-6xl h-full max-h-[90vh] glass rounded-[48px] border-border shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="p-8 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-accent/10 rounded-3xl flex items-center justify-center">
              <BarChart4 className="w-8 h-8 text-accent" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-black tracking-tighter">{selectedStock.symbol.split('.')[0]}</h2>
                <button 
                  onClick={() => isWatchlisted ? removeFromWatchlist(selectedStock.symbol) : addToWatchlist(selectedStock.symbol)}
                  className={cn("transition-all", isWatchlisted ? "text-yellow-500 scale-110" : "text-muted hover:text-white")}
                >
                  <Star className={cn("w-5 h-5", isWatchlisted && "fill-current")} />
                </button>
              </div>
              <p className="text-xs font-black text-muted uppercase tracking-[0.2em]">{selectedStock.shortName}</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black number-font">{formatPrice(selectedStock.regularMarketPrice)}</span>
              <PercentageBadge value={selectedStock.regularMarketChangePercent} className="text-sm py-1" />
            </div>
            <div className="flex gap-2">
              <button className="p-3 bg-white/5 rounded-2xl text-muted hover:text-white transition-all"><Bell className="w-4 h-4" /></button>
              <button className="p-3 bg-white/5 rounded-2xl text-muted hover:text-white transition-all"><Share2 className="w-4 h-4" /></button>
              <button className="p-3 bg-accent/10 text-accent rounded-2xl hover:bg-accent hover:text-white transition-all" onClick={closeChart}><X className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-8 py-4 bg-white/[0.01] border-b border-border flex items-center justify-between">
          <div className="flex bg-base p-1 rounded-2xl border border-border">
            {(['1d', '5d', '1mo', '3mo', '6mo', '1y', '5y', 'max'] as TimeRange[]).map((t) => (
              <button
                key={t}
                onClick={() => setRange(t)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  range === t ? "bg-accent text-white shadow-lg" : "text-muted hover:text-white"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {(['candlestick', 'line', 'area'] as ChartType[]).map((t) => (
              <button
                key={t}
                onClick={() => setChartType(t)}
                className={cn(
                  "p-2.5 rounded-xl border border-border transition-all",
                  chartType === t ? "bg-accent border-accent text-white" : "bg-base text-muted hover:text-white"
                )}
              >
                <Activity className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Chart Area */}
        <div className="flex-1 relative p-8">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-base/50 backdrop-blur-sm">
              <LoadingSpinner size="lg" />
            </div>
          )}
          <div ref={chartContainerRef} className="w-full h-full" />
        </div>

        {/* Key Stats */}
        <div className="px-8 py-6 bg-base border-t border-border grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8">
          <Stat label="Day High" value={formatPrice(selectedStock.regularMarketDayHigh)} />
          <Stat label="Day Low" value={formatPrice(selectedStock.regularMarketDayLow)} />
          <Stat label="52W High" value={formatPrice(selectedStock.fiftyTwoWeekHigh)} />
          <Stat label="52W Low" value={formatPrice(selectedStock.fiftyTwoWeekLow)} />
          <Stat label="Volume" value={selectedStock.regularMarketVolume.toLocaleString()} />
          <Stat label="Market Cap" value={formatPrice(selectedStock.marketCap / 10000000) + ' Cr'} />
          <Stat label="P/E Ratio" value={selectedStock.trailingPE?.toFixed(2) || '—'} />
          <Stat label="Prev Close" value={formatPrice(selectedStock.regularMarketPreviousClose)} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[9px] font-black text-muted uppercase tracking-widest">{label}</p>
      <p className="text-xs font-black number-font">{value}</p>
    </div>
  );
}
