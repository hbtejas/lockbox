import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import LineChart from '../components/charts/LineChart'
import SectorTable from '../components/market/SectorTable'
import { fetchHeatmap, fetchMarketIndices } from '../api/stockApi'

function SectorPage() {
  const { name = 'energy' } = useParams()

  const heatmapQuery = useQuery({
    queryKey: ['market-heatmap'],
    queryFn: fetchHeatmap,
  })

  const indicesQuery = useQuery({
    queryKey: ['market-indices'],
    queryFn: fetchMarketIndices,
  })

  const companies = useMemo(
    () =>
      (heatmapQuery.data ?? [])
        .filter((company) => company.sector.toLowerCase().includes(name.toLowerCase()))
        .sort((a, b) => b.marketCap - a.marketCap),
    [heatmapQuery.data, name],
  )

  const index =
    (indicesQuery.data ?? []).find((item) => item.sector.toLowerCase().includes(name.toLowerCase())) ??
    (indicesQuery.data ?? [])[0]

  const sectorTrend = useMemo(
    () =>
      companies.slice(0, 10).map((company, indexPosition) => ({
        label: `S${indexPosition + 1}`,
        value: company.changePercent,
      })),
    [companies],
  )

  return (
    <div className="space-y-4">
      <section className="card-shell p-4">
        <p className="text-xs uppercase tracking-wide text-brand-500">Sector Research</p>
        <h1 className="mt-2 text-2xl font-bold capitalize">{name} Sector</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Explore key players, market structure, and trend-driven metrics for the {name} universe.
        </p>
        {index && (
          <p className="mt-3 text-sm">
            Custom index: <span className="font-semibold">{index.indexName}</span> ({index.oneYear.toFixed(1)}% 1Y return)
          </p>
        )}
      </section>

      <section className="card-shell p-4">
        <h3 className="mb-3 text-sm font-semibold">Sector Momentum Snapshot</h3>
        <LineChart data={sectorTrend} xKey="label" yKey="value" color="#0ea5e9" />
      </section>

      <SectorTable companies={companies} />

      {!heatmapQuery.isLoading && companies.length === 0 && (
        <section className="card-shell p-4 text-sm text-[var(--text-muted)]">No companies found for this sector.</section>
      )}
    </div>
  )
}

export default SectorPage
