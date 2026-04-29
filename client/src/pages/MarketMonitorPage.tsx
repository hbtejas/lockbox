import { useState } from 'react'
import { Lock } from 'lucide-react'

// Mock Data structure mirroring the exact UI required
const nicheIndices = [
  { name: 'TJI Logistics', weight: [18, 8], ltpVs52w: -0.8, d1: -0.5, w1: 0.2, m1: 12.8, m3: 10.1 },
  { name: 'TJI Private Bank', weight: [7, 3], ltpVs52w: 11, d1: -1.7, w1: 3.3, m1: -8.1, m3: -2.4 },
  { name: 'TJI Hospitals', weight: [14, 5], ltpVs52w: -12.6, d1: -0.1, w1: 4.6, m1: 6.3, m3: 2.1 },
  { name: 'TJI NBFC - Non Deposit Taking', weight: [15, 6], ltpVs52w: -1.7, d1: -0.6, w1: -0.2, m1: 11.4, m3: 8.1 },
  { name: 'TJI Transformers', weight: [7, 3], ltpVs52w: -17.3, d1: -0.7, w1: 4.8, m1: 26.4, m3: 50.5 },
  { name: 'TJI Plastic Pipes', weight: [7, 1], ltpVs52w: -13.7, d1: -0.7, w1: -1.7, m1: -1.7, m3: 8.7 },
  { name: 'TJI Power', weight: [6, 2], ltpVs52w: -1, d1: -0.7, w1: 2.1, m1: 10.8, m3: 25.6 },
  { name: 'TJI Aviation', weight: [2, 0], ltpVs52w: -27.9, d1: -0.7, w1: -2.2, m1: 6.2, m3: -4.7 },
  { name: 'TJI Agro Chemicals', weight: [11, 2], ltpVs52w: -15, d1: -0.8, w1: -2.9, m1: 5.4, m3: 2.1 },
  { name: 'TJI Hospitality', weight: [11, 1], ltpVs52w: -20.5, d1: -0.9, w1: -2.2, m1: 6.2, m3: 0.8 },
  { name: 'TJI Electrical Appliances', weight: [13, 2], ltpVs52w: -21.1, d1: -0.9, w1: -2.6, m1: 4.7, m3: 7.9 },
  { name: 'TJI Recycling', weight: [14, 8], ltpVs52w: -11.5, d1: -0.9, w1: -0.7, m1: 18.1, m3: 21.9 },
  { name: 'TJI Retail Chains', weight: [14, 2], ltpVs52w: 6.4, d1: 0.8, w1: -1.8, m1: 8.5, m3: 8.5 },
]

const chemicalMaterials = [
  { name: 'Isopropyl Alcohol', family: 'ALCOHOLS', ltpVs52w: -30.2, w1: -18.9, m1: 2.2 },
  { name: 'Octanol', family: 'ALCOHOLS', ltpVs52w: -12.6, w1: -8.1, m1: -5.7 },
  { name: 'Ethanol', family: 'ALCOHOLS', ltpVs52w: -10.9, w1: -5.7, m1: -3.5 },
  { name: 'Isobutanol', family: 'ALCOHOLS', ltpVs52w: -12, w1: -1.4, m1: 8.6 },
  { name: 'n-Butanol', family: 'ALCOHOLS', ltpVs52w: -8.8, w1: 0, m1: 3.6 },
  { name: 'C9 Solvent', family: 'AROMATICS', ltpVs52w: -8.3, w1: 2, m1: -5.8 },
  { name: 'm-Xylene', family: 'AROMATICS', ltpVs52w: -48, w1: -0.5, m1: -1.6 },
  { name: 'o-Xylene', family: 'AROMATICS', ltpVs52w: 0, w1: 5.5, m1: 14.3 },
  { name: 'Linear Alkyl Benzene', family: 'AROMATICS', ltpVs52w: 0, w1: 7.6, m1: 63.2 },
]

const spreadsData = [
  { name: 'ABS Resins - Acrylonitrile', ltpVs52w: -355.9, w1: 38.9, m1: -13.3 },
  { name: 'Benzene - Toluene', ltpVs52w: -223.1, w1: 34.1, m1: 32.8 },
  { name: 'Phthalic Anhydride - o-Xylene', ltpVs52w: -11.2, w1: -11, m1: 64.3 },
  { name: 'm-Xylene - Toluene', ltpVs52w: -104.4, w1: 31.6, m1: 55.5 },
]

const metalsData = [
  { name: 'Met Coke', ltpVs52w: 0, w1: 0, m1: 2.8 },
  { name: 'Ferro Chrome', ltpVs52w: -5.5, w1: 0, m1: -0.8 },
  { name: 'Silico Manganese', ltpVs52w: 0, w1: 0, m1: 1.2 },
  { name: 'Steel Flat', ltpVs52w: 0, w1: 0, m1: 1.9 },
]

function getHeatmapColor(value: number) {
  if (value >= 20) return 'bg-[#1e8f3f] text-white'
  if (value >= 10) return 'bg-[#43a15d] text-white'
  if (value >= 5) return 'bg-[#8acb9e] text-[#1e1e1e]'
  if (value > 0) return 'bg-[#c3e3cc] text-[#1e1e1e]'
  if (value <= -20) return 'bg-[#e23738] text-white'
  if (value <= -10) return 'bg-[#ea6262] text-white'
  if (value <= -5) return 'bg-[#f4a1a1] text-[#1e1e1e]'
  if (value < 0) return 'bg-[#fad5d5] text-[#1e1e1e]'
  return 'bg-white text-[#1e1e1e]'
}

function MarketMonitorPage() {
  const [activeMainTab, setActiveMainTab] = useState('Indices')
  const [activeSubTab, setActiveSubTab] = useState('Niche')
  const [activeRawTab, setActiveRawTab] = useState('Chemicals')

  return (
    <div className="bg-white min-h-screen">
      <div className="pt-6 px-6 pb-20">
        <h1 className="text-xl font-bold text-slate-800">Market Monitor</h1>
        <p className="mt-0.5 text-[10px] text-slate-500">
          Last updated at 24 Apr, 07:15 pm IST <span className="font-medium bg-slate-100 px-1 rounded">(Refreshed every 15 mins)</span>
        </p>

        <div className="mt-6 flex border-b border-slate-200">
          {['Indices', 'Raw Materials'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveMainTab(tab)}
              className={`px-4 py-2 text-xs font-bold transition-colors border-b-[3px] ${
                activeMainTab === tab ? 'border-yellow-400 text-slate-900' : 'border-transparent text-slate-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeMainTab === 'Indices' && (
          <>
            <div className="mt-4 flex gap-6 border-b border-dashed border-slate-200 pb-3">
              {['Headline', 'Niche', 'Conglomerates'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveSubTab(tab)}
                  className={`text-xs font-bold transition-colors ${
                    activeSubTab === tab ? 'text-slate-900 underline decoration-yellow-400 decoration-2 underline-offset-8' : 'text-slate-500'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {['Price', 'ROE', 'ROCE', 'PE', 'OPM', 'Net Debt', 'Capex', 'Market cap', 'Sales', 'Operating Profit', 'Net Profit'].map((pill) => (
                  <button
                    key={pill}
                    className={`rounded px-3 py-1 text-[11px] font-bold ${
                      pill === 'Price' ? 'bg-black text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {pill}
                  </button>
                ))}
              </div>
              <div className="flex rounded border border-slate-200 bg-slate-50 p-0.5">
                <button className="rounded bg-yellow-400 px-3 py-1 text-[10px] font-bold text-slate-900 shadow-sm">
                  Capital weighted
                </button>
                <button className="rounded px-3 py-1 text-[10px] font-bold text-slate-500 hover:text-slate-700">
                  Equal weight
                </button>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-[11px] font-medium text-slate-700 whitespace-nowrap border-collapse">
                <thead>
                  <tr className="uppercase text-slate-400 text-[9px] tracking-wider font-bold h-10 border-b border-slate-200">
                    <th className="pr-4 pl-2 text-left sticky left-0 bg-white z-10 w-[240px]">NICHE</th>
                    <th className="px-2 text-center w-[80px]">WEIGHT</th>
                    <th className="px-1 text-center w-[110px]">
                      <div className="flex flex-col items-center">
                        <span>LTP VS 52W</span>
                        <span>HIGH</span>
                      </div>
                    </th>
                    <th className="px-1 text-center w-[70px]">1D <span className="text-[8px] font-normal">&darr;</span></th>
                    <th className="px-1 text-center w-[70px]">1W</th>
                    <th className="px-1 text-center w-[70px]">1M</th>
                    <th className="px-1 text-center w-[70px]">3M</th>
                    <th className="px-1 text-center w-[50px]">6M</th>
                    <th className="px-1 text-center w-[50px]">1YR*</th>
                    <th className="px-1 text-center w-[50px]">2YR*</th>
                    <th className="px-1 text-center w-[50px]">3YR*</th>
                    <th className="px-1 text-center w-[50px]">5YR*</th>
                  </tr>
                </thead>
                <tbody>
                  {nicheIndices.map((row, idx) => (
                    <tr key={row.name} className={`h-[42px] border-b border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                      <td className="pr-4 pl-2 font-bold text-[#1e1e1e] sticky left-0 z-10 hover:text-blue-600 transition-colors cursor-pointer inline-flex items-center gap-1.5 h-full w-[240px]">
                        {row.name}
                        <span className="text-[10px] text-slate-400 font-normal">+</span>
                      </td>
                      <td className="px-2 text-center align-middle border-r border-dashed border-slate-200">
                        <div className="flex flex-col items-center gap-[2px]">
                          <div className="flex w-12 h-1 bg-slate-100 rounded-sm overflow-hidden">
                            <div className="bg-red-500 h-full" style={{ width: `${(row.weight[0] / (row.weight[0] + row.weight[1])) * 100}%` }} />
                          </div>
                          <div className="flex w-12 h-1 bg-slate-100 rounded-sm overflow-hidden">
                            <div className="bg-green-500 h-full" style={{ width: `${(row.weight[1] / (row.weight[0] + row.weight[1])) * 100}%` }} />
                          </div>
                          <div className="flex w-full justify-between px-1 text-[8px] text-slate-400">
                            <span>{row.weight[0]}</span>
                            <span>{row.weight[1]}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-0 border-r border-white align-middle">
                        <div className={`mx-0.5 h-[34px] flex items-center justify-center font-bold ${getHeatmapColor(row.ltpVs52w)}`}>
                          {row.ltpVs52w > 0 ? '+' : ''}{row.ltpVs52w}%
                        </div>
                      </td>
                      <td className="p-0 border-r border-white align-middle">
                        <div className={`mx-0.5 h-[34px] flex items-center justify-center font-bold ${getHeatmapColor(row.d1)}`}>
                          {row.d1 > 0 ? '+' : ''}{row.d1}%
                        </div>
                      </td>
                      <td className="p-0 border-r border-white align-middle">
                        <div className={`mx-0.5 h-[34px] flex items-center justify-center font-bold ${getHeatmapColor(row.w1)}`}>
                          {row.w1 > 0 ? '+' : ''}{row.w1}%
                        </div>
                      </td>
                      <td className="p-0 border-r border-white align-middle">
                        <div className={`mx-0.5 h-[34px] flex items-center justify-center font-bold ${getHeatmapColor(row.m1)}`}>
                          {row.m1 > 0 ? '+' : ''}{row.m1}%
                        </div>
                      </td>
                      <td className="p-0 border-r border-white align-middle border-e-2 border-e-slate-200">
                        <div className={`mx-0.5 h-[34px] flex items-center justify-center font-bold ${getHeatmapColor(row.m3)}`}>
                          {row.m3 > 0 ? '+' : ''}{row.m3}%
                        </div>
                      </td>
                      <td className="px-1 text-center align-middle">
                        <Lock className="w-3.5 h-3.5 mx-auto text-yellow-400 fill-yellow-400" />
                      </td>
                      <td className="px-1 text-center align-middle">
                        <Lock className="w-3.5 h-3.5 mx-auto text-yellow-400 fill-yellow-400" />
                      </td>
                      <td className="px-1 text-center align-middle">
                        <Lock className="w-3.5 h-3.5 mx-auto text-yellow-400 fill-yellow-400" />
                      </td>
                      <td className="px-1 text-center align-middle">
                        <Lock className="w-3.5 h-3.5 mx-auto text-yellow-400 fill-yellow-400" />
                      </td>
                      <td className="px-1 text-center align-middle">
                        <Lock className="w-3.5 h-3.5 mx-auto text-yellow-400 fill-yellow-400" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeMainTab === 'Raw Materials' && (
          <>
            <div className="mt-4 flex gap-6 border-b border-dashed border-slate-200 pb-3">
              {['Chemicals', 'Spreads', 'Metals'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveRawTab(tab)}
                  className={`text-xs font-bold transition-colors ${
                    activeRawTab === tab ? 'text-slate-900 underline decoration-yellow-400 decoration-2 underline-offset-8' : 'text-slate-500'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeRawTab === 'Chemicals' && (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-[11px] font-medium text-slate-700 whitespace-nowrap border-collapse">
                  <thead>
                    <tr className="uppercase text-slate-400 text-[9px] tracking-wider font-bold h-10 border-b border-slate-200">
                      <th className="pr-4 pl-2 text-left sticky left-0 bg-white z-10 w-[240px]">COMMODITY</th>
                      <th className="px-2 text-center w-[120px]">FAMILY &uarr;&darr;</th>
                      <th className="px-1 text-center w-[110px]">LTP VS 52W HIGH</th>
                      <th className="px-1 text-center w-[70px]">1W</th>
                      <th className="px-1 text-center w-[70px]">1M</th>
                      <th className="px-1 text-center w-[70px]">3M</th>
                      <th className="px-1 text-center w-[70px]">6M</th>
                      <th className="px-1 text-center w-[70px]">1YR</th>
                      <th className="px-1 text-center w-[120px]">MAKES</th>
                      <th className="px-1 text-center w-[120px]">USES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chemicalMaterials.map((row, idx) => (
                      <tr key={row.name} className={`h-[42px] border-b border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                        <td className="pr-4 pl-2 font-bold text-[#1e1e1e] sticky left-0 z-10 w-[240px] uppercase">{row.name}</td>
                        <td className="px-2 text-center uppercase text-[10px] bg-slate-50/50 border-r border-slate-200">{row.family}</td>
                        <td className="p-0 border-r border-white align-middle">
                          <div className={`mx-0.5 h-[34px] flex items-center justify-center font-bold ${getHeatmapColor(row.ltpVs52w)}`}>
                            {row.ltpVs52w > 0 ? '+' : ''}{row.ltpVs52w}%
                          </div>
                        </td>
                        <td className="p-0 border-r border-white align-middle">
                          <div className={`mx-0.5 h-[34px] flex items-center justify-center font-bold ${getHeatmapColor(row.w1)}`}>
                            {row.w1 > 0 ? '+' : ''}{row.w1}%
                          </div>
                        </td>
                        <td className="p-0 border-r border-white align-middle">
                          <div className={`mx-0.5 h-[34px] flex items-center justify-center font-bold ${getHeatmapColor(row.m1)}`}>
                            {row.m1 > 0 ? '+' : ''}{row.m1}%
                          </div>
                        </td>
                        {[1, 2, 3].map(i => (
                          <td key={i} className="px-1 text-center align-middle">
                             <Lock className="w-3 h-3 mx-auto text-yellow-400 opacity-40" />
                          </td>
                        ))}
                        <td className="px-2 text-center text-blue-500 hover:underline cursor-pointer text-[10px]">View Producers</td>
                        <td className="px-2 text-center text-[10px]">
                           <div className="flex items-center justify-center gap-1 text-slate-400">
                             <Lock className="w-3 h-3" />
                             <span>View Consumers</span>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeRawTab === 'Spreads' && (
              <div className="mt-8 overflow-x-auto">
                 <h2 className="text-sm font-bold mb-4">Spreads <span className="text-[10px] font-normal text-slate-500 ml-2">Last updated at 25 Apr, 09:30 am IST (Refreshed everyday)</span></h2>
                 <table className="w-full text-left text-[11px] font-medium text-slate-700 whitespace-nowrap border-collapse">
                   <thead>
                     <tr className="uppercase text-slate-400 text-[9px] tracking-wider font-bold h-10 border-b border-slate-200">
                       <th className="pr-4 pl-2 text-left w-[300px]">SPREADS</th>
                       <th className="px-1 text-center w-[110px]">LTP VS 52W HIGH</th>
                       <th className="px-1 text-center w-[70px]">1W</th>
                       <th className="px-1 text-center w-[70px]">1M</th>
                       <th className="px-1 text-center w-[70px]">3M</th>
                       <th className="px-1 text-center w-[70px]">6M</th>
                       <th className="px-1 text-center w-[70px]">1YR</th>
                     </tr>
                   </thead>
                   <tbody>
                     {spreadsData.map((row, idx) => (
                        <tr key={row.name} className={`h-[42px] border-b border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                           <td className="pr-4 pl-2 font-bold text-[#1e1e1e]">{row.name}</td>
                           <td className="p-0 border-r border-white align-middle">
                             <div className={`mx-0.5 h-[34px] flex items-center justify-center font-bold ${getHeatmapColor(row.ltpVs52w)}`}>
                               {row.ltpVs52w > 0 ? '+' : ''}{row.ltpVs52w}%
                             </div>
                           </td>
                           <td className="p-0 border-r border-white align-middle">
                             <div className={`mx-0.5 h-[34px] flex items-center justify-center font-bold ${getHeatmapColor(row.w1)}`}>
                               {row.w1 > 0 ? '+' : ''}{row.w1}%
                             </div>
                           </td>
                           <td className="p-0 border-r border-white align-middle">
                             <div className={`mx-0.5 h-[34px] flex items-center justify-center font-bold ${getHeatmapColor(row.m1)}`}>
                               {row.m1 > 0 ? '+' : ''}{row.m1}%
                             </div>
                           </td>
                           {[1, 2, 3].map(i => (
                             <td key={i} className="px-1 text-center align-middle">
                                <Lock className="w-3 h-3 mx-auto text-yellow-400 opacity-40" />
                             </td>
                           ))}
                        </tr>
                     ))}
                   </tbody>
                 </table>
              </div>
            )}

            {activeRawTab === 'Metals' && (
              <div className="mt-8 overflow-x-auto">
                 <h2 className="text-sm font-bold mb-4">Metals <span className="text-[10px] font-normal text-slate-500 ml-2">Last updated at 25 Apr, 09:30 am IST (Refreshed everyday)</span></h2>
                 <table className="w-full text-left text-[11px] font-medium text-slate-700 whitespace-nowrap border-collapse">
                   <thead>
                     <tr className="uppercase text-slate-400 text-[9px] tracking-wider font-bold h-10 border-b border-slate-200">
                       <th className="pr-4 pl-2 text-left w-[300px]">METALS</th>
                       <th className="px-1 text-center w-[110px]">LTP VS 52W HIGH</th>
                       <th className="px-1 text-center w-[70px]">1W</th>
                       <th className="px-1 text-center w-[70px]">1M</th>
                       <th className="px-1 text-center w-[70px]">3M</th>
                       <th className="px-1 text-center w-[70px]">6M</th>
                       <th className="px-1 text-center w-[70px]">1YR</th>
                       <th className="px-1 text-center w-[120px]">MAKES</th>
                       <th className="px-1 text-center w-[120px]">USES</th>
                     </tr>
                   </thead>
                   <tbody>
                     {metalsData.map((row, idx) => (
                        <tr key={row.name} className={`h-[42px] border-b border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                           <td className="pr-4 pl-2 font-bold text-[#1e1e1e]">{row.name}</td>
                           <td className="px-1 text-center"> - </td>
                           <td className="px-1 text-center"> 0% </td>
                           <td className="p-0 border-r border-white align-middle">
                             <div className={`mx-0.5 h-[34px] flex items-center justify-center font-bold ${getHeatmapColor(row.m1)}`}>
                               {row.m1 > 0 ? '+' : ''}{row.m1}%
                             </div>
                           </td>
                           {[1, 2, 3].map(i => (
                             <td key={i} className="px-1 text-center align-middle">
                                <span className={i === 1 ? "font-bold text-slate-700" : ""}>{i === 1 ? "0%" : <Lock className="w-3 h-3 mx-auto text-yellow-400 opacity-40" />}</span>
                             </td>
                           ))}
                           <td className="px-2 text-center text-blue-500 hover:underline cursor-pointer text-[10px]">View Producers</td>
                           <td className="px-2 text-center text-[10px]">
                              <div className="flex items-center justify-center gap-1 text-slate-400">
                                <Lock className="w-3 h-3" />
                                <span>View Consumers</span>
                              </div>
                           </td>
                        </tr>
                     ))}
                   </tbody>
                 </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default MarketMonitorPage
