import { useState } from 'react'
import type { IdeaRow } from '../../types/domain'
import Tabs from '../ui/Tabs'
import IdeaCard from './IdeaCard'

interface IdeaDashboardProps {
  items: IdeaRow[]
}

const tabs = [
  'Promoter Buying',
  'Whales Buying',
  'Merger & Acquisitions',
  'Capex Plans',
  'Fundamentals',
  'Trending on Social',
]

function IdeaDashboard({ items }: IdeaDashboardProps) {
  const [activeTab, setActiveTab] = useState(tabs[0])

  return (
    <section className="card-shell p-4">
      <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h3 className="text-sm font-semibold">Ideas Dashboard</h3>
        <Tabs tabs={tabs} value={activeTab} onChange={setActiveTab} />
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <IdeaCard key={`${activeTab}-${item.ticker}`} row={item} />
        ))}
      </div>
    </section>
  )
}

export default IdeaDashboard
